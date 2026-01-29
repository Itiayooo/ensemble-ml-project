import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Play, Send } from 'lucide-react';
import Editor from '@monaco-editor/react';
import TopBar from '../components/TopBar';
import { useTimer } from '../hooks/useTimer';
import { useAssessment } from '../context/AssessmentContext';

// Sample coding problem
const PROBLEM = {
  title: 'Two Sum',
  difficulty: 'Easy',
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  examples: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
    },
    {
      input: 'nums = [3,2,4], target = 6',
      output: '[1,2]',
      explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
    }
  ],
  constraints: [
    '2 ≤ nums.length ≤ 10⁴',
    '-10⁹ ≤ nums[i] ≤ 10⁹',
    '-10⁹ ≤ target ≤ 10⁹',
    'Only one valid answer exists'
  ],
  starterCode: {
    python: `def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Write your solution here
    
    
    
    return []`,
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your solution here
    
    
    
    return [];
};`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        
        
        
        return new int[]{};
    }
}`
  },
  testCases: [
    { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
    { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
    { input: { nums: [3, 3], target: 6 }, expected: [0, 1] }
  ]
};

export default function CodingScreen() {
  const navigate = useNavigate();
  const { markStageComplete, saveStageData } = useAssessment();
  const { formatTime, seconds, start } = useTimer(true);
  
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(PROBLEM.starterCode.python);
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  // Behavioral tracking
  const [keystrokes, setKeystrokes] = useState(0);
  const [runCount, setRunCount] = useState(0);
  const [editEvents, setEditEvents] = useState([]);
  const sessionStartTime = useRef(Date.now());

  useEffect(() => {
    start();
  }, []);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(PROBLEM.starterCode[newLang]);
  };

  const handleEditorChange = (value) => {
    setCode(value);
    setKeystrokes(prev => prev + 1);
    
    // Track edit event
    setEditEvents(prev => [...prev, {
      timestamp: Date.now() - sessionStartTime.current,
      codeLength: value?.length || 0
    }]);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setRunCount(prev => prev + 1);
    
    // Simulate code execution (in real app, you'd send to backend)
    setTimeout(() => {
      const results = PROBLEM.testCases.map((testCase, idx) => {
        // Simple mock - just check if code is not empty
        const passed = code.trim().length > PROBLEM.starterCode[language].trim().length;
        return {
          testCase: idx + 1,
          passed,
          input: JSON.stringify(testCase.input),
          expected: JSON.stringify(testCase.expected),
          actual: passed ? JSON.stringify(testCase.expected) : '[]'
        };
      });
      
      setOutput(results);
      setIsRunning(false);
    }, 1500);
  };

  const handleSubmit = () => {
    const passedTests = output.filter(r => r.passed).length;
    const totalTests = PROBLEM.testCases.length;
    
    const codingData = {
      problem: PROBLEM.title,
      language,
      code,
      totalTime: seconds,
      keystrokes,
      runCount,
      editEvents,
      testResults: {
        passed: passedTests,
        total: totalTests,
        percentage: (passedTests / totalTests) * 100
      },
      codeMetrics: {
        linesOfCode: code.split('\n').length,
        characterCount: code.length,
        // In real app, calculate cyclomatic complexity here
      },
      completedAt: new Date().toISOString()
    };

    saveStageData('coding', codingData);
    markStageComplete('coding');
    setHasSubmitted(true);
    
    // Navigate back to dashboard after 2 seconds
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

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
              <p className="text-sm text-blue-800 font-semibold">Stage B: Creator Mode</p>
            </div>

            {/* Problem Title */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-bold text-slate-800">{PROBLEM.title}</h3>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                  {PROBLEM.difficulty}
                </span>
              </div>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                {PROBLEM.description}
              </p>
            </div>

            {/* Examples */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-800 mb-3">Examples:</h4>
              {PROBLEM.examples.map((example, idx) => (
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

            {/* Constraints */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-800 mb-2">Constraints:</h4>
              <ul className="text-sm text-slate-700 space-y-1">
                {PROBLEM.constraints.map((constraint, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{constraint}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Behavioral Stats (for demonstration) */}
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
          {/* Editor Header */}
          <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
              <select 
                value={language}
                onChange={handleLanguageChange}
                className="bg-slate-700 text-white px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
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

          {/* Monaco Editor */}
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

          {/* Console Output */}
          <div className="bg-slate-800 p-4 border-t border-slate-700 h-40 overflow-y-auto">
            <div className="text-xs text-slate-400 mb-2 font-semibold">Console Output:</div>
            <div className="bg-slate-900 p-3 rounded font-mono text-sm space-y-1">
              {output.length === 0 ? (
                <div className="text-slate-500">Click "Run" to test your code...</div>
              ) : (
                output.map((result, idx) => (
                  <div key={idx} className={result.passed ? 'text-green-400' : 'text-red-400'}>
                    Test case {result.testCase}: {result.passed ? '✓' : '✗'} {result.passed ? 'Passed' : `Failed - Expected ${result.expected}, got ${result.actual}`}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
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
              Passed: {output.filter(r => r.passed).length} / {PROBLEM.testCases.length} test cases
            </div>
          </div>
        </div>
      )}
    </div>
  );
}