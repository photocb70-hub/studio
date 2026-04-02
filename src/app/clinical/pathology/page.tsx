'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ToolPageLayout } from '@/components/tool-page-layout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { pathologyCategories } from '@/lib/pathology-data';
import { Info, AlertCircle, Clock, Stethoscope, Maximize2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import placeholderImages from '@/app/lib/placeholder-images.json';

const UrgencyBadge = ({ urgency }: { urgency: 'Routine' | 'Urgent' | 'Emergency' }) => {
    const variants = {
        Routine: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
        Urgent: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
        Emergency: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
    };
    return (
        <Badge className={variants[urgency]}>
            <Clock className="mr-1 size-3" />
            {urgency}
        </Badge>
    );
};

export default function PathologyPage() {
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);

  return (
    <ToolPageLayout
      title="Ocular Pathology Guide"
      description="A structured reference for common ocular conditions and clinical findings."
    >
      <div className="space-y-8">
        <Alert>
          <Info className="size-4" />
          <AlertTitle>Clinical Reference Only</AlertTitle>
          <AlertDescription>
            This guide is intended for educational purposes and to assist in clinical pattern recognition. Always follow your local GOS or NHS referral protocols.
          </AlertDescription>
        </Alert>
        
        <Accordion type="multiple" className="w-full space-y-4">
          {pathologyCategories.map((category) => (
            <AccordionItem value={category.title} key={category.title} className="rounded-lg border bg-card px-4 shadow-sm">
              <AccordionTrigger className="py-4 text-lg font-semibold hover:no-underline">
                {category.title}
              </AccordionTrigger>
              <AccordionContent>
                <Accordion type="multiple" className="w-full">
                  {category.conditions.map((condition) => {
                    const imageData = (placeholderImages as any)[condition.imageKey];
                    return (
                      <AccordionItem value={condition.name} key={condition.name} className="border-t">
                        <AccordionTrigger className="text-base hover:no-underline">
                          <div className="flex items-center gap-3">
                              <span>{condition.name}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 pt-2">
                             {imageData && (
                               <div 
                                 className="group relative mb-6 cursor-zoom-in overflow-hidden rounded-lg border bg-muted"
                                 onClick={() => setSelectedImage({ url: imageData.url, name: condition.name })}
                               >
                                 <Image
                                   src={imageData.url}
                                   alt={condition.name}
                                   width={imageData.width}
                                   height={imageData.height}
                                   className="h-auto w-full object-cover transition-transform group-hover:scale-105"
                                   data-ai-hint={imageData.hint}
                                 />
                                 <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                                    <Maximize2 className="size-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                                 </div>
                                 <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-[10px] text-white backdrop-blur-sm">
                                   Tap to Enlarge
                                 </div>
                               </div>
                             )}

                             <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                      <h4 className="font-semibold text-foreground mb-1">Overview</h4>
                                      <p className="mt-0">{condition.overview}</p>
                                  </div>
                                  <UrgencyBadge urgency={condition.referralUrgency} />
                             </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-muted/30 p-3 rounded-lg border">
                                  <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                                      <Stethoscope className="size-4" />
                                      Clinical Signs
                                  </h4>
                                  <p className="mt-0 text-xs leading-relaxed">{condition.clinicalSigns}</p>
                              </div>
                              <div className="bg-muted/30 p-3 rounded-lg border">
                                  <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                                      <AlertCircle className="size-4" />
                                      Symptoms
                                  </h4>
                                  <p className="mt-0 text-xs leading-relaxed">{condition.symptoms}</p>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Full Screen Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-[1200px] border-none bg-transparent p-0 shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedImage?.name || 'Clinical Image'}</DialogTitle>
          </DialogHeader>
          <div className="relative flex h-full min-h-[50vh] w-full items-center justify-center overflow-hidden rounded-xl">
             {selectedImage && (
               <div className="relative h-full w-full">
                 <Image
                    src={selectedImage.url}
                    alt={selectedImage.name}
                    width={1200}
                    height={800}
                    className="h-auto max-h-[85vh] w-full rounded-xl object-contain shadow-2xl"
                    priority
                 />
                 <div className="mt-4 text-center">
                    <p className="text-lg font-bold text-white drop-shadow-md">{selectedImage.name}</p>
                 </div>
               </div>
             )}
          </div>
        </DialogContent>
      </Dialog>
    </ToolPageLayout>
  );
}
