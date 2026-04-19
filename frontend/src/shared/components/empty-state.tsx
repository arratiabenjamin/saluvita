import { ReactNode } from 'react';
import { Card } from '@/shared/ui/card';

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto max-w-md">
        <h3 className="text-xl font-bold text-text-main">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-text-muted">{description}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </Card>
  );
}
