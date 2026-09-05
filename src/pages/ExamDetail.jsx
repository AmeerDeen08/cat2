import { Link, useParams, useLocation, useNavigate } from 'react-router-dom'
import { exams, CONFIG } from '../data/exams.js'
import {
  getExamStatus,
  getDayName,
  formatDate,
  formatTime,
} from '../lib/status.js'
import { useNow } from '../lib/use-now.js'
import {
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconPin,
  IconNotes,
  IconSparkle,
  IconCheck,
} from '../components/icons.jsx'

const statusCopy = {
  upcoming: 'Upcoming',
  today: 'Today',
  completed: 'Completed',
}

function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="detail-row">
      <span className="detail-row__icon">
        <Icon />
      </span>
      <div className="detail-row__body">
        <span className="detail-row__label">{label}</span>
        <span className="detail-row__value">{value}</span>
      </div>
    </div>
  )
}

function BackButton() {
  const location = useLocation()
  const navigate = useNavigate()
  const canGoBack = location.key !== 'default'
  return (
    <Link to={canGoBack ? undefined : '/schedule'} className="back-btn" onClick={canGoBack ? () => navigate(-1) : undefined}>
      <IconArrowLeft className="back-btn__icon" />
      Back
    </Link>
  )
}

export default function ExamDetail() {
  const { id } = useParams()
  const now = useNow()
  const exam = exams.find((e) => e.id === id)

  if (!exam) {
    return (
      <>
        <BackButton />
        <div className="card empty-state">
          <p className="empty-state__title">Exam not found</p>
          <p className="empty-state__sub">It may have been removed from the schedule.</p>
          <Link className="btn btn--primary btn--block" to="/schedule">
            View schedule
          </Link>
        </div>
      </>
    )
  }

  const status = getExamStatus(exam, now)
  const time = exam.startTime
    ? `${formatTime(exam.startTime)}${exam.endTime ? ` – ${formatTime(exam.endTime)}` : ''}`
    : null

  const StatusIcon = status === 'today' ? IconSparkle : status === 'completed' ? IconCheck : IconCalendar

  return (
    <>
      <BackButton />

      <section className="detail-hero card" aria-label="Exam overview">
        <div className="detail-hero__top">
          <span className="detail-hero__code">{exam.subjectCode}</span>
          <span className={`badge badge--${status}${status === 'completed' ? '' : ' badge--dot'}`}>
            {statusCopy[status]}
          </span>
        </div>
        <h1 className="detail-hero__title">{exam.subject}</h1>
        <p className="detail-hero__when">
          <StatusIcon className="detail-hero__when-icon" />
          {formatDate(exam.date)} · {getDayName(exam.date)}
          {exam.startTime ? ` · ${formatTime(exam.startTime)}` : ''}
        </p>
      </section>

      <section className="card detail-list" aria-label="Exam details">
        <DetailRow icon={IconCalendar} label="Date" value={`${formatDate(exam.date)} · ${getDayName(exam.date)}`} />
        <DetailRow icon={IconClock} label="Time" value={time} />
        <DetailRow icon={IconPin} label="Venue" value={exam.venue} />
        <DetailRow icon={IconSparkle} label="Faculty" value={exam.faculty} />
        <DetailRow icon={IconNotes} label="Notes" value={exam.notes} />
      </section>

      <p className="detail-foot">{CONFIG.institution} · {CONFIG.cat2Label}</p>
    </>
  )
}