
'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  power: z.coerce.number(),
  index: z.coerce.number().min(1.4, "Index must be at least 1.4"),
  diameter: z.coerce.number().min(30, "Diameter must be at least 30mm"),
  thickness: z.coerce.number().min(0.1, "Thickness must be a positive number"),
});

type FormValues = z.infer<typeof formSchema>;

const ThicknessInputLabel = ({ control }: { control: any }) => {
    const power = useWatch({ control, name: 'power' });
    const label = power < 0 ? 'Center Thickness (mm)' : 'Edge Thickness (mm)';
    return <FormLabel>{label}</FormLabel>;
};


export default function LensThicknessPage() {
  const [result, setResult] = useState<{ edge: number, center: number } | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      power: -2.0,
      index: 1.586,
      diameter: 70,
      thickness: 1.5,
    },
  });

  const powerValue = form.watch('power');

  function onSubmit(values: FormValues) {
    const { power, index, diameter, thickness } = values;

    if (power === 0) {
        setResult({ edge: thickness, center: thickness });
        return;
    }
    
    // r = (n-1)/F * 1000 to get radius in mm
    const radius = ((index - 1) * 1000) / power;
    const semiDiameter = diameter / 2;

    if (Math.abs(radius) <= semiDiameter) {
        toast({
            variant: "destructive",
            title: "Invalid Calculation",
            description: "Lens power is too high for the given diameter, creating an invalid lens shape."
        });
        setResult(null);
        return;
    }

    // Sagitta formula: s = r - sqrt(r^2 - (d/2)^2)
    const sag = radius - Math.sqrt(radius * radius - semiDiameter * semiDiameter);

    if (power < 0) { // Minus lens
      const centerThickness = thickness;
      const edgeThickness = centerThickness - sag; // sag is negative for minus lenses
      setResult({ edge: edgeThickness, center: centerThickness });
    } else { // Plus lens
      const edgeThickness = thickness;
      const centerThickness = edgeThickness + sag;
      setResult({ edge: edgeThickness, center: centerThickness });
    }
  }

  return (
    <ToolPageLayout
      title="Lens Thickness Calculator"
      description="Calculate edge and center thickness for plus and minus lenses."
    >
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
            <CardHeader>
                <CardTitle>Enter Lens Parameters</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="power"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Sphere Power (D)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.25" {...field} />
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
                                <FormControl>
                                    <Input type="number" step="0.001" placeholder="e.g., 1.586" {...field} />
                                </FormControl>
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
                                <ThicknessInputLabel control={form.control} />
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

            <div className="flex items-center justify-center">
                {result ? (
                    <Card className="w-full bg-accent/10 border-accent/50">
                        <CardHeader className="items-center text-center">
                            <CardTitle>Calculated Thickness</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center pb-2">
                             <div className="flex justify-around items-center">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Edge</p>
                                    <p className="text-4xl font-bold tracking-tight text-accent-foreground">
                                        {result.edge.toFixed(2)}
                                        <span className="text-2xl font-medium text-muted-foreground"> mm</span>
                                    </p>
                                </div>
                                <Separator orientation="vertical" className="h-16 bg-border" />
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Center</p>
                                     <p className="text-4xl font-bold tracking-tight text-accent-foreground">
                                        {result.center.toFixed(2)}
                                        <span className="text-2xl font-medium text-muted-foreground"> mm</span>
                                    </p>
                                </div>
                             </div>
                        </CardContent>
                         <CardFooter>
                            <p className="text-xs text-muted-foreground/80 text-center w-full">
                                Estimates depend on base curve and other factors.
                            </p>
                        </CardFooter>
                    </Card>
                ) : (
                    <div className="flex min-h-[200px] w-full items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center text-muted-foreground">
                        <p>Results will be displayed here.</p>
                    </div>
                )}
            </div>
        </div>
    </ToolPageLayout>
  );
}
