import React, { useState, useEffect } from 'react';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend, 
    ArcElement,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, 
    TrendingUp, 
    AlertTriangle, 
    Target, 
    Users, 
    CheckCircle2, 
    Search,
    Loader2,
    Sparkles,
    Lightbulb,
    HelpCircle,
    ArrowUpRight
} from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Filler,
    Title,
    Tooltip,
    Legend
);

const Analytics = () => {
    // Helper: map class year to correct academic session
    const getAcademicYearForClass = (classYear) => {
        if (classYear === 'II YEAR') return '2025-2026';
        if (classYear === 'III YEAR') return '2024-2025';
        return '2025-2026';
    };

    const [selectedAcademicYear, setSelectedAcademicYear] = useState("2025-2026");
    const [selectedYear, setSelectedYear] = useState("II YEAR");
    const [selectedDept, setSelectedDept] = useState("CSE B");
    const [catType, setCatType] = useState('CAT - I');
    
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [students, setStudents] = useState([]);
    const [noData, setNoData] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, [selectedAcademicYear, selectedYear, selectedDept, catType]);

    const fetchAnalytics = async () => {
        setLoading(true);
        setNoData(false);
        setData(null); // Clear previous data
        
        try {
            const [dept, section] = selectedDept.split(' ');
            const config = { academicYear: selectedAcademicYear, year: selectedYear, department: dept, section, catType };
            
            const [studentRes, marksRes] = await Promise.all([
                api.get('/students', { params: config }),
                api.get('/marks/section', { params: config })
            ]);

            const sectionStudents = studentRes.data.students || [];
            const result = marksRes.data.data;

            if (result && result.subjects && result.subjects.length > 0 && sectionStudents.length > 0) {
                setData(result);
                setStudents(sectionStudents);
                setNoData(false);
            } else {
                setNoData(true);
            }
        } catch (err) {
            console.error("Error fetching analytics:", err);
            setNoData(true);
        } finally {
            setLoading(false);
        }
    };

    const calculateMetrics = () => {
        if (!data || !students.length) return null;

        const subjectStats = data.subjects.map(sub => {
            const scoresMap = data.scores || {};
            // Roll Numbers in data.scores might be keys
            const rawScores = students.map(s => scoresMap[s.rollNumber]?.[sub.code]);
            const passed = rawScores.filter(s => s !== 'AB' && s !== undefined && s !== '' && parseFloat(s) >= 25).length;
            const passPct = (passed / students.length) * 100;
            return { ...sub, passPct, failed: students.length - passed };
        }).sort((a, b) => a.passPct - b.passPct);

        const averagePassPct = subjectStats.reduce((acc, curr) => acc + curr.passPct, 0) / subjectStats.length;
        
        return { subjectStats, averagePassPct };
    };

    const metrics = calculateMetrics();

    const generateInsights = () => {
        if (!metrics) return [];

        const { subjectStats, averagePassPct } = metrics;
        const insights = [];

        // 1. Critical Performance Insight
        const lowest = subjectStats[0];
        if (lowest.passPct < 100) {
            insights.push({
                type: 'CRITICAL',
                icon: AlertTriangle,
                color: 'text-red-500',
                bg: 'bg-red-50',
                title: `Priority Focus: ${lowest.code}`,
                desc: `${lowest.name} has the lowest pass percentage (${lowest.passPct.toFixed(1)}%). We recommend intensive focus on this subject. Identify the ${lowest.failed} failing students and conduct extra coaching classes.`
            });
        }

        // 2. Strategic Improvement Suggestion
        if (averagePassPct < 90) {
            insights.push({
                type: 'ADVICE',
                icon: Lightbulb,
                color: 'text-amber-500',
                bg: 'bg-amber-50',
                title: 'Overall Performance Boost',
                desc: `Current overall pass percentage is ${averagePassPct.toFixed(1)}%. To improve this, implement peer-to-peer learning groups where top-performing students mentor those with consistent arrears.`
            });
        } else {
            insights.push({
                type: 'POSITIVE',
                icon: CheckCircle2,
                color: 'text-emerald-500',
                bg: 'bg-emerald-50',
                title: 'High Performance Zone',
                desc: `The section is performing exceptionally well with an average of ${averagePassPct.toFixed(1)}%. Continue current methodologies and focus on getting more students into the 45+ marks range.`
            });
        }

        // 3. Subject Optimization
        const highest = subjectStats[subjectStats.length - 1];
        insights.push({
            type: 'OPTIMIZE',
            icon: Target,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            title: `Best Practice: ${highest.code}`,
            desc: `${highest.name} has maintained a ${highest.passPct.toFixed(1)}% result. The teaching strategies used here (e.g., assignment patterns) should be modeled across other departments.`
        });

        return insights;
    };

    const getChartConfigs = () => {
        if (!metrics) return null;

        const { subjectStats } = metrics;
        const alphabetStats = [...subjectStats].sort((a,b) => a.code.localeCompare(b.code));

        return {
            bar: {
                labels: alphabetStats.map(s => s.code),
                datasets: [{
                    label: 'Pass Percentage %',
                    data: alphabetStats.map(s => s.passPct),
                    backgroundColor: alphabetStats.map(s => s.passPct < 60 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(37, 99, 235, 0.8)'),
                    borderRadius: 12,
                    barThickness: 35,
                }]
            }
        };
    };

    const insights = generateInsights();
    const charts = getChartConfigs();

    return (
        <div className="space-y-12 max-w-[1500px] mx-auto pb-24">
            {/* Filter Section */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-10">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                            <TrendingUp className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black italic tracking-tighter text-slate-800">ACADEMIC ANALYTICS</h1>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1 italic flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Intelligent Performance Analysis Active
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-4">
                    {[
                        { label: 'Session', val: selectedAcademicYear, set: setSelectedAcademicYear, items: ['2024-2025', '2025-2026'] },
                        { label: 'Year', val: selectedYear, set: setSelectedYear, items: ['I YEAR', 'II YEAR', 'III YEAR', 'IV YEAR'] },
                        { label: 'Dept', val: selectedDept, set: setSelectedDept, items: ['CSE A', 'CSE B'] },
                        { label: 'Assessment', val: catType, set: setCatType, items: ['CAT - I', 'CAT - II', 'CAT - III'] }
                    ].map((f, i) => (
                        <div key={i} className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">{f.label}</span>
                            <select 
                                value={f.val} 
                                onChange={(e) => f.set(e.target.value)} 
                                className="bg-slate-50 border-2 border-slate-100 px-6 py-3 rounded-2xl outline-none focus:border-blue-600 transition-all font-black uppercase italic text-xs cursor-pointer"
                            >
                                {f.items.map(item => <option key={item}>{item}</option>)}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-[500px] gap-8 bg-white rounded-[3rem] border border-slate-100 p-10">
                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                    <div className="text-center">
                        <span className="text-blue-600 font-black italic uppercase tracking-tighter text-2xl block">Synthesizing Records...</span>
                        <span className="text-slate-400 font-bold text-sm tracking-tight mt-2 block italic">Scanning Subject Metrics & Section Performance</span>
                    </div>
                </div>
            ) : noData ? (
                <div className="bg-white rounded-[3rem] p-32 text-center border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-8 shadow-sm">
                    <div className="p-10 bg-slate-50 rounded-full relative">
                        <Search className="w-20 h-20 text-slate-200" />
                        <HelpCircle className="w-8 h-8 text-blue-400 absolute bottom-8 right-8" />
                    </div>
                    <div className="max-w-md">
                        <span className="italic font-black text-slate-300 text-3xl uppercase tracking-tighter block mb-4">DATA NOT SYNCHRONIZED</span>
                        <p className="text-slate-400 font-bold text-sm leading-relaxed italic">
                            Please ensure marks have been entered and saved in the Students Assessment Grid for {selectedYear} ({selectedDept}).
                        </p>
                    </div>
                </div>
            ) : data && metrics ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
                    {/* Charts Module */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.02] -rotate-12 transform scale-150"><Zap className="w-64 h-64" /></div>
                            <div className="flex items-center justify-between mb-12 relative">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] italic text-slate-500 mb-2">PASS PERCENTAGE BY SUBJECT</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black italic tracking-tighter text-slate-800">{metrics.averagePassPct.toFixed(1)}%</span>
                                        <span className="text-sm font-black italic text-slate-400 uppercase tracking-tighter">Overall</span>
                                    </div>
                                </div>
                                <div className="hidden md:flex gap-4">
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-600 rounded-full"></div><span className="text-[10px] font-black italic text-slate-400 uppercase tracking-widest">Normal</span></div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span className="text-[10px] font-black italic text-slate-400 uppercase tracking-widest">Critical</span></div>
                                </div>
                            </div>
                            
                            <div className="h-[400px]">
                                {charts && <Bar 
                                    data={charts.bar} 
                                    options={{ 
                                        responsive: true, 
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false }, tooltip: { padding: 16, bodyFont: { weight: 'bold' } } },
                                        scales: {
                                            y: { beginAtZero: true, max: 100, grid: { borderDash: [5, 5], color: '#f1f5f9' }, ticks: { font: { weight: 'bold', size: 10 } } },
                                            x: { grid: { display: false }, ticks: { font: { weight: 'bold', size: 10 } } }
                                        }
                                    }} 
                                />}
                            </div>
                        </div>

                        {/* Subject Detailed Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {metrics.subjectStats.map((sub, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={idx} 
                                    className="bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-blue-600 hover:shadow-xl transition-all group group cursor-default"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <ArrowUpRight className="w-6 h-6" />
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block italic leading-none mb-1">{sub.code}</span>
                                            <h4 className="text-xl font-black italic tracking-tighter text-slate-800 uppercase">{sub.passPct.toFixed(1)}% PASS</h4>
                                        </div>
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-700 uppercase mb-4 h-8 line-clamp-2">{sub.name}</h4>
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-2">
                                        <motion.div 
                                            initial={{ width: 0 }} 
                                            animate={{ width: `${sub.passPct}%` }} 
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className={`h-full ${sub.passPct < 60 ? 'bg-red-500' : 'bg-blue-600'}`}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase italic tracking-tighter text-slate-400">
                                        <span>Failures: <span className={sub.failed > 0 ? 'text-red-500' : ''}>{sub.failed} Students</span></span>
                                        <span>Target: 100%</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* AI Intelligence Module */}
                    <div className="space-y-12">
                        <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2 group-hover:opacity-40 transition-all duration-700"></div>
                            <div className="relative">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black italic tracking-tighter">SMART INSIGHTS</h3>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Faculty Recommendations</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-8">
                                    {insights.map((insight, idx) => (
                                        <motion.div 
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.2 }}
                                            key={idx} 
                                            className={`${insight.bg} border-l-4 border-l-blue-600 p-8 rounded-[2rem] hover:scale-[1.02] transition-transform`}
                                        >
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="p-2.5 bg-white rounded-xl shadow-sm">
                                                    <insight.icon className={`w-5 h-5 ${insight.color}`} />
                                                </div>
                                                <h4 className={`font-black italic text-xs uppercase tracking-tight ${insight.color}`}>{insight.title}</h4>
                                            </div>
                                            <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">
                                                {insight.desc}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Summary Metrics */}
                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg"><Users className="w-7 h-7" /></div>
                                        <div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block italic leading-none mb-1">Total Strength</span>
                                            <h4 className="text-xl font-black italic tracking-tighter text-slate-800 uppercase">ANALYZED</h4>
                                        </div>
                                    </div>
                                    <span className="text-4xl font-black italic tracking-tighter text-slate-800">{students.length}</span>
                                </div>

                                <div className="flex items-center justify-between p-8 bg-blue-600 rounded-[2rem] text-white shadow-xl shadow-blue-100 hover:bg-blue-700 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md"><Target className="w-7 h-7" /></div>
                                        <div>
                                            <span className="text-[9px] font-black text-blue-100 uppercase tracking-widest block italic leading-none mb-1">Section Success</span>
                                            <h4 className="text-xl font-black italic tracking-tighter uppercase">OVERALL %</h4>
                                        </div>
                                    </div>
                                    <span className="text-4xl font-black italic tracking-tighter">{metrics.averagePassPct.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Analytics;
