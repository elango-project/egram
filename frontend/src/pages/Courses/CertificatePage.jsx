import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import courseService from '../../services/courseService';
import { Loader2 } from 'lucide-react';

const CertificatePage = () => {
  const { courseId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const certs = await courseService.getMyCertificates();
        const courseCert = certs.find(c => c.courseId === courseId);
        
        if (!courseCert) {
          setError('You have not earned a certificate for this course yet.');
        } else {
          setCertificate(courseCert);
        }
      } catch (err) {
        setError('Failed to load certificate data.');
      } finally {
        setLoading(false);
      }
    };
    fetchCertificate();
  }, [courseId]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  
  if (error || !certificate) return (
    <div className="text-center py-20">
      <h2 className="text-2xl text-red-600 font-bold mb-4">{error}</h2>
      <Link to={`/courses/${courseId}`} className="text-blue-600 hover:underline">Return to Course</Link>
    </div>
  );

  const date = new Date(certificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center print:hidden">
          <Link to={`/courses/${courseId}`} className="text-blue-600 hover:underline font-medium">
            &larr; Back to Course
          </Link>
          <button 
            onClick={() => window.print()} 
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-medium"
          >
            🖨️ Print / Save as PDF
          </button>
        </div>

        {/* Certificate Container */}
        <div className="bg-white p-12 border-[16px] border-double border-blue-900 shadow-2xl relative text-center print:shadow-none print:border-8">
          
          <div className="absolute top-8 right-8 text-gray-500 font-mono text-sm text-right">
            <div>Certificate No: <span className="font-bold text-gray-800">{certificate.certificateNumber}</span></div>
            <div>Verify Code: <span className="font-bold text-gray-800">{certificate.verificationCode}</span></div>
          </div>

          <div className="mt-12 mb-6">
            <h1 className="text-5xl font-serif text-blue-900 font-bold tracking-widest uppercase">Certificate of Completion</h1>
          </div>

          <div className="mb-8">
            <p className="text-xl text-gray-600 italic font-serif">This is to certify that</p>
          </div>

          <div className="mb-8 border-b-2 border-gray-300 mx-auto w-2/3 pb-2">
            <h2 className="text-4xl font-bold text-gray-800">{certificate.studentName}</h2>
          </div>

          <div className="mb-8">
            <p className="text-xl text-gray-600 italic font-serif">has successfully completed the course</p>
          </div>

          <div className="mb-12">
            <h3 className="text-3xl font-bold text-blue-800 uppercase">{certificate.courseTitle}</h3>
          </div>

          <div className="flex justify-between items-end mt-20 px-12">
            <div className="text-center w-48">
              <div className="border-b-2 border-gray-800 mb-2 pb-2">
                <span className="text-lg font-bold text-gray-800">{date}</span>
              </div>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Issue Date</p>
            </div>
            
            <div className="w-32 h-32 bg-blue-50 rounded-full border-4 border-blue-200 flex items-center justify-center shadow-inner">
              <div className="text-center">
                <span className="block text-3xl mb-1">🎓</span>
                <span className="text-sm font-bold text-blue-800 uppercase tracking-widest">Egram</span>
              </div>
            </div>

            <div className="text-center w-48">
              <div className="border-b-2 border-gray-800 mb-2 pb-2">
                <span className="text-lg font-bold text-gray-800 font-cursive text-2xl">Egram Team</span>
              </div>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Authorized Signature</p>
            </div>
          </div>
          
          <div className="mt-16 text-xs text-gray-400">
            Verify this certificate at egram.com/verify using code {certificate.verificationCode}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
