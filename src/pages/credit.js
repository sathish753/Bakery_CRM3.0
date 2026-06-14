import { useEffect, useState, useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

export default function CreditPage() {
    const [credits, setCredits] = useState([]);
    const [loaded, setLoaded] = useState(false);

    // Filter
    const [fromDateTime, setFromDateTime] = useState("");
    const [toDateTime, setToDateTime] = useState("");

    // Edit state
    const [editingIndex, setEditingIndex] = useState(null);
    const [editSource, setEditSource] = useState("");
    const [editNote, setEditNote] = useState("");
    const [editAmount, setEditAmount] = useState("");

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("credits");
        if (saved) setCredits(JSON.parse(saved));
        setLoaded(true);
    }, []);

    // Save on change
    useEffect(() => {
        if (!loaded) return;
        localStorage.setItem("credits", JSON.stringify(credits));
    }, [credits, loaded]);

    const parseEntryDate = (dateStr) => {
        if (!dateStr) return null;
        const [datePart, timePart] = dateStr.split(", ");
        if (!datePart || !timePart) return null;
        const [day, month, year] = datePart.split("/");
        return new Date(`${year}-${month}-${day}T${timePart}`);
    };

    const filteredCredits = useMemo(() => {
        return credits
            .map((c, i) => ({ ...c, globalIndex: i }))
            .filter((c) => {
                const d = parseEntryDate(c.date);
                if (!d) return true;
                if (fromDateTime && d < new Date(fromDateTime)) return false;
                if (toDateTime && d > new Date(toDateTime)) return false;
                return true;
            });
    }, [credits, fromDateTime, toDateTime]);

    const totalFiltered = filteredCredits.reduce((sum, c) => sum + Number(c.amount || 0), 0);
    const totalAll = credits.reduce((sum, c) => sum + Number(c.amount || 0), 0);

    // Chart data — group by source
    const chartData = useMemo(() => {
        const map = {};
        filteredCredits.forEach((c) => {
            const key = c.source || "Unknown";
            if (!map[key]) map[key] = { source: key, total: 0, count: 0 };
            map[key].total += Number(c.amount || 0);
            map[key].count += 1;
        });
        return Object.values(map);
    }, [filteredCredits]);

    const handleDelete = (globalIndex) => {
        if (!window.confirm("Delete this credit entry?")) return;
        setCredits(credits.filter((_, i) => i !== globalIndex));
        if (editingIndex === globalIndex) setEditingIndex(null);
    };

    const handleStartEdit = (globalIndex) => {
        const c = credits[globalIndex];
        setEditingIndex(globalIndex);
        setEditSource(c.source);
        setEditNote(c.note || "");
        setEditAmount(String(c.amount));
    };

    const handleSaveEdit = () => {
        if (!editSource || !editAmount) { alert("Fill source and amount"); return; }
        setCredits(credits.map((c, i) =>
            i === editingIndex
                ? { ...c, source: editSource, note: editNote, amount: Number(editAmount) }
                : c
        ));
        setEditingIndex(null);
    };

    const styles = {
        container: {
            minHeight: '100vh',
            backgroundImage: "url('/expense.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            backgroundRepeat: "no-repeat",
            padding: '2.5rem',
            fontFamily: "system-ui, -apple-system, sans-serif"
        },
        mainWrapper: {
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(16px)',
            padding: '2.5rem',
            borderRadius: '1rem',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)',
            maxWidth: '1100px',
            margin: '0 auto',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff'
        },
        inputField: {
            height: '2.85rem',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '0 1rem',
            borderRadius: '0.375rem',
            fontSize: '1.05rem',
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            color: '#ffffff',
            outline: 'none',
            flex: '1'
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.mainWrapper}>

                {/* TITLE */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#ffffff', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                        💰 Credits / Income
                    </h1>
                    <div style={{ fontSize: '0.9rem', color: '#a78bfa', backgroundColor: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '0.5rem', padding: '0.4rem 1rem', fontWeight: '600' }}>
                        Entries are added from the Expense page → Credit button
                    </div>
                </div>

                {/* SUMMARY CARDS */}
                <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '200px', padding: '1.25rem', backgroundColor: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: '0.5rem' }}>
                        <div style={{ fontSize: '0.85rem', color: '#c4b5fd', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>ALL TIME TOTAL</div>
                        <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#a78bfa' }}>₹{totalAll.toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>{credits.length} entr{credits.length !== 1 ? 'ies' : 'y'}</div>
                    </div>
                    <div style={{ flex: '1', minWidth: '200px', padding: '1.25rem', backgroundColor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.5rem' }}>
                        <div style={{ fontSize: '0.85rem', color: '#6ee7b7', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>FILTERED TOTAL</div>
                        <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#34d399' }}>₹{totalFiltered.toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>{filteredCredits.length} entr{filteredCredits.length !== 1 ? 'ies' : 'y'}</div>
                    </div>
                    <div style={{ flex: '1', minWidth: '200px', padding: '1.25rem', backgroundColor: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '0.5rem' }}>
                        <div style={{ fontSize: '0.85rem', color: '#93c5fd', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>UNIQUE SOURCES</div>
                        <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#60a5fa' }}>{chartData.length}</div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>in filtered range</div>
                    </div>
                </div>

                {/* DATE FILTER */}
                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.45)', padding: '1.25rem 1.5rem', borderRadius: '0.75rem', marginBottom: '1.75rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1rem', fontWeight: '700', color: '#cbd5e1', whiteSpace: 'nowrap' }}>Filter Range:</span>
                    <input type="datetime-local" value={fromDateTime} onChange={e => setFromDateTime(e.target.value)}
                        style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '0.45rem 0.75rem', borderRadius: '0.5rem', backgroundColor: '#1e293b', color: '#ffffff', fontSize: '1rem', colorScheme: 'dark' }} />
                    <span style={{ color: '#94a3b8' }}>to</span>
                    <input type="datetime-local" value={toDateTime} onChange={e => setToDateTime(e.target.value)}
                        style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '0.45rem 0.75rem', borderRadius: '0.5rem', backgroundColor: '#1e293b', color: '#ffffff', fontSize: '1rem', colorScheme: 'dark' }} />
                    {(fromDateTime || toDateTime) && (
                        <button onClick={() => { setFromDateTime(""); setToDateTime(""); }}
                            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: 'none', padding: '0.45rem 1rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                            ✕ Clear
                        </button>
                    )}
                </div>

                {/* CHART */}
                {chartData.length > 0 && (
                    <div style={{ width: '100%', height: '300px', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '0.75rem' }}>Credits by Source</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -5, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="source" tick={{ fontSize: 13, fill: '#cbd5e1' }} stroke="rgba(255,255,255,0.2)" />
                                <YAxis tick={{ fontSize: 13, fill: '#cbd5e1' }} stroke="rgba(255,255,255,0.2)" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #475569', color: '#ffffff', fontSize: '13px' }} />
                                <Bar name="Amount (₹)" dataKey="total" fill="#a78bfa" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* ENTRIES LIST */}
                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: '1.75rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem', marginTop: 0 }}>
                        📋 Credit Entries {fromDateTime || toDateTime ? `(filtered)` : '(all)'}
                    </h3>

                    {filteredCredits.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '1rem', margin: 0 }}>
                            {credits.length === 0
                                ? "No credit entries yet. Add them from the Expense page using the 💰 Credit button."
                                : "No entries match the selected date range."}
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            {filteredCredits.map((c) => (
                                <div key={c.globalIndex}>
                                    {editingIndex === c.globalIndex ? (
                                        /* EDIT ROW */
                                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', padding: '0.85rem', backgroundColor: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: '0.5rem' }}>
                                            <input value={editSource} onChange={ev => setEditSource(ev.target.value)} placeholder="Source"
                                                style={{ ...styles.inputField, minWidth: '160px' }} />
                                            <input value={editNote} onChange={ev => setEditNote(ev.target.value)} placeholder="Note (optional)"
                                                style={{ ...styles.inputField, minWidth: '160px' }} />
                                            <input value={editAmount} onChange={ev => setEditAmount(ev.target.value)} type="number" placeholder="Amount (₹)"
                                                style={{ ...styles.inputField, minWidth: '120px', maxWidth: '160px' }} />
                                            <button onClick={handleSaveEdit} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0 1.1rem', borderRadius: '0.375rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', height: '2.85rem' }}>
                                                ✓ Save
                                            </button>
                                            <button onClick={() => setEditingIndex(null)} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: 'none', padding: '0 1rem', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem', height: '2.85rem' }}>
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        /* DISPLAY ROW */
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1rem', backgroundColor: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '0.5rem' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#e9d5ff', fontSize: '1.05rem' }}>{c.source}</div>
                                                <div style={{ fontSize: '0.82rem', color: '#a78bfa', marginTop: '0.2rem' }}>
                                                    {c.note ? `${c.note} • ` : ''}{c.date}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span style={{ fontWeight: '700', color: '#a78bfa', fontSize: '1.15rem' }}>₹{Number(c.amount).toLocaleString('en-IN')}</span>
                                                <button onClick={() => handleStartEdit(c.globalIndex)}
                                                    style={{ backgroundColor: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#c4b5fd', padding: '0.3rem 0.85rem', borderRadius: '0.35rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                                                    ✏ Edit
                                                </button>
                                                <button onClick={() => handleDelete(c.globalIndex)}
                                                    style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '0.3rem 0.85rem', borderRadius: '0.35rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                                                    🗑 Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

