import { useEffect, useState, useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Legend
} from "recharts";

export default function ExpensePage() {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState(["Food", "Rent", "Utilities", "Entertainment"]);

    const [fromDateTime, setFromDateTime] = useState("");
    const [toDateTime, setToDateTime] = useState("");

    const [isCompareMode, setIsCompareMode] = useState(false);
    const [fromDateTimeB, setFromDateTimeB] = useState("");
    const [toDateTimeB, setToDateTimeB] = useState("");

    const [loaded, setLoaded] = useState(false);

    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");

    const [newCategoryName, setNewCategoryName] = useState("");

    // Credits panel state
    const [showCreditPanel, setShowCreditPanel] = useState(false);
    const [credits, setCredits] = useState([]);
    const [creditSource, setCreditSource] = useState("");
    const [creditNote, setCreditNote] = useState("");
    const [creditAmount, setCreditAmount] = useState("");
    const [editingCreditIndex, setEditingCreditIndex] = useState(null);
    const [editCreditSource, setEditCreditSource] = useState("");
    const [editCreditNote, setEditCreditNote] = useState("");
    const [editCreditAmount, setEditCreditAmount] = useState("");

    // Category list view state
    const [viewingCategory, setViewingCategory] = useState(null);

    // Rename category state
    const [isRenamingCategory, setIsRenamingCategory] = useState(false);
    const [renameCategoryValue, setRenameCategoryValue] = useState("");

    // Edit expense state
    const [editingIndex, setEditingIndex] = useState(null);
    const [editName, setEditName] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editAmount, setEditAmount] = useState("");

    useEffect(() => {
        const savedExpenses = localStorage.getItem("expenses");
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses));

        const savedCats = localStorage.getItem("custom_categories");
        if (savedCats) setCategories(JSON.parse(savedCats));

        const savedCredits = localStorage.getItem("credits");
        if (savedCredits) setCredits(JSON.parse(savedCredits));

        setLoaded(true);
    }, []);

    useEffect(() => {
        if (!loaded) return;
        localStorage.setItem("expenses", JSON.stringify(expenses));
    }, [expenses, loaded]);

    useEffect(() => {
        if (!loaded) return;
        localStorage.setItem("custom_categories", JSON.stringify(categories));
    }, [categories, loaded]);

    useEffect(() => {
        if (!loaded) return;
        localStorage.setItem("credits", JSON.stringify(credits));
    }, [credits, loaded]);

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
        if (viewingCategory === catToDelete) setViewingCategory(null);
    };

    const handleRenameCategory = () => {
        const trimmed = renameCategoryValue.trim();
        if (!trimmed) return alert("Category name cannot be empty");
        const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
        if (categories.includes(formatted)) return alert("Category already exists");
        setCategories(categories.map(c => c === viewingCategory ? formatted : c));
        setExpenses(expenses.map(e => e.category === viewingCategory ? { ...e, category: formatted } : e));
        setViewingCategory(formatted);
        setIsRenamingCategory(false);
        setRenameCategoryValue("");
    };

    // CREDIT HANDLERS
    const addCredit = () => {
        if (!creditSource || !creditAmount) { alert("Fill source and amount"); return; }
        setCredits([...credits, { source: creditSource, note: creditNote, amount: Number(creditAmount), date: new Date().toLocaleString("en-GB") }]);
        setCreditSource(""); setCreditNote(""); setCreditAmount("");
    };

    const handleDeleteCredit = (idx) => {
        if (!window.confirm("Delete this credit entry?")) return;
        setCredits(credits.filter((_, i) => i !== idx));
    };

    const handleStartEditCredit = (idx) => {
        const c = credits[idx];
        setEditingCreditIndex(idx);
        setEditCreditSource(c.source);
        setEditCreditNote(c.note || "");
        setEditCreditAmount(String(c.amount));
    };

    const handleSaveEditCredit = () => {
        if (!editCreditSource || !editCreditAmount) { alert("Fill source and amount"); return; }
        setCredits(credits.map((c, i) => i === editingCreditIndex
            ? { ...c, source: editCreditSource, note: editCreditNote, amount: Number(editCreditAmount) }
            : c
        ));
        setEditingCreditIndex(null);
    };

    const totalCredits = credits.reduce((sum, c) => sum + Number(c.amount || 0), 0);

    const addExpense = () => {
        if (!name || !category || !amount) {
            alert("Fill all fields");
            return;
        }
        const newExpense = {
            name,
            category,
            amount: Number(amount),
            date: new Date().toLocaleString("en-GB")
        };
        setExpenses([...expenses, newExpense]);
        setName("");
        setCategory("");
        setAmount("");
    };

    // Delete a specific expense by global index
    const handleDeleteExpense = (globalIndex) => {
        if (!window.confirm("Delete this expense?")) return;
        setExpenses(expenses.filter((_, i) => i !== globalIndex));
    };

    // Start editing
    const handleStartEdit = (globalIndex) => {
        const e = expenses[globalIndex];
        setEditingIndex(globalIndex);
        setEditName(e.name);
        setEditCategory(e.category);
        setEditAmount(String(e.amount));
    };

    // Save edit
    const handleSaveEdit = () => {
        if (!editName || !editCategory || !editAmount) {
            alert("Fill all fields");
            return;
        }
        const updated = expenses.map((e, i) =>
            i === editingIndex
                ? { ...e, name: editName, category: editCategory, amount: Number(editAmount) }
                : e
        );
        setExpenses(updated);
        setEditingIndex(null);
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
        } else if (type === "week") {
            const currentDay = now.getDay();
            const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
            const startOfThisWeek = new Date(now.setDate(now.getDate() - distanceToMonday));
            startOfThisWeek.setHours(0, 0, 0, 0);
            const endOfThisWeek = new Date(startOfThisWeek);
            endOfThisWeek.setDate(endOfThisWeek.getDate() + 6);
            endOfThisWeek.setHours(23, 59, 59, 999);
            const startOfLastWeek = new Date(startOfThisWeek);
            startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
            const endOfLastWeek = new Date(endOfThisWeek);
            endOfLastWeek.setDate(endOfLastWeek.getDate() - 7);
            setFromDateTime(formatToDateTimeLocal(startOfThisWeek));
            setToDateTime(formatToDateTimeLocal(endOfThisWeek));
            setFromDateTimeB(formatToDateTimeLocal(startOfLastWeek));
            setToDateTimeB(formatToDateTimeLocal(endOfLastWeek));
        } else if (type === "day") {
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

    const parseEntryDate = (dateStr) => {
        if (!dateStr) return null;
        const [datePart, timePart] = dateStr.split(", ");
        if (!datePart || !timePart) return null;
        const [day, month, year] = datePart.split("/");
        return new Date(`${year}-${month}-${day}T${timePart}`);
    };

    const processedMetrics = useMemo(() => {
        const filteredA = expenses.filter((e) => {
            const entryDate = parseEntryDate(e.date);
            if (!entryDate) return false;
            if (fromDateTime && entryDate < new Date(fromDateTime)) return false;
            if (toDateTime && entryDate > new Date(toDateTime)) return false;
            return true;
        });

        const filteredB = isCompareMode ? expenses.filter((e) => {
            const entryDate = parseEntryDate(e.date);
            if (!entryDate) return false;
            if (fromDateTimeB && entryDate < new Date(fromDateTimeB)) return false;
            if (toDateTimeB && entryDate > new Date(toDateTimeB)) return false;
            return true;
        }) : [];

        const totalA = filteredA.reduce((sum, e) => sum + Number(e.amount || 0), 0);
        const totalB = filteredB.reduce((sum, e) => sum + Number(e.amount || 0), 0);

        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat] = { category: cat, rangeA: 0, rangeB: 0, countA: 0, countB: 0 };
        });

        filteredA.forEach((e) => {
            const cat = e.category || "Unknown";
            if (!categoryMap[cat]) categoryMap[cat] = { category: cat, rangeA: 0, rangeB: 0, countA: 0, countB: 0 };
            categoryMap[cat].rangeA += Number(e.amount || 0);
            categoryMap[cat].countA += 1;
        });

        filteredB.forEach((e) => {
            const cat = e.category || "Unknown";
            if (!categoryMap[cat]) categoryMap[cat] = { category: cat, rangeA: 0, rangeB: 0, countA: 0, countB: 0 };
            categoryMap[cat].rangeB += Number(e.amount || 0);
            categoryMap[cat].countB += 1;
        });

        return {
            chartData: Object.values(categoryMap),
            totalExpenseA: totalA,
            totalExpenseB: totalB,
            listA: filteredA,
            listB: filteredB,
            categoriesSummary: Object.values(categoryMap).filter(c => c.countA > 0 || c.countB > 0 || categories.includes(c.category))
        };
    }, [expenses, categories, fromDateTime, toDateTime, isCompareMode, fromDateTimeB, toDateTimeB]);

    // Expenses for the currently viewed category (with their global index)
    const categoryItems = useMemo(() => {
        if (!viewingCategory) return [];
        return expenses
            .map((e, i) => ({ ...e, globalIndex: i }))
            .filter(e => e.category === viewingCategory);
    }, [expenses, viewingCategory]);

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
            maxWidth: '1200px',
            margin: '0 auto',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff'
        },
        sectionHeading: { fontSize: '1.1rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '0.75rem' },
        inputField: { flex: '1', height: '2.85rem', border: '1px solid rgba(255,255,255,0.2)', padding: '0 1rem', borderRadius: '0.375rem', fontSize: '1.05rem', backgroundColor: 'rgba(30, 41, 59, 0.8)', color: '#ffffff', outline: 'none' },
        selectField: { flex: '1', minWidth: '190px', height: '2.85rem', border: '1px solid rgba(255,255,255,0.2)', padding: '0 0.75rem', borderRadius: '0.5rem', fontSize: '1.05rem', backgroundColor: 'rgba(30, 41, 59, 0.8)', color: '#ffffff', outline: '#ffffff', cursor: 'pointer' },
        panelRow: { padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', marginBottom: '1.5rem', backgroundColor: 'rgba(30, 41, 59, 0.45)' },
        metricBox: (bg, border) => ({ padding: '1.25rem', backgroundColor: bg, border: `1px solid ${border}`, borderRadius: '0.5rem', flex: '1', minWidth: '220px' }),
        entryRow: (bg, border) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: bg, border: border ? `1px solid ${border}` : 'none', borderRadius: '0.5rem' }),
        categoryTag: { display: 'inline-flex', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.6)', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.15)', fontSize: '1.05rem', fontWeight: '500', color: '#ffffff', gap: '0.4rem' },
        iconBtn: (color) => ({ background: 'none', border: 'none', color: color, cursor: 'pointer', fontWeight: '700', fontSize: '1.1rem', padding: '0 0.2rem', lineHeight: 1 }),
    };

    return (
        <div style={styles.container}>
            <div style={styles.mainWrapper}>

                {/* TOP TITLE ACTION ROW */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#ffffff', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>Expense Tracker Dashboard</h1>
                    <button
                        onClick={() => {
                            setIsCompareMode(!isCompareMode);
                            if (isCompareMode) { setFromDateTimeB(""); setToDateTimeB(""); }
                        }}
                        style={{ backgroundColor: isCompareMode ? 'rgba(255,255,255,0.2)' : '#2563eb', color: '#ffffff', padding: '0.6rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: '600', fontSize: '1.05rem', cursor: 'pointer' }}
                    >
                        {isCompareMode ? "✕ Disable Comparison" : "⇄ Compare Timeframes"}
                    </button>
                </div>

                {/* CATEGORY MANAGEMENT */}
                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.45)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
                    <h3 style={styles.sectionHeading}>✨ Manage Categories</h3>

                    {/* Single row: new category input + Add + dropdown + Edit/Delete */}
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                            style={{ ...styles.inputField, maxWidth: '220px' }}
                            placeholder="New category name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                        <button onClick={handleCreateCategory} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0 1.1rem', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer', fontSize: '1rem', height: '2.85rem', whiteSpace: 'nowrap' }}>
                            Add
                        </button>

                        {/* Divider */}
                        <div style={{ width: '1px', height: '2.85rem', backgroundColor: 'rgba(255,255,255,0.15)' }} />

                        <select
                            value={viewingCategory || ""}
                            onChange={(e) => {
                                setViewingCategory(e.target.value || null);
                                setEditingIndex(null);
                                setIsRenamingCategory(false);
                                setRenameCategoryValue("");
                            }}
                            style={{ ...styles.selectField, minWidth: '220px', maxWidth: '300px' }}
                        >
                            <option value="" style={{ backgroundColor: '#1e293b' }}>— Select a category to manage —</option>
                            {categories.map((cat, idx) => {
                                const count = expenses.filter(e => e.category === cat).length;
                                return (
                                    <option key={idx} value={cat} style={{ backgroundColor: '#1e293b' }}>
                                        {cat} ({count} item{count !== 1 ? 's' : ''})
                                    </option>
                                );
                            })}
                        </select>
                        {viewingCategory && !isRenamingCategory && (
                            <>
                                <button
                                    onClick={() => { setIsRenamingCategory(true); setRenameCategoryValue(viewingCategory); }}
                                    style={{ backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.35)', color: '#60a5fa', padding: '0 1.1rem', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem', height: '2.85rem', whiteSpace: 'nowrap' }}
                                >
                                    ✏ Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteCategory(viewingCategory)}
                                    style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171', padding: '0 1.1rem', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem', height: '2.85rem', whiteSpace: 'nowrap' }}
                                >
                                    🗑 Delete
                                </button>
                            </>
                        )}
                    </div>

                    {/* Inline rename input — shown when editing a category name */}
                    {viewingCategory && isRenamingCategory && (
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.95rem', color: '#94a3b8' }}>Rename "{viewingCategory}" to:</span>
                            <input
                                value={renameCategoryValue}
                                onChange={e => setRenameCategoryValue(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleRenameCategory()}
                                placeholder="New category name"
                                style={{ ...styles.inputField, maxWidth: '240px' }}
                                autoFocus
                            />
                            <button onClick={handleRenameCategory} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0 1.1rem', borderRadius: '0.375rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', height: '2.85rem' }}>
                                ✓ Save
                            </button>
                            <button onClick={() => { setIsRenamingCategory(false); setRenameCategoryValue(""); }} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: 'none', padding: '0 1rem', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem', height: '2.85rem' }}>
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* Inline Category Item List */}
                    {viewingCategory && (
                        <div style={{ marginTop: '1.25rem', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: '0.75rem', border: '1px solid rgba(96,165,250,0.2)', padding: '1.25rem' }}>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#93c5fd', marginBottom: '1rem', marginTop: 0 }}>
                                📂 Items in "{viewingCategory}" ({categoryItems.length})
                            </h4>

                            {categoryItems.length === 0 ? (
                                <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '1rem', margin: 0 }}>No expenses logged in this category yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                    {categoryItems.map((e) => (
                                        <div key={e.globalIndex}>
                                            {editingIndex === e.globalIndex ? (
                                                /* EDIT ROW */
                                                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', padding: '0.85rem', backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '0.5rem' }}>
                                                    <input
                                                        value={editName}
                                                        onChange={ev => setEditName(ev.target.value)}
                                                        placeholder="Name"
                                                        style={{ ...styles.inputField, flex: '2', minWidth: '140px' }}
                                                    />
                                                    <select
                                                        value={editCategory}
                                                        onChange={ev => setEditCategory(ev.target.value)}
                                                        style={styles.selectField}
                                                    >
                                                        {categories.map((c, i) => (
                                                            <option key={i} value={c} style={{ backgroundColor: '#1e293b' }}>{c}</option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        value={editAmount}
                                                        onChange={ev => setEditAmount(ev.target.value)}
                                                        type="number"
                                                        placeholder="Amount (₹)"
                                                        style={{ ...styles.inputField, minWidth: '120px', flex: '1' }}
                                                    />
                                                    <button onClick={handleSaveEdit} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0 1.1rem', borderRadius: '0.375rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', height: '2.85rem' }}>
                                                        ✓ Save
                                                    </button>
                                                    <button onClick={() => setEditingIndex(null)} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: 'none', padding: '0 1rem', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem', height: '2.85rem' }}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                /* DISPLAY ROW */
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.5rem' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '1.05rem' }}>{e.name}</div>
                                                        <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.15rem' }}>{e.category} • {e.date}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <span style={{ fontWeight: '700', color: '#f87171', fontSize: '1.1rem' }}>₹{e.amount}</span>
                                                        <button
                                                            onClick={() => handleStartEdit(e.globalIndex)}
                                                            style={{ backgroundColor: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.35)', color: '#60a5fa', padding: '0.3rem 0.85rem', borderRadius: '0.35rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}
                                                        >
                                                            ✏ Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteExpense(e.globalIndex)}
                                                            style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '0.3rem 0.85rem', borderRadius: '0.35rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}
                                                        >
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
                    )}
                </div>

                {/* QUICK COMPARISON PRESETS */}
                <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => applyPresetRange("day")} style={{ padding: '0.5rem 1.25rem', fontSize: '0.95rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', border: 'none', borderRadius: '0.35rem', cursor: 'pointer', fontWeight: '600' }}>Today vs Yesterday</button>
                    <button onClick={() => applyPresetRange("week")} style={{ padding: '0.5rem 1.25rem', fontSize: '0.95rem', backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', border: 'none', borderRadius: '0.35rem', cursor: 'pointer', fontWeight: '600' }}>This Week vs Last Week</button>
                    <button onClick={() => applyPresetRange("month")} style={{ padding: '0.5rem 1.25rem', fontSize: '0.95rem', backgroundColor: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '0.35rem', cursor: 'pointer', fontWeight: '700' }}>📅 This Month vs Last Month</button>
                </div>

                {/* LOG EXPENSE PANEL */}
                <div style={styles.panelRow}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', color: '#e2e8f0' }}>Log New Expense</h3>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                        <input
                            style={{ ...styles.inputField, flex: '2', minWidth: '220px' }}
                            placeholder="Expense Name (e.g. Rice, Petrol)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <select
                            style={styles.selectField}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="" style={{ backgroundColor: '#1e293b' }}>-- Choose Category --</option>
                            {categories.map((cat, idx) => (
                                <option key={idx} value={cat} style={{ backgroundColor: '#1e293b' }}>{cat}</option>
                            ))}
                        </select>
                        <input
                            style={{ ...styles.inputField, minWidth: '140px' }}
                            placeholder="Amount (₹)"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button onClick={addExpense} style={{ height: '2.85rem', padding: '0 2rem', fontSize: '1.05rem', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer' }}>
                            Save Expense
                        </button>
                        <button
                            onClick={() => setShowCreditPanel(!showCreditPanel)}
                            style={{ height: '2.85rem', padding: '0 2rem', fontSize: '1.05rem', backgroundColor: showCreditPanel ? 'rgba(255,255,255,0.15)' : '#7c3aed', color: '#ffffff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                            {showCreditPanel ? '✕ Close Credits' : '💰 Credit'}
                        </button>
                    </div>
                </div>

                {/* CREDITS PANEL */}
                {showCreditPanel && (
                    <div style={{ backgroundColor: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: '0.75rem', padding: '1.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#c4b5fd', margin: 0 }}>💰 Credits / Income</h3>
                            <div style={{ backgroundColor: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: '0.5rem', padding: '0.5rem 1.25rem' }}>
                                <span style={{ fontSize: '0.85rem', color: '#c4b5fd', fontWeight: '600' }}>TOTAL CREDITS  </span>
                                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#a78bfa' }}>₹{totalCredits.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {/* Add credit form */}
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <input
                                style={{ ...styles.inputField, flex: '2', minWidth: '180px' }}
                                placeholder="Source (e.g. Salary, Freelance)"
                                value={creditSource}
                                onChange={e => setCreditSource(e.target.value)}
                            />
                            <input
                                style={{ ...styles.inputField, flex: '2', minWidth: '160px' }}
                                placeholder="Note (optional)"
                                value={creditNote}
                                onChange={e => setCreditNote(e.target.value)}
                            />
                            <input
                                style={{ ...styles.inputField, minWidth: '140px' }}
                                placeholder="Amount (₹)"
                                type="number"
                                value={creditAmount}
                                onChange={e => setCreditAmount(e.target.value)}
                            />
                            <button onClick={addCredit} style={{ height: '2.85rem', padding: '0 1.5rem', fontSize: '1rem', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                + Add Credit
                            </button>
                        </div>

                        {/* Credit entries list */}
                        {credits.length === 0 ? (
                            <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '1rem', margin: 0 }}>No credit entries yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                {credits.map((c, i) => (
                                    <div key={i}>
                                        {editingCreditIndex === i ? (
                                            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', padding: '0.85rem', backgroundColor: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: '0.5rem' }}>
                                                <input value={editCreditSource} onChange={ev => setEditCreditSource(ev.target.value)} placeholder="Source" style={{ ...styles.inputField, flex: '2', minWidth: '140px' }} />
                                                <input value={editCreditNote} onChange={ev => setEditCreditNote(ev.target.value)} placeholder="Note (optional)" style={{ ...styles.inputField, flex: '2', minWidth: '140px' }} />
                                                <input value={editCreditAmount} onChange={ev => setEditCreditAmount(ev.target.value)} type="number" placeholder="Amount (₹)" style={{ ...styles.inputField, minWidth: '120px', flex: '1' }} />
                                                <button onClick={handleSaveEditCredit} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0 1.1rem', borderRadius: '0.375rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', height: '2.85rem' }}>✓ Save</button>
                                                <button onClick={() => setEditingCreditIndex(null)} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: 'none', padding: '0 1rem', borderRadius: '0.375rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem', height: '2.85rem' }}>Cancel</button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', backgroundColor: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '0.5rem' }}>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: '#e9d5ff', fontSize: '1.05rem' }}>{c.source}</div>
                                                    <div style={{ fontSize: '0.82rem', color: '#a78bfa', marginTop: '0.15rem' }}>
                                                        {c.note ? `${c.note} • ` : ''}{c.date}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <span style={{ fontWeight: '700', color: '#a78bfa', fontSize: '1.1rem' }}>₹{c.amount.toLocaleString('en-IN')}</span>
                                                    <button onClick={() => handleStartEditCredit(i)} style={{ backgroundColor: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#c4b5fd', padding: '0.3rem 0.85rem', borderRadius: '0.35rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>✏ Edit</button>
                                                    <button onClick={() => handleDeleteCredit(i)} style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '0.3rem 0.85rem', borderRadius: '0.35rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>🗑 Delete</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TIMELINE FILTERS */}
                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.45)', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#cbd5e1', width: '140px' }}>{isCompareMode ? "Primary Period:" : "Filter Range:"}</span>
                        <input type="datetime-local" value={fromDateTime} onChange={(e) => setFromDateTime(e.target.value)} style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '0.45rem 0.75rem', borderRadius: '0.5rem', backgroundColor: '#1e293b', color: '#ffffff', fontSize: '1rem', colorScheme: 'dark' }} />
                        <span style={{ fontSize: '1rem', color: '#94a3b8' }}>to</span>
                        <input type="datetime-local" value={toDateTime} onChange={(e) => setToDateTime(e.target.value)} style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '0.45rem 0.75rem', borderRadius: '0.5rem', backgroundColor: '#1e293b', color: '#ffffff', fontSize: '1rem', colorScheme: 'dark' }} />
                    </div>
                    {isCompareMode && (
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px dashed rgba(255,255,255,0.15)' }}>
                            <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#60a5fa', width: '140px' }}>Compare With:</span>
                            <input type="datetime-local" value={fromDateTimeB} onChange={(e) => setFromDateTimeB(e.target.value)} style={{ border: '1px solid rgba(96, 165, 250, 0.3)', padding: '0.45rem 0.75rem', borderRadius: '0.5rem', backgroundColor: '#1e293b', color: '#ffffff', fontSize: '1rem', colorScheme: 'dark' }} />
                            <span style={{ fontSize: '1rem', color: '#94a3b8' }}>to</span>
                            <input type="datetime-local" value={toDateTimeB} onChange={(e) => setToDateTimeB(e.target.value)} style={{ border: '1px solid rgba(96, 165, 250, 0.3)', padding: '0.45rem 0.75rem', borderRadius: '0.5rem', backgroundColor: '#1e293b', color: '#ffffff', fontSize: '1rem', colorScheme: 'dark' }} />
                        </div>
                    )}
                </div>

                {/* TOTAL METRICS BANNER */}
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <div style={styles.metricBox('rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.3)')}>
                        <div style={{ fontSize: '0.9rem', color: '#fca5a5', fontWeight: '700', letterSpacing: '0.05em' }}>{isCompareMode ? "PRIMARY PERIOD TOTAL" : "TOTAL EXPENSES"}</div>
                        <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#f87171', marginTop: '0.25rem' }}>₹{processedMetrics.totalExpenseA.toLocaleString('en-IN')}</div>
                    </div>
                    {isCompareMode && (
                        <div style={styles.metricBox('rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.3)')}>
                            <div style={{ fontSize: '0.9rem', color: '#93c5fd', fontWeight: '700', letterSpacing: '0.05em' }}>COMPARISON PERIOD TOTAL</div>
                            <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#60a5fa', marginTop: '0.25rem' }}>₹{processedMetrics.totalExpenseB.toLocaleString('en-IN')}</div>
                        </div>
                    )}
                </div>

                {/* CHART */}
                <div style={{ width: '100%', height: '380px', padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem' }}>
                    {processedMetrics.chartData.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No transactional data found.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={processedMetrics.chartData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="category" tick={{ fontSize: 14, fill: '#cbd5e1' }} stroke="rgba(255,255,255,0.2)" />
                                <YAxis tick={{ fontSize: 14, fill: '#cbd5e1' }} stroke="rgba(255,255,255,0.2)" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #475569', color: '#ffffff', fontSize: '14px' }} />
                                <Legend verticalAlign="top" height={40} wrapperStyle={{ color: '#ffffff', fontSize: '14px' }} />
                                <Bar name={isCompareMode ? "Primary Period" : "Expenses"} dataKey="rangeA" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={45} />
                                {isCompareMode && <Bar name="Comparison Period" dataKey="rangeB" fill="#60a5fa" radius={[4, 4, 0, 0]} maxBarSize={45} />}
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* CATEGORY FINANCIAL BREAKDOWN TABLE */}
                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: '1.75rem', borderRadius: '0.75rem', marginBottom: '2.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>📋 Active Category Financial Breakdown</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '1.05rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.15)', color: '#cbd5e1', fontSize: '1.1rem' }}>
                                    <th style={{ padding: '0.75rem 1rem' }}>Category Label</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>{isCompareMode ? "Primary Count" : "Items Count"}</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>{isCompareMode ? "Primary Total" : "Total Spent"}</th>
                                    {isCompareMode && <th style={{ padding: '0.75rem 1rem', color: '#60a5fa' }}>Comp. Count</th>}
                                    {isCompareMode && <th style={{ padding: '0.75rem 1rem', color: '#60a5fa' }}>Comp. Total</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {processedMetrics.categoriesSummary.map((c, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                        <td style={{ padding: '1rem', fontWeight: '600' }}>
                                            <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.8rem', borderRadius: '0.35rem', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>{c.category}</span>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#cbd5e1' }}>{c.countA} items</td>
                                        <td style={{ padding: '1rem', fontWeight: '700', color: '#f87171' }}>₹{c.rangeA.toLocaleString('en-IN')}</td>
                                        {isCompareMode && <td style={{ padding: '1rem', color: '#cbd5e1' }}>{c.countB} items</td>}
                                        {isCompareMode && <td style={{ padding: '1rem', fontWeight: '700', color: '#60a5fa' }}>₹{c.rangeB.toLocaleString('en-IN')}</td>}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* LOGGED ENTRIES */}
                <div style={{ display: 'grid', gridTemplateColumns: isCompareMode ? '1fr 1fr' : '1fr', gap: '2rem' }}>
                    <div>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.75rem', color: '#e2e8f0' }}>{isCompareMode ? "Primary Range Logged Entries" : "Logged Entries"}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {processedMetrics.listA.length === 0
                                ? <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '1.05rem' }}>No matches found.</p>
                                : processedMetrics.listA.map((e, i) => (
                                    <div key={i} style={styles.entryRow('rgba(30, 41, 59, 0.4)', 'rgba(255,255,255,0.05)')}>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '1.1rem' }}>{e.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.15rem' }}>{e.category} • {e.date}</div>
                                        </div>
                                        <div style={{ fontWeight: '700', color: '#f87171', fontSize: '1.15rem' }}>₹{e.amount}</div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {isCompareMode && (
                        <div>
                            <h4 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.75rem', color: '#60a5fa' }}>Comparison Range Logged Entries</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {processedMetrics.listB.length === 0
                                    ? <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '1.05rem' }}>No matches found.</p>
                                    : processedMetrics.listB.map((e, i) => (
                                        <div key={i} style={styles.entryRow('rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.25)')}>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#93c5fd', fontSize: '1.1rem' }}>{e.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#60a5fa', marginTop: '0.15rem' }}>{e.category} • {e.date}</div>
                                            </div>
                                            <div style={{ fontWeight: '700', color: '#60a5fa', fontSize: '1.15rem' }}>₹{e.amount}</div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}