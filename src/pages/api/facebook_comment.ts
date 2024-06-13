import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer, { Page } from 'puppeteer';

function extractMbasicUrl(postUrl: string): string | null {
  // Check if the post URL is valid and extract the post ID
  const match = postUrl.match(/facebook\.com\/(?:.*\/)?(?:photo\.php\?fbid=|photo\/\?fbid=|permalink\.php\?story_fbid=|posts\/|videos\/|video\.php\?v=|groups\/[^\/]+\/permalink\/)(\d+)/);
  if (!match || match.length < 2) {
    console.log("URL parsing error");
    return null; // Invalid post URL format
  }

  const fbid = match[1];
  return `https://mbasic.facebook.com/mbasic/comment/advanced/?target_id=${fbid}&at=compose`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    let { url, comment, email, password } = req.body;

    // Convert URL to its "mbasic" version
    url = extractMbasicUrl(url);

    if (!email || !password || !url) {
      return res.status(400).json({ error: 'URL, email, and password are required' });
    }

    try {
      const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized', '--lang=en-US'] });
      const page = await browser.newPage();

      try {
        await page.goto(url, { waitUntil: 'networkidle2' });
      } catch (error) {
        console.error("Error navigating to URL:", error);
        await browser.close();
        return res.status(500).json({ error: 'Failed to navigate to the URL' });
      }

      try {
        // Handle "Accept Cookies" popup
        await clickAcceptButton(page, ['Akzeptieren', 'Accept', 'Accept all cookies', 'Accept all', 'Allow', 'Allow all', 'Allow all cookies', 'Ok', 'Povolit všechny soubory cookie']);
      } catch (error) {
        console.error("Error clicking accept button:", error);
      }

      try {
        // Wait for login form to appear
        await page.waitForSelector('input[name="email"]');

        // Perform Facebook login
        await page.type('input[name="email"]', email); // Enter email
        await page.type('input[name="pass"]', password);  // Enter password
        await page.click('input[name="login"]'); // Click login button
      } catch (error) {
        console.error("Error during login:", error);
        await browser.close();
        return res.status(500).json({ error: 'Failed to log in to Facebook' });
      }

      try {
        // Wait for comment form to appear
        await page.waitForSelector('textarea[name="comment_text"]');

        // Type the comment
        await page.type('textarea[name="comment_text"]', comment);

        // Click the post button
        await page.click('input[name="post"]');
        wait(300);
      } catch (error) {
        console.error("Error posting comment:", error);
        await browser.close();
        return res.status(500).json({ error: 'Failed to post the comment' });
      }

      try {
        // Take a screenshot after posting comment
        const screenshot = await page.screenshot({ encoding: 'base64' });

        // Close the browser
        await browser.close();

        return res.status(200).json({ message: 'Comment sent successfully', screenshot });
      } catch (error) {
        console.error("Error taking screenshot:", error);
        await browser.close();
        return res.status(500).json({ error: 'Failed to take screenshot' });
      }
    } catch (error) {
      console.error("Error in Puppeteer setup:", error);
      return res.status(500).json({ error: 'Failed to set up Puppeteer' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function clickAcceptButton(page: Page, buttonTexts: string[]) {
  const expectedTextRegex = new RegExp(`^(${buttonTexts.join('|')})$`, 'gi');

  const clickButton = async (selector: string) => {
    const elements = await page.$$(selector);
    for (const element of elements) {
      const text = await page.evaluate(el => el.textContent?.trim(), element);
      if (text?.match(expectedTextRegex)) {
        await element.click();
        return true;
      }
    }
    return false;
  };

  const selectors = [
    'a[id*=cookie i]',
    'a[class*=cookie i]',
    'button[id*=cookie i]',
    'button[class*=cookie i]',
    'a',
    'button',
    'span'
  ];

  for (const selector of selectors) {
    if (await clickButton(selector)) {
      return;
    }
  }
}

async function wait(delay: number) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, delay);
  });
}
