import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// Load fonts correctly
const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Kings Massage Therapy Booking',
  description: 'Book your personalized massage therapy session with our expert freelance therapist. Swedish, Shiatsu, Thai, and combination treatments available.',
  generator: 'Next.js',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
}

export const viewport: Viewport = {
  themeColor: '#4a9c7d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Critical: Prevent desktop view override
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html 
      lang="en" 
      className={`${geistSans.variable} ${geistMono.variable} font-sans`}
      // Force mobile rendering agent
      data-user-agent="Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36"
    >
      <body className="min-h-screen bg-gray-50 antialiased">
        {/* Prevent desktop view injection */}
        <script dangerouslySetInnerHTML={{ __html: `
          // Lock viewport to mobile
          if (window.innerWidth > 768) {
            document.documentElement.style.zoom = window.innerWidth / 375 * 1; // Match iPhone SE size
          }
          // Block desktop view scripts
          Object.defineProperty(window, 'matchMedia', {
            value: (query) => ({
              matches: query.includes('max-width') ? true : false,
              addListener: () => {},
              removeListener: () => {}
            })
          });
        `}} />
        
        {children}
        <Analytics />
      </body>
    </html>
  )
}
