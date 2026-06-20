/* ================================================================
   BibliaLearn — script.js
   Lógica completa del juego estilo Duolingo
   ================================================================ */


// ===================== ESTADO GLOBAL =====================

const state = {
    xp: 0,
    streak: 0,
    hearts: 5,
    maxHearts: 5,
    completedLessons: [],
    currentLesson: null,
    currentQuestionIndex: 0,
    questions: [],
    lessonXp: 0,
    lessonCorrect: 0,
    selectedAnswer: null,
    isChecked: false,
    matchState: { selectedLeft: null, selectedRight: null, matched: [] },
    dragState: { placed: {} }
};


// ===================== PERSISTENCIA (LOCALSTORAGE) =====================

function loadState() {
    try {
        const saved = localStorage.getItem('biblialearn-state');
        if (saved) {
            const parsed = JSON.parse(saved);
            state.xp = parsed.xp || 0;
            state.streak = parsed.streak || 0;
            state.hearts = parsed.hearts || 5;
            state.completedLessons = parsed.completedLessons || [];
        }
    } catch (e) {
        console.warn('Error cargando estado guardado:', e);
    }
}

function saveState() {
    try {
        localStorage.setItem('biblialearn-state', JSON.stringify({
            xp: state.xp,
            streak: state.streak,
            hearts: state.hearts,
            completedLessons: state.completedLessons
        }));
    } catch (e) {
        console.warn('Error guardando estado:', e);
    }
}


// ===================== DATOS DE LAS LECCIONES =====================

const lessons = [
    {
        title: "La Biblia en General",
        questions: [
            {
                type: "multiple",
                question: "¿Cuántos libros tiene la Biblia en total?",
                options: ["66", "73", "39", "27"],
                correct: 0,
                explanation: "La Biblia protestante tiene 66 libros: 39 en el Antiguo Testamento y 27 en el Nuevo Testamento."
            },
            {
                type: "multiple",
                question: "¿Cómo se divide la Biblia?",
                options: [
                    "Antiguo y Nuevo Testamento",
                    "Antiguo Pacto y Nueva Alianza",
                    "Libros sagrados y apócrifos",
                    "Antigua Ley y Nueva Ley"
                ],
                correct: 0,
                explanation: "La Biblia se divide en dos grandes secciones: el Antiguo Testamento (39 libros) y el Nuevo Testamento (27 libros)."
            },
            {
                type: "true-false",
                question: "El Antiguo Testamento tiene 27 libros.",
                correct: false,
                explanation: "Falso. El Antiguo Testamento tiene 39 libros. El Nuevo Testamento es el que tiene 27 libros."
            },
            {
                type: "multiple",
                question: "¿En qué idioma fue escrito originalmente el Antiguo Testamento?",
                options: ["Griego", "Arameo", "Hebreo (con partes en arameo)", "Latín"],
                correct: 2,
                explanation: "El AT fue escrito principalmente en hebreo, con algunas secciones en arameo (partes de Daniel y Esdras)."
            },
            {
                type: "multiple",
                question: "¿En qué idioma fue escrito el Nuevo Testamento?",
                options: ["Hebreo", "Latín", "Griego koiné", "Arameo"],
                correct: 2,
                explanation: "El Nuevo Testamento fue escrito en griego koiné (griego común), el idioma franco del Mediterráneo oriental."
            },
            {
                type: "fill-blank",
                question: "El Antiguo Testamento tiene __ libros y el Nuevo Testamento tiene __ libros.",
                blanks: ["39", "27"],
                options: [["39", "27", "46", "33"], ["27", "39", "21", "33"]],
                explanation: "AT: 39 libros. NT: 27 libros. Total: 66 libros."
            }
        ]
    },
    {
        title: "El Pentateuco",
        questions: [
            {
                type: "multiple",
                question: "¿Qué significa la palabra 'Pentateuco'?",
                options: ["Cinco rollos", "Los cinco libros", "Primera ley", "Libro de Moisés"],
                correct: 0,
                explanation: "Pentateuco viene del griego 'pente' (cinco) y 'teuchos' (rollo). Se refiere a los 5 primeros libros."
            },
            {
                type: "order",
                question: "Ordena los 5 libros del Pentateuco:",
                items: ["Deuteronomio", "Génesis", "Levítico", "Números", "Éxodo"],
                correctOrder: ["Génesis", "Éxodo", "Levítico", "Números", "Deuteronomio"],
                explanation: "El orden correcto es: Génesis, Éxodo, Levítico, Números y Deuteronomio."
            },
            {
                type: "multiple",
                question: "¿Qué libro del Pentateuco contiene la ley ceremonial y los sacrificios?",
                options: ["Éxodo", "Deuteronomio", "Levítico", "Números"],
                correct: 2,
                explanation: "Levítico es el libro de las leyes ceremoniales, los sacrificios y las instrucciones para los sacerdotes (levitas)."
            },
            {
                type: "multiple",
                question: "¿Quién es considerado autor tradicional del Pentateuco?",
                options: ["David", "Moisés", "Abraham", "Salomón"],
                correct: 1,
                explanation: "Tradicionalmente se atribuye a Moisés la autoría del Pentateuco, por eso se le llama 'Los libros de Moisés'."
            },
            {
                type: "match",
                question: "Relaciona cada libro con su contenido principal:",
                pairs: [
                    { left: "Génesis", right: "Orígenes y patriarcas" },
                    { left: "Éxodo", right: "Liberación de Egipto" },
                    { left: "Números", right: "Censo y peregrinaje" },
                    { left: "Deuteronomio", right: "Segunda ley / discurso" }
                ],
                explanation: "Cada libro tiene un enfoque único: orígenes, liberación, ley ceremonial, viaje por el desierto y recapitulación de la ley."
            },
            {
                type: "true-false",
                question: "El libro de Génesis termina con la muerte de Moisés.",
                correct: false,
                explanation: "Falso. Génesis termina con la muerte de José en Egipto. Es Deuteronomio el que termina con la muerte de Moisés."
            }
        ]
    },
    {
        title: "Libros Históricos",
        questions: [
            {
                type: "multiple",
                question: "¿Cuántos libros históricos hay en el Antiguo Testamento?",
                options: ["6", "12", "8", "10"],
                correct: 1,
                explanation: "Hay 12 libros históricos: Josué, Jueces, Rut, 1-2 Samuel, 1-2 Reyes, 1-2 Crónicas, Esdras, Nehemías y Ester."
            },
            {
                type: "multiple",
                question: "¿Qué libro relata la conquista de la tierra prometida?",
                options: ["Jueces", "Josué", "Números", "1 Samuel"],
                correct: 1,
                explanation: "El libro de Josué narra la entrada y conquista de Canaán bajo el liderazgo de Josué, sucesor de Moisés."
            },
            {
                type: "multiple",
                question: "¿Qué heroína bíblica tiene su propio libro y era de origen moabita?",
                options: ["Ester", "Débora", "Rut", "Ana"],
                correct: 2,
                explanation: "Rut era moabita. Su libro muestra la fidelidad y cómo llega a ser bisabuela del rey David."
            },
            {
                type: "true-false",
                question: "Los libros de Crónicas son un resumen repetitivo de Samuel y Reyes.",
                correct: false,
                explanation: "Falso. Aunque cubren el mismo período, Crónicas se enfoca desde una perspectiva sacerdotal y espiritual, no es una simple repetición."
            },
            {
                type: "multiple",
                question: "¿Qué libro describe la reconstrucción del templo y los muros de Jerusalén tras el exilio?",
                options: ["Esdras", "Nehemías", "Ambos", "Ninguno"],
                correct: 2,
                explanation: "Esdras relata la reconstrucción del templo y Nehemías la de los muros de Jerusalén. Ambos son libros post-exílicos."
            },
            {
                type: "order",
                question: "Ordena estos libros históricos cronológicamente:",
                items: ["2 Reyes", "Josué", "Jueces", "1 Samuel", "Rut"],
                correctOrder: ["Josué", "Jueces", "Rut", "1 Samuel", "2 Reyes"],
                explanation: "El orden cronológico: Josué (conquista), Jueces (antes de monarquía), Rut (época de jueces), 1 Samuel (inicio monarquía), 2 Reyes (fin del reino)."
            }
        ]
    },
    {
        title: "Libros Poéticos",
        questions: [
            {
                type: "multiple",
                question: "¿Cuáles son los 5 libros poéticos del AT?",
                options: [
                    "Salmos, Proverbios, Eclesiastés, Cantares, Job",
                    "Salmos, Proverbios, Job, Lamentaciones, Cantares",
                    "Job, Salmos, Proverbios, Eclesiastés, Cantares",
                    "Salmos, Job, Proverbios, Eclesiastés, Lamentaciones"
                ],
                correct: 2,
                explanation: "Los 5 libros poéticos son: Job, Salmos, Proverbios, Eclesiastés y Cantares."
            },
            {
                type: "multiple",
                question: "¿Qué libro trata sobre el sufrimiento del justo y la soberanía de Dios?",
                options: ["Eclesiastés", "Salmos", "Job", "Lamentaciones"],
                correct: 2,
                explanation: "Job aborda la pregunta del porqué sufre el justo. Es un diálogo entre Job y sus amigos sobre el sufrimiento y la justicia divina."
            },
            {
                type: "multiple",
                question: "¿Quién es el autor principal de la mayoría de los Salmos?",
                options: ["Salomón", "Moisés", "David", "Asaf"],
                correct: 2,
                explanation: "David es autor de al menos 73 salmos. Otros autores incluyen Asaf, los hijos de Coré, Salomón y Moisés."
            },
            {
                type: "true-false",
                question: "El libro de Proverbios fue escrito completamente por Salomón.",
                correct: false,
                explanation: "Falso. Aunque muchos proverbios son de Salomón, el libro también incluye secciones de Agur (cap. 30) y Lemuel (cap. 31)."
            },
            {
                type: "match",
                question: "Relaciona cada libro poético con su tema:",
                pairs: [
                    { left: "Eclesiastés", right: "Vanidad de la vida" },
                    { left: "Cantares", right: "Amor conyugal" },
                    { left: "Salmos", right: "Alabanza y oración" },
                    { left: "Proverbios", right: "Sabiduría práctica" }
                ],
                explanation: "Cada libro poético tiene un propósito único: alabanza, sabiduría, reflexión existencial y amor."
            },
            {
                type: "multiple",
                question: "¿Cuántos salmos tiene el libro de los Salmos?",
                options: ["100", "150", "120", "176"],
                correct: 1,
                explanation: "El libro de los Salmos contiene 150 salmos, divididos en 5 libros en la tradición hebrea."
            }
        ]
    },
    {
        title: "Profetas Mayores",
        questions: [
            {
                type: "multiple",
                question: "¿Quiénes son los 4 profetas mayores?",
                options: [
                    "Isaías, Jeremías, Ezequiel, Daniel",
                    "Isaías, Jeremías, Ezequiel, Malaquías",
                    "Isaías, Oseas, Ezequiel, Daniel",
                    "Jeremías, Ezequiel, Daniel, Joel"
                ],
                correct: 0,
                explanation: "Los profetas mayores son: Isaías, Jeremías, Ezequiel y Daniel. 'Mayor' se refiere al tamaño del libro, no a la importancia."
            },
            {
                type: "multiple",
                question: "¿Qué profeta es llamado 'el profeta mesiánico' por sus muchas profecías sobre Cristo?",
                options: ["Jeremías", "Ezequiel", "Isaías", "Daniel"],
                correct: 2,
                explanation: "Isaías contiene más profecías mesiánicas que cualquier otro libro del AT. Por eso se le llama 'el evangelio del AT'."
            },
            {
                type: "true-false",
                question: "El libro de Lamentaciones fue escrito por Jeremías.",
                correct: true,
                explanation: "Verdadero. La tradición atribuye Lamentaciones a Jeremías, que llora la destrucción de Jerusalén en 586 a.C."
            },
            {
                type: "multiple",
                question: "¿Qué profeta tuvo visiones del carro celestial y del templo futuro?",
                options: ["Daniel", "Isaías", "Jeremías", "Ezequiel"],
                correct: 3,
                explanation: "Ezequiel tuvo visiones extraordinarias: el carro de querubines (cap. 1), el templo reconstruido (caps. 40-48) y los huesos secos (cap. 37)."
            },
            {
                type: "multiple",
                question: "¿En qué período histórico vivió Daniel?",
                options: ["Reino dividido", "Exilio babilónico", "Post-exilio", "Monarquía unida"],
                correct: 1,
                explanation: "Daniel vivió durante el exilio en Babilonia (605-536 a.C.). Sirvió en la corte de Nabucodonosor y reyes posteriores."
            },
            {
                type: "order",
                question: "Ordena los profetas mayores según su orden en la Biblia:",
                items: ["Ezequiel", "Daniel", "Jeremías", "Isaías"],
                correctOrder: ["Isaías", "Jeremías", "Ezequiel", "Daniel"],
                explanation: "El orden bíblico es: Isaías, Jeremías (+ Lamentaciones), Ezequiel y Daniel."
            }
        ]
    },
    {
        title: "Profetas Menores",
        questions: [
            {
                type: "multiple",
                question: "¿Cuántos profetas menores hay?",
                options: ["8", "10", "12", "14"],
                correct: 2,
                explanation: "Hay 12 profetas menores: Oseas, Joel, Amós, Abdías, Jonás, Miqueas, Nahún, Habacuc, Sofonías, Ageo, Zacarías y Malaquías."
            },
            {
                type: "multiple",
                question: "¿Qué profeta fue tragado por un gran pez?",
                options: ["Miqueas", "Oseas", "Jonás", "Amós"],
                correct: 2,
                explanation: "Jonás fue tragado por un gran pez tras huir de la misión que Dios le dio de predicar a Nínive."
            },
            {
                type: "true-false",
                question: "Los profetas menores son menos importantes que los mayores.",
                correct: false,
                explanation: "Falso. 'Menor' solo indica la extensión del libro, no la importancia. Profetas como Oseas, Amós y Miqueas son profundamente significativos."
            },
            {
                type: "multiple",
                question: "¿Qué profeta menor es conocido por su mensaje sobre la justicia social: 'Que corra el derecho como las aguas'?",
                options: ["Oseas", "Amós", "Miqueas", "Habacuc"],
                correct: 1,
                explanation: "Amós, un pastor de Tecoa, denunció la injusticia social y la opresión de los pobres. Es el profeta de la justicia social por excelencia."
            },
            {
                type: "match",
                question: "Relaciona el profeta con su mensaje distintivo:",
                pairs: [
                    { left: "Oseas", right: "Infidelidad espiritual" },
                    { left: "Habacuc", right: "El justo vivirá por fe" },
                    { left: "Zacarías", right: "Visiones del templo" },
                    { left: "Malaquías", right: "El mensajero del pacto" }
                ],
                explanation: "Cada profeta menor tiene un mensaje único y poderoso que contribuye al panorama profético del AT."
            },
            {
                type: "multiple",
                question: "¿Quién es el último profeta del Antiguo Testamento?",
                options: ["Zacarías", "Ageo", "Malaquías", "Jonás"],
                correct: 2,
                explanation: "Malaquías es el último libro del AT y cierra el período profético. Anuncia la venida de 'Elías' antes del día del Señor."
            }
        ]
    },
    {
        title: "Los Evangelios",
        questions: [
            {
                type: "multiple",
                question: "¿Cuántos evangelios hay en el Nuevo Testamento?",
                options: ["3", "4", "5", "2"],
                correct: 1,
                explanation: "Hay 4 evangelios canónicos: Mateo, Marcos, Lucas y Juan, cada uno con una perspectiva única de la vida de Jesús."
            },
            {
                type: "multiple",
                question: "¿Qué evangelio fue escrito para un público judío y cita frecuentemente el AT?",
                options: ["Marcos", "Lucas", "Juan", "Mateo"],
                correct: 3,
                explanation: "Mateo escribe para judíos, presenta a Jesús como el Mesías prometido y cita el AT más de 60 veces."
            },
            {
                type: "multiple",
                question: "¿Qué evangelio es considerado el más corto y de acción rápida?",
                options: ["Mateo", "Marcos", "Lucas", "Juan"],
                correct: 1,
                explanation: "Marcos es el evangelio más corto (16 capítulos) y usa frecuentemente 'inmediatamente', dando sensación de acción rápida."
            },
            {
                type: "true-false",
                question: "Lucas era médico y compañero de Pablo.",
                correct: true,
                explanation: "Verdadero. Lucas era médico (Colosenses 4:14), compañero de Pablo y autor también de Hechos. Su evangelio destaca la humanidad de Jesús."
            },
            {
                type: "multiple",
                question: "¿Qué evangelio comienza con 'En el principio era el Verbo'?",
                options: ["Mateo", "Marcos", "Lucas", "Juan"],
                correct: 3,
                explanation: "Juan comienza con un prólogo teológico profundo: 'En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios.'"
            },
            {
                type: "match",
                question: "Relaciona cada evangelio con su símbolo tradicional:",
                pairs: [
                    { left: "Mateo", right: "León" },
                    { left: "Marcos", right: "Toro" },
                    { left: "Lucas", right: "Hombre" },
                    { left: "Juan", right: "Águila" }
                ],
                explanation: "Estos símbolos vienen de Ezequiel 1 y Apocalipsis 4. Mateo = león (realeza), Marcos = toro (servicio), Lucas = hombre (humanidad), Juan = águila (divinidad)."
            }
        ]
    },
    {
        title: "Las Epístolas",
        questions: [
            {
                type: "multiple",
                question: "¿Cuántas epístolas escribió el apóstol Pablo?",
                options: ["10", "11", "13", "15"],
                correct: 2,
                explanation: "Pablo escribió 13 epístolas: Romanos, 1-2 Corintios, Gálatas, Efesios, Filipenses, Colosenses, 1-2 Tesalonicenses, 1-2 Timoteo, Tito y Filemón."
            },
            {
                type: "multiple",
                question: "¿Cuál es la epístola más larga del NT?",
                options: ["1 Corintios", "Hebreos", "Romanos", "Apocalipsis"],
                correct: 2,
                explanation: "Romanos es la epístola más larga (16 capítulos) y contiene la exposición más completa de la doctrina cristiana."
            },
            {
                type: "true-false",
                question: "Hebreos fue escrita por el apóstol Pablo según la mayoría de eruditos.",
                correct: false,
                explanation: "Falso. La autoría de Hebreos es debatida. Aunque algunos la atribuyen a Pablo, la mayoría considera que su estilo es muy diferente."
            },
            {
                type: "multiple",
                question: "¿Cuáles son las 'epístolas generales' o 'católicas'?",
                options: [
                    "Santiago, 1-2 Pedro, 1-2-3 Juan, Judas",
                    "Santiago, 1-2 Pedro, 1-3 Juan, Judas, Hebreos",
                    "Santiago, Pedro, Juan, Judas",
                    "Hebreos, Santiago, 1-2 Pedro, Judas"
                ],
                correct: 0,
                explanation: "Las epístolas generales son: Santiago, 1-2 Pedro, 1-2-3 Juan y Judas. No van dirigidas a una iglesia específica."
            },
            {
                type: "order",
                question: "Ordena las epístolas paulinas según aparecen en la Biblia (primeras 4):",
                items: ["1 Corintios", "Romanos", "Gálatas", "2 Corintios"],
                correctOrder: ["Romanos", "1 Corintios", "2 Corintios", "Gálatas"],
                explanation: "El orden en la Biblia es: Romanos, 1 Corintios, 2 Corintios, Gálatas, Efesios, Filipenses, Colosenses..."
            },
            {
                type: "multiple",
                question: "¿Qué epístola se conoce como 'la carta del amor' por el capítulo 13?",
                options: ["Romanos", "Gálatas", "1 Corintios", "Efesios"],
                correct: 2,
                explanation: "1 Corintios 13 es el famoso 'capítulo del amor', donde Pablo describe las características del amor ágape."
            }
        ]
    },
    {
        title: "Profecía y Cierre",
        questions: [
            {
                type: "multiple",
                question: "¿Quién escribió el libro de Apocalipsis?",
                options: ["Pablo", "Pedro", "Juan", "Juan el Bautista"],
                correct: 2,
                explanation: "El apóstol Juan escribió Apocalipsis mientras estaba desterrado en la isla de Patmos, bajo el emperador Domiciano."
            },
            {
                type: "multiple",
                question: "¿Qué significa la palabra 'Apocalipsis'?",
                options: ["Fin del mundo", "Revelación", "Destrucción", "Profecía"],
                correct: 1,
                explanation: "Apocalipsis (apokalypsis en griego) significa 'revelación' o 'desvelamiento'. Es la revelación de Jesucristo dada a Juan."
            },
            {
                type: "true-false",
                question: "Apocalipsis es el único libro profético del Nuevo Testamento.",
                correct: false,
                explanation: "Falso. Aunque Apocalipsis es el único libro enteramente profético del NT, hay pasajes proféticos en los evangelios y otras epístolas."
            },
            {
                type: "multiple",
                question: "¿Cuál es el último libro de la Biblia?",
                options: ["Judas", "Apocalipsis", "3 Juan", "Hebreos"],
                correct: 1,
                explanation: "Apocalipsis es el último libro de la Biblia, cerrando tanto el Nuevo Testamento como las Escrituras canónicas."
            },
            {
                type: "fill-blank",
                question: "La Biblia tiene __ libros en total: __ en el AT y __ en el NT.",
                blanks: ["66", "39", "27"],
                options: [["66", "73", "80", "62"], ["39", "27", "46", "36"], ["27", "39", "33", "21"]],
                explanation: "66 libros en total: 39 en el Antiguo Testamento y 27 en el Nuevo Testamento."
            },
            {
                type: "multiple",
                question: "¿Cuál es la estructura general del NT en orden?",
                options: [
                    "Evangelios → Hechos → Epístolas → Apocalipsis",
                    "Evangelios → Epístolas → Hechos → Apocalipsis",
                    "Hechos → Evangelios → Epístolas → Apocalipsis",
                    "Evangelios → Apocalipsis → Hechos → Epístolas"
                ],
                correct: 0,
                explanation: "El NT sigue este orden: 4 Evangelios, Hechos de los Apóstoles, Epístolas (paulinas y generales) y Apocalipsis."
            }
        ]
    }
];


// ===================== GESTIÓN DE PANTALLAS =====================

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0, 0);
}


// ===================== ACTUALIZAR INTERFAZ =====================

function updateHomeUI() {
    document.getElementById('nav-xp').textContent = state.xp;
    document.getElementById('nav-streak').textContent = state.streak;
    document.getElementById('nav-hearts-count').textContent = state.hearts;

    for (let i = 0; i < lessons.length; i++) {
        const statusEl = document.getElementById(`lesson-${i}-status`);
        const nodeEl = statusEl ? statusEl.closest('.lesson-node') : null;
        if (!statusEl || !nodeEl) continue;

        // Limpiar clases de estado
        nodeEl.classList.remove('locked', 'completed');

        if (state.completedLessons.includes(i)) {
            statusEl.innerHTML = '<span class="iconify text-emerald-400 text-xl" data-icon="lucide:check-circle-2"></span>';
            nodeEl.classList.add('completed');
        } else if (i === 0 || state.completedLessons.includes(i - 1)) {
            statusEl.innerHTML = '<span class="iconify text-indigo-400 text-xl" data-icon="lucide:play-circle"></span>';
        } else {
            statusEl.innerHTML = '<span class="iconify text-slate-600 text-xl" data-icon="lucide:lock"></span>';
            nodeEl.classList.add('locked');
        }
    }
}

function updateLessonUI() {
    document.getElementById('lesson-hearts').textContent = state.hearts;
    document.getElementById('lesson-xp').textContent = state.lessonXp;
    const progress = (state.currentQuestionIndex / state.questions.length) * 100;
    document.getElementById('lesson-progress').style.width = progress + '%';
}


// ===================== TOAST =====================

let toastTimeout = null;

function showToast(icon, text) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-icon').innerHTML = icon;
    document.getElementById('toast-text').textContent = text;

    // Limpiar timeout previo
    if (toastTimeout) clearTimeout(toastTimeout);

    toast.classList.add('show');
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
}


// ===================== XP FLOTANTE =====================

function showXPFloat(amount) {
    const el = document.getElementById('xp-float');
    el.innerHTML = `<div class="text-emerald-400 font-bold text-2xl animate-xp-float">+${amount} XP</div>`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 1100);
}


// ===================== CONFETTI =====================

function launchConfetti() {
    const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9'];

    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
        piece.style.animationDelay = Math.random() * 0.6 + 's';
        piece.style.width = (Math.random() * 8 + 5) + 'px';
        piece.style.height = (Math.random() * 8 + 5) + 'px';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), 4500);
    }
}


// ===================== INICIAR LECCIÓN =====================

function startLesson(index) {
    // Validar que la lección esté desbloqueada
    if (index !== 0 && !state.completedLessons.includes(index - 1)) return;

    // Validar vidas
    if (state.hearts <= 0) {
        showToast(
            '<span class="iconify text-red-400" data-icon="lucide:heart-off"></span>',
            '¡Sin vidas! Espera a que se recarguen.'
        );
        return;
    }

    // Reiniciar estado de lección
    state.currentLesson = index;
    state.currentQuestionIndex = 0;
    state.lessonXp = 0;
    state.lessonCorrect = 0;
    state.selectedAnswer = null;
    state.isChecked = false;
    state.matchState = { selectedLeft: null, selectedRight: null, matched: [] };
    state.dragState = { placed: {} };

    // Mezclar preguntas para variedad
    state.questions = [...lessons[index].questions].sort(() => Math.random() - 0.5);

    showScreen('screen-lesson');
    renderQuestion();
