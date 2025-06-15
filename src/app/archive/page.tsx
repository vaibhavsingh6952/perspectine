import React from 'react'
import Link from 'next/link'

export default function ArchivePage() {
  // In a real application, you would fetch the archive data from an API
  const archives = [
    {
      year: '2024',
      posts: [
        { title: 'Post Title 1', date: 'March 1, 2024', slug: 'post-1' },
        { title: 'Post Title 2', date: 'February 28, 2024', slug: 'post-2' },
        { title: 'Post Title 3', date: 'February 25, 2024', slug: 'post-3' },
        { title: 'Post Title 4', date: 'February 20, 2024', slug: 'post-4' },
        { title: 'Post Title 5', date: 'February 15, 2024', slug: 'post-5' },
        { title: 'Post Title 6', date: 'February 10, 2024', slug: 'post-6' },
      ]
    },
    {
      year: '2023',
      posts: [
        { title: 'Post Title 7', date: 'December 15, 2023', slug: 'post-7' },
        { title: 'Post Title 8', date: 'November 20, 2023', slug: 'post-8' },
        { title: 'Post Title 9', date: 'October 10, 2023', slug: 'post-9' },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="flex justify-between items-center">
            <Link href="/" className="text-xl font-light tracking-wider">
              BLOG
            </Link>
            <div className="space-x-8 text-sm">
              <Link href="/about" className="hover:text-gray-600">About</Link>
              <Link href="/archive" className="hover:text-gray-600">Archive</Link>
              <Link href="/contact" className="hover:text-gray-600">Contact</Link>
            </div>
          </nav>
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-light tracking-wide mb-8">Archive</h1>
        
        <div className="space-y-12">
          {archives.map((archive) => (
            <div key={archive.year}>
              <h2 className="text-xl font-light tracking-wide mb-4">{archive.year}</h2>
              <ul className="space-y-2">
                {archive.posts.map((post) => (
                  <li key={post.slug}>
                    <Link 
                      href={`/posts/${post.slug}`}
                      className="flex justify-between items-center hover:underline"
                    >
                      <span>{post.title}</span>
                      <span className="text-sm text-gray-500">{post.date}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 Blog. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 