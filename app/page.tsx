"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { LogOut, User, BookOpen, PenTool, Eye, Sparkles } from "lucide-react"
import { useAuth } from "@/components/firebase-auth-provider"
import { useEffect, useState } from "react"
import { getUserDiaryEntries, getUserProfile, createUserProfile, UserProfile, DiaryEntry, getUserAchievements, checkAndUnlockAchievements } from "@/lib/firebase"

export default function HomePage() {
  const { user, loading, signOut } = useAuth()
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])
  const [activityData, setActivityData] = useState<{ [key: string]: string }>({})
  const [stats, setStats] = useState<{ total: number; [key: string]: number }>({ total: 0 })
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now())

  // Carousel state for achievements
  const [currentPage, setCurrentPage] = useState(0)
  const maxPages = Math.ceil(100 / 18) // 100 achievements, 18 per page (6 rows × 3 columns) = 6 pages

  // Achievement System Data
  const achievements = [
    // Word Count Milestones
    { id: 1, name: "First Whisper", description: "Wrote your first word, the silence is broken", condition: "Write your first word", icon: "🔇", unlocked: false },
    { id: 2, name: "The First Page", description: "Reached 100 words, your story has begun", condition: "Write 100 words total", icon: "📄", unlocked: false },
    { id: 3, name: "A Thousand Thoughts", description: "Hit 1,000 words, your mind is taking shape on paper", condition: "Write 1,000 words total", icon: "💭", unlocked: false },
    { id: 4, name: "Ink River", description: "Crossed 5,000 words, ideas are flowing endlessly", condition: "Write 5,000 words total", icon: "🌊", unlocked: false },
    { id: 5, name: "Word Mountain", description: "10,000 words, and you've climbed higher than most dare", condition: "Write 10,000 words total", icon: "⛰️", unlocked: false },
    { id: 6, name: "Library Seed", description: "20,000 words, enough to fill a small book", condition: "Write 20,000 words total", icon: "📚", unlocked: false },
    { id: 7, name: "Forest of Words", description: "50,000 words, your journal breathes like a novel", condition: "Write 50,000 words total", icon: "🌲", unlocked: false },
    { id: 8, name: "Ink Empire", description: "100,000 words, your kingdom is made of sentences", condition: "Write 100,000 words total", icon: "👑", unlocked: false },
    { id: 9, name: "Million Echoes", description: "1,000,000 words, your diary is now a universe", condition: "Write 1,000,000 words total", icon: "🌌", unlocked: false },
    { id: 10, name: "The Endless Pen", description: "No stopping you, infinity awaits", condition: "Write 2,000,000+ words total", icon: "♾️", unlocked: false },
    
    // Daily Streaks
    { id: 11, name: "Day One Flame", description: "Journaled two days in a row, the spark has begun", condition: "Write for 2 days in a row", icon: "🔥", unlocked: false },
    { id: 12, name: "The Third Dawn", description: "Wrote for three consecutive days, you're steady now", condition: "Write for 3 days in a row", icon: "🌅", unlocked: false },
    { id: 13, name: "Week of Whispers", description: "Seven days in a row, your voice is growing", condition: "Write for 7 days in a row", icon: "📅", unlocked: false },
    { id: 14, name: "The Fortnight Flame", description: "Two weeks of consistency, a fire inside you", condition: "Write for 14 days in a row", icon: "🔥", unlocked: false },
    { id: 15, name: "The Moon's Cycle", description: "Journaled for 30 days straight, orbit complete", condition: "Write for 30 days in a row", icon: "🌙", unlocked: false },
    { id: 16, name: "Seasoned Scribe", description: "90 days streak, like seasons, you've changed", condition: "Write for 90 days in a row", icon: "🍂", unlocked: false },
    { id: 17, name: "The Yearling Writer", description: "365 days, a full year, you've archived yourself", condition: "Write for 365 days in a row", icon: "📅", unlocked: false },
    { id: 18, name: "Unbroken Chain", description: "500 days streak, discipline inked in habit", condition: "Write for 500 days in a row", icon: "⛓️", unlocked: false },
    { id: 19, name: "Eternal Streak", description: "1,000 days, you've become timeless", condition: "Write for 1,000 days in a row", icon: "⏰", unlocked: false },
    { id: 20, name: "Diary Deity", description: "The streak never bends, you've transcended", condition: "Write for 2,000+ days in a row", icon: "👼", unlocked: false },
    
    // Time of Writing
    { id: 21, name: "Midnight Muse", description: "Wrote between 12AM–2AM, thoughts in the dark", condition: "Write between 12AM-2AM", icon: "🌙", unlocked: false },
    { id: 22, name: "Sunrise Scribe", description: "Captured dawn with your words", condition: "Write between 5AM-7AM", icon: "🌅", unlocked: false },
    { id: 23, name: "Afternoon Dreamer", description: "Midday writing, when others nap, you write", condition: "Write between 12PM-2PM", icon: "☀️", unlocked: false },
    { id: 24, name: "Twilight Teller", description: "Wrote at sunset, fading light, rising thoughts", condition: "Write between 6PM-8PM", icon: "🌆", unlocked: false },
    { id: 25, name: "Night Owl's Ink", description: "Past 3AM, the diary glows under your gaze", condition: "Write after 3AM", icon: "🦉", unlocked: false },
    
    // Length of Entry
    { id: 26, name: "Short & Sweet", description: "Wrote under 50 words, sharp like lightning", condition: "Write under 50 words in one entry", icon: "⚡", unlocked: false },
    { id: 27, name: "The Paragraph Pioneer", description: "Wrote your first proper paragraph", condition: "Write 100+ words in one entry", icon: "📝", unlocked: false },
    { id: 28, name: "Essay Soul", description: "Hit 500 words in one entry, flowing long", condition: "Write 500+ words in one entry", icon: "📄", unlocked: false },
    { id: 29, name: "Chapter Builder", description: "2,000 words in one sitting, you're telling stories", condition: "Write 2,000+ words in one entry", icon: "📖", unlocked: false },
    { id: 30, name: "The Marathon Writer", description: "5,000+ words, unstoppable endurance", condition: "Write 5,000+ words in one entry", icon: "🏃", unlocked: false },
    
    // Consistency & Habits
    { id: 31, name: "Weekend Whisperer", description: "Journaled every weekend for a month", condition: "Write every weekend for 4 weeks", icon: "📅", unlocked: false },
    { id: 32, name: "Daily Devotee", description: "Never skipped a day for a whole month", condition: "Write every day for 30 days", icon: "🙏", unlocked: false },
    { id: 33, name: "Morning Ritualist", description: "Wrote 30 mornings in a row", condition: "Write 30 mornings in a row", icon: "🌅", unlocked: false },
    { id: 34, name: "Night Ritualist", description: "30 nights in a row, you sleep with ink", condition: "Write 30 nights in a row", icon: "🌙", unlocked: false },
    { id: 35, name: "Balanced Writer", description: "Wrote equally at day and night, harmony achieved", condition: "Write 20 entries each during day and night", icon: "⚖️", unlocked: false },
    
    // Emotional Achievements
    { id: 36, name: "Tearstained Pages", description: "First time crying while writing", condition: "Write while experiencing strong emotions", icon: "😢", unlocked: false },
    { id: 37, name: "Laughing Ink", description: "Captured joy so strong you laughed aloud", condition: "Write about something that made you laugh", icon: "😄", unlocked: false },
    { id: 38, name: "Rage Unleashed", description: "Wrote with anger blazing through words", condition: "Write while feeling angry", icon: "😠", unlocked: false },
    { id: 39, name: "Silent Entry", description: "Wrote without emotion, just pure reflection", condition: "Write a completely neutral entry", icon: "😐", unlocked: false },
    { id: 40, name: "Catharsis Complete", description: "Emptied your soul onto the page", condition: "Write about a deeply personal experience", icon: "💔", unlocked: false },
    
    // Meta & Fun Writing
    { id: 41, name: "The Scribble Start", description: "Made a typo but kept going", condition: "Continue writing after making a typo", icon: "✏️", unlocked: false },
    { id: 42, name: "Crossed Lines", description: "Edited your own diary entry", condition: "Edit an entry after writing it", icon: "✂️", unlocked: false },
    { id: 43, name: "Ink Stains", description: "Wrote nonsense, but it counts", condition: "Write a completely random entry", icon: "🎨", unlocked: false },
    { id: 44, name: "Meta Writer", description: "Wrote about writing", condition: "Write about the act of writing", icon: "📝", unlocked: false },
    { id: 45, name: "The Questioner", description: "Wrote only questions for one entry", condition: "Write an entry with only questions", icon: "❓", unlocked: false },
    
    // Diary Modes (Specific)
    { id: 46, name: "Echo Chamber", description: "Used Echo Mode for the first time", condition: "Use Echo Mode", icon: "🔊", unlocked: false },
    { id: 47, name: "The Locked Vault", description: "Time-Locked an entry for the first time", condition: "Use Time-Locked Mode", icon: "🔒", unlocked: false },
    { id: 48, name: "Prompt Seeker", description: "Wrote in Shadow Journaling mode", condition: "Use Shadow Journaling Mode", icon: "👤", unlocked: false },
    { id: 49, name: "Madness Beginnings", description: "First Madness Journal entry", condition: "Use Madness Journal Mode", icon: "🌀", unlocked: false },
    { id: 50, name: "Irreversible Truths", description: "Wrote in Irreversible mode, no edits allowed", condition: "Use Irreversible Mode", icon: "🚫", unlocked: false },
    
    // Madness Journal Special
    { id: 51, name: "The First Crack", description: "Begun your descent into Madness", condition: "Reach corruption level 3 in Madness Mode", icon: "🕳️", unlocked: false },
    { id: 52, name: "Pages on Fire", description: "Wrote a frenzy of ideas in Madness Mode", condition: "Reach corruption level 7 in Madness Mode", icon: "🔥", unlocked: false },
    { id: 53, name: "Voices in Ink", description: "Madness Journal spoke back, and you listened", condition: "Reach corruption level 10 in Madness Mode", icon: "🗣️", unlocked: false },
    { id: 54, name: "Chaos Composer", description: "Crafted beauty out of madness", condition: "Write 1000+ words in Madness Mode", icon: "🎼", unlocked: false },
    { id: 55, name: "Reality Splitter", description: "Alternative perspective achieved", condition: "Use Alternative Reality Mode", icon: "🌌", unlocked: false },
    
    // Shadow Journaling Prompts
    { id: 56, name: "Facing the Dark", description: "Answered your first shadow prompt", condition: "Complete your first shadow prompt", icon: "🌑", unlocked: false },
    { id: 57, name: "The Inner Child", description: "Wrote to your younger self", condition: "Write a letter to your younger self", icon: "👶", unlocked: false },
    { id: 58, name: "Mirror Gaze", description: "Wrote as if someone else was writing about you", condition: "Write about yourself in third person", icon: "🪞", unlocked: false },
    { id: 59, name: "The Hidden Fear", description: "Faced your fear in ink", condition: "Write about your biggest fear", icon: "😨", unlocked: false },
    { id: 60, name: "Shadow Dancer", description: "Completed 10 shadow prompts", condition: "Complete 10 shadow prompts", icon: "💃", unlocked: false },
    
    // Seasonal/Thematic
    { id: 61, name: "New Year's Resolve", description: "First diary entry of the year", condition: "Write on January 1st", icon: "🎆", unlocked: false },
    { id: 62, name: "Spring Bloom", description: "Journaled in spring, new beginnings", condition: "Write 10 entries in spring", icon: "🌸", unlocked: false },
    { id: 63, name: "Summer Heat", description: "Hot days, hotter words", condition: "Write 10 entries in summer", icon: "☀️", unlocked: false },
    { id: 64, name: "Autumn Leaves", description: "Reflected on change during autumn", condition: "Write 10 entries in autumn", icon: "🍂", unlocked: false },
    { id: 65, name: "Winter Silence", description: "Cold outside, warm inside the diary", condition: "Write 10 entries in winter", icon: "❄️", unlocked: false },
    
    // Personal Growth
    { id: 66, name: "First Reflection", description: "Looked back on an older entry", condition: "Read and reflect on a past entry", icon: "🔍", unlocked: false },
    { id: 67, name: "Growth Noted", description: "Found evidence of change in your diary", condition: "Notice personal growth in your writing", icon: "📈", unlocked: false },
    { id: 68, name: "Wisdom Keeper", description: "Recorded advice to your future self", condition: "Write advice for your future self", icon: "🧠", unlocked: false },
    { id: 69, name: "Legacy Writer", description: "Wrote as if someone else would read it", condition: "Write with future readers in mind", icon: "📚", unlocked: false },
    { id: 70, name: "The Confessor", description: "Confessed something you never told anyone", condition: "Write about a deep secret", icon: "🤫", unlocked: false },
    
    // Weird & Quirky
    { id: 71, name: "One Word Diary", description: "An entry with just a single word", condition: "Write an entry with only one word", icon: "1️⃣", unlocked: false },
    { id: 72, name: "Emoji Entry", description: "Wrote an entire entry in emojis", condition: "Write an entry using only emojis", icon: "😊", unlocked: false },
    { id: 73, name: "Reverse Writer", description: "Wrote your diary backwards", condition: "Write an entry from end to beginning", icon: "↩️", unlocked: false },
    { id: 74, name: "Silent Date", description: "Wrote the date but no entry", condition: "Write only the date", icon: "📅", unlocked: false },
    { id: 75, name: "The Doodler", description: "Added a drawing to your diary", condition: "Include a drawing in your entry", icon: "🎨", unlocked: false },
    
    // Mystical / Epic Titles
    { id: 76, name: "Keeper of Time", description: "Locked 10 entries in Time-Locked Mode", condition: "Use Time-Locked Mode 10 times", icon: "⏰", unlocked: false },
    { id: 77, name: "Memory Alchemist", description: "Turned past pain into wisdom", condition: "Write about learning from past pain", icon: "🧪", unlocked: false },
    { id: 78, name: "Chronicle Weaver", description: "Wove stories across 50 entries", condition: "Write 50 connected entries", icon: "🕸️", unlocked: false },
    { id: 79, name: "Soul Librarian", description: "Hit 100 entries, your archive grows", condition: "Write 100 total entries", icon: "📚", unlocked: false },
    { id: 80, name: "The Eternal Archive", description: "500 entries, your life in books", condition: "Write 500 total entries", icon: "🏛️", unlocked: false },
    
    // Writing Style
    { id: 81, name: "The Poet's Spark", description: "Wrote an entry entirely in poetry", condition: "Write a poetic entry", icon: "📜", unlocked: false },
    { id: 82, name: "The Philosopher's Pen", description: "Asked 'why' more than 10 times in one entry", condition: "Ask 'why' 10+ times in one entry", icon: "🤔", unlocked: false },
    { id: 83, name: "The Storyteller", description: "Narrated a fictional scene in your diary", condition: "Write a fictional story in your diary", icon: "📖", unlocked: false },
    { id: 84, name: "List Maker", description: "Wrote only lists for one entry", condition: "Write an entry with only lists", icon: "📋", unlocked: false },
    { id: 85, name: "Stream of Chaos", description: "Wrote nonstop without punctuation", condition: "Write without punctuation for 100+ words", icon: "🌊", unlocked: false },
    
    // Social & Sharing
    { id: 86, name: "The Secret Keeper", description: "Kept every entry private", condition: "Keep 50 entries private", icon: "🤐", unlocked: false },
    { id: 87, name: "Shared Whisper", description: "Shared an entry for the first time", condition: "Make your first entry public", icon: "🔓", unlocked: false },
    { id: 88, name: "Trusted Circle", description: "Shared with three different people", condition: "Share entries with 3+ people", icon: "👥", unlocked: false },
    { id: 89, name: "Public Confessor", description: "Shared an entry openly", condition: "Make 10 entries public", icon: "📢", unlocked: false },
    { id: 90, name: "The Echoed Soul", description: "Someone responded to your shared diary", condition: "Get a response to a shared entry", icon: "🔄", unlocked: false },
    
    // Random Fun Achievements
    { id: 91, name: "Missed Train of Thought", description: "Stopped mid-sentence", condition: "Leave a sentence incomplete", icon: "🚂", unlocked: false },
    { id: 92, name: "Two-Sided Coin", description: "Contradicted yourself in one entry", condition: "Write contradictory statements", icon: "🪙", unlocked: false },
    { id: 93, name: "Time Traveler", description: "Wrote about the future", condition: "Write about future plans or predictions", icon: "⏰", unlocked: false },
    { id: 94, name: "Past Haunt", description: "Wrote about a memory older than 10 years", condition: "Write about a 10+ year old memory", icon: "👻", unlocked: false },
    { id: 95, name: "Secret Code", description: "Used a cipher or secret language in your diary", condition: "Write in code or cipher", icon: "🔐", unlocked: false },
    
    // Final Achievements
    { id: 96, name: "The Collector", description: "Hit 50 different achievements", condition: "Unlock 50 achievements", icon: "🏆", unlocked: false },
    { id: 97, name: "The Perfectionist", description: "Deleted and rewrote the same line 5 times", condition: "Rewrite the same line 5 times", icon: "✨", unlocked: false },
    { id: 98, name: "Ink Survivor", description: "Journaled even when you didn't want to", condition: "Write when you don't feel like it", icon: "💪", unlocked: false },
    { id: 99, name: "The Forgetful Writer", description: "Left a blank page accidentally", condition: "Save an empty entry", icon: "🤷", unlocked: false },
    { id: 100, name: "Immortal Ink", description: "Journaled across 5 different years", condition: "Write in 5 different calendar years", icon: "📅", unlocked: false }
  ]

  // Achievement unlock logic based on user data and backend
  const updateAchievements = async () => {
    if (!user || !userProfile) return achievements

    try {
      // Get user's achievements from backend
      const userAchievements = await getUserAchievements(user.uid)
      const unlockedAchievementIds = userAchievements.map(ua => ua.achievementId)
      
      // Check and unlock new achievements
      await checkAndUnlockAchievements(user.uid, userProfile, diaryEntries)
      
      // Update achievements based on backend data
      const updatedAchievements = achievements.map(achievement => {
        const unlocked = unlockedAchievementIds.includes(achievement.id)
        return { ...achievement, unlocked }
      })
      
      return updatedAchievements
    } catch (error) {
      console.error('Error updating achievements:', error)
      // Fallback to mock logic if backend fails
      return achievements.map(achievement => {
        let unlocked = false
        
        // Basic mock logic for fallback
        switch (achievement.id) {
          case 1: // First Whisper
            unlocked = userProfile.totalEntries > 0
            break
          case 2: // The First Page
            unlocked = userProfile.totalEntries >= 3 // Mock: assume average 50 words per entry
            break
          case 3: // A Thousand Thoughts
            unlocked = userProfile.totalEntries >= 20
            break
          case 4: // Ink River
            unlocked = userProfile.totalEntries >= 100
            break
          case 5: // Word Mountain
            unlocked = userProfile.totalEntries >= 200
            break
          case 6: // Library Seed
            unlocked = userProfile.totalEntries >= 400
            break
          case 7: // Forest of Words
            unlocked = userProfile.totalEntries >= 1000
            break
          case 8: // Ink Empire
            unlocked = userProfile.totalEntries >= 2000
            break
          case 9: // Million Echoes
            unlocked = userProfile.totalEntries >= 20000
            break
          case 10: // The Endless Pen
            unlocked = userProfile.totalEntries >= 40000
            break
          case 11: // Day One Flame
            unlocked = userProfile.totalEntries >= 2
            break
          case 12: // The Third Dawn
            unlocked = userProfile.totalEntries >= 3
            break
          case 13: // Week of Whispers
            unlocked = userProfile.totalEntries >= 7
            break
          case 14: // The Fortnight Flame
            unlocked = userProfile.totalEntries >= 14
            break
          case 15: // The Moon's Cycle
            unlocked = userProfile.totalEntries >= 30
            break
          case 16: // Seasoned Scribe
            unlocked = userProfile.totalEntries >= 90
            break
          case 17: // The Yearling Writer
            unlocked = userProfile.totalEntries >= 365
            break
          case 18: // Unbroken Chain
            unlocked = userProfile.totalEntries >= 500
            break
          case 19: // Eternal Streak
            unlocked = userProfile.totalEntries >= 1000
            break
          case 20: // Diary Deity
            unlocked = userProfile.totalEntries >= 2000
            break
          case 79: // Soul Librarian
            unlocked = userProfile.totalEntries >= 100
            break
          case 80: // The Eternal Archive
            unlocked = userProfile.totalEntries >= 500
            break
          case 87: // Shared Whisper
            unlocked = (userProfile.publicEntries || 0) > 0
            break
          case 89: // Public Confessor
            unlocked = (userProfile.publicEntries || 0) >= 10
            break
          case 96: // The Collector
            unlocked = false // Mock: can't determine without backend data
            break
          default:
            // For other achievements, use a simple progression system
            unlocked = userProfile.totalEntries >= achievement.id * 2
        }
        
        return { ...achievement, unlocked }
      })
    }
  }

  // Get achievements with current unlock status
  const [currentAchievements, setCurrentAchievements] = useState(achievements)

  // Update achievements when user data changes
  useEffect(() => {
    if (user && userProfile) {
      updateAchievements().then(setCurrentAchievements)
    }
  }, [user, userProfile, diaryEntries])

  // Fetch diary entries and create activity map
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const [entries, profile] = await Promise.all([
            getUserDiaryEntries(user.uid, 100),
            getUserProfile(user.uid)
          ])
          
          setDiaryEntries(entries)
          
          // Create or update user profile if it doesn't exist
          if (!profile) {
            const newProfile = await createUserProfile({
              userId: user.uid,
              displayName: user.displayName || 'Anonymous Writer',
              bio: 'Exploring the depths of digital consciousness',
              avatarUrl: user.photoURL || undefined,
              totalEntries: entries.length,
              publicEntries: entries.filter(entry => entry.isPublic).length
            })
            setUserProfile(newProfile)
          } else {
            // Update existing profile with current counts
            try {
              const updatedProfile = await createUserProfile({
                userId: user.uid,
                displayName: profile.displayName || 'Anonymous Writer',
                bio: profile.bio || 'Exploring the depths of digital consciousness',
                avatarUrl: profile.avatarUrl || undefined,
                totalEntries: entries.length,
                publicEntries: entries.filter(entry => entry.isPublic).length,
                favoriteMode: profile.favoriteMode || undefined
              })
              setUserProfile(updatedProfile)
            } catch (profileError) {
              console.warn('Profile update failed, creating fresh profile:', profileError)
              // If profile update fails, try to create a fresh profile
              try {
                const freshProfile = await createUserProfile({
                  userId: user.uid,
                  displayName: user.displayName || 'Anonymous Writer',
                  bio: 'Exploring the depths of digital consciousness',
                  avatarUrl: user.photoURL || undefined,
                  totalEntries: entries.length,
                  publicEntries: entries.filter(entry => entry.isPublic).length
                })
                setUserProfile(freshProfile)
              } catch (freshError) {
                console.error('Failed to create fresh profile:', freshError)
              }
            }
          }
          
          // Create activity map for last 371 days (full year)
          const activityMap: { [key: string]: string } = {}
          const today = new Date()
          
          // Initialize last 371 days with no activity
          for (let i = 370; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const dateKey = date.toISOString().split('T')[0]
            activityMap[dateKey] = 'none'
          }
          
          // Fill in actual activity
          entries.forEach(entry => {
            if (entry.timestamp) {
              const entryDate = entry.timestamp.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp)
              const dateKey = entryDate.toISOString().split('T')[0]
              if (activityMap[dateKey]) {
                activityMap[dateKey] = entry.mode
              }
            }
          })
          
          setActivityData(activityMap)
          
          // Calculate stats
          const modeCounts: { [key: string]: number } = {}
          const publicCount = entries.filter(entry => entry.isPublic).length
          
          entries.forEach(entry => {
            modeCounts[entry.mode] = (modeCounts[entry.mode] || 0) + 1
          })
          
          setStats({
            total: entries.length,
            public: publicCount,
            ...modeCounts
          })
        } catch (error) {
          console.error('Error fetching data:', error)
          // Clear cache on error to force fresh data fetch
          try {
            const { clearCache } = await import('@/lib/firebase')
            clearCache()
            console.log('Cache cleared due to error')
          } catch (cacheError) {
            console.warn('Failed to clear cache:', cacheError)
          }
        }
      }
      
      fetchData()
    }
  }, [user, lastRefresh])

  // Function to manually refresh data
  const refreshData = () => {
    setLastRefresh(Date.now())
  }

  // Refresh data when page becomes visible (user returns from other pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        refreshData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen ambient-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4 animate-ambient-glow"></div>
          <p className="text-gray-300 animate-pulse">Opening the portal...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen ambient-bg relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-60" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute top-60 left-1/4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse opacity-50" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
          <div className="absolute top-80 right-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-pulse opacity-30" style={{ animationDelay: '0.5s', animationDuration: '5s' }}></div>
          <div className="absolute top-96 left-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1.5s', animationDuration: '4.5s' }}></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-8 p-4">
          {/* Header */}
          <div className="text-center space-y-6 pt-12">
            <div className="flex items-center justify-center space-x-3">
              <BookOpen className="w-12 h-12 text-purple-400 animate-float" />
              <h1 className="text-7xl font-bold text-white tracking-wider">
                MADNESS JOURNAL
              </h1>
              <Sparkles className="w-12 h-12 text-purple-400 animate-float" style={{ animationDelay: '1s' }} />
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Enter the depths of your consciousness and explore the digital void where thoughts become reality
            </p>
          </div>

          {/* Sign In Card */}
          <div className="max-w-md mx-auto">
            <Card className="glass p-8 text-center space-y-6 animate-ambient-glow">
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <Eye className="w-8 h-8 text-purple-400" />
                  <h2 className="text-3xl font-bold text-white">Welcome</h2>
                  <Eye className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-gray-300">
                  Sign in to access your personal journaling experience
                </p>
              </div>

              <Link href="/auth/signin">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25" size="lg">
                  Sign In to Continue
                </Button>
              </Link>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-12">
            <p>"The mind is its own place, and in itself can make a heaven of hell, a hell of heaven."</p>
            <p className="text-xs mt-1">- John Milton</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ambient-bg relative overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-60" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute top-60 left-1/4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse opacity-50" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
        <div className="absolute top-80 right-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-pulse opacity-30" style={{ animationDelay: '0.5s', animationDuration: '5s' }}></div>
        <div className="absolute top-96 left-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1.5s', animationDuration: '4.5s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8 p-4">
        {/* Header with User Profile */}
        <div className="flex items-center justify-between pt-8">
          <div className="text-left">
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="w-10 h-10 text-purple-400 animate-float" />
              <h1 className="text-5xl font-bold text-white tracking-wider">
                MADNESS JOURNAL
              </h1>
              <Sparkles className="w-10 h-10 text-purple-400 animate-float" style={{ animationDelay: '1s' }} />
            </div>
            <p className="text-lg text-gray-300">
              Choose your path into the depths of digital consciousness
            </p>
          </div>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-full glass hover:glass-dark transition-all duration-300">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                  <AvatarFallback className="bg-purple-600 text-white">
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-dark w-64 border-purple-500/20" align="end" forceMount>
              <div className="flex items-center justify-start gap-3 p-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                  <AvatarFallback className="bg-purple-600 text-white">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 leading-none">
                  {user.displayName && <p className="font-medium text-white">{user.displayName}</p>}
                  {user.email && (
                    <p className="w-[200px] truncate text-sm text-gray-400">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Profile Management */}
              <div className="border-t border-gray-600/50">
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user.uid}`} className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 focus:bg-purple-500/10">
                    <User className="mr-2 h-4 w-4" />
                    <span>View My Profile</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/profile/edit" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 focus:bg-blue-500/10">
                    <PenTool className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                  </Link>
                </DropdownMenuItem>
              </div>
              
              {/* Sign Out */}
              <div className="border-t border-gray-600/50">
                <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/write" className="block group">
            <Card className="glass p-8 text-left hover:glass-dark transition-all duration-500 hover:scale-105 cursor-pointer border-purple-500/20 hover:border-purple-500/40 animate-ambient-glow group-hover:animate-ambient-glow">
              <div className="space-y-6">
                <div className="text-6xl group-hover:animate-bounce transition-all duration-300">✍️</div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-3">Write Diary</h2>
                  <p className="text-gray-300 leading-relaxed">
                    Begin your journey into the depths of your mind. Let your thoughts flow freely into the digital void.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-purple-400">
                  <PenTool className="w-5 h-5" />
                  <span className="text-sm font-medium">Start Writing</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/read" className="block group">
            <Card className="glass p-8 text-left hover:glass-dark transition-all duration-500 hover:scale-105 cursor-pointer border-blue-500/20 hover:border-blue-500/40 animate-ambient-glow group-hover:animate-ambient-glow" style={{ animationDelay: '1s' }}>
              <div className="space-y-6">
                <div className="text-6xl group-hover:animate-bounce transition-all duration-300">📖</div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-3">Read Diary</h2>
                  <p className="text-gray-300 leading-relaxed">
                    Revisit your past entries and memories. Explore alternate realities of your thoughts.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-blue-400">
                  <Eye className="w-5 h-5" />
                  <span className="text-sm font-medium">Explore Entries</span>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Contribution Tiles - GitHub Style */}
        {/* Writing Activity Section */}
        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
          {/* Header with Title and Legend */}
          <div className="flex justify-between items-start mb-4">
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
                  const mode = activityData[dateKey] || 'none'
                  
                  const getTileColor = (mode: string) => {
                    const colors = {
                      none: 'bg-gray-600',
                      madness: 'bg-purple-500',
                      timelocked: 'bg-blue-500',
                      echo: 'bg-green-500',
                      shadow: 'bg-purple-600',
                      irreversible: 'bg-red-500',
                      alternative: 'bg-indigo-500'
                    }
                    
                    return colors[mode as keyof typeof colors] || 'bg-gray-600'
                  }

                  const getTileTooltip = (mode: string, date: Date) => {
                    if (mode === 'none') {
                      return `No entry on ${date.toLocaleDateString()}`
                    }
                    
                    const modeNames = {
                      madness: 'Madness Mode',
                      timelocked: 'Time-Locked Mode',
                      echo: 'Echo Mode',
                      shadow: 'Shadow Mode',
                      irreversible: 'Irreversible Mode',
                      alternative: 'Alternative Reality Mode'
                    }
                    
                    return `${modeNames[mode as keyof typeof modeNames]} entry on ${date.toLocaleDateString()}`
                  }

                  return (
                    <div
                      key={dayIndex}
                      className={`w-4 h-4 rounded-sm transition-all duration-200 hover:scale-125 cursor-pointer ${getTileColor(mode)}`}
                      title={getTileTooltip(mode, tileDate)}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* Activity Summary */}
          <div className="text-left text-sm text-gray-400">
            {stats.total > 0 ? `${stats.total} days of writing in the past year` : '0 days of writing in the past year'}
          </div>
        </div>

        {/* Stats */}
        <div className="flex space-x-8 text-sm">
          <div className="text-left">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-gray-400">Total Entries</div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-green-400">{stats.public || 0}</div>
            <div className="text-gray-400">Public Entries</div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-purple-400">{stats.madness || 0}</div>
            <div className="text-gray-400">Madness Mode</div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-blue-400">{stats.timelocked || 0}</div>
            <div className="text-gray-400">Time-Locked</div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-green-400">{stats.echo || 0}</div>
            <div className="text-gray-400">Echo Mode</div>
          </div>
        </div>
        
        {/* Refresh Button */}
        <div className="flex mt-4">
          <Button 
            onClick={refreshData} 
            variant="outline" 
            size="sm"
            className="text-gray-400 hover:text-white border-gray-600/30 hover:border-gray-500/50"
          >
            🔄 Refresh Stats
          </Button>
        </div>

        {/* Achievement System */}
        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Achievements</h3>
            <div className="text-sm text-gray-400">
              {currentAchievements?.filter(a => a.unlocked).length || 0} / {currentAchievements?.length || 0} Unlocked
            </div>
          </div>

          {/* Achievement Carousel */}
          <div className="relative overflow-hidden">
            {/* Navigation Buttons */}
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-purple-600/80 hover:bg-purple-500/90 disabled:bg-gray-600/50 disabled:cursor-not-allowed transition-all duration-200 ${
                currentPage === 0 ? 'opacity-50' : 'opacity-100 hover:scale-110'
              }`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => setCurrentPage(Math.min(maxPages - 1, currentPage + 1))}
              disabled={currentPage === maxPages - 1}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-purple-600/80 hover:bg-purple-500/90 disabled:cursor-not-allowed transition-all duration-200 ${
                currentPage === maxPages - 1 ? 'opacity-50' : 'opacity-100 hover:scale-110'
              }`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Achievement Grid - Current Page Only */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-12 transition-opacity duration-300">
              {(currentAchievements || []).slice(currentPage * 18, (currentPage + 1) * 18).map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border transition-all duration-500 cursor-pointer transform hover:scale-105 ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/40 hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/25'
                      : 'bg-gray-800/50 border-gray-600/30 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`text-2xl transition-all duration-300 ${achievement.unlocked ? 'animate-bounce hover:rotate-12' : 'hover:scale-110'}`}>
                      {achievement.unlocked ? achievement.icon : '🔒'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-sm transition-colors duration-200 ${
                        achievement.unlocked ? 'text-white' : 'text-gray-400'
                      }`}>
                        {achievement.name}
                      </h4>
                      <p className={`text-xs mt-1 transition-colors duration-200 ${
                        achievement.unlocked ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>
                      <div className={`text-xs mt-2 transition-colors duration-200 ${
                        achievement.unlocked ? 'text-purple-400' : 'text-gray-600'
                      }`}>
                        {achievement.condition}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Page Indicators with Animation */}
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: maxPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 hover:scale-125 ${
                    index === currentPage 
                      ? 'bg-purple-500 scale-125 shadow-lg shadow-purple-500/50' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-12">
        <p>"Choose your path wisely, for the mind is a labyrinth of infinite possibilities."</p>
      </div>
    </div>
  )
}
