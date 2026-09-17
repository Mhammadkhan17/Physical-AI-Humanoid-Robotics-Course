import type {ReactNode} from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({icon, title, description}: FeatureCardProps): ReactNode {
  return (
    <div className="p-6 bg-surface rounded-md border border-border-subtle">
      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-brand-subtle text-brand mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
