import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION - Edit these to customize the race!
// ═══════════════════════════════════════════════════════════════════

const RACE_QUESTIONS = [
  {
    id: 1,
    problem: "What is the capital city of France. Return exactly one city name in title case and nothing else.",
    answer: "Paris",
    systemPrompt: "You are a geography expert. Output exactly one city name in title case and nothing else.",
  },
  {
    id: 2,
    problem: "Compute 15 * 37. Return exactly one base-10 integer with no spaces, no punctuation, and no explanation.",
    answer: "555",
    systemPrompt: "You are a math expert. Output exactly one base-10 integer and nothing else.",
  },
  {
    id: 3,
    problem: "Name the programming language most commonly associated with running in web browsers. Return exactly one programming language name with correct capitalization and nothing else.",
    answer: "JavaScript",
    systemPrompt: "You are a programming expert. Output exactly one programming language name with correct capitalization and nothing else.",
  },
  {
    id: 4,
    problem: "Give the chemical symbol for gold. Return exactly one valid chemical symbol using correct capitalization and nothing else.",
    answer: "Au",
    systemPrompt: "You are a chemistry expert. Output exactly one chemical symbol with correct capitalization and nothing else.",
  },
  {
    id: 5,
    problem: "Name the planet known as the Red Planet. Return exactly one planet name in title case and nothing else.",
    answer: "Mars",
    systemPrompt: "You are an astronomy expert. Output exactly one planet name in title case and nothing else.",

  },
  {
    id: 6,
    problem: "Name the largest ocean on Earth. Return exactly one word in title case and nothing else.",
    answer: "Pacific",
    systemPrompt: "You are a geography expert. Output exactly one word in title case and nothing else.",
  },
  {
    id: 7,
    problem: "State the year in which the Titanic sank. Return exactly one four-digit year and nothing else.",
    answer: "1912",
    systemPrompt: "You are a history expert. Output exactly one four-digit year and nothing else.",
  },
  {
    id: 8,
    problem: "Compute the principal square root of 144. Return exactly one base-10 integer with no spaces, no punctuation, and no explanation.",
    answer: "12",
    systemPrompt: "You are a math expert. Output exactly one base-10 integer and nothing else.",
  },
];

const AI_MODELS = [
  {
    id: "claude-haiku-4-5",
    name: "claude-haiku-4-5",
    model: "claude-haiku-4-5",
    color: "#D97757",
    accentColor: "#F4A261",
    apiUrl: "https://api.anthropic.com/v1/messages",
    apiKey: "",
    provider: "anthropic",
    logoEmoji: "🟠",
    freeInfo: "Paid: ~$5 starter credit after phone verification at console.anthropic.com",
  },
  {
   id: "gpt-4o",
    name: "gpt-4o",
    model: "gpt-4o",
    color: "#10A37F",
    accentColor: "#34D399",
    apiUrl: "https://api.openai.com/v1/chat/completions",
    apiKey: "",
    provider: "openai",
    logoEmoji: "🟢",
    freeInfo: "Paid: $5 starter credits at platform.openai.com (free tier = GPT-3.5 only)",
  },
  {
    id: "gemini",
    name: "Gemini 2.5 Flash",
    model: "gemini-2.5-flash",
    color: "#4285F4",
    accentColor: "#60A5FA",
    apiUrl: "https://generativelanguage.googleapis.com/v1beta",
    apiKey: "",
    provider: "google",
    logoEmoji: "🔵",
    freeInfo: "Free tier: 10 RPM, 250 req/day. Get key at aistudio.google.com",
  },
  {
    id: "mistral",
    name: "Mistral Small",
    model: "mistral-small-latest",
    color: "#FF7000",
    accentColor: "#FB923C",
    apiUrl: "https://api.mistral.ai/v1/chat/completions",
    apiKey: "",
    provider: "mistral",
    logoEmoji: "🟡",
    freeInfo: "Free Experiment plan: console.mistral.ai — phone verification only",
  },
];

// ═══════════════════════════════════════════════════════════════════

// Real SVG logo paths — rendered BIG above each car for maximum clarity
const MODEL_LOGOS = {
  // Claude — the official Claude sparkle icon (Bootstrap Icons bi-claude, viewBox 0 0 16 16)
  anthropic: (
    <g transform="translate(-20,-20) scale(2.5)">
      <path fill="#D97757" d="m3.127 10.604 3.135-1.76.053-.153-.053-.085H6.11l-.525-.032-1.791-.048-1.554-.065-1.505-.08-.38-.081L0 7.832l.036-.234.32-.214.455.04 1.009.069 1.513.105 1.097.064 1.626.17h.259l.036-.105-.089-.065-.068-.064-1.566-1.062-1.695-1.121-.887-.646-.48-.327-.243-.306-.104-.67.435-.48.585.04.15.04.593.456 1.267.981 1.654 1.218.242.202.097-.068.012-.049-.109-.181-.9-1.626-.96-1.655-.428-.686-.113-.411a2 2 0 0 1-.068-.484l.496-.674L4.446 0l.662.089.279.242.411.94.666 1.48 1.033 2.014.302.597.162.553.06.17h.105v-.097l.085-1.134.157-1.392.154-1.792.052-.504.25-.605.497-.327.387.186.319.456-.045.294-.19 1.23-.37 1.93-.243 1.29h.142l.161-.16.654-.868 1.097-1.372.484-.545.565-.601.363-.287h.686l.505.751-.226.775-.707.895-.585.759-.839 1.13-.524.904.048.072.125-.012 1.897-.403 1.024-.186 1.223-.21.553.258.06.263-.218.536-1.307.323-1.533.307-2.284.54-.028.02.032.04 1.029.098.44.024h1.077l2.005.15.525.346.315.424-.053.323-.807.411-3.631-.863-.872-.218h-.12v.073l.726.71 1.331 1.202 1.667 1.55.084.383-.214.302-.226-.032-1.464-1.101-.565-.497-1.28-1.077h-.084v.113l.295.432 1.557 2.34.08.718-.112.234-.404.141-.444-.08-.911-1.28-.94-1.44-.759-1.291-.093.053-.448 4.821-.21.246-.484.186-.403-.307-.214-.496.214-.98.258-1.28.21-1.016.19-1.263.112-.42-.008-.028-.092.012-.953 1.307-1.448 1.957-1.146 1.227-.274.109-.477-.247.045-.44.266-.39 1.586-2.018.956-1.25.617-.723-.004-.105h-.036l-4.212 2.736-.75.096-.324-.302.04-.496.154-.162 1.267-.871z"/>
    </g>
  ),
  // OpenAI — the official hexagonal knot (Bootstrap Icons bi-openai, viewBox 0 0 16 16)
  openai: (
    <g transform="translate(-20,-20) scale(2.5)">
      <path fill="#10A37F" d="M14.949 6.547a3.94 3.94 0 0 0-.348-3.273 4.11 4.11 0 0 0-4.4-1.934A4.1 4.1 0 0 0 8.423.2 4.15 4.15 0 0 0 6.305.086a4.1 4.1 0 0 0-1.891.948 4.04 4.04 0 0 0-1.158 1.753 4.1 4.1 0 0 0-1.563.679A4 4 0 0 0 .554 4.72a3.99 3.99 0 0 0 .502 4.731 3.94 3.94 0 0 0 .346 3.274 4.11 4.11 0 0 0 4.402 1.933c.382.425.852.764 1.377.995.526.231 1.095.35 1.67.346 1.78.002 3.358-1.132 3.901-2.804a4.1 4.1 0 0 0 1.563-.68 4 4 0 0 0 1.14-1.253 3.99 3.99 0 0 0-.506-4.716m-6.097 8.406a3.05 3.05 0 0 1-1.945-.694l.096-.054 3.23-1.838a.53.53 0 0 0 .265-.455v-4.49l1.366.778q.02.011.025.035v3.722c-.003 1.653-1.361 2.992-3.037 2.996m-6.53-2.75a2.95 2.95 0 0 1-.36-2.01l.095.057L5.29 12.09a.53.53 0 0 0 .527 0l3.949-2.246v1.555a.05.05 0 0 1-.022.041L6.473 13.3c-1.454.826-3.311.335-4.15-1.098m-.85-6.94A3.02 3.02 0 0 1 3.07 3.949v3.785a.51.51 0 0 0 .262.451l3.93 2.237-1.366.779a.05.05 0 0 1-.044.003L2.588 9.349a2.98 2.98 0 0 1-1.116-4.086m11.22 2.583L8.745 5.602l1.366-.779a.05.05 0 0 1 .044-.003l3.264 1.856a2.98 2.98 0 0 1-.46 5.381v-3.91a.52.52 0 0 0-.267-.456m1.36-2.026-.095-.057-3.233-1.84a.53.53 0 0 0-.527 0L6.248 6.17V4.615a.05.05 0 0 1 .022-.042l3.264-1.855c1.453-.83 3.315-.34 4.15 1.093a2.96 2.96 0 0 1 .318 1.996M5.68 8.906 4.315 8.13a.05.05 0 0 1-.026-.035V4.37c0-1.653 1.364-2.994 3.043-2.994a3.05 3.05 0 0 1 1.942.698l-.096.054-3.23 1.838a.53.53 0 0 0-.264.456zm.742-1.578L8 6.396l1.578.932v1.864L8 10.124l-1.578-.932z"/>
    </g>
  ),
  // Google Gemini — the 4-pointed sparkle star (official Gemini icon shape)
  google: (
    <g transform="translate(-20,-20) scale(2.5)">
      <path fill="url(#geminiGrad)" d="M8 0C8 0 10.4 5.6 16 8C10.4 10.4 8 16 8 16C8 16 5.6 10.4 0 8C5.6 5.6 8 0 8 0Z"/>
    </g>
  ),
  // Mistral — the iconic colored squares forming an "M" shape (5 rows of squares)
  mistral: (
    <g transform="translate(-18,-20) scale(2.25)">
      {/* Row 1: ■ _ _ _ ■ */}
      <rect x="0" y="0" width="3.2" height="3.2" fill="#FF7000"/>
      <rect x="12.8" y="0" width="3.2" height="3.2" fill="#FF7000"/>
      {/* Row 2: ■ ■ _ ■ ■ */}
      <rect x="0" y="4" width="3.2" height="3.2" fill="#FFB800"/>
      <rect x="3.6" y="4" width="3.2" height="3.2" fill="#FF7000"/>
      <rect x="9.2" y="4" width="3.2" height="3.2" fill="#FF7000"/>
      <rect x="12.8" y="4" width="3.2" height="3.2" fill="#FFB800"/>
      {/* Row 3: ■ _ ■ _ ■ */}
      <rect x="0" y="8" width="3.2" height="3.2" fill="#FF7000"/>
      <rect x="6.4" y="8" width="3.2" height="3.2" fill="#FFB800"/>
      <rect x="12.8" y="8" width="3.2" height="3.2" fill="#FF7000"/>
      {/* Row 4: ■ _ _ _ ■ */}
      <rect x="0" y="12" width="3.2" height="3.2" fill="#FFB800"/>
      <rect x="12.8" y="12" width="3.2" height="3.2" fill="#FFB800"/>
      {/* Row 5: ■ _ _ _ ■ */}
      <rect x="0" y="16" width="3.2" height="3.2" fill="#FF7000"/>
      <rect x="12.8" y="16" width="3.2" height="3.2" fill="#FF7000"/>
    </g>
  ),
};

const F1Car = ({ color, accentColor, emoji, provider, x, lane, isMoving, name }) => {
  const carY = 140 + lane * 120;
  const bounceOffset = isMoving ? Math.sin(Date.now() / 80) * 2 : 0;
  const exhaustOpacity = isMoving ? 0.6 + Math.sin(Date.now() / 100) * 0.3 : 0;
  const logo = MODEL_LOGOS[provider];
  return (
    <g transform={`translate(${x}, ${carY + bounceOffset})`} style={{ transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
      {/* Exhaust particles */}
      {isMoving && (
        <>
          <rect x={-50} y={6} width={14} height={5} rx={2.5} fill={accentColor} opacity={exhaustOpacity * 0.4} />
          <rect x={-44} y={11} width={9} height={4} rx={2} fill={color} opacity={exhaustOpacity * 0.25} />
          <circle cx={-38} cy={9} r={3.5} fill={accentColor} opacity={exhaustOpacity * 0.15} />
          <circle cx={-48} cy={10} r={5} fill="white" opacity={exhaustOpacity * 0.08} />
          <rect x={-56} y={8} width={8} height={3} rx={1.5} fill={color} opacity={exhaustOpacity * 0.12} />
        </>
      )}
      {/* Car body */}
      <rect x={-32} y={-4} width={66} height={28} rx={5} fill={color} />
      {/* Side panel accent */}
      <rect x={-24} y={0} width={17} height={20} rx={3} fill={accentColor} opacity={0.25} />
      {/* Rear wing */}
      <polygon points="-32,24 -38,12 -32,0" fill={color} opacity={0.85} />
      <rect x={-39} y={2} width={3} height={16} rx={1} fill={accentColor} opacity={0.4} />
      {/* Front nose */}
      <polygon points="34,4 48,10 34,20" fill={accentColor} />
      <rect x={36} y={3} width={3} height={18} rx={1} fill={color} opacity={0.6} />
      {/* Cockpit / air intake */}
      <rect x={-12} y={-8} width={24} height={10} rx={4} fill={accentColor} opacity={0.4} />
      <rect x={-8} y={-6} width={16} height={6} rx={2} fill="#00000044" />
      {/* Logo floating above car — BIG and clear */}
      <g transform="translate(3, -30)">
        {logo || <text textAnchor="middle" fontSize={14} style={{ userSelect: "none" }}>{emoji}</text>}
      </g>
      {/* Wheels */}
      <circle cx={-17} cy={26} r={8} fill="#0f0f22" stroke="#444" strokeWidth={2} />
      <circle cx={-17} cy={26} r={4} fill="#333" />
      <line x1={-17} y1={20} x2={-17} y2={32} stroke="#555" strokeWidth={0.8} />
      <line x1={-23} y1={26} x2={-11} y2={26} stroke="#555" strokeWidth={0.8} />
      <circle cx={22} cy={26} r={8} fill="#0f0f22" stroke="#444" strokeWidth={2} />
      <circle cx={22} cy={26} r={4} fill="#333" />
      <line x1={22} y1={20} x2={22} y2={32} stroke="#555" strokeWidth={0.8} />
      <line x1={16} y1={26} x2={28} y2={26} stroke="#555" strokeWidth={0.8} />
      {/* Name label above logo */}
      <text x={3} y={-55} textAnchor="middle" fill={color} fontSize={9} fontWeight="bold" fontFamily="'Orbitron', monospace" style={{ userSelect: "none" }}>{name}</text>
    </g>
  );
};

const CheckeredFlag = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x={0} y={-30} width={3} height={40} fill="#666" />
    {[0, 1, 2, 3].map((row) =>
      [0, 1, 2].map((col) => (
        <rect key={`${row}-${col}`} x={3 + col * 6} y={-30 + row * 6} width={6} height={6} fill={(row + col) % 2 === 0 ? "#fff" : "#222"} />
      ))
    )}
  </g>
);

const Speedometer = ({ label, value, unit, color }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 20, fontWeight: 900, color, lineHeight: 1, textShadow: `0 0 20px ${color}44` }}>{value}</div>
    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 7, color: "#888", textTransform: "uppercase", letterSpacing: 2, marginTop: 2 }}>{unit}</div>
    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 8, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginTop: 3 }}>{label}</div>
  </div>
);

const TabBtn = ({ active, color, onClick, children }) => (
  <button onClick={onClick} style={{
    background: active ? `${color}25` : "#ffffff08",
    border: `1px solid ${active ? color + "88" : color + "55"}`,
    color, padding: "8px 16px", borderRadius: 6, cursor: "pointer",
    fontFamily: "'Orbitron', monospace", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", transition: "all 0.2s",
  }}>{children}</button>
);

// ═══════════════════════════════════════════════════════════════════
// SOUND ENGINE — All synthesized via Web Audio API, no files needed
// ═══════════════════════════════════════════════════════════════════
const SoundEngine = {
  ctx: null,
  raceOsc: null,
  raceGain: null,
  raceInterval: null,

  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === "suspended") this.ctx.resume();
  },

  // Single beep at a given frequency and duration
  beep(freq, duration = 0.15, volume = 0.3, type = "square") {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  // Countdown: 3 beeps rising in pitch, then a big GO chord
  countdownBeep(number) {
    if (number === 3) this.beep(440, 0.2, 0.25);
    else if (number === 2) this.beep(554, 0.2, 0.3);
    else if (number === 1) this.beep(659, 0.2, 0.35);
  },

  goSound() {
    this.init();
    // Big chord: C5 + E5 + G5 + C6
    [523, 659, 784, 1047].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i < 2 ? "sawtooth" : "square";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + i * 0.02);
      osc.stop(this.ctx.currentTime + 0.8);
    });
  },

  // Racing background beat — driving synth loop
  startRaceMusic() {
    this.init();
    this.stopRaceMusic();
    const bpm = 140;
    const beatLen = 60 / bpm;
    let step = 0;

    // Bass pattern (notes in Hz)
    const bassPattern = [110, 110, 130.81, 110, 146.83, 146.83, 130.81, 110];
    // Hi-hat pattern (1 = hit, 0 = rest)
    const hihatPattern = [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1];

    this.raceInterval = setInterval(() => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Bass synth
      if (step % 2 === 0) {
        const bassNote = bassPattern[Math.floor(step / 2) % bassPattern.length];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.value = bassNote;
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + beatLen * 1.8);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + beatLen * 2);
      }

      // Hi-hat (noise burst)
      if (hihatPattern[step % hihatPattern.length]) {
        const bufferSize = this.ctx.sampleRate * 0.04;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const hiGain = this.ctx.createGain();
        const hiFilter = this.ctx.createBiquadFilter();
        hiFilter.type = "highpass";
        hiFilter.frequency.value = 8000;
        hiGain.gain.setValueAtTime(0.06, now);
        hiGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        noise.connect(hiFilter);
        hiFilter.connect(hiGain);
        hiGain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 0.05);
      }

      // Kick drum on beats 0, 4, 8, 12
      if (step % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = "sine";
        kickOsc.frequency.setValueAtTime(150, now);
        kickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
        kickGain.gain.setValueAtTime(0.2, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        kickOsc.connect(kickGain);
        kickGain.connect(this.ctx.destination);
        kickOsc.start(now);
        kickOsc.stop(now + 0.15);
      }

      step++;
    }, (beatLen / 2) * 1000); // 16th notes
  },

  stopRaceMusic() {
    if (this.raceInterval) { clearInterval(this.raceInterval); this.raceInterval = null; }
  },

  // Victory fanfare — triumphant ascending notes
  victoryFanfare() {
    this.init();
    this.stopRaceMusic();
    const notes = [
      { f: 523, t: 0, d: 0.15 },    // C5
      { f: 659, t: 0.12, d: 0.15 },  // E5
      { f: 784, t: 0.24, d: 0.15 },  // G5
      { f: 1047, t: 0.4, d: 0.4 },   // C6 (long)
      { f: 784, t: 0.7, d: 0.12 },   // G5
      { f: 1047, t: 0.82, d: 0.5 },  // C6 (long)
      { f: 1318, t: 1.1, d: 0.6 },   // E6 (longest)
    ];
    notes.forEach(({ f, t, d }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + t);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + t + d * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + t + d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + t);
      osc.stop(this.ctx.currentTime + t + d + 0.05);
    });
    // Add a warm chord underneath
    [523, 659, 784].forEach((f) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = f / 2;
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + 0.4);
      osc.stop(this.ctx.currentTime + 2.1);
    });
  },
};

export default function AIGrandPrix() {
  const [raceState, setRaceState] = useState("idle");
  const [models, setModels] = useState(AI_MODELS);
  const [questions, setQuestions] = useState(RACE_QUESTIONS);
  const [raceData, setRaceData] = useState({});
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState(null); // null | "config" | "questions" | "inspector"
  const [inspectorModel, setInspectorModel] = useState(null);
  const [animFrame, setAnimFrame] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [traceVersion, setTraceVersion] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  // Conversation histories per model — full session context within each question
  const conversationHistories = useRef({});
  // Detailed request/response traces per model
  const traceData = useRef({});
  const raceRef = useRef(null);
  const abortRef = useRef(null);
  const inspectorEndRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    let raf;
    const tick = () => { setAnimFrame((p) => p + 1); raf = requestAnimationFrame(tick); };
    if (raceState === "racing") raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [raceState]);

  useEffect(() => {
    if (activeTab === "inspector" && inspectorEndRef.current) {
      inspectorEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTab, traceVersion]);

  const addLog = useCallback((modelId, msg, type = "info") => {
    setLogs((prev) => [{ id: Date.now() + Math.random(), modelId, msg, type, time: new Date() }, ...prev.slice(0, 200)]);
  }, []);

  const addTrace = useCallback((modelId, entry) => {
    if (!traceData.current[modelId]) traceData.current[modelId] = [];
    traceData.current[modelId].push({ ...entry, timestamp: new Date(), id: Date.now() + Math.random() });
    setTraceVersion((v) => v + 1);
  }, []);

  const normalizeAnswer = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

  // ─── Build conversation messages with full session history ───
  const buildMessages = (model, question, feedback, history) => {
    let userContent = `Problem: ${question.problem}\n\nProvide your answer.`;
    if (feedback) {
      userContent += `\n\nYour previous answer was wrong. Feedback: ${feedback}\nTry again with a different answer.`;
    }
    if (model.provider === "anthropic") {
      return { system: question.systemPrompt, messages: [...history, { role: "user", content: userContent }], rawUser: userContent };
    } else if (model.provider === "google") {
      return { systemInstruction: question.systemPrompt, contents: [...history, { role: "user", parts: [{ text: userContent }] }], rawUser: userContent };
    } else {
      return { messages: [{ role: "system", content: question.systemPrompt }, ...history, { role: "user", content: userContent }], rawUser: userContent };
    }
  };

  // ─── Call AI with full session tracking ───
  const callAI = async (model, question, feedback, signal) => {
    const startTime = Date.now();
    const history = conversationHistories.current[model.id] || [];
    const built = buildMessages(model, question, feedback, history);

    try {
      let body, headers, url, requestPayload;

      if (model.provider === "anthropic") {
        url = model.apiUrl;
        headers = { "Content-Type": "application/json", "x-api-key": model.apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" };
        requestPayload = { model: model.model, max_tokens: 200, system: built.system, messages: built.messages, thinking: { type: "disabled" } };
        body = JSON.stringify(requestPayload);
      } else if (model.provider === "openai") {
        url = model.apiUrl;
        headers = { "Content-Type": "application/json", Authorization: `Bearer ${model.apiKey}` };
        if (question.webSearch) {
          // Use dedicated search model — only these accept web_search_options
          requestPayload = { model: "gpt-4o-search-preview", messages: built.messages, web_search_options: { search_context_size: "medium" } };
        } else {
          requestPayload = { model: model.model, max_completion_tokens: 200, messages: built.messages };
        }
        body = JSON.stringify(requestPayload);
      } else if (model.provider === "google") {
        url = `${model.apiUrl}/models/${model.model}:generateContent?key=${model.apiKey}`;
        headers = { "Content-Type": "application/json" };
        requestPayload = { systemInstruction: { parts: [{ text: built.systemInstruction }] }, contents: built.contents, generationConfig: { maxOutputTokens: 200 } };
        body = JSON.stringify(requestPayload);
      } else if (model.provider === "mistral") {
        url = model.apiUrl;
        headers = { "Content-Type": "application/json", Authorization: `Bearer ${model.apiKey}` };
        requestPayload = { model: model.model, max_tokens: 200, messages: built.messages };
        body = JSON.stringify(requestPayload);
      }

      const contextMsgCount = (built.messages || built.contents || []).length;
      addTrace(model.id, { type: "request", question: question.problem, feedback: feedback || null, contextMessages: contextMsgCount, payload: requestPayload, url: url.replace(model.apiKey, "***") });

      const res = await fetch(url, { method: "POST", headers, body, signal });
      const data = await res.json();
      const elapsed = Date.now() - startTime;
      let answer = "", tokens = 0, inputTokens = 0, outputTokens = 0;

      if (model.provider === "anthropic") {
        answer = data.content?.[0]?.text || "";
        inputTokens = data.usage?.input_tokens || 0;
        outputTokens = data.usage?.output_tokens || 0;
        tokens = inputTokens + outputTokens;
        conversationHistories.current[model.id] = [...built.messages, { role: "assistant", content: answer }];
      } else if (model.provider === "openai") {
        answer = data.choices?.[0]?.message?.content || "";
        inputTokens = data.usage?.prompt_tokens || 0;
        outputTokens = data.usage?.completion_tokens || 0;
        tokens = data.usage?.total_tokens || 0;
        conversationHistories.current[model.id] = [...built.messages.filter((m) => m.role !== "system"), { role: "assistant", content: answer }];
      } else if (model.provider === "google") {
        answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        inputTokens = data.usageMetadata?.promptTokenCount || 0;
        outputTokens = data.usageMetadata?.candidatesTokenCount || 0;
        tokens = data.usageMetadata?.totalTokenCount || 0;
        conversationHistories.current[model.id] = [...built.contents, { role: "model", parts: [{ text: answer }] }];
      } else if (model.provider === "mistral") {
        answer = data.choices?.[0]?.message?.content || "";
        inputTokens = data.usage?.prompt_tokens || 0;
        outputTokens = data.usage?.completion_tokens || 0;
        tokens = data.usage?.total_tokens || 0;
        conversationHistories.current[model.id] = [...built.messages.filter((m) => m.role !== "system"), { role: "assistant", content: answer }];
      }

      addTrace(model.id, { type: "response", answer: answer.trim(), tokens, inputTokens, outputTokens, elapsed, httpStatus: res.status, rawResponse: data });
      return { answer: answer.trim(), tokens, inputTokens, outputTokens, time: elapsed };
    } catch (err) {
      if (err.name === "AbortError") throw err;
      addTrace(model.id, { type: "error", error: err.message, elapsed: Date.now() - startTime });
      return { answer: "", tokens: 0, inputTokens: 0, outputTokens: 0, time: Date.now() - startTime, error: err.message };
    }
  };

  // ─── Race loop per model ───
  const runModelRace = async (model, signal) => {
    for (let qi = 0; qi < questions.length; qi++) {
      if (signal.aborted) return;
      const question = questions[qi];
      let attempts = 0, solved = false, feedback = "";
      conversationHistories.current[model.id] = []; // fresh session per question
      addLog(model.id, `Tackling Q${qi + 1}: "${question.problem}"`, "info");
      addTrace(model.id, { type: "question_start", questionIndex: qi, question: question.problem, expectedAnswer: question.answer });

      while (!solved && attempts < 3) {
        if (signal.aborted) return;
        attempts++;
        const result = await callAI(model, question, feedback, signal);
        if (signal.aborted) return;

        if (result.error) {
          addLog(model.id, `API Error: ${result.error}`, "error");
          feedback = `Error occurred. Try again.`;
          setRaceData((prev) => ({ ...prev, [model.id]: { ...prev[model.id], totalTokens: (prev[model.id]?.totalTokens || 0) + result.tokens, inputTokens: (prev[model.id]?.inputTokens || 0) + result.inputTokens, outputTokens: (prev[model.id]?.outputTokens || 0) + result.outputTokens, totalTime: (prev[model.id]?.totalTime || 0) + result.time, attempts: (prev[model.id]?.attempts || 0) + 1, status: "retrying" } }));
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }

        const isCorrect = normalizeAnswer(result.answer) === normalizeAnswer(question.answer);
        setRaceData((prev) => ({ ...prev, [model.id]: { ...prev[model.id], totalTokens: (prev[model.id]?.totalTokens || 0) + result.tokens, inputTokens: (prev[model.id]?.inputTokens || 0) + result.inputTokens, outputTokens: (prev[model.id]?.outputTokens || 0) + result.outputTokens, totalTime: (prev[model.id]?.totalTime || 0) + result.time, attempts: (prev[model.id]?.attempts || 0) + 1, currentQuestion: qi + (isCorrect ? 1 : 0), lastAnswer: result.answer, status: isCorrect ? "advancing" : "retrying" } }));

        if (isCorrect) {
          solved = true;
          addLog(model.id, `✅ Q${qi + 1} solved! "${result.answer}" (${result.time}ms, ${result.tokens} tkn)`, "success");
          addTrace(model.id, { type: "question_solved", questionIndex: qi, attempts, answer: result.answer });
        } else {
          addLog(model.id, `❌ Q${qi + 1} attempt ${attempts}: "${result.answer}" — wrong`, "warn");
          feedback = `Your answer "${result.answer}" is incorrect. The correct answer should relate to: ${question.problem}. Think carefully and try again.`;
          await new Promise((r) => setTimeout(r, 300));
        }
      }
      if (!solved) {
        addLog(model.id, `⚠️ Q${qi + 1} — gave up after ${attempts} attempts`, "error");
        addTrace(model.id, { type: "question_failed", questionIndex: qi, attempts });
        setRaceData((prev) => ({ ...prev, [model.id]: { ...prev[model.id], currentQuestion: qi + 1, status: "skipped" } }));
        conversationHistories.current[model.id] = [];
      }
    }
    setRaceData((prev) => ({ ...prev, [model.id]: { ...prev[model.id], status: "finished", finishTime: Date.now() } }));
    addLog(model.id, `🏁 FINISHED THE RACE!`, "success");
  };

  const startRace = () => {
    const active = models.filter((m) => m.apiKey);
    if (!active.length) { alert("Add at least one API key in the config panel."); setActiveTab("config"); return; }
    if (!questions.length) { alert("Add at least one question."); setActiveTab("questions"); return; }
    setCountdown(3);
    if (soundEnabled) SoundEngine.countdownBeep(3);
    const initial = {};
    active.forEach((m) => { initial[m.id] = { currentQuestion: 0, totalTokens: 0, inputTokens: 0, outputTokens: 0, totalTime: 0, attempts: 0, lastAnswer: "", status: "waiting", finishTime: null }; });
    setRaceData(initial); setLogs([]); conversationHistories.current = {}; traceData.current = {};
    let c = 3;
    const interval = setInterval(() => {
      c--; setCountdown(c);
      if (c > 0 && soundEnabled) { SoundEngine.countdownBeep(c); }
      if (c <= 0) {
        clearInterval(interval); setCountdown(null); setRaceState("racing");
        if (soundEnabled) SoundEngine.goSound();
        if (soundEnabled) setTimeout(() => SoundEngine.startRaceMusic(), 400);
        const controller = new AbortController(); abortRef.current = controller; raceRef.current = Date.now();
        Promise.allSettled(active.map((m) => runModelRace(m, controller.signal))).then(() => setRaceState("finished"));
      }
    }, 1000);
  };

  // Play victory fanfare when race finishes
  useEffect(() => {
    if (raceState === "finished") {
      if (soundEnabled) SoundEngine.victoryFanfare();
    }
  }, [raceState]);

  const forceStopAll = () => {
    abortRef.current?.abort();
    SoundEngine.stopRaceMusic();
    setRaceData((prev) => {
      const u = { ...prev };
      Object.keys(u).forEach((id) => { if (u[id].status !== "finished") u[id] = { ...u[id], status: "force_stopped", finishTime: Date.now() }; });
      return u;
    });
    setRaceState("finished");
    addLog("system", "🛑 ALL MODELS FORCE STOPPED BY USER", "error");
  };

  const resetRace = () => {
    abortRef.current?.abort(); SoundEngine.stopRaceMusic(); setRaceState("idle"); setRaceData({}); setLogs([]);
    conversationHistories.current = {}; traceData.current = {};
    setActiveTab(null); setInspectorModel(null);
  };

  const activeModels = models.filter((m) => m.apiKey);
  const trackWidth = 900, trackPadding = 80, totalQ = questions.length;
  const getCarX = (modelId) => { const d = raceData[modelId]; if (!d) return trackPadding; return trackPadding + (d.currentQuestion / Math.max(totalQ, 1)) * (trackWidth - trackPadding * 2); };
  const getWinner = () => { if (raceState !== "finished") return null; let best = null; Object.entries(raceData).forEach(([id, d]) => { if (d.status === "finished" && (!best || d.finishTime < best.finishTime)) best = { id, ...d }; }); return best; };
  const winner = getWinner();

  // ─── RENDER ───
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0a0a1a 0%, #111128 40%, #0d0d20 100%)", color: "#e0e0e0", fontFamily: "'Rajdhani', sans-serif" }}>

      {/* ═══ HEADER ═══ */}
      <div style={{ background: "linear-gradient(90deg, #D9275822, #0a0a1a 30%, #0a0a1a 70%, #D9275822)", borderBottom: "1px solid #D9275833", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 28, fontWeight: 900, background: "linear-gradient(135deg, #D92758, #F4A261)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 3 }}>AI GRAND PRIX</div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 10, color: "#666", letterSpacing: 4, textTransform: "uppercase", borderLeft: "1px solid #333", paddingLeft: 16 }}>LLM Racing Championship</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <TabBtn active={activeTab === "questions"} color="#D92758" onClick={() => setActiveTab(activeTab === "questions" ? null : "questions")}>Questions ({questions.length})</TabBtn>
          <TabBtn active={activeTab === "config"} color="#F4A261" onClick={() => setActiveTab(activeTab === "config" ? null : "config")}>API Config</TabBtn>
          <TabBtn active={activeTab === "inspector"} color="#a78bfa" onClick={() => setActiveTab(activeTab === "inspector" ? null : "inspector")}>🔍 Inspector</TabBtn>
          <button
            onClick={() => { setSoundEnabled(!soundEnabled); if (soundEnabled) SoundEngine.stopRaceMusic(); }}
            style={{
              background: soundEnabled ? "#4ade8022" : "#ffffff08",
              border: `1px solid ${soundEnabled ? "#4ade8088" : "#66666655"}`,
              color: soundEnabled ? "#4ade80" : "#666",
              padding: "8px 12px", borderRadius: 6, cursor: "pointer",
              fontFamily: "'Orbitron', monospace", fontSize: 12, letterSpacing: 1, transition: "all 0.2s",
            }}
            title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
          >{soundEnabled ? "🔊" : "🔇"}</button>
        </div>
      </div>

      {/* ═══ CONFIG PANEL ═══ */}
      {activeTab === "config" && (
        <div style={{ background: "#0e0e22", borderBottom: "1px solid #F4A26133", padding: "20px 24px" }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 12, color: "#F4A261", letterSpacing: 3, marginBottom: 16, textTransform: "uppercase" }}>🔧 API Configuration</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {models.map((m, i) => (
              <div key={m.id} style={{ background: "#0a0a18", border: `1px solid ${m.color}33`, borderRadius: 8, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{m.logoEmoji}</span>
                  <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: m.color, fontWeight: 700 }}>{m.name}</span>
                  {m.apiKey && <span style={{ fontSize: 8, color: "#4ade80", marginLeft: "auto" }}>● READY</span>}
                </div>
                <input type="password" placeholder={`${m.provider} API key...`} value={m.apiKey} onChange={(e) => { const u = [...models]; u[i] = { ...m, apiKey: e.target.value }; setModels(u); }} style={{ width: "100%", background: "#06060f", border: `1px solid ${m.color}22`, borderRadius: 4, padding: "8px 10px", color: "#ccc", fontSize: 12, fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
                <input placeholder="Model ID" value={m.model} onChange={(e) => { const u = [...models]; u[i] = { ...m, model: e.target.value }; setModels(u); }} style={{ width: "100%", marginTop: 6, background: "#06060f", border: `1px solid ${m.color}15`, borderRadius: 4, padding: "6px 8px", color: "#999", fontSize: 10, fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
                {m.freeInfo && <div style={{ marginTop: 6, fontSize: 9, color: "#4ade8099", letterSpacing: 0.5 }}>✨ {m.freeInfo}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ QUESTIONS PANEL ═══ */}
      {activeTab === "questions" && (
        <div style={{ background: "#0e0e22", borderBottom: "1px solid #D9275833", padding: "20px 24px", maxHeight: 350, overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 12, color: "#D92758", letterSpacing: 3, textTransform: "uppercase" }}>🏁 Race Questions</div>
            <button onClick={() => setQuestions([...questions, { id: Date.now(), problem: "New question?", answer: "answer", systemPrompt: "Answer concisely." }])} style={{ background: "#D9275822", border: "1px solid #D92758", color: "#D92758", padding: "6px 14px", borderRadius: 4, cursor: "pointer", fontFamily: "'Orbitron', monospace", fontSize: 10, letterSpacing: 1 }}>+ ADD</button>
          </div>
          {questions.map((q, i) => (
            <div key={q.id} style={{ background: "#0a0a18", border: "1px solid #ffffff0a", borderRadius: 8, padding: 12, display: "grid", gridTemplateColumns: "30px 1fr 1fr 1fr 30px", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: "#555" }}>{i + 1}</span>
              <input value={q.problem} onChange={(e) => { const u = [...questions]; u[i] = { ...q, problem: e.target.value }; setQuestions(u); }} style={{ background: "#06060f", border: "1px solid #ffffff0a", borderRadius: 4, padding: "6px 8px", color: "#ccc", fontSize: 12, outline: "none" }} />
              <input value={q.answer} onChange={(e) => { const u = [...questions]; u[i] = { ...q, answer: e.target.value }; setQuestions(u); }} style={{ background: "#06060f", border: "1px solid #4ade8022", borderRadius: 4, padding: "6px 8px", color: "#4ade80", fontSize: 12, fontFamily: "monospace", outline: "none" }} />
              <input value={q.systemPrompt} onChange={(e) => { const u = [...questions]; u[i] = { ...q, systemPrompt: e.target.value }; setQuestions(u); }} style={{ background: "#06060f", border: "1px solid #ffffff08", borderRadius: 4, padding: "6px 8px", color: "#888", fontSize: 11, outline: "none" }} />
              <button onClick={() => setQuestions(questions.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#D92758", cursor: "pointer", fontSize: 16 }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* ═══ INSPECTOR PANEL ═══ */}
      {activeTab === "inspector" && (
        <div style={{ background: "#0e0e22", borderBottom: "1px solid #a78bfa33", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 12, color: "#a78bfa", letterSpacing: 3, textTransform: "uppercase" }}>🔍 Behind The Scenes</div>
            <div style={{ display: "flex", gap: 4, marginLeft: "auto", flexWrap: "wrap" }}>
              <button onClick={() => setInspectorModel(null)} style={{ background: !inspectorModel ? "#a78bfa33" : "#ffffff08", border: `1px solid ${!inspectorModel ? "#a78bfa" : "#a78bfa55"}`, color: "#a78bfa", padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontFamily: "'Orbitron', monospace", fontSize: 8, letterSpacing: 1 }}>ALL</button>
              {activeModels.map((m) => (
                <button key={m.id} onClick={() => setInspectorModel(m.id)} style={{ background: inspectorModel === m.id ? `${m.color}33` : "#ffffff08", border: `1px solid ${inspectorModel === m.id ? m.color : m.color + "55"}`, color: m.color, padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontFamily: "'Orbitron', monospace", fontSize: 8, letterSpacing: 1 }}>{m.logoEmoji} {m.name}</button>
              ))}
            </div>
          </div>

          <div style={{ background: "#06060f", border: "1px solid #a78bfa22", borderRadius: 10, maxHeight: 500, overflowY: "auto", fontFamily: "monospace", fontSize: 11 }}>
            {(inspectorModel ? [models.find((m) => m.id === inspectorModel)].filter(Boolean) : activeModels).map((m) => {
              const traces = traceData.current[m.id] || [];
              if (!traces.length) return (
                <div key={m.id} style={{ padding: 16, color: "#444", borderBottom: "1px solid #ffffff08" }}>
                  <span style={{ color: m.color, fontFamily: "'Orbitron', monospace", fontSize: 10 }}>{m.logoEmoji} {m.name}</span>
                  <span style={{ marginLeft: 8 }}>— Waiting for data...</span>
                </div>
              );
              return (
                <div key={m.id} style={{ borderBottom: "2px solid #ffffff0a" }}>
                  <div style={{ padding: "10px 16px", background: `${m.color}08`, borderBottom: `1px solid ${m.color}22`, position: "sticky", top: 0, zIndex: 2, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{m.logoEmoji}</span>
                    <span style={{ color: m.color, fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700 }}>{m.name}</span>
                    <span style={{ color: "#555", fontSize: 9 }}>({m.model})</span>
                    <span style={{ marginLeft: "auto", color: "#555", fontSize: 9 }}>{traces.length} events</span>
                  </div>
                  {traces.map((t) => {
                    if (t.type === "question_start") return (
                      <div key={t.id} style={{ padding: "10px 16px", background: "#0d0d28", borderBottom: "1px solid #ffffff08" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ color: "#a78bfa", fontSize: 10, fontFamily: "'Orbitron', monospace", letterSpacing: 2 }}>📋 QUESTION {t.questionIndex + 1}</span>
                          <span style={{ color: "#555", fontSize: 9 }}>{t.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <div style={{ color: "#ddd", marginTop: 4, fontSize: 13 }}>{t.question}</div>
                        <div style={{ color: "#4ade8066", marginTop: 2, fontSize: 10 }}>Expected answer: "{t.expectedAnswer}"</div>
                      </div>
                    );
                    if (t.type === "request") return (
                      <div key={t.id} style={{ padding: "8px 16px 8px 32px", borderBottom: "1px solid #ffffff04" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ color: "#60a5fa", fontSize: 9, fontWeight: 700 }}>▶ REQUEST</span>
                          <span style={{ color: "#444", fontSize: 9 }}>{t.timestamp.toLocaleTimeString()}</span>
                          <span style={{ color: "#444", fontSize: 9 }}>• {t.contextMessages} msgs in session</span>
                        </div>
                        {t.feedback && <div style={{ color: "#F59E0B", fontSize: 10, marginTop: 3, paddingLeft: 8, borderLeft: "2px solid #F59E0B33" }}>Retry feedback: "{t.feedback}"</div>}
                        <details style={{ marginTop: 4 }}>
                          <summary style={{ color: "#555", fontSize: 9, cursor: "pointer", userSelect: "none" }}>📦 View full API payload →</summary>
                          <pre style={{ background: "#04040c", padding: 8, borderRadius: 4, marginTop: 4, fontSize: 9, color: "#888", overflow: "auto", maxHeight: 250, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{JSON.stringify(t.payload, null, 2)}</pre>
                        </details>
                      </div>
                    );
                    if (t.type === "response") return (
                      <div key={t.id} style={{ padding: "8px 16px 8px 32px", borderBottom: "1px solid #ffffff04" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ color: "#4ade80", fontSize: 9, fontWeight: 700 }}>◀ RESPONSE</span>
                          <span style={{ color: "#888", fontSize: 9 }}>{t.elapsed}ms</span>
                          <span style={{ color: "#555", fontSize: 9 }}>HTTP {t.httpStatus}</span>
                          <span style={{ color: "#60a5fa", fontSize: 9 }}>{t.inputTokens} in + {t.outputTokens} out = {t.tokens} tkn</span>
                        </div>
                        <div style={{ marginTop: 4, padding: "6px 10px", background: "#0a0a18", borderRadius: 4, color: "#e0e0e0", fontSize: 13, borderLeft: `3px solid ${m.color}` }}>"{t.answer}"</div>
                        <details style={{ marginTop: 4 }}>
                          <summary style={{ color: "#555", fontSize: 9, cursor: "pointer", userSelect: "none" }}>📥 View raw API response →</summary>
                          <pre style={{ background: "#04040c", padding: 8, borderRadius: 4, marginTop: 4, fontSize: 9, color: "#888", overflow: "auto", maxHeight: 250, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{JSON.stringify(t.rawResponse, null, 2)}</pre>
                        </details>
                      </div>
                    );
                    if (t.type === "error") return (
                      <div key={t.id} style={{ padding: "6px 16px 6px 32px", borderBottom: "1px solid #ffffff04" }}>
                        <span style={{ color: "#EF4444", fontSize: 10 }}>⚠ ERROR ({t.elapsed}ms): {t.error}</span>
                      </div>
                    );
                    if (t.type === "question_solved") return (
                      <div key={t.id} style={{ padding: "8px 16px 8px 32px", borderBottom: "1px solid #ffffff04" }}>
                        <span style={{ color: "#4ade80", fontSize: 11 }}>✅ Solved in {t.attempts} attempt{t.attempts > 1 ? "s" : ""}: "{t.answer}"</span>
                      </div>
                    );
                    if (t.type === "question_failed") return (
                      <div key={t.id} style={{ padding: "8px 16px 8px 32px", borderBottom: "1px solid #ffffff04" }}>
                        <span style={{ color: "#EF4444", fontSize: 11 }}>❌ Failed after {t.attempts} attempts</span>
                      </div>
                    );
                    return null;
                  })}
                </div>
              );
            })}
            <div ref={inspectorEndRef} />
          </div>
        </div>
      )}

      {/* ═══ COUNTDOWN ═══ */}
      {countdown !== null && countdown > 0 && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a1acc", zIndex: 100 }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 160, fontWeight: 900, color: countdown === 1 ? "#4ade80" : countdown === 2 ? "#F4A261" : "#D92758", textShadow: `0 0 80px ${countdown === 1 ? "#4ade80" : countdown === 2 ? "#F4A261" : "#D92758"}66`, animation: "pulse 0.5s ease-out" }}>{countdown}</div>
        </div>
      )}

      {/* ═══ RACE TRACK ═══ */}
      <div style={{ padding: "16px 24px" }}>
        <svg viewBox={`0 0 ${trackWidth} ${180 + Math.max(activeModels.length, models.length) * 120}`} style={{ width: "100%", background: "linear-gradient(180deg, #0d0d20, #111128)", borderRadius: 12, border: "1px solid #ffffff0a" }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff06" strokeWidth="0.5" /></pattern>
            <linearGradient id="trackGlow" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#D92758" stopOpacity="0.1" /><stop offset="50%" stopColor="#F4A261" stopOpacity="0.05" /><stop offset="100%" stopColor="#4ade80" stopOpacity="0.2" /></linearGradient>
            <linearGradient id="geminiGrad" x1="0" y1="0" x2="16" y2="16" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#4285F4" /><stop offset="50%" stopColor="#9B72CB" /><stop offset="100%" stopColor="#D96570" /></linearGradient>
          </defs>
          <rect width={trackWidth} height="100%" fill="url(#grid)" />
          <rect x={trackPadding} y="120" width={trackWidth - trackPadding * 2} height={Math.max(activeModels.length, models.length) * 120 + 40} fill="url(#trackGlow)" rx="8" />
          {questions.map((_, qi) => { const x = trackPadding + ((qi + 1) / totalQ) * (trackWidth - trackPadding * 2); return (<g key={qi}><line x1={x} y1="130" x2={x} y2={130 + Math.max(activeModels.length, models.length) * 120 + 20} stroke="#ffffff0a" strokeWidth="1" strokeDasharray="4,4" /><text x={x} y="118" textAnchor="middle" fill="#555" fontSize="9" fontFamily="'Orbitron', monospace">Q{qi + 1}</text></g>); })}
          <CheckeredFlag x={trackWidth - trackPadding} y={135} />
          <line x1={trackWidth - trackPadding} y1="130" x2={trackWidth - trackPadding} y2={130 + Math.max(activeModels.length, models.length) * 120 + 20} stroke="#ffffff15" strokeWidth="2" strokeDasharray="6,6" />
          <text x={trackPadding} y="118" textAnchor="middle" fill="#D92758" fontSize="10" fontFamily="'Orbitron', monospace" letterSpacing="2">START</text>
          <text x={trackWidth - trackPadding} y="118" textAnchor="middle" fill="#4ade80" fontSize="10" fontFamily="'Orbitron', monospace" letterSpacing="2">FINISH</text>
          {(activeModels.length > 0 ? activeModels : models).map((m, i) => (<g key={m.id}><line x1={trackPadding} y1={152 + i * 120} x2={trackWidth - trackPadding} y2={152 + i * 120} stroke={m.color} strokeWidth="2" strokeDasharray="8,4" opacity={0.3} /><F1Car color={m.color} accentColor={m.accentColor} emoji={m.logoEmoji} provider={m.provider} x={getCarX(m.id)} lane={i} isMoving={raceData[m.id]?.status === "retrying" || raceData[m.id]?.status === "advancing"} name={m.name} /></g>))}
          {winner && (<g><rect x={trackWidth / 2 - 120} y="30" width="240" height="50" rx="8" fill="#0a0a1aee" stroke="#FFD700" strokeWidth="2" /><text x={trackWidth / 2} y="55" textAnchor="middle" fill="#FFD700" fontSize="14" fontFamily="'Orbitron', monospace" fontWeight="900" letterSpacing="2">🏆 {models.find((m) => m.id === winner.id)?.name} WINS! 🏆</text><text x={trackWidth / 2} y="72" textAnchor="middle" fill="#FFD70099" fontSize="9" fontFamily="'Orbitron', monospace" letterSpacing="1">{(winner.totalTime / 1000).toFixed(1)}s • {winner.totalTokens} tokens • {winner.attempts} attempts</text></g>)}
        </svg>
      </div>

      {/* ═══ CONTROLS ═══ */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, padding: "0 24px 16px", flexWrap: "wrap" }}>
        {raceState === "idle" && (
          <button onClick={startRace} style={{ background: "linear-gradient(135deg, #D92758, #F4A261)", border: "none", color: "white", padding: "14px 48px", borderRadius: 8, cursor: "pointer", fontFamily: "'Orbitron', monospace", fontSize: 16, fontWeight: 900, letterSpacing: 4, textTransform: "uppercase", boxShadow: "0 4px 30px #D9275844" }}>🏁 START RACE</button>
        )}
        {raceState === "racing" && (
          <button onClick={forceStopAll} style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)", border: "none", color: "white", padding: "14px 40px", borderRadius: 8, cursor: "pointer", fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 900, letterSpacing: 3, boxShadow: "0 4px 30px #EF444466", animation: "glow 1.5s ease-in-out infinite" }}>🛑 FORCE STOP ALL</button>
        )}
        {raceState === "finished" && (
          <button onClick={resetRace} style={{ background: "linear-gradient(135deg, #4285F4, #60A5FA)", border: "none", color: "white", padding: "14px 48px", borderRadius: 8, cursor: "pointer", fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700, letterSpacing: 3 }}>🔄 NEW RACE</button>
        )}
      </div>

      {/* ═══ TELEMETRY DASHBOARD ═══ */}
      {Object.keys(raceData).length > 0 && (
        <div style={{ padding: "0 24px 16px" }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 10, color: "#555", letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>Telemetry Dashboard</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {activeModels.map((m) => {
              const d = raceData[m.id]; if (!d) return null;
              const progress = Math.round((d.currentQuestion / totalQ) * 100);
              const sColor = d.status === "finished" ? "#4ade80" : d.status === "force_stopped" ? "#EF4444" : d.status === "advancing" ? m.accentColor : d.status === "retrying" ? "#F59E0B" : "#666";
              const sText = d.status === "finished" ? "🏁 Finished" : d.status === "force_stopped" ? "🛑 Stopped" : d.status === "retrying" ? "🔄 Thinking..." : d.status === "advancing" ? "⚡ Advancing" : d.status;
              return (
                <div key={m.id} onClick={() => { setActiveTab("inspector"); setInspectorModel(m.id); }} title="Click to inspect" style={{ background: "#0a0a18", border: `1px solid ${m.color}33`, borderRadius: 10, padding: 16, position: "relative", overflow: "hidden", cursor: "pointer", transition: "border-color 0.2s" }}>
                  <div style={{ position: "absolute", bottom: 0, left: 0, width: `${progress}%`, height: 3, background: `linear-gradient(90deg, ${m.color}, ${m.accentColor})`, transition: "width 0.5s ease" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>{m.logoEmoji}</span>
                    <div>
                      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 12, color: m.color, fontWeight: 700 }}>{m.name}</div>
                      <div style={{ fontSize: 9, fontFamily: "'Orbitron', monospace", color: sColor, textTransform: "uppercase", letterSpacing: 2 }}>{sText}</div>
                    </div>
                    <div style={{ marginLeft: "auto", fontFamily: "'Orbitron', monospace", fontSize: 22, fontWeight: 900, color: m.color }}>{progress}%</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4 }}>
                    <Speedometer label="Total" value={d.totalTokens} unit="tkn" color={m.accentColor} />
                    <Speedometer label="Input" value={d.inputTokens} unit="in" color="#60a5fa" />
                    <Speedometer label="Output" value={d.outputTokens} unit="out" color="#4ade80" />
                    <Speedometer label="Time" value={(d.totalTime / 1000).toFixed(1)} unit="sec" color={m.color} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 6 }}>
                    <Speedometer label="Attempts" value={d.attempts} unit="att" color="#888" />
                    <Speedometer label="Progress" value={`${d.currentQuestion}/${totalQ}`} unit="q" color={m.color} />
                  </div>
                  {d.lastAnswer && <div style={{ marginTop: 8, padding: "5px 8px", background: "#06060f", borderRadius: 4, fontSize: 11, color: "#777", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Last: "{d.lastAnswer}"</div>}
                  <div style={{ marginTop: 6, textAlign: "center", fontSize: 7, color: "#444", fontFamily: "'Orbitron', monospace", letterSpacing: 2 }}>CLICK TO INSPECT →</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ RACE LOG ═══ */}
      {logs.length > 0 && (
        <div style={{ padding: "0 24px 24px" }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 10, color: "#555", letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>Race Log</div>
          <div style={{ background: "#06060f", border: "1px solid #ffffff0a", borderRadius: 10, padding: 16, maxHeight: 300, overflowY: "auto", fontFamily: "monospace", fontSize: 11 }}>
            {logs.map((log) => {
              const model = models.find((m) => m.id === log.modelId);
              return (
                <div key={log.id} style={{ padding: "4px 0", borderBottom: "1px solid #ffffff06", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: "#444", minWidth: 70, fontSize: 10 }}>{log.time.toLocaleTimeString()}</span>
                  <span style={{ color: model?.color || (log.modelId === "system" ? "#EF4444" : "#888"), fontWeight: 700, minWidth: 85, fontSize: 10, fontFamily: "'Orbitron', monospace" }}>{log.modelId === "system" ? "SYSTEM" : model?.name || log.modelId}</span>
                  <span style={{ color: log.type === "success" ? "#4ade80" : log.type === "error" ? "#EF4444" : log.type === "warn" ? "#F59E0B" : "#888" }}>{log.msg}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0% { transform: scale(1.3); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 4px 30px #EF444466; } 50% { box-shadow: 0 4px 50px #EF4444aa, 0 0 20px #EF444444; } }
        input::placeholder { color: #444; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a1a; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
      `}</style>
    </div>
  );
}