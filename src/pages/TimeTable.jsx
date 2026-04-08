import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, AlertCircle } from 'lucide-react';

const timetables = [
    {
        title: "II CSE A / IV Sem",
        batch: "2024-2028",
        strength: "60",
        hall: "222 (Block-II)",
        coordinator: "Mr. S. Balakrishnan",
        chairperson: "Ms. K. Srividhya",
        schedule: [
            { day: 'MON', periods: [{s: "CSPC403"}, {s: "CSPC401"}, {s: "CSPC404", span: 2}, {s: "UHV"}, {s: "CSPC405"}, {s: "CSPC401"}, {s: "CSPC402"}] },
            { day: 'TUE', periods: [{s: "Comm. Skill", span: 2}, {s: "Comm. Skill", span: 2}, {s: "S/Y", span: 2}, {s: "CSPC403"}, {s: "Apti"}] },
            { day: 'WED', periods: [{s: "CSPC404"}, {s: "UHV"}, {s: "CSPC403"}, {s: "CSPC401"}, {s: "CSPC411 (B1)/CSPC405 (B2)", span: 2}, {s: "CSPC411 (B1)/CSPC405 (B2)", span: 2}] },
            { day: 'THU', periods: [{s: "CSPC401"}, {s: "CSPC402"}, {s: "CSPC405"}, {s: "LIB/NET"}, {s: "CSPC402"}, {s: "CSPC404"}, {s: "CSPC403"}, {s: "Soft skill"}] },
            { day: 'FRI', periods: [{s: "ITC", span: 2}, {s: "ITC"}, {s: "CSPC404"}, {s: "CSPC405(B2)/CSPC411(B1)", span: 2}, {s: "CSPC405(B2)/CSPC411(B1)", span: 2}] },
            { day: 'SAT', periods: [{s: "CSPC402"}, {s: "UHV"}, {s: "RC"}, {s: "CSPC405"}, {s: "NPTEL"}, {s: "CSPC404"}, {s: "FUH"}, {s: "CSPC403"}] },
        ]
    },
    {
        title: "II CSE B / IV Sem",
        batch: "2024-2028",
        strength: "60",
        hall: "222 (Block-II)",
        coordinator: "Mrs. K. Srividhya",
        chairperson: "Mr. S. Balakrishnan",
        schedule: [
            { day: 'MON', periods: [{s: "CSPC405"}, {s: "ITC"}, {s: "ITC"}, {s: "ITC"}, {s: "CSPC401"}, {s: "UHV"}, {s: "CSPC404", span: 2}] },
            { day: 'TUE', periods: [{s: "CSPC403"}, {s: "CSPC401"}, {s: "CSPC405"}, {s: "CSPC404"}, {s: "S/Y", span: 2}, {s: "CSPC402"}, {s: "CSPC403"}] },
            { day: 'WED', periods: [{s: "CSPC401"}, {s: "UHV"}, {s: "CSPC402"}, {s: "CSPC403"}, {s: "Comm. Skill", span: 2}, {s: "Comm. Skill", span: 2}] },
            { day: 'THU', periods: [{s: "CSPC404"}, {s: "Apti"}, {s: "CSPC404"}, {s: "CSPC402"}, {s: "CSPC411 (B1)/CSPC405(B2)", span: 2}, {s: "CSPC411 (B1)/CSPC405(B2)", span: 2}] },
            { day: 'FRI', periods: [{s: "CSPC405(B2)/CSPC411 (B1)", span: 2}, {s: "CSPC405(B2)/CSPC411 (B1)", span: 2}, {s: "CSPC402"}, {s: "LIB/NET"}, {s: "CSPC401"}, {s: "Softskill"}] },
            { day: 'SAT', periods: [{s: "CSPC402"}, {s: "NPTEL"}, {s: "CSPC403"}, {s: "UHV"}, {s: "CSPC404"}, {s: "RC"}, {s: "CSPC405"}, {s: "FUH"}] },
        ]
    },
    {
        title: "III CSE A / VI Sem",
        batch: "2023-2027",
        strength: "60",
        hall: "223 (Block-II)",
        coordinator: "Ms. K. Abinaya",
        chairperson: "Ms. K. Saranya",
        schedule: [
            { day: 'MON', periods: [{s: "CCS356"}, {s: "OEE351"}, {s: "CS3691"}, {s: "MX3089"}, {s: "CCS356(B1) / CS3691(B2)", span: 2}, {s: "CCS370"}, {s: "CCS368"}] },
            { day: 'TUE', periods: [{s: "CCS360(B1) / CS3662(B2)", span: 2}, {s: "Apti"}, {s: "CCS360"}, {s: "S/Y", span: 2}, {s: "CCS356(B2) / CS3691(B1)", span: 2}] },
            { day: 'WED', periods: [{s: "CCS360(B2) / CS3662(B1)", span: 2}, {s: "CCS370(B1) / CCS368(B2)", span: 2}, {s: "CCS356"}, {s: "OEE351"}, {s: "CCS368"}, {s: "CCS362"}] },
            { day: 'THU', periods: [{s: "CCS370(B2) / CCS368(B1)", span: 2}, {s: "MX3089"}, {s: "SS"}, {s: "CS3691"}, {s: "CCS362"}, {s: "CCS360"}, {s: "OEE351"}] },
            { day: 'FRI', periods: [{s: "ITC-III"}, {s: "ITC-III"}, {s: "ITC-III"}, {s: "LIB/NET"}, {s: "CCS356"}, {s: "CCS370"}, {s: "MX3089"}, {s: "GATE/CE"}] },
            { day: 'SAT', periods: [{s: "CS3691"}, {s: "SWAYAM"}, {s: "OEE351"}, {s: "GATE/CE"}, {s: "CE"}, {s: "CE"}, {s: "MP", span: 2}] },
        ]
    },
    {
        title: "III CSE B / VI Sem",
        batch: "2023-2027",
        strength: "60",
        hall: "224 (Block-II)",
        coordinator: "Ms. K. Saranya",
        chairperson: "Ms. K. Abinaya",
        schedule: [
            { day: 'MON', periods: [{s: "CCS370"}, {s: "CS3691"}, {s: "CCS356"}, {s: "MX3089"}, {s: "CCS356(B1) / CS3691(B2)", span: 2}, {s: "OEE351"}, {s: "CCS368"}] },
            { day: 'TUE', periods: [{s: "CCS360(B2) / CS3662(B1)", span: 2}, {s: "CCS370"}, {s: "LIB/NET"}, {s: "S/Y", span: 2}, {s: "CCS356(B2) / CS3691(B1)", span: 2}] },
            { day: 'WED', periods: [{s: "CCS360(B1) / CS3662(B2)", span: 2}, {s: "CCS370(B1) / CCS368(B2)", span: 2}, {s: "MX3089"}, {s: "CCS356"}, {s: "Apti"}, {s: "OEE351"}] },
            { day: 'THU', periods: [{s: "CCS370(B2) / CCS368(B1)", span: 2}, {s: "SS"}, {s: "CCS360"}, {s: "CS3691"}, {s: "CCS362"}, {s: "OEE351"}, {s: "GATE/CE"}] },
            { day: 'FRI', periods: [{s: "CS3691"}, {s: "CCS362"}, {s: "MX3089"}, {s: "CCS360"}, {s: "CCS368"}, {s: "ITC-III"}, {s: "ITC-III", span: 2}] },
            { day: 'SAT', periods: [{s: "OEE351"}, {s: "NPTEL"}, {s: "MP"}, {s: "MP"}, {s: "CE"}, {s: "CE"}, {s: "CCS356"}, {s: "GATE/CE"}] },
        ]
    }
];

const TimeTable = () => {
    const { user } = useAuth();
    const [selectedAcademicYear, setSelectedAcademicYear] = useState("2025-2026");
    const [timetablesData, setTimetablesData] = useState(timetables);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/timetables/bulk-save', { timetables: timetablesData, academicYear: selectedAcademicYear });
            setSuccess('Schedule finalized and synchronized');
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) { alert("Save failed: " + err.message); }
        finally { setSaving(false); }
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-8 mb-6">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter flex items-center gap-3 text-slate-800">
                        <Calendar className="text-blue-600 w-8 h-8" /> 
                        ACADEMIC TIME TABLE
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                        <select 
                            value={selectedAcademicYear} 
                            onChange={(e) => setSelectedAcademicYear(e.target.value)}
                            className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl border-none outline-none font-black italic tracking-tighter uppercase text-[10px] cursor-pointer hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                            <option value="2024-2025">2024-2025</option>
                            <option value="2025-2026">2025-2026</option>
                        </select>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                            Even Semester • Records for {selectedAcademicYear}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {success && <span className="text-[10px] font-black text-green-500 uppercase italic animate-pulse">{success}</span>}
                    {user?.role === 'hod' && (
                        <>
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black italic uppercase tracking-widest border border-blue-100">
                                <AlertCircle className="w-4 h-4" /> Edit Mode Enabled
                            </div>
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black italic uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                            >
                                {saving ? "PRESERVING..." : "SAVE CURRICULUM"}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-10">
                {timetablesData.map((tt, idx) => (
                    <div key={idx} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden relative">
                        {/* Header Details */}
                        <div className="bg-slate-900 text-white p-6 md:px-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-blue-400">
                                        {tt.title}
                                    </h2>
                                    <div className="flex gap-4 mt-2 text-xs font-black uppercase tracking-wide text-slate-400">
                                        <span>Batch: {tt.batch}</span>
                                        <span>Strength: {tt.strength}</span>
                                        <span>Hall: {tt.hall}</span>
                                    </div>
                                </div>
                                <div className="text-left md:text-right text-xs font-black uppercase tracking-wide text-slate-400 space-y-1">
                                    <p>Class Co-ordinator: <span className="text-white">{tt.coordinator}</span></p>
                                    <p>Committee Chair: <span className="text-white">{tt.chairperson}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto p-4">
                            <table className="w-full text-center border-collapse min-w-[900px]">
                                <thead>
                                    <tr>
                                        <th className="border border-slate-200 bg-slate-100 p-2 text-[10px] font-black uppercase italic tracking-wider w-16">Session</th>
                                        <th className="border border-slate-200 bg-slate-50 p-2 text-[10px] font-black uppercase italic tracking-wider">1<br/><span className="text-[8px] text-slate-500">09.15-10.00</span></th>
                                        <th className="border border-slate-200 bg-slate-50 p-2 text-[10px] font-black uppercase italic tracking-wider">2<br/><span className="text-[8px] text-slate-500">10.00-10.45</span></th>
                                        <th className="border border-slate-200 bg-slate-100 p-2 text-[9px] font-black uppercase italic tracking-widest w-12 text-slate-500 -rotate-90 md:rotate-0">BREAK<br/><span className="text-[7px]">10.45-11.00</span></th>
                                        <th className="border border-slate-200 bg-slate-50 p-2 text-[10px] font-black uppercase italic tracking-wider">3<br/><span className="text-[8px] text-slate-500">11.00-11.45</span></th>
                                        <th className="border border-slate-200 bg-slate-50 p-2 text-[10px] font-black uppercase italic tracking-wider">4<br/><span className="text-[8px] text-slate-500">11.45-12.30</span></th>
                                        <th className="border border-slate-200 bg-slate-100 p-2 text-[9px] font-black uppercase italic tracking-widest w-12 text-slate-500 -rotate-90 md:rotate-0">LUNCH<br/><span className="text-[7px]">12.30-01.15</span></th>
                                        <th className="border border-slate-200 bg-slate-50 p-2 text-[10px] font-black uppercase italic tracking-wider">5<br/><span className="text-[8px] text-slate-500">01.15-02.00</span></th>
                                        <th className="border border-slate-200 bg-slate-50 p-2 text-[10px] font-black uppercase italic tracking-wider">6<br/><span className="text-[8px] text-slate-500">02.00-02.45</span></th>
                                        <th className="border border-slate-200 bg-slate-100 p-2 text-[9px] font-black uppercase italic tracking-widest w-12 text-slate-500 -rotate-90 md:rotate-0">BREAK<br/><span className="text-[7px]">02.45-03.00</span></th>
                                        <th className="border border-slate-200 bg-slate-50 p-2 text-[10px] font-black uppercase italic tracking-wider">7<br/><span className="text-[8px] text-slate-500">03.00-03.45</span></th>
                                        <th className="border border-slate-200 bg-slate-50 p-2 text-[10px] font-black uppercase italic tracking-wider">8<br/><span className="text-[8px] text-slate-500">03.45-04.30</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tt.schedule.map((row, rIdx) => {
                                        let colHtml = [];
                                        colHtml.push(<td key={`day-${rIdx}`} className="border border-slate-200 bg-slate-100 font-black text-[11px] italic uppercase">{row.day}</td>);
                                        
                                        let pIndex = 0;
                                        let currentSlot = 1;
                                        
                                        // Slots available: 1, 2, BREAK1, 3, 4, LUNCH, 5, 6, BREAK2, 7, 8
                                        // We will visually insert the BREAK and LUNCH columns combining rowspan if rIdx === 0
                                        
                                        while (pIndex < row.periods.length) {
                                            const p = row.periods[pIndex];
                                            
                                            if (currentSlot === 3) {
                                                if (rIdx === 0) colHtml.push(<td key={`brk1-${rIdx}`} rowSpan={6} className="border border-slate-200 bg-slate-50 font-black text-slate-400 text-[10px] tracking-widest uppercase rotate-180" style={{writingMode: "vertical-rl"}}>BREAK</td>);
                                                currentSlot++;
                                            }
                                            if (currentSlot === 6) {
                                                if (rIdx === 0) colHtml.push(<td key={`lun-${rIdx}`} rowSpan={6} className="border border-slate-200 bg-slate-50 font-black text-slate-400 text-[10px] tracking-widest uppercase rotate-180" style={{writingMode: "vertical-rl"}}>LUNCH BREAK</td>);
                                                currentSlot++;
                                            }
                                            if (currentSlot === 9) {
                                                if (rIdx === 0) colHtml.push(<td key={`brk2-${rIdx}`} rowSpan={6} className="border border-slate-200 bg-slate-50 font-black text-slate-400 text-[10px] tracking-widest uppercase rotate-180" style={{writingMode: "vertical-rl"}}>BREAK</td>);
                                                currentSlot++;
                                            }
                                            
                                            // Regular cell
                                            const currentPIndex = pIndex;
                                            colHtml.push(
                                                <td key={`cell-${currentSlot}`} colSpan={p.span || 1} className="border border-slate-200 p-2 text-[11px] font-bold text-slate-700 hover:bg-blue-50 transition-all cursor-pointer">
                                                    {user?.role === 'hod' ? (
                                                        <input 
                                                            type="text" 
                                                            value={p.s} 
                                                            className="w-full text-center bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-blue-400 rounded p-1"
                                                            onChange={(e) => {
                                                                const newData = [...timetablesData];
                                                                newData[idx].schedule[rIdx].periods[currentPIndex].s = e.target.value.toUpperCase();
                                                                setTimetablesData(newData);
                                                            }}
                                                        />
                                                    ) : (
                                                        p.s
                                                    )}
                                                </td>
                                            );
                                            
                                            currentSlot += p.span || 1;
                                            pIndex++;
                                            
                                            // Handle edge case if span crosses a break
                                            if (currentSlot === 3 && pIndex < row.periods.length) {
                                                if (rIdx === 0) colHtml.push(<td key={`brk1-${rIdx}`} rowSpan={6} className="border border-slate-200 bg-slate-50 font-black text-slate-400 text-[10px] tracking-widest uppercase rotate-180" style={{writingMode: "vertical-rl"}}>BREAK</td>);
                                                currentSlot++;
                                            }
                                            if (currentSlot === 6 && pIndex < row.periods.length) {
                                                if (rIdx === 0) colHtml.push(<td key={`lun-${rIdx}`} rowSpan={6} className="border border-slate-200 bg-slate-50 font-black text-slate-400 text-[10px] tracking-widest uppercase rotate-180" style={{writingMode: "vertical-rl"}}>LUNCH BREAK</td>);
                                                currentSlot++;
                                            }
                                            if (currentSlot === 9 && pIndex < row.periods.length) {
                                                if (rIdx === 0) colHtml.push(<td key={`brk2-${rIdx}`} rowSpan={6} className="border border-slate-200 bg-slate-50 font-black text-slate-400 text-[10px] tracking-widest uppercase rotate-180" style={{writingMode: "vertical-rl"}}>BREAK</td>);
                                                currentSlot++;
                                            }
                                        }

                                        return <tr key={rIdx}>{colHtml}</tr>;
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimeTable;
