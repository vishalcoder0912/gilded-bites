-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'STRIPE';

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PAID';
ALTER TYPE "PaymentStatus" ADD VALUE 'FAILED';
ALTER TYPE "PaymentStatus" ADD VALUE 'CANCELLED';

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "provider" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripePaymentStatus" TEXT,
    "upiReferenceNumber" TEXT,
    "proofImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpiPaymentSession" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "upiSettingId" TEXT NOT NULL,
    "upiIdSnapshot" TEXT NOT NULL,
    "payeeName" TEXT NOT NULL DEFAULT 'Noir Sane',
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "transactionRef" TEXT NOT NULL,
    "upiUri" TEXT NOT NULL,
    "qrDataUrl" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "utr" TEXT,
    "proofImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UpiPaymentSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UpiPaymentSession_transactionRef_key" ON "UpiPaymentSession"("transactionRef");

-- CreateIndex
CREATE INDEX "UpiPaymentSession_orderId_idx" ON "UpiPaymentSession"("orderId");

-- CreateIndex
CREATE INDEX "UpiPaymentSession_transactionRef_idx" ON "UpiPaymentSession"("transactionRef");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpiPaymentSession" ADD CONSTRAINT "UpiPaymentSession_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
