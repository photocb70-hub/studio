import Link from 'next/link';
import { Layers, Scissors, Triangle, FlaskConical, Eye, MoveHorizontal, Maximize } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

const menuItems = [
  {
    href: '/lens-thickness',
    title: 'Lens Thickness',
    description: 'Calculate lens thickness based on prescription and frame.',
    icon: <Layers className="size-8 text-primary" />,
  },
  {
    href: '/edge-thickness',
    title: 'Edge Thickness',
    description: 'Calculate edge thickness and visualize the lens profile.',
    icon: <Scissors className="size-8 text-primary" />,
  },
  {
    href: '/induced-prism',
    title: 'Induced Prism',
    description: 'Calculate induced prism from decentration and power.',
    icon: <Triangle className="size-8 text-primary" />,
  },
  {
    href: '/rx-tolerance',
    title: 'Rx Tolerance Analysis',
    description: 'AI-powered analysis of prescription tolerance.',
    icon: <FlaskConical className="size-8 text-primary" />,
  },
  {
    href: '/vertex-conversion',
    title: 'Vertex Conversion',
    description: 'Convert prescription power for different vertex distances.',
    icon: <MoveHorizontal className="size-8 text-primary" />,
  },
  {
    href: '/blanket-size',
    title: 'Blank Size',
    description: 'Calculate the minimum lens blank size needed.',
    icon: <Maximize className="size-8 text-primary" />,
  }
];

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-3">
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
            <Link href={item.href} key={item.href} className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              <Card className="flex h-full items-center transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary">
                <CardHeader className="flex w-full flex-row items-center gap-4 space-y-0 p-4">
                  {item.icon}
                  <div className="grid gap-1">
                    <CardTitle className="font-headline">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Optical Prime. All Rights Reserved.
        </footer>
      </div>
    </main>
  );
}
