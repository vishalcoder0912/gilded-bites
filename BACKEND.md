# Noir Sane — Backend Specification

> Complete backend blueprint to make the Noir Sane chocolate e-commerce frontend
> fully production-ready. Once every section below is implemented, the React app
> will work end-to-end: browsing, cart, UPI checkout with screenshot upload,
> admin verification, and order fulfilment — no mock data left.

---

## 1. Recommended Stack

| Layer            | Choice                                             | Why                                                                 |
| ---------------- | -------------------------------------------------- | ------------------------------------------------------------------- |
| Database         | **Supabase Postgres** (via Lovable Cloud)          | Managed, RLS, type-safe client                                      |
| Auth             | **Supabase Auth** (email + password, Google OAuth) | Built-in session handling, JWT, OAuth out of the box                |
| File Storage     | **Supabase Storage** (`payment-proofs` bucket)     | Direct browser uploads, signed URLs                                 |
| Server logic     | **Supabase Edge Functions** (Deno)                 | Order creation, UTR validation, admin actions, transactional emails |
| Email (optional) | **Resend** via edge function                       | Order confirmation + status updates                                 |
| Realtime         | **Supabase Realtime** on `orders` table            | Admin dashboard auto-updates as new orders arrive                   |

> Enable Lovable Cloud first — it provisions Supabase automatically, no external
> account needed.

---

## 2. Database Schema

All tables live in the `public` schema. All timestamps are `timestamptz`.
All monetary values are stored in **paise** (integer) to avoid float issues —
the frontend already displays INR via `formatINR()`.

### 2.1 `profiles`

Mirrors `auth.users`, holds display info. Auto-created via trigger.

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 2.2 `user_roles` (CRITICAL — never store roles on profiles)

```sql
create type public.app_role as enum ('admin', 'customer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
```

### 2.3 `products`

Replaces the static `src/services/products.ts` array.

```sql
create type public.product_category as enum
  ('Truffles', 'Bars', 'Pralines', 'Bonbons', 'Single Origin');

create table public.products (
  id text primary key,                    -- e.g. 'noir-truffle' (slug)
  name text not null,
  tagline text not null,
  description text not null,
  price_paise integer not null check (price_paise > 0),
  category product_category not null,
  image_url text not null,
  cocoa_percent smallint not null check (cocoa_percent between 0 and 100),
  weight_label text not null,             -- e.g. '120g · 6 pieces'
  featured boolean not null default false,
  in_stock boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 2.4 `orders`

```sql
create type public.order_status as enum ('pending', 'approved', 'rejected', 'shipped', 'delivered');

create table public.orders (
  id text primary key,                    -- e.g. 'CN-LX01-PG7K' (frontend pattern)
  user_id uuid references auth.users(id) on delete set null,  -- nullable: guest checkout allowed
  customer_name text not null,
  email text not null,
  phone text,
  shipping_address jsonb not null,        -- { line1, line2, city, state, postal_code, country }
  subtotal_paise integer not null,
  shipping_paise integer not null,        -- 0 if subtotal > 250000 (₹2500), else 15000 (₹150)
  amount_paise integer not null,          -- subtotal + shipping
  utr text,                               -- 12-digit UPI reference, set when customer submits
  proof_url text,                         -- Supabase Storage public/signed URL
  status order_status not null default 'pending',
  status_note text,                       -- admin reason for rejection
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);

create index orders_status_created_idx on public.orders (status, created_at desc);
create index orders_user_idx on public.orders (user_id);
```

### 2.5 `order_items`

```sql
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id),
  product_name text not null,             -- snapshot at purchase time
  unit_price_paise integer not null,      -- snapshot
  quantity integer not null check (quantity > 0),
  line_total_paise integer not null
);

create index order_items_order_idx on public.order_items (order_id);
```

### 2.6 `order_status_history` (optional, recommended)

```sql
create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  status order_status not null,
  note text,
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
```

---

## 3. Security Definer Helpers

```sql
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin');
$$;
```

---

## 4. Triggers

### 4.1 Auto-create profile on signup

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));

  -- default role: customer
  insert into public.user_roles (user_id, role)
  values (new.id, 'customer');

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
```

### 4.2 Touch `updated_at`

```sql
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger products_touch before update on public.products
for each row execute function public.touch_updated_at();

create trigger orders_touch before update on public.orders
for each row execute function public.touch_updated_at();
```

### 4.3 Log status changes

```sql
create or replace function public.log_order_status()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') or (new.status is distinct from old.status) then
    insert into public.order_status_history (order_id, status, note, changed_by)
    values (new.id, new.status, new.status_note, auth.uid());
  end if;
  return new;
end;
$$;

create trigger orders_log_status
after insert or update on public.orders
for each row execute function public.log_order_status();
```

---

## 5. Row-Level Security

Enable RLS on every table:

```sql
alter table public.profiles            enable row level security;
alter table public.user_roles          enable row level security;
alter table public.products            enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.order_status_history enable row level security;
```

### 5.1 `profiles`

```sql
create policy "users read own profile"
on public.profiles for select to authenticated
using (auth.uid() = id);

create policy "users update own profile"
on public.profiles for update to authenticated
using (auth.uid() = id);

create policy "admins read all profiles"
on public.profiles for select to authenticated
using (public.is_admin());
```

### 5.2 `user_roles`

```sql
create policy "users read own roles"
on public.user_roles for select to authenticated
using (user_id = auth.uid());

create policy "admins manage roles"
on public.user_roles for all to authenticated
using (public.is_admin()) with check (public.is_admin());
```

### 5.3 `products`

```sql
-- public catalog
create policy "anyone reads in-stock products"
on public.products for select to anon, authenticated
using (true);

create policy "admins manage products"
on public.products for all to authenticated
using (public.is_admin()) with check (public.is_admin());
```

### 5.4 `orders` & `order_items`

```sql
-- customers see their own orders
create policy "users read own orders"
on public.orders for select to authenticated
using (user_id = auth.uid());

create policy "users insert own orders"
on public.orders for insert to authenticated
with check (user_id = auth.uid());

-- guest orders: insert allowed via edge function (service role)
-- never grant anon select on orders

-- customers can update only UTR/proof on their own pending order
create policy "users submit payment proof"
on public.orders for update to authenticated
using (user_id = auth.uid() and status = 'pending')
with check (user_id = auth.uid() and status = 'pending');

-- admins do everything
create policy "admins read all orders"
on public.orders for select to authenticated
using (public.is_admin());

create policy "admins update orders"
on public.orders for update to authenticated
using (public.is_admin()) with check (public.is_admin());

-- order_items mirrors orders
create policy "users read own order items"
on public.order_items for select to authenticated
using (exists (
  select 1 from public.orders o
  where o.id = order_items.order_id and (o.user_id = auth.uid() or public.is_admin())
));

create policy "admins manage order items"
on public.order_items for all to authenticated
using (public.is_admin()) with check (public.is_admin());
```

### 5.5 `order_status_history`

```sql
create policy "view order history"
on public.order_status_history for select to authenticated
using (
  public.is_admin() or exists (
    select 1 from public.orders o
    where o.id = order_status_history.order_id and o.user_id = auth.uid()
  )
);
```

---

## 6. Storage

### 6.1 `payment-proofs` bucket

```sql
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false);
```

Policies:

```sql
-- customers upload proof for their own order
create policy "users upload own proofs"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'payment-proofs'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users read own proofs"
on storage.objects for select to authenticated
using (
  bucket_id = 'payment-proofs'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "admins read all proofs"
on storage.objects for select to authenticated
using (bucket_id = 'payment-proofs' and public.is_admin());
```

File path convention: `{user_id}/{order_id}/{timestamp}-{filename}`
Allowed MIME: `image/png`, `image/jpeg`, `image/webp`. Max 5 MB (enforced in
edge function or client).

### 6.2 `product-images` bucket (public)

Same idea but `public = true`, only admins can write.

---

## 7. Edge Functions

Located in `supabase/functions/<name>/index.ts`. All must include CORS headers.

### 7.1 `create-order` — POST

Creates an order atomically with its items. Used at checkout.

**Request body**
```json
{
  "customer_name": "Aanya Mehta",
  "email": "aanya@example.com",
  "phone": "+91...",
  "shipping_address": { "line1": "...", "city": "...", "state": "...", "postal_code": "...", "country": "IN" },
  "items": [{ "product_id": "noir-truffle", "quantity": 2 }]
}
```

**Logic**
1. Validate body with Zod (reject extra fields, enforce phone/postal patterns).
2. Pull authoritative prices from `products` table (never trust client prices).
3. Compute `subtotal_paise`, `shipping_paise` (0 if subtotal ≥ 250000 else 15000), `amount_paise`.
4. Generate order id matching frontend pattern: `CN-` + base36 timestamp + `-` + 4 random chars.
5. Insert into `orders` (status=`pending`, user_id from JWT or null for guest) + `order_items` in one transaction (use `rpc` or two awaited inserts inside try/catch with rollback via deletion on failure).
6. Return `{ order_id, amount_paise, upi_uri }` where `upi_uri` is built server-side from secrets.

**Response**
```json
{ "order_id": "CN-LXAB12-PG7K", "amount_paise": 258000, "upi_uri": "upi://pay?pa=...&pn=Noir+Sane&am=2580&tn=CN-..." }
```

### 7.2 `submit-payment-proof` — POST (auth required for logged-in, signed token for guest)

**Request**
```json
{ "order_id": "CN-...", "utr": "412980134567", "proof_path": "uid/order/file.jpg" }
```

**Logic**
1. Validate UTR: 12-digit numeric.
2. Verify the storage object exists and belongs to the user.
3. Update `orders.utr` and `orders.proof_url` (signed URL valid 30 days for admins).
4. Trigger `send-order-email` (fire-and-forget) for customer confirmation.

### 7.3 `admin-decision` — POST (admin only)

```json
{ "order_id": "CN-...", "action": "approve" | "reject", "note": "Optional rejection reason" }
```

1. Verify caller has `admin` role via `has_role(auth.uid(), 'admin')`.
2. Update `orders.status`, `status_note`, `approved_at`, `approved_by`.
3. Trigger status email to customer.

### 7.4 `send-order-email` — internal

Uses Resend (`RESEND_API_KEY` secret) to send templated emails:
- Order received (UPI instructions)
- Payment received, awaiting verification
- Approved (with shipping ETA)
- Rejected (with reason)

---

## 8. Required Secrets

Add via Lovable Cloud secrets manager:

| Secret              | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| `UPI_VPA`           | Merchant VPA, e.g. `noirsane@hdfcbank`           |
| `UPI_PAYEE_NAME`    | Display name in UPI app, e.g. `Noir Sane`        |
| `RESEND_API_KEY`    | Transactional email                              |
| `ADMIN_BOOTSTRAP_EMAIL` | First admin to seed via SQL (optional helper) |

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are injected
automatically into edge functions by Lovable Cloud.

---

## 9. Frontend Wiring Checklist

After backend is live, replace mock layers in this order:

| Frontend file                          | Replace with                                                              |
| -------------------------------------- | ------------------------------------------------------------------------- |
| `src/services/products.ts`             | `supabase.from('products').select('*').order('sort_order')` + React Query |
| `src/store/cart.ts`                    | Keep (client-side cart is fine, persist via localStorage as today)        |
| `src/store/order.ts`                   | Replace `generateOrderId` + state with edge-function call                 |
| `src/pages/Checkout.tsx`               | Call `create-order`, then `submit-payment-proof` after upload             |
| `src/pages/OrderConfirmation.tsx`      | Fetch order by id, show real status                                       |
| `src/store/adminAuth.ts`               | Delete — use `supabase.auth.signInWithPassword`                           |
| `src/store/adminOrders.ts`             | Replace seed with `supabase.from('orders').select(*, order_items(*))`     |
| `src/components/admin/RequireAdmin.tsx`| Check `has_role(uid, 'admin')` via RPC, not local zustand                 |
| `src/pages/admin/AdminLogin.tsx`       | Use Supabase Auth, redirect on `onAuthStateChange`                        |
| `src/pages/admin/AdminOrders.tsx`      | Subscribe to Realtime channel for live updates                            |

### Auth client setup (already provided when Lovable Cloud is enabled)

```typescript
// src/integrations/supabase/client.ts is auto-generated
import { supabase } from "@/integrations/supabase/client";

// Always set up listener BEFORE getSession
supabase.auth.onAuthStateChange((event, session) => { /* update store */ });
const { data: { session } } = await supabase.auth.getSession();
```

---

## 10. Seed Data

After tables exist, seed the 6 products from `src/services/products.ts` with a
one-off SQL migration. Image URLs should point to objects in the
`product-images` bucket (upload the existing `src/assets/product-*.jpg` files).

```sql
insert into public.products (id, name, tagline, description, price_paise, category, image_url, cocoa_percent, weight_label, featured, sort_order)
values
  ('noir-truffle',      'Noir Gold Truffle',       '24-karat indulgence',          '...', 129000, 'Truffles',      '...', 72, '120g · 6 pieces',  true,  1),
  ('hazelnut-bar',      'Piedmont Hazelnut Bar',   'Roasted, crushed, layered',    '...',  69000, 'Bars',          '...', 68, '100g bar',         true,  2),
  ('maison-praline',    'Maison Praline Coffret',  'The signature collection',     '...', 245000, 'Pralines',      '...', 65, '240g · 12 pieces', true,  3),
  ('rose-bonbon',       'Rose Raspberry Bonbon',   'White chocolate, ruby heart',  '...', 149000, 'Bonbons',       '...', 32, '150g · 8 pieces',  false, 4),
  ('salted-caramel',    'Fleur de Sel Caramel',    'Sweet meets storm',            '...',  89000, 'Bars',          '...', 45, '120g · 9 squares', false, 5),
  ('madagascar-origin', 'Madagascar 78%',          'Single origin, single estate', '...',  99000, 'Single Origin', '...', 78, '85g bar',          false, 6);
```

### Bootstrap first admin

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = '<your-admin-email>'
on conflict do nothing;
```

---

## 11. End-to-End Flow After Implementation

1. **Browse** — `Shop.tsx` fetches `products` (RLS: `anon read`).
2. **Add to cart** — purely client (Zustand + localStorage).
3. **Checkout** — `Checkout.tsx` calls `create-order` edge function → receives `order_id` + `upi_uri` → renders QR (use `qrcode` npm lib over `upi_uri`).
4. **Pay** — customer pays in their UPI app, copies UTR.
5. **Submit proof** — uploads screenshot to Storage at `{uid}/{order_id}/...`, then calls `submit-payment-proof`.
6. **Confirmation page** — shows order with `status: pending`, polls or subscribes to Realtime for status changes.
7. **Admin login** — Supabase Auth → `RequireAdmin` checks `is_admin()` RPC.
8. **Admin dashboard** — Realtime subscription on `orders` table, badge count updates live.
9. **Admin orders page** — opens proof via signed URL, clicks Approve/Reject → calls `admin-decision`.
10. **Email** — customer receives status email; can re-open the confirmation page anytime to see updated status.

---

## 12. Implementation Order (recommended)

1. Enable Lovable Cloud
2. Run migrations §2 → §5 (schema, helpers, triggers, RLS)
3. Create storage buckets §6
4. Seed products §10 + upload images
5. Wire `Shop.tsx` and `ProductDetail.tsx` to live data
6. Build `create-order` edge function §7.1
7. Wire `Checkout.tsx` to it; add `qrcode` dependency
8. Build `submit-payment-proof` §7.2 + storage upload from `Checkout.tsx`
9. Wire `OrderConfirmation.tsx` to fetch real order
10. Replace admin auth §9 with Supabase Auth
11. Wire `AdminOrders.tsx` to live data + Realtime
12. Build `admin-decision` §7.3 + Approve/Reject buttons
13. Add `send-order-email` §7.4 (last; non-blocking)

When all 13 steps are green, the Noir Sane storefront is fully functional —
customers can buy, pay via UPI, and admins can verify and ship.
