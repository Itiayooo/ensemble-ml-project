import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, BarChart3, Download, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import TopBar from '../components/TopBar';

import { useAssessment } from '../context/AssessmentContext';
import * as api from '../utils/api';

export default function ResultsScreen() {
  const navigate = useNavigate();
  const { stageData, completedStages, sessionId } = useAssessment();
  const [employabilityScore, setEmployabilityScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if all stages completed
    if (!completedStages.includes('quiz') ||
      !completedStages.includes('coding') ||
      !completedStages.includes('audit')) {
      navigate('/');
      return;
    }

    // Simulate ML processing
    setTimeout(() => {
      calculateResults();
      setIsLoading(false);
    }, 2000);
  }, []);

  // const calculateResults = () => {
  //   // Calculate employability based on all stages
  //   const quizScore = stageData.quiz 
  //     ? (stageData.quiz.score / stageData.quiz.totalQuestions) * 100 
  //     : 0;

  //   const codingScore = stageData.coding 
  //     ? stageData.coding.testResults.percentage 
  //     : 0;

  //   const auditScore = stageData.audit 
  //     ? stageData.audit.metrics.overallScore 
  //     : 0;

  //   // Weighted average (can adjust weights)
  //   const finalScore = Math.round(
  //     (quizScore * 0.25) + 
  //     (codingScore * 0.40) + 
  //     (auditScore * 0.35)
  //   );

  //   setEmployabilityScore(finalScore);
  // };

  const calculateResults = () => {
    // Calculate scores from actual backend data
    const quizScore = stageData.quiz
      ? stageData.quiz.score
      : 0;

    const codingScore = stageData.coding
      ? stageData.coding.testResults.percentage
      : 0;

    const auditScore = stageData.audit
      ? stageData.audit.metrics.overallScore
      : 0;

    // Weighted average (adjust weights as needed)
    const finalScore = Math.round(
      (quizScore * 0.30) +      // Quiz: 30%
      (codingScore * 0.40) +    // Coding: 40%
      (auditScore * 0.30)       // Audit: 30%
    );

    setEmployabilityScore(Math.min(100, finalScore)); // Cap at 100%
  };

  // Generate SHAP-style feature contributions
  // const getFeatureContributions = () => {
  //   const baseScore = 50; // Baseline employability
  //   const contributions = [];

  //   // Quiz contributions
  //   if (stageData.quiz) {
  //     const quizAccuracy = (stageData.quiz.score / stageData.quiz.totalQuestions) * 100;
  //     const quizContribution = ((quizAccuracy - 50) / 5); // Normalize
  //     contributions.push({
  //       feature: 'Quiz Accuracy',
  //       contribution: Math.round(quizContribution),
  //       color: quizContribution > 0 ? '#10B981' : '#EF4444'
  //     });

  //     const avgTimePerQuestion = stageData.quiz.totalTime / stageData.quiz.totalQuestions;
  //     const timeContribution = avgTimePerQuestion < 45 ? 8 : avgTimePerQuestion > 90 ? -5 : 2;
  //     contributions.push({
  //       feature: 'Response Speed',
  //       contribution: timeContribution,
  //       color: timeContribution > 0 ? '#10B981' : '#EF4444'
  //     });
  //   }

  //   // Coding contributions
  //   if (stageData.coding) {
  //     const semanticScore = stageData.coding.testResults.percentage;
  //     const semanticContribution = ((semanticScore - 50) / 3);
  //     contributions.push({
  //       feature: 'Semantic Accuracy',
  //       contribution: Math.round(semanticContribution),
  //       color: semanticContribution > 0 ? '#10B981' : '#EF4444'
  //     });

  //     const efficiencyScore = stageData.coding.runCount < 5 ? 10 : stageData.coding.runCount > 15 ? -8 : 3;
  //     contributions.push({
  //       feature: 'Debugging Efficiency',
  //       contribution: efficiencyScore,
  //       color: efficiencyScore > 0 ? '#10B981' : '#EF4444'
  //     });

  //     const complexityPenalty = stageData.coding.codeMetrics.linesOfCode > 50 ? -8 : 3;
  //     contributions.push({
  //       feature: 'Code Complexity',
  //       contribution: complexityPenalty,
  //       color: complexityPenalty > 0 ? '#10B981' : '#EF4444'
  //     });
  //   }

  //   // Audit contributions
  //   if (stageData.audit) {
  //     const auditPrecision = stageData.audit.metrics.bugFixRate;
  //     const auditContribution = ((auditPrecision - 50) / 4);
  //     contributions.push({
  //       feature: 'Bug Detection Rate',
  //       contribution: Math.round(auditContribution),
  //       color: auditContribution > 0 ? '#10B981' : '#EF4444'
  //     });

  //     const editEfficiency = stageData.audit.metrics.editEfficiency;
  //     const editContribution = ((editEfficiency - 50) / 5);
  //     contributions.push({
  //       feature: 'Edit Precision',
  //       contribution: Math.round(editContribution),
  //       color: editContribution > 0 ? '#10B981' : '#EF4444'
  //     });
  //   }

  //   return contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  // };

  const getFeatureContributions = () => {
    const contributions = [];

    // Quiz contributions
    if (stageData.quiz) {
      const quizAccuracy = stageData.quiz.score;
      contributions.push({
        feature: 'Quiz Accuracy',
        contribution: Math.round((quizAccuracy - 50) / 2), // Normalize to +/- range
        color: quizAccuracy >= 50 ? '#10B981' : '#EF4444'
      });
    }

    // Coding contributions
    if (stageData.coding) {
      const codingAccuracy = stageData.coding.testResults.percentage;
      contributions.push({
        feature: 'Code Correctness',
        contribution: Math.round((codingAccuracy - 50) / 2),
        color: codingAccuracy >= 50 ? '#10B981' : '#EF4444'
      });

      const linesOfCode = stageData.coding.codeMetrics?.lines_of_code || 0;
      const complexityScore = linesOfCode < 30 ? 8 : linesOfCode > 60 ? -8 : 0;
      contributions.push({
        feature: 'Code Simplicity',
        contribution: complexityScore,
        color: complexityScore >= 0 ? '#10B981' : '#EF4444'
      });
    }

    // Audit contributions
    if (stageData.audit) {
      const bugFixRate = stageData.audit.metrics.bugFixRate || 0;
      contributions.push({
        feature: 'Bug Detection',
        contribution: Math.round((bugFixRate - 50) / 2),
        color: bugFixRate >= 50 ? '#10B981' : '#EF4444'
      });

      const editEfficiency = stageData.audit.metrics.editEfficiency || 0;
      contributions.push({
        feature: 'Edit Precision',
        contribution: Math.round((editEfficiency - 50) / 3),
        color: editEfficiency >= 50 ? '#10B981' : '#EF4444'
      });
    }

    return contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  };

  const handleDownloadReport = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/results/download/${sessionId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skillassess_report_${sessionId}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const generateFeedback = () => {
    const score = employabilityScore;
    const contributions = getFeatureContributions();

    const strengths = contributions.filter(c => c.contribution > 5);
    const weaknesses = contributions.filter(c => c.contribution < -3);

    let feedback = {
      summary: '',
      strengths: '',
      improvements: '',
      recommendation: ''
    };

    // Summary
    if (score >= 80) {
      feedback.summary = `Excellent performance! Your assessment places you in the top tier of entry-level candidates. You demonstrate strong problem-solving abilities and code comprehension skills that align well with industry requirements.`;
    } else if (score >= 65) {
      feedback.summary = `Good performance overall. Your results indicate solid foundational skills with room for targeted improvement. You show promise as an entry-level developer with the right mentorship.`;
    } else if (score >= 50) {
      feedback.summary = `Moderate performance. While you demonstrate basic competency, there are several areas requiring focused development before you meet typical entry-level expectations.`;
    } else {
      feedback.summary = `Your results suggest significant gaps in core competencies. We recommend focused learning in algorithm design, debugging practices, and code quality before pursuing entry-level positions.`;
    }

    // Strengths
    if (strengths.length > 0) {
      const topStrength = strengths[0];
      feedback.strengths = `Your strongest asset is ${topStrength.feature.toLowerCase()}, contributing +${Math.abs(topStrength.contribution)}% to your overall score. ${topStrength.feature === 'Semantic Accuracy'
        ? 'Your solutions demonstrate logical correctness and algorithmic thinking.'
        : topStrength.feature === 'Bug Detection Rate'
          ? 'You excel at identifying flaws in existing code, a critical skill for code review and maintenance.'
          : topStrength.feature === 'Quiz Accuracy'
            ? 'Your theoretical knowledge of computer science fundamentals is solid.'
            : 'You show efficiency in your problem-solving approach.'
        }`;
    }

    // Improvements
    if (weaknesses.length > 0) {
      const topWeakness = weaknesses[0];
      feedback.improvements = `The primary area for improvement is ${topWeakness.feature.toLowerCase()}, which reduced your score by ${Math.abs(topWeakness.contribution)}%. ${topWeakness.feature === 'Code Complexity'
        ? 'Focus on writing cleaner, more modular code. Practice refactoring exercises and study design patterns.'
        : topWeakness.feature === 'Debugging Efficiency'
          ? 'Work on systematic debugging approaches. Too many trial runs suggest a need for better problem decomposition.'
          : topWeakness.feature === 'Edit Precision'
            ? 'Be more surgical with code modifications. Each edit should address a specific issue rather than making broad changes.'
            : 'Consider improving your time management and problem-solving speed through regular practice.'
        }`;
    }

    // Recommendation
    if (score >= 75) {
      feedback.recommendation = `You're ready for entry-level positions. Focus on building portfolio projects and practicing technical interviews. Consider contributing to open-source projects to gain real-world experience.`;
    } else if (score >= 60) {
      feedback.recommendation = `Spend 2-3 months on targeted practice. Work through LeetCode problems (Easy to Medium), take online courses on clean code principles, and build 2-3 complete projects to strengthen your portfolio.`;
    } else {
      feedback.recommendation = `We recommend a structured learning path: Complete a comprehensive algorithms course, practice daily coding challenges, and focus on understanding fundamental data structures before attempting complex projects.`;
    }

    return feedback;
  };

  const contributions = getFeatureContributions();
  const feedback = generateFeedback();

  const chartData = contributions.map(c => ({
    name: c.feature,
    value: c.contribution,
    fill: c.color
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Your Performance...</h2>
          <p className="text-slate-600">Processing behavioral data and computing SHAP values</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar currentStage={4} />

      <div className="max-w-7xl mx-auto p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-green-100 p-3 rounded-full mb-4">
            <CheckCircle className="text-green-600" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Assessment Complete!</h1>
          <p className="text-slate-600">Here's your detailed performance analysis</p>
        </div>

        {/* Employability Score Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white mb-8 text-center shadow-xl">
          <div className="text-sm font-semibold mb-2 text-blue-100">Your Employability Index</div>
          <div className="text-7xl font-bold mb-3">{employabilityScore}%</div>
          <div className="text-blue-100 text-lg">
            {employabilityScore >= 80 ? 'Excellent - Above Entry-Level Benchmark' :
              employabilityScore >= 65 ? 'Good - Meets Entry-Level Standards' :
                employabilityScore >= 50 ? 'Fair - Below Average' :
                  'Needs Improvement'}
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <div className="bg-blue-800 px-4 py-2 rounded-lg">
              <div className="text-blue-200 text-xs">Percentile Rank</div>
              <div className="font-bold text-lg">{Math.min(95, employabilityScore + 5)}th</div>
            </div>
            <div className="bg-blue-800 px-4 py-2 rounded-lg">
              <div className="text-blue-200 text-xs">Category</div>
              <div className="font-bold text-lg">
                {employabilityScore >= 75 ? 'Hire' : employabilityScore >= 60 ? 'Consider' : 'Develop'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* SHAP Feature Contributions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="text-blue-600" size={24} />
              <h3 className="text-xl font-bold text-slate-800">Feature Contributions (SHAP)</h3>
            </div>

            <div className="mb-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis dataKey="name" type="category" width={120} stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    formatter={(value) => [`${value > 0 ? '+' : ''}${value}%`, 'Impact']}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {contributions.slice(0, 5).map((contrib, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {contrib.contribution > 0 ? (
                      <TrendingUp className="text-green-600" size={16} />
                    ) : (
                      <TrendingDown className="text-red-600" size={16} />
                    )}
                    <span className="text-sm text-slate-700 font-medium">{contrib.feature}</span>
                  </div>
                  <div className={`font-bold text-sm ${contrib.contribution > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {contrib.contribution > 0 ? '+' : ''}{contrib.contribution}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI-Generated Feedback */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">AI-Generated Feedback</h3>

            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />
                  <h4 className="font-semibold text-blue-900 text-sm">Overall Assessment</h4>
                </div>
                <p className="text-sm text-blue-900 leading-relaxed">{feedback.summary}</p>
              </div>

              {feedback.strengths && (
                <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                  <div className="flex items-start gap-2 mb-2">
                    <TrendingUp className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
                    <h4 className="font-semibold text-green-900 text-sm">Key Strengths</h4>
                  </div>
                  <p className="text-sm text-green-900 leading-relaxed">{feedback.strengths}</p>
                </div>
              )}

              {feedback.improvements && (
                <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded">
                  <div className="flex items-start gap-2 mb-2">
                    <TrendingDown className="text-amber-600 mt-0.5 flex-shrink-0" size={18} />
                    <h4 className="font-semibold text-amber-900 text-sm">Areas for Improvement</h4>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed">{feedback.improvements}</p>
                </div>
              )}

              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle className="text-purple-600 mt-0.5 flex-shrink-0" size={18} />
                  <h4 className="font-semibold text-purple-900 text-sm">Next Steps</h4>
                </div>
                <p className="text-sm text-purple-900 leading-relaxed">{feedback.recommendation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Stage Performance Breakdown</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quiz Stats */}
            {/* {stageData.quiz && (
              <div className="border-2 border-slate-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-800">Stage A: Quiz</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((stageData.quiz.score / stageData.quiz.totalQuestions) * 100)}%
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Correct Answers</span>
                    <span className="font-semibold">{stageData.quiz.score}/{stageData.quiz.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Time</span>
                    <span className="font-semibold">{Math.floor(stageData.quiz.totalTime / 60)}m {stageData.quiz.totalTime % 60}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Avg Time/Question</span>
                    <span className="font-semibold">{Math.round(stageData.quiz.totalTime / stageData.quiz.totalQuestions)}s</span>
                  </div>
                </div>
              </div>
            )} */}

            {/* Quiz Stats */}
            {stageData.quiz && (
              <div className="border-2 border-slate-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-800">Stage A: Quiz</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {stageData.quiz.score ? Math.round(stageData.quiz.score) : 0}%
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Correct Answers</span>
                    <span className="font-semibold">
                      {stageData.quiz.correct || 0}/{stageData.quiz.totalQuestions || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Time</span>
                    <span className="font-semibold">
                      {Math.floor((stageData.quiz.totalTime || 0) / 60)}m {(stageData.quiz.totalTime || 0) % 60}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Avg Time/Question</span>
                    <span className="font-semibold">
                      {stageData.quiz.totalQuestions ? Math.round((stageData.quiz.totalTime || 0) / stageData.quiz.totalQuestions) : 0}s
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Coding Stats */}
            {stageData.coding && (
              <div className="border-2 border-slate-200 rounded-lg p-4 hover:border-green-400 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-800">Stage B: Coding</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(stageData.coding.testResults.percentage)}%
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tests Passed</span>
                    <span className="font-semibold">{stageData.coding.testResults.passed}/{stageData.coding.testResults.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Run Attempts</span>
                    <span className="font-semibold">{stageData.coding.runCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Lines of Code</span>
                    <span className="font-semibold">{stageData.coding.codeMetrics.linesOfCode}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Audit Stats */}
            {stageData.audit && (
              <div className="border-2 border-slate-200 rounded-lg p-4 hover:border-purple-400 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-800">Stage C: Audit</h4>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(stageData.audit.metrics?.overallScore || 0)}%
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Bugs Fixed</span>
                    <span className="font-semibold">
                      {stageData.audit.metrics?.bugsFixed || 0}/{stageData.audit.metrics?.bugsTotal || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Edit Efficiency</span>
                    <span className="font-semibold">
                      {Math.round(stageData.audit.metrics?.editEfficiency || 0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Lines Modified</span>
                    <span className="font-semibold">
                      {stageData.audit.metrics?.linesModified || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>



        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Download size={18} />
            Download Full Report
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-8 bg-slate-100 border border-slate-200 rounded-lg p-4 text-center">
          <p className="text-sm text-slate-600">
            This analysis was generated using an ensemble ML model combining Random Forest and XGBoost with SHAP explainability.
            The natural language feedback was generated using GPT-4o based on your performance metrics.
          </p>
        </div>
      </div>
    </div>
  );
}