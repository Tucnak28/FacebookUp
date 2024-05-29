import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer, { Page } from 'puppeteer';

// Function to convert URL to its "mbasic" version
function convertToMbasicUrl(url: string): string {
  const urlObject = new URL(url);
  urlObject.hostname = urlObject.hostname.replace('www', 'www.mbasic');
  return urlObject.href;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    let { url, username, password } = req.body;

    // Convert URL to its "mbasic" version
    url = convertToMbasicUrl(url);

    // For testing purposes, we are hardcoding the username
    username = "Tucnak32@post.cz";

    if (!username || !password) {
      return res.status(400).json({ error: 'URL, username, and password are required' });
    }

    try {
      const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] });
      const page = await browser.newPage();

      await page.goto(url, { waitUntil: 'networkidle2' });

      // Handle "Accept Cookies" popup using the logic from the Börse Frankfurt script
      await clickAcceptButton(page, ['Akzeptieren', 'Accept', 'Accept all cookies', 'Accept all', 'Allow', 'Allow all', 'Allow all cookies', 'Ok', 'Povolit všechny soubory cookie']);

      // Wait for a bit to ensure the cookies dialog is handled
      await wait(2000);

      // Perform Facebook login
      await page.type('input[name="email"]', username); // Enter username
      await page.type('input[name="pass"]', password);  // Enter password
      await page.click('input[name="login"]'); // Click login button

      // Wait for navigation to complete
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      // Take a screenshot after login
      const screenshot = await page.screenshot({ encoding: 'base64' });
      await browser.close();

      return res.status(200).json({ message: 'Login successful', screenshot });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to login' });
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
