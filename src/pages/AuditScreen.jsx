import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Play, Send, AlertTriangle } from 'lucide-react';
import Editor from '@monaco-editor/react';
import TopBar from '../components/TopBar';
import { useTimer } from '../hooks/useTimer';
import { useAssessment } from '../context/AssessmentContext';
import * as api from '../utils/api';

export default function AuditScreen() {
  const navigate = useNavigate();
  const { sessionId, markStageComplete, saveStageData } = useAssessment();
  const { formatTime, seconds, start } = useTimer(true);

  const [problems, setProblems] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [originalCode, setOriginalCode] = useState('');
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editCount, setEditCount] = useState(0);
  const [linesChanged, setLinesChanged] = useState(new Set());
  const [editHistory, setEditHistory] = useState([]);
  const sessionStartTime = useRef(Date.now());
  const previousCode = useRef('');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await api.startAudit(sessionId);
        setProblems(data.problems);
        if (data.problems.length > 0) {
          const buggyCode = data.problems[0].buggy_code_python || '';
          setCode(buggyCode);
          setOriginalCode(buggyCode);
          previousCode.current = buggyCode;
        }
        setLoading(false);
        start();
      } catch (err) {
        console.error('Failed to fetch audit problems:', err);
        alert('Failed to load problems. Make sure you completed coding first.');
        navigate('/');
      }
    };

    if (sessionId) {
      fetchProblems();
    }
  }, [sessionId]);

  useEffect(() => {
    if (problems.length > 0 && problems[currentProblem]) {
      const buggyCode = language === 'python'
        ? problems[currentProblem].buggy_code_python
        : problems[currentProblem].buggy_code_javascript;
      setCode(buggyCode || '');
      setOriginalCode(buggyCode || '');
      previousCode.current = buggyCode || '';
      setOutput(null);
      setEditCount(0);
      setLinesChanged(new Set());
    }
  }, [currentProblem, language, problems]);

  const handleEditorChange = (value) => {
    if (!value) return;

    setCode(value);
    setEditCount(prev => prev + 1);

    const oldLines = previousCode.current.split('\n');
    const newLines = value.split('\n');
    const changed = new Set(linesChanged);

    newLines.forEach((line, idx) => {
      if (oldLines[idx] !== line) {
        changed.add(idx + 1);
      }
    });

    setLinesChanged(changed);

    setEditHistory(prev => [...prev, {
      timestamp: Date.now() - sessionStartTime.current,
      linesChanged: changed.size,
      codeLength: value.length
    }]);

    previousCode.current = value;
  };

  const handleTest = async () => {
    setIsRunning(true);

    try {
      const submission = {
        session_id: sessionId,
        problem_id: problems[currentProblem].id,
        language,
        modified_code: code,
        edit_count: editCount,
        lines_changed: Array.from(linesChanged),
        edit_history: editHistory,
        total_time: seconds
      };

      const result = await api.testAudit(submission);
      setOutput(result);
    } catch (err) {
      console.error('Failed to test audit:', err);
      setOutput({
        test_results: { passed: 0, total: 0 },
        bug_analysis: { bugs_fixed: 0, bugs_total: 0 },
        efficiency_score: 0
      });
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
        modified_code: code,
        edit_count: editCount,
        lines_changed: Array.from(linesChanged),
        edit_history: editHistory,
        total_time: seconds
      };

      const result = await api.submitAudit(submission);

      const auditData = {
        problem: problems[currentProblem].title,
        language,
        originalCode: originalCode,
        auditedCode: code,
        totalTime: seconds,
        editCount,
        linesChanged: Array.from(linesChanged),
        editHistory,
        metrics: {
          bugsFixed: result.bugs_fixed,
          bugsTotal: result.bugs_total,
          bugFixRate: (result.bugs_fixed / result.bugs_total) * 100,
          linesModified: linesChanged.size,
          editEfficiency: result.efficiency_score,
          overallScore: result.efficiency_score
        },
        testResults: {
          passed: result.tests_passed,
          total: result.tests_total
        },
        completedAt: new Date().toISOString()
      };

      saveStageData('audit', auditData);
      markStageComplete('audit');
      setHasSubmitted(true);

      setTimeout(() => {
        navigate('/results');
      }, 2000);
    } catch (err) {
      console.error('Failed to submit audit:', err);
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
      <TopBar currentStage={3} showTimer={true} timeElapsed={formatTime()} />

      <div className="flex h-[calc(100vh-64px)]">
        <div className="w-2/5 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-purple-100 p-2 rounded">
                <Search className="text-purple-600" size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Logic Audit</h2>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-600 p-3 mb-6">
              <p className="text-sm text-purple-800 font-semibold">
                {/* Problem {currentProblem + 1} of {problems.length} */}
                Stage C: Supervisor Mode
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="text-amber-900 font-semibold mb-1">AI-Generated Code Review</p>
                  <p className="text-sm text-amber-800">
                    The code contains logical flaws and inefficiencies.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800 mb-3">
                Task: {problem.title}
              </h3>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed mb-4">
                {problem.description}
              </p>
            </div>

            {problem.known_issues && (
              <div className="mb-6">
                <h4 className="font-semibold text-slate-800 mb-3">Known Issues:</h4>
                <div className="space-y-2">
                  {problem.known_issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-l-4 ${issue.severity === 'high'
                          ? 'bg-red-50 border-red-500'
                          : issue.severity === 'medium'
                            ? 'bg-amber-50 border-amber-500'
                            : 'bg-blue-50 border-blue-500'
                        }`}
                    >
                      <div className="text-xs font-semibold uppercase mb-1">
                        {issue.severity} - {issue.type}
                      </div>
                      <p className="text-sm text-slate-700">{issue.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-3 text-sm">Audit Metrics</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded">
                  <div className="text-slate-600">Edits Made</div>
                  <div className="text-lg font-bold text-slate-800">{editCount}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded">
                  <div className="text-slate-600">Lines Changed</div>
                  <div className="text-lg font-bold text-slate-800">{linesChanged.size}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-3/5 flex flex-col bg-slate-900">
          <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-700 text-white px-3 py-1.5 rounded text-sm"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleTest}
                disabled={isRunning || hasSubmitted}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                <Play size={16} />
                {isRunning ? 'Testing...' : 'Test'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!output || hasSubmitted}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
              >
                <Send size={16} />
                {hasSubmitted ? 'Submitted!' : 'Submit Audit'}
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
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on'
              }}
            />
          </div>

          <div className="bg-slate-800 p-4 border-t border-slate-700 h-48 overflow-y-auto">
            <div className="text-xs text-slate-400 mb-2 font-semibold">Analysis Results:</div>
            <div className="space-y-2">
              {!output ? (
                <div className="text-slate-500 text-sm">
                  Click "Test" to analyze your fixes...
                </div>
              ) : (
                <>
                  <div className="bg-green-900 bg-opacity-30 border border-green-700 p-3 rounded">
                    <div className="text-sm text-green-400 font-semibold">Bugs Fixed</div>
                    <div className="text-xs text-slate-300">
                      {output.bug_analysis?.bugs_fixed || 0} / {output.bug_analysis?.bugs_total || 0}
                    </div>
                  </div>
                  <div className="bg-blue-900 bg-opacity-30 border border-blue-700 p-3 rounded">
                    <div className="text-sm text-blue-400 font-semibold">Tests Passed</div>
                    <div className="text-xs text-slate-300">
                      {output.test_results?.passed || 0} / {output.test_results?.total || 0}
                    </div>
                  </div>
                  <div className="bg-purple-900 bg-opacity-30 border border-purple-700 p-3 rounded">
                    <div className="text-sm text-purple-400 font-semibold">Efficiency Score</div>
                    <div className="text-xs text-slate-300">
                      {output.efficiency_score || 0}%
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {hasSubmitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md text-center">
            <div className="mb-4">
              <div className="inline-block bg-purple-100 p-4 rounded-full">
                <Search className="text-purple-600" size={48} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Audit Complete!</h3>
            <p className="text-slate-600 mb-4">
              Your audit has been submitted. Generating your results...
            </p>
            {output && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-sm text-slate-600 mb-2">Bugs Fixed:</div>
                <div className="text-3xl font-bold text-purple-600">
                  {output.bug_analysis?.bugs_fixed || 0} / {output.bug_analysis?.bugs_total || 0}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}