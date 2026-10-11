export type KlumpItem = {
  name: string;
  unit_price: number;
  quantity: number;
  image_url?: string;
  item_url?: string;
};

export type KlumpPayload = {
  publicKey: string;
  data: {
    amount: number;
    shipping_fee?: number;
    currency: "NGN";
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    redirect_url?: string;
    merchant_reference?: string;
    meta_data?: Record<string, unknown>;
    items: KlumpItem[];
  };
  onSuccess?: (data: { reference?: string; [key: string]: unknown }) => void;
  onError?: (data: unknown) => void;
  onLoad?: (data: unknown) => void;
  onOpen?: (data: unknown) => void;
  onClose?: (data: unknown) => void;
};

// The Klump SDK (https://js.useklump.com/klump.js) declares `class Klump`
// at the top level of a classic script. Class/const/let declarations don't
// attach to `window`, so this is a bare global identifier, not window.Klump.
declare global {
  // eslint-disable-next-line no-var
  var Klump: (new (payload: KlumpPayload) => void) | undefined;
}

export {};
