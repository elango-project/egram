import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, CheckCircle, GraduationCap, Briefcase, Award, ArrowRight, Star } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Section from '../components/layout/Section';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import GlassCard from '../components/ui/GlassCard';
import { animations } from '../theme/animations';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-hidden">
      <Navbar />

      {/* SECTION 1: HERO */}
      <Section className="pt-24 pb-32 md:pt-32 md:pb-40 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-indigo-500/10 blur-[100px] rounded-full -z-10" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full -z-10" />
        <div className="absolute top-40 left-0 w-96 h-96 bg-violet-500/10 blur-[100px] rounded-full -z-10" />

        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={animations.staggerContainer}
              className="max-w-2xl"
            >
              <motion.div variants={animations.staggerItem} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium text-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Egram V1.0 is now live
              </motion.div>
              
              <motion.h1 variants={animations.staggerItem} className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6">
                Learn Skills.<br/>
                Build Projects.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500">Get Hired.</span>
              </motion.h1>
              
              <motion.p variants={animations.staggerItem} className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">
                Master in-demand tech skills, earn verified certificates, and discover jobs and internships — all in one platform.
              </motion.p>
              
              <motion.div variants={animations.staggerItem} className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button variant="gradient" size="lg" className="w-full sm:w-auto group">
                    Start Learning
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white">
                    Explore Courses
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Floating Hero UI Elements */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative h-[500px] hidden lg:block"
            >
              {/* Main Dashboard Mockup */}
              <div className="absolute top-10 right-0 w-[450px] h-[320px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="w-full h-6 bg-slate-50 rounded-md mx-4" />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="h-20 bg-indigo-50 rounded-xl" />
                  <div className="h-20 bg-violet-50 rounded-xl" />
                  <div className="h-20 bg-cyan-50 rounded-xl" />
                </div>
                <div className="h-32 bg-slate-50 rounded-xl" />
              </div>

              {/* Floating Cards */}
              <motion.div 
                variants={animations.float}
                initial="initial"
                animate="animate"
                className="absolute top-0 right-[400px] z-20"
              >
                <GlassCard className="w-48 py-3 px-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle className="text-emerald-600" size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Java OOP</div>
                      <div className="text-xs text-emerald-600 font-medium">Completed</div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div 
                variants={animations.float}
                initial="initial"
                animate="animate"
                style={{ animationDelay: '1s' }}
                className="absolute bottom-10 right-10 z-30"
              >
                <GlassCard className="w-56 py-3 px-4 shadow-xl border-t-4 border-t-violet-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-violet-100 flex items-center justify-center">
                      <Briefcase className="text-violet-600" size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Frontend Intern</div>
                      <div className="text-xs text-slate-500">85% Skill Match</div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

            </motion.div>
          </div>
        </Container>
      </Section>

      {/* SECTION 2: METRICS */}
      <Section className="py-12 border-y border-slate-200 bg-white">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100 text-center">
            <div>
              <div className="text-4xl font-extrabold text-indigo-600">500+</div>
              <div className="text-sm font-medium text-slate-500 mt-2 uppercase tracking-wide">Learning Videos</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-violet-600">100+</div>
              <div className="text-sm font-medium text-slate-500 mt-2 uppercase tracking-wide">Courses</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-cyan-600">1k+</div>
              <div className="text-sm font-medium text-slate-500 mt-2 uppercase tracking-wide">Assessments</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-emerald-600">50+</div>
              <div className="text-sm font-medium text-slate-500 mt-2 uppercase tracking-wide">Partner Companies</div>
            </div>
          </div>
        </Container>
      </Section>

      {/* SECTION 4.5: PLATFORM FEATURES GRID */}
      <Section className="bg-slate-50">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Everything you need to succeed</h2>
            <p className="text-lg text-slate-600">A complete ecosystem designed to take you from a beginner to a hired professional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <GraduationCap size={24} />, title: 'Structured Paths', desc: 'Follow curated curriculums designed by industry experts.', color: 'text-indigo-600', bg: 'bg-indigo-100' },
              { icon: <Play size={24} />, title: 'Short Learning Reels', desc: 'Learn complex concepts in under 60 seconds.', color: 'text-pink-600', bg: 'bg-pink-100' },
              { icon: <Briefcase size={24} />, title: 'Full Courses', desc: 'Deep-dive into comprehensive long-form video courses.', color: 'text-violet-600', bg: 'bg-violet-100' },
              { icon: <CheckCircle size={24} />, title: 'Assessments', desc: 'Test your knowledge with rigorous topic quizzes and exams.', color: 'text-cyan-600', bg: 'bg-cyan-100' },
              { icon: <Award size={24} />, title: 'Certificates', desc: 'Earn verifiable credentials to showcase on your LinkedIn.', color: 'text-amber-600', bg: 'bg-amber-100' },
              { icon: <Briefcase size={24} />, title: 'Placement Hub', desc: 'Apply directly to exclusive jobs and internships.', color: 'text-emerald-600', bg: 'bg-emerald-100' }
            ].map((feature, idx) => (
              <Card key={idx} hover padding="p-8">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.bg} ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* SECTION 4: PRODUCT SHOWCASE */}
      <Section className="bg-white overflow-hidden">
        <Container>
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
            <div className="flex-1 lg:pr-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Interactive Course Dashboard</h2>
              <p className="text-lg text-slate-600 mb-6">
                Track your progress, resume where you left off, and manage all your enrolled courses in one beautifully designed workspace.
              </p>
              <ul className="space-y-4">
                {['Real-time progress tracking', 'Instant access to materials', 'Gamified milestones'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle className="text-indigo-600" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full">
              <div className="bg-gradient-to-tr from-indigo-100 to-indigo-50 p-6 md:p-8 rounded-3xl">
                <div className="w-full aspect-[4/3] bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 font-medium overflow-hidden relative">
                  {/* Mock Screenshot Placeholder */}
                  <div className="absolute top-0 left-0 w-full h-12 border-b border-slate-100 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200" /><div className="w-3 h-3 rounded-full bg-slate-200" /><div className="w-3 h-3 rounded-full bg-slate-200" />
                  </div>
                  <div className="absolute top-16 left-6 w-48 h-8 bg-slate-100 rounded-md" />
                  <div className="absolute top-32 left-6 right-6 h-40 bg-slate-50 rounded-xl" />
                  <span className="z-10">Course Dashboard UI</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="flex-1 lg:pl-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Seamless Placement Hub</h2>
              <p className="text-lg text-slate-600 mb-6">
                Connect directly with top employers. Browse curated jobs and internships that perfectly match your newly acquired skills.
              </p>
              <ul className="space-y-4">
                {['One-click applications', 'Application status tracking', 'Tailored recommendations'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle className="text-emerald-600" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full">
              <div className="bg-gradient-to-tr from-emerald-100 to-emerald-50 p-6 md:p-8 rounded-3xl">
                <div className="w-full aspect-[4/3] bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 font-medium overflow-hidden relative">
                   <div className="absolute top-0 left-0 w-full h-12 border-b border-slate-100 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200" /><div className="w-3 h-3 rounded-full bg-slate-200" /><div className="w-3 h-3 rounded-full bg-slate-200" />
                  </div>
                  <div className="absolute top-20 left-6 right-6 flex gap-4">
                    <div className="flex-1 h-32 bg-slate-50 rounded-xl border border-slate-100" />
                    <div className="flex-1 h-32 bg-slate-50 rounded-xl border border-slate-100" />
                  </div>
                  <span className="z-10">Jobs Portal UI</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* SECTION 5: LEARNING JOURNEY */}
      <Section className="bg-slate-900 text-white" dark>
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Your Path to Success</h2>
            <p className="text-lg text-slate-400">The proven roadmap from enrollment to your first day on the job.</p>
          </div>
          
          <div className="max-w-4xl mx-auto relative">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-800 -translate-x-1/2" />
            {[
              { title: 'Enroll', desc: 'Choose a career path and enroll in a course.', icon: '1' },
              { title: 'Learn', desc: 'Watch reels and deep-dive videos.', icon: '2' },
              { title: 'Practice', desc: 'Pass quizzes to unlock the final assessment.', icon: '3' },
              { title: 'Certificate', desc: 'Ace the exam and earn your credential.', icon: '4' },
              { title: 'Placement', desc: 'Apply to jobs directly on the platform.', icon: '5' },
            ].map((step, i) => (
              <div key={i} className={`flex flex-col md:flex-row items-center gap-8 mb-12 relative ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className={`flex-1 w-full ${i % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                  <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400">{step.desc}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-indigo-600 border-4 border-slate-900 flex items-center justify-center font-bold z-10 shrink-0">
                  {step.icon}
                </div>
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* SECTION 6: TESTIMONIALS */}
      <Section className="bg-slate-50">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Student Success Stories</h2>
            <p className="text-lg text-slate-600">Join thousands of others who have transformed their careers with Egram.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah Jenkins', role: 'Software Engineer at TechCorp', quote: 'Egram\'s Java OOP course gave me the exact skills I needed to pass my technical interviews.' },
              { name: 'Michael Chen', role: 'Frontend Intern at StartupX', quote: 'The short reels made learning React so much easier to digest compared to 10-hour tutorials.' },
              { name: 'Priya Patel', role: 'Data Analyst at DataSys', quote: 'I loved the seamless transition from earning my certificate to immediately applying for jobs.' },
            ].map((t, i) => (
              <GlassCard key={i} className="p-8 relative">
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                </div>
                <p className="text-slate-700 font-medium mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </Container>
      </Section>

      {/* SECTION 7: CTA */}
      <Section className="bg-white pb-32">
        <Container>
          <div className="bg-brand-gradient rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to accelerate your career?</h2>
              <p className="text-xl text-indigo-100 mb-10">Join Egram today and get access to premium courses, verified certificates, and exclusive job opportunities.</p>
              <Link to="/register">
                <Button 
                  size="lg" 
                  variant="ghost"
                  className="bg-white text-indigo-600 font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl px-8 py-4 text-lg"
                >
                  Start Learning
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

    </div>
  );
};

export default Home;
