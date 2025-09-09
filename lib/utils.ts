import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import DOMPurify from 'dompurify'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function countWords(text: string): number {
  if (!text || text.trim() === '') return 0
  
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length
}

export function getTotalWordCount(entries: Array<{metadata?: {wordCount?: number}}>): number {
  return entries.reduce((total, entry) => {
    return total + (entry.metadata?.wordCount || 0)
  }, 0)
}

// ✅ Security: Content sanitization to prevent XSS
export function sanitizeHtml(content: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return content as-is for now
    // In production, you might want to use a server-side sanitizer
    return content;
  }
  
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'i', 'span'],
    ALLOWED_ATTR: ['style'],
  });
}

// ✅ Security: Sanitize text content for display
export function sanitizeText(content: string): string {
  if (!content) return '';
  
  // Remove any potential script tags or dangerous content
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}
