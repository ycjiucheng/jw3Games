const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
const goldEl = document.getElementById('gold')
const waveEl = document.getElementById('wave')
const lifeEl = document.getElementById('life')
const recruitBtn = document.getElementById('recruit')
const poolEl = document.getElementById('pool')
const pauseBtn = document.getElementById('pause')
const overlayEl = document.getElementById('overlay')
const restartBtn = document.getElementById('restart')
const overlayTitleEl = document.getElementById('overlay-title')
const overlayDescEl = document.getElementById('overlay-desc')
const sellEl = document.getElementById('sell')
let paused = false
let w = 0
let h = 0
let last = 0
let spawnTimer = 0
let spawnsLeft = 0
let maxWaves = 12
let wave = 1
let life = 100
let gold = 50
let recruitCost = 20
let started = false
const enemies = []
const lanes = 4
const laneWidth = () => w / lanes
const rnd = (min, max) => Math.random() * (max - min) + min
const toInt = v => (v | 0)
const units = []
const projectiles = []
const effects = []
const rows = 3
let gridTop = 0
let cellH = 90
let draggingUnit = null
let unitGhost = null
const schoolMap = [
  { name: '天策', id: 1 },
  { name: '万花', id: 2 },
  { name: '纯阳', id: 3 },
  { name: '七秀', id: 4 },
  { name: '少林', id: 5 },
]
const schoolStats = {
  '天策': { dmg: 10, rate: 1.0, role: 'tank_knock', rangeCells: 1, knockback: 60, root: 0 },
  '少林': { dmg: 8, rate: 0.9, role: 'tank_root', rangeCells: 1, knockback: 0, root: 0.8 },
  '万花': { dmg: 2, rate: 3.0, role: 'dot_lane', rangeCells: 99 },
  '七秀': { dmg: 5, rate: 2.0, role: 'slow_lane', rangeCells: 99, slowPct: 0.5, slowDur: 1.2 },
  '纯阳': { dmg: 20, rate: 0.8, role: 'single_lane', rangeCells: 99 },
}
function levelScale(level) {
  return level === 1 ? 1.0 : level === 2 ? 1.4 : 1.8
}
const enemyTypes = {
  normal: { hp: 6, speed: 40, reward: 5, icon: './assets/enemies/normal.svg' },
  elite: { hp: 14, speed: 35, reward: 10, icon: './assets/enemies/elite.svg' },
  ranged: { hp: 8, speed: 30, reward: 7, icon: './assets/enemies/ranged.svg' },
  charger: { hp: 6, speed: 65, reward: 6, icon: './assets/enemies/charger.svg' },
  boss: { hp: 40, speed: 28, reward: 60, icon: './assets/enemies/boss.svg' }
}
const enemyImgs = {}
function getEnemyImg(src) {
  if (!enemyImgs[src]) {
    const img = new Image()
    img.src = src
    enemyImgs[src] = img
  }
  return enemyImgs[src]
}
const schoolTintCache = {}
async function loadTintedSchool(id, color) {
  const key = `${id}:${color}`
  if (schoolTintCache[key]) return schoolTintCache[key]
  const resp = await fetch(`./assets/schools/${id}.svg`)
  const svg = await resp.text()
  const style = `<style>
    path, circle, ellipse, polygon { fill: ${color} !important; stroke: ${color} !important }
    rect { fill: none !important; stroke: ${color} !important }
  </style>`
  const styled = svg.replace(/<svg([^>]*)>/, `<svg$1>${style}`)
  const blob = new Blob([styled], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const img = new Image()
  img.src = url
  schoolTintCache[key] = img
  return img
}
const tintedURLCache = {}
async function getTintedSchoolURL(id, color) {
  const key = `${id}:${color}`
  if (tintedURLCache[key]) return tintedURLCache[key]
  const resp = await fetch(`./assets/schools/${id}.svg`)
  const svg = await resp.text()
  const style = `<style>
    path, circle, ellipse, polygon { fill: ${color} !important; stroke: ${color} !important }
    rect { fill: none !important; stroke: ${color} !important }
  </style>`
  const styled = svg.replace(/<svg([^>]*)>/, `<svg$1>${style}`)
  const blob = new Blob([styled], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  tintedURLCache[key] = url
  return url
}
function getSchoolColor(name) {
  if (name === '天策') return '#e53935'
  if (name === '少林') return '#f1c40f'
  if (name === '万花') return '#8e44ad'
  if (name === '七秀') return '#ec407a'
  if (name === '纯阳') return '#1e88e5'
  return '#31c48d'
}
function resize() {
  w = canvas.clientWidth
  h = canvas.clientHeight
  if (!h || h <= 0) {
    h = (canvas.parentElement && canvas.parentElement.clientHeight) || Math.max(480, Math.floor(window.innerHeight * 0.7))
  }
  const ratio = window.devicePixelRatio || 1
  canvas.width = toInt(w * ratio)
  canvas.height = toInt(h * ratio)
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  gridTop = h - 80 - rows * cellH - 20
}
window.addEventListener('resize', resize)
resize()
function pickType() {
  const r = Math.random()
  if (wave % 6 === 0 && r < 0.2) return 'boss'
  if (r < 0.6) return 'normal'
  if (r < 0.75) return 'ranged'
  if (r < 0.9) return 'elite'
  return 'charger'
}
function addEnemy() {
  const lane = toInt(rnd(0, lanes))
  const x = lane * laneWidth() + laneWidth() * 0.5
  const type = pickType()
  const base = enemyTypes[type]
  const lvl = Math.min(5, 1 + toInt(wave * 0.2))
  const maxHp = toInt((base.hp + wave * (type === 'boss' ? 3 : 1.2)) * (1 + (lvl - 1) * 0.3))
  const speed = base.speed + wave * (type === 'charger' ? 2.5 : 0.5)
  const img = getEnemyImg(base.icon)
  enemies.push({ x, y: 0, r: 16, hp: maxHp, maxHp, speed, lane, type, reward: base.reward, img, lvl, rootUntil: 0, slowUntil: 0 })
}
function startWave(n) {
  wave = n
  spawnsLeft = 6 + toInt(n * 2.0)
  spawnTimer = n === 1 ? 3.0 : 0.6
  overlayEl.hidden = true
  paused = false
}
startWave(1)
function showOverlay(title, desc) {
  overlayTitleEl.textContent = title
  overlayDescEl.textContent = desc
  overlayEl.hidden = false
}
overlayEl.hidden = true
function update(dt) {
  if (paused) return
  spawnTimer -= dt
  if (spawnTimer <= 0 && spawnsLeft > 0) {
    addEnemy()
    started = true
    spawnsLeft -= 1
    spawnTimer = Math.max(0.5, 1.5 - wave * 0.03)
  }
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i]
    const now = last
    let speedMul = 1
    if (e.slowUntil && now < e.slowUntil) speedMul = 0.5
    const rooted = e.rootUntil && now < e.rootUntil
    if (e.type === 'ranged' && e.y >= h * 0.35 && !rooted) {
      e.shootCd = (e.shootCd || 0) - dt
      if (e.shootCd <= 0) {
        life -= 1
        e.shootCd = 1.2
      }
    } else {
      if (!rooted) e.y += e.speed * speedMul * dt
    }
    if (e.y >= h - 80) {
      enemies.splice(i, 1)
      life -= e.type === 'boss' ? 25 : e.type === 'elite' ? 12 : 5
      if (life < 0) life = 0
    }
  }
  for (let u of units) {
    u.cooldown -= dt
    const candidates = enemies.filter(e => e.lane === u.lane && Math.abs(e.y - u.y) <= u.range)
    if (u.cooldown <= 0 && u.dmg > 0) {
      if (u.role === 'dot_lane' && candidates.length) {
        candidates.forEach(t => {
          t.hp -= Math.round(u.dmg)
          effects.push({ type: 'petal', x: t.x, y: t.y, until: last + 0.6 })
        })
        u.cooldown = 1 / u.rate
      } else if (u.role === 'slow_lane' && candidates.length) {
        const target = candidates.reduce((a, b) => (a.y > b.y ? a : b))
        target.hp -= Math.round(u.dmg)
        target.slowUntil = last + (u.slowDur || 1)
        effects.push({ type: 'snow', x: target.x, y: target.y, until: last + (u.slowDur || 1) })
        u.cooldown = 1 / u.rate
      } else if (u.role === 'single_lane' && candidates.length) {
        const target = candidates.reduce((a, b) => (a.y > b.y ? a : b))
        projectiles.push({ x: u.x, y: u.y, tx: target.x, ty: target.y, target, speed: 320, dmg: Math.round(u.dmg) })
        u.cooldown = 1 / u.rate
      } else if (u.role === 'tank_knock' || u.role === 'tank_root') {
        const near = enemies
          .filter(e => e.lane === u.lane && Math.abs(e.y - u.y) <= u.range)
          .sort((a, b) => Math.abs(a.y - u.y) - Math.abs(b.y - u.y))
        if (near.length) {
          const target = near[0]
          target.hp -= Math.round(u.dmg)
          if (u.role === 'tank_knock') {
            target.y = Math.max(0, target.y - (u.knockback || 50))
            effects.push({ type: 'shock', x: target.x, y: target.y, until: last + 0.3 })
          } else {
            target.rootUntil = last + (u.root || 0.8)
            effects.push({ type: 'root', x: target.x, y: target.y, until: last + (u.root || 0.8) })
          }
          u.cooldown = 1 / u.rate
        }
      }
    }
    for (let i = enemies.length - 1; i >= 0; i--) {
      const t = enemies[i]
      if (t.hp <= 0) {
        enemies.splice(i, 1)
        gold += t.reward
      }
    }
  }
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i]
    if (!p.target) {
      projectiles.splice(i, 1)
      continue
    }
    const dx = p.tx - p.x
    const dy = p.ty - p.y
    const d = Math.hypot(dx, dy)
    if (d < 6) {
      p.target.hp -= p.dmg
      if (p.target.hp <= 0) {
        const idx = enemies.indexOf(p.target)
        if (idx >= 0) enemies.splice(idx, 1)
        gold += p.target.reward
      }
      projectiles.splice(i, 1)
      continue
    }
    const vx = (dx / d) * p.speed * dt
    const vy = (dy / d) * p.speed * dt
    p.x += vx
    p.y += vy
    p.tx = p.target.x
    p.ty = p.target.y
  }
  for (let i = effects.length - 1; i >= 0; i--) {
    if (last >= effects[i].until) effects.splice(i, 1)
  }
  if (life <= 0 && started) {
    paused = true
    showOverlay('游戏结束', '圣女已受重创，防线被突破')
  }
  if (spawnsLeft === 0 && enemies.length === 0 && life > 0) {
    if (wave >= maxWaves) {
      paused = true
      showOverlay('胜利', '你成功守卫弓月城，击退敌军')
    } else {
      startWave(wave + 1)
    }
  }
}
function draw() {
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < lanes; i++) {
    ctx.fillStyle = i % 2 ? '#f3f4f6' : '#eef2f7'
    ctx.fillRect(i * laneWidth(), 0, laneWidth(), h)
  }
  ctx.strokeStyle = '#2a2f38'
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < lanes; c++) {
      const x = c * laneWidth()
      const y = gridTop + r * cellH
      ctx.strokeRect(x + 8, y + 8, laneWidth() - 16, cellH - 16)
    }
  }
  ctx.fillStyle = '#2b7dfc'
  ctx.fillRect(w * 0.4, h - 100, w * 0.2, 20)
  ctx.fillStyle = '#e74c3c'
  enemies.forEach(e => {
    if (e.img && e.img.complete) {
      ctx.drawImage(e.img, e.x - 16, e.y - 16, 32, 32)
    } else {
      ctx.beginPath()
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#2b7dfc'
    ctx.fillRect(e.x + 8, e.y + 8, 20, 12)
    ctx.fillStyle = '#fff'
    ctx.font = '10px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(`Lv${e.lvl}`, e.x + 18, e.y + 18)
    ctx.fillStyle = '#3ae374'
    const bw = 24
    const bh = 4
    const pct = Math.max(0, e.hp) / Math.max(1, e.maxHp)
    ctx.fillRect(e.x - bw / 2, e.y - e.r - 10, bw * pct, bh)
    ctx.fillStyle = '#e74c3c'
  })
  ctx.fillStyle = '#ffd54f'
  projectiles.forEach(p => {
    ctx.beginPath()
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
    ctx.fill()
  })
  effects.forEach(e => {
    if (e.type === 'petal') {
      ctx.fillStyle = '#8e44ad'
      ctx.beginPath()
      ctx.arc(e.x, e.y, 6, 0, Math.PI * 2)
      ctx.fill()
    } else if (e.type === 'snow') {
      ctx.strokeStyle = '#81d4fa'
      ctx.beginPath()
      ctx.arc(e.x, e.y, 10, 0, Math.PI * 2)
      ctx.stroke()
    } else if (e.type === 'shock') {
      ctx.strokeStyle = '#e53935'
      ctx.beginPath()
      ctx.moveTo(e.x, e.y)
      ctx.lineTo(e.x, e.y - 12)
      ctx.stroke()
    } else if (e.type === 'root') {
      ctx.strokeStyle = '#8d6e63'
      ctx.beginPath()
      ctx.moveTo(e.x - 8, e.y + 8)
      ctx.lineTo(e.x + 8, e.y + 8)
      ctx.stroke()
    }
  })
  units.forEach(u => {
    const img = u.iconImg
    if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
      ctx.drawImage(img, u.x - 16, u.y - 16, 32, 32)
    } else {
      ctx.fillStyle = getSchoolColor(u.name)
      ctx.beginPath()
      ctx.arc(u.x, u.y, 14, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#2b7dfc'
    ctx.fillRect(u.x + 8, u.y + 8, 20, 12)
    ctx.fillStyle = '#fff'
    ctx.font = '10px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(`Lv${u.level}`, u.x + 18, u.y + 18)
  })
  goldEl.textContent = gold
  waveEl.textContent = wave
  lifeEl.textContent = life
}
function loop(ts) {
  const now = ts / 1000
  const dt = Math.min(0.05, now - last || 0)
  last = now
  update(dt)
  draw()
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)
function sellValue(u) {
  return u.level === 1 ? 12 : u.level === 2 ? 28 : 48
}
canvas.addEventListener('pointerdown', async e => {
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  for (let i = units.length - 1; i >= 0; i--) {
    const u = units[i]
    const dx = u.x - x
    const dy = u.y - y
    if (dx * dx + dy * dy <= 16 * 16) {
      draggingUnit = u
      unitGhost = document.createElement('div')
      unitGhost.className = 'card'
      const img = document.createElement('img')
      const id = schoolMap.find(s => s.name === u.name)?.id || 1
      img.src = await getTintedSchoolURL(id, getSchoolColor(u.name))
      const lvl = document.createElement('span')
      lvl.className = 'lvl'
      lvl.textContent = `Lv${u.level}`
      unitGhost.appendChild(img)
      unitGhost.appendChild(lvl)
      unitGhost.style.position = 'fixed'
      unitGhost.style.left = '0'
      unitGhost.style.top = '0'
      unitGhost.style.pointerEvents = 'none'
      unitGhost.style.transform = `translate(${e.clientX - 32}px,${e.clientY - 32}px)`
      document.body.appendChild(unitGhost)
      document.addEventListener('pointermove', onUnitMove)
      document.addEventListener('pointerup', onUnitUp, { once: true })
      break
    }
  }
})
function onUnitMove(e) {
  if (!unitGhost || !draggingUnit) return
  unitGhost.style.transform = `translate(${e.clientX - 32}px,${e.clientY - 32}px)`
}
function onUnitUp(e) {
  const rect = canvas.getBoundingClientRect()
  const overCanvas = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
  const sellRect = sellEl.getBoundingClientRect()
  const overSell = e.clientX >= sellRect.left && e.clientX <= sellRect.right && e.clientY >= sellRect.top && e.clientY <= sellRect.bottom
  if (overSell && draggingUnit) {
    const idx = units.indexOf(draggingUnit)
    if (idx >= 0) units.splice(idx, 1)
    gold += sellValue(draggingUnit)
  } else if (overCanvas && draggingUnit) {
    const lane = toInt((e.clientX - rect.left) / laneWidth())
    let row = toInt(((e.clientY - rect.top) - gridTop) / cellH)
    if (row < 0) row = 0
    if (row >= rows) row = rows - 1
    const x = lane * laneWidth() + laneWidth() * 0.5
    const y = gridTop + row * cellH + cellH * 0.5
    const occupy = units.find(u => u.lane === lane && u.row === row)
    if (!occupy) {
      draggingUnit.lane = lane
      draggingUnit.row = row
      draggingUnit.x = x
      draggingUnit.y = y
    } else if (occupy && occupy !== draggingUnit && occupy.name === draggingUnit.name && occupy.level === draggingUnit.level) {
      occupy.level = Math.min(3, occupy.level + 1)
      const base = schoolStats[occupy.name]
      const s2 = levelScale(occupy.level)
      occupy.dmg = Math.round(base.dmg * s2)
      occupy.range = Math.round(base.range * s2)
      occupy.rate = base.rate * (1 + (occupy.level - 1) * 0.15)
      const idx = units.indexOf(draggingUnit)
      if (idx >= 0) units.splice(idx, 1)
    }
  }
  if (unitGhost) {
    document.body.removeChild(unitGhost)
    unitGhost = null
  }
  draggingUnit = null
  document.removeEventListener('pointermove', onUnitMove)
}
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  for (let i = enemies.length - 1; i >= 0; i--) {
    const m = enemies[i]
    const dx = m.x - x
    const dy = m.y - y
    if (dx * dx + dy * dy <= m.r * m.r) {
      m.hp -= 1
      if (m.hp <= 0) {
        enemies.splice(i, 1)
        gold += 5
      }
      break
    }
  }
})
recruitBtn.addEventListener('click', async () => {
  if (gold < recruitCost) return
  gold -= recruitCost
  recruitCost = Math.min(60, recruitCost + 2)
  recruitBtn.textContent = `随机招募(${recruitCost})`
  const card = document.createElement('div')
  card.className = 'card'
  const pick = schoolMap[toInt(rnd(0, schoolMap.length))]
  card.dataset.name = pick.name
  card.dataset.id = pick.id
  card.dataset.level = '1'
  const img = document.createElement('img')
  img.src = await getTintedSchoolURL(pick.id, getSchoolColor(pick.name))
  img.alt = pick.name
  const lvl = document.createElement('span')
  lvl.className = 'lvl'
  lvl.textContent = 'Lv1'
  card.appendChild(img)
  card.appendChild(lvl)
  enableDrag(card)
  poolEl.appendChild(card)
})
pauseBtn.addEventListener('click', () => {
  paused = !paused
  pauseBtn.textContent = paused ? '继续' : '暂停'
})
restartBtn.addEventListener('click', () => {
  enemies.length = 0
  units.length = 0
  gold = 50
  life = 100
  started = false
  startWave(1)
})
function enableDrag(card) {
  let dragging = false
  let ghost = null
  function onDown(e) {
    dragging = true
    ghost = card.cloneNode(true)
    ghost.style.position = 'fixed'
    ghost.style.left = '0'
    ghost.style.top = '0'
    ghost.style.pointerEvents = 'none'
    ghost.style.transform = 'translate(-9999px,-9999px)'
    document.body.appendChild(ghost)
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp, { once: true })
  }
  function onMove(e) {
    if (!dragging || !ghost) return
    ghost.style.transform = `translate(${e.clientX - 32}px,${e.clientY - 32}px)`
  }
  function onUp(e) {
    dragging = false
    const rect = canvas.getBoundingClientRect()
    const overCanvas = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
    if (overCanvas) {
      const lane = toInt((e.clientX - rect.left) / laneWidth())
      let row = toInt(((e.clientY - rect.top) - gridTop) / cellH)
      if (row < 0) row = 0
      if (row >= rows) row = rows - 1
      const x = lane * laneWidth() + laneWidth() * 0.5
      const y = gridTop + row * cellH + cellH * 0.5
      const name = card.dataset.name
      const level = parseInt(card.dataset.level, 10)
      const base = schoolStats[name]
      const scale = levelScale(level)
      const existing = units.find(u => u.lane === lane && u.row === row)
      if (existing) {
        if (existing.name === name && existing.level === level) {
          existing.level = Math.min(3, existing.level + 1)
          const s2 = levelScale(existing.level)
          existing.dmg = Math.round(base.dmg * s2)
          existing.range = Math.round((base.rangeCells === 99 ? h : cellH * base.rangeCells) * s2)
          existing.rate = base.rate * (1 + (existing.level - 1) * 0.15)
          poolEl.removeChild(card)
        }
      } else {
        const nu = {
          name, lane, row, x, y, level,
          id: parseInt(card.dataset.id, 10),
          dmg: Math.round(base.dmg * scale),
          range: Math.round((base.rangeCells === 99 ? h : cellH * base.rangeCells) * scale),
          rate: base.rate * (1 + (level - 1) * 0.15),
          role: base.role,
          cooldown: 0,
          knockback: base.knockback || 0,
          root: base.root || 0,
          slowDur: base.slowDur || 0
        }
        units.push(nu)
        loadTintedSchool(parseInt(card.dataset.id, 10), getSchoolColor(name)).then(img => {
          if (img.decode) {
            img.decode().then(() => { nu.iconImg = img }).catch(() => { nu.iconImg = img })
          } else {
            nu.iconImg = img
          }
        })
        poolEl.removeChild(card)
      }
    } else {
      const cards = Array.from(poolEl.querySelectorAll('.card')).filter(c => c !== card)
      const hit = cards.find(c => {
        const r = c.getBoundingClientRect()
        return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
      })
      if (hit && hit.dataset.name === card.dataset.name && hit.dataset.level === card.dataset.level) {
        const lvl = parseInt(card.dataset.level, 10) + 1
        const merged = hit
        merged.dataset.level = String(Math.min(3, lvl))
        const badge = merged.querySelector('.lvl')
        if (badge) badge.textContent = `Lv${merged.dataset.level}`
        poolEl.removeChild(card)
      }
    }
    if (ghost) {
      document.body.removeChild(ghost)
      ghost = null
    }
    document.removeEventListener('pointermove', onMove)
  }
  card.addEventListener('pointerdown', onDown)
}
