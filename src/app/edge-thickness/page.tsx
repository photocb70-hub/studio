
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ToolPageLayout } from '@/components/tool-page-layout';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';

const formSchema = z.object({
  power: z.coerce.number().max(0, { message: 'Power must be zero or negative for this tool.' }).min(-20),
  index: z.coerce.number().min(1.4).max(2.0),
  diameter: z.coerce.number().min(30).max(90),
  centerThickness: z.coerce.number().min(0.1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

const LensDiagram = ({ edge, center, diameter }: { edge: number; center: number; diameter: number }) => {
    const memoizedDiagram = useMemo(() => {
        const viewboxWidth = 100;
        const maxThickness = Math.max(edge, center, 5); // Ensure a minimum height
        const scale = viewboxWidth / diameter;
        const viewboxHeight = maxThickness * scale * 2.5;

        const power = (edge - center);
        const curve = power * scale * 0.5;

        return (
            <div className="w-full max-w-sm mx-auto p-4">
                <svg viewBox={`0 0 ${viewboxWidth} ${viewboxHeight}`} className="w-full h-auto">
                    <path
                        d={`M 0,${viewboxHeight / 2 - (edge * scale)}
                             Q ${viewboxWidth / 2},${viewboxHeight / 2 - (center * scale) - curve} ${viewboxWidth},${viewboxHeight / 2 - (edge * scale)}
                             L ${viewboxWidth},${viewboxHeight / 2 + (edge * scale)}
                             Q ${viewboxWidth / 2},${viewboxHeight / 2 + (center * scale) + curve} 0,${viewboxHeight / 2 + (edge * scale)}
                             Z`}
                        fill="hsl(var(--accent) / 0.1)"
                        stroke="hsl(var(--accent))"
                        strokeWidth="0.5"
                    />

                    <line x1={viewboxWidth/2} y1={viewboxHeight/2 - center*scale} x2={viewboxWidth/2} y2={viewboxHeight/2 + center*scale} stroke="hsl(var(--primary))" strokeWidth="0.25" strokeDasharray="1 1" />
                    <text x={viewboxWidth/2 + 2} y={viewboxHeight/2} fill="hsl(var(--foreground))" fontSize="3" textAnchor="start" dominantBaseline="middle">{center.toFixed(1)}mm</text>

                    <line x1={1} y1={viewboxHeight/2 - edge*scale} x2={1} y2={viewboxHeight/2 + edge*scale} stroke="hsl(var(--primary))" strokeWidth="0.25" strokeDasharray="1 1" />
                    <text x={3} y={viewboxHeight/2} fill="hsl(var(--foreground))" fontSize="3" textAnchor="start" dominantBaseline="middle">{edge.toFixed(1)}mm</text>
                </svg>
            </div>
        )
    }, [edge, center, diameter]);

    return memoizedDiagram;
}

export default function EdgeThicknessPage() {
  const [result, setResult] = useState<{ edgeThickness: number; centerThickness: number; diameter: number } | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      power: -2.0,
      index: 1.586,
      diameter: 70,
      centerThickness: 1.5,
    },
  });

  const powerValue = form.watch('power');

  function onSubmit(values: FormValues) {
    const { power, index, diameter, centerThickness } = values;

    if (power === 0) {
        setResult({ edgeThickness: centerThickness, centerThickness, diameter });
        return;
    }

    const radius = Math.abs((index - 1) / power) * 1000;
    const semiDiameter = diameter / 2;

    if (radius <= semiDiameter) {
        toast({
            variant: "destructive",
            title: "Invalid Calculation",
            description: "The lens power is too high for the given diameter."
        });
        setResult(null);
        return;
    }

    const sag = radius - Math.sqrt(Math.pow(radius, 2) - Math.pow(semiDiameter, 2));
    const edgeThickness = sag + centerThickness;

    setResult({ edgeThickness, centerThickness, diameter });
  }

  return (
    <ToolPageLayout
      title="Edge Thickness Calculator"
      description="Calculate and visualize the edge thickness for a minus-power lens."
    >
        <Card>
          <CardHeader>
            <CardTitle>Enter Parameters for a Minus Lens</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="power"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sphere Power (D): {powerValue.toFixed(2)}</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                            <Slider
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                min={-20}
                                max={0}
                                step={0.25}
                                className="[--slider-connect-color:hsl(var(--primary))]"
                            />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-6 sm:grid-cols-3">
                    <FormField
                    control={form.control}
                    name="index"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Refractive Index (n)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.001" placeholder="e.g., 1.586" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="diameter"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Lens Diameter (mm)</FormLabel>
                        <FormControl>
                            <Input type="number" step="1" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="centerThickness"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Center Thickness (mm)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <Button type="submit" className="w-full sm:w-auto">
                  <Calculator className="mr-2 size-4" />
                  Calculate Thickness
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-8">
            {result ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Result & Visualization</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2 items-center">
                        <div className="flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Calculated Edge Thickness</p>
                                <p className="text-5xl font-bold tracking-tight text-accent-foreground">
                                    {result.edgeThickness.toFixed(2)}
                                    <span className="text-3xl font-medium text-muted-foreground"> mm</span>
                                </p>
                            </div>
                        </div>
                        <LensDiagram edge={result.edgeThickness} center={result.centerThickness} diameter={result.diameter} />
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground/80 text-center w-full">
                            Edge Thickness = Sag + Center Thickness
                        </p>
                    </CardFooter>
                </Card>
            ) : (
                <div className="flex min-h-[200px] w-full items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center text-muted-foreground">
                    <p>Results and diagram will be displayed here.</p>
                </div>
            )}
        </div>
    </ToolPageLayout>
  );
}
