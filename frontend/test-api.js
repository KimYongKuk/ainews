// using native fetch

async function testApi() {
    try {
        if (false) { // Skip the API check for now
            const response = await fetch('http://localhost:3000/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: 'https://www.example.com' })
            });
        }

        console.log("Fetching Google URL directly...");
        const googleRes = await fetch('https://news.google.com/rss/articles/CBMiakFVX3lxTE5tR0JWMTBFQkJ4NGlCa0FETTZMR0wyTHNFd3NpTUhjc19Xb0ItSGVxNm1IR2dsd1ZCYlZXTktOUDZzQ0g0akVuODNjTkZlcGhodThoLUJlc3poUnF2Vnh6LUkydWF5WTJQVlE?oc=5&hl=ko&gl=KR&ceid=KR:ko', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            }
        });
        const html = await googleRes.text();
        console.log('Google Raw HTML Snippet:', html.substring(0, 500));

        if (html.includes('khanews.com')) {
            console.log('✅ Found khanews.com in HTML!');
        } else {
            console.log('❌ Target URL NOT found in plain HTML.');
        }

    } catch (err) {
        console.error('Test failed:', err);
    }
}

testApi();
