import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import assessmentService from '../../services/assessmentService';

const AdminAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  // Form state for Assessment
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [passingPercentage, setPassingPercentage] = useState('');

  // Form state for Question
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const data = await assessmentService.getAssessments();
      setAssessments(data);
    } catch (error) {
      console.error('Failed to fetch assessments', error);
    }
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await assessmentService.createAssessment({ 
        title, 
        description, 
        durationMinutes: parseInt(durationMinutes), 
        passingPercentage: parseInt(passingPercentage) 
      });
      setTitle('');
      setDescription('');
      setDurationMinutes('');
      setPassingPercentage('');
      fetchAssessments();
    } catch (error) {
      console.error('Failed to create assessment', error);
      toast.error('Failed to create assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssessment = async (id) => {
    if (window.confirm('Are you sure you want to delete this Assessment?')) {
      try {
        await assessmentService.deleteAssessment(id);
        fetchAssessments();
        if (selectedAssessment?.id === id) setSelectedAssessment(null);
      } catch (error) {
        console.error('Failed to delete assessment', error);
        toast.error('Failed to delete assessment');
      }
    }
  };

  const handleSelectAssessment = async (assessment) => {
    try {
      // Fetch questions for this assessment
      const questions = await assessmentService.getAssessmentQuestions(assessment.id);
      const analytics = await assessmentService.getAssessmentAnalytics(assessment.id);
      setSelectedAssessment({ ...assessment, questions, analytics });
    } catch (error) {
      console.error('Failed to fetch details', error);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await assessmentService.addQuestion(selectedAssessment.id, {
        question: questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer
      });
      setQuestionText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setCorrectAnswer('A');
      
      handleSelectAssessment(selectedAssessment); // refresh questions
      fetchAssessments(); // refresh counts
    } catch (error) {
      console.error('Failed to add question', error);
      toast.error('Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Delete this question?')) {
      try {
        await assessmentService.deleteQuestion(questionId);
        handleSelectAssessment(selectedAssessment); // refresh questions
        fetchAssessments(); // refresh counts
      } catch (error) {
        console.error('Failed to delete question', error);
        toast.error('Failed to delete question');
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Assessments</h2>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div>
          {/* Create Form */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold mb-4">Create New Assessment</h3>
            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <input 
                type="text" 
                placeholder="Title" 
                required
                value={title} 
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <textarea 
                placeholder="Description" 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows="2"
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  placeholder="Duration (mins)" 
                  required
                  value={durationMinutes} 
                  onChange={e => setDurationMinutes(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                <input 
                  type="number" 
                  placeholder="Passing %" 
                  required
                  value={passingPercentage} 
                  onChange={e => setPassingPercentage(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Assessment'}
              </button>
            </form>
          </div>

          {/* List Assessments */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h3 className="text-lg font-semibold p-4 bg-gray-50 border-b">All Assessments</h3>
            <ul className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
              {assessments.map(ass => (
                <li key={ass.id} className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center" onClick={() => handleSelectAssessment(ass)}>
                  <div>
                    <h4 className="font-bold text-gray-900">{ass.title}</h4>
                    <p className="text-sm text-gray-500">
                      {ass.questionsCount} Qs | {ass.durationMinutes}m | {ass.passingPercentage}% to pass
                    </p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteAssessment(ass.id); }}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Delete
                  </button>
                </li>
              ))}
              {assessments.length === 0 && (
                <li className="p-4 text-center text-gray-500">No Assessments created yet.</li>
              )}
            </ul>
          </div>
        </div>

        <div>
          {selectedAssessment ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold mb-4 text-green-800">{selectedAssessment.title} - Dashboard</h3>
              
              {/* Analytics Dashboard */}
              {selectedAssessment.analytics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                    <p className="text-sm text-blue-600 font-semibold">Total Attempts</p>
                    <p className="text-2xl font-bold text-blue-900">{selectedAssessment.analytics.totalAttempts}</p>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                    <p className="text-sm text-green-600 font-semibold">Pass Rate</p>
                    <p className="text-2xl font-bold text-green-900">{selectedAssessment.analytics.passRate}%</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 text-center">
                    <p className="text-sm text-purple-600 font-semibold">Average Score</p>
                    <p className="text-2xl font-bold text-purple-900">{selectedAssessment.analytics.averageScore}</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-center">
                    <p className="text-sm text-orange-600 font-semibold">Highest Score</p>
                    <p className="text-2xl font-bold text-orange-900">{selectedAssessment.analytics.highestScore}</p>
                  </div>
                </div>
              )}
              
              {/* Add Question Form */}
              <div className="bg-green-50 p-4 rounded-md mb-6 border border-green-100">
                <h4 className="font-semibold text-green-900 mb-3">Add Question</h4>
                <form onSubmit={handleAddQuestion} className="space-y-3">
                  <textarea 
                    placeholder="Question Text" 
                    required
                    value={questionText} 
                    onChange={e => setQuestionText(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    rows="2"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Option A" required value={optionA} onChange={e => setOptionA(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm" />
                    <input type="text" placeholder="Option B" required value={optionB} onChange={e => setOptionB(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm" />
                    <input type="text" placeholder="Option C" required value={optionC} onChange={e => setOptionC(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm" />
                    <input type="text" placeholder="Option D" required value={optionD} onChange={e => setOptionD(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm" />
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <label className="text-sm font-medium text-gray-700">Correct Answer:</label>
                    <select 
                      value={correctAnswer} 
                      onChange={e => setCorrectAnswer(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 ml-auto disabled:opacity-50"
                    >
                      Save Question
                    </button>
                  </div>
                </form>
              </div>

              {/* List Questions */}
              <h4 className="font-semibold mb-3">Existing Questions</h4>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {selectedAssessment.questions?.map((q, index) => (
                  <div key={q.id} className="p-4 bg-gray-50 border rounded-md relative">
                    <button 
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                    <p className="font-medium text-gray-900 mb-2 pr-10">{index + 1}. {q.question}</p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                      <li className={q.correctAnswer === 'A' ? 'font-bold text-green-700' : ''}>A: {q.optionA}</li>
                      <li className={q.correctAnswer === 'B' ? 'font-bold text-green-700' : ''}>B: {q.optionB}</li>
                      <li className={q.correctAnswer === 'C' ? 'font-bold text-green-700' : ''}>C: {q.optionC}</li>
                      <li className={q.correctAnswer === 'D' ? 'font-bold text-green-700' : ''}>D: {q.optionD}</li>
                    </ul>
                  </div>
                ))}
                {(!selectedAssessment.questions || selectedAssessment.questions.length === 0) && (
                  <p className="text-gray-500 text-sm italic">No questions added yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg h-full flex items-center justify-center text-gray-500 min-h-[300px]">
              Select an assessment to manage questions
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAssessments;
