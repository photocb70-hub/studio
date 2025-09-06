
'use client';

import React, { useState } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ToolPageLayout } from '@/components/tool-page-layout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const lensMaterials = [
    { name: 'Standard Index (1.50)', index: 1.498 },
    { name: 'Polycarbonate (1.59)', index: 1.586 },
    { name: 'Mid-Index (1.60)', index: 1.60 },
    { name: 'High-Index (1.67)', index: 1.67 },
    { name: 'High-Index (1.74)', index: 1.74 },
];

const lensSchema = z.object({
    sphere: z.coerce.number().default(0),
    baseCurve: z.coerce.number().default(6.0),
    thickness: z.coerce.number().default(2.0),
    index: z.coerce.number().default(1.498),
    bvd: z.coerce.number().default(12),
});

const formSchema = z.object({
  oldRx: lensSchema,
  newRx: lensSchema,
});

type FormValues = z.infer<typeof formSchema>;
type LensValues = z.infer<typeof lensSchema>;

const LensInputGroup = ({ nestName }: { nestName: 'oldRx' | 'newRx' }) => {
    const { control, watch } = useFormContext<FormValues>();
    const sphereValue = watch(`${nestName}.sphere`);

    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name={`${nestName}.sphere`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Sphere (D): {sphereValue?.toFixed(2)}</FormLabel>
                        <FormControl>
                            <Slider value={[field.value ?? 0]} onValueChange={(v) => field.onChange(v[0])} min={-20} max={20} step={0.25} />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`${nestName}.baseCurve`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Front Base Curve (D)</FormLabel>
                        <FormControl><Input type="number" step="0.25" {...field} /></FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`${nestName}.thickness`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Center Thickness (mm)</FormLabel>
                        <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                    </FormItem>
                )}
            />
             <FormField
                control={control}
                name={`${nestName}.index`}
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Refractive Index (n)</FormLabel>
                    <Select onValueChange={(e) => field.onChange(parseFloat(e))} defaultValue={String(field.value)}>
                    <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a material" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {lensMaterials.map((material) => (
                        <SelectItem key={material.name} value={String(material.index)}>
                            {material.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`${nestName}.bvd`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Vertex Distance (mm)</FormLabel>
                        <FormControl><Input type="number" step="1" {...field} /></FormControl>
                    </FormItem>
                )}
            />
        </div>
    );
};

const MagnificationVisual = ({ scale }: { scale: number }) => (
    <div className="relative w-full aspect-square bg-muted/30 rounded-lg overflow-hidden">
        {/* Grid Background */}
        <div 
            className="absolute inset-0 grid grid-cols-10 grid-rows-10"
            style={{
                backgroundSize: '20px 20px',
                backgroundImage: 'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)',
            }}
        />
        {/* Scaled Circle */}
        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300" style={{ transform: `scale(${scale})` }}>
            <div className="w-1/2 h-1/2 rounded-full bg-primary/30 border-2 border-primary" />
        </div>
    </div>
);

export default function RelativeMagnificationPage() {
    const [result, setResult] = useState<number | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            oldRx: { sphere: -4.00, baseCurve: 2.00, thickness: 1.5, index: 1.67, bvd: 12 },
            newRx: { sphere: -4.00, baseCurve: 6.00, thickness: 2.5, index: 1.498, bvd: 14 },
        },
    });

    const calculateMagnification = (lens: LensValues): number => {
        const { sphere, baseCurve, thickness, index, bvd } = lens;
        // Convert mm to meters
        const t = thickness / 1000;
        const h = bvd / 1000;

        // Shape Factor
        const shapeFactor = 1 / (1 - (t / index) * baseCurve);
        // Power Factor
        const powerFactor = 1 / (1 - h * sphere);
        
        return shapeFactor * powerFactor;
    };

    const onSubmit = (values: FormValues) => {
        const magOld = calculateMagnification(values.oldRx);
        const magNew = calculateMagnification(values.newRx);
        const relativeMag = ((magNew / magOld) - 1) * 100;
        setResult(relativeMag);
    };

    const visualScale = result === null ? 1 : 1 + (result / 100);

    return (
        <ToolPageLayout
            title="Relative Magnification Calculator"
            description="Compare magnification effects between two lenses to help manage patient expectations."
        >
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader><CardTitle>Old Rx</CardTitle></CardHeader>
                        <CardContent><LensInputGroup nestName="oldRx" /></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>New Rx</CardTitle></CardHeader>
                        <CardContent><LensInputGroup nestName="newRx" /></CardContent>
                    </Card>
                    <div className="md:col-span-2 lg:col-span-1">
                        {result !== null ? (
                            <Card className="w-full bg-accent/10 border-accent/50 sticky top-24">
                                <CardHeader className="items-center text-center">
                                    <CardTitle>Relative Magnification</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center pb-2 space-y-4">
                                    <p className="text-5xl font-bold tracking-tight text-accent-foreground">
                                        {result > 0 ? '+' : ''}{result.toFixed(2)}%
                                    </p>
                                    <MagnificationVisual scale={visualScale} />
                                    <p className="text-sm text-muted-foreground">
                                        This visual demonstrates the approximate change in image size the patient might experience.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="flex sticky top-24 h-full min-h-[200px] w-full items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center text-muted-foreground">
                                <p>Results will be displayed here.</p>
                            </div>
                        )}
                    </div>
                </div>

                <Button type="submit" className="w-full sm:w-auto">
                    <Calculator className="mr-2 size-4" />
                    Calculate Magnification
                </Button>
            </form>
        </FormProvider>
        </ToolPageLayout>
    );
}
