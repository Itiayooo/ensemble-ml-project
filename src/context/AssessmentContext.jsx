import { createContext, useContext, useState } from 'react';

const AssessmentContext = createContext();

export function AssessmentProvider({ children }) {
  const [completedStages, setCompletedStages] = useState([]);
  const [stageData, setStageData] = useState({
    quiz: null,
    coding: null,
    audit: null
  });
  const [finalResults, setFinalResults] = useState(null);

  const markStageComplete = (stageName) => {
    if (!completedStages.includes(stageName)) {
      setCompletedStages([...completedStages, stageName]);
    }
  };

  const saveStageData = (stageName, data) => {
    setStageData(prev => ({
      ...prev,
      [stageName]: data
    }));
  };

  const value = {
    completedStages,
    stageData,
    finalResults,
    markStageComplete,
    saveStageData,
    setFinalResults
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within AssessmentProvider');
  }
  return context;
}