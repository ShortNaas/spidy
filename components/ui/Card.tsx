import React from "react";

export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  footerLink?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * Spidy v3 Card: 24px radius (rounded-3xl), hairline border, .sheen,
 * header with 40px circular icon button, title (16px 500), and optional action.
 */
export function Card({
  title,
  subtitle,
  icon,
  action,
  footerLink,
  children,
  className = "",
  bodyClassName = "",
}: CardProps) {
  const hasHeader = Boolean(title || icon || action);

  return (
    <div
      className={`bg-surface border border-border hover:border-border-hover rounded-3xl p-6 sheen transition-colors duration-150 flex flex-col justify-between ${className}`}
    >
      <div className="relative z-10 w-full flex-1 flex flex-col">
        {hasHeader && (
          <div className="flex items-center justify-between mb-5 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {icon && (
                <div className="w-10 h-10 rounded-full bg-raised border border-border text-white flex items-center justify-center shrink-0">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h3 className="font-sans font-medium text-[16px] text-white leading-snug truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="font-sans text-[12px] text-muted truncate">{subtitle}</p>
                )}
              </div>
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}

        <div className={`w-full flex-1 ${bodyClassName}`}>{children}</div>
      </div>

      {footerLink && (
        <div className="relative z-10 pt-4 mt-auto border-t border-border flex items-center justify-end">
          {footerLink}
        </div>
      )}
    </div>
  );
}
