
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

const formSchema = z.object({
  power: z.coerce.number(),
  index: z.coerce.number().min(1.4),
  diameter: z.coerce.number().min(30),
  centerThickness: z.coerce.number().min(0.1),
});

type FormValues = z.infer<typeof formSchema>;


export default function EdgeThicknessPage() {
  const [result, setResult] = useState<{ edgeThickness: number } | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      power: -2.0,
      index: 1.586,
      diameter: 70,
      centerThickness: 1.5,
    },
  });

  function onSubmit(values: FormValues) {
    const { power, index, diameter, centerThickness } = values;

    if (power === 0) {
        setResult({ edgeThickness: centerThickness });
        return;
    }
    
    // For minus lenses
    if (power < 0) {
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
        const edgeThickness = sag + centerThickness;
        setResult({ edgeThickness });
    } else { // For plus lenses
        const radius = ((index - 1) / power) * 1000;
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

        const sag = radius - Math.sqrt(radius * radius - semiDiameter * semiDiameter);
        const edgeThickness = centerThickness - sag;
        setResult({ edgeThickness });
    }
  }

  return (
    <ToolPageLayout
      title="Lens Thickness Calculator"
      description="Calculate the edge thickness for a given lens power."
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
                            name="centerThickness"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Center/Edge Thickness (mm)</FormLabel>
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
                             <p className="text-sm text-muted-foreground">
                                {form.getValues('power') < 0 ? 'Edge Thickness' : 'Center Thickness'}
                            </p>
                            <p className="text-5xl font-bold tracking-tight text-accent-foreground">
                                {result.edgeThickness.toFixed(2)}
                                <span className="text-3xl font-medium text-muted-foreground"> mm</span>
                            </p>
                        </CardContent>
                         <CardFooter>
                            <p className="text-xs text-muted-foreground/80 text-center w-full">
                                This is an estimate. Final thickness depends on frame and fitting.
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
