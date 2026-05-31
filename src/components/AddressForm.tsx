import { useState } from "react";
import { MapPin, Phone, User, Loader2 } from "lucide-react";
import { ApiError, addressApi } from "@/lib/api";

interface Props {
  onAddressCreated?: (id: string) => void;
}

const AddressForm = ({ onAddressCreated }: Props) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: true,
  });

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const address = await addressApi.createAddress({
        fullName: form.fullName,
        phone: form.phone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2 || undefined,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        isDefault: form.isDefault,
      });
      if (onAddressCreated) {
        onAddressCreated(address.id);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to save address. Please check your input and try again.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium uppercase tracking-[0.25em] text-[#d4c4b0] mb-2">
          Full name *
        </label>
        <div className="relative">
          <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#a89585]" />
          <input
            id="fullName"
            value={form.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            placeholder="Full name"
            required
            className="w-full bg-[#1b100a] border border-[#d9a35b]/30 px-4 py-3 rounded-sm focus:border-[#d9a35b]/60 focus:ring-1 focus:ring-[#d9a35b]/30 outline-none transition-colors text-sm pl-10 text-[#f8eadc] placeholder:text-[#8a7565]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium uppercase tracking-[0.25em] text-[#d4c4b0] mb-2">
          Phone *
        </label>
        <div className="relative">
          <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#a89585]" />
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="+91 9876543210"
            required
            className="w-full bg-[#1b100a] border border-[#d9a35b]/30 px-4 py-3 rounded-sm focus:border-[#d9a35b]/60 focus:ring-1 focus:ring-[#d9a35b]/30 outline-none transition-colors text-sm pl-10 text-[#f8eadc] placeholder:text-[#8a7565]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="addressLine1" className="block text-sm font-medium uppercase tracking-[0.25em] text-[#d4c4b0] mb-2">
          Address line 1 *
        </label>
        <div className="relative">
          <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#a89585]" />
          <input
            id="addressLine1"
            value={form.addressLine1}
            onChange={(e) => updateField("addressLine1", e.target.value)}
            placeholder="Apartment, street, area"
            required
            className="w-full bg-[#1b100a] border border-[#d9a35b]/30 px-4 py-3 rounded-sm focus:border-[#d9a35b]/60 focus:ring-1 focus:ring-[#d9a35b]/30 outline-none transition-colors text-sm pl-10 text-[#f8eadc] placeholder:text-[#8a7565]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="addressLine2" className="block text-sm font-medium uppercase tracking-[0.25em] text-[#d4c4b0] mb-2">
          Address line 2
        </label>
        <input
          id="addressLine2"
          value={form.addressLine2}
          onChange={(e) => updateField("addressLine2", e.target.value)}
          placeholder="Landmark or floor"
          className="w-full bg-[#1b100a] border border-[#d9a35b]/30 px-4 py-3 rounded-sm focus:border-[#d9a35b]/60 focus:ring-1 focus:ring-[#d9a35b]/30 outline-none transition-colors text-sm text-[#f8eadc] placeholder:text-[#8a7565]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="block text-sm font-medium uppercase tracking-[0.25em] text-[#d4c4b0] mb-2">
            City *
          </label>
          <input
            id="city"
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
            placeholder="City"
            required
            className="w-full bg-[#1b100a] border border-[#d9a35b]/30 px-4 py-3 rounded-sm focus:border-[#d9a35b]/60 focus:ring-1 focus:ring-[#d9a35b]/30 outline-none transition-colors text-sm text-[#f8eadc] placeholder:text-[#8a7565]"
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium uppercase tracking-[0.25em] text-[#d4c4b0] mb-2">
            State *
          </label>
          <input
            id="state"
            value={form.state}
            onChange={(e) => updateField("state", e.target.value)}
            placeholder="State"
            required
            className="w-full bg-[#1b100a] border border-[#d9a35b]/30 px-4 py-3 rounded-sm focus:border-[#d9a35b]/60 focus:ring-1 focus:ring-[#d9a35b]/30 outline-none transition-colors text-sm text-[#f8eadc] placeholder:text-[#8a7565]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="pincode" className="block text-sm font-medium uppercase tracking-[0.25em] text-[#d4c4b0] mb-2">
          Postal code *
        </label>
        <input
          id="pincode"
          value={form.pincode}
          onChange={(e) => updateField("pincode", e.target.value)}
          placeholder="400001"
          required
          pattern="^\d{6}$"
          className="w-full bg-[#1b100a] border border-[#d9a35b]/30 px-4 py-3 rounded-sm focus:border-[#d9a35b]/60 focus:ring-1 focus:ring-[#d9a35b]/30 outline-none transition-colors text-sm text-[#f8eadc] placeholder:text-[#8a7565]"
        />
      </div>

      {submitError && (
        <p className="text-sm text-red-300">{submitError}</p>
      )}

      <button type="submit" disabled={submitting} className="btn-gold w-full disabled:opacity-60 transition-all hover:shadow-[0_0_20px_rgba(217,163,91,0.3)]">
        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Address"}
      </button>
    </form>
  );
};

export default AddressForm;
