// Renders an exam detail page in headless Chrome and reports its structure.
// Usage: node scripts/check-detail.mjs [port] [examId]
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PORT = process.argv[2] || '4173'
const EXAM_ID = process.argv[3] || 'cat2-1'
const BASE = `http://localhost:${PORT}/cat2/#/exam/${EXAM_ID}`
const CDP_PORT = 9227

const userDataDir = mkdtempSync(join(tmpdir(), 'cat2-detail-cdp-'))
const chrome = spawn(
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ['--headless', '--disable-gpu', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${userDataDir}`, BASE],
  { stdio: 'ignore' }
)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const run = async () => {
  let version
  for (let i = 0; i < 50; i++) {
    try {
      version = await fetch(`http://localhost:${CDP_PORT}/json/version`).then((r) => r.json())
      break
    } catch {
      await sleep(200)
    }
  }
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
      const doc = document.documentElement
      const t = (sel) => document.querySelector(sel)?.textContent?.trim() ?? null
      return {
        route: location.hash,
        backBtn: t('.back-btn'),
        code: t('.detail-hero__code'),
        title: t('.detail-hero__title'),
        when: t('.detail-hero__when'),
        badge: t('.detail-hero .badge'),
        rows: [...document.querySelectorAll('.detail-row')].map((r) => ({
          label: r.querySelector('.detail-row__label')?.textContent?.trim(),
          value: r.querySelector('.detail-row__value')?.textContent?.trim(),
        })),
        overflowX: doc.scrollWidth > doc.clientWidth,
      }
    })()`,
    returnByValue: true,
  })
  const r = result.result?.result?.value
  console.log(JSON.stringify(r, null, 2))
  ws.close()
  chrome.kill()
  if (!r.title) process.exit(2)
}

run().catch((e) => {
  console.error(e)
  chrome.kill()
  process.exit(1)
})