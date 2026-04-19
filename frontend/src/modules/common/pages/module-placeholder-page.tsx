import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';

type ModulePlaceholderPageProps = {
  title: string;
  description: string;
};

export function ModulePlaceholderPage({
  title,
  description,
}: ModulePlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-3xl py-6">
      <Card className="p-8 sm:p-10">
        <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary-dark">
          Modulo en preparacion
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-text-main">
          {title}
        </h1>
        <p className="mt-4 text-base leading-8 text-text-muted">{description}</p>
        <div className="mt-8">
          <Button>Continuar con el MVP</Button>
        </div>
      </Card>
    </div>
  );
}
