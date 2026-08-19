import type {
  FeedbackLanguage,
  TopikWritingLevel,
  TopikWritingLevelConfig,
  TopikWritingTaskType,
} from "@/types/topik-writing";

/**
 * TOPIK II Writing (쓰기) requirements per level. TOPIK Writing only exists
 * for TOPIK II (Levels 3-6) — TOPIK I has no Writing section at all, so no
 * entries exist for Levels 1-2. Task types and point values follow the real
 * TOPIK II Writing exam structure: Q51/Q52 short-answer (10 pts each), Q53
 * data-description (30 pts), Q54 essay (50 pts) — 100 points total. Lower
 * levels (3-4) draw only from short-answer/data-description; higher levels
 * (5-6) add the full essay task.
 *
 * `taskType`/`expectedStructure` labels below describe the exercise in the
 * app's UI language (en/ru/kz) — only `samplePrompts[].*` (and `dataText`)
 * is actual Korean exam content, which is never translated. Every prompt
 * here is original, written for this app — never copied from a real
 * official TOPIK test. Each level has a small pool so a learner doesn't see
 * the same topic every session — see lib/topik/writing-rotation.ts.
 */
export const TOPIK_WRITING_LEVEL_ORDER: TopikWritingLevel[] = ["3", "4", "5", "6"];

export const TOPIK_TASK_TYPE_LABELS: Record<TopikWritingTaskType, Record<FeedbackLanguage, string>> = {
  "short-answer": {
    en: "Short practical writing (complete the note)",
    ru: "Короткое практическое письмо (дополните записку)",
    kz: "Қысқа практикалық жазба (жазбаны толықтырыңыз)",
  },
  "data-description": {
    en: "Data description",
    ru: "Описание данных",
    kz: "Деректерді сипаттау",
  },
  essay: {
    en: "Opinion essay",
    ru: "Эссе-мнение",
    kz: "Пікір эссесі",
  },
};

export const TOPIK_TASK_TYPE_STRUCTURE: Record<TopikWritingTaskType, Record<FeedbackLanguage, string[]>> = {
  "short-answer": {
    en: [
      "Read the given context carefully",
      "Write natural, complete sentences that fill the missing parts",
      "Match the formal register of the surrounding text",
    ],
    ru: [
      "Внимательно прочитайте заданный контекст",
      "Напишите естественные, законченные предложения для пропущенных частей",
      "Соблюдайте официальный стиль окружающего текста",
    ],
    kz: [
      "Берілген мәтінді мұқият оқыңыз",
      "Жетіспейтін бөліктерге табиғи, толық сөйлемдер жазыңыз",
      "Қоршаған мәтіннің ресми регистрін сақтаңыз",
    ],
  },
  "data-description": {
    en: [
      "Opening sentence introducing what the data shows",
      "Description of the key trend(s) or comparison(s) in the data",
      "A brief closing sentence noting the overall pattern",
    ],
    ru: [
      "Вводное предложение о том, что показывают данные",
      "Описание ключевых тенденций или сравнений в данных",
      "Краткое заключительное предложение об общей закономерности",
    ],
    kz: [
      "Деректер нені көрсететінін таныстыратын кіріспе сөйлем",
      "Деректердегі негізгі үрдістерді немесе салыстыруларды сипаттау",
      "Жалпы заңдылықты атап өтетін қысқа қорытынды сөйлем",
    ],
  },
  essay: {
    en: [
      "Introduction presenting the topic and your position",
      "Body with 2–3 supporting arguments, each with an example",
      "Conclusion summarizing your opinion",
    ],
    ru: [
      "Введение с темой и вашей позицией",
      "Основная часть с 2–3 аргументами, каждый с примером",
      "Заключение с кратким изложением вашего мнения",
    ],
    kz: [
      "Тақырып пен ұстанымыңызды таныстыратын кіріспе",
      "Әрқайсысы мысалмен расталған 2–3 дәлелі бар негізгі бөлім",
      "Пікіріңізді қорытындылайтын қорытынды",
    ],
  },
};

export const TOPIK_WRITING_LEVELS: Record<TopikWritingLevel, TopikWritingLevelConfig> = {
  "3": {
    level: "3",
    label: "3급 · 초급 완성",
    taskTypes: ["short-answer", "data-description"],
    evaluationCriteria: [
      "Completes the given practical context with natural, grammatical sentences",
      "Uses the formal 격식체 register consistently (-습니다/-ㅂ니다)",
      "Accurately reports the figures/trends shown in the data",
      "Basic sentence structure with everyday vocabulary",
    ],
    samplePrompts: [
      {
        id: "l3-sa-memo",
        title: "사무실 안내문 완성하기",
        taskType: "short-answer",
        topikTask: "TOPIK II 쓰기 · 51번 유형",
        instructions:
          "다음은 회사 게시판에 붙은 안내문입니다. ( ㄱ )과 ( ㄴ )에 들어갈 문장을 포함하여, 안내문 전체를 자연스럽게 완성하십시오.\n\n[안내문]\n다음 주 월요일부터 사무실 청소가 있습니다. ( ㄱ ). 청소에 참여하실 분은 이름과 시간을 이 종이에 적어 주십시오. 궁금한 점이 있으면 관리실로 연락해 주십시오. ( ㄴ ).",
        dataText: null,
        minChars: 40,
        maxChars: 90,
      },
      {
        id: "l3-sa-message",
        title: "문자 메시지 완성하기",
        taskType: "short-answer",
        topikTask: "TOPIK II 쓰기 · 52번 유형",
        instructions:
          "다음은 친구에게 보내는 문자 메시지입니다. ( ㄱ )과 ( ㄴ )에 들어갈 내용을 포함하여, 메시지 전체를 자연스럽게 완성하십시오.\n\n[문자 메시지]\n오늘 저녁에 만나기로 한 약속을 지키기 어려울 것 같아요. ( ㄱ ). 대신 내일 만나도 될까요? ( ㄴ ).",
        dataText: null,
        minChars: 40,
        maxChars: 90,
      },
      {
        id: "l3-dd-online-shopping",
        title: "온라인 쇼핑 이용률 변화",
        taskType: "data-description",
        topikTask: "TOPIK II 쓰기 · 53번 유형",
        instructions:
          "다음은 온라인 쇼핑 이용률 조사 결과입니다. 이 자료를 보고 온라인 쇼핑 이용률의 변화에 대해 200~300자로 설명하십시오.",
        dataText:
          "[온라인 쇼핑 이용률 조사]\n2010년: 25%\n2015년: 48%\n2020년: 72%\n※ 20~30대 이용률이 가장 높음\n※ 주요 이용 이유: 가격 비교가 쉬움, 시간을 아낄 수 있음",
        minChars: 200,
        maxChars: 300,
      },
      {
        id: "l3-dd-reading-habit",
        title: "독서 시간 변화",
        taskType: "data-description",
        topikTask: "TOPIK II 쓰기 · 53번 유형",
        instructions:
          "다음은 성인의 하루 평균 독서 시간에 대한 조사 결과입니다. 이 자료를 보고 독서 시간의 변화에 대해 200~300자로 설명하십시오.",
        dataText:
          "[하루 평균 독서 시간 조사]\n2005년: 45분\n2015년: 28분\n2023년: 15분\n※ 감소 원인: 스마트폰 이용 시간 증가, 영상 콘텐츠 선호",
        minChars: 200,
        maxChars: 300,
      },
    ],
  },
  "4": {
    level: "4",
    label: "4급 · 중급",
    taskTypes: ["short-answer", "data-description"],
    evaluationCriteria: [
      "Completes the given practical context with natural, precise sentences",
      "Uses the formal 격식체 register consistently, with appropriate connectors",
      "Accurately compares and interprets the figures/trends shown in the data",
      "Intermediate vocabulary with correct particle and tense usage",
    ],
    samplePrompts: [
      {
        id: "l4-sa-apology",
        title: "사과 이메일 완성하기",
        taskType: "short-answer",
        topikTask: "TOPIK II 쓰기 · 51번 유형",
        instructions:
          "다음은 거래처에 보내는 사과 이메일입니다. ( ㄱ )과 ( ㄴ )에 들어갈 문장을 포함하여, 이메일 전체를 자연스럽게 완성하십시오.\n\n[이메일]\n안녕하십니까. 지난주에 보내드리기로 한 자료가 늦어진 점에 대해 사과드립니다. ( ㄱ ). 자료는 이번 주 금요일까지 반드시 보내드리겠습니다. ( ㄴ ).",
        dataText: null,
        minChars: 60,
        maxChars: 120,
      },
      {
        id: "l4-sa-request",
        title: "휴가 신청서 완성하기",
        taskType: "short-answer",
        topikTask: "TOPIK II 쓰기 · 52번 유형",
        instructions:
          "다음은 회사에 제출하는 휴가 신청 메모입니다. ( ㄱ )과 ( ㄴ )에 들어갈 내용을 포함하여, 메모 전체를 자연스럽게 완성하십시오.\n\n[메모]\n다음 달에 개인 사정으로 휴가를 신청하고자 합니다. ( ㄱ ). 휴가 기간 동안 제 업무는 김민수 씨가 대신 맡아 주기로 했습니다. ( ㄴ ).",
        dataText: null,
        minChars: 60,
        maxChars: 120,
      },
      {
        id: "l4-dd-commute",
        title: "출퇴근 수단 변화",
        taskType: "data-description",
        topikTask: "TOPIK II 쓰기 · 53번 유형",
        instructions:
          "다음은 도시 직장인의 출퇴근 수단 변화에 대한 조사 결과입니다. 이 자료를 보고 출퇴근 수단의 변화와 그 원인에 대해 200~300자로 설명하십시오.",
        dataText:
          "[출퇴근 수단 조사]\n자가용: 2015년 55% → 2023년 38%\n대중교통: 2015년 35% → 2023년 47%\n자전거·도보: 2015년 10% → 2023년 15%\n※ 원인: 대중교통 요금 지원 확대, 환경 문제에 대한 관심 증가",
        minChars: 200,
        maxChars: 300,
      },
      {
        id: "l4-dd-remote-work",
        title: "재택근무 실시 현황",
        taskType: "data-description",
        topikTask: "TOPIK II 쓰기 · 53번 유형",
        instructions:
          "다음은 기업의 재택근무 실시 현황에 대한 조사 결과입니다. 이 자료를 보고 재택근무 실시 비율의 변화와 장단점에 대해 200~300자로 설명하십시오.",
        dataText:
          "[재택근무 실시 기업 비율]\n2019년: 8%\n2021년: 42%\n2023년: 27%\n※ 장점: 출퇴근 시간 절약, 업무 집중도 향상\n※ 단점: 의사소통 어려움, 협업 감소",
        minChars: 200,
        maxChars: 300,
      },
    ],
  },
  "5": {
    level: "5",
    label: "5급 · 중고급",
    taskTypes: ["short-answer", "data-description", "essay"],
    evaluationCriteria: [
      "Task completion and respect of the requested format/length across all task types",
      "Clear organization with a coherent introduction, body, and conclusion for the essay",
      "Varied connectors and precise, level-appropriate vocabulary",
      "Consistent formal register and accurate grammar across complex sentences",
    ],
    samplePrompts: [
      {
        id: "l5-sa-complaint",
        title: "환불 요청 이메일 완성하기",
        taskType: "short-answer",
        topikTask: "TOPIK II 쓰기 · 51번 유형",
        instructions:
          "다음은 온라인 쇼핑몰에 보내는 환불 요청 이메일입니다. ( ㄱ )과 ( ㄴ )에 들어갈 문장을 포함하여, 이메일 전체를 자연스럽게 완성하십시오.\n\n[이메일]\n지난주에 주문한 제품을 받았는데 사진과 실제 제품이 달랐습니다. ( ㄱ ). 번거로우시더라도 빠른 시일 내에 환불 절차를 안내해 주시기 바랍니다. ( ㄴ ).",
        dataText: null,
        minChars: 60,
        maxChars: 130,
      },
      {
        id: "l5-dd-population",
        title: "1인 가구 비율 변화",
        taskType: "data-description",
        topikTask: "TOPIK II 쓰기 · 53번 유형",
        instructions:
          "다음은 전체 가구 중 1인 가구가 차지하는 비율에 대한 조사 결과입니다. 이 자료를 보고 1인 가구 비율의 변화와 원인에 대해 200~300자로 설명하십시오.",
        dataText:
          "[1인 가구 비율 조사]\n2000년: 15%\n2010년: 24%\n2023년: 34%\n※ 원인: 결혼 연령 상승, 고령 인구 증가, 개인주의 가치관 확산",
        minChars: 200,
        maxChars: 300,
      },
      {
        id: "l5-essay-social-media",
        title: "소셜 미디어와 인간관계",
        taskType: "essay",
        topikTask: "TOPIK II 쓰기 · 54번 유형",
        instructions:
          "소셜 미디어가 사람들 사이의 관계를 더 가깝게 만든다고 생각하는 사람이 있는 반면, 오히려 사람들을 더 외롭게 만든다고 생각하는 사람도 있습니다. 소셜 미디어가 인간관계에 미치는 영향에 대한 자신의 생각을 근거를 들어 600~700자로 쓰십시오.",
        dataText: null,
        minChars: 600,
        maxChars: 700,
      },
      {
        id: "l5-essay-lifelong-learning",
        title: "평생 교육의 필요성",
        taskType: "essay",
        topikTask: "TOPIK II 쓰기 · 54번 유형",
        instructions:
          "최근 나이와 상관없이 새로운 것을 배우는 평생 교육에 대한 관심이 높아지고 있습니다. 평생 교육이 개인과 사회에 필요한 이유는 무엇이며, 이를 활성화하기 위한 방법은 무엇인지 자신의 생각을 600~700자로 쓰십시오.",
        dataText: null,
        minChars: 600,
        maxChars: 700,
      },
    ],
  },
  "6": {
    level: "6",
    label: "6급 · 고급",
    taskTypes: ["short-answer", "data-description", "essay"],
    evaluationCriteria: [
      "Task completion with precise, nuanced handling of the requested format",
      "Sophisticated organization with clear thesis, counterpoints, and synthesis in the essay",
      "Precise, varied, and idiomatic vocabulary appropriate to formal written Korean",
      "Accurate use of complex sentence structures and consistent formal register",
    ],
    samplePrompts: [
      {
        id: "l6-sa-proposal",
        title: "회의 제안 메모 완성하기",
        taskType: "short-answer",
        topikTask: "TOPIK II 쓰기 · 51번 유형",
        instructions:
          "다음은 부서 전체에 보내는 회의 제안 메모입니다. ( ㄱ )과 ( ㄴ )에 들어갈 문장을 포함하여, 메모 전체를 자연스럽게 완성하십시오.\n\n[메모]\n최근 프로젝트 진행 과정에서 부서 간 의사소통에 어려움이 있었습니다. ( ㄱ ). 이번 주 목요일 오후 2시에 관련 부서 담당자들이 모여 개선 방안을 논의하고자 합니다. ( ㄴ ).",
        dataText: null,
        minChars: 60,
        maxChars: 130,
      },
      {
        id: "l6-dd-energy",
        title: "재생 에너지 발전 비율 변화",
        taskType: "data-description",
        topikTask: "TOPIK II 쓰기 · 53번 유형",
        instructions:
          "다음은 국가 전체 발전량 중 재생 에너지가 차지하는 비율에 대한 조사 결과입니다. 이 자료를 보고 재생 에너지 비율의 변화와 전망에 대해 200~300자로 설명하십시오.",
        dataText:
          "[재생 에너지 발전 비율]\n2010년: 3%\n2018년: 9%\n2023년: 21%\n※ 전망: 2030년까지 35% 도달 목표\n※ 배경: 정부 지원 확대, 기술 발전에 따른 발전 단가 하락",
        minChars: 200,
        maxChars: 300,
      },
      {
        id: "l6-essay-ai-work",
        title: "인공지능과 일자리",
        taskType: "essay",
        topikTask: "TOPIK II 쓰기 · 54번 유형",
        instructions:
          "인공지능 기술의 발전은 여러 산업 분야에서 일자리 구조를 크게 변화시키고 있습니다. 인공지능이 가져올 기회와 위험은 무엇이며, 이에 대해 개인과 사회는 어떻게 대응해야 하는지 자신의 생각을 근거를 들어 600~700자로 쓰십시오.",
        dataText: null,
        minChars: 600,
        maxChars: 700,
      },
      {
        id: "l6-essay-urban-rural",
        title: "도시 집중 현상과 지역 균형 발전",
        taskType: "essay",
        topikTask: "TOPIK II 쓰기 · 54번 유형",
        instructions:
          "인구와 산업이 대도시로 집중되면서 지역 간 불균형 문제가 심화되고 있습니다. 이러한 도시 집중 현상의 원인은 무엇이며, 지역 균형 발전을 위해 어떤 노력이 필요한지 자신의 생각을 근거를 들어 600~700자로 쓰십시오.",
        dataText: null,
        minChars: 600,
        maxChars: 700,
      },
      {
        id: "l6-essay-tradition-change",
        title: "전통과 사회 변화",
        taskType: "essay",
        topikTask: "TOPIK II 쓰기 · 54번 유형",
        instructions:
          "사회가 빠르게 변화하면서 전통적인 가치와 새로운 가치가 충돌하는 경우가 늘고 있습니다. 전통을 지키는 것과 변화를 받아들이는 것 중 무엇이 더 중요하다고 생각하는지 근거를 들어 600~700자로 쓰십시오.",
        dataText: null,
        minChars: 600,
        maxChars: 700,
      },
    ],
  },
};
