'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function ContactPage() {
  return (
    <div className="home-module">
      <div className="module-header">
        <h3 className="h4">Contact</h3>
      </div>
      <div className="module-body">
        <p className="text-lg mb-6">
          Let's connect.
        </p>
        <div>
          <div className="mb-4">
            <a 
              href="https://www.linkedin.com/in/vaibhav-singh-b83b54275" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <Image 
                src="/linkedin.png" 
                alt="LinkedIn" 
                width={24} 
                height={24}
                className="opacity-80 hover:opacity-100 transition-opacity"
              />
              LinkedIn
            </a>
          </div>
          <div className="mb-4">
            <a 
              href="https://github.com/vaibhavsingh6952" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <Image 
                src="/github.png" 
                alt="GitHub" 
                width={24} 
                height={24}
                className="opacity-80 hover:opacity-100 transition-opacity"
              />
              GitHub
            </a>
          </div>
          <div className="mb-4">
            <a 
              href="mailto:vaibhavsingh6952@gmail.com" 
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <Image 
                src="/gmail.png" 
                alt="Gmail" 
                width={24} 
                height={24}
                className="opacity-80 hover:opacity-100 transition-opacity"
              />
              vaibhavsingh6952@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}