import { MapPin, ArrowRight } from "lucide-react";

export type DeliveryDetails = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

type DeliveryFormProps = {
  details: DeliveryDetails;
  onChange: (details: DeliveryDetails) => void;
  onContinue: () => void;
};

const fields: { key: keyof DeliveryDetails; label: string; placeholder: string }[] = [
  { key: "fullName", label: "Full Name", placeholder: "e.g., Ada Bello" },
  { key: "email", label: "Email", placeholder: "e.g., mail@example.com" },
  { key: "phone", label: "Phone", placeholder: "e.g., +234 800 000 0000" },
  { key: "address", label: "Address", placeholder: "e.g., 5 Electronics Way, Ikeja" },
  { key: "city", label: "City", placeholder: "e.g., Lagos" },
];

const isValid = (details: DeliveryDetails) =>
  Object.values(details).every((value) => value.trim().length > 0);

const DeliveryForm = ({ details, onChange, onContinue }: DeliveryFormProps) => {
  return (
    <div className="flex-1 rounded-2xl bg-black/5 p-6">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-gold" />
        <h2 className="text-lg font-semibold">Delivery Details</h2>
      </div>

      <div className="mt-6 space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label
              htmlFor={`delivery-${field.key}`}
              className="text-xs font-semibold tracking-wide text-black/60 uppercase"
            >
              {field.label}
            </label>
            <input
              id={`delivery-${field.key}`}
              type="text"
              value={details[field.key]}
              placeholder={field.placeholder}
              onChange={(e) => onChange({ ...details, [field.key]: e.target.value })}
              className="mt-2 w-full rounded-md border border-black/10 bg-black/5 px-4 py-3 text-sm placeholder:text-black/30 focus:border-gold focus:outline-none"
            />
          </div>
        ))}
      </div>

      <button
        onClick={onContinue}
        disabled={!isValid(details)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue to Payment <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default DeliveryForm;
