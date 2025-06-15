import type { Metadata } from 'next'
import { Courier_Prime } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { MusicPlayer, RAGInterface } from '@/components/InteractiveElements'
import NeuralArtGenerator from '@/components/NeuralArtGenerator'
import Notes from '@/components/Notes'

const courierPrime = Courier_Prime({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Perspectine',
  description: 'A blog about technology, art and more',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={courierPrime.className}>
        <main className="home-wrapper">
          {/* Left Column */}
          <div className="home-column">
            <Navigation />
            <MusicPlayer />
            <Notes />
            <NeuralArtGenerator />
            {/* Ads */}
            <div className="ad-space">
              <div className="text">space</div>
            </div>
          </div>

          {/* Middle Column - Blog Posts / Children */}
          <div className="home-column">
            {children}
          </div>

          {/* Right Column */}
          <div className="home-column">
            <RAGInterface />
            
            {/* Ads */}
            <div className="ad-space">
              <div className="text">space</div>
            </div>
            <div className="ad-space">
              <div className="text">space</div>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}


