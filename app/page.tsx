"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { LogOut, User, BookOpen, PenTool, Eye, Sparkles } from "lucide-react"
import { useAuth } from "@/components/firebase-auth-provider"

export default function HomePage() {
  const { user, loading, signOut } = useAuth()

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

      <div className="relative z-10 max-w-4xl mx-auto space-y-8 p-4">
        {/* Header with User Profile */}
        <div className="flex items-center justify-between pt-8">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center space-x-3 mb-4">
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
              <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Link href="/write" className="block group">
            <Card className="glass p-8 text-center hover:glass-dark transition-all duration-500 hover:scale-105 cursor-pointer border-purple-500/20 hover:border-purple-500/40 animate-ambient-glow group-hover:animate-ambient-glow">
              <div className="space-y-6">
                <div className="text-6xl group-hover:animate-bounce transition-all duration-300">✍️</div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-3">Write Diary</h2>
                  <p className="text-gray-300 leading-relaxed">
                    Begin your journey into the depths of your mind. Let your thoughts flow freely into the digital void.
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-2 text-purple-400">
                  <PenTool className="w-5 h-5" />
                  <span className="text-sm font-medium">Start Writing</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/read" className="block group">
            <Card className="glass p-8 text-center hover:glass-dark transition-all duration-500 hover:scale-105 cursor-pointer border-blue-500/20 hover:border-blue-500/40 animate-ambient-glow group-hover:animate-ambient-glow" style={{ animationDelay: '1s' }}>
              <div className="space-y-6">
                <div className="text-6xl group-hover:animate-bounce transition-all duration-300">📖</div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-3">Read Diary</h2>
                  <p className="text-gray-300 leading-relaxed">
                    Revisit your past entries and memories. Explore alternate realities of your thoughts.
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-2 text-blue-400">
                  <Eye className="w-5 h-5" />
                  <span className="text-sm font-medium">Explore Entries</span>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-12">
          <p>"Choose your path wisely, for the mind is a labyrinth of infinite possibilities."</p>
        </div>
      </div>
    </div>
  )
}
