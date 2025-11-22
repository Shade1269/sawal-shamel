import React from "react";
import type { ReactNode } from "react";

import { UnifiedBadge } from "@/components/design-system";

interface PaymentMethodOption {
  id: string;
  title: string;
  description: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface CheckoutPaymentSectionProps {
  paymentMethods: readonly PaymentMethodOption[];
  selectedMethod: string;
  onSelect: (methodId: string) => void;
}

const CheckoutPaymentSection: React.FC<CheckoutPaymentSectionProps> = ({
  paymentMethods,
  selectedMethod,
  onSelect,
}) => {
  return (
    <div
      className="grid gap-[var(--spacing-sm)]"
      role="radiogroup"
      aria-label="طرق الدفع المتاحة"
      data-component="checkout-payment-options"
    >
      {paymentMethods.map((method) => {
        const selected = selectedMethod === method.id;
        const disabled = Boolean(method.disabled);
        return (
          <button
            key={method.id}
            type="button"
            onClick={() => !disabled && onSelect(method.id)}
            disabled={disabled}
            data-selected={selected ? "true" : undefined}
            className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/80 px-[var(--spacing-lg)] py-[var(--spacing-md)] text-start transition data-[selected=true]:border-[color:var(--accent)] data-[selected=true]:bg-[color:var(--accent)]/12 data-[selected=true]:shadow-[var(--shadow-glass-strong)] disabled:cursor-not-allowed disabled:opacity-60"
            role="radio"
            aria-checked={selected}
            aria-disabled={disabled}
          >
            <div className="flex items-center gap-[var(--spacing-md)]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--glass-border)] bg-[color:var(--surface-2)] text-[color:var(--accent)]">
                {method.icon}
              </span>
              <div className="space-y-1">
                <p className="font-medium text-[color:var(--glass-fg)]">{method.title}</p>
                <p className="text-xs text-[color:var(--fg-muted)]">{method.description}</p>
              </div>
            </div>
            {disabled ? (
              <UnifiedBadge variant="secondary" pill>
                قريباً
              </UnifiedBadge>
            ) : (
              <span className="text-sm font-semibold text-[color:var(--accent)]">
                اختيار
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CheckoutPaymentSection;
