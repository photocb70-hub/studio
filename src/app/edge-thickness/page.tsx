
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
  sphere: z.coerce.number().min(-20).max(20),
  cylinder: z.coerce.number().min(-10).max(0),
  axis: z.coerce.number().min(1).max(180).optional(),
  index: z.coerce.number().min(1.4).max(2.0),
  diameter: z.coerce.number().min(30).max(90),
  centerThickness: z.coerce.number().min(0.1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

const lensMaterials = [
    { name: 'Standard Index (1.50)', index: 1.498 },
    { name: 'Polycarbonate (1.59)', index: 1.586 },
    { name: 'Crown Glass', index: 1.523 },
    { name: 'Mid-Index (1.60)', index: 1.60 },
    { name: 'High-Index (1.67)', index: 1.67 },
    { name: 'High-Index (1.74)', index: 1.74 },
];

const LensDiagram = ({ minThickness, maxThickness, centerThickness }: { minThickness: number, maxThickness: number, centerThickness: number }) => {
  const isPlusLens = (minThickness + maxThickness) / 2 < centerThickness;
  
  const memoizedDiagram = useMemo(() => {
    const plusPath = `M 20,50 C 35,30 75,30 90,50 C 75,70 35,70 20,50 Z`;
    const minusPath = `M 20,35 C 45,45 65,45 90,35 L 90,65 C 65,55 45,55 20,65 Z`;

    return (
      <div className="w-full max-w-[250px] mx-auto p-4 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-auto">
          <path
            d={isPlusLens ? plusPath : minusPath}
            fill="hsl(var(--primary) / 0.1)"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
          />
          {/* Center thickness */}
          <line x1="55" y1={isPlusLens ? 30 : 45} x2="55" y2={isPlusLens ? 70 : 55} stroke="hsl(var(--foreground) / 0.5)" strokeWidth="0.5" strokeDasharray="2 2" />
          <text x="58" y="52" fontSize="7" fill="hsl(var(--foreground))">{centerThickness.toFixed(1)}mm</text>
          
          {/* Edge thickness lines */}
          <g transform="rotate(90 55 50)">
            <line x1="20" y1="50" x2="90" y2="50" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="0.5" strokeDasharray="2 2"/>
            <text x="15" y="53" fontSize="7" fill="hsl(var(--foreground))" textAnchor="end" dominantBaseline="middle">Min: {minThickness.toFixed(1)}mm</text>
          </g>
          <g>
            <line x1="20" y1="50" x2="90" y2="50" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="15" y="38" fontSize="7" fill="hsl(var(--foreground))" textAnchor="end" dominantBaseline="middle">Max: {maxThickness.toFixed(1)}mm</text>
          </g>
        </svg>
      </div>
    )
  }, [minThickness, maxThickness, centerThickness, isPlusLens]);

  return memoizedDiagram;
}

export default function EdgeThicknessPage() {
  const [result, setResult] = useState<{ minThickness: number; maxThickness: number; centerThickness: number; } | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sphere: 0,
      cylinder: 0,
      axis: 90,
      index: 1.498,
      diameter: 70,
      centerThickness: 2.0,
    },
  });

  const sphereValue = form.watch('sphere');
  const cylinderValue = form.watch('cylinder');
  const invertedCylinderValue = cylinderValue !== undefined ? Math.abs(cylinderValue) : 0;


  function calculateSag(power: number, index: number, diameter: number): number | null {
    if (Math.abs(power) < 0.01) return 0;
    
    const radius = ((index - 1) / power) * 1000; // in mm
    const semiDiameter = diameter / 2;

    if (Math.abs(radius) < semiDiameter) {
      toast({
        variant: 'destructive',
        title: 'Invalid Calculation',
        description: `Power (${power.toFixed(2)}D) is too high for the diameter, resulting in an invalid lens shape.`,
      });
      return null;
    }
    // Sag = r - sqrt(r^2 - (d/2)^2)
    const sag = Math.abs(radius) - Math.sqrt(Math.pow(Math.abs(radius), 2) - Math.pow(semiDiameter, 2));
    // Return sag with the correct sign based on power
    return power > 0 ? sag : -sag;
  }
  
  function onSubmit(values: FormValues) {
    const { sphere, cylinder = 0, axis = 90, index, diameter, centerThickness } = values;

    const cyl = cylinder || 0;
    // Power in the two principal meridians
    const power1 = sphere;
    const power2 = sphere + cyl;

    const sag1 = calculateSag(power1, index, diameter);
    const sag2 = calculateSag(power2, index, diameter);
    
    if (sag1 === null || sag2 === null) {
      setResult(null);
      return;
    }

    let finalCenterThickness = centerThickness;
    
    // For a plus lens, ensure the thinnest edge is not below a minimum (e.g. 1.0mm)
    if (sphere >= 0) {
      const minEdgeThicknessAtPeriphery = 1.0;
      // Tentative edge thicknesses
      const tempEt1 = centerThickness - sag1;
      const tempEt2 = centerThickness - sag2;
      const thinnestEdge = Math.min(tempEt1, tempEt2);
      
      if (thinnestEdge < minEdgeThicknessAtPeriphery) {
        finalCenterThickness += minEdgeThicknessAtPeriphery - thinnestEdge;
      }
    }
    
    // Final edge thickness calculations based on the (potentially adjusted) center thickness
    const thickness1 = finalCenterThickness - sag1;
    const thickness2 = finalCenterThickness - sag2;

    const maxThickness = Math.max(thickness1, thickness2);
    const minThickness = Math.min(thickness1, thickness2);

    setResult({ minThickness, maxThickness, centerThickness: finalCenterThickness });
  }

  const formatPower = (power?: number) => {
    if (power === undefined || power === null) return '0.00';
    return (power > 0 ? '+' : '') + power.toFixed(2);
  }

  return (
    <ToolPageLayout
      title="Lens Thickness Calculator"
      description="Calculate the approximate edge thickness for a sphero-cylindrical lens."
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
                  name="sphere"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sphere Power (D): {formatPower(sphereValue)}</FormLabel>
                      <FormControl>
                        <Slider
                            value={[field.value ?? 0]}
                            onValueChange={(value) => field.onChange(value[0])}
                            min={-20} max={20} step={0.25}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4">
                   <FormField
                    control={form.control}
                    name="cylinder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cylinder Power (D): {formatPower(cylinderValue)}</FormLabel>
                        <FormControl>
                          <Slider
                              value={[invertedCylinderValue]}
                              onValueChange={(value) => field.onChange(-value[0])}
                              min={0} max={10} step={0.25}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="axis" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Axis (°)</FormLabel>
                        <FormControl><Input type="number" min="1" max="180" placeholder="e.g., 90" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
                </div>

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
                                  {material.name}
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
                                <p className="text-sm text-muted-foreground">Min Edge Thickness</p>
                                <p className="text-3xl font-bold tracking-tight text-primary">
                                    {result.minThickness.toFixed(2)}
                                    <span className="text-xl font-medium text-muted-foreground"> mm</span>
                                </p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">Max Edge Thickness</p>
                                <p className="text-3xl font-bold tracking-tight text-primary">
                                    {result.maxThickness.toFixed(2)}
                                    <span className="text-xl font-medium text-muted-foreground"> mm</span>
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Final Center Thickness</p>
                                <p className="text-3xl font-bold tracking-tight text-primary">
                                    {result.centerThickness.toFixed(2)}
                                    <span className="text-xl font-medium text-muted-foreground"> mm</span>
                                </p>
                            </div>
                        </div>
                        <LensDiagram minThickness={result.minThickness} maxThickness={result.maxThickness} centerThickness={result.centerThickness} />
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground/80 text-center w-full">
                            Calculations are an approximation. Assumes minus cylinder format.
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

    