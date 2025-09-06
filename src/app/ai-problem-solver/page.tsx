
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
import { useToast } from '@/hooks/use-toast';

// Define the shape of the result object
type ProblemSolverOutput = {
  analysis: string;
  solution: string;
  considerations: string;
};

const formSchema = z.object({
  query: z.string().min(10, "Please describe the optical problem in at least 10 characters."),
});

type FormValues = z.infer<typeof formSchema>;

export default function AiProblemSolverPage() {
    const [result, setResult] = useState<ProblemSolverOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            query: "",
        }
    });
    
    // This is a placeholder function to simulate an AI response.
    const getPlaceholderResponse = (query: string): ProblemSolverOutput => {
        return {
            analysis: "This is a placeholder analysis. The AI model is currently being updated. Based on your query, the likely cause is related to the change in frame size, which can induce unwanted prismatic effects or alter the position of the optical centers.",
            solution: "1. Verify the fitting measurements, specifically the patient's monocular pupillary distances (PDs) and optical center (OC) heights.\n2. Remeasure the back vertex distance (BVD) as the new frame may sit differently.\n3. Consider using a lens with a higher Abbe value to reduce chromatic aberration, which can be more noticeable in larger lenses.",
            considerations: "This is a temporary response. For a full diagnosis, please consult with an experienced optician. The AI feature will be restored once the backend issues are resolved.",
        };
    };

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        setResult(null);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            // Use the placeholder function instead of calling the AI flow
            const response = getPlaceholderResponse(values.query);
            setResult(response);
        } catch (error) {
            console.error("Error generating placeholder response:", error);
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
                        name="query"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Patient Complaint &amp; Data</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="e.g., 'Patient complains of peripheral distortion with new glasses. Current Rx: -4.00 / -1.00 x 180, Prev Rx: -3.50 DS. New frame is a larger metal frame, previous was a smaller plastic one...'"
                                        className="min-h-[150px]"
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
