from __future__ import annotations

import argparse
import json
import math
import os
import time
from pathlib import Path
from typing import Any

from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

DESKTOPS = [
    (821, 900), (900, 900), (1024, 768), (1100, 800),
    (1280, 800), (1366, 768), (1440, 900), (1920, 1080),
]
MOBILES = [
    (320, 568), (360, 800), (390, 844), (412, 915),
    (430, 932), (768, 1024), (820, 1180),
]
STEPS = ["5", "4", "3", "2", "1"]
BASELINE_SHA = "f116a1d3d9671f2ac016b9147d85004c59955935"


def rect_dict(page, selector: str) -> dict[str, float] | None:
    return page.eval_on_selector(
        selector,
        """el => {
          const r = el.getBoundingClientRect();
          return {left:r.left, top:r.top, width:r.width, height:r.height,
                  right:r.right, bottom:r.bottom,
                  centerX:r.left+r.width/2, centerY:r.top+r.height/2};
        }""",
    )


def geometry(page) -> dict[str, Any]:
    out: dict[str, Any] = {
        "arc": rect_dict(page, ".view[data-view='home'] .arc"),
        "spring": rect_dict(page, ".view[data-view='home'] .spring"),
        "numbers": {}, "shorts": {}, "details": {}, "segments": [],
    }
    for step in STEPS:
        out["numbers"][step] = rect_dict(page, f".narr__stat[data-step='{step}'] .narr__n")
        out["shorts"][step] = rect_dict(page, f".narr__stat[data-step='{step}'] .narr__short")
        out["details"][step] = rect_dict(page, f".narr__stat[data-step='{step}'] .narr__detail")
    out["segments"] = page.eval_on_selector_all(
        ".hero-v2-seg",
        "els => els.map(el => { const r=el.getBoundingClientRect(); return {left:r.left,top:r.top,width:r.width,height:r.height}; })",
    )
    out["classes"] = page.eval_on_selector(".view[data-view='home'] .home", "el => [...el.classList]")
    return out


def detail_state(page) -> dict[str, Any]:
    return page.evaluate(
        """() => Object.fromEntries([...document.querySelectorAll('.narr__stat')].map(stat => {
          const step=stat.dataset.step, b=stat.querySelector('.narr__n'), d=stat.querySelector('.narr__detail');
          return [step,{open:stat.classList.contains('is-open'), hidden:d ? d.hidden : null,
            ariaHidden:d?.getAttribute('aria-hidden') ?? null,
            expanded:b?.getAttribute('aria-expanded') ?? null,
            fixo:stat.dataset.fixo ?? null}];
        }))"""
    )


def wait_fonts(page):
    page.evaluate("document.fonts ? document.fonts.ready : Promise.resolve()")
    page.wait_for_timeout(120)


def request_narrative(page, w: int, h: int):
    page.mouse.move(8, max(8, h - 12))


def wait_desktop_ready(page, timeout=12000):
    page.wait_for_function(
        "document.querySelector('.view[data-view=\"home\"] .home')?.classList.contains('hero-v2-details-ready')",
        timeout=timeout,
    )
    page.wait_for_timeout(80)


def capture(page, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(path), full_page=False, animations="disabled")


def computed_snapshot(page) -> dict[str, Any]:
    return page.evaluate(
        """() => {
          const pick = (el, props) => {
            if (!el) return null; const cs=getComputedStyle(el); const o={};
            props.forEach(p => o[p]=cs.getPropertyValue(p)); return o;
          };
          const home=document.querySelector('.view[data-view="home"] .home');
          return {
            home: home ? [...home.classList] : [],
            number: pick(document.querySelector('.narr__n'), ['font-family','font-size','line-height','letter-spacing','opacity','transform','box-shadow']),
            short: pick(document.querySelector('.narr__short'), ['font-family','font-size','line-height','letter-spacing','opacity','transform']),
            detail: pick(document.querySelector('.narr__detail'), ['font-family','font-size','line-height','letter-spacing','opacity','transform']),
            arc: pick(document.querySelector('.arc'), ['left','top','width','height']),
          };
        }"""
    )


def assert_cumulative(page) -> list[str]:
    errors: list[str] = []
    for step in STEPS:
        page.locator(f".narr__stat[data-step='{step}'] .narr__n").hover()
        page.wait_for_timeout(70)
    state = detail_state(page)
    for step in STEPS:
        s = state[step]
        if not s["open"] or s["hidden"] or s["expanded"] != "true":
            errors.append(f"detail {step} did not remain cumulatively open: {s}")
    page.mouse.move(8, 8)
    page.wait_for_timeout(80)
    after_leave = detail_state(page)
    for step in STEPS:
        if not after_leave[step]["open"] or after_leave[step]["hidden"]:
            errors.append(f"detail {step} closed on pointerleave")
    page.locator(".narr__stat[data-step='3'] .narr__n").click()
    page.wait_for_timeout(80)
    after_click = detail_state(page)
    for step in STEPS:
        if not after_click[step]["open"] or after_click[step]["hidden"]:
            errors.append(f"detail {step} closed after click on already-open station")
    return errors


def desktop_case(browser, base_url: str, out_dir: Path, w: int, h: int) -> dict[str, Any]:
    context = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
    page = context.new_page()
    page.goto(base_url + "/arco.html", wait_until="load")
    wait_fonts(page)
    key = f"{w}x{h}"
    capture(page, out_dir / key / "01-initial.png")
    initial = geometry(page)
    computed_initial = computed_snapshot(page)
    request_narrative(page, w, h)
    ready_error = None
    try:
        wait_desktop_ready(page)
    except PlaywrightTimeoutError:
        ready_error = "details-ready timeout"
    capture(page, out_dir / key / "09-titles-settled.png")
    final_closed = geometry(page)
    state_closed = detail_state(page)
    errors: list[str] = []
    if ready_error:
        errors.append(ready_error)
    for step in STEPS:
        if state_closed[step]["open"] or not state_closed[step]["hidden"]:
            errors.append(f"detail {step} open before post-gate hover")
    if not ready_error:
        errors.extend(assert_cumulative(page))
    capture(page, out_dir / key / "12-all-details-open.png")
    all_open = geometry(page)
    open_state = detail_state(page)
    computed_final = computed_snapshot(page)
    context.close()
    return {
        "viewport": [w, h], "errors": errors,
        "initial": initial, "finalClosed": final_closed, "allOpen": all_open,
        "stateClosed": state_closed, "stateOpen": open_state,
        "computedInitial": computed_initial, "computedFinal": computed_final,
    }


def premature_case(browser, base_url: str, step: str, out_dir: Path) -> dict[str, Any]:
    w, h = 1366, 768
    context = browser.new_context(viewport={"width": w, "height": h})
    page = context.new_page()
    page.goto(base_url + "/arco.html", wait_until="load")
    wait_fonts(page)
    loc = page.locator(f".narr__stat[data-step='{step}'] .narr__n")
    box = loc.bounding_box()
    errors: list[str] = []
    if not box:
        errors.append("target has no box")
    else:
        page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
        try:
            wait_desktop_ready(page)
        except PlaywrightTimeoutError:
            errors.append("details-ready timeout")
        state = detail_state(page)[step]
        if state["open"] or not state["hidden"]:
            errors.append(f"premature hover queued/opened detail {step}: {state}")
        page.mouse.move(8, 8)
        page.wait_for_timeout(80)
        loc.hover()
        page.wait_for_timeout(100)
        state2 = detail_state(page)[step]
        if not state2["open"] or state2["hidden"]:
            errors.append(f"new hover did not open detail {step}: {state2}")
    capture(page, out_dir / f"premature-{step}.png")
    result = {"step": step, "errors": errors, "state": detail_state(page)}
    context.close()
    return result


def navigation_case(browser, base_url: str) -> dict[str, Any]:
    w, h = 1366, 768
    context = browser.new_context(viewport={"width": w, "height": h})
    page = context.new_page()
    page.goto(base_url + "/arco.html", wait_until="load")
    wait_fonts(page)
    request_narrative(page, w, h)
    wait_desktop_ready(page)
    before = geometry(page)["numbers"]
    errors: list[str] = []
    deltas: dict[str, Any] = {}
    for view in ["echo", "atrio", "data"]:
        page.locator(f"button.rail__link[data-view='{view}']").click()
        page.wait_for_timeout(180)
        page.locator("button.rail__title[data-view='home']").click()
        page.wait_for_timeout(180)
        after = geometry(page)["numbers"]
        d = max_rect_delta(before, after)
        deltas[view] = d
        if d > 0.25:
            errors.append(f"HOME -> {view.upper()} -> HOME geometry delta {d:.4f}px")
    context.close()
    return {"errors": errors, "maxDeltas": deltas}


def breakpoint_case(browser, base_url: str) -> dict[str, Any]:
    context = browser.new_context(viewport={"width": 1000, "height": 900})
    page = context.new_page()
    page.goto(base_url + "/arco.html", wait_until="load")
    wait_fonts(page)
    request_narrative(page, 1000, 900)
    page.wait_for_timeout(600)
    errors: list[str] = []
    states = []
    for w in [800, 1000, 800, 1000]:
        page.set_viewport_size({"width": w, "height": 900})
        page.wait_for_timeout(500)
        states.append(page.evaluate("""() => ({w:innerWidth, home:[...document.querySelector('.home').classList],
          cross:document.querySelectorAll('.hero-cross-axis').length,
          v2:document.querySelectorAll('.hero-v2-seg').length,
          mobile:document.querySelectorAll('.mobile-arrow-axis').length,
          visibleMobile:[...document.querySelectorAll('.mobile-arrow-axis')].filter(e=>getComputedStyle(e).display!=='none'&&!e.hidden).length})"""))
    if any(s["mobile"] > 1 for s in states):
        errors.append("duplicate mobile axis after breakpoint changes")
    context.close()
    return {"errors": errors, "states": states}


def mobile_case(browser, base_url: str, out_dir: Path, w: int, h: int) -> dict[str, Any]:
    context = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
    page = context.new_page()
    page.goto(base_url + "/arco.html", wait_until="load")
    wait_fonts(page)
    key = f"{w}x{h}"
    capture(page, out_dir / key / "01-initial.png")
    request_narrative(page, w, h)
    page.wait_for_timeout(4200)
    initial_seen = page.locator("[data-arrow-seen='true']").count()
    samples = []
    targets = [f".narr__stat[data-step='{s}']" for s in STEPS] + [
        ".arcade > .mov:nth-child(1) .mov__h",
        ".arcade > .mov:nth-child(2) .mov__h",
        ".arcade > .mov:nth-child(3) .mov__h",
    ]
    last_seen = initial_seen
    errors: list[str] = []
    for sel in targets:
        page.locator(sel).scroll_into_view_if_needed()
        page.wait_for_timeout(460)
        seen = page.locator("[data-arrow-seen='true']").count()
        axis = page.eval_on_selector(".mobile-arrow-axis", "el => ({h:parseFloat(getComputedStyle(el).height)||0, hidden:el.hidden})")
        samples.append({"selector": sel, "seen": seen, "axis": axis})
        if seen < last_seen:
            errors.append(f"mobile progression regressed {last_seen}->{seen} at {sel}")
        last_seen = seen
    capture(page, out_dir / key / "final.png")
    if initial_seen >= 8:
        errors.append("mobile completed all checkpoints before viewport progression")
    if last_seen < 8:
        errors.append(f"mobile did not reach all 8 checkpoints: {last_seen}")
    geom = geometry(page)
    state = detail_state(page)
    context.close()
    return {"viewport": [w, h], "errors": errors, "initialSeen": initial_seen, "samples": samples, "geometry": geom, "detailState": state}


def reduced_motion_case(browser, base_url: str, mobile=False) -> dict[str, Any]:
    vp = {"width": 390, "height": 844} if mobile else {"width": 1366, "height": 768}
    context = browser.new_context(viewport=vp, reduced_motion="reduce")
    page = context.new_page()
    page.goto(base_url + "/arco.html", wait_until="load")
    wait_fonts(page)
    page.wait_for_timeout(400)
    errors: list[str] = []
    if mobile:
        visible = page.locator(".narr__mobile-copy").evaluate_all("els => els.every(e => getComputedStyle(e).display !== 'none')")
        if not visible:
            errors.append("mobile essential copy hidden under reduced motion")
    else:
        nums = page.locator(".narr__n").evaluate_all("els => els.every(e => parseFloat(getComputedStyle(e).opacity) > .99)")
        shorts = page.locator(".narr__short").evaluate_all("els => els.every(e => parseFloat(getComputedStyle(e).opacity) > .99)")
        if not nums or not shorts:
            errors.append("desktop essential content blocked under reduced motion")
        page.locator(".narr__stat[data-step='5'] .narr__n").hover()
        page.wait_for_timeout(80)
        s = detail_state(page)["5"]
        if not s["open"] or s["hidden"]:
            errors.append("desktop interaction blocked under reduced motion")
    context.close()
    return {"mobile": mobile, "errors": errors}


def timing_case(browser, base_url: str) -> dict[str, Any]:
    context = browser.new_context(viewport={"width": 1366, "height": 768})
    page = context.new_page()
    page.add_init_script("""
      window.__ARCO_AUDIT_EVENTS=[];
      const rec=(name,step='')=>window.__ARCO_AUDIT_EVENTS.push({name,step,t:performance.now()});
      addEventListener('DOMContentLoaded',()=>{
        const spring=document.querySelector('.spring');
        spring?.addEventListener('transitionrun',e=>{if(e.propertyName==='stroke-dashoffset')rec('springStart')});
        spring?.addEventListener('transitionend',e=>{if(e.propertyName==='stroke-dashoffset')rec('springSettled')});
        document.addEventListener('transitionrun',e=>{
          if(e.target?.classList?.contains('narr__n')) rec('numberStart',e.target.closest('.narr__stat')?.dataset.step||'');
          if(e.target?.classList?.contains('narr__short')) rec('titleStart',e.target.closest('.narr__stat')?.dataset.step||'');
        },true);
        document.addEventListener('transitionend',e=>{
          if(e.target?.classList?.contains('narr__n')) rec('numberSettled',e.target.closest('.narr__stat')?.dataset.step||'');
          if(e.target?.classList?.contains('narr__short')) rec('titleSettled',e.target.closest('.narr__stat')?.dataset.step||'');
        },true);
        const home=document.querySelector('.home');
        if(home){
          let wasPlay=home.classList.contains('hero-v2-play');
          let wasDetails=home.classList.contains('hero-v2-details-ready');
          new MutationObserver(()=>{
            const play=home.classList.contains('hero-v2-play');
            const details=home.classList.contains('hero-v2-details-ready');
            if(play&&!wasPlay) rec('lineStart');
            if(details&&!wasDetails) rec('detailsReady');
            wasPlay=play; wasDetails=details;
          }).observe(home,{attributes:true,attributeFilter:['class']});
        }
      });
    """)
    page.goto(base_url + "/arco.html", wait_until="load")
    wait_fonts(page)
    request_narrative(page, 1366, 768)
    errors: list[str] = []
    try:
        wait_desktop_ready(page)
    except PlaywrightTimeoutError:
        errors.append("timing case details-ready timeout")
    page.wait_for_timeout(160)
    events = page.evaluate("window.__ARCO_AUDIT_EVENTS")
    def times(name): return [e["t"] for e in events if e["name"] == name]
    spring = times("springSettled")
    line = times("lineStart")
    nend = times("numberSettled")
    tstart = times("titleStart")
    tend = times("titleSettled")
    detail = times("detailsReady")
    if spring and line and min(line) + .001 < max(spring): errors.append("lineStart < springSettled")
    if nend and tstart and min(tstart) + .001 < max(nend): errors.append("firstTitleStart < lastNumberSettled")
    if tend and detail and min(detail) + .001 < max(tend): errors.append("detailsReady < lastTitleSettled")
    if not all([spring, line, nend, tstart, tend, detail]):
        errors.append("missing critical timing event(s)")
    context.close()
    return {"errors": errors, "events": events}


def observer_case(browser, base_url: str) -> dict[str, Any]:
    context = browser.new_context(viewport={"width": 1366, "height": 768})
    page = context.new_page()
    page.add_init_script("""
      window.__ARCO_COUNTS={mutation:0,resizeObserver:0,listeners:{}};
      const MO=window.MutationObserver; window.MutationObserver=class extends MO{constructor(cb){window.__ARCO_COUNTS.mutation++;super(cb)}};
      const RO=window.ResizeObserver; if(RO) window.ResizeObserver=class extends RO{constructor(cb){window.__ARCO_COUNTS.resizeObserver++;super(cb)}};
      const add=EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener=function(type,fn,opt){
        if(['resize','orientationchange','pointerenter','pointerleave','pointermove','click','focusin','focusout'].includes(type))
          window.__ARCO_COUNTS.listeners[type]=(window.__ARCO_COUNTS.listeners[type]||0)+1;
        return add.call(this,type,fn,opt);
      };
    """)
    page.goto(base_url + "/arco.html", wait_until="load")
    wait_fonts(page)
    counts = page.evaluate("window.__ARCO_COUNTS")
    nodes = page.evaluate("""() => ({crossAxis:document.querySelectorAll('.hero-cross-axis').length,
      crossLink:document.querySelectorAll('.hero-cross-link').length,
      v2Seg:document.querySelectorAll('.hero-v2-seg').length,
      v2Link:document.querySelectorAll('.hero-v2-link').length,
      mobileAxis:document.querySelectorAll('.mobile-arrow-axis').length,
      narrLine:document.querySelectorAll('.narr__line').length})""")
    context.close()
    return {"counts": counts, "nodes": nodes}


def max_rect_delta(a: Any, b: Any) -> float:
    vals: list[float] = []
    def walk(x, y):
        if isinstance(x, dict) and isinstance(y, dict):
            for k in x.keys() & y.keys(): walk(x[k], y[k])
        elif isinstance(x, list) and isinstance(y, list):
            for xx, yy in zip(x, y): walk(xx, yy)
        elif isinstance(x, (int, float)) and isinstance(y, (int, float)):
            if math.isfinite(float(x)) and math.isfinite(float(y)): vals.append(abs(float(x)-float(y)))
    walk(a, b)
    return max(vals, default=0.0)


def image_diff(a: Path, b: Path) -> dict[str, Any]:
    ia, ib = Image.open(a).convert("RGBA"), Image.open(b).convert("RGBA")
    if ia.size != ib.size:
        return {"sameSize": False, "differentPixels": -1, "bbox": None}
    diff = ImageChops.difference(ia, ib)
    bbox = diff.getbbox()
    if bbox is None:
        return {"sameSize": True, "differentPixels": 0, "bbox": None}
    # Count pixels with any differing channel.
    px = diff.getdata()
    count = sum(1 for p in px if any(p))
    return {"sameSize": True, "differentPixels": count, "bbox": bbox}


def run_suite(browser, url: str, out_dir: Path) -> dict[str, Any]:
    report: dict[str, Any] = {"baselineSha": BASELINE_SHA, "url": url, "desktop": {}, "mobile": {}}
    for w, h in DESKTOPS:
        report["desktop"][f"{w}x{h}"] = desktop_case(browser, url, out_dir / "desktop", w, h)
    for step in ["5", "1", "3"]:
        report.setdefault("premature", {})[step] = premature_case(browser, url, step, out_dir / "premature")
    report["navigation"] = navigation_case(browser, url)
    report["breakpoint"] = breakpoint_case(browser, url)
    for w, h in MOBILES:
        report["mobile"][f"{w}x{h}"] = mobile_case(browser, url, out_dir / "mobile", w, h)
    report["reducedMotion"] = {
        "desktop": reduced_motion_case(browser, url, False),
        "mobile": reduced_motion_case(browser, url, True),
    }
    report["timing"] = timing_case(browser, url)
    report["runtimeCounts"] = observer_case(browser, url)
    return report


def collect_errors(report: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    def walk(path: str, node: Any):
        if isinstance(node, dict):
            if isinstance(node.get("errors"), list):
                errors.extend(f"{path}: {e}" for e in node["errors"])
            for k, v in node.items():
                if k != "errors": walk(f"{path}.{k}" if path else k, v)
        elif isinstance(node, list):
            for i, v in enumerate(node): walk(f"{path}[{i}]", v)
    walk("", report)
    return errors


def compare_reports(base: dict[str, Any], cur: dict[str, Any], base_dir: Path, cur_dir: Path) -> dict[str, Any]:
    cmp: dict[str, Any] = {"geometry": {}, "pixels": {}, "runtime": {}, "errors": []}
    for key in base["desktop"]:
        b = base["desktop"][key]
        c = cur["desktop"][key]
        for state in ["initial", "finalClosed", "allOpen"]:
            d = max_rect_delta(b[state], c[state])
            cmp["geometry"][f"desktop/{key}/{state}"] = d
            if d >= 0.25:
                cmp["errors"].append(f"geometry desktop/{key}/{state} delta {d:.4f}px >= 0.25px")
        for image in ["01-initial.png", "09-titles-settled.png", "12-all-details-open.png"]:
            p = image_diff(base_dir / "desktop" / key / image, cur_dir / "desktop" / key / image)
            cmp["pixels"][f"desktop/{key}/{image}"] = p
            if p["differentPixels"] != 0:
                cmp["errors"].append(f"pixel diff desktop/{key}/{image}: {p['differentPixels']} pixels")
    for key in base["mobile"]:
        d = max_rect_delta(base["mobile"][key]["geometry"], cur["mobile"][key]["geometry"])
        cmp["geometry"][f"mobile/{key}/final"] = d
        if d >= 0.25:
            cmp["errors"].append(f"geometry mobile/{key} delta {d:.4f}px >= 0.25px")
        for image in ["01-initial.png", "final.png"]:
            p = image_diff(base_dir / "mobile" / key / image, cur_dir / "mobile" / key / image)
            cmp["pixels"][f"mobile/{key}/{image}"] = p
            if p["differentPixels"] != 0:
                cmp["errors"].append(f"pixel diff mobile/{key}/{image}: {p['differentPixels']} pixels")
    bc = base["runtimeCounts"]["counts"]
    cc = cur["runtimeCounts"]["counts"]
    cmp["runtime"] = {"baseline": bc, "current": cc}
    if cc.get("mutation", 0) > bc.get("mutation", 0): cmp["errors"].append("MutationObserver count increased")
    if cc.get("resizeObserver", 0) > bc.get("resizeObserver", 0): cmp["errors"].append("ResizeObserver count increased")
    for typ, count in cc.get("listeners", {}).items():
        if count > bc.get("listeners", {}).get(typ, 0):
            cmp["errors"].append(f"listener count increased for {typ}")
    return cmp


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--baseline-url", required=True)
    ap.add_argument("--current-url", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    root = Path(args.out)
    base_dir, cur_dir = root / "baseline", root / "current"
    root.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        baseline = run_suite(browser, args.baseline_url, base_dir)
        current = run_suite(browser, args.current_url, cur_dir)
        browser.close()
    comparison = compare_reports(baseline, current, base_dir, cur_dir)
    baseline_errors = collect_errors(baseline)
    current_errors = collect_errors(current)
    summary = {
        "baselineSha": BASELINE_SHA,
        "baselineErrors": baseline_errors,
        "currentErrors": current_errors,
        "comparison": comparison,
        "status": "PASS" if not baseline_errors and not current_errors and not comparison["errors"] else "FAIL",
    }
    (root / "baseline-report.json").write_text(json.dumps(baseline, indent=2, ensure_ascii=False))
    (root / "current-report.json").write_text(json.dumps(current, indent=2, ensure_ascii=False))
    (root / "summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False))
    print(json.dumps(summary, indent=2, ensure_ascii=False))
    if summary["status"] != "PASS":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
