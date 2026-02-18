import { SiWhatsapp } from "react-icons/si";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919876543210?text=Hi%2C%20I%27m%20interested%20in%20your%20clothing%20collection"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg transition-all duration-200"
      data-testid="button-whatsapp-floating"
      aria-label="Contact us on WhatsApp"
    >
      <SiWhatsapp className="h-6 w-6" />
    </a>
  );
}
