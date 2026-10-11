import { CreditCard, CalendarClock, ShieldCheck, ArrowRight } from "lucide-react";

export type PaymentMethod = "bank-transfer" | "installments" | "klump";

const methods: {
  id: PaymentMethod;
  icon: typeof CreditCard;
  title: string;
  subtitle: string;
  detail: string;
}[] = [
  {
    id: "bank-transfer",
    icon: CreditCard,
    title: "Direct Bank Transfer",
    subtitle: "Pay directly to our bank account",
    detail: "Pay the full amount upfront. Bank details and a receipt upload appear on the next step.",
  },
  {
    id: "installments",
    icon: CalendarClock,
    title: "Save to Buy",
    subtitle: "30% deposit, spread the rest weekly",
    detail:
      "Pay a 30% deposit now, then clear the rest over 2–8 weekly instalments. Choose your duration and see the full breakdown on the next step.",
  },
  {
    id: "klump",
    icon: ShieldCheck,
    title: "Buy Now, Pay Later",
    subtitle: "Split your payment with Klump",
    detail: "Split your payment into instalments through Klump's secure checkout widget on the next step.",
  },
];

type PaymentMethodStepProps = {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  onBack: () => void;
  onContinue: () => void;
};

const PaymentMethodStep = ({ selected, onSelect, onBack, onContinue }: PaymentMethodStepProps) => {
  return (
    <div className="flex-1 rounded-2xl bg-black/5 p-6">
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-gold" />
        <h2 className="text-lg font-semibold">Payment Method</h2>
      </div>

      <div className="mt-6 space-y-3">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = selected === method.id;

          return (
            <div
              key={method.id}
              className={`rounded-xl border transition ${
                isSelected ? "border-gold bg-gold/5" : "border-black/10 hover:border-black/30"
              }`}
            >
              <label className="flex cursor-pointer items-center gap-4 p-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isSelected ? "bg-gold/20 text-gold" : "bg-black/10 text-black/50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-semibold">{method.title}</p>
                  <p className="text-xs text-black/50">{method.subtitle}</p>
                </div>

                <input
                  type="radio"
                  name="payment-method"
                  checked={isSelected}
                  onChange={() => onSelect(method.id)}
                  className="accent-gold"
                />
              </label>

              {isSelected && (
                <p className="border-t border-gold/20 px-4 py-3 text-xs text-black/60">
                  {method.detail}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onBack}
          className="rounded-md bg-black/10 px-6 py-3 text-sm font-semibold transition hover:bg-black/15"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold/90"
        >
          Review Order <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodStep;
