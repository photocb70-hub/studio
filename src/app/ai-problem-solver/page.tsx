
'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { Sparkles, Bot, Loader2, Lock } from 'lucide-react';
import { solveProblem, ProblemSolverOutput } from '@/ai/flows/problem-solver-flow';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


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
  frameDetails: z.string().optional(),
});

const formSchema = z.object({
  currentPrescription: prescriptionSchema,
  currentMeasurements: measurementsSchema,
  currentFrame: frameSchema,
  previousPrescription: prescriptionSchema,
  previousMeasurements: measurementsSchema,
  previousFrame: frameSchema,
  problem: z.string().min(10, "Please describe the problem in at least 10 characters."),
});

type FormValues = z.infer<typeof formSchema>;

function AiProblemSolverContent() {
  const [result, setResult] = useState<ProblemSolverOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const isEnabled = useMemo(() => searchParams.get('enabled') === 'true', [searchParams]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      problem: '',
      currentPrescription: {},
      currentMeasurements: {},
      currentFrame: {},
      previousPrescription: {},
      previousMeasurements: {},
      previousFrame: {},
    },
  });

  async function onSubmit(values: FormValues) {
    if (!isEnabled) return;
    setIsLoading(true);
    setResult(null);

    const query = `
      Problem: ${values.problem}
      ---
      Current Prescription:
      Sphere: ${values.currentPrescription.sphere || 'N/A'}, Cylinder: ${values.currentPrescription.cylinder || 'N/A'}, Axis: ${values.currentPrescription.axis || 'N/A'}, Add: ${values.currentPrescription.add || 'N/A'}
      Current Measurements:
      PD: ${values.currentMeasurements.pd || 'N/A'}, Fitting Height: ${values.currentMeasurements.fittingHeight || 'N/A'}
      Current Frame/Lens:
      Material: ${values.currentFrame.lensMaterial || 'N/A'}, Type: ${values.currentFrame.lensType || 'N/A'}, Details: ${values.currentFrame.frameDetails || 'N/A'}
      ---
      Previous Prescription:
      Sphere: ${values.previousPrescription.sphere || 'N/A'}, Cylinder: ${values.previousPrescription.cylinder || 'N/A'}, Axis: ${values.previousPrescription.axis || 'N/A'}, Add: ${values.previousPrescription.add || 'N/A'}
      Previous Measurements:
      PD: ${values.previousMeasurements.pd || 'N/A'}, Fitting Height: ${values.previousMeasurements.fittingHeight || 'N/A'}
      Previous Frame/Lens:
      Material: ${values.previousFrame.lensMaterial || 'N/A'}, Type: ${values.previousFrame.lensType || 'N/A'}, Details: ${values.previousFrame.frameDetails || 'N/A'}
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

  const renderPrescriptionFields = (prefix: 'currentPrescription' | 'previousPrescription') => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <FormField control={form.control} name={`${prefix}.sphere`} render={({ field }) => (
        <FormItem>
          <FormLabel>Sphere</FormLabel>
          <FormControl><Input type="number" step="0.25" placeholder="-2.50" {...field} /></FormControl>
        </FormItem>
      )} />
      <FormField control={form.control} name={`${prefix}.cylinder`} render={({ field }) => (
        <FormItem>
          <FormLabel>Cylinder</FormLabel>
          <FormControl><Input type="number" step="0.25" placeholder="-1.00" {...field} /></FormControl>
        </FormItem>
      )} />
      <FormField control={form.control} name={`${prefix}.axis`} render={({ field }) => (
        <FormItem>
          <FormLabel>Axis</FormLabel>
          <FormControl><Input type="number" placeholder="90" {...field} /></FormControl>
        </FormItem>
      )} />
      <FormField control={form.control} name={`${prefix}.add`} render={({ field }) => (
        <FormItem>
          <FormLabel>Add</FormLabel>
          <FormControl><Input type="number" step="0.25" placeholder="+2.00" {...field} /></FormControl>
        </FormItem>
      )} />
    </div>
  );

  const renderMeasurementsFields = (prefix: 'currentMeasurements' | 'previousMeasurements') => (
     <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name={`${prefix}.pd`} render={({ field }) => (
            <FormItem>
                <FormLabel>Patient PD</FormLabel>
                <FormControl><Input type="number" placeholder="64" {...field} /></FormControl>
            </FormItem>
        )} />
        <FormField control={form.control} name={`${prefix}.fittingHeight`} render={({ field }) => (
            <FormItem>
                <FormLabel>Fitting Height</FormLabel>
                <FormControl><Input type="number" placeholder="22" {...field} /></FormControl>
            </FormItem>
        )} />
    </div>
  );

  const renderFrameFields = (prefix: 'currentFrame' | 'previousFrame') => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField control={form.control} name={`${prefix}.lensMaterial`} render={({ field }) => (
            <FormItem>
                <FormLabel>Lens Material</FormLabel>
                <FormControl><Input placeholder="e.g., Polycarbonate" {...field} /></FormControl>
            </FormItem>
        )} />
        <FormField control={form.control} name={`${prefix}.lensType`} render={({ field }) => (
            <FormItem>
                <FormLabel>Lens Type</FormLabel>
                <FormControl><Input placeholder="e.g., Progressive" {...field} /></FormControl>
            </FormItem>
        )} />
        <div className="sm:col-span-2">
            <FormField control={form.control} name={`${prefix}.frameDetails`} render={({ field }) => (
                <FormItem>
                    <FormLabel>Frame Details</FormLabel>
                    <FormControl><Input placeholder="e.g., Zyl, 52-18-140" {...field} /></FormControl>
                </FormItem>
            )} />
        </div>
    </div>
  );

  return (
    <ToolPageLayout
      title="AI Problem Solver"
      description="Describe a complex optical problem, and the AI will provide a step-by-step solution."
    >
      <div className="grid gap-8">
        {!isEnabled && (
            <Alert variant="default" className="border-accent/50 bg-accent/10 text-accent-foreground">
                <Lock className="size-4" />
                <AlertTitle>Testing Mode</AlertTitle>
                <AlertDescription>
                    This feature is currently under development and is not yet available for general use.
                </AlertDescription>
            </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Describe the Scenario</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-foreground">Current Details</h3>
                    <div className="space-y-6 rounded-md border p-4">
                        {renderPrescriptionFields('currentPrescription')}
                        <hr/>
                        {renderMeasurementsFields('currentMeasurements')}
                        <hr/>
                        {renderFrameFields('currentFrame')}
                    </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="previous-details">
                    <AccordionTrigger>
                      <h3 className="text-lg font-medium text-foreground">Previous Details (Optional)</h3>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-6 rounded-md border p-4 mt-4">
                          {renderPrescriptionFields('previousPrescription')}
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
                <Button type="submit" disabled={isLoading || !isEnabled} className="w-full sm:w-auto">
                  {isLoading ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : !isEnabled ? (
                    <Lock className="mr-2 size-4" />
                  ) : (
                    <Sparkles className="mr-2 size-4" />
                  )}
                  {isEnabled ? 'Solve Problem' : 'Feature Disabled'}
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
