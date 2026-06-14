import { useEffect, useState, useMemo } from "react";
import axios from "axios"; 
import { motion } from "framer-motion"; 
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

export default function ReportsPage() {
    const [bills, setBills] = useState([]);
    const [fixerItems, setFixerItems] = useState([]); 
    const [fromDateTime, setFromDateTime] = useState("");
    const [toDateTime, setToDateTime] = useState("");
    const [viewMode, setViewMode] = useState("daily");
    const [showCategorySales, setShowCategorySales] = useState(false);
    const [isSending, setIsSending] = useState(false); 
    const [emailId, setEmailId] = useState("");
    const [profitGoal, setProfitGoal] = useState(50000); 

    useEffect(() => {
        const load = () => {
            const savedBills = JSON.parse(localStorage.getItem("bills")) || [];
            const savedItems = JSON.parse(localStorage.getItem("items")) || [];
            setBills(savedBills);
            setFixerItems(savedItems);
        };
        load();
        const interval = setInterval(load, 10000);
        window.addEventListener("storage", load);
        return () => {
            clearInterval(interval);
            window.removeEventListener("storage", load);
        };
    }, []);

    const COLORS = ["#38bdf8", "#34d399", "#fb923c", "#c084fc", "#f87171", "#22d3ee", "#facc15", "#a3e635", "#f472b6", "#2dd4bf"];

    const parseDate = (str) => {
        if (!str) return null;
        const [d, t] = str.split(", ");
        if (!d || !t) return null;
        const [day, month, year] = d.split("/");
        const date = new Date(`${year}-${month}-${day}T${t}`);
        return isNaN(date) ? null : date;
    };

    const fixerItemMap = useMemo(() => {
        const map = {};
        fixerItems.forEach(item => {
            if (item?.name) {
                map[item.name] = {
                    costPrice: Number(item.costPrice ?? 0),
                    sellingPrice: Number(item.sellingPrice ?? item.price ?? 0)
                };
            }
        });
        return map;
    }, [fixerItems]);

    const filteredBills = useMemo(() => {
        return bills.filter((b) => {
            const date = parseDate(b.date);
            if (!date) return false;
            if (fromDateTime && date < new Date(fromDateTime)) return false;
            if (toDateTime && date > new Date(toDateTime)) return false;
            return true;
        });
    }, [bills, fromDateTime, toDateTime]);

    const categorySales = useMemo(() => {
        const map = {};
        filteredBills.forEach(b => {
            (b.items || []).forEach(i => {
                const name = i.name;
                const qty = Number(i.qty || 0);
                const matchedFixerItem = fixerItemMap[name];
                const costPrice = matchedFixerItem ? matchedFixerItem.costPrice : Number(i.cost ?? 0);
                const sellingPrice = matchedFixerItem ? matchedFixerItem.sellingPrice : Number(i.price ?? 0);
                if (!map[name]) map[name] = { qty: 0, revenue: 0, profit: 0 };
                map[name].qty += qty;
                map[name].revenue += qty * sellingPrice;
                map[name].profit += qty * (sellingPrice - costPrice);
            });
        });
        return Object.entries(map).map(([name, v]) => ({ name, ...v }));
    }, [filteredBills, fixerItemMap]);

    const totalSales = useMemo(() => categorySales.reduce((sum, item) => sum + item.revenue, 0), [categorySales]);
    const totalProfit = useMemo(() => categorySales.reduce((sum, item) => sum + item.profit, 0), [categorySales]);

    const goalMetrics = useMemo(() => {
        const target = profitGoal || 1; 
        const percentage = Math.min(Math.max((totalProfit / target) * 100, 0), 100);
        return {
            percentage: percentage.toFixed(1),
            rawPercentage: (totalProfit / target * 100).toFixed(0),
            remaining: Math.max(profitGoal - totalProfit, 0)
        };
    }, [totalProfit, profitGoal]);

    const runnerSettings = useMemo(() => {
        if (totalProfit <= 0) return { emoji: "🥵", speed: 14, label: "Low Profit Struggle" };
        const ratio = totalProfit / (profitGoal || 1);
        if (ratio < 0.5) return { emoji: "🚶🏻‍➡️", speed: 9, label: "Walking Along" };
        if (ratio < 1) return { emoji: "🏃🏻‍♂️‍➡️", speed: 7.5, label: "On Pace" };
        return { emoji: "💨🚀", speed: 1.8, label: "Goal Smashed!" };
    }, [totalProfit, profitGoal]);

    const chartData = useMemo(() => {
        const map = {};
        filteredBills.forEach(b => {
            const d = parseDate(b.date);
            if (!d) return;
            const key = viewMode === "daily" ? d.toDateString() : viewMode === "weekly" ? `${d.getMonth() + 1}-W${Math.ceil(d.getDate() / 7)}` : `${d.getMonth() + 1}-${d.getFullYear()}`;
            let rev = 0;
            (b.items || []).forEach(i => rev += Number(i.qty || 0) * (fixerItemMap[i.name]?.sellingPrice || Number(i.price ?? 0)));
            map[key] = (map[key] || 0) + rev;
        });
        return Object.entries(map).map(([time, sales]) => ({ time, sales }));
    }, [filteredBills, viewMode, fixerItemMap]);

    const top5 = useMemo(() => [...categorySales].sort((a, b) => b.qty - a.qty).slice(0, 5), [categorySales]);
    const pieData = useMemo(() => categorySales.map(i => ({ name: i.name, value: i.qty })), [categorySales]);
    const colorMap = useMemo(() => {
        const map = {};
        categorySales.forEach((i, idx) => map[i.name] = COLORS[idx % COLORS.length]);
        return map;
    }, [categorySales]);

    const generateCSVString = () => {
        let csv = "Item,Qty,Revenue,Profit\n";
        categorySales.forEach(i => csv += `${i.name},${i.qty},${i.revenue.toFixed(2)},${i.profit.toFixed(2)}\n`);
        csv += `TOTALS,${categorySales.reduce((s, i) => s + i.qty, 0)},${totalSales.toFixed(2)},${totalProfit.toFixed(2)}\n`;
        return csv;
    };

    const exportCSV = () => {
        const blob = new Blob([generateCSVString()], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "report.csv";
        a.click();
    };

    const sendEmailBackend = async () => {
        if (!emailId?.includes("@")) return alert("Invalid email.");
        setIsSending(true);
        try {
            await axios.post("http://localhost:5000/api/send-report", { toEmail: emailId, totalSales: `₹${totalSales.toLocaleString("en-IN")}`, totalProfit: `₹${totalProfit.toLocaleString("en-IN")}`, csvContent: generateCSVString() });
            alert("🚀 Sent successfully!");
            setEmailId("");
        } catch { alert("❌ Failed to send."); } finally { setIsSending(false); }
    };

    const styles = {
        pageWrapper: {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundImage: `url('/report.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            backgroundBlendMode: "overlay",
            overflowY: "auto",
            zIndex: 0
        },
        container: { padding: "2.5rem", maxWidth: "1280px", margin: "0 auto", color: "#ffffff", fontFamily: "system-ui, sans-serif" },
        animationTrack: { width: "100%", height: "50px", background: "rgba(15, 23, 42, 0.85)", borderRadius: "30px", border: "2px dashed #4ade80", overflow: "hidden", position: "relative", marginBottom: "1.5rem", display: "flex", alignItems: "center" },
        runnerContainer: { fontSize: "1.85rem", position: "absolute", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.6rem" },
        trackLabel: { position: "absolute", right: "20px", fontSize: "0.75rem", fontWeight: "700", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" },
        headerRow: { display: "flex", justifyContent: "space-between", marginBottom: "2rem" },
        title: { fontSize: "2rem", fontWeight: "800", margin: 0 },
        controlsCard: { backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(16px)", padding: "1.25rem", borderRadius: "12px", display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem", border: "1px solid rgba(255, 255, 255, 0.1)" },
        input: { padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(30, 41, 59, 0.8)", color: "#ffffff" },
        goalInputContainer: { display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(37, 99, 235, 0.2)", padding: "0.25rem 0.75rem", borderRadius: "6px" },
        select: { padding: "0.5rem", borderRadius: "6px", background: "rgba(30, 41, 59, 0.8)", color: "#ffffff" },
        btnSecondary: { padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255, 255, 255, 0.15)", color: "#ffffff", cursor: "pointer" },
        btnPrimary: { padding: "0.5rem 1rem", borderRadius: "6px", border: "none", backgroundColor: "#2563eb", color: "#ffffff", cursor: "pointer" },
        metricsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" },
        metricCard: { backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(16px)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.1)" },
        metricLabel: { fontSize: "0.875rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" },
        metricValue: (color) => ({ fontSize: "2rem", fontWeight: "800", color: color, margin: 0 }),
        progressTrack: { width: "100%", height: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "10px", marginTop: "1rem" },
        progressBar: (pct) => ({ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #38bdf8, #4ade80)", borderRadius: "10px" }),
        goalStatusBadge: (isMet) => ({ padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "800", backgroundColor: isMet ? "#10b981" : "#e11d48", width: "fit-content", marginTop: "0.5rem" }),
        sectionCard: { backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(16px)", padding: "1.5rem", borderRadius: "12px", marginBottom: "2rem", border: "1px solid rgba(255, 255, 255, 0.1)" },
        sectionTitle: { fontSize: "1.25rem", fontWeight: "700", marginBottom: "1.25rem" },
        gridList: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" },
        itemCard: (borderColor) => ({ borderLeft: `4px solid ${borderColor}`, padding: "1rem", borderRadius: "8px", background: "rgba(30, 41, 59, 0.45)" }),
        itemTitle: { fontSize: "1rem", fontWeight: "700", marginBottom: "0.25rem" },
        itemMeta: { fontSize: "0.875rem", color: "#cbd5e1" },
        divider: { border: "0", height: "1px", background: "rgba(255, 255, 255, 0.15)", margin: "2rem 0" },
        emailBlock: { display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto" }
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                <div style={styles.animationTrack}>
                    <motion.div key={runnerSettings.speed} style={styles.runnerContainer} animate={{ left: ["-80px", "105%"] }} transition={{ duration: runnerSettings.speed, ease: "linear", repeat: Infinity }}>
                        <span>{runnerSettings.emoji}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#10b981', padding: '2px 6px', borderRadius: '4px' }}>₹{totalProfit.toFixed(0)}</span>
                    </motion.div>
                    <div style={styles.trackLabel}>Status: {runnerSettings.label}</div>
                </div>

                <div style={styles.headerRow}><h1 style={styles.title}>📊 Reports Dashboard</h1></div>

                <div style={styles.controlsCard}>
                    <input type="datetime-local" value={fromDateTime} onChange={e => setFromDateTime(e.target.value)} style={styles.input} />
                    <input type="datetime-local" value={toDateTime} onChange={e => setToDateTime(e.target.value)} style={styles.input} />
                    <select value={viewMode} onChange={e => setViewMode(e.target.value)} style={styles.select}>
                        <option value="daily">Daily View</option>
                        <option value="weekly">Weekly View</option>
                        <option value="monthly">Monthly View</option>
                    </select>
                    <div style={styles.goalInputContainer}>
                        <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#38bdf8" }}>GOAL:</label>
                        <input type="number" value={profitGoal} onChange={e => setProfitGoal(Number(e.target.value))} style={{ ...styles.input, width: "90px", padding: "0.25rem", border: "none", background: "transparent" }} />
                    </div>
                    <button onClick={() => { setFromDateTime(""); setToDateTime(""); }} style={styles.btnSecondary}>Reset</button>
                    <button onClick={() => setShowCategorySales(!showCategorySales)} style={styles.btnSecondary}>{showCategorySales ? "Hide Breakdown" : "Category Breakdown"}</button>
                    <button onClick={exportCSV} style={styles.btnSecondary}>📤 Export CSV</button>
                    <div style={styles.emailBlock}>
                        <input type="email" placeholder="Enter email..." value={emailId} onChange={e => setEmailId(e.target.value)} style={styles.input} disabled={isSending} />
                        <button onClick={sendEmailBackend} style={{ ...styles.btnPrimary, backgroundColor: isSending ? "#6b7280" : "#10b981" }} disabled={isSending}>{isSending ? "Sending..." : "📧 Send"}</button>
                    </div>
                </div>

                <div style={styles.metricsGrid}>
                    <div style={styles.metricCard}>
                        <span style={styles.metricLabel}>Total Sales</span>
                        <h2 style={styles.metricValue("#4ade80")}>₹{totalSales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
                    </div>
                    <div style={styles.metricCard}>
                        <span style={styles.metricLabel}>Net Profit</span>
                        <h2 style={styles.metricValue("#38bdf8")}>₹{totalProfit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
                    </div>
                    <div style={styles.metricCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={styles.metricLabel}>Goal Progress</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#4ade80' }}>{goalMetrics.rawPercentage}%</span>
                        </div>
                        <div style={styles.progressTrack}><div style={styles.progressBar(goalMetrics.percentage)}></div></div>
                        <div style={styles.goalStatusBadge(totalProfit >= profitGoal)}>{totalProfit >= profitGoal ? "🎉 ACHIEVED!" : `₹${goalMetrics.remaining.toLocaleString("en-IN")} To Go`}</div>
                    </div>
                </div>

                <div style={styles.sectionCard}>
                    <h3 style={styles.sectionTitle}>Sales Timeline</h3>
                    <div style={{ height: 350, width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }} />
                                <Line type="monotone" dataKey="sales" stroke="#4ade80" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <hr style={styles.divider} />

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
                    <div style={styles.sectionCard}>
                        <h3 style={styles.sectionTitle}>Top 5 Items</h3>
                        {top5.map((i, idx) => (
                            <div key={idx} style={{ ...styles.itemCard(colorMap[i.name]), marginBottom: "0.75rem", display: "flex", justifyContent: "space-between" }}>
                                <div><div style={styles.itemTitle}>{i.name}</div><div style={styles.itemMeta}>Sold: {i.qty}</div></div>
                                <div style={{ color: "#4ade80", fontWeight: "700" }}>₹{i.profit.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                    <div style={styles.sectionCard}>
                        <h3 style={styles.sectionTitle}>Sales Distribution</h3>
                        <div style={{ height: 300, width: "100%" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={90}>
                                        {pieData.map((_, i) => <Cell key={i} fill={colorMap[pieData[i].name]} />)}
                                    </Pie>
                                    <Legend />
                                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {showCategorySales && (
                    <div style={styles.sectionCard}>
                        <h3 style={styles.sectionTitle}>Itemized Ledger</h3>
                        <div style={styles.gridList}>
                            {categorySales.map((i, idx) => (
                                <div key={idx} style={styles.itemCard(colorMap[i.name])}>
                                    <div style={styles.itemTitle}>{i.name}</div>
                                    <div style={styles.itemMeta}>Qty: {i.qty} | Rev: ₹{i.revenue.toFixed(2)} | Prof: ₹{i.profit.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}