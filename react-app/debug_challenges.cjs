const puppeteer = require('puppeteer');

(async () => {
    try {
        console.log('Launching browser...');
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Capture logs
        page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
        page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
        page.on('requestfailed', request => {
            console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
        });

        console.log('Navigating to login...');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

        console.log('Logging in...');
        await page.type('input[type="email"]', 'sydneylockman13@gmail.com');
        await page.type('input[type="password"]', '123456');

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('button[type="submit"]'),
        ]);

        console.log('Navigating to Challenges...');
        await page.goto('http://localhost:5173/challenges', { waitUntil: 'networkidle0' });

        console.log('Waiting for potential crash...');
        await new Promise(r => setTimeout(r, 5000));

        // Take a screenshot if possible? (Puppeteer can save to disk, I can't see it immediately but I can check file existence)
        // But logs should be enough.

        await browser.close();
    } catch (error) {
        console.error('Debug script failed:', error);
    }
})();
