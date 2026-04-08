import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';
import api from '../api';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex items-center justify-between group overflow-hidden relative"
    >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-700">
            <Icon className="w-48 h-48" />
        </div>
        <div className="relative">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1 italic">{title}</p>
            <h3 className="text-5xl font-black italic tracking-tighter text-slate-800 leading-none">{value}</h3>
            {subtitle && (
                <div className="mt-3 text-[10px] font-black uppercase text-slate-400 italic tracking-widest flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                   {subtitle}
                </div>
            )}
        </div>
        <div className={`p-5 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600 relative`}>
            <Icon className="w-8 h-8" />
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [selectedAcademicYear, setSelectedAcademicYear] = useState("2025-2026");
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalSubjects: 0,
        passPercentage: 0,
        failCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/marks/stats', { params: { academicYear: selectedAcademicYear } });
                if (res.data.success) {
                    setStats(res.data.stats);
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
        // Auto-refresh every 30 seconds for live updates
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [selectedAcademicYear]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-600 font-black italic uppercase tracking-tighter text-xl">Aggregating Institutional Data...</span>
        </div>
    );

    return (
        <div className="space-y-12 max-w-[1400px] mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 bg-white p-10 rounded-[3rem] border border-slate-200">
                <div>
                    <h1 className="text-5xl font-black italic tracking-tighter text-slate-800 uppercase mb-2">Academic Overview</h1>
                    <div className="flex items-center gap-4">
                        <select 
                            value={selectedAcademicYear} 
                            onChange={(e) => setSelectedAcademicYear(e.target.value)}
                            className="bg-blue-50 text-blue-600 px-6 py-2 rounded-[2rem] border-none outline-none font-black italic tracking-tighter uppercase text-sm cursor-pointer hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-100"
                        >
                            <option value="2024-2025">2024-2025</option>
                            <option value="2025-2026">2025-2026</option>
                        </select>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[9px] italic flex items-center gap-2">
                            <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 
                            Unified Repository Tracking
                        </p>
                    </div>
                </div>
                <div className="bg-slate-900 px-8 py-5 rounded-[2rem] text-white flex items-center gap-4 shadow-2xl shadow-slate-900/20">
                    <div className="text-right">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block italic leading-none mb-1">Session Selected</span>
                        <span className="text-xl font-black italic tracking-tighter uppercase whitespace-nowrap">{selectedAcademicYear}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard 
                    title="Total Students" 
                    value={stats.totalStudents} 
                    icon={Users} 
                    color="bg-blue-600" 
                    subtitle="Integrated All-Section Strength"
                />
                <StatCard 
                    title="Active Subjects" 
                    value={stats.totalSubjects} 
                    icon={BookOpen} 
                    color="bg-indigo-600" 
                    subtitle="Global CSE Curriculum"
                />
                <StatCard 
                    title="Pass Percentage" 
                    value={`${stats.passPercentage}%`} 
                    icon={CheckCircle2} 
                    color="bg-green-600" 
                    subtitle="Overall Success Rate"
                />
                <StatCard 
                    title="Fail Count" 
                    value={stats.failCount} 
                    icon={AlertCircle} 
                    color="bg-red-600" 
                    subtitle="Total Student Arrears"
                />
            </div>

            {/* Visual Section Divider */}
            <div className="pt-10 border-t border-slate-200">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700"></div>
                   <div className="relative max-w-2xl">
                       <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-6 flex items-center gap-4">
                           <Target className="w-10 h-10" /> INSTITUTIONAL PERFORMANCE
                       </h2>
                       <p className="text-blue-100 text-lg font-bold leading-relaxed italic mb-8">
                           "Tracking the progress of autonomous excellence across all departments. This dashboard provides 
                           a consolidated view of student performance, enabling staff to make data-driven decisions."
                       </p>
                       <div className="flex gap-10">
                           <div className="flex flex-col">
                               <span className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-1">Sections</span>
                               <span className="text-2xl font-black italic tracking-tighter whitespace-nowrap">II & III Year (A/B)</span>
                           </div>
                           <div className="flex flex-col border-l border-white/20 pl-10">
                               <span className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-1">Last Update</span>
                               <span className="text-2xl font-black italic tracking-tighter whitespace-nowrap">{new Date().toLocaleTimeString()}</span>
                           </div>
                       </div>
                   </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
