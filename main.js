const puppeteer = require("puppeteer");

function getURL() {
    const baseURL = "https://www.spotery.com/f/adf.task-flow;jsessionid=aIgKu52ShGWp3zcbXSYlrmbhBatGEAQf1sqpmbcivqVjWdF-9myr!-321284319?adf.tfDoc=%2FWEB-INF%2Ftaskflows%2Ffacility%2Ftf-faci-detail.xml&adf.tfId=tf-faci-detail&psOrgaSk=3333257&psReservationDateStr="
    const date = new Date()
    const cleanDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
    console.log(cleanDate)
    return baseURL + encodeURIComponent(cleanDate)
}

async function run() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = getURL()
    await page.goto(url);
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