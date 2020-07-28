\name{badzupa-package}
\alias{badzupa-package}
\docType{package}
\title{
	badzupa
}
\description{
	badzupa is the algorism to PDF/CDF denisy function of age data set of detrital zircon by refering to LA-LGP algorim (Riihimaki and Vehtari, 2014)
}
\details{
BAD-ZUPA (Bayesian Approach for Detrital Zircon U–Pb ages) is a new evaluation protocol based on Riihimäki & Vehtari (2014)'s Laplace approximation with logistic Gaussian process regression (LA-LGP). BAD-ZUPA evaluates the probability density function (PDF) and their integration, the cumulative distribution function (CDF) through two algorithms: (I) confidence interval estimation and (II) peaks estimation. With BAD-ZUPA we can evaluate the confidence we have on a detrital zircon spectrum and the significance of the observed peaks. In addition, BAD-ZUPA is a powerful tool to estimate how many more zircons we would need to analyze to obtain a desired level of confidence. 
}
\author{
	Tan Furukawa
}
\references{
	T., Furukawa, T., Tsujimori and D., Pastor-Galán (2020, in prep) A Bayesian Approach for Detrital Zircon U–Pb ages (BAD-ZUPA): A new application using Laplace approximation with logistic Gaussian process regression
	Riihimaki, J., and Vehtari, A. (2014). Laplace approximation for logistic Gaussian process density estimation and regression. Bayesian analysis, 9(2), 425-448. Literature or other references for background information 
}

\keyword{padzupa}

\examples{
library(devtools)
data(franciscan)
bd_result <- badzupa(franciscan100, method = “normal”)

bdplot(bd_result, method = list(type = "pdfci", ci = 0.95))
}
