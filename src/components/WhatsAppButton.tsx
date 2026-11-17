import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  return (
    <a
      href="https://wa.me/919820041290?text=Hello%20Aaroha%20Atelier%2C%20I%20would%20like%20help%20with%20an%20outfit."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat with Aaroha Stylist"
      className="fixed bottom-4 right-4 z-30 w-11 h-11 bg-[#25D366] hover:bg-[#1fb858] text-white shadow-md flex items-center justify-center rounded-full transition-transform duration-150 hover:scale-105"
    >
      <MessageCircle className="w-5 h-5 fill-white stroke-[#25D366]" />
    </a>
  );
};
