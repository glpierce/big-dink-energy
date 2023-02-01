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

run();