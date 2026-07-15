import { useEffect, useRef, useState } from "react";
import { Globe, ArrowRight, X, Mail, Phone, MapPin, Award, Briefcase, GraduationCap, BookOpen, ExternalLink } from "lucide-react";

// Inline custom SVG icons for social platforms
const GithubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-github"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-linkedin"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Custom Spaceship SVG Cursor Component
const SpaceshipCursor = () => (
  <svg
    viewBox="0 0 24 24"
    width="28"
    height="28"
    fill="white"
    stroke="rgba(255,255,255,0.4)"
    strokeWidth="1"
    className="drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
  >
    <path d="M12 2L3 22L10 18L12 15L14 18L21 22L12 2Z" />
    <circle cx="12" cy="16" r="3" fill="#ff4d00" className="animate-ping" />
    <circle cx="12" cy="16" r="1.5" fill="#ffaa00" />
  </svg>
);

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentAnimationRef = useRef<number | null>(null);
  const loopRef = useRef<number | null>(null);
  const fadingOutRef = useRef<boolean>(false);
  
  const [email, setEmail] = useState("");
  const [activeModal, setActiveModal] = useState<string | null>(null); // 'manifesto' | 'contact' | null
  const [modalTab, setModalTab] = useState<string>("about"); // 'about' | 'projects' | 'certificates' | 'experience' | 'skills'

  // Decoupled Mouse Tracking Refs (prevents mousemove event loop bottlenecks)
  const customCursorRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef({ x: -100, y: -100 });
  const currentCursorPos = useRef({ x: -100, y: -100 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastMoveTime = useRef(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Web Audio API Synthesizer Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const thrusterOscRef = useRef<OscillatorNode | null>(null);
  const thrusterGainRef = useRef<GainNode | null>(null);

  // Initialize browser Web Audio Context
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  // Play Laser sound on click
  const playLaserSound = () => {
    if (isTouchDevice) return;
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      console.warn("Web Audio Laser Error:", e);
    }
  };

  // Play Sci-Fi sweep sound on hover
  const playHoverSound = () => {
    if (isTouchDevice) return;
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.warn("Web Audio Hover Error:", e);
    }
  };

  // Video looping fade manager
  const fadeVideo = (targetOpacity: number, duration: number, callback?: () => void) => {
    if (currentAnimationRef.current) {
      cancelAnimationFrame(currentAnimationRef.current);
    }
    const video = videoRef.current;
    if (!video) return;

    const startOpacity = parseFloat(video.style.opacity) || 0;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = startOpacity + (targetOpacity - startOpacity) * progress;
      video.style.opacity = current.toString();

      if (progress < 1) {
        currentAnimationRef.current = requestAnimationFrame(animate);
      } else {
        currentAnimationRef.current = null;
        if (callback) callback();
      }
    };
    currentAnimationRef.current = requestAnimationFrame(animate);
  };

  // Unified 60 FPS requestAnimationFrame Thread for Video fading, Eased cursor movement & Throttled Audio
  const updateLoop = () => {
    const now = performance.now();

    // 1. Check Video timing
    const video = videoRef.current;
    if (video && !video.paused) {
      const remainingTime = video.duration - video.currentTime;
      if (video.duration && remainingTime <= 0.55 && !fadingOutRef.current) {
        fadingOutRef.current = true;
        fadeVideo(0, 500);
      }
    }

    // 2. Spaceship Cursor position linear interpolation (eased motion / glide drift)
    const cursor = customCursorRef.current;
    if (cursor && !isTouchDevice) {
      const ease = 0.16; // Lerp factor for smooth glide feel
      const targetX = mousePosRef.current.x;
      const targetY = mousePosRef.current.y;

      if (currentCursorPos.current.x === -100) {
        currentCursorPos.current = { x: targetX, y: targetY };
      } else {
        currentCursorPos.current.x += (targetX - currentCursorPos.current.x) * ease;
        currentCursorPos.current.y += (targetY - currentCursorPos.current.y) * ease;
      }

      // Render updated cursor location on hardware layer
      cursor.style.transform = `translate3d(${currentCursorPos.current.x}px, ${currentCursorPos.current.y}px, 0)`;

      // Rotate ship to face direction of travel
      const dx = targetX - lastMousePos.current.x;
      const dy = targetY - lastMousePos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 1.2) {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        const icon = cursor.querySelector(".spaceship-icon-wrapper") as HTMLElement;
        if (icon) {
          icon.style.transform = `rotate(${angle}deg)`;
        }
      }
      lastMousePos.current = { x: targetX, y: targetY };
    }

    // 3. Engine Thruster Hum Scheduling
    if (!isTouchDevice && audioCtxRef.current && thrusterGainRef.current) {
      const timeSinceLastMove = now - lastMoveTime.current;
      const ctx = audioCtxRef.current;
      const gainNode = thrusterGainRef.current;

      if (timeSinceLastMove < 150) {
        // Active movement: increase thruster roar
        gainNode.gain.setTargetAtTime(0.04, ctx.currentTime, 0.05);
      } else {
        // Stop: decelerate volume smoothly
        gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
      }
    }

    loopRef.current = requestAnimationFrame(updateLoop);
  };

  const handleEnded = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (currentAnimationRef.current) {
      cancelAnimationFrame(currentAnimationRef.current);
      currentAnimationRef.current = null;
    }
    video.style.opacity = "0";

    setTimeout(() => {
      video.currentTime = 0;
      video.play()
        .then(() => {
          fadingOutRef.current = false;
          fadeVideo(1, 500);
        })
        .catch((err) => console.error("Error playing video during loop:", err));
    }, 100);
  };

  // Initial sound setup when mouse starts moving
  const initThrusterSound = () => {
    if (isTouchDevice || audioCtxRef.current) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(55, ctx.currentTime); // Low deep hum

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(140, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      thrusterOscRef.current = osc;
      thrusterGainRef.current = gain;
    } catch (e) {
      console.warn("Failed to init thruster:", e);
    }
  };

  useEffect(() => {
    const touchCheck = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(touchCheck);

    const video = videoRef.current;
    if (video) {
      video.style.opacity = "0";
      video.play()
        .then(() => {
          fadeVideo(1, 500);
          // Start the unified 60 FPS requestAnimationFrame thread
          loopRef.current = requestAnimationFrame(updateLoop);
        })
        .catch((err) => console.error("Error starting initial play:", err));
    }

    // High performance input capture: only stores coordinates and timestamps
    const handleMouseMove = (e: MouseEvent) => {
      if (touchCheck) return;
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      lastMoveTime.current = performance.now();
      
      // Lazy init AudioContext on first actual move
      initThrusterSound();
      
      const ctx = audioCtxRef.current;
      if (ctx && ctx.state === "suspended") {
        ctx.resume();
      }
    };

    const handleGlobalClick = () => {
      initThrusterSound();
      playLaserSound();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("click", handleGlobalClick);

    return () => {
      if (currentAnimationRef.current) cancelAnimationFrame(currentAnimationRef.current);
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  const openManifestoTab = (tabName: string) => {
    setModalTab(tabName);
    setActiveModal("manifesto");
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setActiveModal("contact");
  };

  return (
    <div className={`min-h-screen bg-black overflow-hidden relative flex flex-col justify-between text-white ${!isTouchDevice ? "custom-cursor-active" : ""}`}>
      
      {/* Custom Spaceship Cursor (Eased coordinates render) */}
      {!isTouchDevice && (
        <div
          ref={customCursorRef}
          className="fixed pointer-events-none z-[9999] top-0 left-0 -ml-[14px] -mt-[14px] will-change-transform select-none"
          style={{ transform: "translate3d(-100px, -100px, 0)" }}
        >
          <div className="spaceship-icon-wrapper transition-transform duration-75 ease-out">
            <SpaceshipCursor />
          </div>
        </div>
      )}

      {/* Background Video */}
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ 
          opacity: 0, 
          willChange: "opacity", 
          transform: "translate3d(0, 17%, 0)" 
        }}
        onEnded={handleEnded}
      />

      {/* Navigation Bar */}
      <nav className="relative z-20 px-6 py-6 w-full">
        <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
          {/* Left side: Logo & Nav Links */}
          <div className="flex items-center gap-8">
            <div 
              id="nav-logo" 
              className="flex items-center gap-2 cursor-pointer hover:scale-95 active:scale-90 transition-transform duration-200" 
              onClick={() => setActiveModal(null)}
              onMouseEnter={playHoverSound}
            >
              <Globe className="w-6 h-6 text-white" />
              <span className="font-semibold text-lg text-white tracking-wide">Sohaye</span>
            </div>
            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              <button 
                id="nav-link-about" 
                onClick={() => openManifestoTab("about")} 
                onMouseEnter={playHoverSound}
                className="text-white/80 hover:text-white hover:scale-95 active:scale-90 transition-transform duration-200 text-sm font-medium"
              >
                About
              </button>
              <button 
                id="nav-link-projects" 
                onClick={() => openManifestoTab("projects")} 
                onMouseEnter={playHoverSound}
                className="text-white/80 hover:text-white hover:scale-95 active:scale-90 transition-transform duration-200 text-sm font-medium"
              >
                Projects
              </button>
              <button 
                id="nav-link-skills" 
                onClick={() => openManifestoTab("skills")} 
                onMouseEnter={playHoverSound}
                className="text-white/80 hover:text-white hover:scale-95 active:scale-90 transition-transform duration-200 text-sm font-medium"
              >
                Skills
              </button>
              <button 
                id="nav-link-experience" 
                onClick={() => openManifestoTab("experience")} 
                onMouseEnter={playHoverSound}
                className="text-white/80 hover:text-white hover:scale-95 active:scale-90 transition-transform duration-200 text-sm font-medium"
              >
                Experience
              </button>
              <button 
                id="nav-link-certificates" 
                onClick={() => openManifestoTab("certificates")} 
                onMouseEnter={playHoverSound}
                className="text-white/80 hover:text-white hover:scale-95 active:scale-90 transition-transform duration-200 text-sm font-medium"
              >
                Certificates
              </button>
            </div>
          </div>
          {/* Right side: Resume & Contact Me */}
          <div className="flex items-center gap-4">
            <a 
              id="nav-btn-resume" 
              href="/areej_zahra_cv.pdf" 
              target="_blank" 
              rel="noreferrer" 
              onMouseEnter={playHoverSound}
              className="text-white/90 hover:text-white hover:scale-95 active:scale-90 transition-transform duration-200 text-sm font-medium"
            >
              Resume
            </a>
            <button 
              id="nav-btn-contact" 
              onClick={() => setActiveModal("contact")} 
              onMouseEnter={playHoverSound}
              className="liquid-glass rounded-full px-6 py-2 text-sm font-medium text-white hover:bg-white/5 hover:scale-95 active:scale-90 transition-transform duration-200"
            >
              Contact Me
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[12%]">
        <span className="text-xs uppercase tracking-[0.3em] text-white/50 mb-3 block">Personal Portfolio</span>
        <h1
          id="hero-heading"
          style={{ fontFamily: "'Instrument Serif', serif" }}
          className="text-4xl md:text-5xl lg:text-6xl text-white mb-6 tracking-tight max-w-4xl mx-auto leading-tight italic"
        >
          Areej Zahra
        </h1>

        <div className="max-w-3xl w-full space-y-6 flex flex-col items-center">
          {/* Headline (Styled role labels) */}
          <div className="text-sm md:text-base text-white/80 font-normal leading-relaxed tracking-wider px-4 max-w-2xl">
            Computer Science Student <span className="text-white/30 px-1">|</span> Software Engineering Enthusiast <span className="text-white/30 px-1">|</span> C++ <span className="text-white/30 px-1">|</span> Java <span className="text-white/30 px-1">|</span> Python Developer <span className="text-white/30 px-1">|</span> Web Engineer <span className="text-white/30 px-1">|</span> Graphic Designer <span className="text-white/30 px-1">|</span> Ethical Hacker
          </div>

          {/* Subtitle / Bio summary */}
          <p className="text-white/60 text-sm leading-relaxed max-w-xl px-4">
            Motivated 3rd-year Computer Science student at Sukkur IBA University with hands-on experience in software development, cybersecurity, and data analytics. Focused on building robust, secure, and intuitive digital systems.
          </p>

          {/* Email input/interaction bar */}
          <form id="email-form" onSubmit={handleEmailSubmit} className="w-full max-w-md pt-2">
            <div className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3 w-full hover:scale-95 duration-200 transition-transform">
              <input
                id="email-input"
                type="email"
                required
                placeholder="Enter your email to connect..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-white placeholder:text-white/40 text-sm py-1"
              />
              <button
                id="email-submit-btn"
                type="submit"
                onMouseEnter={playHoverSound}
                className="bg-white rounded-full p-3 text-black hover:bg-white/90 active:scale-90 transition-all flex items-center justify-center"
                aria-label="Connect"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Manifesto Button */}
          <button 
            id="manifesto-btn" 
            onClick={() => openManifestoTab("about")}
            onMouseEnter={playHoverSound}
            className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 hover:scale-95 active:scale-90 transition-transform duration-200 mt-2"
          >
            Manifesto
          </button>
        </div>
      </main>

      {/* Social Icons Footer */}
      <footer className="relative z-10 flex justify-center gap-4 pb-12 w-full">
        <a
          id="social-github"
          href="https://github.com/AreejZahra92"
          target="_blank"
          rel="noreferrer"
          onMouseEnter={playHoverSound}
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 hover:scale-95 active:scale-90 transition-transform duration-200 flex items-center justify-center"
          aria-label="GitHub"
        >
          <GithubIcon />
        </a>
        <a
          id="social-linkedin"
          href="https://linkedin.com/in/areej-zahra-120357416"
          target="_blank"
          rel="noreferrer"
          onMouseEnter={playHoverSound}
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 hover:scale-95 active:scale-90 transition-transform duration-200 flex items-center justify-center"
          aria-label="LinkedIn"
        >
          <LinkedinIcon />
        </a>
        <a
          id="social-globe"
          href="mailto:sohafatima171@gmail.com"
          onMouseEnter={playHoverSound}
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 hover:scale-95 active:scale-90 transition-transform duration-200 flex items-center justify-center"
          aria-label="Email"
        >
          <Mail className="w-5 h-5" />
        </a>
      </footer>

      {/* ================= MODAL INTERFACES ================= */}

      {/* 1. Manifesto Modal */}
      {activeModal === "manifesto" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="liquid-glass w-full max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden flex flex-col md:flex-row text-left shadow-2xl border border-white/10 animate-scaleUp">
            {/* Modal Sidebar (Tabs) */}
            <div className="w-full md:w-1/4 bg-white/5 p-6 border-b md:border-b-0 md:border-r border-white/5 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible whitespace-nowrap">
              <button 
                onClick={() => setModalTab("about")}
                onMouseEnter={playHoverSound}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${modalTab === "about" ? "bg-white/10 text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/5 hover:scale-95 duration-200"}`}
              >
                <BookOpen className="w-4 h-4" /> About
              </button>
              <button 
                onClick={() => setModalTab("projects")}
                onMouseEnter={playHoverSound}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${modalTab === "projects" ? "bg-white/10 text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/5 hover:scale-95 duration-200"}`}
              >
                <Briefcase className="w-4 h-4" /> Projects
              </button>
              <button 
                onClick={() => setModalTab("certificates")}
                onMouseEnter={playHoverSound}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${modalTab === "certificates" ? "bg-white/10 text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/5 hover:scale-95 duration-200"}`}
              >
                <Award className="w-4 h-4" /> Certificates
              </button>
              <button 
                onClick={() => setModalTab("experience")}
                onMouseEnter={playHoverSound}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${modalTab === "experience" ? "bg-white/10 text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/5 hover:scale-95 duration-200"}`}
              >
                <Briefcase className="w-4 h-4" /> Experience
              </button>
              <button 
                onClick={() => setModalTab("skills")}
                onMouseEnter={playHoverSound}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${modalTab === "skills" ? "bg-white/10 text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/5 hover:scale-95 duration-200"}`}
              >
                <GraduationCap className="w-4 h-4" /> Skills
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-8 overflow-y-auto max-h-[60vh] md:max-h-[80vh] flex flex-col justify-between">
              <div>
                {/* Header inside modal */}
                <div className="flex items-start justify-between border-b border-white/5 pb-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white capitalize">{modalTab} Section</h2>
                    <p className="text-xs text-white/40 mt-1">Sohaye &bull; Portfolio Manifesto</p>
                  </div>
                  <button 
                    onClick={() => setActiveModal(null)} 
                    onMouseEnter={playHoverSound}
                    className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white hover:scale-95 active:scale-90 transition-transform duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content Renderers */}
                {modalTab === "about" && (
                  <div className="space-y-4 text-white/80">
                    <p className="text-base leading-relaxed">
                      I am a highly motivated <strong>Computer Science Student</strong> and <strong>Software Engineering Enthusiast</strong> with hands-on practice in system development, database engineering, web development, and graphics.
                    </p>
                    <p className="text-sm leading-relaxed text-white/60">
                      Currently studying at <strong>Sukkur IBA University</strong> (BS Computer Science, GPA: 3.74, 2024-2028). I focus on creating fast, highly optimized code while implementing robust defense mechanisms to protect data integrity.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <h4 className="text-xs uppercase tracking-wider text-white/40 mb-2">Technical Foundations</h4>
                        <p className="text-sm">Structured program designs in C++, Java, and Python. Designing complex data layouts and systems.</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <h4 className="text-xs uppercase tracking-wider text-white/40 mb-2">Cybersecurity Interest</h4>
                        <p className="text-sm">Passionate about defensive programming, testing vulnerabilities, encryption tools, and ethical hacking.</p>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === "projects" && (
                  <div className="space-y-6">
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 hover:scale-95 duration-250 transition-transform">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">Air Fruit Ninja</h3>
                        <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-white/70">Python / CV / Hand-Tracking</span>
                      </div>
                      <p className="text-sm text-white/60 mb-4">
                        An interactive, gesture-controlled game using computer vision and hand tracking models where players slice virtual fruits in mid-air using hand movements captured by their webcam.
                      </p>
                      <a 
                        href="https://github.com/AreejZahra92/Air-Fruit-Ninja" 
                        target="_blank" 
                        rel="noreferrer"
                        onMouseEnter={playHoverSound}
                        className="inline-flex items-center gap-1.5 text-xs text-white bg-white/10 hover:bg-white/20 hover:scale-95 active:scale-90 transition-transform duration-200 px-4 py-2 rounded-lg"
                      >
                        <GithubIcon /> Source Code <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 hover:scale-95 duration-250 transition-transform">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">Air Drawer</h3>
                        <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-white/70">Python / OpenCV / MediaPipe</span>
                      </div>
                      <p className="text-sm text-white/60 mb-4">
                        A computer vision drawing utility that tracks fingertip coordinates in real-time, allowing users to draw, sketch, and write text in the air using hand gestures.
                      </p>
                      <a 
                        href="https://github.com/AreejZahra92/AirDrawer" 
                        target="_blank" 
                        rel="noreferrer"
                        onMouseEnter={playHoverSound}
                        className="inline-flex items-center gap-1.5 text-xs text-white bg-white/10 hover:bg-white/20 hover:scale-95 active:scale-90 transition-transform duration-200 px-4 py-2 rounded-lg"
                      >
                        <GithubIcon /> Source Code <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 hover:scale-95 duration-250 transition-transform">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">Caesar Cipher Encryption Tool</h3>
                        <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-white/70">C++ / Security</span>
                      </div>
                      <p className="text-sm text-white/60 mb-4">
                        A robust application implementing Caesar cipher and custom key-shift encryptions to secure messages. Built as an early-stage security project during coursework.
                      </p>
                      <a 
                        href="https://github.com/AreejZahra92" 
                        target="_blank" 
                        rel="noreferrer"
                        onMouseEnter={playHoverSound}
                        className="inline-flex items-center gap-1.5 text-xs text-white bg-white/10 hover:bg-white/20 hover:scale-95 active:scale-90 transition-transform duration-200 px-4 py-2 rounded-lg"
                      >
                        <GithubIcon /> Source Code <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 hover:scale-95 duration-250 transition-transform">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">Password Strength Checker</h3>
                        <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-white/70">Python / Security</span>
                      </div>
                      <p className="text-sm text-white/60 mb-4">
                        A security analysis utility that parses string entropy, character frequencies, length, and checks against common leaks to gauge credential vulnerability.
                      </p>
                      <a 
                        href="https://github.com/AreejZahra92" 
                        target="_blank" 
                        rel="noreferrer"
                        onMouseEnter={playHoverSound}
                        className="inline-flex items-center gap-1.5 text-xs text-white bg-white/10 hover:bg-white/20 hover:scale-95 active:scale-90 transition-transform duration-200 px-4 py-2 rounded-lg"
                      >
                        <GithubIcon /> Source Code <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}

                {modalTab === "certificates" && (
                  <div className="grid grid-cols-1 gap-4 animate-fadeIn">
                    {/* Certificate 1: Google AI */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:scale-98 duration-200 transition-transform">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/10 rounded-lg text-white shrink-0">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-sm md:text-base">Google AI Professional Certificate</h4>
                          <p className="text-xs text-white/50">Google &bull; Coursera &bull; Jun 17, 2026</p>
                          <p className="text-xs text-white/70 mt-1">Fluent in AI applications: prompt engineering, brainstorming, AI tools coding, and responsible AI application.</p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                        <a 
                          href="/certificates/google_ai.pdf" 
                          target="_blank" 
                          rel="noreferrer"
                          onMouseEnter={playHoverSound}
                          className="flex-1 text-center text-xs text-white bg-white/10 hover:bg-white/15 hover:scale-95 active:scale-90 transition-transform duration-200 px-3 py-1.5 rounded-lg border border-white/5"
                        >
                          View PDF
                        </a>
                        <a 
                          href="https://coursera.org/verify/professional-cert/XNUMKET06HRX" 
                          target="_blank" 
                          rel="noreferrer"
                          onMouseEnter={playHoverSound}
                          className="flex-1 text-center text-xs text-black bg-white hover:bg-white/90 hover:scale-95 active:scale-90 transition-transform duration-200 px-3 py-1.5 rounded-lg"
                        >
                          Verify Online
                        </a>
                      </div>
                    </div>

                    {/* Certificate 2: Google Data Analytics */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:scale-98 duration-200 transition-transform">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/10 rounded-lg text-white shrink-0">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-sm md:text-base">Google Data Analytics Professional Certificate</h4>
                          <p className="text-xs text-white/50">Google &bull; Coursera &bull; Jun 10, 2026</p>
                          <p className="text-xs text-white/70 mt-1">Data cleaning, data processing, SQL database queries, analysis, and dashboard visualization using Tableau and Python.</p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                        <a 
                          href="/certificates/google_data_analytics.pdf" 
                          target="_blank" 
                          rel="noreferrer"
                          onMouseEnter={playHoverSound}
                          className="flex-1 text-center text-xs text-white bg-white/10 hover:bg-white/15 hover:scale-95 active:scale-90 transition-transform duration-200 px-3 py-1.5 rounded-lg border border-white/5"
                        >
                          View PDF
                        </a>
                        <a 
                          href="https://coursera.org/verify/professional-cert/1L1KLNUVXBD4" 
                          target="_blank" 
                          rel="noreferrer"
                          onMouseEnter={playHoverSound}
                          className="flex-1 text-center text-xs text-black bg-white hover:bg-white/90 hover:scale-95 active:scale-90 transition-transform duration-200 px-3 py-1.5 rounded-lg"
                        >
                          Verify Online
                        </a>
                      </div>
                    </div>

                    {/* Certificate 3: Google Cybersecurity */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:scale-98 duration-200 transition-transform">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/10 rounded-lg text-white shrink-0">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-sm md:text-base">Google Cybersecurity Professional Certificate</h4>
                          <p className="text-xs text-white/50">Google &bull; Coursera &bull; Jun 10, 2026</p>
                          <p className="text-xs text-white/70 mt-1">Risk detection, Linux shells, SQL auditing, SIEM dashboard monitoring, and network protocol defense security controls.</p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                        <a 
                          href="/certificates/google_cybersecurity.pdf" 
                          target="_blank" 
                          rel="noreferrer"
                          onMouseEnter={playHoverSound}
                          className="flex-1 text-center text-xs text-white bg-white/10 hover:bg-white/15 hover:scale-95 active:scale-90 transition-transform duration-200 px-3 py-1.5 rounded-lg border border-white/5"
                        >
                          View PDF
                        </a>
                        <a 
                          href="https://coursera.org/verify/professional-cert/UMITXUZBF3F6" 
                          target="_blank" 
                          rel="noreferrer"
                          onMouseEnter={playHoverSound}
                          className="flex-1 text-center text-xs text-black bg-white hover:bg-white/90 hover:scale-95 active:scale-90 transition-transform duration-200 px-3 py-1.5 rounded-lg"
                        >
                          Verify Online
                        </a>
                      </div>
                    </div>

                    {/* Certificate 4: Introduction to Git and GitHub */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:scale-98 duration-200 transition-transform">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/10 rounded-lg text-white shrink-0">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-sm md:text-base">Introduction to Git and GitHub</h4>
                          <p className="text-xs text-white/50">Google &bull; Coursera &bull; Jul 6, 2026</p>
                          <p className="text-xs text-white/70 mt-1">Version control systems, local repositories, remote branches, merges, rebases, pull requests, and collaborative coding workflows.</p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                        <a 
                          href="/certificates/git_github.pdf" 
                          target="_blank" 
                          rel="noreferrer"
                          onMouseEnter={playHoverSound}
                          className="flex-1 text-center text-xs text-white bg-white/10 hover:bg-white/15 hover:scale-95 active:scale-90 transition-transform duration-200 px-3 py-1.5 rounded-lg border border-white/5"
                        >
                          View PDF
                        </a>
                        <a 
                          href="https://coursera.org/verify/5KRMYWU5519O" 
                          target="_blank" 
                          rel="noreferrer"
                          onMouseEnter={playHoverSound}
                          className="flex-1 text-center text-xs text-black bg-white hover:bg-white/90 hover:scale-95 active:scale-90 transition-transform duration-200 px-3 py-1.5 rounded-lg"
                        >
                          Verify Online
                        </a>
                      </div>
                    </div>

                    {/* Certificate 5: Crash Course on Python */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:scale-98 duration-200 transition-transform">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/10 rounded-lg text-white shrink-0">
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-sm md:text-base">Crash Course on Python</h4>
                          <p className="text-xs text-white/50">Google &bull; Coursera &bull; Jul 6, 2026</p>
                          <p className="text-xs text-white/70 mt-1">Python syntax, variables, data structures (lists, dicts), loops, functions, object-oriented concepts, and basic script execution.</p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                        <a 
                          href="/certificates/python_crash_course.pdf" 
                          target="_blank" 
                          rel="noreferrer"
                          onMouseEnter={playHoverSound}
                          className="flex-1 text-center text-xs text-white bg-white/10 hover:bg-white/15 hover:scale-95 active:scale-90 transition-transform duration-200 px-3 py-1.5 rounded-lg border border-white/5"
                        >
                          View PDF
                        </a>
                        <a 
                          href="https://coursera.org/verify/5O6M1U4YMWDX" 
                          target="_blank" 
                          rel="noreferrer"
                          onMouseEnter={playHoverSound}
                          className="flex-1 text-center text-xs text-black bg-white hover:bg-white/90 hover:scale-95 active:scale-90 transition-transform duration-200 px-3 py-1.5 rounded-lg"
                        >
                          Verify Online
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === "experience" && (
                  <div className="relative border-l border-white/10 pl-6 space-y-6 animate-fadeIn">
                    <div className="relative hover:scale-98 duration-200 transition-transform origin-left">
                      <span className="absolute -left-[31px] top-1.5 w-3 h-3 bg-white rounded-full ring-4 ring-black" />
                      <h4 className="text-base font-semibold text-white">Front End Engineer Intern</h4>
                      <p className="text-xs text-white/50">Flyrank &bull; Remote &bull; Jun 2026 - Jul 2026</p>
                      <p className="text-xs text-white/70 mt-2">Developed and optimized responsive user interfaces using HTML, CSS, JavaScript, and React. Built interactive components and ensured cross-browser compatibility.</p>
                    </div>

                    <div className="relative hover:scale-98 duration-200 transition-transform origin-left">
                      <span className="absolute -left-[31px] top-1.5 w-3 h-3 bg-white rounded-full ring-4 ring-black" />
                      <h4 className="text-base font-semibold text-white">Cybersecurity Analyst Intern</h4>
                      <p className="text-xs text-white/50">DecodeLabs &bull; Remote &bull; Jun 2026 - Jul 2026</p>
                      <p className="text-xs text-white/70 mt-2">Conducted log analysis, parsed vulnerability feeds, mapped threat topologies, and audited web setups for security issues.</p>
                    </div>

                    <div className="relative hover:scale-98 duration-200 transition-transform origin-left">
                      <span className="absolute -left-[31px] top-1.5 w-3 h-3 bg-white rounded-full ring-4 ring-black" />
                      <h4 className="text-base font-semibold text-white">Graphic Design Intern</h4>
                      <p className="text-xs text-white/50">CodeAlpha &bull; Remote &bull; Jun 2026 - Jul 2026</p>
                      <p className="text-xs text-white/70 mt-2">Designed layouts, vector icons, visual identities, and interactive mockups for internal digital solutions.</p>
                    </div>
                  </div>
                )}

                {modalTab === "skills" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-white/40 mb-3">Programming Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {['C++', 'Java', 'Python', 'JavaScript'].map((lang) => (
                          <span key={lang} className="text-xs bg-white/5 border border-white/5 hover:border-white/15 hover:scale-95 duration-200 px-3 py-1.5 rounded-full text-white/80 transition-transform cursor-default">{lang}</span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <h4 className="text-xs uppercase tracking-wider text-white/40 mb-3">Professional Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {['Cybersecurity', 'Data Analytics', 'Project Management', 'Web Engineering', 'Graphic Designing', 'Ethical Hacking'].map((skill) => (
                          <span key={skill} className="text-xs bg-white/5 border border-white/5 hover:border-white/15 hover:scale-95 duration-200 px-3 py-1.5 rounded-full text-white/80 transition-transform cursor-default">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <h4 className="text-xs uppercase tracking-wider text-white/40 mb-3">Key Academic Courses</h4>
                      <div className="flex flex-wrap gap-2">
                        {['Data Structures', 'Object Oriented Programming', 'Digital Logic Design', 'Mobile App Development'].map((course) => (
                          <span key={course} className="text-xs bg-white/5 border border-white/5 hover:border-white/15 hover:scale-95 duration-200 px-3 py-1.5 rounded-full text-white/80 transition-transform cursor-default">{course}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action area inside modal */}
              <div className="border-t border-white/5 pt-6 mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="text-xs text-white/40">Are you interested in collaborating? Let's talk about projects.</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveModal("contact")} 
                    onMouseEnter={playHoverSound}
                    className="bg-white text-black text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-white/90 hover:scale-95 active:scale-90 transition-transform duration-200"
                  >
                    Get In Touch
                  </button>
                  <a 
                    href="/areej_zahra_cv.pdf" 
                    target="_blank" 
                    rel="noreferrer" 
                    onMouseEnter={playHoverSound}
                    className="liquid-glass text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-white/5 hover:scale-95 active:scale-90 transition-transform duration-200 inline-flex items-center justify-center"
                  >
                    View Full Resume
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Contact Modal */}
      {activeModal === "contact" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="liquid-glass w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-white/10 animate-scaleUp text-left">
            <div className="flex items-start justify-between border-b border-white/5 pb-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Contact Sohaye</h2>
                <p className="text-xs text-white/40 mt-1">Get in touch directly with Areej Zahra</p>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                onMouseEnter={playHoverSound}
                className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white hover:scale-95 active:scale-90 transition-transform duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-sm text-white/70">
                You can reach out through the channels below, or use the direct mail form:
              </p>

              <div className="space-y-4">
                <a 
                  href="mailto:sohafatima171@gmail.com" 
                  onMouseEnter={playHoverSound}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/15 hover:scale-98 transition-all group"
                >
                  <div className="p-3 bg-white/15 rounded-lg text-white group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-white/40">Email</h4>
                    <p className="text-sm font-semibold text-white">sohafatima171@gmail.com</p>
                  </div>
                </a>

                <a 
                  href="https://linkedin.com/in/areej-zahra-120357416" 
                  target="_blank" 
                  rel="noreferrer"
                  onMouseEnter={playHoverSound}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/15 hover:scale-98 transition-all group"
                >
                  <div className="p-3 bg-white/15 rounded-lg text-white group-hover:scale-105 transition-transform">
                    <LinkedinIcon />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-white/40">LinkedIn</h4>
                    <p className="text-sm font-semibold text-white">areej-zahra-120357416</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="p-3 bg-white/15 rounded-lg text-white">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-white/40">Phone</h4>
                    <p className="text-sm font-semibold text-white">03333010983</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="p-3 bg-white/15 rounded-lg text-white">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-white/40">Location</h4>
                    <p className="text-sm font-semibold text-white">Old Sukkur, SUKKUR, PK</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <a 
                  href={`mailto:sohafatima171@gmail.com?subject=Contact%20From%20Portfolio&body=Hello%20Areej,`}
                  onMouseEnter={playHoverSound}
                  className="bg-white text-black font-semibold text-xs px-6 py-3 rounded-full hover:bg-white/90 hover:scale-95 active:scale-90 transition-all w-full text-center"
                >
                  Open Mail Client
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
