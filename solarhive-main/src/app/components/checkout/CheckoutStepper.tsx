import { Check } from "lucide-react";

const steps = ["Delivery", "Payment", "Review"];

const CheckoutStepper = ({ currentStep }: { currentStep: number }) => {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const stepNumber = i + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <div key={step} className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                  isCompleted || isActive ? "bg-gold text-black" : "bg-black/10 text-black/50"
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-gold" : "text-black/50"
                }`}
              >
                {step}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div className={`mx-3 h-px flex-1 ${isCompleted ? "bg-gold" : "bg-black/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CheckoutStepper;
