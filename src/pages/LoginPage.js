import { useState } from "react";

export default function LoginPage({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState("idle"); // "idle" | "success" | "error"
    const [isShaking, setIsShaking] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (username === "admin" && password === "admin123") {
            setStatus("success");
            setTimeout(() => onLogin("admin"), 2500); 
        } else if (username === "staff" && password === "staff123") {
            setStatus("success");
            setTimeout(() => onLogin("staff"), 2500);
        } else {
            setStatus("error");
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 600);
        }
    };

    const animationStyles = `
        /* ================= ARTISAN BREAD FLOATING ANIMATIONS ================= */
        @keyframes floatBreadSlow {
            0% { transform: translateY(0px) rotate(0deg) scale(1); }
            50% { transform: translateY(-20px) rotate(8deg) scale(1.02); }
            100% { transform: translateY(0px) rotate(0deg) scale(1); }
        }
        @keyframes floatBreadFast {
            0% { transform: translateY(0px) rotate(0deg) scale(1); }
            50% { transform: translateY(-35px) rotate(-12deg) scale(0.98); }
            100% { transform: translateY(0px) rotate(0deg) scale(1); }
        }

        /* ================= MASCOT INTERACTION KEYFRAMES ================= */
        @keyframes masterCardShake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
            20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        
        @keyframes gentleBob {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
        }

        @keyframes cookieDance {
            0% { transform: scale(1) rotate(0deg); }
            15% { transform: scale(1.2) translateY(-10px) rotate(-15deg); }
            30% { transform: scale(1.2) translateY(-10px) rotate(15deg); }
            45% { transform: scale(1.2) translateY(-10px) rotate(-15deg); }
            60% { transform: scale(1.2) translateY(-10px) rotate(15deg); }
            75% { transform: scale(1.3) rotate(360deg); }
            100% { transform: scale(1.1) translateY(0) rotate(360deg); }
        }

        @keyframes sparklePop {
            0%, 100% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); opacity: 1; }
        }

        @keyframes cupVibrate {
            0%, 100% { transform: rotate(0deg) scale(1); }
            10%, 30%, 50%, 70%, 90% { transform: rotate(-4deg) scale(1.05); }
            20%, 40%, 60%, 80% { transform: rotate(4deg) scale(1.05); }
        }

        @keyframes eruptionSpill {
            0% { height: 0px; opacity: 0; transform: scaleX(0.5); }
            20% { height: 25px; opacity: 1; transform: scaleX(1); }
            100% { height: 55px; opacity: 0.9; transform: scaleX(1.1); background-color: #fca5a5; }
        }

        .bakery-input {
            width: 100%;
            padding: 0.9rem 1.2rem;
            border-radius: 0.75rem;
            outline: none;
            font-size: 1rem;
            box-sizing: border-box;
            transition: all 0.2s ease;
        }
        .bakery-input:focus {
            background-color: #ffffff !important;
            border-color: #7f5539 !important;
            box-shadow: 0 0 0 4px rgba(127, 85, 57, 0.15) !important;
        }
    `;

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: status === "success" ? "#e8f5e9" : status === "error" ? "#ffebee" : "#ecdcb9",
            backgroundImage: 'radial-gradient(rgba(67, 40, 24, 0.05) 1px, transparent 0)',
            backgroundSize: '24px 24px',
            fontFamily: "'Segoe UI', Roboto, sans-serif",
            boxSizing: 'border-box',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            transition: 'background-color 0.8s ease'
        }}>
            <style>{animationStyles}</style>

            {/* ================= DYNAMIC ARTISAN BREAD BACKGROUND LOAVES ================= */}
            
            {/* 🥖 Loaf 1: Seeded Whole Grain Boule (Top Left) */}
            <div style={{
                position: 'absolute', top: '8%', left: '5%', width: '190px', height: '150px',
                background: 'radial-gradient(circle at 30% 30%, #a27b5c, #6f4e37 80%)',
                borderRadius: '60% 50% 75% 55%', opacity: 0.75, boxShadow: 'inset -15px -15px 30px rgba(0,0,0,0.4), 0 20px 40px rgba(0,0,0,0.15)',
                animation: 'floatBreadSlow 9s ease-in-out infinite', zIndex: 2, display: 'flex', flexWrap: 'wrap', padding: '15px', boxSizing: 'border-box', gap: '8px', contentVisibility: 'auto'
            }}>
                {/* Simulated Sunflower Seeds/Grains */}
                {[...Array(12)].map((_, i) => <div key={i} style={{ width: '8px', height: '14px', backgroundColor: '#e6ccb2', borderRadius: '50%', transform: `rotate(${i * 30}deg)`, opacity: 0.8 }} />)}
            </div>

            {/* 🍞 Loaf 2: Powdered Flour Crust Loaf (Bottom Right) */}
            <div style={{
                position: 'absolute', bottom: '6%', right: '4%', width: '220px', height: '170px',
                background: 'linear-gradient(135deg, #8b5a2b, #4a2c11)',
                borderRadius: '50% 65% 60% 55%', opacity: 0.7, boxShadow: 'inset -20px -20px 40px rgba(0,0,0,0.5), 0 25px 45px rgba(0,0,0,0.2)',
                animation: 'floatBreadFast 11s ease-in-out infinite', zIndex: 2, overflow: 'hidden'
            }}>
                {/* Simulated Flour Dusting & Artisan Crust Scores */}
                <div style={{ position: 'absolute', width: '140%', height: '40px', background: 'rgba(255,255,255,0.25)', top: '20%', left: '-20%', transform: 'rotate(-25deg)', filter: 'blur(4px)' }} />
                <div style={{ position: 'absolute', width: '140%', height: '6px', background: '#361c05', top: '45%', left: '-20%', transform: 'rotate(-20deg)', boxShadow: '0 2px 4px rgba(255,255,255,0.2)' }} />
                <div style={{ position: 'absolute', width: '140%', height: '6px', background: '#361c05', top: '65%', left: '-20%', transform: 'rotate(-20deg)' }} />
            </div>

            {/* 🥯 Loaf 3: Crispy Oats Crust Roll (Top Right) */}
            <div style={{
                position: 'absolute', top: '12%', right: '8%', width: '150px', height: '120px',
                background: 'radial-gradient(circle at 40% 40%, #b08968, #5c3d24)',
                borderRadius: '55% 55% 50% 50%', opacity: 0.75, boxShadow: 'inset -10px -10px 25px rgba(0,0,0,0.45), 0 15px 35px rgba(0,0,0,0.15)',
                animation: 'floatBreadFast 7.5s ease-in-out infinite', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}>
                {/* Crusted Texture Specks */}
                <div style={{ width: '80%', height: '80%', border: '2px dashed rgba(230, 204, 178, 0.4)', borderRadius: '50%' }} />
            </div>

            {/* 🥖 Loaf 4: Extra Small Drift Bun (Bottom Left) */}
            <div style={{
                position: 'absolute', bottom: '18%', left: '10%', width: '110px', height: '90px',
                background: 'radial-gradient(circle at 30% 30%, #9c6644, #46250f)',
                borderRadius: '50%', opacity: 0.65, boxShadow: 'inset -8px -8px 20px rgba(0,0,0,0.5), 0 10px 25px rgba(0,0,0,0.15)',
                animation: 'floatBreadSlow 6s ease-in-out infinite', zIndex: 2
            }} />


            {/* ================= CORE CARD CONTAINER PANEL ================= */}
            <div style={{
                backgroundColor: status === "success" ? "rgba(240, 253, 244, 0.95)" : status === "error" ? "rgba(254, 242, 242, 0.95)" : "rgba(255, 255, 255, 0.92)",
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: status === "success" ? "2px solid #22c55e" : status === "error" ? "2px solid #ef4444" : "2px solid rgba(255, 255, 255, 0.6)",
                padding: '3rem 2.5rem',
                borderRadius: '2rem',
                boxShadow: status === "success" ? "0 30px 60px -10px rgba(34, 197, 94, 0.35)" : status === "error" ? "0 30px 60px -10px rgba(239, 68, 68, 0.45)" : "0 30px 60px -15px rgba(43, 24, 16, 0.25)",
                width: '100%',
                maxWidth: '410px',
                textAlign: 'center',
                animation: isShaking ? 'masterCardShake 0.5s ease-in-out' : 'none',
                transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                zIndex: 5
            }}>

                {/* ================= MASCOT ANIMATION DECK ================= */}
                <div style={{ 
                    height: '100px', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'flex-end', 
                    gap: '2.5rem',
                    marginBottom: '1.5rem',
                    position: 'relative'
                }}>
                    
                    {/* LEFT MASCOT: THE PASTRY / DANCING COOKIE */}
                    <div style={{ position: 'relative' }}>
                        {status === "success" && (
                            <span style={{
                                position: 'absolute', top: '-15px', left: '-10px', fontSize: '1.2rem',
                                animation: 'sparklePop 1s infinite steps(2)'
                            }}>✨</span>
                        )}
                        <div style={{
                            fontSize: '3.8rem',
                            lineHeight: '1',
                            display: 'inline-block',
                            animation: status === "success" ? 'cookieDance 2s cubic-bezier(0.25, 1, 0.5, 1) infinite' : 'gentleBob 3s ease-in-out infinite',
                        }}>
                            {status === "success" ? "🍪" : "🥐"}
                        </div>
                        {status === "success" && (
                            <div style={{ fontWeight: 'bold', color: '#16a34a', fontSize: '0.75rem', marginTop: '-4px' }}>
                                ¡YAY! 🕺
                            </div>
                        )}
                    </div>

                    {/* RIGHT MASCOT: THE COLD DRINK WITH OVERFLOW ERUPTION */}
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {status === "error" && (
                            <div style={{
                                position: 'absolute',
                                top: '48px',
                                width: '36px',
                                zIndex: 3,
                                borderRadius: '0 0 8px 8px',
                                animation: 'eruptionSpill 1s forwards cubic-bezier(0.4, 0, 0.2, 1)'
                            }} />
                        )}

                        <div style={{
                            fontSize: '3.8rem',
                            lineHeight: '1',
                            display: 'inline-block',
                            zIndex: 2,
                            animation: status === "error" ? 'cupVibrate 0.4s infinite linear' : 'gentleBob 3s ease-in-out infinite',
                            animationDelay: '0.3s'
                        }}>
                            {status === "error" ? "🥤" : "🧋"}
                        </div>
                        
                        {status === "error" && (
                            <div style={{ fontWeight: 'bold', color: '#dc2626', fontSize: '0.75rem', marginTop: '2px', zIndex: 4 }}>
                                FIZZ!! 💥
                            </div>
                        )}
                    </div>
                </div>

                <h2 style={{ 
                    margin: '0 0 0.3rem 0', 
                    color: status === "success" ? '#166534' : status === "error" ? '#991b1b' : '#432818', 
                    fontWeight: '800', 
                    fontSize: '1.85rem',
                    transition: 'color 0.3s'
                }}>
                    {status === "success" ? "Sweet Success!" : status === "error" ? "Messy Recipe!" : "The Sweet Suite"}
                </h2>
                <p style={{ 
                    margin: '0 0 2rem 0', 
                    color: status === "success" ? '#15803d' : status === "error" ? '#b91c1c' : '#7f5539', 
                    fontWeight: '600', 
                    fontSize: '0.95rem',
                    transition: 'color 0.3s'
                }}>
                    {status === "success" ? "Recipe verified. Entering kitchen..." : status === "error" ? "The drink boiled over! Check credentials." : "Bakery CRM Management Portal"}
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: '700', color: '#6f4e37', fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                            KITCHEN USERNAME
                        </label>
                        <input 
                            type="text" 
                            className="bakery-input"
                            placeholder="user name"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if (status === "error") setStatus("idle");
                            }}
                            required
                            style={{
                                border: status === "error" ? '2px solid #fca5a5' : '2px solid #e6ccb2',
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                color: '#432818'
                            }}
                        />
                    </div>

                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: '700', color: '#6f4e37', fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                            RECIPE SECRET PASSCODE
                        </label>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="bakery-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (status === "error") setStatus("idle");
                                }}
                                required
                                style={{
                                    border: status === "error" ? '2px solid #fca5a5' : '2px solid #e6ccb2',
                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                    color: '#432818',
                                    paddingRight: '3rem'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.1rem',
                                    padding: 0
                                }}
                            >
                                {showPassword ? "👁️" : "🍩"}
                            </button>
                        </div>
                    </div>

                    <div style={{ minHeight: '10px' }} />

                    <button 
                        type="submit"
                        disabled={status === "success"}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            fontWeight: '700',
                            fontSize: '1rem',
                            color: '#ffffff',
                            cursor: status === "success" ? 'not-allowed' : 'pointer',
                            backgroundColor: status === "success" ? '#22c55e' : status === "error" ? '#ef4444' : '#7f5539',
                            boxShadow: status === "success" ? '0 6px 20px rgba(34,197,94,0.3)' 
                                     : status === "error" ? '0 6px 20px rgba(239,68,68,0.3)' 
                                     : '0 6px 20px rgba(127,85,57,0.25)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {status === "success" ? "Baking Successful! 🍪" : status === "error" ? "Clean up Counter (Try Again)" : "Preheat Session (Sign In)"}
                    </button>
                </form>
            </div>
        </div>
    );
}