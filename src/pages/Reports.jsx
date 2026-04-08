import React, { useState, useEffect } from 'react';
import { FileText, Loader2, Search, CheckCircle, BarChart3, Users, PieChart, ShieldAlert } from 'lucide-react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const Reports = () => {
    const [selectedAcademicYear, setSelectedAcademicYear] = useState("2025-2026");
    const [selectedYear, setSelectedYear] = useState("III YEAR");
    const [selectedDept, setSelectedDept] = useState("CSE B");
    const [catType, setCatType] = useState('CAT - I');
    
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [marksData, setMarksData] = useState({});
    const [loading, setLoading] = useState(false);
    const [noData, setNoData] = useState(false);

    useEffect(() => {
        fetchReportData();
    }, [selectedAcademicYear, selectedYear, selectedDept, catType]);

    const fetchReportData = async () => {
        setLoading(true);
        setNoData(false);
        setStudents([]); 
        setMarksData({});
        setSubjects([]);

        const [dept, section] = selectedDept.split(' ');
        const config = { academicYear: selectedAcademicYear, year: selectedYear, department: dept, section, catType };
        
        try {
            // First, get student list
            const studentRes = await api.get('/students', { params: config });
            const sectionStudents = studentRes.data.students || [];
            
            // Then, get the consolidated report data
            const marksRes = await api.get('/marks/section', { params: config });
            
            if (marksRes.data.data) {
                const data = marksRes.data.data;
                setSubjects(data.subjects || []);
                setMarksData(data.scores || {});
                setStudents(sectionStudents);
                if (!data.subjects || data.subjects.length === 0) setNoData(true);
            } else {
                setNoData(true);
            }
        } catch (err) {
            console.error("Error fetching report:", err);
            setNoData(true);
        } finally {
            setLoading(false);
        }
    };

    const getArrears = (rollNo) => {
        let count = 0;
        subjects.forEach(sub => {
            const m = marksData[rollNo]?.[sub.code];
            if (m === 'AB' || (m && parseFloat(m) < 25)) count++;
        });
        return count;
    };

    const calculateStats = () => {
        if (!students.length || !subjects.length) return null;
        
        const total = students.length;
        const allClear = students.filter(s => getArrears(s.rollNumber) === 0).length;
        const failedCount = total - allClear;
        const passPct = ((allClear / total) * 100).toFixed(1);
        
        // Distribution of failures
        const distribution = {}; // 1 -> count, 2 -> count, etc.
        students.forEach(s => {
            const arrears = getArrears(s.rollNumber);
            if (arrears > 0) {
                distribution[arrears] = (distribution[arrears] || 0) + 1;
            }
        });

        return { total, allClear, failedCount, passPct, distribution };
    };

    const stats = calculateStats();

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto pb-20">
            {/* Header / Filter Bar */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-8 relative overflow-hidden">
                <div className="flex-1">
                    <h1 className="text-3xl font-black italic tracking-tighter flex items-center gap-3 text-slate-800">
                        <FileText className="text-blue-600 w-8 h-8" /> DEPARTMENT REPORTS
                    </h1>
                    <div className="flex gap-4 mt-2 italic text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">
                        <select 
                            value={selectedAcademicYear} 
                            onChange={(e) => setSelectedAcademicYear(e.target.value)}
                            className="bg-slate-50 px-3 py-1.5 rounded-lg border-none outline-none cursor-pointer focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="2024-2025">2024-2025</option>
                            <option value="2025-2026">2025-2026</option>
                        </select>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="bg-slate-50 px-3 py-1.5 rounded-lg border-none outline-none cursor-pointer focus:ring-2 focus:ring-blue-100"
                        >
                            <option>I YEAR</option><option>II YEAR</option><option>III YEAR</option><option>IV YEAR</option>
                        </select>
                        <select 
                            value={selectedDept} 
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="bg-slate-50 px-3 py-1.5 rounded-lg border-none outline-none cursor-pointer focus:ring-2 focus:ring-blue-100"
                        >
                            <option>CSE A</option><option>CSE B</option>
                        </select>
                        <select 
                            value={catType} 
                            onChange={(e) => setCatType(e.target.value)}
                            className="bg-slate-50 px-3 py-1.5 rounded-lg border-none outline-none cursor-pointer focus:ring-2 focus:ring-blue-100"
                        >
                            <option>CAT - I</option><option>CAT - II</option><option>CAT - III</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <span className="text-blue-600 font-black italic uppercase tracking-tighter">Compiling Official Records...</span>
                </div>
            ) : noData ? (
                <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-100 italic font-black text-slate-300">
                    NO ASSESSMENT DATA SYNCHRONIZED FOR THIS SELECTION.
                </div>
            ) : stats ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="md:col-span-4 bg-gradient-to-r from-blue-600 to-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                                        {selectedYear} {selectedDept}
                                    </h2>
                                    <p className="text-blue-100 font-bold uppercase tracking-widest text-[10px] mt-2 italic flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> OFFICIAL ASSESSMENT RECORD • {catType}
                                    </p>
                                </div>
                                <div className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[200px]">
                                    <span className="text-[10px] font-black uppercase text-blue-100 tracking-widest block mb-1">Status Report</span>
                                    <div className="text-3xl font-black italic tracking-tighter leading-none uppercase">{stats.passPct}% PASS</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Users className="w-5 h-5" /></div>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Total Strength</span>
                            </div>
                            <div className="text-5xl font-black italic tracking-tighter text-slate-800">{stats.total}</div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm border-t-4 border-t-green-500">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><CheckCircle className="w-5 h-5" /></div>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">All Clear</span>
                            </div>
                            <div className="text-5xl font-black italic tracking-tighter text-green-600">{stats.allClear}</div>
                            <div className="text-[10px] font-black uppercase text-slate-400 mt-2 italic">PASS %: {stats.passPct}</div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm border-t-4 border-t-red-500">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><ShieldAlert className="w-5 h-5" /></div>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Failure Count</span>
                            </div>
                            <div className="text-5xl font-black italic tracking-tighter text-red-600">{stats.failedCount}</div>
                            <div className="text-[10px] font-black uppercase text-slate-400 mt-2 italic">FAIL %: {(100 - parseFloat(stats.passPct)).toFixed(1)}</div>
                        </motion.div>
                    </div>

                    {/* Arrear Distribution Table */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] italic text-slate-500">FAILURE DISTRIBUTION ANALYSIS</h3>
                        </div>
                        <div className="p-4 overflow-x-auto">
                            <table className="w-full text-center border-collapse">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="p-4 text-[10px] font-black uppercase italic border border-white">Arrear Count</th>
                                        <th className="p-4 text-[10px] font-black uppercase italic border border-white">No. of Students</th>
                                        <th className="p-4 text-[10px] font-black uppercase italic border border-white">Visual Scale</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...Array(subjects.length)].map((_, i) => {
                                        const count = i + 1;
                                        const studentsCount = stats.distribution[count] || 0;
                                        const width = studentsCount > 0 ? (studentsCount / stats.failedCount * 100) : 0;
                                        
                                        return (
                                            <tr key={count}>
                                                <td className="p-4 text-[10px] font-black uppercase border border-slate-50 text-slate-400 italic">
                                                    Failed in {count} Subject{count > 1 ? 's' : ''}
                                                </td>
                                                <td className="p-4 font-black italic text-lg text-slate-800 border border-slate-50">
                                                    {studentsCount || '-'}
                                                </td>
                                                <td className="p-4 border border-slate-50 w-64">
                                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }} 
                                                            animate={{ width: `${width}%` }} 
                                                            className="h-full bg-blue-600 rounded-full"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Subject-Wise Report Table */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] italic text-slate-500">SUBJECT-WISE PERFORMANCE ANALYSIS</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900 text-white">
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest italic w-12">S.No</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest italic w-32">Subject Code</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest italic">Subject Title</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest italic text-center w-32">Total Passed</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest italic text-center w-32">Total Failed</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest italic text-center w-32">Pass %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjects.map((sub, idx) => {
                                        const passed = students.filter(s => {
                                            const m = marksData[s.rollNumber]?.[sub.code];
                                            return m && m !== 'AB' && parseFloat(m) >= 25;
                                        }).length;
                                        const failed = students.length - passed;
                                        const pct = (passed / students.length * 100).toFixed(1);

                                        return (
                                            <tr key={idx} className="hover:bg-slate-50 border-b border-slate-100 transition-all font-bold">
                                                <td className="px-6 py-4 text-[10px] text-slate-300 italic">{idx + 1}</td>
                                                <td className="px-6 py-4 text-xs italic text-blue-600">{sub.code}</td>
                                                <td className="px-6 py-4 text-xs text-slate-800 uppercase italic">{sub.name}</td>
                                                <td className="px-6 py-4 text-center font-black text-green-600">{passed}</td>
                                                <td className="px-6 py-4 text-center font-black text-red-600">{failed}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black italic tracking-tighter ${parseFloat(pct) > 75 ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                        {pct}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Reports;

