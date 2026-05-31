-- Add a terminal state for timed-out UPI QR sessions.
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';

-- Backfill existing rows, then require all future UPI sessions to set an expiry explicitly.
ALTER TABLE "UpiPaymentSession"
  ADD COLUMN "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 minute');

ALTER TABLE "UpiPaymentSession"
  ALTER COLUMN "expiresAt" DROP DEFAULT;

CREATE INDEX "UpiPaymentSession_expiresAt_idx" ON "UpiPaymentSession"("expiresAt");
