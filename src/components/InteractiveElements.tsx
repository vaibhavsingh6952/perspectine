"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import Image from 'next/image'

interface Artwork {
  title: string
  artist: string
  date: string
  medium: string
  url: string
}

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentTrack = {
    url: "http://stream.radioparadise.com/mellow-128"
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', () => setIsPlaying(false))

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', () => setIsPlaying(false))
    }
  }, [])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
      setVolume(newVolume)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="home-module">
      <div className="module-header">
        <h3 className="h4">Gramophone</h3>
      </div>
      <div className="module-body">
        <div className="music-player-compact">
          <audio ref={audioRef} src={currentTrack.url} />
          
          <div className="flex items-center gap-4">
            <Image 
              src="/gramophone.gif" 
              alt="Gramophone" 
              width={96} 
              height={96}
              className="opacity-80"
            />
            <div className="music-controls-compact">
              <button 
                type="button" 
                className="control-btn-compact"
                onClick={togglePlay}
                suppressHydrationWarning
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>

              <div className="volume-control-compact">
                <button 
                  type="button" 
                  className="volume-btn-compact"
                  onClick={toggleMute}
                  suppressHydrationWarning
                >
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="volume-slider-compact"
                  suppressHydrationWarning
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RAGInterface() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [loading, setLoading] = useState(false)
  const [artwork, setArtwork] = useState<Artwork | null>(null)

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await fetch('/api/artwork', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        if (!response.ok) throw new Error('Artless today')
        const data = await response.json()
        setArtwork(data)
      } catch (error) {
        console.error('Error fetching artwork:', error)
      }
    }

    // Fetch new artwork on every component mount (tab reload)
    fetchArtwork()
  }, []) // Empty dependency array means this runs once on mount

  const askAI = async () => {
    if (!query.trim()) return
    
    const userMessage = { role: 'user' as const, content: query }
    setMessages(prev => [...prev, userMessage])
    setQuery('')
    setLoading(true)

    try {

      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userMessage.content }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      const assistantMessage = { 
        role: 'assistant' as const, 
        content: data.answer 
      }
      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('Error fetching from RAG API:', error)
      const errorMessage = { 
        role: 'assistant' as const, 
        content: 'Sorry, there was an error processing your request.' 
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      askAI()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="home-module rag-module h-full flex flex-col">
      <div className="module-header">
        <h3 className="h4">Butler</h3>
        <div className="rag-header-controls">
          <button 
            key="clear-chat"
            type="button"
            onClick={clearChat}
            className="clear-btn"
            title="Clear Chat"
            suppressHydrationWarning
          >
            🗑️
          </button>
        </div>
      </div>
      <div className="module-body flex-1 flex flex-col overflow-hidden">
        <div className="rag-interface-enhanced flex-1 flex flex-col">
          <div className="chat-messages flex-1 overflow-y-auto">
            {artwork && (
              <div className="border border-white/10 rounded-lg p-2 mb-2 max-w-[120px] mx-auto">
                <img 
                  src={artwork.url} 
                  alt={artwork.title}
                  className="w-full h-[30px] object-cover rounded"
                />
                <h3 className="text-[8px] font-medium text-white mt-1 truncate">{artwork.title}</h3>
              </div>
            )}
            {messages.length === 0 && (
              <div className="welcome-message">
                <p style={{ textAlign: 'left' }}>hi.</p>
                <p style={{ textAlign: 'left' }}>so you have some time to spare?</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <div className="message-content typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-area mt-2 flex-shrink-0">
            <div className="input-container">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="chat-input"
                rows={2}
                placeholder="Type your message..."
                disabled={loading}
              />
              <button
                type="button"
                onClick={askAI}
                disabled={loading || !query.trim()}
                className="send-btn"
                title="Send message"
              >
                {loading ? '⏳' : '💬'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}





