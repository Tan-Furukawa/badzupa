\name{badzup}
\alias{badzup}
\title{execute LA-LGP algorism}
\description{All computation must use this fuction.}
\usage{
	badzup(d, xlim = c(NA,NA),initial = c(1,2,.1), m = 200, method = "normal", delta = 1/25, round = TRUE)
}
\arguments{
	\item{d}{vector; one dimentional data}
	\item{xlim}{vector having two elements; the range of computation area. defalut to c(NA,NA), automatically determie the range}
	\item{initial}{initial value of newthon method}
	\item{m}{discrixed rate; default to 200.}
	\item{method}{normal or detrital; see Furukawa et al., (2020)}
	\item{delta}{aaaa}
	\item{round}{aaaa}
}
\details{
	aaa
}
\value{
	\item{hyp}{hyperparameters; rho, sigma (and eta)}
	\item{x}{x axis}
	\item{f_hat}{estimated value of spectrum. exp(f_hat) is proportional to the spectum}
	\item{y}{data vector}
	\item{likelihood}{the quality of evaluatiton}
}
\examples{
	d <- rnorm(100, 50, 10)
	a1 <- badzup(d)
	a2 <- bdpdf(a1)
	bdplot(a2)
}
