import type { TopikWordOfTheDay } from "@/types/topik-vocabulary";
import type { TopikLevel } from "@/types/topik";
import type { FeedbackLanguage } from "@/types/writing-evaluation";

/** One word bank per TOPIK level (1-6) — entirely separate content from
 * DELF's WORD_BANKS in lib/mock/word-of-the-day.ts, never shared or mixed.
 * `getTopikWordOfTheDay` picks a deterministic entry per calendar day, so
 * it's stable all day and changes automatically at midnight with no
 * caching required — same scheme as the DELF version. */
const TOPIK_WORD_BANKS: Record<TopikLevel, TopikWordOfTheDay[]> = {
  "1": [
    {
      id: "topik_wotd_1_1",
      word: "안녕하세요",
      romanization: "annyeonghaseyo",
      partOfSpeech: "expression",
      icon: "📖",
      definition: {
        en: "Hello — the standard polite greeting used when meeting someone.",
        ru: "Здравствуйте — стандартное вежливое приветствие при встрече с кем-либо.",
        kz: "Сәлеметсіз бе — біреумен кездескенде қолданылатын стандартты сыпайы сәлемдесу.",
      },
      goodContexts: {
        en: ["Greeting someone you're meeting for the first time", "Starting a polite conversation with a stranger or elder"],
        ru: ["Приветствие человека, с которым вы встречаетесь впервые", "Начало вежливого разговора с незнакомцем или старшим"],
        kz: ["Алғаш рет кездесіп отырған адаммен сәлемдесу", "Бейтаныс адаммен немесе үлкен кісімен сыпайы әңгіме бастау"],
      },
      badContexts: {
        en: ["Saying goodbye when leaving", "Very casual speech between close friends (use '안녕' instead)"],
        ru: ["Прощание при уходе", "Очень непринуждённая речь между близкими друзьями (используйте «안녕»)"],
        kz: ["Кетіп бара жатқанда қоштасу", "Жақын достар арасындағы өте еркін сөйлеу («안녕» қолданыңыз)"],
      },
      exampleSentences: ["선생님, 안녕하세요.", "안녕하세요, 처음 뵙겠습니다."],
    },
    {
      id: "topik_wotd_1_2",
      word: "감사합니다",
      romanization: "gamsahamnida",
      partOfSpeech: "expression",
      icon: "📖",
      definition: {
        en: "Thank you — the polite, formal way to express gratitude.",
        ru: "Спасибо — вежливая, формальная форма выражения благодарности.",
        kz: "Рақмет — алғысты білдірудің сыпайы, ресми тәсілі.",
      },
      goodContexts: {
        en: ["Thanking someone older or in a formal setting", "Ending a polite request or transaction"],
        ru: ["Благодарность старшему человеку или в формальной обстановке", "Завершение вежливой просьбы или сделки"],
        kz: ["Үлкен адамға немесе ресми жағдайда алғыс білдіру", "Сыпайы өтінішті немесе мәмілені аяқтау"],
      },
      badContexts: {
        en: ["Very casual thanks among close friends (use '고마워' instead)", "As a greeting when arriving somewhere"],
        ru: ["Очень непринуждённая благодарность среди близких друзей (используйте «고마워»)", "Как приветствие при прибытии куда-либо"],
        kz: ["Жақын достар арасындағы өте еркін алғыс («고마워» қолданыңыз)", "Бір жерге келгенде сәлемдесу ретінде"],
      },
      exampleSentences: ["도와주셔서 감사합니다.", "정말 감사합니다."],
    },
    {
      id: "topik_wotd_1_3",
      word: "이름",
      romanization: "ireum",
      partOfSpeech: "noun",
      icon: "📖",
      definition: {
        en: "Name — a person's given or full name.",
        ru: "Имя — данное или полное имя человека.",
        kz: "Есім — адамның аты немесе толық аты-жөні.",
      },
      goodContexts: {
        en: ["Asking or telling someone's name", "Filling out a form with personal information"],
        ru: ["Спросить или назвать чьё-то имя", "Заполнение формы с личной информацией"],
        kz: ["Біреудің атын сұрау немесе айту", "Жеке ақпаратты көрсететін нысанды толтыру"],
      },
      badContexts: {
        en: ["Talking about the name of an abstract concept like an emotion", "Referring to a company's brand slogan"],
        ru: ["Разговор о названии абстрактного понятия, например, чувства", "Упоминание слогана бренда компании"],
        kz: ["Эмоция сияқты дерексіз ұғымның атауы туралы айту", "Компанияның брендтік ұранын атау"],
      },
      exampleSentences: ["제 이름은 민수예요.", "이름이 뭐예요?"],
    },
    {
      id: "topik_wotd_1_4",
      word: "학교",
      romanization: "hakgyo",
      partOfSpeech: "noun",
      icon: "📖",
      definition: {
        en: "School — a place where students go to study.",
        ru: "Школа — место, куда ходят учиться.",
        kz: "Мектеп — оқушылар оқитын орын.",
      },
      goodContexts: {
        en: ["Talking about your daily routine", "Describing where you study or work as a teacher"],
        ru: ["Разговор о повседневном распорядке", "Описание места учёбы или работы учителем"],
        kz: ["Күнделікті тәртіп туралы айту", "Оқитын немесе мұғалім болып жұмыс істейтін жерді сипаттау"],
      },
      badContexts: {
        en: ["Referring to a university specifically (prefer '대학교')", "Talking about an online-only course with no physical building"],
        ru: ["Обозначение именно университета (лучше «대학교»)", "Разговор об исключительно онлайн-курсе без здания"],
        kz: ["Нақты университетті білдіру («대학교» дұрысырақ)", "Ғимараты жоқ, тек онлайн курс туралы айту"],
      },
      exampleSentences: ["저는 매일 학교에 가요.", "학교가 집에서 가까워요."],
    },
    {
      id: "topik_wotd_1_5",
      word: "먹다",
      romanization: "meokda",
      partOfSpeech: "verb",
      icon: "📖",
      definition: {
        en: "To eat — the basic verb for consuming food.",
        ru: "Есть — базовый глагол для приёма пищи.",
        kz: "Тамақтану/жеу — тамақ ішудің негізгі етістігі.",
      },
      goodContexts: {
        en: ["Talking about meals or food", "Describing a daily habit involving food"],
        ru: ["Разговор о еде или приёмах пищи", "Описание повседневной привычки, связанной с едой"],
        kz: ["Тамақ немесе астар туралы айту", "Тамаққа қатысты күнделікті әдетті сипаттау"],
      },
      badContexts: {
        en: ["Talking about drinking liquids (use '마시다' instead)", "Describing consuming something inedible, like a car or a book"],
        ru: ["Разговор об употреблении напитков (используйте «마시다»)", "Описание поедания несъедобного, например, машины или книги"],
        kz: ["Сұйықтық ішу туралы айту («마시다» қолданыңыз)", "Автокөлік немесе кітап сияқты жарамсыз затты жеу"],
      },
      exampleSentences: ["저는 아침에 밥을 먹어요.", "친구와 같이 점심을 먹었어요."],
    },
  ],
  "2": [
    {
      id: "topik_wotd_2_1",
      word: "좋아하다",
      romanization: "joahada",
      partOfSpeech: "verb",
      icon: "📖",
      definition: {
        en: "To like — expressing a positive preference for something or someone.",
        ru: "Нравиться — выражение положительного отношения к чему-либо или кому-либо.",
        kz: "Ұнату — бір нәрсеге немесе біреуге оң көзқарасты білдіру.",
      },
      goodContexts: {
        en: ["Talking about hobbies or preferences", "Describing what food, music, or activity you enjoy"],
        ru: ["Разговор об увлечениях или предпочтениях", "Описание того, какая еда, музыка или занятие вам нравится"],
        kz: ["Хоббилер немесе талғам туралы айту", "Қандай тамақ, музыка немесе іс-әрекет ұнайтынын сипаттау"],
      },
      badContexts: {
        en: ["Expressing a strong romantic love (prefer '사랑하다')", "Talking about a one-time accidental event"],
        ru: ["Выражение сильной романтической любви (лучше «사랑하다»)", "Разговор о случайном единичном событии"],
        kz: ["Күшті романтикалық сүйіспеншілікті білдіру («사랑하다» дұрысырақ)", "Кездейсоқ бір реттік оқиға туралы айту"],
      },
      exampleSentences: ["저는 커피를 좋아해요.", "동생은 축구를 좋아해요."],
    },
    {
      id: "topik_wotd_2_2",
      word: "그리고",
      romanization: "geurigo",
      partOfSpeech: "conjunction",
      icon: "📖",
      definition: {
        en: "And; and then — connects two related ideas or sequential actions.",
        ru: "И; а потом — связывает две связанные идеи или последовательные действия.",
        kz: "Және; содан кейін — екі байланысты ойды немесе кезекті әрекеттерді жалғайды.",
      },
      goodContexts: {
        en: ["Listing several items in a row", "Connecting two separate sentences about related events"],
        ru: ["Перечисление нескольких пунктов подряд", "Соединение двух отдельных предложений о связанных событиях"],
        kz: ["Бірнеше затты қатарынан тізу", "Байланысты оқиғалар туралы екі бөлек сөйлемді жалғау"],
      },
      badContexts: {
        en: ["Introducing a strong contrast (use '하지만' instead)", "As the very first word with no prior sentence"],
        ru: ["Введение сильного противопоставления (используйте «하지만»)", "Как самое первое слово без предыдущего предложения"],
        kz: ["Күшті қарама-қайшылықты енгізу («하지만» қолданыңыз)", "Алдыңғы сөйлемсіз ең бірінші сөз ретінде"],
      },
      exampleSentences: ["저는 밥을 먹었어요. 그리고 커피를 마셨어요.", "숙제를 하고 그리고 텔레비전을 봤어요."],
    },
    {
      id: "topik_wotd_2_3",
      word: "오늘",
      romanization: "oneul",
      partOfSpeech: "noun",
      icon: "📖",
      definition: {
        en: "Today — refers to the current calendar day.",
        ru: "Сегодня — обозначает текущий календарный день.",
        kz: "Бүгін — қазіргі күнтізбелік күнді білдіреді.",
      },
      goodContexts: {
        en: ["Talking about the plans or weather for the current day", "Comparing today with yesterday or tomorrow"],
        ru: ["Разговор о планах или погоде на текущий день", "Сравнение сегодняшнего дня со вчерашним или завтрашним"],
        kz: ["Қазіргі күнге жоспарлар немесе ауа райы туралы айту", "Бүгінгі күнді кешегімен немесе ертеңгімен салыстыру"],
      },
      badContexts: {
        en: ["Talking about a specific date far in the future", "Describing an event that already happened last week"],
        ru: ["Разговор о конкретной дате в далёком будущем", "Описание события, произошедшего на прошлой неделе"],
        kz: ["Алыс болашақтағы нақты күн туралы айту", "Өткен аптада болған оқиғаны сипаттау"],
      },
      exampleSentences: ["오늘 날씨가 좋아요.", "오늘 뭐 할 거예요?"],
    },
    {
      id: "topik_wotd_2_4",
      word: "친구",
      romanization: "chingu",
      partOfSpeech: "noun",
      icon: "📖",
      definition: {
        en: "Friend — a person you know well and like spending time with.",
        ru: "Друг — человек, которого вы хорошо знаете и с которым любите проводить время.",
        kz: "Дос — жақсы білетін және бірге уақыт өткізуді ұнататын адам.",
      },
      goodContexts: {
        en: ["Talking about people in your social life", "Describing who you did an activity with"],
        ru: ["Разговор о людях в вашей социальной жизни", "Описание, с кем вы занимались какой-то деятельностью"],
        kz: ["Әлеуметтік өміріңіздегі адамдар туралы айту", "Кіммен бірге әрекет жасағаныңызды сипаттау"],
      },
      badContexts: {
        en: ["Referring to a family member (use '가족' instead)", "Talking about a stranger you just met once"],
        ru: ["Обозначение члена семьи (используйте «가족»)", "Разговор о незнакомце, которого встретили один раз"],
        kz: ["Отбасы мүшесін білдіру («가족» қолданыңыз)", "Бір рет қана кездескен бейтаныс адам туралы айту"],
      },
      exampleSentences: ["저는 친구와 영화를 봤어요.", "제 친구는 정말 친절해요."],
    },
    {
      id: "topik_wotd_2_5",
      word: "바쁘다",
      romanization: "bappeuda",
      partOfSpeech: "adjective",
      icon: "📖",
      definition: {
        en: "To be busy — having a lot to do, with little free time.",
        ru: "Быть занятым — иметь много дел и мало свободного времени.",
        kz: "Бос емес/жұмысы көп болу — істейтін ісі көп, бос уақыты аз болу.",
      },
      goodContexts: {
        en: ["Explaining why you can't meet someone", "Describing a hectic week at work or school"],
        ru: ["Объяснение, почему вы не можете встретиться", "Описание напряжённой недели на работе или в школе"],
        kz: ["Неге біреумен кездесе алмайтыныңызды түсіндіру", "Жұмыстағы немесе мектептегі шиеленісті аптаны сипаттау"],
      },
      badContexts: {
        en: ["Describing a completely empty, relaxed schedule", "Talking about an object being physically heavy"],
        ru: ["Описание совершенно пустого, спокойного расписания", "Разговор о физической тяжести предмета"],
        kz: ["Мүлдем бос, тыныш кестені сипаттау", "Заттың физикалық ауыр екенін айту"],
      },
      exampleSentences: ["요즘 회사 일이 바빠요.", "저는 이번 주에 너무 바빠요."],
    },
  ],
  "3": [
    {
      id: "topik_wotd_3_1",
      word: "그런데",
      romanization: "geureonde",
      partOfSpeech: "conjunction",
      icon: "📖",
      definition: {
        en: "But; by the way — introduces a contrast or a shift to a new but related topic.",
        ru: "Но; кстати — вводит противопоставление или переход к новой, но связанной теме.",
        kz: "Бірақ; айтпақшы — қарама-қайшылықты немесе жаңа, бірақ байланысты тақырыпқа көшуді енгізеді.",
      },
      goodContexts: {
        en: ["Softly changing the subject in conversation", "Contrasting a new fact with what was just said"],
        ru: ["Мягкая смена темы в разговоре", "Противопоставление нового факта только что сказанному"],
        kz: ["Әңгімеде тақырыпты жұмсақ ауыстыру", "Жаңа факт пен жаңа айтылған нәрсені салыстыру"],
      },
      badContexts: {
        en: ["Very formal written essays (prefer '하지만')", "Agreeing with and simply repeating the previous point"],
        ru: ["Очень формальные письменные эссе (лучше «하지만»)", "Согласие и простое повторение предыдущего тезиса"],
        kz: ["Өте ресми жазбаша эссе («하지만» дұрысырақ)", "Алдыңғы пікірмен келісіп, оны қайталау"],
      },
      exampleSentences: ["오늘 날씨가 좋아요. 그런데 좀 추워요.", "그런데 이 문제는 어떻게 해결해요?"],
    },
    {
      id: "topik_wotd_3_2",
      word: "익숙하다",
      romanization: "iksukhada",
      partOfSpeech: "adjective",
      icon: "📖",
      definition: {
        en: "To be familiar with; used to — describes something that no longer feels new or difficult.",
        ru: "Быть привычным; привыкнуть — описывает то, что больше не кажется новым или трудным.",
        kz: "Таныс болу; үйрену — бұрынғыдай жаңа немесе қиын болып көрінбейтін нәрсені сипаттайды.",
      },
      goodContexts: {
        en: ["Describing adjustment to a new environment over time", "Talking about a skill that became routine with practice"],
        ru: ["Описание постепенного привыкания к новой обстановке", "Разговор о навыке, ставшем привычным благодаря практике"],
        kz: ["Уақыт өте жаңа ортаға бейімделуді сипаттау", "Жаттығу арқылы дағдыға айналған дағды туралы айту"],
      },
      badContexts: {
        en: ["Describing your very first encounter with something brand-new", "Talking about a sudden, one-time surprise"],
        ru: ["Описание самой первой встречи с чем-то совершенно новым", "Разговор о внезапном, разовом сюрпризе"],
        kz: ["Мүлдем жаңа нәрсемен алғаш кездесуді сипаттау", "Кенеттен болған бір реттік тосын оқиға туралы айту"],
      },
      exampleSentences: ["이제 서울 생활이 익숙해요.", "저는 매운 음식에 익숙해요."],
    },
    {
      id: "topik_wotd_3_3",
      word: "경험",
      romanization: "gyeongheom",
      partOfSpeech: "noun",
      icon: "📖",
      definition: {
        en: "Experience — knowledge or skill gained from doing or seeing something.",
        ru: "Опыт — знания или навыки, полученные благодаря действию или наблюдению.",
        kz: "Тәжірибе — бір нәрсені жасау немесе көру арқылы алынған білім не дағды.",
      },
      goodContexts: {
        en: ["Talking about a job interview or past work history", "Reflecting on what you learned from a past event"],
        ru: ["Разговор о собеседовании на работу или трудовой истории", "Размышление о том, чему вы научились из прошлого события"],
        kz: ["Жұмысқа сұхбат немесе бұрынғы еңбек тарихы туралы айту", "Өткен оқиғадан не үйренгеніңіз туралы ой қорыту"],
      },
      badContexts: {
        en: ["Talking about a purely hypothetical future event", "Describing a physical object's material"],
        ru: ["Разговор о чисто гипотетическом будущем событии", "Описание материала физического предмета"],
        kz: ["Таза болжамды болашақ оқиға туралы айту", "Заттың материалын сипаттау"],
      },
      exampleSentences: ["저는 외국에서 일한 경험이 있어요.", "그 경험 덕분에 많이 배웠어요."],
    },
    {
      id: "topik_wotd_3_4",
      word: "활동",
      romanization: "hwaldong",
      partOfSpeech: "noun",
      icon: "📖",
      definition: {
        en: "Activity — an organized action or set of actions done for a purpose.",
        ru: "Деятельность; активность — организованное действие или ряд действий с определённой целью.",
        kz: "Іс-әрекет — белгілі бір мақсатпен жасалатын ұйымдастырылған әрекет.",
      },
      goodContexts: {
        en: ["Describing club or volunteer participation", "Talking about physical exercise or outdoor pursuits"],
        ru: ["Описание участия в клубе или волонтёрстве", "Разговор о физических упражнениях или занятиях на улице"],
        kz: ["Үйірмеге немесе еріктілер қозғалысына қатысуды сипаттау", "Дене жаттығулары немесе далада болу туралы айту"],
      },
      badContexts: {
        en: ["Describing complete physical stillness or rest", "Talking about a single passive thought with no action"],
        ru: ["Описание полной физической неподвижности или отдыха", "Разговор об одной пассивной мысли без действия"],
        kz: ["Толық дене тыныштығын немесе демалысты сипаттау", "Әрекетсіз бір пассив ойды айту"],
      },
      exampleSentences: ["저는 봉사 활동에 참여했어요.", "학교에서 다양한 동아리 활동을 해요."],
    },
    {
      id: "topik_wotd_3_5",
      word: "노력하다",
      romanization: "noryeokhada",
      partOfSpeech: "verb",
      icon: "📖",
      definition: {
        en: "To make an effort; to try hard — putting sustained work toward a goal.",
        ru: "Стараться; прилагать усилия — вкладывать постоянные усилия для достижения цели.",
        kz: "Тырысу; күш салу — мақсатқа жету үшін тұрақты еңбек ету.",
      },
      goodContexts: {
        en: ["Describing working hard toward a personal goal", "Encouraging someone to keep trying despite difficulty"],
        ru: ["Описание усердной работы для достижения личной цели", "Поддержка кого-то, чтобы он продолжал стараться, несмотря на трудности"],
        kz: ["Жеке мақсатқа жету үшін қажымай еңбек етуді сипаттау", "Қиындыққа қарамастан біреуді тырысуға шақыру"],
      },
      badContexts: {
        en: ["Describing something achieved with zero effort by luck alone", "Talking about a completely passive, automatic process"],
        ru: ["Описание чего-то достигнутого без усилий, чисто по удаче", "Разговор о полностью пассивном, автоматическом процессе"],
        kz: ["Тек сәттіліктің арқасында ешбір күшсіз қол жеткен нәрсені сипаттау", "Толық пассивті, автоматты процесс туралы айту"],
      },
      exampleSentences: ["저는 한국어를 잘하려고 노력해요.", "그는 목표를 이루기 위해 계속 노력했어요."],
    },
  ],
  "4": [
    {
      id: "topik_wotd_4_1",
      word: "반면에",
      romanization: "banmyeone",
      partOfSpeech: "adverb",
      icon: "📖",
      definition: {
        en: "On the other hand — introduces a contrasting fact, often balancing two sides of an issue.",
        ru: "С другой стороны — вводит противопоставленный факт, часто уравновешивая две стороны вопроса.",
        kz: "Ал, керісінше — мәселенің екі жағын теңестіре отырып, қарама-қайшы фактіні енгізеді.",
      },
      goodContexts: {
        en: ["Balancing an advantage against a disadvantage in the same paragraph", "Formal writing that compares two groups or situations"],
        ru: ["Уравновешивание плюса и минуса в одном абзаце", "Формальное письмо, сравнивающее две группы или ситуации"],
        kz: ["Бір абзацта артықшылық пен кемшілікті теңестіру", "Екі топты немесе жағдайды салыстыратын ресми жазу"],
      },
      badContexts: {
        en: ["Introducing a second point that fully agrees with the first", "Very casual daily conversation between friends"],
        ru: ["Введение второго пункта, полностью согласующегося с первым", "Очень непринуждённая повседневная беседа между друзьями"],
        kz: ["Біріншісімен толық келісетін екінші тармақты енгізу", "Достар арасындағы өте еркін күнделікті әңгіме"],
      },
      exampleSentences: ["도시 생활은 편리해요. 반면에 생활비가 비싸요.", "형은 활발해요. 반면에 동생은 조용해요."],
    },
    {
      id: "topik_wotd_4_2",
      word: "결국",
      romanization: "gyeolguk",
      partOfSpeech: "adverb",
      icon: "📖",
      definition: {
        en: "In the end; eventually — marks the final outcome after a process or series of events.",
        ru: "В конце концов; в итоге — обозначает окончательный результат после процесса или серии событий.",
        kz: "Ақыр соңында; сайып келгенде — процесс немесе оқиғалар тізбегінен кейінгі түпкілікті нәтижені білдіреді.",
      },
      goodContexts: {
        en: ["Summarizing the final outcome of a long story", "Describing a conclusion reached after much deliberation"],
        ru: ["Подведение итога долгой истории", "Описание вывода, достигнутого после долгих раздумий"],
        kz: ["Ұзақ әңгіменің түпкі нәтижесін қорытындылау", "Ұзақ ойланудан кейін жасалған қорытынды туралы айту"],
      },
      badContexts: {
        en: ["Describing the very first step of a process", "Talking about something still in progress with no resolution"],
        ru: ["Описание самого первого шага процесса", "Разговор о чём-то ещё незавершённом, без результата"],
        kz: ["Процестің ең бірінші қадамын сипаттау", "Әлі шешілмеген, жалғасып жатқан нәрсе туралы айту"],
      },
      exampleSentences: ["그는 결국 회사를 그만뒀어요.", "여러 번 실패했지만 결국 성공했어요."],
    },
    {
      id: "topik_wotd_4_3",
      word: "영향",
      romanization: "yeonghyang",
      partOfSpeech: "noun",
      icon: "📖",
      definition: {
        en: "Influence; effect — the power something has to shape or change another thing.",
        ru: "Влияние; воздействие — способность чего-либо формировать или изменять что-то другое.",
        kz: "Ықпал; әсер — бір нәрсенің басқа затты қалыптастыру немесе өзгерту қабілеті.",
      },
      goodContexts: {
        en: ["Discussing how one factor affects another in an essay", "Talking about the impact of environment on people"],
        ru: ["Обсуждение того, как один фактор влияет на другой, в эссе", "Разговор о влиянии окружающей среды на людей"],
        kz: ["Эсседе бір фактордың екіншісіне қалай әсер ететінін талқылау", "Ортаның адамдарға әсері туралы айту"],
      },
      badContexts: {
        en: ["Describing a purely physical measurement, like height", "Talking about an event with no causal connection to anything"],
        ru: ["Описание чисто физического измерения, например, роста", "Разговор о событии, никак не связанном с чем-либо"],
        kz: ["Бой сияқты таза физикалық өлшемді сипаттау", "Ешбір себеп-салдары жоқ оқиға туралы айту"],
      },
      exampleSentences: ["환경 오염은 건강에 나쁜 영향을 줘요.", "부모의 영향으로 그런 습관이 생겼어요."],
    },
    {
      id: "topik_wotd_4_4",
      word: "고려하다",
      romanization: "goryeohada",
      partOfSpeech: "verb",
      icon: "📖",
      definition: {
        en: "To consider — to think carefully about something before making a decision.",
        ru: "Учитывать; рассматривать — тщательно обдумывать что-либо перед принятием решения.",
        kz: "Ескеру; қарастыру — шешім қабылдамас бұрын бір нәрсені мұқият ойлау.",
      },
      goodContexts: {
        en: ["Discussing factors weighed before a decision", "Formal writing about policy or planning"],
        ru: ["Обсуждение факторов, учитываемых перед принятием решения", "Формальное письмо о политике или планировании"],
        kz: ["Шешім алдында ескерілетін факторларды талқылау", "Саясат немесе жоспарлау туралы ресми жазу"],
      },
      badContexts: {
        en: ["Describing an impulsive decision made with no thought", "Talking about a fact that is simply, permanently true"],
        ru: ["Описание импульсивного решения, принятого без раздумий", "Разговор о факте, который просто всегда верен"],
        kz: ["Ойланбай жасалған импульсивті шешімді сипаттау", "Жай ғана әрдайым ақиқат факт туралы айту"],
      },
      exampleSentences: ["가격과 품질을 고려해서 선택했어요.", "여러 가지 상황을 고려해야 해요."],
    },
    {
      id: "topik_wotd_4_5",
      word: "상황",
      romanization: "sanghwang",
      partOfSpeech: "noun",
      icon: "📖",
      definition: {
        en: "Situation — the set of circumstances at a particular time.",
        ru: "Ситуация — совокупность обстоятельств в определённый момент.",
        kz: "Жағдай — белгілі бір уақыттағы мән-жайлар жиынтығы.",
      },
      goodContexts: {
        en: ["Describing a difficult or changing set of circumstances", "Discussing how someone should react given the context"],
        ru: ["Описание сложных или меняющихся обстоятельств", "Обсуждение того, как кто-то должен реагировать с учётом контекста"],
        kz: ["Қиын немесе өзгеретін мән-жайларды сипаттау", "Контекстке қарай біреу қалай әрекет ету керектігін талқылау"],
      },
      badContexts: {
        en: ["Referring to a single specific physical object", "Talking about a fixed personal trait that never changes"],
        ru: ["Обозначение одного конкретного физического предмета", "Разговор о постоянной личной черте, которая никогда не меняется"],
        kz: ["Жеке нақты физикалық затты білдіру", "Ешқашан өзгермейтін тұрақты жеке қасиет туралы айту"],
      },
      exampleSentences: ["지금 상황이 좀 복잡해요.", "그 상황에서는 어쩔 수 없었어요."],
    },
  ],
  "5": [
    {
      id: "topik_wotd_5_1",
      word: "따라서",
      romanization: "ttaraseo",
      partOfSpeech: "adverb",
      icon: "📖",
      definition: {
        en: "Therefore; accordingly — introduces a logical result that follows from what was just stated.",
        ru: "Следовательно; соответственно — вводит логическое следствие из только что сказанного.",
        kz: "Сондықтан; соған сәйкес — жаңа айтылғаннан туындайтын логикалық нәтижені енгізеді.",
      },
      goodContexts: {
        en: ["Formal academic or essay writing to draw a conclusion", "Connecting a clearly stated cause to its logical result"],
        ru: ["Формальное академическое или эссеистическое письмо для вывода", "Связывание чётко изложенной причины с её логическим результатом"],
        kz: ["Қорытынды жасау үшін ресми академиялық немесе эссе жазу", "Анық айтылған себепті оның логикалық нәтижесімен байланыстыру"],
      },
      badContexts: {
        en: ["Casual spoken conversation among friends", "Starting a sentence with no cause mentioned beforehand"],
        ru: ["Непринуждённая устная беседа между друзьями", "Начало предложения без упомянутой ранее причины"],
        kz: ["Достар арасындағы еркін ауызша сөйлесу", "Алдын ала аталмаған себепсіз сөйлемді бастау"],
      },
      exampleSentences: ["물가가 계속 올랐다. 따라서 소비가 줄었다.", "규칙을 어겼다. 따라서 벌금을 내야 한다."],
    },
    {
      id: "topik_wotd_5_2",
      word: "반영하다",
      romanization: "banyeonghada",
      partOfSpeech: "verb",
      icon: "📖",
      definition: {
        en: "To reflect — to show or represent something else's real qualities or state.",
        ru: "Отражать — показывать или представлять реальные качества или состояние чего-либо другого.",
        kz: "Көрсету/бейнелеу — басқа бір нәрсенің нақты қасиетін немесе жай-күйін көрсету.",
      },
      goodContexts: {
        en: ["Discussing how a policy reflects public opinion", "Analyzing how art reflects the values of its era"],
        ru: ["Обсуждение того, как политика отражает общественное мнение", "Анализ того, как искусство отражает ценности своей эпохи"],
        kz: ["Саясаттың қоғам пікірін қалай көрсететінін талқылау", "Өнердің өз дәуірінің құндылықтарын қалай бейнелейтінін талдау"],
      },
      badContexts: {
        en: ["Talking about a literal mirror's physical material", "Describing a purely random, meaningless event"],
        ru: ["Разговор о физическом материале обычного зеркала", "Описание чисто случайного, бессмысленного события"],
        kz: ["Кәдімгі айнаның физикалық материалы туралы айту", "Таза кездейсоқ, мағынасыз оқиғаны сипаттау"],
      },
      exampleSentences: ["설문 결과는 소비자의 요구를 반영해요.", "이 정책은 시민들의 의견을 반영한 거예요."],
    },
    {
      id: "topik_wotd_5_3",
      word: "대책",
      romanization: "daechaek",
      partOfSpeech: "noun",
      icon: "📖",
      definition: {
        en: "Countermeasure; solution — a planned action taken to deal with a problem.",
        ru: "Контрмера; решение — запланированное действие для решения проблемы.",
        kz: "Шара; шешім — мәселені шешу үшін жоспарланған әрекет.",
      },
      goodContexts: {
        en: ["Discussing a government's response to a social issue", "Proposing a plan to prevent a problem from recurring"],
        ru: ["Обсуждение реакции правительства на социальную проблему", "Предложение плана для предотвращения повторения проблемы"],
        kz: ["Үкіметтің әлеуметтік мәселеге жауабын талқылау", "Мәселенің қайталанбауы үшін жоспар ұсыну"],
      },
      badContexts: {
        en: ["Describing a spontaneous action with no planning at all", "Talking about a purely emotional, non-practical reaction"],
        ru: ["Описание спонтанного действия вообще без планирования", "Разговор о чисто эмоциональной, непрактичной реакции"],
        kz: ["Мүлдем жоспарсыз, өздігінен жасалған әрекетті сипаттау", "Таза эмоционалды, тәжірибелік емес реакция туралы айту"],
      },
      exampleSentences: ["정부는 새로운 대책을 발표했어요.", "이 문제에 대한 대책이 필요해요."],
    },
    {
      id: "topik_wotd_5_4",
      word: "심각하다",
      romanization: "simgakhada",
      partOfSpeech: "adjective",
      icon: "📖",
      definition: {
        en: "To be serious — describes a situation or problem that is severe and concerning.",
        ru: "Быть серьёзным — описывает ситуацию или проблему, которая тяжёлая и вызывает беспокойство.",
        kz: "Ауыр/маңызды болу — қатты алаңдатарлық жағдайды немесе мәселені сипаттайды.",
      },
      goodContexts: {
        en: ["Describing a severe social or environmental problem", "Talking about a health condition that needs urgent attention"],
        ru: ["Описание серьёзной социальной или экологической проблемы", "Разговор о состоянии здоровья, требующем срочного внимания"],
        kz: ["Ауыр әлеуметтік немесе экологиялық мәселені сипаттау", "Шұғыл назар аударуды қажет ететін денсаулық жағдайы туралы айту"],
      },
      badContexts: {
        en: ["Describing a minor, trivial inconvenience", "Talking about a lighthearted joke among friends"],
        ru: ["Описание незначительного, пустячного неудобства", "Разговор о безобидной шутке между друзьями"],
        kz: ["Шағын, елеусіз ыңғайсыздықты сипаттау", "Достар арасындағы әзіл-қалжың туралы айту"],
      },
      exampleSentences: ["요즘 환경 문제가 심각해요.", "그 사고는 생각보다 심각했어요."],
    },
    {
      id: "topik_wotd_5_5",
      word: "규제",
      romanization: "gyuje",
      partOfSpeech: "noun",
      icon: "📖",
      definition: {
        en: "Regulation — an official rule that restricts or controls an activity.",
        ru: "Регулирование; норма — официальное правило, ограничивающее или контролирующее деятельность.",
        kz: "Реттеу/шектеу — қызметті шектейтін немесе бақылайтын ресми ереже.",
      },
      goodContexts: {
        en: ["Discussing government policy on business or industry", "Talking about rules that limit environmental damage"],
        ru: ["Обсуждение государственной политики в отношении бизнеса или отрасли", "Разговор о правилах, ограничивающих вред окружающей среде"],
        kz: ["Бизнес немесе саланы реттейтін мемлекеттік саясатты талқылау", "Қоршаған ортаға зиянды шектейтін ережелер туралы айту"],
      },
      badContexts: {
        en: ["Describing a completely voluntary personal habit", "Talking about a casual suggestion with no enforcement"],
        ru: ["Описание совершенно добровольной личной привычки", "Разговор о неформальном предложении без принуждения"],
        kz: ["Толықтай ерікті жеке әдетті сипаттау", "Мәжбүрлеусіз, бейресми ұсыныс туралы айту"],
      },
      exampleSentences: ["정부는 환경 규제를 강화했어요.", "이 산업에는 엄격한 규제가 있어요."],
    },
  ],
  "6": [
    {
      id: "topik_wotd_6_1",
      word: "아울러",
      romanization: "aulleo",
      partOfSpeech: "adverb",
      icon: "📖",
      definition: {
        en: "In addition; along with — a formal connector adding a further, related point.",
        ru: "Кроме того; наряду с этим — формальный союз, добавляющий ещё один связанный пункт.",
        kz: "Сонымен қатар; қоса — тағы бір байланысты тармақты қосатын ресми жалғаулық.",
      },
      goodContexts: {
        en: ["Formal announcements or official reports adding a related item", "Academic writing that supplements a prior statement"],
        ru: ["Официальные объявления или отчёты, добавляющие связанный пункт", "Академическое письмо, дополняющее предыдущее утверждение"],
        kz: ["Байланысты тармақ қосатын ресми хабарландырулар немесе есептер", "Алдыңғы мәлімдемені толықтыратын академиялық жазу"],
      },
      badContexts: {
        en: ["Very casual daily conversation between friends", "Introducing a totally unrelated new topic"],
        ru: ["Очень непринуждённая повседневная беседа между друзьями", "Введение совершенно несвязанной новой темы"],
        kz: ["Достар арасындағы өте еркін күнделікті әңгіме", "Мүлдем байланыссыз жаңа тақырыпты енгізу"],
      },
      exampleSentences: ["새 정책을 발표했다. 아울러 지원 방안도 마련했다.", "회의 일정을 안내한다. 아울러 참석 여부도 확인 바란다."],
    },
    {
      id: "topik_wotd_6_2",
      word: "초래하다",
      romanization: "choraehada",
      partOfSpeech: "verb",
      icon: "📖",
      definition: {
        en: "To bring about; to cause (a negative result) — used for a serious consequence produced by an action.",
        ru: "Приводить к; вызывать (негативный результат) — используется для серьёзного последствия, вызванного действием.",
        kz: "Әкеп соғу; туғызу (жағымсыз нәтиже) — бір әрекеттің салдарынан туындаған ауыр зардап үшін қолданылады.",
      },
      goodContexts: {
        en: ["Academic writing about the consequences of a policy failure", "Discussing how an action led to a serious problem"],
        ru: ["Академическое письмо о последствиях провала политики", "Обсуждение того, как действие привело к серьёзной проблеме"],
        kz: ["Саясаттың сәтсіздігінің салдары туралы академиялық жазу", "Әрекеттің ауыр мәселеге қалай әкелгенін талқылау"],
      },
      badContexts: {
        en: ["Describing a small, purely positive, welcome outcome", "Casual conversation about an everyday minor task"],
        ru: ["Описание небольшого, чисто положительного, желанного результата", "Непринуждённый разговор о повседневной мелкой задаче"],
        kz: ["Шағын, таза оң, қуантарлық нәтижені сипаттау", "Күнделікті ұсақ тапсырма туралы еркін әңгіме"],
      },
      exampleSentences: ["그 결정은 큰 혼란을 초래했다.", "무리한 개발은 환경 파괴를 초래할 수 있다."],
    },
    {
      id: "topik_wotd_6_3",
      word: "타당하다",
      romanization: "tadanghada",
      partOfSpeech: "adjective",
      icon: "📖",
      definition: {
        en: "To be valid; reasonable — describes an argument or claim that is logically sound.",
        ru: "Быть обоснованным; разумным — описывает аргумент или утверждение, которое логически верно.",
        kz: "Негізді/орынды болу — логикалық тұрғыдан дұрыс дәлел немесе пікірді сипаттайды.",
      },
      goodContexts: {
        en: ["Evaluating whether an argument in an essay holds up", "Discussing whether a decision was justified given the evidence"],
        ru: ["Оценка того, выдерживает ли аргумент в эссе критику", "Обсуждение того, было ли решение оправданным с учётом фактов"],
        kz: ["Эсседегі дәлелдің негізді екенін бағалау", "Дәлелдерге сүйене отырып, шешімнің орынды болғанын талқылау"],
      },
      badContexts: {
        en: ["Describing a purely physical attribute like color", "Talking about a random guess made with no reasoning"],
        ru: ["Описание чисто физического признака, например, цвета", "Разговор о случайной догадке без всякого обоснования"],
        kz: ["Түс сияқты таза физикалық қасиетті сипаттау", "Ешбір негізсіз кездейсоқ болжам туралы айту"],
      },
      exampleSentences: ["그의 주장은 타당한 근거가 있어요.", "이번 결정은 타당하다고 생각해요."],
    },
    {
      id: "topik_wotd_6_4",
      word: "실태",
      romanization: "siltae",
      partOfSpeech: "noun",
      icon: "📖",
      definition: {
        en: "Actual condition; the real state of affairs — the true, on-the-ground situation as it actually is.",
        ru: "Реальное положение дел — истинная ситуация такой, какая она есть на самом деле.",
        kz: "Нақты жай-күй — шынайы, іс жүзіндегі жағдай.",
      },
      goodContexts: {
        en: ["Reporting the results of a survey on a social issue", "Academic writing investigating a problem's true scope"],
        ru: ["Отчёт о результатах опроса по социальной проблеме", "Академическое письмо, исследующее истинный масштаб проблемы"],
        kz: ["Әлеуметтік мәселе бойынша сауалнама нәтижелерін хабарлау", "Мәселенің шынайы ауқымын зерттейтін академиялық жазу"],
      },
      badContexts: {
        en: ["Describing a purely imagined, hypothetical scenario", "Talking about a personal opinion with no supporting data"],
        ru: ["Описание чисто вымышленного, гипотетического сценария", "Разговор о личном мнении без подтверждающих данных"],
        kz: ["Таза қиялдан туындаған, болжамды сценарийді сипаттау", "Дәлелсіз жеке пікір туралы айту"],
      },
      exampleSentences: ["청소년 흡연 실태를 조사했어요.", "이 조사는 농촌 지역의 실태를 보여줘요."],
    },
    {
      id: "topik_wotd_6_5",
      word: "방안",
      romanization: "bang-an",
      partOfSpeech: "noun",
      icon: "📖",
      definition: {
        en: "Plan; measure — a proposed method for solving a problem or achieving a goal.",
        ru: "План; мера — предложенный способ решения проблемы или достижения цели.",
        kz: "Жоспар; шара — мәселені шешу немесе мақсатқа жету үшін ұсынылған тәсіл.",
      },
      goodContexts: {
        en: ["Proposing a specific solution in a formal essay", "Discussing policy options to address a shared problem"],
        ru: ["Предложение конкретного решения в формальном эссе", "Обсуждение вариантов политики для решения общей проблемы"],
        kz: ["Ресми эсседе нақты шешім ұсыну", "Ортақ мәселені шешу үшін саясат нұсқаларын талқылау"],
      },
      badContexts: {
        en: ["Describing a completed action with nothing left to plan", "Talking about a spontaneous, unplanned reaction"],
        ru: ["Описание завершённого действия, когда планировать больше нечего", "Разговор о спонтанной, незапланированной реакции"],
        kz: ["Жоспарлайтын ештеңе қалмаған аяқталған әрекетті сипаттау", "Жоспарланбаған, өздігінен болған реакция туралы айту"],
      },
      exampleSentences: ["문제를 해결할 방안을 찾고 있어요.", "회사는 새로운 방안을 마련했어요."],
    },
  ],
};

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Deterministic per calendar day: stable all day, changes at midnight,
 * cycles through the level's whole bank before repeating — same scheme as
 * DELF's getWordOfTheDay, but sourced from TOPIK_WORD_BANKS. */
export function getTopikWordOfTheDay(
  level: TopikLevel,
  date: Date = new Date()
): TopikWordOfTheDay {
  const bank = TOPIK_WORD_BANKS[level];
  const index = dayOfYear(date) % bank.length;
  return bank[index];
}

/** Finds a word's real, hand-authored entry across every level's bank —
 * used by the vocabulary evaluator to offer a genuine example sentence
 * (never a generated placeholder) when the student's own sentence can't be
 * corrected. */
export function findTopikWordEntry(word: string): TopikWordOfTheDay | undefined {
  const normalized = word.trim();
  for (const bank of Object.values(TOPIK_WORD_BANKS)) {
    const match = bank.find((entry) => entry.word === normalized);
    if (match) return match;
  }
  return undefined;
}

/** Every real, hand-authored definition across all levels — used only as
 * decoy wrong-answer text for the Weekly Quiz when the student hasn't
 * practiced enough other words yet to supply real distractors. Never
 * presented as vocabulary the student has learned. */
export function getAllTopikDefinitions(language: FeedbackLanguage): string[] {
  return Object.values(TOPIK_WORD_BANKS)
    .flat()
    .map((entry) => entry.definition[language]);
}
