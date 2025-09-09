"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { ArrowLeft, Save, Upload, User, Mail, FileText, Camera, Loader2, Check, X } from "lucide-react"
import { useAuth } from "@/components/firebase-auth-provider"
import { getUserProfile, createUserProfile, UserProfile } from "@/lib/firebase"
import { useRouter } from "next/navigation"

export default function EditProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form state
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  
  // UI state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const profile = await getUserProfile(user.uid)
        if (profile) {
          setDisplayName(profile.displayName || '')
          setBio(profile.bio || '')
          setEmail(profile.email || user.email || '')
          setAvatarUrl(profile.avatarUrl || '')
        } else {
          // No profile exists, use Firebase user data as defaults
          setDisplayName(user.displayName || '')
          setEmail(user.email || '')
          setAvatarUrl(user.photoURL || '')
        }
      } catch (err) {
        console.error('Error loading profile:', err)
        setError('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      loadProfile()
    }
  }, [user, authLoading])

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB')
        return
      }

      setAvatarFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  // Form validation
  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!displayName.trim()) {
      errors.displayName = 'Display name is required'
    } else if (displayName.length < 2) {
      errors.displayName = 'Display name must be at least 2 characters'
    } else if (displayName.length > 50) {
      errors.displayName = 'Display name must be less than 50 characters'
    }
    
    if (bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters'
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSave = async () => {
    if (!user || !validateForm()) return
    
    setSaving(true)
    setError('')
    setSuccess(false)
    
    try {
      // For now, we'll use the existing avatar URL or preview
      // In a real app, you'd upload the file to storage first
      const finalAvatarUrl = avatarPreview || avatarUrl || user.photoURL || ''
      
      const profileData = {
        userId: user.uid,
        displayName: displayName.trim(),
        email: email.trim(),
        bio: bio.trim(),
        avatarUrl: finalAvatarUrl,
        totalEntries: 0, // ✅ Added missing required field
        publicEntries: 0 // ✅ Added missing required field
      }
      
      await createUserProfile(profileData)
      
      setSuccess(true)
      setTimeout(() => {
        router.push(`/profile/${user.uid}`)
      }, 2000)
      
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative flex justify-center">
          <Link href="/" className="absolute left-0 top-0">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
            <p className="text-muted-foreground">Update your personal information</p>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <Check className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              Profile updated successfully! Redirecting to your profile...
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <X className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Form Card */}
        <Card className="p-6">
          <div className="space-y-6">
            
            {/* Avatar Section */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage 
                    src={avatarPreview || avatarUrl || user.photoURL || ""} 
                    alt="Profile picture" 
                  />
                  <AvatarFallback className="bg-purple-600 text-white text-xl">
                    <User className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Choose Photo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG up to 5MB
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-base font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Display Name *
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                className={validationErrors.displayName ? 'border-red-500' : ''}
              />
              {validationErrors.displayName && (
                <p className="text-sm text-red-500">{validationErrors.displayName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className={validationErrors.email ? 'border-red-500' : ''}
              />
              {validationErrors.email && (
                <p className="text-sm text-red-500">{validationErrors.email}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This will be used for notifications and account recovery
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-base font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Bio
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                className={`min-h-[100px] resize-none ${validationErrors.bio ? 'border-red-500' : ''}`}
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                {validationErrors.bio && (
                  <p className="text-sm text-red-500">{validationErrors.bio}</p>
                )}
                <p className="text-xs text-muted-foreground ml-auto">
                  {bio.length}/500 characters
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              
              <Link href={`/profile/${user.uid}`}>
                <Button variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>

          </div>
        </Card>

        {/* Additional Info */}
        <Card className="p-4 bg-muted/50">
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium">💡 Profile Tips:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>A good display name helps others recognize you</li>
              <li>Your bio appears on your public profile page</li>
              <li>Profile changes are saved immediately</li>
              <li>You can always come back and edit later</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
} 