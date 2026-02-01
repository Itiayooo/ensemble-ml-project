import { createContext, useContext, useState } from 'react';
import * as api from '../utils/api';

const AssessmentContext = createContext();

export function AssessmentProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [completedStages, setCompletedStages] = useState([]);
  const [stageData, setStageData] = useState({
    quiz: null,
    coding: null,
    audit: null
  });
  const [finalResults, setFinalResults] = useState(null);

  // Create user and start assessment
  const initializeAssessment = async (email, name) => {
    try {
      // Create user
      const user = await api.createUser(email, name);
      setUserId(user.id);

      // Start assessment session
      const session = await api.startAssessment(user.id);
      setSessionId(session.session_id);

      return session;
    } catch (error) {
      console.error('Failed to initialize assessment:', error);
      throw error;
    }
  };

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
    userId,
    sessionId,
    completedStages,
    stageData,
    finalResults,
    initializeAssessment,
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