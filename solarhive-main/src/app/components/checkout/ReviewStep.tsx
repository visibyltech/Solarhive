"use client";

import { useState } from "react";
import { CreditCard, UploadCloud, Zap, ShieldCheck, Loader2, Truck } from "lucide-react";
import { PaymentMethod } from "./PaymentMethodStep";
import { CartItem } from "../../context/CartContext";
import { DeliveryDetails } from "./DeliveryForm";

type ReviewStepProps = {
  paymentMethod: PaymentMethod;
  items: CartItem[];
  delivery: DeliveryDetails;
  deliveryFee: number;
  subtotal: number;
  total: number;
  onBack: () => void;
  onPlaceOrder: (orderNumber: string) => void;
};

const BANK_ACCOUNTS = [
  { bank: "FCMB", accountName: "Adomo Paradise Karo", accountNumber: "6318310012" },
];

const INSTALLMENT_PLANS = [
  { weeks: 2, interestRate: 3 },
  { weeks: 4, interestRate: 6 },
  { weeks: 6, interestRate: 9 },
  { weeks: 8, interestRate: 12 },
];

const DEPOSIT_RATE = 0.3;

const ReviewStep = ({
  paymentMethod,
  items,
  delivery,
  deliveryFee,
  subtotal,
  total,
  onBack,
  onPlaceOrder,
}: ReviewStepProps) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [installmentWeeks, setInstallmentWeeks] = useState(4);
  const [klumpStatus, setKlumpStatus] = useState<
    "idle" | "verifying" | "failed" | "not-configured"
  >("idle");
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  const selectedPlan =
    INSTALLMENT_PLANS.find((plan) => plan.weeks === installmentWeeks) ?? INSTALLMENT_PLANS[1];
  const installmentInterest = Math.round(total * (selectedPlan.interestRate / 100));
  const installmentTotalPayable = total + installmentInterest;
  const installmentDeposit = Math.round(installmentTotalPayable * DEPOSIT_RATE);
  const installmentRemaining = installmentTotalPayable - installmentDeposit;
  const installmentWeeklyPayment = Math.round(installmentRemaining / selectedPlan.weeks);

  const requiresReceipt = paymentMethod === "bank-transfer" || paymentMethod === "installments";
  const canPlaceOrder =
    acceptedTerms && acceptedPrivacy && (!requiresReceipt || receiptFile !== null);

  const orderTotal = paymentMethod === "installments" ? installmentTotalPayable : total;

  const submitOrder = async (): Promise<{ orderNumber: string } | { error: string }> => {
    const formData = new FormData();
    formData.set("paymentMethod", paymentMethod);
    formData.set("fullName", delivery.fullName);
    formData.set("email", delivery.email);
    formData.set("phone", delivery.phone);
    formData.set("address", delivery.address);
    formData.set("city", delivery.city);
    formData.set("subtotal", String(subtotal));
    formData.set("deliveryFee", String(deliveryFee));
    formData.set("total", String(orderTotal));
    formData.set(
      "items",
      JSON.stringify(
        items.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          qty: item.qty,
        }))
      )
    );

    if (paymentMethod === "installments") {
      formData.set("installmentWeeks", String(selectedPlan.weeks));
      formData.set("installmentInterestRate", String(selectedPlan.interestRate));
      formData.set("installmentDeposit", String(installmentDeposit));
    }

    if (receiptFile) {
      formData.set("receipt", receiptFile);
    }

    try {
      const res = await fetch("/api/orders", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error ?? "Failed to place order" };
      }
      return { orderNumber: data.order.orderNumber };
    } catch {
      return { error: "Failed to place order. Check your connection and try again." };
    }
  };

  const handleKlumpCheckout = () => {
    const publicKey = process.env.NEXT_PUBLIC_KLUMP_PUBLIC_KEY;
    if (!publicKey) {
      setKlumpStatus("not-configured");
      return;
    }

    if (typeof Klump === "undefined") {
      setKlumpStatus("failed");
      return;
    }

    const reference = `SH-${Date.now()}`;
    const [firstName, ...rest] = delivery.fullName.trim().split(" ");
    const lastName = rest.join(" ") || firstName;
    const origin = window.location.origin;

    new Klump({
      publicKey,
      data: {
        amount: subtotal + deliveryFee,
        shipping_fee: deliveryFee,
        currency: "NGN",
        first_name: firstName,
        last_name: lastName,
        email: delivery.email,
        phone: delivery.phone,
        merchant_reference: reference,
        items: items.map((item) => ({
          name: item.name,
          unit_price: item.price,
          quantity: item.qty,
          image_url: `${origin}${item.image}`,
        })),
      },
      onSuccess: async (data) => {
        setKlumpStatus("verifying");
        try {
          const res = await fetch(
            `/api/klump/verify?reference=${data.reference ?? reference}`
          );
          const result = await res.json();
          if (result?.data?.status === "successful") {
            const outcome = await submitOrder();
            if ("error" in outcome) {
              setOrderError(outcome.error);
              setKlumpStatus("failed");
            } else {
              onPlaceOrder(outcome.orderNumber);
            }
          } else {
            setKlumpStatus("failed");
          }
        } catch {
          setKlumpStatus("failed");
        }
      },
      onError: () => setKlumpStatus("failed"),
      onLoad: () => {},
      onOpen: () => {},
      onClose: () => {},
    });
  };

  const handlePlaceOrder = async () => {
    setOrderError("");

    if (paymentMethod === "klump") {
      handleKlumpCheckout();
      return;
    }

    setSubmitting(true);
    const outcome = await submitOrder();
    setSubmitting(false);

    if ("error" in outcome) {
      setOrderError(outcome.error);
    } else {
      onPlaceOrder(outcome.orderNumber);
    }
  };

  return (
    <div className="flex-1 rounded-2xl bg-black/5 p-6">
      <h2 className="text-lg font-semibold">Review & Pay</h2>

      {paymentMethod === "bank-transfer" && (
        <div className="mt-6 rounded-xl border border-gold/40 bg-gold/5 p-5">
          <div className="flex items-center gap-2 text-gold">
            <CreditCard className="h-4 w-4" />
            <h3 className="text-sm font-semibold">Bank Account Details</h3>
          </div>
          <p className="mt-2 text-sm text-black/70">
            Please transfer the exact amount of{" "}
            <span className="font-semibold text-black">₦{total.toLocaleString()}</span> to the
            account below. Your order will not ship until we receive payment.
          </p>

          <div className="mt-4 space-y-2 rounded-lg bg-black/5 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-black/50">Account Name</span>
              <span className="font-semibold">{BANK_ACCOUNTS[0].accountName}</span>
            </div>
            {BANK_ACCOUNTS.map((account) => (
              <div key={account.accountNumber} className="flex justify-between">
                <span className="text-black/50">{account.bank}</span>
                <span className="font-semibold">{account.accountNumber}</span>
              </div>
            ))}
          </div>

          <label className="mt-4 block text-xs font-semibold tracking-wide text-black/60 uppercase">
            Upload Payment Receipt *
          </label>
          <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-black/20 py-8 text-sm text-black/50 transition hover:border-gold hover:text-gold">
            <UploadCloud className="h-5 w-5" />
            {receiptFile?.name ?? "Click to upload screenshot"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      )}

      {paymentMethod === "installments" && (
        <div className="mt-6 rounded-xl border border-gold/40 bg-gold/5 p-5">
          <div className="flex items-center gap-2 text-gold">
            <Truck className="h-4 w-4" />
            <h3 className="text-sm font-semibold">Save to Buy Plan Details</h3>
          </div>
          <p className="mt-2 text-sm text-black/70">
            Choose a savings plan that works for you. A {DEPOSIT_RATE * 100}% upfront deposit is
            required before installation.
          </p>

          <label className="mt-4 block text-xs font-semibold tracking-wide text-black/60 uppercase">
            Select Duration
          </label>
          <select
            value={installmentWeeks}
            onChange={(e) => setInstallmentWeeks(Number(e.target.value))}
            className="mt-2 w-full rounded-md border border-black/10 bg-black/5 px-4 py-3 text-sm focus:border-gold focus:outline-none"
          >
            {INSTALLMENT_PLANS.map((plan) => (
              <option key={plan.weeks} value={plan.weeks} className="bg-white">
                {plan.weeks} Weeks ({plan.interestRate}% Interest)
              </option>
            ))}
          </select>

          <div className="mt-4 space-y-2 rounded-lg bg-black/5 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-black/50">Subtotal (inc. Delivery)</span>
              <span className="font-semibold">₦{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/50">Interest ({selectedPlan.interestRate}%)</span>
              <span className="font-semibold">+₦{installmentInterest.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-2">
              <span className="font-semibold text-black/70">Total Payable</span>
              <span className="font-semibold text-gold">
                ₦{installmentTotalPayable.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Upfront Deposit ({DEPOSIT_RATE * 100}%)</span>
              <span className="font-semibold text-green-600">
                ₦{installmentDeposit.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/50">Remaining ({selectedPlan.weeks} payments)</span>
              <span className="font-semibold">
                ₦{installmentWeeklyPayment.toLocaleString()} / week
              </span>
            </div>
          </div>

          <label className="mt-4 block text-xs font-semibold tracking-wide text-black/60 uppercase">
            Upload Initial Deposit Receipt *
          </label>
          <p className="mt-1 text-sm text-black/70">
            Please transfer your deposit of{" "}
            <span className="font-semibold text-black">
              ₦{installmentDeposit.toLocaleString()}
            </span>{" "}
            to the account below.
          </p>

          <div className="mt-3 space-y-2 rounded-lg bg-black/5 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-black/50">Account Name</span>
              <span className="font-semibold">{BANK_ACCOUNTS[0].accountName}</span>
            </div>
            {BANK_ACCOUNTS.map((account) => (
              <div key={account.accountNumber} className="flex justify-between">
                <span className="text-black/50">{account.bank}</span>
                <span className="font-semibold">{account.accountNumber}</span>
              </div>
            ))}
          </div>

          <label className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-black/20 py-8 text-sm text-black/50 transition hover:border-gold hover:text-gold">
            <UploadCloud className="h-5 w-5" />
            {receiptFile?.name ?? "Click to upload screenshot"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      )}

      {paymentMethod === "klump" && (
        <div className="mt-6 rounded-xl border border-gold/40 bg-gold/5 p-5 text-sm text-black/70">
          <div className="flex items-center gap-2 text-gold">
            <ShieldCheck className="h-4 w-4" />
            <h3 className="text-sm font-semibold">Buy Now, Pay Later</h3>
          </div>
          <p className="mt-2">
            Clicking &ldquo;Place Order&rdquo; opens the secure Klump checkout widget for{" "}
            <span className="font-semibold text-black">₦{total.toLocaleString()}</span>. Choose a
            payment plan there to complete your purchase.
          </p>
          {klumpStatus === "verifying" && (
            <p className="mt-3 flex items-center gap-2 text-gold">
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying your payment...
            </p>
          )}
          {klumpStatus === "not-configured" && (
            <p className="mt-3 text-red-600">
              Klump payments aren&apos;t set up yet on this store. Please choose a different
              payment method or contact support.
            </p>
          )}
          {klumpStatus === "failed" && (
            <p className="mt-3 text-red-600">
              We couldn&apos;t confirm this payment. Please try again or contact support.
            </p>
          )}
        </div>
      )}

      {orderError && (
        <p className="mt-4 rounded-md bg-red-500/10 px-4 py-2 text-sm text-red-600">{orderError}</p>
      )}

      <div className="mt-6 space-y-3">
        <label className="flex cursor-pointer items-start gap-2 text-sm text-black/70">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 accent-gold"
          />
          I accept the <span className="font-semibold text-black">Terms & Conditions</span>{" "}
          including the No-Return & No-Refund policy.
        </label>
        <label className="flex cursor-pointer items-start gap-2 text-sm text-black/70">
          <input
            type="checkbox"
            checked={acceptedPrivacy}
            onChange={(e) => setAcceptedPrivacy(e.target.checked)}
            className="mt-0.5 accent-gold"
          />
          I accept the <span className="font-semibold text-black">Privacy Policy</span> and consent
          to data processing under Nigerian NDPR.
        </label>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onBack}
          className="rounded-md bg-black/10 px-6 py-3 text-sm font-semibold transition hover:bg-black/15"
        >
          Back
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={!canPlaceOrder || submitting || klumpStatus === "verifying"}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Zap className="h-4 w-4" />{" "}
          {submitting ? "Placing Order…" : `Place Order — ₦${orderTotal.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;
