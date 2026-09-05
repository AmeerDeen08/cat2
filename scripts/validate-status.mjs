import {
  getExamStatus,
  getNextExam,
  getNextEvent,
  getCountdown,
  daysUntil,
  formatTime,
  formatTimeCompact,
  formatDuration,
} from '../src/lib/status.js'
import { exams, events } from '../src/data/exams.js'

let pass = 0
let fail = 0

function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (ok) {
    pass++
    console.log(`  ok   ${label}  ->  ${JSON.stringify(actual)}`)
  } else {
    fail++
    console.log(`  FAIL ${label}  ->  got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`)
  }
}

function at(dateStr, timeStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [h, min] = (timeStr || '00:00').split(':').map(Number)
  return new Date(y, m - 1, d, h, min)
}

console.log('# Status computation\n')

// 1. Before the first exam -> upcoming, non-negative days.
{
  const now = at('2026-09-24', '10:00')
  const exam = exams[0]
  check('status a few days before', getExamStatus(exam, now), 'upcoming')
  check('daysLeft before', daysUntil(exam, now), 2)
}

// 2. On the exam day, before it ends -> today.
{
  const now = at('2026-09-26', '08:00')
  check('status on the day', getExamStatus(exams[0], now), 'today')
  check('daysLeft on the day', daysUntil(exams[0], now), 0)
}

// 3. Same day but after end time -> completed (no negative display).
{
  const now = at('2026-09-26', '16:30')
  check('status after end time', getExamStatus(exams[0], now), 'completed')
  check('daysUntil never negative', daysUntil(exams[0], now), 0)
}

// 4. getNextExam picks earliest active exam.
{
  const now = at('2026-09-26', '18:00')
  check('next exam id', getNextExam(exams, now)?.id, exams[1].id)
}

// 5. All exams finished -> countdown says completed. The official timetable
//    contains no post-CAT2 events, so nextEvent is null (nothing invented).
{
  const now = at('2026-10-10', '12:00')
  check('all passed -> next exam null', getNextExam(exams, now), null)
  check('all passed -> next event null', getNextEvent(events, now), null)
}

// 6. getCountdown end-to-end.
{
  const upcoming = getCountdown(exams, events, at('2026-09-24', '09:00'))
  check('countdown status (future)', upcoming.status, 'upcoming')
  check('countdown daysLeft (future)', upcoming.daysLeft, 2)

  const today = getCountdown(exams, events, at('2026-09-26', '08:00'))
  check('countdown status (today)', today.status, 'today')
  check('countdown daysLeft (today)', today.daysLeft, 0)

  const done = getCountdown(exams, events, at('2026-10-10', '12:00'))
  check('countdown status (done)', done.status, 'completed')
  check('countdown nextEvent (done)', done.nextEvent, null)
}

// 7. Formatting helpers.
check('formatTime 14:00', formatTime('14:00'), '2:00 PM')
check('formatTime 09:30', formatTime('09:30'), '9:30 AM')
check('formatTimeCompact 09:00', formatTimeCompact('09:00'), '9 AM')
check('formatTime null', formatTime(null), null)
check('duration 14:00->15:30', formatDuration('14:00', '15:30'), '1 hr 30 min')
check('duration 15:15->16:30', formatDuration('15:15', '16:30'), '1 hr 15 min')
check('duration all-hour', formatDuration('10:00', '11:00'), '1 hr')

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)