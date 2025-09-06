
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Footprints } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const formSchema = z.object({
  objectVergence: z.coerce.number(),
  surfacePower1: z.coerce.number().min(-20).max(20),
  surfacePower2: z.coerce.number().optional(),
  refractiveIndex: z.coerce.number().min(1),
});

type FormValues = z.infer<typeof formSchema>;
type Result = {
    L_prime: number;
    l_prime: number;
    L2_prime?: number;
    l2_prime?: number;
    inputs: FormValues;
};

const lensMaterials = [
    { name: 'Air', index: 1.000 },
    { name: 'Water', index: 1.333 },
    { name: 'Aqueous', index: 1.336 },
    { name: 'Cornea', index: 1.376 },
    { name: 'Standard Index (1.50)', index: 1.498 },
    { name: 'Crown Glass', index: 1.523 },
    { name: 'Polycarbonate (1.59)', index: 1.586 },
    { name: 'Mid-Index (1.60)', index: 1.60 },
    { name: 'High-Index (1.67)', index: 1.67 },
    { name: 'High-Index (1.74)', index: 1.74 },
];

export default function StepAlongPage() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      objectVergence: 0,
      surfacePower1: 0,
      surfacePower2: 0,
      refractiveIndex: 1.498,
    },
  });

  const surfacePower1Value = form.watch('surfacePower1');
  const objectVergenceValue = form.watch('objectVergence');

  function onSubmit(values: FormValues) {
    const { objectVergence, surfacePower1, surfacePower2, refractiveIndex } = values;

    // L' = L + F
    const L_prime = objectVergence + surfacePower1;
    // l' = n' / L'
    const l_prime = refractiveIndex / L_prime;
    
    let L2_prime;
    let l2_prime;

    if (surfacePower2 !== undefined && surfacePower2 !== null && surfacePower2 !== 0) {
      // If there's an astigmatic power, calculate the second meridian
      const L2 = objectVergence; // Object vergence is the same for both meridians
      L2_prime = L2 + surfacePower2;
      l2_prime = refractiveIndex / L2_prime;
    }
    
    setResult({ L_prime, l_prime, L2_prime, l2_prime, inputs: values });
  }

  return (
    <ToolPageLayout
      title="Step-Along Vergence Calculator"
      description="Calculate the vergence of light after passing through one or more optical surfaces."
    >
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enter System Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="objectVergence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Object Vergence (L, in Diopters): {objectVergenceValue.toFixed(2)}</FormLabel>
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
                  name="surfacePower1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Surface Power (F1, in Diopters): {surfacePower1Value.toFixed(2)}</FormLabel>
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
                  name="surfacePower2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Astigmatic Surface Power (F2, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Enter for astigmatic systems" {...field} onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}/>
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="refractiveIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refractive Index of Final Medium (n')</FormLabel>
                      <Select 
                        onValueChange={(v) => field.onChange(parseFloat(v))} 
                        defaultValue={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a material" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lensMaterials.map((material) => (
                            <SelectItem key={`${material.name}-${material.index}`} value={String(material.index)}>
                              {material.name} ({material.index})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full sm:w-auto">
                  <Footprints className="mr-2 size-4" />
                  Calculate Vergence
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="flex items-center justify-center">
            {result ? (
                <Card className="w-full bg-accent/10 border-accent/50">
                    <CardHeader className="items-center text-center">
                        <CardTitle>Resulting Image Vergence</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-2">
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Meridian 1 (F1)</p>
                                <p className="text-4xl font-bold tracking-tight text-accent-foreground">
                                    {result.L_prime.toFixed(2)} D
                                </p>
                                <p className="text-lg text-muted-foreground">
                                    at {(result.l_prime * 100).toFixed(2)} cm
                                </p>
                            </div>

                            {result.L2_prime !== undefined && result.l2_prime !== undefined && (
                                <>
                                    <Separator className="my-2" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Meridian 2 (F2)</p>
                                        <p className="text-4xl font-bold tracking-tight text-accent-foreground">
                                            {result.L2_prime.toFixed(2)} D
                                        </p>
                                        <p className="text-lg text-muted-foreground">
                                            at {(result.l2_prime * 100).toFixed(2)} cm
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                     <CardFooter className="flex-col items-start p-4 text-xs text-muted-foreground/80">
                        <p className="font-semibold text-foreground mb-2">Calculation Breakdown:</p>
                        <div className="font-mono text-left w-full space-y-2 rounded-md bg-background/50 p-3">
                           <div>
                                <p>L' = L + F₁</p>
                                <p className="pl-2">L' = {result.inputs.objectVergence.toFixed(2)} + {result.inputs.surfacePower1.toFixed(2)} = {result.L_prime.toFixed(2)} D</p>
                           </div>
                           <div>
                                <p>l' = n' / L'</p>
                                <p className="pl-2">l' = {result.inputs.refractiveIndex.toFixed(3)} / {result.L_prime.toFixed(2)} = {result.l_prime.toFixed(4)} m</p>
                           </div>
                           {result.L2_prime !== undefined && result.inputs.surfacePower2 !== undefined && (
                             <>
                                <Separator className="my-2 bg-muted-foreground/30"/>
                                <div>
                                    <p>L'₂ = L + F₂</p>
                                    <p className="pl-2">L'₂ = {result.inputs.objectVergence.toFixed(2)} + {result.inputs.surfacePower2.toFixed(2)} = {result.L2_prime.toFixed(2)} D</p>
                               </div>
                               <div>
                                    <p>l'₂ = n' / L'₂</p>
                                    <p className="pl-2">l'₂ = {result.inputs.refractiveIndex.toFixed(3)} / {result.L2_prime.toFixed(2)} = {result.l2_prime?.toFixed(4)} m</p>
                               </div>
                             </>
                           )}
                        </div>
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
    
