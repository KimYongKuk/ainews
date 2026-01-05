
"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, Sparkles, FileText } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface SummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    articleUrl: string | null;
}

export function SummaryModal({ isOpen, onClose, articleUrl }: SummaryModalProps) {
    const [heroImage, setHeroImage] = useState<string | null>(null);
    const [title, setTitle] = useState<string>("");
    const [summary, setSummary] = useState<string>("");
    const [isLoadingState, setIsLoadingState] = useState(false);
    const [errorState, setErrorState] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const handleStream = async (url: string, signal: AbortSignal) => {
        setIsLoadingState(true);
        setErrorState(null);
        setSummary("");
        setHeroImage(null);
        setTitle("");

        try {
            console.log("📤 Fetching summary for:", url);

            const response = await fetch("/api/summarize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
                signal,
            });

            console.log("📥 Response received:", response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ API Error:", errorText);

                // Try to parse error message from JSON
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.error || `API request failed: ${response.status}`);
                } catch (parseErr) {
                    // If not JSON, use the raw text or generic message
                    throw new Error(errorText || `API request failed: ${response.status}`);
                }
            }

            if (!response.body) {
                throw new Error("No response body");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let metadataParsed = false;

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    console.log("✅ Stream completed");
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                // Parse metadata from first chunk if not yet parsed
                if (!metadataParsed && buffer.includes('\n\n')) {
                    const parts = buffer.split('\n\n');
                    const firstPart = parts[0];

                    try {
                        const metadata = JSON.parse(firstPart);
                        if (metadata.type === 'metadata') {
                            console.log("📦 Metadata received:", metadata);
                            setHeroImage(metadata.image || null);
                            setTitle(metadata.title || "");
                            metadataParsed = true;
                            // Remove metadata from buffer
                            buffer = parts.slice(1).join('\n\n');
                            continue;
                        }
                    } catch (e) {
                        // Not JSON metadata, continue as normal text
                        console.log("⚠️ First chunk is not metadata, treating as content");
                        metadataParsed = true;
                    }
                }

                // Add to summary if metadata already parsed
                if (metadataParsed) {
                    setSummary(prev => prev + buffer);
                    buffer = "";
                }
            }

            // Add any remaining buffer
            if (buffer) {
                setSummary(prev => prev + buffer);
            }

        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('✋ Stream aborted');
                return;
            }
            console.error("❌ Stream error:", err);
            setErrorState(err.message || "Failed to load summary");
        } finally {
            // Only turn off loading if not aborted (or if we want to ensure it's off)
            // If aborted, the component might be unmounting or switching, so state updates might be ignored or fine.
            // But checking signal.aborted is safer if we want to avoid state updates on unmounted component.
            if (!signal.aborted) {
                setIsLoadingState(false);
            }
        }
    };

    useEffect(() => {
        if (isOpen && articleUrl) {
            // Abort previous request if any
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create new controller
            const controller = new AbortController();
            abortControllerRef.current = controller;

            console.log("🚀 Modal opened with URL:", articleUrl);
            handleStream(articleUrl, controller.signal);
        }

        return () => {
            // Abort on cleanup (close or unmount or dep change)
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
        };
    }, [isOpen, articleUrl]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden gap-0 border-0 shadow-2xl bg-background/95 backdrop-blur-md">

                {/* Hero Section */}
                <div className="relative h-48 w-full bg-muted/50 overflow-hidden group">
                    {heroImage ? (
                        <img
                            src={heroImage}
                            alt="Article Hero"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                            {isLoadingState ? (
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            ) : (
                                <FileText className="h-12 w-12 text-muted-foreground/30" />
                            )}
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                    {/* Floating Title (if available) or Badge */}
                    <div className="absolute bottom-4 left-6 right-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-1 shadow-lg backdrop-blur-sm">
                                <Sparkles className="w-3 h-3" />
                                AI Summary
                            </span>
                        </div>
                        {title && (
                            <h2 className="text-xl font-bold leading-tight line-clamp-2 text-foreground/90 drop-shadow-sm">
                                {title}
                            </h2>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 pt-2">

                    <DialogTitle className="sr-only">Article Summary</DialogTitle>
                    <DialogDescription className="sr-only">AI generated summary of the article</DialogDescription>

                    <ScrollArea className="h-[40vh] pr-4 -mr-4">
                        <div className="space-y-4 text-base leading-relaxed text-muted-foreground/90 font-medium">
                            {errorState && (
                                <div className="p-4 rounded-md bg-destructive/10 text-destructive mb-4">
                                    <p className="font-semibold">Unable to generate summary</p>
                                    <p className="text-sm opacity-90">{errorState || "Please check the console for details."}</p>
                                </div>
                            )}

                            {isLoadingState && !summary && (
                                <div className="flex flex-col gap-2 animate-pulse">
                                    <div className="h-4 bg-muted rounded w-3/4"></div>
                                    <div className="h-4 bg-muted rounded w-full"></div>
                                    <div className="h-4 bg-muted rounded w-5/6"></div>
                                    <div className="h-4 bg-muted rounded w-2/3 mt-4"></div>
                                </div>
                            )}

                            {summary ? (
                                <div className="whitespace-pre-wrap animate-in fade-in duration-500">
                                    {summary}
                                </div>
                            ) : null}

                            {isLoadingState && summary && (
                                <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-1 align-middle" />
                            )}
                        </div>
                    </ScrollArea>

                    {/* Footer Actions */}
                    <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        {articleUrl && (
                            <Button
                                className="gap-2"
                                onClick={() => window.open(articleUrl, '_blank')}
                            >
                                Read Original <ExternalLink className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
