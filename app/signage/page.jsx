'use client';
import { useState, useEffect } from 'react';

export default function DigitalSignage() {
  const [menuData, setMenuData] = useState([]);
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 商业内容排期状态
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [currentSlide, setCurrentSlide] = useState(0); // 控制海报/菜单连播切换

  // 1. 系统精准时钟 + 时间段检测
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentHour(now.getHours()); // 实时监测当前是几点
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Notion 数据实时同步雷达
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/menu');
        const json = await res.json();
        if (json.success) {
          const grouped = json.data.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
          }, {});
          setMenuData(grouped);
        }
      } catch (err) { console.error("Signage fallback active."); } 
      else { setLoading(false); }
    };
    fetchMenu();
    const dataTimer = setInterval(fetchMenu, 5000); // 5秒一同步Notion
    return () => clearInterval(dataTimer);
  }, []);

  // 3. 👑 商业排期核心：自动在菜单和海报之间淡入淡出切换
  useEffect(() => {
    const slideTimer = setInterval(() => {
      // 在 11点-17点 下午闲时，开启连播海报
      if (currentHour >= 11 && currentHour < 17) {
        setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
      } else {
        // 其他时间锁定在菜单画面
        setCurrentSlide(0); 
      }
    }, 7000); // 每 7 秒丝滑淡入淡出转场一次
    return () => clearInterval(slideTimer);
  }, [currentHour]);

  if (loading) return (
    <div className="h-screen w-screen bg-[#F4F1EA] flex items-center justify-center text-zinc-400 font-mono tracking-widest text-xs">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-400 mb-4"></div>
      °C / g . SPACE // MATRIX DAYPARTING INITIALIZING...
    </div>
  );

  // 👑 根据当前系统时间，自动调配全局调性（白天燕麦，晚上机能黑绿）
  const isNight = currentHour >= 17 || currentHour < 6;
  const themeBg = isNight ? 'bg-[#0D0D0D] text-[#00FF66]' : 'bg-[#F4F1EA] text-[#1A1A1A]';
  const cardBg = isNight ? 'bg-[#141414] border-[#00FF66]/30' : 'bg-white border-black shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]';
  const badgeStyle = isNight ? 'bg-[#00FF66] text-black font-black' : 'bg-black text-[#F4F1EA]';

  return (
    <div className={`w-screen h-screen ${themeBg} p-12 flex flex-col justify-between overflow-hidden select-none transition-colors duration-1000`}>
      
      {/* GLOBAL HIGH-END HEADER */}
      <div className={`flex justify-between items-start border-b-2 ${isNight ? 'border-[#00FF66]/20' : 'border-[#1A1A1A]'} pb-6`}>
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-black">°C / g . SPACE</h1>
          <p className="font-mono text-xs text-zinc-500 tracking-widest mt-1">
            BROOKLYN LAB // DIGITAL MATRIX {isNight ? '🌃 NIGHT_MICRO_V3.0' : '🌅 DAY_MICRO_V3.0'}
          </p>
        </div>
        
        {/* RIGHT METRICS */}
        <div className="flex items-center space-x-12 font-mono text-right text-sm">
          <div className="bg-black text-[#F4F1EA] px-3 py-1 rounded">
            <span className="text-[10px] block opacity-60 text-left">SCHEDULED_MODE</span>
            <span className="font-bold">{currentHour >= 6 && currentHour < 11 ? '01_MORNING_MENU' : currentHour >= 11 && currentHour < 17 ? '02_GOLDEN_下午茶' : '03_NIGHT_微醺'}</span>
          </div>
          <div>
            <div className="text-zinc-400 text-[10px]">CURRENT_TIME</div>
            <div className="text-xl font-black tracking-tight tabular-nums">{time}</div>
          </div>
        </div>
      </div>

      {/* मास्टर 商业模板容器 WITH DYNAMIC CONTENT AREA */}
      <div className="flex-1 my-6 relative w-full h-full">
        
        {/* 🎬 模板 A: 商业卡片式菜单大屏 Grid */}
        <div className={`absolute inset-0 grid grid-cols-2 gap-12 items-center transition-all duration-1000 transform ${currentSlide === 0 ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-10 pointer-events-none'}`}>
          {Object.keys(menuData).length === 0 ? (
            <div className="col-span-2 text-center text-zinc-400 font-mono text-sm animate-pulse">Syncing Scheduled Menu Matrix with Notion...</div>
          ) : (
            Object.keys(menuData).map((category) => (
              <div key={category} className={`border-2 ${cardBg} p-8 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] h-[85%] flex flex-col justify-between rounded-2xl transition-colors duration-1000`}>
                <div className="flex justify-between items-center border-b border-zinc-500/10 pb-4 mb-4">
                  <span className={`font-mono text-xs px-3 py-1 uppercase tracking-widest rounded-sm ${badgeStyle}`}>
                    [{category}]
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">REALTIME_MATRIX</span>
                </div>
                
                <div className="space-y-6">
                  {menuData[category].map((item) => (
                    <div key={item.id} className="flex justify-between items-baseline group animate-fade-in">
                      <div className="flex items-center space-x-3 transition-transform group-hover:translate-x-2">
                        <span className={`text-3xl font-black tracking-tight ${isNight ? 'text-white' : 'text-black'}`}>{item.name}</span>
                        {item.specialTag && (
                          <span className="font-mono text-[10px] bg-red-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
                            {item.specialTag}
                          </span>
                        )}
                      </div>
                      <div className={`flex-1 border-b-2 border-dotted ${isNight ? 'border-[#00FF66]/20' : 'border-black/10'} mx-4 relative top-[-6px]`}></div>
                      <span className={`font-mono text-2xl font-black bg-[#F4F1EA] px-2 border border-[#1A1A1A] rounded text-[#1A1A1A]`}>
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="font-mono text-[9px] text-zinc-400/60 mt-4 tracking-widest uppercase">// PARAMETRIC WEIGHED UNIT ACTIVE</div>
              </div>
            ))
          )}
        </div>

        {/* 🎬 模板 B: PREMIUM DYNAMIC POSTER (左大图，右文案促销连播模式) */}
        <div className={`absolute inset-0 grid grid-cols-12 gap-8 items-center transition-all duration-1000 transform ${currentSlide === 1 ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 -translate-x-10 pointer-events-none'}`}>
          <div className="col-span-7 h-full relative border-2 border-black rounded-2xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(26,26,26,1)]">
            {/* 💡 这里的数据来自 Notion 里的 Image 列链接 */}
            <img src={menuData['MATCHA']?.[0]?.imageUrl || "https://images.unsplash.com/photo-1517256064527-09c53b2d0c6b?auto=format&fit=crop&w=1200&q=80"} alt="Promo" className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 hover:scale-110" />
            <div className="absolute top-4 left-4 bg-black/80backdrop-blur text-[#F4F1EA] px-3 py-1 text-[10px] font-mono tracking-widest rounded">
              AMBIENT_CAM // 01 // REALTIME_FEED
            </div>
          </div>

          <div className="col-span-5 bg-black text-[#F4F1EA] p-10 h-full rounded-2xl shadow-[12px_12px_0px_0px_rgba(40,40,40,0.2)] flex flex-col justify-between">
            <div>
              <div className="font-mono text-amber-400 text-xs tracking-widest mb-2">// CG_SPACE LAB MID-DAY SPECIAL</div>
              <h2 className="text-5xl font-black tracking-tighter leading-none text-white uppercase mb-4">
                HAPPY HOUR<br/>BUY 3 GET 1 FREE
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed tracking-tight font-light">
                [SYSTEM_ALERT] All formulations are calculated down to 0.1 grams, ensuring exact parametric flow. VALID EVERY DAY FROM 11:00 AM TO 5:00 PM.
              </p>
            </div>
            <div className="border-t border-zinc-800 pt-6">
              <div className="flex justify-between items-center mb-2 font-mono text-xs text-zinc-400">
                <span>LOCATION</span>
                <span className="font-bold text-white tracking-widest">BROOKLYN LAB</span>
              </div>
              <div className="text-[10px] text-amber-400 font-mono tracking-wider animate-pulse">
                * VALID TIME: 11:00 AM - 05:00 PM EVERY DAY
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* GLOBAL FOOTER */}
      <div className={`border-t-2 ${isNight ? 'border-[#00FF66]/20' : 'border-[#1A1A1A]'} pt-4 flex justify-between items-center font-mono text-[10px]`}>
        <div className="flex items-center space-x-2">
          <span className={`inline-block w-2 h-2 rounded-full ${isNight ? 'bg-[#00FF66] animate-pulse' : 'bg-green-500 animate-ping'}`}></span>
          <span>SYSTEM_STATUS // ENGINE_DAYPARTING_V3.0</span>
        </div>
        <div>[远程参数化总控就绪]</div>
        <div>© 2026 CGSPACE.NYC</div>
      </div>
    </div>
  );
}
