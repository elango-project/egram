import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import courseService from '../../services/courseService';
import { Loader2, ArrowLeft, Printer, Download, Share2, Award, QrCode } from 'lucide-react';
import Button from '../../components/ui/Button';

const CertificatePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="text-slate-500 font-medium">Loading your credential...</p>
      </div>
    );
  }
  
  if (error || !certificate) return (
    <div className="text-center py-20 flex flex-col items-center">
      <h2 className="text-2xl text-slate-900 font-bold mb-2">Certificate Unavailable</h2>
      <p className="text-slate-500 mb-6">{error}</p>
      <Button onClick={() => navigate(`/dashboard/courses/${courseId}`)}>Return to Course</Button>
    </div>
  );

  const date = new Date(certificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 flex flex-col">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .certificate-container, .certificate-container * {
              visibility: visible;
            }
            .certificate-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
              box-shadow: none !important;
            }
            @page {
              size: landscape;
              margin: 0;
            }
          }
        `}
      </style>

      <div className="max-w-6xl mx-auto w-full">
        {/* Action Bar (Hidden when printing) */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/dashboard/courses/${courseId}`)}
            icon={<ArrowLeft size={18} />}
          >
            Back to Course
          </Button>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => window.print()}
              icon={<Printer size={18} />}
            >
              Print
            </Button>
            <Button 
              variant="outline"
              icon={<Download size={18} />}
            >
              PDF
            </Button>
            <Button 
              className="bg-[#0A66C2] hover:bg-[#084e96] text-white border-none"
              icon={<Share2 size={18} />}
            >
              Add to LinkedIn
            </Button>
          </div>
        </div>

        {/* Certificate Container */}
        <div className="certificate-container bg-white p-4 sm:p-8 md:p-12 shadow-2xl rounded-sm aspect-[1.414/1] relative overflow-hidden mx-auto max-w-5xl text-center border border-slate-200">
          {/* Gold Decorative Border */}
          <div className="absolute inset-4 sm:inset-6 border-[8px] sm:border-[12px] border-double border-[#D4AF37] pointer-events-none z-10" />
          <div className="absolute inset-2 sm:inset-3 border border-[#D4AF37] pointer-events-none z-10" />
          <div className="absolute inset-7 sm:inset-10 border border-[#D4AF37]/50 pointer-events-none z-10" />
          
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none flex items-center justify-center -z-10">
            <Award size={600} />
          </div>

          <div className="relative z-20 h-full flex flex-col justify-between py-8">
            
            {/* Top Meta Info */}
            <div className="flex justify-between items-start px-8">
              <div className="text-left text-[#D4AF37]">
                <Award size={48} className="mb-2" />
                <div className="font-bold tracking-widest uppercase text-sm">Egram Learning</div>
              </div>
              <div className="text-right font-mono text-xs text-slate-500">
                <div>Certificate No. <span className="font-bold text-slate-800">{certificate.certificateNumber}</span></div>
                <div>Verification Code: <span className="font-bold text-slate-800">{certificate.verificationCode}</span></div>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-slate-900 font-bold uppercase tracking-widest mb-6">
                Certificate
              </h1>
              <h2 className="text-xl sm:text-2xl text-[#D4AF37] font-serif italic tracking-widest uppercase mb-12">
                of Completion
              </h2>
              
              <p className="text-slate-500 uppercase tracking-widest text-sm font-medium mb-6">
                This is to certify that
              </p>
              
              <div className="inline-block border-b border-slate-300 px-12 pb-2 mb-8">
                <h3 className="text-4xl sm:text-5xl font-serif text-slate-900 font-bold italic">
                  {certificate.studentName}
                </h3>
              </div>

              <p className="text-slate-500 uppercase tracking-widest text-sm font-medium mb-6">
                has successfully completed the program
              </p>
              
              <h4 className="text-2xl sm:text-3xl font-bold text-slate-900 px-8 max-w-3xl mx-auto leading-tight">
                {certificate.courseTitle}
              </h4>
            </div>

            {/* Bottom Signatures */}
            <div className="flex justify-between items-end px-12 mt-12">
              <div className="text-center w-48">
                <div className="border-b border-slate-400 mb-2 pb-2">
                  <span className="text-lg font-bold text-slate-800">{date}</span>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Issue Date</p>
              </div>
              
              <div className="flex flex-col items-center">
                 <div className="w-24 h-24 border-2 border-[#D4AF37] rounded flex items-center justify-center bg-white mb-2 p-1">
                   <QrCode className="w-full h-full text-slate-800" />
                 </div>
                 <p className="text-[10px] text-slate-400 uppercase font-mono text-center max-w-[120px]">Scan to verify authenticity</p>
              </div>

              <div className="text-center w-48">
                <div className="border-b border-slate-400 mb-2 pb-2 h-10 flex items-end justify-center relative">
                  {/* Mock Signature graphic */}
                  <span className="font-serif text-3xl text-slate-800 italic absolute -bottom-1 rotate-[-5deg]">Dr. E. Gram</span>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lead Instructor</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
