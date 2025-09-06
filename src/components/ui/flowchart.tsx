
'use client';

import React from 'react';
import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FlowchartStep = {
  title: string;
  description: string;
};

type FlowchartProps = {
  steps: FlowchartStep[];
  className?: string;
};

export function Flowchart({ steps, className }: FlowchartProps) {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="w-full max-w-md rounded-lg border bg-card p-4 shadow-sm">
            <h4 className="font-semibold text-card-foreground">{step.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
          </div>
          {index < steps.length - 1 && (
            <div className="my-2 flex justify-center">
              <ArrowDown className="size-6 text-muted-foreground" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
