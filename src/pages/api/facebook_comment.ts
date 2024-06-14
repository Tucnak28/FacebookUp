// mainHandler.ts
import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer, { Page, Browser, Cookie } from "puppeteer";
import { getCookies, saveCookies, setCookies } from "./cookieManager";

const userAgent = "Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Mobile Safari/537.36";
const mainPageURL = "https://mbasic.facebook.com";

function extractMbasicUrl(postUrl: string): string | null {
  const match = postUrl.match(/facebook\.com\/(?:.*\/)?(?:photo\.php\?fbid=|photo\/\?fbid=|permalink\.php\?story_fbid=|posts\/|videos\/|video\.php\?v=|groups\/[^\/]+\/permalink\/|reel\/|photo\?fbid=)(\d+)/);
  if (!match || match.length < 2) {
    console.log("URL parsing error");
    return null;
  }
  const fbid = match[1];
  return `https://mbasic.facebook.com/mbasic/comment/advanced/?target_id=${fbid}&at=compose`;
}

const navigateToUrl = async (page: Page, url: string): Promise<void> => {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
  } catch (error) {
    console.error("Error navigating to URL:", error);
    throw new Error("Failed to navigate to the URL");
  }
};

const handleAcceptCookies = async (page: Page, buttonTexts: string[]): Promise<void> => {
  try {
    await clickAcceptButton(page, buttonTexts);
  } catch (error) {
    console.error("Error clicking accept button:", error);
  }
};

const loginToFacebook = async (page: Page, email: string, password: string): Promise<void> => {
  try {
    await page.waitForSelector("input[name=email]");
    await page.type("input[name=email]", email);
    await page.type("input[name=pass]", password);
    await page.click("input[name=login]");
  } catch (error) {
    console.error("Error during login:", error);
    throw new Error("Failed to log in to Facebook");
  }
};


const postComment = async (page: Page, comment: string): Promise<void> => {
  try {
    await page.waitForSelector("textarea[name=comment_text]");
    await page.type("textarea[name=comment_text]", comment);
    await page.click("input[name=post]");
    await wait(300);
  } catch (error) {
    console.error("Error posting comment:", error);
    throw new Error("Failed to post the comment");
  }
};

const likePost = async (page: puppeteer.Page): Promise<void> => {
  try {
    const likeButtonSelector = 'td a[href*="/like.php"]';

    // Wait for the like button to appear
    await page.waitForSelector(likeButtonSelector, { timeout: 1000 });
    
    const likeButton = await page.$(likeButtonSelector);
    if (likeButton) {
      await likeButton.click();
      console.log('Clicked the Like button successfully');
    } else {
      console.error('Like button not found');
    }
    
  } catch (error) {
    console.error("Error clicking the Like button:", error);
  }
};


const takeScreenshot = async (page: Page): Promise<string> => {
  try {
    const screenshot = await page.screenshot({ encoding: "base64" });
    return screenshot;
  } catch (error) {
    console.error("Error taking screenshot:", error);
    throw new Error("Failed to take screenshot");
  }
};

const clickAcceptButton = async (page: Page, buttonTexts: string[]): Promise<void> => {
  const expectedTextRegex = new RegExp(`^(${buttonTexts.join("|")})$`, "gi");

  const clickButton = async (selector: string) => {
    const elements = await page.$$(selector);
    for (const element of elements) {
      const text = await page.evaluate((el) => el.textContent?.trim(), element);
      if (text?.match(expectedTextRegex)) {
        await element.click();
        return true;
      }
    }
    return false;
  };

  const selectors = [
    "a[id*=cookie i]",
    "a[class*=cookie i]",
    "button[id*=cookie i]",
    "button[class*=cookie i]",
    "a",
    "button",
    "span",
  ];

  for (const selector of selectors) {
    if (await clickButton(selector)) {
      return;
    }
  }
};

const wait = async (delay: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

const setup = async (email: string, password: string): Promise<{ browser: Browser; page: Page; cookies?: BrowserCookie[] }> => {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ["--start-maximized", "--lang=en-US"] });
  const page = await browser.newPage();
  await page.setUserAgent(userAgent);
  await page.goto(mainPageURL);

  await handleAcceptCookies(page, ["Akzeptieren", "Accept", "Accept all cookies", "Accept all", "Allow", "Allow all", "Allow all cookies", "Ok", "Povolit všechny soubory cookie"]);

  let cookies = await getCookies(email);
  if (cookies) {
    await setCookies(page, cookies);
  } else {
    console.log(`Cookies not found for email: ${email}. Logging in...`);
    await loginToFacebook(page, email, password);
    cookies = await page.cookies(); // Fetch cookies after successful login
    await saveCookies(email, cookies);
  }

  // Check if we are still logged in by verifying a selector on the logged-in page
  const isLoggedIn = await checkLoggedIn(page);
  if (!isLoggedIn) {
    console.log(`Logged out unexpectedly for email: ${email}. Re-logging in...`);
    await loginToFacebook(page, email, password); // Attempt to login again
    cookies = await page.cookies(); // Update cookies after re-login
    await saveCookies(email, cookies);
  }

  return { browser, page };
};

const checkLoggedIn = async (page: Page): Promise<boolean> => {
  try {
    await page.waitForSelector("input[name=email]", { timeout: 1000 });
    return false;
  } catch (error) {
    return true;
  }
};




export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { url, comment, email, password } = req.body;

    const mbasicUrl = extractMbasicUrl(url);

    if (!email || !password || !mbasicUrl) {
      return res.status(400).json({ error: "URL, email, and password are required" });
    }

    try {
      const { browser, page } = await setup(email, password);

      await navigateToUrl(page, mbasicUrl);
      await handleAcceptCookies(page, ["Akzeptieren", "Accept", "Accept all cookies", "Accept all", "Allow", "Allow all", "Allow all cookies", "Ok", "Povolit všechny soubory cookie"]);
      
      await postComment(page, comment);
      const screenshot = await takeScreenshot(page);

      await likePost(page);

      await page.waitForNavigation({ waitUntil: "networkidle2" });

      await browser.close();

      return res.status(200).json({ message: "Comment sent successfully", screenshot });
    } catch (error) {
      console.error("Error in Puppeteer setup:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

