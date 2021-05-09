# Analyse der nachträglichen korrigierten 7-Tage-Inzidenzen

Hier findet ihr die Analyse zur nachträglichen Korrektur der 7-Tage-Inzidenzwerte. Sie liegt als R-Markdown und als HTML-Version in der Box. Wer sich nicht gerne in R bewegt, kann also direkt auf das HTML-File klicken.

## Ordnerstruktur

Im input-Ordner liegen die Dateien, die man benötigt, um die Analyse in R auszuführen. Im output-Ordner, liegen die Ergebnisse der Analyse auf Ebene der Bundesländer und Landkreise in tabellarischer Form. Wer möchte kann die Analyse in R reproduzieren und so auch die output-Dateien neu erzeugen.

## Verwendung von RMarkdown

1. Pandoc installieren, z.B. `brew install pandoc` (Mac)
2. `analyse.Rmd` in [RStudio](https://rstudio.com/products/rstudio/download/) öffnen und Analyse durchführen
3. Analyse als HTML-Datei rendern mit `cmd` + `⇧` + `k`

## Style

Wir verwenden für unsere Analysen ein Template. Die entsprechende css-Datei `./lib/template/style/style.R` wird über die Metadaten im Header von `analyse_inzidenzkorrektur.Rmd` eingebunden. Nur dass ihr euch nicht wundert, wenn das an der ein oder anderen Stelle etwas anders aussieht als in plainem R ; )
