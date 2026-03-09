import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Send, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import { assessmentsAPI } from '../../api/assessments';
import { toast } from 'react-toastify';

const TakeAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchAssessment = async () => {
    try {
      const data = await assessmentsAPI.getAssessment(id);
      setAssessment(data);
      setTimeLeft((data.duration || 60) * 60);
    } catch (error) {
      toast.error('Failed to load assessment');
      navigate('/student/assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (Object.keys(answers).length < assessment.questions.length) {
      if (!window.confirm('You have unanswered questions. Submit anyway?')) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const submission = assessment.questions.map(q => ({
        questionId: q._id,
        answer: answers[q._id] || ''
      }));
      
      await assessmentsAPI.submitAssessment(id, { answers: submission });
      toast.success('Assessment submitted successfully!');
      navigate('/student/assessments');
    } catch (error) {
      toast.error('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center py-12">Loading assessment...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="card mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold dark:text-white">{assessment.title}</h1>
              <p className="text-gray-600 dark:text-gray-300">{assessment.subject}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-lg font-semibold text-blue-600">
                <Clock size={24} />
                {formatTime(timeLeft)}
              </div>
              <p className="text-sm text-gray-500">Time Remaining</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {assessment.questions.map((question, index) => (
            <div key={question._id} className="card">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-lg font-medium dark:text-white mb-4">{question.question}</p>
                  
                  {question.type === 'multiple_choice' ? (
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <label key={optIndex} className="flex items-center gap-3 p-3 border dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                          <input
                            type="radio"
                            name={question._id}
                            value={option}
                            checked={answers[question._id] === option}
                            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="dark:text-gray-300">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={answers[question._id] || ''}
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                      placeholder="Type your answer here..."
                      className="input min-h-[120px]"
                      rows={4}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Before you submit:</p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                  <li>• Review all your answers</li>
                  <li>• You cannot change answers after submission</li>
                  <li>• Answered: {Object.keys(answers).length} / {assessment.questions.length}</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-3"
          >
            <Send size={20} />
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default TakeAssessment;
