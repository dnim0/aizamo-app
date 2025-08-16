import React, { useEffect, useRef } from 'react';
import { CheckCircle, X, Calendar } from 'lucide-react';
import CalendlyButton from './CalendlyButton';

const ThankYouModal = ({
  open,
  onClose,
  name = '',
  calendlyUrl,
  prefillName,
  prefillEmail,
}) => {
  const closeBtnRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Focus the Close button on open
  useEffect(() => {
    if (open && closeBtnRef.current) {
      closeBtnRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(2px)',
      }}
      onClick={handleBackdrop}
      aria-modal="true"
      role="dialog"
      aria-labelledby="thankyou-title"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl shadow-xl p-6 md:p-8"
        style={{ backgroundColor: 'var(--white)', border: '1px solid var(--light-brown)' }}
      >
        {/* Close (X) */}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:opacity-80 transition"
          style={{ backgroundColor: 'var(--cream)' }}
        >
          <X size={18} style={{ color: 'var(--darkest-brown)' }} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle size={28} style={{ color: 'var(--medium-brown)' }} />
          <h3
            id="thankyou-title"
            className="text-2xl font-bold"
            style={{ color: 'var(--darkest-brown)' }}
          >
            Thank you{name ? `, ${name}` : ''}!
          </h3>
        </div>

        {/* Body text */}
        <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          We’ve received your message and will get back to you within 12 hours.
          If you’d like to skip the wait, you can book a quick call now.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="btn btn-primary w-full sm:w-auto px-6 py-3"
          >
            Back to site
          </button>

          {/* Optional Calendly CTA right in the modal */}
          {calendlyUrl ? (
            <CalendlyButton
              url={calendlyUrl}
              name={prefillName}
              email={prefillEmail}
              utm={{ source: 'website', campaign: 'contact-thanks' }}
              className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition hover:opacity-90"
              style={{
                backgroundColor: 'var(--medium-brown)',
                color: 'white',
              }}
            >
              <span className="inline-flex items-center gap-2">
                <Calendar size={18} />
                Book Free Consultation
              </span>
            </CalendlyButton>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ThankYouModal;
