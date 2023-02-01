const puppeteer = require("puppeteer");
const dotenv = require('dotenv')
dotenv.config()


function getURL(url) {
    const baseURL = url.split("DateStr=")[0]
    let date = new Date()
    date.setDate(date.getDate() + 7)
    const cleanDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
    return baseURL + "DateStr=" + encodeURIComponent(cleanDate)
}

async function run() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://sfrecpark.org/1591/Reservable-Pickleball-Courts");
    await page.waitForSelector(`a[aria-label="Buena Vista Park Court #1 Opens in new window"]`)
    const href = await page.$eval(`a[aria-label="Buena Vista Park Court #1 Opens in new window"]`, (elm) => elm.href);
    await page.goto(getURL(href));
    await page.waitForSelector(`a.x281`)
    await page.click('a.x281')
    await page.waitForSelector(`input.auth0-lock-input`)
    await new Promise(r => setTimeout(r, 1500));
    await page.type('input.auth0-lock-input', process.env.USERNAME);
    await page.type('[name="password"]', process.env.PASSWORD);
    await page.click('button[name="submit"]')
    await page.waitForSelector('span.header1')
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({path: "login-submit.png"});
    await browser.close();
};

run();