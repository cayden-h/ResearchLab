import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { GlossaryPage } from './pages/GlossaryPage';
import { HistoryPage } from './pages/HistoryPage';
import { IntakePage } from './pages/IntakePage';
import { LandingPage } from './pages/LandingPage';
import { PipelinePage } from './pages/PipelinePage';
import { ResultsPage } from './pages/ResultsPage';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/intake" element={<IntakePage />} />
        <Route path="/pipeline/:runId" element={<PipelinePage />} />
        <Route path="/results/:runId" element={<ResultsPage />} />
        <Route path="/glossary" element={<GlossaryPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

