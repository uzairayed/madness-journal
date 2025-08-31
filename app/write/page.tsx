"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const journalModes = [
  {
    id: "madness",
    name: "Madness Journal",
    description: "A daily log that slowly distorts text, introducing symbols and corrupted words over time.",
    icon: "🌀",
    color: "border-primary/30 hover:border-primary/50",
    isDefault: true
  },
  {
    id: "timelocked",
    name: "Time-Locked Mode",
    description: "Entries are locked for a specific duration before they can be read",
    icon: "⏰",
    color: "border-blue-500/30 hover:border-blue-500/50"
  },
  {
    id: "echo",
    name: "Echo Mode",
    description: "Your words echo back with slight variations and distortions",
    icon: "🔊",
    color: "border-green-500/30 hover:border-green-500/50"
  },
  {
    id: "shadow",
    name: "Shadow Journaling Mode",
    description: "Provides prompts that dig into hidden thoughts and suppressed feelings.",
    icon: "👤",
    color: "border-purple-500/30 hover:border-purple-500/50"
  },
  {
    id: "irreversible",
    name: "Irreversible Mode",
    description: "Once written, entries cannot be edited or deleted",
    icon: "🔒",
    color: "border-red-500/30 hover:border-red-500/50"
  },
  {
    id: "alternative",
    name: "Alternative Reality Mode",
    description: "Parallel versions of your entries which exist in different realities",
    icon: "🌌",
    color: "border-indigo-500/30 hover:border-indigo-500/50"
  }
]

export default function ModeSelectionPage() {
  return (
    <div className="min-h-screen bg-background p-4 relative overflow-hidden">
      {/* Star Animation Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large stars */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute top-60 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
        <div className="absolute top-80 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '5s' }}></div>
        <div className="absolute top-96 left-1/2 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '4.5s' }}></div>
        
        {/* Medium stars */}
        <div className="absolute top-32 right-20 w-1 h-1 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.8s', animationDuration: '3.2s' }}></div>
        <div className="absolute top-72 left-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '2.2s', animationDuration: '4.8s' }}></div>
        <div className="absolute top-48 right-1/4 w-1 h-1 bg-cyan-300 rounded-full animate-pulse" style={{ animationDelay: '1.2s', animationDuration: '3.8s' }}></div>
        
        {/* Small stars */}
        <div className="absolute top-16 right-1/2 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s', animationDuration: '2.5s' }}></div>
        <div className="absolute top-24 left-2/3 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.8s', animationDuration: '3.1s' }}></div>
        <div className="absolute top-56 right-16 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.7s', animationDuration: '2.8s' }}></div>
        <div className="absolute top-88 left-1/5 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '2.5s', animationDuration: '4.2s' }}></div>
        
        {/* Floating stars */}
        <div className="absolute top-1/4 left-1/6 w-1 h-1 bg-yellow-200 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '6s' }}></div>
        <div className="absolute top-1/3 right-1/5 w-1.5 h-1.5 bg-pink-200 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
        <div className="absolute top-2/3 left-1/4 w-1 h-1 bg-green-200 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '7s' }}></div>
        
        {/* Shooting stars */}
        <div className="absolute top-10 left-0 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '8s' }}></div>
        <div className="absolute top-20 right-0 w-1 h-1 bg-blue-200 rounded-full animate-ping" style={{ animationDelay: '4s', animationDuration: '6s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex-1 text-center">
            <h1 className="text-4xl font-bold text-foreground">Choose Your Mode</h1>
            <p className="text-muted-foreground">Select how you want to experience your journaling</p>
          </div>
        </div>

        {/* Mode Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journalModes.map((mode) => (
            <Link key={mode.id} href={`/write/${mode.id}`}>
              <Card className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${mode.color} ${mode.isDefault ? 'ring-2 ring-primary/20' : ''}`}>
                <div className="space-y-4">
                  <div className="text-3xl">{mode.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      {mode.name}
                      {mode.isDefault && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {mode.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>Each mode offers a unique experience. Choose the one that resonates with your current state of mind.</p>
        </div>
      </div>
    </div>
  )
} 