"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Volume2, VolumeX } from "lucide-react"
import { useAuth } from "@/components/firebase-auth-provider"
import { saveDiaryEntry, DiaryEntry, getUserProfile, checkAndUnlockAchievements, getUserDiaryEntries } from "@/lib/firebase"
import { countWords } from "@/lib/utils"

interface FrozenCharacter {
  char: string
  id: string
  isFrozen: boolean
  position: number
}

interface IceParticle {
  id: string
  x: number
  y: number
  delay: number
  type: 'freeze' | 'shatter'
}

const IrreversibleModeInput = React.memo(() => {
  const { user } = useAuth()
  const router = useRouter()
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [frozenChars, setFrozenChars] = useState<FrozenCharacter[]>([])
  const [iceParticles, setIceParticles] = useState<IceParticle[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastParticleTime = useRef(0)
  const previousTextLength = useRef(0)

  const addIceParticles = useCallback((type: 'freeze' | 'shatter') => {
    // Drastically limit particles to prevent lag
    const particleCount = type === 'shatter' ? 3 : 1
    const newParticles: IceParticle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: `particle-${Date.now()}-${i}`,
      x: Math.random() * 60 + 20, // Keep particles more centered
      y: Math.random() * 40 + 30,
      delay: i * 0.03, // Very small delay
      type
    }))
    
    setIceParticles(prev => {
      // Limit total particles to prevent performance issues
      const limitedParticles = prev.slice(-5) // Keep only last 5 particles
      return [...limitedParticles, ...newParticles]
    })
    
    // Remove particles after animation
    setTimeout(() => {
      setIceParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)))
    }, type === 'shatter' ? 800 : 1000) // Even shorter duration
  }, [])

  // Freeze characters progressively - OPTIMIZED VERSION
  useEffect(() => {
    if (text.length === 0) {
      setFrozenChars([])
      previousTextLength.current = 0
      return
    }

    // Only process if text actually grew (optimization)
    if (text.length <= previousTextLength.current) {
      previousTextLength.current = text.length
      return
    }

    // Only update characters while preserving existing frozen state
    setFrozenChars(prev => {
      const updatedChars = text.split('').map((char, index) => {
        // Find existing character at this position
        const existingChar = prev.find(fc => fc.position === index)
        
        return {
          char,
          id: existingChar?.id || `char-${index}-${Date.now()}`,
          isFrozen: existingChar?.isFrozen || false, // PRESERVE frozen state
          position: index
        }
      })
      return updatedChars
    })

    // Only set timer for the newest character
    const newCharIndex = text.length - 1
    
    setTimeout(() => {
      setFrozenChars(prev => 
        prev.map(c => 
          c.position === newCharIndex 
            ? { ...c, isFrozen: true } 
            : c
        )
      )
      
      // Throttle particle effects to prevent lag - only for every 5th character
      const now = Date.now()
      if (now - lastParticleTime.current > 1000 && newCharIndex % 5 === 0) { // Only every 1s and every 5th char
        addIceParticles('freeze')
        lastParticleTime.current = now
      }
    }, 2000) // 2 seconds for new character
    
    previousTextLength.current = text.length
  }, [text, addIceParticles])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value
    
    if (newText.length < text.length) {
      e.target.value = text
      addIceParticles("shatter")
      playCrackSound()
      return
    }
    
    setText(newText)
  }, [text, addIceParticles])

  const playCrackSound = useCallback(() => {
    if (!soundEnabled) return
    // Sound implementation would go here
  }, [soundEnabled])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault()
      addIceParticles("shatter")
      playCrackSound()
      return
    }
  }, [addIceParticles, playCrackSound])

  const handleSave = useCallback(async () => {
    if (!text.trim() || !user) return
    
    setIsSaving(true)
    try {
      const entry: DiaryEntry = {
        id: '',
        userId: user.uid,
        title: title.trim() || 'Untitled Entry',
        content: text,
        mode: 'irreversible',
        timestamp: new Date(),
        isPublic: isPublic,
        metadata: {
          wordCount: countWords(text),
          characterCount: text.length
        }
      }
      
      await saveDiaryEntry(entry)
      
      // Check achievements after saving
      try {
        const userProfile = await getUserProfile(user.uid)
        if (userProfile) {
          const userEntries = await getUserDiaryEntries(user.uid, 100)
          await checkAndUnlockAchievements(user.uid, userProfile, userEntries)
        }
      } catch (achievementError) {
        console.error('Error checking achievements:', achievementError)
        // Don't block the save flow if achievement check fails
      }
      
      // Don't reset form in irreversible mode - it's permanent!
      console.log('Entry saved successfully!')
      
      // Redirect to read page after successful save
      setTimeout(() => {
        router.push('/read')
      }, 1000)
      
    } catch (error) {
      console.error('Error saving entry:', error)
    } finally {
      setIsSaving(false)
    }
  }, [text, title, isPublic, user])

  const getDisplayText = useMemo(() => {
    return text.split('').map((char, index) => {
      const frozenChar = frozenChars.find(fc => fc.position === index)
      return {
        char,
        isFrozen: frozenChar?.isFrozen || false,
        id: frozenChar?.id || `char-${index}`
      }
    })
  }, [text, frozenChars])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="relative flex justify-center">
          <Link href="/write" className="absolute left-0 top-0">
            <Button variant="ghost" size="sm" className="text-sm text-cyan-400 hover:text-cyan-300">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Back
            </Button>
          </Link>
          <div className="absolute right-0 top-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-sm border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              {soundEnabled ? <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />}
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-cyan-300">
              🧊 Irreversible Mode
            </h1>
            <p className="text-sm sm:text-base text-cyan-200/80">
              Once written, entries cannot be edited or deleted
            </p>
          </div>
        </div>

        {/* Writing Area */}
        <Card className="p-4 sm:p-6 relative bg-slate-800/50 backdrop-blur-sm border-2 border-cyan-400/30" ref={containerRef}>
          {/* Background effects for irreversible mode */}
          <div
            className={`absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg pointer-events-none transition-opacity duration-300 ${
              isFocused ? 'opacity-80' : 'opacity-40'
            }`}
          />
          
          {/* Simplified Frost Effect */}
          <div
            className="absolute inset-0 pointer-events-none rounded-lg bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5"
          />
          
          <div className="space-y-3 sm:space-y-4 relative z-10">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2 text-cyan-300">
                Title (optional)
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your entry a title..."
                className="w-full px-3 py-2 border border-cyan-400/30 rounded-md bg-slate-700/50 text-cyan-100 placeholder-cyan-200/50 text-sm sm:text-base focus:ring-2 focus:ring-cyan-400/50 focus:outline-none"
              />
            </div>

            {/* Main Input with Frozen Text Effect */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2 text-cyan-300">
                Your Entry
              </label>
              
              {/* Input container with proper positioning */}
              <div className="relative min-h-[200px] sm:min-h-[300px] border border-cyan-400/30 rounded-md p-3 bg-slate-700/50">
                {/* Visible text display with frozen effects */}
                <div 
                  className="w-full text-sm sm:text-base min-h-full flex flex-wrap items-start relative cursor-text font-mono leading-relaxed"
                  onClick={() => inputRef.current?.focus()}
                >
                  {text.length === 0 ? (
                    <span className="text-cyan-200/60">Type your thoughts... they will freeze in time</span>
                  ) : (
                                          getDisplayText.map((charData, index) => (
                      <span
                        key={charData.id}
                        className={`inline-block transition-all duration-700 ${
                          charData.isFrozen 
                            ? 'text-cyan-400 scale-105' 
                            : 'text-cyan-100 scale-100'
                        }`}
                        style={{
                          textShadow: charData.isFrozen ? '0 0 8px rgba(6, 182, 212, 0.8)' : 'none',
                          filter: charData.isFrozen ? 'brightness(1.2)' : 'brightness(1)',
                          // Make spaces visible when frozen
                          backgroundColor: charData.char === ' ' ? (charData.isFrozen ? 'rgba(6, 182, 212, 0.2)' : 'transparent') : 'transparent',
                          minWidth: charData.char === ' ' ? '0.5em' : 'auto'
                        }}
                      >
                        {charData.char === ' ' ? '' : charData.char}
                      </span>
                    ))
                  )}
                  
                  {/* Cursor */}
                  {isFocused && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-cyan-400 ml-1"
                    >
                      |
                    </motion.span>
                  )}
                </div>
                
                {/* Completely invisible input overlay */}
                <input
                  ref={inputRef}
                  type="text"
                  value={text}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder=""
                  className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                  style={{ 
                    fontFamily: 'monospace', 
                    fontSize: 'inherit',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'transparent',
                    caretColor: 'transparent'
                  }}
                  tabIndex={0}
                />
              </div>

              {/* Debug Info */}
              <div className="mt-2 text-xs text-cyan-200/70">
                Frozen characters: {frozenChars.filter(c => c.isFrozen).length} / {frozenChars.length}
              </div>
            </div>

            {/* Privacy and Save Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="public-toggle"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="public-toggle" className="text-sm text-cyan-200">
                  {isPublic ? (
                    <span className="text-cyan-300">📢 Public Entry</span>
                  ) : (
                    <span className="text-cyan-200/80">🔒 Private Entry</span>
                  )}
                </Label>
              </div>
              
              <Button 
                onClick={handleSave}
                disabled={!text.trim() || isSaving}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Entry
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Ice Particles */}
          <AnimatePresence>
            {iceParticles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: particle.x,
                  y: particle.y
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  y: particle.y + (particle.type === 'shatter' ? 30 : 50),
                  rotate: 360,
                  x: particle.x + (particle.type === 'shatter' ? (Math.random() - 0.5) * 20 : 0)
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ 
                  duration: particle.type === 'shatter' ? 1.5 : 2,
                  delay: particle.delay,
                  ease: "easeOut"
                }}
                className="absolute pointer-events-none text-cyan-500 text-sm z-20"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`
                }}
              >
                {particle.type === 'shatter' ? '💥' : '❄️'}
              </motion.div>
            ))}
          </AnimatePresence>
        </Card>

        {/* Instructions */}
        <div className="text-center">
          <p className="text-sm text-cyan-200/80">
            Characters will freeze after 2 seconds. No deletion is allowed in irreversible mode.
          </p>
          <p className="text-xs text-cyan-200/60 mt-1">
            Try pressing backspace to see the shatter effect!
          </p>
        </div>
      </div>
    </div>
  )
})

export default IrreversibleModeInput