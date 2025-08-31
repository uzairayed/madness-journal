"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Clock, Eye, Sparkles, Loader2 } from "lucide-react"
import { useAuth } from "@/components/firebase-auth-provider"
import { getUserDiaryEntries, DiaryEntry } from "@/lib/firebase"

export default function ReadPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)
  const [showAlternatives, setShowAlternatives] = useState(false)

  // Fetch user's diary entries
  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const userEntries = await getUserDiaryEntries(user.uid)
        setEntries(userEntries)
      } catch (err) {
        console.error('Error fetching entries:', err)
        setError('Failed to load diary entries')
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [user])

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date'
    
    // Handle Firestore timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getModeConfig = (mode: string) => {
    const configs = {
      madness: {
        name: "Madness Journal",
        icon: "🌀",
        color: "bg-purple-500/20 text-purple-700 border-purple-500/30"
      },
      timelocked: {
        name: "Time-Locked Mode",
        icon: "⏰",
        color: "bg-blue-500/20 text-blue-700 border-blue-500/30"
      },
      echo: {
        name: "Echo Mode",
        icon: "🔊",
        color: "bg-green-500/20 text-green-700 border-green-500/30"
      },
      shadow: {
        name: "Shadow Journaling Mode",
        icon: "👤",
        color: "bg-purple-500/20 text-purple-700 border-purple-500/30"
      },
      irreversible: {
        name: "Irreversible Mode",
        icon: "🔒",
        color: "bg-red-500/20 text-red-700 border-red-500/30"
      },
      alternative: {
        name: "Alternative Reality Mode",
        icon: "🌌",
        color: "bg-indigo-500/20 text-indigo-700 border-indigo-500/30"
      }
    }
    return configs[mode as keyof typeof configs] || configs.madness
  }

  const getPreview = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              Please sign in to view your diary entries.
            </p>
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Read Diary</h1>
              <p className="text-muted-foreground">Loading your entries...</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your thoughts...</p>
            </div>
          </div>
        </div>
      </div>
    )
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Read Diary</h1>
            <p className="text-muted-foreground">
              {entries.length > 0 
                ? `You have ${entries.length} entries in your journal`
                : "No entries yet. Start writing to see them here."
              }
            </p>
          </div>
        </div>

        {/* Alternative Reality Toggle */}
        <div className="flex justify-center">
          <Card className="p-4 border-2 border-indigo-500/30">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <span className="font-semibold text-foreground">Alternative Reality Mode</span>
              </div>
              <Button
                variant={showAlternatives ? "default" : "outline"}
                onClick={() => setShowAlternatives(!showAlternatives)}
                className="bg-indigo-500 hover:bg-indigo-600"
              >
                {showAlternatives ? "Show Original" : "Show Alternatives"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {showAlternatives
                ? "Reading alternate versions of your entries from parallel realities"
                : "Switch to explore how your entries might exist in other realities"
              }
            </p>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="p-4 border-red-500/30 bg-red-500/10">
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        {/* Entries List */}
        {entries.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-4xl">📝</div>
              <h2 className="text-xl font-semibold">No Entries Yet</h2>
              <p className="text-muted-foreground">
                Start writing your first diary entry to see it here.
              </p>
              <Link href="/write">
                <Button>Start Writing</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => {
              const modeConfig = getModeConfig(entry.mode)
              return (
                <Card
                  key={entry.id}
                  className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{modeConfig.icon}</span>
                        <Badge className={modeConfig.color}>
                          {modeConfig.name}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {formatDate(entry.timestamp)}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-foreground">
                      {entry.title}
                    </h3>

                    {/* Preview */}
                    <p className="text-muted-foreground leading-relaxed">
                      {getPreview(entry.content)}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {entry.metadata && (
                        <>
                          <span>{entry.metadata.wordCount} words</span>
                          <span>{entry.metadata.characterCount} characters</span>
                        </>
                      )}
                      {entry.corruptionLevel && (
                        <span>Corruption: {entry.corruptionLevel}/10</span>
                      )}
                      {entry.hiddenLayers && (
                        <span>Hidden Layers: {entry.hiddenLayers}</span>
                      )}
                      {entry.timeLocked && (
                        <span className="text-blue-500">⏰ Time Locked</span>
                      )}
                      {entry.isAlternative && entry.realityVariant && (
                        <span className="text-indigo-500 font-medium">
                          Reality: {entry.realityVariant}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Entry Detail Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 space-y-4">
                {/* Modal Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getModeConfig(selectedEntry.mode).icon}</span>
                    <Badge className={getModeConfig(selectedEntry.mode).color}>
                      {getModeConfig(selectedEntry.mode).name}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEntry(null)}
                  >
                    ✕
                  </Button>
                </div>

                {/* Entry Title */}
                <h2 className="text-2xl font-bold text-foreground">
                  {selectedEntry.title}
                </h2>

                {/* Entry Content */}
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {selectedEntry.content}
                  </p>
                </div>

                {/* Entry Metadata */}
                <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Created:</span>
                    <span className="ml-2">{formatDate(selectedEntry.timestamp)}</span>
                  </div>
                  
                  {selectedEntry.metadata && (
                    <>
                      <div>
                        <span className="font-medium">Word Count:</span>
                        <span className="ml-2">{selectedEntry.metadata.wordCount}</span>
                      </div>
                      <div>
                        <span className="font-medium">Character Count:</span>
                        <span className="ml-2">{selectedEntry.metadata.characterCount}</span>
                      </div>
                    </>
                  )}

                  {selectedEntry.corruptionLevel && (
                    <div>
                      <span className="font-medium">Corruption Level:</span>
                      <span className="ml-2">{selectedEntry.corruptionLevel}/10</span>
                    </div>
                  )}

                  {selectedEntry.hiddenLayers && (
                    <div>
                      <span className="font-medium">Hidden Layers:</span>
                      <span className="ml-2">{selectedEntry.hiddenLayers}</span>
                    </div>
                  )}

                  {selectedEntry.timeLocked && (
                    <div>
                      <span className="font-medium">Status:</span>
                      <span className="ml-2 text-blue-500">⏰ Time Locked</span>
                    </div>
                  )}

                  {selectedEntry.isAlternative && selectedEntry.realityVariant && (
                    <div>
                      <span className="font-medium">Reality Variant:</span>
                      <span className="ml-2 text-indigo-500 font-medium">
                        {selectedEntry.realityVariant}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 