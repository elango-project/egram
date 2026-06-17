import React, { useState, useEffect } from 'react';
import assessmentService from '../../services/assessmentService';

const StudentAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation states
  const [viewState, setViewState] = useState('list'); // 'list', 'wizard', 'result'
  const [activeAssessment, setActiveAssessment] = useState(null);
  
  // Wizard state
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: 'A' }
  const [submitting, setSubmitting] = useState(false);
  
  // Result state
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchAssessments();
  }, [viewState]);

  const fetchAssessments = async () => {
    try {
      const data = await assessmentService.getAssessments();
      setAssessments(data);
    } catch (error) {
      console.error('Failed to fetch assessments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = async (assessment) => {
    try {
      setLoading(true);
      const qList = await assessmentService.getAssessmentQuestions(assessment.id);
      if (!qList || qList.length === 0) {
        alert('This assessment has no questions yet.');
        return;
      }
      setActiveAssessment(assessment);
      setQuestions(qList);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setViewState('wizard');
    } catch (error) {
      console.error('Failed to start assessment', error);
      alert('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = async (id) => {
    try {
      setLoading(true);
      const res = await assessmentService.getAssessmentResult(id);
      setResult(res);
      setViewState('result');
    } catch (error) {
      console.error('Failed to fetch result', error);
      alert('Result not found or not taken yet.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      if (!window.confirm('You have unanswered questions. Submit anyway?')) {
        return;
      }
    }
    
    try {
      setSubmitting(true);
      const finalResult = await assessmentService.submitAssessment(activeAssessment.id, answers);
      setResult(finalResult);
      setViewState('result');
    } catch (error) {
      console.error('Submit error', error);
      alert('Failed to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && viewState === 'list') {
    return <div className="text-center py-12">Loading Assessments...</div>;
  }

  // RESULT VIEW
  if (viewState === 'result' && result) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">Assessment Result</h2>
        
        <div className={`p-8 rounded-2xl mb-8 border-4 ${result.passed ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <div className="text-6xl mb-4">{result.passed ? '🎉' : '❌'}</div>
          <h3 className={`text-4xl font-extrabold mb-2 ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
            {result.passed ? 'PASSED' : 'FAILED'}
          </h3>
          <div className="text-5xl font-bold text-gray-900 my-6">
            {result.scorePercentage}%
          </div>
          <p className="text-lg text-gray-700">
            You scored {result.score} out of {result.totalQuestions}.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Submitted: {new Date(result.submittedAt).toLocaleString()}
          </p>
        </div>

        <button 
          onClick={() => setViewState('list')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg"
        >
          Back to Assessments
        </button>
      </div>
    );
  }

  // WIZARD VIEW
  if (viewState === 'wizard' && activeAssessment) {
    const currentQ = questions[currentQuestionIndex];
    const isLast = currentQuestionIndex === questions.length - 1;

    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{activeAssessment.title}</h2>
          <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 min-h-[300px]">
          <h3 className="text-xl font-medium text-gray-900 mb-8">{currentQuestionIndex + 1}. {currentQ.question}</h3>
          
          <div className="space-y-4">
            {['A', 'B', 'C', 'D'].map((opt) => (
              <label 
                key={opt} 
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  answers[currentQ.id] === opt 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input 
                  type="radio" 
                  name={`question-${currentQ.id}`} 
                  value={opt}
                  checked={answers[currentQ.id] === opt}
                  onChange={() => handleAnswerSelect(currentQ.id, opt)}
                  className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-4 font-medium text-gray-700">
                  <span className="mr-2 text-gray-500">{opt}.</span>
                  {currentQ[`option${opt}`]}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button 
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md font-medium disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          
          {isLast ? (
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-bold disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          ) : (
            <button 
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
            >
              Next
            </button>
          )}
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Assessments</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map(ass => (
          <div key={ass.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-xl text-gray-900">{ass.title}</h3>
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded flex items-center">
                ⏱ {ass.durationMinutes}m
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-6 flex-1">{ass.description}</p>
            
            <div className="flex justify-between items-center mb-6 text-sm text-gray-500 border-t pt-4">
              <span>{ass.questionsCount} Questions</span>
              <span>Pass: {ass.passingPercentage}%</span>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => handleStartAssessment(ass)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-center transition-colors"
              >
                Take Assessment
              </button>
              <button 
                onClick={() => handleViewResult(ass.id)}
                className="py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-medium rounded transition-colors"
                title="View Result if already taken"
              >
                Result
              </button>
            </div>
          </div>
        ))}
      </div>

      {assessments.length === 0 && (
        <div className="text-center text-gray-500 py-12">No Assessments available right now.</div>
      )}
    </div>
  );
};

export default StudentAssessments;
