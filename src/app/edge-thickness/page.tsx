
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
  cylinder: z.coerce.number().min(-20).max(20),
  axis: z.coerce.number().min(1).max(180).optional(),
  index: z.coerce.number().min(1.4).max(2.0),
  diameter: z.coerce.number().min(30).max(90),
  thickness: z.coerce.number().min(0.1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

const lensMaterials = [
    { name: 'Standard Index', index: 1.498 },
    { name: 'Polycarbonate', index: 1.586 },
    { name: 'Crown Glass', index: 1.523 },
    { name: 'Mid-Index', index: 1.60 },
    { name: 'High-Index', index: 1.67 },
    { name: 'High-Index', index: 1.74 },
];

const LensDiagram = ({ minEdge, maxEdge, center, diameter }: { minEdge: number; maxEdge: number; center: number; diameter: number }) => {
    const memoizedDiagram = useMemo(() => {
        const viewboxWidth = 120;
        const scale = viewboxWidth / (diameter * 1.2);
        const maxThicknessForScaling = Math.max(minEdge, maxEdge, center, 4);
        const viewboxHeight = maxThicknessForScaling * scale * 3;

        const centerY = viewboxHeight / 2;
        const halfWidth = viewboxWidth / 2;
        
        // Use average edge thickness for a representative shape
        const avgEdgeHeight = ((minEdge + maxEdge) / 2) * scale / 2;
        const centerHeight = center * scale / 2;

        const curveFactor = (maxEdge - center) * scale * 0.1;
        const lensWidth = 100;
        const lensStartX = (viewboxWidth - lensWidth) / 2;
        const lensEndX = lensStartX + lensWidth;

        const path = `M ${lensStartX},${centerY - avgEdgeHeight} Q ${halfWidth},${centerY - centerHeight - curveFactor} ${lensEndX},${centerY - avgEdgeHeight} L ${lensEndX},${centerY + avgEdgeHeight} Q ${halfWidth},${centerY + centerHeight - curveFactor} ${lensStartX},${centerY + avgEdgeHeight} Z`;

        return (
            <div className="w-full max-w-xs mx-auto p-4 flex items-center justify-center">
                <svg viewBox={`0 0 ${viewboxWidth} ${viewboxHeight}`} className="w-full h-auto">
                    {/* Lens Body */}
                    <path
                        d={path}
                        fill="hsl(var(--background))"
                        stroke="hsl(var(--foreground))"
                        strokeWidth="1"
                    />

                    {/* Center thickness line and value */}
                    <line x1={halfWidth} y1={centerY - centerHeight} x2={halfWidth} y2={centerY + centerHeight} stroke="hsl(var(--foreground) / 0.5)" strokeWidth="0.5" strokeDasharray="2 2" />
                    <text x={halfWidth + 3} y={centerY} fontSize="6" fill="hsl(var(--foreground))" textAnchor="start">{center.toFixed(1)}mm</text>
                    
                    {/* Edge thickness annotations */}
                     <g className="text-[6px] font-medium" fill="hsl(var(--foreground))">
                        <line x1={lensStartX} y1={centerY - avgEdgeHeight} x2={lensStartX} y2={centerY + avgEdgeHeight} stroke="hsl(var(--foreground) / 0.5)" strokeWidth="0.5" strokeDasharray="2 2" />
                        <text x={lensStartX - 3} y={centerY - 10} textAnchor="end">Edge (Max): {maxEdge.toFixed(1)}mm</text>
                        <text x={lensStartX - 3} y={centerY + 10} textAnchor="end">Edge (Min): {minEdge.toFixed(1)}mm</text>
                    </g>
                </svg>
            </div>
        )
    }, [minEdge, maxEdge, center, diameter]);

    return memoizedDiagram;
}

export default function EdgeThicknessPage() {
  const [result, setResult] = useState<{ minEdge: number; maxEdge: number; centerThickness: number; diameter: number; } | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sphere: 0,
      cylinder: 0,
      axis: 90,
      index: 1.498,
      diameter: 70,
      thickness: 2.0,
    },
  });

  const sphereValue = form.watch('sphere');
  const cylinderValue = form.watch('cylinder');
  const powerIsPlus = (sphereValue + (cylinderValue > 0 ? cylinderValue : 0)) > 0;

  function calculateSag(power: number, index: number, diameter: number): number | null {
    if (power === 0) return 0;
    
    const radius = Math.abs((index - 1) / power) * 1000;
    const semiDiameter = diameter / 2;

    if (radius <= semiDiameter) {
        toast({
            variant: "destructive",
            title: "Invalid Calculation",
            description: `The power ${power.toFixed(2)}D is too high for the given diameter.`
        });
        return null;
    }
    return radius - Math.sqrt(Math.pow(radius, 2) - Math.pow(semiDiameter, 2));
  }

  function onSubmit(values: FormValues) {
    const { sphere, cylinder, axis, index, diameter, thickness } = values;

    const power1 = sphere;
    const power2 = sphere + cylinder;

    const sag1 = calculateSag(power1, index, diameter);
    const sag2 = calculateSag(power2, index, diameter);

    if (sag1 === null || sag2 === null) {
        setResult(null);
        return;
    }

    let centerThickness, minEdge, maxEdge;

    if (!cylinder || cylinder === 0) {
      // Spherical lens
      if (sphere < 0) { // Minus lens
        centerThickness = thickness;
        minEdge = maxEdge = sag1 + centerThickness;
      } else { // Plus lens or plano
        minEdge = maxEdge = thickness;
        centerThickness = sag1 + minEdge;
      }
    } else {
      // Toric lens
      const sags = [sag1, sag2].sort((a,b) => a - b);
      const minSag = sags[0];
      const maxSag = sags[1];
      
      if (powerIsPlus) { // Plus cyl form or mixed
        minEdge = thickness;
        centerThickness = maxSag + minEdge;
        maxEdge = centerThickness - minSag;

      } else { // Minus cyl form
        centerThickness = thickness;
        minEdge = minSag + centerThickness;
        maxEdge = maxSag + centerThickness;
      }
    }
    
    setResult({ minEdge, maxEdge, centerThickness, diameter });
  }

  return (
    <ToolPageLayout
      title="Lens Thickness Calculator"
      description="Calculate edge and center thickness for spherical and toric lenses."
    >
        <Card>
          <CardHeader>
            <CardTitle>Enter Lens Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="sphere"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sphere Power (D): {sphereValue.toFixed(2)}</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="cylinder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cylinder Power (D): {cylinderValue.toFixed(2)}</FormLabel>
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
                </div>
                <div className="grid gap-6 sm:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="axis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Axis (°)</FormLabel>
                          <FormControl><Input type="number" min="1" max="180" placeholder="e.g., 90" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="index"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Refractive Index (n)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a material" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {lensMaterials.map((material) => (
                                <SelectItem key={material.name + material.index} value={String(material.index)}>
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
                    <FormField
                    control={form.control}
                    name="thickness"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{powerIsPlus ? 'Edge' : 'Center'} Thickness (mm)</FormLabel>
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
                        <div className="flex flex-col items-center justify-center gap-6 text-center">
                           <div>
                                <p className="text-sm text-muted-foreground">Center Thickness</p>
                                <p className="text-4xl font-bold tracking-tight text-accent-foreground">
                                    {result.centerThickness.toFixed(2)}
                                    <span className="text-2xl font-medium text-muted-foreground"> mm</span>
                                </p>
                            </div>
                             <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Min Edge</p>
                                    <p className="text-2xl font-bold tracking-tight text-accent-foreground">
                                        {result.minEdge.toFixed(2)}
                                        <span className="text-lg font-medium text-muted-foreground"> mm</span>
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Max Edge</p>
                                    <p className="text-2xl font-bold tracking-tight text-accent-foreground">
                                        {result.maxEdge.toFixed(2)}
                                        <span className="text-lg font-medium text-muted-foreground"> mm</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <LensDiagram minEdge={result.minEdge} maxEdge={result.maxEdge} center={result.centerThickness} diameter={result.diameter} />
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground/80 text-center w-full">
                            Thickness = Sag + Minimum Thickness. Calculations are based on the principal meridians.
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

    

    