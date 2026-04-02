
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';
import { PowerAdjuster } from '@/components/power-adjuster';

const formSchema = z.object({
  sphere: z.coerce.number().min(-20).max(20),
  cylinder: z.coerce.number().min(-10).max(0).optional().default(0),
  axis: z.coerce.number().min(1).max(180).optional(),
  bvd: z.coerce.number().min(0).max(20).default(12),
}).refine(data => (data.cylinder ?? 0) !== 0 ? data.axis !== undefined : true, {
  message: "Axis is required for cylindrical prescriptions.",
  path: ["axis"],
});

type FormValues = z.infer<typeof formSchema>;
type Prescription = { sphere: number; cylinder: number; axis?: number };

export default function ContactLensConverterPage() {
  const [result, setResult] = useState<Prescription | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sphere: 0,
      cylinder: 0,
      axis: 90,
      bvd: 12,
    },
  });

  function onSubmit(values: FormValues) {
    const { sphere, cylinder = 0, axis, bvd } = values;
    const d = bvd / 1000;
    
    // Compensate Sphere (Meridian 1)
    const compensatedSph = sphere / (1 - d * sphere);
    
    // Compensate Meridian 2 (Sphere + Cylinder)
    const meridian2 = sphere + cylinder;
    const compensatedMeridian2 = meridian2 / (1 - d * meridian2);
    
    // Calculate new Cylinder
    const compensatedCyl = compensatedMeridian2 - compensatedSph;

    // Round to nearest 0.25D
    const roundToQuarter = (val: number) => Math.round(val * 4) / 4;
    
    setResult({
      sphere: roundToQuarter(compensatedSph),
      cylinder: roundToQuarter(compensatedCyl),
      axis: axis,
    });
  }

  const formatPower = (power?: number) => {
    if (power === undefined || power === null) return '';
    return (power > 0 ? '+' : '') + power.toFixed(2);
  }

  const formatResult = (prescription: Prescription) => {
    let formattedString = formatPower(prescription.sphere);
    if (prescription.cylinder !== 0) {
      formattedString += ` / ${formatPower(prescription.cylinder)}`;
      if (prescription.axis) {
        formattedString += ` x ${prescription.axis}`;
      }
    }
    return formattedString;
  }

  return (
    <ToolPageLayout
      title="Contact Lens Rx Converter"
      description="Convert a spectacle prescription to an equivalent contact lens prescription by compensating for vertex distance in both meridians."
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
            <Card>
            <CardHeader>
                <CardTitle>Enter Spectacle Prescription</CardTitle>
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
                                value={field.value ?? 0}
                                onChange={field.onChange}
                                min={-10}
                                max={0}
                                step={0.25}
                            />
                        </FormControl>
                        <FormMessage />
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
                                    <Input 
                                      type="number" 
                                      min={1} 
                                      max={180} 
                                      value={field.value ?? 90} 
                                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bvd"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Vertex Distance (mm)</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" max="20" placeholder="e.g., 12" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button type="submit" className="w-full sm:w-auto">
                    <Repeat className="mr-2 size-4" />
                    Convert
                    </Button>
                </form>
                </Form>
            </CardContent>
            </Card>
            <Alert>
                <TriangleAlert className="size-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>
                    This tool now compensates both meridians (Sph/Cyl). Vertex compensation is typically clinically significant for powers of ±4.00D or greater.
                </AlertDescription>
            </Alert>
        </div>
        
        <div className="flex items-center justify-center">
            {result !== null ? (
                <Card className="w-full bg-accent/10 border-accent/50">
                    <CardHeader className="items-center text-center">
                        <CardTitle>Contact Lens Prescription</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-2">
                        <p className="text-4xl sm:text-5xl font-bold tracking-tight text-accent-foreground">
                          {formatResult(result)}
                        </p>
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground/80 text-center w-full">
                            Formula: Fc = F / (1 - d*F) calculated for both meridians.
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
