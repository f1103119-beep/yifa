/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Droplets, 
  Coffee, 
  UtensilsCrossed, 
  Moon, 
  Cookie, 
  Sparkles, 
  Trash2,
  Globe,
  Loader2,
  Activity,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { DailyLog, Meal, MealCategory, AnalysisResult } from './types';
import { TRANSLATIONS, Language } from './constants';
import { analyzeHabits } from './services/gemini';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Record<string, AnalysisResult>>({});
  const [newMeal, setNewMeal] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MealCategory>('breakfast');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  // Helper for unique IDs
  const generateId = () => {
    try {
      return crypto.randomUUID();
    } catch (e) {
      return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
  };

  // Load from localStorage
  useEffect(() => {
    try {
      const savedLogs = localStorage.getItem('nutri_logs');
      const savedAnalysis = localStorage.getItem('nutri_analysis');
      const savedLang = localStorage.getItem('nutri_lang');
      
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs);
        if (parsed && typeof parsed === 'object') setLogs(parsed);
      }
      if (savedAnalysis) {
        const parsed = JSON.parse(savedAnalysis);
        if (parsed && typeof parsed === 'object') setAnalysis(parsed);
      }
      if (savedLang) setLang(savedLang as Language);
    } catch (e) {
      console.error("Storage load error:", e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nutri_logs', JSON.stringify(logs));
      localStorage.setItem('nutri_analysis', JSON.stringify(analysis));
      localStorage.setItem('nutri_lang', lang);
    } catch (e) {
      console.error("Storage save error:", e);
    }
  }, [logs, analysis, lang]);

  const currentLog = useMemo(() => {
    return logs[currentDate] || { date: currentDate, meals: [], waterIntake: 0 };
  }, [logs, currentDate]);

  const handleAddMeal = () => {
    if (!newMeal.trim()) return;

    const meal: Meal = {
      id: generateId(),
      category: selectedCategory,
      content: newMeal,
      timestamp: new Date().toISOString()
    };

    setLogs(prev => ({
      ...prev,
      [currentDate]: {
        ...currentLog,
        meals: [...currentLog.meals, meal]
      }
    }));
    setNewMeal('');
  };

  const handleUpdateWater = (amount: number) => {
    setLogs(prev => ({
      ...prev,
      [currentDate]: {
        ...currentLog,
        waterIntake: Math.max(0, currentLog.waterIntake + amount)
      }
    }));
  };

  const handleAnalyze = async () => {
    if (currentLog.meals.length === 0) return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const result = await analyzeHabits(currentLog, lang);
      setAnalysis(prev => ({
        ...prev,
        [currentDate]: result
      }));
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error?.message || "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearData = () => {
    if (confirm('Clear all data?')) {
      setLogs({});
      setAnalysis({});
      localStorage.removeItem('nutri_logs');
      localStorage.removeItem('nutri_analysis');
    }
  };

  const currentAnalysis = analysis[currentDate];

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#141414] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#141414] rounded-xl flex items-center justify-center">
            <Activity className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-none">{t.title}</h1>
            <p className="text-xs text-gray-500 mt-1">{t.subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E5E5] hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Globe className="w-4 h-4" />
            {t.switchLang}
          </button>
          <button 
            onClick={clearData}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Logging */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Date Selector */}
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {[-2, -1, 0].map(offset => {
              const date = new Date();
              date.setDate(date.getDate() + offset);
              const dateStr = format(date, 'yyyy-MM-dd');
              const isActive = currentDate === dateStr;
              return (
                <button
                  key={dateStr}
                  onClick={() => setCurrentDate(dateStr)}
                  className={`flex flex-col items-center min-w-[80px] p-3 rounded-2xl transition-all ${
                    isActive 
                      ? 'bg-[#141414] text-white shadow-lg' 
                      : 'bg-white text-gray-500 border border-[#E5E5E5] hover:border-gray-400'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                    {format(date, 'EEE', { locale: lang === 'zh' ? zhTW : undefined })}
                  </span>
                  <span className="text-lg font-bold">
                    {format(date, 'dd')}
                  </span>
                </button>
              );
            })}
          </div>

          <section className="bg-white rounded-3xl p-8 border border-[#E5E5E5] shadow-sm">
            <h2 className="text-2xl font-bold mb-6">{t.addMeal}</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { id: 'breakfast', icon: Coffee, label: t.breakfast },
                { id: 'lunch', icon: UtensilsCrossed, label: t.lunch },
                { id: 'dinner', icon: Moon, label: t.dinner },
                { id: 'snack', icon: Cookie, label: t.snack },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as MealCategory)}
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                    selectedCategory === cat.id 
                      ? 'bg-gray-100 border-[#141414] text-[#141414] font-bold' 
                      : 'bg-white border-[#E5E5E5] text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <cat.icon className="w-5 h-5 transition-transform active:scale-95" />
                  <span className="text-sm">{cat.label}</span>
                </button>
              ))}
            </div>

            <div className="relative group">
              <input
                type="text"
                value={newMeal}
                onChange={e => setNewMeal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddMeal()}
                placeholder={t.mealPlaceholder}
                className="w-full bg-gray-50 border border-[#E5E5E5] rounded-2xl p-5 pr-16 focus:outline-none focus:ring-2 focus:ring-[#141414]/10 focus:border-[#141414] transition-all"
              />
              <button
                onClick={handleAddMeal}
                className="absolute right-3 top-3 p-3 bg-[#141414] text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </section>

          {/* Meal List */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 pl-2">{t.todaySummary}</h2>
            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {currentLog.meals.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 text-center bg-white/50 border border-dashed border-[#E5E5E5] rounded-3xl"
                  >
                    <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 italic">{t.noData}</p>
                  </motion.div>
                ) : (
                  currentLog.meals.map((meal) => (
                    <motion.div
                      layout
                      key={meal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-5 rounded-2xl border border-[#E5E5E5] flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                          {meal.category === 'breakfast' && <Coffee className="w-6 h-6" />}
                          {meal.category === 'lunch' && <UtensilsCrossed className="w-6 h-6" />}
                          {meal.category === 'dinner' && <Moon className="w-6 h-6" />}
                          {meal.category === 'snack' && <Cookie className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                            {t[meal.category as keyof typeof t.en]}
                          </p>
                          <p className="font-medium text-lg">{meal.content}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setLogs(prev => ({
                          ...prev,
                          [currentDate]: {
                            ...currentLog,
                            meals: currentLog.meals.filter(m => m.id !== meal.id)
                          }
                        }))}
                        className="p-2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Water Intake */}
          <section className="bg-white rounded-3xl p-8 border border-[#E5E5E5] shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Droplets className="w-32 h-32 text-blue-500" />
            </div>
            
            <div className="relative z-1">
              <h2 className="text-2xl font-bold mb-1">{t.water}</h2>
              <p className="text-gray-400 text-sm mb-6">{t.waterGoal}</p>

              <div className="flex items-end gap-6 mb-8">
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (currentLog.waterIntake / 2000) * 100)}%` }}
                  />
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black">{currentLog.waterIntake}</span>
                  <span className="text-gray-400 font-medium ml-1">{t.waterUnit}</span>
                </div>
              </div>

              <div className="flex gap-4">
                {[250, 500].map(amount => (
                  <button
                    key={amount}
                    onClick={() => handleUpdateWater(amount)}
                    className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-all group"
                  >
                    <Droplets className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="font-bold">+{amount}{t.waterUnit}</span>
                  </button>
                ))}
                <button
                  onClick={() => handleUpdateWater(-250)}
                  className="px-4 rounded-2xl border border-gray-100 hover:bg-red-50 hover:border-red-200 text-gray-300 hover:text-red-500 transition-all font-bold"
                >
                  -
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            
            {!currentAnalysis ? (
              <div className="bg-[#141414] text-white rounded-3xl p-10 overflow-hidden relative shadow-2xl">
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">{t.aiAnalysis}</h2>
                  <p className="text-gray-400 text-sm mb-4 max-w-xs">{t.noData}</p>
                  
                  {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs mb-6 w-full max-w-xs">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    disabled={isAnalyzing || currentLog.meals.length === 0}
                    onClick={handleAnalyze}
                    className="w-full bg-white text-[#141414] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Activity className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        {t.analyzeBtn}
                      </>
                    )}
                  </button>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Rating Card */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl p-10 border border-[#E5E5E5] text-center shadow-lg relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-bl-xl ${
                    currentAnalysis.rating >= 7 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {currentAnalysis.rating >= 7 ? t.healthyHabit : t.notYetHealthy}
                  </div>

                  <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">{t.rating}</p>
                  <div className="relative inline-block mb-6">
                    <span className="text-9xl font-black tracking-tighter tabular-nums drop-shadow-sm">
                      {currentAnalysis.rating}
                    </span>
                    <span className="text-2xl font-bold text-gray-300 absolute -bottom-2 -right-12"> / 10</span>
                  </div>

                  {/* Rating Meter */}
                  <div className="flex justify-center gap-1 mb-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => (
                      <div 
                        key={step} 
                        className={`h-1.5 w-full rounded-full transition-all ${
                          step <= currentAnalysis.rating 
                            ? currentAnalysis.rating >= 7 ? 'bg-green-500' : 'bg-orange-500'
                            : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    disabled={isAnalyzing}
                    onClick={handleAnalyze}
                    className="flex items-center gap-2 mx-auto text-sm font-bold text-gray-400 hover:text-[#141414] transition-colors"
                  >
                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                    {t.analyzeBtn}
                  </button>
                </motion.div>

                {/* Feedback Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-3xl p-8 border border-[#E5E5E5] space-y-6 shadow-sm"
                >
                  <div>
                    <h3 className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                       <TrendingUp className="w-3 h-3" /> {t.feedbackTitle}
                    </h3>
                    <p className="text-lg leading-relaxed text-gray-800 italic">
                      "{currentAnalysis.feedback}"
                    </p>
                  </div>

                  <div className="pt-6 border-t border-gray-100 space-y-4">
                    <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#141414] mb-3 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> {t.suggestionsTitle}
                    </h3>
                    <div className="space-y-3">
                      {currentAnalysis.suggestions.map((suggestion, idx) => (
                        <div key={idx} className="flex gap-4 group">
                          <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover:bg-[#141414] group-hover:text-white transition-all">
                            {idx + 1}
                          </div>
                          <p className="text-sm text-gray-600 group-hover:text-[#141414] transition-colors">
                            {suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
                
                <p className="text-center text-[10px] text-gray-300 font-medium uppercase">
                  Analyzed at {format(new Date(currentAnalysis.lastAnalyzed), 'HH:mm:ss')}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-[#E5E5E5] px-6 py-12 text-center text-gray-400 text-sm">
        <p>© 2026 {t.title} • {t.healthyHabit} Guide</p>
      </footer>
    </div>
  );
}
