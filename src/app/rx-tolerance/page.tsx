
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { runFlow } from '@genkit-ai/next/client';
import { z } from 'zod';
import {
  analyzeRxTolerance,
  type RxToleranceOutput,
} from '@/ai/flows/rx-tolerance-analysis';
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
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  sphere: z.coerce.number().min(-30, "Must be > -30").max(30, "Must be < 30"),
  cylinder: z.coerce.number().min(-30, "Must be > -30").max(30, "Must be < 30"),
  axis: z.coerce.number().min(0, "Must be > 0").max(180, "Must be < 180"),
  add: z.coerce.number().min(0).max(10).optional().or(z.literal('')),
  prism: z.coerce.number().min(0).max(30).optional().or(z.literal('')),
  base: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RxTolerancePage() {
  const [result, setResult] = useState<RxToleranceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sphere: -2.50,
      cylinder: -1.00,
      axis: 180,
      add: '',
      prism: '',
      base: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);

    const apiValues = {
        ...values,
        add: values.add === '' ? undefined : values.add,
        prism: values.prism === '' ? undefined : values.prism,
    }

    try {
      const response = await runFlow(analyzeRxTolerance, apiValues);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to analyze the prescription. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ToolPageLayout
      title="Rx Tolerance Analysis"
      description="Analyze if a prescription is within industry standards and if refabrication is needed."
    >
      <Card>
        <CardHeader>
          <CardTitle>Enter Prescription Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="sphere"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sphere (D)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cylinder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cylinder (D)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
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
                      <FormLabel>Axis (°)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                 <FormField
                  control={form.control}
                  name="add"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Add (D, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 2.25" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="prism"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prism (Δ, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1.0" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="base"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., BU, BI, BD, BO" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Analyze Prescription
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && <div className="mt-8 flex justify-center"><Loader2 className="size-8 animate-spin text-primary"/></div>}

      {result && (
        <div className="mt-8 space-y-6">
          <Card className={result.isInTolerance ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              {result.isInTolerance ? (
                <CheckCircle className="size-8 text-green-500" />
              ) : (
                <XCircle className="size-8 text-red-500" />
              )}
              <div>
                <CardTitle className={result.isInTolerance ? 'text-green-700' : 'text-red-700'}>
                  {result.isInTolerance ? 'Within Tolerance' : 'Out of Tolerance'}
                </CardTitle>
                <p className="font-semibold text-foreground">{result.advice}</p>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-wrap">{result.detailedAnalysis}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </ToolPageLayout>
  );
}
