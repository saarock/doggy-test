import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


  export const formatTime = (date: Date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
 export  const formatDateHeader = (date: Date) => {
    const today = new Date()
    const msgDate = new Date(date)
    if (msgDate.toDateString() === today.toDateString()) return 'Today'
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (msgDate.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return msgDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
  }
