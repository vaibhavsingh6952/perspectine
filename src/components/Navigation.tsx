"use client"

import React from 'react'
import { useRouter } from 'next/navigation'

export default function Navigation() {
  const router = useRouter()

  const handleNavigation = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const path = e.target.value
    if (path) {
      router.push(path)
    }
  }

  return (
    <div className="nav-static-parent">
      <div className="nav-dropdown">
        <select 
          className="nav-select bg-celtic-green border-celtic-green-light text-text-primary focus:border-celtic-green-lighter focus:ring-celtic-green-lighter" 
          onChange={handleNavigation}
          defaultValue=""
        >
          <option value="" disabled>More</option>
          <option value="/">Home</option>
          <option value="/about">About</option>
          <option value="/contact">Contact</option>
        </select>
      </div>
    </div>
  )
} 