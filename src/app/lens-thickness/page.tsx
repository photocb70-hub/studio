
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
    return `M ${r},0 A ${r},${r} 0 1,1 ${r},-0.01 Z`;
  },
  square: (size: number) => {
    const r = 8; // corner radius
    return `M ${r},0 L ${size-r},0 A ${r},${r} 0 0 1 ${size},${r} L ${size},${size-r} A ${r},${r} 0 0 1 ${size-r},${size} L ${r},${size} A ${r},${r} 0 0 1 0,${size-r} L 0,${r} A ${r},${r} 0 0 1 ${r},0 Z`;
  },
  aviator: (size: number) => {
    const w = size;
    const h = size * 0.8;
    return `M ${w*0.5},0
            C ${w*0.1},0 ${0},${h*0.1} ${0},${h*0.5}
            S ${w*0.1},${h} ${w*0.5},${h}
            S ${w*0.9},${h} ${w},${h*0.5}
            S ${w*0.9},0 ${w*0.5},0 Z`;
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
            const radAxis = ((axis || 0) * Math.PI) / 180;
            const radTheta = (theta * Math.PI) / 180;
            return sphere + (cylinder || 0) * Math.pow(Math.sin(radTheta - radAxis), 2);
        };

        const calculateThickness = (power: number) => {
            if (power === 0) return minThickness;
            const radius = Math.abs(((index - 1) / power) * 1000);
            const semiDiameter = diameter / 2;
            if (radius <= semiDiameter) {
                // This case should be handled gracefully.
                // We'll return null and check for it.
                return null;
            }
            const sag = radius - Math.sqrt(Math.pow(radius, 2) - Math.pow(semiDiameter, 2));
            const isPlusLens = power > 0;
            return isPlusLens ? sag + minThickness : sag + minThickness;
        };

        const powers = [
            getPowerAtMeridian(0),
            getPowerAtMeridian(45),
            getPowerAtMeridian(90),
            getPowerAtMeridian(135),
        ];

        const thicknesses = powers.map(calculateThickness);

        if (thicknesses.some(t => t === null)) {
            toast({
                variant: "destructive",
                title: "Invalid Calculation",
                description: "Lens power is too high for the given diameter. Cannot visualize."
            });
            return <p className="text-destructive text-center p-4">Invalid calculation. Power may be too high for the diameter.</p>;
        }

        const maxThickness = Math.max(...(thicknesses as number[]));
        const thicknessScale = 100 / maxThickness;

        const pathData = frameShapes[frameShape as keyof typeof frameShapes](100);

        const thicknessPoints = [
            { angle: 0, thickness: thicknesses[0], pos: {x: 100, y: 50} },
            { angle: 45, thickness: thicknesses[1], pos: {x: 85.35, y: 85.35} },
            { angle: 90, thickness: thicknesses[2], pos: {x: 50, y: 100} },
            { angle: 135, thickness: thicknesses[3], pos: {x: 14.65, y: 85.35} },
            { angle: 180, thickness: thicknesses[0], pos: {x: 0, y: 50} },
            { angle: 225, thickness: thicknesses[1], pos: {x: 14.65, y: 14.65} },
            { angle: 270, thickness: thicknesses[2], pos: {x: 50, y: 0} },
            { angle: 315, thickness: thicknesses[3], pos: {x: 85.35, y: 14.65} },
        ];


        return (
            <div className="w-full max-w-sm mx-auto p-4">
                <svg viewBox="-20 -20 140 140" className="w-full h-auto">
                    <path
                        d={pathData}
                        fill="hsl(var(--accent) / 0.05)"
                        stroke="hsl(var(--accent) / 0.5)"
                        strokeWidth="1"
                    />
                    <g className="opacity-70 group-hover:opacity-100 transition-opacity">
                        {thicknessPoints.map(p => (
                            <g key={p.angle}>
                                <circle 
                                    cx={p.pos.x} 
                                    cy={p.pos.y} 
                                    r={(p.thickness || 0) * thicknessScale * 0.15}
                                    fill="hsl(var(--primary) / 0.7)"
                                />
                                <text
                                    x={p.pos.x}
                                    y={p.pos.y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="5"
                                    className="fill-primary-foreground font-semibold"
                                >
                                    {(p.thickness || 0).toFixed(1)}
                                </text>
                            </g>
                        ))}
                    </g>
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
                         <CardDescription>Estimated thickness (mm) at key points on the lens shape.</CardDescription>
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

    