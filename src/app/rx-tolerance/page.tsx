'use client';

import React, { useState } from 'react';
import { useForm, useFormContext, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ToolPageLayout } from '@/components/tool-page-layout';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Check, X, ClipboardCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PowerAdjuster } from '@/components/power-adjuster';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const rxSchema = z.object({
    sphere: z.coerce.number().min(-20).max(20).default(0),
    cylinder: z.coerce.number().min(-10).max(0).default(0),
    axis: z.coerce.number().min(1).max(180).default(90),
});

const formSchema = z.object({
  prescribedRx: rxSchema,
  measuredRx: rxSchema,
});

type FormValues = z.infer<typeof formSchema>;
type ToleranceResult = {
    sphere: { pass: boolean; diff: number; tolerance: number };
    cylinder: { pass: boolean; diff: number; tolerance: number };
    axis: { pass: boolean; diff: number; tolerance: number };
    overall: { pass: boolean; message: string };
};

const RxInputGroup = ({ nestName }: { nestName: 'prescribedRx' | 'measuredRx' }) => {
    const { control } = useFormContext<FormValues>();

    return (
        <div className="grid grid-cols-1 gap-6">
             <FormField
                control={control}
                name={`${nestName}.sphere`}
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                             <PowerAdjuster
                                label="Sphere"
                                value={field.value ?? 0}
                                onChange={field.onChange}
                                min={-20} max={20} step={0.25}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`${nestName}.cylinder`}
                render={({ field }) => (
                     <FormItem>
                        <FormControl>
                            <PowerAdjuster
                                label="Cylinder"
                                value={field.value ?? 0}
                                onChange={field.onChange}
                                min={-10} max={0} step={0.25}
                            />
                        </FormControl>
                      </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`${nestName}.axis`}
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <PowerAdjuster
                                label="Axis"
                                value={field.value ?? 90}
                                onChange={field.onChange}
                                min={1} max={180} step={1}
                                unit="°"
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
        </div>
    );
};

const ResultRow = ({ label, result }: { label: string, result: { pass: boolean, diff: number, tolerance: number } }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="font-medium">{label}</span>
        <div className="flex items-center gap-2">
            <span className="text-muted-foreground tabular-nums">
                (±{result.tolerance.toFixed(label === 'Axis' ? 0 : 2)})
            </span>
            {result.pass ? (
                <span className="font-bold text-green-600 flex items-center gap-1">
                    <Check className="h-4 w-4" /> Pass
                </span>
            ) : (
                <span className="font-bold text-destructive flex items-center gap-1">
                    <X className="h-4 w-4" /> Fail
                </span>
            )}
        </div>
    </div>
);


export default function RxTolerancePage() {
    const [result, setResult] = useState<ToleranceResult | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prescribedRx: { sphere: 0, cylinder: 0, axis: 90 },
            measuredRx: { sphere: 0, cylinder: 0, axis: 90 },
        },
    });
    
    const onSubmit = (values: FormValues) => {
        const { prescribedRx, measuredRx } = values;

        // Sphere Tolerance
        const sphereDiff = Math.abs(prescribedRx.sphere - measuredRx.sphere);
        const sphereTolerance = Math.abs(prescribedRx.sphere) <= 6.00 ? 0.12 : 0.25;
        const spherePass = sphereDiff <= sphereTolerance;

        // Cylinder Tolerance
        const cylDiff = Math.abs(prescribedRx.cylinder - measuredRx.cylinder);
        let cylTolerance: number;
        if (Math.abs(prescribedRx.cylinder) <= 2.00) cylTolerance = 0.12;
        else if (Math.abs(prescribedRx.cylinder) <= 4.00) cylTolerance = 0.18;
        else cylTolerance = 0.25;
        const cylinderPass = cylDiff <= cylTolerance;

        // Axis Tolerance
        const axisDiff = Math.abs(prescribedRx.axis - measuredRx.axis);
        let axisTolerance: number;
        const prescribedCyl = Math.abs(prescribedRx.cylinder);
        if (prescribedCyl <= 0.50) axisTolerance = 7;
        else if (prescribedCyl <= 1.00) axisTolerance = 5;
        else if (prescribedCyl <= 2.00) axisTolerance = 3;
        else axisTolerance = 2;
        const axisPass = prescribedCyl === 0 ? true : axisDiff <= axisTolerance;

        const overallPass = spherePass && cylinderPass && axisPass;

        setResult({
            sphere: { pass: spherePass, diff: sphereDiff, tolerance: sphereTolerance },
            cylinder: { pass: cylinderPass, diff: cylDiff, tolerance: cylTolerance },
            axis: { pass: axisPass, diff: axisDiff, tolerance: axisTolerance },
            overall: { pass: overallPass, message: overallPass ? "Pass" : "Fail: Remake Advised" },
        });
    };

    return (
        <ToolPageLayout
            title="Rx Tolerance Checker"
            description="Enter the prescribed and measured Rx to check against standard manufacturing tolerances."
        >
        <FormProvider {...form}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid gap-8 md:grid-cols-2">
                        <Card>
                            <CardHeader><CardTitle>Prescribed Rx</CardTitle></CardHeader>
                            <CardContent>
                                <RxInputGroup nestName="prescribedRx" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Measured Rx</CardTitle></CardHeader>
                            <CardContent>
                                <RxInputGroup nestName="measuredRx" />
                            </CardContent>
                        </Card>
                    </div>

                    <Button type="submit" className="w-full sm:w-auto">
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        Check Tolerance
                    </Button>

                    {result && (
                        <Card className="bg-accent/10 border-accent/50">
                            <CardHeader>
                                <CardTitle>Tolerance Analysis</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ResultRow label="Sphere" result={result.sphere} />
                                <ResultRow label="Cylinder" result={result.cylinder} />
                                <ResultRow label="Axis" result={result.axis} />
                                <Separator className="my-4" />
                                <div className={`text-center text-xl font-bold ${result.overall.pass ? 'text-green-600' : 'text-destructive'}`}>
                                    {result.overall.message}
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Alert variant="default" className="w-full">
                                    <AlertTitle className="text-xs">Disclaimer</AlertTitle>
                                    <AlertDescription className="text-xs">
                                        Tolerances are based on simplified industry standards (e.g., ISO 21987) and may vary. This tool is for guidance only.
                                    </AlertDescription>
                                </Alert>
                            </CardFooter>
                        </Card>
                    )}
                 </form>
            </Form>
        </FormProvider>
        </ToolPageLayout>
    );
}
