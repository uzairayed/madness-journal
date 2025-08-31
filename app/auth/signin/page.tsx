"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, BookOpen, Eye, Brain, Sparkles, Lock } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/firebase-auth-provider"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user, signInWithGoogle } = useAuth()

  // Redirect if already signed in
  if (user) {
    router.push("/")
    return null
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
      router.push("/")
    } catch (error) {
      console.error("Sign in error:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen ambient-bg relative overflow-hidden">
      {/* Enhanced Ambient Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating particles with more variety */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-60" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute top-60 left-1/4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse opacity-50" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
        <div className="absolute top-80 right-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-pulse opacity-30" style={{ animationDelay: '0.5s', animationDuration: '5s' }}></div>
        <div className="absolute top-96 left-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1.5s', animationDuration: '4.5s' }}></div>
        <div className="absolute top-32 right-1/4 w-1 h-1 bg-green-400 rounded-full animate-pulse opacity-35" style={{ animationDelay: '0.8s', animationDuration: '3.2s' }}></div>
        <div className="absolute top-72 left-1/3 w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse opacity-45" style={{ animationDelay: '2.2s', animationDuration: '4.8s' }}></div>
        
        {/* Larger floating elements */}
        <div className="absolute top-1/4 left-1/6 w-4 h-4 bg-purple-500/20 rounded-full animate-float" style={{ animationDelay: '0s', animationDuration: '6s' }}></div>
        <div className="absolute top-1/3 right-1/5 w-6 h-6 bg-blue-500/15 rounded-full animate-float" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
        <div className="absolute top-2/3 left-1/4 w-3 h-3 bg-pink-500/25 rounded-full animate-float" style={{ animationDelay: '1s', animationDuration: '7s' }}></div>
        <div className="absolute top-1/2 right-1/6 w-5 h-5 bg-cyan-500/10 rounded-full animate-float" style={{ animationDelay: '3s', animationDuration: '8s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-all duration-300 mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to the Abyss
            </Link>
            
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-3">
                <BookOpen className="w-10 h-10 text-purple-400 animate-float" />
                <h1 className="text-5xl font-bold text-white tracking-wider">MADNESS JOURNAL</h1>
                <Sparkles className="w-10 h-10 text-purple-400 animate-float" style={{ animationDelay: '1s' }} />
              </div>
              <p className="text-xl text-gray-300">
                Enter the depths of your consciousness
              </p>
            </div>
          </div>

          {/* Sign In Card */}
          <Card className="glass-dark p-8 animate-ambient-glow">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <Brain className="w-8 h-8 text-purple-400" />
                  <h2 className="text-3xl font-bold text-white">Sign In</h2>
                  <Lock className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-gray-300 text-lg">
                  Choose your gateway to the digital realm
                </p>
              </div>

              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-6 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-purple-500/25"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-3"></div>
                    <span>Opening the portal...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-lg">Continue with Google</span>
                  </div>
                )}
              </Button>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-3 text-gray-400 text-sm mb-6">
                  <div className="flex-1 h-px bg-gray-600"></div>
                  <Eye className="w-5 h-5" />
                  <div className="flex-1 h-px bg-gray-600"></div>
                </div>
                
                <p className="text-sm text-gray-400 leading-relaxed">
                  By signing in, you agree to explore the depths of your mind and accept that{" "}
                  <span className="text-purple-400 font-medium">reality is subjective</span>. 
                  Your thoughts will be preserved in the digital void.
                </p>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              "The mind is its own place, and in itself can make a heaven of hell, a hell of heaven."
            </p>
            <p className="text-gray-600 text-xs mt-2">- John Milton</p>
          </div>
        </div>
      </div>
    </div>
  )
} 