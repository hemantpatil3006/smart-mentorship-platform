import Link from 'next/link';
import { ArrowRight, Sparkles, Code2, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="absolute top-0 left-0 w-full z-50 px-4 sm:px-12 py-4 sm:py-6 flex justify-between items-center bg-transparent">
        <div className="font-bold text-lg sm:text-xl tracking-tight text-white flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[10px] sm:text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0">
            MP
          </div>
          <span className="hidden min-[400px]:inline whitespace-nowrap">Mentorship Platform</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-bold text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm shadow-sm shrink-0 min-w-[80px] text-center"
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
        <div className="space-y-4 md:space-y-6 max-w-4xl px-2">
          <h1 className="text-2xl sm:text-4xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.2] md:leading-[1.15]">
            Accelerate Your Career with <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-teal-400 to-cyan-500">
              Expert Mentorship
            </span>
          </h1>
          <p className="text-xs sm:text-base md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-light">
            Connect with industry-leading experts, master new skills, and reach your full potential. Whether you are here to learn or to guide, your journey to excellence starts now.
          </p>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center pt-2 md:pt-6 w-full sm:w-auto">
          <Link
            href="/signup"
            className="group relative px-6 py-3 md:px-10 md:py-4 w-auto text-center rounded-lg md:rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm md:text-lg hover:from-emerald-400 hover:to-teal-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
          >
            Start Your Journey
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 w-full max-w-3xl mt-8 md:mt-16 text-left px-2">
          <div className="p-3 sm:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
            <div className="bg-emerald-500/20 p-2 sm:p-3 rounded-lg w-fit mb-2 sm:mb-4 text-emerald-400">
              <Code2 className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-xs sm:text-xl font-bold text-white mb-1 sm:mb-2">Master Skills</h3>
            <p className="text-slate-400 text-[10px] sm:text-sm leading-tight sm:leading-relaxed">1-on-1 coding guidance from experts.</p>
          </div>
          <div className="p-3 sm:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
            <div className="bg-teal-500/20 p-2 sm:p-3 rounded-lg w-fit mb-2 sm:mb-4 text-teal-400">
              <Users className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-xs sm:text-xl font-bold text-white mb-1 sm:mb-2">Network</h3>
            <p className="text-slate-400 text-[10px] sm:text-sm leading-tight sm:leading-relaxed">Connect with top industry professionals.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
