# Analyse der nachträglichen korrigierten 7-Tage-Inzidenzen

Hier findet ihr eine Analyse zur nachträglichen Abweichung der 7-Tage-Inzidenzwerte der deutschen Landkreisen. BR Data hat dafür die [Covid-19-Falldaten](https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/dd4580c810204019a7b8eb3e0b329dd6_0) des [Robert Koch-Instituts (RKI)](https://www.rki.de/DE/Home/homepage_node.html;jsessionid=D58CD5F6CA0F096146D5E3E704912261.internet062) für den Zeitraum 01. März 2021 - 11. Mai 2021 analysiert. Die bei der Analyse verwendeten Skripte und Daten befinden sich hier.

Links zum Projekt:
- [Corona-Lockerungen: Fehlende Meldungen verzerren Inzidenzen (br.de)](https://www.br.de/nachrichten/bayern/corona-lockerungen-inzidenzen-verzerrt-wegen-fehlender-meldungen,SX8NMAb)
- [Inzidenz zu niedrig - Lockerung zu früh? (tagesschau.de)](https://www.tagesschau.de/investigativ/br-recherche/inzidenz-daten-101.html)

## Überblick zum Vorgehen

Das RKI stellt die [Covid-19-Falldaten](https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/dd4580c810204019a7b8eb3e0b329dd6_0) seit Beginn der Pandemie zur Verfügung. Diese Daten werden täglich mit den neuesten Fallmeldungen (darunter auch Nachmeldungen) ergänzt. Der Datenstand eines bestimmten Tages wird nicht festgehalten.

Aus diesem Grund archiviert Michael Kreil für [ARD Data](https://github.com/ard-data/2020-rki-archive) täglich den vollständigen Datensatz, sodass die Fallzahlen und Inzidenzen für einen bestimmten Tag mit den Datenständen verschiedener Tage betrachtet werden können.

In einem ersten Schritt werden die Daten dieses Archivs über .....

....... How to best run Michaels Script

Anschließend werden die Daten in R ausgewertet. Die Analyse liegt als R-Markdown und als HTML-Version in der Box. Wer sich nicht gerne in R bewegt, kann also direkt auf das HTML-File klicken.

## Ordnerstruktur

Im input-Ordner liegen die Dateien, die man benötigt, um die Analyse in R auszuführen. Im output-Ordner liegen die Ergebnisse der Analyse auf Ebene der Bundesländer und Landkreise in tabellarischer Form. Wer möchte kann die Analyse in R reproduzieren und so auch die output-Dateien neu erzeugen.

## Verwendung von RMarkdown

1. Pandoc installieren, z.B. `brew install pandoc` (Mac)
2. `analyse.Rmd` in [RStudio](https://rstudio.com/products/rstudio/download/) öffnen und Analyse durchführen
3. Analyse als HTML-Datei rendern mit `cmd` + `⇧` + `k`

## Style

Wir verwenden für unsere Analysen ein Template. Die entsprechende css-Datei `./lib/template/style/style.R` wird über die Metadaten im Header von `analyse_inzidenzkorrektur.Rmd` eingebunden. Nur dass ihr euch nicht wundert, wenn das an der ein oder anderen Stelle etwas anders aussieht als in plainem R ; )
