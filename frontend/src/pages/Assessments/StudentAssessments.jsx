import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import assessmentService from '../../services/assessmentService';

const StudentAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation states
  const [viewState, setViewState] = useState('list'); // 'list', 'wizard', 'history', 'result'
  const [activeAssessment, setActiveAssessment] = useState(null);
  
  // Wizard state
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: 'A' }
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  
  // History & Result state
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (viewState === 'list') {
      fetchAssessments();
    }
  }, [viewState]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const data = await assessmentService.getAssessments();
      setAssessments(data);
    } catch (error) {
      console.error('Failed to fetch assessments', error);
      toast.error('Failed to load assessments.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = async (assessment) => {
    try {
      setLoading(true);
      const qList = await assessmentService.getAssessmentQuestions(assessment.id);
      if (!qList || qList.length === 0) {
        toast.error('This assessment has no questions yet.');
        return;
      }
      
      // Randomize questions
      const shuffled = [...qList].sort(() => Math.random() - 0.5);
      
      setActiveAssessment(assessment);
      setQuestions(shuffled);
      setCurrentQuestionIndex(0);
      setAnswers({});
      
      // Timer setup
      const durationSeconds = (assessment.durationMinutes || 30) * 60;
      setTimeLeft(durationSeconds);
      setStartedAt(new Date().toISOString());
      
      setViewState('wizard');
    } catch (error) {
      console.error('Failed to start assessment', error);
      toast.error('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (id) => {
    try {
      setLoading(true);
      const res = await assessmentService.getAssessmentHistory(id);
      setHistory(res);
      setViewState('history');
    } catch (error) {
      console.error('Failed to fetch history', error);
      toast.error('Could not load attempt history.');
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

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!isAutoSubmit && Object.keys(answers).length < questions.length) {
      if (!window.confirm('You have unanswered questions. Submit anyway?')) {
        return;
      }
    }
    
    try {
      setSubmitting(true);
      const questionOrder = questions.map(q => q.id);
      const payload = {
        answers,
        startedAt,
        questionOrder
      };
      const finalResult = await assessmentService.submitAssessment(activeAssessment.id, payload);
      setResult(finalResult);
      setViewState('result');
    } catch (error) {
      console.error('Submit error', error);
      toast.error('Failed to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  // Timer Effect
  useEffect(() => {
    let timer;
    if (viewState === 'wizard' && timeLeft !== null && timeLeft > 0 && !submitting) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            toast('Time is up! Submitting automatically.', { icon: '⏱️' });
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [viewState, timeLeft, submitting]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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
            {result.percentage}%
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

  // HISTORY VIEW
  if (viewState === 'history') {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Attempt History</h2>
          <button 
            onClick={() => setViewState('list')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Back
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm">
            No attempts found for this assessment.
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((attempt, index) => (
              <div key={attempt.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Attempt {history.length - index}</h3>
                  <p className="text-sm text-gray-500">Submitted: {new Date(attempt.submittedAt).toLocaleString()}</p>
                </div>
                
                <div className="flex gap-8 items-center mt-4 sm:mt-0">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 font-medium">Score</p>
                    <p className="text-xl font-bold text-gray-900">{attempt.score} / {attempt.totalQuestions}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 font-medium">Percentage</p>
                    <p className="text-xl font-bold text-gray-900">{attempt.percentage}%</p>
                  </div>
                  <div className="text-center w-24">
                    <span className={`px-4 py-1 rounded-full text-sm font-bold ${attempt.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {attempt.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // WIZARD VIEW
  if (viewState === 'wizard' && activeAssessment) {
    const currentQ = questions[currentQuestionIndex];
    const isLast = currentQuestionIndex === questions.length - 1;

    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">{activeAssessment.title}</h2>
          <div className="flex gap-4">
            <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full flex items-center">
              Q {currentQuestionIndex + 1} / {questions.length}
            </span>
            <span className={`text-sm font-bold px-3 py-1 rounded-full flex items-center ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-800'}`}>
              ⏱ {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
            </span>
          </div>
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
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          
          {isLast ? (
            <button 
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-bold disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          ) : (
            <button 
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
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
                onClick={() => handleViewHistory(ass.id)}
                className="py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-medium rounded transition-colors"
                title="View past attempts"
              >
                History
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
