import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import GlowCursor from './components/ui/GlowCursor'
import LoadingState from './components/ui/LoadingState'
import { DemoProvider } from './context/DemoContext'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Sponsors = lazy(() => import('./pages/Sponsors'))
const RippleIntelligence = lazy(() => import('./pages/RippleIntelligence'))
const RecoveryPlanner = lazy(() => import('./pages/RecoveryPlanner'))
const ApprovalCenter = lazy(() => import('./pages/ApprovalCenter'))
const ActivityHistory = lazy(() => import('./pages/ActivityHistory'))

function AppLayout() {
  return (
    <GlowCursor
      className="app-glow-cursor"
      color="#7d8cff"
      secondaryColor="#b18aff"
      intensity={0.9}
      trailWidth={2}
      linger={1}
      glow={0.8}
      hotspot={0.7}
      followSpeed={0.65}
      quality="medium"
      maxDevicePixelRatio={1.5}
      style={{ height: 'auto', minHeight: '100vh', overflow: 'visible' }}
    >
      <div className="app-shell">
        <Sidebar />
        <div className="main-shell">
          <Topbar />
          <main className="page-content"><Suspense fallback={<LoadingState />}><Outlet /></Suspense></main>
          <footer className="app-footer"><span>SECOND BRAIN <i /> EVENT OPERATIONS</span><span>Built for thoughtful event teams</span></footer>
        </div>
      </div>
    </GlowCursor>
  )
}

export default function App() {
  return (
    <DemoProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="sponsors" element={<Sponsors />} />
            <Route path="ripple" element={<RippleIntelligence />} />
            <Route path="recovery" element={<RecoveryPlanner />} />
            <Route path="approvals" element={<ApprovalCenter />} />
            <Route path="activity" element={<ActivityHistory />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DemoProvider>
  )
}
