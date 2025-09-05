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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  power: z.coerce.number(),
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
  const [result, setResult] = useState<{ thickness: number; type: string } | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      power: 2.50,
      index: 1.586,
      diameter: 70,
      minThickness: 1.0,
    },
  });

  function onSubmit(values: FormValues) {
    const { power, index, diameter, minThickness } = values;

    if (power === 0) {
        setResult({ thickness: minThickness, type: 'Plano Lens Thickness' });
        return;
    }
    
    // Sagitta formula based on lens power, index, and diameter.
    // F = (n-1)/r => r = (n-1)/F
    const radius = Math.abs((index - 1) / power) * 1000; // in mm
    const semiDiameter = diameter / 2;

    if (radius <= semiDiameter) {
        toast({
            variant: "destructive",
            title: "Invalid Calculation",
            description: "The lens power is too high for the given diameter. Please check your inputs."
        });
        setResult(null); 
        return;
    }

    // Sagitta formula: s = r - sqrt(r^2 - (d/2)^2)
    const sag = radius - Math.sqrt(Math.pow(radius, 2) - Math.pow(semiDiameter, 2));

    if (power > 0) { // Plus lens
      // Center thickness = sag + minimum edge thickness
      const centerThickness = sag + minThickness;
      setResult({ thickness: centerThickness, type: 'Center Thickness' });
    } else { // Minus lens
      // Edge thickness = sag + minimum center thickness
      const edgeThickness = sag + minThickness;
      setResult({ thickness: edgeThickness, type: 'Edge Thickness' });
    }
  }

  return (
    <ToolPageLayout
      title="Lens Thickness Calculator"
      description="Estimate the center (for plus lenses) or edge (for minus lenses) thickness. Assumes a simple spherical lens with a flat back surface."
    >
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enter Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="power"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sphere Power (D)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
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
                    <CardHeader className="items-center text-center">
                        <CardTitle>{result.type}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-5xl font-bold tracking-tight text-accent-foreground">
                        {result.thickness.toFixed(2)}
                        <span className="text-3xl font-medium text-muted-foreground"> mm</span>
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex h-full min-h-[200px] w-full items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center text-muted-foreground">
                    <p>Results will be displayed here.</p>
                </div>
            )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
