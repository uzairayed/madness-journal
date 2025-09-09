"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shuffle, Eye, Save, ArrowLeft, Volume2, VolumeX, AlertCircle, Brain, Heart, Clock, Lightbulb, EyeOff } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/firebase-auth-provider"
import { useRouter } from "next/navigation"
import { saveDiaryEntry, DiaryEntry, DiaryEntryMetadata, getUserProfile, checkAndUnlockAchievements, getUserDiaryEntries } from '@/lib/firebase'
import { countWords } from '@/lib/utils'

interface PromptCategory {
  id: string
  name: string
  color: string
  icon: React.ReactNode
}

interface JournalPrompt {
  id: string
  text: string
  category: string
  intensity: 'gentle' | 'medium' | 'deep'
}

const promptCategories: PromptCategory[] = [
  { id: 'self-reflection', name: 'Self-Reflection', color: 'bg-blue-500', icon: <Brain className="w-4 h-4" /> },
  { id: 'emotions', name: 'Emotions', color: 'bg-red-500', icon: <Heart className="w-4 h-4" /> },
  { id: 'memories', name: 'Memories', color: 'bg-purple-500', icon: <Clock className="w-4 h-4" /> },
  { id: 'creativity', name: 'Creativity', color: 'bg-green-500', icon: <Lightbulb className="w-4 h-4" /> },
  { id: 'relationships', name: 'Relationships', color: 'bg-pink-500', icon: <Heart className="w-4 h-4" /> },
  { id: 'growth', name: 'Personal Growth', color: 'bg-orange-500', icon: <Brain className="w-4 h-4" /> }
]

const journalPrompts: JournalPrompt[] = [
  // Self-Reflection
  { id: '1', text: "What would you tell your 10-year-old self today?", category: 'self-reflection', intensity: 'medium' },
  { id: '2', text: "Describe a place where you feel completely safe and at peace.", category: 'self-reflection', intensity: 'gentle' },
  { id: '3', text: "What are three things you've learned about yourself this year?", category: 'self-reflection', intensity: 'medium' },
  { id: '4', text: "If you could change one decision from your past, what would it be and why?", category: 'self-reflection', intensity: 'deep' },
  { id: '5', text: "What does success mean to you personally, beyond society's expectations?", category: 'self-reflection', intensity: 'deep' },
  { id: '6', text: "Write about a time when you surprised yourself with your own strength.", category: 'self-reflection', intensity: 'medium' },
  
  // Emotions
  { id: '7', text: "Describe an emotion you've been avoiding lately. What would happen if you let yourself feel it?", category: 'emotions', intensity: 'deep' },
  { id: '8', text: "What brings you genuine joy, and when did you last experience it?", category: 'emotions', intensity: 'gentle' },
  { id: '9', text: "Write about a fear that holds you back. Where do you think it came from?", category: 'emotions', intensity: 'deep' },
  { id: '10', text: "If your emotions were weather, what would today's forecast be?", category: 'emotions', intensity: 'gentle' },
  { id: '11', text: "Describe a moment when you felt truly understood by someone.", category: 'emotions', intensity: 'medium' },
  { id: '12', text: "What does anger feel like in your body, and what is it trying to tell you?", category: 'emotions', intensity: 'deep' },
  
  // Memories
  { id: '13', text: "Write about a smell that instantly transports you to a specific memory.", category: 'memories', intensity: 'gentle' },
  { id: '14', text: "Describe the last time you felt truly proud of yourself.", category: 'memories', intensity: 'medium' },
  { id: '15', text: "What's a childhood memory that still influences how you see the world?", category: 'memories', intensity: 'deep' },
  { id: '16', text: "Write about someone who is no longer in your life but shaped who you are.", category: 'memories', intensity: 'deep' },
  { id: '17', text: "Describe your earliest memory of feeling different from others.", category: 'memories', intensity: 'deep' },
  { id: '18', text: "What's a family tradition or ritual that holds special meaning for you?", category: 'memories', intensity: 'gentle' },
  
  // Creativity
  { id: '19', text: "If you could create anything without limitations, what would it be?", category: 'creativity', intensity: 'gentle' },
  { id: '20', text: "Describe your ideal day from morning to night with no constraints.", category: 'creativity', intensity: 'medium' },
  { id: '21', text: "Write a letter to humanity 100 years from now.", category: 'creativity', intensity: 'medium' },
  { id: '22', text: "If you could have a conversation with any version of yourself, which would you choose and what would you discuss?", category: 'creativity', intensity: 'deep' },
  { id: '23', text: "Imagine you can give one piece of advice that everyone in the world will hear. What is it?", category: 'creativity', intensity: 'medium' },
  { id: '24', text: "Write about a world where your biggest insecurity becomes your greatest strength.", category: 'creativity', intensity: 'deep' },
  
  // Relationships
  { id: '25', text: "Describe someone who knows you better than you know yourself.", category: 'relationships', intensity: 'medium' },
  { id: '26', text: "What do you need most from your relationships that you're not currently receiving?", category: 'relationships', intensity: 'deep' },
  { id: '27', text: "Write about a relationship that taught you something important about love.", category: 'relationships', intensity: 'deep' },
  { id: '28', text: "How do you want to be remembered by the people closest to you?", category: 'relationships', intensity: 'deep' },
  { id: '29', text: "Describe the last time you felt truly seen and accepted for who you are.", category: 'relationships', intensity: 'medium' },
  { id: '30', text: "What boundaries do you need to set in your relationships?", category: 'relationships', intensity: 'deep' },
  
  // Personal Growth
  { id: '31', text: "What pattern in your life are you ready to break?", category: 'growth', intensity: 'deep' },
  { id: '32', text: "If you could master any skill overnight, what would it be and why?", category: 'growth', intensity: 'gentle' },
  { id: '33', text: "What does your inner critic say to you, and how would you respond to a friend who heard those words?", category: 'growth', intensity: 'deep' },
  { id: '34', text: "Describe a challenge you're currently facing and three possible ways to approach it.", category: 'growth', intensity: 'medium' },
  { id: '35', text: "What does self-compassion look like for you in practice?", category: 'growth', intensity: 'medium' },
  { id: '36', text: "If you could send yourself a message during your most difficult moment, what would you say?", category: 'growth', intensity: 'deep' },
  
  // Additional prompts for variety
  { id: '37', text: "What story do you tell yourself about your limitations, and is it really true?", category: 'self-reflection', intensity: 'deep' },
  { id: '38', text: "Describe a moment when you felt most alive. What made it special?", category: 'emotions', intensity: 'medium' },
  { id: '39', text: "Write about a place that holds secrets. What happened there?", category: 'memories', intensity: 'medium' },
  { id: '40', text: "If you could design a ritual for letting go, what would it involve?", category: 'creativity', intensity: 'medium' },
  { id: '41', text: "What do you wish you could tell someone but haven't found the courage to say?", category: 'relationships', intensity: 'deep' },
  { id: '42', text: "What would you do if you knew you couldn't fail?", category: 'growth', intensity: 'medium' },
  { id: '43', text: "Describe the version of yourself you're becoming.", category: 'growth', intensity: 'medium' },
  { id: '44', text: "What does your soul hunger for?", category: 'self-reflection', intensity: 'deep' },
  { id: '45', text: "Write about a time when silence said more than words could.", category: 'memories', intensity: 'medium' }
]

const ShadowJournalingInput = React.memo(() => {
  const { user } = useAuth()
  const router = useRouter()
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState<JournalPrompt | null>(null)
  const [showPrompt, setShowPrompt] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [promptHistory, setPromptHistory] = useState<string[]>([])
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null) // ✅ Added error state
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Get prompts filtered by category
  const filteredPrompts = useMemo(() => {
    if (selectedCategory === 'all') return journalPrompts
    return journalPrompts.filter(prompt => prompt.category === selectedCategory)
  }, [selectedCategory])

  // Get a random prompt that hasn't been used recently
  const getRandomPrompt = useCallback(() => {
    const availablePrompts = filteredPrompts.filter(prompt => 
      !promptHistory.includes(prompt.id)
    )
    
    if (availablePrompts.length === 0) {
      // Reset history if all prompts have been used
      setPromptHistory([])
      return filteredPrompts[Math.floor(Math.random() * filteredPrompts.length)]
    }
    
    return availablePrompts[Math.floor(Math.random() * availablePrompts.length)]
  }, [filteredPrompts, promptHistory])

  // Initialize with a random prompt
  useEffect(() => {
    if (!currentPrompt) {
      const prompt = getRandomPrompt()
      setCurrentPrompt(prompt)
    }
  }, [currentPrompt, getRandomPrompt])

  // Shuffle to new prompt
  const handleShufflePrompt = useCallback(() => {
    const newPrompt = getRandomPrompt()
    setCurrentPrompt(newPrompt)
    
    // Add current prompt to history
    if (currentPrompt) {
      setPromptHistory(prev => {
        const newHistory = [...prev, currentPrompt.id]
        // Keep only last 10 prompts in history
        return newHistory.slice(-10)
      })
    }
  }, [currentPrompt, getRandomPrompt])

  // Handle category change
  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId)
    // Get new prompt from the selected category
    const categoryPrompts = categoryId === 'all' 
      ? journalPrompts 
      : journalPrompts.filter(p => p.category === categoryId)
    
    const newPrompt = categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)]
    setCurrentPrompt(newPrompt)
  }, [])

  // Get category info
  const getCurrentCategory = useMemo(() => {
    if (!currentPrompt) return null
    return promptCategories.find(cat => cat.id === currentPrompt.category)
  }, [currentPrompt])

  // Handle text change with auto-resize
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  // Save functionality
  const handleSave = useCallback(async () => {
    if (!text.trim() || !user || !currentPrompt) return
    
    setIsSaving(true)
    setError(null) // ✅ Clear previous errors
    try {
      const entry: DiaryEntry = {
        id: '',
        userId: user.uid,
        title: title.trim() || `Shadow Journal: ${currentPrompt.text.slice(0, 50)}...`,
        content: text,
        mode: 'shadow',
        timestamp: new Date(),
        isPublic: isPublic,
        metadata: {
          wordCount: countWords(text),
          characterCount: text.length,
          ...(currentPrompt && {
            prompt: currentPrompt.text,
            promptCategory: currentPrompt.category,
            promptIntensity: currentPrompt.intensity
          })
        } as DiaryEntryMetadata
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
      
      // Reset form but keep the prompt for potential continued writing
      setText("")
      setTitle("")
      setIsPublic(false)
      
      console.log('Shadow journal entry saved successfully!')
      setSaveSuccess(true)
      
      // Redirect to read page after successful save
      setTimeout(() => {
        router.push('/read')
      }, 1500)
      
    } catch (error) {
      console.error('Error saving shadow journal entry:', error)
      // ✅ Show user-friendly error message
      setError('Failed to save your entry. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }, [text, title, isPublic, user, currentPrompt])

  // Get intensity color
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'gentle': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'deep': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="relative flex justify-center">
          <Link href="/write" className="absolute left-0 top-0">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Shadow Journaling</h1>
            <p className="text-gray-300">Guided prompts to explore your inner landscape</p>
          </div>
        </div>

        {/* Prompt Section */}
        {currentPrompt && (
          <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
            <div className="p-6">
              {/* Prompt Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-white">Your Prompt</h2>
                  {getCurrentCategory && (
                    <Badge className={`${getCurrentCategory.color} text-white border-none`}>
                      <span className="mr-1">{getCurrentCategory.icon}</span>
                      {getCurrentCategory.name}
                    </Badge>
                  )}
                  <Badge className={`${getIntensityColor(currentPrompt.intensity)} border-none text-xs`}>
                    {currentPrompt.intensity}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPrompt(!showPrompt)}
                    className="text-gray-300 border-gray-600 hover:bg-gray-800"
                  >
                    {showPrompt ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShufflePrompt}
                    className="text-gray-300 border-gray-600 hover:bg-gray-800"
                  >
                    <Shuffle className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Prompt Text */}
              {showPrompt && (
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 border border-purple-500/20">
                  <p className="text-gray-100 text-lg italic leading-relaxed">
                    "{currentPrompt.text}"
                  </p>
                </div>
              )}

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange('all')}
                  className="text-xs"
                >
                  All Categories
                </Button>
                {promptCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryChange(category.id)}
                    className="text-xs"
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Writing Area */}
        <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
          <div className="p-6 space-y-4">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Title (optional)
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your reflection a title..."
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Text Area */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                Your Reflection
              </label>
              <textarea
                ref={textareaRef}
                id="content"
                value={text}
                onChange={handleTextChange}
                placeholder="Begin exploring your thoughts..."
                className="w-full min-h-[300px] px-3 py-3 bg-gray-900/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none overflow-hidden leading-relaxed"
                style={{ height: 'auto' }}
              />
              
              {/* Word count */}
              <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                <span>{countWords(text)} words • {text.length} characters</span>
                {currentPrompt && (
                  <span className="italic">Reflecting on: {getCurrentCategory?.name}</span>
                )}
              </div>
            </div>

            {/* Privacy and Save Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-2">
                <Switch
                  id="public-toggle"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="public-toggle" className="text-sm text-gray-300">
                  {isPublic ? (
                    <span className="text-green-400">📢 Public Entry</span>
                  ) : (
                    <span className="text-gray-400">🔒 Private Reflection</span>
                  )}
                </Label>
              </div>
              
              <Button 
                onClick={handleSave}
                disabled={!text.trim() || isSaving || saveSuccess}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {saveSuccess ? (
                  <>
                    <div className="w-4 h-4 text-green-400 mr-2">✓</div>
                    Saved! Redirecting...
                  </>
                ) : isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving Reflection...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Reflection
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="bg-red-900/20 border-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Tips Card */}
        <Card className="bg-black/20 backdrop-blur-sm border-gray-700">
          <div className="p-4">
            <div className="text-sm text-gray-300 space-y-2">
              <p className="font-medium flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                Shadow Journaling Tips:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-6 text-xs">
                <li>Let your thoughts flow freely without judgment</li>
                <li>Explore emotions and memories that surface</li>
                <li>There are no right or wrong answers</li>
                <li>Use the shuffle button if a prompt doesn't resonate</li>
                <li>Your reflections are saved with the prompt for context</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
})

ShadowJournalingInput.displayName = 'ShadowJournalingInput'

export default ShadowJournalingInput 