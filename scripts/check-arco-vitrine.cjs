/* Run against a local static server:
   ARCO_URL=http://localhost:8000/arco.html node scripts/check-arco-vitrine.cjs
   Requires Playwright and Chromium; CHROMIUM_PATH overrides the executable. */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const URL = process.env.ARCO_URL || 'http://localhost:8000/arco.html';
const executablePath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';

(async () => {
  const browser = await chromium.launch({executablePath, headless:true, args:['--no-sandbox']});
  const errors = [];
  async function open(options = {}){
    const page = await browser.newPage({viewport:{width:1440,height:1000}, ...options});
    // The feature must work with local assets and without analytics/webfonts.
    await page.route('https://**/*', route => route.abort());
    page.on('pageerror', error => {
      if (/\/arco\.html(?:[?#]|$)/.test(page.url())) errors.push(error.message);
    });
    await page.clock.install();
    await page.goto(URL);
    await page.evaluate(() => document.fonts.ready);
    return page;
  }
  const state = page => page.locator('.arx').evaluate(el => ({
    mode:el.dataset.showcase, selected:el.dataset.sel, arch:el.dataset.state,
    active:[...el.querySelectorAll('[data-exhibiting]')].map(col => col.dataset.sys)
  }));
  const step = async (page, ms) => { await page.clock.runFor(40); await page.clock.fastForward(ms); await page.clock.runFor(40); };
  const head = (page, sys) => page.locator(`.arx-col[data-sys="${sys}"] .arx-col__head`);
  try {
    const page = await open();
    assert.deepEqual(await state(page), {mode:'CLEAN', selected:'', arch:'rest', active:[]});
    const bounds = await page.locator('.arx-cols').boundingBox();
    const hero = await page.locator('.arx-hero').boundingBox();
    await step(page, 2600);
    assert.deepEqual((await state(page)).active, ['data']);
    await step(page, 1600);
    assert.equal((await state(page)).mode, 'AUTO');
    assert.deepEqual(await page.locator('.arx-cols').boundingBox(), bounds);
    assert.deepEqual(await page.locator('.arx-hero').boundingBox(), hero);

    await head(page,'echo').hover();
    assert.equal(await page.locator('.arx-vitrine').first().evaluate(el=>getComputedStyle(el).visibility), 'hidden');
    await step(page, 20000);
    assert.deepEqual((await state(page)).active, ['data']);
    await page.mouse.move(0,0);
    await step(page, 5100); // retract
    await step(page, 800);  // interval
    assert.deepEqual((await state(page)).active, []);
    await step(page, 2600); // echo reveal
    assert.deepEqual((await state(page)).active, ['echo']);
    await step(page, 1600);

    await head(page,'data').focus();
    await step(page, 20000);
    assert.deepEqual((await state(page)).active, ['echo']);
    await page.evaluate(() => document.activeElement.blur());

    // Partial visibility freezes both the hold and the vector reveal clock.
    await page.evaluate(() => scrollTo(0, document.querySelector('.arx-cols').offsetTop + 1500));
    await step(page, 20000);
    assert.deepEqual((await state(page)).active, ['echo']);
    await page.evaluate(() => scrollTo(0,0));
    await step(page, 5100);
    await step(page, 800);
    await step(page, 2600);
    assert.deepEqual((await state(page)).active, ['atrio']);
    await step(page, 1600);
    assert.deepEqual(await page.locator('.arx-cols').boundingBox(), bounds);
    assert.deepEqual(await page.locator('.arx-hero').boundingBox(), hero);

    // Exercise the real visibilitychange listener without relying on tab policy.
    await page.evaluate(() => { Object.defineProperty(document,'hidden',{configurable:true,get:()=>true}); document.dispatchEvent(new Event('visibilitychange')); });
    await step(page, 20000);
    assert.deepEqual((await state(page)).active, ['atrio']);
    await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
    await step(page, 5100);
    await step(page, 800);
    assert.deepEqual((await state(page)).active, []);
    await step(page, 4700);
    assert.deepEqual((await state(page)).active, []);
    await step(page, 400);
    assert.deepEqual((await state(page)).active, ['data']);

    // Evidence tooltips keep their independent interaction.
    await page.mouse.move(0,0);
    await page.locator('.arx-col [data-datum]').first().click();
    assert.equal((await state(page)).selected, '');
    await head(page,'data').click();
    await step(page, 1000);
    assert.equal(page.url(), URL);
    assert.equal((await state(page)).selected, 'data');
    assert.equal((await state(page)).mode, 'SELECTED');
    await head(page,'echo').click();
    await step(page, 1000);
    assert.equal(page.url(), URL);
    assert.equal((await state(page)).selected, 'echo');
    await page.mouse.move(0,0);
    await page.evaluate(() => document.activeElement.blur());
    await step(page, 60000);
    assert.deepEqual((await state(page)).active, []);
    await head(page,'echo').click();
    await page.waitForURL('**/echo.html');
    console.log('PASS desktop: clean entry, complete sequence, no layout shift, hover/visibility pauses, independent metrics, two clicks');
    await page.close();

    const rapid = await open({viewport:{width:1024,height:600}});
    await step(rapid,20000);
    assert.equal((await state(rapid)).mode,'CLEAN');
    await rapid.evaluate(() => {
      for (const sys of ['data','echo','atrio']) document.querySelector(`.arx-col[data-sys="${sys}"] .arx-col__head`).click();
    });
    await step(rapid,1000);
    assert.equal((await state(rapid)).selected,'atrio');
    await head(rapid,'atrio').focus();
    await rapid.keyboard.press('Escape');
    await step(rapid,1500);
    await rapid.evaluate(() => document.activeElement.blur());
    await rapid.setViewportSize({width:1440,height:1000});
    await rapid.evaluate(() => scrollTo(0,0));
    await step(rapid,60000);
    assert.deepEqual((await state(rapid)).active,[]);
    assert.equal((await state(rapid)).selected,'');
    console.log('PASS partial viewport, rapid selection and no restart after closing a panel');
    await rapid.close();

    const keyboard = await open({reducedMotion:'reduce'});
    await step(keyboard,60000);
    assert.equal((await state(keyboard)).mode,'CLEAN');
    await head(keyboard,'atrio').focus();
    await keyboard.keyboard.press('Enter');
    await step(keyboard,100);
    assert.equal((await state(keyboard)).selected,'atrio');
    assert.equal(keyboard.url(),URL);
    assert.equal(await head(keyboard,'atrio').getAttribute('aria-pressed'),'true');
    await keyboard.keyboard.press('Space');
    await keyboard.waitForURL('**/atrio.html');
    console.log('PASS keyboard and reduced motion: manual selection, second activation navigates');
    await keyboard.close();

    const mobile = await open({viewport:{width:390,height:600},isMobile:true,hasTouch:true,deviceScaleFactor:1});
    await mobile.locator('.arx-cols').scrollIntoViewIfNeeded();
    await step(mobile,6000);
    assert.ok((await state(mobile)).active.length <= 1);
    assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),true);
    await head(mobile,'data').tap();
    await step(mobile,1000);
    assert.equal((await state(mobile)).selected,'data');
    assert.equal(mobile.url(),URL);
    await head(mobile,'data').tap();
    await mobile.waitForURL('**/data.html');
    console.log('PASS mobile: viewport remains stable, two taps');
    await mobile.close();

    const staticPage = await open({javaScriptEnabled:false});
    assert.equal(await staticPage.locator('.arx-col__txt:visible').count(),3);
    assert.equal(await staticPage.locator('.arx-vitrine').count(),0);
    assert.equal(await staticPage.locator('.rail__link[data-view="data"]').isVisible(),true);
    console.log('PASS without JavaScript: original trajectory content remains visible');
    await staticPage.close();
    assert.deepEqual(errors,[]);
    console.log('PASS no JavaScript errors on ARCO');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
