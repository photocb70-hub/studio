
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
import { Repeat } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const formSchema = z.object({
  sphere: z.coerce.number().min(-25).max(25),
  cylinder: z.coerce.number().min(-15).max(15),
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

  const sphereValue = form.watch('sphere');
  const cylinderValue = form.watch('cylinder');

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
                      <FormLabel>Sphere (D): {formatPower(sphereValue)}</FormLabel>
                      <FormControl>
                        <Slider
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            min={-25}
                            max={25}
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
                      <FormLabel>Cylinder (D): {formatPower(cylinderValue)}</FormLabel>
                      <FormControl>
                        <Slider
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            min={-15}
                            max={15}
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
                      <FormLabel>Axis (°)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="180" placeholder="e.g., 90" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full sm:w-auto">
                  <Repeat className="mr-2 size-4" />
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
