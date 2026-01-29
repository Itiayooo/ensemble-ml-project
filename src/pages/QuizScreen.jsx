import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useTimer } from '../hooks/useTimer';
import { useAssessment } from '../context/AssessmentContext';

// Sample questions (you'll replace this with real data later)
const QUESTIONS = [
  {
    id: 1,
    question: 'What is the time complexity of binary search on a sorted array?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    correctAnswer: 1
  },
  {
    id: 2,
    question: 'Which data structure uses LIFO (Last In First Out)?',
    options: ['Queue', 'Stack', 'Array', 'Linked List'],
    correctAnswer: 1
  },
  {
    id: 3,
    question: 'What is the purpose of the "this" keyword in JavaScript?',
    options: [
      'To reference the current file',
      'To reference the current object',
      'To create a new variable',
      'To import modules'
    ],
    correctAnswer: 1
  }
  // Add 7 more questions to make it 10 total
];

export default function QuizScreen() {
  const navigate = useNavigate();
  const { markStageComplete, saveStageData } = useAssessment();
  const { formatTime, seconds, start } = useTimer(true);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    start(); // Start timer when component mounts
  }, []);

  const handleNext = () => {
    if (selectedAnswer === null) return;

    // Record answer with timing data
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const answerData = {
      questionId: QUESTIONS[currentQuestion].id,
      selectedAnswer,
      correctAnswer: QUESTIONS[currentQuestion].correctAnswer,
      isCorrect: selectedAnswer === QUESTIONS[currentQuestion].correctAnswer,
      timeSpent
    };

    setAnswers([...answers, answerData]);

    // Move to next question or finish
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
    } else {
      // Quiz complete
      finishQuiz([...answers, answerData]);
    }
  };

  const finishQuiz = (allAnswers) => {
    const score = allAnswers.filter(a => a.isCorrect).length;
    const totalTime = seconds;
    
    const quizData = {
      answers: allAnswers,
      score,
      totalQuestions: QUESTIONS.length,
      totalTime,
      completedAt: new Date().toISOString()
    };

    saveStageData('quiz', quizData);
    markStageComplete('quiz');
    
    // Navigate back to dashboard
    navigate('/');
  };

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar currentStage={1} showTimer={true} timeElapsed={formatTime()} />
      
      <div className="max-w-4xl mx-auto p-12">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded">
                <Brain className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Computational Thinking Quiz</h2>
                <p className="text-sm text-slate-600">Stage A of 3</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {currentQuestion + 1} / {QUESTIONS.length}
              </div>
              <div className="text-xs text-slate-500">Questions</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="bg-slate-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{width: `${progress}%`}}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-slate-800 mb-6">
              {QUESTIONS[currentQuestion].question}
            </h3>

            <div className="space-y-3">
              {QUESTIONS[currentQuestion].options.map((option, idx) => (
                <label 
                  key={idx} 
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedAnswer === idx 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="answer" 
                    className="mr-4 w-5 h-5"
                    checked={selectedAnswer === idx}
                    onChange={() => setSelectedAnswer(idx)}
                  />
                  <span className="text-lg text-slate-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="text-sm text-slate-500">
              Time on question: <span className="font-mono font-semibold">
                {Math.floor((Date.now() - questionStartTime) / 1000)}s
              </span>
            </div>
            <button 
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                selectedAnswer === null
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {currentQuestion === QUESTIONS.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>Tip:</strong> You cannot go back to previous questions. 
            Take your time to think through each answer.
          </p>
        </div>
      </div>
    </div>
  );
}