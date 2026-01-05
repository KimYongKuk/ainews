"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Newspaper, Youtube, Menu } from "lucide-react"
import { useState } from "react"

interface SidebarProps {
    activeTab: "ai" | "it" | "youtube"
    onTabChange: (tab: "ai" | "it" | "youtube") => void
    className?: string
}

export function Sidebar({ activeTab, onTabChange, className }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    const navItems = [
        {
            id: "ai",
            label: "AI News",
            icon: LayoutDashboard,
            description: "Daily AI updates"
        },
        {
            id: "it",
            label: "IT News",
            icon: Newspaper,
            description: "Tech industry news"
        },
        {
            id: "youtube",
            label: "YouTube Summaries",
            icon: Youtube,
            description: "Video insights"
        }
    ] as const

    return (
        <div className={cn("flex flex-col border-r bg-card transition-all duration-300",
            isCollapsed ? "w-16" : "w-64",
            className
        )}>
            <div className="flex h-16 items-center border-b px-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <Menu className="h-5 w-5" />
                </Button>
                {!isCollapsed && (
                    <span className="font-bold text-lg tracking-tight">NewsHub</span>
                )}
            </div>

            <div className="flex-1 py-4">
                <nav className="grid gap-1 px-2">
                    {navItems.map((item) => (
                        <Button
                            key={item.id}
                            variant={activeTab === item.id ? "secondary" : "ghost"}
                            className={cn(
                                "justify-start gap-3",
                                activeTab === item.id && "bg-secondary",
                                isCollapsed && "justify-center px-2"
                            )}
                            onClick={() => onTabChange(item.id)}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {!isCollapsed && (
                                <div className="flex flex-col items-start text-left">
                                    <span className="text-sm font-medium">{item.label}</span>
                                </div>
                            )}
                        </Button>
                    ))}
                </nav>
            </div>
        </div>
    )
}
