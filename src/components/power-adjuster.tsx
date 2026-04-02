
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
  className?: string;
}

export function PowerAdjuster({
  value,
  onChange,
  label,
  min = -20,
  max = 20,
  step = 0.25,
  className,
}: PowerAdjusterProps) {
  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const formatPower = (p: number) => {
    return (p > 0 ? '+' : '') + p.toFixed(2);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-4">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={value}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) onChange(val);
            }}
            step={step}
            className="h-8 w-20 text-right font-mono text-sm"
          />
          <span className="text-xs font-semibold text-muted-foreground">D</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0 shadow-sm active:scale-95"
          onClick={handleDecrement}
          disabled={value <= min}
        >
          <Minus className="size-4" />
        </Button>

        <div className="relative flex-1 py-2">
          <Slider
            value={[value]}
            onValueChange={(vals) => onChange(vals[0])}
            min={min}
            max={max}
            step={step}
            className="py-4"
          />
          <div className="absolute -bottom-1 left-0 right-0 flex justify-between px-1 text-[10px] text-muted-foreground">
            <span>{min}</span>
            <span className="font-bold text-primary">0</span>
            <span>+{max}</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0 shadow-sm active:scale-95"
          onClick={handleIncrement}
          disabled={value >= max}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <p className="text-center text-xs font-bold text-primary sm:hidden">
        Current: {formatPower(value)}
      </p>
    </div>
  );
}
