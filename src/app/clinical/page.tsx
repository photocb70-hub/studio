
'use client';

import React from 'react';
import Link from 'next/link';
import { Pill, Sparkles } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ToolPageLayout } from '@/components/tool-page-layout';

const clinicalMenuItems = [
  {
    href: '/ocular-drugs',
    title: 'Ocular Drugs Guide',
    description: 'Quick reference for drugs with ocular side effects.',
    icon: <Pill className="size-8 text-primary" />,
  },
  {
    href: '/ai-problem-solver',
    title: 'AI Problem Solver',
    description: 'Get AI-powered solutions for optical problems.',
    icon: <Sparkles className="size-8 text-primary" />,
    testing: true,
  },
];

const MenuItemCard = ({ item }: { item: typeof clinicalMenuItems[0] }) => (
    <Card className="relative flex h-full items-center overflow-hidden bg-card/80 backdrop-blur-sm transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:border-primary group-hover:shadow-lg">
      {item.testing && (
        <div className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 bg-accent py-1 text-center text-sm font-semibold text-accent-foreground shadow-lg">
          In Testing
        </div>
      )}
      <CardHeader className="flex w-full flex-row items-center gap-4 space-y-0 p-4">
        {item.icon}
        <div className="grid gap-1">
          <CardTitle className="font-headline">{item.title}</CardTitle>
          <CardDescription>{item.description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );

export default function ClinicalPage() {
  return (
    <ToolPageLayout
      title="Clinical Tools"
      description="A collection of guides and assistants for clinical decision-making."
    >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {clinicalMenuItems.map((item) => {
              if (item.testing) {
                return (
                  <div key={item.href} className="group rounded-lg cursor-not-allowed">
                    <MenuItemCard item={item} />
                  </div>
                );
              }
              return (
                <Link
                  href={item.href}
                  key={item.href}
                  className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <MenuItemCard item={item} />
                </Link>
              );
            })}
        </div>
    </ToolPageLayout>
  );
}
