"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useParams } from "next/navigation"
import { useAuth } from "@/components/firebase-auth-provider"
import { saveDiaryEntry, DiaryEntry } from '@/lib/firebase'

const modeConfigs = {
  madness: {
    name: "Madness Journal",
    icon: "🌀",
    description: "Progressive text corruption and visual glitches"
  },
  timelocked: {
    name: "Time-Locked Mode",
    icon: "⏰",
    description: "Entries are locked for a specific duration"
  },
  echo: {
    name: "Echo Mode",
    icon: "🔊",
    description: "Words echo back with variations"
  },
  shadow: {
    name: "Shadow Journaling Mode",
    icon: "👤",
    description: "Hidden layers of text"
  },
  irreversible: {
    name: "Irreversible Mode",
    icon: "🔒",
    description: "Once written, cannot be edited"
  },
  alternative: {
    name: "Alternative Reality Mode",
    icon: "🌌",
    description: "Parallel versions in different realities"
  }
}

export default function WritePage() {
  const params = useParams()
  const mode = params.mode as string
  const modeConfig = modeConfigs[mode as keyof typeof modeConfigs] || modeConfigs.madness
  const { user } = useAuth()

  const [text, setText] = useState("")
  const [title, setTitle] = useState("")
  const [corruptionLevel, setCorruptionLevel] = useState(0)
  const [entries, setEntries] = useState<string[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [isLoading, setIsLoading] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Initialize AudioContext on first user gesture and cleanup on unmount
  useEffect(() => {
    const ensureAudioContext = () => {
      if (!audioCtxRef.current) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        audioCtxRef.current = ctx
      } else if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume()
      }
    }

    const handleFirstInteraction = () => {
      ensureAudioContext()
      window.removeEventListener("pointerdown", handleFirstInteraction)
      window.removeEventListener("keydown", handleFirstInteraction)
    }

    window.addEventListener("pointerdown", handleFirstInteraction, { once: true })
    window.addEventListener("keydown", handleFirstInteraction, { once: true })

    // Simulate loading time for better UX
    const loadingTimer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction)
      window.removeEventListener("keydown", handleFirstInteraction)
      clearTimeout(loadingTimer)
    }
  }, [])

  // Play a short click sound per key press
  const playKeySound = () => {
    if (!soundEnabled || !audioCtxRef.current) return

    const ctx = audioCtxRef.current
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.frequency.setValueAtTime(800 + Math.random() * 400, now)
    osc.type = "sine"

    const attack = 0.01
    const decay = 0.1

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.12, now + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + attack + decay + 0.01)
  }

  // Corrupt text based on corruption level (for madness mode)
  const corruptText = (originalText: string, level: number): string => {
    if (level === 0) return originalText

    const corruptChars = [
      "█", "▓", "▒", "░", "◆", "◇", "◈", "◉", "◎", "●",
      "○", "◦", "∴", "∵", "∶", "∷", "∸", "∹", "∺", "∻",
    ]
    const glitchChars = [
      "ǝ", "ɹ", "ʇ", "ʎ", "ɐ", "ɯ", "ɔ", "ɟ", "ɓ", "ɗ",
      "ɠ", "ɦ", "ɨ", "ɪ", "ɫ", "ɬ", "ɭ", "ɮ", "ɯ", "ɰ",
    ]

    let corrupted = originalText
    const symbolRate = Math.min(level * 0.02, 0.1) // Rate for random symbols

    // Add random symbols in the background without replacing actual text
    for (let i = 0; i < corrupted.length; i++) {
      if (Math.random() < symbolRate) {
        const symbol = Math.random() < 0.5 
          ? corruptChars[Math.floor(Math.random() * corruptChars.length)]
          : glitchChars[Math.floor(Math.random() * glitchChars.length)]
        corrupted = corrupted.substring(0, i) + symbol + corrupted.substring(i + 1)
      }
    }

    return corrupted
  }

  // Get visual corruption effects for madness mode
  const getCorruptionEffects = (level: number) => {
    if (level === 0) return {}
    
    const effects: React.CSSProperties = {}
    
    // Add glitch effects based on corruption level
    if (level > 2 && level <= 6) {
      effects.animation = `glitch ${0.3 + level * 0.1}s infinite`
    } else if (level > 6) {
      effects.animation = `intense-glitch ${0.2 + level * 0.05}s infinite`
    }
    
    // Add flicker effects
    if (level > 4) {
      effects.animation = `${effects.animation || ''}, flicker ${2 + level * 0.5}s infinite`
    }
    
    // Add color shifts
    if (level > 6) {
      effects.filter = `hue-rotate(${level * 10}deg)`
    }
    
    // Add text shadow for corruption effect
    if (level > 1) {
      effects.textShadow = `0 0 ${level * 2}px rgba(75, 85, 99, ${level * 0.2})`
    }
    
    return effects
  }

  // Generate random symbols for background corruption
  const generateBackgroundSymbols = (level: number) => {
    if (level === 0) return []
    
    const symbols = ["█", "▓", "▒", "░", "◆", "◇", "◈", "◉", "◎", "●", "○", "◦", "∴", "∵", "∶", "∷", "∸", "∹", "∺", "∻", "ǝ", "ɹ", "ʇ", "ʎ", "ɐ", "ɯ", "ɔ", "ɟ", "ɓ", "ɗ", "ɠ", "ɦ", "ɨ", "ɪ", "ɫ", "ɬ", "ɭ", "ɮ", "ɯ", "ɰ"]
    
    // Check if mobile device
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    
    // Progressive symbol count based on corruption level (reduced for mobile)
    let count = 0
    if (isMobile) {
      // Mobile: fewer symbols to avoid performance issues
      if (level <= 3) {
        count = Math.floor(level * 0.8) // 0-2 symbols
      } else if (level <= 6) {
        count = 4 + Math.floor((level - 3) * 1.5) // 4-8 symbols
      } else if (level <= 8) {
        count = 10 + Math.floor((level - 6) * 2) // 10-14 symbols
      } else {
        count = 15 + Math.floor((level - 8) * 3) // 15-21 symbols (max for mobile)
      }
    } else {
      // Desktop: full symbol count
      if (level <= 3) {
        count = Math.floor(level * 1.5) // 1-4 symbols
      } else if (level <= 6) {
        count = 8 + Math.floor((level - 3) * 3) // 8-17 symbols
      } else if (level <= 8) {
        count = 20 + Math.floor((level - 6) * 5) // 20-30 symbols
      } else {
        count = 35 + Math.floor((level - 8) * 8) // 35-51 symbols (max)
      }
    }
    
    const backgroundSymbols = []
    
    for (let i = 0; i < count; i++) {
      backgroundSymbols.push({
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 2 + Math.random() * 3
      })
    }
    
    return backgroundSymbols
  }

  // Keep original text for madness mode, don't corrupt it
  const displayText = text
  const backgroundSymbols = mode === "madness" ? generateBackgroundSymbols(Math.floor(corruptionLevel)) : []

  const handleTextChange = (value: string) => {
    // For irreversible mode, only allow adding text, not deleting
    if (mode === "irreversible") {
      if (value.length >= text.length) {
        setText(value)
        if (value.length > text.length) {
          setCorruptionLevel((prev) => Math.min(prev + 0.05, 10))
        }
      }
      // Don't update if trying to delete
    } else {
      setText(value)
      if (mode === "madness" && value.length > text.length) {
        setCorruptionLevel((prev) => Math.min(prev + 0.05, 10))
      }
    }
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    const isModifier = e.ctrlKey || e.metaKey || e.altKey
    
    // For irreversible mode, block deletion keys
    if (mode === "irreversible") {
      const deletionKeys = ["Backspace", "Delete"]
      if (deletionKeys.includes(e.key)) {
        e.preventDefault()
        return
      }
    }
    
    if (isModifier) return

    const allowed = ["Backspace", "Enter", "Tab", "Spacebar", " "]
    if (allowed.includes(e.key) || e.key.length === 1) {
      playKeySound()
    }
  }

  const saveEntry = async () => {
    if (!user) {
      setSaveStatus("error")
      return
    }

    if (!text.trim()) {
      setSaveStatus("error")
      return
    }

    setIsSaving(true)
    setSaveStatus("saving")

    try {
      // Generate title if not provided
      const entryTitle = title.trim() || `Entry ${new Date().toLocaleDateString()}`

      // Prepare entry data
      const entryData: Omit<DiaryEntry, 'id' | 'timestamp'> = {
        userId: user.uid,
        mode: mode,
        title: entryTitle,
        content: text,
        metadata: {
          wordCount: text.split(/\s+/).filter(word => word.length > 0).length,
          characterCount: text.length,
        }
      }

      // Add mode-specific data
      if (mode === "madness") {
        entryData.corruptionLevel = Math.floor(corruptionLevel)
      }

      if (mode === "shadow") {
        entryData.hiddenLayers = Math.floor(Math.random() * 5) + 1
      }

      if (mode === "timelocked") {
        entryData.timeLocked = true
        entryData.unlockTime = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      }

      // Save to Firestore
      const savedEntry = await saveDiaryEntry(entryData)
      
      // Update local state
      setEntries((prev) => [text, ...prev])
      setText("")
      setTitle("")
      
      if (mode === "madness") {
        setCorruptionLevel((prev) => Math.min(prev + 0.5, 10))
      }
      
      setSaveStatus("success")
      
      // Reset success status after 3 seconds
      setTimeout(() => setSaveStatus("idle"), 3000)
      
    } catch (error) {
      console.error("Error saving entry:", error)
      setSaveStatus("error")
      
      // Reset error status after 5 seconds
      setTimeout(() => setSaveStatus("idle"), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const clearAll = () => {
    setEntries([])
    setText("")
    setTitle("")
    if (mode === "madness") {
      setCorruptionLevel(0)
    }
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 relative overflow-hidden">
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              {mode === "madness" && (
                <div className="absolute inset-0 w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              )}
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Initializing {modeConfig.name}</h2>
              <p className="text-gray-400 text-sm">Preparing your digital canvas...</p>
            </div>
            {mode === "madness" && (
              <div className="flex justify-center space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full-screen glitch overlay for madness mode */}
      {mode === "madness" && corruptionLevel > 3 && (
        <div 
          className="fixed inset-0 pointer-events-none z-10"
          style={{
            animation: `glitch ${0.5 + corruptionLevel * 0.1}s infinite`,
            opacity: Math.min(corruptionLevel * 0.05, 0.2)
          }}
        >
          <div className="absolute inset-0 bg-black mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-purple-900 mix-blend-multiply" style={{ animationDelay: '0.1s' }}></div>
          <div className="absolute inset-0 bg-gray-800 mix-blend-multiply" style={{ animationDelay: '0.2s' }}></div>
        </div>
      )}

      {/* Background corruption symbols */}
      {mode === "madness" && backgroundSymbols.map((symbol, index) => {
        // Check if mobile device
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
        
        // Determine symbol color and intensity based on corruption level
        const colors = [
          'text-purple-400',
          'text-blue-400', 
          'text-cyan-400',
          'text-green-400',
          'text-yellow-400',
          'text-red-400',
          'text-pink-400'
        ]
        const colorClass = colors[index % colors.length]
        const opacity = Math.min(0.3 + (corruptionLevel * 0.1), 0.9)
        const glowIntensity = Math.min(corruptionLevel * 0.3, 2)
        
        // Mobile-friendly sizing
        const baseFontSize = isMobile ? 0.8 : 1
        const fontSize = `${baseFontSize + (corruptionLevel * 0.08)}rem`
        const glowSize = isMobile ? glowIntensity * 3 : glowIntensity * 5
        
        return (
          <div
            key={index}
            className={`fixed pointer-events-none z-5 ${colorClass}`}
            style={{
              left: `${symbol.x}%`,
              top: `${symbol.y}%`,
              animation: `float ${symbol.duration}s ease-in-out infinite`,
              animationDelay: `${symbol.delay}s`,
              fontSize: fontSize,
              filter: 'blur(0.3px)',
              opacity: opacity,
              textShadow: `0 0 ${glowSize}px currentColor, 0 0 ${glowSize * 2}px currentColor`
            }}
          >
            {symbol.symbol}
          </div>
        )
      })}

      {/* Screen flicker effect for high corruption levels */}
      {mode === "madness" && corruptionLevel > 7 && (
        <div 
          className="fixed inset-0 pointer-events-none z-20 bg-black"
          style={{
            animation: `flicker ${0.1 + corruptionLevel * 0.05}s infinite`,
            opacity: 0.05
          }}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 relative z-30">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Link href="/write">
            <Button variant="ghost" size="sm" className="text-sm">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 
              className="text-xl sm:text-2xl font-bold"
              style={mode === "madness" ? getCorruptionEffects(Math.floor(corruptionLevel)) : {}}
            >
              {modeConfig.name}
            </h1>
            <p 
              className="text-sm sm:text-base text-muted-foreground"
              style={mode === "madness" && corruptionLevel > 2 ? getCorruptionEffects(Math.floor(corruptionLevel)) : {}}
            >
              {modeConfig.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={mode === "madness" && corruptionLevel > 4 ? getCorruptionEffects(Math.floor(corruptionLevel)) : {}}
              className="text-xs sm:text-sm"
            >
              {soundEnabled ? "🔊" : "🔇"} Sound
            </Button>
          </div>
        </div>

        {/* Writing Area */}
        <Card 
          className="p-4 sm:p-6"
          style={mode === "madness" && corruptionLevel > 1 ? {
            ...getCorruptionEffects(Math.floor(corruptionLevel)),
            borderColor: `rgba(75, 85, 99, ${corruptionLevel * 0.15})`
          } : {}}
        >
          <div className="space-y-3 sm:space-y-4">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title (optional)
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your entry a title..."
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm sm:text-base"
              />
            </div>

            {/* Text Area */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                Your Entry
              </label>
              <div 
                className={`relative ${mode === "madness" && corruptionLevel > 3 ? "animate-pulse" : ""}`}
                style={{
                  ...(mode === "madness" && corruptionLevel > 5 ? {
                    background: `linear-gradient(45deg, 
                      rgba(255, 0, 255, ${corruptionLevel * 0.02}), 
                      rgba(0, 255, 255, ${corruptionLevel * 0.02})
                    )`,
                    borderRadius: '0.5rem',
                    padding: '2px'
                  } : {})
                }}
              >
                <Textarea
                  ref={textareaRef}
                  id="content"
                  value={displayText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Start writing your thoughts..."
                  className="min-h-[200px] sm:min-h-[300px] resize-none text-sm sm:text-base"
                  style={{
                    fontFamily: mode === "madness" ? "monospace" : "inherit",
                    ...(mode === "madness" ? getCorruptionEffects(Math.floor(corruptionLevel)) : {})
                  }}
                />
              </div>
            </div>

            {/* Mode-specific info */}
            {mode === "madness" && (
              <div className="text-sm text-muted-foreground">
                Corruption Level: {Math.floor(corruptionLevel)}/10
              </div>
            )}
            
            {mode === "irreversible" && (
              <div className="text-sm text-red-600 font-medium">
                ⚠️ Irreversible Mode: Backspace and Delete are disabled. Every keystroke is permanent.
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={saveEntry} 
                disabled={isSaving || !text.trim() || !user}
                className="flex-1 relative"
              >
                {isSaving ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save Entry"
                )}
              </Button>
              {mode !== "irreversible" && (
                <Button variant="outline" onClick={clearAll} disabled={isSaving}>
                  Clear All
                </Button>
              )}
            </div>

            {/* Save Status */}
            {saveStatus === "saving" && (
              <div className="flex items-center space-x-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-400 text-sm">Saving your entry to the digital void...</span>
              </div>
            )}
            
            {saveStatus === "success" && (
              <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg animate-pulse">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-green-400 text-sm font-medium">Entry saved successfully!</span>
              </div>
            )}
            
            {saveStatus === "error" && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-red-400 text-sm font-medium">Error saving entry. Please try again.</span>
              </div>
            )}
            
            {!user && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-yellow-400 text-sm font-medium">Please sign in to save entries.</span>
              </div>
            )}
          </div>
        </Card>

        {/* Previous Entries */}
        {entries.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Entries</h2>
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <div key={index} className="p-3 border rounded">
                  <p className="text-sm text-muted-foreground">
                    {entry.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
} 