
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sparkles, Loader2, Save, BookOpen, Trash2 } from 'lucide-react';
import { analyzeCourseChapter, StudyAnalysisOutput } from '@/ai/flows/study-hub-flow';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';

const formSchema = z.object({
  unitTitle: z.string().min(3, 'Title is too short.'),
  unitNumber: z.coerce.number().optional(),
  content: z.string().min(50, 'Please provide more content for analysis.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function StudyHubPage() {
  const [analysis, setAnalysis] = useState<StudyAnalysisOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();

  const courseUnitsQuery = React.useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'courseUnits'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: savedUnits } = useCollection(courseUnitsQuery);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unitTitle: '',
      unitNumber: 1,
      content: '',
    },
  });

  const onAnalyze = async (values: FormValues) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeCourseChapter({
        unitTitle: values.unitTitle,
        content: values.content,
      });
      setAnalysis(result);
      toast({ title: 'Analysis Complete', description: 'AI has summarized and rewritten your chapter.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not analyze content.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSave = async () => {
    if (!db || !analysis) return;
    const values = form.getValues();

    try {
      await addDoc(collection(db, 'courseUnits'), {
        unitTitle: values.unitTitle,
        unitNumber: values.unitNumber,
        originalContent: values.content,
        aiSummary: analysis.summary,
        professionalRewrite: analysis.professionalRewrite,
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Saved to Vault', description: 'Chapter analysis has been stored.' });
      setAnalysis(null);
      form.reset();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save to database.' });
    }
  };

  return (
    <ToolPageLayout
      title="Course Study Hub"
      description="Analyze, rewrite, and store your optical course materials for professional reference."
    >
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>New Chapter Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onAnalyze)} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-4">
                    <FormField
                    control={form.control}
                    name="unitNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Unit #</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="unitTitle"
                    render={({ field }) => (
                        <FormItem className="sm:col-span-3">
                        <FormLabel>Chapter Title</FormLabel>
                        <FormControl><Input placeholder="e.g., Optics of Thin Lenses" {...field} /></FormControl>
                        </FormItem>
                    )}
                    />
                </div>
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chapter Text Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Paste the text from your Specsavers course PDF here..." 
                          className="min-h-[200px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>The AI will use this text to generate summaries and professional rewrites.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isAnalyzing} className="w-full">
                  {isAnalyzing ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                  Analyze & Rewrite
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {analysis && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="text-primary" />
                AI Analysis Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-bold text-primary underline mb-2">Technical Summary</h4>
                <p className="text-sm italic">{analysis.summary}</p>
              </div>
              <Separator />
              <div>
                <h4 className="font-bold text-primary underline mb-2">Professional Rewrite</h4>
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: analysis.professionalRewrite.replace(/\n/g, '<br/>') }}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={onSave} className="w-full" variant="default">
                <Save className="mr-2" />
                Log to Study Vault
              </Button>
            </CardFooter>
          </Card>
        )}

        {savedUnits && savedUnits.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Study Vault</h3>
            <div className="grid gap-4">
              {savedUnits.map((unit: any) => (
                <Card key={unit.id} className="bg-card/50">
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                            Unit {unit.unitNumber}: {unit.unitTitle}
                        </CardTitle>
                        <span className="text-[10px] text-muted-foreground">
                            {unit.createdAt?.toDate().toLocaleDateString()}
                        </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                     <p className="text-xs text-muted-foreground line-clamp-2">{unit.aiSummary}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
