import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  Trash2, 
  Shirt, 
  Sparkles, 
  CheckCircle2, 
  History, 
  User, 
  Calendar,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  PartyPopper
} from "lucide-react";
import confetti from "canvas-confetti";

// --- CONSTANTS ---
const USERS = ["Jernick", "Bave"];
const CHORE_VALUES: Record<string, number> = {
  "Taking out the trash": 1,
  "Laundry": 2,
  "Cleaning the floor": 3,
  "Cleaning dishes": 3
};

interface ChoreLog {
  id: string;
  user: string;
  chore: string;
  date: string;
  points: number;
  timestamp: string;
}

export default function App() {
  const [logs, setLogs] = useState<ChoreLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [selectedUser, setSelectedUser] = useState(USERS[0]);
  const [selectedChore, setSelectedChore] = useState(Object.keys(CHORE_VALUES)[0]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [password, setPassword] = useState("");

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/chores");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/chores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: selectedUser,
          chore: selectedChore,
          date: selectedDate,
          points: CHORE_VALUES[selectedChore],
          password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit");
      }

      // Success!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6']
      });

      setPassword("");
      fetchLogs();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate Scores
  const scores = USERS.reduce((acc, user) => {
    acc[user] = logs
      .filter(log => log.user === user)
      .reduce((sum, log) => sum + log.points, 0);
    return acc;
  }, {} as Record<string, number>);

  const leader = scores[USERS[0]] > scores[USERS[1]] 
    ? USERS[0] 
    : scores[USERS[1]] > scores[USERS[0]] 
      ? USERS[1] 
      : null;

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#141414] font-sans p-4 md:p-8">
      {/* Header */}
      <header className="max-w-5xl mx-auto mb-12 text-center">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4 shadow-sm"
        >
          <Trophy size={16} />
          Family Rewards System
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          Chore Tracker
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Compete to see who can help out most around the house! Earn points for every chore completed.
        </p>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Sparkles size={24} />
              </div>
              <h2 className="text-2xl font-bold">Log Activity</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User size={14} /> Who did the work?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {USERS.map(user => (
                    <button
                      key={user}
                      type="button"
                      onClick={() => setSelectedUser(user)}
                      className={`py-3 px-4 rounded-xl border-2 transition-all duration-200 font-medium ${
                        selectedUser === user 
                          ? "border-blue-500 bg-blue-50 text-blue-700" 
                          : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                      }`}
                    >
                      {user}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Select Chore
                </label>
                <select 
                  value={selectedChore}
                  onChange={(e) => setSelectedChore(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-blue-500 focus:outline-none transition-colors appearance-none"
                >
                  {Object.keys(CHORE_VALUES).map(chore => (
                    <option key={chore} value={chore}>
                      {chore} ({CHORE_VALUES[chore]} pts)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar size={14} /> Date
                </label>
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Lock size={14} /> Parent Verification
                  </label>
                  <input 
                    type="password"
                    placeholder="Enter parent password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full py-3 px-4 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 rounded-xl bg-red-50 text-red-600 text-sm flex items-start gap-3"
                >
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-[#141414] text-white font-bold hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-black/10"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Submit & Verify
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </section>
        </div>

        {/* Right Column: Leaderboard & Stats */}
        <div className="lg:col-span-7 space-y-8">
          {/* Leaderboard Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {USERS.map(user => (
              <motion.div 
                key={user}
                layoutId={`card-${user}`}
                className={`p-8 rounded-3xl border-2 relative overflow-hidden transition-all duration-500 ${
                  leader === user 
                    ? "border-blue-500 bg-blue-50/50 shadow-xl shadow-blue-100/50" 
                    : "border-gray-100 bg-white"
                }`}
              >
                {leader === user && (
                  <motion.div 
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute -top-4 -right-4 w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center pt-4 pr-4"
                  >
                    <Trophy size={24} />
                  </motion.div>
                )}
                <p className="text-gray-500 font-medium mb-1 uppercase tracking-wider text-xs">
                  {user === 'Jernick' ? 'The Specialist' : 'The Dynamo'}
                </p>
                <h3 className="text-2xl font-bold mb-4">{user}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-[#141414]">{scores[user]}</span>
                  <span className="text-gray-400 font-medium">Points</span>
                </div>
                
                {leader === user && (
                  <motion.div 
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="mt-6 flex items-center gap-2 text-blue-600 font-bold text-sm"
                  >
                    <PartyPopper size={16} />
                    Leading the pack!
                  </motion.div>
                )}
              </motion.div>
            ))}
          </section>

          {/* Activity Log */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
            <div className="p-8 border-bottom border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600">
                  <History size={24} />
                </div>
                <h2 className="text-2xl font-bold">Recent History</h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</th>
                    <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chore</th>
                    <th className="px-8 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence initial={false}>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-gray-400 italic">
                          <Loader2 className="animate-spin inline-block mr-2" size={16} />
                          Loading logs...
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-gray-400 italic">
                          No chores logged yet. Start helping out!
                        </td>
                      </tr>
                    ) : (
                      logs.slice().reverse().map((log) => (
                        <motion.tr 
                          key={log.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="group hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-8 py-4 text-sm font-medium text-gray-500">
                            {log.date}
                          </td>
                          <td className="px-8 py-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                              log.user === 'Jernick' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {log.user}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-sm font-semibold text-gray-700">
                            <div className="flex items-center gap-2">
                              {log.chore.includes('trash') && <Trash2 size={14} className="text-gray-400" />}
                              {log.chore.includes('Laundry') && <Shirt size={14} className="text-gray-400" />}
                              {log.chore.includes('floor') && <Sparkles size={14} className="text-gray-400" />}
                              {log.chore.includes('dishes') && <Sparkles size={14} className="text-gray-400" />}
                              {log.chore}
                            </div>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <span className="font-mono font-bold text-gray-900">+{log.points}</span>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
    </div>
  );
}
