const dotenv = require('dotenv')
dotenv.config()
const puppeteer = require('puppeteer-extra')
const {executablePath} = require('puppeteer')
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
puppeteer.use(
  RecaptchaPlugin({
    provider: { id: '2captcha', token: process.env.CAPTCHA },
    visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
  })
)

function getURL(url) {
    const baseURL = url.split("DateStr=")[0]
    let date = new Date()
    date.setDate(date.getDate() + 7)
    const cleanDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
    return baseURL + "DateStr=" + encodeURIComponent(cleanDate)
}

async function run() {
    puppeteer.launch({ headless: true, executablePath: executablePath(), args: ['--disable-dev-shm-usage'] }).then(async browser => {
        try { 
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
            await new Promise(r => setTimeout(r, 10000));
            // captcha
            await page.solveRecaptchas()
            // book time slot
            await bookOptimalTimeSlot(page)
        } catch (error) {
            console.log(error)
        } finally {
            await browser.close();
        }
    })
    
};

/**
 * Function to book the optimal time slot by clicking on the last enabled time slot element.
 * @param {object} page The Puppeteer page object
 */
 async function bookOptimalTimeSlot(page) {
    // Find all time slot elements
    const timeSlotElements = await page.$$('[id^="pt1:dcTime:iTime:"][id$=":pgl13"]');
    // Filter out the time slot elements that have the class "p_AFDisabled" in any of its child elements
    const enabledTimeSlotElements = await Promise.all(timeSlotElements.map(async (element) => {
      const hasDisabledClass = await page.evaluate((elem) => {
        return Array.from(elem.getElementsByTagName('*')).some((child) => child.classList.contains('p_AFDisabled'));
      }, element);
      return hasDisabledClass ? null : element;
    }));
    
    // Select the last enabled time slot element
    const lastEnabledTimeSlotElement = enabledTimeSlotElements.filter(element => element !== null).pop();
    
    // Click on the last enabled time slot element, or log a message if no enabled time slot element was found
    if (lastEnabledTimeSlotElement) {
        await lastEnabledTimeSlotElement.click()
        await new Promise(r => setTimeout(r, 1000));
        const bookElement = await page.$('[id$=":bBook"]');
        await bookElement.click()
        await page.waitForSelector('span[id="pt1:r1:0:ot6"]')
        console.log("Success")
        await new Promise(r => setTimeout(r, 3000));
    } else {
        console.log("No available time slots")
    }
  }

run();

module.exports = bookOptimalTimeSlot;