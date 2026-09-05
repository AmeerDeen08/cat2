// ============================================================================
// SINGLE SOURCE OF TRUTH for exam/academic data and site configuration.
//
// !!! IMPORTANT !!!
// The exam dates below are SAMPLE/PLACEHOLDER values (the cloned repository
// contained no real CAT2 schedule). Replace them with the official VIT CAT2
// schedule before deploying. Every screen reads from this one file.
//
// date       : "YYYY-MM-DD" (local, machine-readable)
// startTime/endTime : "HH:MM" 24-hour format ("09:30", "14:00")
// venue/faculty/notes : optional — omit or use null to hide on the UI
// ============================================================================

export const CONFIG = {
  cat2Label: 'CAT2',
  institution: 'VIT — M.Tech',
  knotesURL: 'https://github.com/AmeerDeen08/VIT_MTECH_NOTES',
}

// CAT2 examination schedule (ascending order by date is recommended).
export const exams = [
  {
    id: 'cat2-1',
    subject: 'Advanced Computer Architecture',
    subjectCode: 'ITE5101',
    date: '2026-09-14',
    startTime: '09:30',
    endTime: '11:30',
    venue: 'TT 1 — Block A',
    faculty: 'Dr. R. Meenakshi',
    notes: 'Sample date — replace with the official schedule.',
  },
  {
    id: 'cat2-2',
    subject: 'Machine Learning and Applications',
    subjectCode: 'ITE5102',
    date: '2026-09-17',
    startTime: '09:30',
    endTime: '11:30',
    venue: 'TT 2 — Block A',
    faculty: 'Dr. S. Anand Rahul',
    notes: 'Sample date — replace with the official schedule.',
  },
  {
    id: 'cat2-3',
    subject: 'Research Methodology',
    subjectCode: 'ITE5103',
    date: '2026-09-21',
    startTime: '14:00',
    endTime: '16:00',
    venue: 'TT 3 — Block A',
    faculty: 'Dr. P. Vignesh',
    notes: null,
  },
  {
    id: 'cat2-4',
    subject: 'Cloud Computing',
    subjectCode: 'ITE5104',
    date: '2026-09-24',
    startTime: '09:30',
    endTime: '11:30',
    venue: 'TT 4 — Block A',
    faculty: 'Dr. M. Kavitha',
    notes: null,
  },
]

// Other academic events. Used as the "next upcoming" target once every CAT2
// exam has ended. Add/remove freely; entries without endTime are day-long.
export const events = [
  {
    id: 'event-1',
    name: 'CAT2 results publication',
    date: '2026-10-09',
  },
  {
    id: 'event-2',
    name: 'Semester re-opening (CAT3 period)',
    date: '2026-10-19',
  },
]