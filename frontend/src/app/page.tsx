import Link from 'next/link';
import { ArrowRight, Sparkles, Code2, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Navigation */}
      <nav className="absolute top-0 left-0 w-full z-50 px-6 md:px-12 py-6 flex justify-between items-center bg-transparent">
        <div className="font-bold text-xl tracking-tight text-white flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            MP
          </div>
          Mentorship Platform
        </div>
        <div className="flex gap-4 items-center">
          <Link 
            href="/login" 
            className="text-sm font-bold text-white px-6 py-2.5 rounded-full border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm shadow-sm"
          >
            Log In
          </Link>
        </div>
      </nav>

      <div className="relative z-10 w-full max-w-5xl px-6 py-12 flex flex-col items-center text-center space-y-12 mt-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-300 text-sm font-medium tracking-wide backdrop-blur-md">
          <Sparkles className="w-4 h-4" />
          <span>The Next Generation Mentorship</span>
        </div>

        {/* Hero Section */}
        <div className="space-y-6 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Accelerate Your Career with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-teal-400 to-cyan-500">
              Expert Mentorship
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-light">
            Connect with industry-leading experts, master new skills, and reach your full potential. Whether you are here to learn or to guide, your journey to excellence starts now.
          </p>
        </div>
        
        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center pt-6 w-full sm:w-auto">
          <Link 
            href="/signup" 
            className="group relative px-10 py-4 w-full sm:w-auto text-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg hover:from-emerald-400 hover:to-teal-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mt-16 text-left">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
            <div className="bg-emerald-500/20 p-3 rounded-lg w-fit mb-4 text-emerald-400">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Master Technical Skills</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Get 1-on-1 guidance on coding, architecture, and best practices from senior developers.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
            <div className="bg-teal-500/20 p-3 rounded-lg w-fit mb-4 text-teal-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Build Your Network</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Connect with professionals who have walked the path before you and expand your career opportunities.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
