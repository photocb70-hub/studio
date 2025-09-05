
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';


const frameShapes = {
  round: (size: number) => {
    const r = size / 2;
    // A path for a circle centered at (r, r)
    return `M ${r}, 0 A ${r},${r} 0 1,0 ${r},${size} A ${r},${r} 0 1,0 ${r},0 Z`;
  },
  square: (size: number) => {
    const r = 8; // corner radius
    return `M ${r},0 L ${size-r},0 A ${r},${r} 0 0 1 ${size},${r} L ${size},${size-r} A ${r},${r} 0 0 1 ${size-r},${size} L ${r},${size} A ${r},${r} 0 0 1 0,${size-r} L 0,${r} A ${r},${r} 0 0 1 ${r},0 Z`;
  },
  aviator: (size: number) => {
    const w = size;
    const h = size * 0.8;
     // Centering the aviator shape by translating it
    consttranslateX = 0;
    const translateY = (size - h) / 2;
    return `M ${w*0.5 + translateX},${0 + translateY}
            C ${w*0.1 + translateX},${0 + translateY} ${0 + translateX},${h*0.1 + translateY} ${0 + translateX},${h*0.5 + translateY}
            S ${w*0.1 + translateX},${h + translateY} ${w*0.5 + translateX},${h + translateY}
            S ${w*0.9 + translateX},${h + translateY} ${w + translateX},${h*0.5 + translateY}
            S ${w*0.9 + translateX},${0 + translateY} ${w*0.5 + translateX},${0 + translateY} Z`;
  }
};
const frameShapeNames = Object.keys(frameShapes);

const formSchema = z.object({
  sphere: z.coerce.number(),
  cylinder: z.coerce.number().optional(),
  axis: z.coerce.number().min(0).max(180).optional(),
  index: z.coerce.number().min(1.4).max(2.0),
  diameter: z.coerce.number().min(30).max(90),
  minThickness: z.coerce.number().min(0.1).max(10),
  frameShape: z.enum(frameShapeNames as [string, ...string[]]),
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

const FrameVisualizer = ({ sphere, cylinder, axis, diameter, index, minThickness, frameShape }: FormValues) => {
    const { toast } = useToast();

    const memoizedViz = useMemo(() => {
        const getPowerAtMeridian = (theta: number) => {
            if (!cylinder) return sphere;
            const radAxis = ((axis || 0) * Math.PI) / 180;
            const radTheta = (theta * Math.PI) / 180;
            return sphere + (cylinder || 0) * Math.pow(Math.sin(radTheta - radAxis), 2);
        };

        const calculateThickness = (power: number) => {
            const isPlusLens = power > 0;
            const semiDiameter = diameter / 2;
            
            const baseThickness = minThickness;

            if (power === 0) return baseThickness;

            const radius = Math.abs(((index - 1) / power) * 1000);
            
            if (radius <= semiDiameter) {
                return null;
            }
            
            const sag = radius - Math.sqrt(Math.pow(radius, 2) - Math.pow(semiDiameter, 2));

            if(isPlusLens) {
                // For a plus lens, we calculate center thickness. The minimum thickness is at the edge.
                return sag + baseThickness;
            } else {
                 // For a minus lens, we calculate edge thickness. The minimum thickness is at the center.
                return sag + baseThickness;
            }
        };
        
        // We will visualize thickness at 4 points: 0, 90, 180, 270 degrees on the lens
        const thicknessPoints = [
            { angle: 0, power: getPowerAtMeridian(0) },
            { angle: 90, power: getPowerAtMeridian(90) },
            { angle: 180, power: getPowerAtMeridian(180) },
            { angle: 270, power: getPowerAtMeridian(270) }
        ].map(p => ({
            ...p,
            thickness: calculateThickness(p.power),
            isPlus: p.power > 0,
        }));

        if (thicknessPoints.some(p => p.thickness === null)) {
            toast({
                variant: "destructive",
                title: "Invalid Calculation",
                description: "Lens power is too high for the given diameter. Cannot visualize."
            });
            return <p className="text-destructive text-center p-4">Invalid calculation. Power may be too high for the diameter.</p>;
        }

        const pathData = frameShapes[frameShape as keyof typeof frameShapes](100);

        // Positions for labels (x, y)
        const positions = {
          nasal: { x: -25, y: 50 },
          temporal: { x: 125, y: 50 },
          top: { x: 50, y: -15 },
          bottom: { x: 50, y: 115 },
        };

        return (
            <div className="w-full max-w-sm mx-auto p-4">
                <svg viewBox="-30 -30 160 160" className="w-full h-auto font-sans">
                    {/* Frame Shape */}
                    <path
                        d={pathData}
                        fill="hsl(var(--accent) / 0.05)"
                        stroke="hsl(var(--accent) / 0.5)"
                        strokeWidth="1"
                    />

                    {/* Thickness Labels */}
                    <text x={positions.temporal.x + 5} y={positions.temporal.y} textAnchor="start" dominantBaseline="middle" fontSize="10" fill="hsl(var(--foreground))">{(thicknessPoints[0].thickness ?? 0).toFixed(1)}mm</text>
                    <text x={positions.top.x} y={positions.top.y} textAnchor="middle" dominantBaseline="auto" fontSize="10" fill="hsl(var(--foreground))">{(thicknessPoints[1].thickness ?? 0).toFixed(1)}mm</text>
                    <text x={positions.nasal.x - 5} y={positions.nasal.y} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="hsl(var(--foreground))">{(thicknessPoints[2].thickness ?? 0).toFixed(1)}mm</text>
                    <text x={positions.bottom.x} y={positions.bottom.y} textAnchor="middle" dominantBaseline="hanging" fontSize="10" fill="hsl(var(--foreground))">{(thicknessPoints[3].thickness ?? 0).toFixed(1)}mm</text>
                    
                    {/* Nasal/Temporal Labels */}
                    <text x={positions.temporal.x + 5} y={positions.temporal.y + 12} textAnchor="start" dominantBaseline="middle" fontSize="8" fill="hsl(var(--muted-foreground))">Temporal</text>
                    <text x={positions.nasal.x - 5} y={positions.nasal.y + 12} textAnchor="end" dominantBaseline="middle" fontSize="8" fill="hsl(var(--muted-foreground))">Nasal</text>

                </svg>
            </div>
        );

    }, [sphere, cylinder, axis, diameter, index, minThickness, frameShape, toast]);

    return memoizedViz;
};


export default function LensThicknessPage() {
  const [submittedValues, setSubmittedValues] = useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sphere: 2.50,
      cylinder: -1.50,
      axis: 90,
      index: 1.586,
      diameter: 70,
      minThickness: 1.0,
      frameShape: "round",
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
                                <Input type="number" step="0.25" placeholder="e.g., -1.50" {...field} value={field.value ?? ''} />
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
                                <Input type="number" step="1" placeholder="e.g., 90" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                     <FormField
                        control={form.control}
                        name="frameShape"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Frame Shape</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a frame shape" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {frameShapeNames.map((shape) => (
                                    <SelectItem key={shape} value={shape} className="capitalize">
                                    {shape}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
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
                         <CardDescription>Estimated thickness (mm) at key points. For plus powers, this is center thickness; for minus, edge thickness.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <FrameVisualizer {...submittedValues} />
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
