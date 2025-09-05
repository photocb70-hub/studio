
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
import { Calculator, PlusCircle, MinusCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';


const formSchema = z.object({
  sphere: z.coerce.number(),
  cylinder: z.coerce.number().optional(),
  axis: z.coerce.number().min(0).max(180).optional(),
  index: z.coerce.number().min(1.4).max(2.0),
  diameter: z.coerce.number().min(30).max(90),
  minThickness: z.coerce.number().min(0.1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

const materialIndices = [
    { name: 'CR-39', value: 1.498 },
    { name: 'Trivex', value: 1.53 },
    { name: 'Polycarbonate', value: 1.586 },
    { name: 'High-Index 1.60', value: 1.60 },
    { name: 'High-Index 1.67', value: 1.67 },
    { name: 'High-Index 1.74', value: 1.74 },
];

const LensVisualizer = ({ sphere, cylinder, axis, diameter, index, minThickness }: FormValues) => {
    const calculateThickness = (power: number) => {
        if (power === 0) return minThickness;
        const radius = Math.abs(((index - 1) / power) * 1000);
        const semiDiameter = diameter / 2;
        if (radius <= semiDiameter) return null;
        const sag = radius - Math.sqrt(Math.pow(radius, 2) - Math.pow(semiDiameter, 2));
        return sag + minThickness;
    };

    const power1 = sphere;
    const power2 = sphere + (cylinder || 0);

    const thickness1 = calculateThickness(power1);
    const thickness2 = calculateThickness(power2);

    if (thickness1 === null || thickness2 === null) {
        return <p className="text-destructive text-center">Invalid calculation. Power may be too high for the diameter.</p>;
    }
    
    const isPlusLens1 = power1 > 0;
    const isPlusLens2 = power2 > 0;

    const center1 = isPlusLens1 ? thickness1 : minThickness;
    const edge1 = isPlusLens1 ? minThickness : thickness1;
    const center2 = isPlusLens2 ? thickness2 : minThickness;
    const edge2 = isPlusLens2 ? minThickness : thickness2;
    
    const axis1 = axis || 0;
    const axis2 = (axis1 + 90) % 180;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center justify-items-center">
            <LensDiagram 
                power={power1}
                axis={axis1}
                center={center1}
                edge={edge1}
                diameter={diameter}
            />
            <LensDiagram 
                power={power2}
                axis={axis2}
                center={center2}
                edge={edge2}
                diameter={diameter}
            />
        </div>
    );
};

const LensDiagram = ({ power, axis, center, edge, diameter }: { power: number; axis: number; center: number; edge: number; diameter: number; }) => {
    const viewboxWidth = 100;
    const maxThickness = Math.max(edge, center, 5); 
    const scale = viewboxWidth / diameter;
    const viewboxHeight = maxThickness * scale * 2.5;

    const curveFactor = power * scale * 0.5;

    return (
        <Card className="w-full bg-card/50 overflow-hidden">
            <CardHeader className="p-4 border-b">
                <CardTitle className="text-base text-center">
                    {power.toFixed(2)} D @ {axis}°
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                 <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">{power > 0 ? "Center Thickness" : "Edge Thickness"}</p>
                    <p className="text-3xl font-bold tracking-tight text-accent-foreground">
                        {(power > 0 ? center : edge).toFixed(2)}
                        <span className="text-xl font-medium text-muted-foreground"> mm</span>
                    </p>
                </div>
                <div className="w-full max-w-sm mx-auto">
                    <svg viewBox={`0 0 ${viewboxWidth} ${viewboxHeight}`} className="w-full h-auto">
                        <path
                            d={`M 0,${viewboxHeight / 2 - (edge * scale)}
                                Q ${viewboxWidth / 2},${viewboxHeight / 2 - (center * scale) - curveFactor} ${viewboxWidth},${viewboxHeight / 2 - (edge * scale)}
                                L ${viewboxWidth},${viewboxHeight / 2 + (edge * scale)}
                                Q ${viewboxWidth / 2},${viewboxHeight / 2 + (center * scale) + curveFactor} 0,${viewboxHeight / 2 + (edge * scale)}
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
            </CardContent>
        </Card>
    );
}


export default function LensThicknessPage() {
  const [submittedValues, setSubmittedValues] = useState<FormValues | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sphere: 2.50,
      cylinder: -1.50,
      axis: 90,
      index: 1.586,
      diameter: 70,
      minThickness: 1.0,
    },
  });

  function onSubmit(values: FormValues) {
    setSubmittedValues(values);
  }

  const sphereValue = form.watch('sphere');

  return (
    <ToolPageLayout
      title="Lens Thickness Calculator"
      description="Estimate and visualize lens thickness for spherical and spherocylindrical lenses."
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
                  name="sphere"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sphere Power (D): {sphereValue.toFixed(2)}</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                            <Slider
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                min={-20}
                                max={20}
                                step={0.25}
                                className="flex-1"
                            />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <FormField
                        control={form.control}
                        name="cylinder"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Cylinder Power (D, optional)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.25" placeholder="e.g., -1.50" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="axis"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Axis (°, optional)</FormLabel>
                            <FormControl>
                                <Input type="number" step="1" placeholder="e.g., 90" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                 <FormField
                    control={form.control}
                    name="index"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Refractive Index (n)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseFloat(value))} defaultValue={String(field.value)}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a material" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {materialIndices.map((mat) => (
                                <SelectItem key={mat.name} value={String(mat.value)}>
                                {mat.name} ({mat.value})
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    name="minThickness"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Minimum Thickness (mm)</FormLabel>
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
                  Calculate & Visualize
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="mt-8">
            {submittedValues ? (
                 <Card>
                    <CardHeader>
                        <CardTitle>Thickness Visualization</CardTitle>
                         <CardDescription>Cross-sections of the two principal meridians.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <LensVisualizer {...submittedValues} />
                    </CardContent>
                </Card>
            ) : (
                <div className="flex h-full min-h-[200px] w-full items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center text-muted-foreground">
                    <p>Results and visualization will be displayed here.</p>
                </div>
            )}
        </div>
    </ToolPageLayout>
  );
}

    