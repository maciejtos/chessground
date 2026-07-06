import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import ClientLayout from './client-layout';

const outfit = Outfit({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ChessGround — Chess with Unique AI Opponents',
  description:
    'Play chess against unique animated AI opponents — a T-Rex, an Elephant, a Creeper, and a Red Ninja. Choose your rival and prove your skill!',
  keywords: ['chess', 'chess game', 'AI chess', 'play chess online', 'chess opponents'],
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>♞</text></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased`} suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
