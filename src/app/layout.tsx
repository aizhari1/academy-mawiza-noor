import type { Metadata, Viewport } from 'next'
import './globals.css'
import '@/lib/force-latin-digits'
import { SessionRestorer } from '@/components/SessionRestorer'
import { InstallMawiza } from '@/components/InstallMawiza'
import { ThemeToggle, THEME_INIT_SCRIPT } from '@/components/ThemeToggle'
import { BRAND_ICON_192, BRAND_ICON_512, BRAND_APPLE_TOUCH, BRAND_NAME } from '@/lib/brand-logo'

export const metadata: Metadata = {
  title: 'أكاديمية موعظة ونور',
  description: 'نظام إدارة أكاديمية موعظة ونور — تحفيظ القرآن الكريم',
  applicationName: BRAND_NAME,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: BRAND_ICON_192, sizes: '192x192', type: 'image/png' },
      { url: BRAND_ICON_512, sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: BRAND_APPLE_TOUCH, sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: BRAND_NAME,
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#176b52' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1a15' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var o = Number.prototype.toLocaleString;
    Number.prototype.toLocaleString = function(locales, options) {
      var loc = Array.isArray(locales) ? locales[0] : locales;
      if (!loc || String(loc).toLowerCase().indexOf('ar') === 0) {
        return o.call(this, 'en-US', options);
      }
      return o.call(this, locales, options);
    };
  } catch (e) {}
})();
`,
          }}
        />
        <link rel="icon" href={BRAND_ICON_192} type="image/png" />
        <link rel="apple-touch-icon" href={BRAND_APPLE_TOUCH} />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <SessionRestorer />
        <ThemeToggle />
        {children}
        <InstallMawiza />
      </body>
    </html>
  )
}
