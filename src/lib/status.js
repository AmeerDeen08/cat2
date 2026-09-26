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

// What the homepage hero renders, derived purely from exam data + `now`:
//   { status: 'upcoming' | 'today' | 'completed', exam, event }
// An exam in progress right now counts as the current exam. When every CAT2
// exam has finished, exam is null and the next academic event (if any) is used.
export function getNextUp(exams, events, now = new Date()) {
  const exam = getNextExam(exams, now)
  if (exam) return { status: getExamStatus(exam, now), exam, event: null }
  return { status: 'completed', exam: null, event: getNextEvent(events, now) }
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

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

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

// "Wednesday, 30 September 2026"
export function formatDateLong(dateStr) {
  return `${getDayName(dateStr)}, ${formatDateMedium(dateStr)}`
}

// "30 September 2026" (day-first, matching the official timetable wording)
export function formatDateMedium(dateStr) {
  const d = parseDateOnly(dateStr)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// Splits an issued seat string such as "45/R2C7/04:00 PM" into its parts so the
// UI can lead with the seat number. Never throws: unknown shapes fall back to
// a plain seat label with no row/column split.
export function parseSeat(seatStr) {
  if (!seatStr) return null
  const [seat, position, reporting] = String(seatStr)
    .split('/')
    .map((part) => part.trim())
  if (!seat) return null
  return {
    seat,
    row: position?.match(/R\s*\d+/i)?.[0]?.replace(/\s+/g, '') ?? null,
    col: position?.match(/C\s*\d+/i)?.[0]?.replace(/\s+/g, '') ?? null,
    reporting: reporting || null,
    raw: String(seatStr),
  }
}

// "14:00" -> "2:00 PM"
export function formatTime(timeStr) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  const hour12 = h % 12 === 0 ? 12 : h % 12
  const suffix = h < 12 ? 'AM' : 'PM'
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`
}

// Duration between two "HH:MM" times -> "1 hr 30 min" | "1 hr" | "45 min"
export function formatDuration(startTime, endTime) {
  if (!startTime || !endTime) return null
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const mins = eh * 60 + em - (sh * 60 + sm)
  if (mins <= 0) return null
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h && m) return `${h} hr ${m} min`
  if (h) return `${h} hr`
  return `${m} min`
}

// "09:30" -> "9:30" (minutes dropped when :00)
export function formatTimeCompact(timeStr) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  const hour12 = h % 12 === 0 ? 12 : h % 12
  const suffix = h < 12 ? 'AM' : 'PM'
  return m === 0 ? `${hour12} ${suffix}` : `${hour12}:${String(m).padStart(2, '0')} ${suffix}`
}

// "16:30" + "18:00" -> "4:30 PM – 6:00 PM" (null when there is no start time)
export function formatTimeRange(startTime, endTime) {
  if (!startTime) return null
  const start = formatTime(startTime)
  return endTime ? `${start} – ${formatTime(endTime)}` : start
}
