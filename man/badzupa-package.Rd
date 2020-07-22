\name{badzupa-package}
\alias{badzupa-package}
\docType{package}
\title{
	badzupa
}
\description{
	badzupa is the algorism to draw denisy function of certain data set of detrital zircon by using LA-LGP algorim (Riihimaki and Vehtari, 2014)
}
\details{
	badzupa is 
}
\author{
Tan Furukawa
}
\references{
Riihimaki, J., and Vehtari, A. (2014). Laplace approximation for logistic Gaussian process density estimation and regression. Bayesian analysis, 9(2), 425-448. Literature or other references for background information 
}

\keyword{padzupa}

\examples{
d <- rnorm(100, 50, 10)
a1 <- badzup(d)
a2 <- bdpdf(a1)
bdplot(a2)

}
