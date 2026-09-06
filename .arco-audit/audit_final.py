from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import audit as a
import audit_fixed  # installs calibrated executable cases into audit

base_compare = a.compare_reports


def timing_intervals(report):
    m = report.get('timing', {}).get('milestones', {})
    keys = ['springSettled','lineStart','lastNumberSettled','firstTitleStart','lastTitleSettled','detailsReady']
    if any(m.get(k) is None for k in keys):
        return None
    return {
        'spring_to_line': m['lineStart'] - m['springSettled'],
        'line_to_last_number': m['lastNumberSettled'] - m['lineStart'],
        'last_number_to_first_title': m['firstTitleStart'] - m['lastNumberSettled'],
        'titles_span': m['lastTitleSettled'] - m['firstTitleStart'],
        'last_title_to_details': m['detailsReady'] - m['lastTitleSettled'],
    }


def visual_computed(snapshot):
    if not snapshot:
        return snapshot
    # Classes de coordenação são implementação; computed values são produto.
    return {k:v for k,v in snapshot.items() if k != 'home'}


def final_compare(base, cur, base_dir, cur_dir):
    cmp = base_compare(base, cur, base_dir, cur_dir)
    cmp.setdefault('semantics', {})
    cmp.setdefault('timingDeltaMs', {})
    cmp.setdefault('auxiliaryNodes', {})

    for key in base['mobile']:
        bs = base['mobile'][key].get('detailState')
        cs = cur['mobile'][key].get('detailState')
        cmp['semantics'][f'mobile/{key}/detailState'] = {'baseline': bs, 'current': cs}
        if bs != cs:
            cmp['errors'].append(f'mobile/{key} detail/ARIA state changed')

        b_seen = [s['seen'] for s in base['mobile'][key].get('samples', [])]
        c_seen = [s['seen'] for s in cur['mobile'][key].get('samples', [])]
        cmp['semantics'][f'mobile/{key}/seen'] = {'baseline': b_seen, 'current': c_seen}
        if b_seen != c_seen:
            cmp['errors'].append(f'mobile/{key} viewport checkpoint sequence changed')

    for key in base['desktop']:
        for state in ['stateClosed', 'stateOpen']:
            bs = base['desktop'][key].get(state)
            cs = cur['desktop'][key].get(state)
            cmp['semantics'][f'desktop/{key}/{state}'] = {'baseline': bs, 'current': cs}
            if bs != cs:
                cmp['errors'].append(f'desktop/{key}/{state} interaction/ARIA state changed')
        for state in ['computedInitial', 'computedFinal']:
            bs = visual_computed(base['desktop'][key].get(state))
            cs = visual_computed(cur['desktop'][key].get(state))
            if bs != cs:
                cmp['errors'].append(f'desktop/{key}/{state} computed visual style changed')

    bi = timing_intervals(base)
    ci = timing_intervals(cur)
    if bi is None or ci is None:
        cmp['errors'].append('timing interval comparison unavailable')
    else:
        for name, bv in bi.items():
            delta = ci[name] - bv
            cmp['timingDeltaMs'][name] = delta
            if abs(delta) > 34:
                cmp['errors'].append(f'timing {name} changed by {delta:.2f}ms')

    bn = base.get('runtimeCounts', {}).get('nodes', {})
    cn = cur.get('runtimeCounts', {}).get('nodes', {})
    cmp['auxiliaryNodes'] = {'baseline': bn, 'current': cn}
    for name, count in cn.items():
        if count > bn.get(name, 0):
            cmp['errors'].append(f'auxiliary node count increased for {name}')

    return cmp


a.compare_reports = final_compare

if __name__ == '__main__':
    a.main()
