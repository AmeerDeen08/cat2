import { NavLink } from 'react-router-dom'
import { IconHome, IconCalendar, IconNotes } from './icons.jsx'

const links = [
  { to: '/', label: 'Home', icon: IconHome, matchEnd: true },
  { to: '/schedule', label: 'Schedule', icon: IconCalendar },
  { to: '/notes', label: 'Notes', icon: IconNotes },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      <div className="bottom-nav__inner">
        {links.map(({ to, label, icon: Icon, matchEnd }) => (
          <NavLink
            key={to}
            to={to}
            end={matchEnd}
            className={({ isActive }) =>
              `bottom-nav__link${isActive ? ' bottom-nav__link--active' : ''}`
            }
          >
            <Icon className="bottom-nav__icon" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}