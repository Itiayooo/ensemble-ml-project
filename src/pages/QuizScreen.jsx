import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useTimer } from '../hooks/useTimer';
import { useAssessment } from '../context/AssessmentContext';
import * as api from '../utils/api';

export default function QuizScreen() {
  const navigate = useNavigate();
  const { sessionId, markStageComplete, saveStageData } = useAssessment();
  const { formatTime, seconds, start } = useTimer(true);
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await api.startQuiz(sessionId);
        setQuestions(data.questions);
        setLoading(false);
        start();
      } catch (err) {
        console.error('Failed to fetch quiz questions:', err);
        setError('Failed to load quiz. Please try again.');
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchQuestions();
    }
  }, [sessionId]);

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const answerData = {
      question_id: questions[currentQuestion].id,
      selected_answer: selectedAnswer,
      time_spent: timeSpent
    };

    setAnswers([...answers, answerData]);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
    } else {
      finishQuiz([...answers, answerData]);
    }
  };

  const finishQuiz = async (allAnswers) => {
    try {
      const result = await api.submitQuiz(sessionId, allAnswers);
      
      const quizData = {
        score: result.score,
        correct: result.correct,
        totalQuestions: result.total,
        totalTime: seconds,
        passed: result.passed,
        completedAt: new Date().toISOString()
      };

      saveStageData('quiz', quizData);
      markStageComplete('quiz');
      
      navigate('/');
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar currentStage={1} showTimer={true} timeElapsed={formatTime()} />
      
      <div className="max-w-4xl mx-auto p-12">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          {/* Rest of your existing quiz UI - just use questions[currentQuestion] */}
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
                {currentQuestion + 1} / {questions.length}
              </div>
              <div className="text-xs text-slate-500">Questions</div>
            </div>
          </div>

          <div className="mb-8">
            <div className="bg-slate-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{width: `${progress}%`}}
              ></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-slate-800 mb-6">
              {questions[currentQuestion].question}
            </h3>

            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, idx) => (
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
              {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
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