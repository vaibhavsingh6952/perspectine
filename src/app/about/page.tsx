import React from 'react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="home-module">
      <div className="module-header">
        <h3 className="h4">About</h3>
      </div>
      <div className="module-body">
        <div className="prose prose-invert">
          <p className="text-lg">
            A software bro who likes to draw and admires art, enjoys deep conversations and unconditionally loves nature. As someone who loves art I have an eye for good design and aesthetics, I like to share my learnings about things which people care about so I created this blog as a medium to share those.
          </p>
          <p>
            I'm currently an undergraduate at VIT Chennai, India. I love creating softwares that mean and yield something, always eager to learn newer algorithms, deep into machine and data intelligence, creating GPU clusters to run models faster and plumbing ML pipelines using MLOps automating pipelines from ETL to Monitoring.
          </p>
        
          <p>
            Feel free to reach out anytime!
            <a href="mailto:vaibhavsingh6952@gmail.com" className="text-accent-blue hover:text-accent-purple">vaibhavsingh6952@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  )
} 