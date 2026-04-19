import { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-main">
          {title}
        </h1>
        <p className="mt-2 text-base leading-7 text-text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
