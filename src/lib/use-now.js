import { useEffect, useState } from 'react'

// Returns the current time, refreshed every minute so status/countdown labels
// stay correct (e.g. an exam becomes "today"/"completed" without a reload).
export function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  return now
}