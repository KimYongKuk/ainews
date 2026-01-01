
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import * as cheerio from 'cheerio';
import { z } from 'zod';

export const maxDuration = 60; // Allow longer timeout for scraping

export async function POST(req: Request) {
    try {
        const { url } = await req.json();
        console.log("🔍 Summarizing URL:", url);

        if (!url) {
            return new Response('URL is required', { status: 400 });
        }

        // Handle Google News Redirects (Base64 decoding)
        let targetUrl = url;
        if (url.includes('news.google.com/rss/articles/')) {
            try {
                const base64Part = url.split('/articles/')[1]?.split('?')[0];
                if (base64Part) {
                    const decodedBuffer = Buffer.from(base64Part, 'base64');
                    // Google's format often includes the URL in plain ASCII mixed with binary
                    // We regex search for the http(s) link.
                    const decodedString = decodedBuffer.toString('latin1');
                    const urlMatch = decodedString.match(/(https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]+)/);

                    if (urlMatch) {
                        targetUrl = urlMatch[0];
                        console.log("🔓 Decoded Google News URL:", targetUrl);
                    }
                }
            } catch (e) {
                console.error("Failed to decode Google URL:", e);
            }
        }

        // 1. Fetch and Scrape
        console.log("📡 Fetching article:", targetUrl);
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
                'Referer': new URL(targetUrl).origin,
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive'
            },
        });

        console.log(`📄 Response status: ${response.status} ${response.statusText}`);
        console.log(`📄 Content-Type: ${response.headers.get('content-type')}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        console.log(`📄 HTML length: ${html.length} characters`);

        const $ = cheerio.load(html);

        // Extract Metadata with multiple fallbacks
        const title = $('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content') ||
            $('h1').first().text() ||
            $('title').text() ||
            'No Title';

        const image = $('meta[property="og:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content') ||
            $('article img').first().attr('src') ||
            $('img').first().attr('src') ||
            '';

        console.log(`📰 Title: ${title}`);
        console.log(`🖼️  Image: ${image}`);

        // Extract Body Text with improved strategy
        // Remove unwanted elements
        $('script, style, nav, footer, iframe, .ad, .advertisement, header, aside, .sidebar').remove();

        // Try multiple content extraction strategies
        let articleText = '';

        // Strategy 1: Look for article tag
        const articleContent = $('article');
        if (articleContent.length > 0) {
            console.log("✅ Found <article> tag");
            articleContent.find('p').each((_i, el) => {
                const text = $(el).text().trim();
                if (text.length > 50) {
                    articleText += text + '\n\n';
                }
            });
        }

        // Strategy 2: Look for main content area (including common Korean news site selectors)
        if (!articleText) {
            console.log("⚠️ No article tag, trying main content selectors");
            const mainContent = $('main, .content, .post-content, .article-content, .entry-content, [role="main"], #article-view-content-div, .article-body, .news_body, .article_view');
            mainContent.find('p').each((_i, el) => {
                const text = $(el).text().trim();
                if (text.length > 50) {
                    articleText += text + '\n\n';
                }
            });

            // If no paragraphs found in main content, try getting all text from main content
            if (!articleText && mainContent.length > 0) {
                console.log("⚠️ No <p> tags in main content, extracting all text");
                const mainText = mainContent.first().text()
                    .replace(/\s+/g, ' ')
                    .trim();
                if (mainText.length > 100) {
                    articleText = mainText;
                }
            }
        }

        // Strategy 3: Get all paragraphs as fallback
        if (!articleText) {
            console.log("⚠️ No main content found, using all paragraphs");
            $('p').each((_i, el) => {
                const text = $(el).text().trim();
                if (text.length > 50) {
                    articleText += text + '\n\n';
                }
            });
        }

        // Truncate to avoid token limits
        articleText = articleText.substring(0, 15000);
        console.log(`📝 Extracted text length: ${articleText.length} characters`);

        if (articleText.length > 0) {
            console.log(`📝 First 200 chars: ${articleText.substring(0, Math.min(200, articleText.length))}...`);
        }

        // If still no content, try extracting ALL text as last resort
        if (!articleText || articleText.length < 50) {
            console.log("⚠️ Very little content extracted, trying aggressive extraction...");

            // Get all text content from body
            const bodyText = $('body').text()
                .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                .trim();

            if (bodyText.length > 200) {
                articleText = bodyText.substring(0, 15000);
                console.log(`📝 Aggressive extraction got ${articleText.length} characters`);
            }
        }

        if (!articleText || articleText.length < 50) {
            console.error("❌ Could not extract sufficient content");
            console.log(`📄 HTML preview: ${html.substring(0, 500)}`);

            // Instead of error, send a "no content" message through the stream
            const noContentMessage = title !== 'No Title'
                ? `이 기사("${title}")는 본문 내용이 부족하여 요약할 수 없습니다.\n\n원본 링크에서 전체 내용을 확인해주세요.`
                : '이 기사는 본문 내용이 부족하여 요약할 수 없습니다.\n\n원본 링크에서 전체 내용을 확인해주세요.';

            const encoder = new TextEncoder();
            const noContentStream = new ReadableStream({
                start(controller) {
                    // Send metadata
                    const metadata = JSON.stringify({
                        type: 'metadata',
                        image,
                        title
                    }) + '\n\n';
                    controller.enqueue(encoder.encode(metadata));

                    // Send no-content message
                    controller.enqueue(encoder.encode(noContentMessage));
                    controller.close();
                }
            });

            return new Response(noContentStream, {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Cache-Control': 'no-cache',
                }
            });
        }

        console.log("🤖 Starting AI summary generation...");

        // 2. Generate Summary Stream
        const result = streamText({
            model: openai('gpt-4o'),
            system: `You are a professional news editor.
      Summarize the key points of the following news article in Korean.
      - Keep it within 3-5 concise bullets or paragraphs.
      - Use a professional, neutral tone.
      - Focus on facts and conclusions.
      - Start directly with the summary, no intro.`,
            prompt: `Title: ${title}\n\nContent:\n${articleText}`,
            onFinish: ({ usage }) => {
                console.log('✅ Summary generation completed. Token usage:', usage);
            },
        });

        // Create custom stream that sends metadata first, then AI response
        const encoder = new TextEncoder();

        // Get the original stream
        const aiStream = result.toTextStreamResponse();
        const reader = aiStream.body?.getReader();

        if (!reader) {
            throw new Error('Failed to create stream reader');
        }

        const customStream = new ReadableStream({
            async start(controller) {
                // Send metadata as the first chunk (special format for parsing)
                const metadata = JSON.stringify({
                    type: 'metadata',
                    image,
                    title
                }) + '\n\n';
                controller.enqueue(encoder.encode(metadata));
                console.log("📤 Sent metadata:", { image, title });

                // Then pipe the AI response
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        controller.enqueue(value);
                    }
                } catch (error) {
                    console.error('Stream error:', error);
                    controller.error(error);
                } finally {
                    controller.close();
                    reader.releaseLock();
                }
            }
        });

        return new Response(customStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });

    } catch (error: any) {
        console.error('Error in summarize API:', error);
        return new Response(JSON.stringify({ error: 'Failed to summarize article', details: error.message }), { status: 500 });
    }
}
