import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, Edit2, Search, X, CheckCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Subjects = () => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [formData, setFormData] = useState({ name: '', code: '', shortName: '', year: 'III YEAR' });
    const [successMsg, setSuccessMsg] = useState('');

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/subjects');
            setSubjects(res.data.subjects || []);
        } catch (err) {
            console.error("Error fetching subjects:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSubject) {
                await api.put(`/subjects/${editingSubject._id}`, formData);
                setSuccessMsg('Subject updated successfully!');
            } else {
                await api.post('/subjects', formData);
                setSuccessMsg('Subject added successfully!');
            }
            fetchSubjects();
            setShowModal(false);
            setEditingSubject(null);
            setFormData({ name: '', code: '', shortName: '', year: 'III YEAR' });
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to save subject");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) return;
        try {
            await api.delete(`/subjects/${id}`);
            fetchSubjects();
            setSuccessMsg('Subject deleted');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            alert("Failed to delete subject");
        }
    };

    const filteredSubjects = subjects.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const secondYearSubjects = filteredSubjects.filter(s => s.year === 'II YEAR');
    const thirdYearSubjects = filteredSubjects.filter(s => s.year === 'III YEAR');
    const otherSubjects = filteredSubjects.filter(s => s.year !== 'II YEAR' && s.year !== 'III YEAR');

    const renderTable = (title, data) => (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 uppercase italic tracking-tight">{title}</h2>
                </div>
                <span className="text-xs font-bold uppercase text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    {data.length} Subjects
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-max">
                    <thead className="bg-white border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-slate-400">S.No</th>
                            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-slate-400">Subject Code</th>
                            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-slate-400">Short Name</th>
                            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-slate-400">Subject Name</th>
                            {user?.role === 'hod' && <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-slate-400 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                             <tr><td colSpan="4" className="p-8 text-center text-slate-400 font-medium italic">Loading subjects...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-slate-400 font-medium italic">No subjects configured.</td></tr>
                        ) : data.map((s, idx) => (
                            <tr key={s._id || s.code} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4 border-r border-slate-50 text-sm font-semibold text-slate-400">{idx + 1}</td>
                                <td className="px-6 py-4 border-r border-slate-50 text-sm font-black text-blue-600 uppercase tracking-widest">{s.code}</td>
                                <td className="px-6 py-4 border-r border-slate-50 text-[11px] font-black italic text-slate-400 uppercase tracking-tighter">{s.shortName || '-'}</td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-800 uppercase">{s.name}</td>
                                {user?.role === 'hod' && (
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => { setEditingSubject(s); setFormData({ name: s.name, code: s.code, shortName: s.shortName || '', year: s.year || 'III YEAR' }); setShowModal(true); }}
                                                className="p-2 hover:bg-blue-100 text-blue-500 rounded-xl transition-all"
                                                title="Edit Subject"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(s._id)}
                                                className="p-2 hover:bg-red-100 text-red-500 rounded-xl transition-all"
                                                title="Delete Subject"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black uppercase italic text-slate-800 tracking-tighter">Subject Management</h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Configure academic subjects by semester.</p>
                </div>
                {user?.role === 'hod' && (
                    <button 
                        onClick={() => { setEditingSubject(null); setFormData({ name: '', code: '', shortName: '', year: 'III YEAR' }); setShowModal(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase italic tracking-widest rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        New Subject
                    </button>
                )}
            </div>

            {successMsg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100 flex items-center gap-3 shadow-sm">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="font-bold uppercase tracking-widest text-xs">{successMsg}</span>
                </motion.div>
            )}

            <div className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-xl w-full focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
                <Search className="w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Locate subject by name or code..." 
                    className="bg-transparent border-none outline-none text-sm w-full font-bold uppercase text-slate-700 placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="mt-8">
                {renderTable("Second Year (SEM 4)", secondYearSubjects)}
                {renderTable("Third Year (SEM 06)", thirdYearSubjects)}
                
                {/* Fallback for oddly configured subjects */}
                {otherSubjects.length > 0 && renderTable("Other Subjects", otherSubjects)}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">{editingSubject ? 'Update Subject' : 'New Subject'}</h3>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-400 hover:text-red-500 transition-all hover:border-red-200 relative z-10">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 mb-2 ml-1 uppercase tracking-widest">Academic Year</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold uppercase text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 appearance-none transition-all"
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        >
                                            <option value="II YEAR">Second Year (SEM 4)</option>
                                            <option value="III YEAR">Third Year (SEM 06)</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 mb-2 ml-1 uppercase tracking-widest">Subject Code</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-black uppercase text-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300 placeholder:font-medium" 
                                        placeholder="e.g. CS8691"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 mb-2 ml-1 uppercase tracking-widest">Subject Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold uppercase text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300 placeholder:font-medium" 
                                        placeholder="e.g. Operating Systems"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 mb-2 ml-1 uppercase tracking-widest">Short Name (for Grid/PDF)</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-black italic text-blue-400 uppercase tracking-tighter focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300 placeholder:font-medium" 
                                        placeholder="e.g. OS"
                                        value={formData.shortName}
                                        onChange={(e) => setFormData({ ...formData, shortName: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className="pt-4 flex gap-4">
                                    <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black border-2 border-blue-600 uppercase italic tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                                        {editingSubject ? 'Update' : 'Confirm'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Subjects;
