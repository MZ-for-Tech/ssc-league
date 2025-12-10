import React from "react";
import { Github, Linkedin, Mail, ArrowLeft, Users, Terminal, Cpu, Database, Globe, Layers, Trophy, Target, Zap, Activity } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function AboutPage() {
  const creators = [
    {
      name: "Ahmed Tawfik",
      role: "Concept Creator & Strategy Lead",
      id: "CMD-001",
      color: "blue",
      description: "The strategic architect of the SSC2 League. He fused advanced data science curriculum with competitive game theory to create this high-performance learning environment. The mind behind the ranking algorithms, mission structure, and tactical progression system.",
      image: "https://media.licdn.com/dms/image/v2/D5603AQH95B_WwHbj3A/profile-displayphoto-shrink_200_200/B56ZTC4FjeGoAY-/0/1738436273176?e=2147483647&v=beta&t=8etFI9HIduTsS9ZQLfMDM-HovVMPQpsG4sEaZZ13efg",
      stats: [
        { label: "Focus", value: "Game Theory" },
        { label: "Class", value: "Visionary" },
        { label: "Status", value: "Founder" } 
      ],
      links: {
        linkedin: "https://www.linkedin.com/in/ahmed-m-tawfeek",
        email: "mailto:ahmed.tawfeek2019@feps.edu.eg"
      }
    },
    {
      name: "Ezz Eldin",
      role: "Lead Engineer & Executor",
      id: "DEV-001",
      color: "cyan",
      description: "The technical architect who executed the vision. Responsible for building the platform infrastructure, coding the database triggers, and implementing the complex XP algorithms designed by leadership.",
      image: "https://i.ibb.co/DD68DVnD/ezz.jpg",
      stats: [
        { label: "Focus", value: "Execution" },
        { label: "Class", value: "Builder" },
        { label: "Stack", value: "Next.js" }
      ],
      links: {
        website: "https://ezzio.netlify.app",
        github: "https://github.com", 
        linkedin: "https://linkedin.com",
        email: "mailto:ezz.dev@example.com"
      }
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 pb-20 relative min-h-screen flex flex-col">
      
      {/* Background: Technical Grid */}
      <div className="absolute inset-0 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.1 }} 
      />

      {/* --- 1. HEADER: MISSION BRIEFING --- */}
      <div className="relative border-b border-slate-700 pb-8 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 mb-2 uppercase tracking-widest">
                    <Activity size={12} />
                    System_Overview // V2.0
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
                    Mission <span className="text-slate-500">Briefing</span>
                </h1>
            </div>
            
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 border border-slate-700 hover:border-white hover:bg-white hover:text-black text-slate-400 transition-all text-xs font-bold uppercase tracking-widest group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Return to Base
            </Link>
        </div>
      </div>

      {/* --- 2. PLATFORM DESCRIPTION (THE SYSTEM) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          {/* Text Description */}
          <div className="lg:col-span-1 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-l-2 border-cyan-500 pl-3">
                  System Directive
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm font-mono">
                  The <strong className="text-cyan-400">SSC2 League</strong> is a tactical Learning Management System (LMS) designed to gamify the data science curriculum. 
                  <br/><br/>
                  Unlike standard educational protocols, this platform tracks operative performance in real-time, rewarding consistency, accuracy, and technical proficiency with XP and Rank advancements.
              </p>
          </div>

          {/* Feature Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <FeatureCard 
                  icon={Trophy} 
                  title="Global Ranking" 
                  desc="Live competitive leaderboard tracking operative standing across the entire cohort."
                  code="RANK_SYS"
              />
              <FeatureCard 
                  icon={Target} 
                  title="Tactical Modules" 
                  desc="Structured mission intel and weekly automated assessments."
                  code="LMS_CORE"
              />
              <FeatureCard 
                  icon={Zap} 
                  title="Live Metrics" 
                  desc="Granular tracking of attendance streaks, quiz accuracy, and XP gain."
                  code="STAT_ENG"
              />
          </div>
      </div>

      {/* --- 3. PERSONNEL RECORDS (CREATORS) --- */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Users size={16} className="text-slate-500" />
                Command Staff
            </h3>
            <div className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {creators.map((creator, idx) => (
            <div 
                key={idx} 
                className="group relative bg-slate-900 border border-slate-800 p-6 hover:border-slate-600 transition-all duration-300 flex flex-col h-full"
            >
                {/* Decoration: Corner Markers */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-slate-600 group-hover:border-white transition-colors" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-slate-600 group-hover:border-white transition-colors" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-slate-600 group-hover:border-white transition-colors" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-slate-600 group-hover:border-white transition-colors" />

                <div className="flex items-start justify-between mb-6 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-4">
                        <div className={clsx(
                            "w-16 h-16 bg-slate-800 overflow-hidden border-2 transition-colors",
                            creator.color === "blue" ? "border-blue-500/50 group-hover:border-blue-400" : "border-cyan-500/50 group-hover:border-cyan-400"
                        )}>
                            <img src={creator.image} alt={creator.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        </div>
                        <div>
                            <div className="text-[10px] font-mono text-slate-500 mb-0.5">ID: {creator.id}</div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-wide">{creator.name}</h2>
                            <div className={clsx(
                                "text-xs font-bold uppercase tracking-wider mt-1",
                                creator.color === "blue" ? "text-blue-400" : "text-cyan-400"
                            )}>
                                {creator.role}
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed mb-8 flex-1 font-mono">
                    {creator.description}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {creator.stats.map((stat, i) => (
                        <div key={i} className="bg-slate-950 border border-slate-800 p-2 text-center">
                            <div className="text-[9px] text-slate-600 uppercase font-bold mb-1">{stat.label}</div>
                            <div className="text-xs text-slate-300 font-mono">{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Links */}
                <div className="flex gap-2">
                    {creator.links.website && (
                        <TechLink href={creator.links.website} icon={Globe} label="WEB" />
                    )}
                    {creator.links.github && (
                        <TechLink href={creator.links.github} icon={Github} label="GH" />
                    )}
                    {creator.links.linkedin && (
                        <TechLink href={creator.links.linkedin} icon={Linkedin} label="IN" />
                    )}
                    <TechLink href={creator.links.email} icon={Mail} label="MSG" />
                </div>
            </div>
            ))}
        </div>
      </div>

      {/* --- 4. SYSTEM ARCHITECTURE (Technical Spec Sheet) --- */}
      <div className="mt-8 pt-8 border-t border-slate-800 border-dashed">
        <div className="flex items-center gap-4 mb-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Terminal size={16} className="text-slate-500" />
                System Dependencies
            </h3>
            <div className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SpecCard icon={Globe} label="Framework" value="Next.js 16" code="APP_ROUTER" />
            <SpecCard icon={Database} label="Database" value="Supabase" code="POSTGRES_V15" />
            <SpecCard icon={Layers} label="Styling" value="Tailwind" code="UTILITY_FIRST" />
            <SpecCard icon={Cpu} label="Logic" value="TypeScript" code="STRICT_MODE" />
        </div>
      </div>

    </div>
  );
}

// --- MICRO COMPONENTS ---

function FeatureCard({ icon: Icon, title, desc, code }: { icon: any, title: string, desc: string, code: string }) {
    return (
        <div className="bg-slate-900/50 border border-slate-800 p-4 hover:border-slate-600 transition-colors group">
            <div className="flex justify-between items-start mb-3">
                <Icon size={20} className="text-cyan-500 group-hover:text-white transition-colors" />
                <span className="text-[9px] font-mono text-slate-600">{code}</span>
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">{title}</h4>
            <p className="text-[11px] text-slate-400 leading-normal">{desc}</p>
        </div>
    )
}

function TechLink({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
    return (
        <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-700 bg-slate-800/50 text-slate-400 text-xs font-bold hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all uppercase tracking-wider"
        >
            <Icon size={12} /> {label}
        </a>
    )
}

function SpecCard({ icon: Icon, label, value, code }: { icon: any, label: string, value: string, code: string }) {
    return (
        <div className="flex items-start gap-4 p-4 border border-slate-800 bg-slate-900/30">
            <div className="text-slate-600 mt-1">
                <Icon size={16} />
            </div>
            <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{label}</div>
                <div className="text-sm font-bold text-white">{value}</div>
                <div className="text-[9px] text-slate-600 font-mono mt-1">{code}</div>
            </div>
        </div>
    )
}