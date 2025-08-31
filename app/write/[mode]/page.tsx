"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useParams } from "next/navigation"
import { useAuth } from "@/components/firebase-auth-provider"
import { saveDiaryEntry, DiaryEntry } from "@/lib/firebase"

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

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction)
      window.removeEventListener("keydown", handleFirstInteraction)
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
    const corruptionRate = level * 0.05

    for (let i = 0; i < corrupted.length; i++) {
      if (Math.random() < corruptionRate) {
        if (Math.random() < 0.5) {
          corrupted =
            corrupted.substring(0, i) +
            corruptChars[Math.floor(Math.random() * corruptChars.length)] +
            corrupted.substring(i + 1)
        } else {
          corrupted =
            corrupted.substring(0, i) +
            glitchChars[Math.floor(Math.random() * glitchChars.length)] +
            corrupted.substring(i + 1)
        }
      }
    }

    return corrupted
  }

  const handleTextChange = (value: string) => {
    // For irreversible mode, only allow adding text, not deleting
    if (mode === "irreversible") {
      if (value.length >= text.length) {
        setText(value)
        if (value.length > text.length) {
          setCorruptionLevel((prev) => Math.min(prev + 0.1, 10))
        }
      }
      // Don't update if trying to delete
    } else {
      setText(value)
      if (mode === "madness" && value.length > text.length) {
        setCorruptionLevel((prev) => Math.min(prev + 0.1, 10))
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
        setCorruptionLevel((prev) => Math.min(prev + 1, 10))
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

  // Calculate display text for madness mode
  const displayText = mode === "madness" ? corruptText(text, Math.floor(corruptionLevel)) : text

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/write">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Modes
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{modeConfig.name}</h1>
            <p className="text-muted-foreground">{modeConfig.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? "🔊" : "🔇"} Sound
            </Button>
          </div>
        </div>

        {/* Writing Area */}
        <Card className="p-6">
          <div className="space-y-4">
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
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              />
            </div>

            {/* Text Area */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                Your Entry
              </label>
              <Textarea
                ref={textareaRef}
                id="content"
                value={displayText} // Use displayText instead of text for madness mode
                onChange={(e) => handleTextChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Start writing your thoughts..."
                className="min-h-[300px] resize-none"
                style={{
                  fontFamily: mode === "madness" ? "monospace" : "inherit",
                }}
              />
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
                className="flex-1"
              >
                {isSaving ? "Saving..." : "Save Entry"}
              </Button>
              <Button variant="outline" onClick={clearAll}>
                Clear All
              </Button>
            </div>

            {/* Save Status */}
            {saveStatus === "success" && (
              <div className="text-green-600 text-sm">✅ Entry saved successfully!</div>
            )}
            {saveStatus === "error" && (
              <div className="text-red-600 text-sm">❌ Error saving entry. Please try again.</div>
            )}
            {!user && (
              <div className="text-yellow-600 text-sm">⚠️ Please sign in to save entries.</div>
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