
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
import { Sparkles, Bot, Loader2, Copy, AlertTriangle } from 'lucide-react';
import { solveProblem, ProblemSolverOutput } from '@/ai/flows/problem-solver-flow';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


const prescriptionSchema = z.object({
  sphere: z.coerce.number().optional(),
  cylinder: z.coerce.number().optional(),
  axis: z.coerce.number().optional(),
  add: z.coerce.number().optional(),
});

const measurementsSchema = z.object({
  pd: z.coerce.number().optional(),
  fittingHeight: z.coerce.number().optional(),
});

const frameSchema = z.object({
  lensMaterial: z.string().optional(),
  lensType: z.string().optional(),
  minFittingHeight: z.coerce.number().optional(),
});

const formSchema = z.object({
  currentPrescription: prescriptionSchema,
  currentMeasurements: measurementsSchema,
  currentFrame: frameSchema,
  previousPrescription: prescriptionSchema,
  previousMeasurements: measurementsSchema,
  previousFrame: frameSchema, 
  problem: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const lensMaterials = [
    { name: 'Standard Index (1.50)', value: '1.50' },
    { name: 'Polycarbonate (1.59)', value: 'Polycarbonate' },
    { name: 'Trivex (1.53)', value: 'Trivex' },
    { name: 'Mid-Index (1.60)', value: '1.60' },
    { name: 'High-Index (1.67)', value: '1.67' },
    { name: 'High-Index (1.74)', value: '1.74' },
];

const lensTypes = [
    { name: 'Single Vision', value: 'Single Vision' },
    { name: 'Bifocal', value: 'Bifocal' },
    { name: 'Progressive', value: 'Progressive' },
    { name: 'Occupational', value: 'Occupational' },
];

function AiProblemSolverContent() {
  const [result, setResult] = useState<ProblemSolverOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      problem: '',
      currentPrescription: { sphere: 0, cylinder: 0 },
      currentMeasurements: {},
      currentFrame: {
        lensMaterial: '1.50',
        lensType: 'Single Vision',
      },
      previousPrescription: { sphere: 0, cylinder: 0 },
      previousMeasurements: {},
      previousFrame: {
        lensMaterial: '1.50',
        lensType: 'Single Vision',
      },
    },
  });
  
  const currentSphere = form.watch('currentPrescription.sphere');
  const currentCylinder = form.watch('currentPrescription.cylinder');
  const previousSphere = form.watch('previousPrescription.sphere');
  const previousCylinder = form.watch('previousPrescription.cylinder');
  
  const currentLensType = form.watch('currentFrame.lensType');
  const previousLensType = form.watch('previousFrame.lensType');

  const proceedToSubmit = async () => {
    setIsAlertOpen(false);
    setIsLoading(true);
    setResult(null);

    const values = form.getValues();

    const query = `
      Problem: ${values.problem || 'N/A'}
      ---
      Current Prescription:
      Sphere: ${values.currentPrescription.sphere || 'N/A'}, Cylinder: ${values.currentPrescription.cylinder || 'N/A'}, Axis: ${values.currentPrescription.axis || 'N/A'}, Add: ${values.currentPrescription.add || 'N/A'}
      Current Measurements:
      PD: ${values.currentMeasurements.pd || 'N/A'}, Fitting Height: ${values.currentMeasurements.fittingHeight || 'N/A'}
      Current Frame/Lens:
      Material: ${values.currentFrame.lensMaterial || 'N/A'}, Type: ${values.currentFrame.lensType || 'N/A'}, Minimum Fitting Height: ${values.currentFrame.minFittingHeight || 'N/A'}
      ---
      Previous Prescription:
      Sphere: ${values.previousPrescription.sphere || 'N/A'}, Cylinder: ${values.previousPrescription.cylinder || 'N/A'}, Axis: ${values.previousPrescription.axis || 'N/A'}, Add: ${values.previousPrescription.add || 'N/A'}
      Previous Measurements:
      PD: ${values.previousMeasurements.pd || 'N/A'}, Fitting Height: ${values.previousMeasurements.fittingHeight || 'N/A'}
      Previous Frame/Lens:
      Material: ${values.previousFrame.lensMaterial || 'N/A'}, Type: ${values.previousFrame.lensType || 'N/A'}, Minimum Fitting Height: ${values.previousFrame.minFittingHeight || 'N/A'}
    `;

    try {
      const response = await solveProblem({ query });
      setResult(response);
    } catch (error) {
      console.error("Error solving problem:", error);
      // You might want to show an error toast to the user here
    } finally {
      setIsLoading(false);
    }
  }

  function onAttemptSubmit() {
    const { currentFrame, previousFrame, problem } = form.getValues();
    if (!currentFrame.lensMaterial || !currentFrame.lensType || !previousFrame.lensMaterial || !previousFrame.lensType || !problem) {
      setIsAlertOpen(true);
    } else {
      proceedToSubmit();
    }
  }

  const handleCopyToPrevious = () => {
    const { currentPrescription, currentMeasurements, currentFrame } = form.getValues();
    
    form.setValue('previousPrescription.sphere', currentPrescription.sphere);
    form.setValue('previousPrescription.cylinder', currentPrescription.cylinder);
    form.setValue('previousPrescription.axis', currentPrescription.axis);
    form.setValue('previousPrescription.add', currentPrescription.add);

    form.setValue('previousMeasurements', currentMeasurements);
    form.setValue('previousFrame', currentFrame);
  };
  
  const formatPower = (power?: number) => {
    if (power === undefined) return '0.00';
    return (power > 0 ? '+' : '') + power.toFixed(2);
  }

  const renderPrescriptionFields = (prefix: 'currentPrescription' | 'previousPrescription', sphereValue?: number, cylinderValue?: number) => (
    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
      <FormField control={form.control} name={`${prefix}.sphere`} render={({ field }) => (
        <FormItem>
          <FormLabel>Sphere: {formatPower(sphereValue)}</FormLabel>
          <FormControl>
            <Slider
                value={[field.value ?? 0]}
                onValueChange={(value) => field.onChange(value[0])}
                min={-20} max={20} step={0.25}
            />
          </FormControl>
        </FormItem>
      )} />
      <FormField control={form.control} name={`${prefix}.cylinder`} render={({ field }) => (
        <FormItem>
          <FormLabel>Cylinder: {formatPower(cylinderValue)}</FormLabel>
          <FormControl>
            <Slider
                value={[field.value ?? 0]}
                onValueChange={(value) => field.onChange(value[0])}
                min={-10} max={10} step={0.25}
            />
          </FormControl>
        </FormItem>
      )} />
      <FormField control={form.control} name={`${prefix}.axis`} render={({ field }) => (
        <FormItem>
          <FormLabel>Axis</FormLabel>
          <FormControl><Input type="number" min="1" max="180" placeholder="90" {...field} value={field.value ?? ''} /></FormControl>
        </FormItem>
      )} />
      <FormField control={form.control} name={`${prefix}.add`} render={({ field }) => (
        <FormItem>
          <FormLabel>Add</FormLabel>
          <FormControl><Input type="number" step="0.25" placeholder="+2.00" {...field} value={field.value ?? ''} /></FormControl>
        </FormItem>
      )} />
    </div>
  );

  const renderMeasurementsFields = (prefix: 'currentMeasurements' | 'previousMeasurements') => (
     <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name={`${prefix}.pd`} render={({ field }) => (
            <FormItem>
                <FormLabel>Patient PD</FormLabel>
                <FormControl><Input type="number" placeholder="64" {...field} value={field.value ?? ''} /></FormControl>
            </FormItem>
        )} />
        <FormField control={form.control} name={`${prefix}.fittingHeight`} render={({ field }) => (
            <FormItem>
                <FormLabel>Fitting Height</FormLabel>
                <FormControl><Input type="number" placeholder="22" {...field} value={field.value ?? ''} /></FormControl>
            </FormItem>
        )} />
    </div>
  );

  const renderFrameFields = (prefix: 'currentFrame' | 'previousFrame') => {
    const lensType = form.watch(prefix);
    return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField control={form.control} name={`${prefix}.lensMaterial`} render={({ field }) => (
            <FormItem>
                <FormLabel>Lens Material</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a material" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {lensMaterials.map(m => <SelectItem key={m.value} value={m.value}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
        )} />
        <FormField control={form.control} name={`${prefix}.lensType`} render={({ field }) => (
            <FormItem>
                <FormLabel>Lens Type</FormLabel>
                 <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a lens type" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {lensTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
        )} />
        {(lensType?.lensType === 'Progressive' || lensType?.lensType === 'Bifocal') && (
            <FormField control={form.control} name={`${prefix}.minFittingHeight`} render={({ field }) => (
                <FormItem>
                    <FormLabel>Minimum Fitting Height</FormLabel>
                    <FormControl><Input type="number" placeholder="14" {...field} value={field.value ?? ''} /></FormControl>
                </FormItem>
            )} />
        )}
    </div>
    )
  };

  return (
    <ToolPageLayout
      title="AI Problem Solver"
      description="Describe a complex optical problem, and the AI will provide a step-by-step solution."
    >
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Incomplete Information</AlertDialogTitle>
                <AlertDialogDescription>
                    You have not filled out all the recommended fields. For the most accurate analysis, please provide as much detail as possible. Do you want to continue anyway?
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={proceedToSubmit}>Continue Anyway</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Describe the Scenario</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={(e) => { e.preventDefault(); onAttemptSubmit(); }} className="space-y-8">
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-foreground">Current Details</h3>
                      <Button type="button" variant="ghost" size="sm" onClick={handleCopyToPrevious} className="gap-2 text-muted-foreground">
                        <Copy className="size-4" />
                        Copy to Previous
                      </Button>
                    </div>
                    <div className="space-y-6 rounded-md border p-4">
                        {renderPrescriptionFields('currentPrescription', currentSphere, currentCylinder)}
                        <hr/>
                        {renderMeasurementsFields('currentMeasurements')}
                        <hr/>
                        {renderFrameFields('currentFrame')}
                    </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="previous-details">
                    <AccordionTrigger>
                      <h3 className="text-lg font-medium text-foreground">Previous Details</h3>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-6 rounded-md border p-4 mt-4">
                          {renderPrescriptionFields('previousPrescription', previousSphere, previousCylinder)}
                          <hr/>
                          {renderMeasurementsFields('previousMeasurements')}
                          <hr/>
                          {renderFrameFields('previousFrame')}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <FormField
                  control={form.control}
                  name="problem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium text-foreground">Primary Complaint / Problem</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'Patient complains of peripheral distortion and dizziness with new glasses. They feel like the floor is tilted.'"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <div className='flex flex-col items-center gap-2'>
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
            <CardContent className="prose prose-sm max-w-none text-accent-foreground">
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


// Suspense boundary is required for useSearchParams
export default function AiProblemSolverPage() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <AiProblemSolverContent />
        </React.Suspense>
    )
}

    