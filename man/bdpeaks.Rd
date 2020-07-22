\name{bdpeaks}
\alias{bdpeaks}
\title{compute reliability of peaks}
\description{compute reliability of peaks; the error of top and its certainty}
\usage{
	bdpeaks(res, detection = "top", eps = 0.03, minPts = 10, limmit = 0.05)
}
\arguments{
	\item{res}{the result of function llfreq()}
	\item{detection}{top or vally, which you want to detect}
	\item{eps}{eps parameter of DBSCAN}
	\item{minPts}{minPts parameter of DBSCAN}
	\item{limmit}{aaa}
}
\details{
	This function is only efficient to compute confident interval of PDF from llfreq().
}
\value{
	\item{p_mean}{age or x axis}
	\item{probability}{estimated frequency}
	\item{peak}{condfident interval of pdf}
	\item{cluster_min_xsd}{condfident interval of cdf}
	\item{cluster_max_xsd}{condfident interval of cdf}
	\item{cluster_min_ysd}{condfident interval of cdf}
	\item{cluster_max_ysd}{condfident interval of cdf}
	\item{x}{condfident interval of cdf}
}
\examples{
	d <- rnorm(100, 50, 10)
	a1 <- badzup(d)
	a2 <- bdpeaks(a1)
	bdplot(a2)
}
