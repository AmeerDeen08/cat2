import { Link } from 'react-router-dom'
import { exams, events, CONFIG } from '../data/exams.js'
import { getCountdown, getExamStatus, formatDate, getDayName } from '../lib/status.js'
import { useNow } from '../lib/use-now.js'
import ExamCard from '../components/ExamCard.jsx'
import { IconCalendar, IconNotes, IconExternal, IconSparkle, IconCheck } from '../components/icons.jsx'

function Hero({ countdown, now }) {
  const { status, daysLeft, nextExam, nextEvent } = countdown

  let number
  let unit
  let sub
  if (status === 'upcoming') {
    number = daysLeft
    unit = daysLeft === 1 ? 'day to go' : 'days to go'
    sub = `Your next CAT2 exam is approaching.`
  } else if (status === 'today') {
    number = 'Today'
    unit = 'exam day'
    sub = `CAT2 is happening today.`
  } else {
    number = 'Done'
    unit = 'CAT2 completed'
    sub = nextEvent
      ? `Next up: ${nextEvent.name}.`
      : 'All CAT2 exams have ended.'
  }

  const heroDetail = nextExam ? (
    <>
      <span className="hero-meta__date">
        {formatDate(nextExam.date)} · {getDayName(nextExam.date)}
      </span>
      <span className="hero-meta__subject">{nextExam.subject}</span>
    </>
  ) : nextEvent ? (
    <>
      <span className="hero-meta__date">
        {formatDate(nextEvent.date)} · {getDayName(nextEvent.date)}
      </span>
      <span className="hero-meta__subject">{nextEvent.name}</span>
    </>
  ) : null

  return (
    <section className="hero" aria-label="CAT2 countdown">
      <div className="hero__label">
        {status === 'upcoming' && <IconSparkle className="hero__label-icon" />}
        {status === 'today' && <IconCalendar className="hero__label-icon" />}
        {status === 'completed' && <IconCheck className="hero__label-icon" />}
        {status === 'upcoming' && 'CAT2 countdown'}
        {status === 'today' && 'Exam is today'}
        {status === 'completed' && 'CAT2 completed'}
      </div>

      <div className="hero__count">
        <span className="hero__number">{number}</span>
        <span className="hero__unit">{unit}</span>
      </div>

      <p className="hero__sub">{sub}</p>
      {heroDetail && <div className="hero-meta">{heroDetail}</div>}
    </section>
  )
}

export default function Home() {
  const now = useNow()
  const countdown = getCountdown(exams, events, now)
  const upcoming = exams.filter((e) => getExamStatus(e, now) !== 'completed')

  return (
    <>
      <header className="page-header">
        <p className="page-header__eyebrow">{CONFIG.institution}</p>
        <h1 className="page-header__title">{CONFIG.cat2Label}</h1>
        <p className="page-header__subtitle">
          {countdown.status === 'upcoming' &&
            `${countdown.daysLeft} ${countdown.daysLeft === 1 ? 'day' : 'days'} until your next CAT2 exam`}
          {countdown.status === 'today' && 'Your next CAT2 exam is today'}
          {countdown.status === 'completed' && 'CAT2 has wrapped — check what is next'}
        </p>
      </header>

      <Hero countdown={countdown} now={now} />

      {upcoming.length > 0 && (
        <section aria-label="Upcoming exams">
          <div className="section-title">
            <h2>Upcoming exams</h2>
            <Link className="section-title__link" to="/schedule">
              Full schedule
            </Link>
          </div>
          <div className="stack">
            {upcoming.slice(0, 2).map((exam) => (
              <ExamCard key={exam.id} exam={exam} now={now} />
            ))}
          </div>
        </section>
      )}

      <section aria-label="Quick access">
        <h2 className="section-title">Quick access</h2>
        <div className="quick-grid">
          <Link className="card card--interactive quick-card" to="/schedule">
            <span className="quick-card__icon quick-card__icon--primary">
              <IconCalendar />
            </span>
            <span className="quick-card__body">
              <span className="quick-card__title">Full schedule</span>
              <span className="quick-card__desc">Every CAT2 exam at a glance</span>
            </span>
          </Link>
          <a
            className="card card--interactive quick-card"
            href={CONFIG.knotesURL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="quick-card__icon">
              <IconNotes />
            </span>
            <span className="quick-card__body">
              <span className="quick-card__title">
                Open KNotes <IconExternal className="quick-card__ext" />
              </span>
              <span className="quick-card__desc">VIT M.Tech notes repository</span>
            </span>
          </a>
        </div>
      </section>
    </>
  )
}