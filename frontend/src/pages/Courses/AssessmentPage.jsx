import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import courseService from '../../services/courseService';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock, AlertCircle, Award, Flag } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

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
        navigate(`/dashboard/courses/${courseId}`);
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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="text-slate-500 font-medium">Preparing your assessment...</p>
      </div>
    );
  }

  if (!assessment || questions.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <p className="text-slate-900 font-bold text-xl mb-2">Assessment Unavailable</p>
        <p className="text-slate-500 mb-6">This assessment has not been configured correctly.</p>
        <Button onClick={() => navigate(`/dashboard/courses/${courseId}`)}>Return to Course</Button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <AnimatePresence>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md"
          >
            <Card className="text-center p-8 relative overflow-hidden">
              {/* Background Glow */}
              <div className={`absolute top-0 left-0 w-full h-32 ${result.passed ? 'bg-emerald-500/10' : 'bg-red-500/10'} -z-10`} />
              
              <div className="mb-8">
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ${
                    result.passed ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-red-400 to-red-600'
                  }`}
                >
                  {result.passed ? <CheckCircle size={56} className="text-white" /> : <XCircle size={56} className="text-white" />}
                </motion.div>
                
                <h2 className="text-6xl font-extrabold text-slate-900 mb-2 tracking-tight">
                  {result.percentage}%
                </h2>
                <p className="text-slate-500 font-medium uppercase tracking-wider text-sm">Final Score</p>
              </div>
              
              <h3 className={`text-2xl font-bold mb-3 ${result.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                {result.passed ? 'Assessment Passed!' : 'Assessment Failed'}
              </h3>
              <p className="text-slate-600 mb-8 leading-relaxed px-4">{result.message}</p>
              
              <div className="flex flex-col gap-3">
                {result.passed && (
                  <Button 
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate(`/dashboard/courses/${courseId}/certificate`)}
                    icon={<Award size={20} />}
                  >
                    Claim Certificate
                  </Button>
                )}
                <Button 
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate(`/dashboard/courses/${courseId}`)}
                >
                  Return to Course
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const progressPercentage = ((Object.keys(answers).length) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if(window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
                  navigate(`/dashboard/courses/${courseId}`);
                }
              }}
              className="text-slate-500 hover:text-red-600 transition-colors p-2"
            >
              <XCircle size={24} />
            </button>
            <div className="hidden md:block">
              <h1 className="font-bold text-slate-900">{assessment.title}</h1>
              <p className="text-xs text-slate-500">Final Examination</p>
            </div>
          </div>

          {/* Progress Bar Center */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
              <span>Progress</span>
              <span className="text-indigo-600">{Object.keys(answers).length} / {questions.length} Answered</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="warning" className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border-amber-200">
              <Flag size={14} /> Passing: {assessment.passingPercentage}%
            </Badge>
            <Badge variant="neutral" className="flex items-center gap-1.5 px-3 py-1.5 hidden sm:flex">
              <Clock size={14} /> Max Attempts: {assessment.maxAttempts}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full h-[calc(100vh-4rem)]">
        
        {/* Left Panel: Question Palette */}
        <aside className="w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 h-48 lg:h-full overflow-y-auto">
          <div className="p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              Question Palette
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = currentQuestionIndex === idx;
                
                let btnClass = "w-10 h-10 rounded-lg font-bold text-sm flex items-center justify-center transition-all border-2 ";
                
                if (isCurrent) {
                  btnClass += "border-indigo-600 text-indigo-600 bg-indigo-50 shadow-sm transform scale-110";
                } else if (isAnswered) {
                  btnClass += "border-emerald-500 bg-emerald-500 text-white";
                } else {
                  btnClass += "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50";
                }

                return (
                  <button 
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={btnClass}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-4 h-4 rounded bg-indigo-50 border-2 border-indigo-600"></div>
                <span className="text-slate-600">Current</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-4 h-4 rounded bg-emerald-500 border-2 border-emerald-500"></div>
                <span className="text-slate-600">Answered</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-4 h-4 rounded bg-white border-2 border-slate-200"></div>
                <span className="text-slate-600">Unanswered</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Center: Question Content */}
        <main className="flex-1 flex flex-col bg-slate-50 relative overflow-y-auto">
          <div className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <span className="text-indigo-600 font-bold uppercase tracking-wider text-sm mb-2 block">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                  {currentQ.question}
                </h2>
              </div>
              
              <div className="space-y-4">
                {['A', 'B', 'C', 'D'].map(opt => {
                  const text = currentQ[`option${opt}`];
                  const isSelected = answers[currentQ.id] === opt;
                  
                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(currentQ.id, opt)}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all group ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-md transform scale-[1.01]' 
                          : 'border-slate-200 hover:border-indigo-200 hover:bg-white bg-white shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                        }`}>
                          {opt}
                        </div>
                        <span className={`font-medium text-lg ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                          {text}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Bottom Bar: Navigation & Submit */}
          <div className="bg-white border-t border-slate-200 p-4 md:px-8 flex items-center justify-between sticky bottom-0 z-10">
            <Button 
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              icon={<ArrowLeft size={18} />}
            >
              Previous
            </Button>
            
            {currentQuestionIndex < questions.length - 1 ? (
              <Button 
                variant="primary"
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              >
                Next <ArrowRight size={18} className="ml-2" />
              </Button>
            ) : (
              <Button 
                variant="gradient"
                onClick={handleSubmit}
                isLoading={submitting}
                className="px-8 shadow-lg shadow-indigo-500/30"
              >
                Submit Exam
              </Button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssessmentPage;
