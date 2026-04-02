
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
import { Focus, Eye } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  age: z.coerce.number().min(5, "Must be at least 5.").max(100, "Maximum age 100."),
  distanceRx: z.coerce.number().default(0),
});

type FormValues = z.infer<typeof formSchema>;

export default function AccommodationPage() {
  const [result, setResult] = useState<{ avg: number; min: number; nearPoint: number; farPoint: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 45,
      distanceRx: 0,
    },
  });

  function onSubmit(values: FormValues) {
    const { age, distanceRx } = values;
    
    // Hofstetter's Formulas
    const avgAmp = 18.5 - (0.3 * age);
    const minAmp = 15.0 - (0.25 * age);
    
    // Near point (m) = 1 / (Dist Rx + Amp)
    // For simplicity, we use Avg Amplitude
    const totalNearPower = distanceRx + avgAmp;
    const nearPoint = totalNearPower > 0 ? (1 / totalNearPower) : Infinity;
    
    // Far point (m) = 1 / Dist Rx
    const farPoint = distanceRx !== 0 ? (1 / distanceRx) : Infinity;

    setResult({ 
        avg: avgAmp > 0 ? avgAmp : 0, 
        min: minAmp > 0 ? minAmp : 0, 
        nearPoint: nearPoint, 
        farPoint: farPoint 
    });
  }

  const formatDist = (m: number) => {
      if (m === Infinity) return 'Infinity';
      if (m < 0) return 'Virtual';
      return (m * 100).toFixed(1) + ' cm';
  }

  return (
    <ToolPageLayout
      title="Accommodation & Range"
      description="Estimate Amplitude of Accommodation and the resulting clear vision range based on age and distance Rx."
    >
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (Years)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="distanceRx"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spherical Dist Rx (D)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.25" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full sm:w-auto">
                  <Focus className="mr-2 size-4" />
                  Calculate Range
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="flex items-center justify-center">
            {result ? (
                <Card className="w-full bg-accent/10 border-accent/50">
                    <CardHeader>
                        <CardTitle>Estimated Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Avg Amplitude</p>
                            <p className="text-5xl font-bold text-accent-foreground">{result.avg.toFixed(2)} D</p>
                            <p className="text-xs text-muted-foreground mt-1">Min Expected: {result.min.toFixed(2)} D</p>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Far Point</p>
                                <p className="text-xl font-semibold">{formatDist(result.farPoint)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase">Near Point</p>
                                <p className="text-xl font-semibold">{formatDist(result.nearPoint)}</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <p className="text-[10px] text-muted-foreground/80 text-center w-full">
                            Uses Hofstetter's formulas. Ranges assume emmetropic or fully corrected state.
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
