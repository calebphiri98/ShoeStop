export const WHATSAPP_NUMBER = '265994950382';

export const whatsappLink = (text) =>
  text
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${WHATSAPP_NUMBER}`;