/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Dùng framer-motion là chuẩn nhất
import Loading from './components/Loading';
import PlanetImage from './components/PlanetImage';
import RealTimeChart from './components/RealTimeChart';
import {
  Rocket,
  Terminal,
  Code,
  Mail,
  History,
  Play,
  RotateCw,   // Đã thêm để hết lỗi ở nút Xem 3D
  RotateCcw,  // Đã thêm để hết lỗi ở nút Hủy Mô Phỏng
  Info,
  User,
  Search,
  Share2,
  Maximize2,
  ArrowLeft,
  Globe,
  Zap,
  Lightbulb,
  ChevronRight,
  LayoutGrid,
  Cpu,
  Github,
  Facebook,
  MessageSquare
} from 'lucide-react';

import { PLANETS, SIM_OBJECTS, ENVIRONMENTS } from './constants';
import { Planet, SimulationObject, Environment } from './types';

type View = 'home' | 'detail' | 'simulation' | 'profile';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('home');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedPlanet, setSelectedPlanet] = useState<Planet>(PLANETS[0]);
  const [simObject, setSimObject] = useState<SimulationObject>(SIM_OBJECTS[0]);
  const [simEnv, setSimEnv] = useState<Environment>(ENVIRONMENTS[0]);
  const [customGravity, setCustomGravity] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simTime, setSimTime] = useState(0);
  const [simVelocity, setSimVelocity] = useState(0);
  const [chartData, setChartData] = useState<{ time: number; value: number; distance: number }[]>([]);
  const [simPosition, setSimPosition] = useState(0);
  const [isImpact, setIsImpact] = useState(false);
  const [airDensity, setAirDensity] = useState<number>(0);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const planetsRef = useRef<HTMLDivElement>(null);
  const [isWarping, setIsWarping] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [simHistory, setSimHistory] = useState<{ id: number; object: string; gravity: number; time: number; status: 'completed' | 'cancelled' }[]>([]);
  
  const isSimulatingRef = useRef(false);
  const animationRef = useRef<number>();

  // Initialize Audio Context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playSound = (type: 'whoosh' | 'thud') => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'whoosh') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'thud') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  };

  useEffect(() => {
    // Preload images and simulate loading
    const preloadImages = async () => {
      const imagePromises = PLANETS.map((planet) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = planet.image;
          img.onload = resolve;
          img.onerror = resolve; // Continue even if error
        });
      });

      await Promise.all([
        ...imagePromises,
        new Promise(resolve => setTimeout(resolve, 2000)) // Minimum loading time
      ]);
      
      setIsLoading(false);
    };

    preloadImages();
  }, []);

  const FACTS = [
    {
      title: "Một ngày trên Sao Kim dài hơn một năm?",
      description: "Sao Kim quay quanh trục của nó cực kỳ chậm, mất khoảng 243 ngày Trái Đất để hoàn thành một vòng quay. Trong khi đó, nó chỉ mất 225 ngày để quay quanh Mặt Trời."
    },
    {
      title: "Mặt Trời chiếm bao nhiêu khối lượng?",
      description: "Mặt Trời chứa khoảng 99.86% tổng khối lượng của toàn bộ Hệ Mặt Trời. Nó lớn đến mức có thể chứa khoảng 1.3 triệu Trái Đất bên trong."
    },
    {
      title: "Kim cương trên Sao Thổ và Sao Mộc?",
      description: "Các nhà khoa học cho rằng trên Sao Thổ và Sao Mộc có thể có mưa kim cương. Áp suất cực lớn trong bầu khí quyển của chúng có thể biến carbon thành kim cương."
    },
    {
      title: "Ngọn núi cao nhất Hệ Mặt Trời?",
      description: "Olympus Mons trên Sao Hỏa là ngọn núi lửa cao nhất được biết đến trong Hệ Mặt Trời, với độ cao gần 22 km, gấp gần 3 lần đỉnh Everest."
    }
  ];

  const nextFact = () => {
    setCurrentFactIndex((prev) => (prev + 1) % FACTS.length);
  };

  const scrollToPlanets = () => {
    setActiveTab('explore');
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        planetsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      planetsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const startSimulation = () => {
    if (isSimulatingRef.current) return;
    
    setIsSimulating(true);
    isSimulatingRef.current = true;
    
    let startTime = performance.now();
    let lastTime = startTime;
    const g = customGravity !== '' ? Number(customGravity) : simEnv.gravity;
    
    // Safety Timeout (30s)
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      cancelSim();
      alert('Mô phỏng quá lâu, vui lòng điều chỉnh lại gia tốc hoặc lực cản!');
    }, 30000);

    let currentVelocity = 0;
    let currentPosition = 0;
    
    playSound('whoosh');

    const animate = (time: number) => {
      // 1. Immediate Check: Stop if flag is false
      if (!isSimulatingRef.current) return;

      let deltaTime = (time - lastTime) / 1000; // seconds
      lastTime = time;
      
      // Safety: Clamp deltaTime to avoid huge jumps (e.g. tab switching)
      if (deltaTime > 0.1) deltaTime = 0.1;

      const totalTime = (time - startTime) / 1000;

      // Physics Calculation: F_net = m*g - 0.5 * rho * v^2 * Cd * A
      const dragForce = 0.5 * airDensity * currentVelocity * currentVelocity * simObject.drag;
      const netForce = (simObject.mass * g) - dragForce;
      const acceleration = netForce / simObject.mass;

      // Update velocity and position
      currentVelocity += acceleration * deltaTime;
      currentPosition += currentVelocity * deltaTime;

      // Safety check for NaN or Infinite
      if (!isFinite(currentVelocity) || !isFinite(currentPosition)) {
        cancelSim();
        return;
      }

      setSimTime(totalTime);
      setSimVelocity(currentVelocity);
      setSimPosition(currentPosition);
      
      setChartData(prev => [
        ...prev, 
        { time: totalTime, value: currentVelocity, distance: currentPosition }
      ].slice(-50)); 
      
      // Ground collision (100m) or Overshoot check
      if (currentPosition >= 100) {
        // Force stop at ground
        setIsSimulating(false);
        isSimulatingRef.current = false;
        setSimPosition(100);
        setIsImpact(true);
        playSound('thud');
        
        setSimHistory(prev => [{
          id: Date.now(),
          object: simObject.name,
          gravity: g,
          time: totalTime,
          status: 'completed'
        }, ...prev].slice(0, 5));

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setTimeout(() => setIsImpact(false), 500);
        
        // Stop animation loop
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const cancelSim = () => {
    // 1. Immediate Flag Update
    isSimulatingRef.current = false;
    setIsSimulating(false);
    
    // 2. Cancel Animation Frame immediately
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // 3. Reset UI and Data
    if (simTime > 0) {
      setSimHistory(prev => [{
        id: Date.now(),
        object: simObject.name,
        gravity: customGravity !== '' ? Number(customGravity) : simEnv.gravity,
        time: simTime,
        status: 'cancelled'
      }, ...prev].slice(0, 5));
    }
    setSimTime(0);
    setSimVelocity(0);
    setSimPosition(0);
    setChartData([]);
    setIsImpact(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const resetSim = () => {
    cancelSim();
  };

  const handleWarp = () => {
    setIsWarping(true);
    setTimeout(() => {
      setIsWarping(false);
      scrollToPlanets();
    }, 1000);
  };

  const Navbar = () => {
    const navItems = [
      { id: 'home', label: 'Trang chủ', action: () => { setCurrentView('home'); setActiveTab('home'); } },
      { id: 'explore', label: 'Khám phá', action: scrollToPlanets },
      { id: 'simulation', label: 'Thí nghiệm', action: () => { setCurrentView('simulation'); setActiveTab('simulation'); } },
      { id: 'profile', label: 'Tác giả', action: () => { setCurrentView('profile'); setActiveTab('profile'); } },
    ];

    return (
      <header className="flex items-center justify-between border-b border-white/5 px-6 md:px-10 py-4 bg-[#0a0f1a]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 text-primary cursor-pointer" onClick={() => { setCurrentView('home'); setActiveTab('home'); }}>
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-lg flex items-center justify-center text-white">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Rocket className="size-5" />
            </motion.div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-black tracking-wider text-white uppercase leading-none">Vũ Trụ Số</h2>
            <span className="text-[8px] text-slate-500 tracking-[0.2em] uppercase leading-none mt-1">Space Project 12</span>
          </div>
        </div>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6 group/nav">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={item.action} 
              className={`relative text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded transition-all duration-300
                ${activeTab === item.id ? 'nav-active' : 'text-slate-400 hover:text-white group-hover/nav:opacity-50 hover:!opacity-100'}
                ${activeTab !== item.id ? 'after:content-[""] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all hover:after:w-full' : ''}
              `}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <LayoutGrid className="size-6" />
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-[#0a0f1a] border-b border-white/10 p-4 flex flex-col gap-4 md:hidden shadow-2xl"
            >
              {navItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => { item.action(); setIsMenuOpen(false); }} 
                  className={`text-xs font-bold uppercase tracking-widest p-3 rounded text-left transition-all
                    ${activeTab === item.id ? 'nav-active' : 'text-slate-400'}
                  `}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    );
  };

  const HomeView = () => (
    <div className="container mx-auto px-4 md:px-8 py-8">
      {/* Hero Section */}
      <section className="relative w-full rounded-3xl overflow-hidden min-h-[450px] md:min-h-[550px] flex items-center justify-center border border-white/5 shadow-2xl mb-16">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2048&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90" />
        <div className="relative z-10 max-w-3xl text-center px-6 py-12 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm"
          >
            <span className="text-[10px] md:text-xs font-bold text-primary tracking-widest uppercase">Dự án lớp 12 - Digital Solar System</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-extrabold mb-8 tracking-tight text-gradient text-glow leading-tight pb-4"
          >
            VŨ TRỤ SỐ
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl max-w-2xl mx-auto mb-10 border border-white/10 shadow-2xl"
          >
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Khám phá những bí ẩn của hệ mặt trời và vũ trụ bao la. Trải nghiệm không gian đa chiều với công nghệ mô phỏng tương tác.
            </p>
          </motion.div>
          <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
            <button onClick={() => { setCurrentView('simulation'); setActiveTab('simulation'); }} className="flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-background-dark font-black py-4 px-10 rounded-xl transition-all shadow-lg neon-glow text-sm uppercase tracking-widest">
              <motion.div
                animate={{ 
                  y: [0, -4, 0],
                  x: [0, 2, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Rocket className="size-5" />
              </motion.div>
              Bắt đầu hành trình
            </button>
            <a 
              href="/3d/index.html"  /* Trỏ trực tiếp vào file trong thư mục public bạn vừa tạo */
              target="_self"         /* Mở trực tiếp trên trang hiện tại để tạo cảm giác liền mạch */
              className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl backdrop-blur-md transition-all border border-white/10"
             >
              <motion.div
               whileHover={{ rotate: 180 }}
               transition={{ duration: 0.4 }}
              >
              <RotateCw size={20} /> 
              </motion.div>
            <span className="font-medium">XEM MÔ HÌNH 3D</span>
         </a>
          </div>
        </div>
      </section>

      {/* Planet Gallery Section */}
      <section ref={planetsRef} className="py-20">
        <div className="flex items-end justify-between mb-12 border-b border-white/5 pb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-primary">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Globe className="size-6" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient">Phòng Trưng Bày Hành Tinh</h2>
            </div>
            <p className="text-slate-500 text-sm">Bộ sưu tập các thiên thể trong Hệ Mặt Trời</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PLANETS.map((planet) => (
            <motion.div 
              key={planet.id}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative bg-[#0a0f1a] border border-white/10 rounded-3xl p-6 overflow-hidden transition-all duration-500 cursor-pointer"
              style={{
                boxShadow: '0 0 0 0 transparent',
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedPlanet(planet);
                setCurrentView('detail');
                setActiveTab('explore');
              }}
            >
              {/* Dynamic Hover Glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, ${planet.color}15 0%, transparent 70%)`,
                  boxShadow: `inset 0 0 20px ${planet.color}20, 0 0 20px ${planet.color}20`
                }}
              />
              
              {/* Card Border Glow on Hover */}
              <div 
                className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-opacity-50 transition-colors duration-500"
                style={{ borderColor: planet.color }}
              />

              <div className="flex flex-col items-center relative z-10">
                {/* Rotating Planet Image */}
                <div className="relative w-56 h-56 mb-6">
                  <div 
                    className="absolute inset-0 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                    style={{ backgroundColor: planet.color }}
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="w-full h-full"
                  >
                    <PlanetImage 
                      src={planet.image} 
                      alt={planet.name} 
                      className="w-full h-full rounded-full object-cover shadow-2xl"
                      color={planet.color}
                    />
                  </motion.div>
                  
                  {/* Orbit Ring Effect */}
                  <div className="absolute inset-[-10%] rounded-full border border-white/5 group-hover:border-white/10 transition-colors rotate-45 scale-y-50" />
                </div>

                <h3 
                  className="text-2xl font-black uppercase tracking-tight mb-2 text-center"
                  style={{ color: 'white', textShadow: `0 0 10px ${planet.color}80` }}
                >
                  {planet.name}
                </h3>
                
                <p 
                  className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-center opacity-80"
                  style={{ color: planet.color }}
                >
                  {planet.tagline}
                </p>
                
                <p className="text-xs text-slate-400 text-center leading-relaxed line-clamp-2 max-w-[90%]">
                  {planet.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                  <span>Khám phá</span>
                  <ChevronRight className="size-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Knowledge Section */}
      <section className="mt-20">
        <div className="relative w-full rounded-2xl overflow-hidden border border-white/5 bg-[#0d1425] p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full" />
          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-3 mb-4 text-yellow-400">
              <motion.div
                animate={{ 
                  opacity: [1, 0.6, 1],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Lightbulb className="size-6" />
              </motion.div>
              <span className="text-xs font-bold uppercase tracking-[0.3em]">Góc kiến thức</span>
            </div>
            <motion.div
              key={currentFactIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-gradient">{FACTS[currentFactIndex].title}</h3>
              <p className="text-slate-400 text-base leading-relaxed max-w-4xl">
                {FACTS[currentFactIndex].description}
              </p>
            </motion.div>
          </div>
          <button 
            onClick={nextFact}
            className="shrink-0 px-8 py-4 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-all relative z-10 group"
          >
            <motion.div
              whileHover={{ rotate: -180 }}
              transition={{ duration: 0.4 }}
            >
              <RotateCcw className="size-5" />
            </motion.div>
            Sự thật khác
          </button>
        </div>
      </section>
    </div>
  );

  const PlanetDetailView = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'structure' | 'surface'>('overview');

    if (!selectedPlanet) return null;

    return (
      <div className="relative flex flex-col lg:flex-row min-h-[calc(100vh-80px)] w-full items-center px-6 md:px-20 py-12 lg:py-0 overflow-y-auto lg:overflow-hidden">
      <div className="flex-1 relative flex items-center justify-center mb-12 lg:mb-0">
        <div className="relative group">
          <div className="absolute inset-0 rounded-full neon-glow blur-3xl opacity-30 scale-110 bg-primary/20" />
          <div className="absolute -inset-10 border border-primary/10 rounded-full animate-pulse" />
          <div className="absolute -inset-20 border border-primary/5 rounded-full" />
          <div className="relative size-[300px] md:size-[500px] rounded-full overflow-hidden shadow-2xl bg-slate-900 border-4 border-primary/20">
            <div className="absolute inset-0 animate-slow-spin">
              <PlanetImage 
                src={selectedPlanet.image} 
                alt={selectedPlanet.name} 
                className="w-full h-full object-cover"
                color={selectedPlanet.color}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-primary/10" />
            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_50px_rgba(19,200,236,0.5)]" />
          </div>
          <div className="absolute -top-10 -right-10 glass-card px-4 py-2 rounded-lg flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            <span className="text-xs font-bold uppercase">Tầng Khí Quyển</span>
          </div>
        </div>
      </div>

        <div className="w-full md:w-[450px] flex flex-col gap-6 z-10">
          <div className="flex flex-col gap-2">
            <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs">{selectedPlanet.order}</span>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-gradient text-glow leading-tight pb-2">{selectedPlanet.name}</h2>
            
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="min-h-[100px]"
            >
              <p className="text-slate-400 leading-relaxed mt-4">
                {activeTab === 'overview' && selectedPlanet.details.overview}
                {activeTab === 'structure' && selectedPlanet.details.structure}
                {activeTab === 'surface' && selectedPlanet.details.surface}
              </p>
            </motion.div>
          </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Khoảng cách', value: selectedPlanet.distance, sub: 'Từ Mặt Trời', icon: Maximize2 },
            { label: 'Chu kỳ quỹ đạo', value: selectedPlanet.orbit, sub: '1 Năm Hành Tinh', icon: History },
            { label: 'Trọng lực', value: selectedPlanet.gravity, sub: 'Gia tốc rơi', icon: Globe },
            { label: 'Nhiệt độ', value: selectedPlanet.temperature, sub: 'Trung bình', icon: Info },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-5 rounded-xl flex flex-col gap-1 group hover:border-primary/50 transition-all">
              <stat.icon className="size-5 text-primary mb-2" />
              <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">{stat.label}</span>
              <span className="text-xl font-bold">{stat.value}</span>
              <span className="text-[10px] text-slate-500 italic">{stat.sub}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 p-1 bg-slate-900/50 rounded-lg border border-white/5">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-3 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'overview' ? 'bg-primary text-background-dark' : 'text-slate-400 hover:bg-white/5'}`}
          >
            Tổng quan
          </button>
          <button 
            onClick={() => setActiveTab('structure')}
            className={`flex-1 py-2 px-3 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'structure' ? 'bg-primary text-background-dark' : 'text-slate-400 hover:bg-white/5'}`}
          >
            Cấu tạo
          </button>
          <button 
            onClick={() => setActiveTab('surface')}
            className={`flex-1 py-2 px-3 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'surface' ? 'bg-primary text-background-dark' : 'text-slate-400 hover:bg-white/5'}`}
          >
            Bề mặt
          </button>
        </div>
        <button onClick={scrollToPlanets} className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest hover:underline mt-4">
          <ArrowLeft className="size-4" /> Quay lại khám phá
        </button>
      </div>

    {/*  <div className="absolute bottom-10 right-8 flex flex-col gap-4">
        {[Search, Maximize2, Share2].map((Icon, i) => (
          <button key={i} className="size-10 flex items-center justify-center glass-card rounded-full hover:bg-primary hover:text-background-dark transition-all">
            <Icon className="size-4" />
          </button>
        ))}
      </div> */}
      </div>
    );
  };

  const SimulationView = () => (
    <div className={`flex flex-col lg:flex-row p-4 md:p-6 gap-6 min-h-[calc(100vh-80px)] ${isImpact ? 'animate-shake' : ''}`}>
      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake {
          animation: shake 0.5s;
          animation-iteration-count: 1;
        }
      `}</style>
      <aside className="w-full lg:w-80 grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-col gap-6 shrink-0">
        <section className="glass-card p-5 rounded-xl">
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <LayoutGrid className="size-4" /> Chọn Vật Thể
          </h3>
          <div className="grid gap-3">
            {SIM_OBJECTS.map(obj => (
              <button 
                key={obj.id}
                onClick={() => setSimObject(obj)}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all ${simObject.id === obj.id ? 'bg-primary text-background-dark font-bold' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
              >
                <div className="size-5 flex items-center justify-center">
                  {obj.id === 'apple' && <Globe className="size-4" />}
                  {obj.id === 'feather' && <Zap className="size-4" />}
                  {obj.id === 'astronaut' && <User className="size-4" />}
                </div>
                <div className="flex flex-col items-start">
                  <span>{obj.name}</span>
                  <span className="text-[9px] opacity-70 font-normal">KL: {obj.mass}kg | Cản: {obj.drag}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="glass-card p-5 rounded-xl">
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Globe className="size-4" /> Môi Trường
          </h3>
          <div className="grid gap-3">
            {ENVIRONMENTS.map(env => (
              <button 
                key={env.id}
                onClick={() => {
                  setSimEnv(env);
                  setCustomGravity('');
                }}
                className={`flex flex-col p-3 rounded-lg border transition-all ${simEnv.id === env.id && customGravity === '' ? 'bg-primary/10 border-primary' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <div className="flex items-center justify-between mb-1 w-full">
                  <span className={`font-bold ${simEnv.id === env.id && customGravity === '' ? 'text-white' : 'text-slate-400'}`}>{env.name}</span>
                  <span className="text-xs text-primary">{env.gravity} m/s²</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: `${(env.gravity / 25) * 100}%` }} />
                </div>
              </button>
            ))}
            
            {/* Custom Gravity Input */}
            <div className={`flex flex-col p-3 rounded-lg border transition-all ${customGravity !== '' ? 'bg-primary/10 border-primary' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center justify-between mb-2 w-full">
                <span className={`font-bold ${customGravity !== '' ? 'text-white' : 'text-slate-400'}`}>Tùy chỉnh G-force</span>
                <span className="text-xs text-primary">{customGravity || 0} m/s²</span>
              </div>
              <input 
                type="number" 
                value={customGravity}
                onChange={(e) => setCustomGravity(e.target.value)}
                placeholder="Nhập gia tốc..."
                step="0.01"
                className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-primary outline-none"
              />
            </div>

            {/* Air Density Slider */}
            <div className="flex flex-col p-3 rounded-lg border border-white/10 bg-white/5">
              <div className="flex items-center justify-between mb-2 w-full">
                <span className="font-bold text-slate-400 text-xs">Mật độ khí quyển</span>
                <span className="text-xs text-primary">{airDensity.toFixed(1)} kg/m³</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="5" 
                step="0.1"
                value={airDensity}
                onChange={(e) => setAirDensity(parseFloat(e.target.value))}
                className="w-full accent-primary h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-slate-500 mt-1 uppercase">
                <span>Chân không</span>
                <span>Dày đặc</span>
              </div>
            </div>
          </div>
        </section>

        <div className="col-span-1 md:col-span-2 lg:col-span-1 mt-auto flex gap-3 sticky bottom-0 bg-[#0a0f1a]/95 backdrop-blur-md p-4 lg:static lg:bg-transparent lg:p-0 z-[9999] border-t border-white/10 lg:border-none">
          {isSimulating ? (
            <button 
              onClick={cancelSim}
              className="flex-1 bg-red-500 text-white py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-[1.02] active:scale-95 transition-all touch-manipulation relative z-50"
            >
              <RotateCcw className="size-6 animate-spin" />
              <span className="text-[10px] uppercase font-bold">Hủy Mô Phỏng</span>
            </button>
          ) : (
            <button 
              onClick={startSimulation}
              className="flex-1 bg-green-500 text-white py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-[1.02] active:scale-95 transition-all touch-manipulation"
            >
              <Play className="size-6" fill="currentColor" />
              <span className="text-[10px] uppercase font-bold">Bắt Đầu</span>
            </button>
          )}
          
          <button 
            onClick={resetSim}
            disabled={isSimulating}
            className="flex-1 bg-white/5 text-slate-300 border border-white/10 py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50 touch-manipulation"
          >
            <RotateCcw className="size-6" />
            <span className="text-[10px] uppercase font-bold">Đặt Lại</span>
          </button>
        </div>
      </aside>

      <section className="flex-1 glass-card rounded-2xl relative overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className={`size-3 rounded-full ${isSimulating ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mô Phỏng Buồng Chân Không V3.5</span>
          </div>
          <div className="flex gap-4 text-[10px] font-mono text-primary">
            <span>KHÍ QUYỂN: {airDensity > 0 ? 'CÓ' : 'KHÔNG'}</span>
            <span>G: {customGravity || simEnv.gravity} m/s²</span>
          </div>
        </div>
        <div className="flex-1 relative grid-lines flex justify-center items-start pt-12 overflow-hidden">
          <div className="absolute left-10 inset-y-12 w-8 border-l border-primary/30 flex flex-col justify-between py-2 text-[10px] font-mono text-primary/60 pointer-events-none">
            {['100m', '80m', '60m', '40m', '20m', '0m'].map(m => <span key={m}>{m}</span>)}
          </div>
          
          <motion.div 
            style={{ 
              y: simPosition * 5, // Scale factor for visualization
              filter: isSimulating ? `blur(${Math.min(simVelocity / 5, 4)}px)` : 'none'
            }}
            className="relative z-10 flex flex-col items-center will-change-transform"
          >
            <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary shadow-[0_0_30px_rgba(19,200,236,0.4)] relative transition-transform">
              {simObject.id === 'apple' && <Globe className="size-10 text-primary" />}
              {simObject.id === 'feather' && <Zap className="size-10 text-primary" />}
              {simObject.id === 'astronaut' && <User className="size-10 text-primary" />}
              
              {isSimulating && (
                <div className="absolute -top-12 w-px h-10 bg-gradient-to-t from-primary/60 to-transparent" />
              )}
            </div>
          </motion.div>

          <div className="absolute bottom-0 w-1/2 h-8 bg-gradient-to-t from-primary/20 to-transparent border-t border-primary/40" />
          
          {/* Impact Effect */}
          {isImpact && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-white/20 blur-3xl rounded-full animate-ping" />
          )}
        </div>

        <div className="absolute bottom-10 right-10 flex flex-col gap-4 pointer-events-none">
          <div className="glass-card p-4 rounded-xl border-l-4 border-primary min-w-[180px]">
            <p className="text-[10px] text-primary font-bold uppercase mb-1">Vận tốc Hiện tại</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono">{simVelocity.toFixed(2)}</span>
              <span className="text-sm text-slate-400">m/s</span>
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl border-l-4 border-primary min-w-[180px]">
            <p className="text-[10px] text-primary font-bold uppercase mb-1">Thời gian rơi</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono">{simTime.toFixed(2)}</span>
              <span className="text-sm text-slate-400">giây</span>
            </div>
          </div>
        </div>
      </section>

      <aside className="hidden lg:flex w-80 flex-col gap-6 shrink-0">
        <section className="glass-card rounded-xl flex-1 flex flex-col overflow-hidden max-h-[400px]">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Terminal className="size-4 text-primary" /> Lịch Sử Thí Nghiệm
            </h3>
          </div>
          <div className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
            {simHistory.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-8">Chưa có dữ liệu</div>
            ) : (
              simHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 text-xs">
                  <div className="flex flex-col">
                    <span className="font-bold text-white">{item.object}</span>
                    <span className="text-[10px] text-slate-400">G: {item.gravity} | T: {item.time.toFixed(2)}s</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${item.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {item.status === 'completed' ? 'Xong' : 'Hủy'}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="glass-card rounded-xl flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Terminal className="size-4 text-primary" /> Biểu Đồ Thời Gian Thực
            </h3>
          </div>
          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            <RealTimeChart 
              data={chartData.map(d => ({ time: d.time, value: d.value }))} 
              color="#13c8ec" 
              label="Vận tốc (m/s)" 
              maxTime={5} 
              maxValue={50} 
            />
            <RealTimeChart 
              data={chartData.map(d => ({ time: d.time, value: d.distance }))} 
              color="#f59e0b" 
              label="Quãng đường (m)" 
              maxTime={5} 
              maxValue={100} 
            />
          </div>
        </section>
        <section className="glass-card p-5 rounded-xl h-48 overflow-y-auto">
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <History className="size-4" /> Lịch sử
          </h3>
          <div className="space-y-3">
            {[
              { obj: 'Quả Táo', env: 'Trái Đất', time: '4.5s' },
              { obj: 'Lông Vũ', env: 'Mặt Trăng', time: '11.2s' },
              { obj: 'Phi Hành Gia', env: 'Sao Mộc', time: '2.1s' },
            ].map((h, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] p-2 border-b border-white/5">
                <span className="text-slate-400">{h.obj} / {h.env}</span>
                <span className="font-mono text-primary">t={h.time}</span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );

  const ProfileView = () => { // Thêm dấu ngoặc nhọn ở đây
  
  // Dán hàm xử lý copy vào đây
  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    alert("🚀 Đã sao chép địa chỉ Email: " + email);
  };
    return (
    <div className="container mx-auto px-4 md:px-20 py-12 flex flex-col lg:flex-row items-center justify-center gap-12 min-h-[calc(100vh-80px)]">
      <div className="lg:col-span-5 flex justify-center relative">
        <div className="relative w-full aspect-square max-w-[400px]">
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/30 animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-4 rounded-full border-2 border-primary/10 animate-[spin_15s_linear_infinite_reverse]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-80 bg-slate-800 rounded-xl flex items-center justify-center transform -rotate-12 border border-primary/40 backdrop-blur-sm shadow-2xl overflow-hidden">
              <img 
                src="/src/file_000000001ab061f78d357f6eecda1a46.png" 
                alt="Author Avatar Large" 
                className="w-full h-full object-cover opacity-90"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
            <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
            <div className="w-3 h-3 rounded-full bg-primary animate-ping delay-500" />
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 w-full max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <div className="size-24 rounded-full border-2 border-primary p-1">
                  <div className="size-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                    <img 
                      src="/avatar.png"
                      alt="Author Avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "https://ui-avatars.com/api/?name=Le+Phuc+Tien&background=13c8ec&color=fff";
                      }}
                    />
                  </div>
                </div>
                <span className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-background-dark" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-1 text-gradient">Lê Phúc Tiến</h1>
                <p className="text-primary font-medium text-lg uppercase tracking-widest">Class 12A1 • Digital Explorer</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-4">
                  Xin chào! Tôi là Lê Phúc Tiến, một học sinh lớp 12A1 với niềm đam mê cháy bỏng dành cho công nghệ và vũ trụ. Dự án "Vũ Trụ Số" này không chỉ là một bài tập trường học, mà là bước khởi đầu cho giấc mơ chinh phục những vì sao bằng dòng mã của tôi.
                </p>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-4">
                  Trong quá trình xây dựng website này, tôi đã dành hàng trăm giờ để nghiên cứu về ReactJS, Tailwind CSS và các thư viện đồ họa. Từng hiệu ứng chuyển động, từng ngôi sao lấp lánh đều được tôi lập trình tỉ mỉ để tạo ra trải nghiệm chân thực nhất.
                </p>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-4">
                  Tôi tin rằng lập trình không chỉ là những dòng lệnh khô khan, mà là công cụ để hiện thực hóa trí tưởng tượng. Việc kết hợp giữa kiến thức vật lý thiên văn và kỹ thuật phần mềm đã giúp tôi hiểu sâu sắc hơn về vẻ đẹp của sự vận động trong vũ trụ.
                </p>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-4">
                  Điểm đặc biệt của dự án là giao diện đồ họa không gian với phong cách Neon-Futuristic. Tôi muốn người xem không chỉ đọc thông tin, mà còn cảm nhận được sự huyền bí, rộng lớn và hiện đại của kỷ nguyên khai phá không gian mới.
                </p>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-4">
                  Khi nhìn thấy mô hình Hệ Mặt Trời hoạt động trơn tru trên màn hình, tôi cảm thấy vô cùng tự hào và xúc động. Nó giống như tôi đã tạo ra một vũ trụ thu nhỏ của riêng mình, nơi tôi có thể chia sẻ kiến thức và niềm đam mê với mọi người.
                </p>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  Hy vọng rằng "Vũ Trụ Số" sẽ khơi gợi niềm yêu thích khoa học và công nghệ trong bạn. Hãy cùng tôi tiếp tục khám phá những chân trời mới, vì giới hạn duy nhất chính là trí tưởng tượng của chúng ta.
                </p>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Terminal className="size-5 text-primary" /> Kỹ Năng Hệ Thống
                </h3>
                <div className="flex flex-wrap gap-3">
                  {['HTML5', 'CSS3 / TAILWIND', 'JAVASCRIPT', 'UI/UX DESIGN'].map(skill => (
                    <span key={skill} className="px-4 py-1.5 rounded-full bg-primary/20 border border-primary/50 text-primary text-sm font-bold neon-glow">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-center">
                <div className="flex gap-4">
                  {[
                    { Icon: Github, href: "https://github.com/KGscp" },
                    { Icon: Facebook, href: "https://www.facebook.com/tien.le.446771" },
                    { Icon: MessageSquare, href: "https://discord.com/users/520534616738758656" },
                    { Icon: Mail, href: "irienothing@gmail.com" }
                  ].map((social, i) => (
                    <button 
                      key={i} 
                      onClick={() => {
                        if (social.Icon === Mail) {
                          handleCopyEmail(social.href);
                        } else {
                          window.open(social.href, "_blank");
                        }
                      }}
                      className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 hover:bg-primary hover:text-background-dark transition-all border border-primary/20 text-primary"
                    >
                      <social.Icon className="size-5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100]"
          >
            <Loading />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isWarping && (
          <motion.div
            key="warp"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/80" />
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-full h-[2px] bg-cyan-500 blur-sm"
                  style={{
                    top: '50%',
                    left: '50%',
                    width: '50%',
                    transformOrigin: 'left center',
                    rotate: `${i * 18}deg`,
                  }}
                  animate={{
                    scaleX: [0, 5, 0],
                    opacity: [0, 1, 0],
                    x: [0, 500, 1000]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.05,
                    ease: "linear"
                  }}
                />
              ))}
              <motion.div 
                className="text-6xl font-black text-white uppercase tracking-[0.5em] italic"
                animate={{ scale: [1, 1.5], opacity: [0, 1, 0] }}
                transition={{ duration: 0.8 }}
              >
                WARP SPEED
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="star-field" />
      <Navbar />
      
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {currentView === 'home' && <HomeView />}
            {currentView === 'detail' && <PlanetDetailView />}
            {currentView === 'simulation' && <SimulationView />}
            {currentView === 'profile' && <ProfileView />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="w-full px-6 md:px-10 py-4 bg-background-dark/80 backdrop-blur-md border-t border-white/10 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-6 text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            HỆ THỐNG TRỰC TUYẾN
          </div>
          <div className="hidden sm:block uppercase tracking-widest">
            LAT: 10.8231° N | LONG: 106.6297° E
          </div>
          <div className="hidden md:block">
            OXYGEN: 98% | FUEL: OPTIMAL
          </div>
        </div>
        <div className="text-[10px] text-slate-500">
          Copyright © 2026 by Le Phuc Tien. Space Exploration Portfolio.
        </div>
      </footer>
    </div>
  );
}
