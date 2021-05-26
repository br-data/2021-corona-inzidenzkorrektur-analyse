# Analyse der nachträglichen Abweichungen der 7-Tage-Inzidenz der Landkreise

Hier findet ihr eine Analyse zu den nachträglichen Abweichungen der 7-Tage-Inzidenzwerte der deutschen Landkreise. BR Data hat dafür die [Covid-19-Falldaten](https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/dd4580c810204019a7b8eb3e0b329dd6_0) des [Robert Koch-Instituts (RKI)](https://www.rki.de/DE/Home/homepage_node.html;jsessionid=D58CD5F6CA0F096146D5E3E704912261.internet062) für den Zeitraum 01. März 2021 - 11. Mai 2021 analysiert. Die bei der Analyse verwendeten Skripte und Daten finden sich hier.

Links zum Projekt:

- [Corona-Lockerungen: Fehlende Meldungen verzerren Inzidenzen (br.de)](https://www.br.de/nachrichten/bayern/corona-lockerungen-inzidenzen-verzerrt-wegen-fehlender-meldungen,SX8NMAb)
- [Inzidenz zu niedrig - Lockerung zu früh? (tagesschau.de)](https://www.tagesschau.de/investigativ/br-recherche/inzidenz-daten-101.html)

## Überblick zum Vorgehen

Das RKI stellt die [Covid-19-Falldaten](https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/dd4580c810204019a7b8eb3e0b329dd6_0) seit Beginn der Pandemie zur Verfügung. Diese Daten werden täglich mit den neuesten Fallmeldungen (darunter auch Nachmeldungen) ergänzt.

Wir (cc Michael Kreil) archivieren für [ARD Data](https://github.com/ard-data/2020-rki-archive) täglich den vollständigen Datensatz. Aus diesen Daten lassen sich Fallzahlen nach Meldedatum und Inzidenzewerte für die Landkreise berechnen. Die so berechneten Inzidenzwerte nach unterschiedlichen Datenständen bilden die Grundlage der Auswertung.

Die Analyse liegt als R-Markdown und als HTML-Version vor. Die Analyseschritte werden erläutert, die Ergebnisse kurz zusammengefasst und mit visuellen Elementen wie Tabellen und Grafiken veranschaulicht.

## Verwendung

Input-Dateien (mit aktuellem Stand) erzeugen: [optional]

1. Rohdaten aus ARD Data-Repository herunterladen: `node lib/0_download_data.js`
2. Matrix mit kumulierten 7-Tage-Fallzahlen generieren:`node lib/1_create_inzidenz_matrix.js`
3. Matrix mit Fallzahlen nach Berichtsdatum erstellen: `node lib/2_create_datenstand_matrix.js`

Analyse ausführen:

- `analyse.Rmd` in [RStudio](https://rstudio.com/products/rstudio/download/) öffnen und Analyse durchführen
- Analyse als HTML-Datei rendern mit cmd + ⇧ + k

Sanity check: [optional]

- `checks-and-balances.R` vergleicht die Werte, die aus Aggregation der [archivierten RKI-Daten](https://github.com/ard-data/2020-rki-archive) und der [a-posteriori Veröffentlichung](https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Daten/Fallzahlen_Kum_Tab.html) durch das RKI resultieren

## Abhängigkeiten

- [Node.js](https://nodejs.org/en/)
- [XZ](https://tukaani.org/xz/)
- [R](https://www.r-project.org/) (Markdown)
- [Pandoc](https://pandoc.org/)

## Ordnerstruktur

Im input-Ordner liegen die Dateien, die man benötigt, um die Analyse in R auszuführen. Im lib-Ordner liegen die Skripte, die die input-Dateien aus dem [ARD Data-Repository](https://github.com/ard-data/2020-rki-archive) erzeugen. Im output-Ordner liegen die Ergebnisse der Analyse auf Ebene der Bundesländer und Landkreise in tabellarischer Form.

## Style

Wir verwenden für unsere Analysen ein Template. Die entsprechende css-Datei `./lib/template/style/style.R` wird über die Metadaten im Header von `analyse_inzidenzkorrektur.Rmd` eingebunden.

## Weitere ARD-Ausspielungen

Die vorliegende Analyse wurde von mehreren Datenteams innerhalb der ARD genutzt, um Veröffentlichungen zu den abweichenden Inzidenzwerten aufzusetzen bzw. zu ergänzen.
Einige Beispiele:

- [Meldeverzug kann verhindern, dass die "Notbremse" greift (NDR)](https://www.ndr.de/nachrichten/info/Corona-Zahlen-Meldeverzug-kann-verhindern-dass-Notbremse-greift,inzidenzkorrektur100.html)
- [Warum die Notbremse nicht alle gleich behandelt(RBB)](https://www.rbb24.de/panorama/thema/corona/beitraege/2021/05/rki-inzidenz-verzerrt-meldeverzug-notbremse.html)
