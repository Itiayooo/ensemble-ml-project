import { Clock, CheckCircle } from 'lucide-react';

export default function TopBar({ currentStage, showTimer = false, timeElapsed = '00:00' }) {
  const stages = [
    { id: 1, name: 'Stage A', label: 'Quiz' },
    { id: 2, name: 'Stage B', label: 'Code' },
    { id: 3, name: 'Stage C', label: 'Audit' },
    { id: 4, name: 'Results', label: 'Results' }
  ];

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
      <div className="text-white font-semibold text-lg">SkillAssess Pro</div>
      
      <div className="flex items-center gap-8">
        {/* Progress Stages */}
        <div className="flex items-center gap-3 text-sm">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="flex items-center gap-2">
              {idx > 0 && <span className="text-blue-300">→</span>}
              <div className={`flex items-center gap-2 ${
                currentStage >= stage.id ? 'text-white' : 'text-blue-300'
              }`}>
                <CheckCircle 
                  size={16} 
                  className={currentStage >= stage.id ? 'fill-green-400' : ''} 
                />
                <span>{stage.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Timer */}
        {showTimer && (
          <div className="flex items-center gap-2 bg-blue-800 px-3 py-1 rounded text-white">
            <Clock size={16} />
            <span className="font-mono">{timeElapsed}</span>
          </div>
        )}
      </div>
    </div>
  );
}