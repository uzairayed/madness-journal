"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-foreground">
            MADNESS JOURNAL
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose your path into the depths of digital consciousness
          </p>
        </div>

        {/* Main Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link href="/write" className="block">
            <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-primary/20 hover:border-primary/40">
              <div className="space-y-4">
                <div className="text-4xl">✍️</div>
                <h2 className="text-2xl font-bold text-foreground">Write Diary</h2>
                <p className="text-muted-foreground">
                  Begin your journey into the depths of your mind
                </p>
              </div>
            </Card>
          </Link>

          <Link href="/read" className="block">
            <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-secondary/20 hover:border-secondary/40">
              <div className="space-y-4">
                <div className="text-4xl">📖</div>
                <h2 className="text-2xl font-bold text-foreground">Read Diary</h2>
                <p className="text-muted-foreground">
                  Revisit your past entries and memories
                </p>
              </div>
            </Card>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-12">
          <p>Choose your path wisely...</p>
        </div>
      </div>
    </div>
  )
}
