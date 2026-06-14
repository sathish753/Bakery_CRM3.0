import { useState, useEffect } from "react";

export default function DeptAccountPage() {
    const [accounts, setAccounts] = useState([]);
    const [bills, setBills] = useState([]);
    const [repayments, setRepayments] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [activeTab, setActiveTab] = useState("purchases");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [accountNameInput, setAccountNameInput] = useState("");

    // ✅ LOAD DATA
    useEffect(() => {
        const savedAccounts = JSON.parse(localStorage.getItem("dept_accounts")) || [];
        const savedBills = JSON.parse(localStorage.getItem("bills")) || [];
        const savedRepayments = JSON.parse(localStorage.getItem("repayments")) || [];
        setAccounts(savedAccounts);
        setBills(savedBills);
        setRepayments(savedRepayments);
    }, []);

    const getBillCount = (accountId) => {
        return bills.filter(bill => bill.accountId === accountId).length;
    };

    const handleSaveAccount = (e) => {
        e.preventDefault();
        if (!accountNameInput.trim()) {
            alert("Please enter a valid name.");
            return;
        }

        let updatedAccounts;
        if (editingAccount) {
            updatedAccounts = accounts.map(acc => {
                if (acc.id === editingAccount.id) {
                    return { ...acc, name: accountNameInput.trim() };
                }
                return acc;
            });
            if (selectedAccount && selectedAccount.id === editingAccount.id) {
                setSelectedAccount({ ...selectedAccount, name: accountNameInput.trim() });
            }
        } else {
            const newAccount = {
                id: `acc_${Date.now()}`,
                name: accountNameInput.trim(),
                balance: 0
            };
            updatedAccounts = [...accounts, newAccount];
        }

        localStorage.setItem("dept_accounts", JSON.stringify(updatedAccounts));
        setAccounts(updatedAccounts);
        closeModal();
    };

    // 🆕 SAFE DELETE FUNCTION WITH BALANCE SAFEGUARD
    const handleDeleteAccount = (accountToDelete) => {
        if (accountToDelete.balance > 0) {
            alert(`Cannot delete ${accountToDelete.name}. They still have an outstanding balance of ₹${accountToDelete.balance.toFixed(2)}. Please settle their dues first!`);
            return;
        }

        const confirmDelete = window.confirm(`Are you sure you want to permanently delete the account holder "${accountToDelete.name}"? This action cannot be undone.`);
        if (!confirmDelete) return;

        // Filter out the deleted account
        const updatedAccounts = accounts.filter(acc => acc.id !== accountToDelete.id);
        
        // Optional: Clean up their bills and repayments to save localStorage space
        const updatedBills = bills.filter(bill => bill.accountId !== accountToDelete.id);
        const updatedRepayments = repayments.filter(pay => pay.accountId !== accountToDelete.id);

        localStorage.setItem("dept_accounts", JSON.stringify(updatedAccounts));
        localStorage.setItem("bills", JSON.stringify(updatedBills));
        localStorage.setItem("repayments", JSON.stringify(updatedRepayments));

        setAccounts(updatedAccounts);
        setBills(updatedBills);
        setRepayments(updatedRepayments);

        // Deselect if the currently active pane belonged to the deleted user
        if (selectedAccount?.id === accountToDelete.id) {
            setSelectedAccount(null);
        }

        alert("Account holder deleted successfully.");
    };

    const openModal = (account = null) => {
        if (account) {
            setEditingAccount(account);
            setAccountNameInput(account.name);
        } else {
            setEditingAccount(null);
            setAccountNameInput("");
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAccount(null);
        setAccountNameInput("");
    };

    const handlePayment = (accountId) => {
        const amountToPay = Number(paymentAmount);
        if (!amountToPay || amountToPay <= 0) {
            alert("Please enter a valid payment amount.");
            return;
        }

        let currentBalance = 0;
        const updatedAccounts = accounts.map(acc => {
            if (acc.id === accountId) {
                if (amountToPay > acc.balance) {
                    alert(`Warning: Payment exceeds current balance of ₹${acc.balance}`);
                    return acc;
                }
                currentBalance = acc.balance - amountToPay;
                return { ...acc, balance: currentBalance };
            }
            return acc;
        });

        const newRepayment = {
            id: `pay_${Date.now()}`,
            accountId: accountId,
            amountPaid: amountToPay,
            remainingBalance: currentBalance,
            date: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
        };

        const updatedRepayments = [newRepayment, ...repayments];

        localStorage.setItem("dept_accounts", JSON.stringify(updatedAccounts));
        localStorage.setItem("repayments", JSON.stringify(updatedRepayments));
        
        setAccounts(updatedAccounts);
        setRepayments(updatedRepayments);
        
        if (selectedAccount && selectedAccount.id === accountId) {
            setSelectedAccount({ ...selectedAccount, balance: currentBalance });
        }

        setPaymentAmount("");
    };

    const accountHistory = bills.filter(bill => bill.accountId === selectedAccount?.id);
    const accountRepayments = repayments.filter(pay => pay.accountId === selectedAccount?.id);

    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundImage: `url('/dept account.jpg')`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            backgroundRepeat: 'no-repeat', 
            backgroundColor: '#f8fafc', // Fallback color while image loads
            padding: '2.5rem' 
        }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                
                {/* PAGE HEADER */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>
                            📋 Dept-Account Ledger
                        </h1>
                        <p style={{ color: '#000000', marginTop: '0.35rem', fontSize: '1rem' }}>Manage consumer credit logs, track store tabs, and record payments.</p>
                    </div>
                    <button 
                        onClick={() => openModal(null)}
                        style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '0.75rem 1.5rem', borderRadius: '0.625rem', border: 'none', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}
                    >
                        ＋ Add Customer
                    </button>
                </div>

                {/* MAIN SPLIT GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
                    
                    {/* LEFT PANEL: ACCOUNT HOLDERS */}
                    <div style={{ backgroundColor: '#ffffff', padding: '1.75rem', borderRadius: '1.25rem', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.05)', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#1e293b' }}>Account Holders</h2>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.25rem 0.75rem', borderRadius: '0.5rem' }}>
                                Total: {accounts.length}
                            </span>
                        </div>
                        
                        {accounts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                No active customer accounts found.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {accounts.map(acc => {
                                    const billCount = getBillCount(acc.id);
                                    const isSelected = selectedAccount?.id === acc.id;
                                    const hasDebt = acc.balance > 0;

                                    return (
                                        <div 
                                            key={acc.id}
                                            onClick={() => setSelectedAccount(acc)}
                                            style={{ 
                                                padding: '1.25rem', 
                                                borderRadius: '1rem', 
                                                backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                position: 'relative',
                                                transition: 'all 0.2s ease',
                                                border: isSelected ? '1px solid #cbd5e1' : '1px solid #f1f5f9',
                                                borderLeft: hasDebt 
                                                    ? `6px solid ${isSelected ? '#ef4444' : '#f87171'}` 
                                                    : `6px solid ${isSelected ? '#10b981' : '#34d399'}`,
                                                boxShadow: isSelected ? 'inset 0 2px 4px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)' : '0 2px 4px rgba(0,0,0,0.01)'
                                            }}
                                        >
                                            {/* LEFT SUB-SECTION */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, paddingRight: '0.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                                                    <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.05rem' }}>{acc.name}</span>
                                                    <span style={{ backgroundColor: billCount > 0 ? '#e2e8f0' : '#f1f5f9', color: billCount > 0 ? '#334155' : '#94a3b8', fontSize: '0.75rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '0.5rem' }}>
                                                        {billCount} {billCount === 1 ? 'bill' : 'bills'}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                                                    <span>ID: <code style={{ fontFamily: 'monospace', color: '#475569' }}>{acc.id.replace('acc_', '')}</code></span>
                                                    <span style={{ color: '#cbd5e1' }}>|</span>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openModal(acc);
                                                        }}
                                                        style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: '600', padding: 0, fontSize: '0.8rem' }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <span style={{ color: '#cbd5e1' }}>|</span>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteAccount(acc);
                                                        }}
                                                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: '600', padding: 0, fontSize: '0.8rem' }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>

                                            {/* RIGHT SUB-SECTION */}
                                            <div style={{ textAlign: 'right', minWidth: '90px' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.1rem' }}>
                                                    {hasDebt ? "Due Tab" : "Settled"}
                                                </div>
                                                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: hasDebt ? '#dc2626' : '#16a34a' }}>
                                                    ₹{acc.balance.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* RIGHT PANEL: ACTIONS & STATEMENTS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1.3 }}>
                        {selectedAccount ? (
                            <>
                                {/* BALANCE CARD */}
                                <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '1.25rem', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.05)', border: '1px solid #e2e8f0' }}>
                                    <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>{selectedAccount.name}</h2>
                                    <div style={{ padding: '1.25rem', backgroundColor: selectedAccount.balance > 0 ? '#fef2f2' : '#f0fdf4', borderRadius: '0.75rem', border: selectedAccount.balance > 0 ? '1px solid #fee2e2' : '1px solid #dcfce7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600', color: selectedAccount.balance > 0 ? '#991b1b' : '#166534' }}>Outstanding Tabs:</span>
                                        <span style={{ fontSize: '1.75rem', fontWeight: '900', color: selectedAccount.balance > 0 ? '#dc2626' : '#16a34a' }}>₹{selectedAccount.balance.toFixed(2)}</span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
                                        <input 
                                            type="number" 
                                            placeholder="Enter cash payment amount"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            style={{ flex: 1, padding: '0.75rem', borderRadius: '0.625rem', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                                        />
                                        <button 
                                            onClick={() => handlePayment(selectedAccount.id)}
                                            style={{ backgroundColor: '#10b981', color: '#ffffff', padding: '0.75rem 1.5rem', borderRadius: '0.625rem', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                                        >
                                            Record Repayment
                                        </button>
                                    </div>
                                </div>

                                {/* ITEMIZED STATEMENTS */}
                                <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '1.25rem', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', borderBottom: '2px solid #f1f5f9', marginBottom: '1.25rem', gap: '1.5rem' }}>
                                        <button 
                                            onClick={() => setActiveTab("purchases")}
                                            style={{ padding: '0.6rem 0.5rem', fontSize: '1rem', fontWeight: '700', border: 'none', background: 'none', cursor: 'pointer', color: activeTab === "purchases" ? "#2563eb" : "#64748b", borderBottom: activeTab === "purchases" ? "3px solid #2563eb" : "3px solid transparent", marginBottom: '-2px' }}
                                        >
                                            🛒 Purchases ({accountHistory.length})
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab("repayments")}
                                            style={{ padding: '0.6rem 0.5rem', fontSize: '1rem', fontWeight: '700', border: 'none', background: 'none', cursor: 'pointer', color: activeTab === "repayments" ? "#2563eb" : "#64748b", borderBottom: activeTab === "repayments" ? "3px solid #2563eb" : "3px solid transparent", marginBottom: '-2px' }}
                                        >
                                            💸 Repayments ({accountRepayments.length})
                                        </button>
                                    </div>

                                    <div style={{ maxHeight: '440px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        {activeTab === "purchases" && (
                                            accountHistory.length === 0 ? (
                                                <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>No purchase statements logged.</p>
                                            ) : (
                                                accountHistory.map((bill, index) => (
                                                    <div key={index} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.85rem', padding: '1.25rem', borderBottom: '4px solid #cbd5e1' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                                                            <span style={{ fontWeight: '700', color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '0.375rem', fontSize: '0.85rem' }}>Bill #{bill.billNo || (index + 1)}</span>
                                                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>🕒 {bill.date}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                            {bill.items.map((item, idx) => (
                                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                                                                    <div>
                                                                        <span style={{ fontWeight: '600', color: '#334155' }}>{item.name}</span>
                                                                        <span style={{ backgroundColor: '#e2e8f0', color: '#475569', fontSize: '0.75rem', fontWeight: '700', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', marginLeft: '0.5rem' }}>x{item.qty}</span>
                                                                    </div>
                                                                    <span style={{ fontWeight: '600', color: '#1e293b' }}>₹{(item.price * item.qty).toFixed(2)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', alignItems: 'center' }}>
                                                            <span style={{ fontWeight: '600', fontSize: '0.95rem', color: '#64748b' }}>Invoice Total</span>
                                                            <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#0f172a' }}>₹{bill.total.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )
                                        )}

                                        {activeTab === "repayments" && (
                                            accountRepayments.length === 0 ? (
                                                <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>No payments recorded yet.</p>
                                            ) : (
                                                accountRepayments.map((pay) => (
                                                    <div key={pay.id} style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.85rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '5px solid #16a34a' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontWeight: '700', color: '#166534', fontSize: '1rem' }}>💸 Repayment Received</span>
                                                            <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: '600' }}>📅 {pay.date}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', borderTop: '1px dashed #bbf7d0', paddingTop: '0.5rem', fontSize: '0.95rem' }}>
                                                            <span style={{ color: '#14532d' }}>Amount Paid:</span>
                                                            <span style={{ fontWeight: '800', color: '#14532d' }}>+ ₹{pay.amountPaid.toFixed(2)}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#475569' }}>
                                                            <span>Remaining Balance:</span>
                                                            <span>₹{pay.remainingBalance.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ backgroundColor: '#ffffff', padding: '4rem 2rem', borderRadius: '1.25rem', border: '2px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                                Select an account holder from the ledger list to manage statements.
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* MANAGEMENT MODAL */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '1.25rem', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.25rem', color: '#0f172a', letterSpacing: '-0.025em' }}>
                            {editingAccount ? "✏️ Edit Customer Name" : "👤 Create Customer Account"}
                        </h3>
                        <form onSubmit={handleSaveAccount}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>
                                    Full Name / Identifier
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. John Doe (Marketing)" 
                                    value={accountNameInput} 
                                    onChange={(e) => setAccountNameInput(e.target.value)} 
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.625rem', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', boxSizing: 'border-box' }}
                                    autoFocus
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button 
                                    type="button" 
                                    onClick={closeModal} 
                                    style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    {editingAccount ? "Save Changes" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}