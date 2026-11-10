const rows=[
["Dew point","Punto di rugiada","Point de rosée","Taupunkt","Punto de rocío","露点"],
["Sea-level pressure","Pressione al mare","Pression au niveau marin","Luftdruck auf Meereshöhe","Presión al nivel del mar","海面気圧"],
["3 h · model","3 h · modello","3 h · modèle","3 Std. · Modell","3 h · modelo","3時間 · モデル"],
["Gusts","Raffiche","Rafales","Böen","Rachas","突風"],
["Rain chance today","Probabilità pioggia oggi","Risque de pluie aujourd’hui","Regenwahrscheinlichkeit heute","Probabilidad de lluvia hoy","今日の降水確率"],
["Forecast total","Accumulo previsto","Cumul prévu","Vorhergesagte Menge","Acumulación prevista","予想降水量"],
["Cloud cover","Nuvolosità","Couverture nuageuse","Bewölkung","Nubosidad","雲量"],
["Visibility","Visibilità","Visibilité","Sichtweite","Visibilidad","視程"],
["Seven-day forecast","Previsioni a 7 giorni","Prévisions sur 7 jours","7-Tage-Vorhersage","Previsión de 7 días","7日間の予報"],
["High / low · rain chance","Max / min · probabilità pioggia","Max. / min. · risque de pluie","Hoch / tief · Regenwahrscheinlichkeit","Máx. / mín. · probabilidad de lluvia","最高 / 最低 · 降水確率"],
["Rain chance {0}","Probabilità pioggia {0}","Risque de pluie {0}","Regenwahrscheinlichkeit {0}","Probabilidad de lluvia {0}","降水確率 {0}"],
["Daily maximum precipitation probability","Probabilità massima giornaliera di precipitazioni","Probabilité maximale de précipitations du jour","Maximale Niederschlagswahrscheinlichkeit des Tages","Probabilidad máxima diaria de precipitación","1日の最大降水確率"],
["Model valid · {0}","Stima valida alle {0}","Estimation valable à {0}","Modell gültig um {0}","Estimación válida a las {0}","モデルの対象時刻 · {0}"],
["Model valid · {0} · downloaded {1}","Stima valida alle {0} · scaricata alle {1}","Estimation valable à {0} · téléchargée à {1}","Modell gültig um {0} · abgerufen um {1}","Estimación válida a las {0} · descargada a las {1}","モデルの対象時刻 · {0} · 取得時刻 {1}"],
["N","N","N","N","N","北"],
["NE","NE","NE","NO","NE","北東"],
["E","E","E","O","E","東"],
["SE","SE","SE","SO","SE","南東"],
["S","S","S","S","S","南"],
["SW","SO","SO","SW","SO","南西"],
["W","O","O","W","O","西"],
["NW","NO","NO","NW","NO","北西"],
["Use arrow keys to inspect the forecast.","Usa le frecce per esplorare le previsioni.","Utilisez les flèches pour explorer les prévisions.","Mit den Pfeiltasten die Vorhersage erkunden.","Usa las flechas para explorar la previsión.","矢印キーで予報を確認できます。"],
["Temperature trend","Andamento temperatura","Évolution de la température","Temperaturverlauf","Evolución de la temperatura","気温の推移"],
["Next 24 hours","Prossime 24 ore","Prochaines 24 heures","Nächste 24 Stunden","Próximas 24 horas","今後24時間"],
["Forecast range","Periodo delle previsioni","Période des prévisions","Vorhersagezeitraum","Periodo de previsión","予報の期間"],
["24 h","24 h","24 h","24 Std.","24 h","24時間"],
["5 days","5 giorni","5 jours","5 Tage","5 días","5日間"],
["Low {0} · High {1}","Min {0} · Max {1}","Min. {0} · Max. {1}","Tief {0} · Hoch {1}","Mín {0} · Máx {1}","最低 {0} · 最高 {1}"],
["The Clock tab in Observatory shows current local time and weather for your World View city. Hours, minutes and seconds have equal size. Forecasts refresh only while Your now or the clock is visible; sunrise and sunset are calculated offline. Cached or unavailable weather is labeled, and astronomical previews never change the clock.", "Il tab Orologio nell’osservatorio mostra ora locale e meteo della città scelta in Mondo. Ore, minuti e secondi hanno la stessa dimensione. Le previsioni si aggiornano solo mentre Il tuo adesso o l’orologio sono visibili; alba e tramonto sono calcolati offline. Il meteo salvato o non disponibile è indicato e le anteprime astronomiche non modificano l’orologio.", "L’onglet Horloge de l’observatoire affiche l’heure locale actuelle et la météo de la ville choisie dans la carte mondiale. Heures, minutes et secondes ont la même taille. Les prévisions s’actualisent uniquement avec Votre instant ou l’horloge visible ; lever et coucher du Soleil sont calculés hors ligne. Les données en cache ou indisponibles sont signalées et les aperçus astronomiques ne changent pas l’horloge.", "Der Reiter Uhr im Observatorium zeigt die aktuelle Ortszeit und das Wetter der in der Weltansicht gewählten Stadt. Stunden, Minuten und Sekunden sind gleich groß. Vorhersagen werden nur bei sichtbarer Startseite oder Uhr aktualisiert; Sonnenaufgang und Sonnenuntergang werden offline berechnet. Gespeicherte oder fehlende Wetterdaten sind gekennzeichnet. Himmelsvorschauen ändern die Uhr nicht.", "La pestaña Reloj del observatorio muestra la hora local actual y el tiempo de la ciudad elegida en el mapa mundial. Horas, minutos y segundos tienen el mismo tamaño. Las previsiones solo se actualizan con Tu ahora o el reloj visibles; amanecer y atardecer se calculan sin conexión. Se indican los datos guardados o no disponibles y las vistas previas astronómicas no cambian el reloj.", "観測所の「時計」タブには、世界地図で選んだ都市の現在の現地時刻と天気を表示します。時・分・秒は同じ大きさです。予報はホームまたは時計の表示中のみ更新され、日の出と日の入りはオフラインで計算します。保存済み・取得不可の天気は明示され、天体のプレビューは時計に影響しません。"],
["Feels like","Percepita","Ressenti","Gefühlt","Sensación","体感温度"],
  [
    "Clock",
    "Orologio",
    "Horloge",
    "Uhr",
    "Reloj",
    "時計"
  ],
  [
    "Clock and weather",
    "Orologio e meteo",
    "Horloge et météo",
    "Uhr und Wetter",
    "Reloj y tiempo",
    "時計と天気"
  ],
  [
    "Local time",
    "Ora locale",
    "Heure locale",
    "Ortszeit",
    "Hora local",
    "現地時刻"
  ],
  [
    "Weather estimate",
    "Stima meteo",
    "Estimation météo",
    "Wetterschätzung",
    "Estimación meteorológica",
    "天気の推定"
  ],
  [
    "Next hours",
    "Prossime ore",
    "Prochaines heures",
    "Nächste Stunden",
    "Próximas horas",
    "この後の天気"
  ],
  [
    "Five-day forecast",
    "Previsioni a 5 giorni",
    "Prévisions sur 5 jours",
    "5-Tage-Vorhersage",
    "Previsión de 5 días",
    "5日間の予報"
  ],
  [
    "High / low",
    "Massima / minima",
    "Max. / min.",
    "Höchst- / Tiefstwert",
    "Máxima / mínima",
    "最高 / 最低"
  ],
  [
    "Low temperature",
    "Temperatura minima",
    "Température minimale",
    "Tiefsttemperatur",
    "Temperatura mínima",
    "最低気温"
  ],
  [
    "Today",
    "Oggi",
    "Aujourd’hui",
    "Heute",
    "Hoy",
    "今日"
  ],
  [
    "Humidity",
    "Umidità",
    "Humidité",
    "Luftfeuchte",
    "Humedad",
    "湿度"
  ],
  [
    "Wind",
    "Vento",
    "Vent",
    "Wind",
    "Viento",
    "風速"
  ],
  [
    "Rain chance",
    "Probabilità di pioggia",
    "Risque de pluie",
    "Regenwahrscheinlichkeit",
    "Probabilidad de lluvia",
    "降水確率"
  ],
  [
    "Feels like {0}",
    "Percepita {0}",
    "Ressenti {0}",
    "Gefühlt {0}",
    "Sensación {0}",
    "体感 {0}"
  ],
  [
    "Weather unavailable",
    "Meteo non disponibile",
    "Météo indisponible",
    "Wetter nicht verfügbar",
    "Tiempo no disponible",
    "天気情報を取得できません"
  ],
  [
    "Fetching forecast…",
    "Caricamento previsioni…",
    "Chargement des prévisions…",
    "Vorhersage wird geladen…",
    "Cargando previsión…",
    "予報を取得中…"
  ],
  [
    "Offline · cached forecast",
    "Offline · previsioni salvate",
    "Hors ligne · prévisions en cache",
    "Offline · gespeicherte Vorhersage",
    "Sin conexión · previsión guardada",
    "オフライン · 保存済みの予報"
  ],
  [
    "Forecast updated · {0}",
    "Previsioni aggiornate · {0}",
    "Prévisions actualisées · {0}",
    "Vorhersage aktualisiert · {0}",
    "Previsión actualizada · {0}",
    "予報の更新時刻 · {0}"
  ],
  [
    "Forecast is out of date",
    "Previsioni non aggiornate",
    "Prévisions périmées",
    "Vorhersage veraltet",
    "Previsión desactualizada",
    "予報の有効期限が切れています"
  ],
  [
    "{0} h {1} min",
    "{0} h {1} min",
    "{0} h {1} min",
    "{0} Std. {1} Min.",
    "{0} h {1} min",
    "{0}時間{1}分"
  ],
  [
    "Clear skies",
    "Sereno",
    "Ciel dégagé",
    "Klarer Himmel",
    "Despejado",
    "晴れ"
  ],
  [
    "Mostly clear",
    "Prevalentemente sereno",
    "Généralement dégagé",
    "Überwiegend klar",
    "Mayormente despejado",
    "おおむね晴れ"
  ],
  [
    "Partly cloudy",
    "Parzialmente nuvoloso",
    "Partiellement nuageux",
    "Teilweise bewölkt",
    "Parcialmente nublado",
    "晴れ時々曇り"
  ],
  [
    "Overcast",
    "Coperto",
    "Couvert",
    "Bedeckt",
    "Cubierto",
    "曇り"
  ],
  [
    "Fog",
    "Nebbia",
    "Brouillard",
    "Nebel",
    "Niebla",
    "霧"
  ],
  [
    "Drizzle",
    "Pioviggine",
    "Bruine",
    "Nieselregen",
    "Llovizna",
    "霧雨"
  ],
  [
    "Freezing rain",
    "Pioggia gelata",
    "Pluie verglaçante",
    "Gefrierender Regen",
    "Lluvia helada",
    "着氷性の雨"
  ],
  [
    "Rain",
    "Pioggia",
    "Pluie",
    "Regen",
    "Lluvia",
    "雨"
  ],
  [
    "Snow",
    "Neve",
    "Neige",
    "Schnee",
    "Nieve",
    "雪"
  ],
  [
    "Rain showers",
    "Rovesci di pioggia",
    "Averses de pluie",
    "Regenschauer",
    "Chubascos",
    "にわか雨"
  ],
  [
    "Snow showers",
    "Rovesci di neve",
    "Averses de neige",
    "Schneeschauer",
    "Chubascos de nieve",
    "にわか雪"
  ],
  [
    "Thunderstorm",
    "Temporale",
    "Orage",
    "Gewitter",
    "Tormenta",
    "雷雨"
  ],
  [
    "Thunderstorm with hail",
    "Temporale con grandine",
    "Orage avec grêle",
    "Gewitter mit Hagel",
    "Tormenta con granizo",
    "雷雨とひょう"
  ]
];
export const clockMessages=Object.fromEntries(rows.map(([key,it,fr,de,es,ja])=>[key,{it,fr,de,es,ja}]));
