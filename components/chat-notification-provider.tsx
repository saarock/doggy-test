"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSocket } from "@/lib/socket"
import { toast } from "@/hooks/use-toast"
import type { Message, User } from "@/lib/db/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle } from "lucide-react"

interface ChatNotificationProviderProps {
    children: React.ReactNode
    currentUser: User
}

interface MessageNotification extends Message {
    sender?: User
    chat_room_id: string
}

export function ChatNotificationProvider({
    children,
    currentUser,
}: ChatNotificationProviderProps) {
    const socket = useSocket()
    const pathname = usePathname()
    const router = useRouter()

    // Initialize notification sound
    const notificationSound = typeof window !== "undefined" ? new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3") : null;

    useEffect(() => {
        if (!socket) {
            console.log("Notification Provider: No socket available yet");
            return;
        }

        const handleNewMessage = async (message: MessageNotification) => {
            console.log("Notification Provider: Received new message:", message);

            // Don't show notification if it's from current user
            if (message.sender_id === currentUser.id) {
                console.log("Notification Provider: Filtering out own message");
                return;
            }

            // Don't show notification if user is on the chat page for this room
            const isOnChatPage = pathname?.startsWith(`/chats/${message.chat_room_id}`)
            if (isOnChatPage) {
                console.log("Notification Provider: User is on chat page, skipping notification");
                return;
            }

            // Play notification sound
            if (notificationSound) {
                notificationSound.play().catch(e => console.log("Sound play failed (interaction required):", e));
            }

            // Fetch sender information
            let senderInfo: User | null = null
            try {
                const response = await fetch(`/api/users/${message.sender_id}`)
                if (response.ok) {
                    senderInfo = await response.json()
                }
            } catch (error) {
                console.error("Failed to fetch sender info:", error)
            }

            // Show toast notification
            toast({
                duration: 5000,
                className: "cursor-pointer",
                title: (
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 rounded-xl border-2 border-background shadow-md">
                            <AvatarImage
                                src={senderInfo?.avatar_url || undefined}
                                alt={senderInfo?.name || "User"}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary font-black text-sm rounded-xl">
                                {senderInfo?.name?.charAt(0) || "?"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="font-black text-base tracking-tight">
                                {senderInfo?.name || "Someone"}
                            </div>
                            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                                <MessageCircle className="w-3 h-3" />
                                New Message
                            </div>
                        </div>
                    </div>
                ),
                description: (
                    <p className="text-sm font-medium text-foreground/80 mt-2 line-clamp-2 leading-relaxed">
                        {message.content}
                    </p>
                ),
                onClick: () => {
                    router.push(`/chats/${message.chat_room_id}`)
                },
            })
        }

        // Register for personal notifications
        console.log(`Notification Provider: Registering for user notifications: user_${currentUser.id}`);
        socket.emit("register", currentUser.id);

        // Listen for new messages
        console.log("Notification Provider: Registering message listener");
        socket.on("message", handleNewMessage)

        return () => {
            console.log("Notification Provider: Unregistering message listener");
            socket.off("message", handleNewMessage)
        }
    }, [socket, currentUser.id, pathname, router])

    return <>{children}</>
}
