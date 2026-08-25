const { chromium } = require('playwright-core');
const assert = require('assert');

const expected = {
  '5':'domínios organizam 17 mecanismos, com ao menos 86 nomenclaturas equivalentes usadas no mercado privado.',
  '4':'módulos de IA jurídica compõem ATRIO: arquitetura local end-to-end, com 175 testes e 115.114 julgados.',
  '3':'núcleos estruturam 10 temáticas de 102 assuntos, em taxonomia aplicada à triagem de 1.792 processos.',
  '2':'projetos implementados e documentados — ECHO e ATRIO — derivados de uma operação jurídica de alto volume.',
  '1':'percurso entre gestão, operação e tecnologia, na encruzilhada entre Direito, dados, IA e governança.'
};
const expectedLengths = {'5':103,'4':102,'3':100,'2':105,'1':100};
const near = (a,b,t,msg) => assert(Math.abs(a-b) <= t, `${msg}: ${a} vs ${b}`);

(async () => {
  const browser = await chromium.launch({
    headless:true,
    executablePath:process.env.CHROME_PATH,
    args:['--no-sandbox','--disable-dev-shm-usage']
  });

  async function load(width,height){
    const page = await browser.newPage({viewport:{width,height}});
    const errors=[];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto('http://127.0.0.1:8765/arco.html',{waitUntil:'networkidle'});
    await page.evaluate(() => document.fonts?.ready);
    await page.mouse.move(150,120);
    await page.waitForTimeout(width <= 820 ? 5000 : 4200);
    assert.deepStrictEqual(errors,[],`page errors ${width}: ${errors.join('; ')}`);
    return page;
  }

  // Desktop must remain semantically and visually on the existing short/detail system.
  {
    const page = await load(1600,1000);
    const data = await page.evaluate(() => {
      const steps=['5','4','3','2','1'];
      return steps.map(step => {
        const stat=document.querySelector(`.narr__stat[data-step="${step}"]`);
        const mobile=stat.querySelector('.narr__mobile-copy');
        const short=stat.querySelector('.narr__short');
        return {
          step,
          number:stat.querySelector('.narr__n').textContent.trim(),
          mobileDisplay:getComputedStyle(mobile).display,
          shortText:short?.textContent.trim() || ''
        };
      });
    });
    assert.deepStrictEqual(data.map(x=>x.number),['5','4','3','2','1'],'desktop numbers changed');
    data.forEach(x => assert(x.mobileDisplay === 'none', `desktop mobile copy visible at ${x.step}`));
    assert(data.find(x=>x.step==='1').shortText === 'PERCURSO','desktop 1/PERCURSO changed');
    await page.close();
  }

  async function mobile(width,height,label){
    const page=await load(width,height);
    const data=await page.evaluate(() => {
      const rr=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
      const arc=rr(document.querySelector('.narr-zone .arc'));
      const axis=rr(document.querySelector('.mobile-arrow-axis'));
      const stats=[...document.querySelectorAll('.narr__stat')].map(stat => {
        const mobile=stat.querySelector('.narr__mobile-copy');
        const visibleLabels=[...stat.querySelectorAll('.narr__l')].filter(el => getComputedStyle(el).display !== 'none');
        return {
          step:stat.dataset.step,
          number:stat.querySelector('.narr__n').textContent.trim(),
          text:mobile.textContent.trim(),
          mobileDisplay:getComputedStyle(mobile).display,
          visibleLabelCount:visibleLabels.length,
          rect:rr(stat)
        };
      });
      return {arc,axis,stats,scrollWidth:document.body.scrollWidth,innerWidth};
    });

    near(data.axis.left + data.axis.width/2, data.arc.left, 1.2, `${label} axis/left foot`);
    near(data.axis.top, data.arc.bottom, 1.2, `${label} axis/spring`);
    assert.deepStrictEqual(data.stats.map(x=>x.step),['5','4','3','2','1'],`${label} order`);
    assert.deepStrictEqual(data.stats.map(x=>x.number),['5','4','3','2','1'],`${label} numbers`);

    for(const stat of data.stats){
      assert(stat.mobileDisplay !== 'none',`${label} mobile copy hidden ${stat.step}`);
      assert.strictEqual(stat.text,expected[stat.step],`${label} copy mismatch ${stat.step}`);
      assert.strictEqual(stat.text.length,expectedLengths[stat.step],`${label} char count ${stat.step}`);
      assert.strictEqual(stat.visibleLabelCount,1,`${label} more than one visible label at ${stat.step}`);
    }
    for(let i=0;i<data.stats.length-1;i++){
      assert(data.stats[i].rect.bottom <= data.stats[i+1].rect.top + 1,`${label} metric overlap ${data.stats[i].step}/${data.stats[i+1].step}`);
    }
    assert(data.scrollWidth <= data.innerWidth + 1,`${label} horizontal overflow`);
    await page.screenshot({path:`/tmp/${label}.png`,fullPage:false});
    await page.close();
  }

  await mobile(390,844,'mobile-copy-v4-390');
  await mobile(430,932,'mobile-copy-v4-430');
  await browser.close();
  console.log('mobile copy v4 validation passed', expectedLengths);
})().catch(err=>{console.error(err);process.exit(1);});
