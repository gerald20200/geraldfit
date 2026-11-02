import { FaWhatsapp } from 'react-icons/fa';
import '../styles/whatsapp-button.css';

const whatsappUrl = 'https://wa.me/2347077266794?text=Hi%2C%20I%27d%20like%20to%20ask%20about%20Geraldfit%20football%20training.';

export default function WhatsAppButton() {
  return <a className="whatsapp-float" href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat with Geraldfit on WhatsApp" title="Chat on WhatsApp">
    <FaWhatsapp aria-hidden="true" />
    <span>Chat with us</span>
  </a>;
}