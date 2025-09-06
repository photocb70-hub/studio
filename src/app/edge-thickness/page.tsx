
'use client';

import { useState } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  sphere: z.coerce.number().min(-20).max(20),
  cylinder: z.coerce.number().min(-10).max(0),
  axis: z.coerce.number().min(1).max(180),
  index: z.coerce.number().min(1.4).max(2.0),
  diameter: z.coerce.number().min(30).max(90),
  centerThickness: z.coerce.number().min(0.1).max(10),
  eye: z.enum(['OD', 'OS']),
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

const diameterOptions = [55, 60, 65, 70, 75, 80];

const LensDiagram = ({ minThickness, maxThickness, centerThickness, minAxis, maxAxis, eye }: { minThickness: number, maxThickness: number, centerThickness: number, minAxis: number, maxAxis: number, eye: 'OD' | 'OS' }) => {
  const isPlusLens = (minThickness + maxThickness) / 2 < centerThickness;

  const plusPath = `M 20,50 C 35,30 75,30 90,50 C 75,70 35,70 20,50 Z`;
  const minusPath = `M 20,35 C 45,45 65,45 90,35 L 90,65 C 65,55 45,55 20,65 Z`;
  const etRotation = `rotate(${maxAxis} 50 50)`;

  const maxAngleRad = (maxAxis - 90) * Math.PI / 180;
  const minAngleRad = (minAxis - 90) * Math.PI / 180;

  const maxTextX = 50 + Math.cos(maxAngleRad) * 58;
  const maxTextY = 50 + Math.sin(maxAngleRad) * 58;
  const minTextX = 50 + Math.cos(minAngleRad) * 58;
  const minTextY = 50 + Math.sin(minAngleRad) * 58;

  const nasalX = eye === 'OD' ? -10 : 110;
  const templeX = eye === 'OD' ? 110 : -10;

  return (
    <div className="w-full max-w-[250px] mx-auto p-4 flex flex-col items-center justify-center gap-6">
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
                  <line x1="55" y1={50} x2="70" y2="15" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="0.5"/>
                  <text x="72" y="15" textAnchor="start" dominantBaseline="middle" fontSize="9" fill="hsl(var(--foreground))" className="font-medium">{centerThickness.toFixed(2)}mm</text>
                </>
              ) : (
                  <>
                  <line x1="20" y1="50" x2="10" y2="50" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="0.5" />
                  <text x="8" y="50" textAnchor="end" dominantBaseline="middle" fontSize="9" fill="hsl(var(--foreground))" className="font-medium">{minThickness.toFixed(2)}mm</text>
                </>
              )}
          </svg>
      </div>
      
      <Separator />
      
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
              
              <path d="M 20 40 C 40 25, 60 25, 80 40" fill="none" stroke="hsl(var(--background) / 0.5)" strokeWidth="2.5" strokeLinecap="round" />
          
              <g transform={etRotation}>
                  <line x1="50" y1="20" x2="50" y2="0" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="0.5" />
                  <line x1="5" y1="50" x2="-10" y2="50" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="0.5" />
              </g>
              
              <text x={maxTextX} y={maxTextY - 5} textAnchor="middle" fontSize="9" fill="hsl(var(--foreground))" className="font-medium">{maxThickness.toFixed(2)}mm</text>
              <text x={maxTextX} y={maxTextY + 7} textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))">({maxAxis}°)</text>

              <text x={minTextX} y={minTextY - 5} textAnchor="middle" fontSize="9" fill="hsl(var(--foreground))" className="font-medium">{minThickness.toFixed(2)}mm</text>
              <text x={minTextX} y={minTextY + 7} textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))">({minAxis}°)</text>

              <text x={nasalX} y="55" textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))" className="font-bold">N</text>
              <text x={templeX} y="55" textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))" className="font-bold">T</text>
          </svg>
      </div>
    </div>
  );
};

export default function EdgeThicknessPage() {
  const [result, setResult] = useState<{ minThickness: number; maxThickness: number; centerThickness: number; minAxis: number; maxAxis: number; eye: 'OD' | 'OS' } | null>(null);
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
      eye: 'OD',
    },
  });

  const sphereValue = form.watch('sphere');
  const cylinderValue = form.watch('cylinder');
  const invertedCylinderValue = cylinderValue !== undefined ? -cylinderValue : 0;
  const axisValue = form.watch('axis');

  function calculateSag(power: number, index: number, diameter: number): number | null {
    if (Math.abs(power) < 0.01) return 0;
    
    const radius = ((index - 1) / power) * 1000;
    const semiDiameter = diameter / 2;

    if (Math.abs(radius) < semiDiameter) {
      toast({
        variant: 'destructive',
        title: 'Invalid Calculation',
        description: `Power (${power.toFixed(2)}D) is too high for the diameter, resulting in an invalid lens shape.`,
      });
      return null;
    }
    const sag = Math.abs(radius) - Math.sqrt(Math.pow(Math.abs(radius), 2) - Math.pow(semiDiameter, 2));
    return power > 0 ? sag : -sag;
  }
  
  function onSubmit(values: FormValues) {
    const { sphere, cylinder = 0, axis = 90, index, diameter, centerThickness, eye } = values;

    const cyl = cylinder || 0;
    const power1 = sphere;
    const power2 = sphere + cyl;

    const sag1 = calculateSag(power1, index, diameter);
    const sag2 = calculateSag(power2, index, diameter);
    
    if (sag1 === null || sag2 === null) {
      setResult(null);
      return;
    }

    let finalCenterThickness = centerThickness;
    const minEdgeForPlus = 1.0;

    if (sphere > 0) {
      const thinnestEdge = Math.min(centerThickness - sag1, centerThickness - sag2);
      if (thinnestEdge < minEdgeForPlus) {
        finalCenterThickness += minEdgeForPlus - thinnestEdge;
      }
    }
    
    const thickness1 = finalCenterThickness - sag1;
    const thickness2 = finalCenterThickness - sag2;

    const maxThickness = Math.max(thickness1, thickness2);
    const minThickness = Math.min(thickness1, thickness2);
    
    const minAxis = thickness1 < thickness2 ? axis : (axis + 90 > 180 ? axis - 90 : axis + 90);
    const maxAxis = thickness1 > thickness2 ? axis : (axis + 90 > 180 ? axis - 90 : axis + 90);

    setResult({ minThickness, maxThickness, centerThickness: finalCenterThickness, minAxis, maxAxis, eye });
  }

  const formatPower = (power?: number) => {
    if (power === undefined || power === null) return '0.00';
    return (power > 0 ? '+' : '') + power.toFixed(2);
  };

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
                  name="eye"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Lens</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex items-center space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="OD" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Right (OD)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="OS" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Left (OS)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                  <FormField
                    control={form.control}
                    name="axis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Axis (°): {axisValue}</FormLabel>
                        <FormControl>
                            <Slider
                                value={[field.value ?? 90]}
                                onValueChange={(value) => field.onChange(value[0])}
                                min={1} max={180} step={1}
                            />
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
                                <SelectItem key={`${material.name}-${material.index}`} value={String(material.index)}>
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
                          <Select onValueChange={(e) => field.onChange(parseFloat(e))} defaultValue={String(field.value)}>
                              <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select a diameter" />
                              </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {diameterOptions.map((diameter) => (
                                    <SelectItem key={diameter} value={String(diameter)}>
                                    {diameter} mm
                                    </SelectItem>
                                ))}
                              </SelectContent>
                          </Select>
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

        <div className="flex items-center justify-center">
            {result ? (
                <Card className="w-full bg-accent/10 border-accent/50">
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
                                <p className="text-xs text-muted-foreground">at {result.minAxis}°</p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">Max Edge Thickness</p>
                                <p className="text-3xl font-bold tracking-tight text-primary">
                                    {result.maxThickness.toFixed(2)}
                                    <span className="text-xl font-medium text-muted-foreground"> mm</span>
                                </p>
                                <p className="text-xs text-muted-foreground">at {result.maxAxis}°</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Final Center Thickness</p>
                                <p className="text-3xl font-bold tracking-tight text-primary">
                                    {result.centerThickness.toFixed(2)}
                                    <span className="text-xl font-medium text-muted-foreground"> mm</span>
                                </p>
                            </div>
                        </div>
                        <LensDiagram 
                            minThickness={result.minThickness} 
                            maxThickness={result.maxThickness} 
                            centerThickness={result.centerThickness}
                            minAxis={result.minAxis}
                            maxAxis={result.maxAxis}
                            eye={result.eye}
                        />
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground/80 text-center w-full">
                           Formula: ET = CT ± Sagittal Depth. Assumes minus cylinder format.
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
