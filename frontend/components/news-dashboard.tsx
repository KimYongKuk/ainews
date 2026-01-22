"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Loader2, Globe, RefreshCw, Sparkles, LayoutDashboard, Newspaper, Youtube, Play, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { SummaryModal } from "./summary-modal"
import { YouTubeCard } from "./youtube-card"
import { YouTubeModal } from "./youtube-modal"
import { DailyBriefing } from "./daily-briefing"
import { cn } from "@/lib/utils"

// Helper function to generate consistent colors from strings
const getKeywordStyle = (keyword: string) => {
  let hash = 0;
  for (let i = 0; i < keyword.length; i++) {
    hash = keyword.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate HSL color with fixed saturation and lightness for consistency
  // Use a limited hue range or specific palette if needed, but full spectrum is fine for variety
  const hue = Math.abs(hash % 360);

  return {
    bg: `hsl(${hue}, 70%, 95%)`, // Very light background
    text: `hsl(${hue}, 80%, 30%)`, // Dark text
    border: `hsl(${hue}, 60%, 85%)` // Subtle border
  };
}

// Mock Data for Demo
const MOCK_YOUTUBE_DATA = {
  id: 9999,
  translatedTitle: "AI 기술과 기업 인수의 최신 동향",
  summary: "엔비디아가 AI 스타트업 그록을 인수하며, AI 기술의 발전과 기업 간의 경쟁 상황을 다루는 영상입니다. 이와 함께 테슬라의 로봇 택시, AI 이미지 변화 기능 등을 소개합니다.",
  insight: "AI 시장의 경쟁이 치열해지고 있으며, 인수 합병을 통해 기업들이 기술력을 극대화하려는 노력이 보입니다. 또한 AI의 발전으로 인해 새로운 기능과 서비스가 지속적으로 등장하고 있습니다.",
  keywords: [
    "AI",
    "엔비디아",
    "그록",
    "테슬라",
    "로봇 택시",
    "이미지 수정",
    "AI 칩"
  ],
  link: "https://www.youtube.com/watch?v=SpXeuwUmI0Y",
  pubDate: new Date().toISOString(),
  category: "YouTube",
  videoId: "SpXeuwUmI0Y",
  segments: [
    {
      "start_time": 80,
      "title": "엔비디아의 그록 인수",
      "content": "엔비디아가 AI 칩 스타트업 그록의 핵심 자산을 약 200억 달러에 인수했습니다. 그록은 구글 TPU 개발팀에 의해 2016년에 설립된 회사로, 매우 빠른 인퍼런스를 지원하는 칩 기술로 주목받고 있습니다. 이번 인수는 비독점적 기술 라이센싱 계약으로 진행되어, 그록은 회사로 독립적으로 남고 경영진과 핵심 인력은 엔비디아로 합류하게 되었습니다. 이러한 인수는 또한 경쟁 기술 개발에 대응하기 위한 전략으로 보입니다."
    },
    {
      "start_time": 120,
      "title": "AI 인수합병의 전략적 배경",
      "content": "엔비디아의 인수가 꼭 인력을 확보하기 위한 것만은 아니며, 반독점 문제를 피하기 위한 전략으로도 해석됩니다. 기술과 인력을 유연하게 활용하고, 자원을 최적화하기 위한 역량 구축의 일환으로 여겨집니다."
    },
    {
      "start_time": 300,
      "title": "테슬라의 로봇 택시 구동",
      "content": "테슬라의 사이버 택시가 실제 도로에서 운행되고 있습니다. 이는 로봇 택시 시대의 도래를 알리는 신호로, 현재 운영 중인 웨이모와 비교의 흐름이 주목받고 있습니다. 테슬라와 웨이모는 각각의 기술적 접근 방식을 취하고 있으며, 로봇택시의 안전성과 효율성을 향한 경쟁이 이루어질 것으로 보입니다."
    },
    {
      "start_time": 492,
      "title": "X의 AI 이미지 수정 기능 출시",
      "content": "X 플랫폼에서 AI를 활용한 이미지 수정 기능이 새롭게 도입되었습니다. 사용자는 원작자 동의 없이 원하는 이미지에 다양한 변경을 가할 수 있어 창작자들 사이에서 반발이 일어나고 있습니다. 이는 AI 관련 윤리 문제가 부각될 것으로 예상됩니다."
    },
    {
      "start_time": 1330,
      "title": "그록 API와 기능 강화",
      "content": "그록은 새롭게 컬렉션 API를 출시하여 사용자가 데이터 셋을 올리고 검색할 수 있는 기능을 추가했습니다. API는 사용자들이 보다 쉽게 최신 AI 기능을 활용할 수 있게 해 주며, 활용 사례가 다양해질 것으로 예상됩니다."
    },
    {
      "start_time": 2700,
      "title": "하이퍼 AI 서비스의 등장",
      "content": "ZAI의 GLM 4.7 모델은 오픈 소스 모델 중 가장 높은 성능을 보여주며, 다국어 처리를 포함한 다양한 AI 기능을 제공하고 있습니다. 이 모델은 사용자들에게 널리 사용될 가능성이 높고, AI 시장에서 표준으로 자리잡을 수 있는 잠재력을 지니고 있습니다."
    },
    {
      "start_time": 3900,
      "title": "한국의 AI 개발 현황",
      "content": "한국의 AI 분야에서는 SKT가 새로운 모델 AIK1을 발표하며, 대규모 AI 프로젝트가 진행되고 있습니다. 다섯 개의 팀이 경쟁하고 있으며, 이를 통해 한국 AI의 기술력이 세계 시장에서 경쟁력을 가지게 될 것으로 기대됩니다."
    }
  ]
}

interface NewsItem {
  id?: number
  rank?: number
  translatedTitle: string
  summary?: string
  insight?: string
  keywords?: string[]
  link: string
  pubDate: string
  category?: string
  videoId?: string
  segments?: any
  startTime?: number
  keyTopics?: string[]
}

export function NewsDashboard() {
  const [activeTab, setActiveTab] = useState<"ai" | "youtube">("ai")
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Daily Briefing State
  const [dailyBriefing, setDailyBriefing] = useState<{
    date: string
    title: string
    summary: string
    keyPoints: string[]
  } | null>(null)

  // Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(12)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Modal states
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)

  const [selectedVideo, setSelectedVideo] = useState<NewsItem | null>(null)
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false)

  // Topic Filtering State
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  const handleTopicClick = (topic: string) => {
    setSelectedTopic(prev => prev === topic ? null : topic)
  }

  // Reset visible count when tab changes
  useEffect(() => {
    setVisibleCount(12)
  }, [activeTab])

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 12)
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [news, visibleCount])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchNews = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch Daily Briefing (only for AI tab)
      if (activeTab === 'ai') {
        // Get today's date in local time (YYYY-MM-DD)
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const today = `${year}-${month}-${day}`

        const { data: briefingData, error: briefingError } = await supabase
          .from('daily_summary_reports')
          .select('*')
          .eq('summary_date', today)
          .maybeSingle()

        if (briefingError) {
          console.error("Error fetching briefing:", briefingError)
        }

        if (briefingData) {
          setDailyBriefing({
            date: briefingData.summary_date,
            title: briefingData.overall_title || "오늘의 AI 요약",
            summary: briefingData.overall_summary || "",
            keyPoints: Array.isArray(briefingData.key_topics) ? briefingData.key_topics : []
          })
        } else {
          setDailyBriefing(null)
        }
      }

      let query = supabase
        .from('daily_ai_news')
        .select('*')

      if (activeTab === 'ai') {
        // 1. Get the latest published_date first to filter by the most recent day
        const { data: latestData, error: latestError } = await supabase
          .from('daily_ai_news')
          .select('published_date')
          .or('category.is.null,category.eq.AI,category.eq.News')
          .order('published_date', { ascending: false })
          .limit(1)

        if (latestError) {
          console.error("Supabase Error (Date Fetch):", latestError)
          throw latestError
        }

        if (!latestData || latestData.length === 0) {
          setNews([])
          setLoading(false)
          return
        }

        const latestDateStr = latestData[0].published_date
        console.log(`Latest date found for AI: ${latestDateStr}`)

        // Filter by the identified date
        const datePart = latestDateStr.split('T')[0]
        if (latestDateStr.length === 10) {
          query = query.eq('published_date', latestDateStr)
        } else {
          query = query
            .gte('published_date', `${datePart}T00:00:00`)
            .lte('published_date', `${datePart}T23:59:59`)
        }

        // Apply category filter and Sort by Rank
        query = query
          .or('category.is.null,category.eq.AI,category.eq.News')
          .order('rank', { ascending: true })

      } else if (activeTab === 'youtube') {
        // YouTube: Just filter for videos, no date restriction, Sort by Date
        query = query
          .not('video_id', 'is', null)
          .neq('video_id', '')
          .order('published_date', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        console.error("Supabase Error Details:", error);
        throw error
      }

      console.log(`Fetched ${data?.length} items for tab: ${activeTab}`, data)

      const processedData = Array.isArray(data) ? data.map((item: any) => {
        // Parse segments if it's a string, or use as is if object
        const segmentData = typeof item.segments === 'string' ? JSON.parse(item.segments) : item.segments

        // Extract start_time from the segment data if available
        // The segments column seems to be an array of objects based on user feedback
        let startTime = 0
        if (Array.isArray(segmentData) && segmentData.length > 0) {
          startTime = segmentData[0].start_time || 0
        } else if (segmentData && typeof segmentData === 'object') {
          startTime = segmentData.start_time || 0
        }

        return {
          id: item.id,
          translatedTitle: item.title || "No Title",
          summary: item.summary || "",
          insight: item.insight || "",
          keywords: Array.isArray(item.keywords) ? item.keywords : [],
          link: item.original_link || "#",
          pubDate: item.published_date || item.created_at || new Date().toISOString(),
          category: item.category,
          videoId: item.video_id,
          segments: item.segments, // Keep original for reference/modal if needed, though we are grouping
          startTime: startTime,
          keyTopics: Array.isArray(item.key_topics) ? item.key_topics : []
        }
      }) : []

      // Group by videoId
      const groupedData: NewsItem[] = []
      const videoMap = new Map<string, NewsItem>()

      processedData.forEach(item => {
        if (item.videoId) {
          if (videoMap.has(item.videoId)) {
            const existing = videoMap.get(item.videoId)!

            // If the existing item doesn't have segments yet, initialize it with itself as the first segment
            if (!existing.segments) {
              existing.segments = [{
                start_time: existing.startTime || 0,
                title: existing.translatedTitle,
                content: existing.summary
              }]
            }

            // Add current item as a new segment
            // Check if this segment is already in the list (deduplication based on title/content)
            const isDuplicate = existing.segments.some((s: any) => s.title === item.translatedTitle && s.content === item.summary)
            if (!isDuplicate) {
              existing.segments.push({
                start_time: item.startTime || 0,
                title: item.translatedTitle,
                content: item.summary
              })
            }
          } else {
            // New video item
            videoMap.set(item.videoId, item)
            groupedData.push(item)
          }
        } else {
          groupedData.push(item)
        }
      })

      // Re-process groupedData to ensure single-item videos also have segments structure if they were grouped
      // Actually, the map reference is in groupedData, so updates to 'existing' in the map are reflected.

      setNews(groupedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load content")
      console.error("Error fetching news:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [activeTab])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date)
    } catch {
      return dateString
    }
  }

  const handleCardClick = (item: NewsItem) => {
    if (item.videoId) {
      setSelectedVideo(item)
      setIsYouTubeModalOpen(true)
    } else {
      setSelectedArticle(item.link)
      setIsSummaryModalOpen(true)
    }
  }

  const handleDemoClick = () => {
    setSelectedVideo(MOCK_YOUTUBE_DATA)
    setIsYouTubeModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Top Navigation Tabs */}
        <div className="flex flex-col items-center justify-center mb-8 gap-6">
          <div className="flex items-center p-1.5 bg-muted/50 rounded-full border border-border/50 backdrop-blur-sm">
            <Button
              variant={activeTab === 'ai' ? 'secondary' : 'ghost'}
              onClick={() => setActiveTab('ai')}
              className={cn("rounded-full px-6 gap-2 transition-all", activeTab === 'ai' && "bg-background shadow-sm")}
            >
              <LayoutDashboard className="h-4 w-4" />
              Daily News (AI)
            </Button>
            <Button
              variant={activeTab === 'youtube' ? 'secondary' : 'ghost'}
              onClick={() => setActiveTab('youtube')}
              className={cn("rounded-full px-6 gap-2 transition-all", activeTab === 'youtube' && "bg-background shadow-sm")}
            >
              <Youtube className="h-4 w-4" />
              YouTube
            </Button>
          </div>
        </div>

        {/* Header & Stats */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Globe className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-balance font-sans text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {activeTab === 'ai' ? 'Daily News' : 'YouTube Insights'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 rounded-lg border border-border bg-card/50 px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-muted-foreground">Live</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <span className="text-sm text-muted-foreground">
                {news.length} items
              </span>
            </div>
            <Button onClick={fetchNews} disabled={loading} variant="outline" size="icon" className="bg-transparent">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && news.length === 0 && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading content...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="border-destructive/50 bg-destructive/10 p-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="font-semibold text-destructive">Error loading content</p>
              <p className="text-sm text-destructive/80">{error}</p>
              <Button onClick={fetchNews} variant="outline" size="sm" className="mt-2 bg-transparent">
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Daily Briefing - Only for AI Tab */}
        {activeTab === 'ai' && !loading && !error && dailyBriefing && (
          <DailyBriefing
            data={dailyBriefing}
            onTopicClick={handleTopicClick}
            selectedTopic={selectedTopic}
          />
        )}

        {/* Content Grid */}
        {!loading && !error && news.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news
                .filter(item => !selectedTopic || (item.keyTopics && item.keyTopics.includes(selectedTopic)))
                .slice(0, visibleCount).map((item, index) => (
                  item.videoId ? (
                    <YouTubeCard
                      key={item.id || index}
                      title={item.translatedTitle}
                      publishedAt={item.pubDate}
                      summary={item.summary}
                      videoId={item.videoId}
                      onClick={() => handleCardClick(item)}
                    />
                  ) : (
                    <Card
                      key={item.id || index}
                      className="group relative overflow-hidden border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer flex flex-col h-full"
                      onClick={() => handleCardClick(item)}
                    >
                      <div className="flex flex-col flex-1 p-6">
                        {/* Date Badge */}
                        <div className="mb-4 flex items-center gap-2">
                          <span className="rounded-md bg-muted px-2.5 py-1 font-mono text-xs font-medium text-muted-foreground">
                            {formatDate(item.pubDate)}
                          </span>
                          {item.category && (
                            <span className="rounded-md bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                              {item.category}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <div className="flex items-start gap-3 mb-4">
                          {item.rank && (
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                              {item.rank}
                            </span>
                          )}
                          <h3 className="text-balance font-sans text-xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-3">
                            {item.translatedTitle}
                          </h3>
                        </div>

                        {/* Summary */}
                        {item.summary && (
                          <p className="mb-5 text-[15px] text-muted-foreground/90 line-clamp-3 leading-relaxed flex-1">
                            {item.summary}
                          </p>
                        )}

                        {/* Insight Section */}
                        {item.insight && (
                          <div className="mb-5 rounded-lg bg-muted/30 p-4 border border-border/50">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              <span className="font-semibold text-primary mr-2">💡 Insight:</span>
                              {item.insight}
                            </p>
                          </div>
                        )}

                        {/* Keywords */}
                        {item.keywords && item.keywords.length > 0 && (
                          <div className="mt-auto flex flex-wrap gap-2 justify-center">
                            {item.keywords.map((keyword, i) => {
                              const style = getKeywordStyle(keyword);
                              return (
                                <span
                                  key={i}
                                  className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors"
                                  style={{
                                    backgroundColor: style.bg,
                                    color: style.text,
                                    border: `1px solid ${style.border}`
                                  }}
                                >
                                  #{keyword}
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* Hover Effect Border */}
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity group-hover:opacity-100" />
                    </Card>
                  )
                ))}
            </div>

            {/* Infinite Scroll Loader */}
            {visibleCount < news.length && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && news.length === 0 && (
          <Card className="border-dashed p-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <Globe className="h-12 w-12 text-muted-foreground/50" />
              <p className="font-semibold text-foreground">No content found</p>
              <p className="text-sm text-muted-foreground">Check back later for updates</p>
            </div>
          </Card>
        )}

        {/* Modals */}
        <SummaryModal
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
          articleUrl={selectedArticle}
        />

        {selectedVideo && (
          <YouTubeModal
            isOpen={isYouTubeModalOpen}
            onClose={() => setIsYouTubeModalOpen(false)}
            videoUrl={selectedVideo.link}
            videoId={selectedVideo.videoId}
            title={selectedVideo.translatedTitle}
            summary={selectedVideo.summary || null}
            segments={selectedVideo.segments}
            insight={selectedVideo.insight}
            keywords={selectedVideo.keywords}
          />
        )}

        {/* Scroll to Top Button */}
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={cn(
            "fixed bottom-8 right-8 rounded-full h-12 w-12 shadow-lg z-50 transition-all duration-300 hover:scale-110",
            showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
          )}
          size="icon"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
