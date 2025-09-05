
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ToolPageLayout } from '@/components/tool-page-layout';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

const formSchema = z.object({
  power: z.coerce.number().min(1).max(20),
  aperture: z.coerce.number().min(10).max(100),
});

type FormValues = z.infer<typeof formSchema>;

const AberrationDiagram = ({ power, aperture }: { power: number; aperture: number; }) => {
    const memoizedDiagram = useMemo(() => {
        const viewboxWidth = 500;
        const viewboxHeight = 250;
        const lensPosition = 50;
        const lensThickness = 20;

        const numRays = 11;
        const incidentRays = Array.from({ length: numRays }, (_, i) => {
            const y = (viewboxHeight / 2) + ((i - (numRays - 1) / 2) * (aperture / numRays));
            return { id: `ray-${i}`, y };
        });

        // Simplified spherical aberration model
        // Rays farther from the center are bent more strongly
        const getFocalPoint = (y: number) => {
            const distanceFromCenter = Math.abs(y - viewboxHeight / 2);
            const normalizedDistance = distanceFromCenter / (aperture / 2);
            // Aberration factor - increase to make aberration more pronounced
            const aberrationFactor = power * 0.15; 
            const focalLength = (viewboxWidth - lensPosition - 50) / (power / 5);
            
            const focalX = lensPosition + focalLength - (normalizedDistance * normalizedDistance * aberrationFactor);
            return focalX;
        };

        const paraxialFocalPoint = getFocalPoint(viewboxHeight / 2);

        return (
            <div className="w-full mx-auto p-4 flex items-center justify-center bg-card rounded-lg border">
                <svg viewBox={`0 0 ${viewboxWidth} ${viewboxHeight}`} className="w-full h-auto">
                    {/* Lens */}
                    <path
                        d={`M ${lensPosition},${(viewboxHeight - aperture) / 2} C ${lensPosition + lensThickness},${(viewboxHeight - aperture) / 2} ${lensPosition + lensThickness},${(viewboxHeight + aperture) / 2} ${lensPosition},${(viewboxHeight + aperture) / 2}`}
                        stroke="hsl(var(--primary) / 0.5)"
                        fill="hsl(var(--primary) / 0.1)"
                        strokeWidth="1.5"
                    />
                    <path
                        d={`M ${lensPosition},${(viewboxHeight - aperture) / 2} C ${lensPosition - lensThickness},${(viewboxHeight - aperture) / 2} ${lensPosition - lensThickness},${(viewboxHeight + aperture) / 2} ${lensPosition},${(viewboxHeight + aperture) / 2}`}
                        stroke="hsl(var(--primary) / 0.5)"
                        fill="hsl(var(--primary) / 0.1)"
                        strokeWidth="1.5"
                    />

                    {/* Optical Axis */}
                    <line x1="0" y1={viewboxHeight/2} x2={viewboxWidth} y2={viewboxHeight/2} stroke="hsl(var(--foreground) / 0.2)" strokeDasharray="4 4" />

                    {/* Rays */}
                    {incidentRays.map(ray => {
                        const focalX = getFocalPoint(ray.y);
                        const isParaxial = Math.abs(ray.y - viewboxHeight / 2) < 1;
                        return (
                            <g key={ray.id}>
                                <line x1="0" y1={ray.y} x2={lensPosition} y2={ray.y} stroke="hsl(var(--accent))" opacity="0.6" />
                                <line x1={lensPosition} y1={ray.y} x2={focalX} y2={viewboxHeight/2} stroke="hsl(var(--accent))" opacity={isParaxial ? 1 : 0.6} strokeWidth={isParaxial ? 1.5 : 1} />
                            </g>
                        );
                    })}

                    {/* Paraxial Focus Point */}
                    <circle cx={paraxialFocalPoint} cy={viewboxHeight/2} r="3" fill="hsl(var(--primary))" />
                     <text x={paraxialFocalPoint} y={viewboxHeight/2 + 15} fontSize="10" fill="hsl(var(--primary))" textAnchor="middle">F'</text>
                </svg>
            </div>
        );
    }, [power, aperture]);

    return memoizedDiagram;
};

export default function AberrationVisualizerPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      power: 8.0,
      aperture: 80,
    },
  });

  const watchedValues = form.watch();

  return (
    <ToolPageLayout
      title="Optical Aberration Visualizer"
      description="See how lens parameters affect spherical aberration in real-time."
    >
      <div className="grid gap-8 md:grid-cols-[2fr,3fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Lens Controls</CardTitle>
            <CardDescription>Adjust the sliders to see the effect on the light rays.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-8">
                <FormField
                  control={form.control}
                  name="power"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lens Power (D): {field.value.toFixed(2)}</FormLabel>
                      <FormControl>
                        <Slider
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            min={1}
                            max={20}
                            step={0.25}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aperture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aperture Size: {field.value.toFixed(0)}mm</FormLabel>
                      <FormControl>
                        <Slider
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            min={10}
                            max={100}
                            step={2}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="flex flex-col items-center justify-center">
            <AberrationDiagram power={watchedValues.power} aperture={watchedValues.aperture} />
            <div className="text-center mt-4 text-sm text-muted-foreground w-full max-w-md">
                <p><span className="font-semibold text-primary">Spherical Aberration</span> occurs when light rays hitting the edge of a lens focus at a different point than rays hitting the center. Notice how peripheral rays cross the axis sooner than central (paraxial) rays.</p>
            </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
