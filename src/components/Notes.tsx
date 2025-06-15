'use client'

import React, { useState, useEffect } from 'react'

interface Poem {
  title: string
  author: string
  lines: string[]
}

export default function Notes() {
  const [poem, setPoem] = useState<Poem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPoem = async () => {
      try {
        const response = await fetch('https://poetrydb.org/random/1')
        if (!response.ok) throw new Error('Failed to fetch poem')
        const data = await response.json()
        setPoem(data[0])
      } catch (error) {
        console.error('Error fetching poem:', error)
        // Set a default poem in case of error
        setPoem({
          title: "The Road Not Taken",
          author: "Robert Frost",
          lines: ["Two roads diverged in a yellow wood", "And sorry I could not travel both", "And be one traveler, long I stood", "And looked down one as far as I could"]
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPoem()
  }, [])

  return (
    <div className="home-module">
      <div className="module-header">
        <h3 className="h4">Notes</h3>
      </div>
      <div className="module-body">
        {loading ? (
          <div className="text">Loading poem...</div>
        ) : poem && (
          <div className="mb-4">
            <div className="text-sm font-medium text-text-secondary">{poem.title} by {poem.author}</div>
            <br/>
            <div className="text-sm text-text-primary">
              {poem.lines.slice(0, 20).join(' ')}
              {poem.lines.length > 20 ? '...' : ''}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-sm text-text-primary">
                <br/>
                <p>Drink two glass of orange juice</p>
                <p>Read The Undiscovered Self by Jung</p>
                <p></p>
                
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 