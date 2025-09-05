
import Link from 'next/link';
import { Layers, Scissors, Triangle, FlaskConical, Eye, MoveHorizontal, Maximize, Footprints, ChevronsUpDown, ArrowRightLeft, Repeat, Focus } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

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
];

const appVersion = "0.6 alpha";

export default async function Home() {

  return (
    <main 
        className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8 transition-all duration-1000"
        style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }}
    >
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'%3e%3cdefs%3e%3cstyle%3e.formula %7b font-family: 'Inter', sans-serif; font-size: 16px; fill: hsl(var(--primary) / 0.05); opacity: 0; animation: fadeIn 1.5s ease-in-out forwards; %7d .snellen %7b font-family: 'Courier', monospace; font-weight: bold; fill: hsl(var(--primary) / 0.04); opacity: 0; animation: fadeIn 1.5s ease-in-out forwards; %7d .phoropter %7b fill: none; stroke: hsl(var(--primary) / 0.05); stroke-width: 2; opacity: 0; animation: fadeIn 1.5s ease-in-out forwards; %7d @keyframes fadeIn %7b to %7b opacity: 1; %7d %7d%3c/style%3e%3c/defs%3e%3ctext x='100' y='120' class='formula' style='animation-delay: 0.1s;' transform='rotate(-15 100 120)'%3en₁sin(θ₁) = n₂sin(θ₂)%3c/text%3e%3ctext x='550' y='80' class='formula' style='animation-delay: 0.2s;' transform='rotate(10 550 80)'%3eP = cF%3c/text%3e%3ctext x='80' y='300' class='formula' style='animation-delay: 0.3s;' transform='rotate(8 80 300)'%3eFc = F / (1 - d*F)%3c/text%3e%3ctext x='600' y='450' class='formula' style='animation-delay: 0.4s;' transform='rotate(-5 600 450)'%3e1/f = (n-1)(1/R₁ - 1/R₂)%3c/text%3e%3ctext x='150' y='550' class='formula' style='animation-delay: 0.5s;' transform='rotate(20 150 550)'%3eM = -v/u%3c/text%3e%3ctext x='400' y='680' class='formula' style='animation-delay: 0.6s;' transform='rotate(-12 400 680)'%3eL' = L + F%3c/text%3e%3ctext x='700' y='250' class='formula' style='animation-delay: 0.7s;' transform='rotate(15 700 250)'%3eSM = A*ED + B*DBL%3c/text%3e%3ctext x='350' y='180' class='formula' style='animation-delay: 0.8s;' transform='rotate(-8 350 180)'%3eFₑ = F₁ + F₂ - (t/n)F₁F₂%3c/text%3e%3ctext x='50' y='720' class='formula' style='animation-delay: 0.9s;' transform='rotate(-18 50 720)'%3eΔ = P * d%3c/text%3e%3ctext x='650' y='650' class='formula' style='animation-delay: 1.0s;' transform='rotate(12 650 650)'%3eSag ≈ r² / 2R%3c/text%3e%3ctext x='380' y='400' class='formula' style='animation-delay: 1.1s;' transform='rotate(0 380 400)'%3eMBS = ED + Dec + 2%3c/text%3e%3cg transform='translate(650 150) scale(0.8) rotate(-10)'%3e%3ctext x='0' y='0' text-anchor='middle' class='snellen' style='animation-delay: 0.3s; font-size: 30px;'%3eE%3c/text%3e%3ctext x='0' y='30' text-anchor='middle' class='snellen' style='animation-delay: 0.4s; font-size: 20px;'%3eF P%3c/text%3e%3ctext x='0' y='55' text-anchor='middle' class='snellen' style='animation-delay: 0.5s; font-size: 15px;'%3eT O Z%3c/text%3e%3ctext x='0' y='75' text-anchor='middle' class='snellen' style='animation-delay: 0.6s; font-size: 10px;'%3eL P E D%3c/text%3e%3c/g%3e%3cg transform='translate(120 400) scale(0.7) rotate(15)'%3e%3cpath class='phoropter' style='animation-delay: 0.7s;' d='M-50,0 a20,20 0 1,0 40,0 a20,20 0 1,0 -40,0 M50,0 a20,20 0 1,0 -40,0 a20,20 0 1,0 40,0 M-10,0 H10 M0,-10 V10 M-60,-20 H60 M-40,-30 H-20 M20,-30 H40'%3e%3c/path%3e%3ccircle class='phoropter' style='animation-delay: 0.8s;' cx='-30' cy='0' r='25'%3e%3c/circle%3e%3ccircle class='phoropter' style='animation-delay: 0.9s;' cx='30' cy='0' r='25'%3e%3c/circle%3e%3c/g%3e%3c/svg%3e")`,
        }}
      />
      <div className="w-full max-w-4xl z-10">
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
              <Card className="flex h-full items-center transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary bg-card/80 backdrop-blur-sm">
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
            <p>© {new Date().getFullYear()} Optical Prime. All Rights Reserved.</p>
            {appVersion && <p className="mt-1 opacity-75">Version {appVersion}</p>}
        </footer>
      </div>
    </main>
  );
}

    