import { CONFIG } from '../data/exams.js'
import { IconNotes, IconExternal } from '../components/icons.jsx'

export default function Notes() {
  return (
    <>
      <header className="page-header">
        <p className="page-header__eyebrow">Study resources</p>
        <h1 className="page-header__title">Notes</h1>
        <p className="page-header__subtitle">
          Class notes and study material for your subjects.
        </p>
      </header>

      <section className="card notes-card" aria-label="KNotes">
        <span className="notes-card__icon">
          <IconNotes />
        </span>
        <h2 className="notes-card__title">KNotes</h2>
        <p className="notes-card__desc">
          Access the VIT M.Tech notes repository — subject-wise notes for CAT2
          preparation, hosted on GitHub.
        </p>

        <a
          className="btn btn--primary btn--block"
          href={CONFIG.knotesURL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open KNotes <IconExternal className="notes-card__btn-icon" />
        </a>

        <p className="notes-card__hint">
          Opens <strong>{CONFIG.knotesURL.replace('https://', '')}</strong> in a new tab.
        </p>
      </section>
    </>
  )
}