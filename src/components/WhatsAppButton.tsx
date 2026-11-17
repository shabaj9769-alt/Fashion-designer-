import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  hidden?: boolean;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  hidden = false,
}) => {
  return (
    <a
      href="https://wa.me/919820041290?text=Hello%20Aaroha%20Atelier%2C%20I%20would%20like%20help%20with%20an%20outfit."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat with Aaroha Stylist"
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : undefined}
      className={`${
        hidden ? 'hidden' : 'flex'
      } fixed bottom-4 right-4 z-50 w-12 h-12 bg-[#25D366] hover:bg-[#1fb858] text-white shadow-md items-center justify-center rounded-full transition-transform duration-150 hover:scale-105`}
    >
      <MessageCircle className="w-6 h-6 fill-white stroke-[#25D366]" />
    </a>
  );
};
