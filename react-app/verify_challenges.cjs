const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] });
    const page = await browser.newPage();

    try {
        console.log('Navigating to login...');
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

        console.log('Logging in...');
        await page.type('input[type="email"]', 'sydneylockman13@gmail.com');
        await page.type('input[type="password"]', '123456');

        // Wait for button and click
        await page.waitForSelector('button[type="submit"]');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('button[type="submit"]'),
        ]);

        console.log('Navigating to Challenges...');
        await page.goto('http://localhost:5173/challenges', { waitUntil: 'networkidle0' });

        console.log('Looking for challenge buttons...');
        // Wait for at least one button to verify page load
        await page.waitForSelector('button');

        // Find a "Completed" button that is not disabled
        const buttons = await page.$$('button');
        let targetBtn = null;

        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            const disabled = await page.evaluate(el => el.disabled, btn);
            if (text.includes('Completed') && !disabled) {
                targetBtn = btn;
                break;
            }
        }

        if (targetBtn) {
            console.log('Found "Completed" button, clicking...');
            await targetBtn.click();

            // Check for Modal
            try {
                console.log('Waiting for modal...');
                await page.waitForSelector('h3', { timeout: 5000 });

                const modalTitle = await page.evaluate(() => {
                    const h3 = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('SUBMIT RESPONSE'));
                    return h3 ? h3.textContent : null;
                });

                if (modalTitle) {
                    console.log('SUCCESS: Modal appeared with title:', modalTitle);

                    // Click Confirm
                    const confirmBtn = await page.evaluateHandle(() => {
                        return Array.from(document.querySelectorAll('button'))
                            .find(b => b.textContent.includes('Confirm Submission'));
                    });

                    if (confirmBtn) {
                        console.log('Found Confirm button, clicking...');
                        await confirmBtn.click();

                        // Wait for logs or UI update
                        // Wait for logs or UI update
                        await new Promise(r => setTimeout(r, 2000));
                        console.log('Clicked confirm, checking for success...');
                    } else {
                        console.error('ERROR: Confirm button not found in modal.');
                    }

                } else {
                    console.error('ERROR: Modal title not found.');
                }

            } catch (e) {
                console.error('ERROR: Modal did not appear within timeout.', e);
            }
        } else {
            console.warn('No active "Completed" button found. All challenges might be completed.');
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        // await browser.close();
    }
})();
