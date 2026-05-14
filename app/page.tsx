"use client"

import { useState, useEffect } from "react";
import { Copy, HeartPulse, Send, Smartphone, TrendingDown, Wheat, Users, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types
type Gender = "H" | "M";
type ActivityLevel = 1.2 | 1.375 | 1.55 | 1.725 | 1.9;
type Goal = -500 | 0 | 300;
type DietType = "Normal" | "Vegetariana" | "Baja Carb";

// Consts and databases
const ACTIVIDADES = [
  { label: "Sedentario (Poco o ningún ejercicio)", value: 1.2 },
  { label: "Ligero (Ejercicio ligero 1-3 días/semana)", value: 1.375 },
  { label: "Moderado (Ejercicio moderado 3-5 días/semana)", value: 1.55 },
  { label: "Activo (Ejercicio fuerte 6-7 días/semana)", value: 1.725 },
  { label: "Muy Activo (Doble turno de entrenamiento)", value: 1.9 },
];

const OBJETIVOS = [
  { label: "Perder Peso (-500 kcal)", value: -500 },
  { label: "Mantener Peso", value: 0 },
  { label: "Ganar Masa Muscular (+300 kcal)", value: 300 },
];

const COMIDAS: Record<DietType, string[]> = {
  "Normal": [
    "Avena con frutas y nueces",
    "Pechuga de pollo con arroz y brócoli",
    "Salmón al horno con ensalada mixta",
    "Huevos revueltos con tostadas",
    "Ensalada de atún con garbanzos",
    "Pavo a la plancha con espárragos",
    "Yogur griego con miel y almendras"
  ],
  "Vegetariana": [
    "Smoothie de espinaca y plátano",
    "Bowl de quinoa, tofu y verduras",
    "Lentejas guisadas con arroz",
    "Tostada de aguacate con tomate",
    "Wrap de hummus y vegetales",
    "Berenjenas rellenas de soja tex",
    "Pancakes de avena y manzana"
  ],
  "Baja Carb": [
    "Tortilla de 3 huevos con espinaca",
    "Pollo asado, aguacate y ensalada",
    "Salmón con costra de almendras",
    "Rollitos de pavo y queso",
    "Ensalada César con pollo (sin pan)",
    "Ternera con champiñones al ajillo",
    "Aguacate relleno de atún"
  ]
};

const EJERCICIOS = [
  "Caminata rápida",
  "Trote ligero",
  "Entrenamiento de fuerza",
  "Yoga flex",
  "HIIT 15 min",
  "Pilates básico",
  "Estiramientos activos"
];

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    gender: "H" as Gender,
    age: "",
    weight: "",
    height: "",
    activity: 1.2 as ActivityLevel,
    goal: -500 as Goal,
    diet: "Normal" as DietType,
    phone: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [waLink, setWaLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Recover from localStorage if exists
    const saved = localStorage.getItem("planSaludData");
    if (saved) {
      try {
        setFormData(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {
        console.error("Error loading saved data");
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["activity", "goal"].includes(name) ? Number(value) : value,
    }));
  };

  const handleGenderSelect = (g: Gender) => {
    setFormData(prev => ({ ...prev, gender: g }));
  };

  const generatePlanText = () => {
    const { age, weight, height, gender, activity, goal, diet, phone } = formData;
    
    // Validate required numbers
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    if (!w || !h || !a || !phone) {
      alert("Por favor, completa todos los campos requeridos (Edad, Peso, Altura y WhatsApp).");
      return;
    }

    // Save to local storage
    localStorage.setItem("planSaludData", JSON.stringify(formData));

    // 1. BMI Calculation (web:66 mapping from prompt)
    const h_m = h / 100;
    const bmi = w / (h_m * h_m);
    
    let categoria = "";
    if (bmi < 18.5) categoria = "Bajo peso";
    else if (bmi < 24.9) categoria = "Normal";
    else if (bmi < 29.9) categoria = "Sobrepeso";
    else categoria = "Obesidad";

    // 2. Ideal Weight Estimation (approx BMI = 22)
    const peso_ideal = Math.round(22 * (h_m * h_m));

    // 3. BMR Harris-Benedict (web:68 mapping)
    let bmr = 0;
    if (gender === "H") {
      bmr = 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
    } else {
      bmr = 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
    }

    // 4. TDEE and Target Calories (web:71 mapping)
    const tdee = bmr * activity;
    const calorias = Math.max(1200, Math.round(tdee + goal)); // Minimum 1200 threshold for safety

    // 5. Generate 7 day plan
    let planDiario = "";
    const comidasList = COMIDAS[diet];
    
    for (let i = 0; i < 7; i++) {
        const comida = comidasList[i % comidasList.length];
        const ejercicio = EJERCICIOS[i % EJERCICIOS.length];
        planDiario += `Día ${i + 1}: ${comida} + ${ejercicio} (10-20min)\n`;
    }

    // 6. Build the message Template exactly as requested
    const message = `¡Tu Plan de Salud Personalizado! 👇

📊 BMI: ${bmi.toFixed(1)} (${categoria})
🎯 Peso ideal: ${peso_ideal}kg
🔥 Calorías/día: ${calorias} kcal

📅 PLAN 7 DÍAS:
${planDiario.trim()}

💧 Bebe 2-3L agua | 🛌 Duerme 7-8h
🛒 Suplemento recomendado: amzn.to/proteina-vip

⚠️ Consulta médico antes. #PlanSaludGratis`;

    setGeneratedMessage(message);

    // Filter non-numerical characters from phone except '+'
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const url = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(message)}`;
    setWaLink(url);
    setIsModalOpen(true);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f8] bg-[radial-gradient(at_0%_0%,_rgba(76,175,80,0.1)_0,_transparent_50%),radial-gradient(at_50%_0%,_rgba(37,211,102,0.05)_0,_transparent_50%)]">
      {/* Header */}
      <header className="w-full h-[80px] flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-8 h-8 text-[#2e7d32]" strokeWidth={2.5} />
            <h1 className="font-heading font-extrabold text-2xl text-[#2e7d32] flex items-center gap-2 tracking-tight">
              PlanSaludGratis.com
            </h1>
          </div>
          <div className="hidden sm:flex gap-5 text-[14px] text-[#666]">
            <span className="font-bold text-[#4CAF50]">Calculadora BMI</span>
            <span>Rutinas</span>
            <span>Nutrición</span>
          </div>
        </div>
      </header>

      {/* Top Ad Banner Simulation */}
      <div className="w-full py-4 flex items-center justify-center text-[11px] text-[#999] uppercase tracking-[2px]">
        <div className="w-full max-w-[728px] h-[90px] bg-black/5 rounded-xl flex items-center justify-center border border-dashed border-[#ccc]">
          Espacio publicitario disponible - 728 x 90
        </div>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Main Form Area */}
        <div className="w-full lg:w-2/3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-md rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/40 overflow-hidden flex flex-col"
          >
            {/* Hero text */}
            <div className="px-6 sm:px-10 pt-8 pb-4 text-center border-b border-white/40">
              <h2 className="text-3xl font-heading font-bold mb-2 text-[#2e7d32]">Genera tu plan de salud personalizado</h2>
              <p className="text-[#666] text-lg">Descubre cuántas calorías necesitas, tu peso ideal y una rutina de 7 días directa a tu WhatsApp.</p>
            </div>

            <div className="p-6 sm:p-10 space-y-6">
              
              {/* Gender */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-[12px] font-semibold text-[#666] uppercase tracking-[0.5px]">Sexo</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleGenderSelect("H")}
                    className={`flex-1 py-[10px] px-[14px] border rounded-xl flex items-center justify-center text-[14px] transition-all duration-200 ${
                      formData.gender === "H" 
                        ? "border-[#4CAF50] bg-[#4CAF50]/10 text-[#4CAF50] font-bold" 
                        : "border-[#ddd] bg-white text-[#666] hover:border-[#4CAF50]"
                    }`}
                  >
                    Hombre
                  </button>
                  <button
                    onClick={() => handleGenderSelect("M")}
                    className={`flex-1 py-[10px] px-[14px] border rounded-xl flex items-center justify-center text-[14px] transition-all duration-200 ${
                      formData.gender === "M" 
                        ? "border-[#4CAF50] bg-[#4CAF50]/10 text-[#4CAF50] font-bold" 
                        : "border-[#ddd] bg-white text-[#666] hover:border-[#4CAF50]"
                    }`}
                  >
                    Mujer
                  </button>
                </div>
              </div>

              {/* Bio Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="age" className="block text-[12px] font-semibold text-[#666] uppercase tracking-[0.5px]">Edad</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    min="18"
                    max="80"
                    placeholder="Ej: 30"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-[14px] py-[10px] bg-white border border-[#ddd] rounded-xl focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50] outline-none text-[14px] transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="weight" className="block text-[12px] font-semibold text-[#666] uppercase tracking-[0.5px]">Peso (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    step="0.1"
                    placeholder="Ej: 75.5"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full px-[14px] py-[10px] bg-white border border-[#ddd] rounded-xl focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50] outline-none text-[14px] transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="height" className="block text-[12px] font-semibold text-[#666] uppercase tracking-[0.5px]">Altura (cm)</label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    placeholder="Ej: 175"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full px-[14px] py-[10px] bg-white border border-[#ddd] rounded-xl focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50] outline-none text-[14px] transition-all"
                  />
                </div>
              </div>

              {/* Selects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="activity" className="block text-[12px] font-semibold text-[#666] uppercase tracking-[0.5px]">Actividad Física</label>
                  <div className="relative">
                    <TrendingDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    <select
                      id="activity"
                      name="activity"
                      value={formData.activity}
                      onChange={handleChange}
                      className="w-full pl-10 pr-[14px] py-[10px] bg-white border border-[#ddd] rounded-xl appearance-none focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50] outline-none text-[14px] transition-all"
                    >
                      {ACTIVIDADES.map((act) => (
                        <option key={act.value} value={act.value}>{act.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="goal" className="block text-[12px] font-semibold text-[#666] uppercase tracking-[0.5px]">Objetivo</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    <select
                      id="goal"
                      name="goal"
                      value={formData.goal}
                      onChange={handleChange}
                      className="w-full pl-10 pr-[14px] py-[10px] bg-white border border-[#ddd] rounded-xl appearance-none focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50] outline-none text-[14px] transition-all"
                    >
                      {OBJETIVOS.map((obj) => (
                        <option key={obj.value} value={obj.value}>{obj.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label htmlFor="diet" className="block text-[12px] font-semibold text-[#666] uppercase tracking-[0.5px]">Preferencia de Dieta</label>
                  <div className="relative">
                    <Wheat className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    <select
                      id="diet"
                      name="diet"
                      value={formData.diet}
                      onChange={handleChange}
                      className="w-full pl-10 pr-[14px] py-[10px] bg-white border border-[#ddd] rounded-xl appearance-none focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50] outline-none text-[14px] transition-all"
                    >
                      <option value="Normal">Normal (Equilibrada, Omnívora)</option>
                      <option value="Vegetariana">Vegetariana (Basada en plantas & lácteos)</option>
                      <option value="Baja Carb">Baja en Carbohidratos (Alta en proteínas/grasas)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Delivery section */}
              <div className="pt-6 mt-4 border-t border-white/40">
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="block text-[12px] font-semibold text-[#666] uppercase tracking-[0.5px] text-center sm:text-left">
                    Recibe tu plan en WhatsApp
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 h-[52px]">
                  <div className="relative flex-1 h-full">
                    <Smartphone className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#25D366] w-5 h-5 pointer-events-none" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Tu WhatsApp (ej: +34 600...)"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full h-full pl-10 pr-[14px] py-[10px] bg-white border border-[#ddd] rounded-xl focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50] outline-none text-[14px] transition-all"
                    />
                  </div>
                  <button
                    onClick={generatePlanText}
                    className="h-full px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-[16px] text-[16px] flex items-center justify-center gap-[10px] transition-all shadow-[0_4px_15px_rgba(37,211,102,0.3)] whitespace-nowrap active:scale-[0.98]"
                  >
                    <Send className="w-5 h-5" />
                    ¡Enviar Mi Plan GRATIS!
                  </button>
                </div>
                <p className="text-xs text-[#999] mt-4 text-center sm:text-left">
                  Tus datos se calculan localmente y no los compartimos con terceros.
                </p>
              </div>

            </div>
          </motion.div>
        </div>

        {/* Sidebar / Sidebar Ads */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-white/70 backdrop-blur-md rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/40 p-6 flex flex-col gap-4">
            <h3 className="font-heading font-bold text-xl text-[#2e7d32]">¿Por qué WhatsApp?</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100/50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                </div>
                <p className="text-[14px] text-[#666] leading-snug"><strong className="text-gray-900 block mb-0.5">Rápido y Viral</strong> Lo tienes a la mano para revisarlo al ir al gimnasio o supermercado.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100/50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                </div>
                <p className="text-[14px] text-[#666] leading-snug"><strong className="text-gray-900 block mb-0.5">Fácil de compartir</strong> Reenvíalo a tu familia o pareja para hacer el reto juntos.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100/50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                </div>
                <p className="text-[14px] text-[#666] leading-snug"><strong className="text-gray-900 block mb-0.5">Sin Apps extra</strong> No necesitas descargar aplicaciones pesadas.</p>
              </li>
            </ul>
          </div>

          <div className="w-full h-[600px] bg-black/5 rounded-[24px] flex flex-col items-center justify-center border border-dashed border-[#ccc] text-[#999] uppercase tracking-[2px] font-bold text-xs text-center p-4">
            Espacio publicitario disponible (300x600)
          </div>
        </div>
      </main>

      {/* Footer Area */}
      <footer className="mt-8 bg-transparent pb-8 pt-4 px-4 text-center text-[12px] text-[#999]">
        <div className="max-w-4xl mx-auto space-y-4">
          <p><strong>Aviso Médico (Disclaimer):</strong> La información calculada (BMI, BMR, TDEE) se basa en fórmulas matemáticas estándar y sugerencias genéricas. No sustituye de ninguna forma el consejo médico o nutricional profesional.</p>
          <p>© {new Date().getFullYear()} PlanSaludGratis.com - Proyecto demostrativo.</p>
        </div>
      </footer>

      {/* Modal Popup for WhatsApp Output */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-[#075e54] px-6 py-4 text-white flex items-center justify-between border-b border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ccc] rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                    <HeartPulse className="w-6 h-6 text-[#075e54]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-[15px]">PlanSaludGratis.com</h3>
                    <p className="text-[11px] opacity-80 mt-0.5">en línea</p>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto bg-[#e5ddd5]">
                <p className="text-[12px] text-center mb-4 uppercase tracking-[1px] font-bold text-black/40">Listo para enviar</p>
                
                <div className="bg-white p-[15px] rounded-[0_15px_15px_15px] mb-6 font-sans text-[13px] leading-[1.5] text-gray-800 whitespace-pre-wrap shadow-[0_2px_5px_rgba(0,0,0,0.1)] relative">
                  {generatedMessage}
                </div>

                <div className="space-y-3 mt-8">
                  <a 
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-[14px] px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-[16px] text-[15px] flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(37,211,102,0.3)] active:scale-[0.98]"
                  >
                    <Send className="w-5 h-5" />
                    Abrir WhatsApp
                  </a>
                  
                  <button
                    onClick={handleCopyToClipboard}
                    className="w-full py-[12px] px-6 bg-white hover:bg-gray-50 border border-[#ddd] text-[#666] font-semibold rounded-[12px] flex items-center justify-center gap-2 transition-all text-[14px]"
                  >
                    {copied ? (
                      <><CheckCircle2 className="w-5 h-5 text-[#4CAF50]" /> Copiado</>
                    ) : (
                      <><Copy className="w-5 h-5" /> Copiar Texto al Portapapeles</>
                    )}
                  </button>
                </div>

                {/* Premium Upsell */}
                <div className="mt-8 p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-[16px] text-center shadow-[0_4px_15px_rgba(251,191,36,0.15)]">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-amber-100 text-amber-500 rounded-full mb-3">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <p className="text-[15px] text-amber-900 font-bold mb-1">🔥 ¿Quieres resultados más rápidos?</p>
                  <p className="text-[13px] text-amber-700/80 mb-4 leading-relaxed">
                    Desbloquea el <strong>Plan de 30 días + Seguimiento 1 a 1 por WhatsApp</strong>.
                  </p>
                  <a 
                    href="#premium"
                    className="w-full py-[12px] px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-[12px] text-[14px] flex items-center justify-center transition-all shadow-md active:scale-[0.98]"
                  >
                    ¡Sí, quiero el plan Premium! ($2.99)
                  </a>
                </div>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="py-4 bg-white border-t border-[#ddd] text-[#999] text-[13px] font-bold tracking-[1px] uppercase hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
