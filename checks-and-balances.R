
library(ndjson)
library(tidyverse)
library(jsonlite)
library(R.utils)
library(lubridate)
library(zoo)
library(gridExtra)
library(dplyr)
library(readxl)


####################################### Fallzahl-Daten ################################################

data <- read.csv("./input/matrix_fallzahlen_7tage.csv", check.names = FALSE)
kreise <- read.csv("./input/Kreise-Dtl-2019.csv",check.names = FALSE, colClasses = c(Ags = "character"), fileEncoding="UTF-8" )


####### Format Datum

data$datenstand <- ymd(data$datenstand)
data$tag_nach_meldezeitraum <- ymd(data$tag_nach_meldezeitraum) 

####### Get rid of Berlin !?!?!?


####################################### Inzidenzen ################################################

ags <- kreise$Ags
data_inz <- data %>% select(c(datenstand,tag_nach_meldezeitraum)) 

for(i in 1:length(ags)) {
  
  col = ags[i]
  
  data_new <- data %>% select(c(datenstand,tag_nach_meldezeitraum,col))
  names(data_new)[3] <- "fallzahl"
  
  
  kreis <- kreise %>% filter(., ags == col)
  pop <- as.numeric(kreis[,8])
  
  data_new <- data_new %>% mutate(., inz = (fallzahl/pop*100000))%>% select(c(datenstand,tag_nach_meldezeitraum,inz))
  names(data_new)[3] <- col
  
  data_inz <- inner_join(data_inz,data_new, by = c("datenstand"="datenstand","tag_nach_meldezeitraum"="tag_nach_meldezeitraum"))
  
}

# data_inz <- data_inz %>% mutate_if(is.numeric, round)


#################################################################################################


data <- data %>% 
  filter(datenstand == tag_nach_meldezeitraum) %>%
  select(-datenstand) 

data <- data %>% 
  pivot_longer(!tag_nach_meldezeitraum, names_to = "LKNR", values_to = "count_michael") %>%
  mutate(LKNR = as.integer(LKNR)) %>%
  mutate(tag_nach_meldezeitraum = ymd(tag_nach_meldezeitraum))



data_rki <- read_xlsx("input/Fallzahlen_Kum_Tab.xlsx", sheet = "LK_7-Tage-Fallzahlen", skip = 4)

data_rki <- data_rki[-c(1,2)]
data_rki <- data_rki %>%
  pivot_longer(!LKNR, names_to = "meldedatum", values_to = "count_rki")

data_rki <- data_rki %>%
  mutate(test = ifelse(nchar(meldedatum) == 5, ymd("1899-12-30") + ddays(as.integer(meldedatum)), dmy(meldedatum))) %>%
  mutate(tag_nach_meldezeitraum = ymd("1970-01-01") + test) %>%
  select(-meldedatum, -test)



diff_fallzahlen <- data %>% inner_join(data_rki) %>%
  mutate(diff = count_rki - count_michael)

write_csv(diff_fallzahlen, "output/diff-fallzahlen.csv")


ggplot(data = diff_fallzahlen, aes(x = diff)) +
  geom_histogram(binwidth = 1)


#################################################################################################


inz <- data_inz %>% 
  filter(datenstand == tag_nach_meldezeitraum) %>%
  select(-datenstand) %>% 
  pivot_longer(!tag_nach_meldezeitraum, names_to = "LKNR", values_to = "count_michael") %>%
  mutate(LKNR = as.integer(LKNR))



inz_rki <- read_xlsx("input/Fallzahlen_Kum_Tab.xlsx", sheet = "LK_7-Tage-Inzidenz", skip = 4)

inz_rki <- inz_rki[-c(1,2)]
inz_rki <- inz_rki %>%
  pivot_longer(!LKNR, names_to = "meldedatum", values_to = "count_rki")

inz_rki <- inz_rki %>%
  mutate(test = ifelse(nchar(meldedatum) == 5, ymd("1899-12-30") + ddays(as.integer(meldedatum)), dmy(meldedatum))) %>%
  mutate(tag_nach_meldezeitraum = ymd("1970-01-01") + test) %>%
  select(-meldedatum, -test)



diff_inz <- inz %>% inner_join(inz_rki) %>%
  mutate(diff = count_rki - count_michael) %>%
  mutate(diff_round = round(diff))

write_csv(diff_inz, "output/diff-inzidenzen.csv")

ggplot(data = diff_inz, aes(x = diff)) +
  geom_histogram(binwidth = 1)
