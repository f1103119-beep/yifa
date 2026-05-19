/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Plane, 
  UtensilsCrossed, 
  Calendar, 
  Globe, 
  Sparkles, 
  Search, 
  Trash2, 
  Loader2, 
  History,
  Compass,
  ArrowRight,
  Palmtree
} from 'lucide-react';
import { TripSearch, TravelAdvice } from './types';
import { TRANSLATIONS, Language } from './constants';
import { getTravelAdvice } from './services/gemini';

const SafeImage = ({ query, alt, type }: { query: string, alt: string, type: 'place' | 'food' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const bgGradient = type === 'place' 
    ? 'from-indigo-50 to-blue-50' 
    : 'from-orange-50 to-yellow-50';
  
  const Icon = type === 'place' ? MapPin : UtensilsCrossed;
  const iconColor = type === 'place' ? 'text-indigo-200' : 'text-orange-200';

  return (
    <div className={`relative h-56 w-full overflow-hidden rounded-[32px] shadow-sm border-2 border-white bg-gradient-to-br ${bgGradient} flex items-center justify-center`}>
      {!hasError && (
        <img 
          src={`https://loremflickr.com/800/600/${encodeURIComponent(query.replace(/\s+/g, ','))}/all`} 
          alt={alt}
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          referrerPolicy="no-referrer"
        />
      )}
      
      {(isLoading || hasError) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <Icon className={`${iconColor} w-12 h-12 mb-2 opacity-50`} />
          {hasError && <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Image not found</p>}
        </div>
      )}
      
      <div className="absolute top-4 left-4 w-8 h-8 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
         <span className={`text-xs font-black ${type === 'place' ? 'text-indigo-600' : 'text-orange-600'}`}>
           {alt.startsWith('Place') || alt.startsWith('Food') ? alt.split(' ')[1] : ''}
         </span>
      </div>
    </div>
  );
};

const AdviceSection = ({ advice, city, country, duration, t, onBack }: { 
  advice: TravelAdvice, 
  city: string, 
  country: string, 
  duration: number,
  t: any,
  onBack: () => void 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="bg-white/90 backdrop-blur-md rounded-[48px] p-10 border border-white shadow-2xl shadow-yellow-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12">
          <Plane className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-500 mb-4 bg-indigo-50 inline-block px-4 py-1.5 rounded-full">
            {t.adviceFor}
          </h2>
          <h1 className="text-6xl font-black mb-3 flex items-baseline gap-3 text-gray-900 font-display tracking-tighter">
            <MapPin className="text-red-500 w-10 h-10 self-center" /> {city}<span className="text-gray-300 font-light text-4xl">/</span><span className="text-indigo-600">{country}</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-400" /> {duration} {t.daysIn} {city}
          </p>
          <div className="mt-10 text-2xl text-gray-800 font-medium leading-relaxed max-w-3xl border-l-8 border-yellow-400 pl-8 rounded-l-sm">
            "{advice.summary}"
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white/80 backdrop-blur-sm rounded-[40px] p-10 border border-white shadow-xl shadow-yellow-100/50">
          <h3 className="text-2xl font-black mb-8 flex items-center gap-4 text-gray-900 font-display">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <Compass className="text-indigo-600 w-6 h-6" />
            </div>
            {t.placesTitle}
          </h3>
          <div className="space-y-12">
            {advice.places.map((place, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group flex flex-col gap-5"
              >
                <SafeImage query={place.imageQuery} alt={`Place ${idx + 1}`} type="place" />
                <div className="space-y-2 px-1">
                  <h4 className="font-black text-2xl text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                    {place.name}
                  </h4>
                  <p className="text-gray-500 text-base leading-relaxed font-medium">
                    {place.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="bg-white/80 backdrop-blur-sm rounded-[40px] p-10 border border-white shadow-xl shadow-yellow-100/50">
          <h3 className="text-2xl font-black mb-8 flex items-center gap-4 text-gray-900 font-display">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <UtensilsCrossed className="text-orange-600 w-6 h-6" />
            </div>
            {t.foodTitle}
          </h3>
          <div className="space-y-12">
            {advice.foods.map((food, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group flex flex-col gap-5"
              >
                <SafeImage query={food.imageQuery} alt={`Food ${idx + 1}`} type="food" />
                <div className="space-y-2 px-1">
                  <h4 className="font-black text-2xl text-gray-900 group-hover:text-orange-600 transition-colors tracking-tight">
                    {food.name}
                  </h4>
                  <p className="text-gray-500 text-base leading-relaxed font-medium">
                    {food.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <div className="text-center pt-8">
        <button 
          onClick={onBack}
          className="bg-white/50 backdrop-blur-sm px-8 py-4 rounded-3xl text-gray-500 hover:text-indigo-600 hover:bg-white flex items-center gap-3 mx-auto font-black text-xs uppercase tracking-[0.2em] transition-all border border-transparent hover:border-yellow-200 active:scale-95 shadow-sm"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> {t.newSearch}
        </button>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [history, setHistory] = useState<TripSearch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);
  
  // Form State
  const [targetCity, setTargetCity] = useState('');
  const [targetCountry, setTargetCountry] = useState('');
  const [tripDuration, setTripDuration] = useState<number>(3);
  const [currentAdvice, setCurrentAdvice] = useState<TravelAdvice | null>(null);

  const t = TRANSLATIONS[lang];

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('globetrotter_history');
    const savedLang = localStorage.getItem('globetrotter_lang');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedLang) setLang(savedLang as Language);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('globetrotter_history', JSON.stringify(history));
    localStorage.setItem('globetrotter_lang', lang);
  }, [history, lang]);

  const handleSearch = async () => {
    if (!targetCity.trim() || !targetCountry.trim()) return;
    
    setIsSearching(true);
    setErrorHeader(null);
    setCurrentAdvice(null);

    try {
      const advice = await getTravelAdvice(targetCity, targetCountry, tripDuration, lang);
      setCurrentAdvice(advice);

      const newTrip: TripSearch = {
        id: crypto.randomUUID(),
        city: targetCity,
        country: targetCountry,
        duration: tripDuration,
        timestamp: new Date().toISOString(),
        advice: advice
      };

      setHistory(prev => [newTrip, ...prev].slice(0, 5));
    } catch (err: any) {
      console.error(err);
      setErrorHeader(err.message || t.error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearHistory = () => {
    if (confirm('Clear travel history?')) {
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDE7] text-[#1D1D1F] font-sans selection:bg-yellow-200 overflow-x-hidden relative">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-yellow-200 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-200 rounded-full blur-[140px] opacity-40" />
        
        {/* Animated coconut trees (Palm trees) */}
        <motion.div 
          initial={{ x: -100, opacity: 0, rotate: -15 }}
          animate={{ x: 0, opacity: 0.1, rotate: [-15, -10, -15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-10%] bottom-[-5%] text-green-900"
        >
          <Palmtree size={800} strokeWidth={0.5} />
        </motion.div>

        <motion.div 
          initial={{ x: 100, opacity: 0, rotate: 15 }}
          animate={{ x: 0, opacity: 0.08, rotate: [15, 10, 15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-10%] top-[10%] text-green-900"
        >
          <Palmtree size={600} strokeWidth={0.5} />
        </motion.div>

        {/* Animated Beach Waves Decor */}
        <div className="absolute bottom-0 left-0 w-full h-[20vh] bg-blue-400/5 blur-[40px] rounded-t-[100%]" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/40 backdrop-blur-xl border-b border-yellow-200/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-400 rounded-2xl shadow-lg shadow-yellow-200/50 rotate-3">
              <Plane className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-3xl tracking-tight leading-none text-gray-900 font-display">{t.title}</h1>
              <p className="text-[10px] uppercase font-black tracking-[0.3em] text-orange-600 mt-1">
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 border border-yellow-200 hover:border-yellow-400 transition-all text-sm font-bold active:scale-95 shadow-sm"
            >
              <Globe className="w-4 h-4 text-indigo-500" />
              {t.switchLang}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <AnimatePresence mode="wait">
          {!currentAdvice ? (
            <motion.div 
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <motion.div 
                    animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex items-center justify-center p-6 bg-white rounded-[40px] shadow-2xl mb-4 border border-yellow-100"
                  >
                    <Plane className="w-12 h-12 text-indigo-500" />
                  </motion.div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full blur-lg"
                  />
                </div>
                <h2 className="text-6xl font-black tracking-tighter text-gray-900 leading-[0.9] font-display">
                  {t.subtitle}
                </h2>
                <p className="text-gray-500 text-xl font-semibold tracking-tight">Pack your bags! Where are we going?</p>
              </div>

              {/* Search Card */}
              <div className="bg-white/90 backdrop-blur-md rounded-[48px] p-10 shadow-2xl shadow-yellow-200/50 border border-white space-y-8 relative overflow-hidden">
                {/* Decorative Sun */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-indigo-500 pl-1">{t.city}</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                      <input 
                        type="text" 
                        value={targetCity}
                        onChange={e => setTargetCity(e.target.value)}
                        placeholder={t.cityPlaceholder}
                        className="w-full bg-gray-50/50 border border-gray-100 rounded-[24px] pl-12 pr-5 py-5 focus:ring-4 focus:ring-yellow-100 focus:border-yellow-400 transition-all outline-none font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-indigo-500 pl-1">{t.country}</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                      <input 
                        type="text" 
                        value={targetCountry}
                        onChange={e => setTargetCountry(e.target.value)}
                        placeholder={t.countryPlaceholder}
                        className="w-full bg-gray-50/50 border border-gray-100 rounded-[24px] pl-12 pr-5 py-5 focus:ring-4 focus:ring-yellow-100 focus:border-yellow-400 transition-all outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-indigo-500 pl-1">{t.duration}</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input 
                      type="number" 
                      min="1"
                      max="365"
                      value={tripDuration}
                      onChange={e => setTripDuration(parseInt(e.target.value) || 1)}
                      placeholder={t.durationPlaceholder}
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-[24px] pl-12 pr-5 py-5 focus:ring-4 focus:ring-yellow-100 focus:border-yellow-400 transition-all outline-none font-bold text-lg"
                    />
                  </div>
                </div>

                {errorHeader && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-red-50 text-red-500 p-5 rounded-[24px] text-sm font-bold border border-red-100 flex items-center gap-3"
                  >
                    <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">⚠️</span> {errorHeader}
                  </motion.div>
                )}

                <button
                  disabled={isSearching || !targetCity || !targetCountry}
                  onClick={handleSearch}
                  className="w-full bg-[#1D1D1F] text-white py-6 rounded-[28px] font-black text-xl flex items-center justify-center gap-3 hover:bg-black hover:shadow-2xl hover:shadow-gray-300 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-xl overflow-hidden group"
                >
                  {isSearching ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      {t.getAdvice}
                    </>
                  )}
                </button>
              </div>

              {/* History */}
              {history.length > 0 && (
                <section className="space-y-6 pt-12">
                  <div className="flex items-center justify-between px-4">
                    <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-500">
                      <History className="w-4 h-4" /> {t.history}
                    </h3>
                    <button 
                      onClick={clearHistory}
                      className="text-gray-400 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                      {t.clearHistory}
                    </button>
                  </div>
                  <div className="grid gap-4">
                    {history.map(trip => (
                      <button
                        key={trip.id}
                        onClick={() => {
                          setTargetCity(trip.city);
                          setTargetCountry(trip.country);
                          setTripDuration(trip.duration);
                          if (trip.advice) setCurrentAdvice(trip.advice);
                        }}
                        className="bg-white/60 backdrop-blur-sm p-6 rounded-[32px] border border-white flex items-center justify-between hover:bg-white hover:border-yellow-300 hover:shadow-2xl hover:shadow-yellow-100 transition-all text-left group active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-indigo-50 rounded-[20px] flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <MapPin className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="font-black text-xl text-gray-900">{trip.city}, {trip.country}</p>
                            <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                              {trip.duration} {t.daysIn.replace('天停留於', '天')} 
                            </p>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-yellow-400 group-hover:border-yellow-400 transition-all">
                          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          ) : (
            <AdviceSection 
              advice={currentAdvice} 
              city={targetCity} 
              country={targetCountry} 
              duration={tripDuration} 
              t={t}
              onBack={() => setCurrentAdvice(null)}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="py-24 text-center space-y-4 relative z-10">
        <div className="w-16 h-1 bg-yellow-300 mx-auto rounded-full" />
        <p className="font-black text-[10px] uppercase tracking-[0.4em] text-gray-400">© 2026 {t.title}</p>
        <p className="text-gray-400 text-xs font-medium">Your passport to the perfect escape.</p>
      </footer>
    </div>

  );
}
