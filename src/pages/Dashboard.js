import { useEffect, useState, useMemo } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Legend
} from "recharts";

const TrendingUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
);
const TrendingDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>
);
const DollarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);

export default function Dashboard() {
    const [bills, setBills] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState(["Rent", "Utilities", "Entertainment", "Petrols"]);
    const [chartType, setChartType] = useState("line");

    const [fromDateTime, setFromDateTime] = useState("");
    const [toDateTime, setToDateTime] = useState("");
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [fromDateTimeB, setFromDateTimeB] = useState("");
    const [toDateTimeB, setToDateTimeB] = useState("");

    const [loaded, setLoaded] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    useEffect(() => {
        const loadData = () => {
            const b = JSON.parse(localStorage.getItem("bills") || "[]");
            const e = JSON.parse(localStorage.getItem("expenses") || "[]");
            const savedCats = localStorage.getItem("custom_categories");

            setBills(b);
            setExpenses(e);
            if (savedCats) setCategories(JSON.parse(savedCats));
        };

        loadData();
        setLoaded(true);

        window.addEventListener("focus", loadData);
        return () => window.removeEventListener("focus", loadData);
    }, []);

    useEffect(() => {
        if (!loaded) return;
        localStorage.setItem("custom_categories", JSON.stringify(categories));
    }, [categories, loaded]);

    const formatLabelDate = (dateTimeStr) => {
        if (!dateTimeStr) return "";
        try {
            const [datePart] = dateTimeStr.split("T");
            const [year, month, day] = datePart.split("-");
            return ` (${day}/${month})`;
        } catch {
            return "";
        }
    };

    const dynamicTodayName = useMemo(() => {
        return isCompareMode ? `Today${formatLabelDate(fromDateTime)}` : "Gross Intake";
    }, [isCompareMode, fromDateTime]);

    const dynamicChosenName = useMemo(() => {
        return `Choosen Day${formatLabelDate(fromDateTimeB)}`;
    }, [fromDateTimeB]);

    const handleCreateCategory = () => {
        const trimmed = newCategoryName.trim();
        if (!trimmed) return alert("Category name cannot be empty");
        const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
        if (categories.includes(formatted)) return alert("Category already exists");

        setCategories([...categories, formatted]);
        setNewCategoryName(""); 
    };

    const handleDeleteCategory = (catToDelete) => {
        const isBeingUsed = expenses.some(e => e.category === catToDelete);
        if (isBeingUsed) {
            alert(`Cannot delete "${catToDelete}" because some saved expenses are currently using it!`);
            return;
        }
        setCategories(categories.filter(c => c !== catToDelete));
    };

    const parseEntryDate = (dateStr) => {
        if (!dateStr) return null;
        const parts = dateStr.split(", ");
        if (parts.length < 2) return null;
        const [datePart, timePart] = parts;
        const dateSubParts = datePart.split("/");
        if (dateSubParts.length < 3) return null;
        const [day, month, year] = dateSubParts;
        return new Date(`${year}-${month}-${day}T${timePart}`);
    };

    const formatToDateTimeLocal = (date) => {
        const pad = (num) => String(num).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const applyPresetRange = (type) => {
        setIsCompareMode(true);
        const now = new Date();

        if (type === "month") {
            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0);
            const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59);

            setFromDateTime(formatToDateTimeLocal(startOfThisMonth));
            setToDateTime(formatToDateTimeLocal(endOfThisMonth));
            setFromDateTimeB(formatToDateTimeLocal(startOfLastMonth));
            setToDateTimeB(formatToDateTimeLocal(endOfLastMonth));
        } 
        else if (type === "week") {
            const currentDay = now.getDay();
            const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
            const startOfThisWeek = new Date(now.setDate(now.getDate() - distanceToMonday));
            startOfThisWeek.setHours(0,0,0,0);
            const endOfThisWeek = new Date(startOfThisWeek);
            endOfThisWeek.setDate(endOfThisWeek.getDate() + 6);
            endOfThisWeek.setHours(23,59,59,999);

            const startOfLastWeek = new Date(startOfThisWeek);
            startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
            const endOfLastWeek = new Date(endOfThisWeek);
            endOfLastWeek.setDate(endOfThisWeek.getDate() - 7);

            setFromDateTime(formatToDateTimeLocal(startOfThisWeek));
            setToDateTime(formatToDateTimeLocal(endOfThisWeek));
            setFromDateTimeB(formatToDateTimeLocal(startOfLastWeek));
            setToDateTimeB(formatToDateTimeLocal(endOfLastWeek));
        }
        else if (type === "day") {
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0);
            const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59);
            const startOfYesterday = new Date(startOfToday);
            startOfYesterday.setDate(startOfYesterday.getDate() - 1);
            const endOfYesterday = new Date(endOfToday);
            endOfYesterday.setDate(endOfToday.getDate() - 1);

            setFromDateTime(formatToDateTimeLocal(startOfToday));
            setToDateTime(formatToDateTimeLocal(endOfToday));
            setFromDateTimeB(formatToDateTimeLocal(startOfYesterday));
            setToDateTimeB(formatToDateTimeLocal(endOfYesterday));
        }
    };

    const metrics = useMemo(() => {
        const filteredBillsA = bills.filter(b => {
            const d = parseEntryDate(b.date);
            if (!d) return false;
            if (fromDateTime && d < new Date(fromDateTime)) return false;
            if (toDateTime && d > new Date(toDateTime)) return false;
            return true;
        });

        const filteredExpensesA = expenses.filter(e => {
            const d = parseEntryDate(e.date);
            if (!d) return false;
            if (fromDateTime && d < new Date(fromDateTime)) return false;
            if (toDateTime && d > new Date(toDateTime)) return false;
            return true;
        });

        const filteredBillsB = isCompareMode ? bills.filter(b => {
            const d = parseEntryDate(b.date);
            if (!d) return false;
            if (fromDateTimeB && d < new Date(fromDateTimeB)) return false;
            if (toDateTimeB && d > new Date(toDateTimeB)) return false;
            return true;
        }) : [];

        const filteredExpensesB = isCompareMode ? expenses.filter(e => {
            const d = parseEntryDate(e.date);
            if (!d) return false;
            if (fromDateTimeB && d < new Date(fromDateTimeB)) return false;
            if (toDateTimeB && d > new Date(toDateTimeB)) return false;
            return true;
        }) : [];

        const salesA = filteredBillsA.reduce((sum, b) => sum + Number(b.total || 0), 0);
        const expA = filteredExpensesA.reduce((sum, e) => sum + Number(e.amount || 0), 0);
        
        const salesB = filteredBillsB.reduce((sum, b) => sum + Number(b.total || 0), 0);
        const expB = filteredExpensesB.reduce((sum, e) => sum + Number(e.amount || 0), 0);

        const timelinesMap = {};

        filteredBillsA.forEach(b => {
            const parts = b.date.split(", ");
            if(parts.length < 2) return;
            const [datePart, timePart] = parts;
            const dateSubParts = datePart.split("/");
            if(dateSubParts.length < 2) return;
            const [day, month] = dateSubParts;
            const hour = timePart.split(":")[0];
            const label = `${day}/${month} ${hour}:00`;

            if (!timelinesMap[label]) timelinesMap[label] = { time: label, salesA: 0, salesB: 0 };
            timelinesMap[label].salesA += Number(b.total || 0);
        });

        filteredBillsB.forEach(b => {
            const parts = b.date.split(", ");
            if(parts.length < 2) return;
            const [datePart, timePart] = parts;
            const dateSubParts = datePart.split("/");
            if(dateSubParts.length < 2) return;
            const [day, month] = dateSubParts;
            const hour = timePart.split(":")[0];
            const label = `${day}/${month} ${hour}:00`;

            if (!timelinesMap[label]) timelinesMap[label] = { time: label, salesA: 0, salesB: 0 };
            timelinesMap[label].salesB += Number(b.total || 0);
        });

        const timelineChart = Object.values(timelinesMap).sort((x, y) => x.time.localeCompare(y.time));

        const breakdownMap = {};
        categories.forEach(c => breakdownMap[c] = { category: c, amountA: 0, amountB: 0 });

        filteredExpensesA.forEach(e => {
            if (breakdownMap[e.category]) breakdownMap[e.category].amountA += Number(e.amount || 0);
        });
        filteredExpensesB.forEach(e => {
            if (breakdownMap[e.category]) breakdownMap[e.category].amountB += Number(e.amount || 0);
        });

        return {
            salesA, expA, profitA: salesA - expA,
            salesB, expB, profitB: salesB - expB,
            chartData: timelineChart,
            categorySummary: Object.values(breakdownMap)
        };
    }, [bills, expenses, categories, fromDateTime, toDateTime, isCompareMode, fromDateTimeB, toDateTimeB]);

    const dateInputStyle = {
        padding: '6px 10px',
        borderRadius: '6px',
        border: '1px solid rgba(15, 23, 42, 0.15)',
        fontSize: '13px',
        flex: '1 1 45%', // Takes up equal space side-by-side
        minWidth: '140px',
        color: '#0f172a',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(4px)',
        outline: 'none'
    };

    const comparisonInputStyle = {
        ...dateInputStyle,
        border: '1px solid rgba(37, 99, 235, 0.3)',
        backgroundColor: 'rgba(239, 246, 255, 0.6)',
        color: '#1e40af'
    };

    const cardStyle = {
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px 0 rgba(15, 23, 42, 0.06)'
    };

    return (
        <div 
            className="min-h-screen text-slate-900 font-sans antialiased" 
            style={{ 
                fontFamily: 'sans-serif', 
                padding: '24px',
                backgroundImage: `url('/dashboard.jpg')`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center', 
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            
            <main className="max-w-[1540px] mx-auto space-y-8">
                {/* Header Panel */}
                <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', marginBottom: '20px' }}>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900" style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>Business Intelligence Dashboard</h1>
                        <p style={{ fontSize: '14px', color: '#475569', margin: '4px 0 0 0' }}>Real-time positions and cost breakdowns.</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsCompareMode(!isCompareMode);
                            if (isCompareMode) { setFromDateTimeB(""); setToDateTimeB(""); }
                        }}
                        style={{ padding: '10px 16px', background: isCompareMode ? '#0f172a' : 'rgba(255, 255, 255, 0.8)', color: isCompareMode ? '#fff' : '#0f172a', border: '1px solid rgba(15, 23, 42, 0.15)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', backdropFilter: 'blur(4px)' }}
                    >
                        {isCompareMode ? "✕ Close Comparison" : "⇌ Compare Timeframes"}
                    </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
                    
                    {/* Left Column */}
                    <div style={{ flex: '1 1 65%', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* Status Cards */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <div style={{ ...cardStyle, flex: '1 1 200px', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '12px', fontWeight: '700' }}>
                                    <span>TOTAL SALES</span> <TrendingUpIcon/>
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: '900', marginTop: '8px' }}>₹{metrics.salesA.toLocaleString('en-IN')}</div>
                                {isCompareMode && <div style={{ fontSize: '11px', color: '#059669', marginTop: '6px', fontWeight: '600' }}>Prior: ₹{metrics.salesB.toLocaleString('en-IN')}</div>}
                            </div>

                            <div style={{ ...cardStyle, flex: '1 1 200px', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '12px', fontWeight: '700' }}>
                                    <span>TOTAL EXPENSE</span> <TrendingDownIcon/>
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: '900', marginTop: '8px' }}>₹{metrics.expA.toLocaleString('en-IN')}</div>
                                {isCompareMode && <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '6px', fontWeight: '600' }}>Prior: ₹{metrics.expB.toLocaleString('en-IN')}</div>}
                            </div>

                            <div style={{ ...cardStyle, flex: '1 1 200px', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '12px', fontWeight: '700' }}>
                                    <span>NET PROFIT</span> <DollarIcon/>
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: '900', marginTop: '8px', color: metrics.profitA >= 0 ? '#1d4ed8' : '#b45309' }}>
                                    ₹{metrics.profitA.toLocaleString('en-IN')}
                                </div>
                                {isCompareMode && <div style={{ fontSize: '11px', color: '#334155', marginTop: '6px', fontWeight: '600' }}>Prior: ₹{metrics.profitB.toLocaleString('en-IN')}</div>}
                            </div>
                        </div>

                        {/* Chart View */}
                        <div style={{ ...cardStyle, padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(15, 23, 42, 0.08)', paddingBottom: '10px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>SALES ACTIVITY FLOW ANALYSIS</h3>
                                <div style={{ background: 'rgba(15, 23, 42, 0.06)', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
                                    <button onClick={() => setChartType("line")} style={{ border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: chartType === 'line' ? '#fff' : 'transparent', color: chartType === 'line' ? '#2563eb' : '#475569' }}>Line</button>
                                    <button onClick={() => setChartType("bar")} style={{ border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: chartType === 'bar' ? '#fff' : 'transparent', color: chartType === 'bar' ? '#2563eb' : '#475569' }}>Bar</button>
                                </div>
                            </div>

                            <div style={{ width: '100%', height: '320px', minWidth: '250px', position: 'relative' }}>
                                {metrics.chartData.length === 0 ? (
                                    <div style={{ padding: '80px 0', textAlign: 'center', color: '#475569', fontSize: '14px', border: '2px dashed rgba(15, 23, 42, 0.15)', borderRadius: '8px', background: 'rgba(255,255,255,0.4)' }}>
                                        No active financial parameters mapped in this filter window.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={320}>
                                        {chartType === "line" ? (
                                            <LineChart data={metrics.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="4" vertical={false} stroke="rgba(15, 23, 42, 0.08)" />
                                                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#334155', fontWeight: '500' }} stroke="rgba(15, 23, 42, 0.15)" tickLine={false} />
                                                <YAxis tick={{ fontSize: 11, fill: '#334155', fontWeight: '500' }} stroke="rgba(15, 23, 42, 0.15)" tickLine={false} axisLine={false} />
                                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }} />
                                                <Legend verticalAlign="top" height={36} align="right" />
                                                <Line name={dynamicTodayName} type="monotone" dataKey="salesA" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} />
                                                {isCompareMode && <Line name={dynamicChosenName} type="monotone" dataKey="salesB" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 1 }} />}
                                            </LineChart>
                                        ) : (
                                            <BarChart data={metrics.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="4" vertical={false} stroke="rgba(15, 23, 42, 0.08)" />
                                                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#334155', fontWeight: '500' }} stroke="rgba(15, 23, 42, 0.15)" tickLine={false} />
                                                <YAxis tick={{ fontSize: 11, fill: '#334155', fontWeight: '500' }} stroke="rgba(15, 23, 42, 0.15)" tickLine={false} axisLine={false} />
                                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }} />
                                                <Legend verticalAlign="top" height={36} align="right" />
                                                <Bar name={dynamicTodayName} dataKey="salesA" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                {isCompareMode && <Bar name={dynamicChosenName} dataKey="salesB" fill="#3b82f6" radius={[4, 4, 0, 0]} />}
                                            </BarChart>
                                        )}
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Breakdown Table */}
                        <div style={{ ...cardStyle, overflow: 'hidden' }}>
                            <div style={{ background: 'rgba(15, 23, 42, 0.04)', padding: '14px 20px', borderBottom: '1px solid rgba(15, 23, 42, 0.08)' }}>
                                <h3 style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: '#0f172a' }}>CATEGORY OUTFLOW FINANCIAL BREAKDOWN</h3>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(15, 23, 42, 0.02)', borderBottom: '1px solid rgba(15, 23, 42, 0.08)', fontSize: '12px', color: '#334155' }}>
                                        <th style={{ padding: '12px 20px' }}>Expense Segment</th>
                                        <th style={{ padding: '12px 20px' }}>{dynamicTodayName}</th>
                                        {isCompareMode && <th style={{ padding: '12px 20px', color: '#1d4ed8' }}>{dynamicChosenName}</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.categorySummary.map((c, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid rgba(15, 23, 42, 0.06)' }}>
                                            <td style={{ padding: '12px 20px', fontWeight: '500' }}>{c.category}</td>
                                            <td style={{ padding: '12px 20px', fontWeight: '700' }}>₹{c.amountA.toLocaleString('en-IN')}</td>
                                            {isCompareMode && <td style={{ padding: '12px 20px', fontWeight: '700', color: '#1d4ed8' }}>₹{c.amountB.toLocaleString('en-IN')}</td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right Control Panel */}
                    <div style={{ ...cardStyle, flex: '1 1 30%', minWidth: '280px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <h4 style={{ fontSize: '11px', color: '#334155', fontWeight: '700', letterSpacing: '1px', margin: '0 0 10px 0' }}>QUICK PRESETS</h4>
                            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}>
                                <button onClick={() => applyPresetRange("day")} style={{ flex: '1 1 auto', textAlign: 'center', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(15, 23, 42, 0.1)', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Today vs Yesterday</button>
                                <button onClick={() => applyPresetRange("week")} style={{ flex: '1 1 auto', textAlign: 'center', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(15, 23, 42, 0.1)', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>This Week vs Last Week</button>
                                <button onClick={() => applyPresetRange("month")} style={{ flex: '1 1 100%', textAlign: 'center', background: 'rgba(219, 234, 254, 0.6)', border: '1px solid rgba(37, 99, 235, 0.2)', color: '#1e40af', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>This Month vs Last Month 📅</button>
                            </div>
                        </div>

                        {/* RANGE CONFIGURATION FIXED TO ROW ALIGNMENT */}
                        <div style={{ borderTop: '1px solid rgba(15, 23, 42, 0.08)', paddingTop: '15px' }}>
                            <h4 style={{ fontSize: '11px', color: '#334155', fontWeight: '700', letterSpacing: '1px', margin: '0 0 10px 0' }}>RANGE CONFIGURATION</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                        {isCompareMode ? "Primary Filter Window" : "Active Filter Window"}
                                    </label>
                                    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}>
                                        <input type="datetime-local" value={fromDateTime} onChange={(e) => setFromDateTime(e.target.value)} style={dateInputStyle} />
                                        <input type="datetime-local" value={toDateTime} onChange={(e) => setToDateTime(e.target.value)} style={dateInputStyle} />
                                    </div>
                                </div>
                                
                                {isCompareMode && (
                                    <div style={{ marginTop: '5px', borderTop: '1px dashed rgba(15, 23, 42, 0.1)', paddingTop: '14px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#1d4ed8', marginBottom: '6px' }}>
                                            Comparison Filter Window
                                        </label>
                                        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}>
                                            <input type="datetime-local" value={fromDateTimeB} onChange={(e) => setFromDateTimeB(e.target.value)} style={comparisonInputStyle} />
                                            <input type="datetime-local" value={toDateTimeB} onChange={(e) => setToDateTimeB(e.target.value)} style={comparisonInputStyle} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(15, 23, 42, 0.08)', paddingTop: '15px' }}>
                            <h4 style={{ fontSize: '11px', color: '#334155', fontWeight: '700', letterSpacing: '1px', margin: '0 0 10px 0' }}>SEGMENT STRUCTURES</h4>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <input
                                    style={{ flex: 1, padding: '8px', border: '1px solid rgba(15, 23, 42, 0.15)', borderRadius: '8px', fontSize: '13px', backgroundColor: 'rgba(255,255,255,0.6)' }}
                                    placeholder="Add segment name..."
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                                />
                                <button onClick={handleCreateCategory} style={{ padding: '8px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>Add</button>
                            </div>
                            
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Master Configured Parameters</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {categories.map((catName, i) => (
                                    <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 23, 42, 0.05)', border: '1px solid rgba(15, 23, 42, 0.08)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>
                                        <span>{catName}</span>
                                        <button onClick={() => handleDeleteCategory(catName)} style={{ border: 'none', background: 'none', color: '#475569', cursor: 'pointer', fontSize: '10px' }}>✕</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}