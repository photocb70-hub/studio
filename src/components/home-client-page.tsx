
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, BookOpen, FlaskConical, Beaker, Menu, X } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { AppFooter } from '@/components/app-footer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';


const menuItems = [
  {
    href: '/dispensing',
    title: 'Dispensing Tools',
    description: 'Calculators for lens fitting and measurements.',
    icon: <Beaker className="size-10 text-primary" />,
  },
  {
    href: '/clinical',
    title: 'Clinical Tools',
    description: 'Guides and assistants for clinical decision-making.',
    icon: <FlaskConical className="size-10 text-primary" />,
  },
];

const MenuItemCard = ({ item }: { item: typeof menuItems[0] }) => (
  <Card className="flex h-full flex-col overflow-hidden bg-card/60 backdrop-blur-sm transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:border-primary group-hover:shadow-xl">
    <CardHeader className="flex flex-row items-start gap-4 p-4">
      {item.icon}
      <div className="grid gap-1">
        <CardTitle className="font-headline text-xl">{item.title}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </div>
    </CardHeader>
  </Card>
);

const DesktopNav = () => (
  <>
    {menuItems.map((item) => (
      <Link
        href={item.href}
        key={item.href}
        className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <MenuItemCard item={item} />
      </Link>
    ))}
  </>
);

const MobileNav = () => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline" size="icon" className="md:hidden">
        <Menu />
        <span className="sr-only">Open navigation menu</span>
      </Button>
    </SheetTrigger>
    <SheetContent side="left">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-semibold">
                <Eye className="size-6 text-primary" />
                <span>Optical Prime</span>
            </Link>
            <SheetClose asChild>
                 <Button variant="ghost" size="icon">
                    <X />
                    <span className="sr-only">Close navigation menu</span>
                </Button>
            </SheetClose>
        </div>

        <Separator />
        <nav className="flex flex-col gap-4">
          {menuItems.map((item) => (
             <SheetClose asChild key={item.href}>
                <Link href={item.href}>
                  <MenuItemCard item={item} />
                </Link>
            </SheetClose>
          ))}
        </nav>
      </div>
    </SheetContent>
  </Sheet>
);

export default function HomeClientPage({ changelogContent }: { changelogContent: string }) {
  const [clickCount, setClickCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  useEffect(() => {
    if (clickCount >= 10) {
      setShowCelebration(true);
      const timer = setTimeout(() => {
        setShowCelebration(false);
        setClickCount(0);
      }, 5000); // Hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  const handleTitleClick = () => {
    setClickCount((prev) => prev + 1);
  };
  
  const version = changelogContent.match(/## \[(\d+\.\d+.*?)\]/)?.[1] || 'N/A';
  
  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/main.jpg')" }}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="container mx-auto flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
                <MobileNav />
                 <h1
                    className="flex cursor-pointer items-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
                    onClick={handleTitleClick}
                 >
                    <Eye className="size-8 text-primary" />
                    <span>ptical Prime</span>
                </h1>
            </div>
            <ThemeToggleButton />
        </header>

        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <section className="text-center">
              <p className="mt-4 text-lg text-muted-foreground">
                Precision tools for optical professionals.
              </p>
            </section>
            
            <section className="mt-12">
              <div className="mx-auto grid max-w-sm grid-cols-1 gap-6 md:max-w-none md:grid-cols-2">
                <DesktopNav />
              </div>
            </section>
          </div>
        </main>
        
        <div className="container mx-auto px-4 pb-8 sm:px-6 lg:px-8">
          <AppFooter version={version}>
            <Button variant="link" onClick={() => setShowChangelog(true)}>
              <BookOpen className="mr-2 size-4" />
              View Changelog
            </Button>
          </AppFooter>
        </div>
      </div>

      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎉 Optimus Prime! 🎉</DialogTitle>
            <DialogDescription className="text-center">
              You found the easter egg!
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      
       <Dialog open={showChangelog} onOpenChange={setShowChangelog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Changelog</DialogTitle>
            <DialogDescription>
              All notable changes to this project.
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <ScrollArea className="h-96 pr-6">
            <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: changelogContent.replace(/\\n/g, '<br />') }} />
          </ScrollArea>
           <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
