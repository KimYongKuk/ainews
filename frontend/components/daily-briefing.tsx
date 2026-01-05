"use client"

import { Card } from "@/components/ui/card"
import { Sparkles, Calendar, ArrowRight } from "lucide-react"

interface DailyBriefingProps {
    data: {
        date: string
        title: string
        summary: string
        keyPoints: string[]
    }
}

export function DailyBriefing({ data }: DailyBriefingProps) {
    const formatDate = (dateString: string) => {
        try {
            return new Intl.DateTimeFormat("ko-KR", {
                month: "long",
                day: "numeric",
                weekday: "long",
            }).format(new Date(dateString))
        } catch (e) {
            return dateString
        }
    }

    if (!data) return null;

    return (
        <div className="mb-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 shadow-lg">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />

                <div className="relative p-6 sm:p-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2 text-primary font-medium">
                            <Calendar className="h-5 w-5" />
                            <span>{formatDate(data.date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                            <Sparkles className="h-3.5 w-3.5" />
                            Daily Briefing
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight">
                                {data.title}
                            </h2>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                {data.summary}
                            </p>
                        </div>

                        {/* Key Points */}
                        {data.keyPoints && data.keyPoints.length > 0 && (
                            <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-border/50">
                                {data.keyPoints.map((point, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/50 hover:bg-background/80 transition-colors">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium text-foreground/90 leading-snug">
                                            {point}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
