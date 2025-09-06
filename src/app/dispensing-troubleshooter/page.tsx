
'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Workflow, Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Flowchart, type FlowchartStep } from '@/components/ui/flowchart';

const rxSchema = z.object({
    sphere: z.coerce.number().min(-20).max(20).optional().default(0),
    cylinder: z.coerce.number().min(-10).max(0).optional().default(0),
    axis: z.coerce.number().min(1).max(180).optional().default(90),
});

const formSchema = z.object({
  problem: z.string().min(10, 'Please describe the problem in at least 10 characters.'),
  currentRx: rxSchema.optional(),
  previousRx: rxSchema.optional(),
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

export default function DispensingTroubleshooterPage() {
    const [result, setResult] = useState<FlowchartStep[] | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            problem: '',
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsSubmitted(true);
        setResult(staticFlowchart);
    };

    return (
        <ToolPageLayout
            title="Dispensing Troubleshooter"
            description="A step-by-step guide for investigating and resolving common spectacle non-tolerance issues."
        >
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
