import {
  getExamStatus,
  getNextExam,
  getNextEvent,
  getNextUp,
  getCountdown,
  daysUntil,
  formatTime,
  formatTimeCompact,
  formatTimeRange,
  formatDuration,
  formatDateMedium,
  formatDateLong,
  getDayName,
  parseSeat,
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

// 7. Dynamic hero selection (getNextUp) — never hard-coded.
{
  const before = getNextUp(exams, events, at('2026-09-20', '09:00'))
  check('hero before first exam', before.exam?.id, 'MAENG501')
  check('hero before first exam status', before.status, 'upcoming')

  const during = getNextUp(exams, events, at('2026-09-26', '14:30'))
  check('hero during an exam', during.exam?.id, 'MAENG501')
  check('hero during an exam status', during.status, 'today')

  const between = getNextUp(exams, events, at('2026-09-26', '16:00'))
  check('hero skips a finished exam', between.exam?.id, 'MACSE513')

  const later = getNextUp(exams, events, at('2026-10-01', '09:00'))
  check('hero mid-timetable', later.exam?.id, 'MACSE514')

  const done = getNextUp(exams, events, at('2026-10-10', '12:00'))
  check('hero after last exam', done.exam, null)
  check('hero after last exam status', done.status, 'completed')
}

// 8. Issued venue + seat details are present and unmodified.
{
  const expected = {
    MAENG501: ['SJT204', '46/R2C8/01:30 PM'],
    MACSE513: ['SJT710', '63/R4C9/04:00 PM'],
    MACSE512: ['SJT215', '18/R2C4/04:00 PM'],
    MACSE515: ['SJT222', '45/R2C7/04:00 PM'],
    MACSE511: ['SJT711', '45/R2C7/04:00 PM'],
    MACSE514: ['SJT124', '52/R5C8/04:00 PM'],
    MASTS601: ['PRP706', '19/R8C2/02:45 PM'],
  }
  check('exam count', exams.length, Object.keys(expected).length)
  for (const exam of exams) {
    const [venue, seat] = expected[exam.id] || []
    check(`${exam.id} venue`, exam.venue, venue)
    check(`${exam.id} seat`, exam.seat, seat)
  }
  check('no generic AN1/AN2 venues', exams.some((e) => e.venue === 'AN1' || e.venue === 'AN2'), false)
}

// 9. Seat parsing for the highlighted seat blocks.
check('parseSeat 45/R2C7/04:00 PM', parseSeat('45/R2C7/04:00 PM'), {
  seat: '45',
  row: 'R2',
  col: 'C7',
  reporting: '04:00 PM',
  raw: '45/R2C7/04:00 PM',
})
check('parseSeat null', parseSeat(undefined), null)
check('parseSeat seat only', parseSeat('46'), { seat: '46', row: null, col: null, reporting: null, raw: '46' })

// 10. Formatting helpers.
check('formatTime 14:00', formatTime('14:00'), '2:00 PM')
check('formatTime 09:30', formatTime('09:30'), '9:30 AM')
check('formatTimeCompact 09:00', formatTimeCompact('09:00'), '9 AM')
check('formatTime null', formatTime(null), null)
check('duration 14:00->15:30', formatDuration('14:00', '15:30'), '1 hr 30 min')
check('duration 15:15->16:30', formatDuration('15:15', '16:30'), '1 hr 15 min')
check('duration all-hour', formatDuration('10:00', '11:00'), '1 hr')
check('range 16:30->18:00', formatTimeRange('16:30', '18:00'), '4:30 PM – 6:00 PM')
check('range start only', formatTimeRange('15:15', null), '3:15 PM')
check('range no start', formatTimeRange(null, '18:00'), null)
check('date medium', formatDateMedium('2026-09-30'), '30 September 2026')
check('date long', formatDateLong('2026-09-30'), 'Wednesday, 30 September 2026')
check('day name', getDayName('2026-09-30'), 'Wednesday')

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)