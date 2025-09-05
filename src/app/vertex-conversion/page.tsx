
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
  power: z.coerce.number(),
  originalDistance: z.coerce.number().min(0),
  newDistance: z.coerce.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

export default function VertexConversionPage() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      power: -8.00,
      originalDistance: 12,
      newDistance: 10,
    },
  });

  function onSubmit(values: FormValues) {
    const { power, originalDistance, newDistance } = values;
    // Formula: Fc = F / (1 - dF)
    // where d is the change in distance in meters.
    const distanceChange = (originalDistance - newDistance) / 1000;
    const compensatedPower = power / (1 - distanceChange * power);
    setResult(compensatedPower);
  }

  return (
    <ToolPageLayout
      title="Vertex Conversion Calculator"
      description="Calculate the compensated lens power for a change in vertex distance."
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
                      <FormLabel>Original Power (D)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., -8.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="originalDistance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Vertex Distance (mm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newDistance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Vertex Distance (mm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full sm:w-auto">
                  <Calculator className="mr-2 size-4" />
                  Convert Power
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="flex items-center justify-center">
            {result !== null ? (
                <Card className="w-full bg-accent/10 border-accent/50">
                    <CardHeader className="items-center text-center">
                        <CardTitle>Compensated Power</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-2">
                        <p className="text-5xl font-bold tracking-tight text-accent-foreground">
                        {result.toFixed(2)}
                        <span className="text-3xl font-medium text-muted-foreground"> D</span>
                        </p>
                    </CardContent>
                     <CardFooter>
                        <p className="text-xs text-muted-foreground/80 text-center w-full">
                            Fc = F / (1 - dF)
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
