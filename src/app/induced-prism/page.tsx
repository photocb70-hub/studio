
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
import { Slider } from '@/components/ui/slider';

const formSchema = z.object({
  power: z.coerce.number().min(-20).max(20),
  decentration: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InducedPrismPage() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      power: 0,
      decentration: 3,
    },
  });

  const powerValue = form.watch('power');

  function onSubmit(values: FormValues) {
    const { power, decentration } = values;
    // Prentice's Rule: Prism (Δ) = Power (D) * Decentration (cm)
    const prism = Math.abs(power * (decentration / 10));
    setResult(prism);
  }

  return (
    <ToolPageLayout
      title="Induced Prism Calculator"
      description="Calculate the amount of induced prism based on lens power and decentration using Prentice's Rule."
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
                      <FormLabel>Lens Power (D): {powerValue.toFixed(2)}</FormLabel>
                      <FormControl>
                        <Slider
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            min={-20}
                            max={20}
                            step={0.25}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="decentration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decentration (mm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full sm:w-auto">
                  <Calculator className="mr-2 size-4" />
                  Calculate Prism
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="flex items-center justify-center">
            {result !== null ? (
                <Card className="w-full bg-accent/10 border-accent/50">
                    <CardHeader className="items-center text-center">
                        <CardTitle>Induced Prism</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-2">
                        <p className="text-5xl font-bold tracking-tight text-accent-foreground">
                        {result.toFixed(2)}
                        <span className="text-3xl font-medium text-muted-foreground"> Δ</span>
                        </p>
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground/80 text-center w-full">
                            Prism (Δ) = |Power (D)| × Decentration (cm)
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
