import './globals.css'
import '@fontsource/press-start-2p/400.css'
import BackgroundVideo from '@/components/BackgroundVideo'
// If you add a font package for KongText later, import it here as well

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <BackgroundVideo />
        {children}
      </body>
    </html>
  )
}
