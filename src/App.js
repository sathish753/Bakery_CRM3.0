import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from "react-router-dom";
import './index.css';

// PAGE IMPORTS
import SalesPage from "./pages/SalesPage";
import ItemsPage from "./pages/ItemsPage";
import ReportsPage from "./pages/ReportsPage";
import ExpensePage from "./pages/ExpensePage";
import Dashboard from "./pages/Dashboard";
import DeptAccountPage from "./pages/DeptAccountPage";
import LoginPage from "./pages/LoginPage";
import ProfitFixer from "./pages/ProfitFixer";
import CreditPage from "./pages/credit";

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem("isLoggedIn") === "true");
  const [userRole, setUserRole] = useState(() => sessionStorage.getItem("userRole") || "");
  
  const location = useLocation();
  const isAdmin = userRole === "admin";

  const routeColors = {
    "/": "#ffffff",
    "/items": "#00ff88",
    "/dept-account": "#3b82f6",
    "/reports": "#fbbf24",
    "/expense": "#f87171",
    "/credit": "#a78bfa",
    "/dashboard": "#22d3ee",
    "/profit-fixer": "#fb7185"
  };

  const activeColor = routeColors[location.pathname] || "#ffffff";

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userRole", role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("");
    sessionStorage.clear();
    window.location.reload();
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      <div className={`overlay ${isSidebarOpen ? 'show' : ''}`} onClick={() => setIsSidebarOpen(false)} />

      <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
        <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { to: "/", label: "Sales" },
              { to: "/items", label: "Items" },
              { to: "/dept-account", label: "Dept Account" },
              { to: "/expense", label: "Expense" },        // Now accessible to Staff
              { to: "/credit", label: "Credit" },       // Now accessible to Staff
              { to: "/reports", label: "Reports", admin: true },
              { to: "/dashboard", label: "Dashboard", admin: true },
              { to: "/profit-fixer", label: "Profit Fixer", admin: true },
            ].map((item) => {
              if (item.admin && !isAdmin) return null;
              return (
                <NavLink 
                  key={item.to}
                  to={item.to} 
                  onClick={() => setIsSidebarOpen(false)} 
                  style={({ isActive }) => ({
                    color: isActive ? '#00ff88' : '#fff',
                    textDecoration: 'none',
                    fontWeight: isActive ? 'bold' : 'normal'
                  })}
                >
                  {item.label}
                </NavLink>
              );
            })}
            <button onClick={handleLogout} style={{ marginTop: '2rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem', cursor: 'pointer' }}>Logout</button>
          </div>
        </nav>

        <main style={{ flex: 1, padding: '2rem', position: 'relative' }}>
          <button 
            className="menu-btn" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ 
              borderColor: activeColor,
              boxShadow: `0 0 15px ${activeColor}80`
            }}
          >
            <span style={{ backgroundColor: activeColor }}></span>
            <span style={{ backgroundColor: activeColor }}></span>
            <span style={{ backgroundColor: activeColor }}></span>
          </button>
          
          <Routes>
            {/* Accessible to all logged-in users */}
            <Route path="/" element={<SalesPage />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/dept-account" element={<DeptAccountPage />} />
            <Route path="/expense" element={<ExpensePage />} />
            <Route path="/credit" element={<CreditPage />} />
            
            {/* Admin ONLY */}
            <Route path="/reports" element={isAdmin ? <ReportsPage /> : <Navigate to="/" />} />
            <Route path="/dashboard" element={isAdmin ? <Dashboard /> : <Navigate to="/" />} />
            <Route path="/profit-fixer" element={isAdmin ? <ProfitFixer /> : <Navigate to="/" />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}