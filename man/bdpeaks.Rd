\name{bdpeaks}
\alias{bdpeaks}
\title{compute reliability and their errors of peaks}
\description{Compute reliability of peaks (or valleys) and their errors with statisitical significance}
\usage{
	bdpeaks(res, detection = "peak", eps = 0.03, minPts = 10, diag = FALSE)
}
\arguments{
	\item{res}{list; the result of function badzupa()}
	\item{detection}{"peak" of "valley"; which you want to detect when compute peaks estimation.}
	\item{eps}{number; eps parameter of DBSCAN algorism. If larger, peaks certainty is larger but age errors are also larger. This parameter is arbitary determined by user.}
	\item{minPts}{integer; minPts parameter of DBSCAN algorism. If smaller, peaks certainty is larger but age errors are also larger. This parameter is arbitary determined by user.}
	\item{diag}{logical; checking the computation status.}
}
\details{
	\code{bdpeaks()} is used when you want to draw your own R plot by using the peaks estimation result of BAD-ZUPA.
}
\value{
\code{bdpeaks()} return the list having eight element:
	\item{p_mean}{estimated spectrum}
	\item{probability}{estimated reliability of each peak}
	\item{peak}{where is peaks}
	\item{cluster_min_xsd}{error of peaks coodinate (minimum value in the x direction)}
	\item{cluster_max_xsd}{error of peaks coodinate (maximun value in the x direction)}
	\item{cluster_min_ysd}{error of peaks coodinate (minimum value in the y direction)}
	\item{cluster_max_ysd}{error of peaks coodinate (maximum value in the y direction)}
	\item{x}{x axis}
}
\examples{
data(franciscan100)
bd_result <- badzupa(franciscan100)
res <- bdpeaks(bd_result)
plot(res$x, res$p_mean, type = "l")
segments(x0 = res$peak$x,
         y0 = res$cluster_min_ysd,
         x1 = res$peak$x,
         y1 = res$cluster_max_ysd)
segments(x0 = res$cluster_min_xsd,
         y0 = res$peak$y,
         x1 = res$cluster_max_xsd,
         y1 = res$peak$y)
}
