
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
import { Compass } from 'lucide-react';
import { PowerAdjuster } from '@/components/power-adjuster';
import { Slider } from '@/components/ui/slider';

const formSchema = z.object({
  sphere: z.coerce.number().min(-20).max(20),
  cylinder: z.coerce.number().min(-10).max(10),
  axis: z.coerce.number().min(1).max(180),
  targetMeridian: z.coerce.number().min(0).max(180),
});

type FormValues = z.infer<typeof formSchema>;

export default function ObliquePowerPage() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sphere: -2.00,
      cylinder: -1.00,
      axis: 90,
      targetMeridian: 180,
    },
  });

  const targetMeridianValue = form.watch('targetMeridian');

  function onSubmit(values: FormValues) {
    const { sphere, cylinder, axis, targetMeridian } = values;
    
    // Formula: F_theta = S + C * sin^2(theta - alpha)
    const thetaRad = (targetMeridian * Math.PI) / 180;
    const alphaRad = (axis * Math.PI) / 180;
    
    const angleDiff = thetaRad - alphaRad;
    const sinSq = Math.pow(Math.sin(angleDiff), 2);
    
    const power = sphere + (cylinder * sinSq);
    setResult(power);
  }

  return (
    <ToolPageLayout
      title="Oblique Meridian Calculator"
      description="Calculate the power of a sphero-cylindrical lens in any specific meridian."
    >
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lens Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="sphere"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <PowerAdjuster label="Sphere" value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cylinder"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <PowerAdjuster label="Cylinder" value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="axis"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Axis (°)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="targetMeridian"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Meridian to Check (°)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="pt-2">
                    <FormLabel>Meridian Slider: {targetMeridianValue}°</FormLabel>
                    <Slider 
                        value={[targetMeridianValue]} 
                        onValueChange={(v) => form.setValue('targetMeridian', v[0])} 
                        min={0} max={180} step={1} 
                    />
                </div>
                <Button type="submit" className="w-full sm:w-auto">
                  <Compass className="mr-2 size-4" />
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
                        <CardTitle>Power in {targetMeridianValue}° Meridian</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-2">
                        <p className="text-6xl font-bold tracking-tight text-accent-foreground">
                        {result > 0 ? '+' : ''}{result.toFixed(2)}
                        <span className="text-2xl font-medium text-muted-foreground"> D</span>
                        </p>
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground/80 text-center w-full">
                            Formula: Fθ = S + C sin²(θ - α)
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
