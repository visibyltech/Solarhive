import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

const EMAIL = "info@solarhive.com.ng";
const PHONE_DISPLAY = "+234 802 725 0668";
const PHONE_DISPLAY_ALT = "0906 864 9345";
const WHATSAPP_NUMBER = "2348027250668";

export default function ContactPage() {
  return (
    <div className="pb-16">
      <div className="mx-10 mt-6 rounded-3xl bg-black/[0.03] px-6 py-14 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Get in <span className="text-leaf">touch</span>
        </h1>
        <p className="mt-3 text-sm text-black/50">
          Home <span className="text-gold">/</span> Contact
        </p>
      </div>

      <div className="mx-10 mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-black/5 p-6 text-center">
          <MapPin className="mx-auto h-6 w-6 text-gold" />
          <h3 className="mt-3 text-sm font-semibold tracking-wide uppercase">Visit Us</h3>
          <p className="mt-2 text-sm text-black/60">
            Lagos, Nigeria.
          </p>
        </div>
        <div className="rounded-2xl bg-black/5 p-6 text-center">
          <Clock className="mx-auto h-6 w-6 text-gold" />
          <h3 className="mt-3 text-sm font-semibold tracking-wide uppercase">Opening Hours</h3>
          <p className="mt-2 text-sm text-black/60">
            Mon-Sat: 9:00am - 7:00pm
            <br />
            Sun: 12:00pm - 5:00pm
          </p>
        </div>
        <div className="rounded-2xl bg-black/5 p-6 text-center">
          <Phone className="mx-auto h-6 w-6 text-gold" />
          <h3 className="mt-3 text-sm font-semibold tracking-wide uppercase">Call Us</h3>
          <p className="mt-2 text-sm text-black/60">{PHONE_DISPLAY}</p>
          <p className="text-sm text-black/60">{PHONE_DISPLAY_ALT}</p>
        </div>
      </div>

      <div className="mx-10 mt-6 rounded-2xl bg-black/5 p-8 text-center">
        <Mail className="mx-auto h-6 w-6 text-gold" />
        <h3 className="mt-3 text-lg font-semibold">Prefer to reach out directly?</h3>
        <p className="mt-2 text-sm text-black/60">
          Email us or send a message on WhatsApp and we&apos;ll respond as soon as we can.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={`mailto:${EMAIL}`}
            className="flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold/90"
          >
            <Mail className="h-4 w-4" /> {EMAIL}
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-md bg-black/10 px-6 py-3 text-sm font-semibold transition hover:bg-black/15"
          >
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
