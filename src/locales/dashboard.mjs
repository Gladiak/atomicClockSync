const rows=[
['Your reference','Il tuo riferimento','Votre référence','Deine Referenz','Tu referencia','あなたの基準時刻'],
['On your wrist','Al tuo polso','À votre poignet','An deinem Handgelenk','En tu muñeca','あなたの腕時計'],
['Earth, right now','La Terra, adesso','La Terre, maintenant','Die Erde, jetzt','La Tierra, ahora','今の地球'],
['Moon, right now','La Luna, adesso','La Lune, maintenant','Der Mond, jetzt','La Luna, ahora','今の月'],
['ISS, right now','La ISS, adesso','L’ISS, maintenant','Die ISS, jetzt','La ISS, ahora','今のISS'],
['Next full Moon','Prossima Luna piena','Prochaine pleine Lune','Nächster Vollmond','Próxima luna llena','次の満月'],
['MOON, RIGHT NOW','LA LUNA, ADESSO','LA LUNE, MAINTENANT','DER MOND, JETZT','LA LUNA, AHORA','今の月'],
['ISS, RIGHT NOW','LA ISS, ADESSO','L’ISS, MAINTENANT','DIE ISS, JETZT','LA ISS, AHORA','今のISS'],
['Speed','Velocità','Vitesse','Geschwindigkeit','Velocidad','速度'],
['ISS Observatory →','Osservatorio ISS →','Observatoire ISS →','ISS-Observatorium →','Observatorio ISS →','ISS観測所 →'],
['Orbit epoch · {0}','Epoca orbitale · {0}','Époque orbitale · {0}','Bahnepoche · {0}','Época orbital · {0}','軌道の基準日時 · {0}'],
['Report · {0}','Rapporto · {0}','Rapport · {0}','Meldung · {0}','Informe · {0}','位置情報 · {0}'],
['Open ISS Observatory to refresh.','Apri l’osservatorio ISS per aggiornare.','Ouvrez l’observatoire ISS pour actualiser.','Öffne das ISS-Observatorium zum Aktualisieren.','Abre el observatorio ISS para actualizar.','ISS観測所を開いて更新してください。'],
['The dashboard shares the World View map appearance and photographic lunar surface. Its ISS card shows current coordinates, speed and altitude from a usable orbit estimate or a recent position report, with source and time. Old or missing data are shown as unavailable. ISS data refresh only while the dashboard is visible; these requests share the observatory cache and rate limits. Sky previews do not change the live dashboard.',
'La dashboard usa l’aspetto della mappa mondiale e la stessa superficie lunare fotografica. Il riquadro ISS mostra coordinate, velocità e altitudine da una stima orbitale valida o da un rapporto recente, con fonte e data. Dati vecchi o mancanti sono indicati come non disponibili. La ISS si aggiorna solo mentre la dashboard è visibile, usando cache e limiti di frequenza dell’osservatorio. Le anteprime astronomiche non cambiano la dashboard in tempo reale.',
'Le tableau de bord partage l’apparence de la carte mondiale et la surface lunaire photographique. La carte ISS affiche coordonnées, vitesse et altitude depuis une estimation orbitale valide ou un rapport récent, avec source et date. Les données anciennes ou absentes sont indiquées comme indisponibles. L’ISS s’actualise uniquement lorsque le tableau de bord est visible, avec le cache et les limites de l’observatoire. Les aperçus astronomiques ne modifient pas le tableau de bord en direct.',
'Das Dashboard verwendet die Weltkartendarstellung und dieselbe fotografische Mondoberfläche. Die ISS-Karte zeigt Koordinaten, Geschwindigkeit und Höhe aus einer gültigen Bahnschätzung oder einer aktuellen Positionsmeldung mit Quelle und Zeit. Alte oder fehlende Daten werden als nicht verfügbar angezeigt. Aktualisierungen erfolgen nur bei sichtbarem Dashboard und teilen Cache und Abfragelimits mit dem Observatorium. Himmelsvorschauen ändern das Live-Dashboard nicht.',
'El panel comparte el aspecto del mapa mundial y la superficie lunar fotográfica. La tarjeta ISS muestra coordenadas, velocidad y altitud de una estimación orbital válida o un informe reciente, con fuente y fecha. Los datos antiguos o ausentes se muestran como no disponibles. La ISS solo se actualiza con el panel visible, usando la caché y los límites del observatorio. Las vistas previas astronómicas no cambian el panel en directo.',
'ダッシュボードは世界地図の表示形式と同じ写真ベースの月面を使用します。ISSカードには有効な軌道推定または新しい位置情報から座標、速度、高度と出典・日時を表示します。古い情報や欠損値は利用不可となります。ISSの更新はダッシュボード表示中のみで、観測所とキャッシュおよび取得間隔の制限を共有します。天体のプレビューは現在のダッシュボードを変更しません。']
];
export const dashboardMessages=Object.fromEntries(rows.map(([key,it,fr,de,es,ja])=>[key,{it,fr,de,es,ja}]));
