
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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

const appVersion = "2.5 alpha";

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

All notable changes to this project will be documented in this file.

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
- This is the point to rollback to if wrapper fails!
### Added
- Added a new "Contact Lens Rx Converter" to the Clinical Tools section to compensate spectacle prescriptions for vertex distance.

### Changed
- Standardized user input for prescriptions across multiple calculators. Sphere, Cylinder, and Axis fields now consistently use sliders with a default value of 0, creating a more uniform user experience.
- Improved the layout of the "Lens Thickness Calculator" by placing the cylinder and axis controls on the same line for a cleaner look.
- Enhanced input validation on several calculators to prevent errors and improve stability.

### Fixed
- Corrected the calculation formula and rounding logic in the "Contact Lens Rx Converter" to ensure it provides clinically accurate results in 0.25D steps.

## [2.1 alpha]
### Added
- Implemented the initial framework for a new "AI Image Analyzer" tool in the Clinical section to provide visual feedback. (Note: This feature is currently in testing and disabled on the UI).

## [2.0 alpha]
### Changed
- Alphabetized the items on the "Dispensing Tools" page for better organization.
- Added distinct, thematic background images to the main, clinical, and dispensing pages to improve visual identity.

### Added
- Implemented the initial framework for a new "AI Image Analyzer" tool in the Clinical section. This experimental feature allows users to upload an ocular image for an AI-powered analysis.

## [1.9.1]
### Fixed
- Resolved a persistent build error on the "Lens Thickness Calculator" page by refactoring the component structure.
- Corrected "duplicate key" errors in dropdown menus on the "Lens Thickness" and "Step-Along Vergence" calculators to improve UI stability.

### Changed
- Alphabetized drugs within each category in the Ocular Drugs Guide for easier reference.

## [1.9 alpha]

### Changed
- Overhauled the application's UI with a more professional and "cozy" theme, replacing the blue color scheme with a rich green and implementing a modern "frosted glass" effect on cards.
- The "Back" button on tool pages now correctly navigates to the user's previous page instead of always returning to the homepage, improving user experience.

### Fixed
- Resolved multiple critical bugs causing "duplicate key" errors in dropdown menus on the "Lens Thickness" and "Step-Along Vergence" calculators, ensuring UI stability.
- Corrected a rendering error on the "Lens Thickness" calculator page.
- Improved validation logic on the "Blank Size," "Induced Prism," and "BVD Conversion" calculators to prevent errors and ensure more reliable results.
- Removed a redundant "Vitreous" material from the "Step-Along Vergence" calculator to prevent confusion.

## [1.8 alpha]

### Added
- Created a new "Clinical Tools" section to group clinical guides and assistants.
- Moved the "Ocular Drugs Guide" and "AI Problem Solver" into the new "Clinical" section.
- Added "Step-Along Vergence" and "Prescription Transposer" to the "Dispensing Tools" page.

### Changed
- Reorganized the homepage to link to the new "Dispensing Tools" and "Clinical Tools" pages for a cleaner interface.

## [1.7 alpha]

### Added
- Created a new "Dispensing Tools" section to group related calculators like BVD, Lens Thickness, and Blank Size for better organization.
- Updated the homepage to reflect the new "Dispensing Tools" category.

## [1.6 alpha]

### Changed
- Reverted Next.js configuration to remove \`output: 'export'\` to allow for direct web publishing from Firebase Studio. This temporarily pauses native app preparation.
- Cleaned up unused code in the \`blank-size\` calculator page.

## [1.5 alpha]

### Added
- Added an easter egg where clicking the main title 10 times reveals a celebratory dialog.

## [1.4 alpha]

### Changed
- Configured the Next.js project to support static exports (\`output: 'export'\`) in preparation for integration with Capacitor to build for native mobile platforms.

## [1.3 alpha]

### Added
- Implemented a new "Ocular Pharmacology Guide" page to provide a quick reference for common UK drugs and their potential ocular side effects.
- Added categories to the drug guide, including "Prescription," "In-Practice," and "Over-the-Counter."
- Updated the drug guide to use nested accordions for better navigation.

## [1.2 alpha]

### Added
- Added high-quality SVG app icons and a web app manifest (\`manifest.json\`) to improve the look and behavior when the app is saved to a phone's home screen (PWA).

## [1.1 alpha]

### Changed
- Radically simplified the "AI Problem Solver" to use a single input field, removing the complex multi-part form to improve stability.
- The "AI Problem Solver" has been temporarily disabled and marked as "In Testing" on the homepage to prevent users from encountering bugs.
- Updated the "In Testing" banner to be more centrally located for better visibility.

### Fixed
- Resolved a persistent critical bug in the "AI Problem Solver" that caused the application to crash on submission.

## [1.0 alpha]

### Changed
- Overhauled the "Lens Thickness Calculator" with a more robust calculation for sphero-cylindrical lenses.
- Updated the "Lens Thickness Calculator" UI to use sliders for cylinder and axis for a more consistent user experience.

### Added
- Implemented a new 2D/3D visualization diagram for the "Lens Thickness Calculator" to show the lens profile and where minimum/maximum thickness occurs.

### Fixed
- Resolved a bug causing duplicate keys in refractive index selection menus on various calculators, ensuring UI stability.

## [0.9 alpha]

### Added
- Implemented an experimental, AI-based "Problem Solver" to provide analysis and solutions for complex optical scenarios. (Note: Might be deleted depending on feedback).

### Changed
- The AI Problem Solver is hidden behind a feature flag for testing and can be enabled by adding \`?enabled=true\` to the URL.

## [0.axlpha]

### Changed
- Improved navigation by adding a "Back" label to the return button on calculator pages.
- Refactored the footer component to prevent potential hydration errors and improve stability.

## [0.7 alpha]

### Changed
- Reordered the calculator cards on the homepage for better usability.
- Reverted experimental background design to ensure app stability.

## [0.6 alpha]

### Added
- Display the application version in the homepage footer.

## [0.5.1 alpha]

### Changed
- Reverted experimental UI changes and solidified calculator updates.

## [0.5 alpha]

### Changed
- Updated the "Lens Thickness Calculator" default minimum thickness to 2.0mm for more realistic results.
- Corrected the "Blank Size Calculator" formula and updated its input fields for better accuracy.

## [0.4 alpha]

### Changed
- Updated the application's background to a subtle and thematic design featuring various optical formulas.
- Renamed \`CHANGELOG.md\` to \`CHANGELog.txt\` for easier file access.

## [0.3 alpha]

### Added
- Implemented the "Prescription Transposer" tool to convert eyeglass prescriptions between plus and minus cylinder formats.
- Added a new page and menu item on the homepage for the transposer.

## [02 alpha]

### Added
- Introduced the "Lens Thickness Calculator" for calculating edge and center thickness.
- Added a visualization diagram for the calculated lens thickness.
- Added a new menu item on the homepage for the thickness calculator.

### Changed
- Set the default refractive index to "Standard Index" across all relevant calculators for consistency.
`;

export default function Home() {
  const [clicks, setClicks] = useState(0);
  const [isEasterEggVisible, setIsEasterEggVisible] = useState(false);
  const [changelogHtml, setChangelogHtml] = useState('');

  useEffect(() => {
    // Basic markdown to HTML conversion
    const html = changelogContent
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/<br \/>\n/g, '<br />')
      .replace(/\n- /g, '<li>')
      .replace(/\n/g, '<br />')
      .replace(/<li>/g, '<ul><li>')
      .replace(/<\/li><br \/>/g, '</li></ul>');
    setChangelogHtml(html);
  }, []);



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
        className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8 transition-all duration-1000 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/main.jpg')" }}
      >
        <div className="absolute top-4 right-4 z-20">
            <ThemeToggleButton />
        </div>
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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
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
                    <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: changelogHtml }}/>
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
