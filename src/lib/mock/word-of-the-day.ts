import type { WordOfTheDay } from "@/types";
import type { OnboardingLevel } from "@/types/user";
import type { DelfLevel } from "@/types/writing-evaluation";
import { resolvePracticeLevel } from "@/lib/utils/level";

/** One word bank per DELF practice level. `getWordOfTheDay` picks a
 * deterministic entry per calendar day, so it's stable all day and changes
 * automatically at midnight with no caching required. */
const WORD_BANKS: Record<DelfLevel, WordOfTheDay[]> = {
  A1: [
    {
      id: "wotd_a1_1",
      word: "toujours",
      partOfSpeech: "adverb",
      pronunciation: "/tu.ʒuʁ/",
      icon: "📖",
      definition: {
        en: "Always; still — used to say something happens every time or continues to be true.",
        ru: "Всегда; по-прежнему — используется, чтобы сказать, что что-то происходит каждый раз или остаётся верным.",
        kz: "Әрқашан; әлі де — бір нәрсенің әрдайым болатынын немесе шындығында қалатынын білдіру үшін қолданылады.",
      },
      goodContexts: {
        en: ["Describing habits or routines", "Saying something hasn't changed"],
        ru: ["Описание привычек или распорядка", "Утверждение, что что-то не изменилось"],
        kz: ["Әдеттерді немесе күнделікті тәртіпті сипаттау", "Бір нәрсенің өзгермегенін айту"],
      },
      badContexts: {
        en: ["Talking about something that happened only once", "As a greeting or introduction"],
        ru: ["Разговор о том, что случилось только один раз", "Как приветствие или вступление"],
        kz: ["Тек бір рет болған оқиға туралы айту", "Сәлемдесу немесе кіріспе ретінде"],
      },
      exampleSentences: ["Il est toujours en retard.", "Je pense toujours à ce voyage."],
    },
    {
      id: "wotd_a1_2",
      word: "beaucoup",
      partOfSpeech: "adverb",
      pronunciation: "/bo.ku/",
      icon: "📖",
      definition: {
        en: "A lot; much — used to say a large quantity or degree of something.",
        ru: "Много; сильно — используется, чтобы сказать о большом количестве или степени чего-либо.",
        kz: "Көп; өте — бір нәрсенің көп мөлшерін немесе дәрежесін білдіру үшін қолданылады.",
      },
      goodContexts: {
        en: ["After a verb to intensify it (aimer beaucoup)", "Answering 'how much/many'"],
        ru: ["После глагола для усиления (aimer beaucoup)", "Ответ на вопрос «сколько»"],
        kz: ["Етістіктен кейін күшейту үшін (aimer beaucoup)", "«Қанша» деген сұраққа жауап"],
      },
      badContexts: {
        en: [
          "Directly before a noun without 'de' (say 'beaucoup de temps', not 'beaucoup temps')",
          "As a standalone polite reply to 'merci'",
        ],
        ru: [
          "Прямо перед существительным без «de» (нужно «beaucoup de temps», а не «beaucoup temps»)",
          "Как отдельный вежливый ответ на «merci»",
        ],
        kz: [
          "«de» сөзінсіз зат есімнің алдында тікелей (\"beaucoup de temps\" керек, \"beaucoup temps\" емес)",
          "«merci» дегенге жеке сыпайы жауап ретінде",
        ],
      },
      exampleSentences: ["Merci beaucoup pour votre aide.", "Il y a beaucoup de monde ici."],
    },
    {
      id: "wotd_a1_3",
      word: "aussi",
      partOfSpeech: "adverb",
      pronunciation: "/o.si/",
      icon: "📖",
      definition: {
        en: "Also; too — used to add something similar to what was just said.",
        ru: "Тоже; также — используется, чтобы добавить что-то похожее на только что сказанное.",
        kz: "Да; сонымен қатар — жаңа айтылған нәрсеге ұқсас нәрсені қосу үшін қолданылады.",
      },
      goodContexts: {
        en: ["Agreeing that something applies to you too", "Adding an extra point to a list"],
        ru: ["Согласие, что что-то относится и к вам", "Добавление ещё одного пункта к списку"],
        kz: ["Бір нәрсенің өзіңізге де қатысты екенімен келісу", "Тізімге тағы бір тармақ қосу"],
      },
      badContexts: {
        en: ["Starting a negative sentence (use 'non plus' instead)", "As a strong contrast word"],
        ru: ["Начало отрицательного предложения (используйте «non plus»)", "Как слово сильного противопоставления"],
        kz: ["Болымсыз сөйлемді бастау («non plus» қолданыңыз)", "Күшті қарама-қайшылық сөзі ретінде"],
      },
      exampleSentences: ["J'aime le café, et toi aussi ?", "Elle parle anglais et aussi espagnol."],
    },
    {
      id: "wotd_a1_4",
      word: "maintenant",
      partOfSpeech: "adverb",
      pronunciation: "/mɛ̃t.nɑ̃/",
      icon: "📖",
      definition: {
        en: "Now — used to refer to the present moment.",
        ru: "Сейчас — используется для обозначения настоящего момента.",
        kz: "Қазір — қазіргі сәтті білдіру үшін қолданылады.",
      },
      goodContexts: {
        en: ["Saying what is happening at this moment", "Announcing a change from before to now"],
        ru: ["Сказать, что происходит в данный момент", "Объявление изменения от «раньше» к «сейчас»"],
        kz: ["Осы сәтте не болып жатқанын айту", "«Бұрын» мен «қазірдің» арасындағы өзгерісті хабарлау"],
      },
      badContexts: {
        en: ["Talking about the distant future", "As a formal written transition word"],
        ru: ["Разговор об отдалённом будущем", "Как формальное переходное слово в письме"],
        kz: ["Алыс болашақ туралы айту", "Ресми жазбаша өту сөзі ретінде"],
      },
      exampleSentences: ["Je suis occupé maintenant.", "Maintenant, je comprends mieux."],
    },
    {
      id: "wotd_a1_5",
      word: "parce que",
      partOfSpeech: "conjunction",
      pronunciation: "/paʁs.kə/",
      icon: "📖",
      definition: {
        en: "Because — used to give a reason for something.",
        ru: "Потому что — используется, чтобы объяснить причину чего-либо.",
        kz: "Себебі — бір нәрсенің себебін түсіндіру үшін қолданылады.",
      },
      goodContexts: {
        en: ["Answering a 'pourquoi' (why) question", "Giving a simple, direct reason"],
        ru: ["Ответ на вопрос «pourquoi» (почему)", "Простое, прямое объяснение причины"],
        kz: ["«Pourquoi» (неге) деген сұраққа жауап беру", "Қарапайым, тікелей себеп келтіру"],
      },
      badContexts: {
        en: ["Starting a formal written essay's introduction (prefer 'car')", "Right after 'et' or 'mais' redundantly"],
        ru: ["Начало вступления в формальном эссе (лучше «car»)", "Сразу после «et» или «mais» без надобности"],
        kz: ["Ресми эссенің кіріспесін бастау (\"car\" қолданған дұрыс)", "«Et» немесе «mais»-тен кейін қажетсіз қайталау"],
      },
      exampleSentences: ["Je reste à la maison parce qu'il pleut.", "Il a réussi parce qu'il a beaucoup travaillé."],
    },
  ],
  A2: [
    {
      id: "wotd_a2_1",
      word: "d'abord",
      partOfSpeech: "adverb",
      pronunciation: "/da.bɔʁ/",
      icon: "📖",
      definition: {
        en: "First; firstly — used to introduce the first step or point in a sequence.",
        ru: "Сначала; во-первых — используется, чтобы представить первый шаг или пункт в последовательности.",
        kz: "Алдымен; біріншіден — реттегі бірінші қадамды немесе тармақты енгізу үшін қолданылады.",
      },
      goodContexts: {
        en: ["Listing steps of a process in order", "Structuring an opinion with several points"],
        ru: ["Перечисление шагов процесса по порядку", "Структурирование мнения с несколькими пунктами"],
        kz: ["Процесс қадамдарын ретімен тізу", "Бірнеше тармақтан тұратын пікірді құрылымдау"],
      },
      badContexts: {
        en: ["Describing something that happens only once with no sequence", "As a synonym for 'suddenly'"],
        ru: ["Описание того, что происходит лишь раз, без последовательности", "Как синоним слова «внезапно»"],
        kz: ["Тізбексіз, тек бір рет болатын нәрсені сипаттау", "«Кенеттен» деген сөздің синонимі ретінде"],
      },
      exampleSentences: ["D'abord, je vais me préparer un café.", "D'abord, il faut lire les instructions."],
    },
    {
      id: "wotd_a2_2",
      word: "ensuite",
      partOfSpeech: "adverb",
      pronunciation: "/ɑ̃.sɥit/",
      icon: "📖",
      definition: {
        en: "Then; next — used to introduce what happens after the previous step.",
        ru: "Затем; потом — используется, чтобы представить то, что происходит после предыдущего шага.",
        kz: "Содан кейін; кейін — алдыңғы қадамнан кейін болатын нәрсені енгізу үшін қолданылады.",
      },
      goodContexts: {
        en: ["Continuing a sequence started with 'd'abord'", "Narrating events in the order they happened"],
        ru: ["Продолжение последовательности, начатой с «d'abord»", "Повествование событий в порядке их происхождения"],
        kz: ["«D'abord»-пен басталған тізбекті жалғастыру", "Оқиғаларды болған ретімен баяндау"],
      },
      badContexts: {
        en: ["Starting a story with no prior step mentioned", "As a word meaning 'immediately'"],
        ru: ["Начало истории без упомянутого предыдущего шага", "Как слово со значением «немедленно»"],
        kz: ["Алдыңғы қадам аталмаған әңгімені бастау", "«Дереу» дегенді білдіретін сөз ретінде"],
      },
      exampleSentences: ["Ensuite, nous avons visité le musée.", "Fais tes devoirs, ensuite tu pourras jouer."],
    },
    {
      id: "wotd_a2_3",
      word: "surtout",
      partOfSpeech: "adverb",
      pronunciation: "/syʁ.tu/",
      icon: "📖",
      definition: {
        en: "Especially; above all — used to emphasize the most important point.",
        ru: "Особенно; прежде всего — используется, чтобы подчеркнуть самый важный момент.",
        kz: "Әсіресе; ең алдымен — ең маңызды тармақты атап көрсету үшін қолданылады.",
      },
      goodContexts: {
        en: ["Highlighting the main reason among several", "Giving strong advice or warning"],
        ru: ["Выделение главной причины среди нескольких", "Дать твёрдый совет или предупреждение"],
        kz: ["Бірнешеудің ішінен басты себепті бөлектеу", "Қатаң кеңес немесе ескерту беру"],
      },
      badContexts: {
        en: ["Listing equally unimportant items", "As a neutral connector like 'and'"],
        ru: ["Перечисление одинаково неважных пунктов", "Как нейтральный союз вроде «и»"],
        kz: ["Бірдей маңызды емес заттарды тізу", "«Және» сияқты бейтарап жалғаулық ретінде"],
      },
      exampleSentences: ["J'aime les fruits, surtout les fraises.", "Surtout, ne soyez pas en retard !"],
    },
    {
      id: "wotd_a2_4",
      word: "parfois",
      partOfSpeech: "adverb",
      pronunciation: "/paʁ.fwa/",
      icon: "📖",
      definition: {
        en: "Sometimes — used to say something happens occasionally, not always.",
        ru: "Иногда — используется, чтобы сказать, что что-то происходит время от времени, не всегда.",
        kz: "Кейде — бір нәрсенің әрдайым емес, кейде болатынын айту үшін қолданылады.",
      },
      goodContexts: {
        en: ["Describing an occasional habit", "Softening a statement to make it less absolute"],
        ru: ["Описание случайной привычки", "Смягчение утверждения, чтобы оно звучало не так категорично"],
        kz: ["Кейде болатын әдетті сипаттау", "Мәлімдемені жұмсартып, онша қатаң етпеу"],
      },
      badContexts: {
        en: ["Describing something that always happens", "As a synonym for 'never'"],
        ru: ["Описание того, что происходит всегда", "Как синоним слова «никогда»"],
        kz: ["Әрдайым болатын нәрсені сипаттау", "«Ешқашан» дегеннің синонимі ретінде"],
      },
      exampleSentences: ["Parfois, je fais du sport le matin.", "Il pleut parfois en été."],
    },
    {
      id: "wotd_a2_5",
      word: "quand même",
      partOfSpeech: "expression",
      pronunciation: "/kɑ̃ mɛm/",
      icon: "📖",
      definition: {
        en: "Even so; anyway — used to say something happens despite a previous obstacle or objection.",
        ru: "Всё же; всё равно — используется, чтобы сказать, что что-то происходит несмотря на препятствие.",
        kz: "Дегенмен де; бәрібір — алдыңғы кедергіге қарамастан бір нәрсенің болатынын айту үшін қолданылады.",
      },
      goodContexts: {
        en: ["Expressing mild surprise or insistence", "Concluding despite a difficulty already mentioned"],
        ru: ["Выражение лёгкого удивления или настойчивости", "Заключение, несмотря на уже упомянутую трудность"],
        kz: ["Жеңіл таңдану немесе талап етуді білдіру", "Аталған қиындыққа қарамастан қорытынды жасау"],
      },
      badContexts: {
        en: [
          "Very formal written essays (prefer 'néanmoins' or 'toutefois')",
          "As the very first word of a sentence with no prior context",
        ],
        ru: [
          "Очень формальные письменные эссе (лучше «néanmoins» или «toutefois»)",
          "Как самое первое слово предложения без контекста",
        ],
        kz: [
          "Өте ресми жазбаша эссе (\"néanmoins\" немесе \"toutefois\" қолданған дұрыс)",
          "Алдыңғы контекстсіз сөйлемнің бірінші сөзі ретінде",
        ],
      },
      exampleSentences: ["Il pleuvait, mais nous sommes sortis quand même.", "C'est difficile, mais j'aime quand même ce travail."],
    },
  ],
  B1: [
    {
      id: "wotd_b1_1",
      word: "cependant",
      partOfSpeech: "adverb",
      pronunciation: "/sə.pɑ̃.dɑ̃/",
      icon: "📖",
      definition: {
        en: "However — used to introduce a contrast with the previous statement, in a fairly formal register.",
        ru: "Однако — используется, чтобы противопоставить предыдущему утверждению, в довольно формальном стиле.",
        kz: "Дегенмен — алдыңғы пікірге қарама-қайшылықты енгізу үшін қолданылады, біршама ресми регистрде.",
      },
      goodContexts: {
        en: ["Formal writing and structured arguments", "Introducing a nuance or exception to what was just said"],
        ru: ["Формальное письмо и структурированная аргументация", "Введение нюанса или исключения к только что сказанному"],
        kz: ["Ресми жазу және құрылымды дәлелдеу", "Жаңа айтылған нәрсеге нюанс немесе ерекшелік енгізу"],
      },
      badContexts: {
        en: ["Very casual spoken conversation with friends", "Contradicting something with no real connection to it"],
        ru: ["Очень непринуждённая устная беседа с друзьями", "Противоречие чему-то, что с этим никак не связано"],
        kz: ["Достармен өте еркін ауызша сөйлесу", "Оған нақты байланысы жоқ нәрсеге қайшы келу"],
      },
      exampleSentences: ["Le projet est ambitieux ; cependant, il est réalisable.", "Elle est fatiguée, cependant elle continue de travailler."],
    },
    {
      id: "wotd_b1_2",
      word: "donc",
      partOfSpeech: "conjunction",
      pronunciation: "/dɔ̃k/",
      icon: "📖",
      definition: {
        en: "So; therefore — used to introduce a logical consequence or conclusion.",
        ru: "Итак; следовательно — используется, чтобы ввести логическое следствие или вывод.",
        kz: "Сондықтан; демек — логикалық салдарды немесе қорытындыны енгізу үшін қолданылады.",
      },
      goodContexts: {
        en: ["Drawing a conclusion from what was just said", "Connecting a cause to its clear result"],
        ru: ["Вывод заключения из только что сказанного", "Связь причины с её очевидным результатом"],
        kz: ["Жаңа айтылғаннан қорытынды шығару", "Себепті оның анық нәтижесімен байланыстыру"],
      },
      badContexts: {
        en: ["Starting a sentence with no prior cause mentioned", "As a filler word with no logical link"],
        ru: ["Начало предложения без упомянутой ранее причины", "Как слово-паразит без логической связи"],
        kz: ["Алдыңғы себепсіз сөйлемді бастау", "Логикалық байланыссыз қосымша сөз ретінде"],
      },
      exampleSentences: ["Il pleut, donc je prends un parapluie.", "Elle a bien étudié, donc elle a réussi l'examen."],
    },
    {
      id: "wotd_b1_3",
      word: "en revanche",
      partOfSpeech: "expression",
      pronunciation: "/ɑ̃ ʁə.vɑ̃ʃ/",
      icon: "📖",
      definition: {
        en: "On the other hand — used to contrast two facts, often balancing a positive and a negative.",
        ru: "С другой стороны — используется, чтобы противопоставить два факта, часто уравновешивая плюс и минус.",
        kz: "Ал, керісінше — екі фактіні салыстыру үшін қолданылады, көбіне жақсы мен жаманды теңестіру.",
      },
      goodContexts: {
        en: ["Balancing a strength with a weakness in the same paragraph", "Formal essays and structured comparisons"],
        ru: ["Уравновешивание сильной и слабой стороны в одном абзаце", "Формальные эссе и структурированные сравнения"],
        kz: ["Бір абзацта күшті және әлсіз жақты теңестіру", "Ресми эссе және құрылымды салыстырулар"],
      },
      badContexts: {
        en: ["Introducing a second point that agrees with the first", "Casual chit-chat about unrelated topics"],
        ru: ["Введение второго пункта, который согласуется с первым", "Непринуждённая болтовня о несвязанных темах"],
        kz: ["Біріншісімен келісетін екінші тармақты енгізу", "Байланыссыз тақырыптар туралы еркін әңгіме"],
      },
      exampleSentences: ["Le salaire est bas ; en revanche, les horaires sont flexibles.", "Il est timide ; en revanche, sa sœur est très sociable."],
    },
    {
      id: "wotd_b1_4",
      word: "d'ailleurs",
      partOfSpeech: "adverb",
      pronunciation: "/da.jœʁ/",
      icon: "📖",
      definition: {
        en: "Besides; moreover — used to add a supporting fact or remark to what was just said.",
        ru: "Кроме того; впрочем — используется, чтобы добавить подтверждающий факт или замечание.",
        kz: "Оның үстіне; сондай-ақ — жаңа айтылғанды растайтын фактіні немесе ескертпені қосу үшін қолданылады.",
      },
      goodContexts: {
        en: ["Adding a relevant extra detail that supports your point", "Making a passing remark connected to the topic"],
        ru: ["Добавление уместной дополнительной детали в поддержку тезиса", "Мимолётное замечание, связанное с темой"],
        kz: ["Пікірді қолдайтын қосымша маңызды деталь қосу", "Тақырыппен байланысты өтпелі ескертпе жасау"],
      },
      badContexts: {
        en: ["Introducing a completely unrelated new topic", "Starting the very first sentence of a text"],
        ru: ["Введение совершенно несвязанной новой темы", "Начало самого первого предложения текста"],
        kz: ["Мүлдем байланыссыз жаңа тақырыпты енгізу", "Мәтіннің ең бірінші сөйлемін бастау"],
      },
      exampleSentences: ["Ce restaurant est excellent ; d'ailleurs, il est toujours complet.", "Elle parle bien allemand ; d'ailleurs, elle y a vécu."],
    },
    {
      id: "wotd_b1_5",
      word: "désormais",
      partOfSpeech: "adverb",
      pronunciation: "/de.zɔʁ.mɛ/",
      icon: "📖",
      definition: {
        en: "From now on — used to mark a change that will hold true starting now.",
        ru: "Отныне; впредь — используется, чтобы отметить изменение, которое будет действовать начиная с этого момента.",
        kz: "Бұдан былай — қазірден бастап күшіне енетін өзгерісті белгілеу үшін қолданылады.",
      },
      goodContexts: {
        en: ["Announcing a new rule or decision going forward", "Formal writing about a turning point"],
        ru: ["Объявление нового правила или решения на будущее", "Формальное письмо о переломном моменте"],
        kz: ["Алдағы уақытқа арналған жаңа ереже немесе шешімді хабарлау", "Бетбұрыс сәті туралы ресми жазу"],
      },
      badContexts: {
        en: ["Talking about something that only happened in the past", "Very casual everyday chit-chat"],
        ru: ["Разговор о том, что происходило только в прошлом", "Очень непринуждённая повседневная болтовня"],
        kz: ["Тек өткенде болған нәрсе туралы айту", "Өте еркін күнделікті әңгіме"],
      },
      exampleSentences: ["Désormais, les réunions auront lieu le lundi.", "Il a décidé de désormais faire du sport chaque jour."],
    },
  ],
  B2: [
    {
      id: "wotd_b2_1",
      word: "néanmoins",
      partOfSpeech: "adverb",
      pronunciation: "/ne.ɑ̃.mwɛ̃/",
      icon: "📖",
      definition: {
        en: "Nevertheless; however — used to introduce a contrasting idea.",
        ru: "Тем не менее; однако — используется для введения противоположной идеи.",
        kz: "Соған қарамастан; дегенмен — қарама-қайшы ойды енгізу үшін қолданылады.",
      },
      goodContexts: {
        en: ["Formal writing and essays (DELF production écrite)", "Connecting two contrasting formal statements"],
        ru: ["Формальное письмо и эссе (письменная часть DELF)", "Связывание двух противоположных формальных утверждений"],
        kz: ["Ресми жазу және эссе (DELF жазбаша бөлімі)", "Екі қарама-қайшы ресми пікірді байланыстыру"],
      },
      badContexts: {
        en: ["Casual spoken conversation with friends", "As a sentence starter without a prior contrasting idea"],
        ru: ["Непринуждённая устная беседа с друзьями", "Как начало предложения без предшествующей противоположной идеи"],
        kz: ["Достармен еркін ауызша сөйлесу", "Алдыңғы қарама-қайшы ой жоқ кезде сөйлемді бастау үшін"],
      },
      exampleSentences: ["Il pleuvait fort ; néanmoins, nous avons continué la randonnée.", "Le projet était risqué ; néanmoins, l'équipe a décidé de continuer."],
    },
    {
      id: "wotd_b2_2",
      word: "davantage",
      partOfSpeech: "adverb",
      pronunciation: "/da.vɑ̃.taʒ/",
      icon: "📖",
      definition: {
        en: "More; further — a more formal alternative to 'plus', often used to express an increasing degree.",
        ru: "Больше; ещё больше — более формальная альтернатива слову «plus», часто используется для выражения нарастающей степени.",
        kz: "Көбірек; одан әрі — «plus» сөзінің формальды баламасы, көбінесе өсіп келе жатқан дәрежені білдіру үшін қолданылады.",
      },
      goodContexts: {
        en: ["Formal writing to intensify a comparison", "Emphasizing that something increased further"],
        ru: ["Формальное письмо для усиления сравнения", "Подчёркивание того, что что-то ещё увеличилось"],
        kz: ["Салыстыруды күшейту үшін ресми жазу", "Бір нәрсенің одан әрі өскенін атап көрсету"],
      },
      badContexts: {
        en: ["Directly before a noun (use 'plus de' instead)", "Casual spoken French among friends"],
        ru: ["Прямо перед существительным (используйте «plus de»)", "Непринуждённая устная речь среди друзей"],
        kz: ["Зат есімнің алдында тікелей («plus de» қолданыңыз)", "Достар арасындағы еркін ауызша сөйлеу"],
      },
      exampleSentences: ["Ce nouveau contrat m'intéresse davantage.", "Il faudrait s'entraîner davantage avant la compétition."],
    },
    {
      id: "wotd_b2_3",
      word: "quoique",
      partOfSpeech: "conjunction",
      pronunciation: "/kwa.kə/",
      icon: "📖",
      definition: {
        en: "Although — introduces a concession, typically followed by the subjunctive mood.",
        ru: "Хотя — вводит уступку, обычно после него используется сослагательное наклонение.",
        kz: "Дегенмен де/-са да — жеңілдік/қарсылықты енгізеді, әдетте одан кейін subjonctif келеді.",
      },
      goodContexts: {
        en: ["Formal or literary writing with a subjunctive clause", "Conceding a point before restating your main opinion"],
        ru: ["Формальное или литературное письмо с сослагательным наклонением", "Уступка перед повторным изложением основного мнения"],
        kz: ["Subjonctif бар ресми немесе әдеби жазу", "Негізгі пікірді қайта айтпас бұрын жеңілдік жасау"],
      },
      badContexts: {
        en: ["Casual speech (prefer 'même si' with the indicative)", "Followed by the indicative mood"],
        ru: ["Непринуждённая речь (лучше «même si» с изъявительным наклонением)", "Использование с изъявительным наклонением"],
        kz: ["Еркін сөйлеу («même si» + ашық рай қолданған дұрыс)", "Ашық райдан кейін қолдану"],
      },
      exampleSentences: ["Quoiqu'il soit tard, elle continue de travailler.", "Il a réussi, quoique le sujet fût difficile."],
    },
    {
      id: "wotd_b2_4",
      word: "toutefois",
      partOfSpeech: "adverb",
      pronunciation: "/tut.fwa/",
      icon: "📖",
      definition: {
        en: "However; nevertheless — a formal connector very close to 'cependant', introducing a nuance or restriction.",
        ru: "Однако; тем не менее — формальный союз, очень близкий к «cependant», вводит нюанс или ограничение.",
        kz: "Дегенмен — «cependant»-ке өте жақын формальды жалғаулық, нюанс немесе шектеу енгізеді.",
      },
      goodContexts: {
        en: ["Formal reports and academic writing", "Softening a strong statement with an exception"],
        ru: ["Формальные отчёты и академическое письмо", "Смягчение сильного утверждения исключением"],
        kz: ["Ресми есептер мен академиялық жазу", "Күшті мәлімдемені ерекшелікпен жұмсарту"],
      },
      badContexts: {
        en: ["Informal text messages between friends", "Repeating it right after 'cependant' in the same paragraph"],
        ru: ["Неформальные сообщения между друзьями", "Повторение сразу после «cependant» в том же абзаце"],
        kz: ["Достар арасындағы бейресми хабарлама", "Бір абзацта «cependant»-тен кейін бірден қайталау"],
      },
      exampleSentences: ["Le plan est solide ; toutefois, quelques détails restent à préciser.", "Elle accepte l'offre, toutefois elle pose une condition."],
    },
    {
      id: "wotd_b2_5",
      word: "parvenir",
      partOfSpeech: "verb",
      pronunciation: "/paʁ.və.niʁ/",
      icon: "📖",
      definition: {
        en: "To manage to; to succeed in (doing something) — a more formal alternative to 'réussir à'.",
        ru: "Суметь; добиться (сделать что-то) — более формальная альтернатива «réussir à».",
        kz: "Қол жеткізу; қалау бойынша орындай алу — «réussir à»-ның формальды баламасы.",
      },
      goodContexts: {
        en: ["Formal writing about achieving a difficult goal", "Describing reaching a place after effort"],
        ru: ["Формальное письмо о достижении трудной цели", "Описание прибытия куда-то после усилий"],
        kz: ["Қиын мақсатқа жету туралы ресми жазу", "Күш салғаннан кейін бір жерге жетуді сипаттау"],
      },
      badContexts: {
        en: ["Casual conversation about small everyday tasks", "Used without 'à' before the following verb"],
        ru: ["Непринуждённый разговор о мелких повседневных делах", "Используется без «à» перед следующим глаголом"],
        kz: ["Күнделікті кішкене істер туралы еркін әңгіме", "Келесі етістіктің алдында «à»-сыз қолдану"],
      },
      exampleSentences: ["Elle est parvenue à convaincre le jury.", "Ils sont enfin parvenus au sommet."],
    },
  ],
};

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Deterministic per calendar day: stable all day, changes at midnight,
 * cycles through the level's whole bank before repeating. */
export function getWordOfTheDay(
  level: OnboardingLevel,
  date: Date = new Date()
): WordOfTheDay {
  const bank = WORD_BANKS[resolvePracticeLevel(level)];
  const index = dayOfYear(date) % bank.length;
  return bank[index];
}

