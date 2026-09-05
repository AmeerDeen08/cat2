import { exams, events, CONFIG } from '../data/exams.js'
import { getExamStatus, parseDateOnly, getDayName, formatDate } from '../lib/status.js'
import { useNow } from '../lib/use-now.js'
import ExamCard from '../components/ExamCard.jsx'

function groupByDate(list) {
  const groups = []
  for (const item of list) {
    const last = groups[groups.length - 1]
    if (last && last.date === item.date) last.items.push(item)
    else groups.push({ date: item.date, items: [item] })
  }
  return groups
}

function DayMarker({ date, now }) {
  const month = formatDate(date).split(' ')[0]
  const dayNum = parseDateOnly(date).getDate()

  return (
    <div className="timeline-item__marker" aria-hidden="true">
      <span className="timeline-item__num">{dayNum}</span>
      <span className="timeline-item__month">{month}</span>
      <span className="timeline-item__weekday">{getDayName(date).slice(0, 3)}</span>
    </div>
  )
}

export default function Schedule() {
  const now = useNow()
  const groups = groupByDate(exams)
  const totals = {
    total: exams.length,
    remaining: exams.filter((e) => getExamStatus(e, now) !== 'completed').length,
  }

  return (
    <>
      <header className="page-header">
        <p className="page-header__eyebrow">{CONFIG.cat2Label} · schedule</p>
        <h1 className="page-header__title">Schedule</h1>
        <p className="page-header__subtitle">
          {totals.total} exams · {totals.remaining} remaining · tap any exam for details
        </p>
      </header>

      <div className="timeline" aria-label="CAT2 schedule">
        {groups.map((group) => {
          const allDone = group.items.every((e) => getExamStatus(e, now) === 'completed')
          return (
            <div key={group.date} className="timeline-item">
              <div className="timeline-item__rail" aria-hidden="true">
                <span
                  className={`timeline-item__dot${allDone ? ' timeline-item__dot--done' : ''}`}
                />
              </div>
              <DayMarker date={group.date} now={now} />
              <div className="stack">
                {group.items.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} now={now} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {events.length > 0 && (
        <section aria-label="Academic events">
          <h2 className="section-title">Academic events</h2>
          <div className="card events-card">
            {events.map((ev) => (
              <div key={ev.id} className="events-row">
                <span className="events-row__date">{formatDate(ev.date)}</span>
                <span className="events-row__name">{ev.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}