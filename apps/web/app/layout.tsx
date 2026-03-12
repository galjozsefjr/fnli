import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from 'next/font/google';
import "./globals.css";
import Image from "next/image";
import logo from '../public/lottery-simulator.svg';
import Link from "next/link";
import { AuthProvider } from "@/auth/auth.provider";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const nunito = Nunito({
  variable: "--font-nunito-mono",
  subsets: ['latin-ext']
});

const nunitoSans = Nunito_Sans({
  variable: "--font-sans",
  subsets: ['latin-ext']
});

export const metadata: Metadata = {
  title: "Lottery Simulator",
  description: "Lottery Simulator by Fictional Numbers Lottery Inc.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("antialiased", nunito.variable, nunitoSans.variable, "font-sans")} data-theme="light">
      <body>
        <AuthProvider>
          <header className="before:absolute before:bg-[#A6D9C8] before:w-1/2 before:h-full before:z-0 after:absolute after:bg-[#F6F0C6] after:w-1/2 after:h-full after:z-0 after:right-0 after:top-0 relative min-h-15">
            <div className="mx-auto flex max-w-5xl bg-linear-(--header-bg-gradient) relative z-1 px-5 min-h-15 h-full content-center items-center self-stretch">
              <Link href="/" className="flex gap-4 md:gap-8">
                <Image src={logo} unoptimized width={28} height={29} alt="Lottery Simulator" />
                <h1 className="md:text-4xl/14 text-xl/7 font-bold text-white">Lottery Simulator</h1>
              </Link>
            </div>
          </header>
          <div className="flex items-center justify-center font-sans mt-6 md:mt-12 px-4">
            {/*box-shadow: 2px 2px 10px 0px #0000001A;*/}
            <main className="flex w-full max-w-[792px] flex-col justify-between p-4 pb-8 md:py-12 md:px-20 items-start drop-shadow-md bg-white md:rounded-3xl rounded-xs">
              {children}
            </main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

