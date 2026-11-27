import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { BRAND_CONFIG } from '../src/config';

const pageTitle = `${BRAND_CONFIG.brandName.en} – AI Background Remover & Creative Photo Studio`;
const pageDesc =
  'Remove image backgrounds privately in your browser with RMBG-1.4, IMG.LY ISNet, and Cloud ZeroGPU. Bulk ZIP export, Text Behind Subject, DSLR Bokeh, and Magic Brush.';

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDesc,
  openGraph: {
    title: pageTitle,
    description: pageDesc,
    type: 'website',
    siteName: BRAND_CONFIG.brandName.en,
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDesc,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: BRAND_CONFIG.brandName.en,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    description: pageDesc,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Anton&family=Cairo:wght@400;600;700;800&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Readex+Pro:wght@500;700&family=Tajawal:wght@400;500;700&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#F9FAFB] text-[#111827] antialiased" suppressHydrationWarning>
        {children}
        <Script src="./coi-serviceworker.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
