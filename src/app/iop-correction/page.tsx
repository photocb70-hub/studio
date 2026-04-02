'use client';

import React, { useState } from 'react';
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calculator, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  measuredIop: z.coerce.number().min(0).max(60),
  cct: z.coerce.number().min(300).max(800),
});

type FormValues = z.infer<typeof formSchema>;

export default function IopCorrectionPage() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      measuredIop: 21,
      cct: 545,
    },
  });

  function onSubmit(values: FormValues) {
    const { measuredIop, cct } = values;
    // Dresdner Correction Formula (Approximate)
    // Corrected IOP = Measured IOP - (CCT - 545) / 50 * 2.5
    // Standard clinical approximation: +/- 1mmHg for every 20-25 microns from 545.
    const correction = (cct - 545) / 50 * 2.5;
    const correctedIop = measuredIop - correction;
    setResult(correctedIop);
  }

  return (
    <ToolPageLayout
      title="IOP Correction Calculator"
      description="Adjust GAT tonometry readings based on Central Corneal Thickness (CCT)."
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Inputs</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="measuredIop"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Measured IOP (mmHg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cct"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Central Corneal Thickness (μm)</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" {...field} />
                        </FormControl>
                        <FormDescription>Standard reference: 545μm</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    <Calculator className="mr-2 size-4" />
                    Calculate Adjusted IOP
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          <Alert>
            <Info className="size-4" />
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>
              Thinner corneas lead to underestimation of IOP, while thicker corneas lead to overestimation. This tool uses a standard linear correction formula.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex items-center justify-center">
          {result !== null ? (
            <Card className="w-full bg-accent/10 border-accent/50">
              <CardHeader className="items-center text-center">
                <CardTitle>Adjusted IOP</CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-2">
                <p className="text-6xl font-bold tracking-tight text-accent-foreground">
                  {result.toFixed(1)}
                  <span className="text-2xl font-medium text-muted-foreground ml-2">mmHg</span>
                </p>
                <div className="mt-4 inline-flex items-center rounded-full bg-background/50 px-3 py-1 text-sm font-medium">
                   Correction Applied: { (form.getValues().measuredIop - result).toFixed(1) } mmHg
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground/80 text-center w-full">
                  Formula: Dresdner Adjustment (Ref: 545μm)
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
