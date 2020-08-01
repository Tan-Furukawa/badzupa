\name{bdlarge}
\alias{bdlarge}
\title{compute when large data set}
\description{compute confident interval estimation, peaks estimation when data set is very large (N > 1000)}
\usage{
bdlarge(d, detection = "peak", ci = 0.95, eps = 0.03, minPts = 10, xlim = c(NA,NA), overlap = 0.2, lim = 100, initial = c(0.1,0.1), diag = FALSE)

}
\arguments{
	\item{d}{vector; one dimentional data}
	\item{detection}{"peak" of "valley"; which you want to detect when compute peaks estimation.}
	\item{ci}{number; confident interval level}
	\item{eps}{number; eps parameter of DBSCAN algorism. If larger, peaks certainty is larger but age errors are also larger. This parameter is arbitary determined by user.}
	\item{minPts}{integer; minPts parameter of DBSCAN algorism. If smaller, peaks certainty is larger but age errors are also larger. This parameter is arbitary determined by user.}
	\item{xlim}{vector having two elements; The range of computation area. defalut to \code{c(NA,NA)}, automatically determie the range}
	\item{overlap}{number; In \code{bdlarge()} computaion, data set is divided into several sub-data sets. When computation, some of the sample in sub-data sets are overlapped; where 1 means all data overlap and 0 means all data do not overlap. default to 0.3}
	\item{lim}{integer; In \code{bdlarge()} computaion, data set is divided into several sub-data sets. lim is the smallest size of sub-datasets. default to 100.}
	\item{initial}{vector having two elements; initial value of newthon method c(sigma, rho). Even if the initial value is determined arbitrarily, the result may be same.}
	\item{diag}{logical; checking the computation status.}
}
\details{
	bdlarge() is body function of BAD-ZUPA when detrital data is very large. This function corresponds to \code{badzupa()}, but there is a little difference, for example, CDF cannot be calculated.
}
\value{
bdlarge return the list having five element:
	\item{p_mean}{estimated value of estimated spectrum}
	\item{x}{x axis}
	\item{p_CIup}{upper condfident interval of pdf}
	\item{p_CIlow}{lower condfident interval of pdf}
	\item{cluster_sd}{the information about the result of peaks estimation}
}
\examples{
#when detect peaks
data(franciscan)
bd_result <- bdlarge(franciscan)
bdplot(bd_result, type = "peaks")
bdplot(bd_result, type = "pdfci")

#when detect valleys
data(franciscan)
bd_result <- bdlarge(franciscan, detection = "valley")
bdplot(bd_result, type = "peaks")
bdplot(bd_result, type = "pdfci")

}
