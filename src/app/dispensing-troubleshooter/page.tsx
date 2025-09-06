
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
import { Workflow, Search, AlertTriangle, Copy } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Slider } from '@/components/ui/slider';
import { Flowchart, type FlowchartStep } from '@/components/ui/flowchart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


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

const binocularRxSchema = z.object({
    od: rxSchema,
    os: rxSchema,
});

const formSchema = z.object({
  problem: z.string().min(10, 'Please describe the problem in at least 10 characters.'),
  currentRx: binocularRxSchema,
  previousRx: binocularRxSchema,
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

type AnalysisResult = {
  primaryConcern: string;
  keyFinding: string;
  investigationPoint: string;
  isKnob: boolean;
};

const formatPower = (power?: number) => {
    if (power === undefined || power === null) return '0.00';
    return (power > 0 ? '+' : '') + power.toFixed(2);
};

const RxInputGroup = ({ nestName }: { nestName: 'currentRx.od' | 'currentRx.os' | 'previousRx.od' | 'previousRx.os' }) => {
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
                            <Input placeholder="e.g., 30" {...field} value={field.value ?? ''} />
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

const BinocularRxInput = ({ nestName, title }: { nestName: 'currentRx' | 'previousRx', title: string }) => {
    const { getValues, setValue } = useFormContext<FormValues>();
    const { toast } = useToast();

    const copyMeasurementsOdToOs = () => {
        const odMeasurements = {
            pd: getValues(`${nestName}.od.pd`),
            hts: getValues(`${nestName}.od.hts`),
            prism: getValues(`${nestName}.od.prism`),
            base: getValues(`${nestName}.od.base`),
        };
        setValue(`${nestName}.os.pd`, odMeasurements.pd);
        setValue(`${nestName}.os.hts`, odMeasurements.hts);
        setValue(`${nestName}.os.prism`, odMeasurements.prism);
        setValue(`${nestName}.os.base`, odMeasurements.base);
        toast({ title: 'Right eye measurements copied to left eye.' });
    };

    const copyCurrentToPrevious = () => {
        const currentRxValues = getValues('currentRx');
        setValue('previousRx', currentRxValues);
        toast({ title: 'Current Rx copied to Previous Rx.' });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{title}</h4>
                {nestName === 'previousRx' && (
                    <Button type="button" variant="ghost" size="sm" onClick={copyCurrentToPrevious} className="text-xs">
                        <Copy className="mr-2"/>
                        Copy Current Rx
                    </Button>
                )}
            </div>
            <Tabs defaultValue="od">
                 <div className="flex justify-between items-center border-b">
                    <TabsList className="grid w-full grid-cols-2 bg-transparent p-0">
                        <TabsTrigger value="od" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none">Right Eye (OD)</TabsTrigger>
                        <TabsTrigger value="os" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none">Left Eye (OS)</TabsTrigger>
                    </TabsList>
                    <Button type="button" variant="ghost" size="sm" onClick={copyMeasurementsOdToOs} className="shrink-0 text-xs">
                        <Copy className="mr-2"/>
                        Copy Measurements to Left
                    </Button>
                </div>
                <TabsContent value="od" className="pt-4">
                    <RxInputGroup nestName={`${nestName}.od`} />
                </TabsContent>
                <TabsContent value="os" className="pt-4">
                    <RxInputGroup nestName={`${nestName}.os`} />
                </TabsContent>
            </Tabs>
        </div>
    );
};


export default function DispensingTroubleshooterPage() {
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [showRefundAlert, setShowRefundAlert] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            problem: '',
            isKnob: false,
            currentRx: {
                od: { sphere: 0, cylinder: 0, axis: 90, add: '', prism: '', base: '', pd: '', hts: '' },
                os: { sphere: 0, cylinder: 0, axis: 90, add: '', prism: '', base: '', pd: '', hts: '' },
            },
            previousRx: {
                od: { sphere: 0, cylinder: 0, axis: 90, add: '', prism: '', base: '', pd: '', hts: '' },
                os: { sphere: 0, cylinder: 0, axis: 90, add: '', prism: '', base: '', pd: '', hts: '' },
            },
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
        const { currentRx, previousRx, lens, isKnob, problem } = values;

        const getRxDiff = (eye: 'od' | 'os') => ({
            sph: Math.abs((currentRx[eye]?.sphere ?? 0) - (previousRx[eye]?.sphere ?? 0)),
            cyl: Math.abs((currentRx[eye]?.cylinder ?? 0) - (previousRx[eye]?.cylinder ?? 0)),
            axis: Math.abs((currentRx[eye]?.axis ?? 0) - (previousRx[eye]?.axis ?? 0)),
        });

        const odDiff = getRxDiff('od');
        const osDiff = getRxDiff('os');

        const isSignificantChange = 
            odDiff.sph > 0.5 || odDiff.cyl > 0.5 || odDiff.axis > 10 ||
            osDiff.sph > 0.5 || osDiff.cyl > 0.5 || osDiff.axis > 10;

        let keyFinding = "The previous and current prescriptions are very similar. The issue may lie with dispensing parameters or lens type.";
        let investigationPoint = "Focus on Step 2: Check Dispensing Parameters.";

        if (isSignificantChange) {
            keyFinding = "There is a significant change in the prescription (sphere, cylinder, or axis) compared to the previous pair.";
            investigationPoint = "Focus on Step 3: Analyze Rx Change.";
        } else if (lens?.type) {
            keyFinding = `The lens type is a '${lens.type}'. If this is a new design for the patient, adaptation may be the primary factor.`;
            investigationPoint = "Focus on Step 4: Assess Lens Type.";
        }

        setAnalysisResult({
            primaryConcern: problem,
            keyFinding: keyFinding,
            investigationPoint: investigationPoint,
            isKnob: isKnob ?? false,
        });
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
                                                <BinocularRxInput nestName="currentRx" title="Current Prescription" />
                                                <Separator />
                                                <BinocularRxInput nestName="previousRx" title="Previous Prescription" />
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
                                        Analyze Scenario
                                    </Button>
                                </form>
                            </Form>
                        </FormProvider>
                    </CardContent>
                </Card>

                {analysisResult && (
                    <div className="space-y-8">
                        <Card className="border-accent/60">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-accent-foreground">
                                    <AlertTriangle />
                                    Analysis Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold">Primary Concern</h4>
                                    <p className="text-muted-foreground">"{analysisResult.primaryConcern}"</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Key Finding</h4>
                                    <p className="text-muted-foreground">{analysisResult.keyFinding}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Suggested Starting Point</h4>
                                    <p className="text-muted-foreground">{analysisResult.investigationPoint}</p>
                                </div>
                                {analysisResult.isKnob && (
                                    <>
                                     <Separator />
                                     <div>
                                        <h4 className="font-semibold">Additional Consideration</h4>
                                        <p className="text-muted-foreground">The "knob head" factor is enabled. Remember, clear communication and empathy are your best tools in complex cases!</p>
                                     </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="bg-accent/10 border-accent/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Workflow />
                                    Standard Investigation Flowchart
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Flowchart steps={staticFlowchart} />
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
}

    