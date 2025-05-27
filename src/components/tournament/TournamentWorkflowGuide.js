import React, { useState } from 'react';
import { 
  Play, 
  Trophy, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Target,
  Save,
  Crown,
  AlertCircle,
  Clock
} from 'lucide-react';

const TournamentWorkflowGuide = ({ tournament, currentRound, matches, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Safety check
  if (!tournament) {
    return null;
  }

  const totalMatches = matches?.length || 0;
  const completedMatches = matches?.filter(m => m?.status === 'COMPLETED').length || 0;
  const remainingMatches = totalMatches - completedMatches;

  const steps = [
    {
      id: 1,
      title: "Input Match Results",
      description: "Enter scores for each match in the current round",
      icon: Save,
      status: remainingMatches > 0 ? 'current' : 'completed',
      details: [
        "Click 'Input Score' button for each match",
        "Enter team scores (must be different - no ties)",
        "Click 'Save' to confirm results",
        "Match status will change to COMPLETED"
      ]
    },
    {
      id: 2,
      title: "Complete Current Round",
      description: "Finish all matches in this round",
      icon: CheckCircle,
      status: remainingMatches === 0 ? 'completed' : 'pending',
      details: [
        `Complete ${remainingMatches} remaining matches`,
        "All matches must have winners determined",
        "Round progress will show 100%",
        "Ready to advance to next round"
      ]
    },
    {
      id: 3,
      title: "Advance Round",
      description: "Move winners to the next round",
      icon: ArrowRight,
      status: remainingMatches === 0 ? 'current' : 'pending',
      details: [
        "Go to 'Round Management' tab",
        "Click 'Advance to Round X' button",
        "System automatically creates new matches",
        "Winners become participants in next round"
      ]
    },
    {
      id: 4,
      title: "Repeat Until Final",
      description: "Continue until tournament completion",
      icon: Trophy,
      status: 'pending',
      details: [
        "Repeat steps 1-3 for each round",
        "Each round has fewer teams",
        "Final round determines winner",
        "Tournament status becomes COMPLETED"
      ]
    },
    {
      id: 5,
      title: "Declare Winner",
      description: "Celebrate the tournament champion",
      icon: Crown,
      status: 'pending',
      details: [
        "Final match determines champion",
        "Winner is automatically declared",
        "Tournament is marked as COMPLETED",
        "Results are final and public"
      ]
    }
  ];

  const getStepColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'current':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'current':
        return 'bg-blue-500 text-white';
      case 'pending':
        return 'bg-gray-300 text-gray-600';
      default:
        return 'bg-gray-300 text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Tournament Management Workflow</h2>
              <p className="text-blue-100">
                Step-by-step guide to manage your tournament: {tournament.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors text-2xl"
            >
              ×
            </button>
          </div>
          
          {/* Current Status */}
          <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{currentRound}</div>
                <div className="text-sm text-blue-100">Current Round</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{totalMatches}</div>
                <div className="text-sm text-blue-100">Total Matches</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{completedMatches}</div>
                <div className="text-sm text-blue-100">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{remainingMatches}</div>
                <div className="text-sm text-blue-100">Remaining</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Tournament Progress</span>
              <span className="text-sm text-gray-600">
                {completedMatches}/{totalMatches} matches completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              
              return (
                <div 
                  key={step.id}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                    isActive ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Step Number & Icon */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        getStepIcon(step.status)
                      }`}>
                        {step.id}
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        getStepIcon(step.status)
                      }`}>
                        <StepIcon className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${
                          getStepColor(step.status)
                        }`}>
                          {step.status === 'completed' ? 'Completed' : 
                           step.status === 'current' ? 'Current' : 'Pending'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{step.description}</p>
                      
                      {/* Step Details */}
                      {isActive && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-3">Detailed Instructions:</h4>
                          <ul className="space-y-2">
                            {step.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center mt-4">
                      <div className="w-px h-6 bg-gray-300"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Action */}
          <div className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-orange-600 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-orange-900 mb-2">Next Action Required</h3>
                {remainingMatches > 0 ? (
                  <div>
                    <p className="text-orange-700 mb-2">
                      <strong>🎯 Input match results:</strong> {remainingMatches} matches need scores
                    </p>
                    <p className="text-sm text-orange-600">
                      Go to "Match Results" tab and click "Input Score" for each pending match.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-orange-700 mb-2">
                      <strong>🚀 Advance round:</strong> All matches completed!
                    </p>
                    <p className="text-sm text-orange-600">
                      Go to "Round Management" tab and click "Advance to Round {currentRound + 1}".
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
          <div className="text-sm text-gray-600">
            💡 Tip: Complete matches in order and advance rounds systematically
          </div>
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default TournamentWorkflowGuide;