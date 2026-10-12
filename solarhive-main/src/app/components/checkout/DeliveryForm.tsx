"use client";

import { useState } from "react";
import { MapPin, ArrowRight } from "lucide-react";
import { DeliveryFields, normalizeNigerianPhone, validateDelivery } from "@/lib/validation";

export type DeliveryDetails = DeliveryFields;

type DeliveryFormProps = {
  details: DeliveryDetails;
  onChange: (details: DeliveryDetails) => void;
  onContinue: () => void;
};

const fields: {
  key: keyof DeliveryDetails;
  label: string;
  placeholder: string;
  type: string;
  autoComplete: string;
}[] = [
  { key: "fullName", label: "Full Name", placeholder: "e.g., Ada Bello", type: "text", autoComplete: "name" },
  { key: "email", label: "Email", placeholder: "e.g., mail@example.com", type: "email", autoComplete: "email" },
  { key: "phone", label: "Phone", placeholder: "e.g., 0803 000 0000 or +234 803 000 0000", type: "tel", autoComplete: "tel" },
  { key: "address", label: "Address", placeholder: "e.g., 5 Electronics Way, Ikeja", type: "text", autoComplete: "street-address" },
  { key: "city", label: "City", placeholder: "e.g., Lagos", type: "text", autoComplete: "address-level2" },
];

const DeliveryForm = ({ details, onChange, onContinue }: DeliveryFormProps) => {
  const [touched, setTouched] = useState<Partial<Record<keyof DeliveryDetails, boolean>>>({});
  const errors = validateDelivery(details);
  const hasErrors = Object.keys(errors).length > 0;

  const handleContinue = () => {
    if (hasErrors) {
      setTouched({ fullName: true, email: true, phone: true, address: true, city: true });
      return;
    }
    // Store cleaned-up values so Klump and the orders API get e.g. 08030000000
    // even if the customer typed +234 803 000 0000.
    onChange({
      fullName: details.fullName.trim().replace(/\s+/g, " "),
      email: details.email.trim().toLowerCase(),
      phone: normalizeNigerianPhone(details.phone) ?? details.phone,
      address: details.address.trim(),
      city: details.city.trim(),
    });
    onContinue();
  };

  return (
    <div className="flex-1 rounded-2xl bg-black/5 p-6">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-gold" />
        <h2 className="text-lg font-semibold">Delivery Details</h2>
      </div>

      <div className="mt-6 space-y-4">
        {fields.map((field) => {
          const error = touched[field.key] ? errors[field.key] : undefined;
          return (
            <div key={field.key}>
              <label
                htmlFor={`delivery-${field.key}`}
                className="text-xs font-semibold tracking-wide text-black/60 uppercase"
              >
                {field.label}
              </label>
              <input
                id={`delivery-${field.key}`}
                type={field.type}
                autoComplete={field.autoComplete}
                value={details[field.key]}
                placeholder={field.placeholder}
                aria-invalid={!!error}
                aria-describedby={error ? `delivery-${field.key}-error` : undefined}
                onChange={(e) => onChange({ ...details, [field.key]: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, [field.key]: true }))}
                className={`mt-2 w-full rounded-md border bg-black/5 px-4 py-3 text-sm placeholder:text-black/30 focus:outline-none ${
                  error ? "border-red-500 focus:border-red-500" : "border-black/10 focus:border-gold"
                }`}
              />
              {error && (
                <p id={`delivery-${field.key}-error`} className="mt-1 text-xs text-red-600">
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleContinue}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue to Payment <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default DeliveryForm;
