if (!require("tidyverse")) {
  install.packages("tidyverse")
  library(tidyverse)
}

# force fixed notation instead of scientific notation
options(scipen = 999)

# colours
br24_colours <- c("#0b9fd8", "#e4743a", "#3ad29f", "#e64242", "#fbb800")
br24_colours <- c(br24_colours, colorspace::darken(br24_colours, 0.3), colorspace::darken(br24_colours, 0.6))


# ggplot2 config
theme_update(plot.margin = margin(30, 0, -0, 0, "pt"),
             panel.background = element_blank(),
             # axis.title.x = element_blank(),
             # axis.title.y = element_text(angle = 0, margin = margin(0, 0, 0, 0, "pt"), vjust = 1.15),
             axis.text.x = element_text(angle = 0),
             # axis.text.y = element_text(angle = 0, margin = margin(0, 5, 0, -40, "pt")),
             axis.ticks.x = element_blank(),
             axis.ticks.y = element_line(),
             axis.ticks.length = unit(5, "pt"),
             legend.position = "top",
             # text = element_text(size = 20),
             strip.text.x = element_text(colour = "black", face = "bold"),
             strip.background = element_rect(colour = "white", fill = "white"))

update_geom_defaults("col", list(fill = br24_colours[1]))
update_geom_defaults("line", list(color = br24_colours[1]))
update_geom_defaults("point", list(color = br24_colours[1]))

scale_colour_discrete <- function(...) {
  scale_colour_manual(..., values = br24_colours)
}
scale_fill_discrete <- function(...) {
  scale_fill_manual(..., values = br24_colours)
} 