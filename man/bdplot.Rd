\name{bdplot}
\alias{bdplot}
\alias{bdplot.large}
\alias{bdplot.bdpeaks}
\alias{bdplot.bdpdf}
\alias{bdplot.bdcdf}
\title{compute confident interval of pdf}
\description{compute confident interval of pdf}
\usage{
	bdplot(res,...)
}
\arguments{
	\item{res}{the result of function llfreq()}
	\item{...}{the result of function llfreq()}
}
\details{
	This function is only efficient to compute confident interval of PDF from llfreq().
}

\examples{
	d <- rnorm(100, 50, 10)
	a1 <- badzup(d)
	a2 <- bdpdf(a1)
	bdplot(a2)
}
