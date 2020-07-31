\name{bdpdf}
\alias{bdpdf}
\title{compute confident interval of pdf}
\description{This function outputs the data to draw PDF and its condfident interval.}
\usage{
	bdpdf(res, ci = 0.95)
}
\arguments{
	\item{res}{the result from function badzupa()}
	\item{ci}{confident interval level}
}
\details{
	\code{bdpdf()} is used when you want to draw your owen R plot by using the PDF result of BAD-ZUPA.
}
\value{
\code{bdpdf()} return the list having four element:
	\item{x}{ x axis}
	\item{p_mean}{estimated pdf}
	\item{p_CI}{condfident interval of pdf}
	\item{cp_mean}{condfident interval of cdf}
}
\examples{
data(franciscan100)
bd_result <- badzupa(franciscan100)
pdf_result <- bdpdf(bd_result)

#plot cdf_result
x <- pdf_result$x
y <- pdf_result$p_mean
yc <- pdf_result$p_CI

plot(x, y, type = "l")
lines(x, yc[1,], col = "blue")
lines(x, yc[2,], col = "blue")
}
