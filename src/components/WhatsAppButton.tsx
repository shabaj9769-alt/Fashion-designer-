import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';

interface WhatsAppButtonProps {
  hidden?: boolean;
  aboveStickyBar?: boolean;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  hidden = false,
  aboveStickyBar = false,
}) => {
  const { settings } = useStoreData();
  const cleanPhone = (settings.whatsappNumber || '919820041290').replace(
    /\D/g,
    ''
  );
  const storeLabel = settings.storeName || 'Aaroha';
  const href = `https://wa.me/${cleanPhone || '919820041290'}?text=${encodeURIComponent(
    `Hello ${storeLabel} Atelier, I would like help with an outfit.`
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      title={`Chat with ${storeLabel} Stylist`}
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : undefined}
      style={aboveStickyBar ? { bottom: '100px' } : undefined}
      className={`${
        hidden ? 'hidden' : 'flex'
      } fixed ${
        aboveStickyBar ? '' : 'bottom-4'
      } right-4 z-50 w-12 h-12 bg-[#25D366] hover:bg-[#1fb858] text-white shadow-md items-center justify-center rounded-full transition-transform duration-150 hover:scale-105`}
    >
      <MessageCircle className="w-6 h-6 fill-white stroke-[#25D366]" />
    </a>
  );
};

