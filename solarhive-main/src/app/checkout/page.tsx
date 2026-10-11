"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import CheckoutStepper from "../components/checkout/CheckoutStepper";
import OrderSummary, { DELIVERY_FEE } from "../components/checkout/OrderSummary";
import DeliveryForm, { DeliveryDetails } from "../components/checkout/DeliveryForm";
import PaymentMethodStep, { PaymentMethod } from "../components/checkout/PaymentMethodStep";
import ReviewStep from "../components/checkout/ReviewStep";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const [delivery, setDelivery] = useState<DeliveryDetails>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank-transfer");

  const total = subtotal + (items.length > 0 ? DELIVERY_FEE : 0);

  const handlePlaceOrder = (placedOrderNumber: string) => {
    setOrderNumber(placedOrderNumber);
    setOrderPlaced(true);
    clearCart();
  };

  if (orderPlaced) {
    return (
      <div className="mx-10 mt-8 mb-16 flex flex-col items-center rounded-3xl bg-black/5 py-24 text-center">
        <CheckCircle2 className="h-16 w-16 text-gold" />
        <h1 className="mt-6 text-2xl font-semibold">Order Placed Successfully!</h1>
        <p className="mt-2 text-sm text-black/60">
          Your order <span className="font-semibold text-gold">{orderNumber}</span> has been
          received. We&apos;ll reach out with confirmation shortly.
        </p>
        <Link
          href="/shop"
          className="mt-8 flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold/90"
        >
          Continue Shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-10 mt-8 mb-16 flex flex-col items-center rounded-3xl bg-black/5 py-24 text-center">
        <h1 className="text-xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-black/60">Add items to your cart before checking out.</p>
        <Link
          href="/shop"
          className="mt-6 flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold/90"
        >
          Shop Now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-10 mt-8 mb-16">
      <h1 className="text-2xl font-semibold">Checkout</h1>

      <div className="mt-8 max-w-2xl">
        <CheckoutStepper currentStep={step} />
      </div>

      <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-start">
        {step === 1 && (
          <DeliveryForm
            details={delivery}
            onChange={setDelivery}
            onContinue={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <PaymentMethodStep
            selected={paymentMethod}
            onSelect={setPaymentMethod}
            onBack={() => setStep(1)}
            onContinue={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <ReviewStep
            paymentMethod={paymentMethod}
            items={items}
            delivery={delivery}
            deliveryFee={DELIVERY_FEE}
            subtotal={subtotal}
            total={total}
            onBack={() => setStep(2)}
            onPlaceOrder={handlePlaceOrder}
          />
        )}

        <OrderSummary />
      </div>
    </div>
  );
}
