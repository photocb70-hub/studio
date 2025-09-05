import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Focus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ToolPageLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ToolPageLayout({ title, description, children }: ToolPageLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-2">
                <Focus className="size-5 text-primary" />
                <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                    Optical Prime
                </h1>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <h2 className="font-headline text-3xl font-bold tracking-tight">{title}</h2>
              <p className="mt-2 text-muted-foreground">{description}</p>
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
