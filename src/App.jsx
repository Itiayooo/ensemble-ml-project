import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AssessmentProvider } from './context/AssessmentContext';
import Dashboard from './pages/Dashboard';
import QuizScreen from './pages/QuizScreen';
import CodingScreen from './pages/CodingScreen';
import AuditScreen from './pages/AuditScreen';
import ResultsScreen from './pages/ResultsScreen';

function App() {
  return (
    <AssessmentProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/quiz" element={<QuizScreen />} />          
          <Route path="/coding" element={<CodingScreen />} />
          <Route path="/audit" element={<AuditScreen />} />
          <Route path="/results" element={<ResultsScreen />} />
        </Routes>
      </BrowserRouter>
    </AssessmentProvider>
  );
}

export default App;