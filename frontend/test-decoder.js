
const url = "https://news.google.com/rss/articles/CBMiakFVX3lxTE5tR0JWMTBFQkJ4NGlCa0FETTZMR0wyTHNFd3NpTUhjc19Xb0ItSGVxNm1IR2dsd1ZCYlZXTktOUDZzQ0g0akVuODNjTkZlcGhodThoLUJlc3poUnF2Vnh6LUkydWF5WTJQVlE?oc=5&hl=ko&gl=KR&ceid=KR:ko";
const base64Part = url.split('/articles/')[1]?.split('?')[0];

console.log("Base64 Part:", base64Part);

// Test 1: Standard Base64 decoding
const bufferStandard = Buffer.from(base64Part, 'base64');
console.log("\n[Standard Base64] Decoded Length:", bufferStandard.length);
console.log("[Standard Base64] Content:", bufferStandard.toString('latin1'));

// Test 2: URL-Safe Base64 replacement
const base64Standardized = base64Part.replace(/-/g, '+').replace(/_/g, '/');
console.log("\n[Standardized] String:", base64Standardized);
const bufferFixed = Buffer.from(base64Standardized, 'base64');
console.log("[Standardized] Decoded Length:", bufferFixed.length);
const decodedString = bufferFixed.toString('latin1');
console.log("[Standardized] Content:", decodedString);

// Try to find URL
const match = decodedString.match(/(https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]+)/);
console.log("\n[Match Result]:", match ? match[0] : "No match");
