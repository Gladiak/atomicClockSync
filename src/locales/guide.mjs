// Original offline manual prose and interface text, in all supported languages.
export const guideMessages = {

  "Bluetooth time update": {
    "it": "Aggiornamento ora Bluetooth",
    "fr": "Mise à l’heure Bluetooth",
    "de": "Bluetooth-Zeiteinstellung",
    "es": "Actualización horaria Bluetooth",
    "ja": "Bluetooth 時刻更新"
  },
  "Update a compatible Casio watch’s date and time over Bluetooth from the Synchronize screen. This mode is independent of audio transmission.": {
    "it": "Aggiorna data e ora di un Casio compatibile via Bluetooth dalla schermata Sincronizzazione. Questa modalità è indipendente dalla trasmissione audio.",
    "fr": "Réglez la date et l’heure d’une Casio compatible par Bluetooth depuis Synchroniser. Ce mode est indépendant de la transmission audio.",
    "de": "Stelle Datum und Uhrzeit einer kompatiblen Casio per Bluetooth in Synchronisieren ein. Dieser Modus ist unabhängig von der Audioübertragung.",
    "es": "Actualiza la fecha y la hora de un Casio compatible por Bluetooth desde Sincronizar. Este modo es independiente de la transmisión de audio.",
    "ja": "同期画面から Bluetooth で対応する Casio の日付と時刻を更新します。このモードは音声送信とは独立しています。"
  },
  "Bluetooth support is experimental and excludes Wear OS. “Time sent” means the write completed; check the watch. Cancelled writes can be uncertain, so check before retrying.": {
    "it": "Il supporto Bluetooth è sperimentale ed esclude Wear OS. “Ora inviata” indica il completamento della scrittura: controlla l’orologio. Una scrittura annullata può avere un esito incerto; controlla prima di riprovare.",
    "fr": "Le Bluetooth est expérimental et exclut Wear OS. « Heure envoyée » indique la fin de l’écriture : vérifiez la montre. Une annulation peut laisser un résultat incertain ; vérifiez avant de réessayer.",
    "de": "Bluetooth ist experimentell und schließt Wear OS aus. „Zeit gesendet“ bedeutet, dass der Schreibvorgang abgeschlossen ist; Uhr prüfen. Nach Abbruch kann das Ergebnis unklar sein, daher vor erneutem Versuch prüfen.",
    "es": "El soporte Bluetooth es experimental y excluye Wear OS. «Hora enviada» indica que terminó la escritura; comprueba el reloj. Una escritura cancelada puede tener un resultado incierto; comprueba antes de reintentar.",
    "ja": "Bluetooth は試験機能で、Wear OS は対象外です。「時刻を送信しました」は書き込み完了を意味します。時計を確認してください。中止した書き込みの結果が不明な場合は、再試行前に確認してください。"
  },
  "Stop radio transmission, open Bluetooth and disconnect CASIO WATCHES. Put the watch in connection mode, select it as soon as it appears and choose Update time. Model-specific instructions and physical-validation status appear after selection.": {
    "it": "Ferma la trasmissione radio, apri Bluetooth e scollega CASIO WATCHES. Attiva la modalità di connessione dell’orologio, selezionalo appena compare e premi Aggiorna ora. Dopo la selezione compaiono istruzioni specifiche e stato della verifica sul dispositivo.",
    "fr": "Arrêtez la transmission radio, ouvrez Bluetooth et déconnectez CASIO WATCHES. Activez le mode de connexion de la montre, sélectionnez-la dès son apparition et réglez l’heure. Les instructions et l’état de validation sur une montre apparaissent après sélection.",
    "de": "Radioübertragung stoppen, Bluetooth öffnen und CASIO WATCHES trennen. Verbindungsmodus der Uhr aktivieren, sie sofort nach Erscheinen auswählen und Zeit stellen wählen. Danach erscheinen modellspezifische Hinweise und der Stand der Prüfung an einer Uhr.",
    "es": "Detén la transmisión de radio, abre Bluetooth y desconecta CASIO WATCHES. Activa el modo de conexión del reloj, selecciónalo al aparecer y pulsa Actualizar hora. Se mostrarán instrucciones específicas y el estado de validación en un reloj.",
    "ja": "電波送信を停止し、Bluetooth を開いて CASIO WATCHES を切断します。時計を接続モードにし、表示されたら選択して時刻を更新します。選択後に機種別の操作と実機確認状況が表示されます。"
  },
  "The app reads the watch’s existing time configuration and obtains fresh NTP time immediately before sending date and time. Home City, DST rules, alarms and other settings are preserved. If the current watch UTC offset is unavailable, confirm its current offset including summer time, reconnect and update again.": {
    "it": "L’app legge la configurazione oraria dell’orologio e verifica l’ora NTP subito prima di inviare data e ora. Città principale, regole dell’ora legale, sveglie e altre impostazioni vengono conservate. Se lo scostamento UTC non è disponibile, conferma quello attuale inclusa l’ora legale, riconnetti e aggiorna ancora.",
    "fr": "L’app lit la configuration horaire de la montre et vérifie NTP juste avant l’envoi. Ville de résidence, règles d’heure d’été, alarmes et autres réglages sont conservés. Si le décalage UTC est indisponible, confirmez sa valeur actuelle, heure d’été comprise, reconnectez la montre et réessayez.",
    "de": "Die App liest die Zeitkonfiguration der Uhr und prüft NTP unmittelbar vor dem Senden. Heimatstadt, Sommerzeitregeln, Alarme und andere Einstellungen bleiben erhalten. Ist der UTC-Abstand unbekannt, seinen aktuellen Wert einschließlich Sommerzeit bestätigen, erneut verbinden und aktualisieren.",
    "es": "La app lee la configuración horaria del reloj y verifica NTP justo antes de enviar la fecha y la hora. Conserva ciudad local, reglas de horario de verano, alarmas y otros ajustes. Si falta el desfase UTC, confirma el actual incluido el horario de verano, vuelve a conectar y actualiza otra vez.",
    "ja": "アプリは時計の時刻設定を読み取り、日付と時刻を送る直前に NTP を確認します。ホーム都市、夏時間の規則、アラームなどの設定は維持されます。UTC 時差を取得できない場合は、夏時間を含む現在の時差を確認し、再接続して更新してください。"
  },
  "GA-B2100 / 5689: hold C for at least three seconds until CNCT flashes. GWG-B1000 / 5713: hold B for at least five seconds. GST-B1000D / 5748: hold B for at least 2.5 seconds until R. GW-9500 / 3553 has no Bluetooth; use radio synchronization.": {
    "it": "GA-B2100 / 5689: tieni premuto C per almeno tre secondi finché lampeggia CNCT. GWG-B1000 / 5713: premi B per almeno cinque secondi. GST-B1000D / 5748: premi B per almeno 2,5 secondi fino a R. GW-9500 / 3553 non ha Bluetooth: usa la sincronizzazione radio.",
    "fr": "GA-B2100 / 5689 : maintenez C trois secondes jusqu’au clignotement de CNCT. GWG-B1000 / 5713 : maintenez B cinq secondes. GST-B1000D / 5748 : maintenez B 2,5 secondes jusqu’à R. GW-9500 / 3553 n’a pas de Bluetooth : utilisez la radio.",
    "de": "GA-B2100 / 5689: C mindestens drei Sekunden halten, bis CNCT blinkt. GWG-B1000 / 5713: B mindestens fünf Sekunden halten. GST-B1000D / 5748: B mindestens 2,5 Sekunden bis R halten. GW-9500 / 3553 hat kein Bluetooth; Radiosynchronisierung nutzen.",
    "es": "GA-B2100 / 5689: mantén C al menos tres segundos hasta que parpadee CNCT. GWG-B1000 / 5713: mantén B cinco segundos. GST-B1000D / 5748: mantén B 2,5 segundos hasta R. GW-9500 / 3553 no tiene Bluetooth; usa radio.",
    "ja": "GA-B2100 / 5689 は C を3秒以上押し CNCT の点滅を待ちます。GWG-B1000 / 5713 は B を5秒以上、GST-B1000D / 5748 は B を2.5秒以上押して R を待ちます。GW-9500 / 3553 は Bluetooth 非搭載のため電波同期を使用してください。"
  }
,
  "AtomicClockSync simulates station time codes through audio, records your watch experiments and explores time and space. No account is required.": {
    "it": "AtomicClockSync simula i codici orari delle stazioni tramite audio, registra gli esperimenti con i tuoi orologi ed esplora tempo e spazio. Non serve un account.",
    "fr": "AtomicClockSync simule les codes horaires par audio, conserve vos essais et explore le temps et l’espace. Aucun compte n’est nécessaire.",
    "de": "AtomicClockSync simuliert Zeitcodes per Audio, protokolliert deine Uhrenversuche und erkundet Zeit und Raum. Ein Konto ist nicht nötig.",
    "es": "AtomicClockSync simula códigos horarios mediante audio, registra tus experimentos con relojes y explora el tiempo y el espacio. No requiere cuenta.",
    "ja": "AtomicClockSync は音声で時刻信号を再現し、時計の実験を記録しながら時間と宇宙を探求します。アカウントは不要です。"
  },
  "The sidebar expands on hover or keyboard focus. Settings and Guide stay at its foot. Each manual chapter links to its section.": {
    "it": "La sidebar si espande con il mouse o il focus da tastiera. Impostazioni e Guida restano in fondo. Ogni capitolo rimanda alla propria sezione.",
    "fr": "La barre latérale se déploie au survol ou au focus clavier. Réglages et Guide restent en bas. Chaque chapitre renvoie à sa section.",
    "de": "Die Seitenleiste öffnet sich bei Hover oder Tastaturfokus. Einstellungen und Handbuch bleiben unten. Jedes Kapitel verlinkt seine Ansicht.",
    "es": "La barra lateral se amplía al pasar el ratón o con el foco del teclado. Ajustes y Guía permanecen abajo. Cada capítulo enlaza a su sección.",
    "ja": "サイドバーはホバーまたはキーボードのフォーカスで展開します。設定とガイドは下部に常駐し、各章から対応画面を開けます。"
  },
  "Generate an audio simulation of DCF77, MSF, WWVB, JJY or BPC to help a compatible watch receive its time code.": {
    "it": "Genera una simulazione audio di DCF77, MSF, WWVB, JJY o BPC per aiutare un orologio compatibile a ricevere il codice orario.",
    "fr": "Générez une simulation audio de DCF77, MSF, WWVB, JJY ou BPC pour aider une montre compatible à recevoir le code horaire.",
    "de": "Erzeuge eine Audiosimulation von DCF77, MSF, WWVB, JJY oder BPC, um eine kompatible Uhr beim Empfang des Zeitcodes zu unterstützen.",
    "es": "Genera una simulación de audio de DCF77, MSF, WWVB, JJY o BPC para ayudar a un reloj compatible a recibir el código horario.",
    "ja": "DCF77、MSF、WWVB、JJY、BPC の音声シミュレーションを生成し、対応する時計の時刻コード受信を補助します。"
  },
  "Audio coupling depends on hardware. Completion is not proof of reception. Sleep, screen lock or output changes stop transmission; keep the tone away from your ears.": {
    "it": "L’accoppiamento audio dipende dall’hardware. Finire la sessione non prova la ricezione. Sospensione, blocco schermo o cambio uscita fermano l’audio; tieni il tono lontano dalle orecchie.",
    "fr": "Le couplage audio dépend du matériel. La fin de session ne prouve pas la réception. Veille, verrouillage ou changement de sortie arrêtent l’audio ; éloignez le son des oreilles.",
    "de": "Die Audiokopplung hängt von der Hardware ab. Ein Sitzungsende beweist keinen Empfang. Ruhezustand, Sperre oder Ausgangswechsel stoppen Audio; den Ton von den Ohren fernhalten.",
    "es": "El acoplamiento de audio depende del hardware. Completar la sesión no prueba la recepción. Suspensión, bloqueo o cambio de salida detienen el audio; aleja el tono de los oídos.",
    "ja": "音声の結合は機器に依存します。送信完了は受信成功の証明ではありません。スリープ、画面ロック、出力変更で停止します。音を耳に近づけないでください。"
  },
  "Learn from recorded GET and ERR outcomes, compare configurations and prepare a repeatable next attempt for one watch.": {
    "it": "Impara dagli esiti GET ed ERR registrati, confronta le configurazioni e prepara un nuovo tentativo ripetibile per un singolo orologio.",
    "fr": "Analysez les résultats GET et ERR, comparez les configurations et préparez un nouvel essai reproductible pour une montre.",
    "de": "Lerne aus gespeicherten GET- und ERR-Ergebnissen, vergleiche Konfigurationen und bereite einen wiederholbaren Versuch für eine Uhr vor.",
    "es": "Aprende de los resultados GET y ERR, compara configuraciones y prepara otro intento repetible para un reloj.",
    "ja": "記録済みの GET・ERR から学び、設定を比較して、同じ時計で再現しやすい次の試行を準備します。"
  },
  "Groups exclude missing snapshots, interrupted audio and variable volume. Small samples and manual notes cannot establish that a setting caused a result.": {
    "it": "I gruppi escludono snapshot mancanti, audio interrotto e volume variabile. Campioni piccoli e note manuali non dimostrano che un’impostazione abbia causato un risultato.",
    "fr": "Les groupes excluent les instantanés absents, l’audio interrompu et les variations de volume. Peu d’essais et des notes manuelles ne prouvent pas une causalité.",
    "de": "Gruppen schließen fehlende Momentaufnahmen, unterbrochenes Audio und Lautstärkeänderungen aus. Kleine Stichproben und Notizen beweisen keine Ursache.",
    "es": "Los grupos excluyen capturas ausentes, audio interrumpido y volumen variable. Pocas muestras y notas manuales no demuestran que un ajuste causara un resultado.",
    "ja": "設定未記録、音声中断、音量変更の試行はグループから除外します。少数の記録や手書きの条件だけでは、設定が結果の原因とは断定できません。"
  },
  "Inspect the selected station’s simulated time code, current symbol, encoded fields and modulation envelope.": {
    "it": "Esamina il codice orario simulato della stazione selezionata, il simbolo attuale, i campi codificati e l’inviluppo di modulazione.",
    "fr": "Examinez le code horaire simulé de la station, le symbole actuel, les champs codés et l’enveloppe de modulation.",
    "de": "Untersuche den simulierten Zeitcode des Senders, das aktuelle Symbol, codierte Felder und die Modulationshüllkurve.",
    "es": "Examina el código horario simulado de la estación, el símbolo actual, los campos codificados y la envolvente de modulación.",
    "ja": "選択した送信局の時刻コード、現在のシンボル、符号化された項目、変調の包絡線を確認します。"
  },
  "The diagram represents generated data, not received radio strength or a measurement at the watch. BPC compatibility is experimental; JJY uses the 60 kHz station.": {
    "it": "Il diagramma rappresenta dati generati, non la potenza radio ricevuta o una misura sull’orologio. BPC è sperimentale; JJY usa la stazione a 60 kHz.",
    "fr": "Le diagramme représente des données générées, pas la puissance reçue ni une mesure sur la montre. BPC est expérimental ; JJY utilise la station 60 kHz.",
    "de": "Das Diagramm zeigt erzeugte Daten, keine Empfangsstärke oder Messung an der Uhr. BPC ist experimentell; JJY nutzt den 60-kHz-Sender.",
    "es": "El diagrama muestra datos generados, no potencia recibida ni una medición en el reloj. BPC es experimental; JJY usa la estación de 60 kHz.",
    "ja": "図は生成データであり、受信電波の強さや時計側の測定値ではありません。BPC は実験的対応で、JJY は 60 kHz 局を使用します。"
  },
  "Keep separate identities and reusable audio settings for your watches, with model, home city and placement notes.": {
    "it": "Conserva identità separate e impostazioni audio riutilizzabili per i tuoi orologi, con note su modello, città e posizionamento.",
    "fr": "Conservez des identités distinctes et des réglages audio réutilisables, avec des notes sur le modèle, la ville et le placement.",
    "de": "Speichere getrennte Uhrenidentitäten und wiederverwendbare Audioeinstellungen mit Modell-, Stadt- und Platzierungsnotizen.",
    "es": "Guarda identidades separadas y ajustes reutilizables para tus relojes, con notas de modelo, ciudad y colocación.",
    "ja": "時計ごとに識別情報と再利用できる音声設定を保存し、モデル、ホーム都市、置き方をメモできます。"
  },
  "Manual notes do not change the watch or operating system. Temporary audio changes are saved to a profile only when you explicitly save it.": {
    "it": "Le note manuali non modificano l’orologio o il sistema operativo. Le modifiche audio temporanee entrano nel profilo solo quando lo salvi esplicitamente.",
    "fr": "Les notes manuelles ne modifient ni la montre ni le système. Les changements audio temporaires ne sont enregistrés que si vous sauvegardez le profil.",
    "de": "Manuelle Notizen ändern weder Uhr noch Betriebssystem. Vorübergehende Audioänderungen werden nur beim ausdrücklichen Speichern übernommen.",
    "es": "Las notas manuales no cambian el reloj ni el sistema operativo. Los cambios temporales de audio solo pasan al perfil cuando lo guardas expresamente.",
    "ja": "手書きのメモは時計や OS の設定を変更しません。一時的な音声調整は、明示的に保存した場合だけプロフィールに反映されます。"
  },
  "Measure a watch’s signed offset and estimate its daily drift within periods separated by corrections.": {
    "it": "Misura lo scarto con segno di un orologio e stimane la deriva giornaliera in periodi separati dalle correzioni.",
    "fr": "Mesurez l’écart signé d’une montre et estimez sa dérive quotidienne par périodes séparées par les corrections.",
    "de": "Miss die Abweichung mit Vorzeichen und schätze den täglichen Gang in durch Korrekturen getrennten Zeiträumen.",
    "es": "Mide el desfase con signo de un reloj y estima su deriva diaria en períodos separados por correcciones.",
    "ja": "符号付きの時刻差を測定し、時刻修正で区切った期間ごとに日差を推定します。"
  },
  "Readings are manual. Corrections never create an assumed zero reading. Forecasts stop at corrections or seven days after the latest reading; errors and unreported resets affect estimates.": {
    "it": "Le letture sono manuali. Le correzioni non creano misure zero presunte. Le proiezioni si fermano alle correzioni o dopo sette giorni dall’ultima lettura; errori e reset non annotati influenzano la stima.",
    "fr": "Les lectures sont manuelles. Les corrections ne créent pas de mesure zéro supposée. Les projections cessent après correction ou sept jours sans mesure ; erreurs et resets non notés affectent l’estimation.",
    "de": "Die Ablesung ist manuell. Korrekturen erzeugen keine angenommene Nullmessung. Hochrechnungen enden bei Korrekturen oder sieben Tagen ohne Messung; Fehler und fehlende Reset-Einträge wirken sich aus.",
    "es": "Las lecturas son manuales. Las correcciones no crean un cero supuesto. La proyección termina con correcciones o siete días sin lectura; los errores y reinicios sin registrar afectan la estimación.",
    "ja": "読み取りは手動です。修正を時刻差ゼロの測定とはみなしません。予測は修正時、または最終測定から七日後に終了します。誤差や未記録の修正が推定に影響します。"
  },
  "Review immutable transmission snapshots and record what actually happened on the watch.": {
    "it": "Rivedi gli snapshot immutabili delle trasmissioni e registra ciò che è successo davvero sull’orologio.",
    "fr": "Consultez les instantanés immuables des transmissions et notez ce qui s’est réellement produit sur la montre.",
    "de": "Prüfe unveränderte Übertragungsaufnahmen und erfasse, was tatsächlich an der Uhr passiert ist.",
    "es": "Revisa las capturas inmutables de las transmisiones y registra lo que ocurrió realmente en el reloj.",
    "ja": "送信時点の変更されない記録を確認し、時計で実際に起きた結果を記録します。"
  },
  "Profiles can change while earlier snapshots remain intact. Clearing history offers an immediate undo. A reported GET does not prove a zero-offset accuracy reading.": {
    "it": "I profili possono cambiare mentre gli snapshot precedenti restano intatti. La cancellazione dello storico offre un annullamento immediato. Un GET dichiarato non prova uno scarto zero.",
    "fr": "Les profils peuvent changer sans modifier les anciens instantanés. L’effacement de l’historique peut être annulé immédiatement. Un GET déclaré ne prouve pas un écart nul.",
    "de": "Profiländerungen lassen frühere Aufnahmen unverändert. Löschen des Verlaufs lässt sich sofort rückgängig machen. Ein gemeldetes GET beweist keine Nullabweichung.",
    "es": "Los perfiles pueden cambiar sin alterar capturas anteriores. Vaciar el historial permite deshacer de inmediato. Un GET declarado no demuestra un desfase cero.",
    "ja": "プロフィールを変更しても過去の記録は変わりません。履歴消去は直後なら取り消せます。申告された GET は時刻差ゼロの証明ではありません。"
  },
  "Explore an offline Earth, local solar times, station locations and the shared observing city.": {
    "it": "Esplora una Terra offline, gli orari solari locali, le stazioni e la città di osservazione condivisa.",
    "fr": "Explorez une Terre hors ligne, les horaires solaires locaux, les stations et la ville d’observation commune.",
    "de": "Erkunde eine Offline-Erde, lokale Sonnenzeiten, Senderorte und die gemeinsame Beobachterstadt.",
    "es": "Explora la Tierra sin conexión, horarios solares locales, estaciones y la ciudad de observación compartida.",
    "ja": "オフラインの地球、現地の太陽時情報、送信局、各観測画面で共有する都市を探索します。"
  },
  "City lights and coverage rings are illustrations, not live measurements or reception guarantees. The city is shared with Moon and ISS; previews never alter transmitted time.": {
    "it": "Luci cittadine e anelli sono illustrazioni, non misure dal vivo o garanzie di ricezione. La città è condivisa con Luna e ISS; le anteprime non cambiano l’ora trasmessa.",
    "fr": "Lumières et cercles sont des illustrations, pas des mesures en direct ni des garanties de réception. La ville est partagée avec Lune et ISS ; les aperçus ne modifient pas l’heure transmise.",
    "de": "Stadtlichter und Reichweitenringe sind Illustrationen, keine Live-Messungen oder Empfangsgarantien. Mond und ISS teilen die Stadt; Vorschauen ändern die Übertragungszeit nicht.",
    "es": "Luces y anillos son ilustraciones, no mediciones en directo ni garantías de recepción. La ciudad se comparte con Luna e ISS; las vistas previas no cambian la hora transmitida.",
    "ja": "都市の光や範囲リングは図示であり、実測や受信保証ではありません。都市は月・ISS と共有され、プレビューは送信時刻を変えません。"
  },
  "The app brings two activities together: helping a compatible watch synchronize and understanding how time is measured. Signals contains transmission tools, Watches keeps your records, and Explore opens the scientific views.": {
    "it": "L’app unisce due attività: aiutare un orologio compatibile a sincronizzarsi e capire come si misura il tempo. Segnali raccoglie gli strumenti di trasmissione, Orologi conserva i tuoi risultati ed Esplora apre le viste scientifiche.",
    "fr": "L’app réunit deux activités : aider une montre compatible à se synchroniser et comprendre la mesure du temps. Signaux contient les outils de transmission, Montres vos relevés et Explorer les vues scientifiques.",
    "de": "Die App verbindet Synchronisieren kompatibler Uhren mit dem Verständnis der Zeitmessung. Signale enthält die Übertragungswerkzeuge, Uhren deine Aufzeichnungen und Entdecken die wissenschaftlichen Ansichten.",
    "es": "La app combina la sincronización de relojes compatibles con el conocimiento de cómo medimos el tiempo. Señales reúne las herramientas de transmisión, Relojes tus registros y Explorar las vistas científicas.",
    "ja": "このアプリでは、対応する時計の時刻合わせと、時間の測り方への理解を結び付けます。「信号」には送信機能、「時計」には記録、「探索」には科学的な表示があります。"
  },
  "Begin with a single watch and a supported station. The app generates audio, while the watch performs its own reception. Keeping those roles separate makes the outcome meaningful: a finished countdown describes the transmission, and GET describes the result you observed.": {
    "it": "Inizia con un solo orologio e una stazione supportata. L’app genera l’audio, mentre l’orologio esegue la ricezione. Distinguere questi ruoli dà senso al risultato: il conto alla rovescia concluso descrive la trasmissione, GET ciò che hai osservato.",
    "fr": "Commencez avec une montre et une station compatible. L’app génère l’audio, la montre assure la réception. Cette distinction donne du sens au résultat : le compte à rebours décrit la transmission, GET le résultat observé.",
    "de": "Beginne mit einer Uhr und einem unterstützten Sender. Die App erzeugt Audio, die Uhr empfängt. Diese Trennung ist wichtig: Ein abgelaufener Countdown beschreibt die Übertragung, GET das von dir beobachtete Ergebnis.",
    "es": "Empieza con un reloj y una estación compatible. La app genera audio y el reloj realiza la recepción. Distinguir ambos papeles da sentido al resultado: la cuenta atrás describe la transmisión y GET el resultado observado.",
    "ja": "まず一つの時計と対応送信局で試します。アプリは音声を生成し、受信するのは時計です。カウントダウン終了は送信の完了を、GET は時計で確認した結果を表します。"
  },
  "For a first attempt in Italy, a compatible watch might use DCF77 and ROM. Check your module manual, place the watch near a speaker and save the result to begin your own reception history.": {
    "it": "Per un primo tentativo in Italia, un orologio compatibile può usare DCF77 e ROM. Consulta il manuale del modulo, avvicina l’orologio a un altoparlante e salva il risultato per iniziare il tuo storico.",
    "fr": "Pour un premier essai en Italie, une montre compatible peut utiliser DCF77 et ROM. Consultez le manuel du module, approchez la montre du haut-parleur et enregistrez le résultat pour commencer l’historique.",
    "de": "Für einen ersten Versuch in Italien kann eine kompatible Uhr DCF77 und ROM verwenden. Prüfe das Modulhandbuch, lege die Uhr nahe an den Lautsprecher und speichere das Ergebnis als ersten Verlaufseintrag.",
    "es": "Para una primera prueba en Italia, un reloj compatible podría usar DCF77 y ROM. Consulta su manual, acerca el reloj al altavoz y guarda el resultado para iniciar el historial.",
    "ja": "イタリアでの最初の試行なら、対応する時計で DCF77 と ROM を使う例があります。モジュールの説明書を確認し、スピーカーに近づけて結果を履歴に保存します。"
  },
  "This is the operating desk for a reception attempt. The large clock shows the selected station’s signal time; its reference label tells you whether the app checked time through NTP or is relying on an unverified system clock.": {
    "it": "Questa è la plancia di un tentativo di ricezione. Il grande orologio mostra l’ora del segnale della stazione; l’etichetta del riferimento indica se l’app ha verificato l’ora via NTP o usa un’ora di sistema non verificata.",
    "fr": "C’est le poste de commande d’un essai. La grande horloge affiche l’heure du signal ; l’étiquette de référence indique si l’app l’a vérifiée par NTP ou utilise une horloge système non vérifiée.",
    "de": "Hier steuerst du einen Empfangsversuch. Die große Uhr zeigt die Signalzeit des Senders. Die Referenzanzeige verrät, ob die App per NTP geprüft hat oder eine ungeprüfte Systemzeit verwendet.",
    "es": "Esta es la consola de cada intento. El reloj grande muestra la hora de la señal; la referencia indica si se ha comprobado mediante NTP o si se usa una hora del sistema sin verificar.",
    "ja": "ここは受信試行の操作画面です。大きな時計には送信局の信号時刻を表示し、基準ラベルで NTP による確認済みか、未検証のシステム時刻かを区別します。"
  },
  "The tone uses a fraction of the radio carrier and relies on output harmonics and electromagnetic coupling. Speaker, channel, distance and orientation all matter. Choose the duration before starting, keep the watch still and confirm success only after its own display reports reception.": {
    "it": "Il tono usa una frazione della portante radio e si basa su armoniche e accoppiamento elettromagnetico dell’uscita. Altoparlante, canale, distanza e orientamento contano. Scegli la durata prima di partire e conferma solo quando il display dell’orologio riporta la ricezione.",
    "fr": "Le son utilise une fraction de la porteuse radio, avec les harmoniques et le couplage électromagnétique de la sortie. Haut-parleur, canal, distance et orientation comptent. Choisissez la durée et confirmez uniquement la réception affichée par la montre.",
    "de": "Der Ton nutzt einen Bruchteil des Funkträgers sowie Oberwellen und elektromagnetische Kopplung des Ausgangs. Lautsprecher, Kanal, Abstand und Ausrichtung wirken sich aus. Wähle vorher die Dauer und bestätige erst den Empfang am Uhrendisplay.",
    "es": "El tono usa una fracción de la portadora y depende de armónicos y acoplamiento electromagnético de la salida. Altavoz, canal, distancia y orientación importan. Elige la duración antes de empezar y confirma solo la recepción mostrada por el reloj.",
    "ja": "音は電波の搬送周波数の一部を使い、出力の高調波と電磁結合を利用します。スピーカー、チャンネル、距離、向きが影響します。先に送信時間を決め、時計の表示で受信を確認してから成功を記録します。"
  },
  "If one attempt ends in ERR, keep the same watch and station for the next attempt and change just its placement or one audio setting. The two recorded attempts then become useful material for Reception Lab.": {
    "it": "Se un tentativo finisce in ERR, mantieni orologio e stazione nel successivo e cambia solo la posizione o una sola impostazione audio. I due tentativi registrati diventano così utili nel Laboratorio.",
    "fr": "Après un ERR, gardez la même montre et station et ne changez que le placement ou un réglage audio. Les deux essais enregistrés deviennent alors utiles au laboratoire.",
    "de": "Nach ERR behältst du Uhr und Sender bei und änderst nur die Platzierung oder eine Audioeinstellung. So werden beide gespeicherten Versuche im Empfangslabor vergleichbar.",
    "es": "Tras un ERR, mantén reloj y estación y cambia solo la colocación o un ajuste de audio. Los dos intentos guardados serán útiles en el laboratorio.",
    "ja": "ERR の後は同じ時計と送信局のまま、置き方か音声設定の一つだけを変更します。こうして二つの記録が受信ラボで役立つ比較材料になります。"
  },
  "A successful attempt becomes useful when you remember how it was achieved. The overview gathers your recorded results by watch and station, keeping unverified outcomes separate from the GET/ERR rate. Configuration groups show the conditions that were actually saved.": {
    "it": "Un tentativo riuscito diventa utile quando ricordi come l’hai ottenuto. La panoramica raccoglie i risultati per orologio e stazione, separando i non verificati dalla percentuale GET/ERR. I gruppi mostrano le condizioni effettivamente salvate.",
    "fr": "Un succès devient utile quand ses conditions sont connues. L’aperçu regroupe les résultats par montre et station, séparant les essais non vérifiés du taux GET/ERR. Les groupes montrent les conditions réellement enregistrées.",
    "de": "Ein Erfolg ist nützlich, wenn seine Umstände bekannt sind. Die Übersicht sammelt Ergebnisse je Uhr und Sender und trennt ungeprüfte Versuche von der GET/ERR-Quote. Gruppen zeigen tatsächlich gespeicherte Bedingungen.",
    "es": "Un éxito es útil cuando recuerdas cómo lo lograste. La vista general reúne resultados por reloj y estación, separando los no verificados de la tasa GET/ERR. Los grupos muestran las condiciones guardadas.",
    "ja": "成功した条件を覚えておくことで、試行を次へ生かせます。概要では時計と送信局ごとの結果をまとめ、未確認の試行を GET・ERR 率から分け、保存された条件をグループで示します。"
  },
  "Compare A/B puts two attempts side by side so differences become visible. Next trial takes a stable baseline and prepares a single audio change. It deliberately stops before transmission: you still check the physical setup and decide when to begin.": {
    "it": "Confronta A/B affianca due tentativi per renderne visibili le differenze. Il prossimo tentativo parte da una base stabile e prepara una sola modifica audio. Si ferma prima della trasmissione: controlli ancora la disposizione fisica e decidi tu quando iniziare.",
    "fr": "Comparer A/B rapproche deux essais pour rendre leurs différences visibles. L’essai suivant prépare un seul changement depuis une base stable. Il s’arrête avant la transmission : vous contrôlez encore le dispositif et choisissez le départ.",
    "de": "A/B vergleichen stellt zwei Versuche gegenüber. Der nächste Versuch bereitet eine einzelne Audioänderung aus einer stabilen Basis vor. Vor der Übertragung bleibt bewusst Halt: Du prüfst den Aufbau und bestimmst den Start.",
    "es": "Comparar A/B pone dos intentos lado a lado. El próximo intento prepara un único cambio desde una referencia estable. Se detiene antes de transmitir para que compruebes la disposición física y decidas cuándo comenzar.",
    "ja": "A/B 比較では二つの試行を並べて違いを確認します。次の試行では安定した基準から音声設定を一つ変更して準備します。送信前で止まるため、実際の配置を確認して開始時点を選べます。"
  },
  "Compare two attempts that used the same watch, station and position but different app volume. A GET after the change is an observation to repeat, not proof that volume alone caused the improvement.": {
    "it": "Confronta due tentativi con lo stesso orologio, stazione e posizione ma volume diverso. Un GET dopo la modifica è un’osservazione da ripetere, non la prova che il volume abbia causato il miglioramento.",
    "fr": "Comparez deux essais avec la même montre, station et position, mais un volume différent. Un GET après changement est une observation à répéter, pas la preuve que le volume a causé le progrès.",
    "de": "Vergleiche gleiche Uhr, Sender und Position bei unterschiedlicher Lautstärke. Ein GET nach der Änderung sollte wiederholt werden; es beweist nicht, dass allein die Lautstärke geholfen hat.",
    "es": "Compara dos intentos con igual reloj, estación y posición, pero distinto volumen. Un GET tras el cambio es una observación para repetir, no prueba de que el volumen causó la mejora.",
    "ja": "時計・送信局・置き方をそろえ、音量だけが違う二つの試行を比べます。変更後の GET は再確認すべき観察であり、音量だけが改善の原因だという証明ではありません。"
  },
  "A watch receives a structured message rather than a spoken time. This view opens that message: the current symbol moves through the frame while the decoded fields explain which date, time and control information the selected protocol carries.": {
    "it": "L’orologio riceve un messaggio strutturato, non un’ora pronunciata. Questa vista lo apre: il simbolo attuale avanza nel frame e i campi decodificati spiegano data, ora e informazioni di controllo del protocollo selezionato.",
    "fr": "La montre reçoit un message structuré, pas une heure parlée. Cette vue l’ouvre : le symbole avance dans la trame et les champs décodés expliquent date, heure et informations de contrôle du protocole.",
    "de": "Die Uhr empfängt eine strukturierte Nachricht statt einer gesprochenen Uhrzeit. Das aktuelle Symbol wandert durch den Rahmen; decodierte Felder erklären Datum, Uhrzeit und Steuerinformationen des Protokolls.",
    "es": "El reloj recibe un mensaje estructurado, no una hora hablada. Aquí se abre ese mensaje: el símbolo recorre la trama y los campos explican fecha, hora e información de control del protocolo.",
    "ja": "時計が受け取るのは読み上げ時刻ではなく、構造化されたメッセージです。現在のシンボルがフレームを進み、復号表示で日付、時刻、制御情報の意味を確認できます。"
  },
  "The waveform and markers follow the generated envelope. They help you connect what the app emits with the station’s documented format, but they cannot tell you how much signal reached the watch. Changing stations can change frame length, markers and field meanings.": {
    "it": "Forma d’onda e marcatori seguono l’inviluppo generato. Collegano ciò che emette l’app al formato documentato della stazione, senza misurare quanto arriva all’orologio. Cambiare stazione può cambiare durata del frame, marcatori e significato dei campi.",
    "fr": "L’onde et les marqueurs suivent l’enveloppe générée. Ils relient l’émission au format documenté, sans mesurer le signal arrivé à la montre. Une autre station peut changer durée de trame, marqueurs et sens des champs.",
    "de": "Wellenform und Markierungen folgen der erzeugten Hüllkurve. Sie verbinden die Ausgabe mit dem dokumentierten Format, messen aber nicht den Empfang an der Uhr. Andere Sender können Rahmenlänge, Marker und Feldbedeutungen ändern.",
    "es": "La onda y los marcadores siguen la envolvente generada. Relacionan lo emitido con el formato documentado sin medir cuánto llega al reloj. Otra estación puede cambiar duración, marcadores y significado de los campos.",
    "ja": "波形とマーカーは生成された包絡線を追います。アプリの出力と送信局の仕様を結び付けますが、時計へ届いた量は測れません。送信局によってフレーム長や項目の意味が変わります。"
  },
  "Select DCF77, observe the advancing symbol and compare the encoded minute with the signal clock. Use the station specification below when you want the meaning of a particular field.": {
    "it": "Seleziona DCF77, osserva il simbolo che avanza e confronta il minuto codificato con l’orologio del segnale. Consulta le specifiche qui sotto per capire un campo preciso.",
    "fr": "Choisissez DCF77, suivez le symbole et comparez la minute codée avec l’horloge du signal. Consultez la spécification ci-dessous pour comprendre un champ précis.",
    "de": "Wähle DCF77, beobachte das Symbol und vergleiche die codierte Minute mit der Signaluhr. Die Spezifikation unten erklärt einzelne Felder.",
    "es": "Selecciona DCF77, observa el símbolo y compara el minuto codificado con el reloj de señal. Consulta la especificación inferior para entender un campo concreto.",
    "ja": "DCF77 を選び、進むシンボルと符号化された分を信号時計と比較します。個別の項目は下の送信局仕様で確認できます。"
  },
  "A profile gives an experiment a stable identity. A watch name connects reception attempts and accuracy observations even when you later rename the profile. Notes preserve the details the app cannot discover, such as the watch’s home city or its position beside a speaker.": {
    "it": "Un profilo dà all’esperimento un’identità stabile. Il nome collega ricezioni e misure di precisione anche dopo una rinomina. Le note conservano ciò che l’app non può scoprire, come città impostata e posizione accanto all’altoparlante.",
    "fr": "Un profil donne une identité stable à l’expérience. Le nom relie réception et précision même après renommage. Les notes gardent ce que l’app ne peut découvrir : ville réglée et position près du haut-parleur.",
    "de": "Ein Profil gibt dem Versuch eine stabile Identität. Empfang und Genauigkeitsmessung bleiben auch nach Umbenennen verbunden. Notizen bewahren Details, die die App nicht erkennt, etwa Heimatstadt und Lautsprecherposition.",
    "es": "Un perfil da identidad estable al experimento. Vincula recepción y precisión incluso tras cambiar el nombre. Las notas conservan lo que la app no puede descubrir, como la ciudad configurada y la posición junto al altavoz.",
    "ja": "プロフィールは実験の識別を保ちます。名前を変えても受信試行と精度記録の関連は続きます。ホーム都市やスピーカーの横での置き方など、アプリが取得できない情報はメモに残します。"
  },
  "Saving a profile captures the current audio configuration. Loading it restores those settings for another attempt, while later adjustments remain temporary until saved again. The last successful configuration offers a starting point drawn from a GET you confirmed.": {
    "it": "Salvare il profilo acquisisce la configurazione audio corrente. Caricarlo la ripristina per un altro tentativo; le regolazioni successive restano temporanee finché non salvi di nuovo. Le ultime impostazioni riuscite offrono una base tratta da un GET confermato da te.",
    "fr": "Enregistrer le profil capture l’audio actuel. Le charger le restaure pour un nouvel essai ; les changements suivants restent temporaires avant sauvegarde. Les derniers réglages réussis viennent d’un GET confirmé par vous.",
    "de": "Speichern übernimmt die aktuelle Audiokonfiguration. Laden stellt sie wieder her; weitere Änderungen bleiben bis zum erneuten Speichern vorläufig. Die letzten erfolgreichen Einstellungen stammen aus einem von dir bestätigten GET.",
    "es": "Guardar captura la configuración de audio actual. Cargarla la restaura; los ajustes posteriores son temporales hasta volver a guardar. Los últimos ajustes exitosos proceden de un GET que confirmaste.",
    "ja": "保存時点の音声設定をプロフィールに記録し、読み込むと次の試行用に復元します。その後の調整は再保存まで一時的です。最後の成功設定は、自分で確認した GET から取得します。"
  },
  "Keep one profile for a daily watch and another for a desk watch. Each can retain its preferred station and placement notes while its historical attempts remain separate.": {
    "it": "Conserva un profilo per l’orologio quotidiano e uno per quello da scrivania. Ognuno mantiene stazione e note di posizione preferite, mentre i tentativi storici restano separati.",
    "fr": "Gardez un profil pour la montre quotidienne et un pour celle du bureau. Chacun conserve station et placement préférés, avec des essais historiques séparés.",
    "de": "Lege je ein Profil für Alltags- und Schreibtischuhr an. Beide behalten bevorzugten Sender und Platzierungsnotizen, während ihre Versuche getrennt bleiben.",
    "es": "Usa un perfil para el reloj diario y otro para el de escritorio. Cada uno conserva estación y notas preferidas con historiales separados.",
    "ja": "普段用と机上用の時計を別のプロフィールにします。それぞれの送信局や置き方を保存し、過去の試行も分けて管理できます。"
  },
  "An offset tells you how far the watch is from the reference at one instant. Drift describes how that offset changes across days. The graph keeps these ideas separate: points are your readings, the dashed line fits the selected period, and the current estimate is an extrapolation.": {
    "it": "Lo scarto descrive quanto l’orologio è distante dal riferimento in un istante. La deriva racconta come cambia nei giorni. Il grafico distingue questi concetti: i punti sono letture, la linea tratteggiata interpola il periodo e la stima attuale è una proiezione.",
    "fr": "L’écart décrit la différence à un instant ; la dérive, son évolution sur plusieurs jours. Le graphique distingue les lectures, l’ajustement en pointillés et l’estimation actuelle issue d’une extrapolation.",
    "de": "Die Abweichung beschreibt die Differenz zur Referenz in einem Moment, der Gang ihre Veränderung über Tage. Punkte sind Messungen, die gestrichelte Linie passt den Zeitraum an und die aktuelle Schätzung ist eine Hochrechnung.",
    "es": "El desfase mide la diferencia en un instante; la deriva describe su cambio entre días. Los puntos son lecturas, la línea discontinua ajusta el período y la estimación actual es una extrapolación.",
    "ja": "時刻差はある瞬間の基準との差、日差は数日間でその差がどう変わるかを表します。点は実測、破線は期間内の傾向線、現在の推定値は外挿です。"
  },
  "A correction interrupts the story. Recording synchronization, adjustment or maintenance starts a fresh period without assuming the new offset is zero. This is especially important for a radio-controlled watch that may correct itself overnight. Readings and events remain editable in the journal.": {
    "it": "Una correzione interrompe il racconto. Annotare sincronizzazione, regolazione o manutenzione apre un nuovo periodo senza presumere scarto zero. È essenziale per un radiocontrollato che può correggersi di notte. Letture ed eventi restano modificabili nel diario.",
    "fr": "Une correction coupe le récit. Synchronisation, réglage ou entretien ouvrent une période sans supposer un écart nul. C’est essentiel pour une montre radio qui se corrige la nuit. Le journal permet de modifier mesures et événements.",
    "de": "Eine Korrektur unterbricht den Verlauf. Synchronisierung, Einstellung oder Wartung beginnen einen neuen Zeitraum ohne angenommene Nullabweichung. Bei nächtlich korrigierenden Funkuhren ist das entscheidend. Messungen und Ereignisse bleiben bearbeitbar.",
    "es": "Una corrección interrumpe la historia. Registrar sincronización, ajuste o mantenimiento abre otro período sin suponer desfase cero. Es esencial en un reloj que se corrige de noche. Lecturas y eventos siguen editables en el diario.",
    "ja": "修正を記録すると、ゼロとは仮定せずに新しい期間が始まります。夜間に自動修正する電波時計では特に重要です。測定とイベントは日誌で後から編集できます。"
  },
  "An offset of +3 seconds followed by +9 seconds three days later suggests about +2 seconds per day during that period. A later synchronization starts another period and needs a new measured baseline.": {
    "it": "Uno scarto di +3 secondi seguito da +9 tre giorni dopo suggerisce circa +2 secondi al giorno in quel periodo. Una sincronizzazione successiva apre un altro periodo e richiede una nuova lettura iniziale.",
    "fr": "Un écart de +3 secondes puis +9 trois jours après suggère environ +2 secondes par jour. Une synchronisation ouvre ensuite une nouvelle période nécessitant une nouvelle mesure initiale.",
    "de": "Auf +3 Sekunden folgen drei Tage später +9: Das deutet auf etwa +2 Sekunden täglich in diesem Zeitraum hin. Eine spätere Synchronisierung beginnt einen neuen Zeitraum mit neuem Messbeginn.",
    "es": "Un desfase de +3 segundos y +9 tres días después sugiere unos +2 segundos diarios. Una sincronización posterior abre otro período que necesita una nueva medición inicial.",
    "ja": "三日間で時刻差が +3 秒から +9 秒になれば、その期間は一日約 +2 秒と考えられます。その後の同期は別の期間となり、新たな基準測定が必要です。"
  },
  "History preserves the circumstances of each transmission, rather than just its final label. Opening a trial reveals the settings used, actual duration, reference information and any interruption or live volume changes. Earlier snapshots stay intact when a profile changes.": {
    "it": "Lo storico conserva le circostanze di ogni trasmissione, non solo l’esito. Il dettaglio rivela impostazioni, durata effettiva, riferimento ed eventuali interruzioni o cambi di volume. Gli snapshot precedenti restano intatti quando un profilo cambia.",
    "fr": "L’historique conserve les circonstances, pas seulement le résultat. Les détails révèlent réglages, durée réelle, référence, interruptions et variations de volume. Les instantanés anciens restent intacts malgré les changements de profil.",
    "de": "Der Verlauf bewahrt Umstände statt nur Ergebnisse. Details zeigen Einstellungen, Laufzeit, Referenz und Unterbrechungen oder Lautstärkeänderungen. Frühere Aufnahmen bleiben bei Profiländerungen unverändert.",
    "es": "El historial conserva las circunstancias, no solo el resultado. Los detalles muestran ajustes, duración real, referencia, interrupciones y cambios de volumen. Las capturas previas no cambian al modificar un perfil.",
    "ja": "履歴には結果だけでなく、設定、実際の送信時間、基準時刻、中断や音量変更も残ります。プロフィールを変更しても、過去の試行時点の記録は変わりません。"
  },
  "The outcome belongs to your observation of the watch. You can record GET, ERR or leave it unverified, including after transmission has ended. Those choices feed Reception Lab. A linked GET can also propose an accuracy correction event for you to review before saving.": {
    "it": "L’esito dipende da ciò che osservi sull’orologio. Puoi registrare GET, ERR o lasciare non verificato anche dopo la trasmissione. Queste scelte alimentano il Laboratorio. Un GET collegato può proporre una correzione della precisione da controllare prima di salvarla.",
    "fr": "Le résultat vient de votre observation de la montre. GET, ERR ou Non vérifié peuvent être saisis après transmission et alimentent le laboratoire. Un GET associé peut proposer une correction à vérifier avant sauvegarde.",
    "de": "Das Ergebnis beruht auf deiner Beobachtung. GET, ERR oder Ungeprüft lassen sich auch nachträglich erfassen und fließen ins Labor ein. Ein verknüpftes GET kann eine vor dem Speichern zu prüfende Genauigkeitskorrektur vorschlagen.",
    "es": "El resultado depende de lo observado en el reloj. Puedes indicar GET, ERR o Sin verificar después de transmitir; esos datos alimentan el laboratorio. Un GET vinculado puede proponer una corrección para revisar antes de guardarla.",
    "ja": "結果は時計を観察して判断します。送信後でも GET、ERR、未確認を記録でき、受信ラボへ反映されます。関連付いた GET から精度の修正イベントを提案できますが、保存前に確認します。"
  },
  "If you notice GET only after the transmission finishes, open that trial and update its outcome. The laboratory recomputes the rate; the original audio settings and duration remain unchanged.": {
    "it": "Se noti GET solo dopo la fine della trasmissione, apri il tentativo e aggiorna l’esito. Il Laboratorio ricalcola la percentuale; impostazioni e durata originali restano invariate.",
    "fr": "Si GET apparaît après la transmission, ouvrez l’essai et modifiez le résultat. Le laboratoire recalcule le taux sans changer réglages ni durée d’origine.",
    "de": "Entdeckst du GET erst nach der Übertragung, aktualisiere das Ergebnis des Versuchs. Das Labor berechnet die Quote neu; ursprüngliche Einstellungen und Dauer bleiben erhalten.",
    "es": "Si ves GET al terminar, abre el intento y actualiza el resultado. El laboratorio recalcula la tasa sin alterar ajustes ni duración originales.",
    "ja": "送信終了後に GET に気付いたら、該当試行の結果を更新します。ラボの割合は再計算されますが、元の設定と時間はそのまま残ります。"
  },
  "World View connects the clock to a place. Choosing a city establishes the observer used by the Moon and ISS views, while the map shows the moving boundary between daylight and night. Local clocks and solar times help explain why the same instant looks different around Earth.": {
    "it": "World View collega l’orologio a un luogo. La città scelta definisce l’osservatore di Luna e ISS, mentre la mappa mostra il confine mobile tra giorno e notte. Ora locale e orari solari spiegano perché lo stesso istante appaia diverso sulla Terra.",
    "fr": "World View relie l’heure à un lieu. La ville choisie définit l’observateur pour Lune et ISS ; la carte montre la frontière jour/nuit. Heures locales et solaires expliquent les différences d’un même instant sur Terre.",
    "de": "World View verbindet Zeit mit einem Ort. Die Stadt bestimmt den Beobachter für Mond und ISS, die Karte zeigt die wandernde Tag-Nacht-Grenze. Orts- und Sonnenzeiten erklären Unterschiede desselben Moments auf der Erde.",
    "es": "World View conecta el reloj con un lugar. La ciudad define al observador de Luna e ISS y el mapa muestra el límite día/noche. Las horas locales y solares explican cómo cambia un mismo instante en la Tierra.",
    "ja": "ワールドビューは時刻と場所を結び付けます。都市の選択で月・ISS の観測地点が決まり、地図には移動する昼夜境界を表示します。現地時刻と太陽の時刻から、同じ瞬間の地域差が分かります。"
  },
  "The timeline lets you explore another date without changing the transmitted time. Station markers and optional range rings add geographical context to reception. Their circles are nominal illustrations; they do not measure current propagation, buildings or the output hardware beside your watch.": {
    "it": "La timeline esplora altre date senza cambiare l’ora trasmessa. Stazioni e anelli di copertura aggiungono contesto geografico. I cerchi sono indicativi: non misurano propagazione attuale, edifici o l’hardware accanto al tuo orologio.",
    "fr": "La chronologie explore d’autres dates sans modifier l’heure transmise. Stations et cercles ajoutent un contexte géographique. Ces indications ne mesurent ni propagation actuelle, ni bâtiments, ni matériel près de la montre.",
    "de": "Die Zeitleiste erkundet andere Daten ohne Änderung der Übertragungszeit. Sender und Reichweitenringe liefern geografischen Kontext. Die Kreise messen weder aktuelle Ausbreitung noch Gebäude oder deine Audiohardware.",
    "es": "La línea temporal explora fechas sin cambiar la hora transmitida. Estaciones y anillos añaden contexto geográfico; no miden la propagación actual, los edificios ni el hardware junto al reloj.",
    "ja": "タイムラインで別の日を調べても送信時刻は変わりません。送信局や範囲リングは地理的な目安であり、現在の伝搬、建物、時計の横の機器を測定するものではありません。"
  },
  "Choose Rome, compare a winter day with the June solstice and watch the daylight boundary change. Open Moon Observatory afterward: it uses the same observing city.": {
    "it": "Scegli Roma e confronta un giorno invernale con il solstizio di giugno, osservando il confine di luce. Apri poi l’Osservatorio lunare: usa la stessa città di osservazione.",
    "fr": "Choisissez Rome et comparez un jour d’hiver au solstice de juin. Observez la frontière lumineuse, puis ouvrez l’observatoire lunaire : il utilise la même ville.",
    "de": "Wähle Rom und vergleiche einen Wintertag mit der Juni-Sonnenwende. Beobachte die Lichtgrenze und öffne danach das Mondobservatorium mit derselben Stadt.",
    "es": "Elige Roma y compara un día invernal con el solsticio de junio. Observa el límite de luz y abre el observatorio lunar, que usa esa misma ciudad.",
    "ja": "ローマを選び、冬の日と六月の至点で昼夜境界を比べます。その後で月の観測画面を開くと、同じ都市が使われます。"
  },
  "Follow the Moon’s calculated phase, illumination, distance and local rising and setting for your observing city.": {
    "it": "Segui fase, illuminazione, distanza e orari locali di alba e tramonto della Luna calcolati per la tua città.",
    "fr": "Suivez phase, illumination, distance et lever/coucher locaux calculés pour votre ville.",
    "de": "Verfolge berechnete Mondphase, Beleuchtung, Entfernung und lokale Auf- und Untergänge für deine Stadt.",
    "es": "Sigue fase, iluminación, distancia y salida y puesta de la Luna calculadas para tu ciudad.",
    "ja": "観測都市に合わせて計算した月相、照らされる割合、距離、月の出・月の入りを確認します。"
  },
  "The lunar disc is a calculated view of the Moon, accompanied by phase, illumination, distance and age. Altitude, azimuth and rise/set information place that Moon in the sky of your chosen city, rather than treating it as the same local view everywhere.": {
    "it": "Il disco lunare è una vista calcolata della Luna, affiancata da fase, illuminazione, distanza ed età. Altezza, azimut e orari locali collocano quella Luna nel cielo della tua città, invece di trattare ogni luogo come identico.",
    "fr": "Le disque est une vue calculée de la Lune avec phase, illumination, distance et âge. Altitude, azimut et horaires locaux la placent dans le ciel de votre ville, au lieu de supposer une vue identique partout.",
    "de": "Die berechnete Mondscheibe zeigt Phase, Beleuchtung, Entfernung und Alter. Höhe, Azimut und Auf-/Untergang ordnen sie dem Himmel deiner Stadt zu, statt überall dieselbe lokale Ansicht anzunehmen.",
    "es": "El disco lunar es una vista calculada con fase, iluminación, distancia y edad. Altura, acimut y horarios la sitúan en el cielo de tu ciudad, sin suponer una vista local idéntica en todas partes.",
    "ja": "月の円盤は計算に基づく表示で、月相、照明率、距離、月齢を併記します。高度、方位角、出入り時刻により、その月が観測都市の空でどう見えるかを示します。"
  },
  "Live follows the app’s current reference. Selecting an upcoming quarter phase or changing the UTC date opens an independent preview. This makes it possible to compare lunar appearances and local viewing times while keeping your real clock and any transmission unchanged.": {
    "it": "Live segue il riferimento attuale dell’app. Una fase imminente o una diversa data UTC apre un’anteprima indipendente. Puoi così confrontare aspetti lunari e orari locali lasciando invariati il vero orologio e l’eventuale trasmissione.",
    "fr": "Direct suit la référence actuelle. Choisir une phase prochaine ou une date UTC ouvre un aperçu indépendant. Comparez ainsi les apparences lunaires et horaires locaux sans modifier l’horloge réelle ni la transmission.",
    "de": "Live folgt der aktuellen App-Referenz. Eine nächste Phase oder ein anderes UTC-Datum öffnet eine unabhängige Vorschau. So lassen sich Erscheinung und lokale Zeiten vergleichen, während reale Uhr und Übertragung unverändert bleiben.",
    "es": "En vivo sigue la referencia actual. Elegir una fase próxima u otra fecha UTC abre una vista previa independiente. Así comparas el aspecto lunar y los horarios locales sin cambiar el reloj real ni la transmisión.",
    "ja": "ライブはアプリの現在の基準時刻に従います。次の月相や別の UTC 日時を選ぶと独立したプレビューとなり、実際の時計や送信を変えずに見え方と現地時刻を比べられます。"
  },
  "Select the next full-Moon event, inspect its preview and compare the local rise time with your observing city. Return to Live when you want tonight’s circumstances.": {
    "it": "Seleziona il prossimo evento di Luna piena e confronta l’anteprima con l’ora locale di sorgere nella tua città. Torna a Live per le circostanze di stasera.",
    "fr": "Choisissez la prochaine pleine Lune et comparez l’aperçu à l’heure locale de lever. Revenez au Direct pour les conditions de ce soir.",
    "de": "Wähle den nächsten Vollmond und prüfe die Vorschau samt lokaler Aufgangszeit. Zurück zu Live zeigt die Umstände des heutigen Abends.",
    "es": "Selecciona la próxima Luna llena y compara la vista previa con la hora local de salida. Vuelve a En vivo para consultar esta noche.",
    "ja": "次の満月を選び、プレビューと観測都市の月の出を確認します。今夜の状況を見るにはライブへ戻ります。"
  },
  "These are offline astronomical calculations. No event today means no rise or set on that local date; previews do not change the city’s real clock or the audio signal.": {
    "it": "Sono calcoli astronomici offline. Nessun evento oggi significa che non c’è sorgere o tramonto in quella data locale; le anteprime non cambiano l’ora reale della città o il segnale audio.",
    "fr": "Il s’agit de calculs hors ligne. Aucun événement aujourd’hui signifie aucun lever ou coucher à cette date locale ; l’aperçu ne change ni l’heure réelle ni le signal audio.",
    "de": "Es sind Offline-Berechnungen. Kein Ereignis heute bedeutet keinen Auf- oder Untergang an diesem lokalen Datum; Vorschauen ändern weder die reale Ortszeit noch das Audiosignal.",
    "es": "Son cálculos astronómicos sin conexión. Sin evento hoy significa que no hay salida o puesta en esa fecha local; la vista previa no cambia la hora real ni el audio.",
    "ja": "天文計算はオフラインです。「今日のイベントなし」は、その現地日付に月の出または月の入りがないことを示します。プレビューは実際の現地時刻や音声信号を変えません。"
  },
  "Explore estimated ISS motion, local sighting opportunities, station facts and educational time-dilation comparisons.": {
    "it": "Esplora il moto stimato della ISS, le occasioni di avvistamento locale, informazioni sulla stazione e confronti didattici sulla dilatazione del tempo.",
    "fr": "Explorez le mouvement estimé de l’ISS, les occasions d’observation, la station et des comparaisons pédagogiques de dilatation du temps.",
    "de": "Erkunde geschätzte ISS-Bewegung, lokale Sichtgelegenheiten, Stationswissen und lehrreiche Zeitdilatationsvergleiche.",
    "es": "Explora el movimiento estimado de la ISS, oportunidades locales de observación, datos de la estación y comparaciones educativas de dilatación temporal.",
    "ja": "ISS の推定運動、観測地点での通過機会、宇宙ステーションの情報、時間の遅れを学ぶ比較を確認します。"
  },
  "Tracking places an estimated ISS position on an orbit and ground track. The data status is part of the observation: fresh orbital elements, cached prediction and a position-only report do not provide the same information. Their age matters when interpreting the display.": {
    "it": "Tracking colloca una posizione stimata della ISS su orbita e traccia al suolo. Lo stato dei dati fa parte dell’osservazione: elementi freschi, previsione in cache e sola posizione non offrono le stesse informazioni. Conta anche la loro età.",
    "fr": "Le suivi place une position estimée sur l’orbite et la trace au sol. Le statut des données compte : éléments récents, prévision en cache et simple position n’offrent pas la même information. Leur âge importe.",
    "de": "Tracking ordnet die geschätzte Position einer Umlaufbahn und Bodenspur zu. Der Datenstatus gehört dazu: frische Bahnelemente, Cache-Prognose und reine Positionsmeldung liefern unterschiedliche Informationen. Auch ihr Alter zählt.",
    "es": "El seguimiento sitúa la posición estimada en una órbita y trayectoria terrestre. El estado de los datos importa: elementos recientes, predicción en caché y posición aislada no aportan lo mismo. Su antigüedad también cuenta.",
    "ja": "追跡画面は推定位置を軌道と地上軌跡に配置します。新しい軌道要素、キャッシュによる予測、位置のみの報告では得られる情報が異なり、データの経過時間も判断に必要です。"
  },
  "Passes translates the orbit into encounters above your city, with a sky plot for direction and elevation. The other tabs describe the station and introduce time-dilation comparisons. An orbit preview is a teaching tool; it does not change the live time reference.": {
    "it": "Passaggi traduce l’orbita in incontri sopra la tua città, con un grafico per direzione ed elevazione. Le altre schede raccontano la stazione e la dilatazione del tempo. L’anteprima orbitale è didattica e non modifica il riferimento orario dal vivo.",
    "fr": "Passages transforme l’orbite en rencontres au-dessus de votre ville, avec direction et élévation. Les autres onglets présentent station et dilatation du temps. L’aperçu orbital est pédagogique et ne change pas la référence réelle.",
    "de": "Passagen übersetzt die Bahn in Begegnungen über deiner Stadt mit Richtung und Höhe. Weitere Tabs erklären Station und Zeitdilatation. Eine Bahnvorschau ist ein Lernwerkzeug und ändert die aktuelle Zeitreferenz nicht.",
    "es": "Pasos convierte la órbita en encuentros sobre tu ciudad, con dirección y elevación. Otras pestañas explican la estación y la dilatación temporal. La vista orbital es educativa y no cambia la referencia en vivo.",
    "ja": "通過画面では軌道を都市の上空での出会いに変換し、方向と仰角を示します。他のタブでは機体や時間の遅れを解説します。軌道プレビューは学習用で、実時刻の基準は変えません。"
  },
  "Choose a predicted pass, inspect where it rises and its highest point, then check the data age. A geometrically promising pass can still be hidden by clouds, buildings or local terrain.": {
    "it": "Scegli un passaggio previsto, guarda da dove sorge e il punto più alto, poi controlla l’età dei dati. Anche un passaggio favorevole può essere nascosto da nubi, edifici o terreno.",
    "fr": "Choisissez un passage prévu, examinez sa direction de lever et son sommet, puis l’âge des données. Nuages, bâtiments ou relief peuvent masquer un passage favorable.",
    "de": "Wähle eine vorhergesagte Passage, prüfe Aufgangsrichtung und höchsten Punkt sowie das Datenalter. Wolken, Gebäude oder Gelände können auch günstige Passagen verdecken.",
    "es": "Elige un paso previsto, observa por dónde aparece y su punto más alto, y comprueba la antigüedad de los datos. Nubes, edificios o relieve pueden ocultarlo.",
    "ja": "予測された通過の出現方向、最高点、データの古さを確認します。軌道上は好条件でも、雲、建物、地形で見えない場合があります。"
  },
  "Predictions use orbital elements, not onboard telemetry. Old data limits forecasts; visibility excludes weather and obstacles. Public orbit requests occur while this section is open.": {
    "it": "Le previsioni usano elementi orbitali, non telemetria di bordo. Dati vecchi limitano le stime; la visibilità non include meteo e ostacoli. Le richieste pubbliche avvengono mentre la sezione è aperta.",
    "fr": "Les prévisions utilisent des éléments orbitaux, pas la télémétrie de bord. Les données anciennes limitent les calculs ; météo et obstacles sont exclus. Les requêtes publiques ont lieu quand la section est ouverte.",
    "de": "Prognosen verwenden Bahnelemente statt Bordtelemetrie. Alte Daten begrenzen sie; Wetter und Hindernisse fehlen im Sichtmodell. Öffentliche Bahndaten werden bei geöffneter Ansicht angefordert.",
    "es": "Las predicciones usan elementos orbitales, no telemetría a bordo. Los datos antiguos limitan el pronóstico; la visibilidad excluye clima y obstáculos. Las peticiones públicas ocurren con la sección abierta.",
    "ja": "予測は軌道要素に基づき、船内テレメトリーではありません。古いデータでは予測が制限され、天候や障害物は考慮しません。この画面を開いている間に公開データへ問い合わせます。"
  },
  "Discover how old the light reaching Earth is, with date-dependent travel times from the Moon, Sun and planets.": {
    "it": "Scopri quanto è vecchia la luce che raggiunge la Terra, con tempi di viaggio variabili per data dalla Luna, dal Sole e dai pianeti.",
    "fr": "Découvrez l’âge de la lumière reçue sur Terre avec des durées variables selon la date depuis la Lune, le Soleil et les planètes.",
    "de": "Entdecke das Alter des ankommenden Lichts mit datumsabhängigen Laufzeiten von Mond, Sonne und Planeten.",
    "es": "Descubre la edad de la luz que llega a la Tierra, con tiempos dependientes de la fecha desde la Luna, el Sol y los planetas.",
    "ja": "月、太陽、惑星から地球へ届く光がどれだけ前のものか、日時によって変わる所要時間から学びます。"
  },
  "Seeing a celestial body means receiving light that has already travelled. This section puts departure or reflection beside arrival at Earth, turning a distance into a delay. Choosing another date can change that delay because the bodies move.": {
    "it": "Vedere un astro significa ricevere luce che ha già viaggiato. Questa sezione affianca partenza o riflessione e arrivo sulla Terra, trasformando una distanza in un ritardo. Cambiare data può modificarlo, perché i corpi si muovono.",
    "fr": "Voir un astre signifie recevoir une lumière ayant déjà voyagé. La section rapproche émission ou réflexion et arrivée sur Terre, transformant distance en retard. Une autre date peut le modifier, car les corps bougent.",
    "de": "Ein Himmelskörper wird durch bereits gereistes Licht sichtbar. Abreise oder Reflexion steht neben Ankunft auf der Erde: Entfernung wird zu Verzögerung. Andere Daten ändern sie, weil sich die Körper bewegen.",
    "es": "Ver un astro es recibir luz que ya ha viajado. Esta sección compara emisión o reflexión con llegada a la Tierra y convierte distancia en retraso. La fecha puede cambiarlo porque los cuerpos se mueven.",
    "ja": "天体を見ることは、すでに旅をした光を受け取ることです。放射または反射と地球への到着を並べ、距離を遅れとして表します。天体が動くため、日時を変えると遅れも変わります。"
  },
  "The travelling pulse replays one fixed observation. Real-time speed lets you feel the wait, while accelerated playback makes longer planetary journeys easier to follow. The drawing compresses space; the clocks carry the numerical meaning. The science panel explains what each distance includes.": {
    "it": "L’impulso riproduce una singola osservazione fissa. La velocità reale fa percepire l’attesa; l’accelerazione rende leggibili i viaggi planetari più lunghi. Il disegno comprime lo spazio e gli orologi ne portano il significato numerico. Il pannello scientifico chiarisce ogni distanza.",
    "fr": "L’impulsion rejoue une observation fixe. Le temps réel fait sentir l’attente ; l’accélération rend lisibles les longs voyages. Le dessin comprime l’espace et les horloges portent les valeurs. Le panneau scientifique explique les distances.",
    "de": "Der Impuls spielt eine feste Beobachtung nach. Echtzeit vermittelt das Warten, Beschleunigung macht lange Planetenreisen überschaubar. Die Zeichnung komprimiert Raum; die Uhren tragen die Zahlen. Der Wissenschaftsbereich erklärt die Entfernungen.",
    "es": "El pulso reproduce una observación fija. El tiempo real permite sentir la espera y la aceleración facilita los viajes largos. El dibujo comprime el espacio; los relojes aportan el significado numérico. El panel científico explica las distancias.",
    "ja": "光のパルスは一つの固定した観測を再生します。実時間では待ち時間を体感し、早送りでは長い惑星間の旅を追えます。図の空間は圧縮され、正確な意味は時計と科学解説で示します。"
  },
  "Start with the Sun and compare its emission clock with reception at Earth. Then choose a planet and jump six months: its changing geometry can produce a different light-time delay.": {
    "it": "Inizia dal Sole e confronta l’orologio di emissione con la ricezione sulla Terra. Scegli poi un pianeta e salta sei mesi: la diversa geometria può produrre un ritardo differente.",
    "fr": "Commencez par le Soleil et comparez émission et réception terrestre. Choisissez ensuite une planète et avancez de six mois : la géométrie peut changer le délai lumineux.",
    "de": "Beginne mit der Sonne und vergleiche Emission mit Empfang. Wähle dann einen Planeten und springe sechs Monate weiter: Die andere Geometrie kann die Lichtlaufzeit ändern.",
    "es": "Empieza con el Sol y compara emisión y recepción terrestre. Elige después un planeta y salta seis meses: la geometría puede cambiar el retraso de la luz.",
    "ja": "太陽の放射時計と地球の受信時計を比べてみます。次に惑星を選んで六か月進めると、配置の変化で光の所要時間が変わることがあります。"
  },
  "Distances are calculated offline and the drawing is compressed. Planet and Moon values cover the reflected light’s final leg to Earth, not its earlier journey from the Sun.": {
    "it": "Le distanze sono calcolate offline e il disegno è compresso. Per pianeti e Luna si misura l’ultimo tratto della luce riflessa verso la Terra, non il precedente viaggio dal Sole.",
    "fr": "Les distances sont calculées hors ligne et le dessin est comprimé. Pour planètes et Lune, seule la dernière étape de lumière réfléchie vers la Terre est comptée, pas le trajet initial depuis le Soleil.",
    "de": "Entfernungen werden offline berechnet, die Zeichnung ist komprimiert. Bei Mond und Planeten zählt nur die letzte reflektierte Strecke zur Erde, nicht der frühere Weg von der Sonne.",
    "es": "Las distancias se calculan sin conexión y el dibujo está comprimido. Para Luna y planetas se mide el último tramo reflejado hacia la Tierra, no el trayecto previo desde el Sol.",
    "ja": "距離はオフライン計算で、図の縮尺は圧縮されています。月と惑星では反射光が地球に届く最後の区間を扱い、その前に太陽から届く区間は含みません。"
  },
  "Visit 96 documented historical moments, or keep personal memories, future countdowns and time capsules.": {
    "it": "Visita 96 momenti storici documentati o conserva ricordi personali, conti alla rovescia e capsule del tempo.",
    "fr": "Visitez 96 moments historiques documentés ou conservez souvenirs, comptes à rebours et capsules personnelles.",
    "de": "Besuche 96 belegte historische Momente oder bewahre Erinnerungen, Countdowns und Zeitkapseln.",
    "es": "Visita 96 momentos históricos documentados o guarda recuerdos, cuentas atrás y cápsulas personales.",
    "ja": "資料に基づく 96 の歴史的瞬間を訪ねたり、自分の思い出、カウントダウン、タイムカプセルを保存したりできます。"
  },
  "Historical journeys connect a dated event with a short story, an illustration and a source. Their elapsed counters respect the precision of the evidence: a documented calendar day is not presented as a known second. Exploring a moment reconstructs its clock without replacing the real present.": {
    "it": "I journey collegano un evento datato a un racconto, un’illustrazione e una fonte. I contatori rispettano la precisione delle prove: un giorno documentato non diventa un secondo conosciuto. Esplorare un momento ne ricostruisce l’orologio senza sostituire il presente reale.",
    "fr": "Les voyages relient un événement daté à un récit, une illustration et une source. Les compteurs respectent la précision disponible : un jour connu ne devient pas une seconde exacte. L’exploration reconstruit l’horloge sans remplacer le présent.",
    "de": "Die Reisen verbinden datierte Ereignisse mit Geschichte, Illustration und Quelle. Zähler respektieren die Belegpräzision: Ein bekannter Tag wird nicht zu einer bekannten Sekunde. Die Rekonstruktion ersetzt die reale Gegenwart nicht.",
    "es": "Los viajes unen un suceso fechado con relato, ilustración y fuente. Los contadores respetan la precisión: un día documentado no se convierte en un segundo conocido. Explorar reconstruye su reloj sin sustituir el presente real.",
    "ja": "歴史の旅は日付付きの出来事を文章、図、出典で結び付けます。日付しか分からない出来事を秒単位で既知とは扱いません。当時の時計を再構成しても実際の現在は変わりません。"
  },
  "The personal side uses the same relationship between an instant and its meaning. Memories look back, countdowns look ahead and capsules keep a message unrevealed until its chosen date. These records belong to this device, so include them in a full app-data backup.": {
    "it": "La parte personale usa lo stesso legame fra istante e significato. I ricordi guardano indietro, i countdown avanti e le capsule tengono nascosto un messaggio fino alla data scelta. Sono dati di questo dispositivo: includili nel backup completo dell’app.",
    "fr": "La partie personnelle relie aussi un instant à son sens. Souvenirs vers le passé, comptes à rebours vers l’avenir, capsules masquant un message jusqu’à sa date. Ces données locales doivent figurer dans une sauvegarde complète.",
    "de": "Auch persönliche Einträge verbinden Moment und Bedeutung. Erinnerungen blicken zurück, Countdowns voraus und Kapseln verbergen Nachrichten bis zum Termin. Die Daten gehören diesem Gerät und sollten in die vollständige Sicherung.",
    "es": "La parte personal relaciona un instante con su significado. Los recuerdos miran atrás, las cuentas adelante y las cápsulas ocultan un mensaje hasta su fecha. Son datos locales que debes incluir en una copia completa.",
    "ja": "個人の記録も瞬間と意味を結び付けます。思い出は過去、カウントダウンは未来を示し、カプセルは指定日まで文章を隠します。端末内のデータなので、完全バックアップに含めてください。"
  },
  "Explore an episode from relativity or spaceflight, follow its source, then return to now. For a personal milestone, create a countdown rather than adding it to the documented historical archive.": {
    "it": "Esplora un episodio sulla relatività o sullo spazio, consulta la fonte e torna al presente. Per una ricorrenza personale crea un countdown, anziché inserirla nell’archivio storico documentato.",
    "fr": "Explorez un épisode de relativité ou d’espace, consultez sa source et revenez au présent. Pour un jalon personnel, créez un compte à rebours plutôt qu’une entrée dans l’archive historique.",
    "de": "Erkunde Relativität oder Raumfahrt, lies die Quelle und kehre zurück. Erstelle für einen persönlichen Termin einen Countdown statt eines Eintrags im belegten Geschichtsarchiv.",
    "es": "Explora un episodio de relatividad o del espacio, consulta su fuente y vuelve al presente. Para un hito propio, crea una cuenta atrás en lugar de añadirlo al archivo histórico documentado.",
    "ja": "相対性理論や宇宙飛行の出来事を訪ね、出典を確認して現在へ戻ります。個人的な記念日には、歴史資料の一覧ではなくカウントダウンを作成します。"
  },
  "Day-only events do not invent an exact historical hour. Capsules are local and unencrypted. Leaving a historical reconstruction ends the preview and never changes audio time.": {
    "it": "Gli eventi noti solo per giorno non inventano un’ora esatta. Le capsule sono locali e non cifrate. Uscire dalla ricostruzione chiude l’anteprima e non cambia mai l’ora audio.",
    "fr": "Les événements connus au jour près n’inventent pas d’heure précise. Les capsules sont locales et non chiffrées. Quitter la reconstruction termine l’aperçu sans changer l’audio.",
    "de": "Nur tagesgenaue Ereignisse erfinden keine Uhrzeit. Kapseln sind lokal und unverschlüsselt. Verlassen beendet die Rekonstruktion, ohne die Audiozeit zu ändern.",
    "es": "Los eventos conocidos solo por día no inventan una hora exacta. Las cápsulas son locales y no están cifradas. Salir de la reconstrucción termina la vista previa sin cambiar el audio.",
    "ja": "日付だけが分かる出来事に正確な時刻を作りません。カプセルは端末内に暗号化せず保存します。再構成を離れるとプレビューが終わり、音声の時刻は変わりません。"
  },
  "Enjoy a cinematic tribute to Back to the Future using familiar movie dates and playful time circuits.": {
    "it": "Goditi un omaggio cinematografico a Ritorno al futuro, con le date del film e circuiti temporali giocosi.",
    "fr": "Profitez d’un hommage à Retour vers le futur, avec les dates du film et des circuits temporels ludiques.",
    "de": "Genieße eine filmische Hommage an Zurück in die Zukunft mit bekannten Filmdaten und spielerischen Zeitschaltkreisen.",
    "es": "Disfruta un homenaje cinematográfico a Regreso al futuro, con fechas del film y circuitos temporales lúdicos.",
    "ja": "映画『バック・トゥ・ザ・フューチャー』の有名な日付とタイムサーキットを使った遊び心のあるオマージュです。"
  },
  "This is the playful branch of Time Machine: the familiar destination, present and last-departed displays become a small cinematic set. The five film dates give the elapsed counters a story, while the 88 mph sequence changes the preview display.": {
    "it": "È il ramo giocoso della Macchina del tempo: destinazione, presente e ultima partenza diventano un piccolo set cinematografico. Le cinque date danno una storia ai contatori e la sequenza a 88 mph cambia il display di anteprima.",
    "fr": "C’est la branche ludique de Time Machine : destination, présent et dernier départ forment un petit décor. Les cinq dates racontent les compteurs et la séquence à 88 mph change l’aperçu.",
    "de": "Dies ist der spielerische Zweig der Zeitmaschine: Ziel, Gegenwart und letzte Abfahrt bilden ein Filmset. Fünf Filmdaten erzählen die Zähler, die 88-mph-Sequenz verändert die Vorschau.",
    "es": "Es la rama lúdica de la máquina del tiempo: destino, presente y última salida forman un pequeño decorado. Cinco fechas dan historia a los contadores y la secuencia de 88 mph cambia la vista previa.",
    "ja": "タイムマシンの遊び心のある分岐です。目的地・現在・最後の出発の表示が映画のセットになり、五つの日付と 88 mph の演出でプレビューが切り替わります。"
  },
  "The visual trip is deliberately separate from the timing engine. You can enjoy the sequence and explore its destination while the real reference continues underneath. Returning to the present restores the normal display; no operating-system or watch setting travels with it.": {
    "it": "Il viaggio visivo resta separato dal motore orario. Puoi goderti la sequenza ed esplorare la destinazione mentre il vero riferimento continua a scorrere. Tornare al presente ripristina il display normale; nessuna impostazione di sistema o dell’orologio viaggia con te.",
    "fr": "Le voyage visuel reste séparé du moteur horaire. Profitez de la séquence et de la destination pendant que la vraie référence avance. Revenir au présent restaure l’affichage ; aucun réglage système ou de montre ne voyage.",
    "de": "Die visuelle Reise bleibt vom Zeitmotor getrennt. Während du Ziel und Sequenz erkundest, läuft die reale Referenz weiter. Zurück zur Gegenwart stellt die Anzeige wieder her; System- und Uhreinstellungen reisen nicht mit.",
    "es": "El viaje visual está separado del motor horario. Puedes explorar el destino mientras la referencia real sigue avanzando. Volver al presente restaura la pantalla; no viaja ningún ajuste del sistema o del reloj.",
    "ja": "映像の旅は時刻生成から独立しています。演出や目的地を楽しむ間も実際の基準は進み続けます。現在へ戻れば通常表示になり、OS や時計の設定は変わりません。"
  },
  "Choose the 2015 destination, start the sequence and compare the movie date with the real elapsed counter. Return to the present when the cinematic detour is over.": {
    "it": "Scegli la destinazione del 2015, avvia la sequenza e confronta la data del film con il contatore reale del tempo trascorso. Torna al presente quando la parentesi cinematografica è finita.",
    "fr": "Choisissez 2015, lancez la séquence et comparez la date du film au temps réellement écoulé. Revenez au présent après ce détour cinématographique.",
    "de": "Wähle 2015, starte die Sequenz und vergleiche das Filmdatum mit der real verstrichenen Zeit. Kehre nach dem filmischen Abstecher zurück.",
    "es": "Elige el destino de 2015, inicia la secuencia y compara la fecha del film con el tiempo real transcurrido. Vuelve al presente al terminar el desvío cinematográfico.",
    "ja": "2015 年の目的地を選んで演出を開始し、映画の日付と実際の経過時間を比べます。寄り道が終わったら現在へ戻ります。"
  },
  "This is a fan-made fictional experience. It does not simulate physical time travel or change your watch, computer clock or stored historical observations.": {
    "it": "È un’esperienza immaginaria creata da fan. Non simula viaggi temporali fisici e non modifica orologio, ora del computer o osservazioni storiche salvate.",
    "fr": "C’est une fiction créée par des fans. Elle ne simule pas de voyage temporel physique et ne modifie ni montre, ni horloge système, ni observations enregistrées.",
    "de": "Es ist ein fiktives Fan-Erlebnis, keine physikalische Zeitreise. Uhr, Rechnerzeit und gespeicherte Beobachtungen werden nicht geändert.",
    "es": "Es una ficción creada por fans. No simula viajes temporales físicos ni modifica tu reloj, hora del equipo u observaciones guardadas.",
    "ja": "ファンによる架空の体験です。物理的な時間旅行のシミュレーションではなく、時計、コンピューター時刻、保存した観測記録も変更しません。"
  },
  "Configure audio output, signal waveform, time reference, interface language and visual theme.": {
    "it": "Configura uscita audio, forma d’onda, riferimento orario, lingua dell’interfaccia e tema visivo.",
    "fr": "Configurez sortie audio, forme d’onde, référence horaire, langue et thème.",
    "de": "Konfiguriere Audioausgang, Wellenform, Zeitreferenz, Sprache und Farbschema.",
    "es": "Configura salida de audio, forma de onda, referencia horaria, idioma y tema visual.",
    "ja": "音声出力、波形、基準時刻、インターフェース言語、テーマを設定します。"
  },
  "Settings separates the physical output path from the time reference. The selected device and waveform determine what leaves the computer; NTP information describes how the app checked its clock. Network uncertainty and audio latency are different parts of that path.": {
    "it": "Le Impostazioni distinguono il percorso fisico dell’audio dal riferimento orario. Dispositivo e forma d’onda determinano ciò che esce dal computer; NTP descrive come l’app verifica l’orologio. Incertezza di rete e latenza audio sono parti diverse del percorso.",
    "fr": "Les réglages séparent la sortie physique de la référence horaire. Appareil et forme d’onde déterminent ce qui sort ; NTP explique la vérification de l’heure. Incertitude réseau et latence audio sont distinctes.",
    "de": "Einstellungen trennt Audioausgabe und Zeitreferenz. Gerät und Wellenform bestimmen die Ausgabe, NTP beschreibt die Zeitprüfung. Netzwerkunsicherheit und Audiolatenz gehören zu verschiedenen Abschnitten.",
    "es": "Ajustes separa la ruta física del audio de la referencia. Dispositivo y onda determinan la salida; NTP describe la comprobación del reloj. Incertidumbre de red y latencia de audio son partes distintas.",
    "ja": "設定では音声の物理的な出力経路と基準時刻を分けます。機器と波形は出力を、NTP 情報は時刻の確認方法を示します。ネットワークの不確かさと音声遅延は別の要素です。"
  },
  "The low-volume output test helps identify the selected channel before a transmission. Manual advance is for a measured correction, not a general way to improve reception. Language and theme change the interface immediately while keeping your personal notes, saved profiles and active audio independent.": {
    "it": "Il test a basso volume identifica il canale prima della trasmissione. L’anticipo manuale serve per una correzione misurata, non per migliorare genericamente la ricezione. Lingua e tema cambiano subito l’interfaccia lasciando indipendenti note personali, profili e audio attivo.",
    "fr": "Le test à faible volume identifie le canal avant transmission. L’avance manuelle sert à une correction mesurée, pas à améliorer le signal en général. Langue et thème changent sans toucher aux notes, profils ni à l’audio actif.",
    "de": "Der leise Ausgangstest identifiziert den Kanal vorab. Manueller Vorlauf dient einer gemessenen Korrektur, nicht pauschal besserem Empfang. Sprache und Thema ändern sich unabhängig von Notizen, Profilen und laufendem Audio.",
    "es": "La prueba a bajo volumen identifica el canal antes de transmitir. El adelanto manual sirve para una corrección medida, no para mejorar la recepción en general. Idioma y tema cambian sin alterar notas, perfiles ni audio activo.",
    "ja": "小音量テストで送信前に出力チャンネルを確認できます。手動の先行補正は測定に基づく調整で、受信改善の万能設定ではありません。言語とテーマはメモ、プロフィール、送信音声から独立して変わります。"
  },
  "If you cannot hear the output test, verify the device, channel and operating-system volume before changing station settings. Leave manual advance at zero until you have a reason to measure it.": {
    "it": "Se non senti il test, verifica dispositivo, canale e volume del sistema prima di modificare la stazione. Lascia l’anticipo manuale a zero finché non hai un motivo per misurarlo.",
    "fr": "Si le test reste muet, vérifiez appareil, canal et volume système avant la station. Gardez l’avance manuelle à zéro tant qu’aucune mesure ne la justifie.",
    "de": "Ist der Test unhörbar, prüfe Gerät, Kanal und Systemlautstärke vor den Senderparametern. Lass den Vorlauf auf null, solange keine Messung ihn begründet.",
    "es": "Si no oyes la prueba, revisa dispositivo, canal y volumen del sistema antes de la estación. Mantén el adelanto en cero sin una razón para medirlo.",
    "ja": "テスト音が聞こえなければ、送信局を変える前に機器、チャンネル、OS の音量を確認します。測定すべき理由がなければ先行補正はゼロのままにします。"
  },
  "NTP corrects time inside the app, not the system clock. Bluetooth can add latency or filtering. Some controls are locked during transmission; theme and language changes preserve audio.": {
    "it": "NTP corregge l’ora dentro l’app, non quella di sistema. Bluetooth può aggiungere latenza o filtri. Alcuni comandi si bloccano durante la trasmissione; tema e lingua preservano l’audio.",
    "fr": "NTP corrige l’heure dans l’app, pas celle du système. Bluetooth peut ajouter délai ou filtrage. Certaines commandes sont verrouillées pendant la transmission ; thème et langue préservent l’audio.",
    "de": "NTP korrigiert die App-Zeit statt der Systemuhr. Bluetooth kann verzögern oder filtern. Einige Regler sind beim Senden gesperrt; Sprache und Thema lassen Audio weiterlaufen.",
    "es": "NTP corrige la hora interna, no la del sistema. Bluetooth puede añadir retraso o filtros. Algunos controles se bloquean al transmitir; tema e idioma preservan el audio.",
    "ja": "NTP はアプリ内の時刻を補正し、OS 時刻は変えません。Bluetooth は遅延やフィルタの原因になります。一部の操作は送信中に固定されますが、言語とテーマの変更で音声は止まりません。"
  },
  "Understand failed reception, missing devices and offline time before changing several settings at once.": {
    "it": "Comprendi ricezioni fallite, dispositivi mancanti e ora offline prima di cambiare molte impostazioni insieme.",
    "fr": "Comprenez les échecs, appareils absents et l’heure hors ligne avant de changer plusieurs réglages.",
    "de": "Verstehe Empfangsfehler, fehlende Geräte und Offline-Zeit, bevor du mehrere Einstellungen zugleich änderst.",
    "es": "Entiende fallos de recepción, dispositivos ausentes y hora sin conexión antes de cambiar muchos ajustes juntos.",
    "ja": "複数の設定を一度に変える前に、受信失敗、機器の未検出、オフライン時刻を理解します。"
  },
  "A strong-looking indication is not the same as a decoded time message. L3 can coexist with ERR, and the app cannot inspect the watch’s receiver. Begin with compatibility and the physical setup before treating the outcome as a software problem.": {
    "it": "Un’indicazione forte non equivale a un messaggio orario decodificato. L3 può convivere con ERR e l’app non può ispezionare il ricevitore dell’orologio. Parti dalla compatibilità e dalla disposizione fisica prima di attribuire l’esito al software.",
    "fr": "Une indication forte n’équivaut pas à un message décodé. L3 peut accompagner ERR et l’app n’inspecte pas le récepteur. Commencez par compatibilité et disposition physique avant d’incriminer le logiciel.",
    "de": "Eine starke Anzeige ist noch keine decodierte Zeitnachricht. L3 kann mit ERR auftreten, die App kann den Empfänger nicht prüfen. Beginne mit Kompatibilität und Aufbau statt den Ausgang sofort der Software zuzuschreiben.",
    "es": "Una indicación fuerte no equivale a un mensaje decodificado. L3 puede coexistir con ERR y la app no inspecciona el receptor. Revisa compatibilidad y colocación antes de atribuir el resultado al software.",
    "ja": "強い受信表示があっても時刻メッセージの復号成功とは限りません。L3 と ERR は同時に起こり得て、アプリは時計の受信機を調べられません。まず対応条件と実際の配置を確認します。"
  },
  "Use a consistent baseline to avoid changing several causes at once. Check city and DST settings, compare positions and keep a note of the output path. Full pauses provide an experimental DCF77 variant. If the app reports an interruption, start a fresh attempt after checking the reference.": {
    "it": "Usa una base coerente per non cambiare più cause insieme. Controlla città e DST, confronta le posizioni e annota il percorso audio. Le pause complete sono una variante sperimentale DCF77. Dopo un’interruzione, verifica il riferimento e avvia un nuovo tentativo.",
    "fr": "Gardez une base constante pour isoler les changements. Vérifiez ville et DST, comparez les positions et notez la sortie audio. Les pauses complètes sont une variante DCF77 expérimentale. Après interruption, vérifiez l’heure et recommencez.",
    "de": "Nutze eine konstante Basis, um Ursachen einzeln zu ändern. Prüfe Stadt und Sommerzeit, vergleiche Positionen und notiere den Audioweg. Volle Pausen sind eine experimentelle DCF77-Variante. Nach Unterbrechung Zeit prüfen und neu starten.",
    "es": "Mantén una base constante para aislar cambios. Revisa ciudad y DST, compara posiciones y anota la salida. Las pausas completas son una variante DCF77 experimental. Tras una interrupción, verifica la referencia e inicia otro intento.",
    "ja": "一定の基準条件を保ち、都市や夏時間を確認し、位置と音声経路を記録します。完全な無音区間は DCF77 の実験的な選択肢です。中断後は基準時刻を確認して新しい試行を始めます。"
  },
  "For repeated L3 then ERR, keep the station fixed and compare standard audio with full pauses. Record both actual outcomes and their placement notes, then inspect them together in Reception Lab.": {
    "it": "Per L3 seguito ripetutamente da ERR, mantieni fissa la stazione e confronta audio standard e pause complete. Registra esiti e note di posizione e osservali insieme nel Laboratorio.",
    "fr": "Pour L3 suivi d’ERR, gardez la station et comparez audio standard et pauses complètes. Notez résultats et positions, puis examinez-les au laboratoire.",
    "de": "Bei wiederholtem L3 mit ERR behältst du den Sender bei und vergleichst Standardaudio mit vollen Pausen. Speichere Ergebnisse samt Position und prüfe sie gemeinsam im Labor.",
    "es": "Ante L3 seguido de ERR, conserva la estación y compara audio estándar con pausas completas. Registra resultados y colocación para revisarlos juntos en el laboratorio.",
    "ja": "L3 の後に ERR が続くなら、送信局を固定して標準音声と完全な無音区間を比較します。実際の結果と置き方を残し、受信ラボで並べて見ます。"
  },
  "The app cannot inspect reception on the watch. Record ERR or leave the result unverified. Test one change at a time and use Reception Lab to compare actual outcomes.": {
    "it": "L’app non può leggere la ricezione sull’orologio. Registra ERR o lascia l’esito non verificato. Prova una modifica alla volta e confronta gli esiti reali nel Laboratorio.",
    "fr": "L’app ne lit pas la réception sur la montre. Notez ERR ou laissez non vérifié. Testez un seul changement et comparez les vrais résultats au laboratoire.",
    "de": "Die App kann den Uhrenempfang nicht auslesen. Trage ERR ein oder lasse ungeprüft. Teste eine Änderung und vergleiche beobachtete Ergebnisse im Labor.",
    "es": "La app no puede leer la recepción del reloj. Registra ERR o deja Sin verificar. Prueba un cambio cada vez y compara resultados reales en el laboratorio.",
    "ja": "時計の受信状態はアプリから読み取れません。ERR または未確認として記録し、変更は一つずつ試して実際の結果を受信ラボで比べてください。"
  },
  "Understand local storage, network use and what to preserve before replacing a computer or clearing app data.": {
    "it": "Comprendi dati locali, uso della rete e cosa conservare prima di cambiare computer o cancellare i dati dell’app.",
    "fr": "Comprenez stockage local, réseau et sauvegardes avant de changer d’ordinateur ou d’effacer les données.",
    "de": "Verstehe lokale Daten, Netzwerknutzung und Sicherung vor Rechnerwechsel oder Löschen der App-Daten.",
    "es": "Comprende el almacenamiento local, la red y qué conservar antes de cambiar de equipo o borrar datos.",
    "ja": "コンピューターの移行やデータ消去の前に、保存場所、ネットワーク利用、残すべき情報を確認します。"
  },
  "The app’s personal records live in its separate data directory, not inside the executable. Replacing a build normally keeps that directory, while clearing application data removes the records stored there. A useful backup therefore preserves the data folder as well as the app itself.": {
    "it": "I dati personali vivono in una cartella separata, non dentro l’eseguibile. Sostituire una build normalmente la conserva, mentre cancellare i dati applicativi elimina i record. Un backup utile deve quindi conservare la cartella dati oltre all’app.",
    "fr": "Les données personnelles résident dans un dossier séparé de l’exécutable. Remplacer une version le conserve normalement ; effacer les données supprime les enregistrements. Une sauvegarde doit donc préserver ce dossier et l’app.",
    "de": "Persönliche Daten liegen außerhalb der Programmdatei. Ein Build-Wechsel erhält den Ordner normalerweise, das Löschen von App-Daten entfernt die Einträge. Eine Sicherung muss deshalb Datenordner und App bewahren.",
    "es": "Los datos personales viven fuera del ejecutable. Sustituir una versión normalmente los conserva; borrar datos elimina los registros. Una copia útil debe guardar la carpeta de datos además de la app.",
    "ja": "個人の記録は実行ファイルとは別のデータフォルダーに保存します。通常はアプリの入れ替えで残りますが、アプリデータの消去では失われます。バックアップにはプログラムだけでなく、このフォルダーが必要です。"
  },
  "Network use has specific purposes: NTP checks the reference and ISS retrieves public orbital information. Local astronomy, the historical archive and your journals do not require a cloud account. Reference buttons open their external source sites only when you choose them.": {
    "it": "La rete ha scopi specifici: NTP verifica il riferimento e ISS recupera dati orbitali pubblici. Astronomia locale, archivio storico e diari non richiedono account cloud. I riferimenti aprono siti esterni solo quando li scegli.",
    "fr": "Le réseau a des buts précis : NTP vérifie l’heure et ISS récupère les orbites publiques. Astronomie locale, histoire et journaux n’exigent pas de cloud. Les références ouvrent leurs sites seulement sur votre demande.",
    "de": "Das Netzwerk erfüllt bestimmte Aufgaben: NTP prüft die Zeit, ISS lädt öffentliche Bahndaten. Lokale Astronomie, Archiv und Protokolle brauchen kein Cloud-Konto. Quellen öffnen externe Seiten nur auf deine Auswahl.",
    "es": "La red tiene fines concretos: NTP comprueba la hora e ISS obtiene órbitas públicas. Astronomía local, archivo y diarios no requieren cuenta en la nube. Las referencias abren sitios externos cuando las eliges.",
    "ja": "通信の用途は限定されています。NTP は時刻、ISS は公開軌道情報の取得に使います。ローカルの天文計算、歴史資料、日誌にクラウド登録は不要で、外部サイトは出典を選んだときだけ開きます。"
  },
  "Before moving to another computer, close the app and copy its full application data folder. Export the accuracy journal too if you want a readable JSON or spreadsheet copy, but do not treat it as a backup of profiles, capsules and reception history.": {
    "it": "Prima di trasferirti su un altro computer, chiudi l’app e copia l’intera cartella dei dati. Esporta anche il diario della precisione se vuoi un JSON leggibile o un foglio di calcolo, ma non usarlo come backup di profili, capsule e storico ricezioni.",
    "fr": "Avant de changer d’ordinateur, fermez l’app et copiez tout le dossier de données. Exportez aussi la précision pour un JSON ou tableur lisible, sans le considérer comme sauvegarde des profils, capsules et réceptions.",
    "de": "Schließe vor dem Rechnerwechsel die App und kopiere den kompletten Datenordner. Exportiere das Genauigkeitsprotokoll zusätzlich als JSON oder Tabelle, aber nicht als Ersatz für Profile, Kapseln und Empfangsverlauf.",
    "es": "Antes de cambiar de equipo, cierra la app y copia toda su carpeta de datos. Exporta además la precisión como JSON o tabla legible, pero no lo trates como copia de perfiles, cápsulas e historial de recepción.",
    "ja": "移行前にアプリを閉じ、データフォルダー全体をコピーします。読みやすい JSON や表用に精度日誌も出力できますが、それだけではプロフィール、カプセル、受信履歴のバックアップにはなりません。"
  },
  "Accuracy exports do not back up the whole app and are not an import workflow. Personal capsules are unencrypted. Replacing the app does not normally clear its separate data folder.": {
    "it": "Le esportazioni della precisione non salvano tutta l’app e non sono un flusso di importazione. Le capsule non sono cifrate. Sostituire l’app normalmente non cancella la cartella dati separata.",
    "fr": "Les exports de précision ne sauvegardent pas toute l’app et n’offrent pas d’import. Les capsules ne sont pas chiffrées. Remplacer l’app n’efface normalement pas le dossier séparé.",
    "de": "Genauigkeitsexporte sichern nicht die ganze App und sind kein Importablauf. Kapseln sind unverschlüsselt. Der App-Austausch löscht normalerweise nicht den separaten Datenordner.",
    "es": "Las exportaciones de precisión no guardan toda la app ni ofrecen importación. Las cápsulas no están cifradas. Sustituir la app no suele borrar la carpeta independiente de datos.",
    "ja": "精度の出力はアプリ全体の保存やインポート機能ではありません。カプセルは暗号化されず、通常はアプリの入れ替えで別のデータフォルダーは消えません。"
  },
  "Guide": {
    "it": "Guida",
    "fr": "Guide",
    "de": "Handbuch",
    "es": "Guía",
    "ja": "ガイド"
  },
  "Settings and help": {
    "it": "Impostazioni e guida",
    "fr": "Réglages et aide",
    "de": "Einstellungen und Hilfe",
    "es": "Ajustes y ayuda",
    "ja": "設定とヘルプ"
  },
  "Application guide": {
    "it": "Guida all’app",
    "fr": "Guide de l’application",
    "de": "Handbuch zur App",
    "es": "Guía de la aplicación",
    "ja": "アプリのガイド"
  },
  "Purpose, controls and practical steps for every section.": {
    "it": "Scopri finalità, comandi ed esempi pratici di ogni sezione.",
    "fr": "Objectifs, commandes et exemples pratiques pour chaque section.",
    "de": "Zweck, Bedienung und praktische Beispiele für jede Ansicht.",
    "es": "Finalidad, controles y ejemplos prácticos de cada sección.",
    "ja": "各画面の目的、操作方法、具体例を紹介します。"
  },
  "APPLICATION MANUAL": {
    "it": "MANUALE APPLICATIVO",
    "fr": "MANUEL DE L’APPLICATION",
    "de": "APP-HANDBUCH",
    "es": "MANUAL DE LA APLICACIÓN",
    "ja": "アプリマニュアル"
  },
  "Contents": {
    "it": "Indice",
    "fr": "Sommaire",
    "de": "Inhalt",
    "es": "Índice",
    "ja": "目次"
  },
  "Manual chapters": {
    "it": "Capitoli del manuale",
    "fr": "Chapitres du manuel",
    "de": "Handbuchkapitel",
    "es": "Capítulos del manual",
    "ja": "マニュアルの章"
  },
  "For your selected station": {
    "it": "Per la stazione selezionata",
    "fr": "Pour la station sélectionnée",
    "de": "Für den gewählten Sender",
    "es": "Para la estación seleccionada",
    "ja": "選択中の送信局について"
  },
  "Station specification ↗": {
    "it": "Specifiche della stazione ↗",
    "fr": "Spécification de la station ↗",
    "de": "Senderspezifikation ↗",
    "es": "Especificación de la estación ↗",
    "ja": "送信局の仕様 ↗"
  },
  "Casio module manuals ↗": {
    "it": "Manuali dei moduli Casio ↗",
    "fr": "Manuels des modules Casio ↗",
    "de": "Casio-Modulhandbücher ↗",
    "es": "Manuales de módulos Casio ↗",
    "ja": "カシオのモジュール説明書 ↗"
  },
  "Clock Wave · inspiration ↗": {
    "it": "Clock Wave · ispirazione ↗",
    "fr": "Clock Wave · inspiration ↗",
    "de": "Clock Wave · Inspiration ↗",
    "es": "Clock Wave · inspiración ↗",
    "ja": "Clock Wave · 着想元 ↗"
  },
  "Open section →": {
    "it": "Apri sezione →",
    "fr": "Ouvrir la section →",
    "de": "Ansicht öffnen →",
    "es": "Abrir sección →",
    "ja": "画面を開く →"
  },
  "Purpose": {
    "it": "A cosa serve",
    "fr": "Objectif",
    "de": "Wozu dient es?",
    "es": "Para qué sirve",
    "ja": "この機能の目的"
  },
  "How it works": {
    "it": "Come funziona",
    "fr": "Comment ça marche",
    "de": "So funktioniert es",
    "es": "Cómo funciona",
    "ja": "機能の仕組み"
  },
  "Keep in mind": {
    "it": "Da tenere presente",
    "fr": "À retenir",
    "de": "Gut zu wissen",
    "es": "Ten en cuenta",
    "ja": "知っておきたいこと"
  },
  "A practical example": {
    "it": "Un esempio pratico",
    "fr": "Un exemple concret",
    "de": "Ein praktisches Beispiel",
    "es": "Un ejemplo práctico",
    "ja": "具体的な使い方"
  },
  "Start here": {
    "it": "Inizia da qui",
    "fr": "Pour commencer",
    "de": "Hier beginnen",
    "es": "Empieza aquí",
    "ja": "はじめに"
  },
  "Getting started": {
    "it": "Primo utilizzo",
    "fr": "Premiers pas",
    "de": "Erste Schritte",
    "es": "Primeros pasos",
    "ja": "使い始める"
  },
  "Troubleshooting": {
    "it": "Risoluzione dei problemi",
    "fr": "Dépannage",
    "de": "Probleme lösen",
    "es": "Solución de problemas",
    "ja": "困ったときは"
  },
  "Data & privacy": {
    "it": "Dati e privacy",
    "fr": "Données et confidentialité",
    "de": "Daten und Datenschutz",
    "es": "Datos y privacidad",
    "ja": "データとプライバシー"
  },
  "Enlarge the {0} screenshot": {
    "it": "Ingrandisci la schermata {0}",
    "fr": "Agrandir la capture {0}",
    "de": "Bildschirmfoto {0} vergrößern",
    "es": "Ampliar la captura de {0}",
    "ja": "{0} の画面を拡大"
  },
  "{0} screen": {
    "it": "Schermata {0}",
    "fr": "Écran {0}",
    "de": "Ansicht {0}",
    "es": "Pantalla {0}",
    "ja": "{0} の画面"
  },
  "Example screen · click to enlarge": {
    "it": "Schermata di esempio · clicca per ingrandire",
    "fr": "Écran d’exemple · cliquer pour agrandir",
    "de": "Beispielansicht · zum Vergrößern klicken",
    "es": "Pantalla de ejemplo · pulsa para ampliar",
    "ja": "サンプル画面・クリックで拡大"
  },
  "Screen preview": {
    "it": "Anteprima della schermata",
    "fr": "Aperçu de l’écran",
    "de": "Bildschirmvorschau",
    "es": "Vista previa de pantalla",
    "ja": "画面プレビュー"
  },
  "Close screenshot": {
    "it": "Chiudi schermata",
    "fr": "Fermer la capture",
    "de": "Bildschirmfoto schließen",
    "es": "Cerrar captura",
    "ja": "プレビューを閉じる"
  }
};
