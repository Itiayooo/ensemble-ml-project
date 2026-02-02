import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Play, Send } from 'lucide-react';
import Editor from '@monaco-editor/react';
import TopBar from '../components/TopBar';
import { useTimer } from '../hooks/useTimer';
import { useAssessment } from '../context/AssessmentContext';
import * as api from '../utils/api';

export default function CodingScreen() {
  const navigate = useNavigate();
  const { sessionId, markStageComplete, saveStageData } = useAssessment();
  const { formatTime, seconds, start } = useTimer(true);
  
  const [problems, setProblems] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Behavioral tracking
  const [keystrokes, setKeystrokes] = useState(0);
  const [runCount, setRunCount] = useState(0);
  const [editEvents, setEditEvents] = useState([]);
  const sessionStartTime = useRef(Date.now());

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await api.startCoding(sessionId);
        setProblems(data.problems);
        // Set starter code for first problem
        if (data.problems.length > 0) {
          setCode(data.problems[0].starter_code_python || '');
        }
        setLoading(false);
        start();
      } catch (err) {
        console.error('Failed to fetch coding problems:', err);
        alert('Failed to load problems. Make sure you completed the quiz first.');
        navigate('/');
      }
    };

    if (sessionId) {
      fetchProblems();
    }
  }, [sessionId]);

  // Update code when problem changes
  useEffect(() => {
    if (problems.length > 0 && problems[currentProblem]) {
      const starterCode = language === 'python' 
        ? problems[currentProblem].starter_code_python
        : problems[currentProblem].starter_code_javascript;
      setCode(starterCode || '');
      setOutput([]);
      setRunCount(0);
      setKeystrokes(0);
    }
  }, [currentProblem, language, problems]);

  const handleEditorChange = (value) => {
    setCode(value);
    setKeystrokes(prev => prev + 1);
    
    setEditEvents(prev => [...prev, {
      timestamp: Date.now() - sessionStartTime.current,
      codeLength: value?.length || 0
    }]);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setRunCount(prev => prev + 1);
    
    try {
      const submission = {
        session_id: sessionId,
        problem_id: problems[currentProblem].id,
        language,
        code,
        run_count: runCount + 1,
        keystrokes,
        total_time: seconds,
        edit_events: editEvents
      };

      const result = await api.runCode(submission);
      setOutput(result.test_results);
    } catch (err) {
      console.error('Failed to run code:', err);
      setOutput([{ 
        test_case: 1, 
        passed: false, 
        expected: '', 
        actual: `Error: ${err.response?.data?.detail || err.message}` 
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const submission = {
        session_id: sessionId,
        problem_id: problems[currentProblem].id,
        language,
        code,
        run_count: runCount,
        keystrokes,
        total_time: seconds,
        edit_events: editEvents
      };

      const result = await api.submitCoding(submission);
      
      const codingData = {
        problem: problems[currentProblem].title,
        language,
        code,
        totalTime: seconds,
        keystrokes,
        runCount,
        editEvents,
        testResults: {
          passed: result.tests_passed,
          total: result.tests_total,
          percentage: result.percentage
        },
        codeMetrics: result.code_metrics,
        completedAt: new Date().toISOString()
      };

      saveStageData('coding', codingData);
      markStageComplete('coding');
      setHasSubmitted(true);
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Failed to submit code:', err);
      alert('Failed to submit. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  const problem = problems[currentProblem];

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar currentStage={2} showTimer={true} timeElapsed={formatTime()} />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Panel - Problem Description */}
        <div className="w-2/5 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-100 p-2 rounded">
                <Code className="text-green-600" size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Coding Challenge</h2>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-600 p-3 mb-6">
              <p className="text-sm text-blue-800 font-semibold">
                {/* Problem {currentProblem + 1} of {problems.length} */}
                Stage B: Creator Mode
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-bold text-slate-800">{problem.title}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded ${
                  problem.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  problem.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {problem.difficulty}
                </span>
              </div>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                {problem.description}
              </p>
            </div>

            {problem.examples && problem.examples.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-slate-800 mb-3">Examples:</h4>
                {problem.examples.map((example, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-lg mb-3 border border-slate-200">
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-slate-600">Input:</span>
                      <div className="font-mono text-sm text-slate-800 mt-1">{example.input}</div>
                    </div>
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-slate-600">Output:</span>
                      <div className="font-mono text-sm text-slate-800 mt-1">{example.output}</div>
                    </div>
                    {example.explanation && (
                      <div>
                        <span className="text-xs font-semibold text-slate-600">Explanation:</span>
                        <div className="text-sm text-slate-700 mt-1">{example.explanation}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {problem.constraints && (
              <div className="mb-6">
                <h4 className="font-semibold text-slate-800 mb-2">Constraints:</h4>
                <ul className="text-sm text-slate-700 space-y-1">
                  {problem.constraints.map((constraint, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{constraint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-3 text-sm">Session Metrics</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded">
                  <div className="text-slate-600">Keystrokes</div>
                  <div className="text-lg font-bold text-slate-800">{keystrokes}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded">
                  <div className="text-slate-600">Run Count</div>
                  <div className="text-lg font-bold text-slate-800">{runCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-3/5 flex flex-col bg-slate-900">
          <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-700 text-white px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleRun}
                disabled={isRunning || hasSubmitted}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play size={16} />
                {isRunning ? 'Running...' : 'Run'}
              </button>
              <button 
                onClick={handleSubmit}
                disabled={output.length === 0 || hasSubmitted}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
                {hasSubmitted ? 'Submitted!' : 'Submit'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on'
              }}
            />
          </div>

          <div className="bg-slate-800 p-4 border-t border-slate-700 h-40 overflow-y-auto">
            <div className="text-xs text-slate-400 mb-2 font-semibold">Console Output:</div>
            <div className="bg-slate-900 p-3 rounded font-mono text-sm space-y-1">
              {output.length === 0 ? (
                <div className="text-slate-500">Click "Run" to test your code...</div>
              ) : (
                output.map((result, idx) => (
                  <div key={idx} className={result.passed ? 'text-green-400' : 'text-red-400'}>
                    Test case {result.test_case}: {result.passed ? '✓' : '✗'} {result.passed ? 'Passed' : `Failed - Expected ${result.expected}, got ${result.actual}`}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {hasSubmitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md text-center">
            <div className="mb-4">
              <div className="inline-block bg-green-100 p-4 rounded-full">
                <Code className="text-green-600" size={48} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Stage B Complete!</h3>
            <p className="text-slate-600 mb-4">
              Your code has been submitted. Returning to dashboard...
            </p>
            <div className="text-sm text-slate-500">
              Passed: {output.filter(r => r.passed).length} / {output.length} test cases
            </div>
          </div>
        </div>
      )}
    </div>
  );
}