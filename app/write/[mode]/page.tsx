"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useParams } from "next/navigation"

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

  const [text, setText] = useState("")
  const [corruptionLevel, setCorruptionLevel] = useState(0)
  const [entries, setEntries] = useState<string[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
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
    if (!soundEnabled) return
    const ctx = audioCtxRef.current
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    const baseFreq = 260
    const freq = baseFreq + Math.random() * 140
    osc.type = "square"
    osc.frequency.setValueAtTime(freq, now)

    const attack = 0.002
    const decay = 0.05
    gain.gain.cancelScheduledValues(now)
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
    setText(value)
    if (mode === "madness" && value.length > text.length) {
      setCorruptionLevel((prev) => Math.min(prev + 0.1, 10))
    }
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    const isModifier = e.ctrlKey || e.metaKey || e.altKey
    if (isModifier) return

    const allowed = ["Backspace", "Enter", "Tab", "Spacebar", " "]
    if (allowed.includes(e.key) || e.key.length === 1) {
      playKeySound()
    }
  }

  const saveEntry = () => {
    if (text.trim()) {
      // For now, just log to console
      console.log("Entry saved:", {
        mode: mode,
        text: text,
        timestamp: new Date().toISOString(),
        corruptionLevel: mode === "madness" ? corruptionLevel : null
      })

      // In a real app, this would save to backend
      setEntries((prev) => [text, ...prev])
      setText("")
      if (mode === "madness") {
        setCorruptionLevel((prev) => Math.min(prev + 1, 10))
      }
    }
  }

  const clearAll = () => {
    setEntries([])
    setText("")
    if (mode === "madness") {
      setCorruptionLevel(0)
    }
  }

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
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-3xl">{modeConfig.icon}</span>
              <h1 className="text-3xl font-bold text-foreground">{modeConfig.name}</h1>
            </div>
            <p className="text-muted-foreground">{modeConfig.description}</p>
            {mode === "madness" && (
              <p className="text-sm text-muted-foreground mt-1">
                Corruption Level: {Math.floor(corruptionLevel)}/10
              </p>
            )}
          </div>
        </div>

        {/* Writing Area */}
        <Card className={`p-6 ${mode === "madness" && corruptionLevel > 5 ? "border-accent" : "border-border"}`}>
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Begin writing in ${modeConfig.name.toLowerCase()}...`}
                className={`min-h-[300px] resize-none bg-input text-foreground ${
                  mode === "madness" && corruptionLevel > 4 ? "font-mono" : ""
                }`}
                style={{
                  filter:
                    mode === "madness" && corruptionLevel > 7
                      ? `hue-rotate(${corruptionLevel * 10}deg) saturate(${1 + corruptionLevel * 0.1})`
                      : "none",
                }}
              />
              {/* Overlay corrupted text for madness mode */}
              {mode === "madness" && corruptionLevel > 2 && (
                <div
                  className="absolute inset-0 p-3 pointer-events-none text-foreground/30 whitespace-pre-wrap font-mono"
                  style={{
                    fontSize: textareaRef.current?.style.fontSize || "14px",
                    lineHeight: textareaRef.current?.style.lineHeight || "1.5",
                  }}
                >
                  {displayText}
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={saveEntry}
                className={mode === "madness" && corruptionLevel > 6 ? "glitch" : ""}
                variant={mode === "madness" && corruptionLevel > 8 ? "destructive" : "default"}
              >
                Save Entry
              </Button>
              <Button onClick={clearAll} variant="outline">
                Clear All
              </Button>
              <Button
                onClick={() => setSoundEnabled(!soundEnabled)}
                variant="outline"
              >
                {soundEnabled ? "🔊 Sound On" : "🔇 Sound Off"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Previous Entries */}
        {entries.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Recent Entries</h2>
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <Card key={index} className="p-4">
                  <p className="text-card-foreground whitespace-pre-wrap">
                    {mode === "madness" 
                      ? corruptText(entry, Math.floor(corruptionLevel * (0.3 + index * 0.1)))
                      : entry
                    }
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Madness Indicator for madness mode */}
        {mode === "madness" && corruptionLevel > 8 && (
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-accent/5 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl text-accent/20 corrupt">
              ◆◇◈◉◎●○◦
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 