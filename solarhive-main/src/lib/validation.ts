// Shared by the checkout form and the orders API so both sides agree on what
// counts as valid delivery details.

export type DeliveryFields = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

export type DeliveryErrors = Partial<Record<keyof DeliveryFields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_PART_RE = /^[\p{L}][\p{L}'.-]*$/u;

// Accepts Nigerian mobile numbers as +234 803 000 0000, 2348030000000,
// 0803-000-0000, etc. and returns the 11-digit local form (08030000000) that
// Klump expects, or null if it isn't a valid Nigerian mobile number.
export const normalizeNigerianPhone = (input: string): string | null => {
  let digits = input.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (!/^\d+$/.test(digits)) return null;

  // "+234 0803..." is a common mistake — drop the extra 0.
  if (digits.startsWith("2340")) digits = digits.slice(3);
  else if (digits.startsWith("234")) digits = "0" + digits.slice(3);
  else if (digits.length === 10 && /^[789]/.test(digits)) digits = "0" + digits;

  return /^0[789][01]\d{8}$/.test(digits) ? digits : null;
};

export const validateDelivery = (details: DeliveryFields): DeliveryErrors => {
  const errors: DeliveryErrors = {};

  const nameParts = details.fullName.trim().split(/\s+/).filter(Boolean);
  if (nameParts.length === 0) errors.fullName = "Enter your full name";
  else if (nameParts.length < 2) errors.fullName = "Enter your first and last name";
  else if (!nameParts.every((part) => NAME_PART_RE.test(part)))
    errors.fullName = "Name can only contain letters, hyphens and apostrophes";
  else if (details.fullName.trim().length > 100) errors.fullName = "Name is too long";

  const email = details.email.trim();
  if (!email) errors.email = "Enter your email address";
  else if (!EMAIL_RE.test(email) || email.length > 254) errors.email = "Enter a valid email address";

  if (!details.phone.trim()) errors.phone = "Enter your phone number";
  else if (!normalizeNigerianPhone(details.phone))
    errors.phone = "Enter a valid Nigerian mobile number, e.g. 0803 000 0000 or +234 803 000 0000";

  const address = details.address.trim();
  if (!address) errors.address = "Enter your delivery address";
  else if (address.length < 5) errors.address = "Enter a more complete address";
  else if (address.length > 200) errors.address = "Address is too long";

  const city = details.city.trim();
  if (!city) errors.city = "Enter your city";
  else if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(city)) errors.city = "City can only contain letters";
  else if (city.length > 60) errors.city = "City name is too long";

  return errors;
};
