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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, FileText, Copy, Check } from 'lucide-react';
import { generateReferralLetter, ReferralOutput } from '@/ai/flows/referral-letter-flow';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  patientAge: z.coerce.number().min(0).max(120),
  patientSex: z.string().min(1, 'Required'),
  vaOd: z.string().min(1, 'VA Required'),
  vaOs: z.string().min(1, 'VA Required'),
  iopOd: z.string().optional(),
  iopOs: z.string().optional(),
  findings: z.string().min(20, 'Please provide more clinical findings.'),
  suspectedDiagnosis: z.string().min(5, 'Required'),
  urgency: z.enum(['Routine', 'Urgent', 'Emergency']),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReferralGeneratorPage() {
  const [result, setResult] = useState<ReferralOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientAge: 65,
      patientSex: 'Male',
      vaOd: '6/6',
      vaOs: '6/6',
      iopOd: '',
      iopOs: '',
      findings: '',
      suspectedDiagnosis: '',
      urgency: 'Routine',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateReferralLetter(values);
      setResult(response);
    } catch (error) {
      console.error('Error generating referral letter:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'The AI could not generate the letter. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.letterContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied', description: 'Letter copied to clipboard.' });
  };

  return (
    <ToolPageLayout
      title="AI Referral Letter Generator"
      description="Enter clinical findings to generate a professional referral letter for ophthalmology."
    >
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Clinical Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="patientAge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="patientSex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sex</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vaOd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VA OD (Right)</FormLabel>
                        <FormControl><Input placeholder="e.g. 6/9" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vaOs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VA OS (Left)</FormLabel>
                        <FormControl><Input placeholder="e.g. 6/6" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="iopOd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IOP OD (mmHg)</FormLabel>
                        <FormControl><Input placeholder="Optional" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="iopOs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IOP OS (mmHg)</FormLabel>
                        <FormControl><Input placeholder="Optional" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="findings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinical Findings</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your observations, history, and test results..." 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="suspectedDiagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suspected Diagnosis</FormLabel>
                        <FormControl><Input placeholder="e.g. Wet AMD" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urgency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Routine">Routine</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                            <SelectItem value="Emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                  Generate Referral Letter
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {result && (
          <Card className="bg-primary/5 border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="text-primary" />
                Draft Referral Letter
              </CardTitle>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                {copied ? <Check className="size-4 mr-2" /> : <Copy className="size-4 mr-2" />}
                {copied ? 'Copied' : 'Copy Text'}
              </Button>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-serif p-4 bg-white dark:bg-zinc-900 border rounded-lg shadow-inner"
                dangerouslySetInnerHTML={{ __html: result.letterContent.replace(/\n/g, '<br/>') }}
              />
              <div className="mt-6">
                <h4 className="font-bold text-sm mb-2 text-primary">Summary Highlights:</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {result.keyPoints.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground italic w-full text-center">
                Always review AI-generated content for accuracy before signing clinical documents.
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </ToolPageLayout>
  );
}
