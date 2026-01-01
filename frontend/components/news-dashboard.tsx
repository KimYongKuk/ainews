"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Loader2, Globe, ExternalLink, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { SummaryModal } from "./summary-modal"

interface NewsItem {
  rank?: number
  translatedTitle: string
  summary?: string
  insight?: string
  keywords?: string[]
  link: string
  pubDate: string
}

export function NewsDashboard() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = async () => {
    setLoading(true)
    setError(null)
    try {
      if (typeof window !== 'undefined') {
        console.log("Checking Supabase Connection...");
        console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Loaded" : "Missing (Using Placeholder)");
      }

      const { data, error } = await supabase
        .from('daily_ai_news')
        .select('*')
        .order('published_date', { ascending: false })

      if (error) {
        console.error("Supabase Error Details:", error);
        throw error
      }

      console.log("Raw News Data from Supabase:", data)

      const processedData = Array.isArray(data) ? data.map((item: any) => ({
        translatedTitle: item.title || "No Title",
        summary: item.summary || "",
        insight: item.insight || "",
        keywords: Array.isArray(item.keywords) ? item.keywords : [],
        link: item.original_link || "#",
        pubDate: item.published_date || item.created_at || new Date().toISOString(),
      })) : []

      setNews(processedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load news")
      console.error("Error fetching news:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch {
      return dateString
    }
  }

  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCardClick = (link: string) => {
    setSelectedArticle(link)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background dark">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Globe className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-balance font-sans text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Daily AI
            </h1>
          </div>
          <Button onClick={fetchNews} disabled={loading} variant="outline" size="sm" className="gap-2 bg-transparent">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="mb-6 flex items-center gap-4 rounded-lg border border-border bg-card/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">Live Updates</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm text-muted-foreground">
            {news.length} {news.length === 1 ? "article" : "articles"}
          </span>
        </div>

        {/* Loading State */}
        {loading && news.length === 0 && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading news...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="border-destructive/50 bg-destructive/10 p-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="font-semibold text-destructive">Error loading news</p>
              <p className="text-sm text-destructive/80">{error}</p>
              <Button onClick={fetchNews} variant="outline" size="sm" className="mt-2 bg-transparent">
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* News Grid */}
        {!loading && !error && news.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
                onClick={() => handleCardClick(item.link)}
              >
                <div className="block p-6">
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
                    <p className="mb-4 text-sm text-foreground/70 line-clamp-3 leading-relaxed">
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-accent transition-colors">
                    <span>Quick Summary</span>
                    <Sparkles className="h-4 w-4 transition-transform group-hover:scale-110" />
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity group-hover:opacity-100" />
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && news.length === 0 && (
          <Card className="border-dashed p-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <Globe className="h-12 w-12 text-muted-foreground/50" />
              <p className="font-semibold text-foreground">No news articles found</p>
              <p className="text-sm text-muted-foreground">Check back later for updates</p>
            </div>
          </Card>
        )}

        {/* Summary Modal */}
        <SummaryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          articleUrl={selectedArticle}
        />
      </div>
    </div>
  )
}
