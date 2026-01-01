
const url = "https://news.google.com/rss/articles/CBMiakFVX3lxTE5tR0JWMTBFQkJ4NGlCa0FETTZMR0wyTHNFd3NpTUhjc19Xb0ItSGVxNm1IR2dsd1ZCYlZXTktOUDZzQ0g0akVuODNjTkZlcGhodThoLUJlc3poUnF2Vnh6LUkydWF5WTJQVlE?oc=5&hl=ko&gl=KR&ceid=KR:ko";
const base64Part = url.split('/articles/')[1]?.split('?')[0];
const base64Standardized = base64Part.replace(/-/g, '+').replace(/_/g, '/');
const buffer = Buffer.from(base64Standardized, 'base64');

console.log("Full Decoded Hex:");
console.log(buffer.toString('hex'));

console.log("\nDecoded ASCII Chars (printable only):");
const printable = buffer.toString('latin1').replace(/[^\x20-\x7E]/g, '.');
console.log(printable);

// Search for known domains
if (printable.includes('khanews')) {
    console.log("Found 'khanews' text!");
}
