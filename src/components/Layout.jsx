import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    BarChart3, 
    BookOpen, 
    Users, 
    FileText, 
    LogOut, 
    Menu, 
    X, 
    User,
    ChevronRight,
    Search,
    AlertCircle,
    Trophy,
    Calendar,
    ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const SidebarItem = ({ to, icon: Icon, label, collapsed }) => (
    <NavLink 
        to={to} 
        className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
    >
        <Icon className="w-5 h-5 min-w-[20px]" />
        {!collapsed && <span className="font-medium">{label}</span>}
    </NavLink>
);

const GlobalSearchModal = ({ isOpen, onClose, loading, error, result, searchTerm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-20 px-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto w-full">
            <div className="w-full max-w-5xl bg-[#f8fafc] rounded-[2.5rem] p-6 shadow-2xl relative mb-20 animate-in fade-in zoom-in duration-200">
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 shadow-sm transition-all z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex-1 w-full p-4">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-blue-600 font-black italic uppercase tracking-tighter">Querying Academic Archives...</span>
                            </motion.div>
                        ) : error ? (
                            <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-8 bg-white border border-slate-200 rounded-3xl flex flex-col items-center text-center gap-4 text-slate-600 shadow-sm">
                                <AlertCircle className="w-12 h-12 text-red-500" />
                                <h3 className="text-2xl font-black uppercase italic">{error}</h3>
                            </motion.div>
                        ) : result ? (
                            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
                                {/* Compact Profile Bar */}
                                <div className="bg-slate-900 rounded-[2rem] p-8 border-4 border-white shadow-2xl overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="relative flex flex-wrap items-center justify-between gap-6">
                                        <div className="flex items-center gap-8">
                                            <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center text-white border-2 border-white/20 shadow-inner">
                                                <User className="w-12 h-12" />
                                            </div>
                                            <div>
                                                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2 leading-none">{result.studentName}</h2>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-5 py-1.5 bg-blue-600 text-white text-xs font-black uppercase tracking-widest italic rounded-full shadow-lg shadow-blue-900/50">
                                                        ROLL: {result.rollNumber}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 text-center min-w-[200px]">
                                            <span className="text-[10px] uppercase font-black text-blue-300 tracking-[0.3em] mb-2 block italic">GLOBAL STATUS</span>
                                            <div className={`text-4xl font-black italic tracking-tighter leading-none ${result.marks.every(m => m.marks === 'AB' ? false : parseFloat(m.marks) >= 25) ? 'text-green-400' : 'text-red-500'}`}>
                                                {result.marks.every(m => m.marks === 'AB' ? false : parseFloat(m.marks) >= 25) ? 'ALL CLEAR' : 'ARREARS'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Grouped Marks by CAT */}
                                {['CAT - I', 'CAT - II', 'CAT - III'].map((cat, catIdx) => {
                                    const catMarks = result.marks.filter(m => m.catType === cat);
                                    return (
                                        <div key={catIdx} className="space-y-6">
                                            <div className="flex items-center gap-6 px-4">
                                                <div className="h-0.5 flex-1 bg-slate-200"></div>
                                                <h3 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter flex items-center gap-4">
                                                    <Calendar className="w-8 h-8 text-blue-600" />
                                                    {cat}
                                                </h3>
                                                <div className="h-0.5 flex-1 bg-slate-200"></div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                                {catMarks.length > 0 ? (
                                                    catMarks.map((m, mIdx) => (
                                                        <div key={mIdx} className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm hover:border-blue-600 hover:shadow-xl transition-all group flex flex-col items-center text-center">
                                                            <span className="text-[8px] font-black text-slate-400 uppercase italic mb-1 tracking-wider">{m.subjectCode}</span>
                                                            <div className={`text-2xl font-black italic tracking-tighter mb-2 leading-none ${m.marks === 'AB' || parseFloat(m.marks) < 25 ? 'text-red-600' : 'text-slate-800'}`}>
                                                                {m.marks || '--'}
                                                            </div>
                                                            <div className="h-0.5 w-10 bg-slate-100 group-hover:bg-blue-600 transition-colors mb-2"></div>
                                                            <span className="text-[9px] font-black text-blue-600 italic uppercase truncate w-full px-1">{m.subjectName}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    [1,2,3,4,5,6,7].map(i => (
                                                        <div key={i} className="bg-slate-50/50 p-5 rounded-[1.5rem] border border-slate-100 flex flex-col items-center justify-center opacity-40 grayscale">
                                                             <span className="text-2xl font-black text-slate-300">--</span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const performSearch = async (queryTerm) => {
        if (!queryTerm) return;
        setSearchQuery(queryTerm);
        setShowSuggestions(false);
        setIsSearchOpen(true);
        setLoading(true);
        setError('');
        setResult(null);
        
        try {
            const res = await api.get(`/marks/search/${queryTerm}`);
            if (res.data.success) {
                if (!res.data.marks || res.data.marks.length === 0) {
                    setError("No marks found for this query.");
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
        if (e.key === 'Enter' && searchQuery.trim()) {
            performSearch(searchQuery.trim());
        }
    };

    const handleInputChange = async (e) => {
        const val = e.target.value;
        setSearchQuery(val);
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
        <>
            <GlobalSearchModal 
                isOpen={isSearchOpen} 
                onClose={() => setIsSearchOpen(false)}
                loading={loading}
                error={error}
                result={result}
                searchTerm={searchQuery}
            />
            <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between">
                <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
                    <Menu className="w-6 h-6" />
                </button>
                
                <div className="relative">
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 rounded-full w-96 transition-all">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search students, subjects... (Press Enter)" 
                            className="bg-transparent border-none outline-none text-sm w-full"
                            value={searchQuery}
                            onChange={handleInputChange}
                            onKeyDown={handleSearch}
                            autoComplete="off"
                        />
                    </div>
                    
                    <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 5 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: 5 }} 
                                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-[100] max-h-64 overflow-y-auto"
                            >
                                {suggestions.map((student, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => performSearch(student.rollNumber)} 
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-all"
                                    >
                                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs uppercase">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm leading-tight uppercase flex items-center flex-wrap gap-1">
                                                {student.name}
                                                {student.year && (
                                                    <span className="text-[10px] text-slate-400 not-italic">
                                                        ({student.year} {student.department} {student.section})
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                                                <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Roll: {student.rollNumber}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-black text-slate-800 uppercase italic">
                            {(user?.role === 'admin' || user?.role === 'staff') ? 'KCE ADMIN / STAFFS' : user?.name}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 shadow-sm leading-none">
                            {user?.role}
                        </span>
                    </div>
                    
                    <div className="relative group">
                        <button className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <User className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 font-semibold rounded-lg transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden md:inline">Logout</span>
                    </button>
                </div>
            </header>
        </>
    );
};

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    const { user } = useAuth();
    const menuItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/subjects', icon: BookOpen, label: 'Subjects' },
        { to: '/students', icon: Users, label: 'Students' },
        { to: '/individual-report', icon: ClipboardList, label: 'Individual Report' },
        { to: '/reports', icon: FileText, label: 'Reports' },
        { to: '/timetable', icon: Calendar, label: 'Time Table' },
    ].filter(item => {
        if (user?.role === 'student') {
            return ['/dashboard', '/timetable'].includes(item.to);
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 transition-all duration-300 transform ${sidebarOpen ? 'w-64 translate-x-0' : 'w-20 translate-x-0 lg:translate-x-0 -translate-x-full lg:w-20'}`}>
                <div className="h-20 flex items-center px-6 border-b border-slate-200 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-sm border border-slate-100">
                             <img src="/images.jpg" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        {sidebarOpen && (
                            <div className="flex flex-col leading-tight">
                                <span className="font-black text-[13px] tracking-tighter text-slate-800 uppercase italic">CAT ASSESSMENT MARKS</span>
                                <span className="font-bold text-[11px] tracking-[0.2em] text-blue-600 uppercase">/ PORTAL</span>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="p-4 space-y-2 mt-4">
                    {menuItems.map((item) => (
                        <SidebarItem 
                            key={item.to} 
                            to={item.to} 
                            icon={item.icon} 
                            label={item.label} 
                            collapsed={!sidebarOpen} 
                        />
                    ))}
                </nav>

                <div className="absolute bottom-6 left-0 w-full px-6">
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full flex items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
                <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                
                <div className="p-6 md:p-10 max-w-7xl mx-auto">
                    <motion.div 
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
