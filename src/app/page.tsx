
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layers, Scissors, Triangle, FlaskConical, Eye, MoveHorizontal, Maximize, Footprints, ChevronsUpDown, ArrowRightLeft, Repeat, Sparkles, Pill, Stethoscope, BrainCircuit } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AppFooter } from '@/components/app-footer';

const menuItems = [
  {
    href: '/prescription-transposer',
    title: 'Prescription Transposer',
    description: 'Convert between plus and minus cylinder formats.',
    icon: <Repeat className="size-8 text-primary" />,
  },
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
  {
    href: '/step-along',
    title: 'Step-Along Vergence',
    description: 'Calculate vergence through an optical system.',
    icon: <Footprints className="size-8 text-primary" />,
  },
  {
    href: '/clinical',
    title: 'Clinical Tools',
    description: 'Reference guides for clinical decision-making.',
    icon: <BrainCircuit className="size-8 text-primary" />,
  },
];

const appVersion = "1.6 alpha";

const MenuItemCard = ({ item }: { item: typeof menuItems[0] }) => (
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

export default function Home() {
  const [clicks, setClicks] = useState(0);
  const [isEasterEggVisible, setIsEasterEggVisible] = useState(false);

  const handleTitleClick = () => {
    const newClicks = clicks + 1;
    setClicks(newClicks);
    if (newClicks >= 10) {
      setIsEasterEggVisible(true);
      setClicks(0); // Reset for next time
    }
  };

  return (
    <>
      <main 
          className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8 transition-all duration-1000"
      >
        <div 
          className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0"
        />
        <div className="w-full max-w-4xl z-10">
          <header className="mb-12 text-center">
            <div className="mb-4 inline-flex cursor-pointer items-center gap-3" onClick={handleTitleClick}>
              <Eye className="size-10 text-primary" />
              <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Optical Prime
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Precision tools for optical professionals.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
                <Link
                  href={item.href}
                  key={item.href}
                  className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <MenuItemCard item={item} />
                </Link>
              ))}
          </div>
          
          <AppFooter version={appVersion} />
        </div>
      </main>

      <AlertDialog open={isEasterEggVisible} onOpenChange={setIsEasterEggVisible}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You found the secret!</AlertDialogTitle>
            <AlertDialogDescription>
              Imagine a glorious fanfare as spectacles are launched from a cannon! Thanks for being so awesome. ✨
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsEasterEggVisible(false)}>
              Awesome!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
