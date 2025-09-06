
'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Bot, Loader2, UploadCloud, AlertCircle } from 'lucide-react';
import { analyzeImage, ImageAnalyzerOutput } from '@/ai/flows/image-analyzer-flow';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  image: z.any()
    .refine((files) => files?.length === 1, 'Image is required.')
    .refine((files) => files?.[0]?.size <= 5000000, `Max file size is 5MB.`)
    .refine(
      (files) => ['image/jpeg', 'image/png', 'image/webp'].includes(files?.[0]?.type),
      '.jpg, .png and .webp files are accepted.'
    ),
});

type FormValues = z.infer<typeof formSchema>;

export default function AiImageAnalyzerPage() {
    const [result, setResult] = useState<ImageAnalyzerOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        setResult(null);

        const file = values.image[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64data = reader.result as string;
            try {
                const response = await analyzeImage({ imageDataUri: base64data });
                setResult(response);
            } catch (error) {
                console.error("Error analyzing image:", error);
                toast({
                  variant: 'destructive',
                  title: 'Analysis Failed',
                  description: 'The AI model could not analyze this image. Please try another one.',
                });
            } finally {
                setIsLoading(false);
            }
        };
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        form.setValue('image', [file]);
        form.clearErrors('image');
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    
    return (
        <ToolPageLayout
        title="AI Image Analyzer"
        description="Upload an ocular image (e.g., fundus photo) for an AI-powered analysis of key features."
        >
        <div className="grid gap-8">
            <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>For Educational Use Only</AlertTitle>
                <AlertDescription>
                This tool is not a diagnostic device and does not provide medical advice. The analysis is AI-generated and may contain inaccuracies. Do not use for clinical decision-making.
                </AlertDescription>
            </Alert>
            <Card>
                <CardHeader>
                    <CardTitle>Upload Ocular Image</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">Image Upload</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed p-8 text-center">
                                                {preview ? (
                                                    <div className="relative w-48 h-48">
                                                      <Image src={preview} alt="Image preview" layout="fill" objectFit="contain" className="rounded-md"/>
                                                    </div>
                                                ) : (
                                                    <UploadCloud className="size-12 text-muted-foreground" />
                                                )}
                                                <p className="text-sm text-muted-foreground">
                                                  Drag & drop an image or{' '}
                                                  <Button type="button" variant="link" className="p-0 h-auto" onClick={() => fileInputRef.current?.click()}>
                                                    click to upload
                                                  </Button>
                                                </p>
                                                <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP (Max 5MB)</p>
                                                <Input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/png, image/jpeg, image/webp"
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isLoading || !preview} className="w-full sm:w-auto">
                            {isLoading ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 size-4" />
                            )}
                            Analyze Image
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {isLoading && (
            <div className="flex min-h-[200px] w-full items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                <Bot className="size-8 animate-pulse" />
                <p>AI is analyzing the image...</p>
                </div>
            </div>
            )}

            {result && preview && (
            <Card className="bg-accent/10 border-accent/50">
                <CardHeader>
                <CardTitle>AI Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="prose prose-sm max-w-none text-accent-foreground dark:prose-invert">
                        <h4>Description</h4>
                        <p>{result.description}</p>
                        
                        <Separator className="my-4"/>

                        <h4>Key Features</h4>
                        <dl>
                            <dt>Optic Disc</dt>
                            <dd>{result.opticDisc}</dd>
                            <dt>Macula</dt>
                            <dd>{result.macula}</dd>
                            <dt>Vessels</dt>
                            <dd>{result.vessels}</dd>
                        </dl>
                        
                        <Separator className="my-4"/>
                        
                        <h4>Potential Anomalies</h4>
                        <p>{result.anomalies}</p>
                    </div>
                     <div className="flex items-center justify-center">
                        <div className="relative w-full aspect-square max-w-[300px]">
                            <Image src={preview} alt="Analyzed image" layout="fill" objectFit="contain" className="rounded-md" />
                            <p className="text-xs text-center text-muted-foreground mt-2">Original Image</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            )}
        </div>
        </ToolPageLayout>
    );
}
