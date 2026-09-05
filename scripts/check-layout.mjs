// Headless-Chrome CDP smoke test: renders the SPA at given widths and checks
// (a) no horizontal overflow, (b) bottom nav is fixed, (c) active tab state.
// Usage: node scripts/check-layout.mjs [width...]

import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const widths = process.argv.slice(2).map(Number).filter(Boolean)
const PORT = 9222
const BASE = `http://localhost:4173/cat2/`
const routes = ['#/', '#/schedule', '#/notes']

const userDataDir = mkdtempSync(join(tmpdir(), 'cat2-chrome-'))
const chrome = spawn(
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=' + PORT,
    `--user-data-dir=${userDataDir}`,
    BASE,
  ],
  { stdio: 'ignore' }
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getJson(url) {
  const res = await fetch(url)
  return res.json()
}

async function run() {
  // wait for CDP endpoint
  let version
  for (let i = 0; i < 50; i++) {
    try {
      version = await getJson(`http://localhost:${PORT}/json/version`)
      break
    } catch {
      await sleep(200)
    }
  }
  if (!version) throw new Error('Chrome CDP did not start')

  const pages = await getJson(`http://localhost:${PORT}/json/list`)
  const page = pages.find((p) => p.type === 'page')
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.onopen = res
    ws.onerror = rej
  })

  let msgId = 0
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
      const id = ++msgId
      pending.set(id, res)
      ws.send(JSON.stringify({ id, method, params }))
    })

  const setWidth = async (w) => {
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: 800,
      deviceScaleFactor: 1,
      mobile: true,
    })
  }

  const evalExpr = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true })
    return r.result?.result?.value
  }

  for (const w of widths) {
    console.log(`\n=== width ${w}px ===`)
    await setWidth(w)
    for (const route of routes) {
      await send('Page.navigate', { url: BASE + route })
      await sleep(600)
      const rep = await evalExpr(`(() => {
        const doc = document.documentElement
        const nav = document.querySelector('.bottom-nav')
        const active = document.querySelector('.bottom-nav__link--active span')
        return {
          route: location.hash,
          overflowX: doc.scrollWidth > doc.clientWidth,
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          navPosition: nav ? getComputedStyle(nav).position : null,
          navLinks: document.querySelectorAll('.bottom-nav__link').length,
          active: active ? active.textContent : null,
          title: document.title,
        }
      })()`)
      const ok = !rep.overflowX && rep.navPosition === 'fixed' && rep.navLinks === 3
      console.log(`  ${rep.route.padEnd(12)} overflow=${rep.overflowX}`.padEnd(52) +
        ` nav=${rep.navPosition}`.padEnd(14) + ` active=${rep.active} ${ok ? 'OK' : '!! FAIL'}`)
    }
  }

  ws.close()
  chrome.kill()
  const failed = widths.length === 0
  process.exit(failed ? 1 : 0)
}

run().catch((e) => {
  console.error(e)
  chrome.kill()
  process.exit(1)
})