/* eslint-disable no-useless-escape */
// Generated by Selenium IDE
const {Builder, By, Key, until} = require('selenium-webdriver');
const {describe, beforeEach, afterEach, it} = require('mocha');
const SeleniumDriver = require('../drivers/slenium');

const assert = require('assert');

describe('metamask login', function() {
  this.timeout(0);
  let driver;
  let vars;
  beforeEach(async function() {
    driver = new SeleniumDriver();
    vars = {};
  });
  it('metamask login', async function() {
    await driver.findElement(By.xpath("//div[@id=\'app\']/div/div[5]/header/div/div[2]/div/div")).click();
    await driver.findElement(By.xpath("//div[@id=\'modal\']/div/div/div/div/span")).click();
    await driver.findElement(By.id('app')).click();
  });
});
