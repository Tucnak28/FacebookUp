import puppeteer, { Page } from 'puppeteer';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { url, comment, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
      const browser = await puppeteer.launch({ headless: true    }); // Launch browser in non-headless mode for debugging
      const page = await browser.newPage();

      // Navigate to the Instagram login page
      await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });

      // Wait for the login form to appear
      await page.waitForSelector('input[name="username"]');

      await clickAcceptButton(page, ['Akzeptieren', 'Accept', 'Accept all cookies', 'Accept all', 'Allow', 'Allow all', 'Allow all cookies', 'Ok', 'Povolit všechny soubory cookie']);

      await wait(1000);

      // Enter the login credentials and click the login button
      await page.type('input[name="username"]', email);
      await page.type('input[name="password"]', password);
      await page.click('button[type="submit"]');

      // Wait for navigation to the home page after successful login
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      // Navigate to the target URL
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Handle any necessary interactions on the target page (e.g., posting a comment)
      // Replace the following lines with your specific actions

      // Wait for the comment form to appear
      await page.waitForSelector('textarea[placeholder="Přidejte komentář..."]');

      // Type the comment
    await page.type('textarea[placeholder="Přidejte komentář..."]', comment);

    // Press the Enter key
    await page.keyboard.press('Enter');

      // Take a screenshot after posting comment
      const screenshot = await page.screenshot({ encoding: 'base64' });

      // Close the browser
      await browser.close();

      return res.status(200).json({ message: 'Comment sent successfully', screenshot });
    } catch (error) {
      console.error('Error:', error);
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
