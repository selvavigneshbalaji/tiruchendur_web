import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Fraunces } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const fraunces = Fraunces({ variable: '--font-fraunces', subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Tiruchendur Stays | Hotels & Homestays near Murugan Temple', template: '%s | TiruchendurStay.in' },
  description: 'Book the best hotels, homestays and beachfront stays in Tiruchendur near the Murugan Temple. Verified properties, best price guaranteed, free cancellation.',
  keywords: ['Tiruchendur stay', 'Tiruchendur hotels', 'Tiruchendur homestay', 'hotels near Tiruchendur Murugan temple', 'Tiruchendur booking', 'Tiruchendur beach hotel', 'Thiruchendur hotel', 'Tiruchendur pilgrimage stay', 'budget stay Tiruchendur', 'Tiruchendur family homestay'],
  authors: [{ name: 'TiruchendurStay.in' }],
  creator: 'TiruchendurStay.in',
  metadataBase: new URL('https://www.tiruchendurstay.in'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website', locale: 'en_IN', url: '/', siteName: 'Tiruchendur Stays',
    title: 'Tiruchendur Stays | Hotels & Homestays near Murugan Temple',
    description: 'Book verified stays near Tiruchendur Murugan Temple. Sea view rooms, heritage homes, budget stays. Best price guaranteed.',
    images: [{ url: '/images/temple-hero.png', width: 1200, height: 630, alt: 'Tiruchendur Murugan Temple by the Sea' }],
  },
  twitter: { card: 'summary_large_image', title: 'Tiruchendur Stays | Hotels near Murugan Temple', description: 'Book hotels and homestays near Tiruchendur Murugan Temple. Best price guaranteed.', images: ['/images/temple-hero.png'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
  icons: {
    icon: [{ url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' }, { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' }, { url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [{ media: '(prefers-color-scheme: light)', color: 'white' }, { media: '(prefers-color-scheme: dark)', color: 'black' }],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} bg-background`}>
      <body suppressHydrationWarning className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-SBHBL7KLQD"
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
               function gtag(){dataLayer.push(arguments);}
               gtag('js', new Date());
               gtag('config', 'G-SBHBL7KLQD');`}
            </Script>
            <Analytics />
          </>
        )}
      </body>
    </html>
  )
}
