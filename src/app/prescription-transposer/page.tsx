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
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Repeat } from 'lucide-react';
import { PowerAdjuster } from '@/components/power-adjuster';

const formSchema = z.object({
  sphere: z.coerce.number().min(-20).max(20),
  cylinder: z.coerce.number().min(-10).max(10),
  axis: z.coerce.number({ required_error: "Axis is required." }).min(1, "Axis must be between 1 and 180.").max(180, "Axis must be between 1 and 180."),
});

type FormValues = z.infer<typeof formSchema>;
type Prescription = z.infer<typeof formSchema>;

export default function PrescriptionTransposerPage() {
  const [result, setResult] = useState<Prescription | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sphere: 0,
      cylinder: 0,
      axis: 90,
    },
  });

  function onSubmit(values: FormValues) {
    const { sphere, cylinder, axis } = values;

    // New Sphere = Old Sphere + Old Cylinder
    const newSphere = sphere + cylinder;

    // New Cylinder = - (Old Cylinder)
    const newCylinder = -cylinder;

    // New Axis = (Old Axis + 90), wrapped around 180
    let newAxis = axis + 90;
    if (newAxis > 180) {
      newAxis -= 180;
    }

    setResult({
      sphere: newSphere,
      cylinder: newCylinder,
      axis: newAxis,
    });
  }

  const formatPower = (power: number) => {
    return (power > 0 ? '+' : '') + power.toFixed(2);
  }

  return (
    <ToolPageLayout
      title="Prescription Transposer"
      description="Convert an eyeglass prescription between plus and minus cylinder formats."
    >
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enter Original Prescription</CardTitle>
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
                        <PowerAdjuster
                            label="Sphere"
                            value={field.value}
                            onChange={field.onChange}
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
                  name="cylinder"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <PowerAdjuster
                            label="Cylinder"
                            value={field.value}
                            onChange={field.onChange}
                            min={-10}
                            max={10}
                            step={0.25}
                        />
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
                      <FormControl>
                        <PowerAdjuster
                            label="Axis"
                            value={field.value}
                            onChange={field.onChange}
                            min={1}
                            max={180}
                            step={1}
                            unit="°"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full sm:w-auto">
                  <Repeat className="mr-2 h-4 w-4" />
                  Transpose
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="flex items-center justify-center">
            {result !== null ? (
                <Card className="w-full bg-accent/10 border-accent/50">
                    <CardHeader className="items-center text-center">
                        <CardTitle>Transposed Prescription</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-2">
                        <p className="text-4xl sm:text-5xl font-bold tracking-tight text-accent-foreground">
                          {formatPower(result.sphere)} / {formatPower(result.cylinder)} x {result.axis}
                        </p>
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground/80 text-center w-full">
                            New Sph = Sph + Cyl; New Cyl = -Cyl; New Axis = Axis ± 90°
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
