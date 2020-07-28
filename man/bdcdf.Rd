\name{bdcdf}
\alias{bdcdf}
\title{compute confident interval of cdf}
\description{compute confident interval of cdf}
\usage{
	bdcdf(res, age = NA, ci = .95)
}
\arguments{
	\item{res}{the result of function badzupa()}
	\item{age}{the age baseline}
	\item{ci}{confident interval}
}
\details{
	This function is only efficient to compute confident interval of CDF from badzupa().
}
\value{
	\item{x}{age or x axis}
	\item{age}{same as arguments}
	\item{cp_mean}{the estimated value of CDF}
	\item{cp_CI}{the confident interval of CDF}
}
\examples{
	d <- rnorm(100, 50, 10)
	a1 <- badzupa(d)
	a2 <- bdcdf(a1)
	bdplot(a2)
}
