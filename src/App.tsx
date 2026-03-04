import React, { useState, useEffect, useRef, useCallback } from "react";
import * as api from "./api";
import { supabase } from "./lib/supabase";
import { getPlansForGender, TrainingPlan, PlanDay } from "./plans";
import { getCardsForGender, getCategories } from "./education";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  Volume2,
  Vibrate,
  Activity,
  CheckCircle,
  Heart,
  ChevronLeft,
  Lock,
  Bell,
  Sparkles,
  Droplets,
  Shield,
  Zap,
  User,
  Users,
  Crown,
  SlidersHorizontal,
  X,
  Flame,
  Award,
  Sun,
  Moon,
  Coffee,
  Target,
  CalendarDays,
  Home,
  UserCircle,
  ChevronRight,
  Share2,
  Download,
  LogIn,
  LogOut,
  Mail,
} from "lucide-react";
import { toPng } from "html-to-image";

// --- Types & Constants ---
type WorkoutPhase = "ready" | "contract" | "rest" | "finished";
type Screen = "auth" | "onboarding" | "home" | "workout";
type Tab = "training" | "calendar" | "profile";
type Gender = "female" | "male";

interface Program {
  id: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
  contractTime: number; // seconds
  restTime: number; // seconds
  cycles: number; // total reps
  color: string;
  glowColor: string;
  isPro?: boolean;
}

const BADGES = [
  {
    id: "first_step",
    name: "初次觉醒",
    desc: "完成第一次训练",
    target: 1,
    type: "workouts",
    emoji: "🌱",
  },
  {
    id: "ten_workouts",
    name: "十全十美",
    desc: "完成10次训练",
    target: 10,
    type: "workouts",
    emoji: "🔟",
  },
  {
    id: "fifty_workouts",
    name: "半百征途",
    desc: "完成50次训练",
    target: 50,
    type: "workouts",
    emoji: "🏅",
  },
  {
    id: "hundred_workouts",
    name: "百炼成钢",
    desc: "完成100次训练",
    target: 100,
    type: "workouts",
    emoji: "💎",
  },
  {
    id: "streak_3",
    name: "三日之约",
    desc: "连续打卡3天",
    target: 3,
    type: "streak",
    emoji: "🔥",
  },
  {
    id: "streak_7",
    name: "自律王者",
    desc: "连续打卡7天",
    target: 7,
    type: "streak",
    emoji: "👑",
  },
  {
    id: "streak_14",
    name: "钢铁意志",
    desc: "连续打卡14天",
    target: 14,
    type: "streak",
    emoji: "⚔️",
  },
  {
    id: "streak_30",
    name: "传奇毅力",
    desc: "连续打卡30天",
    target: 30,
    type: "streak",
    emoji: "🏆",
  },
  {
    id: "master_60",
    name: "渐入佳境",
    desc: "累计训练60分钟",
    target: 60,
    type: "minutes",
    emoji: "⏱️",
  },
  {
    id: "master_300",
    name: "核心掌控",
    desc: "累计训练300分钟",
    target: 300,
    type: "minutes",
    emoji: "🎯",
  },
  {
    id: "master_600",
    name: "殿堂大师",
    desc: "累计训练600分钟",
    target: 600,
    type: "minutes",
    emoji: "🌟",
  },
  {
    id: "early_bird",
    name: "早起鸟儿",
    desc: "在早上6-8点完成训练",
    target: 1,
    type: "special",
    emoji: "🐦",
  },
];

const THEMES = {
  female: {
    title: "Secret Garden",
    subtitle: "你的私密健康花园",
    bgClass: "bg-[#120E15]",
    gradientClass: "text-gradient-rose",
    glassClass: "glass-panel-rose",
    blob1: "bg-rose-900/20",
    blob2: "bg-purple-900/20",
    primaryColor: "#FDA4AF",
    ringColor: "#E11D48",
    programs: [
      {
        id: "daily",
        name: "日常唤醒保养",
        desc: "每天3分钟，预防松弛，保持私密年轻态。",
        icon: <Sparkles className="w-4 h-4" />,
        contractTime: 3,
        restTime: 3,
        cycles: 10,
        color: "#FBCFE8",
        glowColor: "rgba(244, 114, 182, 0.4)",
      },
      {
        id: "tighten",
        name: "紧致提升进阶",
        desc: "强化盆底肌群，提升伴侣亲密体验与自我掌控感。",
        icon: <Heart className="w-4 h-4" />,
        contractTime: 5,
        restTime: 5,
        cycles: 15,
        color: "#E9D5FF",
        glowColor: "rgba(192, 132, 252, 0.4)",
      },
      {
        id: "postpartum",
        name: "产后温和修复",
        desc: "专为产后妈妈设计，加长放松时间，改善漏尿尴尬。",
        icon: <Droplets className="w-4 h-4" />,
        contractTime: 4,
        restTime: 6,
        cycles: 12,
        color: "#BAE6FD",
        glowColor: "rgba(56, 189, 248, 0.4)",
      },
    ],
    guidance: {
      ready: ["深呼吸，放松全身...", "找到会阴处微微收紧的感觉..."],
      contract: [
        "向上提拉，像憋尿一样...",
        "保持住，不要憋气...",
        "感受盆底肌的收缩...",
      ],
      rest: [
        "彻底放松，感受血液回流...",
        "深吸气，让肌肉完全休息...",
        "不要有任何紧绷感...",
      ],
    },
    tipTitle: "如何找到盆底肌？",
    tipContent: [
      "1. 想象正在憋尿：尝试在排尿中途突然停止，那一瞬间收紧的肌肉就是盆底肌。（注意：仅用于寻找感觉，不要经常在排尿时练习）。",
      "2. 想象阻止排气：收紧肛门周围的肌肉，就像在公共场合试图憋住放屁一样。",
      "3. 避免错误发力：练习时，你的大腿、臀部和腹部应该是放松的。如果肚子紧绷，说明发力错误。",
    ],
  },
  male: {
    title: "Deep Control",
    subtitle: "男性的核心掌控引擎",
    bgClass: "bg-[#0B1120]",
    gradientClass: "text-gradient-ocean",
    glassClass: "glass-panel-ocean",
    blob1: "bg-cyan-900/20",
    blob2: "bg-blue-900/20",
    primaryColor: "#7DD3FC",
    ringColor: "#0284C7",
    programs: [
      {
        id: "m_daily",
        name: "基础唤醒控制",
        desc: "激活盆底肌群，建立神经连接，找回发力感。",
        icon: <Shield className="w-4 h-4" />,
        contractTime: 3,
        restTime: 3,
        cycles: 10,
        color: "#BAE6FD",
        glowColor: "rgba(56, 189, 248, 0.4)",
      },
      {
        id: "m_stamina",
        name: "持久力强化进阶",
        desc: "提升肌肉耐力与爆发力，增强核心掌控与自信。",
        icon: <Zap className="w-4 h-4" />,
        contractTime: 5,
        restTime: 5,
        cycles: 15,
        color: "#93C5FD",
        glowColor: "rgba(59, 130, 246, 0.4)",
      },
      {
        id: "m_health",
        name: "前列腺健康保养",
        desc: "促进局部血液循环，预防久坐带来的健康隐患。",
        icon: <Activity className="w-4 h-4" />,
        contractTime: 4,
        restTime: 6,
        cycles: 12,
        color: "#A7F3D0",
        glowColor: "rgba(16, 185, 129, 0.4)",
      },
    ],
    guidance: {
      ready: ["深呼吸，放松腹部...", "准备激活核心底盘..."],
      contract: [
        "收紧会阴，像中断排尿一样...",
        "保持力量，自然呼吸...",
        "感受底部的向上提拉...",
      ],
      rest: [
        "完全释放，感受血液涌入...",
        "深吸气，让肌肉恢复活力...",
        "彻底放松，不要紧绷...",
      ],
    },
    tipTitle: "如何找到盆底肌？(男性)",
    tipContent: [
      "1. 想象中断排尿：在排尿时尝试突然停止水流，此时发力的肌肉群就是盆底肌。（注意：仅用于初期寻找感觉，切勿频繁在排尿时练习）。",
      "2. 想象阻止排气：收紧肛门括约肌，就像试图憋住放屁一样，同时感觉阴茎根部有轻微的向内回缩感。",
      "3. 避免代偿发力：练习时，你的腹肌、大腿和臀部肌肉应该是放松的。如果肚子明显用力，说明发力位置不对。",
    ],
  },
};

// --- Main App ---
export default function App() {
  const [gender, setGender] = useState<Gender | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>("auth");
  const [currentTab, setCurrentTab] = useState<Tab>("training");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // Auth State
  const [authSession, setAuthSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Plan State
  const [activePlan, setActivePlan] = useState<TrainingPlan | null>(null);
  const [planProgress, setPlanProgress] = useState<{ planId: string; currentWeek: number; currentDay: number; completedDays: string[] }>({
    planId: "", currentWeek: 1, currentDay: 1, completedDays: [],
  });
  const [showPlanDetail, setShowPlanDetail] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<typeof BADGES[0] | null>(null);

  // Meditation State
  const [meditationActive, setMeditationActive] = useState(false);
  const [meditationTime, setMeditationTime] = useState(60); // seconds
  const [meditationTimeLeft, setMeditationTimeLeft] = useState(0);
  const meditationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Workout State
  const [phase, setPhase] = useState<WorkoutPhase>("ready");
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [discreetMode, setDiscreetMode] = useState(false);
  const [guideText, setGuideText] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const shareCardRef = useRef<HTMLDivElement>(null);

  // User Profile State
  const [userName, setUserName] = useState("训练者");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  // Custom Program State
  const [customSettings, setCustomSettings] = useState({
    contract: 5,
    rest: 5,
    cycles: 10,
  });

  // Stats & Preferences
  const [stats, setStats] = useState({
    streak: 0,
    totalMinutes: 0,
    lastWorkout: "",
    history: [] as string[],
    todayMinutes: 0,
    lastActiveDate: "",
    unlockedBadges: [] as string[],
    workoutsCompleted: 0,
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("21:30");
  const [dailyGoal, setDailyGoal] = useState(5);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load user data from API after auth
  const loadUserData = useCallback(async () => {
    try {
      const [profile, statsData, workoutDates] = await Promise.all([
        api.getUserProfile(),
        api.getUserStats(),
        api.getWorkoutDates(),
      ]);

      // Set profile
      if (profile.gender) {
        setGender(profile.gender as Gender);
        setCurrentScreen("home");
      } else {
        setCurrentScreen("onboarding");
      }
      if (profile.user_name) setUserName(profile.user_name);

      // Set stats
      const todayStr = new Date().toDateString();
      const todayMinutes = statsData.last_active_date === todayStr ? statsData.today_minutes : 0;
      setStats({
        streak: statsData.streak || 0,
        totalMinutes: statsData.total_minutes || 0,
        todayMinutes: todayMinutes,
        lastWorkout: statsData.last_workout || "",
        lastActiveDate: statsData.last_active_date || "",
        unlockedBadges: statsData.unlocked_badges || [],
        workoutsCompleted: statsData.workouts_completed || 0,
        history: workoutDates || [],
      });

      // Set preferences
      setSoundEnabled(statsData.sound_enabled ?? true);
      setHapticsEnabled(statsData.haptics_enabled ?? true);
      setReminderTime(statsData.reminder_time ?? "21:30");
      setDailyGoal(statsData.daily_goal ?? 5);
    } catch (err) {
      console.error("Failed to load user data:", err);
      // Fallback: still go to onboarding so user isn't stuck on black screen
      setCurrentScreen("onboarding");
    }
  }, []);

  // Initialization: Check auth session
  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthSession(session);
      if (session) {
        loadUserData().finally(() => setAuthLoading(false));
      } else {
        setCurrentScreen("auth");
        setAuthLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthSession(session);
      if (session) {
        loadUserData();
      } else {
        setCurrentScreen("auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  // Save Prefs (also sync to API)
  useEffect(() => {
    localStorage.setItem(
      "kegel_prefs_v2",
      JSON.stringify({ soundEnabled, hapticsEnabled, reminderTime, dailyGoal }),
    );
    if (authSession) {
      api.updatePreferences({
        sound_enabled: soundEnabled,
        haptics_enabled: hapticsEnabled,
        reminder_time: reminderTime,
        daily_goal: dailyGoal,
      }).catch(err => console.error('Failed to sync preferences:', err));
    }
  }, [soundEnabled, hapticsEnabled, reminderTime, dailyGoal, authSession]);

  const handleGenderSelect = (selected: Gender) => {
    setGender(selected);
    localStorage.setItem("kegel_gender", selected);
    setCurrentScreen("home");
    if (authSession) {
      api.updateUserProfile({ gender: selected }).catch(err => console.error('Failed to save gender:', err));
    }
  };

  // Wake lock
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator && currentScreen === "workout") {
          wakeLock = await (navigator as any).wakeLock.request("screen");
        }
      } catch (err) { }
    };
    requestWakeLock();
    return () => {
      if (wakeLock !== null) wakeLock.release().catch(() => { });
    };
  }, [currentScreen]);

  const vibrate = useCallback(
    (pattern: number | number[]) => {
      if (
        hapticsEnabled &&
        typeof navigator !== "undefined" &&
        navigator.vibrate
      ) {
        navigator.vibrate(pattern);
      }
    },
    [hapticsEnabled],
  );

  const playChime = useCallback(
    (type: "start" | "stop" | "tick") => {
      if (!soundEnabled) return;
      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";

      if (type === "start") {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(
          554.37,
          ctx.currentTime + 0.5,
        );
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.5);
      } else if (type === "stop") {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(
          349.23,
          ctx.currentTime + 0.8,
        );
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.5);
      } else if (type === "tick") {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      }
    },
    [soundEnabled],
  );

  const startWorkout = (program: Program) => {
    if (!gender) return;
    setSelectedProgram(program);
    setCurrentScreen("workout");
    setPhase("ready");
    setTimeLeft(3);
    setCurrentCycle(1);
    setIsPaused(false);
    setDiscreetMode(false);
    setGuideText(THEMES[gender].guidance.ready[0]);

    if (soundEnabled && !audioCtxRef.current) {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
  };

  const startCustomWorkout = () => {
    if (!gender) return;
    const customProg: Program = {
      id: "custom",
      name: "自定义专属方案",
      desc: "完全自定义的训练节奏",
      icon: <SlidersHorizontal className="w-4 h-4" />,
      contractTime: customSettings.contract,
      restTime: customSettings.rest,
      cycles: customSettings.cycles,
      color: "#FCD34D", // amber-300
      glowColor: "rgba(251, 191, 36, 0.4)",
      isPro: true,
    };
    setShowCustomModal(false);
    startWorkout(customProg);
  };

  // Plan functions
  const startPlan = (plan: TrainingPlan) => {
    setActivePlan(plan);
    const saved = localStorage.getItem(`plan_progress_${plan.id}`);
    if (saved) {
      setPlanProgress(JSON.parse(saved));
    } else {
      setPlanProgress({ planId: plan.id, currentWeek: 1, currentDay: 1, completedDays: [] });
    }
    setShowPlanDetail(true);
  };

  const getTodayPlanDay = (): PlanDay | null => {
    if (!activePlan) return null;
    const week = activePlan.weeks.find(w => w.weekNumber === planProgress.currentWeek);
    if (!week) return null;
    return week.days.find(d => d.dayNumber === planProgress.currentDay) || null;
  };

  const startPlanWorkout = () => {
    if (!gender || !activePlan) return;
    const day = getTodayPlanDay();
    if (!day || day.isRestDay) return;
    const planProg: Program = {
      id: `plan_${activePlan.id}_w${planProgress.currentWeek}_d${planProgress.currentDay}`,
      name: `${activePlan.name} · 第${planProgress.currentWeek}周 · 第${planProgress.currentDay}天`,
      desc: activePlan.weeks[planProgress.currentWeek - 1]?.title || "",
      icon: <Target className="w-4 h-4" />,
      contractTime: day.contractTime,
      restTime: day.restTime,
      cycles: day.cycles,
      color: activePlan.color,
      glowColor: `${activePlan.color}66`,
    };
    setShowPlanDetail(false);
    startWorkout(planProg);
  };

  const advancePlanDay = () => {
    if (!activePlan) return;
    const key = `w${planProgress.currentWeek}d${planProgress.currentDay}`;
    const newCompleted = [...planProgress.completedDays, key];
    let nextDay = planProgress.currentDay + 1;
    let nextWeek = planProgress.currentWeek;
    if (nextDay > 7) {
      nextDay = 1;
      nextWeek += 1;
    }
    const isPlanComplete = nextWeek > activePlan.totalWeeks;
    const newProgress = {
      planId: activePlan.id,
      currentWeek: isPlanComplete ? activePlan.totalWeeks : nextWeek,
      currentDay: isPlanComplete ? 7 : nextDay,
      completedDays: newCompleted,
    };
    setPlanProgress(newProgress);
    localStorage.setItem(`plan_progress_${activePlan.id}`, JSON.stringify(newProgress));
  };

  const checkBadges = (currentStats: typeof stats) => {
    const newBadges = [...currentStats.unlockedBadges];
    let unlockedAny = false;
    let lastUnlocked: typeof BADGES[0] | null = null;

    BADGES.forEach((badge) => {
      if (!newBadges.includes(badge.id)) {
        let achieved = false;
        if (badge.type === "workouts" && currentStats.workoutsCompleted >= badge.target) achieved = true;
        if (badge.type === "streak" && currentStats.streak >= badge.target) achieved = true;
        if (badge.type === "minutes" && currentStats.totalMinutes >= badge.target) achieved = true;
        if (badge.type === "special" && badge.id === "early_bird") {
          const hour = new Date().getHours();
          if (hour >= 6 && hour < 8) achieved = true;
        }

        if (achieved) {
          newBadges.push(badge.id);
          unlockedAny = true;
          lastUnlocked = badge;
        }
      }
    });

    if (lastUnlocked) {
      setNewlyUnlockedBadge(lastUnlocked);
      setTimeout(() => setNewlyUnlockedBadge(null), 3500);
    }

    return { newBadges, unlockedAny };
  };

  const finishWorkout = useCallback(() => {
    if (!selectedProgram || phase === "finished") return;
    setPhase("finished");
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    vibrate([100, 50, 100, 50, 200]);
    playChime("start");

    const today = new Date().toDateString();
    setStats((prev) => {
      let newStreak = prev.streak;
      let newHistory = [...(prev.history || [])];

      if (prev.lastWorkout !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (prev.lastWorkout === yesterday.toDateString()) {
          newStreak += 1;
        } else if (prev.lastWorkout !== today) {
          newStreak = 1;
        }
        if (!newHistory.includes(today)) {
          newHistory.push(today);
        }
      }

      const sessionMinutes =
        ((selectedProgram.contractTime + selectedProgram.restTime) *
          selectedProgram.cycles) /
        60;

      const tempStats = {
        ...prev,
        streak: newStreak,
        totalMinutes: prev.totalMinutes + sessionMinutes,
        todayMinutes:
          (prev.lastActiveDate === today ? prev.todayMinutes : 0) +
          sessionMinutes,
        lastWorkout: today,
        lastActiveDate: today,
        history: newHistory,
        workoutsCompleted: prev.workoutsCompleted + 1,
      };

      const { newBadges } = checkBadges(tempStats);
      tempStats.unlockedBadges = newBadges;

      localStorage.setItem("kegel_stats_v4", JSON.stringify(tempStats));

      // Sync to API
      if (authSession) {
        api.addWorkoutRecord({
          workout_date: today,
          program_id: selectedProgram.id,
          program_name: selectedProgram.name,
          contract_time: selectedProgram.contractTime,
          rest_time: selectedProgram.restTime,
          cycles: selectedProgram.cycles,
          duration_minutes: sessionMinutes,
        }).catch(err => console.error('Failed to save workout:', err));

        api.updateUserStats({
          streak: tempStats.streak,
          total_minutes: tempStats.totalMinutes,
          today_minutes: tempStats.todayMinutes,
          last_workout: tempStats.lastWorkout,
          last_active_date: tempStats.lastActiveDate,
          unlocked_badges: tempStats.unlockedBadges,
          workouts_completed: tempStats.workoutsCompleted,
        }).catch(err => console.error('Failed to update stats:', err));
      }

      return tempStats;
    });
    // Advance plan progress if this was a plan workout
    if (selectedProgram.id.startsWith("plan_")) {
      advancePlanDay();
    }
  }, [selectedProgram, vibrate, playChime, authSession, advancePlanDay]);

  // Meditation Timer
  useEffect(() => {
    if (!meditationActive || meditationTimeLeft <= 0) return;
    meditationTimerRef.current = setInterval(() => {
      setMeditationTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(meditationTimerRef.current!);
          meditationTimerRef.current = null;
          setMeditationActive(false);
          playChime("start");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (meditationTimerRef.current) clearInterval(meditationTimerRef.current); };
  }, [meditationActive, meditationTimeLeft, playChime]);

  // Workout Loop
  useEffect(() => {
    if (
      currentScreen !== "workout" ||
      isPaused ||
      phase === "finished" ||
      !gender ||
      !selectedProgram
    ) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const guidance = THEMES[gender].guidance;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) {
          if (prev <= 4 && phase === "ready") playChime("tick");

          if (
            phase === "contract" &&
            prev === Math.floor(selectedProgram.contractTime / 2)
          ) {
            setGuideText(guidance.contract[1]);
          } else if (
            phase === "rest" &&
            prev === Math.floor(selectedProgram.restTime / 2)
          ) {
            setGuideText(guidance.rest[1]);
          }

          return prev - 1;
        }

        if (phase === "ready") {
          setPhase("contract");
          setGuideText(guidance.contract[0]);
          vibrate([150, 50, 150]);
          playChime("start");
          return selectedProgram.contractTime;
        } else if (phase === "contract") {
          setPhase("rest");
          setGuideText(guidance.rest[0]);
          vibrate(100);
          playChime("stop");
          return selectedProgram.restTime;
        } else if (phase === "rest") {
          if (currentCycle < selectedProgram.cycles) {
            setCurrentCycle((c) => c + 1);
            setPhase("contract");
            setGuideText(guidance.contract[0]);
            vibrate([150, 50, 150]);
            playChime("start");
            return selectedProgram.contractTime;
          } else {
            finishWorkout();
            return 0;
          }
        }
        return 0;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    currentScreen,
    isPaused,
    phase,
    currentCycle,
    selectedProgram,
    gender,
    finishWorkout,
    vibrate,
    playChime,
  ]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getLevel = (minutes: number) => {
    if (minutes < 10) return { level: 1, title: "初学觉醒", next: 10 };
    if (minutes < 60) return { level: 2, title: "渐入佳境", next: 60 };
    if (minutes < 300) return { level: 3, title: "核心掌控", next: 300 };
    return { level: 4, title: "殿堂大师", next: 1000 };
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 9)
      return { text: "晨光破晓", icon: <Coffee className="w-4 h-4" /> };
    if (hour < 12) return { text: "上午好", icon: <Sun className="w-4 h-4" /> };
    if (hour < 18) return { text: "下午好", icon: <Sun className="w-4 h-4" /> };
    return { text: "夜色温柔", icon: <Moon className="w-4 h-4" /> };
  };

  const getEncouragingMessage = () => {
    if (stats.streak > 3) return "你已经连续坚持好几天了，太棒了！继续保持！";
    if (stats.todayMinutes >= dailyGoal)
      return "今天已达成目标，离完美蜕变更近一步！";
    if (stats.todayMinutes > 0) return "今天已经开始训练，继续加油完成目标！";
    return "每天只需几分钟，坚持就是胜利！";
  };

  const generateShareImage = async () => {
    if (!shareCardRef.current) return;
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
      });
      const link = document.createElement("a");
      link.download = `kegel-record-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
    }
  };

  const handleManualCheckIn = () => {
    vibrate(50);
    const todayStr = new Date().toDateString();
    setStats((prev) => {
      let newStreak = prev.streak;
      let newHistory = [...(prev.history || [])];

      if (prev.lastWorkout !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (prev.lastWorkout === yesterday.toDateString()) {
          newStreak += 1;
        } else if (prev.lastWorkout !== todayStr) {
          newStreak = 1;
        }
        if (!newHistory.includes(todayStr)) {
          newHistory.push(todayStr);
        }
      }

      const tempStats = {
        ...prev,
        streak: newStreak,
        lastWorkout: todayStr,
        lastActiveDate: todayStr,
        history: newHistory,
      };

      const { newBadges } = checkBadges(tempStats);
      tempStats.unlockedBadges = newBadges;

      localStorage.setItem("kegel_stats_v4", JSON.stringify(tempStats));

      // Sync to API
      if (authSession) {
        api.manualCheckIn(todayStr).catch(err => console.error('Failed to checkin:', err));
        api.updateUserStats({
          streak: tempStats.streak,
          last_workout: tempStats.lastWorkout,
          last_active_date: tempStats.lastActiveDate,
          unlocked_badges: tempStats.unlockedBadges,
        }).catch(err => console.error('Failed to update stats:', err));
      }

      return tempStats;
    });
  };

  // --- Auth Handlers ---
  const handleAuthSubmit = async () => {
    setAuthError("");
    setAuthSubmitting(true);
    try {
      if (authMode === "register") {
        await api.signUp(authEmail, authPassword);
        setAuthError("注册成功！请检查邮箱确认后登录。");
        setAuthMode("login");
      } else {
        await api.signIn(authEmail, authPassword);
        // Auth state change listener will handle the rest
      }
    } catch (err: any) {
      setAuthError(err.message || "操作失败，请重试");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.signOut();
      setGender(null);
      setCurrentScreen("auth");
      setStats({
        streak: 0, totalMinutes: 0, lastWorkout: "", history: [],
        todayMinutes: 0, lastActiveDate: "", unlockedBadges: [], workoutsCompleted: 0,
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // --- Screens ---

  // Loading
  if (authLoading) {
    return (
      <div className="w-full h-[100dvh] bg-black flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full"
        />
        <p className="text-white/40 text-xs mt-4 font-sans tracking-widest">加载中...</p>
      </div>
    );
  }

  // Auth Screen
  if (currentScreen === "auth") {
    return (
      <div className="w-full h-[100dvh] bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-64 h-64 bg-rose-900/20 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, 20, 0], scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-900/20 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 z-10"
        >
          <h1 className="font-serif text-3xl font-bold text-white mb-2 tracking-widest">
            深动
          </h1>
          <p className="font-sans text-sm text-white/50">
            专业的盆底肌训练应用
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-sm z-10"
        >
          <div className="glass-panel-rose rounded-3xl p-6">
            <h2 className="font-serif text-xl font-bold text-white/90 mb-6 text-center">
              {authMode === "login" ? "欢迎回来" : "创建账户"}
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs text-white/50 font-sans mb-1 block">邮箱地址</label>
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus-within:border-white/30 transition-colors">
                  <Mail className="w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="bg-transparent text-white text-sm outline-none flex-1 font-sans placeholder:text-white/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/50 font-sans mb-1 block">密码</label>
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus-within:border-white/30 transition-colors">
                  <Lock className="w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    placeholder="至少6位密码"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAuthSubmit(); }}
                    className="bg-transparent text-white text-sm outline-none flex-1 font-sans placeholder:text-white/20"
                  />
                </div>
              </div>
            </div>

            {authError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-xs mb-4 text-center ${authError.includes("成功") ? "text-green-400" : "text-rose-400"}`}
              >
                {authError}
              </motion.p>
            )}

            <button
              onClick={handleAuthSubmit}
              disabled={authSubmitting || !authEmail || !authPassword}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(244,63,94,0.3)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {authSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  {authMode === "login" ? "登录" : "注册"}
                </>
              )}
            </button>

            <p className="text-center text-xs text-white/40 mt-4 font-sans">
              {authMode === "login" ? "还没有账户？" : "已有账户？"}
              <button
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setAuthError("");
                }}
                className="text-white/70 ml-1 underline underline-offset-2 hover:text-white transition-colors"
              >
                {authMode === "login" ? "立即注册" : "去登录"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (currentScreen === "onboarding") {
    return (
      <div className="w-full h-[100dvh] bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 z-10"
        >
          <h1 className="font-serif text-3xl font-bold text-white mb-3 tracking-widest">
            选择你的专属体验
          </h1>
          <p className="font-sans text-sm text-white/50">
            盆底肌训练对男女皆有益处，但侧重点不同
          </p>
        </motion.div>

        <div className="w-full max-w-sm flex flex-col gap-6 z-10">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onClick={() => handleGenderSelect("female")}
            className="w-full glass-panel-rose rounded-3xl p-6 flex items-center gap-6 group hover:bg-white/[0.05] transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-300 group-hover:scale-110 transition-transform">
              <User className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h2 className="font-serif text-xl font-bold text-rose-100 mb-1">
                我是女性
              </h2>
              <p className="font-sans text-xs text-rose-200/60">
                紧致提升 · 产后修复 · 日常保养
              </p>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            onClick={() => handleGenderSelect("male")}
            className="w-full glass-panel-ocean rounded-3xl p-6 flex items-center gap-6 group hover:bg-white/[0.05] transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h2 className="font-serif text-xl font-bold text-cyan-100 mb-1">
                我是男性
              </h2>
              <p className="font-sans text-xs text-cyan-200/60">
                核心掌控 · 持久强化 · 前列腺健康
              </p>
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  if (!gender) return null;
  const theme = THEMES[gender];
  const userLevel = getLevel(stats.totalMinutes);
  const greeting = getGreeting();

  if (currentScreen === "home") {
    // Generate last 7 days for the history tracker
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - 6 + i);
      return d;
    });

    // Daily Ring Progress
    const ringRadius = 45;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringProgress = Math.min(stats.todayMinutes / dailyGoal, 1);
    const ringOffset = ringCircumference - ringProgress * ringCircumference;

    return (
      <div
        className={`w-full h-[100dvh] ${theme.bgClass} flex flex-col relative overflow-hidden transition-colors duration-1000`}
      >
        {/* Atmospheric Background */}

        {/* Badge Unlock Celebration */}
        <AnimatePresence>
          {newlyUnlockedBadge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md pointer-events-none"
            >
              {/* Floating Particles */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: [theme.primaryColor, "#FCD34D", "#A78BFA", "#34D399", "#F472B6"][i % 5],
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                    y: [0, -100 - Math.random() * 200],
                    x: [-50 + Math.random() * 100],
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: Math.random() * 0.5,
                    ease: "easeOut",
                  }}
                />
              ))}

              {/* Badge Info */}
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  className="w-24 h-24 rounded-full flex items-center justify-center mb-4 border-2"
                  style={{
                    backgroundColor: `${theme.primaryColor}20`,
                    borderColor: theme.primaryColor,
                    boxShadow: `0 0 40px ${theme.primaryColor}40, 0 0 80px ${theme.primaryColor}20`,
                  }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="text-4xl">{newlyUnlockedBadge.emoji}</span>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-[10px] text-white/50 tracking-widest mb-1 uppercase"
                >
                  成就解锁
                </motion.p>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="font-serif text-xl font-bold text-white"
                >
                  {newlyUnlockedBadge.name}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-sm text-white/50 mt-1"
                >
                  {newlyUnlockedBadge.desc}
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-0 right-0 w-64 h-64 ${theme.blob1} rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none transition-colors duration-1000`}
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className={`absolute bottom-0 left-0 w-64 h-64 ${theme.blob2} rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none transition-colors duration-1000`}
        />

        {/* Header & Greeting (Headspace Style) */}
        <AnimatePresence mode="wait">
          {currentTab === "training" && (
            <motion.div
              key="training"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1 overflow-y-auto hide-scrollbar p-6 pb-24 z-10"
            >
              <div className="flex justify-between items-start mt-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-white/60 mb-1">
                    {greeting.icon}
                    <span className="font-sans text-xs tracking-widest">
                      {greeting.text}
                    </span>
                  </div>
                  <h1
                    className={`font-serif text-2xl font-bold tracking-wider ${theme.gradientClass}`}
                  >
                    {theme.title}
                  </h1>
                  <p className="font-sans text-xs text-white/50 mt-2">
                    {getEncouragingMessage()}
                  </p>
                </div>
              </div>

              {/* Apple Fitness Style Daily Ring & Duolingo Streak */}
              <div
                className={`${theme.glassClass} rounded-3xl p-6 mb-6 flex flex-col relative overflow-hidden z-10`}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col gap-4">
                    {/* Duolingo Style Streak */}
                    <div className="flex flex-col gap-1">
                      <span className="text-white/50 text-xs font-medium flex items-center gap-1.5">
                        <Flame
                          className={`w-4 h-4 ${stats.streak > 0 ? "text-orange-500 fill-orange-500" : "text-white/30"}`}
                        />
                        连续打卡
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-serif font-bold text-white/90">
                          {stats.streak}
                        </span>
                        <span className="text-sm font-sans font-normal text-white/40">
                          天
                        </span>
                      </div>
                      {/* Premium Hook: Streak Freeze */}
                      <div className="flex items-center gap-1 text-[10px] text-blue-300/70 bg-blue-900/20 px-2 py-0.5 rounded-full w-fit border border-blue-500/20">
                        <Shield className="w-3 h-3" /> 漏签保护: 0
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 mt-2">
                      <span className="text-white/50 text-xs font-medium flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-white/40" /> 累计训练
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-serif font-bold text-white/90">
                          {Math.round(stats.totalMinutes)}
                        </span>
                        <span className="text-xs font-sans font-normal text-white/40">
                          分钟
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Apple Fitness Style Ring */}
                  <div className="relative flex items-center justify-center">
                    <svg
                      width="120"
                      height="120"
                      className="transform -rotate-90"
                    >
                      {/* Background Ring */}
                      <circle
                        cx="60"
                        cy="60"
                        r={ringRadius}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="10"
                        fill="none"
                      />
                      {/* Progress Ring */}
                      <motion.circle
                        cx="60"
                        cy="60"
                        r={ringRadius}
                        stroke={theme.ringColor}
                        strokeWidth="10"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={ringCircumference}
                        initial={{ strokeDashoffset: ringCircumference }}
                        animate={{ strokeDashoffset: ringOffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{
                          filter: `drop-shadow(0 0 6px ${theme.ringColor}80)`,
                        }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <Target className="w-4 h-4 text-white/40 mb-1" />
                      <span className="text-xl font-bold text-white leading-none">
                        {Math.round(stats.todayMinutes)}
                      </span>
                      <span className="text-[10px] text-white/50 mt-1">
                        / {dailyGoal} 分钟
                      </span>
                    </div>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <button
                      onClick={() => setShowLevelModal(true)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white/80 border border-white/10 flex items-center gap-1 hover:bg-white/20 transition-colors"
                    >
                      <Crown className="w-3 h-3 text-amber-300" /> Lv.
                      {userLevel.level} {userLevel.title}
                    </button>
                    <span className="font-sans text-[10px] text-white/40">
                      距下一级还需{" "}
                      {Math.ceil(userLevel.next - stats.totalMinutes)} 分钟
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-300"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(100, (stats.totalMinutes / userLevel.next) * 100)}%`,
                      }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              </div>

              {/* Keep Style Achievement Badges */}
              <div className="mb-6 z-10">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-sans text-sm font-bold text-white/80 tracking-widest">
                    荣誉勋章
                  </h2>
                  <span className="text-[10px] text-white/40">
                    {stats.unlockedBadges.length} / {BADGES.length}
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                  {BADGES.map((badge) => {
                    const isUnlocked = stats.unlockedBadges.includes(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`flex-shrink-0 w-24 ${theme.glassClass} rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-2 ${isUnlocked ? "" : "opacity-40 grayscale"}`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${isUnlocked ? "" : "bg-white/5 text-white/30"}`}
                          style={
                            isUnlocked
                              ? {
                                backgroundColor: `${theme.primaryColor}30`,
                              }
                              : {}
                          }
                        >
                          <span className="text-xl">{badge.emoji}</span>
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-white/90 whitespace-nowrap">
                            {badge.name}
                          </div>
                          <div className="text-[9px] text-white/50 mt-0.5 leading-tight">
                            {badge.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progressive Training Plans */}
              {gender && (
                <>
                  <h2 className="font-sans text-sm font-bold text-white/80 mb-3 tracking-widest z-10 flex items-center gap-2">
                    <Target className="w-4 h-4" style={{ color: theme.primaryColor }} />
                    系统训练计划
                  </h2>
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 z-10 -mx-1 px-1">
                    {getPlansForGender(gender).map((plan) => {
                      const savedProgress = localStorage.getItem(`plan_progress_${plan.id}`);
                      const progress = savedProgress ? JSON.parse(savedProgress) : null;
                      const totalDays = plan.totalWeeks * 7;
                      const completedDays = progress?.completedDays?.length || 0;
                      const progressPct = Math.round((completedDays / totalDays) * 100);
                      return (
                        <button
                          key={plan.id}
                          onClick={() => startPlan(plan)}
                          className="flex-shrink-0 w-56 rounded-3xl p-5 flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] text-left border border-white/10"
                          style={{ background: `linear-gradient(135deg, ${plan.color}15, ${plan.color}05)` }}
                        >
                          <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-[40px] opacity-30 pointer-events-none" style={{ backgroundColor: plan.color }} />
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${plan.color}30`, color: plan.color }}>
                              <Target className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${plan.color}20`, color: plan.color }}>
                              {plan.duration}
                            </span>
                          </div>
                          <h3 className="font-serif text-sm font-bold text-white/90 mb-1">{plan.name}</h3>
                          <p className="text-[10px] text-white/50 leading-relaxed mb-3 line-clamp-2">{plan.description}</p>
                          {progress && completedDays > 0 ? (
                            <div className="mt-auto">
                              <div className="flex justify-between text-[9px] text-white/50 mb-1">
                                <span>进度</span>
                                <span>{progressPct}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, backgroundColor: plan.color }} />
                              </div>
                            </div>
                          ) : (
                            <div className="mt-auto text-[10px] font-medium" style={{ color: plan.color }}>
                              开始计划 →
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Plan Detail Modal */}
              <AnimatePresence>
                {showPlanDetail && activePlan && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
                    onClick={() => setShowPlanDetail(false)}
                  >
                    <motion.div
                      initial={{ y: 50, opacity: 0, scale: 0.95 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: 50, opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      className={`${theme.glassClass} rounded-3xl p-6 w-full max-w-md border max-h-[85vh] overflow-y-auto`}
                      style={{ borderColor: `${activePlan.color}30` }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-serif text-lg font-bold text-white/90">{activePlan.name}</h3>
                          <p className="text-xs text-white/50 mt-1">{activePlan.description}</p>
                        </div>
                        <button onClick={() => setShowPlanDetail(false)} className="p-1 text-white/50 hover:text-white">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Weeks */}
                      <div className="space-y-4 mb-6">
                        {activePlan.weeks.map((week) => {
                          const isCurrentWeek = week.weekNumber === planProgress.currentWeek;
                          const isPastWeek = week.weekNumber < planProgress.currentWeek;
                          return (
                            <div key={week.weekNumber} className={`rounded-2xl p-4 ${isCurrentWeek ? "bg-white/10 border" : "bg-white/5"}`} style={isCurrentWeek ? { borderColor: `${activePlan.color}40` } : {}}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold" style={{ color: isCurrentWeek ? activePlan.color : isPastWeek ? "#9CA3AF" : "rgba(255,255,255,0.5)" }}>
                                    第{week.weekNumber}周
                                  </span>
                                  <span className="text-xs text-white/70 font-medium">{week.title}</span>
                                </div>
                                {isPastWeek && <CheckCircle className="w-4 h-4 text-green-400" />}
                              </div>
                              <p className="text-[10px] text-white/40 mb-3">{week.description}</p>
                              <div className="flex gap-1.5">
                                {week.days.map((day) => {
                                  const dayKey = `w${week.weekNumber}d${day.dayNumber}`;
                                  const isCompleted = planProgress.completedDays.includes(dayKey);
                                  const isCurrent = isCurrentWeek && day.dayNumber === planProgress.currentDay;
                                  return (
                                    <div
                                      key={day.dayNumber}
                                      className={`flex-1 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold transition-all ${isCompleted ? "text-black" : isCurrent ? "border text-white" : day.isRestDay ? "bg-white/5 text-white/30" : "bg-white/5 text-white/40"
                                        }`}
                                      style={{
                                        backgroundColor: isCompleted ? activePlan.color : undefined,
                                        borderColor: isCurrent ? activePlan.color : undefined,
                                        color: isCurrent ? activePlan.color : undefined,
                                      }}
                                    >
                                      {day.isRestDay ? "休" : `D${day.dayNumber}`}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Today's workout info & Start button */}
                      {(() => {
                        const todayDay = getTodayPlanDay();
                        if (!todayDay) return null;
                        return todayDay.isRestDay ? (
                          <div className="text-center py-4">
                            <p className="text-white/60 text-sm mb-2">🌙 今天是休息日</p>
                            <p className="text-white/40 text-xs">{todayDay.tip}</p>
                            <button onClick={() => { advancePlanDay(); }} className="mt-4 px-6 py-2 rounded-xl bg-white/10 text-white/70 text-sm font-medium hover:bg-white/20 transition-colors">
                              跳到下一天
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-3 px-3 py-2 bg-black/30 rounded-xl">
                              <span className="text-xs text-white/50">今日训练</span>
                              <span className="text-xs text-white/80">收紧 {todayDay.contractTime}s · 放松 {todayDay.restTime}s · {todayDay.cycles}组</span>
                            </div>
                            {todayDay.tip && (
                              <p className="text-[10px] text-white/40 mb-3 px-1 italic">💡 {todayDay.tip}</p>
                            )}
                            <button
                              onClick={startPlanWorkout}
                              className="w-full py-3.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg"
                              style={{ background: `linear-gradient(135deg, ${activePlan.color}, ${activePlan.color}CC)` }}
                            >
                              开始今日训练
                            </button>
                          </div>
                        );
                      })()}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Course List */}
              <h2 className="font-sans text-sm font-bold text-white/80 mb-3 tracking-widest z-10">
                专属方案
              </h2>
              <div className="flex flex-col gap-3 pb-10 z-10">
                {theme.programs.map((program) => (
                  <button
                    key={program.id}
                    onClick={() => startWorkout(program)}
                    className={`w-full text-left ${theme.glassClass} rounded-3xl p-4 flex flex-col relative overflow-hidden group hover:bg-white/[0.06] transition-all duration-300 active:scale-[0.98]`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="p-2 rounded-full"
                          style={{
                            backgroundColor: `${program.color}20`,
                            color: program.color,
                          }}
                        >
                          {program.icon}
                        </div>
                        <h3 className="font-serif text-base font-bold text-white/90">
                          {program.name}
                        </h3>
                      </div>
                      <span className="text-[10px] font-sans font-medium px-2 py-1 rounded-full bg-white/5 text-white/60 border border-white/5">
                        {formatTime(
                          (program.contractTime + program.restTime) *
                          program.cycles,
                        )}
                      </span>
                    </div>
                    <p className="font-sans text-[11px] text-white/50 leading-relaxed mb-3">
                      {program.desc}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] font-sans text-white/40 bg-black/20 p-2 rounded-xl w-fit">
                      <span className="flex items-center gap-1">
                        <div
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: program.color }}
                        />{" "}
                        收紧 {program.contractTime}s
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-white/20" />{" "}
                        放松 {program.restTime}s
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-white/20" />{" "}
                        {program.cycles} 组
                      </span>
                    </div>
                  </button>
                ))}

                {/* Custom Pro Engine */}
                <button
                  onClick={() => setShowCustomModal(true)}
                  className={`w-full text-left ${theme.glassClass} rounded-3xl p-4 flex flex-col relative overflow-hidden group hover:bg-white/[0.06] transition-all duration-300 active:scale-[0.98] border border-amber-500/30 mt-2`}
                >
                  <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-400 to-yellow-600 text-black text-[9px] font-bold px-3 py-1 rounded-bl-xl">
                    PRO
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-amber-500/20 text-amber-400">
                        <SlidersHorizontal className="w-4 h-4" />
                      </div>
                      <h3 className="font-serif text-base font-bold text-white/90">
                        自定义引擎
                      </h3>
                    </div>
                  </div>
                  <p className="font-sans text-[11px] text-white/50 leading-relaxed">
                    解锁完全自由的训练节奏，打造最适合你当前阶段的专属方案。
                  </p>
                </button>

                {/* Meditation Card */}
                <button
                  onClick={() => {
                    setMeditationTimeLeft(meditationTime);
                    setMeditationActive(true);
                  }}
                  className={`w-full text-left ${theme.glassClass} rounded-3xl p-4 flex flex-col relative overflow-hidden group hover:bg-white/[0.06] transition-all duration-300 active:scale-[0.98] border border-purple-500/20 mt-2`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-purple-500/20 text-purple-400">
                        <Moon className="w-4 h-4" />
                      </div>
                      <h3 className="font-serif text-base font-bold text-white/90">
                        冥想放松
                      </h3>
                    </div>
                    <div className="flex gap-1">
                      {[60, 120, 180].map(t => (
                        <button
                          key={t}
                          onClick={(e) => { e.stopPropagation(); setMeditationTime(t); }}
                          className={`text-[9px] px-2 py-0.5 rounded-full transition-colors ${meditationTime === t ? "bg-purple-500/30 text-purple-300" : "bg-white/5 text-white/40"}`}
                        >
                          {t / 60}分钟
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="font-sans text-[11px] text-white/50 leading-relaxed">
                    训练后深呼吸放松，跟随4-4-6呼吸节奏，让身心回归平静。
                  </p>
                </button>
              </div>

              {/* Meditation Overlay */}
              <AnimatePresence>
                {meditationActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
                    style={{ background: "linear-gradient(180deg, #0B0B1A, #1A0B2E, #0B0B1A)" }}
                  >
                    {/* Close Button */}
                    <button
                      onClick={() => {
                        setMeditationActive(false);
                        if (meditationTimerRef.current) { clearInterval(meditationTimerRef.current); meditationTimerRef.current = null; }
                      }}
                      className="absolute top-8 right-6 p-2 rounded-full bg-white/5 text-white/50 hover:text-white z-10"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {/* Ambient Stars */}
                    {Array.from({ length: 30 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                        animate={{ opacity: [0.1, 0.6, 0.1] }}
                        transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
                      />
                    ))}

                    {/* Breathing Circle */}
                    <motion.div
                      className="w-40 h-40 rounded-full border border-purple-400/30 flex items-center justify-center mb-8"
                      animate={{
                        scale: [1, 1.5, 1.5, 1],
                        borderColor: ["rgba(192,132,252,0.3)", "rgba(192,132,252,0.6)", "rgba(192,132,252,0.6)", "rgba(192,132,252,0.3)"],
                        boxShadow: [
                          "0 0 20px rgba(192,132,252,0.1)",
                          "0 0 60px rgba(192,132,252,0.3)",
                          "0 0 60px rgba(192,132,252,0.3)",
                          "0 0 20px rgba(192,132,252,0.1)",
                        ],
                      }}
                      transition={{ duration: 14, repeat: Infinity, times: [0, 0.286, 0.571, 1], ease: "easeInOut" }}
                    >
                      <motion.span
                        className="text-sm text-purple-300/80 font-sans tracking-widest"
                        animate={{ opacity: [0.5, 1, 1, 0.5] }}
                        transition={{ duration: 14, repeat: Infinity, times: [0, 0.286, 0.571, 1] }}
                      >
                        {(() => {
                          const cycle = 14; // 4s inhale + 4s hold + 6s exhale
                          const t = (Date.now() / 1000) % cycle;
                          if (t < 4) return "吸气";
                          if (t < 8) return "屏息";
                          return "呼气";
                        })()}
                      </motion.span>
                    </motion.div>

                    {/* Timer */}
                    <span className="text-3xl font-light text-white/80 tabular-nums mb-2">
                      {Math.floor(meditationTimeLeft / 60)}:{String(meditationTimeLeft % 60).padStart(2, "0")}
                    </span>
                    <p className="text-xs text-white/30 tracking-widest">冥想放松</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {showCustomModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setShowCustomModal(false)}
                  >
                    <motion.div
                      initial={{ y: 50, opacity: 0, scale: 0.95 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: 50, opacity: 0, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 200,
                      }}
                      className={`${theme.glassClass} rounded-3xl p-6 w-full max-w-md border border-amber-500/30 max-h-[90vh] overflow-y-auto`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-serif text-xl font-bold text-white/90 flex items-center gap-2">
                          <SlidersHorizontal className="w-5 h-5 text-amber-400" />{" "}
                          自定义参数
                        </h3>
                        <button
                          onClick={() => setShowCustomModal(false)}
                          className="p-1 text-white/50 hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-6 mb-8">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/70">收紧时间 (秒)</span>
                            <span className="text-amber-400 font-bold">
                              {customSettings.contract}s
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="15"
                            value={customSettings.contract}
                            onChange={(e) =>
                              setCustomSettings({
                                ...customSettings,
                                contract: parseInt(e.target.value),
                              })
                            }
                            className="w-full accent-amber-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/70">放松时间 (秒)</span>
                            <span className="text-amber-400 font-bold">
                              {customSettings.rest}s
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="15"
                            value={customSettings.rest}
                            onChange={(e) =>
                              setCustomSettings({
                                ...customSettings,
                                rest: parseInt(e.target.value),
                              })
                            }
                            className="w-full accent-amber-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/70">循环组数</span>
                            <span className="text-amber-400 font-bold">
                              {customSettings.cycles}组
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="50"
                            value={customSettings.cycles}
                            onChange={(e) =>
                              setCustomSettings({
                                ...customSettings,
                                cycles: parseInt(e.target.value),
                              })
                            }
                            className="w-full accent-amber-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-6 px-4 py-3 bg-black/30 rounded-xl">
                        <span className="text-xs text-white/50">
                          预计总时长
                        </span>
                        <span className="text-sm font-bold text-white">
                          {formatTime(
                            (customSettings.contract + customSettings.rest) *
                            customSettings.cycles,
                          )}
                        </span>
                      </div>

                      <button
                        onClick={startCustomWorkout}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold text-sm hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                      >
                        开始专属训练
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {currentTab === "calendar" && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1 overflow-y-auto hide-scrollbar p-6 pb-24 z-10"
            >
              {/* Weekly Report Card */}
              {(() => {
                const now = new Date();
                const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Mon=1, Sun=7
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - dayOfWeek + 1);
                const weekDays = Array.from({ length: 7 }, (_, i) => {
                  const d = new Date(weekStart);
                  d.setDate(weekStart.getDate() + i);
                  return d;
                });
                const weekLabels = ["一", "二", "三", "四", "五", "六", "日"];
                const activeDaysThisWeek = weekDays.filter(d => stats.history.includes(d.toDateString())).length;
                const completionRate = Math.round((activeDaysThisWeek / 7) * 100);

                return (
                  <div className={`${theme.glassClass} rounded-3xl p-5 mb-6 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none" style={{ backgroundColor: theme.primaryColor }} />
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif text-base font-bold text-white/90 flex items-center gap-2">
                        📊 本周报告
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                        {weekStart.getMonth() + 1}月{weekStart.getDate()}日 - {weekDays[6].getMonth() + 1}月{weekDays[6].getDate()}日
                      </span>
                    </div>

                    {/* Week Activity Bar Chart */}
                    <div className="flex items-end gap-2 h-20 mb-4">
                      {weekDays.map((d, i) => {
                        const isActive = stats.history.includes(d.toDateString());
                        const isToday = d.toDateString() === now.toDateString();
                        const isFuture = d > now;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className={`w-full rounded-lg transition-all duration-500 ${isActive ? "" : isFuture ? "bg-white/5" : "bg-white/10"
                                }`}
                              style={{
                                height: isActive ? "100%" : isFuture ? "20%" : "30%",
                                backgroundColor: isActive ? theme.primaryColor : undefined,
                                boxShadow: isActive ? `0 0 10px ${theme.primaryColor}50` : undefined,
                              }}
                            />
                            <span className={`text-[9px] font-bold ${isToday ? "text-white" : "text-white/40"}`}>
                              {weekLabels[i]}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-black/20 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold text-white">{activeDaysThisWeek}<span className="text-[10px] text-white/40">/7</span></div>
                        <div className="text-[9px] text-white/40">训练天数</div>
                      </div>
                      <div className="bg-black/20 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold text-white">{stats.streak}</div>
                        <div className="text-[9px] text-white/40">连续打卡</div>
                      </div>
                      <div className="bg-black/20 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold text-white">{Math.round(stats.totalMinutes)}</div>
                        <div className="text-[9px] text-white/40">累计分钟</div>
                      </div>
                    </div>

                    {/* Encouragement */}
                    <p className="text-[10px] text-white/40 mt-3 text-center italic">
                      {completionRate >= 80 ? "🌟 本周表现太棒了！继续保持！" :
                        completionRate >= 50 ? "💪 本周进展不错，再坚持一下！" :
                          completionRate > 0 ? "🌱 良好的开始，试试每天训练吧！" :
                            "✨ 新的一周，从今天开始训练吧！"}
                    </p>
                  </div>
                );
              })()}

              <h2 className="font-serif text-2xl font-bold text-white/90 mb-6">
                打卡日历
              </h2>
              <div className={`${theme.glassClass} rounded-3xl p-6 mb-6`}>
                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={() =>
                      setCalendarDate(
                        (prev) =>
                          new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                      )
                    }
                    className="p-2 rounded-full bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="font-sans font-bold text-white/90">
                    {calendarDate.getFullYear()}年{calendarDate.getMonth() + 1}
                    月
                  </span>
                  <button
                    onClick={() =>
                      setCalendarDate(
                        (prev) =>
                          new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                      )
                    }
                    className="p-2 rounded-full bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                  {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
                    <span
                      key={day}
                      className="text-[10px] text-white/40 font-medium"
                    >
                      {day}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({
                    length: new Date(
                      calendarDate.getFullYear(),
                      calendarDate.getMonth(),
                      1,
                    ).getDay(),
                  }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {Array.from({
                    length: new Date(
                      calendarDate.getFullYear(),
                      calendarDate.getMonth() + 1,
                      0,
                    ).getDate(),
                  }).map((_, i) => {
                    const day = i + 1;
                    const isToday =
                      day === new Date().getDate() &&
                      calendarDate.getMonth() === new Date().getMonth() &&
                      calendarDate.getFullYear() === new Date().getFullYear();
                    const dateStr = new Date(
                      calendarDate.getFullYear(),
                      calendarDate.getMonth(),
                      day,
                    ).toDateString();
                    const isActive = stats.history.includes(dateStr);

                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-all
                        ${isActive ? `bg-[${theme.primaryColor}] text-black shadow-[0_0_10px_${theme.primaryColor}80]` : "text-white/60 hover:bg-white/5"}
                        ${isToday && !isActive ? "border border-white/20" : ""}
                      `}
                        style={
                          isActive
                            ? { backgroundColor: theme.primaryColor }
                            : {}
                        }
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>

                {!stats.history.includes(new Date().toDateString()) &&
                  calendarDate.getMonth() === new Date().getMonth() &&
                  calendarDate.getFullYear() === new Date().getFullYear() && (
                    <button
                      onClick={handleManualCheckIn}
                      className="w-full mt-4 py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors border border-white/10 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> 手动打卡今日
                    </button>
                  )}
              </div>

              <h3 className="font-serif text-lg font-bold text-white/90 mb-4">
                最近活动
              </h3>
              <div className="flex flex-col gap-3">
                {stats.history
                  .slice(-5)
                  .reverse()
                  .map((dateStr, i) => {
                    const d = new Date(dateStr);
                    const isToday =
                      d.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={i}
                        className={`${theme.glassClass} rounded-2xl p-4 flex justify-between items-center`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center`}
                            style={{
                              color: theme.primaryColor,
                              backgroundColor: `${theme.primaryColor}30`,
                            }}
                          >
                            <Activity className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-white/90 text-sm">
                              {isToday
                                ? "今天"
                                : `${d.getMonth() + 1}月${d.getDate()}日`}
                            </div>
                            <div className="text-[10px] text-white/50">
                              完成训练
                            </div>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    );
                  })}
                {stats.history.length === 0 && (
                  <div className="text-center text-white/40 text-xs py-4">
                    暂无训练记录，今天就开始吧！
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1 overflow-y-auto hide-scrollbar p-6 pb-24 z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-2xl font-bold text-white/90">
                  我的主页
                </h2>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors flex items-center gap-2 px-4"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs font-bold">炫耀一下</span>
                </button>
              </div>

              <div
                className={`${theme.glassClass} rounded-3xl p-6 mb-6 flex items-center gap-4`}
              >
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white/50">
                  <UserCircle className="w-10 h-10" />
                </div>
                <div className="flex-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        autoFocus
                        maxLength={10}
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="bg-black/30 text-white px-2 py-1 rounded outline-none w-32 font-serif text-lg"
                        onBlur={() => {
                          if (tempName.trim()) {
                            setUserName(tempName.trim());
                            localStorage.setItem(
                              "kegel_username",
                              tempName.trim(),
                            );
                            if (authSession) {
                              api.updateUserProfile({ user_name: tempName.trim() }).catch(err => console.error('Failed to save username:', err));
                            }
                          }
                          setIsEditingName(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (tempName.trim()) {
                              setUserName(tempName.trim());
                              localStorage.setItem(
                                "kegel_username",
                                tempName.trim(),
                              );
                              if (authSession) {
                                api.updateUserProfile({ user_name: tempName.trim() }).catch(err => console.error('Failed to save username:', err));
                              }
                            }
                            setIsEditingName(false);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-2 mb-1 cursor-pointer group w-fit"
                      onClick={() => {
                        setTempName(userName);
                        setIsEditingName(true);
                      }}
                    >
                      <h3 className="font-serif text-lg font-bold text-white/90">
                        {userName}
                      </h3>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 text-[10px] bg-white/10 px-1.5 py-0.5 rounded">
                        点击修改
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setShowLevelModal(true)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white/80 border border-white/10 flex items-center gap-1 w-fit hover:bg-white/20 transition-colors"
                  >
                    <Crown className="w-3 h-3 text-amber-300" /> Lv.
                    {userLevel.level} {userLevel.title}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div
                  className={`${theme.glassClass} rounded-2xl p-4 flex flex-col items-center justify-center text-center`}
                >
                  <span className="text-2xl font-serif font-bold text-white/90 mb-1">
                    {stats.workoutsCompleted}
                  </span>
                  <span className="text-[10px] text-white/50">
                    完成训练(次)
                  </span>
                </div>
                <div
                  className={`${theme.glassClass} rounded-2xl p-4 flex flex-col items-center justify-center text-center`}
                >
                  <span className="text-2xl font-serif font-bold text-white/90 mb-1">
                    {Math.round(stats.totalMinutes)}
                  </span>
                  <span className="text-[10px] text-white/50">
                    累计时长(分)
                  </span>
                </div>
              </div>

              <h3 className="font-sans text-sm font-bold text-white/80 mb-3 tracking-widest">
                设置
              </h3>
              {/* Knowledge Cards */}
              {gender && (
                <div className="mb-6">
                  <h3 className="font-serif text-lg font-bold text-white/90 mb-4 flex items-center gap-2">
                    📚 健康知识
                  </h3>
                  {getCategories(gender).map((category) => (
                    <div key={category} className="mb-4">
                      <p className="text-[10px] text-white/40 font-bold tracking-widest mb-2 uppercase">{category}</p>
                      <div className="flex flex-col gap-2">
                        {getCardsForGender(gender).filter(c => c.category === category).map((card) => (
                          <div key={card.id} className={`${theme.glassClass} rounded-2xl overflow-hidden transition-all duration-300`}>
                            <button
                              onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                              className="w-full text-left p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{card.icon}</span>
                                <span className="font-sans text-sm text-white/80 font-medium">{card.title}</span>
                              </div>
                              <ChevronRight className={`w-4 h-4 text-white/30 transition-transform duration-300 ${expandedCard === card.id ? "rotate-90" : ""}`} />
                            </button>
                            <AnimatePresence>
                              {expandedCard === card.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: "easeInOut" }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-4 pt-1 space-y-2 border-t border-white/5">
                                    {card.content.map((text, i) => (
                                      <p key={i} className="text-xs text-white/60 leading-relaxed pl-8">
                                        {text}
                                      </p>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Settings */}
              <div
                className={`${theme.glassClass} rounded-3xl p-2 flex flex-col mb-6`}
              >
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <div className="flex items-center gap-3 text-white/80">
                    <Volume2 className="w-5 h-5 text-white/40" />
                    <span className="font-sans text-sm">轻柔提示音</span>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? "bg-white/30" : "bg-white/10"}`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${soundEnabled ? "translate-x-6.5" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <div className="flex items-center gap-3 text-white/80">
                    <Vibrate className="w-5 h-5 text-white/40" />
                    <div className="flex flex-col">
                      <span className="font-sans text-sm">触觉反馈</span>
                      <span className="font-sans text-[10px] text-white/40">
                        推荐开启，支持息屏盲练
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setHapticsEnabled(!hapticsEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${hapticsEnabled ? "bg-white/30" : "bg-white/10"}`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${hapticsEnabled ? "translate-x-6.5" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <div className="flex items-center gap-3 text-white/80">
                    <Target className="w-5 h-5 text-white/40" />
                    <span className="font-sans text-sm">每日目标 (分钟)</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={dailyGoal}
                    onChange={(e) =>
                      setDailyGoal(parseInt(e.target.value) || 5)
                    }
                    className="bg-transparent text-white/80 font-sans text-sm outline-none w-12 text-right"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <div className="flex items-center gap-3 text-white/80">
                    <Bell className="w-5 h-5 text-white/40" />
                    <span className="font-sans text-sm">每日提醒</span>
                  </div>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="bg-transparent text-white/80 font-sans text-sm outline-none cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => {
                    setGender(null);
                    setCurrentScreen("onboarding");
                  }}
                  className="w-full text-left p-4 flex items-center gap-3 text-white/80 hover:bg-white/5 transition-colors rounded-xl border-b border-white/5"
                >
                  <User className="w-5 h-5 text-white/40" />
                  <span className="font-sans text-sm">重新选择性别偏好</span>
                </button>

                <a
                  href="/privacy.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left p-4 flex items-center gap-3 text-white/80 hover:bg-white/5 transition-colors rounded-xl border-b border-white/5"
                >
                  <Shield className="w-5 h-5 text-white/40" />
                  <span className="font-sans text-sm">隐私政策</span>
                  <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
                </a>

                <button
                  onClick={handleLogout}
                  className="w-full text-left p-4 flex items-center gap-3 text-rose-400 hover:bg-rose-500/10 transition-colors rounded-xl"
                >
                  <LogOut className="w-5 h-5 text-rose-400/60" />
                  <span className="font-sans text-sm">退出登录</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/40 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6 z-40">
          <button
            onClick={() => setCurrentTab("training")}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentTab === "training" ? `text-[${theme.primaryColor}]` : "text-white/40 hover:text-white/60"}`}
            style={
              currentTab === "training" ? { color: theme.primaryColor } : {}
            }
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium">训练</span>
          </button>
          <button
            onClick={() => setCurrentTab("calendar")}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentTab === "calendar" ? `text-[${theme.primaryColor}]` : "text-white/40 hover:text-white/60"}`}
            style={
              currentTab === "calendar" ? { color: theme.primaryColor } : {}
            }
          >
            <CalendarDays className="w-6 h-6" />
            <span className="text-[10px] font-medium">日历</span>
          </button>
          <button
            onClick={() => setCurrentTab("profile")}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentTab === "profile" ? `text-[${theme.primaryColor}]` : "text-white/40 hover:text-white/60"}`}
            style={
              currentTab === "profile" ? { color: theme.primaryColor } : {}
            }
          >
            <UserCircle className="w-6 h-6" />
            <span className="text-[10px] font-medium">我的</span>
          </button>
        </div>

        {/* Level System Modal */}
        <AnimatePresence>
          {showLevelModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setShowLevelModal(false)}
            >
              <motion.div
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={`${theme.glassClass} rounded-3xl p-6 w-full max-w-md border border-amber-500/30 max-h-[90vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-serif text-xl font-bold text-white/90 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" /> 等级体系
                  </h3>
                  <button
                    onClick={() => setShowLevelModal(false)}
                    className="p-1 text-white/50 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  {[
                    { l: 1, t: "初学觉醒", m: 0 },
                    { l: 2, t: "渐入佳境", m: 10 },
                    { l: 3, t: "核心掌控", m: 60 },
                    { l: 4, t: "殿堂大师", m: 300 },
                  ].map((lvl) => {
                    const isCurrent = userLevel.level === lvl.l;
                    const isReached = stats.totalMinutes >= lvl.m;
                    return (
                      <div
                        key={lvl.l}
                        className={`p-4 rounded-2xl flex items-center justify-between ${isCurrent ? "bg-amber-500/20 border border-amber-500/30" : "bg-white/5"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isReached ? "bg-amber-500 text-black" : "bg-white/10 text-white/40"}`}
                          >
                            {lvl.l}
                          </div>
                          <span
                            className={`font-bold ${isReached ? "text-white" : "text-white/40"}`}
                          >
                            {lvl.t}
                          </span>
                        </div>
                        <span className="text-[10px] text-white/40">
                          {lvl.m} 分钟
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-6"
              onClick={() => setShowShareModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-sm flex flex-col gap-6"
                onClick={(e) => e.stopPropagation()}
              >
                {/* The Card to Capture */}
                <div
                  ref={shareCardRef}
                  className={`w-full aspect-[4/5] ${theme.bgClass} rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-2xl border border-white/10`}
                >
                  {/* Background Blobs */}
                  <div
                    className={`absolute top-0 right-0 w-64 h-64 ${theme.blob1} rounded-full blur-[80px] -mr-20 -mt-20`}
                  />
                  <div
                    className={`absolute bottom-0 left-0 w-64 h-64 ${theme.blob2} rounded-full blur-[80px] -ml-20 -mb-20`}
                  />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-auto">
                      <div>
                        <h2
                          className={`font-serif text-2xl font-bold tracking-wider ${theme.gradientClass}`}
                        >
                          {theme.title}
                        </h2>
                        <p className="font-sans text-xs text-white/50 mt-1">
                          我的专属训练记录
                        </p>
                      </div>
                      <Crown className="w-8 h-8 text-amber-400 opacity-80" />
                    </div>

                    <div className="flex flex-col gap-6 my-auto">
                      <div className="flex items-end gap-3">
                        <span className="text-6xl font-serif font-bold text-white">
                          {Math.round(stats.totalMinutes)}
                        </span>
                        <span className="text-sm font-sans text-white/50 mb-2">
                          累计分钟
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="text-xs text-white/50">
                              连续打卡
                            </span>
                          </div>
                          <span className="text-2xl font-bold text-white">
                            {stats.streak}{" "}
                            <span className="text-xs font-normal text-white/50">
                              天
                            </span>
                          </span>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs text-white/50">
                              解锁勋章
                            </span>
                          </div>
                          <span className="text-2xl font-bold text-white">
                            {stats.unlockedBadges.length}{" "}
                            <span className="text-xs font-normal text-white/50">
                              个
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-white/70" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white/90">
                            Lv.{userLevel.level} {userLevel.title}
                          </span>
                          <span className="text-[9px] text-white/40">
                            超越了{" "}
                            {Math.min(
                              99,
                              50 + stats.totalMinutes * 0.1,
                            ).toFixed(1)}
                            % 的用户
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-serif text-[10px] font-bold text-white/60 tracking-widest">
                          {userName.toUpperCase()}
                        </span>
                        <span className="font-sans text-[8px] text-white/30">
                          每日一练 遇见更好的自己
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={generateShareImage}
                    className="flex-1 py-4 rounded-2xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                    <Download className="w-5 h-5" /> 保存炫耀图
                  </button>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- Workout Screen ---
  return (
    <div
      className={`w-full h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-1000 ${discreetMode ? "bg-black" : theme.bgClass}`}
    >
      {/* Discreet Mode Overlay */}
      <AnimatePresence>
        {discreetMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black"
          >
            <button
              onClick={() => setDiscreetMode(false)}
              className="p-6 rounded-full bg-white/5 text-white/20 hover:text-white/50 transition-colors flex flex-col items-center gap-3"
            >
              <Lock className="w-8 h-8" />
              <span className="text-xs font-sans tracking-widest">
                点击退出息屏模式
              </span>
            </button>
            <p className="absolute bottom-12 text-[10px] text-white/20 font-sans">
              闭上眼睛，跟随震动节奏呼吸
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <button
          onClick={() => setCurrentScreen("home")}
          className="p-2 rounded-full bg-white/5 text-white/60"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-sans text-xs font-medium tracking-widest text-white/40 uppercase">
          {Math.min(currentCycle, selectedProgram?.cycles || 0)} / {selectedProgram?.cycles}
        </span>
        <button
          onClick={() => setDiscreetMode(true)}
          className="p-2 rounded-full bg-white/5 text-white/60"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>

      {/* Main Visualizer */}
      <div className={`relative flex items-center justify-center z-10 ${phase === "finished" ? "w-full max-w-md px-6" : "w-80 h-80"}`}>
        {phase !== "finished" && selectedProgram ? (
          <>
            {/* Organic Glowing Blob */}
            <motion.div
              className="absolute organic-blob blur-xl opacity-30 mix-blend-screen"
              style={{ backgroundColor: selectedProgram.glowColor }}
              animate={{
                width: phase === "contract" ? "120px" : "280px",
                height: phase === "contract" ? "120px" : "280px",
                opacity: phase === "contract" ? 0.8 : 0.2,
              }}
              transition={{
                duration:
                  phase === "contract"
                    ? selectedProgram.contractTime
                    : selectedProgram.restTime,
                ease: "easeInOut",
              }}
            />

            {/* Inner Core Blob */}
            <motion.div
              className="absolute organic-blob"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${selectedProgram.color}, transparent)`,
                boxShadow: `inset 0 0 20px ${selectedProgram.glowColor}`,
              }}
              animate={{
                width: phase === "contract" ? "100px" : "200px",
                height: phase === "contract" ? "100px" : "200px",
                opacity: phase === "contract" ? 1 : 0.4,
              }}
              transition={{
                duration:
                  phase === "contract"
                    ? selectedProgram.contractTime
                    : selectedProgram.restTime,
                ease: "easeInOut",
              }}
            />

            {/* Breathing Guide Ring */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                border: `2px dashed ${selectedProgram.color}40`,
              }}
              animate={{
                width: phase === "contract" ? "240px" : "160px",
                height: phase === "contract" ? "240px" : "160px",
                opacity: phase === "ready" ? 0 : [0.3, 0.7, 0.3],
                rotate: 360,
              }}
              transition={{
                width: {
                  duration: phase === "contract" ? selectedProgram.contractTime : selectedProgram.restTime,
                  ease: "easeInOut",
                },
                height: {
                  duration: phase === "contract" ? selectedProgram.contractTime : selectedProgram.restTime,
                  ease: "easeInOut",
                },
                opacity: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            />

            {/* Text Overlay */}
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="font-serif text-3xl font-bold tracking-widest text-white mb-1 drop-shadow-md">
                {phase === "ready"
                  ? "准备"
                  : phase === "contract"
                    ? "收紧"
                    : "放松"}
              </span>
              <span className="font-sans text-4xl font-light text-white/90 tabular-nums drop-shadow-md">
                {timeLeft}
              </span>
              {/* Breathing text cue */}
              {phase !== "ready" && (
                <motion.span
                  key={phase}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-sans text-[11px] mt-2 tracking-wider"
                  style={{ color: `${selectedProgram.color}99` }}
                >
                  {phase === "contract" ? "吸气 ↑" : "呼气 ↓"}
                </motion.span>
              )}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-white/80" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-white/90 mb-2 whitespace-nowrap">
              训练完成
            </h2>
            <p className="font-sans text-sm text-white/50 mb-8 whitespace-nowrap">
              感谢你今天为自己腾出时间
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentScreen("home")}
                className="px-8 py-3 rounded-full bg-white/10 text-white font-sans font-medium text-sm hover:bg-white/20 transition-colors"
              >
                返回首页
              </button>
              <button
                onClick={() => {
                  setCurrentScreen("home");
                  setCurrentTab("profile");
                  setShowShareModal(true);
                }}
                className="px-8 py-3 rounded-full bg-white text-black font-sans font-medium text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" /> 炫耀一下
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Guidance Text & Controls */}
      {phase !== "finished" && selectedProgram && (
        <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center z-20">
          <AnimatePresence mode="wait">
            <motion.p
              key={guideText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="font-sans text-sm text-white/70 h-8 mb-8 text-center px-8"
            >
              {guideText}
            </motion.p>
          </AnimatePresence>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`${theme.glassClass} w-16 h-16 rounded-full flex items-center justify-center text-white/90 hover:bg-white/10 transition-all active:scale-95`}
          >
            {isPaused ? (
              <Play className="w-6 h-6 fill-current ml-1" />
            ) : (
              <Pause className="w-6 h-6 fill-current" />
            )}
          </button>
          <p className="font-sans text-[10px] text-white/30 mt-6 tracking-widest flex items-center gap-1">
            {selectedProgram.isPro && (
              <Crown className="w-3 h-3 text-amber-400" />
            )}{" "}
            {selectedProgram.name}
          </p>
        </div>
      )}
    </div>
  );
}
