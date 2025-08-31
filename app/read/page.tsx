"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Clock, Eye } from "lucide-react"

// Sample diary entries
const sampleEntries = [
  {
    id: 1,
    mode: "madness",
    modeName: "Madness Journal",
    modeIcon: "🌀",
    title: "The First Entry",
    preview: "Today I began this journey into the depths of my consciousness. The words seem to flow naturally, yet there's something unsettling about the way they appear on the screen...",
    fullText: "Today I began this journey into the depths of my consciousness. The words seem to flow naturally, yet there's something unsettling about the way they appear on the screen. Each keystroke feels like a step deeper into an unknown realm. The corruption level is still low, but I can sense it building with every word I type. What will happen when it reaches its peak? Will I still be able to read my own thoughts, or will they become as incomprehensible as the symbols that occasionally flicker across my vision?",
    timestamp: "2024-01-15T10:30:00Z",
    corruptionLevel: 3
  },
  {
    id: 2,
    mode: "timelocked",
    modeName: "Time-Locked Mode",
    modeIcon: "⏰",
    title: "Future Self",
    preview: "This entry is locked until tomorrow. I'm writing this knowing that my future self will read it with fresh eyes...",
    fullText: "This entry is locked until tomorrow. I'm writing this knowing that my future self will read it with fresh eyes. The concept of time-locked entries fascinates me - it's like sending a message to yourself across time. What will I think when I read this tomorrow? Will I remember the emotions I'm feeling right now, or will they seem distant and foreign? The anticipation of reading this later adds a layer of mystery to the writing process.",
    timestamp: "2024-01-14T15:45:00Z",
    unlockTime: "2024-01-15T15:45:00Z"
  },
  {
    id: 3,
    mode: "echo",
    modeName: "Echo Mode",
    modeIcon: "🔊",
    title: "Echoes of Thought",
    preview: "Every word I write echoes back to me with slight variations. It's like having a conversation with myself...",
    fullText: "Every word I write echoes back to me with slight variations. It's like having a conversation with myself, but the echo always adds something new, something unexpected. Sometimes the variations are subtle - a different word choice, a slightly altered phrase. Other times, the echo reveals thoughts I didn't know I had. It's both comforting and disconcerting to see my thoughts reflected back with these gentle distortions.",
    timestamp: "2024-01-13T20:15:00Z"
  },
  {
    id: 4,
    mode: "shadow",
    modeName: "Shadow Journaling Mode",
    modeIcon: "👤",
    title: "Hidden Layers",
    preview: "There are layers to this entry that aren't immediately visible. Some thoughts are hidden in the shadows...",
    fullText: "There are layers to this entry that aren't immediately visible. Some thoughts are hidden in the shadows, waiting to be revealed under the right conditions. I can feel them there, just beneath the surface of the visible text. Sometimes, when I focus just right, I can catch glimpses of these hidden layers. They contain thoughts too raw, too honest, too dangerous to be seen in the light. But they're there, and they're real.",
    timestamp: "2024-01-11T14:30:00Z",
    hiddenLayers: 3
  },
  {
    id: 5,
    mode: "irreversible",
    modeName: "Irreversible Mode",
    modeIcon: "🔒",
    title: "Permanent Thoughts",
    preview: "This entry is permanent. Once written, it cannot be changed or deleted. The weight of that permanence...",
    fullText: "This entry is permanent. Once written, it cannot be changed or deleted. The weight of that permanence makes every word feel significant, every thought precious. I find myself thinking more carefully about what I write, knowing that these words will exist forever in their current form. It's both liberating and terrifying - liberating because I can't second-guess myself, terrifying because there's no going back. These are my thoughts, frozen in time.",
    timestamp: "2024-01-10T11:00:00Z"
  },
  {
    id: 6,
    mode: "alternative",
    modeName: "Alternative Reality Mode",
    modeIcon: "🌌",
    title: "Parallel Thoughts",
    preview: "In another reality, I'm writing a different version of this entry. Here, I'm exploring the concept of parallel existence...",
    fullText: "In another reality, I'm writing a different version of this entry. Here, I'm exploring the concept of parallel existence, wondering what my other selves might be thinking and feeling. Are they writing similar entries, or completely different ones? Do they even exist in the same way I do? The idea that there are infinite versions of myself, each making different choices and having different thoughts, is both comforting and overwhelming. We're all connected, yet separate.",
    timestamp: "2024-01-09T16:45:00Z",
    realityVariant: "Alpha-7"
  }
]

export default function ReadPage() {
  const [selectedEntry, setSelectedEntry] = useState<typeof sampleEntries[0] | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getModeColor = (mode: string) => {
    const colors = {
      madness: "bg-purple-500/20 text-purple-700 border-purple-500/30",
      timelocked: "bg-blue-500/20 text-blue-700 border-blue-500/30",
      echo: "bg-green-500/20 text-green-700 border-green-500/30",
      shadow: "bg-purple-500/20 text-purple-700 border-purple-500/30",
      irreversible: "bg-red-500/20 text-red-700 border-red-500/30",
      alternative: "bg-indigo-500/20 text-indigo-700 border-indigo-500/30"
    }
    return colors[mode as keyof typeof colors] || colors.madness
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex-1 text-center">
            <h1 className="text-4xl font-bold text-foreground">Read Diary</h1>
            <p className="text-muted-foreground">Revisit your past entries and memories</p>
          </div>
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          {sampleEntries.map((entry) => (
            <Card 
              key={entry.id} 
              className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              onClick={() => setSelectedEntry(entry)}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{entry.modeIcon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{entry.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getModeColor(entry.mode)}>
                          {entry.modeName}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDate(entry.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>

                {/* Preview */}
                <p className="text-muted-foreground leading-relaxed">
                  {entry.preview}
                </p>

                {/* Additional Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {entry.corruptionLevel && (
                    <span>Corruption: {entry.corruptionLevel}/10</span>
                  )}
                  {entry.hiddenLayers && (
                    <span>Hidden Layers: {entry.hiddenLayers}</span>
                  )}
                  {entry.realityVariant && (
                    <span>Reality: {entry.realityVariant}</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Entry Detail Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 space-y-4">
                {/* Modal Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedEntry.modeIcon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{selectedEntry.title}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getModeColor(selectedEntry.mode)}>
                          {selectedEntry.modeName}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(selectedEntry.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedEntry(null)}
                  >
                    ✕
                  </Button>
                </div>

                {/* Full Text */}
                <div className="space-y-4">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedEntry.fullText}
                  </p>

                  {/* Additional Details */}
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold text-foreground mb-2">Entry Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Mode:</span>
                        <span className="ml-2 text-foreground">{selectedEntry.modeName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <span className="ml-2 text-foreground">{formatDate(selectedEntry.timestamp)}</span>
                      </div>
                      {selectedEntry.corruptionLevel && (
                        <div>
                          <span className="text-muted-foreground">Corruption Level:</span>
                          <span className="ml-2 text-foreground">{selectedEntry.corruptionLevel}/10</span>
                        </div>
                      )}
                      {selectedEntry.hiddenLayers && (
                        <div>
                          <span className="text-muted-foreground">Hidden Layers:</span>
                          <span className="ml-2 text-foreground">{selectedEntry.hiddenLayers}</span>
                        </div>
                      )}
                      {selectedEntry.realityVariant && (
                        <div>
                          <span className="text-muted-foreground">Reality Variant:</span>
                          <span className="ml-2 text-foreground">{selectedEntry.realityVariant}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 