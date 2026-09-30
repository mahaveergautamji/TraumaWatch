import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onOpenEthicsModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenEthicsModal }) => {
  return (
    <footer className="mt-auto border-t border-[#d9e6e4] bg-[#f2f7f6] pt-10 pb-12 text-center text-xs text-[#5a7580]">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Editorial 3-column Links */}
        <div className="flex justify-center gap-12 sm:gap-20 text-left leading-relaxed">
          <div>
            <b className="font-serif text-[#15303a] text-sm block mb-1">TraumaWatch</b>
            <span>Early-warning for human review</span>
          </div>
          <div>
            <b className="font-serif text-[#15303a] text-sm block mb-1">Product</b>
            <div className="flex flex-col space-y-1">
              <a href="#features" className="hover:text-[#2a7f8f]">Features</a>
              <a href="#model" className="hover:text-[#2a7f8f]">Risk model</a>
              <a href="#how" className="hover:text-[#2a7f8f]">How it works</a>
            </div>
          </div>
          <div>
            <b className="font-serif text-[#15303a] text-sm block mb-1">Trust</b>
            <div className="flex flex-col space-y-1">
              <a href="#privacy" className="hover:text-[#2a7f8f]">Privacy</a>
              <a href="#faq" className="hover:text-[#2a7f8f]">FAQ</a>
              <button
                onClick={onOpenEthicsModal}
                className="text-left text-[#2a7f8f] font-medium hover:underline"
              >
                Clinical safeguards
              </button>
            </div>
          </div>
        </div>

        {/* Clinical Guardrail Mandated Disclaimer */}
        <div className="pt-4 border-t border-[#d9e6e4]/80 text-[#5a7580] max-w-xl mx-auto space-y-1">
          <p>
            AI flags priority. A trained counsellor always makes the final decision. Consent-based, privacy-by-design, minimal PII.
          </p>
          <p className="text-[11px] text-[#5a7580]/80">
            All profiles are fictional synthetic data for a Smart India Hackathon prototype.
          </p>
        </div>
      </div>
    </footer>
  );
};
