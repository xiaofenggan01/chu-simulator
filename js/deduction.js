// 推理板：线索收集与组合推导（不要喂食猴子式）
// 状态机：collect（场景内取证）→ deduce（拼板推导）→ 结论达成过关

import { state, levelTotal } from './engine.js'

const dd = {
  cards: [],     // 场上所有卡 {id, kind: 'fact'|'decoy'|'synth', label, detail, from?}
  collected: new Set(),  // 已收集（未收集的卡在板上仍以空槽显示）
  links: [],     // 已成立的组合记录 [{a, b, out}]
  selected: [],  // 当前点选中的卡 id（最多 2）
  solved: false,
}

export function resetBoard(clueDefs) {
  dd.cards = clueDefs.map(c => ({ ...c }))
  dd.collected = new Set()
  dd.links = []
  dd.selected = []
  dd.solved = false
}

export function boardState() { return dd }

export function toggleSelect(id) {
  const i = dd.selected.indexOf(id)
  if (i > -1) dd.selected.splice(i, 1)
  else {
    if (dd.selected.length >= 2) dd.selected.shift()
    dd.selected.push(id)
  }
  return [...dd.selected]
}

// 组合规则：case 数据里 combos: [{ a, b, out: {id, label, detail}, final? }]
export function tryCombine(combos) {
  if (dd.selected.length !== 2) return { ok: false, why: 'pick2' }
  const [x, y] = dd.selected
  const hit = combos.find(r =>
    (r.a === x && r.b === y) || (r.a === y && r.b === x))
  if (!hit) { dd.selected = []; return { ok: false, why: 'nomatch', picked: [x, y] } }
  if (dd.cards.some(c => c.id === hit.out.id)) { dd.selected = []; return { ok: false, why: 'dup', picked: [x, y] } }
  const out = { ...hit.out, kind: 'synth', from: [x, y] }
  dd.cards.push(out)
  dd.links.push({ a: x, b: y, out: out.id })
  dd.selected = []
  if (hit.final) dd.solved = true
  return { ok: true, out, final: !!hit.final }
}
