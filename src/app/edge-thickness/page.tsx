
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
import { Calculator, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { PowerAdjuster } from '@/components/power-adjuster';

const formSchema = z.object({
  sphere: z.coerce.number().min(-20).max(20),
  cylinder: z.coerce.number().min(-10).max(0),
  axis: z.coerce.number().min(1).max(180),
  index1: z.coerce.number().min(1.4).max(2.0),
  index2: z.coerce.number().min(1.4).max(2.0).optional(),
  compareMode: z.boolean().default(false),
  diameter: z.coerce.number().min(30).max(90),
  centerThickness: z.coerce.number().min(0.1).max(10),
  eye: z.enum(['OD', 'OS']),
});

type FormValues = z.infer<typeof formSchema>;

const lensMaterials = [
    { name: 'Standard (1.50)', index: 1.498 },
    { name: 'Crown Glass', index: 1.523 },
    { name: 'Polycarb (1.59)', index: 1.586 },
    { name: 'Mid-Index (1.60)', index: 1.60 },
    { name: 'High-Index (1.67)', index: 1.67 },
    { name: 'High-Index (1.74)', index: 1.74 },
];

const diameterOptions = [55, 60, 65, 70, 75, 80];

const LensDiagram = ({ nasalX, templeX, eye, centerThickness, minThickness, maxThickness, maxAxis, minAxis, isPlusLens, label }: { nasalX: number, templeX: number, eye: 'OD' | 'OS', centerThickness: number, minThickness: number, maxThickness: number, maxAxis: number, minAxis: number, isPlusLens: boolean, label?: string }) => {
  const plusPath = `M 20,50 C 35,30 75,30 90,50 C 75,70 35,70 20,50 Z`;
  const minusPath = `M 20,35 C 45,45 65,45 90,35 L 90,65 C 65,55 45,55 20,65 Z`;
  const etRotation = `rotate(${maxAxis} 50 50)`;

  const maxAngleRad = (maxAxis - 90) * Math.PI / 180;
  const minAngleRad = (minAxis - 90) * Math.PI / 180;

  const maxTextX = 50 + Math.cos(maxAngleRad) * 58;
  const maxTextY = 50 + Math.sin(maxAngleRad) * 58;
  const minTextX = 50 + Math.cos(minAngleRad) * 58;
  const minTextY = 50 + Math.sin(minAngleRad) * 58;

  return (
    <div className="w-full max-w-[250px] mx-auto p-2 flex flex-col items-center justify-center gap-4">
      {label && <Badge variant="outline" className="mb-2 font-bold">{label}</Badge>}
      <div className="w-full">
          <svg viewBox="0 0 110 100" className="w-full h-auto overflow-visible">
              <path
                  d={isPlusLens ? plusPath : minusPath}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.5"
              />
              {isPlusLens ? (
                <>
                  <line x1="55" y1={30} x2="55" y2={70} stroke="hsl(var(--foreground) / 0.5)" strokeWidth="0.5" />
                  <text x="72" y="15" textAnchor="start" dominantBaseline="middle" fontSize="9" fill="hsl(var(--foreground))" className="font-bold">{centerThickness.toFixed(2)}mm CT</text>
                </>
              ) : (
                  <>
                  <line x1="20" y1="50" x2="10" y2="50" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="0.5" />
                  <text x="8" y="50" textAnchor="end" dominantBaseline="middle" fontSize="9" fill="hsl(var(--foreground))" className="font-bold">{minThickness.toFixed(2)}mm</text>
                </>
              )}
          </svg>
      </div>
      <div className="w-full">
            <svg viewBox="-20 -20 140 140" className="w-full h-auto overflow-visible">
              <defs>
                  <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                      <stop offset="0%" style={{stopColor: 'hsl(var(--primary) / 0.2)', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: 'hsl(var(--primary) / 0.1)', stopOpacity: 1}} />
                  </radialGradient>
              </defs>
              <ellipse cx="50" cy="50" rx="45" ry="30" fill="url(#grad1)" />
              <ellipse cx="50" cy="50" rx="45" ry="30" fill="none" stroke="hsl(var(--primary) / 0.5)" strokeWidth="1.5"/>
              <g transform={etRotation}>
                  <line x1="50" y1="20" x2="50" y2="0" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="0.5" />
                  <line x1="5" y1="50" x2="-10" y2="50" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="0.5" />
              </g>
              <text x={maxTextX} y={maxTextY - 5} textAnchor="middle" fontSize="9" fill="hsl(var(--foreground))" className="font-bold">{maxThickness.toFixed(2)}mm</text>
              <text x={minTextX} y={minTextY - 5} textAnchor="middle" fontSize="9" fill="hsl(var(--foreground))" className="font-bold">{minThickness.toFixed(2)}mm</text>
              <text x={nasalX} y="55" textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))" className="font-bold opacity-30">N</text>
              <text x={templeX} y="55" textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))" className="font-bold opacity-30">T</text>
          </svg>
      </div>
    </div>
  );
};

export default function EdgeThicknessPage() {
  const [results, setResults] = useState<{ 
      lens1: any, 
      lens2: any | null,
      savings: number | null
  } | null>(null);
  
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sphere: 0,
      cylinder: 0,
      axis: 90,
      index1: 1.498,
      index2: 1.67,
      compareMode: false,
      diameter: 70,
      centerThickness: 2.0,
      eye: 'OD',
    },
  });

  const watchCompare = form.watch('compareMode');

  function calculateLensData(power1: number, power2: number, axis: number, index: number, diameter: number, centerThickness: number) {
    const calculateSag = (p: number) => {
        if (Math.abs(p) < 0.01) return 0;
        const radius = ((index - 1) / p) * 1000;
        const semiDiameter = diameter / 2;
        if (Math.abs(radius) < semiDiameter) return null;
        const sag = Math.abs(radius) - Math.sqrt(Math.pow(Math.abs(radius), 2) - Math.pow(semiDiameter, 2));
        return p > 0 ? sag : -sag;
    };

    const sag1 = calculateSag(power1);
    const sag2 = calculateSag(power2);
    if (sag1 === null || sag2 === null) return null;

    let finalCT = centerThickness;
    if (power1 > 0 || power2 > 0) {
        const thinnestEdge = Math.min(centerThickness - sag1, centerThickness - sag2);
        if (thinnestEdge < 1.0) finalCT += (1.0 - thinnestEdge);
    }

    const t1 = finalCT - sag1;
    const t2 = finalCT - sag2;
    const maxT = Math.max(t1, t2);
    const minT = Math.min(t1, t2);
    const maxAxis = t1 > t2 ? axis : (axis + 90 > 180 ? axis - 90 : axis + 90);
    const minAxis = t1 < t2 ? axis : (axis + 90 > 180 ? axis - 90 : axis + 90);

    return { minThickness: minT, maxThickness: maxT, centerThickness: finalCT, minAxis, maxAxis };
  }

  function onSubmit(values: FormValues) {
    const { sphere, cylinder, axis, index1, index2, compareMode, diameter, centerThickness, eye } = values;
    
    const data1 = calculateLensData(sphere, sphere + cylinder, axis, index1, diameter, centerThickness);
    
    if (!data1) {
        toast({ variant: 'destructive', title: 'Invalid Result', description: 'The power is too high for this diameter and index.' });
        return;
    }

    let data2 = null;
    let savings = null;

    if (compareMode && index2) {
        data2 = calculateLensData(sphere, sphere + cylinder, axis, index2, diameter, centerThickness);
        if (data2) {
            savings = data1.maxThickness - data2.maxThickness;
        }
    }

    setResults({ lens1: { ...data1, index: index1, eye }, lens2: data2 ? { ...data2, index: index2, eye } : null, savings });
  }

  const nasalX = (eye: 'OD' | 'OS') => eye === 'OD' ? -10 : 110;
  const templeX = (eye: 'OD' | 'OS') => eye === 'OD' ? 110 : -10;

  return (
    <ToolPageLayout
      title="Lens Thickness Calculator"
      description="Calculate edge thickness and compare materials side-by-side for patients."
    >
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="text-lg">Prescription & Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="eye"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex items-center space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="OD" /></FormControl>
                            <FormLabel className="font-normal">Right Eye (OD)</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="OS" /></FormControl>
                            <FormLabel className="font-normal">Left Eye (OS)</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sphere"
                  render={({ field }) => (
                    <FormItem>
                        <PowerAdjuster label="Sphere" value={field.value} onChange={field.onChange} />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="cylinder"
                    render={({ field }) => (
                      <FormItem>
                         <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Cyl</FormLabel>
                         <FormControl><Input type="number" step="0.25" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="axis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Axis</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="index1"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Primary Material</FormLabel>
                            <Select onValueChange={(e) => field.onChange(parseFloat(e))} value={String(field.value)}>
                            <FormControl>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {lensMaterials.map((m) => <SelectItem key={m.index} value={String(m.index)}>{m.name}</SelectItem>)}
                            </SelectContent>
                            </Select>
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="compareMode"
                        render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <FormLabel>Compare Materials</FormLabel>
                                <div className="text-[10px] text-muted-foreground">Show patient benefit of high-index</div>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                        )}
                    />

                    {watchCompare && (
                         <FormField
                         control={form.control}
                         name="index2"
                         render={({ field }) => (
                         <FormItem className="animate-in fade-in slide-in-from-top-2">
                             <FormLabel>Compare Against</FormLabel>
                             <Select onValueChange={(e) => field.onChange(parseFloat(e))} value={String(field.value)}>
                             <FormControl>
                                 <SelectTrigger><SelectValue /></SelectTrigger>
                             </FormControl>
                             <SelectContent>
                                 {lensMaterials.map((m) => <SelectItem key={m.index} value={String(m.index)}>{m.name}</SelectItem>)}
                             </SelectContent>
                             </Select>
                         </FormItem>
                         )}
                     />
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="diameter"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Dia (mm)</FormLabel>
                            <FormControl>
                                <Select onValueChange={(v) => field.onChange(parseFloat(v))} value={String(field.value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{diameterOptions.map(d => <SelectItem key={d} value={String(d)}>{d}mm</SelectItem>)}</SelectContent>
                                </Select>
                            </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="centerThickness"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Min CT (mm)</FormLabel>
                            <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full">
                  <Calculator className="mr-2 size-4" />
                  Calculate Thickness
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        </div>

        <div className="lg:col-span-7">
            {results ? (
                <div className="space-y-6">
                    {results.savings !== null && results.savings > 0 && (
                        <Card className="bg-primary/10 border-primary/50 animate-bounce-subtle">
                            <CardContent className="flex items-center gap-4 p-4">
                                <CheckCircle2 className="size-8 text-primary shrink-0" />
                                <div>
                                    <h4 className="font-bold text-primary">Upgrade Benefit Identified</h4>
                                    <p className="text-sm">The higher index material reduces maximum edge thickness by <span className="font-bold text-lg">{results.savings.toFixed(2)}mm</span>.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className={results.lens2 ? "grid gap-6 md:grid-cols-2" : "w-full"}>
                        <Card className="border-accent/20 bg-accent/5">
                            <CardHeader className="p-4 pb-0">
                                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex justify-between items-center">
                                    Option 1
                                    <Badge variant="secondary">{lensMaterials.find(m => m.index === results.lens1.index)?.name}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-4">
                                <LensDiagram 
                                    nasalX={nasalX(results.lens1.eye)} 
                                    templeX={templeX(results.lens1.eye)} 
                                    eye={results.lens1.eye}
                                    centerThickness={results.lens1.centerThickness}
                                    minThickness={results.lens1.minThickness}
                                    maxThickness={results.lens1.maxThickness}
                                    maxAxis={results.lens1.maxAxis}
                                    minAxis={results.lens1.minAxis}
                                    isPlusLens={results.lens1.centerThickness > results.lens1.maxThickness}
                                />
                                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                                    <div className="bg-background/50 rounded p-2">
                                        <div className="text-muted-foreground">Max Edge</div>
                                        <div className="text-lg font-bold">{results.lens1.maxThickness.toFixed(2)}mm</div>
                                    </div>
                                    <div className="bg-background/50 rounded p-2">
                                        <div className="text-muted-foreground">Center</div>
                                        <div className="text-lg font-bold">{results.lens1.centerThickness.toFixed(2)}mm</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {results.lens2 && (
                            <Card className="border-primary/20 bg-primary/5 border-2 shadow-lg scale-105 transform">
                                <CardHeader className="p-4 pb-0">
                                    <CardTitle className="text-sm uppercase tracking-wider text-primary flex justify-between items-center">
                                        Option 2 (Better)
                                        <Badge variant="default" className="bg-primary">{lensMaterials.find(m => m.index === results.lens2.index)?.name}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-4">
                                    <LensDiagram 
                                        nasalX={nasalX(results.lens2.eye)} 
                                        templeX={templeX(results.lens2.eye)} 
                                        eye={results.lens2.eye}
                                        centerThickness={results.lens2.centerThickness}
                                        minThickness={results.lens2.minThickness}
                                        maxThickness={results.lens2.maxThickness}
                                        maxAxis={results.lens2.maxAxis}
                                        minAxis={results.lens2.minAxis}
                                        isPlusLens={results.lens2.centerThickness > results.lens2.maxThickness}
                                    />
                                    <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                                        <div className="bg-primary/10 rounded p-2">
                                            <div className="text-primary/70">Max Edge</div>
                                            <div className="text-lg font-bold text-primary">{results.lens2.maxThickness.toFixed(2)}mm</div>
                                        </div>
                                        <div className="bg-primary/10 rounded p-2">
                                            <div className="text-primary/70">Center</div>
                                            <div className="text-lg font-bold text-primary">{results.lens2.centerThickness.toFixed(2)}mm</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <Card className="bg-muted/50 border-none">
                        <CardContent className="p-4 flex items-start gap-3 text-xs text-muted-foreground">
                            <Info className="size-4 shrink-0 mt-0.5" />
                            <p>Thickness is calculated using sagittal depth based on the chosen refractive index. Final lens results may vary slightly based on frame shape and decentration. Comparisons assume identical diameter and minimum substance.</p>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="flex h-full min-h-[400px] w-full items-center justify-center rounded-2xl border border-dashed bg-card p-12 text-center text-muted-foreground shadow-inner">
                    <div className="max-w-xs space-y-4">
                        <Calculator className="size-12 mx-auto opacity-20" />
                        <h3 className="text-xl font-bold opacity-50">Visual Patient Guide</h3>
                        <p>Adjust the prescription and choose materials to see how lens thickness varies. Enable Comparison Mode to show the benefit of high-index lenses.</p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
