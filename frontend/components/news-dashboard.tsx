"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Loader2, Globe, RefreshCw, Sparkles, LayoutDashboard, Newspaper, Youtube, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { SummaryModal } from "./summary-modal"
import { YouTubeCard } from "./youtube-card"
import { YouTubeModal } from "./youtube-modal"
import { cn } from "@/lib/utils"

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
}

export function NewsDashboard() {
  const [activeTab, setActiveTab] = useState<"ai" | "it" | "youtube">("ai")
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)

  const [selectedVideo, setSelectedVideo] = useState<NewsItem | null>(null)
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false)

  const fetchNews = async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('daily_ai_news')
        .select('*')
        .order('published_date', { ascending: false })

      // Apply filters based on activeTab
      if (activeTab === 'ai') {
        query = query.or('category.is.null,category.eq.AI')
      } else if (activeTab === 'it') {
        query = query.eq('category', 'IT')
      } else if (activeTab === 'youtube') {
        query = query.not('video_id', 'is', null)
      }

      const { data, error } = await query

      if (error) {
        console.error("Supabase Error Details:", error);
        throw error
      }

      console.log(`Fetched ${data?.length} items for tab: ${activeTab}`, data)

      const processedData = Array.isArray(data) ? data.map((item: any) => ({
        id: item.id,
        translatedTitle: item.title || "No Title",
        summary: item.summary || "",
        insight: item.insight || "",
        keywords: Array.isArray(item.keywords) ? item.keywords : [],
        link: item.original_link || "#",
        pubDate: item.published_date || item.created_at || new Date().toISOString(),
        category: item.category,
        videoId: item.video_id,
        segments: item.segments
      })) : []

      setNews(processedData)
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
    if (activeTab === 'youtube') {
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
              AI News
            </Button>
            <Button
              variant={activeTab === 'it' ? 'secondary' : 'ghost'}
              onClick={() => setActiveTab('it')}
              className={cn("rounded-full px-6 gap-2 transition-all", activeTab === 'it' && "bg-background shadow-sm")}
            >
              <Newspaper className="h-4 w-4" />
              IT News
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
              {activeTab === 'ai' ? 'Daily AI News' : activeTab === 'it' ? 'IT Industry News' : 'YouTube Insights'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Demo Button */}
            <Button onClick={handleDemoClick} variant="secondary" className="gap-2">
              <Play className="h-4 w-4" />
              Test Demo
            </Button>

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

        {/* Content Grid */}
        {!loading && !error && news.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item, index) => (
              activeTab === 'youtube' ? (
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
                  className="group relative overflow-hidden border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer flex flex-col"
                  onClick={() => handleCardClick(item)}
                >
                  <div className="flex flex-col flex-1 p-6">
                    {/* Date Badge */}
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                        {formatDate(item.pubDate)}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="flex items-start gap-2 mb-3">
                      {item.rank && (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/20 text-[12px] font-bold text-primary">
                          {item.rank}
                        </span>
                      )}
                      <h3 className="text-balance font-sans text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {item.translatedTitle}
                      </h3>
                    </div>

                    {/* Summary */}
                    {item.summary && (
                      <p className="mb-4 text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                        {item.summary}
                      </p>
                    )}

                    {/* Insight Section */}
                    {item.insight && (
                      <div className="mb-4 rounded-md bg-muted/50 p-3 italic">
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          <span className="font-bold not-italic text-primary mr-1">Insight:</span>
                          {item.insight}
                        </p>
                      </div>
                    )}

                    {/* Keywords */}
                    {item.keywords && item.keywords.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-1.5">
                        {item.keywords.map((keyword, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                          >
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Link Indicator */}
                    <div className="mt-auto flex items-center gap-2 text-sm text-muted-foreground group-hover:text-accent transition-colors">
                      <span>Quick Summary</span>
                      <Sparkles className="h-4 w-4 transition-transform group-hover:scale-110" />
                    </div>
                  </div>

                  {/* Hover Effect Border */}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity group-hover:opacity-100" />
                </Card>
              )
            ))}
          </div>
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
      </div>
    </div>
  )
}
