\name{bdcdf}
\alias{bdcdf}
\title{compute confident interval of cdf}
\description{This function outputs the data to draw CDF and condfident interval.}
\usage{
	bdcdf(res, age = NA, ci = .95)
}
\arguments{
	\item{res}{the result from function badzupa()}
	\item{age}{the age baseline}
	\item{ci}{confident interval level}
}
\details{
	\code{bdcdf()} is used when you want to draw your owen R plot by using the CDF result of BAD-ZUPA.
}
\value{
bdcdf() return the list having four element:
	\item{x}{x axis}
	\item{age}{same as arguments}
	\item{cp_mean}{the estimated value of CDF}
	\item{cp_CI}{the confident interval of CDF}
}
\examples{
data(franciscan100)
bd_result <- badzupa(franciscan100)
cdf_result <- bdcdf(bd_result)

#plot cdf_result
x <- cdf_result$x
y <- cdf_result$cp_mean
yc <- cdf_result$cp_CI

plot(x, y, type = "l")
lines(x, yc[1,], col = "blue")
lines(x, yc[2,], col = "blue")
}
