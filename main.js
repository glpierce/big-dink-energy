const puppeteer = require('puppeteer-extra')
const {executablePath} = require('puppeteer')
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
puppeteer.use(
  RecaptchaPlugin({
    provider: { id: '2captcha', token: process.env.CAPTCHA },
    visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
  })
)
const dotenv = require('dotenv')
const { tsCallSignatureDeclaration } = require('@babel/types')
dotenv.config()


function getURL(url) {
    const baseURL = url.split("DateStr=")[0]
    let date = new Date()
    date.setDate(date.getDate() + 7)
    const cleanDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
    return baseURL + "DateStr=" + encodeURIComponent(cleanDate)
}

async function run() {
    puppeteer.launch({ headless: false, executablePath: executablePath(), args: ['--disable-dev-shm-usage'] }).then(async browser => {
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
            //await new Promise(r => setTimeout(r, 10000));
            await page.waitForSelector('iframe')
            // captcha
            //await page.solveRecaptchas()
            // await new Promise(r => setTimeout(r, 2000));
            //await page.screenshot({path: "captcha.png", fullPage: true});
            const elementFound = await bookOptimalTimeSlot(page)
            // if (elementFound) {
            //     await new Promise(r => setTimeout(r, 3000));
            //     await page.screenshot({path: "test.png", fullPage: true});
            // }
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
        lastEnabledTimeSlotElement.click()
        lastEnabledTimeSlotElement.click()
        // await new Promise(r => setTimeout(r, 3000));
        // await page.screenshot({path: "complete.png", fullPage: true});
        return true
    } else {
        return false
    }
  }

run();

module.exports = bookOptimalTimeSlot;