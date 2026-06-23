import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';

export default function QuizBuilderModal({ topic, onClose }) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [passingPercentage, setPassingPercentage] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchQuiz();
  }, [topic.id]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const data = await courseService.getQuiz(topic.id);
      if (data) {
        setTitle(data.title);
        setPassingPercentage(data.passingPercentage);
        setMaxAttempts(data.maxAttempts);
        setQuestions(data.questions || []);
      }
    } catch (err) {
      if (err.response && err.response.status !== 404) {
        toast.error('Failed to load existing quiz');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', explanation: '' }
    ]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (questions.length === 0) {
      toast.error('Add at least one question');
      return;
    }
    setLoading(true);
    try {
      await courseService.createOrUpdateQuiz(topic.id, {
        title,
        passingPercentage,
        maxAttempts,
        questions
      });
      toast.success('Quiz saved successfully');
      onClose();
    } catch (err) {
      toast.error('Failed to save quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold">Quiz Builder</h2>
            <p className="text-sm text-gray-500">Topic: {topic.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 font-bold text-xl">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading && questions.length === 0 ? (
            <p className="text-center text-gray-500 py-10">Loading...</p>
          ) : (
            <form id="quiz-form" onSubmit={handleSave} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold mb-1">Quiz Title</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="e.g. Java OOP Basics" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Passing %</label>
                  <input type="number" min="1" max="100" required value={passingPercentage} onChange={e => setPassingPercentage(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Max Attempts</label>
                  <input type="number" min="1" required value={maxAttempts} onChange={e => setMaxAttempts(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Questions ({questions.length})</h3>
                  <button type="button" onClick={handleAddQuestion} className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm font-semibold hover:bg-purple-200">
                    + Add Question
                  </button>
                </div>

                <div className="space-y-6">
                  {questions.map((q, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                      <button type="button" onClick={() => handleRemoveQuestion(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-semibold">Remove</button>
                      
                      <div className="mb-3 pr-16">
                        <label className="block text-sm font-semibold mb-1">Question {index + 1}</label>
                        <textarea required value={q.question} onChange={e => handleQuestionChange(index, 'question', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" rows="2"></textarea>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-gray-600">Option A</label>
                          <input type="text" required value={q.optionA} onChange={e => handleQuestionChange(index, 'optionA', e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-gray-600">Option B</label>
                          <input type="text" required value={q.optionB} onChange={e => handleQuestionChange(index, 'optionB', e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-gray-600">Option C</label>
                          <input type="text" required value={q.optionC} onChange={e => handleQuestionChange(index, 'optionC', e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-gray-600">Option D</label>
                          <input type="text" required value={q.optionD} onChange={e => handleQuestionChange(index, 'optionD', e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                         <div>
                          <label className="block text-xs font-semibold mb-1 text-green-700">Correct Answer</label>
                          <select value={q.correctAnswer} onChange={e => handleQuestionChange(index, 'correctAnswer', e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm bg-white border-green-300">
                            <option value="A">Option A</option>
                            <option value="B">Option B</option>
                            <option value="C">Option C</option>
                            <option value="D">Option D</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-blue-700">Explanation (Optional)</label>
                          <input type="text" value={q.explanation || ''} onChange={e => handleQuestionChange(index, 'explanation', e.target.value)} placeholder="Shown after answer" className="w-full border rounded px-3 py-1.5 text-sm border-blue-200" />
                        </div>
                      </div>

                    </div>
                  ))}
                  {questions.length === 0 && (
                    <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                      No questions added yet. Click "+ Add Question".
                    </div>
                  )}
                </div>
              </div>

            </form>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
          <button type="submit" form="quiz-form" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}
