// Progressive Training Plans Data
// Structured multi-week plans that gradually increase difficulty

export interface PlanDay {
    dayNumber: number;
    contractTime: number;
    restTime: number;
    cycles: number;
    isRestDay?: boolean;
    tip?: string;
}

export interface PlanWeek {
    weekNumber: number;
    title: string;
    description: string;
    days: PlanDay[];
}

export interface TrainingPlan {
    id: string;
    name: string;
    description: string;
    duration: string; // e.g., "4 weeks"
    totalWeeks: number;
    difficulty: "beginner" | "intermediate" | "advanced";
    targetGender: "all" | "female" | "male";
    color: string;
    weeks: PlanWeek[];
}

// Helper to generate 7 days with rest on day 7
function generateWeek(
    weekNum: number,
    title: string,
    desc: string,
    contract: number,
    rest: number,
    cycles: number,
    tips?: string[]
): PlanWeek {
    const days: PlanDay[] = [];
    for (let d = 1; d <= 7; d++) {
        if (d === 7) {
            days.push({ dayNumber: d, contractTime: 0, restTime: 0, cycles: 0, isRestDay: true, tip: "今天好好休息，让肌肉恢复。" });
        } else {
            days.push({
                dayNumber: d,
                contractTime: contract,
                restTime: rest,
                cycles: cycles,
                tip: tips ? tips[(d - 1) % tips.length] : undefined,
            });
        }
    }
    return { weekNumber: weekNum, title, description: desc, days };
}

export const TRAINING_PLANS: TrainingPlan[] = [
    // ====== 4-Week Beginner Plan ======
    {
        id: "beginner_4w",
        name: "新手入门 · 4周筑基",
        description: "从零开始，循序渐进建立盆底肌意识和基础力量。每周6天训练+1天休息。",
        duration: "4周",
        totalWeeks: 4,
        difficulty: "beginner",
        targetGender: "all",
        color: "#34D399",
        weeks: [
            generateWeek(1, "唤醒感知", "找到盆底肌的感觉，建立基本收缩意识", 2, 4, 6, [
                "专注感受收缩的位置",
                "确保大腿和臀部放松",
                "自然呼吸，不要憋气",
                "想象向上提拉的感觉",
                "每次收紧都要完全放松",
                "训练后拉伸一下身体",
            ]),
            generateWeek(2, "稳定基础", "延长收紧时间，加强控制力", 3, 4, 8, [
                "这周增加了组数和时长",
                "保持呼吸节奏稳定",
                "感受收紧力度的变化",
                "如感到疲劳可稍休息",
                "坐着、站着、躺着都可以练",
                "记得训练后喝水",
            ]),
            generateWeek(3, "力量提升", "进一步增加难度，提升耐力", 4, 4, 10, [
                "你已经进步很多了！",
                "尝试更深层的收缩",
                "保持发力精准",
                "如果感觉太累，回到上周强度",
                "慢慢感受肌肉的力量增长",
                "好的习惯正在形成",
            ]),
            generateWeek(4, "巩固成果", "全面提升，为下一阶段打好基础", 5, 4, 12, [
                "最后一周，加油！",
                "感受一个月来的进步",
                "技巧越来越娴熟了",
                "这个强度以后可以作为日常训练",
                "完成计划后试试进阶方案",
                "恭喜你坚持到这里！",
            ]),
        ],
    },

    // ====== 8-Week Advanced Plan ======
    {
        id: "advanced_8w",
        name: "进阶提升 · 8周蜕变",
        description: "适合有基础的用户，系统性强化盆底肌力量与耐力。挑战更高强度。",
        duration: "8周",
        totalWeeks: 8,
        difficulty: "intermediate",
        targetGender: "all",
        color: "#818CF8",
        weeks: [
            generateWeek(1, "热身适应", "恢复训练节奏，准备迎接挑战", 4, 4, 10),
            generateWeek(2, "强度爬升", "逐步增加收缩时间", 5, 4, 10),
            generateWeek(3, "耐力突破", "增加组数，提升肌肉耐力", 5, 3, 12),
            generateWeek(4, "中期检验", "维持强度，巩固前三周成果", 5, 3, 12),
            generateWeek(5, "精准控制", "增强控制力，缩短放松时间", 6, 3, 12),
            generateWeek(6, "高强度期", "挑战更长的收紧时间", 7, 4, 12),
            generateWeek(7, "极限挑战", "最高强度训练周", 8, 4, 15),
            generateWeek(8, "王者巩固", "回到舒适强度，享受成果", 6, 4, 12),
        ],
    },

    // ====== Female: Postpartum Recovery ======
    {
        id: "postpartum_6w",
        name: "产后修复 · 6周温柔计划",
        description: "专为产后妈妈设计，温和渐进恢复盆底肌功能。加长放松时间，安全有效。",
        duration: "6周",
        totalWeeks: 6,
        difficulty: "beginner",
        targetGender: "female",
        color: "#F9A8D4",
        weeks: [
            generateWeek(1, "轻柔唤醒", "用最轻的力量重新找到盆底肌", 2, 6, 5, [
                "不要着急，慢慢来",
                "如有不适请立即停止",
                "只用很轻很轻的力量",
                "配合深呼吸",
                "躺着练习最舒服",
                "每天几分钟就够了",
            ]),
            generateWeek(2, "温和恢复", "稍微延长收紧时间", 3, 6, 6),
            generateWeek(3, "逐步加强", "增加组数，缓慢提升强度", 3, 5, 8),
            generateWeek(4, "稳步提升", "建立稳定的训练节奏", 4, 5, 8),
            generateWeek(5, "力量重建", "感受明显的力量回归", 4, 4, 10),
            generateWeek(6, "自信绽放", "恢复到正常训练水平", 5, 4, 10),
        ],
    },
];

// Get plans filtered by gender
export function getPlansForGender(gender: "female" | "male"): TrainingPlan[] {
    return TRAINING_PLANS.filter(
        (p) => p.targetGender === "all" || p.targetGender === gender
    );
}
