# badzupa

# installation
```r
install.packages("devtools)
devtools::install_github("Tan-Furukawa/badzupa")
```

# example 
```r
library(badzupa)
# put your data into d
set.seed(1); d <- rnorm(100) 

a1 <- bddensity(d)
a2 <- bdquantile(a1)

diagnosis(a1,a2)
```
