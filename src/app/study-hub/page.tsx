'use client';

import React, { useState, useRef } from 'react';
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
import { Sparkles, Loader2, Save, BookOpen, FileUp, ClipboardText, Lightbulb, Image as ImageIcon } from 'lucide-react';
import { analyzeCourseChapter, StudyAnalysisOutput, extractTextFromPdf } from '@/ai/flows/study-hub-flow';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  unitTitle: z.string().min(3, 'Title is too short.'),
  unitNumber: z.coerce.number().optional(),
  content: z.string().min(50, 'Please provide more content for analysis.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function StudyHubPage() {
  const [analysis, setAnalysis] = useState<StudyAnalysisOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      toast({ title: 'Analysis Complete', description: 'AI has structured your chapter notes.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not analyze content.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a PDF file.' });
      return;
    }

    setIsExtracting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const text = await extractTextFromPdf(buffer);
      
      form.setValue('content', text);
      if (!form.getValues('unitTitle')) {
        form.setValue('unitTitle', file.name.replace('.pdf', ''));
      }
      
      toast({ title: 'PDF Extracted', description: 'Content loaded into analysis field.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Extraction Failed', description: 'Could not read PDF text.' });
    } finally {
      setIsExtracting(false);
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
        suggestedFigures: analysis.suggestedFigures,
        clinicalNotes: analysis.clinicalNotes,
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
      description="Upload PDFs or paste text from your Specsavers course to generate professional reference notes."
    >
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Analysis Hub</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf"
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="w-full h-24 border-dashed flex flex-col gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
              >
                {isExtracting ? (
                  <Loader2 className="animate-spin size-8" />
                ) : (
                  <FileUp className="size-8 text-primary" />
                )}
                <span>{isExtracting ? 'Extracting Text...' : 'Upload Course PDF (Specsavers)'}</span>
              </Button>
            </div>

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
                      <FormLabel>Source Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Paste text here or upload a PDF above..." 
                          className="min-h-[200px] font-mono text-xs" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isAnalyzing || isExtracting} className="w-full">
                  {isAnalyzing ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                  Generate Professional Reference
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
                Study Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <ClipboardText className="size-5 text-primary" />
                  <h4 className="font-bold text-lg">Technical Summary</h4>
                </div>
                <p className="text-sm italic text-muted-foreground">{analysis.summary}</p>
              </section>

              <Separator />

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="size-5 text-primary" />
                  <h4 className="font-bold text-lg">Professional Rewrite</h4>
                </div>
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: analysis.professionalRewrite.replace(/\n/g, '<br/>') }}
                />
              </section>

              <Separator />

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="size-5 text-primary" />
                  <h4 className="font-bold text-lg">Suggested Figures & Diagrams</h4>
                </div>
                <ul className="grid gap-3">
                  {analysis.suggestedFigures.map((figure, idx) => (
                    <li key={idx} className="bg-background/50 p-3 rounded-lg border text-sm flex gap-3">
                      <Badge variant="outline" className="h-fit">Fig {idx + 1}</Badge>
                      {figure}
                    </li>
                  ))}
                </ul>
              </section>

              <Separator />

              <section className="bg-accent/10 p-4 rounded-xl border border-accent/20">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="size-5 text-accent" />
                  <h4 className="font-bold text-lg text-accent-foreground">Clinical Pro-Tips</h4>
                </div>
                <p className="text-sm">{analysis.clinicalNotes}</p>
              </section>
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
                     <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{unit.aiSummary}</p>
                     <div className="flex gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                           {unit.suggestedFigures?.length || 0} Figures
                        </Badge>
                        {unit.clinicalNotes && (
                          <Badge variant="outline" className="text-[10px] border-accent/30 text-accent">
                            Clinical Notes
                          </Badge>
                        )}
                     </div>
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
