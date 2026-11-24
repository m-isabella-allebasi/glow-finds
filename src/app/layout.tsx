import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Glow Finds | Curadoria & Achadinhos TikTok Shop',
  description:
    'Nossa seleção editorial dos melhores achadinhos, beleza, moda e desejos virais do TikTok Shop.',
  openGraph: {
    title: 'Glow Finds | Curadoria & Achadinhos',
    description: 'Os melhores achadinhos selecionados com curadoria exclusiva.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FAF8F6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${playfair.variable} ${plusJakarta.variable}`}
    >
      <body className="min-h-screen bg-pearl font-sans text-noir antialiased selection:bg-blush/40 selection:text-burgundy">
        {children}
      </body>
    </html>
  );
}
