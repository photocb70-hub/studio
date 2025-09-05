
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
  eyeSize: z.coerce.number().min(0, "Must be a positive number."),
  bridgeSize: z.coerce.number().min(0, "Must be a positive number."),
  patientPD: z.coerce.number().min(0, "Must be a positive number."),
}).refine(data => (data.eyeSize + data.bridgeSize) >= data.patientPD, {
    message: "Frame PD (Eye Size + Bridge Size) must be greater than or equal to Patient PD.",
    path: ["bridgeSize"],
});

type FormValues = z.infer<typeof formSchema>;

export default function BlankSizePage() {
  const [result, setResult] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eyeSize: 50,
      bridgeSize: 20,
      patientPD: 64,
    },
  });

  function onSubmit(values: FormValues) {
    const { eyeSize, bridgeSize, patientPD } = values;

    // Frame PD = Eye Size + Bridge Size
    const framePD = eyeSize + bridgeSize;

    // Minimum Blank Size = Frame PD - Patient PD + Eye Size + 2mm (for glazing)
    const blankSize = framePD - patientPD + eyeSize + 2;
    setResult(blankSize);
  }

  return (
    <ToolPageLayout
      title="Blank Size Calculator"
      description="Calculate the minimum lens blank size required for a given frame and patient PD."
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
                  name="eyeSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eye Size (mm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bridgeSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bridge Size (DBL) (mm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="patientPD"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient PD (mm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 64" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full sm:w-auto">
                  <Calculator className="mr-2 size-4" />
                  Calculate Size
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="flex items-center justify-center">
            {result !== null ? (
                <Card className="w-full bg-accent/10 border-accent/50">
                    <CardHeader className="items-center text-center">
                        <CardTitle>Minimum Blank Size</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-2">
                        <p className="text-5xl font-bold tracking-tight text-accent-foreground">
                        {result.toFixed(2)}
                        <span className="text-3xl font-medium text-muted-foreground"> mm</span>
                        </p>
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground/80 text-center w-full">
                            MBS = (Eye Size + Bridge) - PD + Eye Size + 2mm
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
