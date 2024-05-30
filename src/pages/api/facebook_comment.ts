import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer, { Page } from 'puppeteer';

function extractMbasicUrl(postUrl: string): string | null {
  // Check if the post URL is valid
  const match = postUrl.match(/facebook\.com\/photo\/\?fbid=(\d+)/);
  if (!match || match.length < 2) {
    return null; // Invalid post URL format
  }

  const fbid = match[1];
  return `https://mbasic.facebook.com/mbasic/comment/advanced/?target_id=${fbid}&at=compose&eav=AfahHvprPR3vC18l81hkdCazQHrCIsPPsVRJ6_fvI6KDjDIIxMU--G5fjizqa4igBVE`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    let { url, comment, email, password } = req.body;

    // Convert URL to its "mbasic" version
    url = extractMbasicUrl(url);

    if (!email || !password) {
      return res.status(400).json({ error: 'URL, username, and password are required' });
    }

    try {
      const browser = await puppeteer.launch({ headless: true, defaultViewport: null, args: ['--start-maximized', '--lang=en-US'] });
      const page = await browser.newPage();

      await page.goto(url, { waitUntil: 'networkidle2' });

      // Handle "Accept Cookies" popup using the logic from the Börse Frankfurt script
      await clickAcceptButton(page, ['Akzeptieren', 'Accept', 'Accept all cookies', 'Accept all', 'Allow', 'Allow all', 'Allow all cookies', 'Ok', 'Povolit všechny soubory cookie']);

      // Wait for login form to appear
      await page.waitForSelector('input[name="email"]');

      // Perform Facebook login
      await page.type('input[name="email"]', email); // Enter username
      await page.type('input[name="pass"]', password);  // Enter password
      await page.click('input[name="login"]'); // Click login button

      // Wait for comment form to appear
      await page.waitForSelector('textarea[name="comment_text"]');

      // Type the comment
      await page.type('textarea[name="comment_text"]', comment);

      // Click the post button
      await page.click('input[name="post"]');

      // Wait for navigation to complete after posting comment
      //await page.waitForNavigation({ waitUntil: 'networkidle2' });

      // Take a screenshot after posting comment
      const screenshot = await page.screenshot({ encoding: 'base64' });
      
      // Close the browser
      await browser.close();

      return res.status(200).json({ message: 'Comment sent successfully', screenshot });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to send comment' });
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
