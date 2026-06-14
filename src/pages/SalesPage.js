import { useState, useEffect, useRef } from "react";

/* ─── confetti burst ───────────────────────────────────────────── */
function burst(x, y) {
    const colors = ["#22c55e","#16a34a","#4ade80","#facc15","#f97316","#38bdf8","#a78bfa","#fb7185"];
    for (let i = 0; i < 60; i++) {
        const el = document.createElement("div");
        const size = 5 + Math.random() * 10;
        el.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:${size}px;
            background:${colors[i%colors.length]};border-radius:${Math.random()>0.5?"50%":"3px"};
            pointer-events:none;z-index:99999;transform:translate(-50%,-50%);`;
        document.body.appendChild(el);
        const angle = (Math.PI*2*i)/60;
        const vel = 5 + Math.random()*10;
        let vx=Math.cos(angle)*vel, vy=Math.sin(angle)*vel-8, ox=x, oy=y, op=1;
        const tick=()=>{ vy+=0.4; vx*=0.97; ox+=vx; oy+=vy; op-=0.02;
            el.style.left=ox+"px"; el.style.top=oy+"px"; el.style.opacity=op;
            if(op>0) requestAnimationFrame(tick); else el.remove(); };
        requestAnimationFrame(tick);
    }
}

/* ─── floating particles background ───────────────────────────── */
function Particles() {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const particles = Array.from({length:38}, () => ({
            x: Math.random()*canvas.width,
            y: Math.random()*canvas.height,
            r: 1.5 + Math.random()*3,
            vx: (Math.random()-0.5)*0.4,
            vy: -0.2 - Math.random()*0.5,
            alpha: 0.15 + Math.random()*0.35,
            color: ["#22c55e","#4ade80","#86efac","#facc15","#ffffff"][Math.floor(Math.random()*5)]
        }));
        let raf;
        const draw = () => {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();
                p.x += p.vx; p.y += p.vy;
                if(p.y < -10) { p.y=canvas.height+10; p.x=Math.random()*canvas.width; }
                if(p.x < -10) p.x=canvas.width+10;
                if(p.x > canvas.width+10) p.x=-10;
            });
            ctx.globalAlpha=1;
            raf = requestAnimationFrame(draw);
        };
        draw();
        const resize=()=>{ canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
        window.addEventListener("resize",resize);
        return ()=>{ cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
    },[]);
    return <canvas ref={canvasRef} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1}}/>;
}

/* ─── animated number ──────────────────────────────────────────── */
function AnimatedNumber({ value, prefix="₹", style }) {
    const [display, setDisplay] = useState(value);
    const prev = useRef(value);
    useEffect(() => {
        const from=prev.current, to=value, steps=20;
        let i=0;
        const id=setInterval(()=>{ i++; setDisplay(Math.round(from+(to-from)*(i/steps)));
            if(i>=steps){ clearInterval(id); prev.current=to; } },16);
        return ()=>clearInterval(id);
    },[value]);
    return <span style={style}>{prefix}{display.toLocaleString("en-IN")}</span>;
}

export default function SalesPage() {
    const [items, setItems]               = useState([]);
    const [cart, setCart]                 = useState([]);
    const [billNo, setBillNo]             = useState(1);
    const [todayBillCount, setTodayBillCount] = useState(0);
    const [notification, setNotification] = useState(null);
    const [notifType, setNotifType]       = useState("success");
    const [searchTerm, setSearchTerm]     = useState("");
    const [isOpen, setIsOpen]             = useState(false);
    const dropdownRef                     = useRef(null);
    const [accounts, setAccounts]         = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [selectedAccountId, setSelectedAccountId] = useState("");
    const [activeTab, setActiveTab]       = useState(null);
    const [qtyModal, setQtyModal]         = useState(null);
    const [customQty, setCustomQty]       = useState("1");
    const longPressTimer                  = useRef(null);
    const longPressTriggered              = useRef(false);
    const [ripples, setRipples]           = useState({});
    const [addedItems, setAddedItems]     = useState({});
    const [cartFlash, setCartFlash]       = useState(false);
    const [clock, setClock]               = useState(new Date());
    const [billSaved, setBillSaved]       = useState(false);

    const rawTotal = cart.reduce((s,i)=>s+Number(i.price||0)*i.qty,0);

    // live clock
    useEffect(()=>{ const id=setInterval(()=>setClock(new Date()),1000); return()=>clearInterval(id); },[]);

    const showNotification=(msg,type="success")=>{ setNotifType(type); setNotification(msg); setTimeout(()=>setNotification(null),3500); };

    const getTodayStr=()=>{ const n=new Date(); return `${String(n.getDate()).padStart(2,"0")}/${String(n.getMonth()+1).padStart(2,"0")}/${n.getFullYear()}`; };
    const countToday=(bills)=>bills.filter(b=>b.date?.startsWith(getTodayStr())).length;

    useEffect(()=>{
        const saved=localStorage.getItem("items"); if(saved) setItems(JSON.parse(saved));
        const bills=JSON.parse(localStorage.getItem("bills"))||[];
        setBillNo(bills.length+1); setTodayBillCount(countToday(bills));
        const acc=localStorage.getItem("dept_accounts");
        if(acc){ setAccounts(JSON.parse(acc)); }
        else {
            const s=[{id:"acc_1",name:"John Doe (Marketing)",balance:0},{id:"acc_2",name:"Alex Carey (Sales)",balance:0},{id:"acc_3",name:"Staff Lounge",balance:0}];
            localStorage.setItem("dept_accounts",JSON.stringify(s)); setAccounts(s);
        }
        const out=e=>{ if(dropdownRef.current&&!dropdownRef.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener("mousedown",out);
        return()=>document.removeEventListener("mousedown",out);
    },[]);

    const filteredItems = items.filter(i=>i.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const quickAccessItems = items.slice(0,15);

    const handleSelectItem=(item,index,qty=1)=>{
        if(index!==null){
            setActiveTab(index);
            setAddedItems(a=>({...a,[index]:true}));
            setTimeout(()=>{ setActiveTab(null); setAddedItems(a=>{const n={...a};delete n[index];return n;}); },400);
        }
        const q=Math.max(1,parseInt(qty)||1);
        setCart(prev=>{
            const ex=prev.find(c=>c.name===item.name);
            return ex ? prev.map(c=>c.name===item.name?{...c,qty:c.qty+q}:c) : [...prev,{...item,qty:q}];
        });
        setCartFlash(true); setTimeout(()=>setCartFlash(false),400);
        setSearchTerm(""); setIsOpen(false);
    };

    const fireRipple=(index,e)=>{
        const rect=e.currentTarget.getBoundingClientRect();
        const x=e.clientX-rect.left, y=e.clientY-rect.top, id=Date.now();
        setRipples(r=>({...r,[index]:{x,y,id}}));
        setTimeout(()=>setRipples(r=>{const n={...r};delete n[index];return n;}),700);
    };

    const handlePressStart=(item,index)=>{ longPressTriggered.current=false; longPressTimer.current=setTimeout(()=>{ longPressTriggered.current=true; setCustomQty("1"); setQtyModal({item,index}); },600); };
    const handlePressEnd=(item,index,e)=>{ clearTimeout(longPressTimer.current); if(!longPressTriggered.current){ if(e)fireRipple(index,e); handleSelectItem(item,index,1); } };
    const handlePressCancel=()=>clearTimeout(longPressTimer.current);

    const confirmQtyModal=()=>{
        const qty=parseInt(customQty);
        if(!qty||qty<1){ showNotification("⚠️ Enter a valid quantity","warn"); return; }
        handleSelectItem(qtyModal.item,qtyModal.index,qty); setQtyModal(null);
    };

    const removeItem=i=>setCart(c=>c.filter((_,idx)=>idx!==i));

    const saveBill=(e)=>{
        if(cart.length===0) return;
        if(paymentMethod==="Account"&&!selectedAccountId){ showNotification("⚠️ Select an account holder","warn"); return; }
        const accountName=paymentMethod==="Account"?accounts.find(a=>a.id===selectedAccountId)?.name:null;
        const bill={billNo,items:cart,total:rawTotal,paymentMethod,accountId:paymentMethod==="Account"?selectedAccountId:null,accountName,date:new Date().toLocaleString("en-GB")};
        const old=JSON.parse(localStorage.getItem("bills"))||[];
        const newBills=[...old,bill];
        localStorage.setItem("bills",JSON.stringify(newBills));
        if(paymentMethod==="Account"){
            const upd=accounts.map(acc=>acc.id===selectedAccountId?{...acc,balance:acc.balance+rawTotal}:acc);
            localStorage.setItem("dept_accounts",JSON.stringify(upd)); setAccounts(upd);
        }
        if(e) burst(e.clientX,e.clientY);
        setBillSaved(true); setTimeout(()=>setBillSaved(false),1200);
        setCart([]); setPaymentMethod("Cash"); setSelectedAccountId("");
        setBillNo(billNo+1); setTodayBillCount(countToday(newBills));
        showNotification(paymentMethod==="Account"?`🎉 ₹${rawTotal} charged to ${accountName}!`:"🎉 Bill saved! Thank you!","success");
    };

    const printBill=()=>{
        if(cart.length===0){ showNotification("⚠️ Cart is empty!","warn"); return; }
        const accountName=paymentMethod==="Account"?accounts.find(a=>a.id===selectedAccountId)?.name:null;
        const rows=cart.map(i=>`<tr><td style="padding:6px 0">${i.name} × ${i.qty}</td><td style="text-align:right;padding:6px 0">₹${(i.price*i.qty).toFixed(2)}</td></tr>`).join("");
        const win=window.open("","","width=400,height=600");
        if(!win) return;
        win.document.write(`<html><head><title>Bill #${billNo}</title><style>body{font-family:Helvetica,Arial,sans-serif;padding:20px;color:#333}.header{text-align:center;border-bottom:2px dashed #ccc;padding-bottom:10px;margin-bottom:15px}table{width:100%;border-collapse:collapse}.total{border-top:2px dashed #ccc;margin-top:15px;padding-top:10px;font-size:1.2em;font-weight:bold}.footer{text-align:center;font-size:.85em;color:#666;margin-top:30px}.badge{display:inline-block;padding:4px 8px;background:#eee;border-radius:4px;font-size:.9em;margin-top:5px;font-weight:bold}</style></head><body><div class="header"><h2>RETAIL SHOP</h2><p>Bill No: #${billNo}</p><p>${new Date().toLocaleString("en-GB")}</p><div class="badge">METHOD: ${paymentMethod==="Account"?`DEPT-ACCOUNT (${accountName})`:"CASH"}</div></div><table><tbody>${rows}</tbody></table><div class="total"><div style="display:flex;justify-content:space-between"><span>GRAND TOTAL:</span><span>₹${rawTotal.toFixed(2)}</span></div></div><div class="footer"><p>${paymentMethod==="Account"?"Settlement via Monthly Ledger":"Thank You For Your Visit!"}</p></div><script>window.onload=function(){window.print();window.close()}<\/script></body></html>`);
        win.document.close();
    };

    const timeStr = clock.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    const dateStr = clock.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"});

    return (
        <div style={{minHeight:"100vh",width:"100vw",position:"fixed",top:0,left:0,
            backgroundImage:"url('/sales.jpg')",backgroundSize:"cover",
            backgroundPosition:"center",backgroundRepeat:"no-repeat",
            backgroundAttachment:"fixed",overflowY:"auto"}}>

            <Particles/>

            {/* dark overlay */}
            <div style={{position:"fixed",inset:0,background:"linear-gradient(135deg,rgba(0,0,0,0.45) 0%,rgba(0,20,10,0.55) 100%)",zIndex:0,pointerEvents:"none"}}/>

            <style>{`
                @keyframes fadeSlideDown {from{opacity:0;transform:translateY(-30px)}to{opacity:1;transform:translateY(0)}}
                @keyframes fadeSlideUp   {from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
                @keyframes springPop     {0%{opacity:0;transform:scale(0.65)}60%{transform:scale(1.08)}80%{transform:scale(0.96)}100%{opacity:1;transform:scale(1)}}
                @keyframes rippleAnim    {from{transform:translate(-50%,-50%) scale(0);opacity:0.6}to{transform:translate(-50%,-50%) scale(4.5);opacity:0}}
                @keyframes slideInLeft   {from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
                @keyframes notifIn       {from{opacity:0;transform:translateX(70px) scale(0.88)}to{opacity:1;transform:translateX(0) scale(1)}}
                @keyframes glowPulse     {0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.6),0 4px 20px rgba(34,197,94,0.3)}50%{box-shadow:0 0 0 12px rgba(34,197,94,0),0 4px 20px rgba(34,197,94,0.5)}}
                @keyframes ticker        {0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}
                @keyframes shimmerBG     {0%{background-position:-200% 0}100%{background-position:200% 0}}
                @keyframes cartPop       {0%,100%{transform:scale(1)}40%{transform:scale(1.12)}70%{transform:scale(0.95)}}
                @keyframes addedPing     {0%{box-shadow:0 0 0 0 rgba(250,204,21,0.8)}100%{box-shadow:0 0 0 18px rgba(250,204,21,0)}}
                @keyframes checkIn       {0%{transform:scale(0) rotate(-20deg);opacity:0}60%{transform:scale(1.25) rotate(5deg)}100%{transform:scale(1) rotate(0);opacity:1}}
                @keyframes rotateClock   {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
                @keyframes successBanner {0%{transform:scaleX(0)}100%{transform:scaleX(1)}}

                .quick-btn{position:relative;overflow:hidden;transition:transform 0.1s ease,box-shadow 0.15s ease,filter 0.15s ease;}
                .quick-btn:hover{transform:translateY(-4px) scale(1.05)!important;filter:brightness(1.1);}
                .quick-btn:active{transform:scale(0.9)!important;}
                .quick-btn.added{animation:addedPing 0.5s ease-out;}

                .cart-row{animation:slideInLeft 0.3s ease;}
                .cart-row:hover{background:rgba(34,197,94,0.06);border-radius:0.5rem;}

                .save-btn:not(:disabled){transition:all 0.2s ease;}
                .save-btn:not(:disabled):hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(17,24,39,0.45)!important;}
                .save-btn:not(:disabled):active{transform:scale(0.97);}

                .print-btn:not(:disabled){transition:all 0.2s ease;}
                .print-btn:not(:disabled):hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(22,163,74,0.55)!important;}
                .print-btn:not(:disabled):active{transform:scale(0.97);}

                .pay-btn{transition:all 0.22s cubic-bezier(.34,1.56,.64,1);}
                .pay-btn:hover{transform:scale(1.05);}

                .search-input:focus{box-shadow:0 0 0 3px rgba(34,197,94,0.4),0 4px 20px rgba(0,0,0,0.15)!important;}

                .remove-btn{transition:color 0.15s,transform 0.15s;}
                .remove-btn:hover{color:#ef4444!important;transform:scale(1.35) rotate(10deg);}

                .dropdown-item{transition:background 0.12s,padding-left 0.12s;}
                .dropdown-item:hover{padding-left:1.7rem!important;background:#f0fdf4!important;}

                ::-webkit-scrollbar{width:4px;}
                ::-webkit-scrollbar-track{background:transparent;}
                ::-webkit-scrollbar-thumb{background:#22c55e;border-radius:4px;}
            `}</style>

            {/* ── NOTIFICATION ───────────────────────────────────────── */}
            {notification && (
                <div style={{position:"fixed",top:"18px",right:"18px",zIndex:9999,
                    animation:"notifIn 0.38s cubic-bezier(.34,1.56,.64,1)",
                    background:notifType==="warn"?"linear-gradient(135deg,#7f1d1d,#991b1b)":"linear-gradient(135deg,#052e16,#14532d)",
                    color:"#fff",padding:"1rem 1.6rem",borderRadius:"1rem",fontWeight:"800",
                    boxShadow:"0 16px 40px rgba(0,0,0,0.45)",
                    borderLeft:`4px solid ${notifType==="warn"?"#ef4444":"#22c55e"}`,
                    display:"flex",alignItems:"center",gap:"0.75rem",maxWidth:"360px"}}>
                    <span style={{fontSize:"1.5rem"}}>{notifType==="warn"?"⚠️":"🎉"}</span>
                    <span style={{fontSize:"0.95rem"}}>{notification}</span>
                </div>
            )}

            {/* ── QTY MODAL ──────────────────────────────────────────── */}
            {qtyModal && (
                <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",
                    alignItems:"center",justifyContent:"center",zIndex:10000,backdropFilter:"blur(6px)"}}>
                    <div style={{background:"#fff",borderRadius:"1.4rem",padding:"2.25rem",
                        width:"min(92vw,360px)",boxShadow:"0 32px 80px rgba(0,0,0,0.5)",
                        border:"2.5px solid #111827",animation:"springPop 0.4s cubic-bezier(.34,1.56,.64,1)"}}>
                        <div style={{textAlign:"center",marginBottom:"1.25rem"}}>
                            <div style={{fontSize:"2.8rem",marginBottom:"0.25rem"}}>📦</div>
                            <h3 style={{margin:"0 0 0.2rem",color:"#111827",fontSize:"1.2rem",fontWeight:"900"}}>{qtyModal.item.name}</h3>
                            <p style={{margin:0,color:"#6b7280",fontSize:"0.9rem",fontWeight:"600"}}>₹{qtyModal.item.price} / unit</p>
                        </div>
                        <input type="number" min="1" autoFocus value={customQty}
                            onChange={e=>setCustomQty(e.target.value)}
                            onKeyDown={e=>{if(e.key==="Enter")confirmQtyModal();if(e.key==="Escape")setQtyModal(null);}}
                            style={{width:"100%",padding:"0.9rem",fontSize:"2rem",fontWeight:"900",
                                textAlign:"center",boxSizing:"border-box",border:"2.5px solid #111827",
                                borderRadius:"0.8rem",outline:"none",color:"#111827",marginBottom:"1rem"}}/>
                        <div style={{display:"flex",gap:"0.5rem",justifyContent:"center",marginBottom:"1.25rem",flexWrap:"wrap"}}>
                            {[2,5,10,12,24].map(q=>(
                                <button key={q} onClick={()=>setCustomQty(String(q))} style={{
                                    padding:"0.45rem 0.9rem",borderRadius:"0.6rem",border:"2px solid #111827",
                                    background:customQty===String(q)?"#111827":"#f9fafb",
                                    color:customQty===String(q)?"#fff":"#111827",
                                    fontWeight:"800",cursor:"pointer",fontSize:"0.9rem",
                                    transform:customQty===String(q)?"scale(1.1)":"scale(1)",
                                    transition:"all 0.15s ease"}}>{q}</button>
                            ))}
                        </div>
                        <div style={{display:"flex",gap:"0.75rem"}}>
                            <button onClick={()=>setQtyModal(null)} style={{flex:1,padding:"0.8rem",borderRadius:"0.7rem",
                                border:"2px solid #d1d5db",background:"#f9fafb",fontWeight:"800",cursor:"pointer",color:"#374151"}}>Cancel</button>
                            <button onClick={confirmQtyModal} style={{flex:2,padding:"0.8rem",borderRadius:"0.7rem",
                                border:"none",background:"linear-gradient(135deg,#22c55e,#16a34a)",
                                fontWeight:"900",fontSize:"1rem",cursor:"pointer",color:"#fff",
                                boxShadow:"0 6px 20px rgba(34,197,94,0.45)"}}>✓ Add to Cart</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── PAGE CONTENT ───────────────────────────────────────── */}
            <div style={{position:"relative",zIndex:2,padding:"clamp(0.75rem,2vw,1.5rem)",minHeight:"100vh"}}>

                {/* ── TOP TICKER BAR ─────────────────────────────────── */}
                <div style={{background:"rgba(0,0,0,0.55)",backdropFilter:"blur(10px)",
                    borderRadius:"0.75rem",padding:"0.4rem 1rem",marginBottom:"1rem",
                    border:"1px solid rgba(34,197,94,0.25)",overflow:"hidden",position:"relative"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.5rem",
                        animation:"ticker 18s linear infinite",whiteSpace:"nowrap"}}>
                        {["⚡ Quick sales system","💰 Fast billing","📋 Dept accounts","🎯 Real-time totals",
                          "🛒 Smart cart","✅ Instant print","⚡ Quick sales system","💰 Fast billing"].map((t,i)=>(
                            <span key={i} style={{color:"rgba(255,255,255,0.75)",fontSize:"0.78rem",
                                fontWeight:"600",marginRight:"3rem"}}>{t}</span>
                        ))}
                    </div>
                </div>

                {/* ── MAIN GLASS CARD ────────────────────────────────── */}
                <div style={{background:"rgba(255,255,255,0.11)",backdropFilter:"blur(22px)",
                    WebkitBackdropFilter:"blur(22px)",border:"1px solid rgba(255,255,255,0.22)",
                    padding:"clamp(1rem,2.5vw,2rem)",borderRadius:"1.4rem",
                    boxShadow:"0 28px 64px -16px rgba(0,0,0,0.55)",maxWidth:"1200px",
                    margin:"0 auto",animation:"fadeSlideDown 0.45s ease"}}>

                    {/* ── HEADER ─────────────────────────────────────── */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",
                        marginBottom:"1.75rem",flexWrap:"wrap",gap:"1rem"}}>
                        <div>
                            <h1 style={{fontSize:"clamp(1.75rem,4vw,2.4rem)",fontWeight:"900",margin:0,
                                background:"linear-gradient(135deg,#22c55e,#4ade80,#86efac)",
                                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                                backgroundClip:"text",letterSpacing:"-0.03em"}}>
                                ⚡ Sales System
                            </h1>
                            <p style={{margin:"0.2rem 0 0",color:"rgba(255,255,255,0.65)",
                                fontSize:"0.88rem",fontWeight:"600"}}>Quick. Easy. Done.</p>
                        </div>

                        {/* clock + bill badge */}
                        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"0.4rem"}}>
                            {/* live clock */}
                            <div style={{background:"rgba(0,0,0,0.45)",backdropFilter:"blur(8px)",
                                borderRadius:"0.6rem",padding:"0.3rem 0.85rem",
                                border:"1px solid rgba(34,197,94,0.3)",textAlign:"right"}}>
                                <div style={{color:"#22c55e",fontSize:"1.05rem",fontWeight:"900",
                                    fontFamily:"monospace",letterSpacing:"0.05em"}}>{timeStr}</div>
                                <div style={{color:"rgba(255,255,255,0.6)",fontSize:"0.72rem",fontWeight:"600"}}>{dateStr}</div>
                            </div>
                            <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
                                <div style={{background:"linear-gradient(135deg,#22c55e,#16a34a)",
                                    color:"#fff",padding:"0.6rem 1.5rem",borderRadius:"0.8rem",
                                    fontWeight:"900",fontSize:"1.1rem",
                                    animation:"glowPulse 2.5s infinite",
                                    boxShadow:"0 4px 16px rgba(34,197,94,0.4)"}}>
                                    {billSaved?"✅":"Bill"} #{billNo}
                                </div>
                                <div style={{background:"rgba(0,0,0,0.5)",color:"#d1fae5",
                                    padding:"0.3rem 0.85rem",borderRadius:"0.5rem",
                                    fontWeight:"700",fontSize:"0.78rem",letterSpacing:"0.04em"}}>
                                    {todayBillCount} today
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── STAT MINI PILLS ────────────────────────────── */}
                    <div style={{display:"flex",gap:"0.6rem",marginBottom:"1.5rem",flexWrap:"wrap"}}>
                        {[
                            {icon:"🛍️",label:"Items in cart",val:cart.reduce((s,i)=>s+i.qty,0)},
                            {icon:"💰",label:"Cart total",val:`₹${rawTotal.toLocaleString("en-IN")}`},
                            {icon:"📦",label:"Products",val:items.length},
                            {icon:"📋",label:"Bills today",val:todayBillCount},
                        ].map((s,i)=>(
                            <div key={i} style={{background:"rgba(0,0,0,0.35)",backdropFilter:"blur(8px)",
                                borderRadius:"0.65rem",padding:"0.5rem 0.9rem",
                                border:"1px solid rgba(255,255,255,0.12)",
                                display:"flex",alignItems:"center",gap:"0.5rem"}}>
                                <span style={{fontSize:"1rem"}}>{s.icon}</span>
                                <div>
                                    <div style={{color:"rgba(255,255,255,0.5)",fontSize:"0.65rem",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.05em"}}>{s.label}</div>
                                    <div style={{color:"#fff",fontSize:"0.95rem",fontWeight:"900"}}>{s.val}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── SEARCH ─────────────────────────────────────── */}
                    <div style={{marginBottom:"1.75rem",position:"relative",zIndex:100}}>
                        {items.length===0 ? (
                            <p style={{color:"#111827",fontStyle:"italic",fontWeight:"700",
                                background:"rgba(255,255,255,0.88)",padding:"12px",
                                borderRadius:"8px",display:"inline-block"}}>
                                No products found — add items to inventory first.
                            </p>
                        ) : (
                            <div ref={dropdownRef} style={{position:"relative"}}>
                                <div style={{position:"relative"}}>
                                    <span style={{position:"absolute",left:"1.1rem",top:"50%",transform:"translateY(-50%)",fontSize:"1.1rem"}}>🔍</span>
                                    <input className="search-input" type="text"
                                        placeholder="Search all inventory products…"
                                        value={searchTerm}
                                        onFocus={()=>setIsOpen(true)}
                                        onChange={e=>{setSearchTerm(e.target.value);setIsOpen(true);}}
                                        style={{width:"100%",padding:"1.1rem 3rem 1.1rem 3rem",
                                            borderRadius:"0.9rem",border:"2.5px solid #111827",
                                            fontSize:"1.05rem",fontWeight:"600",outline:"none",
                                            boxSizing:"border-box",background:"#fff",
                                            boxShadow:"0 4px 20px rgba(0,0,0,0.15)",
                                            transition:"box-shadow 0.2s"}}/>
                                    <span style={{position:"absolute",right:"1.25rem",top:"50%",
                                        transform:`translateY(-50%) rotate(${isOpen?180:0}deg)`,
                                        color:"#111827",pointerEvents:"none",transition:"transform 0.25s"}}>▼</span>
                                </div>
                                {isOpen && (
                                    <div style={{position:"absolute",top:"105%",left:0,width:"100%",
                                        background:"#fff",border:"2px solid #111827",borderRadius:"0.9rem",
                                        boxShadow:"0 20px 50px -8px rgba(0,0,0,0.3)",
                                        maxHeight:"260px",overflowY:"auto",zIndex:999,
                                        marginTop:"4px",animation:"fadeSlideUp 0.22s ease"}}>
                                        {filteredItems.length===0 ? (
                                            <div style={{padding:"1rem",color:"#ef4444",
                                                fontStyle:"italic",fontSize:"0.95rem",fontWeight:"700"}}>No items match.</div>
                                        ) : filteredItems.map((item,idx)=>(
                                            <div key={idx} className="dropdown-item"
                                                onClick={()=>handleSelectItem(item,null)}
                                                style={{display:"flex",justifyContent:"space-between",
                                                    alignItems:"center",padding:"0.85rem 1.25rem",cursor:"pointer",
                                                    borderBottom:idx!==filteredItems.length-1?"1px solid #e5e7eb":"none"}}>
                                                <span style={{fontWeight:"700",color:"#111827"}}>{item.name}</span>
                                                <span style={{background:"#111827",color:"#fff",
                                                    padding:"0.25rem 0.65rem",borderRadius:"0.4rem",
                                                    fontWeight:"700",fontSize:"0.9rem"}}>₹{item.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── TWO COL GRID ───────────────────────────────── */}
                    <div style={{display:"grid",
                        gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,340px),1fr))",gap:"2rem"}}>

                        {/* ── QUICK ACCESS TABS ────────────────────────── */}
                        <div>
                            <div style={{display:"flex",alignItems:"center",gap:"0.75rem",
                                marginBottom:"1rem",flexWrap:"wrap"}}>
                                <h2 style={{fontSize:"1.05rem",fontWeight:"900",margin:0,
                                    color:"#fff",textShadow:"0 2px 8px rgba(0,0,0,0.6)",
                                    letterSpacing:"0.04em"}}>⚡ QUICK ACCESS</h2>
                                <span style={{background:"rgba(255,255,255,0.18)",color:"#fff",
                                    fontSize:"0.7rem",fontWeight:"700",padding:"0.2rem 0.65rem",
                                    borderRadius:"0.4rem",border:"1px solid rgba(255,255,255,0.35)"}}>
                                    Hold for qty
                                </span>
                            </div>
                            {items.length===0 ? (
                                <p style={{color:"#111827",fontStyle:"italic",fontWeight:"700",
                                    background:"rgba(255,255,255,0.88)",padding:"10px",borderRadius:"6px"}}>
                                    No inventory items yet.
                                </p>
                            ) : (
                                <div style={{display:"grid",
                                    gridTemplateColumns:"repeat(auto-fill,minmax(clamp(110px,22vw,145px),1fr))",
                                    gap:"0.65rem"}}>
                                    {quickAccessItems.map((item,index)=>(
                                        <button key={index}
                                            className={`quick-btn${addedItems[index]?" added":""}`}
                                            onMouseDown={()=>handlePressStart(item,index)}
                                            onMouseUp={e=>handlePressEnd(item,index,e)}
                                            onMouseLeave={handlePressCancel}
                                            onTouchStart={e=>{e.preventDefault();handlePressStart(item,index);}}
                                            onTouchEnd={e=>{e.preventDefault();handlePressEnd(item,index,e);}}
                                            onTouchCancel={handlePressCancel}
                                            style={{
                                                background:addedItems[index]
                                                    ?"linear-gradient(135deg,#facc15,#eab308)"
                                                    :activeTab===index
                                                    ?"linear-gradient(135deg,#15803d,#166534)"
                                                    :"linear-gradient(135deg,#22c55e 0%,#16a34a 60%,#15803d 100%)",
                                                border:"2px solid rgba(0,0,0,0.2)",
                                                borderRadius:"0.9rem",
                                                padding:"clamp(0.75rem,2vw,1.1rem) 0.5rem",
                                                textAlign:"center",cursor:"pointer",outline:"none",
                                                display:"flex",flexDirection:"column",
                                                justifyContent:"center",alignItems:"center",gap:"0.2rem",
                                                boxShadow:addedItems[index]
                                                    ?"0 0 0 0 rgba(250,204,21,0)"
                                                    :"0 4px 14px rgba(0,0,0,0.2)",
                                                WebkitTapHighlightColor:"transparent",
                                                userSelect:"none",position:"relative",overflow:"hidden",
                                                transition:"background 0.2s ease"
                                            }}>
                                            {/* ripple */}
                                            {ripples[index] && (
                                                <span style={{position:"absolute",
                                                    left:ripples[index].x,top:ripples[index].y,
                                                    width:"90px",height:"90px",borderRadius:"50%",
                                                    background:"rgba(255,255,255,0.5)",
                                                    animation:"rippleAnim 0.7s ease-out forwards",
                                                    pointerEvents:"none"}} key={ripples[index].id}/>
                                            )}
                                            {/* added checkmark */}
                                            {addedItems[index] && (
                                                <span style={{position:"absolute",top:"4px",right:"6px",
                                                    fontSize:"0.75rem",fontWeight:"900",color:"#fff",
                                                    animation:"checkIn 0.3s ease"}}>✓</span>
                                            )}
                                            <span style={{fontWeight:"800",color:"#fff",
                                                fontSize:"clamp(0.82rem,2vw,1.05rem)",
                                                textShadow:"0 2px 6px rgba(0,0,0,0.4)",
                                                width:"100%",overflow:"hidden",
                                                textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                                {item.name}
                                            </span>
                                            <span style={{fontSize:"0.88rem",fontWeight:"700",
                                                color:"rgba(255,255,255,0.88)",
                                                textShadow:"0 1px 3px rgba(0,0,0,0.35)"}}>
                                                ₹{item.price}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── ORDER PANEL ──────────────────────────────── */}
                        <div style={{background:"#fdfbf7",padding:"1.5rem",borderRadius:"1.1rem",
                            border:"2.5px solid #111827",
                            boxShadow:cartFlash
                                ?"0 0 0 4px rgba(34,197,94,0.35),0 8px 28px rgba(0,0,0,0.12)"
                                :"0 8px 28px rgba(0,0,0,0.1)",
                            transition:"box-shadow 0.3s ease"}}>

                            {/* header */}
                            <div style={{display:"flex",justifyContent:"space-between",
                                alignItems:"center",marginBottom:"1rem"}}>
                                <h2 style={{fontSize:"1.15rem",fontWeight:"900",margin:0,color:"#111827"}}>
                                    🛒 Current Order
                                </h2>
                                {cart.length>0 && (
                                    <span style={{background:"#111827",color:"#fff",
                                        padding:"0.2rem 0.75rem",borderRadius:"2rem",
                                        fontSize:"0.78rem",fontWeight:"800",
                                        animation:"cartPop 0.35s ease"}}>
                                        {cart.reduce((s,i)=>s+i.qty,0)} items
                                    </span>
                                )}
                            </div>

                            {/* cart items */}
                            <div style={{minHeight:"140px",maxHeight:"260px",overflowY:"auto",
                                marginBottom:"1rem",paddingRight:"2px"}}>
                                {cart.length===0 ? (
                                    <div style={{display:"flex",flexDirection:"column",
                                        alignItems:"center",justifyContent:"center",
                                        paddingTop:"2.5rem",gap:"0.5rem",opacity:0.4}}>
                                        <span style={{fontSize:"3rem"}}>🛍️</span>
                                        <p style={{color:"#111827",fontStyle:"italic",
                                            fontWeight:"700",margin:0,fontSize:"0.95rem"}}>Cart is empty</p>
                                        <p style={{color:"#9ca3af",fontSize:"0.8rem",
                                            margin:0,fontWeight:"600"}}>Tap a product to add</p>
                                    </div>
                                ) : cart.map((item,i)=>(
                                    <div key={i} className="cart-row" style={{
                                        display:"flex",justifyContent:"space-between",
                                        alignItems:"center",padding:"0.7rem 0.4rem",
                                        borderBottom:"1.5px solid #f0fdf4",
                                        transition:"background 0.15s"}}>
                                        <div>
                                            <div style={{fontWeight:"800",color:"#111827",fontSize:"0.98rem"}}>{item.name}</div>
                                            <div style={{fontSize:"0.82rem",color:"#6b7280",fontWeight:"600"}}>₹{item.price} × {item.qty}</div>
                                        </div>
                                        <div style={{display:"flex",alignItems:"center",gap:"0.85rem"}}>
                                            <span style={{fontWeight:"900",color:"#111827",fontSize:"1rem"}}>
                                                ₹{(item.price*item.qty).toLocaleString("en-IN")}
                                            </span>
                                            <button className="remove-btn" onClick={()=>removeItem(i)}
                                                style={{background:"none",border:"none",
                                                    color:"#d1d5db",cursor:"pointer",fontSize:"1.1rem",
                                                    padding:"0.15rem 0.3rem",borderRadius:"0.3rem"}}>✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* payment */}
                            <div style={{borderTop:"2px solid #111827",paddingTop:"1rem",marginBottom:"1rem"}}>
                                <label style={{display:"block",fontWeight:"900",marginBottom:"0.6rem",
                                    color:"#111827",fontSize:"0.8rem",letterSpacing:"0.06em"}}>
                                    PAYMENT METHOD
                                </label>
                                <div style={{display:"flex",gap:"0.65rem",flexWrap:"wrap"}}>
                                    {[
                                        {id:"Cash",    label:"💵 Cash",     glow:"rgba(34,197,94,0.45)"},
                                        {id:"Account", label:"📋 Dept-Account", glow:"rgba(59,130,246,0.45)"},
                                    ].map(opt=>(
                                        <button key={opt.id} className="pay-btn"
                                            onClick={()=>setPaymentMethod(opt.id)}
                                            style={{flex:1,minWidth:"120px",padding:"0.7rem",
                                                borderRadius:"0.65rem",border:"2px solid #111827",
                                                cursor:"pointer",fontWeight:"800",fontSize:"0.92rem",
                                                background:paymentMethod===opt.id?"#111827":"#fffdf9",
                                                color:paymentMethod===opt.id?"#fff":"#111827",
                                                boxShadow:paymentMethod===opt.id?`0 4px 16px ${opt.glow}`:"none"}}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                {paymentMethod==="Account" && (
                                    <div style={{marginTop:"0.75rem",animation:"fadeSlideUp 0.25s ease"}}>
                                        <label style={{display:"block",fontSize:"0.82rem",
                                            color:"#111827",marginBottom:"0.3rem",fontWeight:"700"}}>
                                            Account Holder:
                                        </label>
                                        <select value={selectedAccountId}
                                            onChange={e=>setSelectedAccountId(e.target.value)}
                                            style={{width:"100%",padding:"0.7rem",borderRadius:"0.55rem",
                                                border:"2px solid #111827",fontSize:"0.92rem",
                                                fontWeight:"700",outline:"none",
                                                background:"#fffdf9",color:"#111827"}}>
                                            <option value="">-- Choose Name / Dept --</option>
                                            {accounts.map(a=>(
                                                <option key={a.id} value={a.id}>{a.name} (Owes: ₹{a.balance})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* total */}
                            <div style={{borderTop:"2px solid #111827",paddingTop:"1rem",
                                display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                <span style={{fontSize:"1.1rem",fontWeight:"800",color:"#111827"}}>Total:</span>
                                <AnimatedNumber value={rawTotal} style={{
                                    fontSize:"2.2rem",fontWeight:"900",color:"#16a34a",
                                    textShadow:"0 2px 10px rgba(22,163,74,0.3)"}}/>
                            </div>

                            {/* progress bar (visual flair) */}
                            {rawTotal>0 && (
                                <div style={{marginTop:"0.5rem",height:"4px",
                                    background:"#f0fdf4",borderRadius:"2px",overflow:"hidden"}}>
                                    <div style={{height:"100%",
                                        background:"linear-gradient(90deg,#22c55e,#4ade80)",
                                        width:`${Math.min(100,(rawTotal/1000)*100)}%`,
                                        borderRadius:"2px",transition:"width 0.4s ease"}}/>
                                </div>
                            )}

                            {/* action buttons */}
                            <div style={{marginTop:"1.25rem",display:"flex",flexDirection:"column",gap:"0.75rem"}}>
                                <button className="save-btn" onClick={saveBill}
                                    disabled={cart.length===0||(paymentMethod==="Account"&&!selectedAccountId)}
                                    style={{width:"100%",padding:"1rem",borderRadius:"0.9rem",
                                        border:"none",fontWeight:"900",fontSize:"1rem",cursor:"pointer",
                                        background:(cart.length===0||(paymentMethod==="Account"&&!selectedAccountId))
                                            ?"#9ca3af":"linear-gradient(135deg,#1f2937,#111827)",
                                        color:"#fff",boxShadow:"0 4px 14px rgba(0,0,0,0.2)",
                                        letterSpacing:"0.02em"}}>
                                    💾 Save Bill
                                </button>
                                <button className="print-btn" onClick={printBill}
                                    disabled={cart.length===0||(paymentMethod==="Account"&&!selectedAccountId)}
                                    style={{width:"100%",padding:"1rem",borderRadius:"0.9rem",
                                        border:"none",fontWeight:"900",fontSize:"1rem",cursor:"pointer",
                                        background:(cart.length===0||(paymentMethod==="Account"&&!selectedAccountId))
                                            ?"#d1d5db":"linear-gradient(135deg,#22c55e,#16a34a)",
                                        color:(cart.length===0||(paymentMethod==="Account"&&!selectedAccountId))
                                            ?"#9ca3af":"#fff",
                                        boxShadow:"0 4px 16px rgba(22,163,74,0.3)",
                                        letterSpacing:"0.02em"}}>
                                    🖨️ Print Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}