// src/pages/api/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import { exec } from 'child_process';

// A user agent that will get us a less secure version of the website
const userAgent = "Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Mobile Safari/537.36";

// A default timeout for latent operations
const defaultTimeout = 1000;

// The main page we're using to log in
const mainPageURL = "https://m.facebook.com";

// Calls the given operation that kicks off a network request,
// then waits for the page to finish loading
const submitAndLoad = async (page: puppeteer.Page, submitOperation: Promise<void>) => {
  await Promise.all([
    submitOperation,
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);
};

const getEmail = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec("get-email", (err, stdout) => {
      if (err) {
        reject(err);
      }
      resolve(stdout.trim());
    });
  });
};

const getExistingPassword = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec("get-password", (err, stdout) => {
      if (err) {
        reject(err);
      }
      resolve(stdout.trim());
    });
  });
};

const getNewPassword = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec("bump-password", (err, stdout) => {
      if (err) {
        reject(err);
      }
      resolve(stdout.trim());
    });
  });
};

const setCookies = async (page: puppeteer.Page, cookies: BrowserCookie[]) => {
  // @ts-ignore puppeteer doesn't export their cookie type
  page.setCookie(...cookies);
};

const setup = async () => {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] });
  const page = await browser.newPage();
  await page.goto(mainPageURL);

  await page.setUserAgent(userAgent);

  return { browser, page };
};

const login = async (page: puppeteer.Page) => {
  // Enter existing username & password
  const emailField = "input[name=email]";
  await page.waitForSelector(emailField);
  await page.focus(emailField);
  const currentEmail = await getEmail();
  await page.keyboard.type(currentEmail);

  const passwordField = "input[type=password]";
  await page.waitForSelector(passwordField);
  await page.focus(passwordField);
  const existingPassword = await getExistingPassword();
  await page.keyboard.type(existingPassword);

  await submitAndLoad(page, page.keyboard.press("Enter"));

  // If there's login approval required, approve it
  const approvalField = "button[name=\"submit[Yes]\"]";
  const approveButton = await page.$(approvalField);
  if (approveButton) {
    await approveButton.click();
  }

  // Reset the password if we need to
  const newPasswordField = "input[name=password_new]";
  try {
    await page.waitForSelector(newPasswordField, { timeout: defaultTimeout });
    await page.focus(newPasswordField);

    const newPassword = await getNewPassword();
    await page.keyboard.type(newPassword);

    await submitAndLoad(page, page.keyboard.press("Enter"));
  } catch {
    console.warn("no new password set");
  }

  // If there's an "easy log in" modal, dismiss it
  const okField = "button[value=OK]";
  try {
    await page.waitForSelector(okField, { timeout: defaultTimeout });
    await submitAndLoad(page, page.click(okField));
  } catch {
    // We don't care if this modal doesn't show up
  }
};

// Log in, resetting the password if necessary, and save
// the cookies so the bot can pick them up on the next restart
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { browser, page } = await setup();
      await login(page);

      // Navigate back to the main page to subvert fb's rate-limiting
      // shenanigans even if you have a successful login
      await page.goto(mainPageURL);

      // Commented out MemCachier related code
      // const newCookies = await page.cookies();
      // const storedCookies = browserToAPICookies(newCookies);
      // await mem.set(dbCollection, JSON.stringify(storedCookies), {});

      // mem.close();
      await browser.close();

      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Login failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// A base definition for a cookie that both the browser and API
// representations share
interface BaseCookie {
  value: string;
  domain: string;
  path: string;
  expires: number;
  size: number;
  httpOnly: boolean;
  secure: boolean;
  session: boolean;
  sameParty: boolean;
  sourceScheme: string;
  sourcePort: number;
}

// In the browser, this field is called "name"
interface BrowserCookie extends BaseCookie {
  name?: string;
}

// For the API, this field is called "key"
interface APICookie extends BaseCookie {
  key?: string;
}
