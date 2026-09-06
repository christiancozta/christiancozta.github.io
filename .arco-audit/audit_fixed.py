from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import audit as a
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError


def desktop_case(browser, base_url, out_dir, w, h):
    context = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
    page = context.new_page()
    page.goto(base_url + "/arco.html", wait_until="load")
    a.wait_fonts(page)
    key = f"{w}x{h}"
    a.capture(page, out_dir / key / "01-initial.png")
    initial = a.geometry(page)
    computed_initial = a.computed_snapshot(page)
    a.request_narrative(page, w, h)
    page.wait_for_timeout(260)
    # Entre 821 e 1000 o rail vira topo e a curva pode começar abaixo da dobra.
    # O baseline só arma o desenho quando a própria curva entra no campo.
    if not page.locator(".view[data-view='home'] .arc").evaluate("el => el.classList.contains('is-in')"):
        page.locator(".view[data-view='home'] .arc").evaluate("el => el.scrollIntoView({block:'center'})")
        page.wait_for_timeout(120)
    errors = []
    try:
        a.wait_desktop_ready(page)
    except PlaywrightTimeoutError:
        errors.append("details-ready timeout after bringing arc into viewport")
    a.capture(page, out_dir / key / "09-titles-settled.png")
    final_closed = a.geometry(page)
    state_closed = a.detail_state(page)
    for step in a.STEPS:
        if state_closed[step]["open"] or not state_closed[step]["hidden"]:
            errors.append(f"detail {step} open before post-gate hover")
    if not errors:
        errors.extend(a.assert_cumulative(page))
    a.capture(page, out_dir / key / "12-all-details-open.png")
    all_open = a.geometry(page)
    open_state = a.detail_state(page)
    computed_final = a.computed_snapshot(page)
    context.close()
    return {
        "viewport": [w, h], "errors": errors,
        "initial": initial, "finalClosed": final_closed, "allOpen": all_open,
        "stateClosed": state_closed, "stateOpen": open_state,
        "computedInitial": computed_initial, "computedFinal": computed_final,
    }


def mobile_case(browser, base_url, out_dir, w, h):
    context = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
    page = context.new_page()
    page.goto(base_url + "/arco.html", wait_until="load")
    a.wait_fonts(page)
    key = f"{w}x{h}"
    a.capture(page, out_dir / key / "01-initial.png")
    a.request_narrative(page, w, h)
    page.wait_for_timeout(2800)
    initial_seen = page.locator("[data-arrow-seen='true']").count()
    initial_visible = page.evaluate("""() => {
      const pts=[...document.querySelectorAll('.narr__stat'), ...document.querySelectorAll('.arcade > .mov > .mov__h')];
      const limit=innerHeight*.92;
      return pts.filter(el=>{const r=el.getBoundingClientRect(); return r.bottom>0 && r.top<limit;}).length;
    }""")
    samples = []
    targets = [f".narr__stat[data-step='{s}']" for s in a.STEPS] + [
        ".arcade > .mov:nth-child(1) .mov__h",
        ".arcade > .mov:nth-child(2) .mov__h",
        ".arcade > .mov:nth-child(3) .mov__h",
    ]
    last_seen = initial_seen
    errors = []
    if initial_seen > initial_visible:
        errors.append(f"mobile revealed {initial_seen} checkpoints with only {initial_visible} inside effective viewport")
    for sel in targets:
        page.locator(sel).evaluate("el => el.scrollIntoView({block:'center'})")
        page.wait_for_timeout(480)
        seen = page.locator("[data-arrow-seen='true']").count()
        axis = page.eval_on_selector(".mobile-arrow-axis", "el => ({h:parseFloat(getComputedStyle(el).height)||0, hidden:el.hidden})")
        samples.append({"selector": sel, "seen": seen, "axis": axis})
        if seen < last_seen:
            errors.append(f"mobile progression regressed {last_seen}->{seen} at {sel}")
        last_seen = seen
    a.capture(page, out_dir / key / "final.png")
    if last_seen < 8:
        errors.append(f"mobile did not reach all 8 checkpoints: {last_seen}")
    geom = a.geometry(page)
    state = a.detail_state(page)
    context.close()
    return {"viewport": [w, h], "errors": errors, "initialSeen": initial_seen,
            "initialVisible": initial_visible, "samples": samples,
            "geometry": geom, "detailState": state}


def timing_case(browser, base_url):
    context = browser.new_context(viewport={"width": 1366, "height": 768})
    page = context.new_page()
    page.add_init_script("""
      window.__ARCO_AUDIT_EVENTS=[];
      const rec=(name,step='',extra={})=>window.__ARCO_AUDIT_EVENTS.push({name,step,t:performance.now(),...extra});
      addEventListener('DOMContentLoaded',()=>{
        const spring=document.querySelector('.spring');
        spring?.addEventListener('transitionrun',e=>{if(e.propertyName==='stroke-dashoffset')rec('springStart')});
        spring?.addEventListener('transitionend',e=>{if(e.propertyName==='stroke-dashoffset')rec('springSettled')});
        document.addEventListener('transitionrun',e=>{
          const stat=e.target?.closest?.('.narr__stat');
          if(e.target?.classList?.contains('hero-v2-seg') && e.propertyName==='transform') rec('segmentStart');
          if(e.target?.classList?.contains('narr__n')) rec('numberStart',stat?.dataset.step||'');
          if(e.target?.classList?.contains('narr__short')) rec('titleStart',stat?.dataset.step||'',{
            locked:e.target.style.getPropertyPriority('opacity')==='important'
          });
        },true);
        document.addEventListener('transitionend',e=>{
          const stat=e.target?.closest?.('.narr__stat');
          if(e.target?.classList?.contains('hero-v2-seg') && e.propertyName==='transform') rec('segmentSettled');
          if(e.target?.classList?.contains('narr__n')) rec('numberSettled',stat?.dataset.step||'');
          if(e.target?.classList?.contains('narr__short')) rec('titleSettled',stat?.dataset.step||'',{
            locked:e.target.style.getPropertyPriority('opacity')==='important'
          });
        },true);
        const home=document.querySelector('.home');
        if(home){
          let wasDetails=home.classList.contains('hero-v2-details-ready');
          new MutationObserver(()=>{
            const details=home.classList.contains('hero-v2-details-ready');
            if(details&&!wasDetails) rec('detailsReady');
            wasDetails=details;
          }).observe(home,{attributes:true,attributeFilter:['class']});
        }
      });
    """)
    page.goto(base_url + "/arco.html", wait_until="load")
    a.wait_fonts(page)
    a.request_narrative(page, 1366, 768)
    errors=[]
    try:
        a.wait_desktop_ready(page)
    except PlaywrightTimeoutError:
        errors.append("timing case details-ready timeout")
    page.wait_for_timeout(160)
    events=page.evaluate("window.__ARCO_AUDIT_EVENTS")
    spring=[e['t'] for e in events if e['name']=='springSettled']
    settled=spring[0] if spring else None
    seg=[e['t'] for e in events if e['name']=='segmentStart' and (settled is None or e['t']>=settled-.5)]
    line=min(seg) if seg else None
    nend=[e['t'] for e in events if e['name']=='numberSettled' and line is not None and e['t']>=line]
    last_num=max(nend) if nend else None
    tstart=[e['t'] for e in events if e['name']=='titleStart' and not e.get('locked') and last_num is not None and e['t']>=line]
    first_title=min(tstart) if tstart else None
    tend=[e['t'] for e in events if e['name']=='titleSettled' and not e.get('locked') and first_title is not None and e['t']>=first_title]
    last_title=max(tend) if tend else None
    details=[e['t'] for e in events if e['name']=='detailsReady']
    details_at=min(details) if details else None
    if settled is None or line is None or last_num is None or first_title is None or last_title is None or details_at is None:
        errors.append("missing observable critical timing milestone")
    else:
        if line + .001 < settled: errors.append("lineStart < springSettled")
        if first_title + .001 < last_num: errors.append("firstTitleStart < lastNumberSettled")
        if details_at + .001 < last_title: errors.append("detailsReady < lastTitleSettled")
    result={"springSettled":settled,"lineStart":line,"lastNumberSettled":last_num,
            "firstTitleStart":first_title,"lastTitleSettled":last_title,"detailsReady":details_at}
    context.close()
    return {"errors":errors,"milestones":result,"events":events}


a.desktop_case = desktop_case
a.mobile_case = mobile_case
a.timing_case = timing_case

if __name__ == '__main__':
    a.main()
