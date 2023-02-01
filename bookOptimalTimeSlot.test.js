const puppeteer = require('puppeteer');
const bookOptimalTimeSlot = require('./main');

jest.setTimeout(30000);

describe('bookOptimalTimeSlot', () => {
  let browser, page;

  beforeEach(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterEach(async () => {
    await browser.close();
  });

  it('clicks on the last enabled time slot element', async () => {
    // Set up a test page that has enabled and disabled time slot elements
    await page.setContent(`
      <div id="pt1:dcTime:iTime:0:bTime"></div>
      <div id="pt1:dcTime:iTime:1:bTime">
        <div class="p_AFDisabled"></div>
      </div>
      <div id="pt1:dcTime:iTime:2:bTime"></div>
    `);
    // Spy on the console log method to ensure it's called on the last enabled time slot element
    jest.spyOn(console, 'log');
    await bookOptimalTimeSlot(page);
    expect(console.log).toHaveBeenCalledWith({});
  });

  it('logs a message when no enabled time slot element is found', async () => {
    // Set up a test page with only disabled time slot elements
    await page.setContent(`
      <div id="pt1:dcTime:iTime:0:bTime">
        <div class="p_AFDisabled"></div>
      </div>
      <div id="pt1:dcTime:iTime:1:bTime">
        <div class="p_AFDisabled"></div>
      </div>
    `);
    // Spy on the console.log method to check if the correct message is logged
    jest.spyOn(console, 'log').mockImplementation(() => {});
    await bookOptimalTimeSlot(page);
    expect(console.log).toHaveBeenCalledWith('No enabled time slot element found');
  });
});
