import React from 'react';
import { Check, Ruler, Scissors, X } from 'lucide-react';

interface AtelierGuideModalProps {
  topic: 'Made to Order' | 'Custom Sizing' | null;
  onClose: () => void;
}

const SIZE_CHART = [
  { size: 'XS', bust: '32"', waist: '26"', hip: '36"' },
  { size: 'S', bust: '34"', waist: '28"', hip: '38"' },
  { size: 'M', bust: '36"', waist: '30"', hip: '40"' },
  { size: 'L', bust: '38"', waist: '32"', hip: '42"' },
  { size: 'XL', bust: '40"', waist: '34"', hip: '44"' },
  { size: 'XXL', bust: '42"', waist: '36"', hip: '46"' },
];

export const AtelierGuideModal: React.FC<AtelierGuideModalProps> = ({
  topic,
  onClose,
}) => {
  if (!topic) return null;

  const isCustom = topic === 'Custom Sizing';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={topic}
    >
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-xl bg-white border border-[#e8e8e8] shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e8e8]">
          <div className="flex items-center gap-2.5">
            {isCustom ? (
              <Ruler className="w-4 h-4 text-[#c8a078]" />
            ) : (
              <Scissors className="w-4 h-4 text-[#c8a078]" />
            )}
            <h2 className="text-[15px] font-medium uppercase tracking-[1px] text-[#000000]">
              {topic}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-[#343434] hover:text-[#d74a5d] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isCustom ? (
            <>
              <p className="text-[13px] text-[#343434] leading-relaxed">
                Select <strong className="font-medium text-[#000000]">Custom</strong>{' '}
                on any product page to share bust, waist, hip, sleeve, or kurta
                length notes. Our pattern masters tailor your set to measure at zero extra cost.
              </p>

              <div className="overflow-x-auto border border-[#e8e8e8]">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-[#f2f2f2] text-[#000000] uppercase tracking-[1px]">
                    <tr>
                      <th className="py-2.5 px-3 font-medium">Size</th>
                      <th className="py-2.5 px-3 font-medium">Bust</th>
                      <th className="py-2.5 px-3 font-medium">Waist</th>
                      <th className="py-2.5 px-3 font-medium">Hip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8e8e8] text-[#343434] tabular-nums">
                    {SIZE_CHART.map((row) => (
                      <tr key={row.size}>
                        <td className="py-2 px-3 font-medium text-[#000000]">
                          {row.size}
                        </td>
                        <td className="py-2 px-3">{row.bust}</td>
                        <td className="py-2 px-3">{row.waist}</td>
                        <td className="py-2 px-3">{row.hip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-[13px] text-[#343434] leading-relaxed">
                Every Aaroha outfit is made individually after you place your order—eliminating
                deadstock waste while guaranteeing artisanal attention to every detail.
              </p>
              <ul className="space-y-3">
                {[
                  'Day 1–2: Hand-cut pure Chanderi, mulmul, or tussar fabric by our master cutter.',
                  'Day 3–6: Artisanal embroidery, French seams, and breathable cotton mulmul lining.',
                  'Day 7–10: Final steam press, quality inspection, and complimentary dispatch across India.',
                ].map((step) => (
                  <li
                    key={step}
                    className="flex items-start gap-2.5 text-[13px] text-[#343434]"
                  >
                    <Check className="w-4 h-4 text-[#d74a5d] shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-[#321004] hover:bg-[#d74a5d] text-white text-[11px] font-medium uppercase tracking-[1.5px] transition-colors cursor-pointer"
          >
            CONTINUE BROWSING
          </button>
        </div>
      </div>
    </div>
  );
};
