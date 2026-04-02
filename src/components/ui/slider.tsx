"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const value = props.value || props.defaultValue || [0];
  const min = props.min ?? 0;
  const max = props.max ?? 100;
  
  // Calculate if the slider crosses zero
  const isBipolar = min < 0 && max > 0;
  
  let rangeStyle: React.CSSProperties = {};
  
  if (isBipolar) {
    const range = max - min;
    const zeroPos = (Math.abs(min) / range) * 100;
    const valPos = ((value[0] - min) / range) * 100;
    
    if (value[0] < 0) {
      rangeStyle = {
        left: `${valPos}%`,
        right: `${100 - zeroPos}%`,
      };
    } else {
      rangeStyle = {
        left: `${zeroPos}%`,
        right: `${100 - valPos}%`,
      };
    }
  }

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center py-4",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range 
          className={cn(
            "absolute h-full bg-primary",
            isBipolar && "bg-primary"
          )}
          style={isBipolar ? rangeStyle : undefined}
        />
      </SliderPrimitive.Track>
      
      {isBipolar && (
        <div
          className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-muted-foreground/40"
          aria-hidden="true"
        />
      )}
      
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
