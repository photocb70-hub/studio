
'use client';

import React from 'react';
import Link from 'next/link';
import { Pill, Sparkles, ScanEye, Contact } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ToolPageLayout } from '@/components/tool-page-layout';
import { ContactLensIcon } from '@/components/icons/contact-lens-icon';


const clinicalMenuItems = [
  {
    href: '/contact-lens-converter',
    title: 'Contact Lens Rx Converter',
    description: 'Convert a spectacle Rx to a contact lens Rx.',
    icon: <ContactLensIcon className="size-8 text-primary" />,
    inDevelopment: false,
  },
  {
    href: '/ocular-drugs',
    title: 'Ocular Drugs Guide',
    description: 'Quick reference for drugs with ocular side effects.',
    icon: <Pill className="size-8 text-primary" />,
    inDevelopment: false,
  },
  {
    href: '/ai-problem-solver',
    title: 'AI Problem Solver',
    description: 'Get AI-powered solutions for optical problems.',
    icon: <Sparkles className="size-8 text-primary" />,
    inDevelopment: true,
  },
  {
    href: '/ai-image-analyzer',
    title: 'AI Image Analyzer',
    description: 'Upload an ocular image for AI-powered analysis.',
    icon: <ScanEye className="size-8 text-primary" />,
    inDevelopment: true,
  },
];

const MenuItemCard = ({ item }: { item: typeof clinicalMenuItems[0] }) => (
    <Card className="relative flex h-full items-center overflow-hidden bg-card/80 backdrop-blur-sm shadow-md transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:border-primary group-hover:shadow-xl">
      <CardHeader className="flex w-full flex-row items-center gap-4 space-y-0 p-4">
        {item.icon}
        <div className="grid gap-1">
          <CardTitle className="font-headline flex items-center gap-2">
            {item.title}
            {item.inDevelopment && (
                <div className="inline-flex flex-col items-center justify-center rounded-full border px-2 py-1 text-xs font-semibold text-foreground leading-tight">
                    <span>In</span>
                    <span>Development</span>
                </div>
            )}
          </CardTitle>
          <CardDescription>{item.description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );

export default function ClinicalPage() {
  return (
    <div 
      className="bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/clinical.jpg')" }}
    >
      <ToolPageLayout
        title="Clinical Tools"
        description="A collection of guides and assistants for clinical decision-making."
      >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {clinicalMenuItems.map((item) => (
                    <Link
                        href={item.href}
                        key={item.href}
                        className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                        <MenuItemCard item={item} />
                    </Link>
              ))}
          </div>
      </ToolPageLayout>
    </div>
  );
}
