// ============================================================================
// SINGLE SOURCE OF TRUTH for exam/academic data and site configuration.
//
// Data transcribed from the official CAT2 timetable (see schedule.md).
//
// date           : "YYYY-MM-DD" (local, machine-readable)
// startTime/endTime : "HH:MM" 24-hour format ("09:30", "14:00")
// reportingTime  : "HH:MM" — exam reporting (gate) time, when available
// venue          : individual exam hall (e.g. "SJT711")
// seat           : "seat/row/col/reporting-time" exactly as issued, e.g. "45/R2C7/04:00 PM"
// examType/courseId/batch : optional — omit or use null to hide on the UI
// ============================================================================

export const CONFIG = {
  cat2Label: 'CAT2',
  institution: 'VIT — M.Tech',
  knotesURL: 'https://github.com/AmeerDeen08/VIT_MTECH_NOTES',
}

// CAT2 examination schedule (ascending order by date).
export const exams = [
  {
    id: 'MAENG501',
    subject: 'Technical Report Writing',
    subjectCode: 'MAENG501',
    examType: 'ETH',
    courseId: 'VL2026270106262',
    batch: 'TAA1',
    date: '2026-09-26',
    reportingTime: '13:30',
    startTime: '14:00',
    endTime: '15:30',
    venue: 'SJT204',
    seat: '46/R2C8/01:30 PM',
  },
  {
    id: 'MACSE513',
    subject: 'Computer Networks',
    subjectCode: 'MACSE513',
    examType: 'ETH',
    courseId: 'VL2026270106775',
    batch: 'A1+TA1',
    date: '2026-09-27',
    reportingTime: '16:00',
    startTime: '16:30',
    endTime: '18:00',
    venue: 'SJT710',
    seat: '63/R4C9/04:00 PM',
  },
  {
    id: 'MACSE512',
    subject: 'Operating Systems',
    subjectCode: 'MACSE512',
    examType: 'ETH',
    courseId: 'VL2026270106777',
    batch: 'B1+TB1',
    date: '2026-09-28',
    reportingTime: '16:00',
    startTime: '16:30',
    endTime: '18:00',
    venue: 'SJT215',
    seat: '18/R2C4/04:00 PM',
  },
  {
    id: 'MACSE515',
    subject: 'Cybersecurity',
    subjectCode: 'MACSE515',
    examType: 'TH',
    courseId: 'VL2026270106771',
    batch: 'C1+TC1+TCC1',
    date: '2026-09-29',
    reportingTime: '16:00',
    startTime: '16:30',
    endTime: '18:00',
    venue: 'SJT222',
    seat: '45/R2C7/04:00 PM',
  },
  {
    id: 'MACSE511',
    subject: 'Data Structures and Algorithms',
    subjectCode: 'MACSE511',
    examType: 'ETH',
    courseId: 'VL2026270106772',
    batch: 'D1+TD1',
    date: '2026-09-30',
    reportingTime: '16:00',
    startTime: '16:30',
    endTime: '18:00',
    venue: 'SJT711',
    seat: '45/R2C7/04:00 PM',
  },
  {
    id: 'MACSE514',
    subject: 'Database Systems',
    subjectCode: 'MACSE514',
    examType: 'ETH',
    courseId: 'VL2026270106773',
    batch: 'E1+TE1',
    date: '2026-10-01',
    reportingTime: '16:00',
    startTime: '16:30',
    endTime: '18:00',
    venue: 'SJT124',
    seat: '52/R5C8/04:00 PM',
  },
  {
    id: 'MASTS601',
    subject: 'Competitive Coding I',
    subjectCode: 'MASTS601',
    examType: 'SS',
    courseId: 'VL2026270104812',
    batch: 'G1+TG1',
    date: '2026-10-04',
    reportingTime: '14:45',
    startTime: '15:15',
    endTime: '16:30',
    venue: 'PRP706',
    seat: '19/R8C2/02:45 PM',
  },
]

// Other academic events. Used as the "next upcoming" target once every CAT2
// exam has ended. Kept empty — the official timetable contains no post-CAT2
// events, so the app shows "CAT2 completed" instead of inventing a target.
export const events = []