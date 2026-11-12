/* Run against a local static server:
   ARCO_URL=http://localhost:8000/arco.html node scripts/check-arco-vitrine.cjs
   Requires Playwright and Chromium; CHROMIUM_PATH overrides the executable. */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const URL = process.env.ARCO_URL || 'http://localhost:8000/arco.html';
const executablePath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
const SHOW = 6840, XF = 760;

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
    active:[...el.querySelectorAll('.arx-col[data-exhibiting]')].map(col => col.dataset.sys)
  }));
  const run = (page, ms) => page.clock.runFor(ms);
  const head = (page, sys) => page.locator(`.arx-col[data-sys="${sys}"] .arx-col__head`);
  const layer = (page, sys) => page.locator(`.arx-col[data-sys="${sys}"] .arx-vitrine`);
  try {
    const page = await open();
    let s = await state(page);
    assert.ok(['rest', 'tension'].includes(s.arch));
    assert.deepEqual({mode:s.mode, selected:s.selected, active:s.active}, {mode:'CLEAN', selected:'', active:[]});

    // The arc forms by itself with the stories in view; the showcase starts with it.
    await run(page, 3500);
    s = await state(page);
    assert.equal(s.arch, 'formed');
    assert.equal(s.mode, 'AUTO');
    assert.deepEqual(s.active, ['data']);

    // Looping, in order, with no empty interval.
    await run(page, SHOW + XF + 100);
    assert.deepEqual((await state(page)).active, ['echo']);
    await run(page, SHOW / 2);
    assert.deepEqual((await state(page)).active, ['echo']);
    await run(page, SHOW / 2 + XF + 100);
    assert.deepEqual((await state(page)).active, ['atrio']);
    await run(page, SHOW + XF + 100);
    assert.deepEqual((await state(page)).active, ['data']);

    // Under the cursor the block keeps the animation, visible and running.
    const echoBox = await page.locator('.arx-col[data-sys="echo"]').boundingBox();
    await page.mouse.move(echoBox.x + echoBox.width / 2, echoBox.y + echoBox.height / 2);
    await run(page, XF + 200);
    assert.deepEqual((await state(page)).active, ['echo']);
    assert.equal(await layer(page,'echo').evaluate(el => getComputedStyle(el).visibility), 'visible');
    await run(page, 20000);
    assert.deepEqual((await state(page)).active, ['echo']);
    // Leaving resumes the order from the hovered block.
    await page.mouse.move(0, 0);
    await run(page, 1500 + XF + 200);
    assert.deepEqual((await state(page)).active, ['atrio']);

    // A hidden document freezes the clock.
    await page.evaluate(() => { Object.defineProperty(document,'hidden',{configurable:true,get:()=>true}); document.dispatchEvent(new Event('visibilitychange')); });
    await run(page, 20000);
    assert.deepEqual((await state(page)).active, ['atrio']);
    await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });

    // Evidence tooltips keep their independent interaction.
    await page.locator('.arx-col [data-datum]').first().click();
    assert.equal((await state(page)).selected, '');

    // Selected, the animation stays on the chosen block; the crown is the arc's.
    await head(page,'data').click();
    await run(page, 1500);
    s = await state(page);
    assert.equal(page.url(), URL);
    assert.equal(s.selected, 'data');
    assert.equal(s.mode, 'SELECTED');
    assert.deepEqual(s.active, ['data']);
    await head(page,'atrio').click();
    await run(page, 1500);
    s = await state(page);
    assert.equal(s.selected, 'atrio');
    await page.mouse.move(0, 0);
    await run(page, 20000);
    assert.deepEqual((await state(page)).active, ['atrio']);
    // Closing the panel keeps the showcase going.
    await head(page,'atrio').focus();
    await page.keyboard.press('Escape');
    await run(page, 1500);
    await page.evaluate(() => document.activeElement.blur());
    s = await state(page);
    assert.equal(s.selected, '');
    assert.equal(s.mode, 'AUTO');
    assert.ok(s.active.length >= 1);
    // The chosen block becomes the first; a second click collapses it back.
    const order = () => page.evaluate(() => [...document.querySelectorAll('.arx-col')]
      .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left).map(col => col.dataset.sys));
    await head(page,'echo').click();
    await run(page, 1500);
    assert.deepEqual(await order(), ['echo', 'data', 'atrio']);
    assert.deepEqual((await state(page)).active, ['echo']);
    assert.equal(await page.locator('.arx-sum[data-sys="echo"] .arx-mov').getAttribute('data-exhibiting'), 'echo');
    await head(page,'echo').click();
    await run(page, 1500);
    assert.equal(page.url(), URL);
    assert.equal((await state(page)).selected, '');
    assert.deepEqual(await order(), ['data', 'echo', 'atrio']);
    console.log('PASS desktop: forms then starts, loops in order, holds under the cursor, pauses when hidden, stays on the selection, second click collapses');
    await page.close();

    const keyboard = await open({reducedMotion:'reduce'});
    await run(keyboard, 60000);
    assert.equal((await state(keyboard)).mode, 'CLEAN');
    assert.deepEqual((await state(keyboard)).active, []);
    await head(keyboard,'atrio').focus();
    await keyboard.keyboard.press('Enter');
    await run(keyboard, 100);
    assert.equal((await state(keyboard)).selected, 'atrio');
    assert.equal(keyboard.url(), URL);
    assert.equal(await head(keyboard,'atrio').getAttribute('aria-pressed'), 'true');
    await keyboard.keyboard.press('Space');
    await run(keyboard, 1000);
    assert.equal((await state(keyboard)).selected, '');
    assert.equal(keyboard.url(), URL);
    console.log('PASS keyboard and reduced motion: no animation, manual selection, second activation collapses');
    await keyboard.close();

    const mobile = await open({viewport:{width:390,height:700}, isMobile:true, hasTouch:true, deviceScaleFactor:1});
    await mobile.locator('.arx-col[data-sys="echo"]').evaluate(el => el.scrollIntoView({block:'center', behavior:'instant'}));
    await run(mobile, 1000);
    await run(mobile, 6000);
    assert.deepEqual((await state(mobile)).active, ['echo']);
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await head(mobile,'data').tap();
    await run(mobile, 1000);
    assert.equal((await state(mobile)).selected, 'data');
    assert.equal(mobile.url(), URL);
    await head(mobile,'data').tap();
    await run(mobile, 1000);
    assert.equal((await state(mobile)).selected, '');
    assert.equal(mobile.url(), URL);
    console.log('PASS mobile: the most visible block animates, no horizontal scroll, second tap collapses');
    await mobile.close();

    const staticPage = await open({javaScriptEnabled:false});
    assert.equal(await staticPage.locator('.arx-col__txt:visible').count(), 3);
    assert.equal(await staticPage.locator('.arx-vitrine').count(), 0);
    assert.equal(await staticPage.locator('.rail__link[data-view="data"]').isVisible(), true);
    console.log('PASS without JavaScript: original trajectory content remains visible');
    await staticPage.close();
    assert.deepEqual(errors, []);
    console.log('PASS no JavaScript errors on ARCO');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
