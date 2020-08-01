# badzupa

## Overviwe
Bayesian Approach for Detrital Zircon U–Pb ages (BAD-ZUPA) is a new evaluation protocol and based on computer algorithm Riihimaki and Vehtari (2014)'s Laplace approximation with logistic Gaussian process regression (LA-LGP). BAD-ZUPA provides confidence intervals for detrital zircon spectra (PDF) and its cumulative distribution (CDF). In addition it automatically detect peaks and valleys in the spectra with their respective 95% confidence interval in age and their significance level in percentage.

## Installation
Please install R (http://r-project.org) and open R console to enter following prompt: 
```r
install.packages("devtools")
library(devtools)
install_github("Tan-Furukawa/badzupa")
```

## Examples

The most basic function in badzupa `badzupa()` is nessesary for all coputation. The argument is one dimentional data. This function is developed for evaluating detrital zircon age distribution, but the argument applied for all continious data.

* `bdplot()` is used for plotting PDF and CDF:
 
```r
library(badzupa)
data(franciscan100)
bd_result <- badzupa(franciscan100)
bdplot(bd_result)
```

## Author
Tan Furukawa

e-mail: furukawatan@gmail.com

## Reference

- Alan, G, Frank, B., Tetsushima M. and Xuefei M. (2019) Package ‘mvtnorm’: Multivariate Normal and t Distributions. R package version 1.0-12. https://CRAN.R-project.org/package=mvtnorm

- Furukawa, T. and Tsujimori, T. (2019) Bayesian statistical evaluation method for detrital zircon geochronology. Abstract JpGU 2019 Meeting, MGI33-P02, Chiba (Japan). https://confit.atlas.jp/guide/event/jpgu2019/subject/MGI33-P02/detail

- R Core Team (2013) R: A language and environment for statistical computing. R Foundation for Statistical Computing, Vienna, Austria. http://www.R-project.org/

- Riihimaki, J., and Vehtari, A. (2014) Laplace approximation for logistic Gaussian process density estimation and regression. Bayesian analysis, v. 9, no. 2, p. 425-448, https://arxiv.org/abs/1211.0174v3
