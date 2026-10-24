// Root layout that wires global providers, Clerk, fonts, and application metadata.
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from 'next/font/google'
import Provider from './provider';
import { Toaster } from '@/components/ui/toast';
export const metadata: Metadata = {
  title: "AMIGO AI · agents on the night shift",
  description: "Describe a job once. AMIGO builds the agent, plugs it into your apps, and keeps it running on schedule.",
};

// Display font for headings, Geist for body text, Geist Mono for labels and numbers.
const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display' })
const body = Geist({ subsets: ['latin'], variable: '--font-body' })
const code = Geist_Mono({ subsets: ['latin'], variable: '--font-code' })

// Match Clerk's sign-in, sign-up and user menu to the dark theme.
const clerkAppearance = {
  variables: {
    colorPrimary: '#ffb224',
    colorBackground: '#131417',
    colorText: '#ecebe6',
    colorTextSecondary: '#8d8c86',
    colorInputBackground: '#0b0c0e',
    colorInputText: '#ecebe6',
    colorTextOnPrimaryBackground: '#14110a',
    // Newer Clerk versions use these names for the same colours.
    colorForeground: '#ecebe6',
    colorMutedForeground: '#8d8c86',
    colorInput: '#0b0c0e',
    colorInputForeground: '#ecebe6',
    colorPrimaryForeground: '#14110a',
    colorNeutral: '#ecebe6',
    borderRadius: '0.375rem',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" className={`${display.variable} ${body.variable} ${code.variable}`}>
        <body style={{ margin: 0, padding: 0 }}>
          <Provider>
            {children}
          </Provider>
          <Toaster timeout={3000} />
        </body>
      </html>
    </ClerkProvider>
  );
}
