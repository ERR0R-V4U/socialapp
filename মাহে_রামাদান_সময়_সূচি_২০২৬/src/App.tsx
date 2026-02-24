/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Moon, 
  Sun, 
  Clock, 
  MapPin, 
  Calendar, 
  ChevronDown, 
  Timer,
  Info
} from 'lucide-react';
import { 
  RamadanDay, 
  District, 
  DISTRICTS, 
  DHAKA_SCHEDULE, 
  BENGALI_DAYS, 
  toBengaliNumber 
} from './constants';

export default function App() {
  const [selectedDistrict, setSelectedDistrict] = useState<District>(DISTRICTS[0]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate times for selected district
  const schedule = useMemo(() => {
    return DHAKA_SCHEDULE.map(day => {
      const addMinutes = (timeStr: string, offset: number) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        date.setMinutes(date.getMinutes() + offset);
        return date.toTimeString().slice(0, 5);
      };

      return {
        ...day,
        sehri: addMinutes(day.sehri, selectedDistrict.sehriOffset),
        iftar: addMinutes(day.iftar, selectedDistrict.iftarOffset),
      };
    });
  }, [selectedDistrict]);

  // Find current or next Ramadan day
  const currentRamadanDay = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();

    // Ramadan 2026 starts Feb 18
    // We can also simulate "today" for testing if needed, 
    // but for production it should use the real date.
    if (year !== 2026) return null;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const todayStr = `${date.toString().padStart(2, '0')} ${monthNames[month]}`;
    
    return schedule.find(d => d.date === todayStr) || null;
  }, [schedule]);

  const scrollToToday = () => {
    const element = document.getElementById(`ramadan-day-${currentRamadanDay?.ramadan}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Countdown Logic
  const countdown = useMemo(() => {
    const now = currentTime.getTime();

    if (!currentRamadanDay) {
      // Check if it's before Ramadan 2026
      const firstDay = schedule[0];
      const [fH, fM] = firstDay.sehri.split(':').map(Number);
      // Ramadan 2026 starts Feb 18. Month is 0-indexed (Jan=0, Feb=1)
      const firstSehri = new Date(2026, 1, 18, fH, fM, 0, 0);
      
      if (now < firstSehri.getTime()) {
        const diff = firstSehri.getTime() - now;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        return { 
          label: "রমজান শুরু হতে বাকি", 
          time: `${toBengaliNumber(d)} দিন ${toBengaliNumber(h)} ঘণ্টা ${toBengaliNumber(m)} মিনিট ${toBengaliNumber(s)} সেকেন্ড`,
          nextEvent: 'sehri'
        };
      }
      
      return { label: "রমজান শেষ", time: "০:০:০", nextEvent: null };
    }

    const [sH, sM] = currentRamadanDay.sehri.split(':').map(Number);
    const [iH, iM] = currentRamadanDay.iftar.split(':').map(Number);

    const sehriTime = new Date(currentTime);
    sehriTime.setHours(sH, sM, 0, 0);

    const iftarTime = new Date(currentTime);
    iftarTime.setHours(iH, iM, 0, 0);

    let targetTime: number;
    let label: string;
    let nextEvent: 'sehri' | 'iftar' | null = null;

    if (now < sehriTime.getTime()) {
      targetTime = sehriTime.getTime();
      label = "সেহরির বাকি";
      nextEvent = 'sehri';
    } else if (now < iftarTime.getTime()) {
      targetTime = iftarTime.getTime();
      label = "ইফতারের বাকি";
      nextEvent = 'iftar';
    } else {
      // After iftar, show next day's sehri
      const nextDay = schedule.find(d => d.ramadan === currentRamadanDay.ramadan + 1);
      if (nextDay) {
        const [nsH, nsM] = nextDay.sehri.split(':').map(Number);
        const nextSehri = new Date(currentTime);
        nextSehri.setDate(nextSehri.getDate() + 1);
        nextSehri.setHours(nsH, nsM, 0, 0);
        targetTime = nextSehri.getTime();
        label = "আগামী সেহরির বাকি";
        nextEvent = 'sehri';
      } else {
        return { label: "রমজান শেষ", time: "০:০:০", nextEvent: null };
      }
    }

    const diff = targetTime - now;
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      label,
      time: `${toBengaliNumber(h)} ঘণ্টা ${toBengaliNumber(m)} মিনিট ${toBengaliNumber(s)} সেকেন্ড`,
      nextEvent
    };
  }, [currentTime, currentRamadanDay, schedule]);

  return (
    <div className="min-h-screen islamic-pattern pb-20 font-bengali selection:bg-emerald-200">
      {/* Header Section */}
      <header className="green-gradient text-white pt-12 pb-32 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center space-y-4"
          >
            <div className="relative group">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              >
                <Moon className="w-20 h-20 text-[#f9e27d] fill-[#f9e27d] drop-shadow-[0_0_15px_rgba(249,226,125,0.5)]" />
              </motion.div>
              <div className="absolute -top-2 -right-2">
                <Sun className="w-8 h-8 text-[#f9e27d] opacity-30 animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow-lg">
              মাহে রামাদান <span className="text-[#f9e27d]">২০২৬</span>
            </h1>
            <p className="text-xl opacity-90 font-medium bg-white/10 px-6 py-1 rounded-full backdrop-blur-sm">
              ১৪৪৭ হিজরি • সময় সূচি
            </p>
          </motion.div>

          {/* District Selector & Clock */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#f9e27d] rounded-lg">
                    <MapPin className="w-5 h-5 text-emerald-900" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider opacity-80">আপনার জেলা</span>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 bg-emerald-800/50 hover:bg-emerald-800/80 transition-all px-5 py-2.5 rounded-xl text-sm font-bold border border-white/10"
                  >
                    {selectedDistrict.bnName}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 bg-white text-slate-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 overflow-hidden border border-emerald-100"
                      >
                        <div className="max-h-72 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-emerald-200">
                          {DISTRICTS.map((d) => (
                            <button
                              key={d.name}
                              onClick={() => {
                                setSelectedDistrict(d);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left px-5 py-3 text-sm transition-all flex items-center justify-between ${selectedDistrict.name === d.name ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-emerald-50 text-slate-700'}`}
                            >
                              {d.bnName}
                              {selectedDistrict.name === d.name && <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                  <Clock className="w-8 h-8 text-[#f9e27d]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">বাংলাদেশ সময়</p>
                  <p className="text-3xl font-black tracking-tighter text-[#f9e27d]">
                    {toBengaliNumber(currentTime.toLocaleTimeString('bn-BD', { hour12: true }))}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl flex flex-col justify-center relative overflow-hidden group"
            >
              <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Timer className="w-32 h-32 text-white" />
              </div>
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Timer className="w-5 h-5 text-[#f9e27d]" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider opacity-80">{countdown.label}</span>
              </div>
              <p className="text-2xl md:text-3xl font-black text-[#f9e27d] relative z-10 drop-shadow-md">
                {countdown.time}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Mosque Silhouette */}
        <div className="absolute bottom-0 left-0 w-full h-40 opacity-10 pointer-events-none">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-white">
            <path d="M0,120 L1200,120 L1200,80 C1100,80 1050,40 1000,40 C950,40 900,80 800,80 C700,80 650,20 600,20 C550,20 500,80 400,80 C300,80 250,40 200,40 C150,40 100,80 0,80 Z" />
          </svg>
        </div>
      </header>

      {/* Timetable Section */}
      <main className="max-w-4xl mx-auto -mt-16 px-4 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)] overflow-hidden border border-emerald-100/50">
          <div className="p-8 border-b border-emerald-50 bg-gradient-to-r from-emerald-50/50 to-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <Calendar className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-emerald-900">পূর্ণাঙ্গ সময় সূচি</h2>
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">Ramadan Timetable 2026</p>
              </div>
            </div>
            
            {currentRamadanDay && (
              <button 
                onClick={scrollToToday}
                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"
              >
                আজকের সময়
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-900 text-white">
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest">রমজান</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest">তারিখ</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest">বার</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest">সেহরি</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-widest">ইফতার</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((day) => {
                  const isToday = currentRamadanDay?.ramadan === day.ramadan;
                  return (
                    <tr 
                      id={`ramadan-day-${day.ramadan}`}
                      key={day.ramadan}
                      className={`border-b border-emerald-50 transition-all duration-300 group ${isToday ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-50/50'}`}
                    >
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl font-bold transition-transform group-hover:scale-110 ${isToday ? 'bg-white text-emerald-700 shadow-lg' : 'bg-emerald-50 text-emerald-700'}`}>
                          {toBengaliNumber(day.ramadan)}
                        </span>
                      </td>
                      <td className={`px-6 py-5 text-sm font-bold ${isToday ? 'text-white' : 'text-slate-600'}`}>
                        {toBengaliNumber(day.date)}
                      </td>
                      <td className={`px-6 py-5 text-sm font-medium ${isToday ? 'text-emerald-50' : 'text-slate-500'}`}>
                        {BENGALI_DAYS[day.day]}
                      </td>
                      <td className={`px-6 py-5 text-base font-black tracking-tight ${isToday ? 'text-white' : 'text-emerald-700'} ${isToday && countdown.nextEvent === 'sehri' ? 'animate-pulse' : ''}`}>
                        {toBengaliNumber(day.sehri)}
                      </td>
                      <td className={`px-6 py-5 text-base font-black tracking-tight ${isToday ? 'text-white' : 'text-orange-600'} ${isToday && countdown.nextEvent === 'iftar' ? 'animate-pulse' : ''}`}>
                        {toBengaliNumber(day.iftar)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Duas Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-emerald-100">
            <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <Moon className="w-5 h-5 text-emerald-600" />
              রোজার নিয়ত
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed italic mb-2">
              "নাওয়াইতু আন আসুমা গাদাম মিন শাহরি রামাদ্বানাল মুবারাকি ফারদ্বাল্লাকা ইয়া আল্লাহু ফাতাক্বাব্বাল মিন্নি ইন্নাকা আনতাস সামিউল আলিম।"
            </p>
            <p className="text-xs text-slate-500">
              অর্থ: হে আল্লাহ! আমি আগামীকাল পবিত্র রমজান মাসের রোজা রাখার নিয়ত করলাম। আপনি আমার পক্ষ থেকে তা কবুল করুন। নিশ্চয়ই আপনি সর্বশ্রোতা ও সর্বজ্ঞ।
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border border-emerald-100">
            <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-orange-500" />
              ইফতারের দোয়া
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed italic mb-2">
              "আল্লাহুম্মা লাকা সুমতু ওয়া আলা রিযক্বিকা আফতারতু।"
            </p>
            <p className="text-xs text-slate-500">
              অর্থ: হে আল্লাহ! আমি আপনারই সন্তুষ্টির জন্য রোজা রেখেছি এবং আপনারই দেয়া রিযিক দ্বারা ইফতার করছি।
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 bg-emerald-950 text-white text-center px-4">
        <div className="max-w-4xl mx-auto">
          <Moon className="w-8 h-8 text-[#f9e27d] mx-auto mb-6" />
          <p className="text-lg italic mb-4 opacity-80">
            "যে ব্যক্তি ঈমানের সাথে সওয়াবের আশায় রমজানের রোজা রাখে, তার পূর্ববর্তী সকল গুনাহ ক্ষমা করে দেয়া হয়।"
          </p>
          <p className="text-sm opacity-60 mb-8">— আল হাদিস</p>
          <div className="h-px bg-white/10 w-24 mx-auto mb-8"></div>
          <p className="text-sm opacity-70">
            পরিকল্পনা ও বাস্তবায়নে <span className="text-[#f9e27d] font-bold">মোঃ নিঝুম হোসেন</span>
          </p>
          <p className="text-xs opacity-40 mt-2">© ২০২৬ মাহে রমাদান সময় সূচি</p>
        </div>
      </footer>
    </div>
  );
}
