import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import courseService from '../../services/courseService';

export default function StudentQuizView({ topicId, onQuizComplete }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [topicId]);

  const fetchQuiz = async () => {
    try {
      const data = await courseService.getQuiz(topicId);
      setQuiz(data);
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error('Failed to load quiz');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, option) => {
    if (result) return; // Prevent changing after submit
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      toast.error('Please answer all questions');
      return;
    }
    setSubmitting(true);
    try {
      const attemptResult = await courseService.submitQuiz(topicId, { answers });
      setResult(attemptResult);
      if (attemptResult.passed) {
        toast.success('Congratulations! You passed the quiz.');
        if (onQuizComplete) onQuizComplete();
      } else {
        toast.error(`You scored ${attemptResult.score}%. Passing is ${quiz.passingPercentage}%.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Loading quiz...</div>;
  if (!quiz) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
          <p className="text-sm text-gray-500 mt-1">Passing score: {quiz.passingPercentage}% • Max Attempts: {quiz.maxAttempts}</p>
        </div>
      </div>

      {result ? (
        <div className={`p-6 rounded-lg mb-6 border ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            {result.passed ? <CheckCircle className="text-green-600 w-8 h-8" /> : <XCircle className="text-red-600 w-8 h-8" />}
            <h3 className={`text-xl font-bold ${result.passed ? 'text-green-800' : 'text-red-800'}`}>
              {result.passed ? 'Quiz Passed!' : 'Quiz Failed'}
            </h3>
          </div>
          <p className="text-gray-700 ml-11">
            You scored <strong>{result.score}%</strong> ({result.correctAnswers} out of {result.totalQuestions} correct).
          </p>
        </div>
      ) : null}

      <div className="space-y-8">
        {quiz.questions?.map((q, i) => (
          <div key={q.id} className="bg-gray-50 rounded-lg p-5 border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4">{i + 1}. {q.question}</h4>
            <div className="space-y-2">
              {['A', 'B', 'C', 'D'].map(opt => {
                const optText = q[`option${opt}`];
                const isSelected = answers[q.id] === opt;
                const isCorrectAnswer = result && q.correctAnswer === opt;
                const isWrongSelection = result && isSelected && !isCorrectAnswer;

                let optionClass = "w-full text-left px-4 py-3 rounded border transition-colors flex justify-between items-center ";
                if (result) {
                  if (isCorrectAnswer) {
                    optionClass += "bg-green-100 border-green-400 text-green-900 font-medium";
                  } else if (isWrongSelection) {
                    optionClass += "bg-red-100 border-red-400 text-red-900";
                  } else {
                    optionClass += "bg-white border-gray-200 text-gray-500 opacity-60";
                  }
                } else {
                  optionClass += isSelected 
                    ? "bg-purple-50 border-purple-500 text-purple-900 ring-1 ring-purple-500" 
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50";
                }

                return (
                  <button 
                    key={opt}
                    onClick={() => handleSelectOption(q.id, opt)}
                    disabled={!!result}
                    className={optionClass}
                  >
                    <span>{optText}</span>
                    {result && isCorrectAnswer && <CheckCircle size={18} className="text-green-600" />}
                    {result && isWrongSelection && <XCircle size={18} className="text-red-600" />}
                  </button>
                );
              })}
            </div>
            {result && q.explanation && (
               <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded border border-blue-100 flex items-start gap-2">
                 <AlertCircle size={16} className="mt-0.5 shrink-0" />
                 <span><strong>Explanation:</strong> {q.explanation}</span>
               </div>
            )}
          </div>
        ))}
      </div>

      {!result && (
        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      )}
    </div>
  );
}
