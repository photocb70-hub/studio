
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


const lensSchema = z.object({
    type: z.string().optional(),
    material: z.string().optional(),
    corridor: z.string().optional(),
});

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
    lens: lensSchema,
});

const formSchema = z.object({
  problem: z.string().min(10, 'Please describe the problem in at least 10 characters.'),
  pathology: z.string().optional(),
  currentRx: binocularRxSchema,
  previousRx: binocularRxSchema,
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
      description: 'Talk through the adaptation period. Ask specific questions about when and where the problem occurs. Manage expectations, especially if pathology is present.',
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

const RxInputGroup = ({ nestName, eye }: { nestName: 'currentRx.od' | 'currentRx.os' | 'previousRx.od' | 'previousRx.os', eye: 'od' | 'os' }) => {
    const { control, watch, getValues, setValue } = useFormContext<FormValues>();
    const { toast } = useToast();

    const sphereValue = watch(`${nestName}.sphere`);
    const cylinderValue = watch(`${nestName}.cylinder`);
    const invertedCylinderValue = cylinderValue !== undefined ? -cylinderValue : 0;
    const axisValue = watch(`${nestName}.axis`);

    const copyMeasurementsOdToOs = () => {
        const parentNest = nestName.split('.')[0] as 'currentRx' | 'previousRx';
        const odMeasurements = {
            pd: getValues(`${parentNest}.od.pd`),
            hts: getValues(`${parentNest}.od.hts`),
        };
        setValue(`${parentNest}.os.pd`, odMeasurements.pd);
        setValue(`${parentNest}.os.hts`, odMeasurements.hts);
        toast({ title: 'Right eye measurements copied to left eye.' });
    };

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
             <div className="md:col-span-2 space-y-4">
                <Separator />
                <div className="flex items-center justify-between">
                    <h5 className="font-medium text-sm">Measurements</h5>
                    {eye === 'od' && (
                         <Button type="button" variant="ghost" size="sm" onClick={copyMeasurementsOdToOs} className="shrink-0 text-xs">
                            <Copy className="mr-2"/>
                            Copy PD & Hts to Left
                        </Button>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
        </div>
    );
};

const BinocularRxInput = ({ nestName, title }: { nestName: 'currentRx' | 'previousRx', title: string }) => {
    const { control, getValues, setValue, watch } = useFormContext<FormValues>();
    const { toast } = useToast();

    const lensType = watch(`${nestName}.lens.type`);

    const copyCurrentToPrevious = () => {
        const currentRxValues = getValues('currentRx');
        setValue('previousRx', currentRxValues);
        toast({ title: 'Current Rx & Lens Details copied to Previous Rx.' });
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
            <div className="space-y-6">
                <Tabs defaultValue="od">
                    <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 border-b">
                        <TabsTrigger value="od" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none">Right Eye (OD)</TabsTrigger>
                        <TabsTrigger value="os" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none">Left Eye (OS)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="od" className="pt-4">
                        <RxInputGroup nestName={`${nestName}.od`} eye="od" />
                    </TabsContent>
                    <TabsContent value="os" className="pt-4">
                        <RxInputGroup nestName={`${nestName}.os`} eye="os"/>
                    </TabsContent>
                </Tabs>
                <Separator />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                     <FormField
                        control={control}
                        name={`${nestName}.lens.type`}
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
                        control={control}
                        name={`${nestName}.lens.material`}
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
                    {lensType === 'var' && (
                        <FormField
                            control={control}
                            name={`${nestName}.lens.corridor`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Min Corridor (mm)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., 14" {...field} value={field.value ?? ''}/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};


export default function DispensingTroubleshooterPage() {
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [showRefundAlert, setShowRefundAlert] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            problem: 'Patient reports that vision feels \'swimmy\' and they feel off-balance with their new glasses, especially when walking around.',
            pathology: 'Early nuclear sclerosis noted in both eyes.',
            isKnob: false,
            currentRx: {
                od: { sphere: -2.50, cylinder: -0.75, axis: 175, pd: '32', hts: '18' },
                os: { sphere: -2.75, cylinder: -1.00, axis: 10, pd: '31.5', hts: '18' },
                lens: { type: 'var', material: '1.67', corridor: '14' }
            },
            previousRx: {
                od: { sphere: -2.25, cylinder: -0.75, axis: 175, pd: '32', hts: '18' },
                os: { sphere: -2.50, cylinder: -0.75, axis: 15, pd: '31.5', hts: '18' },
                lens: { type: 'var', material: '1.50', corridor: '18' }
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

    const onSubmit = (values: FormValues) => {
        const { currentRx, previousRx, isKnob, problem, pathology } = values;

        let keyFinding = "";
        let investigationPoint = "";
        
        const pathologyText = (pathology || '').toLowerCase();
        
        const odHts = parseFloat(currentRx.od.hts || '0');
        const osHts = parseFloat(currentRx.os.hts || '0');
        const corridor = parseFloat(currentRx.lens.corridor || '0');

        if (currentRx.lens.type === 'var' && corridor > 0 && ( (odHts > 0 && odHts < corridor) || (osHts > 0 && osHts < corridor) )) {
            keyFinding = `The fitting height (${odHts || osHts}mm) is lower than the minimum corridor length (${corridor}mm). This can cause the patient to not reach the full reading area.`;
            investigationPoint = "Focus on Step 2: Check Dispensing Parameters, specifically fitting height, and Step 4: Assess Lens Type, consider a shorter corridor lens if frame allows.";
        } else {
             const getRxDiff = (eye: 'od' | 'os') => ({
                sph: Math.abs((currentRx[eye]?.sphere ?? 0) - (previousRx[eye]?.sphere ?? 0)),
                cyl: Math.abs((currentRx[eye]?.cylinder ?? 0) - (previousRx[eye]?.cylinder ?? 0)),
                axis: Math.abs((currentRx[eye]?.axis ?? 90) - (previousRx[eye]?.axis ?? 90)),
            });
    
            const odDiff = getRxDiff('od');
            const osDiff = getRxDiff('os');
    
            const isSignificantChange = 
                odDiff.sph > 0.5 || odDiff.cyl > 0.5 || (odDiff.axis > 10 && (currentRx.od.cylinder ?? 0) !== 0) ||
                osDiff.sph > 0.5 || osDiff.cyl > 0.5 || (osDiff.axis > 10 && (currentRx.os.cylinder ?? 0) !== 0);
            

            if (pathologyText.includes('cataract')) {
                keyFinding = "Patient has cataracts. This can cause reduced VA, glare sensitivity, and myopic shifts, complicating adaptation to any new Rx.";
                investigationPoint = "Focus on Step 5: Discuss Patient Expectations. A perfect refraction may not yield perfect vision.";
            } else if (pathologyText.includes('diabet')) {
                keyFinding = "Patient has diabetes. Uncontrolled blood sugar can cause fluctuations in refractive error, leading to inconsistent vision.";
                investigationPoint = "Focus on Step 5 & 6: Discuss recent blood sugar control. A re-check may be needed if vision is unstable.";
            } else if (pathologyText.includes('amd') || pathologyText.includes('macular')) {
                keyFinding = "Patient has AMD. This affects central vision, causing distortion and reduced detail perception, which new glasses cannot fix.";
                investigationPoint = "Focus on Step 5: Manage Patient Expectations. Explain that glasses correct focus, but can't restore damaged retinal tissue.";
            } else if (isSignificantChange) {
                keyFinding = "There is a significant change in the prescription (sphere, cylinder, or axis) compared to the previous pair.";
                investigationPoint = "Focus on Step 3: Analyze Rx Change.";
            } else if (currentRx.lens?.type && currentRx.lens.type !== previousRx.lens?.type) {
                const lensTypeMap: { [key: string]: string } = { 'var': 'Varifocal', 'bf': 'Bifocal', 'occ': 'Occupational' };
                const lensTypeName = lensTypeMap[currentRx.lens.type] || 'a new lens design';
                keyFinding = `The lens type has changed to a '${lensTypeName}'. If this is a new design for the patient, adaptation may be the primary factor.`;
                investigationPoint = "Focus on Step 4: Assess Lens Type.";
            } else {
                keyFinding = "The previous and current prescriptions are very similar. The issue may lie with dispensing parameters or lens material changes.";
                investigationPoint = "Focus on Step 2: Check Dispensing Parameters and Step 4: Assess Lens Type.";
            }
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
                                    <FormField
                                        control={form.control}
                                        name="pathology"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pathology / Other Notes</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="e.g., Early cataracts, uncontrolled diabetes, AMD, etc."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Separator />
                                    
                                    <div className="space-y-6">
                                        <h3 className="mb-4 text-lg font-medium">Prescriptions & Lens Details (Optional)</h3>
                                        <div className="space-y-6">
                                            <BinocularRxInput nestName="currentRx" title="Current Prescription" />
                                            <Separator />
                                            <BinocularRxInput nestName="previousRx" title="Previous Prescription" />
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

