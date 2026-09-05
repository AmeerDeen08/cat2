import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import Home from './pages/Home.jsx'
import Schedule from './pages/Schedule.jsx'
import ExamDetail from './pages/ExamDetail.jsx'
import Notes from './pages/Notes.jsx'

export default function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/exam/:id" element={<ExamDetail />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </HashRouter>
  )
}