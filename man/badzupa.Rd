\name{badzupa}
\alias{badzupa}
\title{execute LA-LGP algorism}
\description{All computation must use this fuction.}
\usage{
	badzupa(d,  method = "auto", xlim = c(NA,NA), initial = c(0.1,0.1,0.1), m = 200, delta = 1/25, round = TRUE)
}
\arguments{
	\item{d}{vector; one dimentional data}
	\item{method}{"auto", "normal" or "detrital"; "auto" method is automatically change "normal" or "detrital". "normal" method is computed by two parameters: sigma, rho. "detrital" mehtod is computed by three parameters: sigma, rho0, eta. If \code{max(d) - min(d)} is more than 1000 (Ma) then "detrital" method is recommended.
	see Furukawa et al., (2020)}
	\item{xlim}{vector having two elements; The range of computation area. defalut to \code{c(NA,NA)}, automatically determie the range}
	\item{initial}{vector having three elements; initial value of newthon method c(sigma, rho, eta). Even if the initial value is determined arbitrarily, the result may be same.}
	\item{m}{number; Number of divisions on the x-axis. default to 200.}
	\item{delta}{number; The lneght of the buffer zone on both sides of the age axis. This parameter is only used when \code{xlim} have \code{NA} element. In this case \code{xlim} will be \code{c(min(d) - delta * (max(d) - min(d)), max(d) + delta * (max(d) - min(d)))}}
	\item{round}{logical; If \code{TRUE}, when \code{d} contains an integer value, badzupa naturally disperse that integer value.}
}

\details{
	badzupa() is the most important body function of BAD-ZUPA. The appropriate hyperparameters are calculated by this function.
}

\value{
badzupa return the list having five element:
	\item{hyp}{best hyperparameters; rho, sigma (and eta)}
	\item{x}{x axis}
	\item{f_hat}{estimated value of spectrum. exp(f_hat) is proportional to the spectum}
	\item{y}{data vector.}
	\item{likelihood}{the quality of evaluatiton}
}
\examples{
data(franciscan100)
# normal method
bd_result <- badzupa(franciscan100, method = "normal")
bdplot(bd_result)

# detrital method
bd_result <- badzupa(franciscan100, method = "detrital")
bdplot(bd_result)
}
