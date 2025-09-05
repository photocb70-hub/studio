
"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const value = props.value || props.defaultValue || [0];
  const min = props.min || 0;
  const max = props.max || 100;
  const isBipolar = min < 0 && max > 0;

  const rangeStyle = isBipolar
    ? value[0] < 0
      ? { left: `${50 - (Math.abs(value[0]) / Math.abs(min)) * 50}%`, right: '50%' }
      : { left: '50%', right: `${50 - (value[0] / max) * 50}%` }
    : {};

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range 
          className={cn(
            "absolute h-full bg-primary",
            "data-[bipolar=true]:bg-transparent"
          )}
          style={rangeStyle}
        />
      </SliderPrimitive.Track>
       {isBipolar && (
        <div
          className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-muted-foreground/50"
          aria-hidden="true"
        />
      )}
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
