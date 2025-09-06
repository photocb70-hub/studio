
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ToolPageLayout } from '@/components/tool-page-layout';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Bot, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Slider } from '@/components/ui/slider';

const rxSchema = z.object({
    sphere: z.coerce.number().min(-20).max(20).optional().default(0),
    cylinder: z.coerce.number().min(-10).max(0).optional().default(0),
    axis: z.coerce.number().min(1).max(180).optional().default(90),
    add: z.string().optional(),
    prism: z.string().optional(),
    base: z.string().optional(),
});

const formSchema = z.object({
  problem: z.string().min(10, 'Please describe the problem in at least 10 characters.'),
  currentRx: rxSchema.optional(),
  previousRx: rxSchema.optional(),
  lens: z.object({
    type: z.string().optional(),
    material: z.string().optional(),
  }).optional(),
  frame: z.object({
    type: z.string().optional(),
    measurements: z.string().optional(),
  }).optional(),
  isKnob: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ProblemSolverOutput = {
    analysis: string;
    solution: string;
    considerations: string;
};

const formatPower = (power?: number) => {
    if (power === undefined || power === null) return '0.00';
    return (power > 0 ? '+' : '') + power.toFixed(2);
};

const RxInputGroup = ({ nestName }: { nestName: 'currentRx' | 'previousRx' }) => {
    const { control, watch } = useFormContext<FormValues>();

    const sphereValue = watch(`${nestName}.sphere`);
    const cylinderValue = watch(`${nestName}.cylinder`);
    const invertedCylinderValue = cylinderValue !== undefined ? -cylinderValue : 0;
    const axisValue = watch(`${nestName}.axis`);

    return (
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-3">
             <FormField
                control={control}
                name={`${nestName}.sphere`}
                render={({ field }) => (
                    <FormItem className="md:col-span-3">
                        <FormLabel>Sphere (D): {formatPower(sphereValue)}</FormLabel>
                        <FormControl>
                             <Slider
                                value={[field.value ?? 0]}
                                onValueChange={(value) => field.onChange(value[0])}
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
                        <FormLabel>Cylinder (D): {formatPower(cylinderValue)}</FormLabel>
                        <FormControl>
                            <Slider
                                value={[invertedCylinderValue]}
                                onValueChange={(value) => field.onChange(-value[0])}
                                min={0} max={10} step={0.25}
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
                        <FormLabel>Axis (°): {axisValue}</FormLabel>
                        <FormControl>
                            <Slider
                                value={[field.value ?? 90]}
                                onValueChange={(value) => field.onChange(value[0])}
                                min={1} max={180} step={1}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
             <FormField
                control={control}
                name={`${nestName}.add`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Add</FormLabel>
                        <FormControl>
                           <Input placeholder="+2.00" {...field} value={field.value ?? ''} />
                        </FormControl>
                    </FormItem>
                )}
            />
             <FormField
                control={control}
                name={`${nestName}.prism`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Prism</FormLabel>
                        <FormControl>
                           <Input placeholder="2.00" {...field} value={field.value ?? ''} />
                        </FormControl>
                    </FormItem>
                )}
            />
             <FormField
                control={control}
                name={`${nestName}.base`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Base</FormLabel>
                        <FormControl>
                           <Input placeholder="UP" {...field} value={field.value ?? ''} />
                        </FormControl>
                    </FormItem>
                )}
            />
        </div>
    );
};

export default function AiProblemSolverPage() {
    const [result, setResult] = useState<ProblemSolverOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showRefundAlert, setShowRefundAlert] = useState(false);
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            problem: '',
            isKnob: false,
            currentRx: { sphere: 0, cylinder: 0, axis: 90, add: '', prism: '', base: '' },
            previousRx: { sphere: 0, cylinder: 0, axis: 90, add: '', prism: '', base: '' },
        },
    });

    useEffect(() => {
        if (showRefundAlert) {
            const timer = setTimeout(() => {
                setShowRefundAlert(false);
                form.setValue('isKnob', false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showRefundAlert, form]);

    const handleKnobChange = (checked: boolean) => {
        form.setValue('isKnob', checked);
        if (checked) {
            setShowRefundAlert(true);
        }
    };
    
    const getPlaceholderResponse = (values: FormValues): ProblemSolverOutput => {
        if (values.isKnob) {
             return {
                analysis: "The 'Patient is a Knob Head' checkbox was selected.",
                solution: "It has been empirically observed that this is the root cause of approximately 98% of all non-tolerance cases. The recommended course of action is to explain the concept of 'subjective adaptation' and to politely, but firmly, ask the patient to try the new spectacles for at least two weeks. Reassure them that their brain needs time to adjust to the 'superior clarity' of their new prescription.",
                considerations: "Consider offering a complimentary lens cloth and a sympathetic nod. This often provides the necessary placebo effect to facilitate adaptation. Further investigation is unwarranted until this primary factor has been addressed.",
            };
        }
        return {
            analysis: "This is a placeholder analysis. The AI model is currently being updated. Your input has been received, but this response is pre-configured. It seems you've described a dispensing problem.",
            solution: "1. Double-check all measurements, including monocular PDs and fitting heights.\n2. Verify the prescription was ordered and dispensed correctly.\n3. Consider the new frame's wrap, size, and vertex distance compared to the previous pair.",
            considerations: "This is a temporary response. Factors like lens material, base curve, and asphericity could be relevant. The full AI will provide a more detailed analysis based on the specific inputs provided.",
        };
    };

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        setResult(null);
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const response = getPlaceholderResponse(values);
            setResult(response);
        } catch (error) {
            console.error('Error generating placeholder response:', error);
            toast({
                variant: 'destructive',
                title: 'An Unexpected Error Occurred',
                description: 'Could not generate a response. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ToolPageLayout
            title="AI Problem Solver"
            description="Describe a complex optical scenario, provide any relevant data, and the AI will provide an analysis and potential solutions."
        >
            <AlertDialog open={showRefundAlert}>
                 <AlertDialogContent 
                    className="border-destructive text-destructive-foreground p-0"
                    style={{ 
                        backgroundImage: "url('/2poundprofit.jpg')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                     }}
                >
                    <div className="bg-black/60 p-6 rounded-lg">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-center text-4xl font-extrabold tracking-widest text-white">
                                REFUND ! CLOSED !
                            </AlertDialogTitle>
                        </AlertDialogHeader>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            <div className="grid gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Describe the Scenario</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="problem"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Primary Complaint & Scenario</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="e.g., Patient reporting peripheral distortion and headaches with new progressive lenses..."
                                                    className="min-h-[120px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <Separator />

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="mb-4 text-lg font-medium">Prescriptions & Lens Details (Optional)</h3>
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="mb-2 font-medium">Current Prescription</h4>
                                                <RxInputGroup nestName="currentRx" />
                                            </div>
                                            <Separator />
                                            <div>
                                                <h4 className="mb-2 font-medium">Previous Prescription</h4>
                                                <RxInputGroup nestName="previousRx" />
                                            </div>
                                             <Separator />
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="lens.type"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Lens Type/Design</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select a lens type" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="sv">Single Vision</SelectItem>
                                                                    <SelectItem value="bf">Bifocal</SelectItem>
                                                                    <SelectItem value="var">Varifocal</SelectItem>
                                                                    <SelectItem value="occ">Occupational</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="lens.material"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Lens Material/Index</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select a material" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="1.50">Standard Index (1.50)</SelectItem>
                                                                    <SelectItem value="1.59">Polycarbonate (1.59)</SelectItem>
                                                                    <SelectItem value="1.60">Mid-Index (1.60)</SelectItem>
                                                                    <SelectItem value="1.67">High-Index (1.67)</SelectItem>
                                                                    <SelectItem value="1.74">High-Index (1.74)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="frame.type"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Frame Type</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g., Full-rim metal" {...field} value={field.value ?? ''} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="frame.measurements"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Frame Measurements</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="e.g., 54-18-145" {...field} value={field.value ?? ''} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <Separator />
                                                <FormField
                                                    control={form.control}
                                                    name="isKnob"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value}
                                                                    onCheckedChange={handleKnobChange}
                                                                />
                                                            </FormControl>
                                                            <div className="space-y-1 leading-none">
                                                                <FormLabel>
                                                                    Is the px a knob head?
                                                                </FormLabel>
                                                                <FormDescription>
                                                                    Super-secret-diagnostic-tool for complex non-tolerance cases.
                                                                </FormDescription>
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                        </div>
                                    </div>
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
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: result.solution.replace(/\\n/g, '<br />'),
                                }}
                            />
                            <h4>Further Considerations</h4>
                            <p>{result.considerations}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ToolPageLayout>
    );
}
