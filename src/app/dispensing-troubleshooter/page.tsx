
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
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
import { Workflow, Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Slider } from '@/components/ui/slider';
import { Flowchart, type FlowchartStep } from '@/components/ui/flowchart';

const rxSchema = z.object({
    sphere: z.coerce.number().min(-20).max(20).optional().default(0),
    cylinder: z.coerce.number().min(-10).max(0).optional().default(0),
    axis: z.coerce.number().min(1).max(180).optional().default(90),
    add: z.string().optional(),
    prism: z.string().optional(),
    base: z.string().optional(),
    pd: z.string().optional(),
    hts: z.string().optional(),
});

const formSchema = z.object({
  problem: z.string().min(10, 'Please describe the problem in at least 10 characters.'),
  currentRx: rxSchema.optional(),
  previousRx: rxSchema.optional(),
  lens: z.object({
    type: z.string().optional(),
    material: z.string().optional(),
  }).optional(),
  isKnob: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const staticFlowchart: FlowchartStep[] = [
    {
      title: 'Verify Prescription',
      description: 'Check the measured Rx against what was prescribed. Ensure transcription was accurate.',
    },
    {
      title: 'Check Dispensing Parameters',
      description: 'Confirm Pupil Distance (PD), Fitting Heights (Hts), Pantoscopic Tilt, and Face Form Angle.',
    },
    {
      title: 'Analyze Rx Change',
      description: 'Compare the new Rx to the previous one. Note significant changes in axis, cylinder, or sphere.',
    },
    {
      title: 'Assess Lens Type & Material',
      description: 'Is this a new lens design (e.g., first varifocal)? Is the material different (e.g., higher index)? Consider adaptation issues.',
    },
    {
      title: 'Discuss with Patient',
      description: 'Talk through the adaptation period. Ask specific questions about when and where the problem occurs.',
    },
    {
      title: 'Final Action',
      description: 'If issues persist, consider a re-check with the optometrist or a trial with the previous prescription.',
    },
];

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
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-2">
             <FormField
                control={control}
                name={`${nestName}.sphere`}
                render={({ field }) => (
                    <FormItem>
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
            <div className="grid grid-cols-2 gap-4 md:col-span-2 md:grid-cols-4">
                 <FormField
                    control={control}
                    name={`${nestName}.pd`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>PD (mm)</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., 64" {...field} value={field.value ?? ''} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                 <FormField
                    control={control}
                    name={`${nestName}.hts`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Heights (mm)</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., 22" {...field} value={field.value ?? ''} />
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
        </div>
    );
};

export default function DispensingTroubleshooterPage() {
    const [result, setResult] = useState<FlowchartStep[] | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showRefundAlert, setShowRefundAlert] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            problem: '',
            isKnob: false,
            currentRx: { sphere: 0, cylinder: 0, axis: 90, add: '', prism: '', base: '', pd: '', hts: '' },
            previousRx: { sphere: 0, cylinder: 0, axis: 90, add: '', prism: '', base: '', pd: '', hts: '' },
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

    const onSubmit = async (values: FormValues) => {
        setIsSubmitted(true);
        setResult(staticFlowchart);
    };

    return (
        <ToolPageLayout
            title="Dispensing Troubleshooter"
            description="A step-by-step guide for investigating and resolving common spectacle non-tolerance issues."
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
                        <FormProvider {...form}>
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
                                    
                                    <Button type="submit" className="w-full sm:w-auto">
                                        <Search className="mr-2 size-4" />
                                        Show Troubleshooting Steps
                                    </Button>
                                </form>
                            </Form>
                        </FormProvider>
                    </CardContent>
                </Card>

                {isSubmitted && result && (
                    <Card className="bg-accent/10 border-accent/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Workflow />
                                Standard Investigation Flowchart
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Flowchart steps={result} />
                        </CardContent>
                    </Card>
                )}
            </div>
        </ToolPageLayout>
    );
}
