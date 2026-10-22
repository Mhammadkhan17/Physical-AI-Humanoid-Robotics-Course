import type {ReactNode} from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  index: number;
}

export default function FeatureCard({icon, title, description, index}: FeatureCardProps): ReactNode {
  return (
    <div className={`p-6 bg-surface rounded-[10px] border border-border-subtle scroll-reveal scroll-stagger-${index}`}>
      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-brand-subtle text-brand mb-4 scroll-child-icon">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2 scroll-child-text">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed scroll-child-text scroll-child-delay-2">
        {description}
      </p>
    </div>
  );
}
