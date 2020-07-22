\name{bdcdf}
\alias{bdcdf}
\title{compute confident interval of cdf}
\description{compute confident interval of cdf}
\usage{
	bdcdf(res, age = NA)
}
\arguments{
	\item{res}{the result of function badzup()}
	\item{age}{the age baseline}
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
	a1 <- badzup(d)
	a2 <- bdcdf(a1)
	bdplot(a2)
}
