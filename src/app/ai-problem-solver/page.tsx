
'use client';

import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Bot, Loader2 } from 'lucide-react';
import { solveProblem, ProblemSolverOutput } from '@/ai/flows/problem-solver-flow';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  complaint: z.string().min(10, "Please describe the primary complaint."),
  currentSphere: z.coerce.number().optional(),
  currentCylinder: z.coerce.number().optional(),
  currentAxis: z.coerce.number().optional(),
  currentAdd: z.coerce.number().optional(),
  currentPrism: z.coerce.number().optional(),
  currentPrismBase: z.string().optional(),
  previousSphere: z.coerce.number().optional(),
  previousCylinder: z.coerce.number().optional(),
  previousAxis: z.coerce.number().optional(),
  previousAdd: z.coerce.number().optional(),
  previousPrism: z.coerce.number().optional(),
  previousPrismBase: z.string().optional(),
  lensDetails: z.string().optional(),
  measurements: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const RxInputGroup = ({ control, groupName }: { control: any, groupName: 'current' | 'previous' }) => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
                control={control}
                name={`${groupName}Sphere`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Sphere</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.25" placeholder="0.00" {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`${groupName}Cylinder`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Cylinder</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.25" placeholder="0.00" {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`${groupName}Axis`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Axis</FormLabel>
                        <FormControl>
                            <Input type="number" step="1" placeholder="90" {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <FormField
                control={control}
                name={`${groupName}Add`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Add</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.25" placeholder="+0.00" {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`${groupName}Prism`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Prism</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.25" placeholder="0.00" {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`${groupName}PrismBase`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Base</FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="e.g., In, Up" {...field} />
                        </FormControl>
                    </FormItem>
                )}
            />
        </div>
    </div>
);


export default function AiProblemSolverPage() {
    const [result, setResult] = useState<ProblemSolverOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    const formatRx = (values: FormValues, group: 'current' | 'previous') => {
        const sph = values[`${group}Sphere`];
        const cyl = values[`${group}Cylinder`];
        const axis = values[`${group}Axis`];
        const add = values[`${group}Add`];
        const prism = values[`${group}Prism`];
        const base = values[`${group}PrismBase`];

        if (sph === undefined && cyl === undefined && axis === undefined && add === undefined && prism === undefined) return null;
        
        let rxString = `${sph?.toFixed(2) || '0.00'} / ${cyl?.toFixed(2) || '0.00'} x ${axis || '0'}`;
        if (add) rxString += ` Add ${add.toFixed(2)}`;
        if (prism && base) rxString += ` Prism ${prism.toFixed(2)} Base ${base}`;

        return rxString;
    }

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        setResult(null);

        const currentRx = formatRx(values, 'current');
        const previousRx = formatRx(values, 'previous');

        const queryParts = [
            `Primary Complaint: ${values.complaint}`,
            currentRx && `Current Rx: ${currentRx}`,
            previousRx && `Previous Rx: ${previousRx}`,
            values.lensDetails && `Lens/Frame Details: ${values.lensDetails}`,
            values.measurements && `Measurements: ${values.measurements}`,
        ];
        
        const query = queryParts.filter(Boolean).join('\n');

        try {
            const response = await solveProblem({ query });
            setResult(response);
        } catch (error) {
            console.error("Error solving problem:", error);
            // You might want to show an error toast to the user here
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ToolPageLayout
        title="AI Problem Solver"
        description="Describe a complex optical problem, and the AI will provide a step-by-step solution."
        >
        <div className="grid gap-8">
            <Card>
            <CardHeader>
                <CardTitle>Describe the Scenario</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="complaint"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Patient's Primary Complaint</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="e.g., 'Patient complains of peripheral distortion and headaches with new glasses...'"
                                        className="min-h-[100px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <Separator />
                    
                    <div>
                        <h3 className="text-lg font-medium mb-4">Current Prescription (Optional)</h3>
                        <RxInputGroup control={form.control} groupName="current" />
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-4">Previous Prescription (Optional)</h3>
                        <RxInputGroup control={form.control} groupName="previous" />
                    </div>

                    <Separator />
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="lensDetails"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lens & Frame Details (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g., 'Current: 1.67 SV / Prev: 1.5 Poly. New frame is much larger with a higher base curve.'"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="measurements"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Measurements (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g., 'PD: 64/61, Fitting Heights: 18mm, BVD: 10mm'"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <Checkbox id="knob-checkbox" />
                        <label
                            htmlFor="knob-checkbox"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Is the px a knob?
                        </label>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 size-4" />
                    )}
                    Solve Problem
                    </Button>
                </form>
                </Form>
            </CardContent>
            </Card>

            {isLoading && (
            <div className="flex min-h-[200px] w-full items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                <Bot className="size-8 animate-pulse" />
                <p>AI is thinking...</p>
                </div>
            </div>
            )}

            {result && (
            <Card className="bg-accent/10 border-accent/50">
                <CardHeader>
                <CardTitle>AI Generated Solution</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none text-accent-foreground dark:prose-invert">
                <h4>Analysis</h4>
                <p>{result.analysis}</p>
                <h4>Recommended Solution</h4>
                <p>{result.solution}</p>
                <h4>Further Considerations</h4>
                <p>{result.considerations}</p>
                </CardContent>
            </Card>
            )}
        </div>
        </ToolPageLayout>
    );
}
