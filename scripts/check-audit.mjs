// Full UI audit: multi-width overflow, tap targets, computed colors, nav state.
// Usage: node scripts/check-audit.mjs [port]
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PORT = process.argv[2] || '4173'
const BASE = `http://localhost:${PORT}/cat2/`
const CDP_PORT = 9231
const widths = [320, 375, 390, 414, 768, 1024, 1280]
const routes = ['#/', '#/schedule', '#/notes', '#/exam/MAENG501']
const themes = ['light', 'dark']

const userDataDir = mkdtempSync(join(tmpdir(), 'cat2-audit-'))
const chrome = spawn(
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ['--headless', '--disable-gpu', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${userDataDir}`, BASE],
  { stdio: 'ignore' }
)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function run() {
  let version
  for (let i = 0; i < 50; i++) {
    try {
      version = await fetch(`http://localhost:${CDP_PORT}/json/version`).then((r) => r.json())
      break
    } catch {
      await sleep(200)
    }
  }
  if (!version) throw new Error('CDP did not start')

  const pages = await fetch(`http://localhost:${CDP_PORT}/json/list`).then((r) => r.json())
  const ws = new WebSocket(pages.find((p) => p.type === 'page').webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.onopen = res
    ws.onerror = rej
  })

  let id = 0
  const pending = new Map()
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg)
      pending.delete(msg.id)
    }
  }
  const send = (method, params = {}) =>
    new Promise((res) => {
      const mid = ++id
      pending.set(mid, res)
      ws.send(JSON.stringify({ id: mid, method, params }))
    })

  await send('Runtime.enable')

  const evalExpr = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true })
    return r.result?.result?.value
  }

  let failures = 0
  const check = (label, ok, detail = '') => {
    if (!ok) failures++
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? ' — ' + detail : ''}`)
  }

  for (const w of widths) {
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 768 })
    for (const route of routes) {
      await send('Page.navigate', { url: BASE + route })
      await sleep(450)
      for (const theme of themes) {
        const r = await evalExpr(
          `(() => { document.documentElement.setAttribute('data-theme','${theme}'); const d=document.documentElement; return { overflowX: d.scrollWidth>d.clientWidth+1, active: document.querySelector('.bottom-nav__link--active span')?.textContent ?? null } })()`
        )
        check(`${w}px ${route} (${theme})`, !r.overflowX, r.active ? `nav=${r.active}` : '')
      }
    }
  }

  // ---- tap targets ----
  await send('Page.navigate', { url: BASE + '#/' })
  await sleep(450)
  const targets = await evalExpr(`(() => ({
    nav: document.querySelector('.bottom-nav__link').getBoundingClientRect().height,
    quick: document.querySelector('.quick-card').getBoundingClientRect().height,
    examCard: document.querySelector('.exam-card').getBoundingClientRect().height,
  }))()`)
  check('nav tap target >=44px', targets.nav >= 44, `${Math.round(targets.nav)}px`)
  check('quick-card tap target >=48px', targets.quick >= 48, `${Math.round(targets.quick)}px`)

  await send('Page.navigate', { url: BASE + '#/exam/MAENG501' })
  await sleep(450)
  const detailTargets = await evalExpr(`(() => ({
    back: document.querySelector('.back-btn').getBoundingClientRect().height,
    rows: [...document.querySelectorAll('.detail-row')].length,
  }))()`)
  check('back-btn tap target >=44px', detailTargets.back >= 44, `${Math.round(detailTargets.back)}px`)
  check('detail rows present', detailTargets.rows >= 6, `${detailTargets.rows} rows`)

  await send('Page.navigate', { url: BASE + '#/notes' })
  await sleep(450)
  const btnTargets = await evalExpr(`(() => ({
    btn: document.querySelector('.notes-card .btn').getBoundingClientRect().height,
  }))()`)
  check('notes CTA >=48px', btnTargets.btn >= 48, `${Math.round(btnTargets.btn)}px`)

  // ---- computed colors (theme-aware faint token) ----
  const tokenCheck = await evalExpr(`(() => {
    const theme = document.documentElement.getAttribute('data-theme')
    const faint = getComputedStyle(document.documentElement).getPropertyValue('--color-text-faint').trim()
    return { theme, faint, ok: theme === 'light' ? faint === '#66788c' : faint === '#8f9fb8' }
  })()`)
  check(`theme-aware faint token (${tokenCheck.theme})`, tokenCheck.ok, tokenCheck.faint)

  console.log(failures ? `\n${failures} FAILURES` : '\nALL CHECKS PASSED')
  ws.close()
  chrome.kill()
  process.exit(failures ? 1 : 0)
}

run().catch((e) => {
  console.error(e)
  chrome.kill()
  process.exit(1)
})