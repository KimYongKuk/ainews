
const url = "https://news.google.com/rss/articles/CBMiakFVX3lxTE5tR0JWMTBFQkJ4NGlCa0FETTZMR0wyTHNFd3NpTUhjc19Xb0ItSGVxNm1IR2dsd1ZCYlZXTktOUDZzQ0g0akVuODNjTkZlcGhodThoLUJlc3poUnF2Vnh6LUkydWF5WTJQVlE?oc=5&hl=ko&gl=KR&ceid=KR:ko";

const agents = {
    "Chrome": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Googlebot": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Lynx": "Lynx/2.8.9rel.1 libwww-FM/2.14 SSL-MM/1.4.1 GNUTLS/3.6.12",
    "Curl": "curl/7.64.1"
};

async function runTests() {
    for (const [name, ua] of Object.entries(agents)) {
        console.log(`\n--- Testing ${name} ---`);
        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': ua,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                },
                redirect: 'follow'
            });
            const text = await res.text();
            console.log(`Status: ${res.status}`);
            console.log(`Length: ${text.length}`);

            if (text.includes('khanews.com')) {
                console.log("✅ SUCCESS! Found 'khanews.com' in body!");
                // Try to find context
                const idx = text.indexOf('khanews.com');
                console.log("Context:", text.substring(idx - 100, idx + 100));
            } else {
                console.log("❌ Failed. Text length:", text.length);
            }
        } catch (e) {
            console.log("Error:", e.message);
        }
    }
}

runTests();
