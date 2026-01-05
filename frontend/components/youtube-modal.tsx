"use client"

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Youtube, PlayCircle, Quote, Lightbulb } from "lucide-react"
import YouTube, { YouTubeEvent } from 'react-youtube'
import { useRef, useState, useEffect } from "react"
import { YouTubeSummary, YouTubeSegment } from "@/types/youtube"

interface YouTubeModalProps {
    isOpen: boolean
    onClose: () => void
    videoUrl: string | null
    videoId?: string | null // Add explicit videoId prop
    title: string
    summary: string | null
    // We accept both the full structured object or legacy props. 
    // Ideally, the parent should pass the full object if available.
    // For now, we'll try to parse `segments` if it's passed, or use the `data` prop if we decide to refactor the parent.
    // Based on the current usage, let's stick to the existing props but expand `segments` handling.
    segments?: any
    insight?: string
    keywords?: string[]
}

export function YouTubeModal({ isOpen, onClose, videoUrl, videoId: propVideoId, title, summary, segments, insight, keywords }: YouTubeModalProps) {
    const playerRef = useRef<any>(null)
    const [videoId, setVideoId] = useState<string | null>(null)

    useEffect(() => {
        // Priority 1: Explicit videoId prop
        if (propVideoId) {
            setVideoId(propVideoId)
            return
        }

        // Priority 2: Extract from videoUrl
        if (videoUrl) {
            try {
                // Simple extraction for standard youtube URLs
                const url = new URL(videoUrl)
                const v = url.searchParams.get("v")
                if (v) {
                    setVideoId(v)
                }
                // Handle youtu.be short links if necessary
                else if (url.hostname === 'youtu.be') {
                    setVideoId(url.pathname.slice(1))
                }
                // Handle embed links
                else if (url.pathname.startsWith('/embed/')) {
                    setVideoId(url.pathname.split('/')[2])
                }
            } catch (e) {
                console.error("Error parsing video URL:", e)
            }
        }
    }, [videoUrl, propVideoId])

    const onPlayerReady = (event: YouTubeEvent) => {
        playerRef.current = event.target
    }

    const seekTo = (seconds: number) => {
        if (playerRef.current) {
            playerRef.current.seekTo(seconds, true)
            playerRef.current.playVideo()
        }
    }

    // Parse segments if they are passed as a string (JSON) or use directly if array
    const parsedSegments: YouTubeSegment[] = Array.isArray(segments)
        ? segments
        : (typeof segments === 'string' ? JSON.parse(segments) : [])

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-4xl p-0 overflow-hidden gap-0 border-0 shadow-2xl bg-background/95 backdrop-blur-md h-[90vh] flex flex-col">

                {/* Header / Video Section */}
                <div className="w-full bg-black aspect-video relative shrink-0">
                    {videoId ? (
                        <YouTube
                            key={videoId} // Force remount when videoId changes
                            videoId={videoId}
                            className="w-full h-full"
                            iframeClassName="w-full h-full"
                            onReady={onPlayerReady}
                            opts={{
                                host: 'https://www.youtube.com',
                                playerVars: {
                                    autoplay: 1,
                                    origin: typeof window !== 'undefined' ? window.location.origin : undefined,
                                    rel: 0, // Don't show related videos
                                    modestbranding: 1, // Minimal YouTube branding
                                },
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                            <p className="text-muted-foreground">Video not available</p>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-6 pb-2 border-b shrink-0">
                        <DialogTitle className="text-xl font-bold leading-tight line-clamp-2 mb-2">
                            {title}
                        </DialogTitle>

                        {/* Keywords */}
                        {keywords && keywords.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {keywords.map((keyword, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                                        #{keyword}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 pt-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                        <div className="space-y-8 max-w-3xl mx-auto">

                            {/* Insight Section */}
                            {insight && (
                                <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                                    <div className="flex items-center gap-2 mb-3 text-primary font-semibold">
                                        <Lightbulb className="w-5 h-5" />
                                        <h3>Key Insight</h3>
                                    </div>
                                    <p className="text-sm leading-relaxed text-foreground/90">
                                        {insight}
                                    </p>
                                </div>
                            )}

                            {/* Summary Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-3 text-muted-foreground font-semibold text-sm uppercase tracking-wider">
                                    <Quote className="w-4 h-4" />
                                    <h3>Summary</h3>
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                                    {summary || "No summary available."}
                                </p>
                            </div>

                            {/* Segments Section */}
                            {parsedSegments.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4 text-muted-foreground font-semibold text-sm uppercase tracking-wider">
                                        <PlayCircle className="w-4 h-4" />
                                        <h3>Video Segments</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {parsedSegments.map((segment, idx) => (
                                            <div
                                                key={idx}
                                                className="group relative pl-6 pb-2 border-l-2 border-muted hover:border-primary transition-colors cursor-pointer"
                                                onClick={() => seekTo(segment.start_time)}
                                            >
                                                {/* Timeline dot */}
                                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-muted group-hover:border-primary transition-colors" />

                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                            {segment.title}
                                                        </h4>
                                                        <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                            {new Date(segment.start_time * 1000).toISOString().substr(11, 8)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 group-hover:line-clamp-none transition-all">
                                                        {segment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t bg-muted/20 flex justify-end gap-2 shrink-0">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        {videoUrl && (
                            <Button
                                className="gap-2"
                                onClick={() => window.open(videoUrl, '_blank')}
                            >
                                Watch on YouTube <ExternalLink className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
