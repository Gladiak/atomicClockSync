import { guideMessages } from './guide.mjs';
import { sidebarMessages } from './sidebar.mjs';
import { watchAccuracyMessages } from './watch-accuracy.mjs';
import { expandedJourneyMessages } from './time-machine-expansion.mjs';
import { receptionLabMessages } from './reception-lab.mjs';
import { lightTravelMessages } from './light-travel.mjs';
// Offline interface messages. English source text is the stable lookup key.
const coreMessages = {
  "YOUR TIME, PRECISELY.": {
    "it": "IL TUO TEMPO, PRECISO.",
    "fr": "VOTRE TEMPS, AVEC PRÉCISION.",
    "de": "DEINE ZEIT. PRÄZISE.",
    "es": "TU TIEMPO, CON PRECISIÓN.",
    "ja": "あなたの時間を、正確に。"
  },
  "Main navigation": {
    "it": "Navigazione principale",
    "fr": "Navigation principale",
    "de": "Hauptnavigation",
    "es": "Navegación principal",
    "ja": "メインナビゲーション"
  },
  "Synchronize": {
    "it": "Sincronizza",
    "fr": "Synchroniser",
    "de": "Synchronisieren",
    "es": "Sincronizar",
    "ja": "時刻合わせ"
  },
  "My watches": {
    "it": "I miei orologi",
    "fr": "Mes montres",
    "de": "Meine Uhren",
    "es": "Mis relojes",
    "ja": "マイウォッチ"
  },
  "Inside the signal": {
    "it": "Dentro il segnale",
    "fr": "Dans le signal",
    "de": "Im Signal",
    "es": "Dentro de la señal",
    "ja": "信号のしくみ"
  },
  "World View": {
    "it": "Mappa del mondo",
    "fr": "Vue du monde",
    "de": "Weltkarte",
    "es": "Mapa del mundo",
    "ja": "ワールドビュー"
  },
  "Moon Observatory": {
    "it": "Osservatorio lunare",
    "fr": "Observatoire lunaire",
    "de": "Mondobservatorium",
    "es": "Observatorio lunar",
    "ja": "月の観測室"
  },
  "ISS Observatory": {
    "it": "Osservatorio ISS",
    "fr": "Observatoire ISS",
    "de": "ISS-Observatorium",
    "es": "Observatorio ISS",
    "ja": "ISS観測室"
  },
  "Time Machine": {
    "it": "Macchina del tempo",
    "fr": "Machine à remonter le temps",
    "de": "Zeitmaschine",
    "es": "Máquina del tiempo",
    "ja": "タイムマシン"
  },
  "History": {
    "it": "Cronologia",
    "fr": "Historique",
    "de": "Verlauf",
    "es": "Historial",
    "ja": "履歴"
  },
  "Settings": {
    "it": "Impostazioni",
    "fr": "Réglages",
    "de": "Einstellungen",
    "es": "Ajustes",
    "ja": "設定"
  },
  "Quick guide": {
    "it": "Guida rapida",
    "fr": "Guide rapide",
    "de": "Kurzanleitung",
    "es": "Guía rápida",
    "ja": "クイックガイド"
  },
  "A small signal.": {
    "it": "Un piccolo segnale.",
    "fr": "Un petit signal.",
    "de": "Ein kleines Signal.",
    "es": "Una pequeña señal.",
    "ja": "小さな信号で。"
  },
  "The right time.": {
    "it": "L'ora giusta.",
    "fr": "L'heure juste.",
    "de": "Die richtige Zeit.",
    "es": "La hora exacta.",
    "ja": "正しい時刻を。"
  },
  "● LOCAL": {
    "it": "● LOCALE",
    "fr": "● LOCAL",
    "de": "● LOKAL",
    "es": "● LOCAL",
    "ja": "● ローカル"
  },
  "PRECISION, ONE SECOND AT A TIME": {
    "it": "PRECISIONE, UN SECONDO ALLA VOLTA",
    "fr": "LA PRÉCISION, SECONDE APRÈS SECONDE",
    "de": "PRÄZISION, SEKUNDE FÜR SEKUNDE",
    "es": "PRECISIÓN, SEGUNDO A SEGUNDO",
    "ja": "一秒ずつ、正確に"
  },
  "Sync your watch": {
    "it": "Sincronizza il tuo orologio",
    "fr": "Synchronisez votre montre",
    "de": "Synchronisiere deine Uhr",
    "es": "Sincroniza tu reloj",
    "ja": "時計の時刻を合わせる"
  },
  "Choose a station, place your Casio nearby and transmit.": {
    "it": "Scegli una stazione, avvicina il Casio e trasmetti.",
    "fr": "Choisissez une station, approchez votre Casio et transmettez.",
    "de": "Sender wählen, Casio danebenlegen und senden.",
    "es": "Elige una emisora, acerca tu Casio y transmite.",
    "ja": "送信局を選び、Casioを近づけて送信します。"
  },
  "Open the guide": {
    "it": "Apri la guida",
    "fr": "Ouvrir le guide",
    "de": "Anleitung öffnen",
    "es": "Abrir la guía",
    "ja": "ガイドを開く"
  },
  "Synchronization": {
    "it": "Sincronizzazione",
    "fr": "Synchronisation",
    "de": "Synchronisierung",
    "es": "Sincronización",
    "ja": "時刻合わせ"
  },
  "Watch": {
    "it": "Orologio",
    "fr": "Montre",
    "de": "Uhr",
    "es": "Reloj",
    "ja": "時計"
  },
  "Custom settings": {
    "it": "Impostazioni libere",
    "fr": "Réglages libres",
    "de": "Eigene Einstellungen",
    "es": "Ajustes propios",
    "ja": "カスタム設定"
  },
  "Station": {
    "it": "Stazione",
    "fr": "Station",
    "de": "Sender",
    "es": "Emisora",
    "ja": "送信局"
  },
  "Profiles →": {
    "it": "Profili →",
    "fr": "Profils →",
    "de": "Profile →",
    "es": "Perfiles →",
    "ja": "プロファイル →"
  },
  "SIGNAL TIME": {
    "it": "ORA DEL SEGNALE",
    "fr": "HEURE DU SIGNAL",
    "de": "SIGNALZEIT",
    "es": "HORA DE LA SEÑAL",
    "ja": "信号の時刻"
  },
  "IDLE": {
    "it": "INATTIVO",
    "fr": "INACTIF",
    "de": "BEREIT",
    "es": "INACTIVO",
    "ja": "待機中"
  },
  "Signal time": {
    "it": "Ora del segnale",
    "fr": "Heure du signal",
    "de": "Signalzeit",
    "es": "Hora de la señal",
    "ja": "信号の時刻"
  },
  "Simulated envelope": {
    "it": "Inviluppo simulato",
    "fr": "Enveloppe simulée",
    "de": "Simulierte Hüllkurve",
    "es": "Envolvente simulada",
    "ja": "変調波形のシミュレーション"
  },
  "DCF77 ENVELOPE · SIMULATION": {
    "it": "INVILUPPO DCF77 · SIMULAZIONE",
    "fr": "ENVELOPPE DCF77 · SIMULATION",
    "de": "DCF77-HÜLLKURVE · SIMULATION",
    "es": "ENVOLVENTE DCF77 · SIMULACIÓN",
    "ja": "DCF77波形 · シミュレーション"
  },
  "Start transmission": {
    "it": "Avvia trasmissione",
    "fr": "Lancer l'émission",
    "de": "Übertragung starten",
    "es": "Iniciar transmisión",
    "ja": "送信開始"
  },
  "My Casio received ✓": {
    "it": "Il mio Casio ha ricevuto ✓",
    "fr": "Mon Casio a reçu ✓",
    "de": "Mein Casio hat empfangen ✓",
    "es": "Mi Casio ha recibido ✓",
    "ja": "Casioの受信を確認 ✓"
  },
  "Start manual reception on your Casio and transmit for 5–10 minutes.": {
    "it": "Avvia la ricezione manuale sul Casio e trasmetti per 5–10 minuti.",
    "fr": "Lancez la réception manuelle du Casio puis émettez 5–10 minutes.",
    "de": "Manuellen Empfang am Casio starten, dann 5–10 Minuten senden.",
    "es": "Inicia la recepción manual del Casio y transmite 5–10 minutos.",
    "ja": "Casioで手動受信を開始し、5〜10分送信してください。"
  },
  "System time": {
    "it": "Ora di sistema",
    "fr": "Heure système",
    "de": "Systemzeit",
    "es": "Hora del sistema",
    "ja": "システム時刻"
  },
  "Check time ↻": {
    "it": "Verifica ora ↻",
    "fr": "Vérifier l'heure ↻",
    "de": "Zeit prüfen ↻",
    "es": "Comprobar hora ↻",
    "ja": "時刻を確認 ↻"
  },
  "Volume": {
    "it": "Volume",
    "fr": "Volume",
    "de": "Lautstärke",
    "es": "Volumen",
    "ja": "音量"
  },
  "Channel": {
    "it": "Canale",
    "fr": "Canal",
    "de": "Kanal",
    "es": "Canal",
    "ja": "チャンネル"
  },
  "Both": {
    "it": "Entrambi",
    "fr": "Les deux",
    "de": "Beide",
    "es": "Ambos",
    "ja": "両方"
  },
  "Left": {
    "it": "Sinistro",
    "fr": "Gauche",
    "de": "Links",
    "es": "Izquierdo",
    "ja": "左"
  },
  "Right": {
    "it": "Destro",
    "fr": "Droit",
    "de": "Rechts",
    "es": "Derecho",
    "ja": "右"
  },
  "Session": {
    "it": "Sessione",
    "fr": "Session",
    "de": "Sitzung",
    "es": "Sesión",
    "ja": "セッション"
  },
  "15.5 kHz tone: start at low volume and keep it away from your ears.": {
    "it": "Tono a 15,5 kHz: parti con volume basso e tienilo lontano dalle orecchie.",
    "fr": "Son à 15,5 kHz : commencez à faible volume, loin des oreilles.",
    "de": "15,5-kHz-Ton: leise beginnen und von den Ohren fernhalten.",
    "es": "Tono de 15,5 kHz: empieza con volumen bajo y lejos de los oídos.",
    "ja": "15.5 kHzの音です。小音量で始め、耳に近づけないでください。"
  },
  "Explore the live time code": {
    "it": "Esplora il codice orario in diretta",
    "fr": "Explorer le code horaire en direct",
    "de": "Live-Zeitcode erkunden",
    "es": "Explorar el código horario en directo",
    "ja": "送信中の時刻コードを見る"
  },
  "EMULATED STATION": {
    "it": "STAZIONE EMULATA",
    "fr": "STATION ÉMULÉE",
    "de": "EMULIERTER SENDER",
    "es": "EMISORA EMULADA",
    "ja": "模擬送信局"
  },
  "Mainflingen, Germany": {
    "it": "Mainflingen, Germania",
    "fr": "Mainflingen, Allemagne",
    "de": "Mainflingen, Deutschland",
    "es": "Mainflingen, Alemania",
    "ja": "マインフリンゲン、ドイツ"
  },
  "Target harmonic": {
    "it": "Armonica prevista",
    "fr": "Harmonique visée",
    "de": "Zielharmonische",
    "es": "Armónico objetivo",
    "ja": "対象の高調波"
  },
  "Signal time zone": {
    "it": "Fuso orario del segnale",
    "fr": "Fuseau horaire du signal",
    "de": "Signalzeitzone",
    "es": "Zona horaria de la señal",
    "ja": "信号のタイムゾーン"
  },
  "Your session": {
    "it": "La tua sessione",
    "fr": "Votre session",
    "de": "Deine Sitzung",
    "es": "Tu sesión",
    "ja": "今回のセッション"
  },
  "READY": {
    "it": "PRONTO",
    "fr": "PRÊT",
    "de": "BEREIT",
    "es": "LISTO",
    "ja": "準備完了"
  },
  "complete minutes": {
    "it": "minuti completi",
    "fr": "minutes complètes",
    "de": "volle Minuten",
    "es": "minutos completos",
    "ja": "完了した分"
  },
  "current symbol": {
    "it": "simbolo attuale",
    "fr": "symbole actuel",
    "de": "aktuelles Symbol",
    "es": "símbolo actual",
    "ja": "現在のシンボル"
  },
  "Confirm reception on your Casio display.": {
    "it": "Conferma la ricezione sul display del Casio.",
    "fr": "Confirmez la réception sur l'écran du Casio.",
    "de": "Empfang auf dem Casio-Display prüfen.",
    "es": "Confirma la recepción en la pantalla del Casio.",
    "ja": "Casioの画面で受信結果を確認してください。"
  },
  "Keep your watch nearby.": {
    "it": "Tieni l'orologio vicino.",
    "fr": "Gardez la montre à proximité.",
    "de": "Uhr in der Nähe lassen.",
    "es": "Mantén el reloj cerca.",
    "ja": "時計を近くに置いてください。"
  },
  "Watch 1–5 cm from the speaker.": {
    "it": "Orologio a 1–5 cm dall'altoparlante.",
    "fr": "Montre à 1–5 cm du haut-parleur.",
    "de": "Uhr 1–5 cm vom Lautsprecher entfernt.",
    "es": "Reloj a 1–5 cm del altavoz.",
    "ja": "スピーカーから1〜5 cmに置きます。"
  },
  "LIVE": {
    "it": "IN DIRETTA",
    "fr": "EN DIRECT",
    "de": "LIVE",
    "es": "EN DIRECTO",
    "ja": "現在"
  },
  "Calculated lunar phase with illustrative terrain": {
    "it": "Fase lunare calcolata con terreno illustrativo",
    "fr": "Phase lunaire calculée avec relief illustratif",
    "de": "Berechnete Mondphase mit illustrativem Relief",
    "es": "Fase lunar calculada con relieve ilustrativo",
    "ja": "月相の計算結果と模式的な地形"
  },
  "EARTH’S NATURAL SATELLITE": {
    "it": "IL SATELLITE NATURALE DELLA TERRA",
    "fr": "LE SATELLITE NATUREL DE LA TERRE",
    "de": "DER NATÜRLICHE ERDSATELLIT",
    "es": "EL SATÉLITE NATURAL DE LA TIERRA",
    "ja": "地球の自然衛星"
  },
  "Moon phase schematic": {
    "it": "Schema della fase lunare",
    "fr": "Schéma de la phase lunaire",
    "de": "Mondphasenschema",
    "es": "Esquema de la fase lunar",
    "ja": "月相の模式図"
  },
  "ILLUSTRATIVE TERRAIN · PHASE ORIENTATION SCHEMATIC": {
    "it": "TERRENO ILLUSTRATIVO · ORIENTAMENTO SCHEMATICO",
    "fr": "RELIEF ILLUSTRATIF · ORIENTATION SCHÉMATIQUE",
    "de": "ILLUSTRATIVES RELIEF · SCHEMATISCHE AUSRICHTUNG",
    "es": "RELIEVE ILUSTRATIVO · ORIENTACIÓN ESQUEMÁTICA",
    "ja": "模式的な地形・月相の向き"
  },
  "THE MOON, FROM YOUR CORNER OF EARTH": {
    "it": "LA LUNA, DAL TUO ANGOLO DI TERRA",
    "fr": "LA LUNE, DEPUIS CHEZ VOUS",
    "de": "DER MOND VON DEINEM STANDORT",
    "es": "LA LUNA, DESDE TU RINCÓN DEL MUNDO",
    "ja": "あなたの場所から見た月"
  },
  "ILLUMINATED": {
    "it": "ILLUMINATA",
    "fr": "ÉCLAIRÉE",
    "de": "BELEUCHTET",
    "es": "ILUMINADA",
    "ja": "照らされた割合"
  },
  "Distance · Earth centre": {
    "it": "Distanza · centro della Terra",
    "fr": "Distance · centre de la Terre",
    "de": "Abstand · Erdmittelpunkt",
    "es": "Distancia · centro terrestre",
    "ja": "距離・地球の中心から"
  },
  "Since new Moon": {
    "it": "Dall'ultima luna nuova",
    "fr": "Depuis la nouvelle lune",
    "de": "Seit Neumond",
    "es": "Desde la luna nueva",
    "ja": "新月からの経過"
  },
  "Altitude": {
    "it": "Altezza",
    "fr": "Hauteur",
    "de": "Höhe",
    "es": "Altura",
    "ja": "高度"
  },
  "Azimuth · from north": {
    "it": "Azimut · da nord",
    "fr": "Azimut · depuis le nord",
    "de": "Azimut · ab Norden",
    "es": "Azimut · desde el norte",
    "ja": "方位角・北を基準"
  },
  "Moonrise": {
    "it": "Sorgere della Luna",
    "fr": "Lever de Lune",
    "de": "Mondaufgang",
    "es": "Salida de la Luna",
    "ja": "月の出"
  },
  "Moonset": {
    "it": "Tramonto della Luna",
    "fr": "Coucher de Lune",
    "de": "Monduntergang",
    "es": "Puesta de la Luna",
    "ja": "月の入り"
  },
  "NEXT FULL MOON": {
    "it": "PROSSIMA LUNA PIENA",
    "fr": "PROCHAINE PLEINE LUNE",
    "de": "NÄCHSTER VOLLMOND",
    "es": "PRÓXIMA LUNA LLENA",
    "ja": "次の満月"
  },
  "THE NEXT FOUR PHASES": {
    "it": "LE PROSSIME QUATTRO FASI",
    "fr": "LES QUATRE PROCHAINES PHASES",
    "de": "DIE NÄCHSTEN VIER PHASEN",
    "es": "LAS CUATRO PRÓXIMAS FASES",
    "ja": "これからの4つの月相"
  },
  "LOCAL TIMES · CLICK TO EXPLORE": {
    "it": "ORE LOCALI · CLICCA PER ESPLORARE",
    "fr": "HEURES LOCALES · CLIQUEZ POUR EXPLORER",
    "de": "ORTSZEIT · ZUM ERKUNDEN KLICKEN",
    "es": "HORAS LOCALES · PULSA PARA EXPLORAR",
    "ja": "現地時刻・クリックして見る"
  },
  "Upcoming lunar phases": {
    "it": "Prossime fasi lunari",
    "fr": "Prochaines phases lunaires",
    "de": "Kommende Mondphasen",
    "es": "Próximas fases lunares",
    "ja": "今後の月相"
  },
  "Explore lunar time": {
    "it": "Esplora il tempo lunare",
    "fr": "Explorer le temps lunaire",
    "de": "Mondzeit erkunden",
    "es": "Explorar el tiempo lunar",
    "ja": "月の時間を調べる"
  },
  "Previous day": {
    "it": "Giorno precedente",
    "fr": "Jour précédent",
    "de": "Vorheriger Tag",
    "es": "Día anterior",
    "ja": "前の日"
  },
  "UTC date": {
    "it": "Data UTC",
    "fr": "Date UTC",
    "de": "UTC-Datum",
    "es": "Fecha UTC",
    "ja": "UTCの日付"
  },
  "UTC preview time": {
    "it": "Ora di anteprima UTC",
    "fr": "Heure d'aperçu UTC",
    "de": "UTC-Vorschauzeit",
    "es": "Hora de vista previa UTC",
    "ja": "UTCのプレビュー時刻"
  },
  "Next day": {
    "it": "Giorno successivo",
    "fr": "Jour suivant",
    "de": "Nächster Tag",
    "es": "Día siguiente",
    "ja": "次の日"
  },
  "↺ Live": {
    "it": "↺ In diretta",
    "fr": "↺ En direct",
    "de": "↺ Live",
    "es": "↺ En directo",
    "ja": "↺ 現在"
  },
  "Calculated offline ·": {
    "it": "Calcolato offline ·",
    "fr": "Calculé hors ligne ·",
    "de": "Offline berechnet ·",
    "es": "Calculado sin conexión ·",
    "ja": "オフラインで計算 ·"
  },
  "System clock": {
    "it": "Orologio di sistema",
    "fr": "Horloge système",
    "de": "Systemuhr",
    "es": "Reloj del sistema",
    "ja": "システム時計"
  },
  "· Horizon geometry does not predict clouds or terrain.": {
    "it": "· L'orizzonte geometrico non considera nuvole o rilievi.",
    "fr": "· L'horizon géométrique ignore nuages et relief.",
    "de": "· Der geometrische Horizont berücksichtigt weder Wolken noch Gelände.",
    "es": "· El horizonte geométrico no contempla nubes ni relieve.",
    "ja": "· 地平線の計算に雲や地形は含みません。"
  },
  "Lunar science ↗": {
    "it": "Scienza lunare ↗",
    "fr": "Science lunaire ↗",
    "de": "Mondforschung ↗",
    "es": "Ciencia lunar ↗",
    "ja": "月の科学 ↗"
  },
  "Time Machine historical and personal journeys": {
    "it": "Viaggi storici e personali nel tempo",
    "fr": "Voyages historiques et personnels",
    "de": "Historische und persönliche Zeitreisen",
    "es": "Viajes históricos y personales",
    "ja": "歴史と自分のタイムトラベル"
  },
  "Time Machine collections": {
    "it": "Raccolte della Macchina del tempo",
    "fr": "Collections de voyages temporels",
    "de": "Sammlungen der Zeitmaschine",
    "es": "Colecciones de viajes temporales",
    "ja": "タイムマシンのコレクション"
  },
  "Historical journeys": {
    "it": "Viaggi nella storia",
    "fr": "Voyages dans l'histoire",
    "de": "Historische Reisen",
    "es": "Viajes por la historia",
    "ja": "歴史への旅"
  },
  "My moments & capsules": {
    "it": "I miei ricordi e capsule",
    "fr": "Mes souvenirs et capsules",
    "de": "Meine Momente und Kapseln",
    "es": "Mis recuerdos y cápsulas",
    "ja": "思い出とタイムカプセル"
  },
  "ϟ Back in Time →": {
    "it": "ϟ Ritorno al futuro →",
    "fr": "ϟ Retour vers le futur →",
    "de": "ϟ Zurück in die Zukunft →",
    "es": "ϟ Regreso al futuro →",
    "ja": "ϟ バック・トゥ・ザ・フューチャー →"
  },
  "Search historical events": {
    "it": "Cerca eventi storici",
    "fr": "Rechercher des événements",
    "de": "Historische Ereignisse suchen",
    "es": "Buscar acontecimientos",
    "ja": "歴史上の出来事を検索"
  },
  "Find a moment…": {
    "it": "Trova un momento…",
    "fr": "Trouver un moment…",
    "de": "Moment finden…",
    "es": "Buscar un momento…",
    "ja": "出来事を探す…"
  },
  "Historical category": {
    "it": "Categoria storica",
    "fr": "Catégorie historique",
    "de": "Historische Kategorie",
    "es": "Categoría histórica",
    "ja": "歴史のカテゴリー"
  },
  "All journeys": {
    "it": "Tutti i viaggi",
    "fr": "Tous les voyages",
    "de": "Alle Reisen",
    "es": "Todos los viajes",
    "ja": "すべての旅"
  },
  "Space exploration": {
    "it": "Esplorazione spaziale",
    "fr": "Exploration spatiale",
    "de": "Raumfahrt",
    "es": "Exploración espacial",
    "ja": "宇宙探査"
  },
  "Discovery & invention": {
    "it": "Scoperte e invenzioni",
    "fr": "Découvertes et inventions",
    "de": "Entdeckungen und Erfindungen",
    "es": "Descubrimientos e inventos",
    "ja": "発見と発明"
  },
  "Clocks & calendars": {
    "it": "Orologi e calendari",
    "fr": "Horloges et calendriers",
    "de": "Uhren und Kalender",
    "es": "Relojes y calendarios",
    "ja": "時計と暦"
  },
  "32 MOMENTS": {
    "it": "32 MOMENTI",
    "fr": "32 MOMENTS",
    "de": "32 MOMENTE",
    "es": "32 MOMENTOS",
    "ja": "32の出来事"
  },
  "Historical timeline": {
    "it": "Cronologia storica",
    "fr": "Chronologie historique",
    "de": "Historische Zeitleiste",
    "es": "Cronología histórica",
    "ja": "歴史のタイムライン"
  },
  "No moments match. Try another search.": {
    "it": "Nessun risultato. Prova un'altra ricerca.",
    "fr": "Aucun résultat. Essayez une autre recherche.",
    "de": "Kein Treffer. Andere Suche versuchen.",
    "es": "Sin resultados. Prueba otra búsqueda.",
    "ja": "一致する出来事がありません。検索を変えてください。"
  },
  "Illustrated historical reconstruction": {
    "it": "Ricostruzione storica illustrata",
    "fr": "Reconstitution historique illustrée",
    "de": "Illustrierte historische Rekonstruktion",
    "es": "Reconstrucción histórica ilustrada",
    "ja": "歴史を再現したイラスト"
  },
  "LIVE REFERENCE": {
    "it": "RIFERIMENTO IN DIRETTA",
    "fr": "RÉFÉRENCE EN DIRECT",
    "de": "LIVE-REFERENZ",
    "es": "REFERENCIA EN DIRECTO",
    "ja": "現在の基準時刻"
  },
  "TIME SINCE THIS MOMENT": {
    "it": "TEMPO DA QUESTO MOMENTO",
    "fr": "TEMPS DEPUIS CE MOMENT",
    "de": "ZEIT SEIT DIESEM MOMENT",
    "es": "TIEMPO DESDE ESTE MOMENTO",
    "ja": "その瞬間からの時間"
  },
  "DAYS": {
    "it": "GIORNI",
    "fr": "JOURS",
    "de": "TAGE",
    "es": "DÍAS",
    "ja": "日"
  },
  "HRS": {
    "it": "ORE",
    "fr": "H",
    "de": "STD",
    "es": "H",
    "ja": "時"
  },
  "MIN": {
    "it": "MIN",
    "fr": "MIN",
    "de": "MIN",
    "es": "MIN",
    "ja": "分"
  },
  "SEC": {
    "it": "SEC",
    "fr": "S",
    "de": "SEK",
    "es": "S",
    "ja": "秒"
  },
  "↶ Explore this moment": {
    "it": "↶ Esplora questo momento",
    "fr": "↶ Explorer ce moment",
    "de": "↶ Diesen Moment erkunden",
    "es": "↶ Explorar este momento",
    "ja": "↶ その瞬間を見る"
  },
  "NASA source ↗": {
    "it": "Fonte NASA ↗",
    "fr": "Source NASA ↗",
    "de": "NASA-Quelle ↗",
    "es": "Fuente NASA ↗",
    "ja": "NASAの出典 ↗"
  },
  "YOUR OWN SMALL PIECE OF HISTORY": {
    "it": "IL TUO PICCOLO PEZZO DI STORIA",
    "fr": "VOTRE PETIT MORCEAU D'HISTOIRE",
    "de": "DEIN KLEINES STÜCK GESCHICHTE",
    "es": "TU PEQUEÑO FRAGMENTO DE HISTORIA",
    "ja": "あなただけの小さな歴史"
  },
  "A moment worth keeping.": {
    "it": "Un momento da conservare.",
    "fr": "Un moment à garder.",
    "de": "Ein Moment zum Bewahren.",
    "es": "Un momento para guardar.",
    "ja": "残しておきたい瞬間。"
  },
  "Title": {
    "it": "Titolo",
    "fr": "Titre",
    "de": "Titel",
    "es": "Título",
    "ja": "タイトル"
  },
  "The day I got my first G-Shock": {
    "it": "Il giorno del mio primo G-Shock",
    "fr": "Le jour de mon premier G-Shock",
    "de": "Mein erster G-Shock",
    "es": "El día de mi primer G-Shock",
    "ja": "初めてG-Shockを手にした日"
  },
  "Keep it as": {
    "it": "Conserva come",
    "fr": "Conserver comme",
    "de": "Speichern als",
    "es": "Guardar como",
    "ja": "保存形式"
  },
  "Personal moment / countdown": {
    "it": "Ricordo / conto alla rovescia",
    "fr": "Souvenir / compte à rebours",
    "de": "Erinnerung / Countdown",
    "es": "Recuerdo / cuenta atrás",
    "ja": "思い出・カウントダウン"
  },
  "Time capsule · open in the future": {
    "it": "Capsula del tempo · apertura futura",
    "fr": "Capsule temporelle · ouverture future",
    "de": "Zeitkapsel · später öffnen",
    "es": "Cápsula del tiempo · apertura futura",
    "ja": "タイムカプセル・未来に開く"
  },
  "Date and time · UTC": {
    "it": "Data e ora · UTC",
    "fr": "Date et heure · UTC",
    "de": "Datum und Uhrzeit · UTC",
    "es": "Fecha y hora · UTC",
    "ja": "日時 · UTC"
  },
  "Memory or message": {
    "it": "Ricordo o messaggio",
    "fr": "Souvenir ou message",
    "de": "Erinnerung oder Nachricht",
    "es": "Recuerdo o mensaje",
    "ja": "思い出・メッセージ"
  },
  "Leave something for your future self…": {
    "it": "Lascia qualcosa al tuo io futuro…",
    "fr": "Un message à votre futur vous…",
    "de": "Eine Nachricht an dein zukünftiges Ich…",
    "es": "Deja algo para tu yo del futuro…",
    "ja": "未来の自分へメッセージを…"
  },
  "Capsule messages stay hidden until their opening date. Kept locally on this device; not encrypted.": {
    "it": "I messaggi restano nascosti fino all'apertura. Salvati sul dispositivo, non cifrati.",
    "fr": "Messages cachés jusqu'à l'ouverture. Stockés ici, sans chiffrement.",
    "de": "Nachrichten bleiben bis zum Öffnungsdatum verborgen. Lokal und unverschlüsselt.",
    "es": "Mensajes ocultos hasta la apertura. Guardados aquí, sin cifrar.",
    "ja": "メッセージは開封日まで非表示になります。端末内に暗号化せず保存します。"
  },
  "Save moment": {
    "it": "Salva ricordo",
    "fr": "Enregistrer",
    "de": "Moment speichern",
    "es": "Guardar recuerdo",
    "ja": "思い出を保存"
  },
  "Cancel edit": {
    "it": "Annulla modifica",
    "fr": "Annuler la modification",
    "de": "Bearbeitung abbrechen",
    "es": "Cancelar edición",
    "ja": "編集をキャンセル"
  },
  "0 / 100 LOCAL KEEPSAKES": {
    "it": "0 / 100 RICORDI LOCALI",
    "fr": "0 / 100 SOUVENIRS LOCAUX",
    "de": "0 / 100 LOKALE ERINNERUNGEN",
    "es": "0 / 100 RECUERDOS LOCALES",
    "ja": "0 / 100 保存済み"
  },
  "Your story starts here.": {
    "it": "La tua storia inizia qui.",
    "fr": "Votre histoire commence ici.",
    "de": "Deine Geschichte beginnt hier.",
    "es": "Tu historia empieza aquí.",
    "ja": "あなたの物語はここから。"
  },
  "Save a memory, count down to something special, or leave a message for your future self.": {
    "it": "Salva un ricordo, attendi un evento speciale o scrivi al tuo io futuro.",
    "fr": "Gardez un souvenir, attendez un événement ou écrivez à votre futur vous.",
    "de": "Erinnerung speichern, Vorfreude zählen oder dem zukünftigen Ich schreiben.",
    "es": "Guarda un recuerdo, espera algo especial o escribe a tu yo futuro.",
    "ja": "思い出を残したり、大切な日を待ったり、未来の自分に手紙を書いたり。"
  },
  "Saved moments and time capsules": {
    "it": "Ricordi e capsule salvati",
    "fr": "Souvenirs et capsules enregistrés",
    "de": "Gespeicherte Momente und Kapseln",
    "es": "Recuerdos y cápsulas guardados",
    "ja": "保存した思い出とカプセル"
  },
  "History, measured in moments · Original illustrations · UTC clocks · Your watch keeps the real time.": {
    "it": "Storia in momenti · Illustrazioni originali · Ore UTC · L'orologio resta nel presente.",
    "fr": "L'histoire en moments · Illustrations originales · UTC · Votre montre garde l'heure réelle.",
    "de": "Geschichte in Momenten · Originalgrafiken · UTC · Deine Uhr bleibt in der Gegenwart.",
    "es": "Historia en momentos · Ilustraciones originales · UTC · Tu reloj conserva la hora real.",
    "ja": "瞬間でたどる歴史・オリジナルイラスト・UTC・時計は現実の時刻のまま"
  },
  "LOCAL ARCHIVE / NO ACCOUNT": {
    "it": "ARCHIVIO LOCALE / NESSUN ACCOUNT",
    "fr": "ARCHIVE LOCALE / SANS COMPTE",
    "de": "LOKALES ARCHIV / OHNE KONTO",
    "es": "ARCHIVO LOCAL / SIN CUENTA",
    "ja": "ローカル保存・アカウント不要"
  },
  "Back in Time laboratory": {
    "it": "Laboratorio Ritorno al futuro",
    "fr": "Laboratoire Retour vers le futur",
    "de": "Zurück-in-die-Zukunft-Labor",
    "es": "Laboratorio Regreso al futuro",
    "ja": "バック・トゥ・ザ・フューチャー研究室"
  },
  "HILL VALLEY TEMPORAL LABORATORY": {
    "it": "LABORATORIO TEMPORALE DI HILL VALLEY",
    "fr": "LABORATOIRE TEMPOREL DE HILL VALLEY",
    "de": "ZEITLABOR HILL VALLEY",
    "es": "LABORATORIO TEMPORAL DE HILL VALLEY",
    "ja": "ヒルバレー時間研究所"
  },
  "← Historical journeys": {
    "it": "← Viaggi nella storia",
    "fr": "← Voyages dans l'histoire",
    "de": "← Historische Reisen",
    "es": "← Viajes por la historia",
    "ja": "← 歴史への旅"
  },
  "Time circuits": {
    "it": "Circuiti temporali",
    "fr": "Circuits temporels",
    "de": "Zeitschaltkreise",
    "es": "Circuitos temporales",
    "ja": "タイムサーキット"
  },
  "● ONLINE": {
    "it": "● OPERATIVO",
    "fr": "● EN LIGNE",
    "de": "● BEREIT",
    "es": "● OPERATIVO",
    "ja": "● 稼働中"
  },
  "Destination time": {
    "it": "Destinazione temporale",
    "fr": "Destination temporelle",
    "de": "Zielzeit",
    "es": "Tiempo de destino",
    "ja": "目的の日時"
  },
  "Present time": {
    "it": "Tempo presente",
    "fr": "Temps présent",
    "de": "Gegenwart",
    "es": "Tiempo presente",
    "ja": "現在の日時"
  },
  "Last time departed": {
    "it": "Ultima partenza",
    "fr": "Dernier départ",
    "de": "Letzte Abreise",
    "es": "Última partida",
    "ja": "最後に出発した日時"
  },
  "HILL VALLEY · PACIFIC TIME · 24H": {
    "it": "HILL VALLEY · ORA DEL PACIFICO · 24H",
    "fr": "HILL VALLEY · HEURE DU PACIFIQUE · 24H",
    "de": "HILL VALLEY · PAZIFIKZEIT · 24H",
    "es": "HILL VALLEY · HORA DEL PACÍFICO · 24H",
    "ja": "ヒルバレー・太平洋時間・24時間制"
  },
  "Flux capacitor and time travel controls": {
    "it": "Flusso canalizzatore e comandi temporali",
    "fr": "Convecteur temporel et commandes",
    "de": "Fluxkompensator und Zeitreisesteuerung",
    "es": "Condensador de fluzo y controles",
    "ja": "次元転移装置とタイムトラベル操作"
  },
  "FLUX CAPACITOR": {
    "it": "FLUSSO CANALIZZATORE",
    "fr": "CONVECTEUR TEMPOREL",
    "de": "FLUXKOMPENSATOR",
    "es": "CONDENSADOR DE FLUZO",
    "ja": "次元転移装置"
  },
  "SHIELD EYES FROM TEMPORAL PARADOXES": {
    "it": "PROTEGGI GLI OCCHI DAI PARADOSSI",
    "fr": "PROTÉGEZ VOS YEUX DES PARADOXES",
    "de": "AUGEN VOR ZEITPARADOXIEN SCHÜTZEN",
    "es": "PROTEGE LOS OJOS DE LAS PARADOJAS",
    "ja": "時間パラドックスから目を守ろう"
  },
  "Flux dispersal: stable.": {
    "it": "Dispersione del flusso: stabile.",
    "fr": "Dispersion du flux : stable.",
    "de": "Fluxverteilung: stabil.",
    "es": "Dispersión del flujo: estable.",
    "ja": "フラックス拡散：安定。"
  },
  "One very questionable idea: ready.": {
    "it": "Un'idea molto discutibile: pronta.",
    "fr": "Une idée très douteuse : prête.",
    "de": "Eine sehr fragwürdige Idee: bereit.",
    "es": "Una idea muy cuestionable: lista.",
    "ja": "かなり怪しい計画：準備完了。"
  },
  "LET’S HIT 88 MPH": {
    "it": "ARRIVIAMO A 88 MPH",
    "fr": "ATTEIGNONS 88 MPH",
    "de": "AUF ZU 88 MPH",
    "es": "ALCANZAR 88 MPH",
    "ja": "時速88マイルへ"
  },
  "↺ Return to the present": {
    "it": "↺ Torna al presente",
    "fr": "↺ Retour au présent",
    "de": "↺ Zurück zur Gegenwart",
    "es": "↺ Volver al presente",
    "ja": "↺ 現在に戻る"
  },
  "TEMPORAL DISPLACEMENT COMPLETE": {
    "it": "SPOSTAMENTO TEMPORALE COMPLETATO",
    "fr": "DÉPLACEMENT TEMPOREL TERMINÉ",
    "de": "ZEITSPRUNG ABGESCHLOSSEN",
    "es": "DESPLAZAMIENTO TEMPORAL COMPLETADO",
    "ja": "時間移動完了"
  },
  "GRANDE GIOVE!!": {
    "it": "GRANDE GIOVE!!",
    "fr": "NOM DE ZEUS !!",
    "de": "GROSSER GOTT!!",
    "es": "¡¡GRAN SCOTT!!",
    "ja": "なんてこった！！"
  },
  "Explore this date →": {
    "it": "Esplora questa data →",
    "fr": "Explorer cette date →",
    "de": "Dieses Datum erkunden →",
    "es": "Explorar esta fecha →",
    "ja": "この日を見る →"
  },
  "Elapsed time since the selected movie event": {
    "it": "Tempo trascorso dall'evento del film",
    "fr": "Temps écoulé depuis l'événement du film",
    "de": "Zeit seit dem Filmereignis",
    "es": "Tiempo desde el evento de la película",
    "ja": "映画の出来事からの経過時間"
  },
  "THE FUTURE IS ALREADY HISTORY": {
    "it": "IL FUTURO È GIÀ STORIA",
    "fr": "LE FUTUR EST DÉJÀ DE L'HISTOIRE",
    "de": "DIE ZUKUNFT IST SCHON GESCHICHTE",
    "es": "EL FUTURO YA ES HISTORIA",
    "ja": "未来はもう過去になった"
  },
  "Welcome to the future": {
    "it": "Benvenuto nel futuro",
    "fr": "Bienvenue dans le futur",
    "de": "Willkommen in der Zukunft",
    "es": "Bienvenido al futuro",
    "ja": "未来へようこそ"
  },
  "Hoverboards were supposed to be a thing by now.": {
    "it": "A quest'ora gli hoverboard dovevano esistere.",
    "fr": "Les hoverboards étaient censés exister.",
    "de": "Hoverboards sollte es längst geben.",
    "es": "Ya deberían existir los monopatines voladores.",
    "ja": "今頃はホバーボードがあるはずだったのに。"
  },
  "CHOOSE YOUR TEMPORAL DESTINATION": {
    "it": "SCEGLI LA TUA DESTINAZIONE TEMPORALE",
    "fr": "CHOISISSEZ VOTRE DESTINATION TEMPORELLE",
    "de": "WÄHLE DEIN ZEITREISEZIEL",
    "es": "ELIGE TU DESTINO TEMPORAL",
    "ja": "時間旅行の行き先を選択"
  },
  "5 FIXED POINTS. ONE VERY FLEXIBLE TIMELINE.": {
    "it": "5 PUNTI FISSI. UNA CRONOLOGIA FLESSIBILE.",
    "fr": "5 REPÈRES. UNE CHRONOLOGIE TRÈS SOUPLE.",
    "de": "5 FIXPUNKTE. EINE FLEXIBLE ZEITLINIE.",
    "es": "5 PUNTOS FIJOS. UNA CRONOLOGÍA FLEXIBLE.",
    "ja": "5つの定点。自由すぎるタイムライン。"
  },
  "Famous dates from the trilogy": {
    "it": "Date famose della trilogia",
    "fr": "Dates célèbres de la trilogie",
    "de": "Bekannte Daten der Trilogie",
    "es": "Fechas famosas de la trilogía",
    "ja": "三部作の有名な日付"
  },
  "Fan-made tribute to Back to the Future · Cinematic time travel only. Your Casio stays in this century.": {
    "it": "Omaggio a Ritorno al futuro · Viaggi solo cinematografici. Il Casio resta in questo secolo.",
    "fr": "Hommage à Retour vers le futur · Voyage de cinéma. Votre Casio reste dans ce siècle.",
    "de": "Hommage an Zurück in die Zukunft · Nur filmische Zeitreisen. Dein Casio bleibt in diesem Jahrhundert.",
    "es": "Homenaje a Regreso al futuro · Viajes de cine. Tu Casio sigue en este siglo.",
    "ja": "映画へのファン作品です。タイムトラベルは演出のみ。Casioは今世紀のままです。"
  },
  "Film chronology ↗": {
    "it": "Cronologia dei film ↗",
    "fr": "Chronologie des films ↗",
    "de": "Filmchronologie ↗",
    "es": "Cronología de las películas ↗",
    "ja": "映画の年表 ↗"
  },
  "Signal details": {
    "it": "Dettagli del segnale",
    "fr": "Détails du signal",
    "de": "Signaldetails",
    "es": "Detalles de la señal",
    "ja": "信号の詳細"
  },
  "Live time code": {
    "it": "Codice orario in diretta",
    "fr": "Code horaire en direct",
    "de": "Live-Zeitcode",
    "es": "Código horario en directo",
    "ja": "現在の時刻コード"
  },
  "Encoded time": {
    "it": "Ora codificata",
    "fr": "Heure encodée",
    "de": "Codierte Zeit",
    "es": "Hora codificada",
    "ja": "符号化された時刻"
  },
  "Time code symbols": {
    "it": "Simboli del codice orario",
    "fr": "Symboles du code horaire",
    "de": "Zeitcodesymbole",
    "es": "Símbolos del código horario",
    "ja": "時刻コードのシンボル"
  },
  "The time code describes the next minute.": {
    "it": "Il codice orario descrive il minuto successivo.",
    "fr": "Le code horaire décrit la minute suivante.",
    "de": "Der Zeitcode beschreibt die nächste Minute.",
    "es": "El código horario describe el minuto siguiente.",
    "ja": "時刻コードは次の分を表します。"
  },
  "Reading the signal": {
    "it": "Leggere il segnale",
    "fr": "Lire le signal",
    "de": "Das Signal lesen",
    "es": "Leer la señal",
    "ja": "信号の読み方"
  },
  "The highlighted box is the current second. The envelope and time code show a simulation of the generated signal, not a measurement of reception.": {
    "it": "Il riquadro evidenziato è il secondo attuale. Inviluppo e codice sono una simulazione, non una misura della ricezione.",
    "fr": "La case active est la seconde courante. Enveloppe et code simulent le signal, sans mesurer la réception.",
    "de": "Das markierte Feld zeigt die aktuelle Sekunde. Hüllkurve und Code sind simuliert und messen keinen Empfang.",
    "es": "La casilla resaltada es el segundo actual. La envolvente y el código son simulados, no miden la recepción.",
    "ja": "強調された枠が現在の秒です。波形と時刻コードは生成信号の模擬表示で、受信の測定結果ではありません。"
  },
  "Choose a compatible station": {
    "it": "Scegli una stazione compatibile",
    "fr": "Choisir une station compatible",
    "de": "Kompatiblen Sender wählen",
    "es": "Elige una emisora compatible",
    "ja": "対応する送信局を選ぶ"
  },
  "Your home city determines which stations the watch can receive. For use in Italy, select DCF77 and a compatible European city.": {
    "it": "La città base determina le stazioni ricevibili. In Italia, scegli DCF77 e una città europea compatibile.",
    "fr": "La ville de résidence détermine les stations reçues. En Italie, choisissez DCF77 et une ville européenne compatible.",
    "de": "Die Heimatstadt legt die Sender fest. In Italien DCF77 und eine passende europäische Stadt wählen.",
    "es": "La ciudad local determina las emisoras. En Italia, elige DCF77 y una ciudad europea compatible.",
    "ja": "ホーム都市で受信可能な局が決まります。イタリアではDCF77と対応するヨーロッパの都市を選びます。"
  },
  "Back to transmission →": {
    "it": "Torna alla trasmissione →",
    "fr": "Retour à l'émission →",
    "de": "Zurück zur Übertragung →",
    "es": "Volver a la transmisión →",
    "ja": "送信画面に戻る →"
  },
  "All trials": {
    "it": "Tutti i tentativi",
    "fr": "Tous les essais",
    "de": "Alle Versuche",
    "es": "Todos los intentos",
    "ja": "すべての記録"
  },
  "Clear": {
    "it": "Svuota",
    "fr": "Effacer",
    "de": "Leeren",
    "es": "Vaciar",
    "ja": "消去"
  },
  "← Previous": {
    "it": "← Precedente",
    "fr": "← Précédent",
    "de": "← Zurück",
    "es": "← Anterior",
    "ja": "← 前へ"
  },
  "Next →": {
    "it": "Successivo →",
    "fr": "Suivant →",
    "de": "Weiter →",
    "es": "Siguiente →",
    "ja": "次へ →"
  },
  "Outcomes entered by you · 8 trials per page · local archive.": {
    "it": "Esiti inseriti da te · 8 per pagina · archivio locale.",
    "fr": "Résultats saisis par vous · 8 par page · archive locale.",
    "de": "Ergebnisse selbst eingegeben · 8 pro Seite · lokal.",
    "es": "Resultados introducidos por ti · 8 por página · archivo local.",
    "ja": "結果は手動入力・1ページ8件・端末内に保存"
  },
  "Trial details": {
    "it": "Dettagli del tentativo",
    "fr": "Détails de l'essai",
    "de": "Versuchsdetails",
    "es": "Detalles del intento",
    "ja": "記録の詳細"
  },
  "← History": {
    "it": "← Cronologia",
    "fr": "← Historique",
    "de": "← Verlauf",
    "es": "← Historial",
    "ja": "← 履歴"
  },
  "Outcome on your Casio": {
    "it": "Esito sul tuo Casio",
    "fr": "Résultat sur votre Casio",
    "de": "Ergebnis am Casio",
    "es": "Resultado en tu Casio",
    "ja": "Casioでの受信結果"
  },
  "Not verified": {
    "it": "Non verificato",
    "fr": "Non vérifié",
    "de": "Nicht geprüft",
    "es": "Sin verificar",
    "ja": "未確認"
  },
  "GET · reception successful": {
    "it": "GET · ricezione riuscita",
    "fr": "GET · réception réussie",
    "de": "GET · Empfang erfolgreich",
    "es": "GET · recepción correcta",
    "ja": "GET · 受信成功"
  },
  "ERR · reception failed": {
    "it": "ERR · ricezione fallita",
    "fr": "ERR · échec de réception",
    "de": "ERR · Empfang fehlgeschlagen",
    "es": "ERR · recepción fallida",
    "ja": "ERR · 受信失敗"
  },
  "Save outcome": {
    "it": "Salva esito",
    "fr": "Enregistrer le résultat",
    "de": "Ergebnis speichern",
    "es": "Guardar resultado",
    "ja": "結果を保存"
  },
  "Use these settings": {
    "it": "Usa queste impostazioni",
    "fr": "Utiliser ces réglages",
    "de": "Einstellungen verwenden",
    "es": "Usar estos ajustes",
    "ja": "この設定を使う"
  },
  "You confirm the outcome. You can update it after transmission has finished.": {
    "it": "Confermi tu l'esito. Puoi aggiornarlo a trasmissione conclusa.",
    "fr": "Vous confirmez le résultat et pouvez le modifier après l'émission.",
    "de": "Du bestätigst das Ergebnis. Nach der Übertragung ist es änderbar.",
    "es": "Tú confirmas el resultado. Puedes cambiarlo al terminar la transmisión.",
    "ja": "結果はご自身で確認します。送信終了後も変更できます。"
  },
  "Watch profiles": {
    "it": "Profili orologio",
    "fr": "Profils de montres",
    "de": "Uhrenprofile",
    "es": "Perfiles de reloj",
    "ja": "時計のプロファイル"
  },
  "New profile": {
    "it": "Nuovo profilo",
    "fr": "Nouveau profil",
    "de": "Neues Profil",
    "es": "Nuevo perfil",
    "ja": "新しいプロファイル"
  },
  "＋ New watch": {
    "it": "＋ Nuovo orologio",
    "fr": "＋ Nouvelle montre",
    "de": "＋ Neue Uhr",
    "es": "＋ Nuevo reloj",
    "ja": "＋ 時計を追加"
  },
  "New watch": {
    "it": "Nuovo orologio",
    "fr": "Nouvelle montre",
    "de": "Neue Uhr",
    "es": "Nuevo reloj",
    "ja": "新しい時計"
  },
  "LOCAL": {
    "it": "LOCALE",
    "fr": "LOCAL",
    "de": "LOKAL",
    "es": "LOCAL",
    "ja": "ローカル"
  },
  "Profile name": {
    "it": "Nome profilo",
    "fr": "Nom du profil",
    "de": "Profilname",
    "es": "Nombre del perfil",
    "ja": "プロファイル名"
  },
  "My G-Shock": {
    "it": "Il mio G-Shock",
    "fr": "Mon G-Shock",
    "de": "Mein G-Shock",
    "es": "Mi G-Shock",
    "ja": "マイG-Shock"
  },
  "Model": {
    "it": "Modello",
    "fr": "Modèle",
    "de": "Modell",
    "es": "Modelo",
    "ja": "モデル"
  },
  "Home city on your Casio": {
    "it": "Città base sul Casio",
    "fr": "Ville de résidence du Casio",
    "de": "Heimatstadt am Casio",
    "es": "Ciudad local del Casio",
    "ja": "Casioのホーム都市"
  },
  "System volume note (%)": {
    "it": "Nota volume di sistema (%)",
    "fr": "Note de volume système (%)",
    "de": "Systemlautstärke (%)",
    "es": "Nota de volumen del sistema (%)",
    "ja": "システム音量のメモ（%）"
  },
  "Optional": {
    "it": "Facoltativo",
    "fr": "Facultatif",
    "de": "Optional",
    "es": "Opcional",
    "ja": "任意"
  },
  "Watch placement": {
    "it": "Posizione dell'orologio",
    "fr": "Position de la montre",
    "de": "Uhrenposition",
    "es": "Posición del reloj",
    "ja": "時計の置き方"
  },
  "E.g. 12 o’clock side near the left speaker": {
    "it": "Es. lato ore 12 vicino allo speaker sinistro",
    "fr": "Ex. côté 12 h près du haut-parleur gauche",
    "de": "Z. B. 12-Uhr-Seite am linken Lautsprecher",
    "es": "Ej. lado de las 12 junto al altavoz izquierdo",
    "ja": "例：12時側を左スピーカーの近くへ"
  },
  "Save current settings": {
    "it": "Salva impostazioni attuali",
    "fr": "Enregistrer les réglages",
    "de": "Aktuelle Werte speichern",
    "es": "Guardar ajustes actuales",
    "ja": "現在の設定を保存"
  },
  "Delete profile": {
    "it": "Elimina profilo",
    "fr": "Supprimer le profil",
    "de": "Profil löschen",
    "es": "Eliminar perfil",
    "ja": "プロファイルを削除"
  },
  "Home city, system volume and placement are notes; the app does not change them.": {
    "it": "Città base, volume e posizione sono note: l'app non li cambia.",
    "fr": "Ville, volume et position sont des notes ; l'app ne les modifie pas.",
    "de": "Heimatstadt, Lautstärke und Position sind Notizen; die App ändert sie nicht.",
    "es": "Ciudad, volumen y posición son notas; la app no los modifica.",
    "ja": "ホーム都市・音量・置き方はメモです。アプリが変更することはありません。"
  },
  "Settings to save": {
    "it": "Impostazioni da salvare",
    "fr": "Réglages à enregistrer",
    "de": "Zu speichernde Werte",
    "es": "Ajustes que guardar",
    "ja": "保存する設定"
  },
  "Adjust audio, channel and duration in Synchronize or Settings, then save the profile here.": {
    "it": "Regola audio, canale e durata in Sincronizza o Impostazioni, poi salva qui.",
    "fr": "Réglez audio, canal et durée dans Synchroniser ou Réglages, puis enregistrez ici.",
    "de": "Audio, Kanal und Dauer unter Synchronisieren oder Einstellungen anpassen, dann hier speichern.",
    "es": "Ajusta audio, canal y duración en Sincronizar o Ajustes y guarda aquí.",
    "ja": "時刻合わせや設定で音声・チャンネル・時間を調整して、ここで保存します。"
  },
  "Adjust transmission →": {
    "it": "Regola trasmissione →",
    "fr": "Régler l'émission →",
    "de": "Übertragung anpassen →",
    "es": "Ajustar transmisión →",
    "ja": "送信を調整 →"
  },
  "Last successful settings": {
    "it": "Ultime impostazioni riuscite",
    "fr": "Derniers réglages réussis",
    "de": "Letzte erfolgreiche Werte",
    "es": "Últimos ajustes correctos",
    "ja": "前回成功した設定"
  },
  "No confirmed trial for this watch yet.": {
    "it": "Ancora nessun tentativo confermato per questo orologio.",
    "fr": "Aucun essai confirmé pour cette montre.",
    "de": "Noch kein bestätigter Versuch für diese Uhr.",
    "es": "Aún no hay intentos confirmados para este reloj.",
    "ja": "この時計の受信成功はまだ記録されていません。"
  },
  "Restore successful settings": {
    "it": "Ripristina impostazioni riuscite",
    "fr": "Restaurer les réglages réussis",
    "de": "Erfolgreiche Werte laden",
    "es": "Restaurar ajustes correctos",
    "ja": "成功した設定に戻す"
  },
  "ISS Orbital Observatory": {
    "it": "Osservatorio orbitale ISS",
    "fr": "Observatoire orbital ISS",
    "de": "ISS-Orbitalobservatorium",
    "es": "Observatorio orbital ISS",
    "ja": "ISS軌道観測室"
  },
  "ISS views": {
    "it": "Viste ISS",
    "fr": "Vues ISS",
    "de": "ISS-Ansichten",
    "es": "Vistas de la ISS",
    "ja": "ISSの表示"
  },
  "Tracking": {
    "it": "Tracciamento",
    "fr": "Suivi",
    "de": "Verfolgung",
    "es": "Seguimiento",
    "ja": "追跡"
  },
  "Passes": {
    "it": "Passaggi",
    "fr": "Passages",
    "de": "Überflüge",
    "es": "Pasos",
    "ja": "通過予報"
  },
  "Time in Orbit": {
    "it": "Tempo in orbita",
    "fr": "Temps en orbite",
    "de": "Zeit im Orbit",
    "es": "Tiempo en órbita",
    "ja": "軌道上の時間"
  },
  "CONNECTING": {
    "it": "CONNESSIONE",
    "fr": "CONNEXION",
    "de": "VERBINDUNG",
    "es": "CONECTANDO",
    "ja": "接続中"
  },
  "Refresh ISS sources": {
    "it": "Aggiorna fonti ISS",
    "fr": "Actualiser les sources ISS",
    "de": "ISS-Quellen aktualisieren",
    "es": "Actualizar fuentes ISS",
    "ja": "ISSの情報を更新"
  },
  "EARTH / LOW ORBIT": {
    "it": "TERRA / ORBITA BASSA",
    "fr": "TERRE / ORBITE BASSE",
    "de": "ERDE / NIEDRIGER ORBIT",
    "es": "TIERRA / ÓRBITA BAJA",
    "ja": "地球・低軌道"
  },
  "ORBITAL ESTIMATE": {
    "it": "STIMA ORBITALE",
    "fr": "ESTIMATION ORBITALE",
    "de": "BAHNSCHÄTZUNG",
    "es": "ESTIMACIÓN ORBITAL",
    "ja": "軌道からの推定"
  },
  "Geometric area where the ISS is above the horizon; this does not guarantee optical visibility or radio reception.": {
    "it": "Area geometrica dove l'ISS supera l'orizzonte; non garantisce visibilità o ricezione radio.",
    "fr": "Zone où l'ISS est au-dessus de l'horizon, sans garantie de visibilité ni de réception radio.",
    "de": "Gebiet mit ISS über dem Horizont; keine Garantie für Sichtbarkeit oder Funkempfang.",
    "es": "Zona donde la ISS supera el horizonte; no garantiza visibilidad ni recepción de radio.",
    "ja": "ISSが地平線より上にある幾何学的な範囲です。可視性や電波受信は保証しません。"
  },
  "Horizon footprint": {
    "it": "Area sopra l'orizzonte",
    "fr": "Empreinte d'horizon",
    "de": "Horizontbereich",
    "es": "Área sobre el horizonte",
    "ja": "地平線内の範囲"
  },
  "Ground track": {
    "it": "Traccia al suolo",
    "fr": "Trace au sol",
    "de": "Bodenspur",
    "es": "Trayectoria terrestre",
    "ja": "地上軌跡"
  },
  "ISS position, predicted ground track and day-night map": {
    "it": "Posizione ISS, traccia prevista e mappa giorno-notte",
    "fr": "Position ISS, trajectoire prévue et carte jour-nuit",
    "de": "ISS-Position, vorhergesagte Bodenspur und Tag-Nacht-Karte",
    "es": "Posición ISS, trayectoria prevista y mapa día-noche",
    "ja": "ISSの位置・予測軌跡・昼夜の地図"
  },
  "Acquiring orbital elements…": {
    "it": "Acquisizione elementi orbitali…",
    "fr": "Acquisition des éléments orbitaux…",
    "de": "Bahnelemente werden geladen…",
    "es": "Obteniendo elementos orbitales…",
    "ja": "軌道要素を取得中…"
  },
  "Predicted +90 min": {
    "it": "Previsto +90 min",
    "fr": "Prévu +90 min",
    "de": "Prognose +90 min",
    "es": "Previsto +90 min",
    "ja": "予測 +90分"
  },
  "┄ Predicted −45 min": {
    "it": "┄ Previsto −45 min",
    "fr": "┄ Prévu −45 min",
    "de": "┄ Prognose −45 min",
    "es": "┄ Previsto −45 min",
    "ja": "┄ 予測 −45分"
  },
  "Explore orbit": {
    "it": "Esplora l'orbita",
    "fr": "Explorer l'orbite",
    "de": "Orbit erkunden",
    "es": "Explorar la órbita",
    "ja": "軌道を調べる"
  },
  "Orbit preview offset in minutes": {
    "it": "Scostamento anteprima orbitale in minuti",
    "fr": "Décalage d'aperçu orbital en minutes",
    "de": "Orbitvorschau-Versatz in Minuten",
    "es": "Desplazamiento de la vista orbital en minutos",
    "ja": "軌道プレビューの時差（分）"
  },
  "Now": {
    "it": "Ora",
    "fr": "Maintenant",
    "de": "Jetzt",
    "es": "Ahora",
    "ja": "現在"
  },
  "INTERNATIONAL SPACE STATION": {
    "it": "STAZIONE SPAZIALE INTERNAZIONALE",
    "fr": "STATION SPATIALE INTERNATIONALE",
    "de": "INTERNATIONALE RAUMSTATION",
    "es": "ESTACIÓN ESPACIAL INTERNACIONAL",
    "ja": "国際宇宙ステーション"
  },
  "ORBITAL VELOCITY": {
    "it": "VELOCITÀ ORBITALE",
    "fr": "VITESSE ORBITALE",
    "de": "BAHNGESCHWINDIGKEIT",
    "es": "VELOCIDAD ORBITAL",
    "ja": "軌道速度"
  },
  "km/h · orbital estimate": {
    "it": "km/h · stima orbitale",
    "fr": "km/h · estimation orbitale",
    "de": "km/h · Bahnschätzung",
    "es": "km/h · estimación orbital",
    "ja": "km/h · 軌道からの推定"
  },
  "One orbit": {
    "it": "Un'orbita",
    "fr": "Une orbite",
    "de": "Ein Umlauf",
    "es": "Una órbita",
    "ja": "1周の時間"
  },
  "Illumination": {
    "it": "Illuminazione",
    "fr": "Éclairement",
    "de": "Beleuchtung",
    "es": "Iluminación",
    "ja": "照明状態"
  },
  "Inclination": {
    "it": "Inclinazione",
    "fr": "Inclinaison",
    "de": "Bahnneigung",
    "es": "Inclinación",
    "ja": "軌道傾斜角"
  },
  "Orbits / day": {
    "it": "Orbite / giorno",
    "fr": "Orbites / jour",
    "de": "Umläufe / Tag",
    "es": "Órbitas / día",
    "ja": "1日の周回数"
  },
  "ABOVE EARTH": {
    "it": "SOPRA LA TERRA",
    "fr": "AU-DESSUS DE LA TERRE",
    "de": "ÜBER DER ERDE",
    "es": "SOBRE LA TIERRA",
    "ja": "地球上空"
  },
  "Waiting for position": {
    "it": "In attesa della posizione",
    "fr": "En attente de position",
    "de": "Warte auf Position",
    "es": "Esperando posición",
    "ja": "位置情報を待機中"
  },
  "No position received yet": {
    "it": "Nessuna posizione ricevuta",
    "fr": "Aucune position reçue",
    "de": "Noch keine Position empfangen",
    "es": "Aún no se recibió posición",
    "ja": "位置情報は未取得です"
  },
  "YOUR OBSERVING LOCATION": {
    "it": "IL TUO PUNTO DI OSSERVAZIONE",
    "fr": "VOTRE LIEU D'OBSERVATION",
    "de": "DEIN BEOBACHTUNGSORT",
    "es": "TU LUGAR DE OBSERVACIÓN",
    "ja": "あなたの観測地点"
  },
  "DISTANCE TO ISS": {
    "it": "DISTANZA DALL'ISS",
    "fr": "DISTANCE DE L'ISS",
    "de": "ENTFERNUNG ZUR ISS",
    "es": "DISTANCIA A LA ISS",
    "ja": "ISSまでの距離"
  },
  "LOOK TOWARDS": {
    "it": "GUARDA VERSO",
    "fr": "REGARDEZ VERS",
    "de": "BLICKRICHTUNG",
    "es": "MIRA HACIA",
    "ja": "見る方向"
  },
  "Awaiting orbit": {
    "it": "In attesa dell'orbita",
    "fr": "En attente d'orbite",
    "de": "Warte auf Bahndaten",
    "es": "Esperando órbita",
    "ja": "軌道情報を待機中"
  },
  "NEXT POTENTIALLY VISIBLE PASS": {
    "it": "PROSSIMO PASSAGGIO POTENZIALMENTE VISIBILE",
    "fr": "PROCHAIN PASSAGE POTENTIELLEMENT VISIBLE",
    "de": "NÄCHSTER MÖGLICHER SICHTBARER ÜBERFLUG",
    "es": "PRÓXIMO PASO POTENCIALMENTE VISIBLE",
    "ja": "次に見える可能性のある通過"
  },
  "Calculating…": {
    "it": "Calcolo…",
    "fr": "Calcul…",
    "de": "Berechnung…",
    "es": "Calculando…",
    "ja": "計算中…"
  },
  "Uses your World View city": {
    "it": "Usa la città della Mappa del mondo",
    "fr": "Utilise votre ville de la carte",
    "de": "Nutzt deinen Ort auf der Weltkarte",
    "es": "Usa tu ciudad del mapa",
    "ja": "ワールドビューの都市を使用"
  },
  "Your next encounters": {
    "it": "I prossimi incontri",
    "fr": "Vos prochaines rencontres",
    "de": "Deine nächsten Begegnungen",
    "es": "Tus próximos encuentros",
    "ja": "これからの通過"
  },
  "Passes for Rome · next 48 hours": {
    "it": "Passaggi per Roma · prossime 48 ore",
    "fr": "Passages à Rome · prochaines 48 h",
    "de": "Überflüge für Rom · nächste 48 Stunden",
    "es": "Pasos sobre Roma · próximas 48 horas",
    "ja": "ローマの通過予報・今後48時間"
  },
  "Potentially visible only": {
    "it": "Solo potenzialmente visibili",
    "fr": "Visibles potentiellement",
    "de": "Nur möglicherweise sichtbar",
    "es": "Solo potencialmente visibles",
    "ja": "見える可能性のある通過のみ"
  },
  "ISS passes": {
    "it": "Passaggi ISS",
    "fr": "Passages ISS",
    "de": "ISS-Überflüge",
    "es": "Pasos de la ISS",
    "ja": "ISSの通過"
  },
  "*Visibility is estimated: ISS above 10°, sunlit, and Sun below −6° at your city. Weather and obstacles are not modeled.": {
    "it": "*Stima: ISS oltre 10°, illuminata e Sole sotto −6° nella tua città. Meteo e ostacoli non considerati.",
    "fr": "*Estimation : ISS au-dessus de 10°, éclairée, Soleil sous −6°. Météo et obstacles non modélisés.",
    "de": "*Schätzung: ISS über 10°, beleuchtet, Sonne am Ort unter −6°. Wetter und Hindernisse fehlen.",
    "es": "*Estimación: ISS sobre 10°, iluminada y Sol bajo −6°. No incluye clima ni obstáculos.",
    "ja": "*ISSの高度10°超・日照あり・現地の太陽高度−6°未満で可視と推定。天候や障害物は考慮しません。"
  },
  "YOUR VIEW OF THE SKY": {
    "it": "IL CIELO DAL TUO PUNTO DI VISTA",
    "fr": "VOTRE VUE DU CIEL",
    "de": "DEIN BLICK ZUM HIMMEL",
    "es": "TU VISTA DEL CIELO",
    "ja": "あなたの空の眺め"
  },
  "Sky diagram of selected ISS pass": {
    "it": "Schema del cielo del passaggio selezionato",
    "fr": "Diagramme du passage sélectionné",
    "de": "Himmelsdiagramm des gewählten Überflugs",
    "es": "Diagrama del paso seleccionado",
    "ja": "選択した通過の星空図"
  },
  "Select a pass to explore its path across your sky.": {
    "it": "Scegli un passaggio per esplorare il percorso nel cielo.",
    "fr": "Choisissez un passage pour voir sa trajectoire.",
    "de": "Überflug wählen, um seinen Himmelsweg zu sehen.",
    "es": "Elige un paso para explorar su trayectoria.",
    "ja": "通過を選んで空での経路を確認します。"
  },
  "Preview on the map ↗": {
    "it": "Anteprima sulla mappa ↗",
    "fr": "Aperçu sur la carte ↗",
    "de": "Auf der Karte ansehen ↗",
    "es": "Vista previa en el mapa ↗",
    "ja": "地図でプレビュー ↗"
  },
  "A LABORATORY ABOVE BORDERS": {
    "it": "UN LABORATORIO SENZA FRONTIERE",
    "fr": "UN LABORATOIRE SANS FRONTIÈRES",
    "de": "EIN LABOR OHNE GRENZEN",
    "es": "UN LABORATORIO SIN FRONTERAS",
    "ja": "国境を越える研究室"
  },
  "Humanity’s": {
    "it": "L'avamposto",
    "fr": "L'avant-poste",
    "de": "Der Außenposten",
    "es": "El puesto avanzado",
    "ja": "人類の"
  },
  "orbital outpost": {
    "it": "orbitale dell'umanità",
    "fr": "orbital de l'humanité",
    "de": "der Menschheit im Orbit",
    "es": "orbital de la humanidad",
    "ja": "軌道上の拠点"
  },
  "A continuously inhabited laboratory, travelling through sunrise and sunset roughly every 90 minutes.": {
    "it": "Un laboratorio abitato ininterrottamente, tra albe e tramonti ogni 90 minuti circa.",
    "fr": "Un laboratoire habité en permanence, entre lever et coucher du Soleil toutes les 90 minutes.",
    "de": "Ein ständig bewohntes Labor mit Sonnenauf- und -untergängen etwa alle 90 Minuten.",
    "es": "Un laboratorio habitado de forma continua, entre amaneceres y atardeceres cada 90 minutos.",
    "ja": "継続して人が暮らす研究室。約90分ごとに日の出と日の入りを迎えます。"
  },
  "Current crew & visiting vehicles ↗": {
    "it": "Equipaggio e veicoli in visita ↗",
    "fr": "Équipage et véhicules visiteurs ↗",
    "de": "Besatzung und Besuchsfahrzeuge ↗",
    "es": "Tripulación y vehículos visitantes ↗",
    "ja": "乗組員と訪問機 ↗"
  },
  "Watch official live views ↗": {
    "it": "Guarda le dirette ufficiali ↗",
    "fr": "Voir les directs officiels ↗",
    "de": "Offizielle Livebilder ansehen ↗",
    "es": "Ver emisiones oficiales ↗",
    "ja": "公式のライブ映像 ↗"
  },
  "FIRST MODULE": {
    "it": "PRIMO MODULO",
    "fr": "PREMIER MODULE",
    "de": "ERSTES MODUL",
    "es": "PRIMER MÓDULO",
    "ja": "最初のモジュール"
  },
  "Assembly began with Zarya, followed by an international construction effort in orbit.": {
    "it": "L'assemblaggio iniziò con Zarya, poi proseguì con un'impresa internazionale in orbita.",
    "fr": "L'assemblage débute avec Zarya, puis se poursuit par une coopération internationale en orbite.",
    "de": "Der Aufbau begann mit Sarja und wurde international im Orbit fortgesetzt.",
    "es": "El montaje empezó con Zarya y continuó con un esfuerzo internacional en órbita.",
    "ja": "ザーリャから組み立てが始まり、国際協力による軌道上の建設が続きました。"
  },
  "CONTINUOUS HUMAN PRESENCE": {
    "it": "PRESENZA UMANA CONTINUA",
    "fr": "PRÉSENCE HUMAINE CONTINUE",
    "de": "STÄNDIGE MENSCHLICHE PRÄSENZ",
    "es": "PRESENCIA HUMANA CONTINUA",
    "ja": "途切れることのない滞在"
  },
  "Since 2000": {
    "it": "Dal 2000",
    "fr": "Depuis 2000",
    "de": "Seit 2000",
    "es": "Desde 2000",
    "ja": "2000年から"
  },
  "Expedition 1 arrived on 2 November. Crews have lived and worked aboard ever since.": {
    "it": "Expedition 1 arrivò il 2 novembre. Da allora gli equipaggi vivono e lavorano a bordo.",
    "fr": "Expedition 1 arrive le 2 novembre. Depuis, des équipages vivent et travaillent à bord.",
    "de": "Expedition 1 kam am 2. November an. Seitdem leben und arbeiten Besatzungen an Bord.",
    "es": "Expedición 1 llegó el 2 de noviembre. Desde entonces hay tripulaciones a bordo.",
    "ja": "11月2日に第1次長期滞在が開始。以来、乗組員が暮らし、働き続けています。"
  },
  "THE CLOCK ON BOARD": {
    "it": "L'OROLOGIO A BORDO",
    "fr": "L'HORLOGE À BORD",
    "de": "DIE UHR AN BORD",
    "es": "EL RELOJ A BORDO",
    "ja": "船内の時計"
  },
  "A shared time reference connects daily operations across mission control centres and time zones.": {
    "it": "Un riferimento comune collega le attività tra centri di controllo e fusi orari.",
    "fr": "Une référence commune relie les opérations entre centres de contrôle et fuseaux horaires.",
    "de": "Eine gemeinsame Zeitbasis verbindet Betrieb, Kontrollzentren und Zeitzonen.",
    "es": "Una referencia común coordina las operaciones entre centros de control y husos horarios.",
    "ja": "共通の基準時刻で、管制センターや異なるタイムゾーンの活動を結びます。"
  },
  "MICROGRAVITY": {
    "it": "MICROGRAVITÀ",
    "fr": "MICROPESANTEUR",
    "de": "MIKROGRAVITATION",
    "es": "MICROGRAVEDAD",
    "ja": "微小重力"
  },
  "Free fall": {
    "it": "Caduta libera",
    "fr": "Chute libre",
    "de": "Freier Fall",
    "es": "Caída libre",
    "ja": "自由落下"
  },
  "The station and its crew fall around Earth together, creating a laboratory for science in microgravity.": {
    "it": "Stazione ed equipaggio cadono insieme attorno alla Terra, creando un laboratorio in microgravità.",
    "fr": "Station et équipage tombent ensemble autour de la Terre, offrant un laboratoire en micropesanteur.",
    "de": "Station und Besatzung fallen gemeinsam um die Erde und schaffen ein Labor in Mikrogravitation.",
    "es": "Estación y tripulación caen juntas alrededor de la Tierra y crean un laboratorio de microgravedad.",
    "ja": "ステーションと乗組員は共に地球の周りを落下し、微小重力の研究環境を生みます。"
  },
  "KEEPING THE ORBIT": {
    "it": "MANTENERE L'ORBITA",
    "fr": "MAINTENIR L'ORBITE",
    "de": "DEN ORBIT HALTEN",
    "es": "MANTENER LA ÓRBITA",
    "ja": "軌道の維持"
  },
  "Reboosts": {
    "it": "Rialzi orbitali",
    "fr": "Rehaussements",
    "de": "Bahnanhebungen",
    "es": "Elevaciones orbitales",
    "ja": "軌道を上げる噴射"
  },
  "Thin upper-atmosphere drag lowers the orbit. Periodic engine burns raise and reshape it.": {
    "it": "L'atmosfera rarefatta abbassa l'orbita. Accensioni periodiche la rialzano e la correggono.",
    "fr": "La traînée réduit l'altitude. Des poussées périodiques rehaussent et ajustent l'orbite.",
    "de": "Atmosphärischer Widerstand senkt die Bahn. Regelmäßige Schubmanöver heben und korrigieren sie.",
    "es": "El rozamiento reduce la órbita. Encendidos periódicos la elevan y corrigen.",
    "ja": "薄い大気の抵抗で軌道が下がるため、定期的な噴射で高度と軌道を調整します。"
  },
  "GLOBAL COLLABORATION": {
    "it": "COLLABORAZIONE GLOBALE",
    "fr": "COOPÉRATION MONDIALE",
    "de": "GLOBALE ZUSAMMENARBEIT",
    "es": "COOPERACIÓN GLOBAL",
    "ja": "世界の協力"
  },
  "5 agencies": {
    "it": "5 agenzie",
    "fr": "5 agences",
    "de": "5 Raumfahrtagenturen",
    "es": "5 agencias",
    "ja": "5つの宇宙機関"
  },
  "NASA, Roscosmos, ESA, JAXA and CSA contribute to the international partnership.": {
    "it": "NASA, Roscosmos, ESA, JAXA e CSA partecipano alla collaborazione internazionale.",
    "fr": "NASA, Roscosmos, ESA, JAXA et ASC participent au partenariat international.",
    "de": "NASA, Roskosmos, ESA, JAXA und CSA tragen die internationale Partnerschaft.",
    "es": "NASA, Roscosmos, ESA, JAXA y CSA participan en la colaboración internacional.",
    "ja": "NASA、ロスコスモス、ESA、JAXA、CSAが国際協力を支えています。"
  },
  "A DIFFERENT PACE OF TIME": {
    "it": "UN RITMO DIVERSO DEL TEMPO",
    "fr": "UN AUTRE RYTHME DU TEMPS",
    "de": "EIN ANDERER ZEITTAKT",
    "es": "OTRO RITMO DEL TIEMPO",
    "ja": "異なる時間の進み方"
  },
  "A day in orbit.": {
    "it": "Un giorno in orbita.",
    "fr": "Un jour en orbite.",
    "de": "Ein Tag im Orbit.",
    "es": "Un día en órbita.",
    "ja": "軌道上の一日。"
  },
  "A tiny difference": {
    "it": "Una minuscola differenza",
    "fr": "Une infime différence",
    "de": "Ein winziger Unterschied",
    "es": "Una diferencia diminuta",
    "ja": "ごく小さな違い"
  },
  "Gravity and motion affect how clocks tick. Compare an orbital clock with an ideal, non-rotating sea-level reference.": {
    "it": "Gravità e moto influenzano gli orologi. Confronta un orologio orbitale con un riferimento ideale, fermo al livello del mare.",
    "fr": "Gravité et mouvement modifient le temps. Comparez une horloge orbitale à une référence idéale, immobile au niveau de la mer.",
    "de": "Gravitation und Bewegung beeinflussen Uhren. Vergleiche eine Orbitaluhr mit einer idealen, nicht rotierenden Referenz auf Meereshöhe.",
    "es": "Gravedad y movimiento afectan a los relojes. Compara un reloj orbital con una referencia ideal, sin rotación y al nivel del mar.",
    "ja": "重力と運動は時計の進み方に影響します。軌道上の時計を、海面高度で回転しない理想的な時計と比べます。"
  },
  "microseconds per Earth day": {
    "it": "microsecondi per giorno terrestre",
    "fr": "microsecondes par jour terrestre",
    "de": "Mikrosekunden pro Erdtag",
    "es": "microsegundos por día terrestre",
    "ja": "地球の一日あたりのマイクロ秒"
  },
  "Weaker gravity": {
    "it": "Gravità più debole",
    "fr": "Gravité plus faible",
    "de": "Schwächere Gravitation",
    "es": "Gravedad más débil",
    "ja": "弱い重力"
  },
  "Orbital motion": {
    "it": "Moto orbitale",
    "fr": "Mouvement orbital",
    "de": "Bahnbewegung",
    "es": "Movimiento orbital",
    "ja": "軌道上の運動"
  },
  "Illustrative orbit · 420 km · 7.67 km/s": {
    "it": "Orbita illustrativa · 420 km · 7,67 km/s",
    "fr": "Orbite illustrative · 420 km · 7,67 km/s",
    "de": "Beispielbahn · 420 km · 7,67 km/s",
    "es": "Órbita ilustrativa · 420 km · 7,67 km/s",
    "ja": "参考の軌道 · 420 km · 7.67 km/s"
  },
  "Over six months": {
    "it": "In sei mesi",
    "fr": "Sur six mois",
    "de": "Über sechs Monate",
    "es": "En seis meses",
    "ja": "6か月間では"
  },
  "Approximation assuming a constant orbit": {
    "it": "Approssimazione con orbita costante",
    "fr": "Approximation à orbite constante",
    "de": "Näherung bei konstanter Bahn",
    "es": "Aproximación con órbita constante",
    "ja": "一定の軌道を仮定した概算"
  },
  "Educational weak-field model. Earth rotation, geoid variation and real clock corrections are omitted. This is not an ACES measurement.": {
    "it": "Modello didattico a campo debole. Non include rotazione terrestre, geoide e correzioni reali. Non è una misura ACES.",
    "fr": "Modèle pédagogique en champ faible. Rotation terrestre, géoïde et corrections réelles omis. Ce n'est pas une mesure ACES.",
    "de": "Lehrmodell im schwachen Feld. Erdrotation, Geoid und reale Korrekturen fehlen. Keine ACES-Messung.",
    "es": "Modelo didáctico de campo débil. Omite rotación terrestre, geoide y correcciones reales. No es una medición ACES.",
    "ja": "弱い重力場での学習用モデルです。地球の自転・ジオイド・実際の補正は省略。ACESの測定ではありません。"
  },
  "ATOMIC CLOCK ENSEMBLE IN SPACE": {
    "it": "OROLOGI ATOMICI NELLO SPAZIO",
    "fr": "HORLOGES ATOMIQUES DANS L'ESPACE",
    "de": "ATOMUHREN IM WELTRAUM",
    "es": "RELOJES ATÓMICOS EN EL ESPACIO",
    "ja": "宇宙の原子時計"
  },
  "The ISS carries": {
    "it": "L'ISS trasporta",
    "fr": "L'ISS transporte",
    "de": "Die ISS trägt",
    "es": "La ISS lleva",
    "ja": "ISSに搭載された"
  },
  "atomic clocks": {
    "it": "orologi atomici",
    "fr": "des horloges atomiques",
    "de": "Atomuhren",
    "es": "relojes atómicos",
    "ja": "原子時計"
  },
  "PHARAO / CAESIUM": {
    "it": "PHARAO / CESIO",
    "fr": "PHARAO / CÉSIUM",
    "de": "PHARAO / CÄSIUM",
    "es": "PHARAO / CESIO",
    "ja": "PHARAO / セシウム"
  },
  "SHM / HYDROGEN MASER": {
    "it": "SHM / MASER A IDROGENO",
    "fr": "SHM / MASER À HYDROGÈNE",
    "de": "SHM / WASSERSTOFFMASER",
    "es": "SHM / MÁSER DE HIDRÓGENO",
    "ja": "SHM / 水素メーザー"
  },
  "ESA’s ACES facility was installed outside the Columbus laboratory in April 2025. Its clocks and time-transfer links compare the passage of time in space and on Earth.": {
    "it": "ACES dell'ESA è stato installato fuori dal laboratorio Columbus ad aprile 2025. Orologi e collegamenti confrontano il tempo nello spazio e sulla Terra.",
    "fr": "ACES de l'ESA est installé à l'extérieur de Columbus en avril 2025. Ses horloges et liaisons comparent le temps dans l'espace et sur Terre.",
    "de": "Die ESA-Anlage ACES wurde im April 2025 außen an Columbus installiert. Uhren und Zeitübertragung vergleichen den Zeitablauf im All und auf der Erde.",
    "es": "ACES de la ESA se instaló fuera de Columbus en abril de 2025. Sus relojes y enlaces comparan el tiempo en el espacio y la Tierra.",
    "ja": "ESAのACESは2025年4月にコロンバス実験棟の外に設置。原子時計と時刻伝送で、宇宙と地球の時間の進み方を比較します。"
  },
  "It connects fundamental physics with the same question behind this app: how precisely can we share time?": {
    "it": "Unisce fisica fondamentale e la domanda di quest'app: con quanta precisione possiamo condividere il tempo?",
    "fr": "Il relie la physique à notre question : avec quelle précision partager le temps ?",
    "de": "Er verbindet Grundlagenphysik mit der Frage dieser App: Wie genau lässt sich Zeit teilen?",
    "es": "Une la física con la pregunta de esta app: ¿con qué precisión podemos compartir el tiempo?",
    "ja": "基礎物理とこのアプリの問いをつなぎます。どこまで正確に時刻を共有できるのでしょう？"
  },
  "Explore the ACES mission ↗": {
    "it": "Esplora la missione ACES ↗",
    "fr": "Explorer la mission ACES ↗",
    "de": "ACES-Mission erkunden ↗",
    "es": "Explorar la misión ACES ↗",
    "ja": "ACESミッションを見る ↗"
  },
  "Mission information · no onboard clock feed is received.": {
    "it": "Informazioni sulla missione · nessun dato orario ricevuto da bordo.",
    "fr": "Informations de mission · aucune donnée d'horloge reçue à bord.",
    "de": "Missionsinfos · keine Borduhrdaten empfangen.",
    "es": "Información de la misión · no se reciben datos de relojes a bordo.",
    "ja": "ミッション情報です。船内の時計データを受信していません。"
  },
  "Fetching public ISS sources on first visit.": {
    "it": "Recupero delle fonti ISS alla prima visita.",
    "fr": "Chargement des sources ISS à la première visite.",
    "de": "ISS-Quellen werden beim ersten Besuch geladen.",
    "es": "Cargando fuentes ISS en la primera visita.",
    "ja": "初回表示時にISSの公開データを取得します。"
  },
  "No cached orbit": {
    "it": "Nessuna orbita in cache",
    "fr": "Aucune orbite en cache",
    "de": "Keine gespeicherte Bahn",
    "es": "Sin órbita en caché",
    "ja": "保存された軌道なし"
  },
  "Sources ↗": {
    "it": "Fonti ↗",
    "fr": "Sources ↗",
    "de": "Quellen ↗",
    "es": "Fuentes ↗",
    "ja": "出典 ↗"
  },
  "Find a city on Earth…": {
    "it": "Cerca una città sulla Terra…",
    "fr": "Chercher une ville sur Terre…",
    "de": "Einen Ort auf der Erde suchen…",
    "es": "Buscar una ciudad en la Tierra…",
    "ja": "地球上の都市を探す…"
  },
  "Find a city": {
    "it": "Cerca una città",
    "fr": "Chercher une ville",
    "de": "Ort suchen",
    "es": "Buscar una ciudad",
    "ja": "都市を検索"
  },
  "Matching cities": {
    "it": "Città trovate",
    "fr": "Villes trouvées",
    "de": "Gefundene Orte",
    "es": "Ciudades encontradas",
    "ja": "一致する都市"
  },
  "Offline city atlas": {
    "it": "Atlante offline delle città",
    "fr": "Atlas des villes hors ligne",
    "de": "Offline-Ortsatlas",
    "es": "Atlas de ciudades sin conexión",
    "ja": "オフライン都市地図"
  },
  "Coverage": {
    "it": "Copertura",
    "fr": "Couverture",
    "de": "Reichweite",
    "es": "Cobertura",
    "ja": "受信範囲"
  },
  "Off": {
    "it": "Spenta",
    "fr": "Désactivée",
    "de": "Aus",
    "es": "Desactivada",
    "ja": "オフ"
  },
  "Selected": {
    "it": "Selezionata",
    "fr": "Sélectionnée",
    "de": "Gewählt",
    "es": "Seleccionada",
    "ja": "選択した局"
  },
  "All stations": {
    "it": "Tutte le stazioni",
    "fr": "Toutes les stations",
    "de": "Alle Sender",
    "es": "Todas las emisoras",
    "ja": "すべての送信局"
  },
  "Show civil, nautical and astronomical twilight boundaries": {
    "it": "Mostra i confini del crepuscolo civile, nautico e astronomico",
    "fr": "Afficher les limites des crépuscules civil, nautique et astronomique",
    "de": "Bürgerliche, nautische und astronomische Dämmerung anzeigen",
    "es": "Mostrar los límites del crepúsculo civil, náutico y astronómico",
    "ja": "市民薄明・航海薄明・天文薄明の境界を表示"
  },
  "Twilight lines": {
    "it": "Linee crepuscolari",
    "fr": "Lignes du crépuscule",
    "de": "Dämmerungslinien",
    "es": "Líneas de crepúsculo",
    "ja": "薄明の境界"
  },
  "Day and night atlas": {
    "it": "Atlante giorno e notte",
    "fr": "Atlas jour et nuit",
    "de": "Tag-Nacht-Atlas",
    "es": "Atlas de día y noche",
    "ja": "昼と夜の地図"
  },
  "EARTH / SOLAR OBSERVATORY": {
    "it": "TERRA / OSSERVATORIO SOLARE",
    "fr": "TERRE / OBSERVATOIRE SOLAIRE",
    "de": "ERDE / SONNENOBSERVATORIUM",
    "es": "TIERRA / OBSERVATORIO SOLAR",
    "ja": "地球・太陽観測室"
  },
  "SUBSOLAR POINT": {
    "it": "PUNTO SUBSOLARE",
    "fr": "POINT SUBSOLAIRE",
    "de": "SUBSOLARER PUNKT",
    "es": "PUNTO SUBSOLAR",
    "ja": "太陽直下点"
  },
  "Vector world map with sunlight, city lights and five time-signal stations": {
    "it": "Mappa vettoriale con Sole, luci delle città e cinque stazioni orarie",
    "fr": "Carte vectorielle avec Soleil, lumières urbaines et cinq stations horaires",
    "de": "Vektorkarte mit Sonnenlicht, Stadtlichtern und fünf Zeitzeichensendern",
    "es": "Mapa vectorial con Sol, luces urbanas y cinco emisoras horarias",
    "ja": "日照・街の明かり・5つの時刻送信局を示すベクター地図"
  },
  "Preparing your view of Earth…": {
    "it": "Preparazione della vista della Terra…",
    "fr": "Préparation de la vue de la Terre…",
    "de": "Erdansicht wird vorbereitet…",
    "es": "Preparando la vista de la Tierra…",
    "ja": "地球の表示を準備中…"
  },
  "City lights · illustrative": {
    "it": "Luci delle città · illustrative",
    "fr": "Lumières urbaines · illustration",
    "de": "Stadtlichter · illustrativ",
    "es": "Luces urbanas · ilustrativas",
    "ja": "街の明かり・模式表示"
  },
  "Approximate radio coverage · Casio 3179": {
    "it": "Copertura radio approssimativa · Casio 3179",
    "fr": "Couverture radio approximative · Casio 3179",
    "de": "Ungefähre Funkreichweite · Casio 3179",
    "es": "Cobertura de radio aproximada · Casio 3179",
    "ja": "電波範囲の目安 · Casio 3179"
  },
  "Cities: GeoNames, CC BY 4.0. Map: Natural Earth, public domain. See docs/THIRD_PARTY.md for full credits.": {
    "it": "Città: GeoNames, CC BY 4.0. Mappa: Natural Earth, pubblico dominio. Crediti in docs/THIRD_PARTY.md.",
    "fr": "Villes : GeoNames, CC BY 4.0. Carte : Natural Earth, domaine public. Crédits : docs/THIRD_PARTY.md.",
    "de": "Orte: GeoNames, CC BY 4.0. Karte: Natural Earth, gemeinfrei. Quellen: docs/THIRD_PARTY.md.",
    "es": "Ciudades: GeoNames, CC BY 4.0. Mapa: Natural Earth, dominio público. Créditos: docs/THIRD_PARTY.md.",
    "ja": "都市：GeoNames（CC BY 4.0）。地図：Natural Earth（パブリックドメイン）。詳細はdocs/THIRD_PARTY.md。"
  },
  "YOUR PLACE ON EARTH": {
    "it": "IL TUO POSTO SULLA TERRA",
    "fr": "VOTRE PLACE SUR TERRE",
    "de": "DEIN ORT AUF DER ERDE",
    "es": "TU LUGAR EN LA TIERRA",
    "ja": "地球上のあなたの場所"
  },
  "Italy": {
    "it": "Italia",
    "fr": "Italie",
    "de": "Italien",
    "es": "Italia",
    "ja": "イタリア"
  },
  "Sunrise": {
    "it": "Alba",
    "fr": "Lever du Soleil",
    "de": "Sonnenaufgang",
    "es": "Amanecer",
    "ja": "日の出"
  },
  "Sunset": {
    "it": "Tramonto",
    "fr": "Coucher du Soleil",
    "de": "Sonnenuntergang",
    "es": "Atardecer",
    "ja": "日の入り"
  },
  "Day length": {
    "it": "Durata del giorno",
    "fr": "Durée du jour",
    "de": "Tageslänge",
    "es": "Duración del día",
    "ja": "昼の長さ"
  },
  "TIME SIGNAL STATION": {
    "it": "STAZIONE DI SEGNALE ORARIO",
    "fr": "STATION DE SIGNAL HORAIRE",
    "de": "ZEITZEICHENSENDER",
    "es": "EMISORA DE SEÑAL HORARIA",
    "ja": "時刻信号の送信局"
  },
  "Explore a station": {
    "it": "Esplora una stazione",
    "fr": "Explorer une station",
    "de": "Sender erkunden",
    "es": "Explorar una emisora",
    "ja": "送信局を調べる"
  },
  "Use DCF77 ↗": {
    "it": "Usa DCF77 ↗",
    "fr": "Utiliser DCF77 ↗",
    "de": "DCF77 verwenden ↗",
    "es": "Usar DCF77 ↗",
    "ja": "DCF77を使用 ↗"
  },
  "Explore time": {
    "it": "Esplora il tempo",
    "fr": "Explorer le temps",
    "de": "Zeit erkunden",
    "es": "Explorar el tiempo",
    "ja": "時間を調べる"
  },
  "Play accelerated day": {
    "it": "Riproduci giorno accelerato",
    "fr": "Lire une journée accélérée",
    "de": "Zeitraffertag starten",
    "es": "Reproducir día acelerado",
    "ja": "一日を早送り"
  },
  "UTC preview date": {
    "it": "Data anteprima UTC",
    "fr": "Date d'aperçu UTC",
    "de": "UTC-Vorschaudatum",
    "es": "Fecha de vista previa UTC",
    "ja": "プレビュー日付（UTC）"
  },
  "UTC time of day": {
    "it": "Ora del giorno UTC",
    "fr": "Heure UTC",
    "de": "UTC-Tageszeit",
    "es": "Hora del día UTC",
    "ja": "UTCの時刻"
  },
  "Follow the Sun. Explore the night.": {
    "it": "Segui il Sole. Esplora la notte.",
    "fr": "Suivez le Soleil. Explorez la nuit.",
    "de": "Folge der Sonne. Erkunde die Nacht.",
    "es": "Sigue al Sol. Explora la noche.",
    "ja": "太陽を追い、夜を探る。"
  },
  "Seasonal events": {
    "it": "Eventi stagionali",
    "fr": "Événements saisonniers",
    "de": "Jahreszeitenereignisse",
    "es": "Eventos estacionales",
    "ja": "季節の節目"
  },
  "Mar equinox": {
    "it": "Equinozio mar",
    "fr": "Équinoxe mars",
    "de": "März-Äquinoktium",
    "es": "Equinoccio mar",
    "ja": "3月の分点"
  },
  "Jun solstice": {
    "it": "Solstizio giu",
    "fr": "Solstice juin",
    "de": "Juni-Sonnenwende",
    "es": "Solsticio jun",
    "ja": "6月の至点"
  },
  "Sep equinox": {
    "it": "Equinozio set",
    "fr": "Équinoxe sept.",
    "de": "Sept.-Äquinoktium",
    "es": "Equinoccio sep",
    "ja": "9月の分点"
  },
  "Dec solstice": {
    "it": "Solstizio dic",
    "fr": "Solstice déc.",
    "de": "Dez.-Sonnenwende",
    "es": "Solsticio dic",
    "ja": "12月の至点"
  },
  "Audio output": {
    "it": "Uscita audio",
    "fr": "Sortie audio",
    "de": "Audioausgabe",
    "es": "Salida de audio",
    "ja": "音声出力"
  },
  "Device": {
    "it": "Dispositivo",
    "fr": "Périphérique",
    "de": "Gerät",
    "es": "Dispositivo",
    "ja": "デバイス"
  },
  "Default system output": {
    "it": "Uscita predefinita di sistema",
    "fr": "Sortie système par défaut",
    "de": "Standard-Systemausgabe",
    "es": "Salida predeterminada del sistema",
    "ja": "システムの既定の出力"
  },
  "Refresh devices": {
    "it": "Aggiorna dispositivi",
    "fr": "Actualiser les périphériques",
    "de": "Geräte aktualisieren",
    "es": "Actualizar dispositivos",
    "ja": "デバイス一覧を更新"
  },
  "Use a built-in speaker or wired earphone. Bluetooth and AirPlay can add latency and filter the signal.": {
    "it": "Usa uno speaker integrato o auricolari con cavo. Bluetooth e AirPlay possono introdurre ritardi e filtrare il segnale.",
    "fr": "Utilisez un haut-parleur intégré ou un écouteur filaire. Bluetooth et AirPlay ajoutent parfois latence et filtrage.",
    "de": "Integrierten Lautsprecher oder Kabelhörer nutzen. Bluetooth und AirPlay können verzögern und filtern.",
    "es": "Usa altavoz integrado o auricular con cable. Bluetooth y AirPlay pueden añadir latencia y filtrar la señal.",
    "ja": "内蔵スピーカーか有線イヤホンを使ってください。BluetoothやAirPlayでは遅延や信号の変化が生じます。"
  },
  "Audio profile": {
    "it": "Profilo audio",
    "fr": "Profil audio",
    "de": "Audioprofil",
    "es": "Perfil de audio",
    "ja": "音声プロファイル"
  },
  "Sine · standard": {
    "it": "Sinusoidale · standard",
    "fr": "Sinusoïde · standard",
    "de": "Sinus · Standard",
    "es": "Senoidal · estándar",
    "ja": "正弦波・標準"
  },
  "DCF77 · full pauses (experimental)": {
    "it": "DCF77 · pause complete (sperimentale)",
    "fr": "DCF77 · silences complets (expérimental)",
    "de": "DCF77 · volle Pausen (experimentell)",
    "es": "DCF77 · pausas completas (experimental)",
    "ja": "DCF77・完全な無音（試験的）"
  },
  "Square · experimental": {
    "it": "Quadra · sperimentale",
    "fr": "Carré · expérimental",
    "de": "Rechteck · experimentell",
    "es": "Cuadrada · experimental",
    "ja": "矩形波・試験的"
  },
  "If DCF77 shows L3 then ERR, try full pauses. Square waves can produce more audible tones.": {
    "it": "Se DCF77 mostra L3 poi ERR, prova le pause complete. Le onde quadre possono essere più udibili.",
    "fr": "Si DCF77 affiche L3 puis ERR, essayez les silences complets. Le carré peut être plus audible.",
    "de": "Bei DCF77 mit L3, dann ERR volle Pausen versuchen. Rechtecksignale können hörbarer sein.",
    "es": "Si DCF77 muestra L3 y ERR, prueba pausas completas. La onda cuadrada puede oírse más.",
    "ja": "DCF77でL3の後にERRになる場合は完全な無音を試してください。矩形波は音が聞こえやすくなります。"
  },
  "♫ Test output · 1 second": {
    "it": "♫ Prova uscita · 1 secondo",
    "fr": "♫ Tester la sortie · 1 seconde",
    "de": "♫ Ausgabe testen · 1 Sekunde",
    "es": "♫ Probar salida · 1 segundo",
    "ja": "♫ 出力テスト・1秒"
  },
  "Low-volume 440 Hz tone on the selected channel.": {
    "it": "Tono a 440 Hz a basso volume sul canale selezionato.",
    "fr": "Son de 440 Hz à faible volume sur le canal choisi.",
    "de": "Leiser 440-Hz-Ton auf dem gewählten Kanal.",
    "es": "Tono suave de 440 Hz en el canal seleccionado.",
    "ja": "選択したチャンネルで440 Hzの小さな音を鳴らします。"
  },
  "Manual output advance (ms)": {
    "it": "Anticipo manuale uscita (ms)",
    "fr": "Avance manuelle de sortie (ms)",
    "de": "Manueller Ausgabevorlauf (ms)",
    "es": "Adelanto manual de salida (ms)",
    "ja": "出力の手動前倒し（ms）"
  },
  "Positive values advance the signal. Leave at 0 unless measured; reported output latency is already compensated.": {
    "it": "Valori positivi anticipano il segnale. Lascia 0 se non misurato: la latenza segnalata è già compensata.",
    "fr": "Les valeurs positives avancent le signal. Gardez 0 sans mesure ; la latence signalée est déjà compensée.",
    "de": "Positive Werte ziehen das Signal vor. Ohne Messung bei 0 lassen; gemeldete Latenz ist kompensiert.",
    "es": "Los valores positivos adelantan la señal. Déjalo en 0 sin medir; la latencia indicada ya se compensa.",
    "ja": "正の値は信号を前倒しします。計測していない場合は0にしてください。報告された遅延は補正済みです。"
  },
  "Time reference": {
    "it": "Riferimento orario",
    "fr": "Référence horaire",
    "de": "Zeitreferenz",
    "es": "Referencia horaria",
    "ja": "基準時刻"
  },
  "SYSTEM": {
    "it": "SISTEMA",
    "fr": "SYSTÈME",
    "de": "SYSTEM",
    "es": "SISTEMA",
    "ja": "システム"
  },
  "Source": {
    "it": "Fonte",
    "fr": "Source",
    "de": "Quelle",
    "es": "Fuente",
    "ja": "参照元"
  },
  "Measured offset": {
    "it": "Scarto misurato",
    "fr": "Décalage mesuré",
    "de": "Gemessene Abweichung",
    "es": "Desfase medido",
    "ja": "測定した時差"
  },
  "Unavailable": {
    "it": "Non disponibile",
    "fr": "Indisponible",
    "de": "Nicht verfügbar",
    "es": "No disponible",
    "ja": "取得できません"
  },
  "Estimated network uncertainty": {
    "it": "Incertezza di rete stimata",
    "fr": "Incertitude réseau estimée",
    "de": "Geschätzte Netzunsicherheit",
    "es": "Incertidumbre de red estimada",
    "ja": "ネットワークの推定誤差"
  },
  "Last checked": {
    "it": "Ultima verifica",
    "fr": "Dernière vérification",
    "de": "Zuletzt geprüft",
    "es": "Última comprobación",
    "ja": "前回の確認"
  },
  "Never": {
    "it": "Mai",
    "fr": "Jamais",
    "de": "Nie",
    "es": "Nunca",
    "ja": "未確認"
  },
  "Check time via NTP ↻": {
    "it": "Verifica ora via NTP ↻",
    "fr": "Vérifier l'heure par NTP ↻",
    "de": "Zeit per NTP prüfen ↻",
    "es": "Comprobar hora por NTP ↻",
    "ja": "NTPで時刻を確認 ↻"
  },
  "PTB and Cloudflare. Correction applies within the app and does not change your computer clock. Network uncertainty excludes audio latency.": {
    "it": "PTB e Cloudflare. Correzione solo nell'app, senza modificare l'ora del computer. L'incertezza di rete esclude la latenza audio.",
    "fr": "PTB et Cloudflare. Correction dans l'app sans changer l'horloge du PC. L'incertitude réseau exclut la latence audio.",
    "de": "PTB und Cloudflare. Korrektur nur in der App, nicht an der Systemuhr. Netzunsicherheit ohne Audiolatenz.",
    "es": "PTB y Cloudflare. La corrección solo afecta a la app, no al reloj del equipo. La incertidumbre de red excluye la latencia de audio.",
    "ja": "PTBとCloudflareを使用。補正はアプリ内だけで、PCの時計は変えません。ネットワーク誤差に音声遅延は含みません。"
  },
  "No telemetry · local data only": {
    "it": "Nessuna telemetria · solo dati locali",
    "fr": "Sans télémétrie · données locales",
    "de": "Keine Telemetrie · nur lokale Daten",
    "es": "Sin telemetría · solo datos locales",
    "ja": "遠隔計測なし・データは端末内のみ"
  },
  "JavaScript + Electron · BPC, JJY, WWVB, DCF77 and MSF · Independent app inspired by Clock Wave.": {
    "it": "JavaScript + Electron · BPC, JJY, WWVB, DCF77 e MSF · App indipendente ispirata a Clock Wave.",
    "fr": "JavaScript + Electron · BPC, JJY, WWVB, DCF77 et MSF · App indépendante inspirée de Clock Wave.",
    "de": "JavaScript + Electron · BPC, JJY, WWVB, DCF77 und MSF · Unabhängig, inspiriert von Clock Wave.",
    "es": "JavaScript + Electron · BPC, JJY, WWVB, DCF77 y MSF · App independiente inspirada en Clock Wave.",
    "ja": "JavaScript + Electron · BPC、JJY、WWVB、DCF77、MSF対応 · Clock Waveに着想を得た独立アプリ。"
  },
  "Theme": {
    "it": "Tema",
    "fr": "Thème",
    "de": "Design",
    "es": "Tema",
    "ja": "テーマ"
  },
  "Interface theme": {
    "it": "Tema dell'interfaccia",
    "fr": "Thème de l'interface",
    "de": "Oberflächendesign",
    "es": "Tema de la interfaz",
    "ja": "画面のテーマ"
  },
  "Prepare your Casio": {
    "it": "Prepara il tuo Casio",
    "fr": "Préparez votre Casio",
    "de": "Casio vorbereiten",
    "es": "Prepara tu Casio",
    "ja": "Casioを準備する"
  },
  "Select a home city compatible with DCF77, such as ROM / BER / PAR. Use DST AUTO if supported.": {
    "it": "Scegli una città base DCF77 compatibile, ad esempio ROM / BER / PAR. Usa DST AUTO se supportato.",
    "fr": "Choisissez une ville DCF77 compatible, comme ROM / BER / PAR. Utilisez DST AUTO si disponible.",
    "de": "Kompatible DCF77-Heimatstadt wählen, z. B. ROM / BER / PAR. Wenn möglich DST AUTO nutzen.",
    "es": "Elige una ciudad DCF77 compatible, como ROM / BER / PAR. Usa DST AUTO si es compatible.",
    "ja": "ROM / BER / PARなどDCF77対応の都市を選びます。対応機種ではDST AUTOを使ってください。"
  },
  "Position your watch": {
    "it": "Posiziona l'orologio",
    "fr": "Positionnez la montre",
    "de": "Uhr positionieren",
    "es": "Coloca el reloj",
    "ja": "時計を置く"
  },
  "Place the antenna, often at 12 o’clock, 1–5 cm from the speaker. Take the watch off your wrist and try rotating it if reception is weak.": {
    "it": "Tieni l'antenna, spesso sul lato ore 12, a 1–5 cm dallo speaker. Togli l'orologio dal polso e ruotalo se il segnale è debole.",
    "fr": "Placez l'antenne, souvent côté 12 h, à 1–5 cm du haut-parleur. Retirez la montre du poignet et tournez-la si nécessaire.",
    "de": "Antenne, oft auf der 12-Uhr-Seite, 1–5 cm vom Lautsprecher entfernt platzieren. Uhr ablegen und bei schwachem Empfang drehen.",
    "es": "Pon la antena, normalmente en el lado de las 12, a 1–5 cm del altavoz. Quítate el reloj y gíralo si la señal es débil.",
    "ja": "アンテナ（多くは12時側）をスピーカーから1〜5 cmへ。腕から外し、弱い場合は向きを変えてください。"
  },
  "Start reception": {
    "it": "Avvia la ricezione",
    "fr": "Lancez la réception",
    "de": "Empfang starten",
    "es": "Inicia la recepción",
    "ja": "受信を開始する"
  },
  "Start manual reception following your Casio module manual. Check the time in the app and transmit at moderate volume.": {
    "it": "Avvia la ricezione manuale come indicato nel manuale Casio. Verifica l'ora nell'app e trasmetti a volume moderato.",
    "fr": "Lancez la réception manuelle selon le manuel Casio. Vérifiez l'heure dans l'app puis émettez à volume modéré.",
    "de": "Manuellen Empfang laut Casio-Anleitung starten. Zeit in der App prüfen und mit mäßiger Lautstärke senden.",
    "es": "Inicia la recepción manual según el manual Casio. Comprueba la hora en la app y transmite con volumen moderado.",
    "ja": "Casioの説明書に従って手動受信を開始します。アプリで時刻を確認し、適度な音量で送信してください。"
  },
  "Wait and check": {
    "it": "Attendi e controlla",
    "fr": "Attendez et vérifiez",
    "de": "Warten und prüfen",
    "es": "Espera y comprueba",
    "ja": "待って確認する"
  },
  "Wait 5–10 minutes without moving the watch. Check its display and confirm reception in the app only after success.": {
    "it": "Attendi 5–10 minuti senza muovere l'orologio. Conferma nell'app solo dopo aver verificato il successo sul display.",
    "fr": "Attendez 5–10 minutes sans bouger la montre. Confirmez dans l'app uniquement après réussite sur l'écran.",
    "de": "Uhr 5–10 Minuten nicht bewegen. Erfolg am Display prüfen und erst dann in der App bestätigen.",
    "es": "Espera 5–10 minutos sin mover el reloj. Confirma en la app solo tras comprobar el éxito en la pantalla.",
    "ja": "時計を動かさず5〜10分待ちます。画面で成功を確認してからアプリで受信を確定してください。"
  },
  "Frequently asked questions": {
    "it": "Domande frequenti",
    "fr": "Questions fréquentes",
    "de": "Häufige Fragen",
    "es": "Preguntas frecuentes",
    "ja": "よくある質問"
  },
  "Weak signal, or L3 followed by ERR?": {
    "it": "Segnale debole, o L3 seguito da ERR?",
    "fr": "Signal faible ou L3 puis ERR ?",
    "de": "Schwaches Signal oder L3, dann ERR?",
    "es": "¿Señal débil o L3 seguido de ERR?",
    "ja": "信号が弱い、またはL3の後にERR？"
  },
  "L3 indicates strength, not successful reception. For DCF77, try full pauses in Settings. Check the home city and station; try another distance, orientation or a wired earphone. On the GW-6900, wait for GET; reception can take up to 14 minutes.": {
    "it": "L3 indica potenza, non ricezione riuscita. Con DCF77 prova le pause complete. Verifica città e stazione, cambia distanza o orientamento o usa auricolari con cavo. Sul GW-6900 attendi GET: può richiedere 14 minuti.",
    "fr": "L3 indique la force, pas la réussite. En DCF77, essayez les silences complets. Vérifiez ville et station, distance et orientation, ou un écouteur filaire. Sur GW-6900, attendez GET : jusqu'à 14 minutes.",
    "de": "L3 zeigt Signalstärke, keinen Erfolg. Bei DCF77 volle Pausen versuchen. Stadt und Sender prüfen, Abstand oder Ausrichtung ändern, Kabelhörer probieren. Am GW-6900 auf GET warten: bis zu 14 Minuten.",
    "es": "L3 indica intensidad, no éxito. En DCF77 prueba pausas completas. Revisa ciudad y emisora, distancia y orientación, o usa auricular con cable. En GW-6900 espera GET: puede tardar 14 minutos.",
    "ja": "L3は信号強度で、成功表示ではありません。DCF77では完全な無音を試し、都市・局・距離・向きも確認。有線イヤホンも試せます。GW-6900はGETまで最大14分ほど待ちます。"
  },
  "Can I use it offline?": {
    "it": "Posso usarla offline?",
    "fr": "Puis-je l'utiliser hors ligne ?",
    "de": "Kann ich die App offline nutzen?",
    "es": "¿Puedo usarla sin conexión?",
    "ja": "オフラインで使えますか？"
  },
  "Yes. The app uses system time and marks it as unverified. Internet access is needed for the NTP check.": {
    "it": "Sì. L'app usa l'ora di sistema e la indica come non verificata. Internet serve per il controllo NTP.",
    "fr": "Oui. L'app utilise l'heure système, marquée non vérifiée. Internet est nécessaire au contrôle NTP.",
    "de": "Ja. Die App nutzt die ungeprüfte Systemzeit. Für die NTP-Prüfung ist Internet nötig.",
    "es": "Sí. La app usa la hora del sistema y la marca sin verificar. Internet es necesario para NTP.",
    "ja": "はい。システム時刻を未確認として使用します。NTPの確認にはインターネットが必要です。"
  },
  "Can I use other apps while transmitting?": {
    "it": "Posso usare altre app durante la trasmissione?",
    "fr": "Puis-je utiliser d'autres apps pendant l'émission ?",
    "de": "Kann ich während der Übertragung andere Apps nutzen?",
    "es": "¿Puedo usar otras apps mientras transmito?",
    "ja": "送信中に他のアプリを使えますか？"
  },
  "Yes. Audio continues in the background. Sleep, screen locking or an audio device change stops the session.": {
    "it": "Sì, l'audio prosegue in sottofondo. Sospensione, blocco schermo o cambio uscita audio interrompono la sessione.",
    "fr": "Oui, l'audio continue en arrière-plan. Veille, verrouillage ou changement audio arrêtent la session.",
    "de": "Ja, Audio läuft im Hintergrund weiter. Ruhezustand, Bildschirmsperre oder Gerätewechsel stoppen die Sitzung.",
    "es": "Sí, el audio sigue en segundo plano. La suspensión, el bloqueo o un cambio de audio detienen la sesión.",
    "ja": "はい。音声はバックグラウンドで続きます。スリープ・画面ロック・音声機器の変更で停止します。"
  },
  "How does audio simulation work?": {
    "it": "Come funziona la simulazione audio?",
    "fr": "Comment fonctionne la simulation audio ?",
    "de": "Wie funktioniert die Audiosimulation?",
    "es": "¿Cómo funciona la simulación de audio?",
    "ja": "音での信号シミュレーションのしくみは？"
  },
  "A tone at a fraction of the radio carrier relies on harmonics and electromagnetic coupling from the audio output. Reception depends on hardware. The tone may be audible; keep it away from your ears.": {
    "it": "Un tono a una frazione della portante sfrutta armoniche e accoppiamento elettromagnetico dell'uscita audio. La ricezione dipende dall'hardware. Il tono può essere udibile: tienilo lontano dalle orecchie.",
    "fr": "Un son à une fraction de la porteuse utilise les harmoniques et le couplage électromagnétique de la sortie audio. La réception dépend du matériel. Son potentiellement audible : éloignez-le des oreilles.",
    "de": "Ein Ton mit einem Bruchteil der Trägerfrequenz nutzt Oberwellen und elektromagnetische Kopplung der Audioausgabe. Empfang hängt von der Hardware ab. Der Ton kann hörbar sein: von den Ohren fernhalten.",
    "es": "Un tono a una fracción de la portadora usa armónicos y acoplamiento electromagnético de la salida. La recepción depende del equipo. Puede ser audible: mantenlo lejos de los oídos.",
    "ja": "搬送波より低い音の高調波と音声出力の電磁結合を利用します。受信の成否は機器によります。聞こえる場合もあるため耳から離してください。"
  },
  "DOCUMENTATION": {
    "it": "DOCUMENTAZIONE",
    "fr": "DOCUMENTATION",
    "de": "DOKUMENTATION",
    "es": "DOCUMENTACIÓN",
    "ja": "資料"
  },
  "From time code to wristwatch.": {
    "it": "Dal codice orario al polso.",
    "fr": "Du code horaire au poignet.",
    "de": "Vom Zeitcode ans Handgelenk.",
    "es": "Del código horario a tu muñeca.",
    "ja": "時刻コードから腕時計へ。"
  },
  "Station specification": {
    "it": "Specifiche della stazione",
    "fr": "Spécification de la station",
    "de": "Senderspezifikation",
    "es": "Especificación de la emisora",
    "ja": "送信局の仕様"
  },
  "Casio module manuals": {
    "it": "Manuali dei moduli Casio",
    "fr": "Manuels des modules Casio",
    "de": "Casio-Modulanleitungen",
    "es": "Manuales de módulos Casio",
    "ja": "Casioモジュールの説明書"
  },
  "Clock Wave · inspiration": {
    "it": "Clock Wave · ispirazione",
    "fr": "Clock Wave · inspiration",
    "de": "Clock Wave · Inspiration",
    "es": "Clock Wave · inspiración",
    "ja": "Clock Wave · 着想元"
  },
  "BPC compatibility is experimental. Not affiliated with Casio, the stations or Clock Wave.": {
    "it": "Compatibilità BPC sperimentale. Nessuna affiliazione con Casio, le stazioni o Clock Wave.",
    "fr": "Compatibilité BPC expérimentale. Sans lien avec Casio, les stations ou Clock Wave.",
    "de": "BPC-Kompatibilität experimentell. Keine Verbindung zu Casio, Sendern oder Clock Wave.",
    "es": "Compatibilidad BPC experimental. Sin afiliación con Casio, las emisoras ni Clock Wave.",
    "ja": "BPC対応は試験的です。Casio、送信局、Clock Waveとは提携していません。"
  },
  "Back to the signal →": {
    "it": "Torna al segnale →",
    "fr": "Retour au signal →",
    "de": "Zurück zum Signal →",
    "es": "Volver a la señal →",
    "ja": "信号画面に戻る →"
  },
  "MADE FOR THE TIME THAT MATTERS.": {
    "it": "PER IL TEMPO CHE CONTA.",
    "fr": "POUR LE TEMPS QUI COMPTE.",
    "de": "FÜR DIE ZEIT, DIE ZÄHLT.",
    "es": "PARA EL TIEMPO QUE IMPORTA.",
    "ja": "大切な時間のために。"
  },
  "NTP check needed": {
    "it": "Verifica NTP necessaria",
    "fr": "Vérification NTP requise",
    "de": "NTP-Prüfung nötig",
    "es": "Comprobación NTP necesaria",
    "ja": "NTP確認が必要"
  },
  "System clock · unverified": {
    "it": "Orologio di sistema · non verificato",
    "fr": "Horloge système · non vérifiée",
    "de": "Systemuhr · ungeprüft",
    "es": "Reloj del sistema · sin verificar",
    "ja": "システム時計・未確認"
  },
  "NTP VERIFIED": {
    "it": "NTP VERIFICATO",
    "fr": "NTP VÉRIFIÉ",
    "de": "NTP GEPRÜFT",
    "es": "NTP VERIFICADO",
    "ja": "NTP確認済み"
  },
  "NTP verified": {
    "it": "NTP verificato",
    "fr": "NTP vérifié",
    "de": "NTP geprüft",
    "es": "NTP verificado",
    "ja": "NTP確認済み"
  },
  "Local storage is full or unavailable. The latest changes were not saved.": {
    "it": "Archivio locale pieno o non disponibile. Le ultime modifiche non sono state salvate.",
    "fr": "Stockage local plein ou indisponible. Les dernières modifications ne sont pas enregistrées.",
    "de": "Lokaler Speicher voll oder nicht verfügbar. Letzte Änderungen wurden nicht gespeichert.",
    "es": "Almacenamiento local lleno o no disponible. No se guardaron los últimos cambios.",
    "ja": "端末の保存領域がいっぱいか、使用できません。直近の変更は保存されませんでした。"
  },
  "The selected station time code, live.": {
    "it": "Il codice orario della stazione, in diretta.",
    "fr": "Le code horaire de la station, en direct.",
    "de": "Der Zeitcode des gewählten Senders, live.",
    "es": "El código horario de la emisora, en directo.",
    "ja": "選択した局の時刻コードをリアルタイムで。"
  },
  "A world between light and time": {
    "it": "Un mondo tra luce e tempo",
    "fr": "Un monde entre lumière et temps",
    "de": "Eine Welt zwischen Licht und Zeit",
    "es": "Un mundo entre luz y tiempo",
    "ja": "光と時間のあいだの世界"
  },
  "Follow the Sun. Find your city. Explore the signals that keep us in sync.": {
    "it": "Segui il Sole. Trova la tua città. Esplora i segnali che ci sincronizzano.",
    "fr": "Suivez le Soleil. Trouvez votre ville. Explorez les signaux qui nous synchronisent.",
    "de": "Folge der Sonne. Finde deinen Ort. Entdecke die Signale, die uns verbinden.",
    "es": "Sigue al Sol. Encuentra tu ciudad. Explora las señales que nos sincronizan.",
    "ja": "太陽を追い、都市を探し、時を合わせる信号を調べます。"
  },
  "A little closer to the Moon": {
    "it": "Un po' più vicini alla Luna",
    "fr": "Un peu plus près de la Lune",
    "de": "Dem Mond ein Stück näher",
    "es": "Un poco más cerca de la Luna",
    "ja": "月に少し近づいて"
  },
  "Follow its phases. Find your moonrise. Explore a different kind of time.": {
    "it": "Segui le fasi. Trova il sorgere della Luna. Esplora un altro tipo di tempo.",
    "fr": "Suivez ses phases. Trouvez son lever. Explorez une autre forme de temps.",
    "de": "Folge den Phasen. Finde den Mondaufgang. Entdecke eine andere Art von Zeit.",
    "es": "Sigue sus fases. Encuentra su salida. Explora otra forma de tiempo.",
    "ja": "満ち欠けや月の出を調べ、もう一つの時間を見つけます。"
  },
  "Some moments change the world. Others change your world.": {
    "it": "Certi momenti cambiano il mondo. Altri cambiano il tuo.",
    "fr": "Certains moments changent le monde. D'autres changent le vôtre.",
    "de": "Manche Momente verändern die Welt. Andere deine Welt.",
    "es": "Algunos momentos cambian el mundo. Otros cambian el tuyo.",
    "ja": "世界を変える瞬間。あなたの世界を変える瞬間。"
  },
  "An observatory in orbit": {
    "it": "Un osservatorio in orbita",
    "fr": "Un observatoire en orbite",
    "de": "Ein Observatorium im Orbit",
    "es": "Un observatorio en órbita",
    "ja": "軌道上の観測室"
  },
  "Track our orbital outpost. Discover your next encounter with the ISS.": {
    "it": "Segui il nostro avamposto orbitale. Scopri il prossimo incontro con l'ISS.",
    "fr": "Suivez notre avant-poste orbital. Découvrez votre prochaine rencontre avec l'ISS.",
    "de": "Verfolge unseren Außenposten. Entdecke deine nächste Begegnung mit der ISS.",
    "es": "Sigue nuestro puesto orbital. Descubre tu próximo encuentro con la ISS.",
    "ja": "軌道上の拠点を追跡し、次にISSに会える時を調べます。"
  },
  "Back in Time": {
    "it": "Ritorno al futuro",
    "fr": "Retour vers le futur",
    "de": "Zurück in die Zukunft",
    "es": "Regreso al futuro",
    "ja": "バック・トゥ・ザ・フューチャー"
  },
  "A little less precision. A lot more temporal displacement.": {
    "it": "Un po' meno precisione. Molti più spostamenti temporali.",
    "fr": "Un peu moins de précision. Beaucoup plus de voyages temporels.",
    "de": "Etwas weniger Präzision. Viel mehr Zeitsprünge.",
    "es": "Un poco menos de precisión. Muchos más viajes temporales.",
    "ja": "精度は少し控えめに。時間移動はたっぷりと。"
  },
  "Your synchronization history": {
    "it": "La tua cronologia di sincronizzazione",
    "fr": "Votre historique de synchronisation",
    "de": "Dein Synchronisierungsverlauf",
    "es": "Tu historial de sincronización",
    "ja": "時刻合わせの履歴"
  },
  "Your trials, stored only on this device.": {
    "it": "I tuoi tentativi, salvati solo qui.",
    "fr": "Vos essais, stockés sur cet appareil.",
    "de": "Deine Versuche, nur lokal gespeichert.",
    "es": "Tus intentos, guardados solo aquí.",
    "ja": "記録はこの端末だけに保存します。"
  },
  "A profile for every watch": {
    "it": "Un profilo per ogni orologio",
    "fr": "Un profil pour chaque montre",
    "de": "Ein Profil für jede Uhr",
    "es": "Un perfil para cada reloj",
    "ja": "時計ごとにプロファイルを"
  },
  "Save the settings and placement that work.": {
    "it": "Salva impostazioni e posizione che funzionano.",
    "fr": "Gardez les réglages et la position efficaces.",
    "de": "Speichere passende Werte und Position.",
    "es": "Guarda los ajustes y la posición que funcionan.",
    "ja": "うまくいった設定と置き方を保存します。"
  },
  "The settings used and the result observed on your Casio.": {
    "it": "Le impostazioni usate e il risultato osservato sul Casio.",
    "fr": "Les réglages utilisés et le résultat vu sur le Casio.",
    "de": "Verwendete Werte und das Ergebnis am Casio.",
    "es": "Los ajustes usados y el resultado observado en tu Casio.",
    "ja": "使用した設定とCasioで確認した結果。"
  },
  "Set up your signal": {
    "it": "Configura il segnale",
    "fr": "Réglez votre signal",
    "de": "Signal einrichten",
    "es": "Configura tu señal",
    "ja": "信号を設定する"
  },
  "Configure the signal for your device.": {
    "it": "Configura il segnale per il tuo dispositivo.",
    "fr": "Configurez le signal pour votre appareil.",
    "de": "Richte das Signal für dein Gerät ein.",
    "es": "Configura la señal para tu dispositivo.",
    "ja": "お使いのデバイスに合わせて調整します。"
  },
  "Quick start guide": {
    "it": "Guida iniziale",
    "fr": "Guide de démarrage",
    "de": "Schnellstartanleitung",
    "es": "Guía de inicio",
    "ja": "スタートガイド"
  },
  "Prepare your Casio and start transmitting.": {
    "it": "Prepara il Casio e inizia a trasmettere.",
    "fr": "Préparez le Casio et commencez à émettre.",
    "de": "Casio vorbereiten und Übertragung starten.",
    "es": "Prepara tu Casio y empieza a transmitir.",
    "ja": "Casioを準備して送信を始めましょう。"
  },
  "Preparing audio…": {
    "it": "Preparazione audio…",
    "fr": "Préparation audio…",
    "de": "Audio wird vorbereitet…",
    "es": "Preparando audio…",
    "ja": "音声を準備中…"
  },
  "Stop": {
    "it": "Ferma",
    "fr": "Arrêter",
    "de": "Stoppen",
    "es": "Detener",
    "ja": "停止"
  },
  "System clock · not verified": {
    "it": "Orologio di sistema · non verificato",
    "fr": "Horloge système · non vérifiée",
    "de": "Systemuhr · ungeprüft",
    "es": "Reloj del sistema · sin verificar",
    "ja": "システム時計・未確認"
  },
  "CHECK NEEDED": {
    "it": "VERIFICA NECESSARIA",
    "fr": "VÉRIFICATION REQUISE",
    "de": "PRÜFUNG NÖTIG",
    "es": "COMPROBAR",
    "ja": "確認が必要"
  },
  "Checking time…": {
    "it": "Verifica dell'ora…",
    "fr": "Vérification de l'heure…",
    "de": "Zeit wird geprüft…",
    "es": "Comprobando la hora…",
    "ja": "時刻を確認中…"
  },
  "Time checked with {0}. Offset {1}{2} ms.": {
    "it": "Ora verificata con {0}. Scarto {1}{2} ms.",
    "fr": "Heure vérifiée avec {0}. Décalage {1}{2} ms.",
    "de": "Zeit mit {0} geprüft. Abweichung {1}{2} ms.",
    "es": "Hora comprobada con {0}. Desfase {1}{2} ms.",
    "ja": "{0}で確認。時差 {1}{2} ms。"
  },
  "Check the reception indicator on your Casio.": {
    "it": "Controlla l'indicatore di ricezione sul Casio.",
    "fr": "Vérifiez l'indicateur de réception du Casio.",
    "de": "Empfangsanzeige am Casio prüfen.",
    "es": "Comprueba el indicador de recepción del Casio.",
    "ja": "Casioの受信表示を確認してください。"
  },
  "Transmitting system time. Accuracy depends on the computer clock.": {
    "it": "Trasmissione dell'ora di sistema. La precisione dipende dall'orologio del computer.",
    "fr": "Émission de l'heure système. La précision dépend de l'horloge du PC.",
    "de": "Systemzeit wird gesendet. Genauigkeit hängt von der Computeruhr ab.",
    "es": "Transmitiendo la hora del sistema. La precisión depende del reloj del equipo.",
    "ja": "システム時刻を送信中。精度はPCの時計によります。"
  },
  "Audio could not start: {0}": {
    "it": "Impossibile avviare l'audio: {0}",
    "fr": "Impossible de lancer l'audio : {0}",
    "de": "Audio konnte nicht starten: {0}",
    "es": "No se pudo iniciar el audio: {0}",
    "ja": "音声を開始できません：{0}"
  },
  "Reception confirmed by you. Your Casio is ready.": {
    "it": "Ricezione confermata da te. Il tuo Casio è pronto.",
    "fr": "Réception confirmée par vous. Votre Casio est prêt.",
    "de": "Empfang von dir bestätigt. Dein Casio ist bereit.",
    "es": "Recepción confirmada por ti. Tu Casio está listo.",
    "ja": "受信を確認しました。Casioの時刻合わせは完了です。"
  },
  "Transmission finished. Check reception on your Casio display.": {
    "it": "Trasmissione terminata. Verifica la ricezione sul display del Casio.",
    "fr": "Émission terminée. Vérifiez la réception sur le Casio.",
    "de": "Übertragung beendet. Empfang am Casio-Display prüfen.",
    "es": "Transmisión finalizada. Comprueba la recepción en el Casio.",
    "ja": "送信が終了しました。Casioの画面で受信結果を確認してください。"
  },
  "Transmission stopped.": {
    "it": "Trasmissione interrotta.",
    "fr": "Émission arrêtée.",
    "de": "Übertragung gestoppt.",
    "es": "Transmisión detenida.",
    "ja": "送信を停止しました。"
  },
  "CONFIRMED BY YOU": {
    "it": "CONFERMATO DA TE",
    "fr": "CONFIRMÉ PAR VOUS",
    "de": "VON DIR BESTÄTIGT",
    "es": "CONFIRMADO POR TI",
    "ja": "手動で確認済み"
  },
  "No trials yet. Start your first transmission to build your history.": {
    "it": "Ancora nessun tentativo. Avvia una trasmissione per creare la cronologia.",
    "fr": "Aucun essai. Lancez une émission pour créer l'historique.",
    "de": "Noch keine Versuche. Starte die erste Übertragung.",
    "es": "Aún no hay intentos. Inicia una transmisión para crear el historial.",
    "ja": "まだ記録はありません。最初の送信を始めましょう。"
  },
  "Outcome not verified": {
    "it": "Esito non verificato",
    "fr": "Résultat non vérifié",
    "de": "Ergebnis ungeprüft",
    "es": "Resultado sin verificar",
    "ja": "結果未確認"
  },
  "Finished · check reception": {
    "it": "Terminato · verifica ricezione",
    "fr": "Terminé · vérifier réception",
    "de": "Beendet · Empfang prüfen",
    "es": "Finalizado · comprueba recepción",
    "ja": "終了・受信結果を確認"
  },
  "Interrupted by audio or system": {
    "it": "Interrotto da audio o sistema",
    "fr": "Interrompu par audio ou système",
    "de": "Durch Audio oder System unterbrochen",
    "es": "Interrumpido por audio o sistema",
    "ja": "音声またはシステムで中断"
  },
  "Stopped manually": {
    "it": "Fermato manualmente",
    "fr": "Arrêté manuellement",
    "de": "Manuell gestoppt",
    "es": "Detenido manualmente",
    "ja": "手動で停止"
  },
  "✓ Reception confirmed by you": {
    "it": "✓ Ricezione confermata da te",
    "fr": "✓ Réception confirmée par vous",
    "de": "✓ Empfang von dir bestätigt",
    "es": "✓ Recepción confirmada por ti",
    "ja": "✓ 手動で受信確認済み"
  },
  "Details": {
    "it": "Dettagli",
    "fr": "Détails",
    "de": "Details",
    "es": "Detalles",
    "ja": "詳細"
  },
  "Details of trial on {0}": {
    "it": "Dettagli del tentativo del {0}",
    "fr": "Détails de l'essai du {0}",
    "de": "Versuchsdetails vom {0}",
    "es": "Detalles del intento del {0}",
    "ja": "{0}の記録の詳細"
  },
  "Edit watch": {
    "it": "Modifica orologio",
    "fr": "Modifier la montre",
    "de": "Uhr bearbeiten",
    "es": "Editar reloj",
    "ja": "時計を編集"
  },
  "Waveform": {
    "it": "Forma d'onda",
    "fr": "Forme d'onde",
    "de": "Wellenform",
    "es": "Forma de onda",
    "ja": "波形"
  },
  "App volume": {
    "it": "Volume app",
    "fr": "Volume de l'app",
    "de": "App-Lautstärke",
    "es": "Volumen de la app",
    "ja": "アプリの音量"
  },
  "Duration": {
    "it": "Durata",
    "fr": "Durée",
    "de": "Dauer",
    "es": "Duración",
    "ja": "送信時間"
  },
  "{0} minutes": {
    "it": "{0} minuti",
    "fr": "{0} minutes",
    "de": "{0} Minuten",
    "es": "{0} minutos",
    "ja": "{0}分"
  },
  "Manual advance": {
    "it": "Anticipo manuale",
    "fr": "Avance manuelle",
    "de": "Manueller Vorlauf",
    "es": "Adelanto manual",
    "ja": "手動の前倒し"
  },
  "Output": {
    "it": "Uscita",
    "fr": "Sortie",
    "de": "Ausgabe",
    "es": "Salida",
    "ja": "出力"
  },
  "System default": {
    "it": "Predefinito di sistema",
    "fr": "Défaut système",
    "de": "Systemstandard",
    "es": "Predeterminado del sistema",
    "ja": "システムの既定"
  },
  "UNSAVED": {
    "it": "NON SALVATO",
    "fr": "NON ENREGISTRÉ",
    "de": "UNGESPEICHERT",
    "es": "SIN GUARDAR",
    "ja": "未保存"
  },
  "SAVED": {
    "it": "SALVATO",
    "fr": "ENREGISTRÉ",
    "de": "GESPEICHERT",
    "es": "GUARDADO",
    "ja": "保存済み"
  },
  "NEW": {
    "it": "NUOVO",
    "fr": "NOUVEAU",
    "de": "NEU",
    "es": "NUEVO",
    "ja": "新規"
  },
  "Saved output unavailable. Using the system output; the saved profile is unchanged.": {
    "it": "Uscita salvata non disponibile. Uso l'uscita di sistema; il profilo resta invariato.",
    "fr": "Sortie enregistrée indisponible. Sortie système utilisée ; profil inchangé.",
    "de": "Gespeicherte Ausgabe fehlt. Systemausgabe wird genutzt; das Profil bleibt erhalten.",
    "es": "Salida guardada no disponible. Se usa la del sistema; el perfil no cambia.",
    "ja": "保存した出力が見つかりません。システム出力を使用します。プロファイルは保持されます。"
  },
  "Not recorded": {
    "it": "Non registrato",
    "fr": "Non enregistré",
    "de": "Nicht erfasst",
    "es": "Sin registrar",
    "ja": "記録なし"
  },
  "Trial on {0}": {
    "it": "Tentativo del {0}",
    "fr": "Essai du {0}",
    "de": "Versuch vom {0}",
    "es": "Intento del {0}",
    "ja": "{0}の記録"
  },
  "Not linked": {
    "it": "Non collegato",
    "fr": "Non associé",
    "de": "Nicht zugeordnet",
    "es": "Sin vincular",
    "ja": "関連付けなし"
  },
  "Model / home city": {
    "it": "Modello / città base",
    "fr": "Modèle / ville de résidence",
    "de": "Modell / Heimatstadt",
    "es": "Modelo / ciudad local",
    "ja": "モデル・ホーム都市"
  },
  "Not noted": {
    "it": "Non annotato",
    "fr": "Non renseigné",
    "de": "Nicht notiert",
    "es": "Sin anotar",
    "ja": "メモなし"
  },
  "Actual / selected duration": {
    "it": "Durata effettiva / scelta",
    "fr": "Durée réelle / choisie",
    "de": "Tatsächliche / gewählte Dauer",
    "es": "Duración real / elegida",
    "ja": "実際の時間・設定時間"
  },
  "System volume note": {
    "it": "Nota volume di sistema",
    "fr": "Note de volume système",
    "de": "Systemlautstärkenotiz",
    "es": "Nota de volumen del sistema",
    "ja": "システム音量のメモ"
  },
  "Audio / advance / reported latency": {
    "it": "Audio / anticipo / latenza segnalata",
    "fr": "Audio / avance / latence signalée",
    "de": "Audio / Vorlauf / gemeldete Latenz",
    "es": "Audio / adelanto / latencia indicada",
    "ja": "音声・前倒し・報告された遅延"
  },
  "Time source": {
    "it": "Fonte oraria",
    "fr": "Source horaire",
    "de": "Zeitquelle",
    "es": "Fuente horaria",
    "ja": "時刻の参照元"
  },
  "NTP offset / uncertainty": {
    "it": "Scarto NTP / incertezza",
    "fr": "Décalage NTP / incertitude",
    "de": "NTP-Abweichung / Unsicherheit",
    "es": "Desfase NTP / incertidumbre",
    "ja": "NTPの時差・誤差"
  },
  "Placement: {0}.": {
    "it": "Posizione: {0}.",
    "fr": "Position : {0}.",
    "de": "Position: {0}.",
    "es": "Posición: {0}.",
    "ja": "置き方：{0}。"
  },
  "not noted": {
    "it": "non annotata",
    "fr": "non renseignée",
    "de": "nicht notiert",
    "es": "sin anotar",
    "ja": "メモなし"
  },
  "Trial from before version 1.2: audio settings were not recorded.": {
    "it": "Tentativo precedente alla 1.2: impostazioni audio non registrate.",
    "fr": "Essai antérieur à la version 1.2 : réglages audio non enregistrés.",
    "de": "Versuch vor Version 1.2: Audiowerte nicht erfasst.",
    "es": "Intento anterior a 1.2: ajustes de audio sin registrar.",
    "ja": "バージョン1.2より前の記録です。音声設定は保存されていません。"
  },
  "Stopped after GET confirmation": {
    "it": "Fermato dopo conferma GET",
    "fr": "Arrêt après confirmation GET",
    "de": "Nach GET-Bestätigung gestoppt",
    "es": "Detenido tras confirmar GET",
    "ja": "GET確認後に停止"
  },
  "Transmission completed": {
    "it": "Trasmissione completata",
    "fr": "Émission terminée",
    "de": "Übertragung abgeschlossen",
    "es": "Transmisión completada",
    "ja": "送信完了"
  },
  "Manual stop": {
    "it": "Arresto manuale",
    "fr": "Arrêt manuel",
    "de": "Manueller Stopp",
    "es": "Parada manual",
    "ja": "手動停止"
  },
  "Audio or system interruption": {
    "it": "Interruzione audio o sistema",
    "fr": "Interruption audio ou système",
    "de": "Audio- oder Systemunterbrechung",
    "es": "Interrupción de audio o sistema",
    "ja": "音声またはシステムによる中断"
  },
  " Volume changed {0} times (min {1}%, max {2}%).": {
    "it": " Volume modificato {0} volte (min {1}%, max {2}%).",
    "fr": " Volume modifié {0} fois (min {1}%, max {2}%).",
    "de": " Lautstärke {0}-mal geändert (min. {1}%, max. {2}%).",
    "es": " Volumen cambiado {0} veces (mín. {1}%, máx. {2}%).",
    "ja": " 音量変更{0}回（最小{1}%、最大{2}%）。"
  },
  "Fully silent intervals of 100/200 ms. Experimental profile for L3 followed by ERR; reception on your Casio must be checked.": {
    "it": "Intervalli completamente silenziosi di 100/200 ms. Profilo sperimentale per L3 poi ERR: verifica la ricezione sul Casio.",
    "fr": "Silences complets de 100/200 ms. Profil expérimental pour L3 puis ERR : vérifiez la réception du Casio.",
    "de": "Vollständige Stille für 100/200 ms. Experimentelles Profil bei L3, dann ERR; Empfang am Casio prüfen.",
    "es": "Silencios completos de 100/200 ms. Perfil experimental para L3 y ERR: verifica la recepción del Casio.",
    "ja": "100/200 msの完全な無音です。L3の後のERR向け試験設定。Casioで受信を確認してください。"
  },
  "EXPERIMENTAL": {
    "it": "SPERIMENTALE",
    "fr": "EXPÉRIMENTAL",
    "de": "EXPERIMENTELL",
    "es": "EXPERIMENTAL",
    "ja": "試験的"
  },
  "{0} kHz tone: start at low volume and keep it away from your ears.": {
    "it": "Tono a {0} kHz: parti con volume basso e tienilo lontano dalle orecchie.",
    "fr": "Son à {0} kHz : commencez à faible volume, loin des oreilles.",
    "de": "{0}-kHz-Ton: leise beginnen und von den Ohren fernhalten.",
    "es": "Tono de {0} kHz: empieza con volumen bajo y lejos de los oídos.",
    "ja": "{0} kHzの音です。小音量で始め、耳に近づけないでください。"
  },
  "ENVELOPE {0} · {1}": {
    "it": "INVILUPPO {0} · {1}",
    "fr": "ENVELOPPE {0} · {1}",
    "de": "HÜLLKURVE {0} · {1}",
    "es": "ENVOLVENTE {0} · {1}",
    "ja": "{0}波形 · {1}"
  },
  "FULL PAUSES": {
    "it": "PAUSE COMPLETE",
    "fr": "SILENCES COMPLETS",
    "de": "VOLLE PAUSEN",
    "es": "PAUSAS COMPLETAS",
    "ja": "完全な無音"
  },
  "SIMULATION": {
    "it": "SIMULAZIONE",
    "fr": "SIMULATION",
    "de": "SIMULATION",
    "es": "SIMULACIÓN",
    "ja": "シミュレーション"
  },
  "A 100 ms {0} means 0; 200 ms means 1. Second 59 has no reduction and identifies the minute boundary. Three even parity bits protect minutes, hours and date.": {
    "it": "Una {0} di 100 ms vale 0; 200 ms vale 1. Il secondo 59 non ha riduzione e indica il confine del minuto. Tre bit di parità pari proteggono minuti, ore e data.",
    "fr": "Une {0} de 100 ms vaut 0 ; 200 ms vaut 1. La seconde 59 sans réduction marque la minute. Trois bits de parité paire protègent minutes, heures et date.",
    "de": "Eine {0} von 100 ms bedeutet 0, 200 ms bedeutet 1. Sekunde 59 ohne Absenkung markiert die Minute. Drei gerade Paritätsbits schützen Minuten, Stunden und Datum.",
    "es": "Una {0} de 100 ms vale 0; 200 ms vale 1. El segundo 59 sin reducción marca el minuto. Tres bits de paridad par protegen minutos, horas y fecha.",
    "ja": "100 msの{0}は0、200 msは1を表します。59秒には減衰がなく分の境界を示します。3つの偶数パリティで分・時・日付を保護します。"
  },
  "full pause": {
    "it": "pausa completa",
    "fr": "coupure totale",
    "de": "vollständige Pause",
    "es": "pausa completa",
    "ja": "完全な無音"
  },
  "Each second begins at high amplitude for 800 ms (0), 500 ms (1) or 200 ms (marker). The code carries Japanese time (JST), day of year, and hour and minute parity.": {
    "it": "Ogni secondo inizia ad ampiezza alta per 800 ms (0), 500 ms (1) o 200 ms (marcatore). Il codice include ora giapponese JST, giorno dell'anno e parità di ore e minuti.",
    "fr": "Chaque seconde commence à forte amplitude : 800 ms (0), 500 ms (1) ou 200 ms (repère). Le code contient l'heure JST, le jour annuel et les parités.",
    "de": "Jede Sekunde beginnt mit hoher Amplitude: 800 ms (0), 500 ms (1) oder 200 ms (Marker). Der Code enthält JST, Jahrestag und Stunden-/Minutenparität.",
    "es": "Cada segundo empieza con amplitud alta: 800 ms (0), 500 ms (1) o 200 ms (marca). Incluye hora JST, día del año y paridad de horas y minutos.",
    "ja": "各秒の最初に800 ms（0）、500 ms（1）、200 ms（マーカー）の高振幅を送信。日本標準時、年通算日、時・分のパリティを含みます。"
  },
  "The legacy AM code reduces amplitude for 200 ms (0), 500 ms (1) or 800 ms (marker). It transmits UTC; the Casio applies its home city time zone. Includes leap year and US DST flags.": {
    "it": "Il codice AM riduce l'ampiezza per 200 ms (0), 500 ms (1) o 800 ms (marcatore). Trasmette UTC; il Casio applica il fuso della città base. Include anno bisestile e ora legale USA.",
    "fr": "Le code AM réduit l'amplitude sur 200 ms (0), 500 ms (1) ou 800 ms (repère). Émis en UTC, adapté par le Casio. Inclut année bissextile et heure d'été américaine.",
    "de": "Der AM-Code senkt für 200 ms (0), 500 ms (1) oder 800 ms (Marker) ab. Er sendet UTC; Casio nutzt die Heimatzeitzone. Mit Schaltjahr- und US-Sommerzeitflags.",
    "es": "El código AM reduce la amplitud 200 ms (0), 500 ms (1) u 800 ms (marca). Transmite UTC; el Casio aplica su zona local. Incluye año bisiesto y horario de verano de EE. UU.",
    "ja": "AMコードは200 ms（0）、500 ms（1）、800 ms（マーカー）減衰します。UTCを送信し、Casioがホーム都市の時差を適用。閏年と米国夏時間の情報も含みます。"
  },
  "The minute starts with 500 ms without a carrier. Each other second starts with a 100 ms pause followed by two 100 ms slots for bits A and B. Four odd parity bits protect UK time and date.": {
    "it": "Il minuto inizia con 500 ms senza portante. Gli altri secondi iniziano con 100 ms di pausa e due intervalli da 100 ms per A e B. Quattro parità dispari proteggono ora e data britanniche.",
    "fr": "La minute commence par 500 ms sans porteuse. Les autres secondes ont 100 ms de pause puis deux créneaux de 100 ms pour A et B. Quatre parités impaires protègent heure et date britanniques.",
    "de": "Minutenbeginn: 500 ms ohne Träger. Weitere Sekunden: 100 ms Pause, dann zwei 100-ms-Slots für A und B. Vier ungerade Paritätsbits schützen britische Zeit und Datum.",
    "es": "El minuto empieza con 500 ms sin portadora. Los demás segundos llevan pausa de 100 ms y dos intervalos de 100 ms para A y B. Cuatro paridades impares protegen la hora y fecha británicas.",
    "ja": "分の先頭は搬送波なしの500 msです。他の秒は100 msの無音と、A・B用の100 ms区間2つから構成。4つの奇数パリティで英国の日時を保護します。"
  },
  "Each cycle lasts 20 seconds. A reduction of 100, 200, 300 or 400 ms encodes two bits. Binary fields carry Beijing time, cycle index, date and parity. Compatibility is experimental.": {
    "it": "Ogni ciclo dura 20 secondi. Riduzioni di 100, 200, 300 o 400 ms codificano due bit. I campi contengono ora di Pechino, indice, data e parità. Compatibilità sperimentale.",
    "fr": "Chaque cycle dure 20 secondes. Les réductions de 100, 200, 300 ou 400 ms codent deux bits. Champs : heure de Pékin, index, date et parité. Compatibilité expérimentale.",
    "de": "Ein Zyklus dauert 20 Sekunden. Absenkungen von 100, 200, 300 oder 400 ms codieren zwei Bits. Felder: Pekinger Zeit, Index, Datum, Parität. Kompatibilität experimentell.",
    "es": "Cada ciclo dura 20 segundos. Reducciones de 100, 200, 300 o 400 ms codifican dos bits. Incluye hora de Pekín, índice, fecha y paridad. Compatibilidad experimental.",
    "ja": "1周期は20秒。100/200/300/400 msの減衰で2ビットを符号化。北京時刻・周期番号・日付・パリティを含みます。対応は試験的です。"
  },
  "{0} · {1}. Compatible home cities: {2}, if supported by your module.": {
    "it": "{0} · {1}. Città base compatibili: {2}, se supportate dal modulo.",
    "fr": "{0} · {1}. Villes compatibles : {2}, si prises en charge par le module.",
    "de": "{0} · {1}. Kompatible Heimatstädte: {2}, sofern vom Modul unterstützt.",
    "es": "{0} · {1}. Ciudades compatibles: {2}, si el módulo las admite.",
    "ja": "{0} · {1}。対応するホーム都市：{2}（機種によります）。"
  },
  "For {0}, use a compatible home city: {1}, if supported by your module. {2}": {
    "it": "Per {0}, usa una città base compatibile: {1}, se supportata dal modulo. {2}",
    "fr": "Pour {0}, utilisez une ville compatible : {1}, selon votre module. {2}",
    "de": "Für {0} eine passende Heimatstadt nutzen: {1}, sofern unterstützt. {2}",
    "es": "Para {0}, usa una ciudad compatible: {1}, según tu módulo. {2}",
    "ja": "{0}では対応都市{1}を使用します（機種によります）。{2}"
  },
  "Leave DST OFF.": {
    "it": "Lascia DST OFF.",
    "fr": "Laissez DST OFF.",
    "de": "DST OFF lassen.",
    "es": "Deja DST OFF.",
    "ja": "DST OFFのままにしてください。"
  },
  "Use DST AUTO if supported.": {
    "it": "Usa DST AUTO se supportato.",
    "fr": "Utilisez DST AUTO si disponible.",
    "de": "Wenn möglich DST AUTO nutzen.",
    "es": "Usa DST AUTO si es compatible.",
    "ja": "対応機種ではDST AUTOを使用します。"
  },
  "No parity in this AM code": {
    "it": "Questo codice AM non ha parità",
    "fr": "Pas de parité dans ce code AM",
    "de": "Keine Parität in diesem AM-Code",
    "es": "Este código AM no tiene paridad",
    "ja": "このAMコードにはパリティがありません"
  },
  "Second {0} · {1} · {2}": {
    "it": "Secondo {0} · {1} · {2}",
    "fr": "Seconde {0} · {1} · {2}",
    "de": "Sekunde {0} · {1} · {2}",
    "es": "Segundo {0} · {1} · {2}",
    "ja": "{0}秒 · {1} · {2}"
  },
  "Reserved": {
    "it": "Riservato",
    "fr": "Réservé",
    "de": "Reserviert",
    "es": "Reservado",
    "ja": "予約済み"
  },
  "TIME REMAINING": {
    "it": "TEMPO RIMASTO",
    "fr": "TEMPS RESTANT",
    "de": "RESTZEIT",
    "es": "TIEMPO RESTANTE",
    "ja": "残り時間"
  },
  "ALIGNING": {
    "it": "ALLINEAMENTO",
    "fr": "ALIGNEMENT",
    "de": "AUSRICHTUNG",
    "es": "ALINEANDO",
    "ja": "時刻調整中"
  },
  "TRANSMITTING": {
    "it": "TRASMISSIONE",
    "fr": "ÉMISSION",
    "de": "ÜBERTRAGUNG",
    "es": "TRANSMITIENDO",
    "ja": "送信中"
  },
  "Aligning signal. First complete minute starts at {0}:{1}.": {
    "it": "Allineamento. Il primo minuto completo inizia alle {0}:{1}.",
    "fr": "Alignement. La première minute complète débute à {0}:{1}.",
    "de": "Ausrichtung. Erste volle Minute beginnt um {0}:{1}.",
    "es": "Alineando. El primer minuto completo empieza a las {0}:{1}.",
    "ja": "調整中。最初の完全な1分は{0}:{1}に開始します。"
  },
  "Transmitting · {0} kHz audio · leave your watch near the speaker.": {
    "it": "Trasmissione · audio a {0} kHz · lascia il Casio vicino allo speaker.",
    "fr": "Émission · audio {0} kHz · gardez le Casio près du haut-parleur.",
    "de": "Übertragung · {0}-kHz-Audio · Uhr beim Lautsprecher lassen.",
    "es": "Transmitiendo · audio {0} kHz · deja el reloj junto al altavoz.",
    "ja": "送信中 · {0} kHz音声 · 時計をスピーカーの近くに置いてください。"
  },
  "The audio engine did not report completion. Check the output and try again.": {
    "it": "Il motore audio non ha segnalato il completamento. Verifica l'uscita e riprova.",
    "fr": "Le moteur audio n'a pas signalé la fin. Vérifiez la sortie et réessayez.",
    "de": "Audioende nicht gemeldet. Ausgabe prüfen und erneut versuchen.",
    "es": "El motor de audio no indicó el fin. Revisa la salida e inténtalo de nuevo.",
    "ja": "音声の完了通知がありません。出力を確認して再試行してください。"
  },
  "READY WHEN YOU ARE": {
    "it": "PRONTO QUANDO VUOI",
    "fr": "PRÊT QUAND VOUS VOULEZ",
    "de": "BEREIT, WENN DU ES BIST",
    "es": "LISTO CUANDO QUIERAS",
    "ja": "いつでも開始できます"
  },
  "Start manual reception on your Casio, then transmit for 5–10 minutes.": {
    "it": "Avvia la ricezione manuale sul Casio, poi trasmetti per 5–10 minuti.",
    "fr": "Lancez la réception manuelle du Casio, puis émettez 5–10 minutes.",
    "de": "Manuellen Empfang am Casio starten, dann 5–10 Minuten senden.",
    "es": "Inicia la recepción manual del Casio y transmite 5–10 minutos.",
    "ja": "Casioで手動受信を開始し、5〜10分送信します。"
  },
  "The system clock changed. Check the time and restart transmission.": {
    "it": "L'ora di sistema è cambiata. Verifica l'ora e riavvia la trasmissione.",
    "fr": "L'heure système a changé. Vérifiez l'heure et relancez l'émission.",
    "de": "Systemzeit geändert. Zeit prüfen und Übertragung neu starten.",
    "es": "La hora del sistema cambió. Comprueba la hora y reinicia la transmisión.",
    "ja": "システム時刻が変わりました。時刻を確認して送信を再開してください。"
  },
  "Audio output {0}": {
    "it": "Uscita audio {0}",
    "fr": "Sortie audio {0}",
    "de": "Audioausgabe {0}",
    "es": "Salida de audio {0}",
    "ja": "音声出力 {0}"
  },
  "{0} channel test complete. Check the output and system volume.": {
    "it": "Prova canale {0} completata. Controlla uscita e volume di sistema.",
    "fr": "Test du canal {0} terminé. Vérifiez sortie et volume système.",
    "de": "Kanaltest {0} beendet. Ausgabe und Systemlautstärke prüfen.",
    "es": "Prueba del canal {0} completada. Revisa salida y volumen del sistema.",
    "ja": "{0}チャンネルのテスト完了。出力とシステム音量を確認してください。"
  },
  "Audio test failed: {0}": {
    "it": "Prova audio fallita: {0}",
    "fr": "Échec du test audio : {0}",
    "de": "Audiotest fehlgeschlagen: {0}",
    "es": "Prueba de audio fallida: {0}",
    "ja": "音声テストに失敗：{0}"
  },
  "Profile «{0}» saved with the current settings.": {
    "it": "Profilo «{0}» salvato con le impostazioni attuali.",
    "fr": "Profil «{0}» enregistré avec les réglages actuels.",
    "de": "Profil «{0}» mit aktuellen Werten gespeichert.",
    "es": "Perfil «{0}» guardado con los ajustes actuales.",
    "ja": "プロファイル「{0}」に現在の設定を保存しました。"
  },
  "Profile deleted. Existing trials remain in history.": {
    "it": "Profilo eliminato. I tentativi restano nella cronologia.",
    "fr": "Profil supprimé. Les essais restent dans l'historique.",
    "de": "Profil gelöscht. Versuche bleiben im Verlauf.",
    "es": "Perfil eliminado. Los intentos siguen en el historial.",
    "ja": "プロファイルを削除しました。履歴の記録は残ります。"
  },
  "Undo": {
    "it": "Annulla",
    "fr": "Annuler",
    "de": "Rückgängig",
    "es": "Deshacer",
    "ja": "元に戻す"
  },
  "Successful settings restored. Check the system volume and placement recorded in the trial.": {
    "it": "Impostazioni riuscite ripristinate. Controlla volume di sistema e posizione del tentativo.",
    "fr": "Réglages réussis restaurés. Vérifiez volume et position de l'essai.",
    "de": "Erfolgreiche Werte geladen. Systemlautstärke und Position des Versuchs prüfen.",
    "es": "Ajustes correctos restaurados. Revisa el volumen y la posición del intento.",
    "ja": "成功した設定を復元しました。記録の音量と置き方を確認してください。"
  },
  "Trial outcome updated.": {
    "it": "Esito del tentativo aggiornato.",
    "fr": "Résultat de l'essai mis à jour.",
    "de": "Versuchsergebnis aktualisiert.",
    "es": "Resultado del intento actualizado.",
    "ja": "記録の結果を更新しました。"
  },
  "Trial settings restored. The saved profile settings remain available.": {
    "it": "Impostazioni del tentativo ripristinate. Quelle del profilo salvato restano disponibili.",
    "fr": "Réglages de l'essai restaurés. Ceux du profil restent disponibles.",
    "de": "Versuchswerte geladen. Gespeicherte Profilwerte bleiben erhalten.",
    "es": "Ajustes del intento restaurados. Los del perfil siguen disponibles.",
    "ja": "記録の設定を復元しました。保存済みプロファイルも引き続き使えます。"
  },
  "History cleared. ": {
    "it": "Cronologia svuotata. ",
    "fr": "Historique effacé. ",
    "de": "Verlauf geleert. ",
    "es": "Historial borrado. ",
    "ja": "履歴を消去しました。"
  },
  "The audio device changed. Check the output and restart.": {
    "it": "Il dispositivo audio è cambiato. Verifica l'uscita e riavvia.",
    "fr": "Le périphérique audio a changé. Vérifiez la sortie et relancez.",
    "de": "Audiogerät geändert. Ausgabe prüfen und neu starten.",
    "es": "El dispositivo de audio cambió. Revisa la salida y reinicia.",
    "ja": "音声機器が変わりました。出力を確認して再開してください。"
  },
  "Window closed during transmission.": {
    "it": "Finestra chiusa durante la trasmissione.",
    "fr": "Fenêtre fermée pendant l'émission.",
    "de": "Fenster während der Übertragung geschlossen.",
    "es": "Ventana cerrada durante la transmisión.",
    "ja": "送信中にウィンドウを閉じました。"
  },
  "{0} days": {
    "it": "{0} giorni",
    "fr": "{0} jours",
    "de": "{0} Tage",
    "es": "{0} días",
    "ja": "{0}日"
  },
  "ABOVE YOUR HORIZON": {
    "it": "SOPRA IL TUO ORIZZONTE",
    "fr": "AU-DESSUS DE VOTRE HORIZON",
    "de": "ÜBER DEINEM HORIZONT",
    "es": "SOBRE TU HORIZONTE",
    "ja": "地平線より上"
  },
  "BELOW YOUR HORIZON": {
    "it": "SOTTO IL TUO ORIZZONTE",
    "fr": "SOUS VOTRE HORIZON",
    "de": "UNTER DEINEM HORIZONT",
    "es": "BAJO TU HORIZONTE",
    "ja": "地平線より下"
  },
  "WAXING / RIGHT SIDE LIT": {
    "it": "CRESCENTE / ILLUMINATA A DESTRA",
    "fr": "CROISSANTE / ÉCLAIRÉE À DROITE",
    "de": "ZUNEHMEND / RECHTS BELEUCHTET",
    "es": "CRECIENTE / ILUMINADA A LA DERECHA",
    "ja": "満ちていく月・右側が明るい"
  },
  "WANING / LEFT SIDE LIT": {
    "it": "CALANTE / ILLUMINATA A SINISTRA",
    "fr": "DÉCROISSANTE / ÉCLAIRÉE À GAUCHE",
    "de": "ABNEHMEND / LINKS BELEUCHTET",
    "es": "MENGUANTE / ILUMINADA A LA IZQUIERDA",
    "ja": "欠けていく月・左側が明るい"
  },
  "No event today": {
    "it": "Nessun evento oggi",
    "fr": "Aucun événement aujourd'hui",
    "de": "Heute kein Ereignis",
    "es": "Sin evento hoy",
    "ja": "今日は該当なし"
  },
  "{0} · {1} · choose observing city in World View": {
    "it": "{0} · {1} · scegli la città nella Mappa del mondo",
    "fr": "{0} · {1} · choisir la ville sur la carte",
    "de": "{0} · {1} · Ort in der Weltkarte wählen",
    "es": "{0} · {1} · elige la ciudad en el mapa",
    "ja": "{0} · {1} · ワールドビューで観測都市を変更"
  },
  "PREVIEW": {
    "it": "ANTEPRIMA",
    "fr": "APERÇU",
    "de": "VORSCHAU",
    "es": "VISTA PREVIA",
    "ja": "プレビュー"
  },
  "Independent preview": {
    "it": "Anteprima indipendente",
    "fr": "Aperçu indépendant",
    "de": "Unabhängige Vorschau",
    "es": "Vista previa independiente",
    "ja": "独立したプレビュー"
  },
  "{0} / {1} MOMENTS": {
    "it": "{0} / {1} MOMENTI",
    "fr": "{0} / {1} MOMENTS",
    "de": "{0} / {1} MOMENTE",
    "es": "{0} / {1} MOMENTOS",
    "ja": "{0} / {1} 件"
  },
  "{0} source ↗": {
    "it": "Fonte {0} ↗",
    "fr": "Source {0} ↗",
    "de": "Quelle {0} ↗",
    "es": "Fuente {0} ↗",
    "ja": "{0}の出典 ↗"
  },
  "CALENDAR DAYS SINCE · UTC DATE": {
    "it": "GIORNI DI CALENDARIO TRASCORSI · UTC",
    "fr": "JOURS CALENDAIRES ÉCOULÉS · UTC",
    "de": "KALENDERTAGE SEITDEM · UTC",
    "es": "DÍAS DE CALENDARIO TRANSCURRIDOS · UTC",
    "ja": "UTCの日付で数えた経過日数"
  },
  "{0} SINCE THIS MOMENT": {
    "it": "{0} DA QUESTO MOMENTO",
    "fr": "{0} DEPUIS CE MOMENT",
    "de": "{0} SEIT DIESEM MOMENT",
    "es": "{0} DESDE ESTE MOMENTO",
    "ja": "その瞬間からの{0}"
  },
  "APPROXIMATE TIME": {
    "it": "TEMPO APPROSSIMATIVO",
    "fr": "TEMPS APPROXIMATIF",
    "de": "UNGEFÄHRE ZEIT",
    "es": "TIEMPO APROXIMADO",
    "ja": "おおよその時間"
  },
  "TIME": {
    "it": "TEMPO",
    "fr": "TEMPS",
    "de": "ZEIT",
    "es": "TIEMPO",
    "ja": "時間"
  },
  "Date documented; no time of day assumed.": {
    "it": "Data documentata; nessun orario presunto.",
    "fr": "Date documentée ; aucune heure supposée.",
    "de": "Datum belegt; keine Uhrzeit angenommen.",
    "es": "Fecha documentada; no se supone una hora.",
    "ja": "日付のみ記録。時刻は仮定していません。"
  },
  "Historical time is approximate; counter shown to the minute.": {
    "it": "Orario storico approssimativo; contatore al minuto.",
    "fr": "Heure historique approximative ; compteur à la minute.",
    "de": "Historische Zeit ungefähr; minutengenauer Zähler.",
    "es": "Hora histórica aproximada; contador al minuto.",
    "ja": "歴史上の時刻は概算です。分単位で表示します。"
  },
  "Documented to the minute.": {
    "it": "Documentato al minuto.",
    "fr": "Documenté à la minute.",
    "de": "Auf die Minute belegt.",
    "es": "Documentado al minuto.",
    "ja": "分単位の記録です。"
  },
  "Documented to the second.": {
    "it": "Documentato al secondo.",
    "fr": "Documenté à la seconde.",
    "de": "Auf die Sekunde belegt.",
    "es": "Documentado al segundo.",
    "ja": "秒単位の記録です。"
  },
  "↺ Return to now": {
    "it": "↺ Torna a ora",
    "fr": "↺ Revenir à maintenant",
    "de": "↺ Zurück zu jetzt",
    "es": "↺ Volver a ahora",
    "ja": "↺ 現在に戻る"
  },
  "RECONSTRUCTION": {
    "it": "RICOSTRUZIONE",
    "fr": "RECONSTITUTION",
    "de": "REKONSTRUKTION",
    "es": "RECONSTRUCCIÓN",
    "ja": "再現中"
  },
  "Historical scene preview · elapsed counter still uses the real present.": {
    "it": "Anteprima storica · il contatore usa sempre il presente reale.",
    "fr": "Aperçu historique · le compteur utilise toujours le présent réel.",
    "de": "Historische Vorschau · Zähler nutzt weiter die echte Gegenwart.",
    "es": "Vista histórica · el contador sigue usando el presente real.",
    "ja": "歴史のプレビュー中も経過時間は現実の現在を基準にします。"
  },
  "An original illustrated scene. Select a moment to begin your journey.": {
    "it": "Una scena illustrata originale. Scegli un momento per iniziare il viaggio.",
    "fr": "Une illustration originale. Choisissez un moment pour voyager.",
    "de": "Eine Originalillustration. Wähle einen Moment für deine Reise.",
    "es": "Una ilustración original. Elige un momento para viajar.",
    "ja": "オリジナルのイラストです。出来事を選んで旅を始めましょう。"
  },
  "TIME CAPSULE": {
    "it": "CAPSULA DEL TEMPO",
    "fr": "CAPSULE TEMPORELLE",
    "de": "ZEITKAPSEL",
    "es": "CÁPSULA DEL TIEMPO",
    "ja": "タイムカプセル"
  },
  "PERSONAL MOMENT": {
    "it": "RICORDO PERSONALE",
    "fr": "SOUVENIR PERSONNEL",
    "de": "PERSÖNLICHER MOMENT",
    "es": "RECUERDO PERSONAL",
    "ja": "自分の思い出"
  },
  "Edit": {
    "it": "Modifica",
    "fr": "Modifier",
    "de": "Bearbeiten",
    "es": "Editar",
    "ja": "編集"
  },
  "Save changes": {
    "it": "Salva modifiche",
    "fr": "Enregistrer les modifications",
    "de": "Änderungen speichern",
    "es": "Guardar cambios",
    "ja": "変更を保存"
  },
  "Delete": {
    "it": "Elimina",
    "fr": "Supprimer",
    "de": "Löschen",
    "es": "Eliminar",
    "ja": "削除"
  },
  "Delete this keepsake?": {
    "it": "Eliminare questo ricordo?",
    "fr": "Supprimer ce souvenir ?",
    "de": "Diese Erinnerung löschen?",
    "es": "¿Eliminar este recuerdo?",
    "ja": "この思い出を削除しますか？"
  },
  "Delete permanently": {
    "it": "Elimina definitivamente",
    "fr": "Supprimer définitivement",
    "de": "Endgültig löschen",
    "es": "Eliminar definitivamente",
    "ja": "完全に削除"
  },
  "Keep it": {
    "it": "Conserva",
    "fr": "Conserver",
    "de": "Behalten",
    "es": "Conservar",
    "ja": "残す"
  },
  "to go": {
    "it": "rimanenti",
    "fr": "restants",
    "de": "verbleibend",
    "es": "restantes",
    "ja": "後"
  },
  "A moment worth remembering.": {
    "it": "Un momento da ricordare.",
    "fr": "Un moment à retenir.",
    "de": "Ein Moment zum Erinnern.",
    "es": "Un momento para recordar.",
    "ja": "覚えておきたい瞬間。"
  },
  "SEALED · Your message opens on the date above.": {
    "it": "SIGILLATA · Il messaggio si aprirà nella data indicata.",
    "fr": "SCELLÉE · Le message s'ouvrira à la date indiquée.",
    "de": "VERSIEGELT · Nachricht öffnet sich am angegebenen Datum.",
    "es": "SELLADA · El mensaje se abre en la fecha indicada.",
    "ja": "封印中 · 上記の日時にメッセージが開きます。"
  },
  "{0} / 100 LOCAL KEEPSAKES": {
    "it": "{0} / 100 RICORDI LOCALI",
    "fr": "{0} / 100 SOUVENIRS LOCAUX",
    "de": "{0} / 100 LOKALE ERINNERUNGEN",
    "es": "{0} / 100 RECUERDOS LOCALES",
    "ja": "{0} / 100 保存済み"
  },
  "Enter a title and a valid UTC date between 1900 and 2100.": {
    "it": "Inserisci un titolo e una data UTC valida tra il 1900 e il 2100.",
    "fr": "Saisissez un titre et une date UTC valide entre 1900 et 2100.",
    "de": "Titel und gültiges UTC-Datum zwischen 1900 und 2100 eingeben.",
    "es": "Introduce un título y una fecha UTC válida entre 1900 y 2100.",
    "ja": "タイトルと1900〜2100年の有効なUTC日時を入力してください。"
  },
  "A new capsule needs a future opening date and a message.": {
    "it": "Una nuova capsula richiede una data futura e un messaggio.",
    "fr": "Une capsule exige une date future et un message.",
    "de": "Neue Kapsel braucht ein zukünftiges Datum und eine Nachricht.",
    "es": "Una cápsula nueva necesita una fecha futura y un mensaje.",
    "ja": "新しいカプセルには未来の開封日時とメッセージが必要です。"
  },
  "Your archive is full. Delete a keepsake before adding another.": {
    "it": "Archivio pieno. Elimina un ricordo prima di aggiungerne un altro.",
    "fr": "Archive pleine. Supprimez un souvenir avant d'en ajouter un.",
    "de": "Archiv voll. Erst eine Erinnerung löschen.",
    "es": "Archivo lleno. Elimina un recuerdo antes de añadir otro.",
    "ja": "保存件数が上限です。追加する前に思い出を削除してください。"
  },
  "Time capsule sealed on this device.": {
    "it": "Capsula sigillata su questo dispositivo.",
    "fr": "Capsule scellée sur cet appareil.",
    "de": "Zeitkapsel auf diesem Gerät versiegelt.",
    "es": "Cápsula sellada en este dispositivo.",
    "ja": "この端末にタイムカプセルを封印しました。"
  },
  "Your moment is saved on this device.": {
    "it": "Il ricordo è salvato su questo dispositivo.",
    "fr": "Souvenir enregistré sur cet appareil.",
    "de": "Moment auf diesem Gerät gespeichert.",
    "es": "Recuerdo guardado en este dispositivo.",
    "ja": "この端末に思い出を保存しました。"
  },
  "This city’s time zone is unavailable in this runtime. Choose another city.": {
    "it": "Fuso orario della città non disponibile. Scegli un'altra città.",
    "fr": "Fuseau de cette ville indisponible. Choisissez une autre ville.",
    "de": "Zeitzone dieses Orts nicht verfügbar. Anderen Ort wählen.",
    "es": "Zona horaria no disponible. Elige otra ciudad.",
    "ja": "この都市のタイムゾーンを利用できません。別の都市を選んでください。"
  },
  "Radio coverage hidden": {
    "it": "Copertura radio nascosta",
    "fr": "Couverture radio masquée",
    "de": "Funkreichweite ausgeblendet",
    "es": "Cobertura de radio oculta",
    "ja": "電波範囲を非表示"
  },
  "{0} · approximately {1} km. Casio 3179 reference range, not a reception guarantee.": {
    "it": "{0} · circa {1} km. Riferimento Casio 3179, non garantisce la ricezione.",
    "fr": "{0} · environ {1} km. Portée Casio 3179, sans garantie de réception.",
    "de": "{0} · etwa {1} km. Referenz Casio 3179, keine Empfangsgarantie.",
    "es": "{0} · unos {1} km. Referencia Casio 3179, sin garantía de recepción.",
    "ja": "{0} · 約{1} km。Casio 3179の目安で、受信を保証しません。"
  },
  "{0}, {1}, {2} kilohertz": {
    "it": "{0}, {1}, {2} kilohertz",
    "fr": "{0}, {1}, {2} kilohertz",
    "de": "{0}, {1}, {2} Kilohertz",
    "es": "{0}, {1}, {2} kilohercios",
    "ja": "{0}、{1}、{2}キロヘルツ"
  },
  "Exploration time · audio unchanged": {
    "it": "Ora di esplorazione · audio invariato",
    "fr": "Heure d'exploration · audio inchangé",
    "de": "Erkundungszeit · Audio unverändert",
    "es": "Hora de exploración · audio sin cambios",
    "ja": "探索中の時刻・音声は通常通り"
  },
  "Playing one day per minute · UTC": {
    "it": "Un giorno al minuto · UTC",
    "fr": "Un jour par minute · UTC",
    "de": "Ein Tag pro Minute · UTC",
    "es": "Un día por minuto · UTC",
    "ja": "1分で1日を再生 · UTC"
  },
  "Preview only · transmission time unchanged": {
    "it": "Solo anteprima · ora trasmessa invariata",
    "fr": "Aperçu seul · heure émise inchangée",
    "de": "Nur Vorschau · Sendezeit unverändert",
    "es": "Solo vista previa · hora transmitida sin cambios",
    "ja": "プレビューのみ・送信時刻は変わりません"
  },
  "No sunrise": {
    "it": "Il Sole non sorge",
    "fr": "Pas de lever du Soleil",
    "de": "Kein Sonnenaufgang",
    "es": "Sin amanecer",
    "ja": "日の出なし"
  },
  "No sunset": {
    "it": "Il Sole non tramonta",
    "fr": "Pas de coucher du Soleil",
    "de": "Kein Sonnenuntergang",
    "es": "Sin atardecer",
    "ja": "日の入りなし"
  },
  "{0} kHz · {1} local · {2} km away": {
    "it": "{0} kHz · {1} locali · a {2} km",
    "fr": "{0} kHz · {1} locale · à {2} km",
    "de": "{0} kHz · {1} Ortszeit · {2} km entfernt",
    "es": "{0} kHz · {1} local · a {2} km",
    "ja": "{0} kHz · 現地 {1} · {2} km先"
  },
  "Use {0} ↗": {
    "it": "Usa {0} ↗",
    "fr": "Utiliser {0} ↗",
    "de": "{0} verwenden ↗",
    "es": "Usar {0} ↗",
    "ja": "{0}を使用 ↗"
  },
  "Atlas data unavailable": {
    "it": "Dati dell'atlante non disponibili",
    "fr": "Données d'atlas indisponibles",
    "de": "Atlasdaten nicht verfügbar",
    "es": "Datos del atlas no disponibles",
    "ja": "地図データを利用できません"
  },
  "{0} cities · offline": {
    "it": "{0} città · offline",
    "fr": "{0} villes · hors ligne",
    "de": "{0} Orte · offline",
    "es": "{0} ciudades · sin conexión",
    "ja": "{0}都市 · オフライン"
  },
  "The atlas could not be loaded. ": {
    "it": "Impossibile caricare l'atlante. ",
    "fr": "Impossible de charger l'atlas. ",
    "de": "Atlas konnte nicht geladen werden. ",
    "es": "No se pudo cargar el atlas. ",
    "ja": "地図を読み込めません。"
  },
  "Retry": {
    "it": "Riprova",
    "fr": "Réessayer",
    "de": "Erneut versuchen",
    "es": "Reintentar",
    "ja": "再試行"
  },
  "No matching city. Try another spelling or add a country.": {
    "it": "Nessuna città trovata. Prova un'altra grafia o aggiungi il paese.",
    "fr": "Aucune ville. Essayez une autre orthographe ou ajoutez le pays.",
    "de": "Kein Ort gefunden. Schreibweise ändern oder Land ergänzen.",
    "es": "No hay ciudades. Prueba otra escritura o añade el país.",
    "ja": "都市が見つかりません。表記を変えるか国名を追加してください。"
  },
  "Preparing city search…": {
    "it": "Preparazione ricerca città…",
    "fr": "Préparation de la recherche…",
    "de": "Ortssuche wird vorbereitet…",
    "es": "Preparando búsqueda…",
    "ja": "都市検索を準備中…"
  },
  "City search unavailable": {
    "it": "Ricerca città non disponibile",
    "fr": "Recherche de ville indisponible",
    "de": "Ortssuche nicht verfügbar",
    "es": "Búsqueda de ciudades no disponible",
    "ja": "都市検索を利用できません"
  },
  "City search could not load. Focus the search field to retry.": {
    "it": "Impossibile caricare la ricerca. Torna nel campo per riprovare.",
    "fr": "Recherche impossible. Revenez dans le champ pour réessayer.",
    "de": "Suche nicht geladen. Suchfeld erneut fokussieren.",
    "es": "No se pudo cargar la búsqueda. Vuelve al campo para reintentar.",
    "ja": "検索を読み込めません。検索欄に戻って再試行してください。"
  },
  "Loading the offline city catalog…": {
    "it": "Caricamento catalogo offline…",
    "fr": "Chargement du catalogue hors ligne…",
    "de": "Offline-Ortskatalog wird geladen…",
    "es": "Cargando catálogo sin conexión…",
    "ja": "オフライン都市一覧を読み込み中…"
  },
  "{0} selected for transmission.": {
    "it": "{0} selezionata per la trasmissione.",
    "fr": "{0} sélectionnée pour l'émission.",
    "de": "{0} zum Senden gewählt.",
    "es": "{0} seleccionada para transmitir.",
    "ja": "送信局に{0}を選択しました。"
  },
  "Pause accelerated day": {
    "it": "Pausa giorno accelerato",
    "fr": "Pause de la journée accélérée",
    "de": "Zeitraffertag pausieren",
    "es": "Pausar día acelerado",
    "ja": "早送りを一時停止"
  },
  "just now": {
    "it": "adesso",
    "fr": "à l'instant",
    "de": "gerade eben",
    "es": "ahora mismo",
    "ja": "たった今"
  },
  "{0} min ago": {
    "it": "{0} min fa",
    "fr": "il y a {0} min",
    "de": "vor {0} Min.",
    "es": "hace {0} min",
    "ja": "{0}分前"
  },
  "{0} h ago": {
    "it": "{0} ore fa",
    "fr": "il y a {0} h",
    "de": "vor {0} Std.",
    "es": "hace {0} h",
    "ja": "{0}時間前"
  },
  "The local atlas could not load. Use Refresh to retry.": {
    "it": "Impossibile caricare l'atlante locale. Premi Aggiorna per riprovare.",
    "fr": "Atlas local introuvable. Actualisez pour réessayer.",
    "de": "Lokaler Atlas nicht geladen. Zum Wiederholen aktualisieren.",
    "es": "No se pudo cargar el atlas. Actualiza para reintentar.",
    "ja": "ローカル地図を読み込めません。更新して再試行してください。"
  },
  "ISS services could not be reached.": {
    "it": "Servizi ISS non raggiungibili.",
    "fr": "Services ISS inaccessibles.",
    "de": "ISS-Dienste nicht erreichbar.",
    "es": "Servicios ISS no disponibles.",
    "ja": "ISSサービスに接続できません。"
  },
  "Fresh orbital elements are needed for pass predictions.": {
    "it": "Servono elementi orbitali recenti per le previsioni.",
    "fr": "Éléments orbitaux récents requis pour les prévisions.",
    "de": "Aktuelle Bahnelemente für Vorhersagen nötig.",
    "es": "Se necesitan elementos orbitales recientes para las previsiones.",
    "ja": "通過予報には新しい軌道要素が必要です。"
  },
  "Pass calculation could not start. Refresh to retry.": {
    "it": "Impossibile avviare il calcolo dei passaggi. Aggiorna per riprovare.",
    "fr": "Calcul des passages impossible. Actualisez.",
    "de": "Überflugberechnung fehlgeschlagen. Aktualisieren.",
    "es": "No se pudo iniciar el cálculo. Actualiza para reintentar.",
    "ja": "通過の計算を開始できません。更新して再試行してください。"
  },
  "Pass calculation is unavailable.": {
    "it": "Calcolo dei passaggi non disponibile.",
    "fr": "Calcul des passages indisponible.",
    "de": "Überflugberechnung nicht verfügbar.",
    "es": "Cálculo de pasos no disponible.",
    "ja": "通過を計算できません。"
  },
  "Observing from {0}, {1}. Change city in World View.": {
    "it": "Osservazione da {0}, {1}. Cambia città nella Mappa del mondo.",
    "fr": "Observation depuis {0}, {1}. Changez la ville sur la carte.",
    "de": "Beobachtung von {0}, {1}. Ort in der Weltkarte ändern.",
    "es": "Observando desde {0}, {1}. Cambia de ciudad en el mapa.",
    "ja": "観測地：{0}、{1}。ワールドビューで変更できます。"
  },
  "ONLINE · PREDICTED": {
    "it": "ONLINE · PREVISIONE",
    "fr": "EN LIGNE · PRÉVISION",
    "de": "ONLINE · PROGNOSE",
    "es": "EN LÍNEA · PREVISIÓN",
    "ja": "オンライン・予測"
  },
  "OFFLINE · PREDICTED": {
    "it": "OFFLINE · PREVISIONE",
    "fr": "HORS LIGNE · PRÉVISION",
    "de": "OFFLINE · PROGNOSE",
    "es": "SIN CONEXIÓN · PREVISIÓN",
    "ja": "オフライン・予測"
  },
  "ONLINE · REPORT": {
    "it": "ONLINE · POSIZIONE",
    "fr": "EN LIGNE · RAPPORT",
    "de": "ONLINE · MELDUNG",
    "es": "EN LÍNEA · INFORME",
    "ja": "オンライン・位置報告"
  },
  "OFFLINE · LAST REPORT": {
    "it": "OFFLINE · ULTIMA POSIZIONE",
    "fr": "HORS LIGNE · DERNIER RAPPORT",
    "de": "OFFLINE · LETZTE MELDUNG",
    "es": "SIN CONEXIÓN · ÚLTIMO INFORME",
    "ja": "オフライン・最後の報告"
  },
  "STALE ORBIT": {
    "it": "ORBITA DATATA",
    "fr": "ORBITE ANCIENNE",
    "de": "VERALTETE BAHN",
    "es": "ÓRBITA ANTIGUA",
    "ja": "軌道データが古い"
  },
  "Connectivity is determined from HTTPS requests to ISS sources. Predicted positions are orbital calculations, not onboard telemetry.": {
    "it": "Connessione verificata via HTTPS alle fonti ISS. Le posizioni previste sono calcoli orbitali, non telemetria di bordo.",
    "fr": "Connexion déterminée par HTTPS aux sources ISS. Les positions sont des calculs orbitaux, pas de la télémétrie.",
    "de": "Verbindung per HTTPS zu ISS-Quellen geprüft. Vorhergesagte Positionen sind Berechnungen, keine Bordtelemetrie.",
    "es": "Conexión comprobada por HTTPS a fuentes ISS. Las posiciones son cálculos orbitales, no telemetría.",
    "ja": "ISSの情報源へのHTTPS接続で判定。予測位置は軌道計算であり、船内からの実測通信ではありません。"
  },
  "{0}Epoch {1}": {
    "it": "{0}Epoca {1}",
    "fr": "{0}Époque {1}",
    "de": "{0}Epoche {1}",
    "es": "{0}Época {1}",
    "ja": "{0}元期 {1}"
  },
  "Aging orbit · ": {
    "it": "Orbita datata · ",
    "fr": "Orbite vieillissante · ",
    "de": "Alternde Bahn · ",
    "es": "Órbita envejecida · ",
    "ja": "古くなった軌道 ·"
  },
  "HTTPS checked ": {
    "it": "HTTPS verificato ",
    "fr": "HTTPS vérifié ",
    "de": "HTTPS geprüft ",
    "es": "HTTPS comprobado ",
    "ja": "HTTPS確認から"
  },
  "cached data": {
    "it": "dati in cache",
    "fr": "données en cache",
    "de": "gespeicherte Daten",
    "es": "datos en caché",
    "ja": "保存されたデータ"
  },
  "SGP4 estimate": {
    "it": "stima SGP4",
    "fr": "estimation SGP4",
    "de": "SGP4-Schätzung",
    "es": "estimación SGP4",
    "ja": "SGP4の推定"
  },
  "position report": {
    "it": "rapporto di posizione",
    "fr": "rapport de position",
    "de": "Positionsmeldung",
    "es": "informe de posición",
    "ja": "位置報告"
  },
  "Checking public ISS sources…": {
    "it": "Verifica delle fonti ISS…",
    "fr": "Vérification des sources ISS…",
    "de": "ISS-Quellen werden geprüft…",
    "es": "Comprobando fuentes ISS…",
    "ja": "ISSの公開情報を確認中…"
  },
  "No usable data. Connect to retrieve an ISS orbit.": {
    "it": "Nessun dato utilizzabile. Connettiti per ottenere un'orbita ISS.",
    "fr": "Aucune donnée exploitable. Connectez-vous pour obtenir une orbite.",
    "de": "Keine nutzbaren Daten. Zum Laden einer ISS-Bahn verbinden.",
    "es": "Sin datos utilizables. Conéctate para obtener una órbita ISS.",
    "ja": "使用可能なデータがありません。接続してISSの軌道を取得してください。"
  },
  "{0}{1} No weather or obstruction data are used.": {
    "it": "{0}{1} Non include meteo o ostacoli.",
    "fr": "{0}{1} Sans météo ni obstacles.",
    "de": "{0}{1} Ohne Wetter- oder Hindernisdaten.",
    "es": "{0}{1} Sin datos de clima u obstáculos.",
    "ja": "{0}{1} 天候や障害物は考慮しません。"
  },
  " Orbital epoch: ": {
    "it": " Epoca orbitale: ",
    "fr": " Époque orbitale : ",
    "de": " Bahnepoche: ",
    "es": " Época orbital: ",
    "ja": " 軌道の元期："
  },
  "POSITION REPORT": {
    "it": "POSIZIONE RIPORTATA",
    "fr": "RAPPORT DE POSITION",
    "de": "POSITIONSMELDUNG",
    "es": "INFORME DE POSICIÓN",
    "ja": "位置報告"
  },
  "LAST REPORT": {
    "it": "ULTIMA POSIZIONE",
    "fr": "DERNIER RAPPORT",
    "de": "LETZTE MELDUNG",
    "es": "ÚLTIMO INFORME",
    "ja": "最後の報告"
  },
  "NO POSITION": {
    "it": "NESSUNA POSIZIONE",
    "fr": "AUCUNE POSITION",
    "de": "KEINE POSITION",
    "es": "SIN POSICIÓN",
    "ja": "位置情報なし"
  },
  "Orbital elements are too old for this time. Refresh online.": {
    "it": "Elementi orbitali troppo vecchi per questa data. Aggiorna online.",
    "fr": "Éléments orbitaux trop anciens. Actualisez en ligne.",
    "de": "Bahnelemente für diese Zeit zu alt. Online aktualisieren.",
    "es": "Elementos orbitales demasiado antiguos. Actualiza en línea.",
    "ja": "この時刻には軌道要素が古すぎます。オンラインで更新してください。"
  },
  "Last position report: {0} UTC. No current position available.": {
    "it": "Ultima posizione: {0} UTC. Posizione attuale non disponibile.",
    "fr": "Dernière position : {0} UTC. Position actuelle indisponible.",
    "de": "Letzte Position: {0} UTC. Aktuelle Position fehlt.",
    "es": "Última posición: {0} UTC. Posición actual no disponible.",
    "ja": "最後の位置報告：{0} UTC。現在の位置はありません。"
  },
  "No ISS position available. Connect and refresh to begin.": {
    "it": "Posizione ISS non disponibile. Connettiti e aggiorna per iniziare.",
    "fr": "Position ISS indisponible. Connectez-vous et actualisez.",
    "de": "Keine ISS-Position. Verbinden und aktualisieren.",
    "es": "Posición ISS no disponible. Conéctate y actualiza.",
    "ja": "ISSの位置がありません。接続して更新してください。"
  },
  "km/h · no current state": {
    "it": "km/h · nessuno stato attuale",
    "fr": "km/h · état actuel indisponible",
    "de": "km/h · kein aktueller Zustand",
    "es": "km/h · sin estado actual",
    "ja": "km/h · 現在の状態なし"
  },
  "Northbound": {
    "it": "Verso nord",
    "fr": "Vers le nord",
    "de": "Nordwärts",
    "es": "Hacia el norte",
    "ja": "北向き"
  },
  "Southbound": {
    "it": "Verso sud",
    "fr": "Vers le sud",
    "de": "Südwärts",
    "es": "Hacia el sur",
    "ja": "南向き"
  },
  "No current coordinates": {
    "it": "Nessuna coordinata attuale",
    "fr": "Aucune coordonnée actuelle",
    "de": "Keine aktuellen Koordinaten",
    "es": "Sin coordenadas actuales",
    "ja": "現在の座標なし"
  },
  "Earth": {
    "it": "Terra",
    "fr": "Terre",
    "de": "Erde",
    "es": "Tierra",
    "ja": "地球"
  },
  " km along Earth": {
    "it": " km sulla Terra",
    "fr": " km sur Terre",
    "de": " km entlang der Erde",
    "es": " km sobre la Tierra",
    "ja": " km（地表に沿って）"
  },
  "Requires orbital elements": {
    "it": "Richiede elementi orbitali",
    "fr": "Éléments orbitaux requis",
    "de": "Bahnelemente erforderlich",
    "es": "Requiere elementos orbitales",
    "ja": "軌道要素が必要です"
  },
  "Potentially visible now": {
    "it": "Potenzialmente visibile ora",
    "fr": "Potentiellement visible",
    "de": "Jetzt möglicherweise sichtbar",
    "es": "Potencialmente visible ahora",
    "ja": "今見える可能性あり"
  },
  "Below your horizon": {
    "it": "Sotto il tuo orizzonte",
    "fr": "Sous votre horizon",
    "de": "Unter deinem Horizont",
    "es": "Bajo tu horizonte",
    "ja": "地平線より下"
  },
  "Earth shadow": {
    "it": "Ombra terrestre",
    "fr": "Ombre terrestre",
    "de": "Erdschatten",
    "es": "Sombra terrestre",
    "ja": "地球の影"
  },
  "ISS in Earth shadow": {
    "it": "ISS nell'ombra terrestre",
    "fr": "ISS dans l'ombre terrestre",
    "de": "ISS im Erdschatten",
    "es": "ISS en la sombra terrestre",
    "ja": "ISSは地球の影の中"
  },
  "Your sky is too bright": {
    "it": "Il cielo è troppo luminoso",
    "fr": "Ciel trop lumineux",
    "de": "Himmel zu hell",
    "es": "El cielo es demasiado claro",
    "ja": "空が明るすぎます"
  },
  "No visible-pass conditions": {
    "it": "Condizioni di visibilità assenti",
    "fr": "Pas de conditions de visibilité",
    "de": "Keine Sichtbedingungen",
    "es": "Sin condiciones de visibilidad",
    "ja": "見える条件を満たしません"
  },
  "Awaiting orbital elements": {
    "it": "In attesa di elementi orbitali",
    "fr": "En attente d'éléments orbitaux",
    "de": "Warte auf Bahnelemente",
    "es": "Esperando elementos orbitales",
    "ja": "軌道要素を待機中"
  },
  "Happening now": {
    "it": "In corso ora",
    "fr": "En cours",
    "de": "Findet jetzt statt",
    "es": "Ocurriendo ahora",
    "ja": "現在通過中"
  },
  "No visible pass found": {
    "it": "Nessun passaggio visibile trovato",
    "fr": "Aucun passage visible trouvé",
    "de": "Kein sichtbarer Überflug gefunden",
    "es": "No hay pasos visibles",
    "ja": "見える通過が見つかりません"
  },
  "{0} · {1} visible": {
    "it": "{0} · visibile per {1}",
    "fr": "{0} · visible {1}",
    "de": "{0} · {1} sichtbar",
    "es": "{0} · visible {1}",
    "ja": "{0} · 可視時間 {1}"
  },
  "In ": {
    "it": "Tra ",
    "fr": "Dans ",
    "de": "In ",
    "es": "En ",
    "ja": "あと"
  },
  "Within the valid 48-hour prediction window": {
    "it": "Nella finestra valida di previsione di 48 ore",
    "fr": "Dans la fenêtre valide de 48 heures",
    "de": "Im gültigen 48-Stunden-Prognosefenster",
    "es": "Dentro de la ventana válida de 48 horas",
    "ja": "有効な48時間の予報範囲内"
  },
  "Calculated from displayed state": {
    "it": "Calcolato dallo stato visualizzato",
    "fr": "Calculé depuis l'état affiché",
    "de": "Aus angezeigtem Zustand berechnet",
    "es": "Calculado del estado mostrado",
    "ja": "表示した状態から計算"
  },
  "Illustrative orbit": {
    "it": "Orbita illustrativa",
    "fr": "Orbite illustrative",
    "de": "Beispielbahn",
    "es": "Órbita ilustrativa",
    "ja": "参考の軌道"
  },
  "{0} · local time · up to 48 hours, limited by orbit validity": {
    "it": "{0} · ora locale · fino a 48 ore, entro la validità dell'orbita",
    "fr": "{0} · heure locale · jusqu'à 48 h, selon validité orbitale",
    "de": "{0} · Ortszeit · bis 48 Stunden, begrenzt durch Bahngültigkeit",
    "es": "{0} · hora local · hasta 48 horas, según validez orbital",
    "ja": "{0} · 現地時刻 · 軌道の有効期間内で最大48時間"
  },
  "Calculating local passes in the background…": {
    "it": "Calcolo dei passaggi in sottofondo…",
    "fr": "Calcul des passages en arrière-plan…",
    "de": "Überflüge werden im Hintergrund berechnet…",
    "es": "Calculando pasos en segundo plano…",
    "ja": "バックグラウンドで通過を計算中…"
  },
  "Connect to load fresh orbital data.": {
    "it": "Connettiti per caricare dati orbitali aggiornati.",
    "fr": "Connectez-vous pour charger une orbite récente.",
    "de": "Für aktuelle Bahndaten verbinden.",
    "es": "Conéctate para cargar datos orbitales recientes.",
    "ja": "接続して最新の軌道データを取得してください。"
  },
  "No potentially visible passes in this prediction window. Turn off the filter to see geometric passes.": {
    "it": "Nessun passaggio potenzialmente visibile. Disattiva il filtro per vedere quelli geometrici.",
    "fr": "Aucun passage potentiellement visible. Désactivez le filtre pour voir les passages géométriques.",
    "de": "Kein möglicherweise sichtbarer Überflug. Filter für geometrische Überflüge ausschalten.",
    "es": "Sin pasos potencialmente visibles. Desactiva el filtro para ver los geométricos.",
    "ja": "見える可能性のある通過はありません。フィルターを外すと幾何学的な通過を表示します。"
  },
  "No passes above 10° in this prediction window.": {
    "it": "Nessun passaggio oltre 10° nella finestra di previsione.",
    "fr": "Aucun passage au-dessus de 10° dans cette fenêtre.",
    "de": "Kein Überflug über 10° im Prognosefenster.",
    "es": "Sin pasos sobre 10° en esta ventana.",
    "ja": "予報範囲内に高度10°を超える通過はありません。"
  },
  "{0}° max": {
    "it": "{0}° max",
    "fr": "{0}° max",
    "de": "{0}° max.",
    "es": "{0}° máx.",
    "ja": "最大{0}°"
  },
  "GEOMETRIC": {
    "it": "GEOMETRICO",
    "fr": "GÉOMÉTRIQUE",
    "de": "GEOMETRISCH",
    "es": "GEOMÉTRICO",
    "ja": "幾何学的"
  },
  "Above 10°: {0}–{1}": {
    "it": "Oltre 10°: {0}–{1}",
    "fr": "Au-dessus de 10° : {0}–{1}",
    "de": "Über 10°: {0}–{1}",
    "es": "Sobre 10°: {0}–{1}",
    "ja": "高度10°超：{0}〜{1}"
  },
  "Peak: {0}° at {1}": {
    "it": "Culmine: {0}° alle {1}",
    "fr": "Maximum : {0}° à {1}",
    "de": "Maximum: {0}° um {1}",
    "es": "Máximo: {0}° a las {1}",
    "ja": "最大高度：{0}°（{1}）"
  },
  "Potential visibility: {0}": {
    "it": "Visibilità potenziale: {0}",
    "fr": "Visibilité potentielle : {0}",
    "de": "Mögliche Sichtbarkeit: {0}",
    "es": "Visibilidad potencial: {0}",
    "ja": "見える可能性：{0}"
  },
  "Geometric pass · no predicted naked-eye visibility": {
    "it": "Passaggio geometrico · visibilità a occhio nudo non prevista",
    "fr": "Passage géométrique · visibilité à l'œil nu non prévue",
    "de": "Geometrischer Überflug · keine Sichtbarkeit mit bloßem Auge erwartet",
    "es": "Paso geométrico · sin visibilidad a simple vista prevista",
    "ja": "幾何学的な通過・肉眼での可視予測なし"
  },
  "Visible*: {0}–{1}": {
    "it": "Visibile*: {0}–{1}",
    "fr": "Visible* : {0}–{1}",
    "de": "Sichtbar*: {0}–{1}",
    "es": "Visible*: {0}–{1}",
    "ja": "可視*：{0}〜{1}"
  },
  "The Old West": {
    "it": "Il vecchio West",
    "fr": "Le Far West",
    "de": "Der Wilde Westen",
    "es": "El viejo Oeste",
    "ja": "西部開拓時代"
  },
  "PART III": {
    "it": "PARTE III",
    "fr": "PARTIE III",
    "de": "TEIL III",
    "es": "PARTE III",
    "ja": "第3作"
  },
  "Eight horses. Still no roads.": {
    "it": "Otto cavalli. Ancora niente strade.",
    "fr": "Huit chevaux. Toujours pas de routes.",
    "de": "Acht Pferde. Immer noch keine Straßen.",
    "es": "Ocho caballos. Aún sin carreteras.",
    "ja": "馬8頭。それでも道はない。"
  },
  "Marty arrives in 1885. The DeLorean could use a little horsepower.": {
    "it": "Marty arriva nel 1885. Alla DeLorean servirebbe qualche cavallo in più.",
    "fr": "Marty arrive en 1885. La DeLorean aurait besoin de chevaux.",
    "de": "Marty kommt 1885 an. Die DeLorean braucht etwas Pferdestärke.",
    "es": "Marty llega a 1885. A la DeLorean le vendrían bien unos caballos.",
    "ja": "マーティが1885年へ到着。デロリアンには馬の力が必要そうです。"
  },
  "Hello, 1955": {
    "it": "Ciao, 1955",
    "fr": "Bonjour, 1955",
    "de": "Hallo, 1955",
    "es": "Hola, 1955",
    "ja": "こんにちは、1955年"
  },
  "PART I": {
    "it": "PARTE I",
    "fr": "PARTIE I",
    "de": "TEIL I",
    "es": "PARTE I",
    "ja": "第1作"
  },
  "A rather unexpected detour.": {
    "it": "Una deviazione piuttosto inattesa.",
    "fr": "Un détour assez inattendu.",
    "de": "Ein ziemlich unerwarteter Umweg.",
    "es": "Un desvío bastante inesperado.",
    "ja": "かなり予想外の寄り道。"
  },
  "The time-circuit destination that starts it all. Mind the pine tree.": {
    "it": "La destinazione che dà inizio a tutto. Attento al pino.",
    "fr": "La destination qui lance l'aventure. Attention au pin.",
    "de": "Das Zeitziel, mit dem alles beginnt. Auf die Kiefer achten.",
    "es": "El destino donde empieza todo. Cuidado con el pino.",
    "ja": "すべての始まりとなる行き先。松の木には気をつけて。"
  },
  "Save the clock tower": {
    "it": "Salviamo la torre dell'orologio",
    "fr": "Sauvez l'horloge",
    "de": "Rettet die Rathausuhr",
    "es": "Salvemos la torre del reloj",
    "ja": "時計台を守ろう"
  },
  "One bolt. A very tight schedule.": {
    "it": "Un fulmine. Tempi strettissimi.",
    "fr": "Un éclair. Un timing très serré.",
    "de": "Ein Blitz. Ein sehr enger Zeitplan.",
    "es": "Un rayo. Muy poco margen.",
    "ja": "稲妻ひとつ。ぎりぎりの計画。"
  },
  "10:04 PM. A lightning bolt, a clock tower and some spectacular timing.": {
    "it": "22:04. Un fulmine, una torre e un tempismo spettacolare.",
    "fr": "22 h 04. Un éclair, une horloge et un timing spectaculaire.",
    "de": "22:04 Uhr. Ein Blitz, ein Uhrturm und spektakuläres Timing.",
    "es": "22:04. Un rayo, una torre y una sincronización espectacular.",
    "ja": "午後10時4分。稲妻と時計台、そして絶妙なタイミング。"
  },
  "Twin Pines Mall": {
    "it": "Centro commerciale Twin Pines",
    "fr": "Centre commercial des Deux Pins",
    "de": "Twin Pines Mall",
    "es": "Centro comercial Twin Pines",
    "ja": "ツイン・パインズ・モール"
  },
  "Einstein is one minute ahead.": {
    "it": "Einstein è avanti di un minuto.",
    "fr": "Einstein a une minute d'avance.",
    "de": "Einstein ist eine Minute voraus.",
    "es": "Einstein lleva un minuto de ventaja.",
    "ja": "アインシュタインは1分先へ。"
  },
  "The first successful test. Einstein returns; the parking lot gets interesting.": {
    "it": "Il primo test riuscito. Einstein ritorna e il parcheggio si anima.",
    "fr": "Premier essai réussi. Einstein revient, le parking s'anime.",
    "de": "Der erste Erfolg. Einstein kehrt zurück; der Parkplatz wird spannend.",
    "es": "La primera prueba correcta. Einstein vuelve y el aparcamiento se anima.",
    "ja": "初めての実験が成功。アインシュタインが戻り、駐車場が騒がしくなります。"
  },
  "PART II": {
    "it": "PARTE II",
    "fr": "PARTIE II",
    "de": "TEIL II",
    "es": "PARTE II",
    "ja": "第2作"
  },
  "Where is my hoverboard?": {
    "it": "Dov'è il mio hoverboard?",
    "fr": "Où est mon hoverboard ?",
    "de": "Wo ist mein Hoverboard?",
    "es": "¿Dónde está mi monopatín volador?",
    "ja": "ホバーボードはどこ？"
  },
  "Marty, Doc and Jennifer arrive in 2015. Hoverboards were supposed to be a thing.": {
    "it": "Marty, Doc e Jennifer arrivano nel 2015. Gli hoverboard dovevano esistere.",
    "fr": "Marty, Doc et Jennifer arrivent en 2015. Les hoverboards étaient prévus.",
    "de": "Marty, Doc und Jennifer landen 2015. Hoverboards sollte es geben.",
    "es": "Marty, Doc y Jennifer llegan a 2015. Ya deberían existir los monopatines voladores.",
    "ja": "マーティ、ドク、ジェニファーが2015年へ。ホバーボードがあるはずだったのに。"
  },
  "MONTH": {
    "it": "MESE",
    "fr": "MOIS",
    "de": "MONAT",
    "es": "MES",
    "ja": "月"
  },
  "DAY": {
    "it": "GIORNO",
    "fr": "JOUR",
    "de": "TAG",
    "es": "DÍA",
    "ja": "日"
  },
  "YEAR": {
    "it": "ANNO",
    "fr": "ANNÉE",
    "de": "JAHR",
    "es": "AÑO",
    "ja": "年"
  },
  "HOUR": {
    "it": "ORA",
    "fr": "HEURE",
    "de": "STUNDE",
    "es": "HORA",
    "ja": "時"
  },
  "{0}: {1} {2}, {3}, {4}:{5} Pacific time": {
    "it": "{0}: {1} {2}, {3}, {4}:{5} ora del Pacifico",
    "fr": "{0} : {1} {2}, {3}, {4}:{5} heure du Pacifique",
    "de": "{0}: {1} {2}, {3}, {4}:{5} Pazifikzeit",
    "es": "{0}: {1} {2}, {3}, {4}:{5} hora del Pacífico",
    "ja": "{0}：{3}年{1}{2}日 {4}:{5} 太平洋時間"
  },
  "CINEMATIC PREVIEW": {
    "it": "ANTEPRIMA CINEMATOGRAFICA",
    "fr": "APERÇU CINÉMATOGRAPHIQUE",
    "de": "FILMVORSCHAU",
    "es": "VISTA CINEMATOGRÁFICA",
    "ja": "映画のプレビュー"
  },
  "TIME SINCE THIS MOVIE MOMENT": {
    "it": "TEMPO DALL'EVENTO DEL FILM",
    "fr": "TEMPS DEPUIS CE MOMENT DU FILM",
    "de": "ZEIT SEIT DIESEM FILMMOMENT",
    "es": "TIEMPO DESDE ESTE MOMENTO DEL FILM",
    "ja": "映画の出来事からの時間"
  },
  "TIME UNTIL THIS MOVIE MOMENT": {
    "it": "TEMPO ALL'EVENTO DEL FILM",
    "fr": "TEMPS AVANT CE MOMENT DU FILM",
    "de": "ZEIT BIS ZU DIESEM FILMMOMENT",
    "es": "TIEMPO HASTA ESTE MOMENTO DEL FILM",
    "ja": "映画の出来事までの時間"
  },
  "{0} days, {1} hours, {2} minutes, {3} seconds {4} {5}": {
    "it": "{0} giorni, {1} ore, {2} minuti, {3} secondi {4} {5}",
    "fr": "{0} jours, {1} heures, {2} minutes, {3} secondes {4} {5}",
    "de": "{0} Tage, {1} Stunden, {2} Minuten, {3} Sekunden {4} {5}",
    "es": "{0} días, {1} horas, {2} minutos, {3} segundos {4} {5}",
    "ja": "{0}日{1}時間{2}分{3}秒 {4} {5}"
  },
  "{0} DAYS {1}": {
    "it": "{0} GIORNI {1}",
    "fr": "{0} JOURS {1}",
    "de": "{0} TAGE {1}",
    "es": "{0} DÍAS {1}",
    "ja": "{0}日{1}"
  },
  "AGO": {
    "it": "FA",
    "fr": "ÉCOULÉS",
    "de": "ZUVOR",
    "es": "ATRÁS",
    "ja": "前"
  },
  "AWAY": {
    "it": "RIMANENTI",
    "fr": "RESTANTS",
    "de": "VERBLEIBEND",
    "es": "RESTANTES",
    "ja": "後"
  },
  "● DISPLACED": {
    "it": "● NEL TEMPO",
    "fr": "● DÉPLACÉ",
    "de": "● ZEITVERSETZT",
    "es": "● DESPLAZADO",
    "ja": "● 移動済み"
  },
  "Temporal displacement complete. Please account for your pine trees.": {
    "it": "Spostamento completato. Occhio al numero di pini.",
    "fr": "Déplacement terminé. Comptez bien vos pins.",
    "de": "Zeitsprung abgeschlossen. Bitte die Kiefern nachzählen.",
    "es": "Desplazamiento completado. Comprueba cuántos pinos quedan.",
    "ja": "時間移動完了。松の木の本数を数えておきましょう。"
  },
  "{0} · {1}. You made it. The space-time continuum seems mostly fine.": {
    "it": "{0} · {1}. Ce l'hai fatta. Lo spaziotempo sembra quasi intatto.",
    "fr": "{0} · {1}. Vous y êtes. L'espace-temps semble presque intact.",
    "de": "{0} · {1}. Geschafft. Die Raumzeit scheint weitgehend heil.",
    "es": "{0} · {1}. Lo lograste. El espacio-tiempo parece casi intacto.",
    "ja": "{0} · {1}。到着しました。時空の連続体は、たぶん大丈夫。"
  },
  "● CHARGING": {
    "it": "● CARICA",
    "fr": "● CHARGE",
    "de": "● LÄDT",
    "es": "● CARGANDO",
    "ja": "● 充電中"
  },
  "Flux capacitor charging. Hold on to your almanac.": {
    "it": "Flusso canalizzatore in carica. Tieni stretto l'almanacco.",
    "fr": "Convecteur en charge. Accrochez-vous à votre almanach.",
    "de": "Fluxkompensator lädt. Almanach gut festhalten.",
    "es": "Condensador cargando. Sujeta tu almanaque.",
    "ja": "次元転移装置を充電中。年鑑をしっかり持って。"
  },
  "Temporal displacement complete. Grande Giove!": {
    "it": "Spostamento completato. Grande Giove!",
    "fr": "Déplacement terminé. Nom de Zeus !",
    "de": "Zeitsprung abgeschlossen. Großer Gott!",
    "es": "Desplazamiento completado. ¡Gran Scott!",
    "ja": "時間移動完了。なんてこった！"
  },
  "Back in the present. The future is still yours to make.": {
    "it": "Di nuovo nel presente. Il futuro è ancora da scrivere.",
    "fr": "De retour au présent. Le futur reste à écrire.",
    "de": "Zurück in der Gegenwart. Die Zukunft liegt bei dir.",
    "es": "De vuelta al presente. El futuro sigue en tus manos.",
    "ja": "現在に戻りました。未来はまだあなた次第です。"
  },
  "Temporal displacement complete.": {
    "it": "Spostamento temporale completato.",
    "fr": "Déplacement temporel terminé.",
    "de": "Zeitsprung abgeschlossen.",
    "es": "Desplazamiento temporal completado.",
    "ja": "時間移動が完了しました。"
  },
  "Flux dispersal: stable. One very questionable idea: ready.": {
    "it": "Dispersione stabile. Un'idea molto discutibile: pronta.",
    "fr": "Dispersion stable. Une idée très douteuse : prête.",
    "de": "Fluxverteilung stabil. Eine fragwürdige Idee: bereit.",
    "es": "Dispersión estable. Una idea muy cuestionable: lista.",
    "ja": "フラックス安定。かなり怪しい計画：準備完了。"
  },
  "DATE ONLY": {
    "it": "SOLO DATA",
    "fr": "DATE SEULE",
    "de": "NUR DATUM",
    "es": "SOLO FECHA",
    "ja": "日付のみ"
  },
  "Discovery": {
    "it": "Scoperte",
    "fr": "Découvertes",
    "de": "Entdeckungen",
    "es": "Descubrimientos",
    "ja": "発見"
  },
  "Space": {
    "it": "Spazio",
    "fr": "Espace",
    "de": "Raumfahrt",
    "es": "Espacio",
    "ja": "宇宙"
  },
  "Timekeeping": {
    "it": "Misura del tempo",
    "fr": "Mesure du temps",
    "de": "Zeitmessung",
    "es": "Medición del tiempo",
    "ja": "時の計測"
  },
  "Lime Green": {
    "it": "Verde lime",
    "fr": "Vert citron",
    "de": "Limettengrün",
    "es": "Verde lima",
    "ja": "ライムグリーン"
  },
  "Cyan Blue": {
    "it": "Blu ciano",
    "fr": "Bleu cyan",
    "de": "Cyanblau",
    "es": "Azul cian",
    "ja": "シアンブルー"
  },
  "Fuchsia Pink": {
    "it": "Rosa fucsia",
    "fr": "Rose fuchsia",
    "de": "Fuchsiarosa",
    "es": "Rosa fucsia",
    "ja": "フューシャピンク"
  },
  "Ruby Red": {
    "it": "Rosso rubino",
    "fr": "Rouge rubis",
    "de": "Rubinrot",
    "es": "Rojo rubí",
    "ja": "ルビーレッド"
  },
  "Champagne Gold": {
    "it": "Oro champagne",
    "fr": "Or champagne",
    "de": "Champagnergold",
    "es": "Oro champán",
    "ja": "シャンパンゴールド"
  },
  "Seafoam Teal": {
    "it": "Verde acqua",
    "fr": "Vert d'eau",
    "de": "Meergrün",
    "es": "Verde agua",
    "ja": "シーフォームティール"
  },
  "Amethyst Purple": {
    "it": "Viola ametista",
    "fr": "Violet améthyste",
    "de": "Amethystviolett",
    "es": "Violeta amatista",
    "ja": "アメジストパープル"
  },
  "Lava Orange": {
    "it": "Arancio lava",
    "fr": "Orange lave",
    "de": "Lavaorange",
    "es": "Naranja lava",
    "ja": "ラバオレンジ"
  },
  "Atlantic Blue": {
    "it": "Blu Atlantico",
    "fr": "Bleu Atlantique",
    "de": "Atlantikblau",
    "es": "Azul Atlántico",
    "ja": "アトランティックブルー"
  },
  "Twelve seconds that changed flight": {
    "it": "Dodici secondi che cambiarono il volo",
    "fr": "Douze secondes qui changent le vol",
    "de": "Zwölf Sekunden verändern das Fliegen",
    "es": "Doce segundos que cambiaron el vuelo",
    "ja": "飛行を変えた12秒"
  },
  "THE AGE OF FLIGHT": {
    "it": "L'ERA DEL VOLO",
    "fr": "L'ÈRE DU VOL",
    "de": "DAS ZEITALTER DES FLIEGENS",
    "es": "LA ERA DEL VUELO",
    "ja": "飛行の時代へ"
  },
  "Orville Wright lifts the Flyer off its launching rail. Twelve seconds and about 120 feet later, a new chapter in powered aviation has begun.": {
    "it": "Orville Wright decolla con il Flyer. Dodici secondi e circa 36 metri aprono un nuovo capitolo del volo a motore.",
    "fr": "Orville Wright décolle à bord du Flyer. Douze secondes et environ 36 mètres ouvrent un nouveau chapitre du vol motorisé.",
    "de": "Orville Wright hebt mit dem Flyer ab. Zwölf Sekunden und rund 36 Meter eröffnen ein neues Kapitel des Motorflugs.",
    "es": "Orville Wright despega con el Flyer. Doce segundos y unos 36 metros abren un nuevo capítulo de la aviación a motor.",
    "ja": "オーヴィル・ライトのフライヤー号が離陸。12秒、約36メートルの飛行が、動力飛行の新たな時代を開きました。"
  },
  "12 seconds": {
    "it": "12 secondi",
    "fr": "12 secondes",
    "de": "12 Sekunden",
    "es": "12 segundos",
    "ja": "12秒"
  },
  "FIRST FLIGHT DURATION": {
    "it": "DURATA DEL PRIMO VOLO",
    "fr": "DURÉE DU PREMIER VOL",
    "de": "DAUER DES ERSTEN FLUGS",
    "es": "DURACIÓN DEL PRIMER VUELO",
    "ja": "最初の飛行時間"
  },
  "Earth gets a new companion": {
    "it": "La Terra ha un nuovo compagno",
    "fr": "La Terre a un nouveau compagnon",
    "de": "Die Erde bekommt einen Begleiter",
    "es": "La Tierra tiene un nuevo compañero",
    "ja": "地球に新しい仲間が"
  },
  "THE SPACE AGE BEGINS": {
    "it": "INIZIA L'ERA SPAZIALE",
    "fr": "L'ÈRE SPATIALE COMMENCE",
    "de": "DAS RAUMFAHRTZEITALTER BEGINNT",
    "es": "COMIENZA LA ERA ESPACIAL",
    "ja": "宇宙時代の幕開け"
  },
  "Sputnik 1 becomes the first artificial satellite to orbit Earth. Its radio pulses turn the sky into something people can listen to as well as watch.": {
    "it": "Sputnik 1 è il primo satellite artificiale in orbita terrestre. I suoi impulsi radio rendono il cielo qualcosa da ascoltare.",
    "fr": "Spoutnik 1 devient le premier satellite artificiel de la Terre. Ses impulsions radio permettent aussi d'écouter le ciel.",
    "de": "Sputnik 1 wird der erste künstliche Erdsatellit. Seine Funkimpulse machen den Himmel auch hörbar.",
    "es": "Sputnik 1 es el primer satélite artificial terrestre. Sus pulsos de radio convierten el cielo en algo que también se escucha.",
    "ja": "スプートニク1号が地球初の人工衛星に。電波のパルスで、空は眺めるだけでなく聴くものにもなりました。"
  },
  "FIRST ARTIFICIAL EARTH SATELLITE": {
    "it": "PRIMO SATELLITE ARTIFICIALE TERRESTRE",
    "fr": "PREMIER SATELLITE ARTIFICIEL TERRESTRE",
    "de": "ERSTER KÜNSTLICHER ERDSATELLIT",
    "es": "PRIMER SATÉLITE ARTIFICIAL TERRESTRE",
    "ja": "地球初の人工衛星"
  },
  "One human. One orbit.": {
    "it": "Un essere umano. Un'orbita.",
    "fr": "Un humain. Une orbite.",
    "de": "Ein Mensch. Ein Umlauf.",
    "es": "Un ser humano. Una órbita.",
    "ja": "ひとりの人間、ひとつの軌道。"
  },
  "HUMANITY LEAVES EARTH": {
    "it": "L'UMANITÀ LASCIA LA TERRA",
    "fr": "L'HUMANITÉ QUITTE LA TERRE",
    "de": "DIE MENSCHHEIT VERLÄSST DIE ERDE",
    "es": "LA HUMANIDAD DEJA LA TIERRA",
    "ja": "人類が地球を離れる"
  },
  "Yuri Gagarin launches aboard Vostok 1 and becomes the first human in space. For the first time, someone can watch our planet from orbit.": {
    "it": "Yuri Gagarin parte con Vostok 1 e diventa il primo essere umano nello spazio. Per la prima volta qualcuno vede la Terra dall'orbita.",
    "fr": "Youri Gagarine décolle dans Vostok 1 et devient le premier humain dans l'espace, le premier à voir notre planète en orbite.",
    "de": "Juri Gagarin startet mit Wostok 1 als erster Mensch ins All. Erstmals sieht jemand unseren Planeten aus dem Orbit.",
    "es": "Yuri Gagarin despega en Vostok 1 y se convierte en el primer humano en el espacio, viendo la Tierra desde órbita.",
    "ja": "ユーリイ・ガガーリンがボストーク1号で人類初の宇宙飛行へ。初めて人が軌道上から地球を見ました。"
  },
  "FIRST HUMAN SPACEFLIGHT": {
    "it": "PRIMO VOLO SPAZIALE UMANO",
    "fr": "PREMIER VOL SPATIAL HUMAIN",
    "de": "ERSTER BEMANNTER RAUMFLUG",
    "es": "PRIMER VUELO ESPACIAL HUMANO",
    "ja": "人類初の宇宙飛行"
  },
  "The Eagle has landed": {
    "it": "L'Aquila è atterrata",
    "fr": "L'Aigle s'est posé",
    "de": "Der Adler ist gelandet",
    "es": "El Águila ha aterrizado",
    "ja": "イーグルは着陸した"
  },
  "A WORLD BEYOND OUR OWN": {
    "it": "UN MONDO OLTRE IL NOSTRO",
    "fr": "UN MONDE AU-DELÀ DU NÔTRE",
    "de": "EINE WELT JENSEITS UNSERER",
    "es": "UN MUNDO MÁS ALLÁ DEL NUESTRO",
    "ja": "私たちの世界の向こうへ"
  },
  "Apollo 11’s lunar module touches down in the Sea of Tranquillity. Armstrong and Aldrin prepare to step outside while Collins orbits above them.": {
    "it": "Il modulo lunare Apollo 11 si posa nel Mare della Tranquillità. Armstrong e Aldrin si preparano a uscire; Collins resta in orbita.",
    "fr": "Le module lunaire d'Apollo 11 se pose dans la mer de la Tranquillité. Armstrong et Aldrin préparent leur sortie ; Collins reste en orbite.",
    "de": "Die Mondfähre von Apollo 11 landet im Meer der Ruhe. Armstrong und Aldrin bereiten den Ausstieg vor, Collins bleibt im Orbit.",
    "es": "El módulo lunar de Apollo 11 aterriza en el mar de la Tranquilidad. Armstrong y Aldrin se preparan para salir; Collins sigue en órbita.",
    "ja": "アポロ11号の月着陸船が静かの海に着陸。アームストロングとオルドリンが船外へ備える間、コリンズは上空を周回します。"
  },
  "FIRST CREWED LUNAR LANDING": {
    "it": "PRIMO ALLUNAGGIO CON EQUIPAGGIO",
    "fr": "PREMIER ALUNISSAGE HABITÉ",
    "de": "ERSTE BEMANNTE MONDLANDUNG",
    "es": "PRIMER ALUNIZAJE TRIPULADO",
    "ja": "人類初の有人月面着陸"
  },
  "A footprint beyond Earth": {
    "it": "Un'impronta oltre la Terra",
    "fr": "Une empreinte au-delà de la Terre",
    "de": "Ein Fußabdruck jenseits der Erde",
    "es": "Una huella más allá de la Tierra",
    "ja": "地球の外に残した足跡"
  },
  "A SMALL STEP INTO HISTORY": {
    "it": "UN PICCOLO PASSO NELLA STORIA",
    "fr": "UN PETIT PAS DANS L'HISTOIRE",
    "de": "EIN KLEINER SCHRITT IN DIE GESCHICHTE",
    "es": "UN PEQUEÑO PASO EN LA HISTORIA",
    "ja": "歴史に刻む小さな一歩"
  },
  "Neil Armstrong’s left foot meets the lunar surface. A journey measured in years of work becomes a moment remembered across generations.": {
    "it": "Il piede sinistro di Neil Armstrong tocca la Luna. Anni di lavoro diventano un momento ricordato da generazioni.",
    "fr": "Le pied gauche de Neil Armstrong touche la Lune. Des années de travail deviennent un instant mémorable pour des générations.",
    "de": "Neil Armstrongs linker Fuß berührt den Mond. Jahrelange Arbeit wird zu einem Moment für Generationen.",
    "es": "El pie izquierdo de Neil Armstrong toca la Luna. Años de trabajo se convierten en un momento recordado por generaciones.",
    "ja": "ニール・アームストロングの左足が月面へ。長年の努力が、世代を超えて記憶される瞬間になりました。"
  },
  "FIRST FOOTSTEP · UTC": {
    "it": "PRIMO PASSO · UTC",
    "fr": "PREMIER PAS · UTC",
    "de": "ERSTER SCHRITT · UTC",
    "es": "PRIMER PASO · UTC",
    "ja": "最初の一歩 · UTC"
  },
  "A message to the stars": {
    "it": "Un messaggio alle stelle",
    "fr": "Un message aux étoiles",
    "de": "Eine Nachricht an die Sterne",
    "es": "Un mensaje a las estrellas",
    "ja": "星々へのメッセージ"
  },
  "THE LONG WAY HOME": {
    "it": "LA LUNGA STRADA VERSO CASA",
    "fr": "LE LONG CHEMIN VERS LA MAISON",
    "de": "DER WEITE WEG NACH HAUSE",
    "es": "EL LARGO CAMINO A CASA",
    "ja": "はるかな故郷への道"
  },
  "Voyager 1 lifts off toward the outer planets. On board is a Golden Record: a collection of sounds and images from the world it leaves behind.": {
    "it": "Voyager 1 parte verso i pianeti esterni. Porta il Golden Record, suoni e immagini del mondo che si lascia alle spalle.",
    "fr": "Voyager 1 part vers les planètes externes avec le Golden Record, des sons et images du monde qu'il quitte.",
    "de": "Voyager 1 startet zu den äußeren Planeten. An Bord: die Goldene Schallplatte mit Klängen und Bildern der zurückgelassenen Welt.",
    "es": "Voyager 1 parte hacia los planetas exteriores con el Disco de Oro: sonidos e imágenes del mundo que deja atrás.",
    "ja": "ボイジャー1号が外惑星へ出発。地球の音と映像を収めたゴールデンレコードを載せて、故郷を離れます。"
  },
  "A TIME CAPSULE ABOARD VOYAGER": {
    "it": "UNA CAPSULA DEL TEMPO SU VOYAGER",
    "fr": "UNE CAPSULE TEMPORELLE SUR VOYAGER",
    "de": "EINE ZEITKAPSEL AN BORD VON VOYAGER",
    "es": "UNA CÁPSULA DEL TIEMPO EN VOYAGER",
    "ja": "ボイジャーに載せたタイムカプセル"
  },
  "A world of connections": {
    "it": "Un mondo di connessioni",
    "fr": "Un monde de connexions",
    "de": "Eine Welt voller Verbindungen",
    "es": "Un mundo de conexiones",
    "ja": "つながりの世界"
  },
  "THE WEB OPENS TO THE WORLD": {
    "it": "IL WEB SI APRE AL MONDO",
    "fr": "LE WEB S'OUVRE AU MONDE",
    "de": "DAS WEB ÖFFNET SICH DER WELT",
    "es": "LA WEB SE ABRE AL MUNDO",
    "ja": "ウェブが世界に開かれる"
  },
  "CERN releases the World Wide Web software into the public domain. An invention created to connect researchers becomes available for anyone to build upon.": {
    "it": "Il CERN rende pubblico il software World Wide Web. Nato per collegare ricercatori, diventa una base aperta a tutti.",
    "fr": "Le CERN place le logiciel World Wide Web dans le domaine public. Créé pour les chercheurs, il devient accessible à tous.",
    "de": "CERN gibt die World-Wide-Web-Software gemeinfrei. Die Erfindung zur Vernetzung von Forschern wird für alle zugänglich.",
    "es": "El CERN libera el software de la World Wide Web al dominio público. La herramienta para investigadores queda disponible para todos.",
    "ja": "CERNがWorld Wide Webのソフトウェアをパブリックドメインに。研究者を結ぶ発明が、誰もが利用できる基盤になりました。"
  },
  "Open to everyone": {
    "it": "Aperto a tutti",
    "fr": "Ouvert à tous",
    "de": "Offen für alle",
    "es": "Abierto a todos",
    "ja": "誰もが利用できる"
  },
  "WEB SOFTWARE RELEASED INTO THE PUBLIC DOMAIN": {
    "it": "SOFTWARE WEB NEL PUBBLICO DOMINIO",
    "fr": "LOGICIEL WEB DANS LE DOMAINE PUBLIC",
    "de": "WEB-SOFTWARE WIRD GEMEINFREI",
    "es": "SOFTWARE WEB EN EL DOMINIO PÚBLICO",
    "ja": "ウェブソフトウェアを公開"
  },
  "The calendar skips ten days": {
    "it": "Il calendario salta dieci giorni",
    "fr": "Le calendrier saute dix jours",
    "de": "Der Kalender überspringt zehn Tage",
    "es": "El calendario salta diez días",
    "ja": "暦から10日が消える"
  },
  "The first countries adopting the Gregorian calendar": {
    "it": "I primi paesi che adottano il calendario gregoriano",
    "fr": "Les premiers pays adoptant le calendrier grégorien",
    "de": "Die ersten Länder mit gregorianischem Kalender",
    "es": "Los primeros países que adoptan el calendario gregoriano",
    "ja": "グレゴリオ暦を最初に採用した国々"
  },
  "A NEW WAY TO COUNT THE DAYS": {
    "it": "UN NUOVO MODO DI CONTARE I GIORNI",
    "fr": "UNE NOUVELLE FAÇON DE COMPTER LES JOURS",
    "de": "EINE NEUE ART, DIE TAGE ZU ZÄHLEN",
    "es": "UNA NUEVA FORMA DE CONTAR LOS DÍAS",
    "ja": "日を数える新しい方法"
  },
  "In the first adopting countries, 4 October is followed by 15 October. The Gregorian reform brings calendar dates back toward the seasons; other countries change calendars later.": {
    "it": "Nei primi paesi aderenti, al 4 ottobre segue il 15. La riforma gregoriana riallinea date e stagioni; altri paesi seguiranno più tardi.",
    "fr": "Dans les premiers pays, le 4 octobre est suivi du 15. La réforme grégorienne réaligne calendrier et saisons ; d'autres pays suivront.",
    "de": "In den ersten Ländern folgt auf den 4. der 15. Oktober. Die gregorianische Reform passt den Kalender den Jahreszeiten an; andere Länder folgen später.",
    "es": "En los primeros países, al 4 de octubre le sigue el 15. La reforma gregoriana realinea calendario y estaciones; otros países cambian después.",
    "ja": "最初に採用した国では10月4日の次が15日に。グレゴリオ暦改革で暦を季節に合わせ、他国は後に続きました。"
  },
  "10 dates skipped": {
    "it": "10 date saltate",
    "fr": "10 dates sautées",
    "de": "10 Daten übersprungen",
    "es": "10 fechas omitidas",
    "ja": "10日分を省略"
  },
  "THE GREGORIAN CALENDAR REFORM": {
    "it": "LA RIFORMA GREGORIANA",
    "fr": "LA RÉFORME GRÉGORIENNE",
    "de": "DIE GREGORIANISCHE KALENDERREFORM",
    "es": "LA REFORMA GREGORIANA",
    "ja": "グレゴリオ暦への改革"
  },
  "Small lights around Jupiter": {
    "it": "Piccole luci attorno a Giove",
    "fr": "De petites lumières autour de Jupiter",
    "de": "Kleine Lichter um Jupiter",
    "es": "Pequeñas luces alrededor de Júpiter",
    "ja": "木星を巡る小さな光"
  },
  "A DIFFERENT CENTRE OF GRAVITY": {
    "it": "UN ALTRO CENTRO DI GRAVITÀ",
    "fr": "UN AUTRE CENTRE DE GRAVITÉ",
    "de": "EIN ANDERES GRAVITATIONSZENTRUM",
    "es": "OTRO CENTRO DE GRAVEDAD",
    "ja": "もう一つの重力の中心"
  },
  "Galileo notices points of light beside Jupiter. Repeated observations reveal moons orbiting another planet, challenging the idea that every celestial body circles Earth.": {
    "it": "Galileo osserva luci accanto a Giove. Scopre lune attorno a un altro pianeta, mettendo in dubbio che tutto ruoti intorno alla Terra.",
    "fr": "Galilée observe des lumières près de Jupiter : des lunes autour d'une autre planète, remettant en cause un univers centré sur la Terre.",
    "de": "Galileo sieht Lichtpunkte bei Jupiter. Monde um einen anderen Planeten stellen die Vorstellung infrage, alles kreise um die Erde.",
    "es": "Galileo observa luces junto a Júpiter. Son lunas de otro planeta, desafiando la idea de que todo gira alrededor de la Tierra.",
    "ja": "ガリレオが木星のそばに光を発見。別の惑星を回る衛星は、すべてが地球を巡るという考えを揺さぶりました。"
  },
  "Jupiter’s moons": {
    "it": "Le lune di Giove",
    "fr": "Les lunes de Jupiter",
    "de": "Jupiters Monde",
    "es": "Las lunas de Júpiter",
    "ja": "木星の衛星"
  },
  "GALILEO’S FIRST OBSERVATIONS": {
    "it": "LE PRIME OSSERVAZIONI DI GALILEO",
    "fr": "PREMIÈRES OBSERVATIONS DE GALILÉE",
    "de": "GALILEOS ERSTE BEOBACHTUNGEN",
    "es": "PRIMERAS OBSERVACIONES DE GALILEO",
    "ja": "ガリレオの最初の観測"
  },
  "The sky becomes a destination": {
    "it": "Il cielo diventa una meta",
    "fr": "Le ciel devient une destination",
    "de": "Der Himmel wird zum Reiseziel",
    "es": "El cielo se convierte en destino",
    "ja": "空が目的地になる"
  },
  "BEFORE WINGS, THERE WAS FIRE": {
    "it": "PRIMA DELLE ALI, IL FUOCO",
    "fr": "AVANT LES AILES, LE FEU",
    "de": "VOR DEN FLÜGELN WAR DAS FEUER",
    "es": "ANTES DE LAS ALAS, EL FUEGO",
    "ja": "翼の前には、炎があった"
  },
  "Pilâtre de Rozier and the Marquis d’Arlandes take a free flight in a Montgolfier hot-air balloon. Human travel gains a new direction: upward.": {
    "it": "Pilâtre de Rozier e il marchese d'Arlandes volano liberi su una mongolfiera. L'umanità trova una nuova direzione: verso l'alto.",
    "fr": "Pilâtre de Rozier et le marquis d'Arlandes volent librement en montgolfière. Le voyage humain prend une nouvelle direction : vers le haut.",
    "de": "Pilâtre de Rozier und der Marquis d'Arlandes fliegen frei im Heißluftballon. Menschliches Reisen bekommt eine neue Richtung: aufwärts.",
    "es": "Pilâtre de Rozier y el marqués de Arlandes vuelan libres en globo. Los viajes humanos ganan una nueva dirección: hacia arriba.",
    "ja": "ピラートル・ド・ロジェとダルランド侯爵が熱気球で自由飛行。人の旅に「上へ」という新しい方向が加わりました。"
  },
  "Montgolfier balloon": {
    "it": "Mongolfiera",
    "fr": "Montgolfière",
    "de": "Montgolfière",
    "es": "Globo de los Montgolfier",
    "ja": "モンゴルフィエの熱気球"
  },
  "FIRST UNTETHERED HUMAN BALLOON FLIGHT": {
    "it": "PRIMO VOLO UMANO LIBERO IN PALLONE",
    "fr": "PREMIER VOL HUMAIN LIBRE EN BALLON",
    "de": "ERSTER FREIER BEMANNTER BALLONFLUG",
    "es": "PRIMER VUELO HUMANO LIBRE EN GLOBO",
    "ja": "人類初の自由な有人気球飛行"
  },
  "The day the clocks agreed": {
    "it": "Il giorno in cui gli orologi si accordarono",
    "fr": "Le jour où les horloges s'accordent",
    "de": "Der Tag, an dem sich die Uhren einigten",
    "es": "El día en que los relojes se pusieron de acuerdo",
    "ja": "時計が足並みをそろえた日"
  },
  "North American railway networks": {
    "it": "Reti ferroviarie nordamericane",
    "fr": "Réseaux ferroviaires nord-américains",
    "de": "Nordamerikanische Eisenbahnnetze",
    "es": "Redes ferroviarias norteamericanas",
    "ja": "北米の鉄道網"
  },
  "A SHARED TIME FOR A CONNECTED WORLD": {
    "it": "UN'ORA COMUNE PER UN MONDO CONNESSO",
    "fr": "UNE HEURE COMMUNE POUR UN MONDE CONNECTÉ",
    "de": "GEMEINSAME ZEIT FÜR EINE VERNETZTE WELT",
    "es": "UNA HORA COMÚN PARA UN MUNDO CONECTADO",
    "ja": "つながる世界の共通時刻"
  },
  "Railroads adopt Standard Railway Time in four North American zones. A timetable can now link distant places using shared clocks instead of a patchwork of local solar times.": {
    "it": "Le ferrovie adottano l'ora standard in quattro zone nordamericane. Orari condivisi sostituiscono il mosaico delle ore solari locali.",
    "fr": "Les chemins de fer adoptent une heure standard dans quatre zones nord-américaines, remplaçant les multiples heures solaires locales.",
    "de": "Bahnen führen Standardzeit in vier nordamerikanischen Zonen ein. Gemeinsame Uhren ersetzen die vielen lokalen Sonnenzeiten.",
    "es": "Los ferrocarriles adoptan la hora estándar en cuatro zonas norteamericanas, sustituyendo el mosaico de horas solares locales.",
    "ja": "鉄道が北米4地域で標準時を採用。ばらばらな地方太陽時に代わり、共通の時計で遠くの場所を結びます。"
  },
  "Four time zones": {
    "it": "Quattro fusi orari",
    "fr": "Quatre fuseaux horaires",
    "de": "Vier Zeitzonen",
    "es": "Cuatro husos horarios",
    "ja": "4つのタイムゾーン"
  },
  "STANDARD RAILWAY TIME ADOPTED": {
    "it": "ADOZIONE DELL'ORA FERROVIARIA STANDARD",
    "fr": "ADOPTION DE L'HEURE FERROVIAIRE STANDARD",
    "de": "EINFÜHRUNG DER BAHNSTANDARDZEIT",
    "es": "ADOPCIÓN DE LA HORA FERROVIARIA ESTÁNDAR",
    "ja": "鉄道標準時の採用"
  },
  "Seagull reaches the stars": {
    "it": "Il gabbiano raggiunge le stelle",
    "fr": "La mouette rejoint les étoiles",
    "de": "Die Möwe erreicht die Sterne",
    "es": "La gaviota alcanza las estrellas",
    "ja": "カモメが星々へ"
  },
  "ANOTHER BARRIER FALLS": {
    "it": "CADE UN'ALTRA BARRIERA",
    "fr": "UNE AUTRE BARRIÈRE TOMBE",
    "de": "EINE WEITERE GRENZE FÄLLT",
    "es": "CAE OTRA BARRERA",
    "ja": "新たな壁を越えて"
  },
  "Valentina Tereshkova launches aboard Vostok 6 and becomes the first woman in space. Her radio call sign is Chaika: Seagull.": {
    "it": "Valentina Tereshkova parte con Vostok 6 e diventa la prima donna nello spazio. Il suo nominativo radio è Chaika: Gabbiano.",
    "fr": "Valentina Terechkova décolle dans Vostok 6, première femme dans l'espace. Son indicatif radio est Tchaïka : Mouette.",
    "de": "Walentina Tereschkowa startet mit Wostok 6 als erste Frau ins All. Ihr Funkrufname: Tschaika, die Möwe.",
    "es": "Valentina Tereshkova despega en Vostok 6 y se convierte en la primera mujer en el espacio. Su indicativo: Chaika, Gaviota.",
    "ja": "ワレンチナ・テレシコワがボストーク6号で女性初の宇宙飛行へ。コールサインは「チャイカ」、カモメです。"
  },
  "FIRST WOMAN IN SPACE": {
    "it": "PRIMA DONNA NELLO SPAZIO",
    "fr": "PREMIÈRE FEMME DANS L'ESPACE",
    "de": "ERSTE FRAU IM ALL",
    "es": "PRIMERA MUJER EN EL ESPACIO",
    "ja": "女性初の宇宙飛行"
  },
  "Outside the spacecraft": {
    "it": "Fuori dalla navicella",
    "fr": "Hors du vaisseau",
    "de": "Außerhalb des Raumschiffs",
    "es": "Fuera de la nave",
    "ja": "宇宙船の外へ"
  },
  "ONE STEP INTO THE VACUUM": {
    "it": "UN PASSO NEL VUOTO",
    "fr": "UN PAS DANS LE VIDE",
    "de": "EIN SCHRITT INS VAKUUM",
    "es": "UN PASO EN EL VACÍO",
    "ja": "真空への一歩"
  },
  "Alexei Leonov leaves the Voskhod 2 airlock for the first human spacewalk. A spacecraft is no longer the only place a human can work in orbit.": {
    "it": "Alexei Leonov esce da Voskhod 2 per la prima passeggiata spaziale umana. Ora si può lavorare anche fuori dalla navicella.",
    "fr": "Alexeï Leonov sort de Voskhod 2 pour la première sortie spatiale humaine. Le travail en orbite dépasse le vaisseau.",
    "de": "Alexei Leonow verlässt Woschod 2 zum ersten Weltraumspaziergang. Menschen können nun auch außerhalb eines Raumschiffs arbeiten.",
    "es": "Alexei Leonov sale de Voskhod 2 en el primer paseo espacial humano. El trabajo orbital ya no se limita a la nave.",
    "ja": "アレクセイ・レオーノフがボスホート2号から人類初の宇宙遊泳へ。人が働く場所は宇宙船の外にも広がりました。"
  },
  "FIRST HUMAN SPACEWALK": {
    "it": "PRIMA PASSEGGIATA SPAZIALE UMANA",
    "fr": "PREMIÈRE SORTIE SPATIALE HUMAINE",
    "de": "ERSTER MENSCHLICHER WELTRAUMSPAZIERGANG",
    "es": "PRIMER PASEO ESPACIAL HUMANO",
    "ja": "人類初の宇宙遊泳"
  },
  "Round the Moon and back": {
    "it": "Intorno alla Luna e ritorno",
    "fr": "Autour de la Lune et retour",
    "de": "Um den Mond und zurück",
    "es": "Alrededor de la Luna y de vuelta",
    "ja": "月を回って、帰る"
  },
  "EARTH BECOMES THE DISTANT WORLD": {
    "it": "LA TERRA DIVENTA IL MONDO LONTANO",
    "fr": "LA TERRE DEVIENT LE MONDE LOINTAIN",
    "de": "DIE ERDE WIRD ZUR FERNEN WELT",
    "es": "LA TIERRA SE CONVIERTE EN EL MUNDO LEJANO",
    "ja": "地球が遠い世界になる"
  },
  "Apollo 8 launches with Frank Borman, Jim Lovell and Bill Anders. Their mission will carry the first humans into lunar orbit and bring home a new view of Earth.": {
    "it": "Apollo 8 parte con Borman, Lovell e Anders. Saranno i primi umani in orbita lunare, riportando una nuova visione della Terra.",
    "fr": "Apollo 8 part avec Borman, Lovell et Anders. Premiers humains en orbite lunaire, ils rapportent un autre regard sur la Terre.",
    "de": "Apollo 8 startet mit Borman, Lovell und Anders. Als erste Menschen in der Mondumlaufbahn bringen sie einen neuen Blick auf die Erde zurück.",
    "es": "Apollo 8 despega con Borman, Lovell y Anders. Los primeros humanos en órbita lunar traerán una nueva imagen de la Tierra.",
    "ja": "ボーマン、ラヴェル、アンダースを乗せアポロ8号が出発。初の月周回で、人類に新たな地球の姿をもたらします。"
  },
  "FIRST CREWED JOURNEY TO LUNAR ORBIT": {
    "it": "PRIMO VIAGGIO UMANO IN ORBITA LUNARE",
    "fr": "PREMIER VOYAGE HUMAIN EN ORBITE LUNAIRE",
    "de": "ERSTE BEMANNTE REISE IN DEN MONDORBIT",
    "es": "PRIMER VIAJE HUMANO A ÓRBITA LUNAR",
    "ja": "人類初の月周回飛行"
  },
  "Two letters connect two worlds": {
    "it": "Due lettere collegano due mondi",
    "fr": "Deux lettres relient deux mondes",
    "de": "Zwei Buchstaben verbinden zwei Welten",
    "es": "Dos letras conectan dos mundos",
    "ja": "二文字が世界をつなぐ"
  },
  "THE NETWORK FINDS ITS VOICE": {
    "it": "LA RETE TROVA LA SUA VOCE",
    "fr": "LE RÉSEAU TROUVE SA VOIX",
    "de": "DAS NETZ FINDET SEINE STIMME",
    "es": "LA RED ENCUENTRA SU VOZ",
    "ja": "ネットワークが声を得る"
  },
  "A UCLA team attempts to send LOGIN to another computer over ARPANET. The system crashes after the first two letters: LO. A modest exchange begins a much larger story.": {
    "it": "UCLA tenta di inviare LOGIN a un computer tramite ARPANET. Il sistema si blocca dopo LO: un piccolo scambio apre una grande storia.",
    "fr": "UCLA tente d'envoyer LOGIN via ARPANET. Le système s'arrête après LO : un petit échange inaugure une grande histoire.",
    "de": "UCLA versucht LOGIN über ARPANET zu senden. Nach LO stürzt das System ab. Ein kleiner Austausch beginnt eine große Geschichte.",
    "es": "UCLA intenta enviar LOGIN por ARPANET. El sistema falla tras LO: un pequeño intercambio inicia una gran historia.",
    "ja": "UCLAがARPANETでLOGINを送ろうとするも、LOの2文字で停止。この小さな通信から大きな物語が始まります。"
  },
  "FIRST ARPANET HOST-TO-HOST MESSAGE": {
    "it": "PRIMO MESSAGGIO TRA HOST ARPANET",
    "fr": "PREMIER MESSAGE ENTRE HÔTES ARPANET",
    "de": "ERSTE ARPANET-NACHRICHT ZWISCHEN RECHNERN",
    "es": "PRIMER MENSAJE ENTRE EQUIPOS ARPANET",
    "ja": "ARPANET初のホスト間メッセージ"
  },
  "A grand tour begins": {
    "it": "Inizia un grande tour",
    "fr": "Un grand tour commence",
    "de": "Eine große Reise beginnt",
    "es": "Comienza una gran gira",
    "ja": "壮大な旅の始まり"
  },
  "FOUR GIANT WORLDS AHEAD": {
    "it": "QUATTRO MONDI GIGANTI DAVANTI",
    "fr": "QUATRE MONDES GÉANTS À VENIR",
    "de": "VIER RIESENWELTEN VORAUS",
    "es": "CUATRO MUNDOS GIGANTES POR DELANTE",
    "ja": "4つの巨大惑星へ"
  },
  "Voyager 2 launches before its twin. Its trajectory will take the spacecraft past Jupiter, Saturn, Uranus and Neptune, carrying instruments and another Golden Record.": {
    "it": "Voyager 2 parte prima della gemella. Visiterà Giove, Saturno, Urano e Nettuno, con strumenti scientifici e un altro Golden Record.",
    "fr": "Voyager 2 part avant sa jumelle. Elle visitera Jupiter, Saturne, Uranus et Neptune, avec des instruments et un autre Golden Record.",
    "de": "Voyager 2 startet vor ihrer Zwillingssonde. Sie besucht Jupiter, Saturn, Uranus und Neptun mit Instrumenten und einer weiteren Goldenen Schallplatte.",
    "es": "Voyager 2 parte antes que su gemela. Visitará Júpiter, Saturno, Urano y Neptuno con instrumentos y otro Disco de Oro.",
    "ja": "双子の探査機より先にボイジャー2号が出発。観測機器とレコードを載せ、木星・土星・天王星・海王星を目指します。"
  },
  "THE TOUR OF THE OUTER PLANETS": {
    "it": "IL TOUR DEI PIANETI ESTERNI",
    "fr": "LE TOUR DES PLANÈTES EXTERNES",
    "de": "DIE REISE ZU DEN ÄUSSEREN PLANETEN",
    "es": "LA GIRA DE LOS PLANETAS EXTERIORES",
    "ja": "外惑星を巡る旅"
  },
  "A spacecraft with wings": {
    "it": "Una navicella con le ali",
    "fr": "Un vaisseau avec des ailes",
    "de": "Ein Raumschiff mit Flügeln",
    "es": "Una nave con alas",
    "ja": "翼を持つ宇宙船"
  },
  "A NEW ROUTE TO ORBIT": {
    "it": "UNA NUOVA STRADA PER L'ORBITA",
    "fr": "UNE NOUVELLE ROUTE VERS L'ORBITE",
    "de": "EIN NEUER WEG IN DEN ORBIT",
    "es": "UNA NUEVA RUTA A LA ÓRBITA",
    "ja": "軌道への新しい道"
  },
  "John Young and Robert Crippen launch aboard Columbia on STS-1. The first Space Shuttle mission tests an orbiter designed to return to Earth and land on a runway.": {
    "it": "Young e Crippen decollano con Columbia nella missione STS-1. Il primo Shuttle prova un veicolo capace di rientrare e atterrare su pista.",
    "fr": "Young et Crippen décollent sur Columbia, STS-1. Le premier vol de navette teste un véhicule revenant se poser sur une piste.",
    "de": "Young und Crippen starten mit Columbia auf STS-1. Der erste Shuttleflug testet einen Orbiter, der auf einer Landebahn zurückkehrt.",
    "es": "Young y Crippen despegan en Columbia, STS-1. El primer Shuttle prueba un vehículo capaz de volver y aterrizar en pista.",
    "ja": "ヤングとクリッペンがコロンビア号でSTS-1へ。初のシャトル飛行で、地球に戻り滑走路に着陸する機体を試します。"
  },
  "FIRST SPACE SHUTTLE MISSION": {
    "it": "PRIMA MISSIONE DELLO SPACE SHUTTLE",
    "fr": "PREMIÈRE MISSION DE NAVETTE SPATIALE",
    "de": "ERSTE SPACE-SHUTTLE-MISSION",
    "es": "PRIMERA MISIÓN DEL TRANSBORDADOR ESPACIAL",
    "ja": "スペースシャトル初の飛行"
  },
  "An observatory above the air": {
    "it": "Un osservatorio sopra l'atmosfera",
    "fr": "Un observatoire au-dessus de l'air",
    "de": "Ein Observatorium über der Atmosphäre",
    "es": "Un observatorio sobre la atmósfera",
    "ja": "大気の上の天文台"
  },
  "THE UNIVERSE GETS A CLEARER WINDOW": {
    "it": "UNA FINESTRA PIÙ LIMPIDA SULL'UNIVERSO",
    "fr": "UNE FENÊTRE PLUS CLAIRE SUR L'UNIVERS",
    "de": "EIN KLARERES FENSTER INS UNIVERSUM",
    "es": "UNA VENTANA MÁS CLARA AL UNIVERSO",
    "ja": "宇宙を見る澄んだ窓"
  },
  "Discovery lifts off carrying the Hubble Space Telescope. An observatory above most of Earth’s atmosphere begins its journey toward new views of the cosmos.": {
    "it": "Discovery porta in orbita il telescopio Hubble. Sopra gran parte dell'atmosfera, l'osservatorio inizia a svelare il cosmo.",
    "fr": "Discovery emporte le télescope Hubble. Au-dessus de l'essentiel de l'atmosphère, il commence à révéler le cosmos.",
    "de": "Discovery bringt das Hubble-Teleskop ins All. Oberhalb des größten Teils der Atmosphäre beginnt es, den Kosmos zu enthüllen.",
    "es": "Discovery lleva al Hubble. Sobre gran parte de la atmósfera, el observatorio empieza a revelar el cosmos.",
    "ja": "ディスカバリー号がハッブル望遠鏡を運びます。大気の大部分より上で、宇宙の新たな姿を探り始めました。"
  },
  "LAUNCHED ABOARD DISCOVERY": {
    "it": "LANCIATO A BORDO DI DISCOVERY",
    "fr": "LANCÉ À BORD DE DISCOVERY",
    "de": "AN BORD VON DISCOVERY GESTARTET",
    "es": "LANZADO A BORDO DE DISCOVERY",
    "ja": "ディスカバリー号で打ち上げ"
  },
  "Small wheels on a red world": {
    "it": "Piccole ruote su un mondo rosso",
    "fr": "De petites roues sur un monde rouge",
    "de": "Kleine Räder auf einer roten Welt",
    "es": "Pequeñas ruedas en un mundo rojo",
    "ja": "赤い世界の小さな車輪"
  },
  "A NEW WAY TO EXPLORE MARS": {
    "it": "UN NUOVO MODO DI ESPLORARE MARTE",
    "fr": "UNE NOUVELLE FAÇON D'EXPLORER MARS",
    "de": "EINE NEUE ART, DEN MARS ZU ERFORSCHEN",
    "es": "UNA NUEVA FORMA DE EXPLORAR MARTE",
    "ja": "火星を探る新しい方法"
  },
  "Mars Pathfinder lands with the Sojourner rover aboard. The mission demonstrates a compact mobile explorer that can investigate Martian rocks beyond its landing platform.": {
    "it": "Mars Pathfinder atterra con il rover Sojourner. Un esploratore compatto e mobile può analizzare rocce oltre la piattaforma di atterraggio.",
    "fr": "Mars Pathfinder se pose avec Sojourner. Ce petit explorateur mobile étudie les roches au-delà de la plateforme d'atterrissage.",
    "de": "Mars Pathfinder landet mit Sojourner. Ein kompakter mobiler Forscher untersucht Gestein abseits der Landeplattform.",
    "es": "Mars Pathfinder aterriza con Sojourner. Un explorador móvil compacto investiga rocas más allá de su plataforma de aterrizaje.",
    "ja": "マーズ・パスファインダーがソジャーナを載せて着陸。小さな移動探査車が、着陸台の外にある火星の岩を調べます。"
  },
  "THE FIRST ROVER DELIVERED TO MARS": {
    "it": "IL PRIMO ROVER PORTATO SU MARTE",
    "fr": "PREMIER ROVER LIVRÉ SUR MARS",
    "de": "ERSTER AUF MARS ABGESETZTER ROVER",
    "es": "PRIMER ROVER ENTREGADO EN MARTE",
    "ja": "火星に届いた最初の探査車"
  },
  "A home above the world": {
    "it": "Una casa sopra il mondo",
    "fr": "Un foyer au-dessus du monde",
    "de": "Ein Zuhause über der Welt",
    "es": "Un hogar sobre el mundo",
    "ja": "世界の上にある家"
  },
  "International Space Station": {
    "it": "Stazione Spaziale Internazionale",
    "fr": "Station spatiale internationale",
    "de": "Internationale Raumstation",
    "es": "Estación Espacial Internacional",
    "ja": "国際宇宙ステーション"
  },
  "THE ORBITAL OUTPOST OPENS": {
    "it": "L'AVAMPOSTO ORBITALE APRE",
    "fr": "L'AVANT-POSTE ORBITAL OUVRE",
    "de": "DER AUSSENPOSTEN IM ORBIT ÖFFNET",
    "es": "SE ABRE EL PUESTO ORBITAL",
    "ja": "軌道上の拠点が開く"
  },
  "Bill Shepherd, Yuri Gidzenko and Sergei Krikalev arrive for Expedition 1. Their stay begins the era of continuous human occupation aboard the International Space Station.": {
    "it": "Shepherd, Gidzenko e Krikalev arrivano per Expedition 1. Inizia la presenza umana continua sulla Stazione Spaziale Internazionale.",
    "fr": "Shepherd, Guidzenko et Krikaliov arrivent pour Expedition 1. La présence humaine continue commence dans la Station spatiale internationale.",
    "de": "Shepherd, Gidsenko und Krikaljow kommen mit Expedition 1 an. Die ständige menschliche Besiedlung der ISS beginnt.",
    "es": "Shepherd, Gidzenko y Krikalev llegan en Expedición 1. Comienza la ocupación humana continua de la Estación Espacial Internacional.",
    "ja": "シェパード、ギドゼンコ、クリカレフが第1次長期滞在へ。国際宇宙ステーションで途切れない有人滞在が始まります。"
  },
  "THE FIRST RESIDENT ISS CREW": {
    "it": "IL PRIMO EQUIPAGGIO RESIDENTE ISS",
    "fr": "PREMIER ÉQUIPAGE RÉSIDENT DE L'ISS",
    "de": "ERSTE STÄNDIGE ISS-BESATZUNG",
    "es": "PRIMERA TRIPULACIÓN RESIDENTE DE LA ISS",
    "ja": "ISS初の長期滞在クルー"
  },
  "A computer in your pocket": {
    "it": "Un computer in tasca",
    "fr": "Un ordinateur dans la poche",
    "de": "Ein Computer in deiner Tasche",
    "es": "Un ordenador en el bolsillo",
    "ja": "ポケットの中のコンピューター"
  },
  "A NEW WAY TO TOUCH THE WEB": {
    "it": "UN NUOVO MODO DI TOCCARE IL WEB",
    "fr": "UNE NOUVELLE FAÇON DE TOUCHER LE WEB",
    "de": "EINE NEUE ART, DAS WEB ZU BERÜHREN",
    "es": "UNA NUEVA FORMA DE TOCAR LA WEB",
    "ja": "触れて使う新しいウェブ"
  },
  "Apple introduces the original iPhone, combining a phone, a music player and internet features behind a multitouch screen. The announcement precedes its arrival in shops.": {
    "it": "Apple presenta il primo iPhone: telefono, musica e Internet su un touchscreen multitouch. L'annuncio precede l'arrivo nei negozi.",
    "fr": "Apple présente le premier iPhone : téléphone, musique et Internet sur écran multitactile. L'annonce précède la vente.",
    "de": "Apple stellt das erste iPhone vor: Telefon, Musik und Internet auf einem Multitouch-Display. Die Ankündigung erfolgt vor dem Verkaufsstart.",
    "es": "Apple presenta el primer iPhone: teléfono, música e Internet en una pantalla multitáctil. El anuncio precede a su venta.",
    "ja": "Appleが初代iPhoneを発表。電話・音楽・インターネットをマルチタッチ画面で統合し、発売に先駆けて披露しました。"
  },
  "THE ORIGINAL IPHONE IS INTRODUCED": {
    "it": "PRESENTAZIONE DEL PRIMO IPHONE",
    "fr": "PRÉSENTATION DU PREMIER IPHONE",
    "de": "DAS ERSTE IPHONE WIRD VORGESTELLT",
    "es": "PRESENTACIÓN DEL PRIMER IPHONE",
    "ja": "初代iPhoneの発表"
  },
  "A first lap beneath the border": {
    "it": "Un primo giro sotto il confine",
    "fr": "Un premier tour sous la frontière",
    "de": "Eine erste Runde unter der Grenze",
    "es": "Una primera vuelta bajo la frontera",
    "ja": "国境の下で最初の一周"
  },
  "CERN, near Geneva": {
    "it": "CERN, vicino a Ginevra",
    "fr": "CERN, près de Genève",
    "de": "CERN bei Genf",
    "es": "CERN, cerca de Ginebra",
    "ja": "ジュネーブ近郊のCERN"
  },
  "A SMALL BEAM, A VERY BIG QUESTION": {
    "it": "UN PICCOLO FASCIO, UNA GRANDE DOMANDA",
    "fr": "UN PETIT FAISCEAU, UNE GRANDE QUESTION",
    "de": "EIN KLEINER STRAHL, EINE GROSSE FRAGE",
    "es": "UN PEQUEÑO HAZ, UNA GRAN PREGUNTA",
    "ja": "小さなビーム、大きな問い"
  },
  "The first beam completes a circuit of the Large Hadron Collider. A ring beneath the French–Swiss border becomes a new instrument for exploring the structure of matter.": {
    "it": "Il primo fascio completa un giro del Large Hadron Collider. L'anello sotto il confine franco-svizzero apre nuove indagini sulla materia.",
    "fr": "Le premier faisceau fait le tour du LHC. L'anneau sous la frontière franco-suisse ouvre l'étude de la matière.",
    "de": "Der erste Strahl umrundet den LHC. Der Ring unter der französisch-schweizerischen Grenze eröffnet neue Untersuchungen der Materie.",
    "es": "El primer haz completa una vuelta del LHC. El anillo bajo la frontera franco-suiza abre nuevas investigaciones sobre la materia.",
    "ja": "最初のビームがLHCを一周。仏瑞国境の地下にあるリングが、物質の構造を探る新しい装置になります。"
  },
  "27 kilometres": {
    "it": "27 chilometri",
    "fr": "27 kilomètres",
    "de": "27 Kilometer",
    "es": "27 kilómetros",
    "ja": "27キロメートル"
  },
  "FIRST CIRCULATING LHC BEAM": {
    "it": "PRIMO FASCIO IN CIRCOLO AL LHC",
    "fr": "PREMIER FAISCEAU CIRCULANT AU LHC",
    "de": "ERSTER UMLAUFENDER LHC-STRAHL",
    "es": "PRIMER HAZ CIRCULANTE EN EL LHC",
    "ja": "LHC初の周回ビーム"
  },
  "A particle steps out of theory": {
    "it": "Una particella esce dalla teoria",
    "fr": "Une particule sort de la théorie",
    "de": "Ein Teilchen verlässt die Theorie",
    "es": "Una partícula sale de la teoría",
    "ja": "理論の中の粒子が姿を現す"
  },
  "THE SEARCH FINDS A SIGNAL": {
    "it": "LA RICERCA TROVA UN SEGNALE",
    "fr": "LA RECHERCHE TROUVE UN SIGNAL",
    "de": "DIE SUCHE FINDET EIN SIGNAL",
    "es": "LA BÚSQUEDA ENCUENTRA UNA SEÑAL",
    "ja": "探求の先に信号を発見"
  },
  "ATLAS and CMS announce a new particle consistent with the long-sought Higgs boson. Further measurements will establish its identity and investigate its properties.": {
    "it": "ATLAS e CMS annunciano una particella compatibile con il bosone di Higgs. Altre misure ne stabiliranno identità e proprietà.",
    "fr": "ATLAS et CMS annoncent une particule compatible avec le boson de Higgs. D'autres mesures établiront son identité et ses propriétés.",
    "de": "ATLAS und CMS melden ein Teilchen, das zum Higgs-Boson passt. Weitere Messungen klären Identität und Eigenschaften.",
    "es": "ATLAS y CMS anuncian una partícula compatible con el bosón de Higgs. Otras mediciones establecerán su identidad y propiedades.",
    "ja": "ATLASとCMSがヒッグス粒子と整合する新粒子を発表。その正体と性質は、以後の測定で確かめられます。"
  },
  "A NEW BOSON IS ANNOUNCED": {
    "it": "ANNUNCIATO UN NUOVO BOSONE",
    "fr": "ANNONCE D'UN NOUVEAU BOSON",
    "de": "EIN NEUES BOSON WIRD GEMELDET",
    "es": "SE ANUNCIA UN NUEVO BOSÓN",
    "ja": "新しいボソンの発表"
  },
  "Touchdown on a comet": {
    "it": "Atterraggio su una cometa",
    "fr": "Atterrissage sur une comète",
    "de": "Landung auf einem Kometen",
    "es": "Aterrizaje en un cometa",
    "ja": "彗星に降り立つ"
  },
  "A LANDING ON A MOVING WORLD": {
    "it": "ATTERRARE SU UN MONDO IN MOTO",
    "fr": "SE POSER SUR UN MONDE EN MOUVEMENT",
    "de": "LANDUNG AUF EINER BEWEGTEN WELT",
    "es": "ATERRIZAR EN UN MUNDO EN MOVIMIENTO",
    "ja": "動き続ける世界への着陸"
  },
  "Rosetta’s Philae reaches the surface of comet 67P. The first soft landing on a comet opens a brief, close-up investigation of material from the early Solar System.": {
    "it": "Philae di Rosetta raggiunge la cometa 67P. Il primo atterraggio morbido su una cometa permette una breve analisi ravvicinata del Sistema Solare primordiale.",
    "fr": "Philae de Rosetta atteint la comète 67P. Le premier atterrissage doux sur une comète permet une brève étude des origines du Système solaire.",
    "de": "Rosettas Philae erreicht den Kometen 67P. Die erste weiche Kometenlandung ermöglicht kurze Nahaufnahmen von frühem Sonnensystemmaterial.",
    "es": "Philae de Rosetta llega al cometa 67P. El primer aterrizaje suave en un cometa permite estudiar brevemente material del Sistema Solar primitivo.",
    "ja": "ロゼッタのフィラエが彗星67Pへ。彗星初の軟着陸で、初期太陽系の物質を間近に調べる短い機会が生まれました。"
  },
  "FIRST SOFT LANDING ON A COMET": {
    "it": "PRIMO ATTERRAGGIO MORBIDO SU UNA COMETA",
    "fr": "PREMIER ATTERRISSAGE DOUX SUR UNE COMÈTE",
    "de": "ERSTE WEICHE LANDUNG AUF EINEM KOMETEN",
    "es": "PRIMER ATERRIZAJE SUAVE EN UN COMETA",
    "ja": "彗星への初めての軟着陸"
  },
  "A distant point becomes a world": {
    "it": "Un punto lontano diventa un mondo",
    "fr": "Un point lointain devient un monde",
    "de": "Ein ferner Punkt wird zur Welt",
    "es": "Un punto lejano se convierte en mundo",
    "ja": "遠い光の点が世界になる"
  },
  "Pluto and its moons": {
    "it": "Plutone e le sue lune",
    "fr": "Pluton et ses lunes",
    "de": "Pluto und seine Monde",
    "es": "Plutón y sus lunas",
    "ja": "冥王星とその衛星"
  },
  "THE EDGE OF THE FAMILIAR": {
    "it": "AI CONFINI DEL CONOSCIUTO",
    "fr": "AUX CONFINS DU CONNU",
    "de": "AM RAND DES BEKANNTEN",
    "es": "EN EL BORDE DE LO CONOCIDO",
    "ja": "見慣れた宇宙の果てへ"
  },
  "New Horizons passes Pluto after a journey of more than nine years. What was once a remote point of light becomes a landscape of mountains, plains and atmospheric haze.": {
    "it": "New Horizons sorvola Plutone dopo oltre nove anni. Un lontano punto luminoso diventa un paesaggio di montagne, pianure e foschia.",
    "fr": "New Horizons survole Pluton après plus de neuf ans. Un point lointain devient montagnes, plaines et brume atmosphérique.",
    "de": "New Horizons passiert Pluto nach über neun Jahren. Aus einem Lichtpunkt werden Berge, Ebenen und atmosphärischer Dunst.",
    "es": "New Horizons pasa por Plutón tras más de nueve años. Un punto remoto se revela en montañas, llanuras y bruma.",
    "ja": "9年以上の旅を経てニュー・ホライズンズが冥王星へ接近。遠い光の点が、山・平原・大気のもやのある世界に変わります。"
  },
  "THE FIRST CLOSE FLYBY OF PLUTO": {
    "it": "PRIMO SORVOLO RAVVICINATO DI PLUTONE",
    "fr": "PREMIER SURVOL RAPPROCHÉ DE PLUTON",
    "de": "ERSTER NAHER VORBEIFLUG AN PLUTO",
    "es": "PRIMER SOBREVUELO CERCANO DE PLUTÓN",
    "ja": "冥王星への初の接近通過"
  },
  "Listening to space-time": {
    "it": "Ascoltare lo spaziotempo",
    "fr": "Écouter l'espace-temps",
    "de": "Der Raumzeit zuhören",
    "es": "Escuchar el espacio-tiempo",
    "ja": "時空に耳を澄ます"
  },
  "THE UNIVERSE HAS ANOTHER MESSENGER": {
    "it": "L'UNIVERSO HA UN ALTRO MESSAGGERO",
    "fr": "L'UNIVERS A UN AUTRE MESSAGER",
    "de": "DAS UNIVERSUM HAT EINEN NEUEN BOTEN",
    "es": "EL UNIVERSO TIENE OTRO MENSAJERO",
    "ja": "宇宙からのもう一つの使者"
  },
  "LIGO records a signal from two merging black holes. Gravitational waves have reached Earth; their discovery will be announced publicly the following year.": {
    "it": "LIGO registra un segnale da due buchi neri che si fondono. Le onde gravitazionali raggiungono la Terra; l'annuncio arriverà l'anno dopo.",
    "fr": "LIGO enregistre la fusion de deux trous noirs. Les ondes gravitationnelles atteignent la Terre ; l'annonce viendra l'année suivante.",
    "de": "LIGO zeichnet ein Signal verschmelzender Schwarzer Löcher auf. Gravitationswellen erreichen die Erde; bekannt gegeben wird es im Folgejahr.",
    "es": "LIGO registra la fusión de dos agujeros negros. Las ondas gravitacionales llegan a la Tierra; el anuncio será al año siguiente.",
    "ja": "LIGOが合体する2つのブラックホールからの信号を記録。重力波が地球に届き、発見は翌年に公表されます。"
  },
  "FIRST DIRECT GRAVITATIONAL-WAVE DETECTION": {
    "it": "PRIMA RILEVAZIONE DIRETTA DI ONDE GRAVITAZIONALI",
    "fr": "PREMIÈRE DÉTECTION DIRECTE D'ONDES GRAVITATIONNELLES",
    "de": "ERSTER DIREKTER NACHWEIS VON GRAVITATIONSWELLEN",
    "es": "PRIMERA DETECCIÓN DIRECTA DE ONDAS GRAVITACIONALES",
    "ja": "重力波の初めての直接検出"
  },
  "The shadow becomes visible": {
    "it": "L'ombra diventa visibile",
    "fr": "L'ombre devient visible",
    "de": "Der Schatten wird sichtbar",
    "es": "La sombra se hace visible",
    "ja": "影が姿を現す"
  },
  "Event Horizon Telescope collaboration": {
    "it": "Collaborazione Event Horizon Telescope",
    "fr": "Collaboration Event Horizon Telescope",
    "de": "Event-Horizon-Telescope-Kollaboration",
    "es": "Colaboración Event Horizon Telescope",
    "ja": "イベント・ホライズン・テレスコープ共同研究"
  },
  "AN EARTH-SIZED VIRTUAL TELESCOPE": {
    "it": "UN TELESCOPIO VIRTUALE GRANDE QUANTO LA TERRA",
    "fr": "UN TÉLESCOPE VIRTUEL DE LA TAILLE DE LA TERRE",
    "de": "EIN ERDGROSSES VIRTUELLES TELESKOP",
    "es": "UN TELESCOPIO VIRTUAL DEL TAMAÑO DE LA TIERRA",
    "ja": "地球サイズの仮想望遠鏡"
  },
  "The Event Horizon Telescope collaboration reveals an image of the shadow of the black hole in M87. Radio telescopes across the world have worked together as one vast instrument.": {
    "it": "L'Event Horizon Telescope mostra l'ombra del buco nero in M87. Radiotelescopi di tutto il mondo lavorano come un unico enorme strumento.",
    "fr": "L'Event Horizon Telescope révèle l'ombre du trou noir de M87. Des radiotélescopes du monde entier agissent comme un seul instrument géant.",
    "de": "Das Event Horizon Telescope zeigt den Schatten des Schwarzen Lochs in M87. Radioteleskope weltweit arbeiten als ein riesiges Instrument.",
    "es": "El Event Horizon Telescope revela la sombra del agujero negro de M87. Radiotelescopios de todo el mundo actúan como un único instrumento gigante.",
    "ja": "EHTがM87のブラックホールの影を公開。世界中の電波望遠鏡が、一つの巨大な観測装置として協力しました。"
  },
  "FIRST BLACK-HOLE SHADOW IMAGE REVEALED": {
    "it": "PRIMA IMMAGINE DELL'OMBRA DI UN BUCO NERO",
    "fr": "PREMIÈRE IMAGE D'UNE OMBRE DE TROU NOIR",
    "de": "ERSTES BILD EINES SCHWARZLOCHSCHATTENS",
    "es": "PRIMERA IMAGEN DE LA SOMBRA DE UN AGUJERO NEGRO",
    "ja": "ブラックホールの影の初画像"
  },
  "Nature becomes the ruler": {
    "it": "La natura diventa il metro",
    "fr": "La nature devient la règle",
    "de": "Die Natur wird zum Maßstab",
    "es": "La naturaleza se convierte en regla",
    "ja": "自然がものさしになる"
  },
  "The international measurement system": {
    "it": "Il sistema internazionale di misura",
    "fr": "Le système international de mesure",
    "de": "Das internationale Maßsystem",
    "es": "El sistema internacional de medidas",
    "ja": "国際的な単位の体系"
  },
  "MEASURING THE WORLD WITH CONSTANTS": {
    "it": "MISURARE IL MONDO CON LE COSTANTI",
    "fr": "MESURER LE MONDE AVEC DES CONSTANTES",
    "de": "DIE WELT MIT KONSTANTEN MESSEN",
    "es": "MEDIR EL MUNDO CON CONSTANTES",
    "ja": "定数で世界を測る"
  },
  "New definitions of the kilogram, kelvin, ampere and mole take effect. The SI base units are now tied to constants of nature instead of relying on a physical kilogram artefact.": {
    "it": "Entrano in vigore nuove definizioni di chilogrammo, kelvin, ampere e mole. Le unità SI dipendono da costanti naturali, non da un campione fisico.",
    "fr": "De nouvelles définitions du kilogramme, kelvin, ampère et mole entrent en vigueur. Les unités SI sont liées aux constantes naturelles plutôt qu'à un kilogramme matériel.",
    "de": "Neue Definitionen für Kilogramm, Kelvin, Ampere und Mol gelten. SI-Einheiten beruhen nun auf Naturkonstanten statt auf einem Kilogramm-Artefakt.",
    "es": "Entran en vigor nuevas definiciones del kilogramo, kelvin, amperio y mol. Las unidades SI se basan en constantes naturales, no en un kilogramo físico.",
    "ja": "キログラム、ケルビン、アンペア、モルの新定義が発効。SI基本単位は、キログラム原器ではなく自然定数に基づくようになります。"
  },
  "The revised SI": {
    "it": "Il nuovo SI",
    "fr": "Le SI révisé",
    "de": "Das überarbeitete SI",
    "es": "El SI revisado",
    "ja": "改定されたSI"
  },
  "NEW UNIT DEFINITIONS TAKE EFFECT": {
    "it": "IN VIGORE LE NUOVE DEFINIZIONI DELLE UNITÀ",
    "fr": "ENTRÉE EN VIGUEUR DES NOUVELLES UNITÉS",
    "de": "NEUE EINHEITENDEFINITIONEN GELTEN",
    "es": "ENTRAN EN VIGOR LAS NUEVAS UNIDADES",
    "ja": "単位の新定義が発効"
  },
  "A laboratory reaches Jezero": {
    "it": "Un laboratorio arriva a Jezero",
    "fr": "Un laboratoire atteint Jezero",
    "de": "Ein Labor erreicht Jezero",
    "es": "Un laboratorio llega a Jezero",
    "ja": "ジェゼロに届いた研究室"
  },
  "READING THE ROCK RECORD": {
    "it": "LEGGERE LA STORIA DELLE ROCCE",
    "fr": "LIRE L'HISTOIRE DES ROCHES",
    "de": "DIE GESCHICHTE DER GESTEINE LESEN",
    "es": "LEER LA HISTORIA DE LAS ROCAS",
    "ja": "岩石に刻まれた記録を読む"
  },
  "Perseverance lands in a crater that once held a lake. Its instruments begin a search for evidence of ancient environments and possible traces of past microbial life.": {
    "it": "Perseverance atterra in un cratere un tempo lacustre. Cerca tracce di ambienti antichi e possibili indizi di vita microbica passata.",
    "fr": "Perseverance se pose dans un ancien lac. Il recherche des milieux anciens et d'éventuelles traces de vie microbienne passée.",
    "de": "Perseverance landet in einem ehemaligen See. Er sucht Hinweise auf frühere Umgebungen und mögliche Spuren einstiger Mikroben.",
    "es": "Perseverance aterriza en un antiguo lago. Busca pruebas de ambientes antiguos y posibles huellas de vida microbiana pasada.",
    "ja": "かつて湖だったクレーターにパーサヴィアランスが着陸。古い環境の証拠や、過去の微生物の痕跡の可能性を探ります。"
  },
  "MARS 2020 ARRIVES AT JEZERO": {
    "it": "MARS 2020 ARRIVA A JEZERO",
    "fr": "MARS 2020 ARRIVE À JEZERO",
    "de": "MARS 2020 ERREICHT JEZERO",
    "es": "MARS 2020 LLEGA A JEZERO",
    "ja": "マーズ2020がジェゼロへ"
  },
  "The Wright moment on Mars": {
    "it": "Il momento Wright su Marte",
    "fr": "Le moment Wright sur Mars",
    "de": "Der Wright-Moment auf dem Mars",
    "es": "El momento Wright en Marte",
    "ja": "火星のライト兄弟の瞬間"
  },
  "FLIGHT FINDS ANOTHER PLANET": {
    "it": "IL VOLO TROVA UN ALTRO PIANETA",
    "fr": "LE VOL TROUVE UNE AUTRE PLANÈTE",
    "de": "DAS FLIEGEN ERREICHT EINEN ANDEREN PLANETEN",
    "es": "EL VUELO ENCUENTRA OTRO PLANETA",
    "ja": "別の惑星で飛ぶ"
  },
  "Ingenuity rises into the thin Martian atmosphere. The small helicopter achieves the first powered, controlled aircraft flight on a world beyond Earth.": {
    "it": "Ingenuity si alza nella tenue atmosfera marziana. È il primo volo a motore controllato su un mondo oltre la Terra.",
    "fr": "Ingenuity s'élève dans l'atmosphère ténue de Mars : premier vol motorisé contrôlé sur un autre monde.",
    "de": "Ingenuity steigt in die dünne Marsatmosphäre. Es ist der erste kontrollierte Motorflug auf einer anderen Welt.",
    "es": "Ingenuity se eleva en la tenue atmósfera marciana: el primer vuelo a motor controlado en otro mundo.",
    "ja": "インジェニュイティが薄い火星の大気を舞います。地球以外で初めて、動力付きの制御された飛行が実現しました。"
  },
  "FIRST POWERED, CONTROLLED FLIGHT ON ANOTHER PLANET": {
    "it": "PRIMO VOLO A MOTORE CONTROLLATO SU UN ALTRO PIANETA",
    "fr": "PREMIER VOL MOTORISÉ CONTRÔLÉ SUR UN AUTRE MONDE",
    "de": "ERSTER KONTROLLIERTER MOTORFLUG AUF EINER ANDEREN WELT",
    "es": "PRIMER VUELO A MOTOR CONTROLADO EN OTRO MUNDO",
    "ja": "他の天体で初の動力制御飛行"
  },
  "A golden eye leaves Earth": {
    "it": "Un occhio dorato lascia la Terra",
    "fr": "Un œil doré quitte la Terre",
    "de": "Ein goldenes Auge verlässt die Erde",
    "es": "Un ojo dorado deja la Tierra",
    "ja": "金色の眼が地球を離れる"
  },
  "A JOURNEY TOWARD ANCIENT LIGHT": {
    "it": "UN VIAGGIO VERSO LA LUCE ANTICA",
    "fr": "UN VOYAGE VERS LA LUMIÈRE ANCIENNE",
    "de": "EINE REISE ZUM ALTEN LICHT",
    "es": "UN VIAJE HACIA LA LUZ ANTIGUA",
    "ja": "いにしえの光への旅"
  },
  "An Ariane 5 launches the James Webb Space Telescope. Its folded mirror and sunshield begin their journey toward an observing location near the Sun–Earth L2 point.": {
    "it": "Un Ariane 5 lancia il telescopio James Webb. Specchio e schermo solare ripiegati viaggiano verso il punto di osservazione presso L2 Sole-Terra.",
    "fr": "Ariane 5 lance James Webb. Son miroir et son pare-soleil repliés voyagent vers une position d'observation près de L2 Soleil-Terre.",
    "de": "Eine Ariane 5 startet James Webb. Gefalteter Spiegel und Sonnenschild reisen zum Beobachtungsort nahe Sonne-Erde-L2.",
    "es": "Un Ariane 5 lanza el James Webb. Su espejo y parasol plegados viajan hacia la región de observación cerca de L2 Sol-Tierra.",
    "ja": "アリアン5がジェイムズ・ウェッブ望遠鏡を打ち上げ。畳まれた鏡と日よけは、太陽・地球L2付近の観測場所を目指します。"
  },
  "AN INFRARED OBSERVATORY LAUNCHES": {
    "it": "PARTE UN OSSERVATORIO A INFRAROSSI",
    "fr": "UN OBSERVATOIRE INFRAROUGE DÉCOLLE",
    "de": "EIN INFRAROTOBSERVATORIUM STARTET",
    "es": "DESPEGA UN OBSERVATORIO INFRARROJO",
    "ja": "赤外線天文台の打ち上げ"
  },
  "Ancient light, a new view": {
    "it": "Luce antica, una nuova visione",
    "fr": "Lumière ancienne, nouveau regard",
    "de": "Altes Licht, ein neuer Blick",
    "es": "Luz antigua, una nueva mirada",
    "ja": "古い光、新しい眺め"
  },
  "NASA / ESA / CSA Webb collaboration": {
    "it": "Collaborazione Webb NASA / ESA / CSA",
    "fr": "Collaboration Webb NASA / ESA / ASC",
    "de": "Webb-Kooperation NASA / ESA / CSA",
    "es": "Colaboración Webb NASA / ESA / CSA",
    "ja": "NASA・ESA・CSAのウェッブ共同事業"
  },
  "THE FIRST FULL SCIENCE IMAGE SET": {
    "it": "IL PRIMO SET COMPLETO DI IMMAGINI SCIENTIFICHE",
    "fr": "PREMIÈRE SÉRIE COMPLÈTE D'IMAGES SCIENTIFIQUES",
    "de": "ERSTER VOLLSTÄNDIGER WISSENSCHAFTLICHER BILDERSATZ",
    "es": "PRIMER CONJUNTO COMPLETO DE IMÁGENES CIENTÍFICAS",
    "ja": "最初の科学画像一式"
  },
  "Webb’s first full set of scientific images and spectra is released. Galaxies, stellar nurseries and an exoplanet atmosphere introduce the observatory’s scientific capabilities.": {
    "it": "Vengono pubblicate le prime immagini e spettri scientifici completi di Webb. Galassie, culle stellari e un'atmosfera esoplanetaria ne mostrano le capacità.",
    "fr": "Les premières images et spectres scientifiques complets de Webb sont publiés : galaxies, nurseries stellaires et atmosphère d'exoplanète révèlent ses capacités.",
    "de": "Webbs erste vollständige wissenschaftliche Bilder und Spektren erscheinen. Galaxien, Sternentstehung und eine Exoplanetenatmosphäre zeigen seine Fähigkeiten.",
    "es": "Se publica el primer conjunto completo de imágenes y espectros de Webb. Galaxias, viveros estelares y una atmósfera exoplanetaria muestran su capacidad.",
    "ja": "ウェッブの初の科学画像とスペクトル一式を公開。銀河、星の誕生領域、系外惑星の大気が、望遠鏡の能力を示します。"
  },
  "Webb’s first image set": {
    "it": "Le prime immagini di Webb",
    "fr": "Les premières images de Webb",
    "de": "Webbs erste Bilder",
    "es": "Las primeras imágenes de Webb",
    "ja": "ウェッブの最初の画像"
  },
  "FULL SCIENCE RELEASE AFTER THE DEEP-FIELD PREVIEW": {
    "it": "PUBBLICAZIONE SCIENTIFICA DOPO L'ANTEPRIMA DEL CAMPO PROFONDO",
    "fr": "PUBLICATION SCIENTIFIQUE APRÈS L'APERÇU DU CHAMP PROFOND",
    "de": "WISSENSCHAFTLICHE VERÖFFENTLICHUNG NACH DER TIEFENFELDVORSCHAU",
    "es": "PUBLICACIÓN CIENTÍFICA TRAS LA VISTA DEL CAMPO PROFUNDO",
    "ja": "ディープフィールド先行公開後の科学画像公開"
  },
  "Language": {
    "it": "Lingua",
    "fr": "Langue",
    "de": "Sprache",
    "es": "Idioma",
    "ja": "言語"
  },
  "Interface language": {
    "it": "Lingua dell'interfaccia",
    "fr": "Langue de l'interface",
    "de": "Sprache der Oberfläche",
    "es": "Idioma de la interfaz",
    "ja": "表示言語"
  },
  "Saved on this device · applies immediately": {
    "it": "Salvata qui · applicata subito",
    "fr": "Enregistrée ici · effet immédiat",
    "de": "Lokal gespeichert · sofort wirksam",
    "es": "Guardado aquí · efecto inmediato",
    "ja": "この端末に保存・すぐに反映"
  },
  "Language could not be saved on this device.": {
    "it": "Impossibile salvare la lingua su questo dispositivo.",
    "fr": "Impossible d'enregistrer la langue sur cet appareil.",
    "de": "Sprache konnte nicht gespeichert werden.",
    "es": "No se pudo guardar el idioma en este dispositivo.",
    "ja": "この端末に言語設定を保存できませんでした。"
  },
  "New Moon": {
    "it": "Luna nuova",
    "fr": "Nouvelle lune",
    "de": "Neumond",
    "es": "Luna nueva",
    "ja": "新月"
  },
  "Waxing crescent": {
    "it": "Luna crescente",
    "fr": "Premier croissant",
    "de": "Zunehmende Sichel",
    "es": "Luna creciente",
    "ja": "満ちていく細い月"
  },
  "First quarter": {
    "it": "Primo quarto",
    "fr": "Premier quartier",
    "de": "Erstes Viertel",
    "es": "Cuarto creciente",
    "ja": "上弦"
  },
  "Waxing gibbous": {
    "it": "Gibbosa crescente",
    "fr": "Gibbeuse croissante",
    "de": "Zunehmender Dreiviertelmond",
    "es": "Gibosa creciente",
    "ja": "満ちていく凸月"
  },
  "Full Moon": {
    "it": "Luna piena",
    "fr": "Pleine lune",
    "de": "Vollmond",
    "es": "Luna llena",
    "ja": "満月"
  },
  "Waning gibbous": {
    "it": "Gibbosa calante",
    "fr": "Gibbeuse décroissante",
    "de": "Abnehmender Dreiviertelmond",
    "es": "Gibosa menguante",
    "ja": "欠けていく凸月"
  },
  "Last quarter": {
    "it": "Ultimo quarto",
    "fr": "Dernier quartier",
    "de": "Letztes Viertel",
    "es": "Cuarto menguante",
    "ja": "下弦"
  },
  "Waning crescent": {
    "it": "Luna calante",
    "fr": "Dernier croissant",
    "de": "Abnehmende Sichel",
    "es": "Luna menguante",
    "ja": "欠けていく細い月"
  },
  "Germany": {
    "it": "Germania",
    "fr": "Allemagne",
    "de": "Deutschland",
    "es": "Alemania",
    "ja": "ドイツ"
  },
  "United States": {
    "it": "Stati Uniti",
    "fr": "États-Unis",
    "de": "Vereinigte Staaten",
    "es": "Estados Unidos",
    "ja": "アメリカ合衆国"
  },
  "United Kingdom": {
    "it": "Regno Unito",
    "fr": "Royaume-Uni",
    "de": "Vereinigtes Königreich",
    "es": "Reino Unido",
    "ja": "イギリス"
  },
  "Japan": {
    "it": "Giappone",
    "fr": "Japon",
    "de": "Japan",
    "es": "Japón",
    "ja": "日本"
  },
  "China": {
    "it": "Cina",
    "fr": "Chine",
    "de": "China",
    "es": "China",
    "ja": "中国"
  },
  "Sine": {
    "it": "Sinusoidale",
    "fr": "Sinusoïde",
    "de": "Sinus",
    "es": "Senoidal",
    "ja": "正弦波"
  },
  "Full pauses": {
    "it": "Pause complete",
    "fr": "Silences complets",
    "de": "Volle Pausen",
    "es": "Pausas completas",
    "ja": "完全な無音"
  },
  "Square": {
    "it": "Quadra",
    "fr": "Carré",
    "de": "Rechteck",
    "es": "Cuadrada",
    "ja": "矩形波"
  },
  "reduction": {
    "it": "riduzione",
    "fr": "réduction",
    "de": "Absenkung",
    "es": "reducción",
    "ja": "減衰"
  },
  "ago": {
    "it": "fa",
    "fr": "écoulés",
    "de": "zuvor",
    "es": "atrás",
    "ja": "前"
  },
  "ALIGNING…": {
    "it": "ALLINEAMENTO…",
    "fr": "ALIGNEMENT…",
    "de": "AUSRICHTUNG…",
    "es": "ALINEANDO…",
    "ja": "時刻調整中…"
  },
  "LOCAL KEEPSAKES": {
    "it": "RICORDI LOCALI",
    "fr": "SOUVENIRS LOCAUX",
    "de": "LOKALE ERINNERUNGEN",
    "es": "RECUERDOS LOCALES",
    "ja": "端末内の思い出"
  },
  "Minutes": {
    "it": "Minuti",
    "fr": "Minutes",
    "de": "Minuten",
    "es": "Minutos",
    "ja": "分"
  },
  "Hours": {
    "it": "Ore",
    "fr": "Heures",
    "de": "Stunden",
    "es": "Horas",
    "ja": "時"
  },
  "Date": {
    "it": "Data",
    "fr": "Date",
    "de": "Datum",
    "es": "Fecha",
    "ja": "日付"
  },
  "Day of year": {
    "it": "Giorno dell'anno",
    "fr": "Jour de l'année",
    "de": "Tag des Jahres",
    "es": "Día del año",
    "ja": "年通算日"
  },
  "Status": {
    "it": "Stato",
    "fr": "État",
    "de": "Status",
    "es": "Estado",
    "ja": "状態"
  },
  "Year and status": {
    "it": "Anno e stato",
    "fr": "Année et état",
    "de": "Jahr und Status",
    "es": "Año y estado",
    "ja": "年と状態"
  },
  "Marker / DUT1": {
    "it": "Marcatore / DUT1",
    "fr": "Repère / DUT1",
    "de": "Marker / DUT1",
    "es": "Marca / DUT1",
    "ja": "マーカー / DUT1"
  },
  "Identifier / parity": {
    "it": "Identificatore / parità",
    "fr": "Identifiant / parité",
    "de": "Kennung / Parität",
    "es": "Identificador / paridad",
    "ja": "識別子 / パリティ"
  },
  "Marker / index": {
    "it": "Marcatore / indice",
    "fr": "Repère / index",
    "de": "Marker / Index",
    "es": "Marca / índice",
    "ja": "マーカー / 番号"
  },
  "Day / P3": {
    "it": "Giorno / P3",
    "fr": "Jour / P3",
    "de": "Tag / P3",
    "es": "Día / P3",
    "ja": "日 / P3"
  },
  "Date / P4": {
    "it": "Data / P4",
    "fr": "Date / P4",
    "de": "Datum / P4",
    "es": "Fecha / P4",
    "ja": "日付 / P4"
  },
  "Next minute time · marker at second 59": {
    "it": "Ora del minuto successivo · marcatore al secondo 59",
    "fr": "Heure de la minute suivante · repère à la seconde 59",
    "de": "Zeit der nächsten Minute · Marker bei Sekunde 59",
    "es": "Hora del minuto siguiente · marca en el segundo 59",
    "ja": "次の分の時刻・59秒にマーカー"
  },
  "Stop transmission before checking the time.": {
    "it": "Ferma la trasmissione prima di verificare l'ora.",
    "fr": "Arrêtez l'émission avant de vérifier l'heure.",
    "de": "Vor der Zeitprüfung Übertragung stoppen.",
    "es": "Detén la transmisión antes de comprobar la hora.",
    "ja": "時刻確認の前に送信を停止してください。"
  },
  "Computer going to sleep. Restart transmission.": {
    "it": "Computer in sospensione. Riavvia la trasmissione.",
    "fr": "Mise en veille du PC. Relancez l'émission.",
    "de": "Computer geht in Ruhezustand. Übertragung neu starten.",
    "es": "El equipo entra en suspensión. Reinicia la transmisión.",
    "ja": "PCがスリープに入ります。送信を再開してください。"
  },
  "Computer resumed. Check the time again.": {
    "it": "Computer riattivato. Verifica nuovamente l'ora.",
    "fr": "PC réactivé. Vérifiez à nouveau l'heure.",
    "de": "Computer fortgesetzt. Zeit erneut prüfen.",
    "es": "Equipo reactivado. Comprueba de nuevo la hora.",
    "ja": "PCが復帰しました。時刻を再確認してください。"
  },
  "Screen locked. Transmission stopped.": {
    "it": "Schermo bloccato. Trasmissione fermata.",
    "fr": "Écran verrouillé. Émission arrêtée.",
    "de": "Bildschirm gesperrt. Übertragung gestoppt.",
    "es": "Pantalla bloqueada. Transmisión detenida.",
    "ja": "画面がロックされ、送信を停止しました。"
  },
  "Daylight": {
    "it": "Giorno",
    "fr": "Jour",
    "de": "Tag",
    "es": "Día",
    "ja": "昼"
  },
  "Civil twilight": {
    "it": "Crepuscolo civile",
    "fr": "Crépuscule civil",
    "de": "Bürgerliche Dämmerung",
    "es": "Crepúsculo civil",
    "ja": "市民薄明"
  },
  "Nautical twilight": {
    "it": "Crepuscolo nautico",
    "fr": "Crépuscule nautique",
    "de": "Nautische Dämmerung",
    "es": "Crepúsculo náutico",
    "ja": "航海薄明"
  },
  "Astronomical twilight": {
    "it": "Crepuscolo astronomico",
    "fr": "Crépuscule astronomique",
    "de": "Astronomische Dämmerung",
    "es": "Crepúsculo astronómico",
    "ja": "天文薄明"
  },
  "Night": {
    "it": "Notte",
    "fr": "Nuit",
    "de": "Nacht",
    "es": "Noche",
    "ja": "夜"
  },
  "Polar day": {
    "it": "Giorno polare",
    "fr": "Jour polaire",
    "de": "Polartag",
    "es": "Día polar",
    "ja": "白夜"
  },
  "Polar night": {
    "it": "Notte polare",
    "fr": "Nuit polaire",
    "de": "Polarnacht",
    "es": "Noche polar",
    "ja": "極夜"
  },
  "Sunlit": {
    "it": "Illuminata dal Sole",
    "fr": "Éclairée par le Soleil",
    "de": "Sonnenbeleuchtet",
    "es": "Iluminada por el Sol",
    "ja": "日照あり"
  },
  "Penumbra": {
    "it": "Penombra",
    "fr": "Pénombre",
    "de": "Halbschatten",
    "es": "Penumbra",
    "ja": "半影"
  },
  "since": {
    "it": "da",
    "fr": "depuis",
    "de": "seit",
    "es": "desde",
    "ja": "から"
  },
  "until": {
    "it": "fino a",
    "fr": "avant",
    "de": "bis",
    "es": "hasta",
    "ja": "まで"
  },
  "Status and zone": {
    "it": "Stato e fuso",
    "fr": "État et fuseau",
    "de": "Status und Zeitzone",
    "es": "Estado y zona",
    "ja": "状態とタイムゾーン"
  },
  "Minutes · P1": {
    "it": "Minuti · P1",
    "fr": "Minutes · P1",
    "de": "Minuten · P1",
    "es": "Minutos · P1",
    "ja": "分 · P1"
  },
  "Hours · P2": {
    "it": "Ore · P2",
    "fr": "Heures · P2",
    "de": "Stunden · P2",
    "es": "Horas · P2",
    "ja": "時 · P2"
  },
  "Date · P3": {
    "it": "Data · P3",
    "fr": "Date · P3",
    "de": "Datum · P3",
    "es": "Fecha · P3",
    "ja": "日付 · P3"
  },
  "Marker": {
    "it": "Marcatore",
    "fr": "Repère",
    "de": "Marker",
    "es": "Marca",
    "ja": "マーカー"
  },
  "Time at cycle start · symbols 0–3 · 20-second cycle": {
    "it": "Ora a inizio ciclo · simboli 0–3 · ciclo di 20 secondi",
    "fr": "Heure en début de cycle · symboles 0–3 · cycle de 20 secondes",
    "de": "Zeit am Zyklusbeginn · Symbole 0–3 · 20-Sekunden-Zyklus",
    "es": "Hora al inicio del ciclo · símbolos 0–3 · ciclo de 20 segundos",
    "ja": "周期開始時の時刻・シンボル0〜3・20秒周期"
  },
  "Time at minute start · markers 0, 9, 19, 29, 39, 49, 59": {
    "it": "Ora a inizio minuto · marcatori 0, 9, 19, 29, 39, 49, 59",
    "fr": "Heure au début de la minute · repères 0, 9, 19, 29, 39, 49, 59",
    "de": "Zeit am Minutenbeginn · Marker 0, 9, 19, 29, 39, 49, 59",
    "es": "Hora al inicio del minuto · marcas 0, 9, 19, 29, 39, 49, 59",
    "ja": "分開始時の時刻・マーカー0、9、19、29、39、49、59"
  },
  "Next minute time · two A/B bits · four odd parity groups": {
    "it": "Ora del minuto successivo · due bit A/B · quattro gruppi di parità dispari",
    "fr": "Heure de la minute suivante · deux bits A/B · quatre groupes de parité impaire",
    "de": "Zeit der nächsten Minute · zwei A/B-Bits · vier ungerade Paritätsgruppen",
    "es": "Hora del minuto siguiente · dos bits A/B · cuatro grupos de paridad impar",
    "ja": "次の分の時刻・A/Bの2ビット・4つの奇数パリティ"
  },
  "500 ms marker": {
    "it": "Marcatore di 500 ms",
    "fr": "Repère de 500 ms",
    "de": "500-ms-Marker",
    "es": "Marca de 500 ms",
    "ja": "500 msのマーカー"
  },
  "marker without reduction": {
    "it": "marcatore senza riduzione",
    "fr": "repère sans réduction",
    "de": "Marker ohne Absenkung",
    "es": "marca sin reducción",
    "ja": "減衰のないマーカー"
  },
  "symbol {0} · {1} ms": {
    "it": "simbolo {0} · {1} ms",
    "fr": "symbole {0} · {1} ms",
    "de": "Symbol {0} · {1} ms",
    "es": "símbolo {0} · {1} ms",
    "ja": "シンボル{0} · {1} ms"
  },
  "{0} ms high": {
    "it": "{0} ms ad ampiezza alta",
    "fr": "{0} ms à forte amplitude",
    "de": "{0} ms hohe Amplitude",
    "es": "{0} ms de amplitud alta",
    "ja": "{0} msの高振幅"
  },
  "{0} ms reduced": {
    "it": "{0} ms ad ampiezza ridotta",
    "fr": "{0} ms à amplitude réduite",
    "de": "{0} ms abgesenkt",
    "es": "{0} ms de amplitud reducida",
    "ja": "{0} msの減衰"
  },
  "Audio output selection is not supported. Use the system default.": {
    "it": "Selezione uscita non supportata. Usa quella di sistema.",
    "fr": "Choix de sortie non pris en charge. Utilisez la sortie système.",
    "de": "Ausgabewahl nicht unterstützt. Systemstandard nutzen.",
    "es": "Selección de salida no compatible. Usa la del sistema.",
    "ja": "出力の選択に対応していません。システムの既定の出力を使ってください。"
  },
  "Audio output is unavailable.": {
    "it": "Uscita audio non disponibile.",
    "fr": "Sortie audio indisponible.",
    "de": "Audioausgabe nicht verfügbar.",
    "es": "Salida de audio no disponible.",
    "ja": "音声出力を利用できません。"
  },
  "The output sample rate is too low for this station.": {
    "it": "Frequenza di campionamento insufficiente per la stazione.",
    "fr": "Fréquence d'échantillonnage trop faible pour cette station.",
    "de": "Abtastrate für diesen Sender zu niedrig.",
    "es": "Frecuencia de muestreo demasiado baja para esta emisora.",
    "ja": "この局には出力のサンプリング周波数が低すぎます。"
  },
  "The audio engine stopped. Restart the session.": {
    "it": "Motore audio fermo. Riavvia la sessione.",
    "fr": "Moteur audio arrêté. Relancez la session.",
    "de": "Audioengine gestoppt. Sitzung neu starten.",
    "es": "Motor de audio detenido. Reinicia la sesión.",
    "ja": "音声エンジンが停止しました。セッションを再開してください。"
  },
  "Audio output was suspended. Restart the session.": {
    "it": "Uscita audio sospesa. Riavvia la sessione.",
    "fr": "Sortie audio suspendue. Relancez la session.",
    "de": "Audioausgabe ausgesetzt. Sitzung neu starten.",
    "es": "Salida de audio suspendida. Reinicia la sesión.",
    "ja": "音声出力が中断しました。セッションを再開してください。"
  },
  "Audio output selection is not supported.": {
    "it": "Selezione uscita audio non supportata.",
    "fr": "Choix de sortie audio non pris en charge.",
    "de": "Audioausgabewahl nicht unterstützt.",
    "es": "Selección de salida de audio no compatible.",
    "ja": "音声出力の選択に対応していません。"
  },
  "NTP servers are unreachable. Check your connection or use the system clock.": {
    "it": "Server NTP non raggiungibili. Verifica la connessione o usa l'ora di sistema.",
    "fr": "Serveurs NTP inaccessibles. Vérifiez la connexion ou utilisez l'heure système.",
    "de": "NTP-Server nicht erreichbar. Verbindung prüfen oder Systemzeit nutzen.",
    "es": "Servidores NTP inaccesibles. Revisa la conexión o usa la hora del sistema.",
    "ja": "NTPサーバーに接続できません。接続を確認するかシステム時刻を使ってください。"
  },
  "Time servers disagree. Try again shortly.": {
    "it": "I server orari non concordano. Riprova tra poco.",
    "fr": "Les serveurs horaires divergent. Réessayez bientôt.",
    "de": "Zeitserver widersprechen sich. Bald erneut versuchen.",
    "es": "Los servidores horarios discrepan. Reinténtalo pronto.",
    "ja": "時刻サーバーの値が一致しません。しばらくして再試行してください。"
  },
  "Pass predictions are unavailable for these orbital elements.": {
    "it": "Previsioni non disponibili per questi elementi orbitali.",
    "fr": "Prévisions indisponibles pour ces éléments orbitaux.",
    "de": "Keine Überflugprognosen für diese Bahnelemente.",
    "es": "Previsiones no disponibles para estos elementos orbitales.",
    "ja": "この軌道要素では通過を予測できません。"
  },
  "Audio": {
    "it": "Audio",
    "fr": "Audio",
    "de": "Audio",
    "es": "Audio",
    "ja": "音声"
  },
  "Haganeyama, Fukuoka area, Japan": {
    "it": "Haganeyama, area di Fukuoka, Giappone",
    "fr": "Haganeyama, région de Fukuoka, Japon",
    "de": "Haganeyama, Region Fukuoka, Japan",
    "es": "Haganeyama, región de Fukuoka, Japón",
    "ja": "羽金山・福岡県、日本"
  },
  "Fort Collins, Colorado, USA": {
    "it": "Fort Collins, Colorado, USA",
    "fr": "Fort Collins, Colorado, États-Unis",
    "de": "Fort Collins, Colorado, USA",
    "es": "Fort Collins, Colorado, EE. UU.",
    "ja": "フォートコリンズ、コロラド州、アメリカ"
  },
  "Anthorn, Cumbria, United Kingdom": {
    "it": "Anthorn, Cumbria, Regno Unito",
    "fr": "Anthorn, Cumbria, Royaume-Uni",
    "de": "Anthorn, Cumbria, Vereinigtes Königreich",
    "es": "Anthorn, Cumbria, Reino Unido",
    "ja": "アンソーン、カンブリア、イギリス"
  },
  "Shangqiu, Henan, China": {
    "it": "Shangqiu, Henan, Cina",
    "fr": "Shangqiu, Henan, Chine",
    "de": "Shangqiu, Henan, China",
    "es": "Shangqiu, Henan, China",
    "ja": "商丘、河南省、中国"
  },
  "TIME CIRCUITS": {
    "it": "CIRCUITI TEMPORALI",
    "fr": "CIRCUITS TEMPORELS",
    "de": "ZEITSCHALTKREISE",
    "es": "CIRCUITOS TEMPORALES",
    "ja": "タイムサーキット"
  },
  "SYSTEM CLOCK": {
    "it": "OROLOGIO DI SISTEMA",
    "fr": "HORLOGE SYSTÈME",
    "de": "SYSTEMUHR",
    "es": "RELOJ DEL SISTEMA",
    "ja": "システム時計"
  },
  "NTP CHECK NEEDED": {
    "it": "VERIFICA NTP NECESSARIA",
    "fr": "VÉRIFICATION NTP REQUISE",
    "de": "NTP-PRÜFUNG NÖTIG",
    "es": "COMPROBACIÓN NTP NECESARIA",
    "ja": "NTP確認が必要"
  },
  "UNAVAILABLE": {
    "it": "NON DISPONIBILE",
    "fr": "INDISPONIBLE",
    "de": "NICHT VERFÜGBAR",
    "es": "NO DISPONIBLE",
    "ja": "取得できません"
  },
  "DESTINATION TIME": {
    "it": "DESTINAZIONE TEMPORALE",
    "fr": "DESTINATION TEMPORELLE",
    "de": "ZIELZEIT",
    "es": "TIEMPO DE DESTINO",
    "ja": "目的の日時"
  },
  "PRESENT TIME": {
    "it": "TEMPO PRESENTE",
    "fr": "TEMPS PRÉSENT",
    "de": "GEGENWART",
    "es": "TIEMPO PRESENTE",
    "ja": "現在の日時"
  },
  "LAST TIME DEPARTED": {
    "it": "ULTIMA PARTENZA",
    "fr": "DERNIER DÉPART",
    "de": "LETZTE ABREISE",
    "es": "ÚLTIMA PARTIDA",
    "ja": "最後に出発した日時"
  }
};

export const messages = { ...coreMessages, ...lightTravelMessages, ...receptionLabMessages, ...expandedJourneyMessages, ...watchAccuracyMessages, ...sidebarMessages, ...guideMessages };
