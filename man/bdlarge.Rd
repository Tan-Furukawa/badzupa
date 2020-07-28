\name{bdlarge}
\alias{bdlarge}
\title{compute confident interval of pdf especially large data set}
\description{compute confident interval of pdf especially large data set}
\usage{
bdlarge(d, detection = "peaks" ci = 0.95, eps = 0.03, minPts = 10, xlim = c(NA,NA), overlap = 0.3, lim = 300)

}
\arguments{
	\item{d}{vector; one dimentional data}
	\item{detection}{"peak" of "valley"}
	\item{ci}{aaa}
	\item{eps}{aaa}
	\item{minPts}{aaa}
	\item{xlim}{aaa}
	\item{overlap}{aaa}
	\item{lim}{aaa}
}
\details{
	This function is only efficient to compute confident interval of PDF especially large number,
}
\value{
	\item{p_mean}{p_mean}
	\item{x}{age}
	\item{p_CIup}{condfident interval of pdf}
	\item{p_CIlow}{condfident interval of cdf}
	\item{cluster_sd}{cluster}
}
\examples{
# d <- rnorm(10000, 300, 50)
# a <- bdlarge(d)
# bdplot(a)
print("hello")
}
