# R Analyse Template

R Template für die Veröffentlichung von Analysen im Design von [BR Data](https://www.br.de/extra/br-data/).

## Verwendung

1.	Repository klonen `git clone https://...`
2. Pandoc installieren, z.B. `brew install pandoc` (Mac)
3. `analyse.Rmd` in [RStudio](https://rstudio.com/products/rstudio/download/) öffnen und Analyse durchführen
4. Analyse als HTML-Datei rendern mit `cmd` + `⇧` + `k`

## Metadaten

Im obersten Teil der `analyse.Rmd`-Datei befinden sich zwischen zwei mit `---` gekennzeichneten Zeilen die YAML-Metadaten.  
Die Metadaten landen im `<head>` und im `<body>` der gerenderten HTML-Datei und bestimmen im Allgemeinen das Ausgabeformat der Analyse.  

Einige Hinweise dazu:

- `description`: Untertitel der Analyse
- `self_contained: true`: Externe Dateien (z.B. css) werden ins HTML embedded
- `toc: true`: Inhaltsverzeichnis wird angezeigt

## Layout

Das Layout ist an das [BR Data Webpack Longread Template](https://web.br.de/interaktiv/longread-webpack/) angelehnt. 

Die gerenderte Analyse liegt im HTML in einem `<div class="block">` in einer `<section>`. Um diese zu verlassen, müssen entsprechende Tags direkt im Markdown in `analyse.Rmd` geschlossen werden.

Da das Template die Analyse mit abschließenden `</div>` und `</section>` beendet, ist es sinnvoll die Tags nochmal zu öffnen, nachdem man sie manuell geschlossen hat.

Hier ein Code-Beispiel in `analyse.Rmd`:

```
</div> <-- schließt das <div class="block"> aus dem Template -->

```{r}
Inhalt, der außerhalb eines <div class="block"> steht
 ```

<div class="block"> <-- öffnet ein neues <div class="block"> -->
```

Beliebige andere HTML-Elemente können direkt ins Markdown geschrieben werden, z.B. `<div class="infobox">`.

Grundlegene Änderungen können auch im Template vorgenommen werden: 

`./lib/template/template.html`

## Style

Der Style kommt auch vom [BR Data Webpack Longread Template](https://web.br.de/interaktiv/longread-webpack/). Die entsprechende css-Datei `./lib/template/style/style.R` wird über die Metadaten im Header von `analyse.Rmd` eingebunden.