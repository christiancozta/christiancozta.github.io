const { chromium } = require('playwright-core');
const assert = require('assert');

const near = (a, b, tolerance, msg) => {
  assert(Math.abs(a - b) <= tolerance, `${msg}: ${a} vs ${b}; delta=${Math.abs(a - b)}`);
};

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });

  async function load(width, height) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:8765/arco.html', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts?.ready);
    await page.mouse.move(150, 120);
    await page.waitForTimeout(width <= 820 ? 5000 : 4200);
    assert.deepStrictEqual(errors, [], `page errors ${width}: ${errors.join('; ')}`);
    return page;
  }

  async function desktop(width, height, label) {
    const page = await load(width, height);
    const base = await page.evaluate(() => {
      const q = selector => document.querySelector(selector);
      const rr = element => {
        const r = element.getBoundingClientRect();
        return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height };
      };
      const arc = rr(q('.narr-zone .arc'));
      const nums = ['5','4','3','2','1'].map(step => rr(q(`.narr__stat[data-step="${step}"] .narr__n`)));
      const segs = [...document.querySelectorAll('.hero-v2-seg')].map(rr);
      const link = rr(q('.hero-v2-link'));
      const bio = rr(q('.bio'));
      const bioRun = rr(q('.bio__run'));
      const title = rr(q('.rail__title'));
      const name = rr(q('.bio__name'));
      const data = q('.rail__link--data');
      return {
        arc, nums, segs, link, bio, bioRun, title, name,
        dataHref:data && data.getAttribute('href'),
        scrollWidth:document.body.scrollWidth,
        innerWidth, innerHeight
      };
    });

    const axisX = base.arc.left + base.arc.width / 2;
    base.nums.forEach((number, index) => near(number.left + number.width / 2, axisX, 1.5, `${label} number ${5-index} on axis`));
    assert(base.nums[4].bottom <= base.bioRun.top + 4, `${label} 1 should finish above bio paragraph`);
    assert(base.link.width >= 47 && base.link.width <= 73, `${label} crossbar length ${base.link.width}`);
    near(base.link.right, axisX, 1.5, `${label} crossbar endpoint`);
    near(base.bio.right, base.link.left, 2.5, `${label} bio endpoint / crossbar free end`);
    assert(base.bioRun.right <= base.nums[3].left - 16, `${label} bio must clear number 2`);
    assert(base.nums[0].bottom < base.arc.top - 4, `${label} 5 must remain above extrados`);
    assert(base.innerHeight - base.arc.bottom >= 5, `${label} spring should be visibly lifted; clearance=${base.innerHeight-base.arc.bottom}`);
    assert(base.scrollWidth <= base.innerWidth + 1, `${label} horizontal overflow`);
    assert.strictEqual(base.segs.length, 5, `${label} expected 5 vertical segments`);
    near(base.segs[0].bottom, base.arc.bottom, 2.0, `${label} first segment / spring continuity`);
    near(base.title.top, base.name.top, 1.5, `${label} ARCO / Christian top alignment`);
    assert(base.dataHref === 'data.html', `${label} DATA href missing`);

    for (let i = 0; i < base.segs.length; i++) {
      const number = base.nums[i];
      assert(base.segs[i].top >= number.bottom + 3, `${label} segment ${i} overlaps number ${5-i}`);
    }

    for (const step of ['5','4','3','2']) {
      await page.click(`.narr__stat[data-step="${step}"] button.narr__n`);
      await page.waitForTimeout(80);
    }
    const expanded = await page.evaluate(() => {
      const rr = element => {
        const r = element.getBoundingClientRect();
        return { top:r.top, bottom:r.bottom, height:r.height };
      };
      return {
        open:[...document.querySelectorAll('.narr__stat.is-open')].map(x => x.dataset.step),
        details:['5','4','3','2'].map(step => {
          const detail = document.querySelector(`.narr__stat[data-step="${step}"] .narr__detail`);
          const r = rr(detail);
          const lineHeight = parseFloat(getComputedStyle(detail).lineHeight);
          return { step, lines:Math.round(r.height / lineHeight) };
        }),
        stats:['1','2','3','4','5'].map(step => rr(document.querySelector(`.narr__stat[data-step="${step}"]`)))
      };
    });
    assert.deepStrictEqual(expanded.open.sort(), ['2','3','4','5'], `${label} multi-open state`);
    expanded.details.forEach(detail => assert(detail.lines <= 2, `${label} step ${detail.step}: ${detail.lines} lines`));
    for (let i = 0; i < expanded.stats.length - 1; i++) {
      assert(expanded.stats[i].bottom + 5 <= expanded.stats[i + 1].top, `${label} expanded stations overlap at ${i}`);
    }

    await page.hover('.rail__link--data');
    const hover = await page.evaluate(() => {
      const el = document.querySelector('.rail__link--data');
      const n = el.querySelector('.n');
      return { color:getComputedStyle(el).color, nColor:getComputedStyle(n).color };
    });
    assert(hover.color === 'rgb(0, 69, 93)', `${label} DATA hover ${hover.color}`);
    assert(hover.nColor === 'rgb(0, 69, 93)', `${label} DATA number hover ${hover.nColor}`);

    await page.screenshot({ path:`/tmp/${label}.png`, fullPage:false });
    console.log(label, JSON.stringify({ base, expanded, hover }));
    await page.close();
  }

  async function mobile() {
    const page = await load(390, 844);
    const data = await page.evaluate(() => {
      const q = selector => document.querySelector(selector);
      const rr = element => {
        const r = element.getBoundingClientRect();
        return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width };
      };
      const rail = rr(q('.rail'));
      const dataLink = q('.rail__link--data');
      return {
        arc:rr(q('.narr-zone .arc')),
        axis:rr(q('.mobile-arrow-axis')),
        steps:[...document.querySelectorAll('.narr__stat')].map(x => x.dataset.step),
        lastText:q('.narr__stat[data-step="1"]').innerText,
        dataHref:dataLink && dataLink.getAttribute('href'),
        rail,
        scrollWidth:document.body.scrollWidth,
        innerWidth
      };
    });

    near(data.axis.left + data.axis.width / 2, data.arc.left, 1.2, 'mobile axis/left foot');
    near(data.axis.top, data.arc.bottom, 1.2, 'mobile axis/spring');
    assert.deepStrictEqual(data.steps, ['5','4','3','2','1'], 'mobile order');
    assert(/PERCURSO/i.test(data.lastText), 'mobile 1 PERCURSO missing');
    assert(data.dataHref === 'data.html', 'mobile DATA href missing');
    assert(data.rail.right <= data.innerWidth + 1, `mobile rail overflow ${data.rail.right}`);
    assert(data.scrollWidth <= data.innerWidth + 1, `mobile document overflow ${data.scrollWidth}`);
    await page.screenshot({ path:'/tmp/b2b-mobile-v3.png', fullPage:false });
    await page.close();
  }

  await desktop(1600, 1000, 'b2b-v3-1600');
  await desktop(1024, 768, 'b2b-v3-1024');
  await mobile();
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exit(1);
});
