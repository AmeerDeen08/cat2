// Renders the Schedule tab in headless Chrome and reports structure/overflow.
// Usage: node scripts/check-schedule.mjs [port] [width]
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PORT = process.argv[2] || '4173'
const WIDTH = Number(process.argv[3] || '375')
const BASE = `http://localhost:${PORT}/cat2/#/schedule`
const CDP_PORT = 9224

const userDataDir = mkdtempSync(join(tmpdir(), 'cat2-sched-cdp-'))
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
  await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 800, deviceScaleFactor: 1, mobile: true })
  await send('Page.navigate', { url: BASE })
  await sleep(900)

  const result = await send('Runtime.evaluate', {
    expression: `(() => {
      const doc = document.documentElement
      return {
        width: ${WIDTH},
        title: document.querySelector('.page-header__title')?.textContent?.trim(),
        subtitle: document.querySelector('.page-header__subtitle')?.textContent?.trim(),
        dayGroups: document.querySelectorAll('.timeline-item').length,
        markers: [...document.querySelectorAll('.timeline-item__num')].map((e) => e.textContent.trim()),
        examCards: document.querySelectorAll('.exam-card').length,
        badges: [...document.querySelectorAll('.exam-card .badge')].map((e) => e.textContent.trim()),
        eventsRows: document.querySelectorAll('.events-row').length,
        tappable: [...document.querySelectorAll('.exam-card')].every((c) => c.tagName === 'A'),
        overflowX: doc.scrollWidth > doc.clientWidth,
      }
    })()`,
    returnByValue: true,
  })
  const r = result.result.result.value
  console.log(JSON.stringify(r, null, 2))
  ws.close()
  chrome.kill()
  if (!r.examCards) process.exit(2)
}

run().catch((e) => {
  console.error(e)
  chrome.kill()
  process.exit(1)
})