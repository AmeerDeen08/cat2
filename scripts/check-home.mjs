// Renders the homepage in headless Chrome and reports the hero content.
// Usage: node scripts/check-home.mjs [port]
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PORT = process.argv[2] || '4173'
const BASE = `http://localhost:${PORT}/cat2/`
const CDP_PORT = 9223

const userDataDir = mkdtempSync(join(tmpdir(), 'cat2-home-cdp-'))
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
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 800, deviceScaleFactor: 1, mobile: true })
  await send('Page.navigate', { url: BASE })
  await sleep(900)

  const result = await send('Runtime.evaluate', {
    expression: `(() => {
      const t = (sel) => document.querySelector(sel)?.textContent?.trim() ?? null
      const doc = document.documentElement
      return {
        title: t('.page-header__title'),
        subtitle: t('.page-header__subtitle'),
        heroLabel: t('.hero__label'),
        heroNumber: t('.hero__number'),
        heroUnit: t('.hero__unit'),
        heroSub: t('.hero__sub'),
        heroDate: t('.hero-meta__date'),
        heroSubject: t('.hero-meta__subject'),
        quickLinks: [...document.querySelectorAll('.quick-card__title')].map((e) => e.childNodes[0].textContent.trim()),
        overflowX: doc.scrollWidth > doc.clientWidth,
      }
    })()`,
    returnByValue: true,
  })
  const r = result.result.result.value
  console.log(JSON.stringify(r, null, 2))

  ws.close()
  chrome.kill()
  if (!r.heroLabel) process.exit(2)
}

run().catch((e) => {
  console.error(e)
  chrome.kill()
  process.exit(1)
})