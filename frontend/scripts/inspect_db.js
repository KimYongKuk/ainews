const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function main() {
    try {
        // Load env vars manually
        const envPath = path.join(__dirname, '../.env.local');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            envConfig.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    process.env[key.trim()] = value.trim();
                }
            });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase credentials');
            return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log('--- Checking daily_ai_news ---');
        const { data: newsData, error: newsError } = await supabase
            .from('daily_ai_news')
            .select('*')
            .limit(1);

        if (newsError) {
            console.error('Error fetching daily_ai_news:', newsError);
        } else if (newsData.length > 0) {
            console.log('Columns in daily_ai_news:', Object.keys(newsData[0]));
        } else {
            console.log('daily_ai_news table is empty, cannot infer columns.');
        }

        console.log('--- Checking categories in daily_ai_news ---');
        const { data: categoriesData, error: catError } = await supabase
            .from('daily_ai_news')
            .select('category, video_id')
            .limit(50);

        if (catError) {
            console.error('Error fetching categories:', catError);
        } else {
            const categories = [...new Set(categoriesData.map(item => item.category))];
            console.log('Distinct categories found (in first 50):', categories);

            const hasVideoId = categoriesData.filter(item => item.video_id).length;
            console.log(`Items with video_id (in first 50): ${hasVideoId}`);
        }

    } catch (err) {
        console.error('Script error:', err);
    }
}

main();
