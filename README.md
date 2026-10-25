# Atomic Clock Sync 1.3.0

App desktop in **JavaScript + Electron** per sincronizzare orologi Casio Multiband 6 simulando via audio i codici temporali di cinque stazioni. Interfaccia italiana, finestra fissa **1100 × 740**, schermate compatte senza scrolling. Implementazione indipendente ispirata a [Clock Wave](https://cw.rzapps.com/).

## App pronta per macOS

- `release/mac-arm64/Atomic Clock Sync.app`
- `release/Atomic Clock Sync-1.3.0-arm64-mac.zip`
- `release/SHA256SUMS.txt` per verificare l’integrità dell’archivio

Build per **Apple Silicon**, con firma locale ad hoc. Non richiede Node.js per essere usata. Puoi aprirla direttamente o copiarla in Applicazioni. Per la distribuzione su altri Mac servono firma Developer ID e notarizzazione.

## Pacchetto macOS e Windows portable

- `release/Atomic Clock Sync-1.3.0-macOS-Windows.zip`: archivio unico con la release macOS Apple Silicon e l’eseguibile Windows portable x64, istruzioni e checksum dei due pacchetti.
- `release/Atomic Clock Sync-1.3.0-windows-x64-portable.exe`: versione Windows standalone, senza installazione.

Il pacchetto Windows è stato generato da macOS e verificato nel contenuto e nell’architettura x64; l’avvio su un sistema Windows non è stato collaudato. Non ha firma digitale Windows.

## Stazioni

| Stazione | Posizione | Portante | Tono audio | Codice temporale | Città Casio di esempio |
| --- | --- | --- | --- | --- | --- |
| BPC | Shangqiu, Henan, Cina | 68,5 kHz | 13.700 Hz · 5ª armonica | Ora di Pechino, UTC+8; cicli di 20 s | BJS / HKG |
| JJY | Haganeyama, area di Fukuoka, Giappone | 60 kHz | 20.000 Hz · 3ª armonica | JST, UTC+9; cicli di 60 s | TYO |
| WWVB | Fort Collins, Colorado, USA | 60 kHz | 20.000 Hz · 3ª armonica | UTC; il Casio applica la città scelta | NYC / CHI / DEN / LAX |
| DCF77 | Mainflingen, Germania | 77,5 kHz | 15.500 Hz · 5ª armonica | CET / CEST; minuto successivo | ROM / BER / PAR |
| MSF | Anthorn, Cumbria, Regno Unito | 60 kHz | 20.000 Hz · 3ª armonica | GMT / BST; minuto successivo | LON |

La disponibilità delle città e la selezione automatica dell’antenna dipendono dal modulo del Casio: consulta il relativo manuale. Per sincronizzare un Casio impostato sull’Italia, **DCF77 rimane la scelta consigliata**. Scegliere una stazione di un’altra regione richiede una città compatibile sull’orologio e può cambiarne l’ora principale.

**BPC è sperimentale**: codifica binaria/quaternaria, marcatori e parità sono implementati e confrontati con registrazioni di riferimento, ma la compatibilità fisica con gli orologi non è verificata. Le cinque opzioni hanno codificatori e inviluppi propri: non cambiano soltanto nome e frequenza.

## Uso

1. Scegli la stazione nella schermata Sincronizza. L’app aggiorna fuso, data, tono, codice e città suggerite. In Italia usa DCF77 e una città europea prevista dal modulo.
2. Premi **Verifica ora** per il controllo NTP. Se la rete non è disponibile, l’app può usare l’ora del computer e lo indica esplicitamente.
3. Porta il lato con l’antenna del Casio, spesso quello delle ore 12, a circa **1–5 cm** dall’altoparlante integrato o da un auricolare **cablato**. Evita Bluetooth e AirPlay.
4. Avvia la ricezione manuale sul Casio seguendo il suo manuale; poi avvia la trasmissione nell’app. Parti con intensità al 30% e volume di sistema moderato. Il tono può essere udibile: tienilo lontano dalle orecchie.
5. Attendi 5–10 minuti senza muovere l’orologio. Sono disponibili sessioni di 5, 10 e 15 minuti completi; all’inizio può aggiungersi quasi un minuto di allineamento. BPC trasmette tre cicli di 20 secondi per minuto.
6. Controlla l’esito sul **display del Casio**. Usa **Il Casio ha ricevuto** per salvarne la conferma. L’app non può rilevare da sola la ricezione.

Durante la sessione stazione, dispositivo, forma d’onda, canale, profili e correzione temporale sono bloccati; l’intensità rimane regolabile e le sue modifiche vengono registrate nella prova. Esc interrompe la sessione. Le sessioni possono continuare mentre navighi nelle altre viste o usi altre app.

## Canali audio, orologi e prove

In **Sincronizza → Canale** scegli **Entrambi**, **Sinistro** o **Destro**. La scelta agisce sui campioni stereo senza attenuare il canale attivo. **Impostazioni → Test uscita** riproduce il tono a 440 Hz sullo stesso canale: usalo per verificare la corrispondenza fisica con gli altoparlanti. La scelta è bloccata durante una trasmissione.

In **I miei orologi** crea un profilo con nome, modello, città principale, posizione dell’orologio e volume del Mac annotato. **Salva impostazioni attuali** memorizza anche stazione, dispositivo, canale, intensità dell’app, forma audio, durata e correzione manuale. Città e volume del Mac sono promemoria manuali: l’app non li legge o modifica sul dispositivo. Selezionando un orologio dalla barra di Sincronizza ripristini la sua configurazione. Le regolazioni successive restano modifiche temporanee finché non salvi il profilo; l’eliminazione è annullabile e conserva le prove già registrate.

Una prova confermata con **GET** conserva per quel profilo anche l’ultima configurazione riuscita, ripristinabile dalla relativa scheda. Se l’intensità è stata modificata durante la prova, il ripristino usa il valore finale; la cronologia conserva valore iniziale, finale e modifiche. Se l’uscita salvata non è disponibile viene usata quella di sistema, con avviso e senza sovrascrivere il profilo salvato.

La **Cronologia** conserva tutte le prove, mostrandone otto per pagina. **Dettagli** presenta la copia della configurazione usata, orologio e annotazioni, canale, uscita audio, durata effettiva/prevista, sorgente temporale, correzione e incertezza NTP, intensità e motivo dell’arresto. Puoi assegnare **GET**, **ERR** o **Non verificato** anche a trasmissione conclusa e riutilizzare quella configurazione. Il timer terminato non equivale a ricezione riuscita. La chiusura della finestra durante una trasmissione la registra come interrotta.

Rinominare, modificare o eliminare un profilo non modifica i dati delle prove precedenti. Preferenze e cronologia della versione 1.1 vengono migrate: per le vecchie prove i campi non registrati restano indicati come tali. Non vengono inventati parametri audio retroattivi. L’archivio non elimina automaticamente le prove più vecchie; eventuali errori di salvataggio nello spazio locale sono segnalati.

## GW-6900: L3 seguito da ERR

Con Home City **ROM**, DCF77 è compatibile. **L3 misura l’intensità**, non certifica che il telegramma sia stato decodificato. **ERR** indica un tentativo fallito; l’esito positivo è **GET**. Il [manuale Casio 3179](https://www.casio.com/content/dam/casio/global/support/manuals/watches/pdf/31/3179/qw3179_EN.pdf) indica normalmente 2–7 minuti, talvolta fino a 14 minuti.

Se L3 diminuisce interrompendo l’audio, l’orologio reagisce alla trasmissione, ma questo non dimostra che riceva impulsi decodificabili. Per una nuova prova: **Impostazioni → Profilo audio → DCF77 · pause complete (sperimentale)**, sessione da 15 minuti, ROM e DST AUTO sul Casio, correzione manuale dell’uscita a 0. Avvia un nuovo tentativo di ricezione; non attendere oltre sul tentativo già concluso con ERR. Se fallisce, confronta con un auricolare cablato tenendo l’orologio lontano dal corpo del Mac.

I test decodificano tre minuti continui di campioni PCM per ciascun profilo sinusoidale, compreso il passaggio CEST/CET, verificando indipendentemente larghezza degli impulsi, marcatore, ora, data e parità. Non misurano la portante prodotta fisicamente dagli altoparlanti. Nella prova dell’utente è stata confermata una sincronizzazione del GW-6900 con DCF77 e gli altoparlanti integrati del Mac dopo l’aggiornamento 1.1.3. Volume e posizione esatti non sono stati registrati; il risultato non permette di attribuire il successo al solo profilo con pause complete, che resta sperimentale. I cali temporanei di L3 non impediscono necessariamente il completamento della ricezione.

## Interfaccia compatta

In **Impostazioni → Tema** sono disponibili il tema predefinito e otto palette ispirate ai riferimenti forniti:

| Tema | Accento | Aspetto |
| --- | --- | --- |
| Verde Lime | `#D5FF40` | Originale, scuro |
| Azzurro Ciano | `#29ABE2` | Blu e ciano, scuro |
| Rosa Fucsia | `#FF096C` | Fucsia e grigio blu, scuro |
| Rosso Rubino | `#D60235` | Rosso e nero blu, scuro |
| Oro Champagne | `#FFDB89` | Oro e antracite, scuro |
| Verde Acqua | `#7BA7AF` | Acqua e verde grigio, scuro |
| Viola Ametista | `#9A6FB7` | Viola, crema e rosa, scuro |
| Arancio Lava | `#F27D16` | Arancio, foresta e muschio, scuro |
| Blu Atlantico | `#1A344D` | Blu e grigio schiuma, chiaro |

La palette comprende sfondo, pannelli, testi, campi, pulsanti, indicatori e grafici. Alcuni accenti hanno una variante più chiara per i testi piccoli. Le frecce delle select seguono il tema e conservano lo spazio dal bordo destro. Il tema è applicato subito, salvato nella chiave locale `atomic.theme` e ripristinato prima del primo disegno dell’interfaccia. La scelta è globale, separata dalle impostazioni audio e dai profili degli orologi, e può cambiare durante la trasmissione. L’icona dell’app mantiene il verde lime originale.

La finestra non può essere ridimensionata, massimizzata o portata a schermo intero. Ogni sezione ha una vista separata:

- **Sincronizza:** selezione orologio e stazione, ora, inviluppo, avvio/arresto, intensità, canale e durata.
- **I miei orologi:** profili, annotazioni e ripristino della configurazione riuscita.
- **Dentro il segnale:** telegramma completo, simbolo corrente, campi e parità. BPC mostra 20 simboli, MSF le coppie A/B.
- **Cronologia:** tutte le prove con paginazione, configurazioni storiche e dettaglio separato. Esito modificabile dopo la trasmissione e cancellazione annullabile.
- **Impostazioni:** uscita audio, test a 440 Hz, profilo audio, correzione manuale e diagnostica NTP.
- **Guida rapida:** istruzioni adeguate alla stazione selezionata; FAQ con una sola risposta aperta alla volta.

## Avvio dai sorgenti

Richiede Node.js **22.12 o successivo** e npm.

```sh
npm ci
node node_modules/electron/install.js
npm start
```

Electron 45 separa il pacchetto npm dal download del runtime: il secondo comando serve alla prima installazione. Le dipendenze sono bloccate in `package-lock.json`. Non occorre un server web.

## Codifica e audio

- **DCF77:** BCD, tre parità pari, fuso Europe/Berlin e annuncio A1. Ampiezza al 15% per 100/200 ms; nessuna riduzione al secondo 59.
- **JJY:** BCD, giorno dell’anno, anno, giorno settimanale e parità ore/minuti. Ampiezza alta per 800/500/200 ms per 0/1/marcatore, poi al 10%. Si genera il telegramma AM completo anche ai minuti 15 e 45; non viene riprodotta l’identificazione Morse della torre.
- **WWVB:** codice AM storico con UTC, giorno dell’anno, anno bisestile e bit DST statunitensi. Riduzione di 17 dB per 200/500/800 ms. DUT1 simulato a zero; modulazione di fase moderna non riprodotta. I flag DST usano le regole USA attuali (dal 2007).
- **MSF:** due bit A/B per secondo, quattro parità dispari, identificatore di minuto e stato GMT/BST, compreso l’annuncio del cambio d’ora nei 61 minuti precedenti. La modulazione è on/off, con marcatore da 500 ms. DUT1 simulato a zero.
- **BPC:** campi binari in 19 simboli quaternari dopo un marcatore senza riduzione. Simboli da 100/200/300/400 ms al 10%, indice di ciclo 0/20/40 s, AM/PM, anno a sette bit diviso e due parità pari. Giorno settimanale ISO (lunedì 1, domenica 7). Compatibilità sperimentale.

Il motore AudioWorklet genera campioni stereo a 48 kHz, separatamente dai timer dell’interfaccia. La latenza dichiarata dall’uscita è compensata; è disponibile una correzione manuale in millisecondi. L’incertezza NTP visualizzata **non** misura la latenza audio reale. Sono disponibili tono sinusoidale predefinito e forma quadra sperimentale, che può generare componenti aliasate più udibili. Per DCF77 è disponibile anche **pause complete**, un profilo sinusoidale sperimentale che azzera il tono nei primi 100/200 ms di ogni secondo; il secondo 59 resta continuo. Il grafico mostra il profilo scelto. Il codice temporale non cambia; l’inviluppo radio di riferimento resta al 15%. Il profilo viene salvato e tornando a un’altra stazione si ripristina la sinusoidale standard.

L’uscita audio **non genera direttamente una portante radio a 60–77,5 kHz**: riproduce un tono a una frazione della frequenza. Armoniche fisiche e accoppiamento elettromagnetico dipendono dall’elettronica dell’altoparlante/auricolare. La ricezione può fallire anche con un telegramma corretto. Nessuna ricezione fisica su un Casio è stata verificata automaticamente.

I secondi intercalari non vengono simulati e i relativi annunci restano disattivati; non sono riprodotti meteo o avvisi pubblici delle stazioni.

## Ora, lifecycle e dati

L’app interroga `ptbtime1.ptb.de`, `ptbtime2.ptb.de` e `time.cloudflare.com`, validando peer, nonce, formato e latenza. Fra risposte concordi sceglie la minore incertezza. NTP usa UDP/123 senza autenticazione NTS. La correzione rimane nell’app e non cambia l’orologio del computer. Il riferimento è aggiornato a riposo dopo 15 minuti e indicato come da riverificare dopo 30 minuti.

Durante la trasmissione viene impedita la sospensione automatica; sospensione manuale, blocco schermo, interruzione audio e cambio dispositivo arrestano il segnale. Il renderer è isolato e sandboxed, senza Node.js o contenuti remoti. Preferenze e cronologia restano locali; nessuna telemetria.

## Test e build

```sh
npm test                 # 33 test: protocolli, PCM, canali stereo, profili, migrazioni e NTP
npm run test:desktop     # Electron reale e AudioWorklet; audio silenziato
npm run pack             # cartella applicazione
npm run dist             # archivio macOS
npm run dist:win         # Portable Windows x64; NSIS nativo Apple Silicon già configurato
npm run dist:linux       # build su ambiente Linux/supportato
```

Il test desktop usa un profilo temporaneo, verifica nove temi con rapporto di contrasto del testo almeno 4,5:1 nelle combinazioni controllate, persistenza e ripristino del tema, scelta non valida, cambio durante una trasmissione e separazione dai parametri audio; verifica anche isolamento, finestra fissa, tutte le viste e FAQ senza overflow, selezione/blocco delle cinque stazioni, otto righe per pagina, profili distinti, creazione/modifica/eliminazione e annullamento, ripristino della configurazione riuscita, configurazioni delle prove indipendenti dalle successive modifiche, GET/ERR dopo la fine, migrazione e cronologia estesa, blocco del canale e dei profili durante la sessione, tono di prova, volume, persistenza, fallback offline, chiusura e sospensione. Le schermate sono salvate in `artifacts/`. Build e collaudo eseguiti su macOS arm64. La build Windows portable x64 è stata generata e verificata nel contenuto, ma non eseguita su Windows; Linux è configurato ma non collaudato.

## Struttura

```text
electron/main.cjs          Finestra fissa, lifecycle, risparmio energetico, IPC
electron/preload.cjs       API isolate
electron/ntp.cjs           NTP e validazione
src/dcf77.mjs             Codificatore DCF77
src/stations.mjs          Registro stazioni, codificatori e inviluppi
src/signal-worklet.mjs    Generatore audio multistazione
src/audio-engine.mjs      AudioContext e temporizzazione
src/app.mjs               Interfaccia, stato, profili e sessioni
src/trials.mjs            Configurazioni, copie delle prove e migrazione dati
src/index.html            Viste desktop
src/styles.css            Stili compatti e nove palette
src/themes.mjs            Catalogo temi e scelta globale
src/theme-init.js         Ripristino del tema prima del rendering
test/                     Test Node e vettori di riferimento
scripts/smoke.cjs          Collaudo Electron
```

## Fonti tecniche

- [DCF77: specifica PTB](https://www.ptb.de/cms/en/ptb/fachabteilungen/abt4/fb-44/ag-442/dissemination-of-legal-time/dcf77/dcf77-time-code.html)
- [JJY: specifica NICT e diagrammi](https://jjy.nict.go.jp/jjy/trans/index-e.html)
- [WWVB: formato NIST](https://www.nist.gov/pml/time-and-frequency-division/time-distribution/radio-station-wwvb/wwvb-time-code-format) e [NIST Special Publication 432, appendice C](https://tf.nist.gov/general/pdf/85.pdf)
- [MSF: specifica NPL, marzo 2019](https://www.npl.co.uk/getattachment/2afd4c3b-fc8d-486c-b2b9-fc9a5a66394c/msf-time-date-code-2019.pdf)
- [BPC: descrizione tecnica e figura 5, CN109085615A](https://patents.google.com/patent/CN109085615A/en)
- [BPC: registrazione originale con tre telegrammi decodificati, Jinan 10 gennaio 2026](https://commons.wikimedia.org/wiki/File:10-Jan-2026,_16h34m39s_-_16h35m21s,_BPC_68.5kHz,_Received_in_Jinan,_Shandong,_China.oga)
- [ITU-R TF.2487: descrizione dei servizi radio nazionali](https://www.itu.int/dms_pub/itu-r/opb/rep/R-REP-TF.2487-2021-PDF-E.pdf)
- [Manuali Casio per modulo](https://support.casio.com/en/manual/manuallist.php?cid=009)

Nessuna affiliazione con Casio, PTB, NICT, NIST, NPL, NTSC o Clock Wave.
