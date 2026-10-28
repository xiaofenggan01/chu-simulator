// 像素推理板：线索栏承接 → 展开成软木板 → 拖线/点选连线推导
import { darioPraise, darioHurt, refreshEvidence } from './dario-bar.js'
import { toast } from './ui.js'
import { resetBoard, boardState, toggleSelect, tryCombine } from './deduction.js'
import { state, applyDamage } from './engine.js'
import { SIGNALS } from './data/signals.js'

const COMBO_FAIL_WORDS = ['这两条对不上。', '风马牛不相及。', '再想想，这两条没有交集。', '硬拼是拼不出来的。']

/* ---------------- 收集阶段：右侧像素线索栏 ---------------- */

let _hintHandler = null
export function detachHint() {
  if (_hintHandler) { document.removeEventListener('achu:hint-request', _hintHandler); _hintHandler = null }
}

function labelOf(level, id) {
  const d = level.deduc.facts.concat(level.deduc.decoys).find(c => c.id === id)
  return d ? d.label : id
}

function handleHint(level) {
  const ov = document.getElementById('ov-deduction')
  const bd = boardState()
  if (ov) {
    // 推理板阶段：找出下一步可合成的一对，自动放上反应台
    const known = new Set(bd.cards.map(c => c.id))
    for (const cb of level.deduc.combos) {
      if (known.has(cb.out.id)) continue
      if (known.has(cb.a) && known.has(cb.b)) {
        applyDamage()
        if (typeof ov.__applyHint === 'function') ov.__applyHint(cb.a, cb.b)
        return
      }
    }
    const missing = level.deduc.facts.find(f => !bd.collected.has(f.id))
    if (missing) {
      applyDamage()
      toast(`提示：场景里还有「${missing.label}」没收进卷宗`)
      const slot = ov.querySelector(`.pin-slot[data-id="${missing.id}"]`)
      if (slot) { slot.classList.add('hint-flash'); setTimeout(() => slot.classList.remove('hint-flash'), 2400) }
      return
    }
    toast('暂无可提示的组合，先把已有线索两两试试')
  } else {
    // 收集阶段：指出一条还没取的线索
    const node = document.querySelector('.dd-node[data-clue]:not(.clue-got)')
    if (node) {
      applyDamage()
      toast('提示：这条线索还没收进卷宗（-1 滴血）')
      node.classList.add('hint-flash')
      node.scrollIntoView({ block: 'center', behavior: 'smooth' })
      setTimeout(() => node.classList.remove('hint-flash'), 2400)
    } else {
      toast('线索已收齐，点「展开推理」上推理板')
    }
  }
}

export function mountCollection(level, root) {
  document.getElementById('ov-deduction')?.remove()
  detachHint()
  _hintHandler = e => { e.preventDefault(); handleHint(level) }
  document.addEventListener('achu:hint-request', _hintHandler)
  const { facts, decoys } = level.deduc
  const all = [...facts, ...decoys]
  all.forEach(f => { if (!SIGNALS[f.id]) SIGNALS[f.id] = { title: f.label, verdict: f.detail, cat: 'deduc', strength: 'strong', conf: 'confirmed', points: 10 } })
  resetBoard(all)
  state.found = []
  state.clueList = facts.map(f => f.id)

  const collected = new Set()

  root.addEventListener('click', e => {
    const node = e.target.closest('[data-clue]')
    if (!node) return
    const id = node.dataset.clue
    if (collected.has(id)) return
    const def = all.find(c => c.id === id)
    if (!def) return
    collected.add(id)
    boardState().collected.add(id)
    const isFact = facts.some(f => f.id === id)
    node.classList.add('clue-got')
    if (isFact) {
      state.found.push(id)
      darioPraise('收进卷宗：' + def.label)
    } else {
      darioHurt('废线索：' + def.label)
    }
    refreshEvidence()
    // 线索卡从原位飞进线索栏
    const r = node.getBoundingClientRect()
    const trayEl = document.getElementById('pin-tray')
    const fly = document.createElement('div')
    fly.className = 'dd-fly' + (isFact ? '' : ' junk')
    fly.textContent = def.label
    fly.style.left = r.left + r.width / 2 - 60 + 'px'
    fly.style.top = r.top + 'px'
    document.body.appendChild(fly)
    requestAnimationFrame(() => {
      const tr = trayEl.getBoundingClientRect()
      const mobile = window.innerWidth <= 900
      fly.style.left = (mobile ? tr.right - 90 : tr.left + 74) + 'px'
      fly.style.top = (mobile ? tr.top + 20 : tr.top + tr.height / 2 - 16) + 'px'
      fly.classList.add('go')
    })
    setTimeout(() => fly.remove(), 620)
    setTimeout(renderTray, 320)
  })

  document.getElementById('pin-tray')?.remove()
  const tray = document.createElement('div')
  tray.id = 'pin-tray'
  document.body.appendChild(tray)

  const renderTray = () => {
    tray.innerHTML = `
      <div class="pin-tray-head"><b>线索</b><span>${collected.size}/${all.length}</span></div>
      <div class="pin-tray-list">
        ${[...collected].map(id => {
          const d = all.find(c => c.id === id)
          const isFact = facts.some(f => f.id === id)
          return `<div class="pin-tray-card ${isFact ? '' : 'junk'}">${d.label}</div>`
        }).join('')}
      </div>
      <button class="pin-tray-go" id="go-board" ${collected.size < 3 ? 'disabled' : ''}>
        <span>展开推理</span><svg class="ic"><use href="#i-arrow-r"/></svg>
      </button>`
    const go = tray.querySelector('#go-board')
    if (go) go.onclick = () => openBoard(level, { collected, onSolved: () => document.dispatchEvent(new CustomEvent('achu:deduction-solved')) })
  }
  renderTray()
}

/* ---------------- 推理板：像素软木板 + 连线 ---------------- */

export function openBoard(level, { collected, onSolved }) {
  document.getElementById('ov-deduction')?.remove() // 防跨关残留叠加
  const { facts, decoys, combos } = level.deduc
  const ov = document.createElement('div')
  ov.className = 'overlay pin-overlay'
  ov.id = 'ov-deduction'
  ov.innerHTML = `
    <div class="pin-win">
      <div class="pin-winbar">
        <span class="rv-dot r"></span><span class="rv-dot y"></span><span class="rv-dot g"></span>
        <b>推理板 · ${level.name}</b>
        <span class="pin-goal">目标：${level.deduc.goal || '连出「用户人在中国大陆」'}</span>
        <button class="pin-close" id="pin-close">收起</button>
      </div>
      <div class="pin-board" id="pin-board">
        <svg class="pin-wires" id="pin-wires"></svg>
        <div class="pin-field" id="pin-field"></div>
      </div>
      <div class="pin-reactor" id="pin-reactor">
        <span class="reactor-title">反应台</span>
        <div class="reactor-slot" data-slot="a" id="rs-a"><small>拖入线索 A</small></div>
        <span class="reactor-plus">+</span>
        <div class="reactor-slot" data-slot="b" id="rs-b"><small>拖入线索 B</small></div>
        <button class="reactor-go" id="reactor-go" disabled><svg class="ic"><use href="#i-bulb"/></svg>推理</button>
      </div>
    </div>`
  document.body.appendChild(ov)

  const board = ov.querySelector('#pin-board')
  const field = ov.querySelector('#pin-field')
  const svg = ov.querySelector('#pin-wires')

  // ---- 槽位体系：证据/杂项槽（按线索预设，收集后填充）+ 推论槽 + 结案槽，位置全部固定 ----
  const clueSlots = [...facts, ...decoys]          // 证据+杂项混排
  const synthSlots = combos.filter(c => !c.final)   // 中间推论槽
  const finalSlot = combos.find(c => c.final)?.out  // 结案槽

  const jitterOf = (id, salt) => {
    let h = salt
    for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997
    return (h % 17) - 8
  }
  const positions = new Map()
  const rotations = new Map() // 每槽固定旋转角（案发现场的杂乱感）
  const CARD_H = 126, GAP = 16
  const rotOf = (id, i) => {
    let h = 23
    for (const ch of id) h = (h * 17 + ch.charCodeAt(0)) % 97
    return ((h % 13) - 6) * 0.32 // 约 ±2°，保留歪斜感又不越位
  }
  const layoutSlots = () => {
    positions.clear()
    rotations.clear()
    const W = board.clientWidth || 640
    const groups = level.deduc.groups || []
    // 两列案情簇：box.x < 50 的组挂左列、其余右列；列内垂直堆叠（真实板面的左右两片）
    const narrow = W < 640
    const colW = narrow ? W - 40 : W * 0.47
    const left = [], right = []
    groups.forEach(g => ((g.box[0] < 50 || narrow) ? left : right).push(g))
    let groupBottom = 0
    const flow = (list, x0) => {
      let y = 6
      list.forEach(g => {
        const aw = Math.min(colW, Math.max(150, g.box[2] / 100 * W))
        const n = g.items.length
        const cols = Math.max(1, Math.min(n, Math.floor((aw + GAP) / (narrow ? 110 + GAP : 150 + GAP))))
        const cw = Math.min(196, Math.floor((aw - (cols - 1) * GAP) / cols))
        g.__cw = cw
        g.__x = x0
        g.__y = y + 28
        g.items.forEach((id, i) => {
          const col = i % cols, row = Math.floor(i / cols)
          positions.set(id, { x: x0 + col * (cw + GAP) + (row % 2 ? 12 : 0) + (i % 3) * 4, y: g.__y + row * (CARD_H + GAP) + (i % 2) * 5, w: cw })
          rotations.set(id, rotOf(id, i))
        })
        y = g.__y + Math.ceil(n / cols) * (CARD_H + GAP) + 16
        groupBottom = Math.max(groupBottom, y)
      })
    }
    flow(left, narrow ? 16 : 20)
    if (!narrow) flow(right, W * 0.51)
    // 推论带：两列之下的汇合区，错落
    const synthCount = synthSlots.length
    const perRow = Math.max(1, Math.min(synthCount, Math.floor((W - 60) / (narrow ? 200 : 220))))
    const zoneW = perRow * 220
    const zx = (W - zoneW) / 2 + 16
    const zy = groupBottom + 16
    const slotsXY = []
    for (let i = 0; i < synthCount; i++) {
      const col = i % perRow, row = Math.floor(i / perRow)
      slotsXY.push({ x: zx + col * 220 + (row ? 44 : 0) + (col % 2) * 12, y: zy + row * (CARD_H + GAP) + (col % 2) * 9, w: Math.min(196, W - 50) })
      rotations.set('__SYNTH' + i, rotOf('SY' + i, i))
    }
    ov.__slotsXY = slotsXY
    ov.__synthZone = { x: zx, y: zy - 14, w: zoneW }
    const synthRows = Math.ceil(synthCount / perRow)
    // 结案：推论带下居中放大
    const fw = Math.min(300, W * 0.34)
    positions.set('__SOLVED__', { x: (W - fw) / 2 + 10, y: zy + synthRows * (CARD_H + GAP) + 22, w: fw, h: Math.round(CARD_H * 1.05) })
    field.style.width = W + 'px'
    field.style.height = (positions.get('__SOLVED__').y + CARD_H * 1.05 + 26) + 'px'
  }

  const render = () => {
    const bd = boardState()
    let html = ''
    // 组标签（便签钉在每组左上，坐标来自布局器）
    ;(level.deduc.groups || []).forEach(g => {
      html += `<span class="pin-grouptag" style="left:${g.__x || 20}px;top:${Math.max(0, (g.__y || 26) - 28)}px">${g.name}</span>`
    })
    // 推论区标签
    if (ov.__synthZone) html += `<span class="pin-grouptag synth" style="left:${ov.__synthZone.x}px;top:${ov.__synthZone.y}px">推论区 · 连线汇合处</span>`
    // 证据/杂项槽：空=问号轮廓，收集=内容（宽度为布局时各槽自带值）
    clueSlots.forEach((c, i) => {
      const pos = positions.get(c.id) || { x: 40, y: 40 }
      const has = collected.has(c.id)
      const isFact = facts.some(f => f.id === c.id)
      const rot = rotations.get(c.id) || 0
      const inReactor = reactor.a === c.id || reactor.b === c.id
      html += has
        ? `<div class="pin-card slot-filled ${isFact ? 'fact' : 'decoy'} ${inReactor ? 'in-reactor' : ''}" data-id="${c.id}" style="left:${pos.x}px;top:${pos.y}px;width:${pos.w || 190}px;transform:rotate(${rot}deg)">
            <small>${isFact ? '证据' : '杂项'}</small><b>${c.label}</b>
            <span class="pin-tack"></span>
          </div>`
        : `<div class="pin-slot empty" data-id="${c.id}" style="left:${pos.x}px;top:${pos.y}px;width:${pos.w || 190}px;transform:rotate(${rot}deg)"><span class="pin-q">?</span><small>未取证</small></div>`
    })
    // 推论槽：空=金色虚线，生成=内容
    const synths = bd.cards.filter(c => c.kind === 'synth' && c.id !== 'SOLVED')
    for (let i = 0; i < synthSlots.length; i++) {
      const xy = (ov.__slotsXY && ov.__slotsXY[i]) || { x: 40 + i * 240, y: 40 }
      const c = synths[i]
      const rot = rotations.get('__SYNTH' + i) || 0
      html += c
        ? `<div class="pin-card slot-filled synth ${bd.selected.includes(c.id) ? 'sel' : ''}" data-id="${c.id}" style="left:${xy.x}px;top:${xy.y}px;width:${xy.w || 190}px;transform:rotate(${rot}deg)">
            <small>推论</small><b>${c.label}</b>
            <span class="pin-tack"></span>
          </div>`
        : `<div class="pin-slot empty synth-slot" style="left:${xy.x}px;top:${xy.y}px;width:${xy.w || 190}px;transform:rotate(${rot}deg)"><span class="pin-q">+</span><small>推论 · 待推导</small></div>`
    }
    // 结案槽
    const fp = positions.get('__SOLVED__') || { x: 40, y: 40 }
    const solvedCard = bd.cards.find(c => c.id === 'SOLVED')
    const FW = fp.w || 240, FH = fp.h || 144
    html += solvedCard
      ? `<div class="pin-card slot-filled final" data-id="SOLVED" style="left:${fp.x}px;top:${fp.y}px;width:${FW}px;height:${FH}px">
          <small>结案</small><b>${solvedCard.label}</b><p>${solvedCard.detail}</p>
          <span class="pin-tack"></span>
        </div>`
      : `<div class="pin-slot empty final-slot" style="left:${fp.x}px;top:${fp.y}px;width:${FW}px;height:${FH}px"><span class="pin-q">★</span><small>结案 · ${level.deduc.goal || '连出结论'}</small></div>`
    field.innerHTML = html
    redrawAll()
  }

  /* ---- 丝滑连线 ---- */
  const NS = 'http://www.w3.org/2000/svg'
  const centerOf = id => {
    const el = field.querySelector(`[data-id="${id}"]`)
    if (!el) return null
    const r = el.getBoundingClientRect()
    const b = board.getBoundingClientRect()
    return { x: r.left + r.width / 2 - b.left + board.scrollLeft, y: r.top + r.height / 2 - b.top + board.scrollTop }
  }
  const wirePath = (a, b) => {
    const dx = Math.max(36, Math.abs(b.x - a.x) * 0.42)
    return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`
  }
  const makeWire = (d, cls) => {
    const p = document.createElementNS(NS, 'path')
    p.setAttribute('d', d)
    p.setAttribute('class', 'pin-wire ' + (cls || ''))
    svg.appendChild(p)
    return p
  }
  const redrawAll = () => {
    svg.replaceChildren()
    const bd = boardState()
    bd.links.forEach(l => {
      const a = centerOf(l.a), b = centerOf(l.b), o = centerOf(l.out)
      if (a && b) makeWire(wirePath(a, b), 'set')
      if (a && b && o) makeWire(wirePath({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, o), 'set out')
    })
  }

  /* ---- 反应台：拖卡入槽 / 点卡入槽，推理按钮合成 ---- */
  const reactor = { a: null, b: null }
  const reactorBar = ov.querySelector('#pin-reactor')
  const slotEls = { a: ov.querySelector('#rs-a'), b: ov.querySelector('#rs-b') }
  const goBtn = ov.querySelector('#reactor-go')

  const renderReactor = () => {
    const bd = boardState()
    const labelOf = id => (bd.cards.find(c => c.id === id) || {}).label || id
    ;['a', 'b'].forEach(k => {
      const el = slotEls[k]
      const id = reactor[k]
      el.classList.toggle('filled', !!id)
      el.innerHTML = id
        ? `<b>${labelOf(id)}</b>`
        : `<small>拖入线索 ${k.toUpperCase()}</small>`
    })
    goBtn.disabled = !(reactor.a && reactor.b)
    // 板上卡片的 in-reactor 变暗态
    field.querySelectorAll('.pin-card').forEach(c => {
      const used = reactor.a === c.dataset.id || reactor.b === c.dataset.id
      c.classList.toggle('in-reactor', used)
    })
  }

  let dragging = null
  board.addEventListener('pointerdown', e => {
    const card = e.target.closest('.pin-card')
    if (!card || card.dataset.id === 'SOLVED') return
    e.preventDefault()
    dragging = { id: card.dataset.id, sx: e.clientX, sy: e.clientY, started: false, ghost: null, pointerId: e.pointerId }
    try { board.setPointerCapture(e.pointerId) } catch { }
  })
  board.addEventListener('pointermove', e => {
    if (!dragging) return
    if (!dragging.started && Math.hypot(e.clientX - dragging.sx, e.clientY - dragging.sy) < 8) return
    if (!dragging.started) {
      dragging.started = true
      const src = field.querySelector(`[data-id="${dragging.id}"]`)
      const r = src.getBoundingClientRect()
      const g = document.createElement('div')
      g.className = 'reactor-ghost'
      g.textContent = src.querySelector('b').textContent
      g.style.left = r.left + 'px'; g.style.top = r.top + 'px'; g.style.width = r.width + 'px'
      document.body.appendChild(g)
      dragging.ghost = g
    }
    dragging.ghost.style.left = e.clientX - dragging.ghost.offsetWidth / 2 + 'px'
    dragging.ghost.style.top = e.clientY - 22 + 'px'
    slotEls.a.classList.toggle('hover', !!document.elementFromPoint(e.clientX, e.clientY)?.closest('#rs-a'))
    slotEls.b.classList.toggle('hover', !!document.elementFromPoint(e.clientX, e.clientY)?.closest('#rs-b'))
  })
  const endDrag = e => {
    if (!dragging) return
    const d = dragging
    dragging = null
    slotEls.a.classList.remove('hover')
    slotEls.b.classList.remove('hover')
    if (d.started) {
      const over = document.elementFromPoint(e.clientX, e.clientY)?.closest('.reactor-slot')
      d.ghost?.remove()
      if (over) {
        const slot = over.dataset.slot === 'a' ? 'a' : (reactor.a && !reactor.b ? 'b' : over.dataset.slot)
        reactor[slot] = d.id
        renderReactor()
      } else {
        // 飞回原位动画
        const src = field.querySelector(`[data-id="${d.id}"]`)
        if (src && d.ghost) {
          const r = src.getBoundingClientRect()
          d.ghost.classList.add('back')
          d.ghost.style.left = r.left + 'px'
          d.ghost.style.top = r.top + 'px'
          setTimeout(() => d.ghost?.remove(), 380)
        } else d.ghost?.remove()
      }
    } else {
      // 点选快捷入槽：A 空进 A，否则进 B（再点同卡 = 取出）
      if (reactor.a === d.id) { reactor.a = null; renderReactor(); return }
      if (reactor.b === d.id) { reactor.b = null; renderReactor(); return }
      if (!reactor.a) reactor.a = d.id
      else if (!reactor.b) reactor.b = d.id
      else reactor.b = d.id
      renderReactor()
    }
  }
  board.addEventListener('pointerup', endDrag)
  board.addEventListener('pointercancel', endDrag)

  // 提示入口：handleHint 直接调用，随板存亡（可重复触发）
  ov.__applyHint = (a, b) => {
    reactor.a = a
    reactor.b = b
    renderReactor()
    toast(`提示：把「${labelOf(level, a)}」和「${labelOf(level, b)}」放上反应台（-1 滴血）`)
  }

  goBtn.onclick = () => {
    if (!reactor.a || !reactor.b) return
    boardState().selected = [reactor.a, reactor.b]
    const res = tryCombine(combos)
    if (res.ok) {
      darioPraise('拼上了：' + res.out.label)
      reactor.a = reactor.b = null
      render()
      renderReactor()
      reactorBar.classList.add('boom')
      setTimeout(() => reactorBar.classList.remove('boom'), 600)
      const fresh = field.querySelector(`[data-id="${res.out.id}"]`)
      if (fresh) { fresh.classList.add('fresh'); fresh.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }
      if (res.final) setTimeout(() => { ov.remove(); onSolved() }, 1100)
    } else if (res.why === 'nomatch') {
      // 无效推理消耗达里奥 1 滴血：血条是容错资源，乱试组合会把他耗干
      applyDamage()
      darioHurt(COMBO_FAIL_WORDS[Math.floor(Math.random() * COMBO_FAIL_WORDS.length)])
      reactorBar.classList.add('fizzle')
      setTimeout(() => {
        reactorBar.classList.remove('fizzle')
        reactor.a = reactor.b = null
        renderReactor()
      }, 480)
    } else {
      reactor.a = reactor.b = null
      renderReactor()
    }
  }
  renderReactor()

  ov.querySelector('#pin-close').onclick = () => { document.dispatchEvent(new CustomEvent('achu:close-board')); ov.remove() }
  requestAnimationFrame(() => {
    ov.classList.add('on')
    requestAnimationFrame(() => {
      layoutSlots()
      render()
    })
  })
  render()
  // 开板期间持续监听收集（收起再收集后重开时板重建，无需动态更新）
}
