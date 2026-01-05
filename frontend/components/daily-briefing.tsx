"use client"

import { Card } from "@/components/ui/card"
import { Sparkles, Calendar, ArrowRight } from "lucide-react"

// Mock Data for Daily Briefing
const MOCK_BRIEFING = {
    date: new Date().toISOString(),
    title: "오늘의 AI 트렌드: 경량화 모델과 멀티모달의 진화",
    summary: "오늘은 구글의 새로운 경량화 모델 공개와 함께, 오픈소스 진영에서의 멀티모달 모델 발전이 두드러진 하루였습니다. 특히 모바일 기기에서의 AI 구동 효율성을 높이는 기술들이 주목받고 있으며, 기업들의 AI 도입 속도가 더욱 빨라지고 있습니다. 또한, 생성형 AI의 저작권 문제에 대한 새로운 가이드라인 논의가 시작되었습니다.",
    keyPoints: [
        "구글, 모바일 최적화 Gemini Nano 2 공개 임박",
        "Meta, 오픈소스 멀티모달 모델 Llama-3-Vision 출시설",
        "국내 스타트업, AI 기반 법률 상담 서비스 규제 샌드박스 통과"
    ]
}

export function DailyBriefing() {
    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat("ko-KR", {
            month: "long",
            day: "numeric",
            weekday: "long",
        }).format(new Date(dateString))
    }

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
                            <span>{formatDate(MOCK_BRIEFING.date)}</span>
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
                                {MOCK_BRIEFING.title}
                            </h2>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                {MOCK_BRIEFING.summary}
                            </p>
                        </div>

                        {/* Key Points */}
                        <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-border/50">
                            {MOCK_BRIEFING.keyPoints.map((point, index) => (
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
                    </div>
                </div>
            </div>
        </div>
    )
}
