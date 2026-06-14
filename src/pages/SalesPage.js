import { useState, useEffect, useRef } from "react";

export default function SalesPage() {
    const [items, setItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [billNo, setBillNo] = useState(1);
    const [todayBillCount, setTodayBillCount] = useState(0);

    // NOTIFICATION STATE
    const [notification, setNotification] = useState(null);

    // SEARCHABLE DROPDOWN STATES
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // DEPT-ACCOUNT STATES
    const [accounts, setAccounts] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [selectedAccountId, setSelectedAccountId] = useState("");

    const [activeTab, setActiveTab] = useState(null);

    // LONG PRESS QTY MODAL STATE
    const [qtyModal, setQtyModal] = useState(null); // { item, index }
    const [customQty, setCustomQty] = useState("1");
    const longPressTimer = useRef(null);
    const longPressTriggered = useRef(false);

    // HELPER: TRIGGER NOTIFICATION
    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    // HELPER: Get today's date string for comparison
    const getTodayDateString = () => {
        const now = new Date();
        return `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    };

    // HELPER: Count today's bills
    const countTodayBills = (bills) => {
        const todayStr = getTodayDateString();
        return bills.filter(b => b.date && b.date.startsWith(todayStr)).length;
    };

    // ✅ LOAD ITEMS, BILL NUMBER, AND ACCOUNTS
    useEffect(() => {
        const savedItems = localStorage.getItem("items");
        if (savedItems) {
            setItems(JSON.parse(savedItems));
        }

        const savedBills = JSON.parse(localStorage.getItem("bills")) || [];
        setBillNo(savedBills.length + 1);
        setTodayBillCount(countTodayBills(savedBills));

        const savedAccounts = localStorage.getItem("dept_accounts");
        if (savedAccounts) {
            setAccounts(JSON.parse(savedAccounts));
        } else {
            const sampleAccounts = [
                { id: "acc_1", name: "John Doe (Marketing)", balance: 0 },
                { id: "acc_2", name: "Alex Carey (Sales)", balance: 0 },
                { id: "acc_3", name: "Staff Lounge Pantry", balance: 0 }
            ];
            localStorage.setItem("dept_accounts", JSON.stringify(sampleAccounts));
            setAccounts(sampleAccounts);
        }

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const quickAccessItems = items.slice(0, 15);

    const handleSelectItem = (item, index, qty = 1) => {
        if (index !== null) {
            setActiveTab(index);
            setTimeout(() => setActiveTab(null), 100);
        }

        const parsedQty = Math.max(1, parseInt(qty) || 1);
        const existing = cart.find(c => c.name === item.name);

        if (existing) {
            const updated = cart.map(c =>
                c.name === item.name
                    ? { ...c, qty: c.qty + parsedQty }
                    : c
            );
            setCart(updated);
        } else {
            setCart([...cart, { ...item, qty: parsedQty }]);
        }

        setSearchTerm("");
        setIsOpen(false);
    };

    // ── LONG PRESS HANDLERS ──────────────────────────────────────────────────
    const handlePressStart = (item, index) => {
        longPressTriggered.current = false;
        longPressTimer.current = setTimeout(() => {
            longPressTriggered.current = true;
            setCustomQty("1");
            setQtyModal({ item, index });
        }, 600); // 600ms long press
    };

    const handlePressEnd = (item, index) => {
        clearTimeout(longPressTimer.current);
        if (!longPressTriggered.current) {
            // Normal tap → add qty 1
            handleSelectItem(item, index, 1);
        }
    };

    const handlePressCancel = () => {
        clearTimeout(longPressTimer.current);
    };

    const confirmQtyModal = () => {
        const qty = parseInt(customQty);
        if (!qty || qty < 1) {
            showNotification("⚠️ Please enter a valid quantity.");
            return;
        }
        handleSelectItem(qtyModal.item, qtyModal.index, qty);
        setQtyModal(null);
    };
    // ─────────────────────────────────────────────────────────────────────────

    const removeItem = (index) => {
        const updated = cart.filter((_, i) => i !== index);
        setCart(updated);
    };

    const total = cart.reduce(
        (sum, item) => sum + Number(item.price || 0) * item.qty,
        0
    );

    const saveBill = () => {
        if (cart.length === 0) return;

        if (paymentMethod === "Account" && !selectedAccountId) {
            showNotification("⚠️ Please select an Account holder.");
            return;
        }

        const accountName = paymentMethod === "Account"
            ? accounts.find(a => a.id === selectedAccountId)?.name
            : null;

        const bill = {
            billNo,
            items: cart,
            total,
            paymentMethod,
            accountId: paymentMethod === "Account" ? selectedAccountId : null,
            accountName,
            date: new Date().toLocaleString("en-GB")
        };

        const oldBills = JSON.parse(localStorage.getItem("bills")) || [];
        const newBills = [...oldBills, bill];
        localStorage.setItem("bills", JSON.stringify(newBills));

        if (paymentMethod === "Account") {
            const updatedAccounts = accounts.map(acc => {
                if (acc.id === selectedAccountId) {
                    return { ...acc, balance: acc.balance + total };
                }
                return acc;
            });
            localStorage.setItem("dept_accounts", JSON.stringify(updatedAccounts));
            setAccounts(updatedAccounts);
        }

        setCart([]);
        setPaymentMethod("Cash");
        setSelectedAccountId("");
        setBillNo(billNo + 1);
        setTodayBillCount(countTodayBills(newBills));
        showNotification(paymentMethod === "Account" ? `✅ Charged ₹${total} to ${accountName}'s account!` : "✅ Bill Saved Successfully!");
    };

    const printBill = () => {
        if (cart.length === 0) {
            showNotification("⚠️ Cart is empty!");
            return;
        }

        const accountName = paymentMethod === "Account"
            ? accounts.find(a => a.id === selectedAccountId)?.name
            : null;

        const billContent = cart
            .map(i => `<tr>
                <td style="padding: 6px 0;">${i.name} x ${i.qty}</td>
                <td style="text-align: right; padding: 6px 0;">₹${(i.price * i.qty).toFixed(2)}</td>
            </tr>`)
            .join("");

        const win = window.open("", "", "width=400,height=600");
        if (!win) return;

        win.document.write(`
            <html>
            <head>
                <title>Bill #${billNo}</title>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
                    .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 10px; margin-bottom: 15px; }
                    table { width: 100%; border-collapse: collapse; }
                    .total { border-top: 2px dashed #ccc; margin-top: 15px; padding-top: 10px; font-size: 1.2em; font-weight: bold; }
                    .footer { text-align: center; font-size: 0.85em; color: #666; margin-top: 30px; }
                    .badge { display: inline-block; padding: 4px 8px; background: #eee; border-radius: 4px; font-size: 0.9em; margin-top: 5px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>RETAIL SHOP</h2>
                    <p>Bill No: #${billNo}</p>
                    <p>${new Date().toLocaleString("en-GB")}</p>
                    <div class="badge">METHOD: ${paymentMethod === "Account" ? `DEPT-ACCOUNT (${accountName})` : "CASH"}</div>
                </div>
                <table><tbody>${billContent}</tbody></table>
                <div class="total">
                    <div style="display: flex; justify-content: space-between;">
                        <span>GRAND TOTAL:</span>
                        <span>₹${total.toFixed(2)}</span>
                    </div>
                </div>
                <div class="footer"><p>${paymentMethod === "Account" ? "Settlement via Monthly Ledger" : "Thank You For Your Visit!"}</p></div>
                <script>window.onload = function() { window.print(); window.close(); }</script>
            </body>
            </html>
        `);
        win.document.close();
    };

    return (
        <div style={{
    minHeight: '100vh',          // Forces at least the full height of the screen
    width: '100vw',              // Forces full width of the screen
    position: 'fixed',           // Pins it to the screen
    top: 0,
    left: 0,
    backgroundImage: "url('/sales.jpg')",
    backgroundSize: 'cover',     // Scales image to fill entire space
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    overflowY: 'auto'            // Allows scrolling if content is long
}}>
            {/* NOTIFICATION TOAST UI */}
            {notification && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', backgroundColor: '#111827',
                    color: '#ffffff', padding: '1rem 2rem', borderRadius: '0.75rem',
                    fontWeight: 'bold', boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    zIndex: 9999, animation: 'fadeIn 0.3s ease-out'
                }}>
                    {notification}
                </div>
            )}

            {/* ── LONG PRESS QTY MODAL ─────────────────────────────────────── */}
            {qtyModal && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 10000, animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff', borderRadius: '1rem',
                        padding: '2rem', width: 'min(90vw, 340px)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
                        border: '2px solid #111827', textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>📦</div>
                        <h3 style={{ margin: '0 0 0.25rem', color: '#111827', fontSize: '1.15rem', fontWeight: '800' }}>
                            {qtyModal.item.name}
                        </h3>
                        <p style={{ margin: '0 0 1.25rem', color: '#6b7280', fontSize: '0.9rem', fontWeight: '600' }}>
                            ₹{qtyModal.item.price} per unit — set quantity
                        </p>
                        <input
                            type="number"
                            min="1"
                            autoFocus
                            value={customQty}
                            onChange={(e) => setCustomQty(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') confirmQtyModal(); if (e.key === 'Escape') setQtyModal(null); }}
                            style={{
                                width: '100%', padding: '0.85rem', fontSize: '1.6rem',
                                fontWeight: '900', textAlign: 'center',
                                border: '2px solid #111827', borderRadius: '0.6rem',
                                outline: 'none', boxSizing: 'border-box',
                                color: '#111827', marginBottom: '1.25rem'
                            }}
                        />
                        {/* Quick qty shortcuts */}
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                            {[2, 5, 10, 12, 24].map(q => (
                                <button key={q} onClick={() => setCustomQty(String(q))} style={{
                                    padding: '0.4rem 0.85rem', borderRadius: '0.5rem',
                                    border: '2px solid #111827', backgroundColor: customQty === String(q) ? '#111827' : '#f9fafb',
                                    color: customQty === String(q) ? '#fff' : '#111827',
                                    fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer'
                                }}>{q}</button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => setQtyModal(null)} style={{
                                flex: 1, padding: '0.75rem', borderRadius: '0.6rem',
                                border: '2px solid #d1d5db', backgroundColor: '#f9fafb',
                                fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', color: '#374151'
                            }}>Cancel</button>
                            <button onClick={confirmQtyModal} style={{
                                flex: 2, padding: '0.75rem', borderRadius: '0.6rem',
                                border: 'none', backgroundColor: '#22c55e',
                                fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', color: '#fff',
                                boxShadow: '0 4px 12px rgba(34,197,94,0.35)'
                            }}>Add to Cart</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                .qty-modal-pop { animation: modalPop 0.2s cubic-bezier(.34,1.56,.64,1); }
                @keyframes modalPop { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
            `}</style>

            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: 'clamp(1rem, 2.5vw, 2rem)',
                borderRadius: '1rem',
                boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.4)',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: '700', color: '#22c55e', margin: 0 }}>Sales System</h1>
                    {/* TODAY'S BILL COUNT BADGE */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                        <div style={{ backgroundColor: '#22c55e', color: '#ffffff', padding: '0.6rem 1.5rem', borderRadius: '0.75rem', fontWeight: '700', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)', fontSize: '1.1rem' }}>
                            Bill #{billNo}
                        </div>
                        <div style={{ backgroundColor: 'rgba(0,0,0,0.45)', color: '#d1fae5', padding: '0.25rem 0.85rem', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '0.04em' }}>
                            {todayBillCount} bill{todayBillCount !== 1 ? 's' : ''} today
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '2.5rem', zIndex: '100', position: 'relative' }}>
                    {items.length === 0 ? (
                        <p style={{ color: '#111827', fontStyle: 'italic', fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '6px', display: 'inline-block' }}>No products found. Please add products to inventory first.</p>
                    ) : (
                        <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
                            <div style={{ position: 'relative' }}>
                                <input type="text" placeholder="🔍 Search all inventory products here..." value={searchTerm} onFocus={() => setIsOpen(true)} onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }} style={{ width: '100%', padding: '1.1rem 1.5rem', borderRadius: '0.75rem', border: '2px solid #111827', fontSize: '1.1rem', fontWeight: '600', outline: 'none', boxSizing: 'border-box', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }} />
                                <span style={{ position: 'absolute', right: '1.25rem', top: '38%', color: '#111827', pointerEvents: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>{isOpen ? "▲" : "▼"}</span>
                            </div>
                            {isOpen && (
                                <div style={{ position: 'absolute', top: '105%', left: 0, width: '100%', backgroundColor: '#ffffff', border: '2px solid #111827', borderRadius: '0.75rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)', maxHeight: '260px', overflowY: 'auto', zIndex: 999, marginTop: '4px' }}>
                                    {filteredItems.length === 0 ? (
                                        <div style={{ padding: '1rem', color: '#ef4444', fontStyle: 'italic', fontSize: '0.95rem', fontWeight: '700' }}>No items match your search term.</div>
                                    ) : (
                                        filteredItems.map((item, index) => (
                                            <div key={index} onClick={() => handleSelectItem(item, null)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', cursor: 'pointer', borderBottom: index !== filteredItems.length - 1 ? '1px solid #e5e7eb' : 'none', transition: 'background-color 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                <span style={{ fontWeight: '700', color: '#111827' }}>{item.name}</span>
                                                <span style={{ backgroundColor: '#111827', color: '#ffffff', padding: '0.25rem 0.6rem', borderRadius: '0.375rem', fontWeight: '700', fontSize: '0.9rem' }}>₹{item.price}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: '#ffffff', textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)' }}>⚡ QUICK ACCESS TABS (TOP 15 ITEMS)</h2>
                            <span style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>Hold to set qty</span>
                        </div>
                        {items.length === 0 ? (
                            <p style={{ color: '#111827', fontStyle: 'italic', fontSize: '0.95rem', fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '6px' }}>No inventory items available to generate tabs.</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(110px, 25vw, 140px), 1fr))', gap: '0.75rem', width: '100%' }}>
                                {quickAccessItems.map((item, index) => {
                                    const isPressed = activeTab === index;
                                    return (
                                        <button
                                            key={index}
                                            // Mouse events
                                            onMouseDown={() => handlePressStart(item, index)}
                                            onMouseUp={() => handlePressEnd(item, index)}
                                            onMouseLeave={handlePressCancel}
                                            // Touch events (mobile)
                                            onTouchStart={(e) => { e.preventDefault(); handlePressStart(item, index); }}
                                            onTouchEnd={(e) => { e.preventDefault(); handlePressEnd(item, index); }}
                                            onTouchCancel={handlePressCancel}
                                            style={{
                                                backgroundColor: isPressed ? '#15803d' : '#22c55e',
                                                border: '2px solid #111827',
                                                borderRadius: '0.75rem',
                                                padding: 'clamp(0.75rem, 2vw, 1.1rem) 0.5rem',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                outline: 'none',
                                                transform: isPressed ? 'scale(0.92)' : 'none',
                                                transition: 'all 0.08s ease-out',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                                                WebkitTapHighlightColor: 'transparent',
                                                userSelect: 'none'
                                            }}
                                        >
                                            <span style={{ fontWeight: '800', color: '#ffffff', fontSize: '1.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.4)', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                                            <span style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>₹{item.price}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div style={{ backgroundColor: '#fdfbf7', padding: '1.5rem', borderRadius: '0.75rem', border: '2px solid #111827', backdropFilter: 'blur(6px)', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#111827' }}>Current Order</h2>
                        <div style={{ minHeight: '150px', maxHeight: '250px', overflowY: 'auto', marginBottom: '1rem' }}>
                            {cart.length === 0 ? (
                                <p style={{ color: '#111827', textAlign: 'center', paddingTop: '3rem', fontStyle: 'italic', fontWeight: '700' }}>Cart is currently empty.</p>
                            ) : (
                                cart.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '2px solid #111827' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '800', color: '#111827', fontSize: '1.05rem' }}>{item.name}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#111827', fontWeight: '700' }}>₹{item.price} x {item.qty}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{ fontWeight: '900', color: '#111827', fontSize: '1.1rem' }}>₹{item.price * item.qty}</span>
                                            <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: '900', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div style={{ borderTop: '2px solid #111827', paddingTop: '1rem', marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: '800', marginBottom: '0.5rem', color: '#111827', fontSize: '0.95rem' }}>PAYMENT OPTION</label>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <button onClick={() => setPaymentMethod("Cash")} style={{ flex: 1, minWidth: '130px', padding: '0.65rem', borderRadius: '0.5rem', border: '2px solid #111827', cursor: 'pointer', fontWeight: '800', fontSize: '0.95rem', backgroundColor: paymentMethod === 'Cash' ? '#111827' : '#fffdf9', color: paymentMethod === 'Cash' ? '#fff' : '#111827', transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>💵 Immediate Cash</button>
                                <button onClick={() => setPaymentMethod("Account")} style={{ flex: 1, minWidth: '130px', padding: '0.65rem', borderRadius: '0.5rem', border: '2px solid #111827', cursor: 'pointer', fontWeight: '800', fontSize: '0.95rem', backgroundColor: paymentMethod === 'Account' ? '#111827' : '#fffdf9', color: paymentMethod === 'Account' ? '#fff' : '#111827', transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>📋 Dept-Account</button>
                            </div>
                            {paymentMethod === "Account" && (
                                <div style={{ marginTop: '0.75rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#111827', marginBottom: '0.25rem', fontWeight: '700' }}>Select Account Holder:</label>
                                    <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', border: '2px solid #111827', fontSize: '0.95rem', fontWeight: '700', outline: 'none', backgroundColor: '#fffdf9', color: '#111827' }}>
                                        <option value="">-- Choose Name / Dept --</option>
                                        {accounts.map(acc => (<option key={acc.id} value={acc.id}>{acc.name} (Owes: ₹{acc.balance})</option>))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div style={{ borderTop: '2px solid #111827', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#111827' }}>Total Amount:</span>
                            <span style={{ fontSize: '2rem', fontWeight: '900', color: '#16a34a' }}>₹{total.toLocaleString('en-IN')}</span>
                        </div>
                        <div style={{ marginTop: '1.5rem' }}>
                            <button onClick={saveBill} disabled={cart.length === 0 || (paymentMethod === "Account" && !selectedAccountId)} style={{ width: '100%', backgroundColor: (cart.length === 0 || (paymentMethod === "Account" && !selectedAccountId)) ? '#9ca3af' : '#111827', color: '#ffffff', padding: '0.9rem', borderRadius: '0.75rem', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: (cart.length === 0 || (paymentMethod === "Account" && !selectedAccountId)) ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.15)' }}>Save Bill</button>
                            <button onClick={printBill} disabled={cart.length === 0 || (paymentMethod === "Account" && !selectedAccountId)} style={{ width: '100%', backgroundColor: (cart.length === 0 || (paymentMethod === "Account" && !selectedAccountId)) ? '#d1d5db' : '#16a34a', color: (cart.length === 0 || (paymentMethod === "Account" && !selectedAccountId)) ? '#9ca3af' : '#ffffff', padding: '0.9rem', borderRadius: '0.75rem', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: (cart.length === 0 || (paymentMethod === "Account" && !selectedAccountId)) ? 'not-allowed' : 'pointer', marginTop: '0.75rem', transition: 'background-color 0.2s', boxShadow: '0 4px 6px rgba(22,163,74,0.2)' }}>Print Invoice</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}