"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, BookOpen, Brain, Clock, Eye, Sparkles, Lock, Zap, Target, Trophy, Users, Shield } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="relative flex justify-center">
          <Link href="/" className="absolute left-0 top-0">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">About Madness Journal</h1>
            <p className="text-gray-300 text-lg">Your digital sanctuary for thoughts, memories, and reflections</p>
          </div>
        </div>

        {/* Mission Statement */}
        <Card className="p-8 bg-black/40 backdrop-blur-sm border-gray-700">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Madness Journal transcends traditional journaling by offering unique, immersive experiences that adapt to your emotional state and writing style. 
              We believe that self-reflection should be as dynamic and complex as the human mind itself.
            </p>
          </div>
        </Card>

        {/* Features Grid */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white text-center">Writing Modes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Madness Journal */}
            <Card className="p-6 border-2 border-purple-500/30 bg-purple-900/20 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🌀</div>
                  <h3 className="text-xl font-bold text-white">Madness Journal</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Experience progressive text corruption as your thoughts evolve into digital chaos. Watch your words transform with mystical symbols and glitch effects.
                </p>
              </div>
            </Card>

            {/* Time Capsule Mode */}
            <Card className="p-6 border-2 border-blue-500/30 bg-blue-900/20 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">⏰</div>
                  <h3 className="text-xl font-bold text-white">Time Capsule Mode</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Seal your thoughts for the future. Set unlock dates and let your past self surprise your future self with forgotten wisdom.
                </p>
              </div>
            </Card>

            {/* Shadow Journaling */}
            <Card className="p-6 border-2 border-gray-500/30 bg-gray-900/20 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🔮</div>
                  <h3 className="text-xl font-bold text-white">Shadow Journaling</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Guided prompts help you explore your subconscious. Deep questions lead to profound self-discovery and emotional clarity.
                </p>
              </div>
            </Card>

            {/* Irreversible Mode */}
            <Card className="p-6 border-2 border-red-500/30 bg-red-900/20 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🧊</div>
                  <h3 className="text-xl font-bold text-white">Irreversible Mode</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Write with permanent commitment. Watch your words freeze in time as they become immutable digital artifacts.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Features List */}
        <Card className="p-8 bg-black/40 backdrop-blur-sm border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-green-400 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Private & Secure</h3>
                <p className="text-gray-300 text-sm">Your thoughts are protected with Firebase authentication and secure storage</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Trophy className="w-6 h-6 text-yellow-400 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Achievement System</h3>
                <p className="text-gray-300 text-sm">Unlock achievements as you write and explore different modes</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Target className="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Guided Prompts</h3>
                <p className="text-gray-300 text-sm">Shadow Journaling provides thoughtful prompts for deeper self-reflection</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Time-Locked Entries</h3>
                <p className="text-gray-300 text-sm">Seal entries until future dates for a time-travel experience</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-orange-400 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Dynamic Effects</h3>
                <p className="text-gray-300 text-sm">Watch your text transform with corruption, freezing, and visual effects</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 text-pink-400 mt-1" />
              <div>
                <h3 className="font-semibold text-white">Public Sharing</h3>
                <p className="text-gray-300 text-sm">Choose to make entries public and share your thoughts with others</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Achievements Preview */}
        <Card className="p-8 bg-black/40 backdrop-blur-sm border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Achievement System</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-600">
              <span className="text-2xl">📝</span>
              <div>
                <h3 className="font-semibold text-white text-sm">First Entry</h3>
                <p className="text-gray-400 text-xs">Write your first diary entry</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-600">
              <span className="text-2xl">📚</span>
              <div>
                <h3 className="font-semibold text-white text-sm">Word Master</h3>
                <p className="text-gray-400 text-xs">Write 1,000 words</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-600">
              <span className="text-2xl">⏰</span>
              <div>
                <h3 className="font-semibold text-white text-sm">Time Traveler</h3>
                <p className="text-gray-400 text-xs">Create a time-locked entry</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-600">
              <span className="text-2xl">🔮</span>
              <div>
                <h3 className="font-semibold text-white text-sm">Shadow Walker</h3>
                <p className="text-gray-400 text-xs">Complete 10 shadow prompts</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-600">
              <span className="text-2xl">🌀</span>
              <div>
                <h3 className="font-semibold text-white text-sm">Madness Embrace</h3>
                <p className="text-gray-400 text-xs">Let corruption reach level 10</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-600">
              <span className="text-2xl">🧊</span>
              <div>
                <h3 className="font-semibold text-white text-sm">Frozen Thoughts</h3>
                <p className="text-gray-400 text-xs">Use irreversible mode</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-6">
            <p className="text-gray-300 text-sm">...and many more to discover as you write!</p>
          </div>
        </Card>

        {/* How to Get Started */}
        <Card className="p-8 bg-black/40 backdrop-blur-sm border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="font-semibold text-white">Sign In</h3>
              <p className="text-gray-300 text-sm">Use your Google account to create a secure profile</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="font-semibold text-white">Choose Mode</h3>
              <p className="text-gray-300 text-sm">Select a writing mode that matches your mood</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="font-semibold text-white">Start Writing</h3>
              <p className="text-gray-300 text-sm">Let your thoughts flow and watch the magic happen</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white font-bold">4</span>
              </div>
              <h3 className="font-semibold text-white">Explore & Grow</h3>
              <p className="text-gray-300 text-sm">Discover achievements and new ways to express yourself</p>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <Card className="p-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm border-purple-500/30">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-white">Ready to Begin Your Journey?</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Start exploring the depths of your consciousness with our unique journaling modes. 
              Your thoughts deserve a canvas as dynamic as your mind.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/write">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg">
                  Start Writing
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 text-lg">
                  Explore Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 