
'use client';

import { ToolPageLayout } from '@/components/tool-page-layout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { drugData } from '@/lib/drug-data';
import { TriangleAlert } from 'lucide-react';

export default function OcularDrugsPage() {
  return (
    <ToolPageLayout
      title="Ocular Pharmacology Guide"
      description="A quick reference for common UK drugs and their potential ocular side effects."
    >
      <div className="space-y-8">
        <Alert variant="destructive">
          <TriangleAlert className="size-4" />
          <AlertTitle>Disclaimer</AlertTitle>
          <AlertDescription>
            This information is for quick reference only and is not a substitute for clinical guidance from official formularies (e.g., BNF) or professional medical advice. Always consult with a healthcare professional.
          </AlertDescription>
        </Alert>
        
        <Accordion type="multiple" className="w-full">
          {drugData.map((drug) => (
            <AccordionItem value={drug.name} key={drug.name}>
              <AccordionTrigger className="text-base hover:no-underline">
                {drug.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Common Uses</h4>
                    <p className="mt-0">{drug.uses}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Potential Ocular Side Effects</h4>
                    <p className="mt-0">{drug.sideEffects}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ToolPageLayout>
  );
}
