"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Lock, LockOpen, Clock, Calendar } from "lucide-react"
import { useAuth } from "@/components/firebase-auth-provider"
import { saveDiaryEntry, DiaryEntry, getUserProfile, checkAndUnlockAchievements, getUserDiaryEntries, isEntryUnlocked } from "@/lib/firebase"
import { countWords } from "@/lib/utils"

const TimeCapsuleModeInput = React.memo(() => {
  const { user } = useAuth()
  const router = useRouter()
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSealed, setIsSealed] = useState(false)
  const [unlockDateTime, setUnlockDateTime] = useState('')
  const [sealedEntryData, setSealedEntryData] = useState<{title: string, text: string, unlockTime: Date} | null>(null)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Get minimum datetime (current time + 1 minute)
  const minDateTime = useMemo(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 1)
    return now.toISOString().slice(0, 16)
  }, [])

  // Format unlock date for display
  const formatUnlockDate = useCallback((dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  // Check if current time has passed unlock time
  const isUnlockTimeReached = useMemo(() => {
    if (!sealedEntryData?.unlockTime) return false
    return new Date() >= sealedEntryData.unlockTime
  }, [sealedEntryData?.unlockTime])

  // Auto-check unlock status every minute
  useEffect(() => {
    if (sealedEntryData && !isUnlockTimeReached) {
      const interval = setInterval(() => {
        // Force re-render to check unlock status
        const now = new Date()
        if (now >= sealedEntryData.unlockTime) {
          // Entry should unlock
          window.location.reload() // Simple way to refresh state
        }
      }, 60000) // Check every minute

      return () => clearInterval(interval)
    }
  }, [sealedEntryData, isUnlockTimeReached])

  // Handle sealing the entry
  const handleSealEntry = useCallback(async () => {
    if (!text.trim() || !unlockDateTime || !user) return
    
    setIsSaving(true)
    try {
      const unlockTime = new Date(unlockDateTime)
      
      const entry: DiaryEntry = {
        id: '',
        userId: user.uid,
        title: title.trim() || 'Untitled Time Capsule',
        content: text,
        mode: 'timelocked',
        timestamp: new Date(),
        isPublic: isPublic,
        metadata: {
          wordCount: countWords(text),
          characterCount: text.length,
          unlockTime: unlockTime.toISOString()
        }
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
      
      // Seal the entry locally
      setSealedEntryData({
        title: title.trim() || 'Untitled Time Capsule',
        text,
        unlockTime
      })
      setIsSealed(true)
      
      console.log('Time capsule sealed successfully!')
      
      // Redirect to read page after successful seal
      setTimeout(() => {
        router.push('/read')
      }, 2000)
      
    } catch (error) {
      console.error('Error sealing time capsule:', error)
    } finally {
      setIsSaving(false)
    }
  }, [text, title, unlockDateTime, isPublic, user])

  // Handle unlocking (when time is reached)
  const handleUnlock = useCallback(() => {
    if (sealedEntryData && isUnlockTimeReached) {
      setText(sealedEntryData.text)
      setTitle(sealedEntryData.title)
      setIsSealed(false)
      setSealedEntryData(null)
    }
  }, [sealedEntryData, isUnlockTimeReached])

  // Reset to create new entry
  const handleCreateNew = useCallback(() => {
    setText('')
    setTitle('')
    setUnlockDateTime('')
    setIsSealed(false)
    setSealedEntryData(null)
    setIsPublic(false)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="relative flex justify-center">
          <Link href="/write" className="absolute left-0 top-0">
            <Button variant="ghost" size="sm" className="text-sm text-blue-300 hover:text-blue-100">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Back
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-100 flex items-center justify-center gap-2">
              <Clock className="w-6 h-6 text-blue-400" />
              Time Capsule Mode
            </h1>
            <p className="text-sm sm:text-base text-blue-300">
              Seal your thoughts until a future moment in time
            </p>
          </div>
        </div>

        {/* Time Capsule Container */}
        <Card className={`p-4 sm:p-6 transition-all duration-1000 ${
          isSealed 
            ? 'bg-slate-800/30 backdrop-blur-xl border-2 border-blue-500/50 shadow-2xl shadow-blue-500/20' 
            : 'bg-slate-800/50 backdrop-blur-sm border-2 border-blue-500/30'
        }`}>
          
          {/* Sealed State */}
          {isSealed && sealedEntryData && (
            <div className="text-center space-y-6">
              {/* Lock Icon with Glow */}
              <div className="flex justify-center">
                <div className={`relative p-6 rounded-full transition-all duration-1000 ${
                  isUnlockTimeReached 
                    ? 'bg-green-500/20 shadow-lg shadow-green-500/50' 
                    : 'bg-blue-500/20 shadow-lg shadow-blue-500/50'
                }`}>
                  {isUnlockTimeReached ? (
                    <LockOpen className="w-12 h-12 text-green-400 animate-pulse" />
                  ) : (
                    <Lock className="w-12 h-12 text-blue-400 animate-pulse" />
                  )}
                  
                  {/* Futuristic glow rings */}
                  <div className={`absolute inset-0 rounded-full animate-ping ${
                    isUnlockTimeReached ? 'bg-green-500/20' : 'bg-blue-500/20'
                  }`} style={{ animationDuration: '3s' }} />
                  <div className={`absolute inset-2 rounded-full animate-pulse ${
                    isUnlockTimeReached ? 'bg-green-500/10' : 'bg-blue-500/10'
                  }`} />
                </div>
              </div>

              {/* Status Message */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-blue-100">{sealedEntryData.title}</h2>
                
                {isUnlockTimeReached ? (
                  <div className="space-y-4">
                    <p className="text-green-400 font-medium">
                      🎉 Time Capsule Unlocked!
                    </p>
                    <p className="text-blue-300">
                      Your sealed thoughts are now ready to be revealed.
                    </p>
                    <Button 
                      onClick={handleUnlock}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg"
                    >
                      <LockOpen className="w-5 h-5 mr-2" />
                      Open Time Capsule
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-blue-300">
                      This time capsule is sealed until:
                    </p>
                    <p className="text-xl font-bold text-blue-100 bg-blue-900/30 px-4 py-2 rounded-lg">
                      {formatUnlockDate(sealedEntryData.unlockTime.toISOString())}
                    </p>
                    <p className="text-blue-400 text-sm">
                      Your thoughts are safely locked away until the appointed time.
                    </p>
                  </div>
                )}
              </div>

              {/* Create New Button */}
              <Button 
                onClick={handleCreateNew}
                variant="outline"
                className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10"
              >
                Create New Time Capsule
              </Button>
            </div>
          )}

          {/* Unsealed State - Normal Entry Mode */}
          {!isSealed && (
            <div className="space-y-4">
              {/* Title Input */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2 text-blue-300">
                  Capsule Title (optional)
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Name your time capsule..."
                  className="w-full px-3 py-2 border border-blue-500/30 rounded-md bg-slate-700/50 text-blue-100 text-sm sm:text-base transition-all duration-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm"
                />
              </div>

              {/* Unlock Date/Time Picker */}
              <div>
                <label htmlFor="unlock-time" className="block text-sm font-medium mb-2 text-blue-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Unlock Date & Time
                </label>
                <input
                  id="unlock-time"
                  type="datetime-local"
                  value={unlockDateTime}
                  onChange={(e) => setUnlockDateTime(e.target.value)}
                  min={minDateTime}
                  className="w-full px-3 py-2 border border-blue-500/30 rounded-md bg-slate-700/50 text-blue-100 text-sm sm:text-base transition-all duration-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm"
                />
                
                {/* Live Preview */}
                {unlockDateTime && (
                  <p className="mt-2 text-sm text-blue-400 bg-blue-900/20 px-3 py-2 rounded border border-blue-500/20">
                    ⏰ This entry will unlock on {formatUnlockDate(unlockDateTime)}
                  </p>
                )}
              </div>

              {/* Text Area */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-2 text-blue-300">
                  Your Future Message
                </label>
                <textarea
                  ref={textareaRef}
                  id="content"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a message to your future self..."
                  className="w-full min-h-[200px] sm:min-h-[300px] px-3 py-3 border border-blue-500/30 rounded-md bg-slate-700/30 text-blue-100 text-sm sm:text-base resize-none transition-all duration-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm leading-relaxed"
                />
              </div>

              {/* Privacy and Seal Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="public-toggle"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="public-toggle" className="text-sm">
                    {isPublic ? (
                      <span className="text-green-400">📢 Public Time Capsule</span>
                    ) : (
                      <span className="text-blue-400">🔒 Private Time Capsule</span>
                    )}
                  </Label>
                </div>
                
                <Button 
                  onClick={handleSealEntry}
                  disabled={!text.trim() || !unlockDateTime || isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-medium transition-all duration-300 shadow-lg shadow-blue-500/25"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sealing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Seal Time Capsule
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
})

export default TimeCapsuleModeInput 