import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Code, Search, Lock } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useAssessment } from '../context/AssessmentContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { sessionId, completedStages, initializeAssessment } = useAssessment();

  useEffect(() => {
    if (!sessionId) {
      // Create a default user (in real app, you'd have a login form)
      initializeAssessment('student@example.com', 'Test Student')
        .catch(error => {
          console.error('Failed to start assessment:', error);
          alert('Failed to connect to server. Make sure backend is running.');
        });
    }
  }, [sessionId, initializeAssessment]);

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Initializing assessment...</p>
        </div>
      </div>
    );
  }

  const stages = [
    {
      id: 'quiz',
      stageLabel: 'A',
      title: 'Computational Thinking',
      description: 'Logic & CS fundamentals assessment',
      icon: Brain,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-500',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      duration: '~15 minutes',
      questions: '10 Questions',
      route: '/quiz',
      locked: false
    },
    {
      id: 'coding',
      stageLabel: 'B',
      title: 'Coding Challenge',
      description: 'Write a solution from scratch',
      icon: Code,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-500',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      duration: '~30 minutes',
      questions: '1 Problem',
      route: '/coding',
      locked: !completedStages.includes('quiz')
    },
    {
      id: 'audit',
      stageLabel: 'C',
      title: 'Logic Audit',
      description: 'Review and fix AI-generated code',
      icon: Search,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-500',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      duration: '~20 minutes',
      questions: '1 Audit Task',
      route: '/audit',
      locked: !completedStages.includes('coding')
    }
  ];

  const handleStartStage = (stage) => {
    if (!stage.locked) {
      navigate(stage.route);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar currentStage={0} />

      <div className="max-w-6xl mx-auto p-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Skill Assessment Roadmap
          </h1>
          <p className="text-slate-600 text-lg">
            Complete all stages to receive your employability analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isLocked = stage.locked;

            return (
              <div
                key={stage.id}
                className={`bg-white rounded-xl shadow-lg p-8 border-2 transition-all ${isLocked
                  ? 'border-slate-200 opacity-75'
                  : `${stage.borderColor} hover:shadow-xl cursor-pointer`
                  }`}
              >
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-full ${isLocked ? 'bg-slate-100' : stage.bgColor
                    }`}>
                    <Icon
                      size={48}
                      className={isLocked ? 'text-slate-400' : stage.iconColor}
                    />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
                  Stage {stage.stageLabel}
                </h3>
                <h4 className="text-lg font-semibold text-slate-700 text-center mb-3">
                  {stage.title}
                </h4>
                <p className="text-slate-600 text-center mb-6 text-sm">
                  {stage.description}
                </p>

                <div className="text-center text-xs text-slate-500 mb-4 space-y-1">
                  <div>{stage.questions}</div>
                  <div>{stage.duration}</div>
                </div>

                <button
                  onClick={() => handleStartStage(stage)}
                  disabled={isLocked}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${isLocked
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed flex items-center justify-center gap-2'
                    : `${stage.buttonColor} text-white`
                    }`}
                >
                  {isLocked ? (
                    <>
                      <Lock size={16} />
                      Locked
                    </>
                  ) : (
                    `Start Stage ${stage.stageLabel}`
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> All stages must be completed in order.
            Your progress is automatically saved.
          </p>
        </div>
      </div>
    </div>
  );
}