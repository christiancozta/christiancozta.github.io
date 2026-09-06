from __future__ import annotations

import json
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE_URL = "http://127.0.0.1:4183/arco.html"
OUT = Path(".arco-audit/calibration.json")


def wait_fonts(page):
    page.evaluate("document.fonts ? document.fonts.ready : Promise.resolve()")
    page.wait_for_timeout(150)


def state(page):
    return page.evaluate("""() => {
      const home=document.querySelector('.view[data-view="home"] .home');
      const spring=document.querySelector('.spring');
      const segs=[...document.querySelectorAll('.hero-v2-seg')];
      const nums=[...document.querySelectorAll('.narr__n')];
      const shorts=[...document.querySelectorAll('.narr__short')];
      const cs=e=>e?getComputedStyle(e):null;
      return {
        t:performance.now(),
        classes:home?[...home.classList]:[],
        springDash:spring?parseFloat(cs(spring).strokeDashoffset)||0:null,
        segHeights:segs.map(e=>parseFloat(cs(e).height)||0),
        numOpacity:nums.map(e=>parseFloat(cs(e).opacity)||0),
        shortOpacity:shorts.map(e=>parseFloat(cs(e).opacity)||0),
        detailsReady:!!home?.classList.contains('hero-v2-details-ready')
      };
    }""")


def desktop_probe(browser, w, h):
    ctx=browser.new_context(viewport={"width":w,"height":h})
    p=ctx.new_page(); p.goto(BASE_URL, wait_until='load'); wait_fonts(p)
    before=state(p)
    # Two real user gestures, separated, so the probe cannot miss a narrow-layout hit target.
    p.mouse.move(max(12,w//2), max(12,h//2))
    request_t=p.evaluate('performance.now()')
    samples=[]
    for i in range(760):
        if i==20:
            p.mouse.wheel(0,1)
        s=state(p); samples.append(s)
        if s['detailsReady'] and i>10: break
        p.wait_for_timeout(16)
    ctx.close()
    return {"viewport":[w,h],"requestT":request_t,"before":before,"samples":samples}


def derive_visual(probe):
    req=probe['requestT']; ss=[s for s in probe['samples'] if s['t']>=req]
    def first(pred):
        for s in ss:
            if pred(s): return s['t']
        return None
    # Visible line means an actual segment has acquired measurable height.
    line_start=first(lambda s:any(v>0.5 for v in s['segHeights']))
    numbers_all=first(lambda s:len(s['numOpacity'])==5 and all(v>=.99 for v in s['numOpacity']))
    title_start=first(lambda s:any(v>.01 for v in s['shortOpacity']))
    titles_all=first(lambda s:len(s['shortOpacity'])==5 and all(v>=.99 for v in s['shortOpacity']))
    details=first(lambda s:s['detailsReady'])
    # Spring is considered settled only after it has visibly moved and then reaches ~0.
    moved=False; spring_settled=None
    for s in ss:
        d=s['springDash']
        if d is None: continue
        if abs(d)>.5: moved=True
        if moved and abs(d)<=.5:
            spring_settled=s['t']; break
    return {
      "springSettled":spring_settled,"lineStart":line_start,
      "lastNumberSettledApprox":numbers_all,"firstTitleStart":title_start,
      "lastTitleSettledApprox":titles_all,"detailsReady":details,
      "lineAfterSpring": None if line_start is None or spring_settled is None else line_start>=spring_settled,
      "titlesAfterNumbers": None if title_start is None or numbers_all is None else title_start>=numbers_all,
      "detailsAfterTitles": None if details is None or titles_all is None else details>=titles_all,
    }


def mobile_probe(browser,w,h):
    ctx=browser.new_context(viewport={"width":w,"height":h})
    p=ctx.new_page(); p.goto(BASE_URL, wait_until='load'); wait_fonts(p)
    p.mouse.move(w//2,h//2); p.wait_for_timeout(4200)
    selectors=[f".narr__stat[data-step='{s}']" for s in ['5','4','3','2','1']]+[
      '.arcade > .mov:nth-child(1) .mov__h',
      '.arcade > .mov:nth-child(2) .mov__h',
      '.arcade > .mov:nth-child(3) .mov__h']
    def snap(label):
      return p.evaluate("""sels=>({label:arguments[1],scrollY,
        seen:[...document.querySelectorAll('[data-arrow-seen="true"]')].map(e=>e.matches('.narr__stat')?e.dataset.step:(e.textContent||'').trim().slice(0,50)),
        points:sels.map(sel=>{const e=document.querySelector(sel); if(!e)return {sel,missing:true}; const r=e.getBoundingClientRect(); return {sel,seen:e.dataset.arrowSeen==='true',top:r.top,bottom:r.bottom,intersects:r.bottom>0&&r.top<innerHeight};})})""", selectors, label)
    snaps=[snap('initial')]
    for i,sel in enumerate(selectors):
      p.locator(sel).scroll_into_view_if_needed(); p.wait_for_timeout(500); snaps.append(snap(str(i)))
    ctx.close(); return {"viewport":[w,h],"snapshots":snaps}


def main():
  with sync_playwright() as pw:
    browser=pw.chromium.launch()
    desktops=[]
    for wh in [(821,900),(900,900),(1366,768)]:
      pr=desktop_probe(browser,*wh); desktops.append({"probe":pr,"derived":derive_visual(pr)})
    mobiles=[mobile_probe(browser,768,1024),mobile_probe(browser,820,1180)]
    browser.close()
  result={"desktop":desktops,"mobile":mobiles}
  OUT.write_text(json.dumps(result,indent=2),encoding='utf-8')
  # compact console summary
  print(json.dumps({"desktop":[{"viewport":d['probe']['viewport'],**d['derived']} for d in desktops],
                    "mobile":[{"viewport":m['viewport'],"initial":m['snapshots'][0],"final":m['snapshots'][-1]} for m in mobiles]},indent=2))

if __name__=='__main__': main()
