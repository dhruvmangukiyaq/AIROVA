"use client";

import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/commerce";

/** Persistent WhatsApp CTA — most AIROVA customers convert from chat. */
export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink(
        "Hi AIROVA! I have a question about your shoes. Can you help?",
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with AIROVA on WhatsApp"
      className="group fixed right-4 bottom-4 z-30 flex items-center gap-2 rounded-full bg-[#1f9d55] py-3 pr-3 pl-4 text-white shadow-[0_12px_34px_-12px_rgba(31,157,85,0.9)] transition-all hover:pr-5 sm:right-6 sm:bottom-6"
    >
      <MessageCircle className="size-5" />
      <span className="max-w-0 overflow-hidden text-[0.7rem] font-semibold tracking-[0.14em] whitespace-nowrap uppercase transition-all duration-300 group-hover:max-w-40">
        Chat with us
      </span>
    </a>
  );
}
