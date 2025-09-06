
'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ArrowRightLeft, Triangle, Maximize, ChevronsUpDown } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ToolPageLayout } from '@/components/tool-page-layout';

const dispensingMenuItems = [
  {
    href: '/vertex-conversion',
    title: 'BVD Conversion',
    description: 'Compensate lens power for a new vertex distance.',
    icon: <ArrowRightLeft className="size-8 text-primary" />,
  },
  {
    href: '/edge-thickness',
    title: 'Lens Thickness',
    description: 'Calculate edge and center thickness for a lens.',
    icon: <Layers className="size-8 text-primary" />,
  },
  {
    href: '/induced-prism',
    title: 'Induced Prism',
    description: 'Calculate induced prism from decentration and power.',
    icon: <Triangle className="size-8 text-primary" />,
  },
  {
    href: '/blank-size',
    title: 'Blank Size',
    description: 'Calculate the minimum lens blank size needed.',
    icon: <Maximize className="size-8 text-primary" />,
  },
  {
    href: '/progressive-power',
    title: 'Progressive Power',
    description: 'Calculate effective power in a progressive lens.',
    icon: <ChevronsUpDown className="size-8 text-primary" />,
  },
];

const MenuItemCard = ({ item }: { item: typeof dispensingMenuItems[0] }) => (
    <Card className="relative flex h-full items-center overflow-hidden bg-card/80 backdrop-blur-sm transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:border-primary group-hover:shadow-lg">
      <CardHeader className="flex w-full flex-row items-center gap-4 space-y-0 p-4">
        {item.icon}
        <div className="grid gap-1">
          <CardTitle className="font-headline">{item.title}</CardTitle>
          <CardDescription>{item.description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
);

export default function DispensingPage() {
  return (
    <ToolPageLayout
      title="Dispensing Tools"
      description="A collection of calculators for lens fitting and measurements."
    >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {dispensingMenuItems.map((item) => (
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
  );
}
