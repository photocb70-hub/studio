'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PowerAdjusterProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  className?: string;
}

export function PowerAdjuster({
  value,
  onChange,
  label,
  min = -20,
  max = 20,
  step = 0.25,
  unit = 'D',
  className,
}: PowerAdjusterProps) {
  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const formatValue = (p: number) => {
    if (unit === '°') return p.toString();
    return (p > 0 ? '+' : '') + p.toFixed(2);
  };

  return (
    <div className={cn("space-y-4 rounded-xl border bg-card/50 p-4 shadow-sm", className)}>
      <div className="flex items-center justify-between gap-4">
        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={value}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) onChange(val);
            }}
            step={step}
            className="h-9 w-24 text-right font-mono text-base font-bold"
          />
          <span className="text-sm font-bold text-primary">{unit}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-10 w-10 shrink-0 border shadow-md active:scale-95 transition-all"
          onClick={handleDecrement}
          disabled={value <= min}
        >
          <Minus className="size-5" />
        </Button>

        <div className="relative flex-1 px-2 py-4">
          <Slider
            value={[value]}
            onValueChange={(vals) => onChange(vals[0])}
            min={min}
            max={max}
            step={step}
            className="cursor-pointer"
          />
          <div className="absolute -bottom-1 left-0 right-0 flex justify-between px-2 text-[10px] font-bold text-muted-foreground">
            <span>{min}{unit}</span>
            <span className="text-primary">{unit === 'D' ? '0.00' : ''}</span>
            <span>+{max}{unit}</span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-10 w-10 shrink-0 border shadow-md active:scale-95 transition-all"
          onClick={handleIncrement}
          disabled={value >= max}
        >
          <Plus className="size-5" />
        </Button>
      </div>
      
      <div className="text-center pt-1">
        <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
          {formatValue(value)} {unit}
        </span>
      </div>
    </div>
  );
}
