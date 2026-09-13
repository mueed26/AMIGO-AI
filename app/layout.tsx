/**
 * Root layout that wires global providers, Clerk, fonts, and application metadata.
 */
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import type { Metadata } from "next";
import { Figtree } from 'next/font/google'
import { Toaster } from '@/components/ui/toast';
import Provider from './provider';
export const metadata: Metadata = {
  title: "AMIGO AI ",
  description: " run AI agents for everyday operations.",
};

const figTree = Figtree({ subsets: ['latin'] })



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <ClerkProvider>
      <html lang="en">
        <body style={{ margin: 0, padding: 0 }} className={figTree.className}>
          <Provider>
            {children}
          </Provider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
