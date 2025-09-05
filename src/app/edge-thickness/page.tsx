
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
  thickness: z.coerce.number().min(0.1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

const lensMaterials = [
    { name: 'Standard Index', index: 1.498 },
    { name: 'Crown Glass', index: 1.523 },
    { name: 'Polycarbonate', index: 1.586 },
    { name: 'Mid-Index', index: 1.60 },
    { name: 'High-Index', index: 1.67 },
    { name: 'High-Index', index: 1.74 },
];

const LensDiagram = ({ edge, center, diameter, power }: { edge: number; center: number; diameter: number, power: number }) => {
    const memoizedDiagram = useMemo(() => {
        const viewboxWidth = 100;
        const scale = viewboxWidth / diameter;
        
        // Determine the maximum thickness for scaling the height, with a minimum value for plano lenses
        const maxThicknessForScaling = Math.max(edge, center, 3);
        const viewboxHeight = maxThicknessForScaling * scale * 2.5;

        // Simplified curve calculation based on power
        // A more pronounced curve for higher powers
        const curveFactor = power * scale * 0.4;

        const centerY = viewboxHeight / 2;
        const halfWidth = viewboxWidth / 2;
        
        const edgeHeight = edge * scale;
        const centerHeight = center * scale;

        // Path for the front surface
        const frontCurvePath = `M 0,${centerY - edgeHeight} Q ${halfWidth},${centerY - centerHeight - curveFactor} ${viewboxWidth},${centerY - edgeHeight}`;
        // Path for the back surface (often flat for simplicity, but we can make it curved too)
        const backCurvePath = `M 0,${centerY + edgeHeight} Q ${halfWidth},${centerY + centerHeight - curveFactor} ${viewboxWidth},${centerY + edgeHeight}`;

        const lensPath = `${frontCurvePath} L ${viewboxWidth},${centerY + edgeHeight} ${backCurvePath.replace('M 0,','L ')} Z`;

        return (
            <div className="w-full max-w-sm mx-auto p-4 flex items-center justify-center">
                <svg viewBox={`0 0 ${viewboxWidth} ${viewboxHeight}`} className="w-full h-auto">
                    <path
                        d={lensPath}
                        fill="hsl(var(--accent) / 0.2)"
                        stroke="hsl(var(--accent))"
                        strokeWidth="0.75"
                    />

                    {/* Center thickness line and label */}
                    <line x1={halfWidth} y1={centerY - centerHeight} x2={halfWidth} y2={centerY + centerHeight} stroke="hsl(var(--foreground) / 0.5)" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
                    <text x={halfWidth + 3} y={centerY} fill="hsl(var(--foreground))" fontSize="4" textAnchor="start" dominantBaseline="middle">{center.toFixed(1)}mm</text>

                    {/* Edge thickness line and label */}
                    <line x1={2} y1={centerY - edgeHeight} x2={2} y2={centerY + edgeHeight} stroke="hsl(var(--foreground) / 0.5)" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
                    <text x={5} y={centerY} fill="hsl(var(--foreground))" fontSize="4" textAnchor="start" dominantBaseline="middle">{edge.toFixed(1)}mm</text>
                </svg>
            </div>
        )
    }, [edge, center, diameter, power]);

    return memoizedDiagram;
}

export default function EdgeThicknessPage() {
  const [result, setResult] = useState<{ edgeThickness: number; centerThickness: number; diameter: number, power: number } | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      power: 0,
      index: 1.498,
      diameter: 70,
      thickness: 1.5,
    },
  });

  const powerValue = form.watch('power');

  function onSubmit(values: FormValues) {
    const { power, index, diameter, thickness } = values;

    if (power === 0) {
        setResult({ edgeThickness: thickness, centerThickness: thickness, diameter, power });
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

    let edgeThickness, centerThickness;

    if (power < 0) { // Minus lens
      centerThickness = thickness;
      edgeThickness = sag + centerThickness;
    } else { // Plus lens
      edgeThickness = thickness;
      centerThickness = sag + edgeThickness;
    }
    
    setResult({ edgeThickness, centerThickness, diameter, power });
  }

  return (
    <ToolPageLayout
      title="Lens Thickness Calculator"
      description="Calculate edge and center thickness for plus and minus lenses."
    >
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
                            min={-20}
                            max={20}
                            step={0.25}
                        />
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
                        <FormLabel>{powerValue < 0 ? 'Center' : 'Edge'} Thickness (mm)</FormLabel>
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
                        <div className="flex flex-col items-center justify-center gap-4 text-center">
                            <div>
                                <p className="text-sm text-muted-foreground">Edge Thickness</p>
                                <p className="text-4xl font-bold tracking-tight text-accent-foreground">
                                    {result.edgeThickness.toFixed(2)}
                                    <span className="text-2xl font-medium text-muted-foreground"> mm</span>
                                </p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">Center Thickness</p>
                                <p className="text-4xl font-bold tracking-tight text-accent-foreground">
                                    {result.centerThickness.toFixed(2)}
                                    <span className="text-2xl font-medium text-muted-foreground"> mm</span>
                                </p>
                            </div>
                        </div>
                        <LensDiagram edge={result.edgeThickness} center={result.centerThickness} diameter={result.diameter} power={result.power}/>
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground/80 text-center w-full">
                            Thickness = Sag + Minimum Thickness
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
