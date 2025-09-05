
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    
    // Calculate thickness at 1 degree intervals to find min/max
    const thicknessPoints = [];
    for (let i = 0; i < 180; i++) {
        const power = getPowerAtMeridian(i);
        const thickness = calculateThickness(power);
        if (thickness === null) {
            toast({
                variant: "destructive",
                title: "Invalid Calculation",
                description: "Lens power is too high for the given diameter."
            });
            setResult(null);
            return;
        }
        thicknessPoints.push(thickness);
    }
    
    const spherePower = getPowerAtMeridian(axis ?? 0);
    const cylinderPower = getPowerAtMeridian((axis ?? 0) + 90);

    const sphereThickness = calculateThickness(spherePower);
    const cylinderThickness = calculateThickness(cylinderPower);

    if (sphereThickness === null || cylinderThickness === null) {
      setResult(null);
      return;
    }

    if (sphere > 0) { // Plus lens
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
            {result ? (
                 <Card>
                    <CardHeader>
                        <CardTitle>Calculated Thickness</CardTitle>
                         <CardDescription>Estimated thickness values for the given lens.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-sm text-muted-foreground">Maximum Thickness</p>
                            <p className="text-3xl font-bold">{result.max.toFixed(2)} mm</p>
                        </div>
                         <div>
                            <p className="text-sm text-muted-foreground">Minimum Thickness</p>
                            <p className="text-3xl font-bold">{result.min.toFixed(2)} mm</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex h-full min-h-[150px] w-full items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center text-muted-foreground">
                    <p>Results will be displayed here.</p>
                </div>
            )}
        </div>
    </ToolPageLayout>
  );
}

    