
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

const formSchema = z.object({
  addPower: z.coerce.number().min(0, "Must be positive."),
  corridorLength: z.coerce.number().min(5, "Must be at least 5mm."),
  distanceFromOC: z.coerce.number().min(0, "Must be positive."),
}).refine(data => data.distanceFromOC <= data.corridorLength, {
    message: "Distance from OC cannot be greater than the corridor length.",
    path: ["distanceFromOC"],
});

type FormValues = z.infer<typeof formSchema>;

export default function ProgressivePowerPage() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      addPower: 2.50,
      corridorLength: 14,
      distanceFromOC: 10,
    },
  });

  function onSubmit(values: FormValues) {
    const { addPower, corridorLength, distanceFromOC } = values;

    // A simplified linear model for effective add power progression.
    // Effective Add = (Distance from OC / Corridor Length) * Total Add Power
    const effectiveAdd = (distanceFromOC / corridorLength) * addPower;

    setResult(effectiveAdd);
  }

  return (
    <ToolPageLayout
      title="Progressive Power Calculator"
      description="Estimate the effective reading power at a specific point in a progressive lens corridor."
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
                  name="addPower"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prescribed Add Power (D)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.25" placeholder="e.g., 2.50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="corridorLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Corridor Length (mm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 14" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="distanceFromOC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distance from OC down corridor (mm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full sm:w-auto">
                  <Calculator className="mr-2 size-4" />
                  Calculate Effective Power
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="flex items-center justify-center">
            {result !== null ? (
                <Card className="w-full bg-accent/10 border-accent/50">
                    <CardHeader className="items-center text-center">
                        <CardTitle>Effective Add Power</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-2">
                        <p className="text-5xl font-bold tracking-tight text-accent-foreground">
                        +{result.toFixed(2)}
                        <span className="text-3xl font-medium text-muted-foreground"> D</span>
                        </p>
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground/80 text-center w-full">
                            Note: This is a simplified linear estimation.
                        </p>
                    </CardFooter>
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
