import { useEffect, useState } from "react";

export default function ProfitFixerPage() {
    const [items, setItems] = useState([]);

    const loadItems = () => {
        const saved = localStorage.getItem("items");
        setItems(saved ? JSON.parse(saved) : []);
    };

    useEffect(() => {
        loadItems();
        window.addEventListener("storage", loadItems);
        return () => {
            window.removeEventListener("storage", loadItems);
        };
    }, []);

    const updateItem = (realIndex, field, value) => {
        const updated = [...items];
        const parsedValue = value === "" ? "" : Number(value);

        updated[realIndex] = {
            ...updated[realIndex],
            [field]: parsedValue
        };

        setItems(updated);
        localStorage.setItem("items", JSON.stringify(updated));
    };

    const calc = (item) => {
        const costPrice = Number(item.costPrice ?? 0);
        const sellingPrice = Number(item.sellingPrice ?? item.price ?? 0);

        const profit = sellingPrice - costPrice;
        const percent = costPrice ? (profit / costPrice) * 100 : 0;

        return { costPrice, sellingPrice, profit, percent };
    };

    return (
        <div style={{
            minHeight: "100vh",
            padding: "2rem",
            backgroundImage: `url('/profits.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
            color: "white",
            fontFamily: "system-ui"
        }}>
            {/* Header with glass styling */}
            <div style={{
                display: "inline-block",
                background: "rgba(15, 23, 42, 0.55)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                padding: "0.5rem 1.5rem",
                borderRadius: "12px",
                marginBottom: "2rem",
                border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
                <h1 style={{ fontSize: "2rem", margin: 0, fontWeight: "900" }}>
                    💰 Profit Fixer
                </h1>
            </div>

            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                {items.map((item, realIndex) => {
                    const { costPrice, sellingPrice, profit, percent } = calc(item);
                    const isProfit = profit >= 0;

                    return (
                        <div
                            key={realIndex} 
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                // Translucent glassmorphic panel surface
                                backgroundColor: "rgba(30, 41, 59, 0.7)", 
                                backdropFilter: "blur(12px)",
                                WebkitBackdropFilter: "blur(12px)",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                padding: "1.25rem",
                                borderRadius: "14px",
                                marginBottom: "1rem",
                                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)"
                            }}
                        >
                            {/* LEFT */}
                            <div>
                                <div style={{ fontSize: "1.1rem", fontWeight: "800", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                                    {item.name}
                                </div>

                                <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.75rem" }}>
                                    
                                    {/* COST PRICE */}
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <label style={{ fontSize: "0.75rem", color: "#cbd5e1", marginBottom: "4px", fontWeight: "600" }}>
                                            Cost Price
                                        </label>
                                        <input
                                            type="number"
                                            style={{
                                                padding: "0.5rem",
                                                borderRadius: "6px",
                                                border: "1px solid rgba(255, 255, 255, 0.25)",
                                                // Highly transparent input fill
                                                backgroundColor: "rgba(15, 23, 42, 0.6)", 
                                                color: "white",
                                                width: "110px",
                                                fontWeight: "600",
                                                outline: "none"
                                            }}
                                            value={item.costPrice === 0 || !item.costPrice ? "" : item.costPrice} 
                                            onChange={(e) =>
                                                updateItem(realIndex, "costPrice", e.target.value)
                                            }
                                        />
                                    </div>

                                    {/* SELLING PRICE */}
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <label style={{ fontSize: "0.75rem", color: "#cbd5e1", marginBottom: "4px", fontWeight: "600" }}>
                                            Selling Price
                                        </label>
                                        <div style={{
                                            padding: "0.5rem 0",
                                            fontSize: "1.05rem",
                                            fontWeight: "700",
                                            color: "#f8fafc",
                                            width: "100px",
                                            textShadow: "0 1px 3px rgba(0,0,0,0.3)"
                                        }}>
                                            ₹{sellingPrice.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div style={{ 
                                textAlign: "right",
                                background: isProfit ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                padding: "0.5rem 1rem",
                                borderRadius: "10px",
                                border: isProfit ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)"
                            }}>
                                <div style={{
                                    fontSize: "1.2rem",
                                    fontWeight: "900",
                                    color: isProfit ? "#4ade80" : "#f87171",
                                    textShadow: "0 2px 4px rgba(0,0,0,0.4)"
                                }}>
                                    {isProfit ? "+" : ""}₹{profit.toFixed(2)}
                                </div>

                                <div style={{ fontSize: "0.85rem", color: "#e2e8f0", fontWeight: "600" }}>
                                    {percent.toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}