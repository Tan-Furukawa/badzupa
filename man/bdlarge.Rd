\name{bdlarge}
\alias{bdlarge}
\title{compute confident interval of pdf especially large data set}
\description{compute confident interval of pdf especially large data set}
\usage{
bdlarge(d, lim = 100, overlap = 0.3, xlim = c(NA,NA))

}
\arguments{
	\item{d}{vector; one dimentional data}
	\item{lim}{aaa}
	\item{overlap}{aaa}
	\item{xlim}{aaa}
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
