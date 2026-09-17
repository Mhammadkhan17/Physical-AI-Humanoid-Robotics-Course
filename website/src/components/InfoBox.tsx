import type {ReactNode} from 'react';

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

const icons: Record<InfoBoxType, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  success: '✅',
  danger: '🚨',
};

export default function InfoBox({type = 'info', title, children}: InfoBoxProps): ReactNode {
  return (
    <div className={`p-4 rounded-lg border ${styles[type]}`}>
      <div className="flex items-start gap-3">
        <span className="text-lg mt-0.5">{icons[type]}</span>
        <div className="flex-1 text-sm">
          {title && <p className="font-semibold mb-1">{title}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
