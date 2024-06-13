import fs from "fs/promises";
import puppeteer from "puppeteer";

const cookiesFilePath = "./cookies.json";


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
  

const apiToBrowserCookies = (cookies: APICookie[]): BrowserCookie[] => {
  return cookies.map((cookie: APICookie): BrowserCookie => {
    const { key, ...rest } = cookie;
    return { ...rest, name: key };
  });
};

const browserToAPICookies = (cookies: BrowserCookie[]): APICookie[] => {
  return cookies.map((cookie: BrowserCookie): APICookie => {
    const { name, ...rest } = cookie;
    return { ...rest, key: name };
  });
};

export const setCookies = async (page: puppeteer.Page, cookies: BrowserCookie[]) => {
    await page.setCookie(...cookies);
  };

  export const saveCookies = async (page: puppeteer.Page) => {
    const cookies = await page.cookies();
    const storedCookies = browserToAPICookies(cookies);
    await fs.writeFile(cookiesFilePath, JSON.stringify(storedCookies), "utf-8");
  };
  

  export const getCookies = async (): Promise<BrowserCookie[]> => {
    try {
      const data = await fs.readFile(cookiesFilePath, "utf-8");
      const cookies: APICookie[] = JSON.parse(data);
      return apiToBrowserCookies(cookies);
    } catch (error) {
      console.error("Error reading cookies file:", error);
      return [];
    }
  };
  
