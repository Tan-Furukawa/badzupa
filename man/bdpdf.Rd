\name{bdpdf}
\alias{bdpdf}
\title{compute confident interval of pdf}
\description{compute confident interval of pdf}
\usage{
	bdpdf(res, ci = 0.95)
}
\arguments{
	\item{res}{the result of function llfreq()}
	\item{ci}{confident interval. Default to 0.95: 95\% confident interval}
}
\details{
	This function is only efficient to compute confident interval of PDF from llfreq().
}
\value{
	\item{x}{age or x axis}
	\item{p_mean}{estimated frequency}
	\item{p_CI}{condfident interval of pdf}
	\item{cp_mean}{condfident interval of cdf}
}
\examples{
	d <- rnorm(100, 50, 10)
	a1 <- badzupa(d)
	a2 <- bdpdf(a1)
	bdplot(a2)
}
