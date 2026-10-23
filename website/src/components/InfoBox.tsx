import type {ReactNode, SVGProps} from 'react';

type InfoBoxType = 'info' | 'warning' | 'success' | 'danger';

interface InfoBoxProps {
  type?: InfoBoxType;
  title?: string;
  children: ReactNode;
}

const styles: Record<InfoBoxType, string> = {
  info: 'bg-info-bg border-info-border text-info-text dark:bg-info-dark-bg dark:border-info-dark-border dark:text-info-dark-text',
  warning: 'bg-warning-bg border-warning-border text-warning-text dark:bg-warning-dark-bg dark:border-warning-dark-border dark:text-warning-dark-text',
  success: 'bg-success-bg border-success-border text-success-text dark:bg-success-dark-bg dark:border-success-dark-border dark:text-success-dark-text',
  danger: 'bg-danger-bg border-danger-border text-danger-text dark:bg-danger-dark-bg dark:border-danger-dark-border dark:text-danger-dark-text',
};

const iconProps: SVGProps<SVGSVGElement> = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const icons: Record<InfoBoxType, ReactNode> = {
  info: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 7.75v.01" />
    </svg>
  ),
  warning: (
    <svg {...iconProps}>
      <path d="M12 3.5 21 20H3L12 3.5Z" />
      <path d="M12 9.5v4.5" />
      <path d="M12 17.25v.01" />
    </svg>
  ),
  success: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.75 2.75L16 9" />
    </svg>
  ),
  danger: (
    <svg {...iconProps}>
      <path d="M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5Z" />
      <path d="M12 8v5" />
      <path d="M12 16.25v.01" />
    </svg>
  ),
};

export default function InfoBox({type = 'info', title, children}: InfoBoxProps): ReactNode {
  return (
    <div className={`p-4 rounded-lg border ${styles[type]}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{icons[type]}</span>
        <div className="flex-1 text-sm">
          {title && <p className="font-semibold mb-1">{title}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
