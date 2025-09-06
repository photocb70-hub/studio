
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Ruler, Eye, ScrollText } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AppFooter } from '@/components/app-footer';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const menuItems = [
  {
    href: '/dispensing',
    title: 'Dispensing Tools',
    description: 'Calculators for lens fitting and measurements.',
    icon: <Ruler className="size-8 text-primary" />,
  },
  {
    href: '/clinical',
    title: 'Clinical Tools',
    description: 'Reference guides for clinical decision-making.',
    icon: <Eye className="size-8 text-primary" />,
  },
];

const appVersion = "2.7 alpha";

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

const changelogContent = `# Changelog

## [2.7 alpha]
### Changed
- Finalized UI for the "AI Problem Solver" form, replacing text inputs with sliders and reorganizing fields for better usability.
- Made the header title a direct link to the main menu on all tool pages.
- Adjusted homepage layout to move the footer and changelog button further down for better visual balance.

### Fixed
- Corrected the layout of the "In Development" badge to be a centered, two-line element.
- Fixed the background image on the "Refund" pop-up to correctly cover the entire dialog.
- Cleaned up 1 unused import from the clinical page.

## [2.6 alpha]
### Fixed
- Stabilized the "AI Problem Solver" page to resolve a persistent and critical series of application crashes. The complex form with sliders has been reverted to a more robust, simple text-input version to ensure reliability.
- The live AI connection on the problem solver page has been temporarily replaced with a placeholder response to guarantee a stable user experience.

## [2.5 alpha]
### Changed
- Re-implemented the "AI Problem Solver" with a structured, flexible input form. The new design replaces the single text area with optional fields for current and previous prescriptions, measurements, and lens details. This allows the AI to provide a more detailed analysis while accommodating real-world scenarios where not all data is available.

## [2.4 alpha]
### Changed
- Reverted Next.js configuration to remove \`output: 'export'\` to allow for direct web publishing from Firebase Studio. This pauses native app preparation.
- Removed Capacitor dependencies and configuration files.
- Re-enabled AI features on the clinical tools page.

## [2.3 alpha]
### Changed
- Configured the Next.js project to support static exports (\`output: 'export'\`) in preparation for integration with Capacitor to build for native mobile platforms.
- Disabled AI features on the UI to allow for a successful static build, as Server Actions are not compatible with \`output: 'export'\`.

## [2.2 alpha]
### Added
- Added a new "Contact Lens Rx Converter" to the Clinical Tools section to compensate spectacle prescriptions for vertex distance.

### Changed
- Standardized user input for prescriptions across multiple calculators. Sphere, Cylinder, and Axis fields now consistently use sliders with a default value of 0, creating a more uniform user experience.

## [2.1 alpha]
### Added
- Implemented the initial framework for a new "AI Image Analyzer" tool in the Clinical section to provide visual feedback. (Note: This feature is currently in testing and disabled on the UI).

## [2.0 alpha]
### Changed
- Alphabetized the items on the "Dispensing Tools" page for better organization.
- Added distinct, thematic background images to the main, clinical, and dispensing pages to improve visual identity.
`;

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
        className="flex min-h-screen w-full flex-col p-4 sm:p-6 lg:p-8 transition-all duration-1000 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/main.jpg')" }}
      >
        <div className="absolute top-4 right-4 z-20">
            <ThemeToggleButton />
        </div>
        <div 
          className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0"
        />
        <div className="w-full max-w-4xl z-10 mx-auto flex flex-col flex-grow">
          <div className="flex-grow flex flex-col items-center justify-center">
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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 w-full">
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
          </div>
          
          <AppFooter version={appVersion}>
              <Dialog>
              <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                  <ScrollText className="mr-2" />
                  Changelog
                  </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                  <DialogHeader>
                  <DialogTitle>Application Changelog</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] pr-4">
                  <pre className="text-sm whitespace-pre-wrap">
                      {changelogContent}
                  </pre>
                  </ScrollArea>
              </DialogContent>
              </Dialog>
          </AppFooter>
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
