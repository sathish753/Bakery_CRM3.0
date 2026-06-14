import { useState, useEffect } from "react";

export default function ItemsPage() {
    const [items, setItems] = useState([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [editIndex, setEditIndex] = useState(-1);
    const [loaded, setLoaded] = useState(false);

    // ✅ LOAD DATA ONCE
    useEffect(() => {
        const saved = localStorage.getItem("items");
        if (saved) {
            setItems(JSON.parse(saved));
        }
        setLoaded(true);
    }, []);

    // ✅ SAVE DATA ONLY AFTER LOAD COMPLETES
    useEffect(() => {
        if (!loaded) return;
        localStorage.setItem("items", JSON.stringify(items));
    }, [items, loaded]);

    // ✅ ADD OR UPDATE ITEM
    const addOrUpdateItem = () => {
        if (!name || !price) {
            alert("Enter item name and price");
            return;
        }

        const newItem = {
            name,
            price: Number(price)
        };

        if (editIndex >= 0) {
            const updated = [...items];
            updated[editIndex] = newItem;
            setItems(updated);
            setEditIndex(-1);
        } else {
            setItems([...items, newItem]);
        }

        setName("");
        setPrice("");
    };

    // ✅ EDIT ITEM
    const editItem = (index) => {
        setName(items[index].name);
        setPrice(items[index].price);
        setEditIndex(index);
    };

    // ✅ DELETE ITEM
    const deleteItem = (index) => {
        const updated = items.filter((_, i) => i !== index);
        setItems(updated);
        if (editIndex === index) {
            setEditIndex(-1);
            setName("");
            setPrice("");
        }
    };

    return (
        /* 🖼️ AUTOMATICALLY STITCHED & FITTED BACKGROUND CONTAINER WITH ITEMS.JPG */
        <div style={{ 
            minHeight: '100vh', 
            backgroundImage: "url('/items.jpg')", // Points safely to the hosted root public asset directory
            backgroundSize: '100% 100%', 
            backgroundPosition: 'top left',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed', 
            padding: 'clamp(1rem, 3vw, 2.5rem)', 
            fontFamily: 'system-ui, -apple-system, sans-serif',
            boxSizing: 'border-box'
        }} className="min-h-screen p-10">
            
            {/* 🌟 TRANSLUCENT GLASSMORPHIC CARD LAYER */}
            <div style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.35)', // Clear transparency ratio matching Sales design
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '2rem', 
                borderRadius: '1rem', 
                boxShadow: '0 20px 50px -15px rgba(0,0,0,0.3)', 
                maxWidth: '1200px', 
                margin: '0 auto' 
            }} className="rounded-2xl p-8 max-w-5xl mx-auto">
                
                {/* TITLE WITH READABILITY SHADOW BLOCKS */}
                <h1 style={{ 
                    fontSize: '2.25rem', 
                    fontWeight: '700', 
                    color: '#16a34a', 
                    marginBottom: '2rem',
                    textShadow: '0 2px 4px rgba(255,255,255,0.6)' 
                }} className="text-4xl font-bold text-green-600 mb-8">
                    Items Management
                </h1>

                {/* INPUT SECTION (INLINE ROW FIX WITH TRANSLUCENT HOUSING ELEMENTS) */}
                <div 
                    style={{ 
                        display: 'flex', 
                        flexDirection: 'row', 
                        gap: '1rem', 
                        marginBottom: '2rem',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }} 
                    className="flex flex-row gap-4 mb-8 flex-wrap md:flex-nowrap"
                >
                    <input
                        style={{ 
                            flex: '1', 
                            minWidth: '200px', 
                            height: '2.75rem', 
                            border: '1px solid #d1d5db', 
                            padding: '0.5rem 1rem', 
                            borderRadius: '0.75rem',
                            backgroundColor: 'rgba(255,255,255,0.9)', // Solid input fields for ease of visibility
                            fontWeight: '500'
                        }}
                        className="border p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                        placeholder="Item Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <input
                        style={{ 
                            flex: '1', 
                            minWidth: '150px', 
                            height: '2.75rem', 
                            border: '1px solid #d1d5db', 
                            padding: '0.5rem 1rem', 
                            borderRadius: '0.75rem',
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            fontWeight: '500'
                        }}
                        className="border p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                        placeholder="Price (₹)"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />

                    <button
                        onClick={addOrUpdateItem}
                        style={{ 
                            height: '2.75rem', 
                            paddingLeft: '2rem', 
                            paddingRight: '2rem', 
                            backgroundColor: editIndex >= 0 ? '#3b82f6' : '#16a34a', 
                            color: '#ffffff', 
                            border: 'none', 
                            borderRadius: '0.75rem', 
                            cursor: 'pointer',
                            fontWeight: '700',
                            minWidth: '120px',
                            boxShadow: editIndex >= 0 ? '0 4px 12px rgba(59,130,246,0.3)' : '0 4px 12px rgba(22,163,74,0.3)'
                        }}
                        className={`${editIndex >= 0 ? "bg-blue-500 hover:bg-blue-600" : "bg-green-600 hover:bg-green-700"} text-white px-6 rounded-xl transition`}
                    >
                        {editIndex >= 0 ? "Update" : "Add Item"}
                    </button>
                </div>

                {/* ITEM LIST BREAKDOWN CONTAINER */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="space-y-3">
                    <h3 style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: '700', 
                        color: '#1f2937', 
                        marginBottom: '0.25rem',
                        textShadow: '0 1px 2px rgba(255,255,255,0.5)'
                    }}>
                        Registered Products
                    </h3>
                    
                    {items.length === 0 ? (
                        <p style={{ color: '#4b5563', fontStyle: 'italic', padding: '1rem 0', fontWeight: '500' }}>
                            No products registered. Use the panel above to populate items.
                        </p>
                    ) : (
                        items.map((item, index) => (
                            <div
                                key={index}
                                style={{ 
                                    display: 'flex', 
                                    flexDirection: 'row', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    backgroundColor: 'rgba(255, 255, 255, 0.65)', // Inner lists row wrapper glass card opacity mixin
                                    padding: '1rem 1.5rem', 
                                    borderRadius: '0.75rem',
                                    border: '1px solid rgba(229, 231, 235, 0.6)',
                                    backdropFilter: 'blur(4px)'
                                }}
                                className="flex flex-row justify-between items-center bg-gray-100 p-4 rounded-xl"
                            >
                                <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#111827' }} className="text-xl">
                                    {item.name} 
                                    <span style={{ color: '#16a34a', marginLeft: '0.75rem', fontWeight: '800' }}>
                                        ₹{Number(item.price).toFixed(2)}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem' }} className="flex flex-row gap-2">
                                    <button
                                        onClick={() => editItem(index)}
                                        style={{ 
                                            backgroundColor: '#3b82f6', 
                                            color: '#ffffff', 
                                            border: 'none', 
                                            padding: '0.45rem 1.25rem', 
                                            borderRadius: '0.5rem', 
                                            cursor: 'pointer', 
                                            fontWeight: '700',
                                            boxShadow: '0 2px 6px rgba(59,130,246,0.2)'
                                        }}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-xl transition"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => deleteItem(index)}
                                        style={{ 
                                            backgroundColor: '#ef4444', 
                                            color: '#ffffff', 
                                            border: 'none', 
                                            padding: '0.45rem 1.25rem', 
                                            borderRadius: '0.5rem', 
                                            cursor: 'pointer', 
                                            fontWeight: '700',
                                            boxShadow: '0 2px 6px rgba(239,68,68,0.2)'
                                        }}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-xl transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}