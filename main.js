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

/**
 * Function to book the optimal time slot by clicking on the last enabled time slot element.
 * @param {object} page The Puppeteer page object
 */
 async function bookOptimalTimeSlot(page) {
    // Find all time slot elements
    const timeSlotElements = await page.$$('[id^="pt1:dcTime:iTime"]');
    
    // Filter out the time slot elements that have the class "p_AFDisabled" in any of its child elements
    const enabledTimeSlotElements = await Promise.all(timeSlotElements.map(async (element) => {
      const hasDisabledClass = await page.evaluate((elem) => {
        return Array.from(elem.getElementsByTagName('*')).some((child) => child.classList.contains('p_AFDisabled'));
      }, element);
      return hasDisabledClass ? null : element;
    }));
    
    // Select the last enabled time slot element
    const lastEnabledTimeSlotElement = enabledTimeSlotElements.filter(Boolean).pop();
    
    // Click on the last enabled time slot element, or log a message if no enabled time slot element was found
    if (lastEnabledTimeSlotElement) {
      console.log(await lastEnabledTimeSlotElement)
    } else {
      console.log('No enabled time slot element found');
    }
  }

run();

module.exports = bookOptimalTimeSlot;