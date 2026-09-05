import { Link } from 'react-router-dom'
import { getExamStatus, getDayName, formatDateShort, formatTime } from '../lib/status.js'
import { IconCalendar, IconClock, IconPin } from './icons.jsx'

const badgeByStatus = {
  upcoming: 'badge badge--upcoming badge--dot',
  today: 'badge badge--today badge--dot',
  completed: 'badge badge--completed badge--dot',
}

export default function ExamCard({ exam, now = new Date() }) {
  const status = getExamStatus(exam, now)
  const dot = status === 'completed' ? '' : ' badge--dot'

  return (
    <Link to={`/exam/${exam.id}`} className="card card--interactive exam-card">
      <div className="exam-card__head">
        <div className="exam-card__title">
          <span className="exam-card__code">{exam.subjectCode}</span>
          <span className="exam-card__name">{exam.subject}</span>
        </div>
        <span className={`badge badge--${status}${dot}`}>{status}</span>
      </div>

      <div className="exam-card__meta">
        <span className="meta-row">
          <IconCalendar className="meta-row__icon" />
          {formatDateShort(exam.date)} · {getDayName(exam.date)}
        </span>
        {exam.startTime && (
          <span className="meta-row">
            <IconClock className="meta-row__icon" />
            {formatTime(exam.startTime)}
            {exam.endTime ? ` – ${formatTime(exam.endTime)}` : ''}
          </span>
        )}
        {exam.venue && (
          <span className="meta-row">
            <IconPin className="meta-row__icon" />
            {exam.venue}
          </span>
        )}
      </div>
    </Link>
  )
}