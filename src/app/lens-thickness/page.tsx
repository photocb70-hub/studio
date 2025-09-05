
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
    const memoizedViz = useMemo(() => {
        const getPowerAtMeridian = (theta: number) => {
            if (!cylinder || cylinder === 0) return sphere;
            const radAxis = ((axis || 0) * Math.PI) / 180;
            const radTheta = (theta * Math.PI) / 180;
            return sphere + cylinder * Math.pow(Math.sin(radTheta - radAxis), 2);
        };

        const calculateThickness = (power: number) => {
            const isPlusLens = power > 0;
            const semiDiameter = diameter / 2;
            
            if (power === 0) return minThickness;

            const radius = Math.abs(((index - 1) / power) * 1000);
            
            if (radius <= semiDiameter) return null;
            
            const sag = radius - Math.sqrt(Math.pow(radius, 2) - Math.pow(semiDiameter, 2));

            if (isPlusLens) { // Center thickness
                return sag + minThickness;
            } else { // Edge thickness
                return sag + minThickness;
            }
        };

        const spherePower = getPowerAtMeridian(axis ?? 0);
        const cylinderPower = getPowerAtMeridian((axis ?? 0) + 90);

        const sphereThickness = calculateThickness(spherePower) ?? (sphere > 0 ? minThickness : 20);
        const cylinderThickness = calculateThickness(cylinderPower) ?? (sphere > 0 ? minThickness : 20);

        const isPlusLens = sphere >= 0;
        const centerThickness = isPlusLens ? Math.max(sphereThickness, cylinderThickness) : minThickness;
        const edgeThickness1 = !isPlusLens ? sphereThickness : minThickness;
        const edgeThickness2 = !isPlusLens ? cylinderThickness : minThickness;
        
        const maxDim = Math.max(edgeThickness1, edgeThickness2, centerThickness, 5) * 1.2;
        const size = 200;
        const center = size / 2;
        const scale = size / (maxDim * 2.5);

        return (
            <div className="flex items-center justify-center relative">
                <div className="absolute top-1/2 -translate-y-1/2 -left-4 text-xs text-muted-foreground">Nasal</div>
                <div className="absolute top-1/2 -translate-y-1/2 -right-4 text-xs text-muted-foreground">Temple</div>
                <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-xs" >
                    {/* Lens Outline */}
                    <circle cx={center} cy={center} r={diameter / 2 * (size / (diameter * 1.1))} fill="hsl(var(--accent) / 0.05)" stroke="hsl(var(--accent) / 0.5)" strokeWidth="1" />

                    <g transform={`rotate(${axis || 0} ${center} ${center})`}>
                        {/* Sphere Meridian */}
                        <line x1={center} y1={center - (edgeThickness1 * scale)} x2={center} y2={center + (edgeThickness1 * scale)} stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.5" strokeDasharray="2 2" />
                        <text x={center + 5} y={center - (edgeThickness1 * scale) - 5} fontSize="10" fill="hsl(var(--foreground))">{edgeThickness1.toFixed(2)}mm</text>
                        <text x={center + 5} y={center + (edgeThickness1 * scale) + 15} fontSize="10" fill="hsl(var(--foreground))">{edgeThickness1.toFixed(2)}mm</text>
                        
                        {/* Cylinder Meridian */}
                        <line x1={center - (edgeThickness2 * scale)} y1={center} x2={center + (edgeThickness2 * scale)} y2={center} stroke="hsl(var(--foreground) / 0.3)" strokeWidth="0.5" strokeDasharray="2 2" />
                        <text x={center - (edgeThickness2 * scale) - 35} y={center + 5} fontSize="10" fill="hsl(var(--foreground))">{edgeThickness2.toFixed(2)}mm</text>
                        <text x={center + (edgeThickness2 * scale) + 5} y={center + 5} fontSize="10" fill="hsl(var(--foreground))">{edgeThickness2.toFixed(2)}mm</text>
                        
                        {/* Center Thickness */}
                        <circle cx={center} cy={center} r={centerThickness * scale * 0.5} fill="hsl(var(--primary) / 0.8)" />
                        <text x={center} y={center} fontSize="10" fill="hsl(var(--primary-foreground))" textAnchor="middle" dy=".3em">{centerThickness.toFixed(2)}</text>
                    </g>
                </svg>
            </div>
        );

    }, [sphere, cylinder, axis, diameter, index, minThickness]);

    return memoizedViz;
};


export default function LensThicknessPage() {
  const [result, setResult] = useState<{max: number; min: number} | null>(null);
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
    const { sphere, cylinder, axis, index, diameter, minThickness } = values;

    const getPowerAtMeridian = (theta: number) => {
        if (!cylinder || cylinder === 0) return sphere;
        const radAxis = ((axis || 0) * Math.PI) / 180;
        const radTheta = (theta * Math.PI) / 180;
        return sphere + cylinder * Math.pow(Math.sin(radTheta - radAxis), 2);
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
            return sag + baseThickness;
        } else {
            return sag + baseThickness;
        }
    };
    
    const spherePower = getPowerAtMeridian(axis ?? 0);
    const cylinderPower = getPowerAtMeridian((axis ?? 0) + 90);

    const sphereThickness = calculateThickness(spherePower);
    const cylinderThickness = calculateThickness(cylinderPower);

    if (sphereThickness === null || cylinderThickness === null) {
      setResult(null);
       toast({
          variant: "destructive",
          title: "Invalid Calculation",
          description: "Lens power is too high for the given diameter."
      });
      return;
    }

    if (sphere >= 0) { // Plus lens
      setResult({
        max: Math.max(sphereThickness, cylinderThickness),
        min: minThickness,
      });
    } else { // Minus lens
      setResult({
        max: Math.max(sphereThickness, cylinderThickness),
        min: minThickness,
      });
    }
  }

  const sphereValue = form.watch('sphere');
  const formValues = form.watch();

  return (
    <ToolPageLayout
      title="Lens Thickness Calculator"
      description="Estimate lens thickness for spherical and spherocylindrical lenses."
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
                            <FormLabel>Axis (° optional)</FormLabel>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
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
                  Calculate
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="mt-8">
          <Card>
              <CardHeader>
                  <CardTitle>Lens Visualization</CardTitle>
                  <CardDescription>A 2D representation of the lens thickness.</CardDescription>
              </CardHeader>
              <CardContent>
                  {result ? (
                      <LensVisualizer {...formValues} />
                  ) : (
                      <div className="flex min-h-[250px] w-full items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center text-muted-foreground">
                          <p>Submit a prescription to see the visualization.</p>
                      </div>
                  )}
              </CardContent>
              {result && (
                <CardFooter className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-sm text-muted-foreground">Maximum Thickness</p>
                        <p className="text-2xl font-bold">{result.max.toFixed(2)} mm</p>
                    </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Minimum Thickness</p>
                        <p className="text-2xl font-bold">{result.min.toFixed(2)} mm</p>
                    </div>
                </CardFooter>
              )}
          </Card>
        </div>
    </ToolPageLayout>
  );
}

    