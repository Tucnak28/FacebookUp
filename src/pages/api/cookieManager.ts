import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs/promises";

const cookiesFilePath = "./cookies.json";

// Define a type for cookies including email
type StoredCookieData = {
    email: string;
    cookies: BrowserCookie[];
  };
  

// Define types for cookie conversion
type APICookie = {
  key: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  size: number;
  httpOnly: boolean;
  secure: boolean;
  session: boolean;
  sameSite: string;
};

type BrowserCookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  size: number;
  httpOnly: boolean;
  secure: boolean;
  session: boolean;
  sameSite: string;
};

// Convert API cookies to Browser cookies
const apiToBrowserCookies = (cookies: APICookie[]): BrowserCookie[] => {
  return cookies.map((cookie: APICookie): BrowserCookie => {
    const { key, ...rest } = cookie;
    return { ...rest, name: key };
  });
};

// Convert Browser cookies to API cookies
const browserToAPICookies = (cookies: BrowserCookie[]): APICookie[] => {
  return cookies.map((cookie: BrowserCookie): APICookie => {
    const { name, ...rest } = cookie;
    return { ...rest, key: name };
  });
};

export const setCookies = async (page: puppeteer.Page, cookies: BrowserCookie[]) => {
    await page.setCookie(...cookies);
  };
  
export const getCookies = async (email: string): Promise<BrowserCookie[] | null> => {
    try {
      const data = await fs.readFile(cookiesFilePath, "utf-8");
      const storedData: StoredCookieData = JSON.parse(data);
      if (storedData.email === email) {
        return storedData.cookies;
      }
      return null; // Return null if email doesn't match
    } catch (error) {
      console.error("Error reading cookies:", error);
      return null;
    }
  };
  

export const saveCookies = async (email: string, cookies: BrowserCookie[]) => {
    try {
      const storedData: StoredCookieData = {
        email,
        cookies,
      };
      await fs.writeFile(cookiesFilePath, JSON.stringify(storedData), "utf-8");
    } catch (error) {
      console.error("Error saving cookies:", error);
    }
  };
  
