
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
import { Rainbow } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const lensMaterials = [
    { name: 'Standard Index (1.50)', index: 1.498, abbe: 58 },
    { name: 'Polycarbonate (1.59)', index: 1.586, abbe: 30 },
    { name: 'Mid-Index (1.60)', index: 1.60, abbe: 42 },
    { name: 'High-Index (1.67)', index: 1.67, abbe: 32 },
    { name: 'High-Index (1.74)', index: 1.74, abbe: 33 },
    { name: 'Crown Glass', index: 1.523, abbe: 59 },
];

const formSchema = z.object({
  power: z.coerce.number().min(-20).max(20),
  decentration: z.coerce.number().min(0, "Must be positive."),
  abbe: z.coerce.number().min(20).max(70),
});

type FormValues = z.infer<typeof formSchema>;

export default function ChromaticAberrationPage() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      power: 5.00,
      decentration: 10,
      abbe: 30,
    },
  });

  function onSubmit(values: FormValues) {
    const { power, decentration, abbe } = values;
    
    // TCA = (Power * Decentration in cm) / Abbe
    // Decentration input is in mm, convert to cm
    const tca = Math.abs((power * (decentration / 10)) / abbe);
    setResult(tca);
  }

  return (
    <ToolPageLayout
      title="Chromatic Aberration Calculator"
      description="Calculate the Transverse Chromatic Aberration (TCA) for a lens, which causes perceived color fringes."
    >
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="power"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Power in Meridian of Decentration (D)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.25" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="decentration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decentration from OC (mm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="abbe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abbe Number (V-Value)</FormLabel>
                      <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select or enter" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lensMaterials.map((m) => (
                            <SelectItem key={m.name} value={String(m.abbe)}>{m.name} (V={m.abbe})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full sm:w-auto">
                  <Rainbow className="mr-2 size-4" />
                  Calculate TCA
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="flex items-center justify-center">
            {result !== null ? (
                <Card className="w-full bg-accent/10 border-accent/50">
                    <CardHeader className="items-center text-center">
                        <CardTitle>Transverse Chromatic Aberration</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-2">
                        <p className="text-6xl font-bold tracking-tight text-accent-foreground">
                        {result.toFixed(3)}
                        <span className="text-2xl font-medium text-muted-foreground"> Δ</span>
                        </p>
                        <p className="mt-4 text-sm text-muted-foreground">
                            {result >= 0.1 ? 'Clinically significant. Patient likely to notice color fringes.' : 'Below clinical threshold for most patients.'}
                        </p>
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground/80 text-center w-full">
                            Formula: TCA = (P × d) / V
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
