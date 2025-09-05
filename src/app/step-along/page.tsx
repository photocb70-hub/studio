
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
  objectDistance: z.coerce.number().min(0, { message: 'Must be a positive number.' }),
  imageDistance: z.coerce.number().min(0, { message: 'Must be a positive number.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function StepAlongPage() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      objectDistance: 50,
      imageDistance: 50,
    },
  });

  function onSubmit(values: FormValues) {
    const { objectDistance, imageDistance } = values;
    // Thin lens equation: 1/f = 1/do + 1/di
    // Power (D) = 1 / f (in meters)
    const power = (1 / (objectDistance / 100)) + (1 / (imageDistance / 100));
    setResult(power);
  }

  return (
    <ToolPageLayout
      title="Step-Along Calculator"
      description="Calculate a lens's focal power using the thin lens equation."
    >
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enter Measurements</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="objectDistance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Object Distance (do) (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageDistance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image Distance (di) (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full sm:w-auto">
                  <Calculator className="mr-2 size-4" />
                  Calculate Power
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="flex items-center justify-center">
            {result !== null ? (
                <Card className="w-full bg-accent/10 border-accent/50">
                    <CardHeader className="items-center text-center">
                        <CardTitle>Calculated Lens Power</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-2">
                        <p className="text-5xl font-bold tracking-tight text-accent-foreground">
                        {result.toFixed(2)}
                        <span className="text-3xl font-medium text-muted-foreground"> D</span>
                        </p>
                    </CardContent>
                     <CardFooter>
                        <p className="text-xs text-muted-foreground/80 text-center w-full">
                           P = 1/f = 1/do + 1/di
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
