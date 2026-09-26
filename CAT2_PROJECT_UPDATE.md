# CAT2 Project Update Instructions

Update the existing CAT2 React project according to these changes only.

## 1. Update Exam Data

Keep all existing CAT2 exam information, but update each exam with the actual individual venue and seat details below.

| Course Code | Subject | Date | Venue | Seat Details |
|---|---|---|---|---|
| `MAENG501` | Technical Report Writing | 26-Sep-2026 | `SJT204` | `46/R2C8/01:30 PM` |
| `MACSE513` | Computer Networks | 27-Sep-2026 | `SJT710` | `63/R4C9/04:00 PM` |
| `MACSE512` | Operating Systems | 28-Sep-2026 | `SJT215` | `18/R2C4/04:00 PM` |
| `MACSE515` | Cybersecurity | 29-Sep-2026 | `SJT222` | `45/R2C7/04:00 PM` |
| `MACSE511` | Data Structures and Algorithms | 30-Sep-2026 | `SJT711` | `45/R2C7/04:00 PM` |
| `MACSE514` | Database Systems | 01-Oct-2026 | `SJT124` | `52/R5C8/04:00 PM` |
| `MASTS601` | Competitive Coding I | 04-Oct-2026 | `PRP706` | `19/R8C2/02:45 PM` |

These individual venues replace any generic venue such as `AN1` or `AN2`.

Do not remove existing course code, subject, slot, date, time, VL/course ID, or batch information.

Add/update:
- Venue
- Seat Details

The detailed exam view should display both fields clearly.

---

## 2. Replace the Homepage Hero

Remove the current countdown-focused hero.

Do **not** make "X days remaining" the primary hero content.

Instead, make the hero dynamically display the **next upcoming exam**.

The hero should show:

- `NEXT EXAM`
- Subject name
- Course code
- Exam date
- Day
- Exam time
- Venue
- Seat details
- Slot if useful

Example:

```text
NEXT EXAM

Data Structures and Algorithms
MACSE511

Wednesday, 30 September 2026
04:30 PM – 06:00 PM

Venue
SJT711

Seat Details
45/R2C7/04:00 PM
```

Do not hard-code the next exam. Determine it dynamically from the exam data and current date/time.

---

## 3. Hero Design

Make the hero clean, modern, and mobile-first.

It should feel like an **exam-day information card**, not a countdown widget.

Recommended hierarchy:

```text
NEXT EXAM

[Subject]
[Course Code]

[Date]       [Time]

Venue
[Venue]

Seat Details
[Seat Details]
```

Use:
- strong typography
- clear spacing
- rounded card
- subtle visual hierarchy
- clean background
- polished mobile layout
- minimal decoration

Avoid:
- giant countdown numbers
- excessive gradients
- clutter
- unnecessary animations
- dense tables

---

## 4. Dynamic Next-Exam Logic

Use the actual exam date/time to find the next exam.

Conceptually:

```text
current date/time
        ↓
sort exams by date/time
        ↓
find first upcoming/current exam
        ↓
display it in hero
```

If an exam is currently happening, treat it as the current exam.

If all CAT2 exams are completed, show:

`CAT2 COMPLETED`

and, if the project contains another upcoming academic event, show that next event.

Never show a negative countdown.

---

## 5. Schedule Page

Keep the existing schedule page.

Update exam cards so venue and seat details are visible where appropriate.

Example:

```text
MACSE513
Computer Networks

27 September 2026
04:30 PM – 06:00 PM

SJT710
Seat: 63/R4C9/04:00 PM
```

Keep the existing mobile-friendly design.

---

## 6. Exam Details Page

When a subject is opened, display:

- Subject
- Course Code
- Slot
- Exam Date
- Day
- Exam Time
- Venue
- Seat Details
- Existing VL/course information where available

Venue and seat information should be visually prominent because they are important on exam day.

---

## 7. Do Not Change Unrelated Features

This is an update to the existing project.

Do not unnecessarily rewrite or redesign:

- Notes page
- Notes GitHub link
- navigation
- existing schedule structure
- unrelated components
- project configuration

Only make changes required to:

1. Add/update venue and seat details.
2. Replace the countdown hero with the dynamic next-exam hero.
3. Display the new information in relevant exam views.

---

## Final Validation

After implementation:

- Verify all 7 venue values.
- Verify all 7 seat-detail values.
- Verify dynamic next-exam selection.
- Verify the hero changes correctly according to current date/time.
- Verify schedule cards.
- Verify exam detail pages.
- Test mobile layout.
- Run available build/lint/type-check commands.

Do not invent or alter exam information beyond the values specified above.
