import React from 'react'
import Link from 'next/link'
import { getBlogPosts } from '@/lib/posts'

export default async function Home() {
  const blogPosts = await getBlogPosts()
  
  return (
    <>
      <div className="home-module">
        <div className="module-header">
          <h3 className="h5">
            <strong>
              PERSPECTINE
            </strong>
          </h3>
        </div>
      </div>

      <div className="home-module">
        <div className="module-body no-padding">
          {blogPosts.map((post, index) => (
            <Link 
              href={`/posts/${post.slug}`}
              key={index} 
              className="blog-post block transition-colors duration-200"
            >
              <div className="blog-meta">
                <span>{post.date}</span>
              </div>
              <h2 className="blog-title">{post.title}</h2>
              <p className="blog-excerpt">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
} 


