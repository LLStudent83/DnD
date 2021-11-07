import { fork } from 'child_process';

const puppetteer = require('puppeteer');

jest.setTimeout(30000);
describe('Check popover', () => {
  let browser = null;
  let page = null;
  let server = null;
  const baseUrl = 'http://localhost:9000';
  beforeAll(async () => {
    server = fork(`${__dirname}/e2e.server.js`);
    await new Promise((resolve, reject) => {
      server.on('error', reject);
      server.on('message', (message) => {
        if (message === 'ok') {
          resolve();
        }
      });
    });

    browser = await puppetteer.launch({
      headless: true, // show guis
      lowMo: 250,
      devtools: true, // show devTools
    });
    page = await browser.newPage();
  });
  afterAll(async () => {
    await browser.close();
    server.kill();
  });
  describe('Check popover', () => {
    test('проверка появления окна', async () => {
      await page.goto(baseUrl);
      const button = await page.$('.button');
      button.click();
      await page.waitForSelector('.popover');
    });
  });
});
