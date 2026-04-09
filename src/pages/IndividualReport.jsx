import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, User, Save, BookOpen, 
    Calendar, ChevronDown, CheckCircle, Database, Search, 
    ChevronRight, CreditCard, ClipboardList, Table, FileSpreadsheet, Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const STAFF_LIST = [
    "Ms. S. Priyadharshini", "Ms. K. Pappathi", "Mrs. R. Aruna", "Mr. S. Balakrishnan",
    "Mr. M. Arun", "Ms. R. Shantha Sheela", "Dr. S. M. Uma", "Ms. K. Suganthi",
    "Ms. N. Dhamayandhi", "Ms. K. Srividhya", "Dr. P. Nadimuthu",
    "Ms. M. Kavitha", "Ms. J. Janani", "Mr. P. Balamurugan", "Dr. K. Abhirami",
    "Ms. K. Abinaya", "Ms. S. Abikail Aarthi", "Ms. A. Shanthi", "Dr. S. Kannan",
    "Ms. E. Priyadharshini", "Dr. S. Rajarajan", "Ms. K. Saranya", "Ms. K. Madhumitha"
].sort();

const IndividualReport = () => {
    const { user } = useAuth();

    // Helper: auto-select correct academic year for the class year
    const getAcademicYearForClass = (classYear) => {
        if (classYear === 'II YEAR') return '2025-2026';
        if (classYear === 'III YEAR') return '2024-2025';
        return '2025-2026'; // default
    };

    // Filters
    const [selectedAcademicYear, setSelectedAcademicYear] = useState(() => localStorage.getItem('CAT_ind_AcademicYear') || "2024-2025");
    const [selectedYear, setSelectedYear] = useState(() => localStorage.getItem('CAT_ind_Year') || "III YEAR");
    const [selectedDept, setSelectedDept] = useState(() => localStorage.getItem('CAT_ind_Dept') || "CSE B");
    const [catType, setCatType] = useState(() => localStorage.getItem('CAT_ind_catType') || 'CAT - I');
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(() => localStorage.getItem('CAT_ind_Staff') || STAFF_LIST[0]);
    const [examDate, setExamDate] = useState('');

    const [students, setStudents] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [marksData, setMarksData] = useState({}); // {roll: mark}
    const [existingSectionData, setExistingSectionData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    // Persistence
    useEffect(() => {
        localStorage.setItem('CAT_ind_AcademicYear', selectedAcademicYear);
        localStorage.setItem('CAT_ind_Year', selectedYear);
        localStorage.setItem('CAT_ind_Dept', selectedDept);
        localStorage.setItem('CAT_ind_catType', catType);
        localStorage.setItem('CAT_ind_Staff', selectedStaff);
    }, [selectedAcademicYear, selectedYear, selectedDept, catType, selectedStaff]);

    // Fetch subjects when Year changes
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await api.get('/subjects');
                if (res.data.success) {
                    const filtered = res.data.subjects.filter(s => s.year === selectedYear);
                    setAvailableSubjects(filtered);
                    if (filtered.length > 0) {
                        setSelectedSubject(filtered[0]);
                    } else {
                        setSelectedSubject(null);
                    }
                }
            } catch (err) {
                console.error("Subjects fetch error", err);
            }
        };
        fetchSubjects();
    }, [selectedYear]);

    // Fetch Section Data (Students + Existing Marks)
    useEffect(() => {
        if (selectedYear && selectedDept && selectedSubject) {
            fetchSectionData();
        }
    }, [selectedAcademicYear, selectedYear, selectedDept, catType, selectedSubject]);

    const fetchSectionData = async () => {
        setLoading(true);
        const [dept, section] = selectedDept.split(' ');
        const config = { academicYear: selectedAcademicYear, year: selectedYear, department: dept, section, catType };
        
        try {
            // 1. Fetch Students
            const studentRes = await api.get('/students', { params: config });
            const studentList = studentRes.data.students || [];
            setStudents(studentList);

            // 2. Fetch Existing Marks for this section
            const marksRes = await api.get('/marks/section', { params: config });
            const data = marksRes.data.data;
            setExistingSectionData(data);

            // 3. Extract marks for selected subject
            if (data && data.scores && selectedSubject) {
                const newMarks = {};
                studentList.forEach(s => {
                    newMarks[s.rollNumber] = data.scores[s.rollNumber]?.[selectedSubject.code] || '';
                });
                setMarksData(newMarks);
                
                if (data.subjectDates && data.subjectDates[selectedSubject.code]) {
                    setExamDate(data.subjectDates[selectedSubject.code]);
                } else {
                    setExamDate('');
                }
            } else {
                setMarksData({});
                setExamDate('');
            }
        } catch (err) {
            console.error("Fetch section data error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedSubject) return alert("Please select a subject first.");
        
        setLoading(true);
        const [dept, section] = selectedDept.split(' ');
        const config = { academicYear: selectedAcademicYear, year: selectedYear, department: dept, section, catType };

        try {
            const updatedScores = existingSectionData?.scores ? { ...existingSectionData.scores } : {};
            const updatedDates = existingSectionData?.subjectDates ? { ...existingSectionData.subjectDates } : {};
            const updatedSubjectsList = existingSectionData?.subjects ? [...existingSectionData.subjects] : [];

            const subExists = updatedSubjectsList.find(s => s.code === selectedSubject.code);
            if (!subExists) {
                updatedSubjectsList.push(selectedSubject);
            }

            Object.keys(marksData).forEach(roll => {
                if (!updatedScores[roll]) updatedScores[roll] = {};
                updatedScores[roll][selectedSubject.code] = marksData[roll].toUpperCase();
            });

            if (examDate) {
                updatedDates[selectedSubject.code] = examDate;
            }

            const response = await api.post('/marks/bulk-save', { 
                ...config, 
                subjects: updatedSubjectsList, 
                scores: updatedScores,
                subjectDates: updatedDates
            });

            if (response.data.success) {
                setSuccess('Individual Report Synchronized');
                setTimeout(() => setSuccess(''), 4000);
            } else {
                throw new Error(response.data.message || "Server refused to save data.");
            }
            
            fetchSectionData();
        } catch (err) {
            alert(err.message || "Failed to save marks");
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = async () => {
        if (!selectedSubject || students.length === 0) return alert("Insufficient data for PDF");
        
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 10;

        const drawHeader = async (isFirst) => {
            if (isFirst) {
                try {
                    const response = await fetch('/images.jpg');
                    const blob = await response.blob();
                    const base64Logo = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                    doc.addImage(base64Logo, 'JPEG', margin, 8, 22, 22);
                } catch (e) {}

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                doc.setTextColor(15, 40, 100);
                doc.text('KINGS', 37, 14);
                doc.setFontSize(9);
                doc.text('COLLEGE OF ENGINEERING', 37, 18);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7.5);
                doc.setTextColor(60, 60, 60);
                doc.text('(AUTONOMOUS)', 37, 22);

                doc.setFontSize(6.5);
                const accX = 135;
                doc.text('Approved by AICTE, New Delhi', accX, 12);
                doc.text('Affiliated to Anna University, Chennai', accX, 15.5);
                doc.text('Recognized under 2(f) & 12B, UGC', accX, 19);
                doc.text('NAAC Accredited Institution', accX, 22.5);

                doc.setDrawColor(0);
                doc.setLineWidth(0.5);
                doc.line(margin, 32, pageWidth - margin, 32);

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(0);
                doc.text('Department of Computer Science and Engineering', pageWidth / 2, 38, { align: 'center' });
                doc.setFontSize(8.5);
                doc.text(`Academic Year ${selectedAcademicYear} / Even Semester`, pageWidth / 2, 43, { align: 'center' });
                doc.text(`Continuous Assessment Test – ${catType}`, pageWidth / 2, 48, { align: 'center' });

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8.5);
                doc.text(`Year/ Sem   : ${selectedYear}-CSE- ${selectedDept.split(' ')[1]} /VI`, margin, 55);
                doc.text(`Subject Coordinator : ${selectedStaff}`, margin, 60);
                doc.text(`Exam Date : ${examDate || '-'}`, 125, 55);
                
                // Shift subject name slightly and handle long strings
                const subText = `Subject: ${selectedSubject.name} (${selectedSubject.code})`;
                doc.text(doc.splitTextToSize(subText, 75), 125, 60); 
            }
        };

        await drawHeader(true);

        const body = students.map((s, idx) => [
            idx + 1,
            s.rollNumber,
            s.name.toUpperCase(),
            marksData[s.rollNumber] || '-'
        ]);

        autoTable(doc, {
            startY: 65,
            head: [['S.No', 'Reg.No', 'Student Name', 'Marks (50)']],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: 255, textColor: 0, fontSize: 7, fontStyle: 'bold', lineWidth: 0.1, lineColor: 0, halign: 'center' },
            styles: { fontSize: 7.5, cellPadding: 1.2, lineWidth: 0.1, lineColor: 0, halign: 'center', textColor: 0 },
            columnStyles: { 0: { cellWidth: 15 }, 1: { cellWidth: 35 }, 2: { halign: 'left' }, 3: { cellWidth: 30 } },
            margin: { left: margin, right: margin }
        });

        let curY = doc.lastAutoTable.finalY + 10;
        if (curY > 250) { doc.addPage(); await drawHeader(false); curY = 20; }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('Subject-Wise Performance Analysis', margin, curY);
        curY += 4;

        // Stats
        const appeared = students.filter(s => marksData[s.rollNumber] && marksData[s.rollNumber] !== 'AB' && marksData[s.rollNumber] !== '').length;
        const passed = students.filter(s => {
            const m = marksData[s.rollNumber];
            return m && m !== 'AB' && !isNaN(parseFloat(m)) && parseFloat(m) >= 25;
        }).length;
        const failed = appeared - passed;
        const passPct = appeared > 0 ? ((passed / appeared) * 100).toFixed(1) : '0.0';

        autoTable(doc, {
            startY: curY,
            head: [['Subject Name', 'Total Appeared', 'Passed', 'Failed', 'Pass %']],
            body: [[selectedSubject.name, appeared, passed, failed, `${passPct}%`]],
            theme: 'grid',
            headStyles: { fillColor: 255, textColor: 0, fontSize: 7, fontStyle: 'bold', lineWidth: 0.1, lineColor: 0, halign: 'center' },
            styles: { fontSize: 7.5, cellPadding: 1.2, lineWidth: 0.1, lineColor: 0, halign: 'center', textColor: 0 },
            margin: { left: margin, right: margin }
        });

        curY = doc.lastAutoTable.finalY + 18;
        if (curY > 275) { doc.addPage(); await drawHeader(false); curY = 20; }
        
        doc.setFontSize(8);
        doc.text('Subject Coordinator', margin, curY);
        doc.text('HoD/CSE', pageWidth / 2, curY, { align: 'center' });
        doc.text('Principal', pageWidth - margin, curY, { align: 'right' });

        doc.save(`KCE_Individual_Report_${selectedSubject.code}_${selectedDept.replace(' ','_')}.pdf`);
    };

    const generateExcel = () => {
        if (!selectedSubject || students.length === 0) return alert("Insufficient data for Excel");
        const data = students.map(s => ({
            "Reg Number": s.rollNumber,
            "Name": s.name.toUpperCase(),
            "Marks": marksData[s.rollNumber] || '0'
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Marks");
        XLSX.writeFile(wb, `KCE_${selectedSubject.code}_Report.xlsx`);
    };

    if (user?.role === 'student') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner">
                    <Database className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">Direct Entry Restricted</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-sm">Students can only view marks via the global search portal.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1300px] mx-auto pb-20">
            {/* Header / Filter Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-wrap items-center gap-8 relative overflow-hidden">
                <div className="flex-1 min-w-[300px]">
                    <h1 className="text-3xl font-black italic tracking-tighter flex items-center gap-3 text-slate-800">
                        <ClipboardList className="text-blue-600 w-8 h-8" /> INDIVIDUAL SUBJECT ENTRY
                    </h1>
                    <div className="flex items-center flex-wrap gap-4 mt-3 italic text-[10px] font-black uppercase text-slate-400">
                        <div className="flex items-center bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100/50 group hover:border-blue-400 transition-all cursor-pointer">
                            <span className="text-[9px] font-black text-slate-400 mr-2 tracking-tighter">Session:</span>
                            <select value={selectedAcademicYear} onChange={(e) => setSelectedAcademicYear(e.target.value)} className="bg-transparent border-none outline-none cursor-pointer text-blue-600 font-black text-[10px] uppercase appearance-none">
                                <option value="2024-2025">2024-2025</option>
                                <option value="2025-2026">2025-2026</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-blue-400 ml-1 group-hover:text-blue-600" />
                        </div>
                        <span className="opacity-20 text-slate-900 font-normal">/</span>
                        <div className="flex items-center gap-3">
                            <select value={selectedYear} onChange={(e) => { const yr = e.target.value; setSelectedYear(yr); setSelectedAcademicYear(getAcademicYearForClass(yr)); }} className="bg-transparent border-none outline-none cursor-pointer hover:text-slate-800 transition-colors">
                                <option>I YEAR</option>
                                <option>II YEAR</option>
                                <option>III YEAR</option>
                                <option>IV YEAR</option>
                            </select>
                            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="bg-transparent border-none outline-none cursor-pointer hover:text-slate-800 transition-colors">
                                <option>CSE A</option>
                                <option>CSE B</option>
                            </select>
                            <select value={catType} onChange={(e) => setCatType(e.target.value)} className="bg-transparent border-none outline-none cursor-pointer hover:text-slate-800 transition-colors">
                                <option>CAT - I</option>
                                <option>CAT - II</option>
                                <option>CAT - III</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase text-slate-400 ml-1">Select Staff</span>
                        <div className="relative">
                            <select 
                                value={selectedStaff} 
                                onChange={(e) => setSelectedStaff(e.target.value)}
                                className="pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black uppercase italic text-blue-600 appearance-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none w-52"
                            >
                                {STAFF_LIST.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase text-slate-400 ml-1">Select Subject</span>
                        <div className="relative">
                            <select 
                                value={selectedSubject?.code || ''} 
                                onChange={(e) => setSelectedSubject(availableSubjects.find(s => s.code === e.target.value))}
                                className="pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black uppercase italic text-blue-600 appearance-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none w-64"
                            >
                                {availableSubjects.length === 0 && <option value="">No Subjects Found</option>}
                                {availableSubjects.map(s => (
                                    <option key={s.code} value={s.code}>{s.shortName || s.code} - {s.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase text-slate-400 ml-1">Exam Date</span>
                        <input 
                            type="text"
                            placeholder="DD.MM.YY"
                            value={examDate}
                            onChange={(e) => setExamDate(e.target.value)}
                            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black uppercase text-center text-blue-600 outline-none w-32 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div className="flex gap-2 mt-5">
                        <button onClick={generatePDF} className="p-4 bg-white border border-slate-200 text-red-600 rounded-2xl hover:bg-slate-50 shadow-sm transition-all"><FileText className="w-5 h-5" /></button>
                        <button onClick={generateExcel} className="p-4 bg-white border border-slate-200 text-green-600 rounded-2xl hover:bg-slate-50 shadow-sm transition-all"><Table className="w-5 h-5" /></button>
                        <button onClick={handleSave} disabled={loading || !selectedSubject} className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"><Save className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>

            {/* Entry Table */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden min-h-[500px]">
                {loading && students.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-blue-600 font-extrabold italic uppercase tracking-widest text-[10px]">Loading Records...</span>
                    </div>
                ) : students.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 italic font-medium">
                        No students found for this section.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900 text-white">
                                    <th className="px-6 py-5 text-[10px] font-black uppercase italic tracking-tight w-20 text-center">S.No</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase italic tracking-tight w-40 text-center">Reg Number</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase italic tracking-tight">Student Name</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase italic tracking-tight w-48 text-center bg-blue-600">Marks (out of 50)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.map((s, idx) => (
                                    <tr key={s.rollNumber} className="hover:bg-slate-50 transition-all">
                                        <td className="px-6 py-4 text-[10px] font-bold text-slate-400 text-center">{idx + 1}</td>
                                        <td className="px-6 py-4 text-[11px] font-black text-blue-600 italic tracking-tighter text-center">{s.rollNumber}</td>
                                        <td className="px-6 py-4 text-[11px] font-black uppercase italic text-slate-800">{s.name}</td>
                                        <td className="px-6 py-4 text-center bg-blue-50/30">
                                            <input 
                                                className={`ind-mark-input w-24 mx-auto text-center text-lg font-black italic bg-white border-2 rounded-xl py-2 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all ${marksData[s.rollNumber] === 'AB' ? 'text-red-600 border-red-500 bg-red-50/50' : (marksData[s.rollNumber] && parseFloat(marksData[s.rollNumber]) < 25) ? 'text-red-600 border-slate-100' : 'text-slate-800 border-slate-100'}`}
                                                value={marksData[s.rollNumber] || ''}
                                                placeholder="--"
                                                onChange={(e) => {
                                                    let val = e.target.value.toUpperCase();
                                                    if (val !== 'AB' && !isNaN(val) && parseFloat(val) > 50) {
                                                        alert("Invalid Number! Marks cannot exceed 50.");
                                                        val = '0';
                                                    }
                                                    setMarksData({...marksData, [s.rollNumber]: val});
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "ArrowDown" || e.key === "Enter") {
                                                        e.preventDefault();
                                                        const inputs = Array.from(document.querySelectorAll('.ind-mark-input'));
                                                        const i = inputs.indexOf(e.target);
                                                        if (i < inputs.length - 1) {
                                                            inputs[i + 1].focus();
                                                            inputs[i + 1].select();
                                                        }
                                                    } else if (e.key === "ArrowUp") {
                                                        e.preventDefault();
                                                        const inputs = Array.from(document.querySelectorAll('.ind-mark-input'));
                                                        const i = inputs.indexOf(e.target);
                                                        if (i > 0) {
                                                            inputs[i - 1].focus();
                                                            inputs[i - 1].select();
                                                        }
                                                    }
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {success && (
                <div className="fixed bottom-6 right-6 p-6 bg-green-600 text-white rounded-3xl shadow-2xl flex items-center gap-4 animate-bounce z-[3000]">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-black italic uppercase tracking-tight">{success}</span>
                </div>
            )}
        </div>
    );
};

export default IndividualReport;
