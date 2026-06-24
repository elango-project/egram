import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courseService from '../../services/courseService';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

const AssessmentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const [assData, qData] = await Promise.all([
          courseService.getAssessment(courseId),
          courseService.getAssessmentQuestions(courseId)
        ]);
        setAssessment(assData);
        setQuestions(qData);
      } catch (err) {
        toast.error('Failed to load assessment. Ensure you have unlocked it.');
        navigate(`/courses/${courseId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [courseId, navigate]);

  const handleSelectOption = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      if (!window.confirm('You have unanswered questions. Are you sure you want to submit?')) {
        return;
      }
    }
    
    setSubmitting(true);
    try {
      const response = await courseService.submitAssessment(courseId, {
        answers,
        startedAt: new Date().toISOString()
      });
      setResult(response);
      toast.success('Assessment submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  if (!assessment || questions.length === 0) return <div className="text-center py-20 text-red-500">Assessment not configured correctly.</div>;

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            {result.passed ? (
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={48} />
              </div>
            ) : (
              <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-bold">
                X
              </div>
            )}
            <h2 className="text-3xl font-bold text-gray-800">{result.percentage}%</h2>
            <p className="text-gray-500 font-medium">Score</p>
          </div>
          
          <h3 className={`text-xl font-bold mb-2 ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
            {result.passed ? 'Assessment Passed!' : 'Assessment Failed'}
          </h3>
          <p className="text-gray-600 mb-8">{result.message}</p>
          
          <div className="flex flex-col gap-3">
            {result.passed && (
              <button 
                onClick={() => navigate(`/courses/${courseId}/certificate`)}
                className="bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                View Certificate
              </button>
            )}
            <button 
              onClick={() => navigate(`/courses/${courseId}`)}
              className="bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{assessment.title}</h1>
            <p className="text-sm text-gray-500">Passing Score: {assessment.passingPercentage}%</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-gray-500 block mb-1">Progress</span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all" 
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-400">{currentQuestionIndex + 1} of {questions.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 min-h-[400px] flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-8">{currentQuestionIndex + 1}. {currentQ.question}</h2>
          
          <div className="space-y-4 flex-1">
            {['A', 'B', 'C', 'D'].map(opt => {
              const text = currentQ[`option${opt}`];
              const isSelected = answers[currentQ.id] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(currentQ.id, opt)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {opt}
                    </div>
                    <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>{text}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button 
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowLeft size={18} /> Previous
          </button>
          
          {currentQuestionIndex < questions.length - 1 ? (
            <button 
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Next <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-md disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
