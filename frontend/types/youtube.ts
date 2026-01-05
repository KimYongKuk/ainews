export interface YouTubeSegment {
    start_time: number;
    title: string;
    content: string;
}

export interface YouTubeSummary {
    title: string;
    summary: string;
    insight: string;
    keywords: string[];
    segments: YouTubeSegment[];
}
