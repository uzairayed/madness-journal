"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { useAuth } from "@/components/firebase-auth-provider"
import { saveDiaryEntry, DiaryEntry, getUserProfile, checkAndUnlockAchievements, getUserDiaryEntries } from "@/lib/firebase"
import { countWords } from "@/lib/utils"

interface MadnessWord {
  id: string
  text: string
  position: number
  timestamp: number
  corrupted: boolean
  echoed: boolean
  fontFamily: string
  blurred: boolean
}

interface GhostText {
  id: string
  text: string
  x: number
  y: number
  delay: number
}

const corruptedGlyphs = ['∴', '⌘', '☍', 'ƒ', '◊', '∆', '≈', '≠', '∞', '◈', '▓', '░', '█', '▒']
const backgroundGlyphs = ['⌐', '¬', '░', '▒', '▓', '█', '◘', '◙', '◕', '◔', '◑', '◒', '◓', '◐', '∴', '∵', '⌘', '☢', '☣', '⚡', '✦', '✧', '◊', '⬡', '⬢', '⬣']
const ghostPhrases = [
  "don't stop",
  "they're watching", 
  "keep writing",
  "the voices grow louder",
  "madness spreads",
  "truth in chaos",
  "embrace the void",
  "let it consume you"
]
const backgroundPhrases = [
  "ERROR_404_SANITY_NOT_FOUND",
  "SYSTEM_COMPROMISED", 
  "NEURAL_PATHWAYS_CORRUPTED",
  "REALITY.EXE_HAS_STOPPED_WORKING",
  "MADNESS_OVERFLOW",
  "CONSCIOUSNESS_FRAGMENTED",
  "VOID_DETECTED",
  "SIGNAL_LOST"
]
const fontFamilies = ['serif', 'monospace', 'cursive', 'fantasy', 'system-ui']

export default function MadnessJournalInput() {
  const { user } = useAuth()
  const router = useRouter()
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [corruptionLevel, setCorruptionLevel] = useState(0)
  const [madnessWords, setMadnessWords] = useState<MadnessWord[]>([])
  const [ghostTexts, setGhostTexts] = useState<GhostText[]>([])
  const [backgroundGlitches, setBackgroundGlitches] = useState<GhostText[]>([])
  const [sessionDuration, setSessionDuration] = useState(0)
  const [lastKeyTime, setLastKeyTime] = useState(Date.now())
  
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const sessionStartRef = useRef(Date.now())
  const autoInsertTimer = useRef<NodeJS.Timeout | null>(null)

  // Calculate progressive madness metrics - bidirectional based on current state
  const madnessIntensity = useMemo(() => {
    const timeComponent = Math.min(5, Math.floor(sessionDuration / 5000)) // Max 5 from time
    const lengthComponent = Math.min(5, Math.floor(text.length / 100)) // Max 5 from length
    return Math.min(10, timeComponent + lengthComponent)
  }, [sessionDuration, text.length])
  
  const corruptionChance = Math.min(0.08, madnessIntensity * 0.008) // Reduced from 0.3 to 0.08
  const echoChance = Math.min(0.05, madnessIntensity * 0.005) // Reduced from 0.2 to 0.05
  const fontShiftChance = Math.min(0.03, madnessIntensity * 0.003) // Reduced from 0.15 to 0.03

  // Insert ghost text
  const insertGhostText = useCallback(() => {
    const phrase = ghostPhrases[Math.floor(Math.random() * ghostPhrases.length)]
    const ghost: GhostText = {
      id: `ghost-${Date.now()}`,
      text: phrase,
      x: Math.random() * 70 + 10, // 10-80% from left
      y: Math.random() * 60 + 20, // 20-80% from top
      delay: Math.random() * 2
    }

    setGhostTexts(prev => [...prev, ghost])

    // Remove ghost after animation
    setTimeout(() => {
      setGhostTexts(prev => prev.filter(g => g.id !== ghost.id))
    }, 8000)
  }, [])

  // Insert background glitches
  const insertBackgroundGlitch = useCallback(() => {
    const isSymbol = Math.random() < 0.7
    const text = isSymbol 
      ? backgroundGlyphs[Math.floor(Math.random() * backgroundGlyphs.length)]
      : backgroundPhrases[Math.floor(Math.random() * backgroundPhrases.length)]
    
    const glitch: GhostText = {
      id: `glitch-${Date.now()}-${Math.random()}`,
      text,
      x: Math.random() * 90 + 5, // 5-95% from left
      y: Math.random() * 90 + 5, // 5-95% from top
      delay: Math.random() * 1
    }

    setBackgroundGlitches(prev => {
      // Reduce limit to prevent performance issues that block typing
      const limited = prev.slice(-8) // Reduced from 15 to 8
      return [...limited, glitch]
    })

    // Remove glitch after short time
    setTimeout(() => {
      setBackgroundGlitches(prev => prev.filter(g => g.id !== glitch.id))
    }, isSymbol ? 2000 : 4000)
  }, [])

  // Clean up effects when intensity decreases
  useEffect(() => {
    // Remove excess background glitches if intensity drops
    if (madnessIntensity < 3) {
      setBackgroundGlitches(prev => prev.slice(-2)) // Keep only 2 when low intensity
    } else if (madnessIntensity < 5) {
      setBackgroundGlitches(prev => prev.slice(-4)) // Keep only 4 when medium intensity
    }
    
    // Clear ghost text if intensity drops too low
    if (madnessIntensity <= 3) {
      setGhostTexts([])
    }
  }, [madnessIntensity])

  // Session duration tracker
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration(Date.now() - sessionStartRef.current)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Auto-insert ghost text
  useEffect(() => {
    if (madnessIntensity > 3) {
      const delay = Math.max(3000, 10000 - madnessIntensity * 500)
      autoInsertTimer.current = setTimeout(() => {
        insertGhostText()
      }, delay)
    }
    return () => {
      if (autoInsertTimer.current) {
        clearTimeout(autoInsertTimer.current)
      }
    }
  }, [text, madnessIntensity, insertGhostText])

  // Auto-insert background glitches and symbols
  useEffect(() => {
    if (madnessIntensity > 1) {
      // More frequent symbol spawning as intensity increases
      const baseInterval = Math.max(200, 1000 - madnessIntensity * 80) // Faster spawning with higher intensity
      const spawnChance = Math.min(0.8, madnessIntensity * 0.1) // Higher chance with intensity
      
      const interval = setInterval(() => {
        if (Math.random() < spawnChance) {
          insertBackgroundGlitch()
        }
      }, baseInterval)

      return () => clearInterval(interval)
    }
  }, [madnessIntensity, insertBackgroundGlitch])

  // Additional random symbol shower at high intensity
  useEffect(() => {
    if (madnessIntensity > 5) {
      const symbolInterval = setInterval(() => {
        // Spawn fewer symbols to prevent typing lag
        const symbolCount = Math.min(2, Math.floor(madnessIntensity / 4)) // Reduced count and increased divisor
        for (let i = 0; i < symbolCount; i++) {
          setTimeout(() => {
            const randomSymbol = backgroundGlyphs[Math.floor(Math.random() * backgroundGlyphs.length)]
            const symbolGlitch: GhostText = {
              id: `symbol-${Date.now()}-${i}-${Math.random()}`,
              text: randomSymbol,
              x: Math.random() * 95 + 2.5, // 2.5-97.5% from left
              y: Math.random() * 95 + 2.5, // 2.5-97.5% from top
              delay: Math.random() * 0.5
            }

            setBackgroundGlitches(prev => {
              const limited = prev.slice(-8) // Reduced from 15 to 8
              return [...limited, symbolGlitch]
            })

            // Remove symbols faster to prevent accumulation
            setTimeout(() => {
              setBackgroundGlitches(prev => prev.filter(g => g.id !== symbolGlitch.id))
            }, Math.random() * 1000 + 300) // Shorter lifespan: 0.3-1.3 seconds
          }, i * 100) // Longer stagger to reduce simultaneous spawning
        }
      }, Math.max(800, 2500 - madnessIntensity * 100)) // Slower intervals

      return () => clearInterval(symbolInterval)
    }
  }, [madnessIntensity])

  // Process text into madness words
  const processTextIntoWords = useCallback((inputText: string) => {
    const words = inputText.split(/(\s+)/)
    const newMadnessWords: MadnessWord[] = []
    let position = 0

    words.forEach((word, index) => {
      if (word.trim()) {
        // Determine word effects based on madness level and time
        const wordAge = Date.now() - lastKeyTime
        const shouldCorrupt = Math.random() < corruptionChance
        const shouldEcho = Math.random() < echoChance
        const shouldShiftFont = Math.random() < fontShiftChance
        const shouldBlur = madnessIntensity > 8 && Math.random() < 0.02 // Very rare blur effect
        
        if (word === ' ') {
          newMadnessWords.push({
            id: `word-${index}-${Date.now()}`,
            text: word,
            position: index,
            timestamp: Date.now(),
            corrupted: false,
            echoed: false,
            fontFamily: 'inherit',
            blurred: false
          })
        } else {
          newMadnessWords.push({
            id: `word-${index}-${Date.now()}`,
            text: shouldCorrupt ? (corruptedGlyphs[Math.floor(Math.random() * corruptedGlyphs.length)] + word) : word,
            position: index,
            timestamp: Date.now(),
            corrupted: shouldCorrupt,
            echoed: shouldEcho,
            fontFamily: shouldShiftFont ? fontFamilies[Math.floor(Math.random() * fontFamilies.length)] : 'inherit',
            blurred: shouldBlur
          })
        }
      } else if (word) {
        // Handle whitespace
        newMadnessWords.push({
          id: `space-${position}-${Date.now()}`,
          text: word,
          position,
          timestamp: Date.now(),
          corrupted: false,
          echoed: false,
          fontFamily: 'inherit',
          blurred: false
        })
      }
      position += word.length
    })

    return newMadnessWords
  }, [corruptionChance, echoChance, fontShiftChance, madnessIntensity, lastKeyTime])

  // Handle text input
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setText(newText)
    setLastKeyTime(Date.now())
    
    // Update corruption level
    const newCorruptionLevel = Math.min(10, Math.floor(newText.length / 50))
    setCorruptionLevel(newCorruptionLevel)

    // Process text into madness words
    const processed = processTextIntoWords(newText)
    setMadnessWords(processed)
  }

  // Save functionality
  const handleSave = async () => {
    if (!text.trim() || !user) return
    
    setIsSaving(true)
    try {
      const entry: DiaryEntry = {
        id: '',
        userId: user.uid,
        title: title.trim() || 'Untitled Madness Entry',
        content: text,
        mode: 'madness',
        timestamp: new Date(),
        isPublic: isPublic,
        metadata: {
          wordCount: countWords(text),
          characterCount: text.length
        },
        corruptionLevel
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
      }
      
      // Reset form
      setText("")
      setTitle("")
      setCorruptionLevel(0)
      setIsPublic(false)
      setMadnessWords([])
      setGhostTexts([])
      sessionStartRef.current = Date.now()
      
      console.log('Madness entry saved successfully!')
      
      // Redirect to read page after successful save
      setTimeout(() => {
        router.push('/read')
      }, 1000)
      
    } catch (error) {
      console.error('Error saving madness entry:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={`min-h-screen p-4 transition-all duration-1000 relative 
      ${madnessIntensity > 3 ? 'madness-flicker' : ''}`}
      style={{ 
        background: madnessIntensity > 5 
          ? `radial-gradient(circle at ${Math.random() * 100}% ${Math.random() * 100}%, rgba(147, 51, 234, 0.1) 0%, rgba(0, 0, 0, 0.9) 70%)`
          : 'linear-gradient(135deg, #000000 0%, #1a0b2e 50%, #000000 100%)'
      }}
    >
      {/* Full-screen background glitches and symbols */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Background glitches covering entire screen */}
        {backgroundGlitches.map((glitch) => {
          // Generate random bright colors
          const brightColors = [
            '#FF0080', // Bright magenta
            '#00FF80', // Bright green
            '#80FF00', // Bright lime
            '#FF8000', // Bright orange
            '#0080FF', // Bright blue
            '#8000FF', // Bright violet
            '#FF0040', // Bright red-pink
            '#40FF00', // Bright chartreuse
            '#00FF40', // Bright spring green
            '#FF4000', // Bright red-orange
            '#4000FF', // Bright blue-violet
            '#FF00C0', // Bright hot pink
            '#C0FF00', // Bright yellow-green
            '#00C0FF', // Bright cyan
            '#FFE000', // Bright yellow
            '#E000FF'  // Bright electric purple
          ]
          const randomColor = brightColors[Math.floor(Math.random() * brightColors.length)]
          
          return (
            <div
              key={glitch.id}
              className={`absolute font-mono madness-float ${
                glitch.text.length > 10 ? 'text-xs' : 'text-sm'
              }`}
              style={{
                left: `${glitch.x}%`,
                top: `${glitch.y}%`,
                animationDelay: `${glitch.delay}s`,
                transform: `rotate(${Math.random() * 10 - 5}deg)`,
                opacity: Math.random() * 0.6 + 0.3, // Higher opacity for visibility
                color: randomColor,
                textShadow: `0 0 8px ${randomColor}`, // Bright glow effect
                filter: `brightness(1.5) saturate(2)` // Extra brightness and saturation
              }}
            >
              {glitch.text}
            </div>
          )
        })}

        {/* Ghost text covering entire screen */}
        {ghostTexts.map((ghost) => (
          <div
            key={ghost.id}
            className="absolute text-purple-300/40 font-mono text-sm madness-float"
            style={{
              left: `${ghost.x}%`,
              top: `${ghost.y}%`,
              animationDelay: `${ghost.delay}s`,
              textShadow: '0 0 10px rgba(168, 85, 247, 0.6)',
            }}
          >
            {ghost.text}
          </div>
        ))}
      </div>

      {/* Main content with higher z-index */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-4 sm:space-y-6"
      >
        {/* Header */}
        <div className="relative flex justify-center">
          <Link href="/write" className="absolute left-0 top-0">
            <Button variant="ghost" size="sm" className="text-sm text-purple-400 hover:text-purple-300">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Back
            </Button>
          </Link>
          <div className="text-center">
            <h1 className={`text-xl sm:text-2xl font-bold text-purple-300 ${
              madnessIntensity > 4 ? 'madness-pulse' : ''
            }`}>
              🌀 Madness Journal
            </h1>
            <p className="text-sm sm:text-base text-purple-200/80">
              Descent into digital madness... corruption level: {corruptionLevel}/10
            </p>
          </div>
        </div>

        {/* Writing Area */}
        <Card className="p-4 sm:p-6 relative bg-gray-900/50 backdrop-blur-sm border-2 border-purple-500/30">
          <div className="space-y-3 sm:space-y-4 relative z-10">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2 text-purple-300">
                Title (optional)
              </label>
              <input
                id="title" 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title your madness..."
                className="w-full px-3 py-2 border border-purple-500/30 rounded-md bg-slate-800/60 text-purple-100 text-sm sm:text-base transition-all duration-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            {/* Main Text Area */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2 text-purple-300">
                Your Descent
              </label>
              
              <div className="relative min-h-[200px] sm:min-h-[300px] border border-purple-500/30 rounded-md p-3 bg-gray-800/50">
                {/* Hidden textarea for input */}
                <textarea
                  ref={inputRef}
                  id="content"
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Let the madness flow through your fingers..."
                  className="absolute inset-0 w-full h-full p-3 bg-transparent text-transparent caret-purple-400 resize-none text-sm sm:text-base border-none outline-none madness-caret"
                  style={{ caretColor: madnessIntensity > 3 ? 'transparent' : '#c084fc' }}
                />
                
                {/* Visible madness text display */}
                <div className="relative w-full min-h-full text-sm sm:text-base leading-relaxed overflow-hidden">
                  {text.length === 0 ? (
                    <span className="text-purple-400/60">
                      Let the madness flow through your fingers...
                    </span>
                  ) : (
                    <div className="relative overflow-hidden">
                      {madnessWords.map((word, index) => (
                        <span
                          key={word.id}
                          className={`inline transition-all duration-500 ${
                            word.corrupted ? 'text-red-400' : 'text-purple-100'
                          } ${
                            word.echoed ? 'text-yellow-400' : ''
                          } ${
                            word.blurred ? 'madness-blur' : ''
                          }`}
                          style={{
                            fontFamily: word.fontFamily,
                            textShadow: word.corrupted ? '0 0 5px rgba(239, 68, 68, 0.8)' : 
                                      word.echoed ? '0 0 5px rgba(251, 191, 36, 0.8)' : 'none'
                          }}
                        >
                          {word.text}
                        </span>
                      ))}
                      
                      {/* Glitching caret */}
                      {madnessIntensity > 3 && (
                        <span className="text-purple-400 madness-caret ml-1">|</span>
                      )}
                    </div>
                  )}
                </div>
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
                <Label htmlFor="public-toggle" className="text-sm">
                  {isPublic ? (
                    <span className="text-green-400">📢 Public Madness</span>
                  ) : (
                    <span className="text-purple-300">🔒 Private Descent</span>
                  )}
                </Label>
              </div>
              
              <Button 
                onClick={handleSave}
                disabled={!text.trim() || isSaving}
                className={`bg-purple-600 hover:bg-purple-700 text-white ${
                  madnessIntensity > 5 ? 'madness-pulse' : ''
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving Madness...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save to the Void
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Corruption Level Indicator */}
          {corruptionLevel > 0 && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-purple-400">
                  Madness Level: {corruptionLevel}/10
                </span>
                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 transition-all duration-300"
                    style={{ width: `${(corruptionLevel / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Session Duration */}
          <div className="absolute bottom-4 left-4 text-xs text-purple-400/60">
            Session: {Math.floor(sessionDuration / 1000)}s | Intensity: {madnessIntensity}
          </div>
        </Card>

        {/* Instructions */}
        <div className="text-center">
          <p className="text-sm text-purple-200/80">
            The longer you write, the deeper the madness grows. Effects intensify with time and length.
          </p>
          <p className="text-xs text-purple-200/60 mt-1">
            Embrace the chaos. Let the corruption flow through your words.
          </p>
        </div>
      </div>
    </div>
  )
} 