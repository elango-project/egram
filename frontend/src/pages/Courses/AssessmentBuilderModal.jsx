import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Save } from 'lucide-react';
import courseService from '../../services/courseService';
import toast from 'react-hot-toast';

const AssessmentBuilderModal = ({ course, onClose }) => {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: 'Final Course Assessment',
    description: '',
    passingPercentage: 70,
    maxAttempts: 3,
    active: true,
    questions: []
  });

  useEffect(() => {
    fetchAssessment();
  }, [course.id]);

  const fetchAssessment = async () => {
    try {
      const data = await courseService.getAssessment(course.id);
      if (data) {
        setAssessment(data);
        setFormData({
          title: data.title,
          description: data.description || '',
          passingPercentage: data.passingPercentage,
          maxAttempts: data.maxAttempts || 3,
          active: data.active !== false,
          questions: data.questions || []
        });
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error('Failed to load assessment');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' }
      ]
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.questions.length === 0) {
      toast.error('Assessment must have at least one question');
      return;
    }
    
    setSaving(true);
    try {
      if (assessment) {
        // If it exists, we update it (for MVP we just pass everything if backend supports it or delete & recreate)
        // Since our backend doesn't fully support updating questions seamlessly without specific logic, 
        // we can just delete and recreate to be safe, or if our updateAssessment endpoint handles it, we use it.
        // Let's assume we delete and recreate for simplicity in this MVP, or just call create if it overwrites.
        await courseService.deleteAssessment(course.id);
      }
      
      await courseService.createAssessment(course.id, formData);
      toast.success('Assessment saved successfully!');
      onClose();
    } catch (err) {
      toast.error('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Final Assessment Builder</h2>
            <p className="text-sm text-gray-500">Course: {course.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <form id="assessmentForm" onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-semibold text-gray-700">Assessment Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Passing Percentage (%)</label>
                <input 
                  type="number" 
                  min="0" max="100"
                  value={formData.passingPercentage}
                  onChange={e => setFormData({...formData, passingPercentage: parseInt(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Max Attempts</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.maxAttempts}
                  onChange={e => setFormData({...formData, maxAttempts: parseInt(e.target.value) || 1})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Questions</h3>
                <button 
                  type="button" 
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded font-medium hover:bg-blue-200"
                >
                  <Plus size={16} /> Add Question
                </button>
              </div>

              <div className="space-y-4">
                {formData.questions.map((q, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative">
                    <button 
                      type="button"
                      onClick={() => handleRemoveQuestion(index)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                    
                    <div className="pr-8 mb-4">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Question {index + 1}</label>
                      <input 
                        type="text" 
                        value={q.question}
                        onChange={e => handleQuestionChange(index, 'question', e.target.value)}
                        placeholder="Enter question text..."
                        className="w-full border-b border-gray-300 px-2 py-1 focus:border-blue-500 focus:outline-none bg-transparent"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <div key={opt} className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-400 w-4">{opt}</span>
                          <input 
                            type="text" 
                            value={q[`option${opt}`]}
                            onChange={e => handleQuestionChange(index, `option${opt}`, e.target.value)}
                            placeholder={`Option ${opt}`}
                            className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-sm"
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded inline-flex">
                      <label className="text-sm font-semibold text-gray-700">Correct Answer:</label>
                      <select 
                        value={q.correctAnswer}
                        onChange={e => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm bg-white font-bold text-green-600"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                  </div>
                ))}

                {formData.questions.length === 0 && (
                  <div className="text-center py-8 bg-white border border-dashed border-gray-300 rounded-lg text-gray-500">
                    No questions added yet. Click 'Add Question' to begin.
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="assessmentForm"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : <><Save size={18} /> Save Assessment</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentBuilderModal;
