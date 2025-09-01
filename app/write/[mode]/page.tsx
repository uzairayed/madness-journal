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
  const [isPublic, setIsPublic] = useState(false)
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

  // Get visual corruption effects for madness mode
  const getCorruptionEffects = (level: number) => {
    if (level === 0) return {}
    
    const effects: React.CSSProperties = {}
    
    // Add glitch effects based on corruption level
    if (level > 2 && level <= 6) {
      effects.animation = `glitch ${0.5 + level * 0.12}s infinite`
    } else if (level > 6) {
      effects.animation = `intense-glitch ${0.35 + level * 0.08}s infinite`
    }
    
    // Add flicker effects
    if (level > 4) {
      effects.animation = `${effects.animation || ''}, flicker ${2.2 + level * 0.55}s infinite`
    }
    
    // Add text shadow for corruption effect
    if (level > 1) {
      effects.textShadow = `0 0 ${level * 2}px rgba(75, 85, 99, ${level * 0.2})`
    }
    
    return effects
  }

  // Get button-specific corruption effects (no color changes, slower animations)
  const getButtonCorruptionEffects = (level: number) => {
    if (level === 0) return {}
    
    const effects: React.CSSProperties = {}
    
    // Only add very subtle glitch effects for buttons
    if (level > 6) {
      effects.animation = `glitch ${1.5 + level * 0.2}s infinite`
    }
    
    // Add subtle text shadow only
    if (level > 4) {
      effects.textShadow = `0 0 ${level * 1}px rgba(75, 85, 99, ${level * 0.1})`
    }
    
    return effects
  }

  // Generate random symbols for background corruption
  const generateBackgroundSymbols = (level: number) => {
    if (level === 0) return []
    
    const symbols = ["█", "▓", "▒", "░", "◆", "◇", "◈", "◉", "◎", "●", "○", "◦", "∴", "∵", "∶", "∷", "∸", "∹", "∺", "∻", "ǝ", "ɹ", "ʇ", "ʎ", "ɐ", "ɯ", "ɔ", "ɟ", "ɓ", "ɗ", "ɠ", "ɦ", "ɨ", "ɪ", "ɫ", "ɬ", "ɭ", "ɮ", "ɯ", "ɰ"]
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    
    // Progressive symbol count based on corruption level
    const baseCount = Math.floor(level * 1.5)
    const count = isMobile ? Math.min(baseCount, 21) : Math.min(baseCount, 51)
    
    return Array.from({ length: count }, () => ({
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3
    }))
  }

  // Keep original text for madness mode, don't corrupt it
  const displayText = text
  const backgroundSymbols = mode === "madness" ? generateBackgroundSymbols(Math.floor(corruptionLevel)) : []

  const handleTextChange = (value: string) => {
    // For irreversible mode, only allow adding text, not deleting
    if (mode === "irreversible" && value.length < text.length) {
      return // Don't update if trying to delete
    }
    
    setText(value)
    
    if (mode === "madness") {
      const wordCount = value.split(/\s+/).filter(word => word.length > 0).length
      const targetCorruption = Math.min((wordCount / 500) * 10, 10) // 500 words = level 10
      setCorruptionLevel(targetCorruption)
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
        isPublic: isPublic,
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
      
      // Update user profile with new entry counts
      try {
        const { createUserProfile } = await import('@/lib/firebase')
        const currentProfile = await import('@/lib/firebase').then(m => m.getUserProfile(user.uid))
        
        if (currentProfile) {
          const updatedProfile = await createUserProfile({
            userId: user.uid,
            displayName: currentProfile.displayName || 'Anonymous Writer',
            bio: currentProfile.bio || 'Exploring the depths of digital consciousness',
            avatarUrl: currentProfile.avatarUrl || undefined,
            totalEntries: currentProfile.totalEntries + 1,
            publicEntries: currentProfile.publicEntries + (isPublic ? 1 : 0),
            favoriteMode: currentProfile.favoriteMode || undefined
          })
        }
      } catch (profileError) {
        console.warn('Failed to update profile counts:', profileError)
        // Don't fail the save operation if profile update fails
      }
      
      // Update local state
      setEntries((prev) => [text, ...prev])
      setText("")
      setTitle("")
      
      if (mode === "madness") {
        // Corruption level is now calculated based on word count, no need to increment on save
        // setCorruptionLevel((prev) => Math.min(prev + 0.1, 10))
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

  // Get mode-specific styling
  const getModeStyling = (mode: string, corruptionLevel: number) => {
    const baseStyles = {
      timelocked: {
        borderColor: 'rgba(59, 130, 246, 0.3)',
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)'
      },
      echo: {
        borderColor: 'rgba(34, 197, 94, 0.3)',
        boxShadow: '0 0 20px rgba(34, 197, 94, 0.1)'
      },
      shadow: {
        borderColor: 'rgba(139, 92, 246, 0.3)',
        boxShadow: '0 0 20px rgba(139, 92, 246, 0.1)'
      },
      irreversible: {
        borderColor: 'rgba(239, 68, 68, 0.3)',
        boxShadow: '0 0 20px rgba(239, 68, 68, 0.1)'
      },
      alternative: {
        borderColor: 'rgba(99, 102, 241, 0.3)',
        boxShadow: '0 0 20px rgba(99, 102, 241, 0.1)'
      }
    }

    if (mode === "madness" && corruptionLevel > 1) {
      return {
        borderColor: `rgba(75, 85, 99, ${corruptionLevel * 0.15})`,
        textShadow: `0 0 ${corruptionLevel * 2}px rgba(75, 85, 99, ${corruptionLevel * 0.2})`
      }
    }

    return baseStyles[mode as keyof typeof baseStyles] || {}
  }

  // Get mode-specific button styling
  const getModeButtonStyling = (mode: string) => {
    const buttonStyles = {
      timelocked: "bg-blue-600 hover:bg-blue-700",
      echo: "bg-green-600 hover:bg-green-700",
      shadow: "bg-purple-600 hover:bg-purple-700",
      irreversible: "bg-red-600 hover:bg-red-700",
      alternative: "bg-indigo-600 hover:bg-indigo-700"
    }

    return buttonStyles[mode as keyof typeof buttonStyles] || "bg-primary hover:bg-primary/90"
  }

  // Get mode-specific outline button styling
  const getModeOutlineButtonStyling = (mode: string) => {
    const outlineStyles = {
      timelocked: "border-blue-500/30 text-blue-400 hover:bg-blue-500/10",
      echo: "border-green-500/30 text-green-400 hover:bg-green-500/10",
      shadow: "border-purple-500/30 text-purple-400 hover:bg-purple-500/10",
      alternative: "border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
    }

    return outlineStyles[mode as keyof typeof outlineStyles] || ""
  }

  // Get textarea wrapper styling
  const getTextareaWrapperStyling = (mode: string) => {
    const wrapperStyles = {
      timelocked: {
        background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.02), rgba(147, 197, 253, 0.02))',
        borderRadius: '0.5rem',
        padding: '2px'
      },
      echo: {
        background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.02), rgba(134, 239, 172, 0.02))',
        borderRadius: '0.5rem',
        padding: '2px'
      },
      shadow: {
        background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.02), rgba(196, 181, 253, 0.02))',
        borderRadius: '0.5rem',
        padding: '2px'
      },
      irreversible: {
        background: 'linear-gradient(45deg, rgba(239, 68, 68, 0.02), rgba(252, 165, 165, 0.02))',
        borderRadius: '0.5rem',
        padding: '2px'
      },
      alternative: {
        background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.02), rgba(165, 180, 252, 0.02))',
        borderRadius: '0.5rem',
        padding: '2px'
      }
    }

    return wrapperStyles[mode as keyof typeof wrapperStyles] || {}
  }

  // Get mode info panel
  const getModeInfoPanel = (mode: string) => {
    const panels = {
      timelocked: {
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        textColor: "text-blue-400",
        iconBg: "bg-blue-500",
        icon: "⏰",
        title: "Time-Locked Mode Active",
        description: "Your entry will be locked for 24 hours after saving"
      },
      echo: {
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/20",
        textColor: "text-green-400",
        iconBg: "bg-green-500",
        icon: "🔊",
        title: "Echo Mode Active",
        description: "Your words will echo back with variations"
      },
      shadow: {
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/20",
        textColor: "text-purple-400",
        iconBg: "bg-purple-500",
        icon: "👤",
        title: "Shadow Journaling Active",
        description: "Hidden layers will be revealed in your entry"
      },
      irreversible: {
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20",
        textColor: "text-red-400",
        iconBg: "bg-red-500",
        icon: "🔒",
        title: "Irreversible Mode Active",
        description: "⚠️ Backspace and Delete are disabled. Every keystroke is permanent."
      },
      alternative: {
        bgColor: "bg-indigo-500/10",
        borderColor: "border-indigo-500/20",
        textColor: "text-indigo-400",
        iconBg: "bg-indigo-500",
        icon: "🌌",
        title: "Alternative Reality Mode Active",
        description: "Your entries will be rewritten into surreal, alternate versions"
      }
    }

    const panel = panels[mode as keyof typeof panels]
    if (!panel) return null

    return (
      <div className={`p-3 ${panel.bgColor} border ${panel.borderColor} rounded-lg`}>
        <div className={`flex items-center space-x-2 ${panel.textColor}`}>
          <div className={`w-4 h-4 ${panel.iconBg} rounded-full flex items-center justify-center`}>
            <span className="text-xs text-white">{panel.icon}</span>
          </div>
          <span className="text-sm font-medium">{panel.title}</span>
        </div>
        <p className={`text-xs ${panel.textColor.replace('400', '300')} mt-1`}>{panel.description}</p>
      </div>
    )
  }

  // Get save status message
  const getSaveStatusMessage = (status: string) => {
    const statusMessages = {
      saving: {
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        textColor: "text-blue-400",
        icon: (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        ),
        message: "Saving your entry to the digital void..."
      },
      success: {
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/20",
        textColor: "text-green-400",
        icon: (
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        ),
        message: "Entry saved successfully!",
        animation: "animate-pulse"
      },
      error: {
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20",
        textColor: "text-red-400",
        icon: (
          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        ),
        message: "Error saving entry. Please try again."
      }
    }

    const config = statusMessages[status as keyof typeof statusMessages]
    if (!config) return null

    return (
      <div className={`flex items-center space-x-2 p-3 ${config.bgColor} border ${config.borderColor} rounded-lg ${(config as any).animation || ''}`}>
        {config.icon}
        <span className={`${config.textColor} text-sm font-medium`}>{config.message}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 relative overflow-hidden">
      {/* Mode-specific background effects */}
      {mode === "timelocked" && (
        <div className="fixed inset-0 pointer-events-none z-5">
          <div className="absolute top-20 left-20 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-40 right-32 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse opacity-30" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute top-60 left-1/4 w-1 h-1 bg-blue-500 rounded-full animate-pulse opacity-25" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
        </div>
      )}
      
      {mode === "echo" && (
        <div className="fixed inset-0 pointer-events-none z-5">
          <div className="absolute top-20 left-20 w-1 h-1 bg-green-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-40 right-32 w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse opacity-30" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute top-60 left-1/4 w-1 h-1 bg-green-500 rounded-full animate-pulse opacity-25" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
        </div>
      )}
      
      {mode === "shadow" && (
        <div className="fixed inset-0 pointer-events-none z-5">
          <div className="absolute top-20 left-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-40 right-32 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse opacity-30" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute top-60 left-1/4 w-1 h-1 bg-purple-500 rounded-full animate-pulse opacity-25" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
        </div>
      )}
      
      {mode === "alternative" && (
        <div className="fixed inset-0 pointer-events-none z-5">
          <div className="absolute top-20 left-20 w-1 h-1 bg-indigo-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-40 right-32 w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse opacity-30" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute top-60 left-1/4 w-1 h-1 bg-indigo-500 rounded-full animate-pulse opacity-25" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
        </div>
      )}

      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Initializing {modeConfig.name}</h2>
              <p className="text-gray-400 text-sm">Preparing your digital canvas...</p>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen glitch overlay for madness mode */}
      {mode === "madness" && corruptionLevel > 3 && (
        <div 
          className="fixed inset-0 pointer-events-none z-10"
          style={{
            animation: `glitch ${0.7 + corruptionLevel * 0.12}s infinite`,
            opacity: Math.min(corruptionLevel * 0.04, 0.16)
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
        
        // Progressive sizing with occasional large symbols at higher levels
        const level = Math.floor(corruptionLevel)
        const baseFontSize = isMobile ? 0.7 : 0.95
        const growth = (isMobile ? 0.10 : 0.18) * level
        let sizeRem = baseFontSize + growth
        const largeChance = Math.min(0.05 + level * 0.03, 0.35)
        const pseudoRandom = symbol.delay % 1
        if (pseudoRandom < largeChance) {
          sizeRem *= isMobile ? 1.6 : 2.4
        }
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
              fontSize: `${sizeRem}rem`,
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
              style={mode === "madness" ? {
                textShadow: corruptionLevel > 1 ? `0 0 ${corruptionLevel * 2}px rgba(75, 85, 99, ${corruptionLevel * 0.2})` : undefined
              } : {}}
            >
              {modeConfig.name}
            </h1>
            <p 
              className="text-sm sm:text-base text-muted-foreground"
              style={mode === "madness" && corruptionLevel > 2 ? {
                textShadow: `0 0 ${corruptionLevel * 2}px rgba(75, 85, 99, ${corruptionLevel * 0.2})`
              } : {}}
            >
              {modeConfig.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={mode === "madness" && corruptionLevel > 4 ? getButtonCorruptionEffects(Math.floor(corruptionLevel)) : {}}
              className="text-xs sm:text-sm"
            >
              {soundEnabled ? "🔊" : "🔇"} Sound
            </Button>
          </div>
        </div>

        {/* Writing Area */}
        <Card 
          className="p-4 sm:p-6"
          style={getModeStyling(mode, corruptionLevel)}
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
                style={getTextareaWrapperStyling(mode)}
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
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Corruption Level:</span>
                  <span className="font-medium text-purple-400">{corruptionLevel.toFixed(1)}/10</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(corruptionLevel / 10) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {corruptionLevel < 2 && "Pure thoughts flow freely..."}
                  {corruptionLevel >= 2 && corruptionLevel < 4 && "Subtle distortions begin..."}
                  {corruptionLevel >= 4 && corruptionLevel < 6 && "Reality starts to bend..."}
                  {corruptionLevel >= 6 && corruptionLevel < 8 && "The void calls..."}
                  {corruptionLevel >= 8 && corruptionLevel < 10 && "Madness consumes all..."}
                  {corruptionLevel >= 10 && "Complete corruption achieved..."}
                </div>
              </div>
            )}
            
            {getModeInfoPanel(mode)}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={saveEntry} 
                disabled={isSaving || !text.trim() || !user}
                className={getModeButtonStyling(mode)}
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
              
              {/* Privacy Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPublic(!isPublic)}
                className={`flex items-center gap-2 ${
                  isPublic 
                    ? "border-green-500/30 text-green-400 hover:bg-green-500/10" 
                    : "border-gray-500/30 text-gray-400 hover:bg-gray-500/10"
                }`}
              >
                {isPublic ? "🔒" : "🔓"} Public
              </Button>
              
              {/* Clear All */}
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Clear All
              </Button>
            </div>
          </div>
        </Card>

        {/* Save Status Message */}
        {getSaveStatusMessage(saveStatus)}

        {/* Recent Entries */}
        {entries.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-3">Recent Entries</h2>
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <Card key={index} className="p-4">
                  <h3 className="text-xl font-bold mb-1">{entries[index]}</h3>
                  <p className="text-sm text-muted-foreground">{entry}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}