import { Link } from 'react-router-dom'
import { exams, events, CONFIG } from '../data/exams.js'
import {
  getNextUp,
  getExamStatus,
  daysUntil,
  formatDateShort,
  formatDateLong,
  formatDateMedium,
  formatTimeRange,
  formatTime,
  getDayName,
  parseSeat,
} from '../lib/status.js'
import { useNow } from '../lib/use-now.js'
import ExamCard from '../components/ExamCard.jsx'
import { IconCalendar, IconNotes, IconExternal, IconCheck, IconPin, IconSeat, IconArrowRight } from '../components/icons.jsx'

function HeroVenue({ venue }) {
  if (!venue) return null
  return (
    <div className="hero-venue">
      <span className="hero-venue__icon">
        <IconPin />
      </span>
      <span className="hero-venue__body">
        <span className="hero-venue__label">Venue</span>
        <span className="hero-venue__value">{venue}</span>
      </span>
    </div>
  )
}

function HeroSeat({ seat }) {
  const parsed = parseSeat(seat)
  if (!parsed) return null
  return (
    <div className="hero-seat">
      <span className="hero-seat__icon">
        <IconSeat />
      </span>
      <span className="hero-seat__body">
        <span className="hero-seat__label">Seat details</span>
        <span className="hero-seat__value">{parsed.raw}</span>
        <span className="hero-seat__note">
          Seat {parsed.seat}
          {parsed.row ? ` · Row ${parsed.row}` : ''}
          {parsed.col ? ` · Col ${parsed.col}` : ''}
        </span>
      </span>
    </div>
  )
}

function HeroExam({ exam, status, now }) {
  const daysLeft = daysUntil(exam, now)
  const pill =
    status === 'today' ? 'Happening now' : daysLeft === 0 ? 'Today' : `In ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`

  return (
    <Link to={`/exam/${exam.id}`} className="hero card card--interactive" aria-label={`${exam.subject} exam details`}>
      <div className="hero__eyebrow">
        <span className="hero__eyebrow-label">{status === 'today' ? 'Exam today' : 'Next exam'}</span>
        <span className={`badge badge--${status === 'today' ? 'today' : 'upcoming'} hero__pill`}>{pill}</span>
      </div>

      <h2 className="hero__subject">{exam.subject}</h2>
      <p className="hero__code">
        {exam.subjectCode}
        {exam.examType ? ` · ${exam.examType}` : ''}
      </p>

      <div className="hero__when">
        <div className="hero__when-cell">
          <span className="hero__when-label">Date</span>
          <span className="hero__when-value">{getDayName(exam.date)}</span>
          <span className="hero__when-note">{formatDateMedium(exam.date)}</span>
        </div>
        <div className="hero__when-cell">
          <span className="hero__when-label">Exam time</span>
          <span className="hero__when-value">{formatTimeRange(exam.startTime, exam.endTime)}</span>
          <span className="hero__when-note">
            {exam.reportingTime ? `Report by ${formatTime(exam.reportingTime)}` : exam.examType || ''}
          </span>
        </div>
      </div>

      <HeroVenue venue={exam.venue} />
      <HeroSeat seat={exam.seat} />

      <span className="hero__cta">
        Exam details
        <IconArrowRight className="hero__cta-icon" />
      </span>
    </Link>
  )
}

function HeroCompleted({ event }) {
  return (
    <section className="hero hero--completed card" aria-label="CAT2 completed">
      <div className="hero__eyebrow">
        <span className="hero__eyebrow-icon">
          <IconCheck />
        </span>
        <span className="hero__eyebrow-label">Cat2 completed</span>
      </div>
      <h2 className="hero__subject">All CAT2 exams are done</h2>
      {event ? (
        <div className="hero__when hero__when--single">
          <div className="hero__when-cell">
            <span className="hero__when-label">Next event</span>
            <span className="hero__when-value">{event.name}</span>
            <span className="hero__when-note">{formatDateLong(event.date)}</span>
          </div>
        </div>
      ) : (
        <p className="hero__sub">Keep the seat and venue details handy for the next cycle.</p>
      )}
    </section>
  )
}

function Hero({ nextUp, now }) {
  if (!nextUp.exam) return <HeroCompleted event={nextUp.event} />
  return <HeroExam exam={nextUp.exam} status={nextUp.status} now={now} />
}

export default function Home() {
  const now = useNow()
  const nextUp = getNextUp(exams, events, now)
  const upcoming = exams.filter((e) => getExamStatus(e, now) !== 'completed')
  const first = exams[0]
  const last = exams[exams.length - 1]

  return (
    <>
      <header className="page-header">
        <p className="page-header__eyebrow">{CONFIG.institution}</p>
        <h1 className="page-header__title">{CONFIG.cat2Label}</h1>
        <p className="page-header__subtitle">
          {exams.length} exams · {formatDateShort(first.date)} – {formatDateShort(last.date)} · seats &amp; venues
        </p>
      </header>

      <Hero nextUp={nextUp} now={now} />

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
