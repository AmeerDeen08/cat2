// ============================================================================
// Date-aware status / countdown logic. Pure functions take `now` explicitly so
// they are trivially testable and the UI stays in sync with real time.
// ============================================================================

const MS_PER_DAY = 24 * 60 * 60 * 1000

// "2026-09-14" -> local Date at midnight (avoids UTC shift bugs).
export function parseDateOnly(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// "2026-09-14" + "14:00" -> local Date.
export function parseDateTime(dateStr, timeStr) {
  const base = parseDateOnly(dateStr)
  const [h, m] = timeStr.split(':').map(Number)
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, m, 0, 0)
}

// Whole days from `from` to `to` (date-only, midnight-anchored).
// Accepts either a Date or a "YYYY-MM-DD" string.
export function daysBetween(from, to) {
  const a = typeof from === 'string' ? parseDateOnly(from) : parseDateOnly(toIso(from))
  const b = typeof to === 'string' ? parseDateOnly(to) : parseDateOnly(toIso(to))
  return Math.round((b - a) / MS_PER_DAY)
}

function toIso(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Effective end of an exam (falls back to end of day if endTime is missing).
export function examEndDate(exam) {
  if (exam.endTime) return parseDateTime(exam.date, exam.endTime)
  const d = parseDateOnly(exam.date)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
}

// 'upcoming' | 'today' | 'completed'
export function getExamStatus(exam, now = new Date()) {
  const examDay = parseDateOnly(exam.date)
  const today = parseDateOnly(toIso(now))
  if (examDay.getTime() > today.getTime()) return 'upcoming'
  if (examDay.getTime() < today.getTime()) return 'completed'
  return now.getTime() < examEndDate(exam).getTime() ? 'today' : 'completed'
}

// Days remaining until `exam` from `now` (never negative).
export function daysUntil(exam, now = new Date()) {
  const d = daysBetween(now, exam.date)
  return Math.max(0, d)
}

// Nearest exam that is upcoming or ongoing today. null when all are finished.
export function getNextExam(exams, now = new Date()) {
  const active = exams
    .map((e) => ({ exam: e, status: getExamStatus(e, now) }))
    .filter(({ status }) => status !== 'completed')
  active.sort((a, b) => {
    const ad = parseDateTime(a.exam.date, a.exam.startTime || '00:00')
    const bd = parseDateTime(b.exam.date, b.exam.startTime || '00:00')
    return ad.getTime() - bd.getTime()
  })
  return active.length ? active[0].exam : null
}

// Nearest upcoming academic event (used once CAT2 has fully ended).
export function getNextEvent(events, now = new Date()) {
  return events
    .filter((e) => getExamStatus({ date: e.date }, now) !== 'completed')
    .sort((a, b) => parseDateOnly(a.date).getTime() - parseDateOnly(b.date).getTime())[0] || null
}

// Single source for the homepage hero:
//   { status, daysLeft, nextExam, nextEvent }
// status: 'upcoming' (X days to go) | 'today' (exam today) | 'completed'
export function getCountdown(exams, events, now = new Date()) {
  const nextExam = getNextExam(exams, now)
  if (nextExam) {
    const status = getExamStatus(nextExam, now)
    return {
      status,
      daysLeft: daysUntil(nextExam, now),
      nextExam,
      nextEvent: null,
    }
  }
  return {
    status: 'completed',
    daysLeft: null,
    nextExam: null,
    nextEvent: getNextEvent(events, now),
  }
}

// ---------------- formatting helpers ----------------

export function getDayName(dateOrStr) {
  const d = typeof dateOrStr === 'string' ? parseDateOnly(dateOrStr) : dateOrStr
  return d.toLocaleDateString('en-US', { weekday: 'long' })
}

export function getShortDay(dateOrStr) {
  const d = typeof dateOrStr === 'string' ? parseDateOnly(dateOrStr) : dateOrStr
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

export function formatDate(dateStr) {
  return parseDateOnly(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateShort(dateStr) {
  return parseDateOnly(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

// "14:00" -> "2:00 PM"
export function formatTime(timeStr) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  const hour12 = h % 12 === 0 ? 12 : h % 12
  const suffix = h < 12 ? 'AM' : 'PM'
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`
}

// "09:30" -> "9:30" (minutes dropped when :00)
export function formatTimeCompact(timeStr) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  const hour12 = h % 12 === 0 ? 12 : h % 12
  const suffix = h < 12 ? 'AM' : 'PM'
  return m === 0 ? `${hour12} ${suffix}` : `${hour12}:${String(m).padStart(2, '0')} ${suffix}`
}