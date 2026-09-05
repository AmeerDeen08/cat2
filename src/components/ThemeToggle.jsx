import { useTheme } from '../lib/use-theme.js'
import { IconSun, IconMoon } from './icons.jsx'

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme()
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <IconSun className="theme-toggle__track-icon" />
        <IconMoon className="theme-toggle__track-icon" />
        <span className="theme-toggle__knob" />
      </span>
    </button>
  )
}