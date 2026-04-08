import React, { useState } from 'react';
import { Search, MapPin, GraduationCap, Calendar, CheckCircle2, AlertCircle, BookOpen, User, Hash, Trophy } from 'lucide-react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const SearchPortal = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const performSearch = async (queryTerm) => {
        if (!queryTerm) return;
        setSearchTerm(queryTerm); // update input to selected term
        setLoading(true);
        setError('');
        setResult(null);
        setShowSuggestions(false);
        
        try {
            const res = await api.get(`/marks/search/${queryTerm}`);
            if (res.data.success) {
                if (!res.data.marks || res.data.marks.length === 0) {
                    setError("No marks found for this roll number or name.");
                } else {
                    setResult(res.data);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || "Connection failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        performSearch(searchTerm);
    };

    const handleInputChange = async (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (!val) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        
        try {
            const res = await api.get('/students', { params: { search: val } });
            if (res.data.success && res.data.students) {
                setSuggestions(res.data.students);
                setShowSuggestions(true);
            }
        } catch (err) {
            console.error("Autocomplete error", err);
        }
    };


    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center">
            {/* Header section with branding */}
            <div className="w-full bg-slate-900 py-12 px-6 text-center text-white shadow-xl">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="flex items-center justify-center gap-4 mb-4">
                         <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                             <GraduationCap className="w-10 h-10" />
                         </div>
                         <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white italic">
                             Kings Assessment Search
                         </h1>
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8 italic">Continuous Assessment Test - Sessions 2024-2025 & 2025-2026</p>
                    
                    <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                        <div className="flex items-center gap-3 px-6 py-4 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-md focus-within:bg-white focus-within:text-slate-900 focus-within:border-white transition-all shadow-2xl">
                            <Search className="w-6 h-6 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Enter Roll Number or Name (e.g. Swathi)" 
                                className="bg-transparent border-none outline-none text-xl w-full text-white placeholder:text-slate-500 font-bold uppercase focus:text-slate-900"
                                value={searchTerm}
                                onChange={handleInputChange}
                                autoComplete="off"
                            />
                            <button 
                                type="submit" 
                                disabled={loading || !searchTerm}
                                className="px-8 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                            >
                                {loading ? 'FETCHING...' : 'SEARCH'}
                            </button>
                        </div>
                        
                        <AnimatePresence>
                            {showSuggestions && suggestions.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -10 }} 
                                    className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-72 overflow-y-auto text-left"
                                >
                                    {suggestions.map((student, idx) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => performSearch(student.rollNumber)} 
                                            className="flex items-center gap-4 px-6 py-4 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0 transition-all"
                                        >
                                            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
                                                {student.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 italic uppercase text-lg leading-none flex items-center flex-wrap gap-2">
                                                    {student.name}
                                                    {student.year && (
                                                        <span className="text-xs font-bold text-slate-400 not-italic">
                                                            ({student.year} {student.department} {student.section})
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase mt-1.5">
                                                    <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Roll: {student.rollNumber}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </motion.div>
            </div>

            <div className="flex-1 w-full max-w-5xl p-8 mb-20">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20 gap-4"
                        >
                            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-blue-600 font-black italic uppercase tracking-tighter">Querying Academic Archives...</span>
                        </motion.div>
                    ) : error ? (
                        <motion.div 
                            key="error"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="p-8 bg-white border border-slate-200 rounded-3xl flex flex-col items-center text-center gap-4 text-slate-600 shadow-sm"
                        >
                            <AlertCircle className="w-12 h-12 text-red-500" />
                            <h3 className="text-2xl font-black uppercase italic">{error}</h3>
                            <button onClick={() => setError('')} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase italic">Try Again</button>
                        </motion.div>
                    ) : result ? (
                        <motion.div 
                            key="result"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="space-y-8"
                        >
                            {/* Profile Bar */}
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                                <div className="relative flex flex-wrap items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white border-4 border-white shadow-2xl relative">
                                            <User className="w-12 h-12" />
                                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                                                <Trophy className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter mb-2">Student ID: {searchTerm}</h2>
                                            <div className="flex flex-wrap gap-4 text-xs font-black uppercase tracking-widest italic">
                                                <div className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                                                    Roll {searchTerm}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center min-w-[200px]">
                                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1 italic block">Performance Overview</span>
                                        <div className={`text-5xl font-black italic tracking-tighter leading-none ${result.marks.every(m => parseFloat(m.marks) >= 25) ? 'text-green-500' : 'text-red-500'}`}>
                                            {result.marks.every(m => parseFloat(m.marks) >= 25) ? 'ALL CLEAR' : 'ARREARS'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Assessment Grid (Horizontal view matching PDF layout) */}
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl mt-8">
                                <div className="px-8 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Assessment Record</h3>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kings College of Engineering</span>
                                </div>
                                <div className="overflow-x-auto p-4">
                                    {(() => {
                                        const subjectCodes = Array.from(new Set(result.marks.map(m => m.subjectCode)));
                                        const groupedByCat = {};
                                        result.marks.forEach(m => {
                                            if (!groupedByCat[m.catType]) groupedByCat[m.catType] = {};
                                            groupedByCat[m.catType][m.subjectCode] = m.marks;
                                        });
                                        const catTypes = Object.keys(groupedByCat).sort((a, b) => a.localeCompare(b));

                                        return (
                                            <table className="w-full text-left border-collapse border border-slate-800">
                                                <thead>
                                                    <tr>
                                                        <th className="px-4 py-3 text-[11px] font-bold text-slate-800 border border-slate-800 text-center uppercase">S.No</th>
                                                        <th className="px-4 py-3 text-[11px] font-bold text-slate-800 border border-slate-800 text-center uppercase whitespace-nowrap">Reg.No</th>
                                                        <th className="px-4 py-3 text-[11px] font-bold text-slate-800 border border-slate-800 uppercase whitespace-nowrap">Student Name</th>
                                                        <th className="px-4 py-3 text-[11px] font-bold text-slate-800 border border-slate-800 text-center uppercase whitespace-nowrap">Assessment</th>
                                                        {subjectCodes.map(code => (
                                                            <th key={code} className="px-4 py-3 text-[11px] font-bold text-slate-800 border border-slate-800 text-center uppercase whitespace-nowrap">{code}</th>
                                                        ))}
                                                        <th className="px-4 py-3 text-[11px] font-bold text-slate-800 border border-slate-800 text-center leading-tight uppercase">No. of<br/>subjects<br/>failed</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {catTypes.map((cat, idx) => {
                                                        const rowMarks = groupedByCat[cat];
                                                        let failCount = 0;
                                                        subjectCodes.forEach(code => {
                                                            const m = rowMarks[code];
                                                            if (m === 'AB' || (m && m !== '-' && !isNaN(parseFloat(m)) && parseFloat(m) < 25)) failCount++;
                                                        });

                                                        return (
                                                            <motion.tr 
                                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                                                                key={cat} 
                                                                className="hover:bg-slate-50 transition-all font-medium text-black"
                                                            >
                                                                <td className="px-4 py-3 text-[12px] text-center border border-slate-800">{idx + 1}</td>
                                                                <td className="px-4 py-3 text-[12px] text-center border border-slate-800">{result.rollNumber}</td>
                                                                <td className="px-4 py-3 text-[12px] uppercase whitespace-nowrap border border-slate-800">{result.studentName || searchTerm}</td>
                                                                <td className="px-4 py-3 text-[12px] text-center whitespace-nowrap border border-slate-800">{cat}</td>
                                                                {subjectCodes.map(code => {
                                                                    const m = rowMarks[code] || '-';
                                                                    const isFail = m === 'AB' || (m !== '-' && !isNaN(parseFloat(m)) && parseFloat(m) < 25);
                                                                    return (
                                                                        <td key={code} className={`px-4 py-3 text-center text-[12px] font-medium border border-slate-800 ${isFail ? 'text-black' : 'text-black'}`}>
                                                                            {m}
                                                                        </td>
                                                                    );
                                                                })}
                                                                <td className="px-4 py-3 text-center text-[12px] border border-slate-800">{failCount === 0 ? 'NIL' : failCount}</td>
                                                            </motion.tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        );
                                    })()}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="idle"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center py-24"
                        >
                            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200 border border-slate-100 shadow-sm relative">
                                <Search className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-300 uppercase italic tracking-tighter">Portal is Idle. Please Enter Access Credentials.</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 italic">Student results are verified against official academic records.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <footer className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-10 italic">
                &copy; 2026 Kings College of Engineering Assessment Cell. Authorized Entry Only.
            </footer>
        </div>
    );
};

export default SearchPortal;
