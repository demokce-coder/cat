import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Plus, Save, FileText, 
    RefreshCcw, Clock, AlertCircle, Database, LayoutGrid, CheckCircle, Table, ChevronDown, Download, X, Search, Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Students = () => {
    const { user } = useAuth();
    // Helper: auto-select correct academic year for the class year
    const getAcademicYearForClass = (classYear) => {
        if (classYear === 'II YEAR') return '2025-2026';
        if (classYear === 'III YEAR') return '2024-2025';
        return '2025-2026'; // default for I/IV YEAR
    };

    // 1. Premium States
    const [selectedAcademicYear, setSelectedAcademicYear] = useState(() => localStorage.getItem('CAT_selectedAcademicYear') || "2024-2025");
    const [selectedYear, setSelectedYear] = useState(() => localStorage.getItem('CAT_selectedYear') || "III YEAR");
    const [selectedDept, setSelectedDept] = useState(() => localStorage.getItem('CAT_selectedDept') || "CSE B");
    const [catType, setCatType] = useState(() => localStorage.getItem('CAT_catType') || 'CAT - I');
    const [subjectDates, setSubjectDates] = useState({});
    
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [marksData, setMarksData] = useState({});
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState('');

    const FIRST_YEAR_CSE_SUBJECTS = [
        { code: 'HS3152', name: 'Professional English - I' },
        { code: 'MA3151', name: 'Matrices and Calculus' },
        { code: 'PH3151', name: 'Engineering Physics' },
        { code: 'CY3151', name: 'Engineering Chemistry' },
        { code: 'GE3151', name: 'Problem Solving and Python Programming' },
        { code: 'GE3152', name: 'Tamil Heritage' }
    ];

    const SECOND_YEAR_CSE_SUBJECTS = [
        { code: '24CSPC401', name: 'Design and Analysis of Algorithms' },
        { code: '24CSPC402', name: 'Operating Systems' },
        { code: '24CSPC403', name: 'Object Oriented Software Engineering' },
        { code: '24CSPC404', name: 'Artificial Intelligence and Machine Learning' },
        { code: '24CSPC405', name: 'Full Stack Technologies' },
        { code: '24SHHS401', name: 'Universal Human Values-II' }
    ];

    const THIRD_YEAR_CSE_SUBJECTS = [
        { code: 'CCS356', name: 'Object Oriented Software Engineering' },
        { code: 'CS3691', name: 'Embedded Systems and IoT' },
        { code: 'OEE351', name: 'Renewable Energy System' },
        { code: 'CCS360', name: 'Recommender Systems' },
        { code: 'CCS362', name: 'Security and Privacy in Cloud' },
        { code: 'CCS370', name: 'UI and UX Design' },
        { code: 'CCS368', name: 'Stream Processing' }
    ];

    const FOURTH_YEAR_CSE_SUBJECTS = [
        { code: 'CS3791', name: 'Project Work - Phase I' },
        { code: 'CCS331', name: 'Cloud Computing' },
        { code: 'CCS341', name: 'Data Warehousing and Data Mining' },
        { code: 'CCS334', name: 'Cryptography and Network Security' },
        { code: 'CCS335', name: 'Social Network Analysis' }
    ];

    const getShortName = (code) => {
        const mapping = {
            'HS3152': 'ENG-I', 'MA3151': 'MAT-I', 'PH3151': 'PHY', 'CY3151': 'CHM', 'GE3151': 'PYTHON', 'GE3152': 'TAMIL',
            'CCS356': 'OOSE', 'CS3691': 'ES & IOT', 'OEE351': 'RES',
            'CCS360': 'RS', 'CCS362': 'SPC', 'CCS370': 'UI & UX', 'CCS368': 'SP',
            '24CSPC401': 'DAA', '24CSPC402': 'OS', '24CSPC403': 'OOSE', '24CSPC404': 'AIML',
            '24CSPC405': 'FST', '24SHHS401': 'UHV',
            'CS3791': 'PROJ', 'CCS331': 'CLOUD', 'CCS341': 'DWDM', 'CCS334': 'CRYPTO', 'CCS335': 'SNA'
        };
        return mapping[code] || code;
    };

    // Keep filters persistent across page refreshes
    useEffect(() => {
        localStorage.setItem('CAT_selectedAcademicYear', selectedAcademicYear);
        localStorage.setItem('CAT_selectedYear', selectedYear);
        localStorage.setItem('CAT_selectedDept', selectedDept);
        localStorage.setItem('CAT_catType', catType);
    }, [selectedAcademicYear, selectedYear, selectedDept, catType]);

    useEffect(() => {
        if (selectedYear && selectedDept) {
            fetchSectionData();
        }
    }, [selectedAcademicYear, selectedYear, selectedDept, catType]);

    // Handle Undo action (Ctrl+Z) for accidentally added subjects
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                setSubjects(prev => {
                    if (prev.length > 0 && prev[prev.length - 1].isCustom) {
                        return prev.slice(0, -1);
                    }
                    return prev;
                });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const fetchSectionData = async () => {
        setLoading(true);
        setStudents([]); 
        setMarksData({});
        setSubjects([]);
        const [dept, section] = selectedDept.split(' ');
        const config = { academicYear: selectedAcademicYear, year: selectedYear, department: dept, section, catType };
        try {
            const studentRes = await api.get('/students', { params: config });
            setStudents(studentRes.data.students || []);
            const marksRes = await api.get('/marks/section', { params: config });
            
            if (marksRes.data.data && !marksRes.data.connected) { 
                setSubjects(marksRes.data.data.subjects || []);
                setMarksData(marksRes.data.data.scores || {});
                setSubjectDates(marksRes.data.data.subjectDates || {});
            } else if (marksRes.data.marks) {
                const marksMap = {};
                marksRes.data.marks.forEach(m => {
                    if (!marksMap[m.rollNumber]) marksMap[m.rollNumber] = {};
                    marksMap[m.rollNumber][m.subjectCode] = m.marks;
                });
                setMarksData(marksMap);
                setSubjectDates(marksRes.data.subjectDates || {});
            }

            if (selectedYear === 'I YEAR') setSubjects(FIRST_YEAR_CSE_SUBJECTS);
            else if (selectedYear === 'II YEAR') setSubjects(SECOND_YEAR_CSE_SUBJECTS);
            else if (selectedYear === 'III YEAR') setSubjects(THIRD_YEAR_CSE_SUBJECTS);
            else if (selectedYear === 'IV YEAR') setSubjects(FOURTH_YEAR_CSE_SUBJECTS);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const getArrears = (rollNo) => {
        let count = 0;
        subjects.forEach(sub => {
            const m = marksData[rollNo]?.[sub.code];
            if (m === 'AB' || parseFloat(m) < 25) count++;
        });
        return count;
    };

    const handleSave = async () => {
        setLoading(true);
        const [dept, section] = selectedDept.split(' ');
        const config = { academicYear: selectedAcademicYear, year: selectedYear, department: dept, section, catType };
        try {
            await api.post('/marks/bulk-save', { 
                ...config, 
                subjects, 
                scores: marksData,
                subjectDates 
            });
            setSuccess('Records synchronized successfully');
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) { alert(err.message); } finally { setLoading(false); }
    };

    const handleExportPDF = () => {
        if (students.length === 0) {
            alert("No data available for the selected Section.");
            return;
        }
        setSuccess(`Download started: PDF Report`);
        const config = { 
            academicYear: selectedAcademicYear, 
            year: selectedYear, 
            department: 'CSE', 
            section: selectedDept.split(' ')[1], 
            catType 
        };
        generatePDF(students, marksData, subjectDates, config);
        setTimeout(() => setSuccess(''), 4000);
    };

    const handleExportExcel = () => {
        if (students.length === 0) {
            alert("No data available for the selected Section.");
            return;
        }
        setSuccess(`Download started: Excel Report`);
        const config = { 
            academicYear: selectedAcademicYear, 
            year: selectedYear, 
            department: 'CSE', 
            section: selectedDept.split(' ')[1], 
            catType 
        };
        generateExcel(students, marksData, subjectDates, config);
        setTimeout(() => setSuccess(''), 4000);
    };

    const handleUploadExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    alert("Excel file is empty");
                    return;
                }

                // Expecting columns: "Reg Number", "Name", "Register Number", "Student Name"
                const formattedStudents = data.map(row => {
                    const roll = String(row['Reg Number'] || row['Register Number'] || row['Roll Number'] || row['Roll No'] || row['rollNumber'] || row['ID'] || '').trim();
                    const name = String(row['Name'] || row['Student Name'] || row['STUDENT NAME'] || row['NAME'] || row['name'] || '').trim().toUpperCase();
                    return { rollNumber: roll, name };
                }).filter(s => s.rollNumber && s.name);

                const [dept, section] = selectedDept.split(' ');
                const commonInfo = { academicYear: selectedAcademicYear, year: selectedYear, department: dept, section };

                await api.post('/students/bulk', { 
                    students: formattedStudents,
                    commonInfo 
                });

                setSuccess(`Successfully uploaded ${formattedStudents.length} students to ${selectedYear} ${selectedDept}`);
                setSelectedDept(selectedDept); // Trigger refresh
                fetchSectionData();
                setTimeout(() => setSuccess(''), 5000);
            } catch (err) {
                console.error(err);
                alert("Error parsing Excel file. Ensure columns are named 'Reg Number' and 'Name'.");
            } finally {
                setUploading(false);
                e.target.value = ''; // Reset file input
            }
        };
        reader.readAsBinaryString(file);
    };

    const triggerFileInput = () => {
        document.getElementById('excel-upload-input').click();
    };

    const generatePDF = async (exportStudents, exportMarks, exportDates, config) => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 10;

        // ── Section-specific config (CSE A vs CSE B) ──
        const isCSEA = config.section === 'A';

        const isIIYear = config.year === 'II YEAR';
        let STAFF_MAP = {};

        if (isIIYear) {
            STAFF_MAP = isCSEA ? {
                '24CSPC401': 'Ms. S. Priyadharshini',
                '24CSPC402': 'Ms. K. Pappathi',
                '24CSPC403': 'Mrs. R. Aruna',
                '24CSPC404': 'Mr. S. Balakrishnan',
                '24CSPC405': 'Mr. M.Arun',
                '24SHHS401': 'Ms. R.Shantha Sheela'
            } : {
                '24CSPC401': 'Ms. K.Pappathi',
                '24CSPC402': 'Dr. S. M.Uma',
                '24CSPC403': 'Ms. K.Suganthi',
                '24CSPC404': 'Ms. N.Dhamayandhi',
                '24CSPC405': 'Ms. K. Srividhya',
                '24SHHS401': 'Dr. P.Nadimuthu'
            };
        } else {
            STAFF_MAP = isCSEA ? {
                'CCS356': 'Ms. M. Kavitha',
                'CS3691': 'Ms. J. Janani',
                'OEE351': 'Mr. P. Balamurugan',
                'CCS360': 'Dr. K. Abhirami',
                'CCS362': 'Ms. K. Abinaya',
                'CCS370': 'Ms. S. Abikail Aarthi',
                'CCS368': 'Ms. A. Shanthi',
            } : {
                'CCS356': 'Dr. S. Kannan',
                'CS3691': 'Ms. E.Priyadharshini',
                'OEE351': 'Mr. P.Balamurugan',
                'CCS360': 'Dr. S.Rajarajan',
                'CCS362': 'Ms. K.Saranya',
                'CCS370': 'Ms. K.Suganthi',
                'CCS368': 'Ms. K.Madhumitha',
            };
        }

        let CLASS_COORDINATOR = isCSEA ? 'Ms. K. Abinaya' : 'Mrs.K.Saranya';
        let ROOM_NO_TEXT = isCSEA ? 'Room No : 225' : 'Room No : 211';
        
        if (isIIYear) {
            CLASS_COORDINATOR = isCSEA ? 'Mr. S. Balakrishnan' : 'Mrs. K. Srividhya';
            ROOM_NO_TEXT = isCSEA ? 'Hall No.:222(Block-II)' : 'HallNo.:222 (Block-II)';
        }

        // ── Helper: draw header on current page ──
        const drawHeader = async (isFirst) => {
            // Logo
            try {
                const response = await fetch('/images.jpg');
                const blob = await response.blob();
                const base64Logo = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
                doc.addImage(base64Logo, 'JPEG', margin, 8, 22, 22);
            } catch (e) { /* logo optional */ }

            // Title
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

            // Accreditation right side
            doc.setFontSize(6.5);
            const accX = 135;
            doc.text('Approved by AICTE, New Delhi', accX, 12);
            doc.text('Affiliated to Anna University, Chennai', accX, 15.5);
            doc.text('Recognized under 2(f) & 12B, UGC', accX, 19);
            doc.text('NAAC Accredited Institution', accX, 22.5);

            // Divider
            doc.setDrawColor(0);
            doc.setLineWidth(0.5);
            doc.line(margin, 32, pageWidth - margin, 32);

            if (isFirst) {
                // Department / Semester info
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(0);
                doc.text('Department of Computer Science and Engineering', pageWidth / 2, 38, { align: 'center' });
                doc.setFontSize(8.5);
                doc.text(`Academic Year ${config.academicYear || selectedAcademicYear} / Even Semester`, pageWidth / 2, 43, { align: 'center' });
                doc.text(`Cumulative Continuous Assessment Test – ${config.catType || catType}`, pageWidth / 2, 48, { align: 'center' });

                // Metadata row
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8.5);
                doc.text(`Year/ Sem   : ${config.year}-CSE- ${config.section} /VI`, margin, 55);
                doc.text(`Class Coordinator : ${CLASS_COORDINATOR}`, margin, 60);
                doc.text(ROOM_NO_TEXT, 150, 55);
                doc.text(`Class Strength: ${exportStudents.length}`, 150, 60);
            }
        };

        // ── Compute arrears per student ──
        const getArrears = (rollNo) => {
            let count = 0;
            subjects.forEach(sub => {
                const m = exportMarks[rollNo]?.[sub.code];
                if (m === 'AB' || (m && !isNaN(parseFloat(m)) && parseFloat(m) < 25)) count++;
            });
            return count;
        };

        // ── Build marks body ──
        const marksBody = exportStudents.map((s, idx) => {
            const arrears = getArrears(s.rollNumber);
            return [
                idx + 1,
                s.rollNumber,
                s.name.toUpperCase(),
                ...subjects.map(sub => exportMarks[s.rollNumber]?.[sub.code] ?? '-'),
                arrears === 0 ? 'NIL' : arrears
            ];
        });

        // ── Two-row header ──
        // Row 1: S.No | Reg.No | Student Name | [S.Code ...] | No. of subjects failed
        // Row 2: empty | empty | empty | [Date ...] | empty
        const buildHead = () => {
            const row = [
                'S.No', 'Reg.No', 'Student Name',
                ...subjects.map(s => exportDates[s.code] ? `${exportDates[s.code]}\n${s.code}` : s.code),
                'No. of\nsubjects\nfailed'
            ];
            return [row];
        };

        // ── Page 1+: marks table ──
        await drawHeader(true);

        autoTable(doc, {
            startY: 64,
            head: buildHead(),
            body: marksBody,
            theme: 'grid',
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontSize: 6.5,
                fontStyle: 'bold',
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                halign: 'center',
                valign: 'middle',
                minCellHeight: 8,
                cellPadding: 1,
            },
            styles: {
                fontSize: 7.5,
                cellPadding: 1,
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                halign: 'center',
                textColor: [0, 0, 0],
                overflow: 'linebreak',
            },
            columnStyles: {
                0: { cellWidth: 9 },
                1: { cellWidth: 27 },
                2: { halign: 'left', cellWidth: 40 },
                [subjects.length + 3]: { cellWidth: 14, halign: 'center' },
            },
            margin: { left: margin, right: margin },
        });

        // ────────────────────────────────────────
        // SUMMARY SECTION — always on a new page
        // ────────────────────────────────────────
        doc.addPage();

        let curY = 15;

        // ── Table 1: No. of Subjects Failed distribution ──
        const maxArrears = subjects.length;
        const arrearsCount = {}; // 0..maxArrears
        for (let i = 0; i <= maxArrears; i++) arrearsCount[i] = 0;
        exportStudents.forEach(s => {
            const a = getArrears(s.rollNumber);
            arrearsCount[Math.min(a, maxArrears)] = (arrearsCount[Math.min(a, maxArrears)] || 0) + 1;
        });

        const failLabels = ['All clear', ...Array.from({ length: maxArrears }, (_, i) => String(i + 1))];
        const failCounts = [arrearsCount[0], ...Array.from({ length: maxArrears }, (_, i) => arrearsCount[i + 1] || '-')];

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(0);
        doc.text('Subject-Wise Failure Distribution', margin, curY);
        curY += 4;

        autoTable(doc, {
            startY: curY,
            head: [['No.of Subjects Failed', ...failLabels]],
            body: [['No.of Students', ...failCounts]],
            theme: 'grid',
            headStyles: { fillColor: [255, 255, 255], textColor: 0, fontSize: 7.5, fontStyle: 'bold', lineWidth: 0.1, lineColor: 0, halign: 'center', cellPadding: 1.5 },
            styles: { fontSize: 7.5, cellPadding: 1.5, lineWidth: 0.1, lineColor: 0, halign: 'center', textColor: 0 },
            columnStyles: { 0: { halign: 'left', cellWidth: 44 } },
            margin: { left: margin, right: margin },
        });

        curY = doc.lastAutoTable.finalY + 8;

        // ── Table 2: Subject-wise analysis ──
        const subjectRows = subjects.map((sub, idx) => {
            const appeared = exportStudents.filter(s => {
                const m = exportMarks[s.rollNumber]?.[sub.code];
                return m !== undefined && m !== '-' && m !== '';
            }).length;
            const passed = exportStudents.filter(s => {
                const m = exportMarks[s.rollNumber]?.[sub.code];
                return m && m !== 'AB' && !isNaN(parseFloat(m)) && parseFloat(m) >= 25;
            }).length;
            const failed = appeared - passed;
            const passPercent = appeared > 0 ? ((passed / appeared) * 100).toFixed(1) : '0.0';
            return [
                idx + 1,
                sub.code,
                sub.name,
                STAFF_MAP[sub.code] || '-',
                appeared || exportStudents.length,
                passed,
                failed,
                passPercent,
            ];
        });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(0);
        doc.text('Subject-Wise Performance Analysis', margin, curY);
        curY += 4;

        autoTable(doc, {
            startY: curY,
            head: [['S.\nNo', 'Sub Code', 'Subject Name', 'Staff Name', 'No. of Students\nAppeared', 'No. of Students\nPassed', 'No. of Students\nFailed', 'Pass\n%']],
            body: subjectRows,
            theme: 'grid',
            headStyles: { fillColor: [255, 255, 255], textColor: 0, fontSize: 7, fontStyle: 'bold', lineWidth: 0.1, lineColor: 0, halign: 'center', valign: 'middle', minCellHeight: 10, cellPadding: 1.5 },
            styles: { fontSize: 7.5, cellPadding: 1.5, lineWidth: 0.1, lineColor: 0, halign: 'center', textColor: 0 },
            columnStyles: {
                0: { cellWidth: 9 },
                1: { cellWidth: 18 },
                2: { halign: 'left', cellWidth: 48 },
                3: { halign: 'left', cellWidth: 36 },
                4: { cellWidth: 18 },
                5: { cellWidth: 18 },
                6: { cellWidth: 18 },
                7: { cellWidth: 14 },
            },
            margin: { left: margin, right: margin },
        });

        curY = doc.lastAutoTable.finalY + 6;

        // ── Overall pass % ──
        const allClear = exportStudents.filter(s => getArrears(s.rollNumber) === 0).length;
        const overallPassPct = exportStudents.length > 0
            ? ((allClear / exportStudents.length) * 100).toFixed(2)
            : '0.00';

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(`Overall Pass % = ${overallPassPct}%`, pageWidth / 2, curY + 6, { align: 'center' });

        // ── Signature line ──
        const sigY = curY + 22;
        doc.setFontSize(9);
        doc.text('Class Coordinator', margin, sigY);
        doc.text('HoD/CSE', pageWidth / 2, sigY, { align: 'center' });
        doc.text('Principal', pageWidth - margin, sigY, { align: 'right' });

        // ── Download ──
        const fileName = `KCE_Report_${config.year}_CSE_${config.section}_${catType}`
            .replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') + '.pdf';

        doc.save(fileName);
    };


    const generateExcel = (exportStudents, exportMarks, exportDates, config) => {
        const data = exportStudents.map(s => ({
            "Reg Number": s.rollNumber,
            "Name": s.name.toUpperCase(),
            ...subjects.reduce((acc, sub) => {
                acc[sub.code] = exportMarks[s.rollNumber]?.[sub.code] || '0';
                return acc;
            }, {}),
            "Failed": getArrears(s.rollNumber)
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Marks");
        XLSX.writeFile(wb, `${config.year}_CSE_${config.section}_Report.xlsx`);
    };

    if (user?.role === 'student') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-blue-200 border-4 border-white relative">
                    <Search className="w-10 h-10" />
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                        <Users className="w-4 h-4" />
                    </div>
                </div>
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-800 mb-2">Student Access Central</h1>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 max-w-lg mx-auto leading-relaxed">
                        Access to the master assessment grid is restricted. Please use the Global Search Box located at the top navigation bar to query your name and view your individual performance metrics.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-wrap items-center gap-8 relative overflow-hidden">
                <div className="flex-1 min-w-[250px]">
                    <h1 className="text-3xl font-black italic tracking-tighter flex items-center gap-3 text-slate-800"><Users className="text-blue-600 w-8 h-8" /> ASSESSMENT GRID</h1>
                    <div className="flex items-center flex-wrap gap-4 mt-2 italic text-[10px] font-black uppercase text-slate-400">
                        <div className="flex items-center bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100/50 group hover:border-blue-400 transition-all cursor-pointer">
                            <span className="text-[9px] font-black text-slate-400 mr-2 tracking-tighter">Academic Year:</span>
                            <select value={selectedAcademicYear} onChange={(e) => setSelectedAcademicYear(e.target.value)} className="bg-transparent border-none outline-none cursor-pointer text-blue-600 font-black text-[10px] uppercase appearance-none">
                                <option value="2024-2025">2024-2025</option>
                                <option value="2025-2026">2025-2026</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-blue-400 ml-1 group-hover:text-blue-600" />
                        </div>
                        <span className="opacity-20 text-slate-900 font-normal">/</span>
                        <div className="flex items-center gap-3">
                            <select value={selectedYear} onChange={(e) => { const yr = e.target.value; setSelectedYear(yr); setSelectedAcademicYear(getAcademicYearForClass(yr)); }} className="bg-transparent border-none outline-none cursor-pointer hover:text-slate-800 transition-colors"><option>I YEAR</option><option>II YEAR</option><option>III YEAR</option><option>IV YEAR</option></select>
                            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="bg-transparent border-none outline-none cursor-pointer hover:text-slate-800 transition-colors"><option>CSE A</option><option>CSE B</option></select>
                            <select value={catType} onChange={(e) => setCatType(e.target.value)} className="bg-transparent border-none outline-none cursor-pointer hover:text-slate-800 transition-colors"><option>CAT - I</option><option>CAT - II</option><option>CAT - III</option></select>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {user?.role === 'hod' && (
                        <>
                            <button 
                                onClick={() => setSubjects(prev => [...prev, { code: 'NEW', name: 'NEW SUBJECT', shortName: 'NEW', isCustom: true }])}
                                className="flex items-center gap-2 px-5 py-3 bg-blue-50 text-blue-600 border border-blue-200 rounded-2xl hover:bg-blue-100 transition-all text-xs font-black uppercase italic shadow-sm"
                            >
                                <Plus className="w-4 h-4" /> Add Subject
                            </button>
                            <input 
                                type="file" 
                                id="excel-upload-input" 
                                className="hidden" 
                                accept=".xlsx, .xls"
                                onChange={handleUploadExcel}
                            />
                            <button 
                                onClick={triggerFileInput} 
                                disabled={uploading}
                                className={`flex items-center gap-3 px-6 py-3 bg-indigo-900 text-white rounded-2xl hover:bg-slate-800 transition-all text-xs font-black uppercase italic shadow-lg shadow-indigo-100 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {uploading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} 
                                {uploading ? 'Uploading...' : 'Upload Name List (Excel)'}
                            </button>
                        </>
                    )}
                    <button onClick={handleExportPDF} className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all text-xs font-black uppercase italic"><FileText className="w-4 h-4 text-red-500" /> Export PDF</button>
                    <button onClick={handleExportExcel} className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all text-xs font-black uppercase italic"><Table className="w-4 h-4 text-green-500" /> Export Excel</button>
                    <button onClick={handleSave} className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20"><Save className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden min-h-[600px]">
                {loading && students.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[500px] gap-4"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="text-blue-600 font-extrabold italic uppercase tracking-widest">Re-Synchronizing...</span></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900 text-white border-b border-white/5">
                                    <th className="px-2 py-4 text-[10px] font-black uppercase italic tracking-tight w-12 text-center">S.No</th>
                                    <th className="px-2 py-4 text-[10px] font-black uppercase italic tracking-tight w-32 underline decoration-blue-500 decoration-2 text-center">Reg Number</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase italic tracking-tight w-52 text-left">Student Name</th>
                                    {subjects.map((sub, idx) => (
                                        <th key={idx} className="px-1 py-3 text-center border-l border-white/10 italic text-[9px] tracking-tighter w-24">
                                            <div className="flex flex-col items-center gap-1.5">
                                                {/* 📅 COMPACT EXAM DATE BOX */}
                                                <div className="w-[74px] mx-auto">
                                                    <input 
                                                        className="w-full bg-white/5 border border-white/20 rounded-md text-[9px] font-black text-center py-1 px-0.5 text-blue-400 placeholder:text-slate-600 focus:bg-white/20 focus:border-blue-500 transition-all outline-none"
                                                        placeholder="DD.MM.YY"
                                                        value={subjectDates[sub.code] || ''}
                                                        onChange={(e) => setSubjectDates({...subjectDates, [sub.code]: e.target.value})}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-extrabold leading-none mt-1">
                                                    {user?.role === 'hod' ? (
                                                        <input 
                                                            className="bg-white/10 border-none outline-none text-center w-20 text-blue-400 placeholder:opacity-30"
                                                            value={sub.code}
                                                            onChange={(e) => {
                                                                const newSubs = [...subjects];
                                                                newSubs[idx].code = e.target.value.toUpperCase();
                                                                setSubjects(newSubs);
                                                            }}
                                                        />
                                                    ) : sub.code}
                                                </span>
                                                <span className="text-[8px] opacity-60 font-black uppercase text-blue-400 leading-none">
                                                    {user?.role === 'hod' ? (
                                                        <input 
                                                            className="bg-transparent border-none outline-none text-center w-16 text-[8px]"
                                                            placeholder="SHORT"
                                                            value={sub.shortName || getShortName(sub.code)}
                                                            onChange={(e) => {
                                                                const newSubs = [...subjects];
                                                                newSubs[idx].shortName = e.target.value.toUpperCase();
                                                                setSubjects(newSubs);
                                                            }}
                                                        />
                                                    ) : (sub.shortName || getShortName(sub.code))}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-2 py-4 text-[8px] font-black uppercase italic bg-red-600 text-center w-28 text-white leading-tight">No of Subject Failed</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.map((s, idx) => (
                                    <tr key={idx} className="hover:bg-slate-100/50 transition-all">
                                        <td className="px-2 py-3 text-[9px] font-bold text-slate-400 text-center">{idx + 1}</td>
                                        <td className="px-2 py-3 text-[11px] font-black text-blue-600 italic tracking-tighter text-center">{s.rollNumber}</td>
                                        <td className="px-4 py-3 text-[10px] font-black uppercase italic text-slate-800 truncate max-w-[150px]">
                                            {user?.role === 'hod' ? (
                                                <input 
                                                    className="w-full bg-slate-50 border-none outline-none font-black italic uppercase text-slate-800"
                                                    value={s.name}
                                                    onChange={(e) => {
                                                        const newStudents = [...students];
                                                        newStudents[idx].name = e.target.value.toUpperCase();
                                                        setStudents(newStudents);
                                                    }}
                                                />
                                            ) : s.name}
                                        </td>
                                        {subjects.map((sub, sIdx) => {
                                            const val = marksData[s.rollNumber]?.[sub.code] || '';
                                            return (
                                                <td key={sIdx} className="px-1 py-3 border-l border-slate-50 text-center w-24">
                                                    <input className={`mark-input w-full text-center text-[12px] font-black italic bg-transparent outline-none ${val === 'AB' || (val && parseFloat(val) < 25) ? 'text-red-600' : 'text-slate-800'}`} value={val} placeholder="--" onChange={(e) => {
                                                        let inputVal = e.target.value.toUpperCase();
                                                        if (inputVal !== 'AB' && !isNaN(inputVal) && parseFloat(inputVal) > 50) {
                                                            inputVal = '50';
                                                        }
                                                        const m = {...marksData};
                                                        if (!m[s.rollNumber]) m[s.rollNumber] = {};
                                                        m[s.rollNumber][sub.code] = inputVal;
                                                        setMarksData(m);
                                                    }} onKeyDown={(e) => {
                                                        if (["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
                                                            e.preventDefault();
                                                            const inputs = Array.from(document.querySelectorAll('.mark-input'));
                                                            const currentIndex = inputs.indexOf(e.target);
                                                            if (currentIndex === -1) return;
                                                            
                                                            let nextIndex = -1;
                                                            if (e.key === "ArrowRight") {
                                                                nextIndex = currentIndex + 1;
                                                            } else if (e.key === "ArrowLeft") {
                                                                nextIndex = currentIndex - 1;
                                                            } else if (e.key === "ArrowDown" || e.key === "Enter") {
                                                                nextIndex = currentIndex + subjects.length;
                                                            } else if (e.key === "ArrowUp") {
                                                                nextIndex = currentIndex - subjects.length;
                                                            }
                                                            
                                                            if (nextIndex >= 0 && nextIndex < inputs.length) {
                                                                inputs[nextIndex].focus();
                                                                inputs[nextIndex].select();
                                                            }
                                                        }
                                                    }} />
                                                </td>
                                            );
                                        })}
                                        <td className="px-1 py-3 text-center bg-slate-50/30 font-black text-red-600 w-28">
                                            <span className={`text-[9px] font-black uppercase italic px-2 py-0.5 rounded-full ${getArrears(s.rollNumber) > 0 ? 'bg-red-600 text-white' : 'bg-green-500 text-white'}`}>
                                                {getArrears(s.rollNumber) === 0 ? "NIL" : getArrears(s.rollNumber)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {success && <div className="fixed bottom-6 right-6 p-6 bg-green-600 text-white rounded-3xl shadow-2xl flex items-center gap-4 animate-bounce z-[3000]"><CheckCircle className="w-6 h-6" /><span className="font-black italic uppercase tracking-tight">{success}</span></div>}
        </div>
    );
};

export default Students;
