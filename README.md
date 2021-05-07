# R Analyse Template

R Template für die Veröffentlichung von Analysen im Design von [BR Data](https://www.br.de/extra/br-data/).

## Verwendung

1. Repository klonen `git clone https://...`
2. Pandoc installieren, z.B. `brew install pandoc` (Mac)
3. `analyse.Rmd` in [RStudio](https://rstudio.com/products/rstudio/download/) öffnen und Analyse durchführen
4. Analyse als HTML-Datei rendern mit `cmd` + `⇧` + `k`

## Metadaten

Im obersten Teil der `analyse.Rmd`-Datei befinden sich zwischen zwei mit `---` gekennzeichneten Zeilen die YAML-Metadaten.

Einige Hinweise dazu:

- `description`: Untertitel der Analyse
- `self_contained: true`: Externe Dateien (z.B. css) werden ins HTML embedded
- `toc: true`: Inhaltsverzeichnis wird angezeigt

## Style

Der Style kommt auch vom [BR Data Webpack Longread Template](https://web.br.de/interaktiv/longread-webpack/). Die entsprechende css-Datei `./lib/template/style/style.R` wird über die Metadaten im Header von `analyse.Rmd` eingebunden.