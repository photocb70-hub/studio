
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  power: z.coerce.number().min(-20).max(20),
  index: z.coerce.number().min(1.4).max(2.0),
  diameter: z.coerce.number().min(30).max(90),
  centerThickness: z.coerce.number().min(0.1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

const lensMaterials = [
    { name: 'Standard Index', index: 1.498 },
    { name: 'Polycarbonate', index: 1.586 },
    { name: 'Crown Glass', index: 1.523 },
    { name: 'Mid-Index', index: 1.60 },
    { name: 'High-Index (1.67)', index: 1.67 },
    { name: 'High-Index (1.74)', index: 1.74 },
];

const LensDiagram = ({ edgeThickness, centerThickness, isPlusLens }: { edgeThickness: number, centerThickness: number, isPlusLens: boolean }) => {
  const memoizedDiagram = useMemo(() => {
    const plusPath = `M 15,50 C 30,30 70,30 85,50 C 70,70 30,70 15,50 Z`;
    const minusPath = `M 15,35 C 40,45 60,45 85,35 L 85,65 C 60,55 40,55 15,65 Z`;

    return (
      <div className="w-full max-w-[200px] mx-auto p-4 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-auto">
          <path
            d={isPlusLens ? plusPath : minusPath}
            fill="hsl(var(--primary) / 0.2)"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
          {/* Center thickness line */}
          <line x1="50" y1={isPlusLens ? 30 : 45} x2="50" y2={isPlusLens ? 70 : 55} stroke="hsl(var(--foreground) / 0.5)" strokeWidth="0.5" strokeDasharray="2 2" />
          <text x="53" y="52" fontSize="8" fill="hsl(var(--foreground))">{centerThickness.toFixed(1)}mm</text>
          {/* Edge thickness line */}
          <line x1="15" y1={isPlusLens ? 50 - ((70-30)/2) : 35} x2="15" y2={isPlusLens ? 50 + ((70-30)/2) : 65} stroke="hsl(var(--foreground) / 0.5)" strokeWidth="0.5" strokeDasharray="2 2" />
          <text x="12" y="35" fontSize="8" fill="hsl(var(--foreground))" textAnchor="end">{edgeThickness.toFixed(1)}mm</text>
        </svg>
      </div>
    )
  }, [edgeThickness, centerThickness, isPlusLens]);

  return memoizedDiagram;
}

export default function EdgeThicknessPage() {
  const [result, setResult] = useState<{ edgeThickness: number; centerThickness: number; isPlusLens: boolean; } | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      power: 0,
      index: 1.498,
      diameter: 70,
      centerThickness: 2.0,
    },
  });

  const powerValue = form.watch('power');

  function calculateSag(power: number, index: number, diameter: number): number | null {
    if (power === 0) return 0;
    
    const radius = ((index - 1) / power) * 1000; // in mm
    const semiDiameter = diameter / 2;

    if (Math.abs(radius) < semiDiameter) {
        toast({
            variant: "destructive",
            title: "Invalid Calculation",
            description: "The lens power is too high for the given diameter, resulting in an invalid lens shape."
        });
        return null;
    }
    // Sagitta formula: s = r - sqrt(r^2 - y^2)
    const sag = radius - Math.sqrt(Math.pow(radius, 2) - Math.pow(semiDiameter, 2));
    return sag;
  }

  function onSubmit(values: FormValues) {
    const { power, index, diameter, centerThickness } = values;

    const sag = calculateSag(power, index, diameter);

    if (sag === null) {
        setResult(null);
        return;
    }

    let edgeThickness;
    let finalCenterThickness;
    const isPlusLens = power > 0;

    if (isPlusLens) {
      // For plus lenses, center is thicker than the edge.
      // ET = CT - Sag
      const minEdge = 1.0; // A reasonable minimum edge thickness
      finalCenterThickness = sag + minEdge;
      edgeThickness = minEdge;
      
      // If user's desired center thickness is higher, use it and recalculate edge.
      if (centerThickness > finalCenterThickness) {
        finalCenterThickness = centerThickness;
        edgeThickness = finalCenterThickness - sag;
      }
    } else {
      // For minus lenses, edge is thicker than the center.
      // ET = CT + Sag
      finalCenterThickness = centerThickness;
      edgeThickness = finalCenterThickness + Math.abs(sag);
    }
    
    setResult({ edgeThickness, centerThickness: finalCenterThickness, isPlusLens });
  }

  return (
    <ToolPageLayout
      title="Lens Thickness Calculator"
      description="Calculate the approximate edge thickness for a spherical lens."
    >
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enter Lens Parameters</CardTitle>
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
                        <Slider
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            min={-20} max={20} step={0.25}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="index"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Refractive Index (n)</FormLabel>
                          <Select onValueChange={(e) => field.onChange(parseFloat(e))} defaultValue={String(field.value)}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a material" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {lensMaterials.map((material) => (
                                <SelectItem key={material.name} value={String(material.index)}>
                                  {material.name} ({material.index})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                </div>
                 <FormField
                    control={form.control}
                    name="centerThickness"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Minimum Center Thickness (mm)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <Button type="submit" className="w-full sm:w-auto">
                  <Calculator className="mr-2 size-4" />
                  Calculate Thickness
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center">
            {result ? (
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Result & Visualization</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 items-center">
                        <div className="flex flex-col gap-4 text-center">
                           <div>
                                <p className="text-sm text-muted-foreground">Center Thickness</p>
                                <p className="text-3xl font-bold tracking-tight text-primary">
                                    {result.centerThickness.toFixed(2)}
                                    <span className="text-xl font-medium text-muted-foreground"> mm</span>
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Edge Thickness</p>
                                <p className="text-3xl font-bold tracking-tight text-primary">
                                    {result.edgeThickness.toFixed(2)}
                                    <span className="text-xl font-medium text-muted-foreground"> mm</span>
                                </p>
                            </div>
                        </div>
                        <LensDiagram edgeThickness={result.edgeThickness} centerThickness={result.centerThickness} isPlusLens={result.isPlusLens} />
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground/80 text-center w-full">
                            Calculations are an approximation for spherical lenses.
                        </p>
                    </CardFooter>
                </Card>
            ) : (
                <div className="flex min-h-[200px] w-full items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center text-muted-foreground">
                    <p>Results and diagram will be displayed here.</p>
                </div>
            )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
