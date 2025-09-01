"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Calendar, Eye, PenTool, User } from "lucide-react"
import Link from "next/link"
import { getUserProfile, getPublicDiaryEntries, UserProfile, DiaryEntry, getUserAchievements } from "@/lib/firebase"
import { useAuth } from "@/components/firebase-auth-provider"

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.userId as string
  const { user: currentUser } = useAuth()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [userAchievements, setUserAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Achievement data (same as home page)
  const allAchievements = [
    // Word Count Milestones
    { id: 1, name: "First Whisper", description: "Wrote your first word, the silence is broken", condition: "Write your first word", icon: "🔇" },
    { id: 2, name: "The First Page", description: "Reached 100 words, your story has begun", condition: "Write 100 words total", icon: "📄" },
    { id: 3, name: "A Thousand Thoughts", description: "Hit 1,000 words, your mind is taking shape on paper", condition: "Write 1,000 words total", icon: "💭" },
    { id: 4, name: "Ink River", description: "Crossed 5,000 words, ideas are flowing endlessly", condition: "Write 5,000 words total", icon: "🌊" },
    { id: 5, name: "Word Mountain", description: "10,000 words, and you've climbed higher than most dare", condition: "Write 10,000 words total", icon: "⛰️" },
    { id: 6, name: "Library Seed", description: "20,000 words, enough to fill a small book", condition: "Write 20,000 words total", icon: "📚" },
    { id: 7, name: "Forest of Words", description: "50,000 words, your journal breathes like a novel", condition: "Write 50,000 words total", icon: "🌲" },
    { id: 8, name: "Ink Empire", description: "100,000 words, your kingdom is made of sentences", condition: "Write 100,000 words total", icon: "👑" },
    { id: 9, name: "Million Echoes", description: "1,000,000 words, your diary is now a universe", condition: "Write 1,000,000 words total", icon: "🌌" },
    { id: 10, name: "The Endless Pen", description: "No stopping you, infinity awaits", condition: "Write 2,000,000+ words total", icon: "♾️" },
    
    // Daily Streaks
    { id: 11, name: "Day One Flame", description: "Journaled two days in a row, the spark has begun", condition: "Write for 2 days in a row", icon: "🔥" },
    { id: 12, name: "The Third Dawn", description: "Wrote for three consecutive days, you're steady now", condition: "Write for 3 days in a row", icon: "🌅" },
    { id: 13, name: "Week of Whispers", description: "Seven days in a row, your voice is growing", condition: "Write for 7 days in a row", icon: "📅" },
    { id: 14, name: "The Fortnight Flame", description: "Two weeks of consistency, a fire inside you", condition: "Write for 14 days in a row", icon: "🔥" },
    { id: 15, name: "The Moon's Cycle", description: "Journaled for 30 days straight, orbit complete", condition: "Write for 30 days in a row", icon: "🌙" },
    { id: 16, name: "Seasoned Scribe", description: "90 days streak, like seasons, you've changed", condition: "Write for 90 days in a row", icon: "🍂" },
    { id: 17, name: "The Yearling Writer", description: "365 days, a full year, you've archived yourself", condition: "Write for 365 days in a row", icon: "📅" },
    { id: 18, name: "Unbroken Chain", description: "500 days streak, discipline inked in habit", condition: "Write for 500 days in a row", icon: "⛓️" },
    { id: 19, name: "Eternal Streak", description: "1,000 days, you've become timeless", condition: "Write for 1,000 days in a row", icon: "⏰" },
    { id: 20, name: "Diary Deity", description: "The streak never bends, you've transcended", condition: "Write for 2,000+ days in a row", icon: "👼" },
    
    // Add more achievements as needed for display
    { id: 79, name: "Soul Librarian", description: "Hit 100 entries, your archive grows", condition: "Write 100 total entries", icon: "📚" },
    { id: 80, name: "The Eternal Archive", description: "500 entries, your life in books", condition: "Write 500 total entries", icon: "🏛️" },
    { id: 87, name: "Shared Whisper", description: "Shared an entry for the first time", condition: "Make your first entry public", icon: "🔓" },
    { id: 89, name: "Public Confessor", description: "Shared an entry openly", condition: "Make 10 entries public", icon: "📢" }
  ]

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const [profileData, entriesData, achievementsData] = await Promise.all([
          getUserProfile(userId),
          getPublicDiaryEntries(userId, 20),
          getUserAchievements(userId)
        ])
        
        setProfile(profileData)
        setEntries(entriesData)
        setUserAchievements(achievementsData)
      } catch (err) {
        setError("Failed to load profile")
        console.error("Error fetching profile:", err)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchProfile()
    }
  }, [userId])

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
    return content.substring(0, maxLength) + "..."
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Profile Not Found</h1>
          <p className="text-gray-400">This user profile could not be loaded.</p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              ← Back to Home
            </Button>
          </Link>
        </div>

        {/* Profile Card */}
        <Card className="p-8 text-center">
          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex justify-center">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatarUrl || ""} alt={profile.displayName} />
                <AvatarFallback className="bg-purple-600 text-white text-2xl">
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Profile Info */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">{profile.displayName}</h1>
              {profile.bio && (
                <p className="text-gray-300 text-lg max-w-2xl mx-auto">{profile.bio}</p>
              )}
            </div>

            {/* Stats */}
            <div className="flex justify-center space-x-8 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{profile.totalEntries}</div>
                <div className="text-gray-400">Total Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{profile.publicEntries}</div>
                <div className="text-gray-400">Public Entries</div>
              </div>
              {profile.favoriteMode && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {getModeConfig(profile.favoriteMode).icon}
                  </div>
                  <div className="text-gray-400">Favorite Mode</div>
                </div>
              )}
            </div>

            {/* Join Date */}
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Member since {profile.joinDate?.toDate?.()?.toLocaleDateString() || 'Unknown'}</span>
            </div>
          </div>
        </Card>

        {/* User Achievements */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Achievements</h3>
              <div className="text-sm text-gray-400">
                {userAchievements?.length || 0} Unlocked
              </div>
            </div>

            {/* Achievements Grid */}
            {userAchievements && userAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userAchievements.map((userAchievement) => {
                  // Find achievement details
                  const achievement = allAchievements.find(a => a.id === userAchievement.achievementId)
                  
                  if (!achievement) return null
                  
                  return (
                    <div
                      key={userAchievement.achievementId}
                      className="p-4 rounded-lg border bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/40"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl animate-bounce">
                          {achievement.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-white">
                            {achievement.name}
                          </h4>
                          <p className="text-xs mt-1 text-gray-300">
                            {achievement.description}
                          </p>
                          <div className="text-xs mt-2 text-purple-400">
                            {achievement.condition}
                          </div>
                          {userAchievement.unlockedAt && (
                            <div className="text-xs mt-1 text-gray-500">
                              Unlocked: {userAchievement.unlockedAt.toDate?.()?.toLocaleDateString() || 'Unknown'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🏆</div>
                <h4 className="text-lg font-semibold text-white mb-2">No Achievements Yet</h4>
                <p className="text-gray-400">
                  This user hasn't unlocked any achievements yet. Start writing to earn your first badge!
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Writing Activity - Contribution Grid */}
        <Card className="p-6">
          <div className="space-y-4">
            {/* Header with Title and Legend */}
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-white">Writing Activity</h3>
              
              {/* Color Legend */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-gray-400">Less</span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-gray-600 rounded-sm"></div>
                  <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                  <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
                  <div className="w-3 h-3 bg-red-600 rounded-sm"></div>
                </div>
                <span className="text-gray-400">More</span>
              </div>
            </div>

            {/* Contribution Grid */}
            <div className="flex gap-1 mb-4">
              {/* Generate 53 weeks as columns */}
              {Array.from({ length: 53 }, (_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {/* Generate 7 days as rows within each week */}
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const tileIndex = weekIndex * 7 + dayIndex
                    const today = new Date()
                    const tileDate = new Date(today)
                    tileDate.setDate(today.getDate() - (370 - tileIndex))
                    const dateKey = tileDate.toISOString().split('T')[0]
                    
                    // Check if there's an entry for this date
                    const hasEntry = entries.some(entry => {
                      const entryDate = entry.timestamp?.toDate?.()
                      if (!entryDate) return false
                      const entryDateKey = entryDate.toISOString().split('T')[0]
                      return entryDateKey === dateKey
                    })
                    
                    const getTileColor = (hasEntry: boolean) => {
                      return hasEntry ? 'bg-purple-500' : 'bg-gray-600'
                    }

                    const getTileTooltip = (hasEntry: boolean, date: Date) => {
                      if (hasEntry) {
                        return `Entry on ${date.toLocaleDateString()}`
                      }
                      return `No entry on ${date.toLocaleDateString()}`
                    }

                    return (
                      <div
                        key={dayIndex}
                        className={`w-3 h-3 rounded-sm transition-all duration-200 hover:scale-125 cursor-pointer ${getTileColor(hasEntry)}`}
                        title={getTileTooltip(hasEntry, tileDate)}
                      />
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Activity Summary */}
            <div className="text-sm text-gray-400">
              {profile.publicEntries} days of writing in the past year
            </div>
          </div>
        </Card>

        {/* Public Entries */}
        {entries.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white text-center">Public Entries</h2>
            <div className="grid gap-4">
              {entries.map((entry) => {
                const modeConfig = getModeConfig(entry.mode)
                return (
                  <Card key={entry.id} className="p-6">
                    <div className="space-y-4">
                      {/* Entry Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold text-white">{entry.title}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${modeConfig.color}`}>
                              {modeConfig.icon} {modeConfig.name}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {entry.timestamp?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Entry Content */}
                      <p className="text-gray-300 leading-relaxed">
                        {getPreview(entry.content)}
                      </p>

                      {/* Entry Footer */}
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center space-x-4">
                          <span>{entry.metadata?.wordCount || 0} words</span>
                          <span>{entry.metadata?.characterCount || 0} characters</span>
                        </div>
                        {entry.corruptionLevel && (
                          <span className="text-purple-400">
                            Corruption Level: {entry.corruptionLevel}/10
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto" />
              <h3 className="text-xl font-semibold text-white">No Public Entries</h3>
              <p className="text-gray-400">
                This user hasn't shared any public diary entries yet.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
} 