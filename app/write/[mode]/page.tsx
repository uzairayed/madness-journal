"use client"

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/firebase-auth-provider"
import { saveDiaryEntry, DiaryEntry, getUserProfile, checkAndUnlockAchievements, getUserDiaryEntries } from '@/lib/firebase'
import { countWords } from '@/lib/utils'

// Lazy load heavy components
const IrreversibleModeInput = lazy(() => import("@/components/irreversible-mode-input"))
const MadnessJournalInput = lazy(() => import("@/components/madness-journal-input"))
const TimeCapsuleModeInput = lazy(() => import("@/components/time-capsule-mode-input"))
const ShadowJournalingInput = lazy(() => import("@/components/shadow-journaling-input"))

// Memoize mode configs to prevent recreating on every render
const modeConfigs = {
  madness: {
    name: "Madness Journal", 
    theme: "from-purple-900 to-indigo-900",
    description: "A daily log that slowly distorts text, introducing symbols and corrupted words over time."
  },
  timelocked: {
    name: "Time Capsule Mode",
    theme: "from-blue-900 to-cyan-900", 
    description: "Seal your thoughts until a future date when they'll automatically unlock"
  },
  shadow: {
    name: "Shadow Journaling Mode",
    theme: "from-gray-900 to-slate-900",
    description: "Provides prompts that dig into hidden thoughts and suppressed feelings."
  },
  irreversible: {
    name: "Irreversible Mode",
    theme: "from-red-900 to-orange-900",
    description: "Once written, entries cannot be edited or deleted"
  },
  alternative: {
    name: "Alternative Reality Mode", 
    theme: "from-emerald-900 to-teal-900",
    description: "Parallel versions in different realities"
  }
} as const

const LoadingSpinner = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="text-purple-300 text-lg">Initializing mode...</p>
    </div>
  </div>
)

export default function WritePage() {
  const params = useParams()
  const router = useRouter()
  const mode = params.mode as string
  const modeConfig = modeConfigs[mode as keyof typeof modeConfigs] || modeConfigs.madness
  const { user } = useAuth()

  const [text, setText] = useState("")
  const [title, setTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [corruptionLevel, setCorruptionLevel] = useState(0)
  const [isPublic, setIsPublic] = useState(false)

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(loadingTimer)
  }, [])

  // Madness mode corruption effect - memoized
  const corruptionValue = useMemo(() => {
    if (mode === "madness" && text.length > 0) {
      return Math.min(10, Math.floor(text.length / 50))
    }
    return 0
  }, [mode, text.length])

  useEffect(() => {
    setCorruptionLevel(corruptionValue)
  }, [corruptionValue])

  // Apply madness corruption to text - memoized function
  const applyMadnessCorruption = useCallback((originalText: string) => {
    if (mode !== "madness" || corruptionLevel === 0) return originalText
    
    const corruptionChars = ['ₐ', 'ₑ', 'ᵢ', 'ₒ', 'ᵤ', '₁', '₂', '₃', '꙳', '҉', '̸', '̷', '̶']
    const glitchChars = ['█', '▓', '▒', '░', '◆', '◇', '◈', '◉']
    
    let corruptedText = originalText
    const corruptionRate = corruptionLevel * 0.02 // 2% per level
    
    for (let i = 0; i < corruptedText.length; i++) {
      if (Math.random() < corruptionRate) {
        if (Math.random() < 0.7) {
          // Add corruption characters
          corruptedText = corruptedText.slice(0, i) + 
            corruptionChars[Math.floor(Math.random() * corruptionChars.length)] + 
            corruptedText.slice(i)
        } else {
          // Replace with glitch characters
          corruptedText = corruptedText.slice(0, i) + 
            glitchChars[Math.floor(Math.random() * glitchChars.length)] + 
            corruptedText.slice(i + 1)
        }
      }
    }
    
    return corruptedText
  }, [mode, corruptionLevel])

  // Save functionality - memoized
  const handleSave = useCallback(async () => {
    if (!text.trim() || !user) return
    
    setIsSaving(true)
    try {
      const entry: DiaryEntry = {
        id: '',
        userId: user.uid,
        title: title.trim() || 'Untitled Entry',
        content: text,
        mode: mode,
        timestamp: new Date(),
        isPublic: isPublic,
        metadata: {
          wordCount: countWords(text),
          characterCount: text.length
        },
        ...(mode === "madness" && { corruptionLevel })
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
      
      // Reset form
      setText("")
      setTitle("")
      setCorruptionLevel(0)
      setIsPublic(false)
      
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
  }, [text, title, isPublic, user, mode, corruptionLevel])

  // Render specialized components with Suspense
  if (mode === "irreversible" && !isLoading) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <IrreversibleModeInput />
      </Suspense>
    )
  }

  if (mode === "madness" && !isLoading) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <MadnessJournalInput />
      </Suspense>
    )
  }

  if (mode === "timelocked" && !isLoading) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <TimeCapsuleModeInput />
      </Suspense>
    )
  }

  if (mode === "shadow" && !isLoading) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <ShadowJournalingInput />
      </Suspense>
    )
  }

  // Loading Screen
  if (isLoading) {
    return (
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
    )
  }

  // Regular UI for other modes
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Link href="/write">
            <Button variant="ghost" size="sm" className="text-sm">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold">
              {modeConfig.name}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {modeConfig.description}
            </p>
          </div>
        </div>

        {/* Writing Area */}
        <Card className="p-4 sm:p-6">
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
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="content" className="block text-sm font-medium">
                  Your Entry
                </label>
                {mode === "madness" && corruptionLevel > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-purple-600 dark:text-purple-400">
                      Corruption Level: {corruptionLevel}/10
                    </span>
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-red-500 transition-all duration-300"
                        style={{ width: `${(corruptionLevel / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <Textarea
                  id="content"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Start writing your thoughts..."
                  className={`min-h-[200px] sm:min-h-[300px] resize-none text-sm sm:text-base ${
                    mode === "madness" && corruptionLevel > 0 
                      ? 'font-mono' 
                      : ''
                  }`}
                  style={{
                    ...(mode === "madness" && corruptionLevel > 3 && {
                      textShadow: `0 0 ${corruptionLevel}px rgba(147, 51, 234, 0.5)`,
                      filter: `hue-rotate(${corruptionLevel * 10}deg)`
                    })
                  }}
                />
                
                {/* Madness overlay text for preview */}
                {mode === "madness" && corruptionLevel > 0 && (
                  <div 
                    className="absolute inset-0 p-3 pointer-events-none font-mono text-sm sm:text-base opacity-50 text-purple-600 dark:text-purple-400 overflow-hidden"
                    style={{
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {applyMadnessCorruption(text)}
                  </div>
                )}
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
                    <span className="text-green-600 dark:text-green-400">📢 Public Entry</span>
                  ) : (
                    <span className="text-gray-600 dark:text-gray-400">🔒 Private Entry</span>
                  )}
                </Label>
              </div>
              
              <Button 
                onClick={handleSave}
                disabled={!text.trim() || isSaving}
                className="bg-primary hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Entry'
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}