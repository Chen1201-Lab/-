// Education Content - Knowledge Cards about Pelvic Floor Health

export interface KnowledgeCard {
    id: string;
    category: string;
    title: string;
    content: string[];
    icon: string; // emoji
    targetGender: "all" | "female" | "male";
}

export const KNOWLEDGE_CARDS: KnowledgeCard[] = [
    // === Basics ===
    {
        id: "what_is_pf",
        category: "基础知识",
        title: "什么是盆底肌？",
        content: [
            "盆底肌是位于骨盆底部的一组肌肉，像一张吊床一样支撑着膀胱、子宫（女性）/前列腺（男性）和直肠。",
            "它们控制着排尿、排便和性功能。就像身体其他肌肉一样，盆底肌也可以通过锻炼来增强。",
            "凯格尔运动（盆底肌训练）是最有效的锻炼方式之一，是1948年由Arnold Kegel博士发明的。",
        ],
        icon: "🧬",
        targetGender: "all",
    },
    {
        id: "find_muscle",
        category: "基础知识",
        title: "如何找到盆底肌？",
        content: [
            "方法一：尝试在排尿过程中中断尿流，感受收紧的肌肉就是盆底肌。注意：仅用于定位，不要经常这样练习。",
            "方法二：想象阻止排气的感觉，收紧肛门周围的肌肉。",
            "方法三：将手指放在会阴处（肛门和生殖器之间），收紧时应该能感到肌肉向上收缩。",
            "⚠️ 常见错误：如果你的腹部、臀部或大腿在用力，说明发力位置不对，只收紧盆底就好。",
        ],
        icon: "🎯",
        targetGender: "all",
    },
    {
        id: "correct_form",
        category: "基础知识",
        title: "正确的训练姿势",
        content: [
            "初学者建议平躺练习，双膝弯曲，这个姿势最容易找到盆底肌。",
            "熟练后可以坐着、站着甚至走路时练习。",
            "全程保持自然呼吸，不要憋气。可以配合呼吸节奏：吸气时收紧，呼气时放松。",
            "每次收紧后都要完全放松，放松和收紧同样重要。",
        ],
        icon: "📐",
        targetGender: "all",
    },

    // === Benefits ===
    {
        id: "benefits_female",
        category: "训练益处",
        title: "女性训练好处",
        content: [
            "改善尿失禁：增强控尿能力，减少咳嗽、打喷嚏时的尿渗漏。",
            "产后恢复：帮助恢复因怀孕和分娩而拉伸松弛的盆底肌。",
            "预防子宫脱垂：强健的盆底肌能更好地支撑盆腔器官。",
            "提升性生活质量：增强敏感度和控制力，更容易达到高潮。",
            "延缓衰老松弛：定期训练可预防随年龄增长的盆底功能下降。",
        ],
        icon: "🌸",
        targetGender: "female",
    },
    {
        id: "benefits_male",
        category: "训练益处",
        title: "男性训练好处",
        content: [
            "改善勃起功能：强健的盆底肌有助于维持更坚挺的勃起。",
            "延长持久力：增强PC肌控制力，帮助延迟射精。",
            "预防尿失禁：特别是前列腺手术后的恢复训练。",
            "增强排尿控制：减少尿频、尿急症状。",
            "核心力量提升：盆底肌是核心力量的基础，有助于整体运动表现。",
        ],
        icon: "💪",
        targetGender: "male",
    },

    // === Common Questions ===
    {
        id: "frequency",
        category: "常见问题",
        title: "每天练多少次合适？",
        content: [
            "建议每天训练2-3次，每次5-10分钟。",
            "初学者可以从每天1次开始，逐渐增加频率。",
            "不需要每天都高强度训练，和健身一样，肌肉需要休息恢复。",
            "坚持比强度更重要！每天几分钟的规律训练，效果远好于偶尔的长时间训练。",
        ],
        icon: "⏰",
        targetGender: "all",
    },
    {
        id: "results_when",
        category: "常见问题",
        title: "多久能看到效果？",
        content: [
            "大多数人在坚持4-6周后开始感受到明显变化。",
            "3个月的坚持训练通常能带来显著改善。",
            "像任何运动一样，效果因人而异，但几乎每个人都能从中受益。",
            "建议至少坚持12周再评估效果，盆底肌的强化是一个渐进的过程。",
        ],
        icon: "📈",
        targetGender: "all",
    },
    {
        id: "avoid_mistakes",
        category: "常见问题",
        title: "常见训练错误",
        content: [
            "❌ 憋气训练：应该自然呼吸，憋气会增加腹压，起反作用。",
            "❌ 过度训练：肌肉疲劳时停下来，不要勉强。每天不超过3次。",
            "❌ 只收不放：放松和收紧同样重要。每次收紧后请完全放松。",
            "❌ 错误发力：腹部、臀部和大腿不应该紧绷。只有盆底在运动。",
            "❌ 排尿时练习：长期这样做可能导致排尿不完全。仅用于初次定位。",
        ],
        icon: "⚠️",
        targetGender: "all",
    },

    // === Advanced ===
    {
        id: "types_of_exercise",
        category: "进阶知识",
        title: "快速收缩 vs 持续收缩",
        content: [
            "持续收缩（慢缩）：收紧5-10秒再放松，锻炼肌肉耐力。适合日常维持和预防漏尿。",
            "快速收缩（快缩）：快速收紧1-2秒立即放松，提升肌肉反应速度。适合应对咳嗽、打喷嚏的突发情况。",
            "完整的训练应该同时包含这两种类型。本App的训练方案已经针对性地设计了不同的收紧时间。",
        ],
        icon: "⚡",
        targetGender: "all",
    },
    {
        id: "lifestyle_tips",
        category: "进阶知识",
        title: "日常生活中的盆底保护",
        content: [
            "避免长时间憋尿，定时排尿，减少膀胱压力。",
            "保持健康体重，过重会增加盆底负担。",
            "提重物前先收紧盆底肌，保护肌肉不受损。",
            "避免便秘，多吃高纤维食物，减少用力排便对盆底的压力。",
            "戒烟——长期咳嗽是盆底肌损伤的常见原因之一。",
        ],
        icon: "🏠",
        targetGender: "all",
    },
];

export function getCardsForGender(gender: "female" | "male"): KnowledgeCard[] {
    return KNOWLEDGE_CARDS.filter(
        (c) => c.targetGender === "all" || c.targetGender === gender
    );
}

export function getCategories(gender: "female" | "male"): string[] {
    const cards = getCardsForGender(gender);
    return [...new Set(cards.map((c) => c.category))];
}
