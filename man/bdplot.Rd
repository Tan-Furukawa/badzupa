\name{bdplot}
\alias{bdplot}
\alias{bdplot.large}
\alias{bdplot.bdpeaks}
\alias{bdplot.bdpdf}
\alias{bdplot.bdcdf}
\alias{bdplot.badzupa}
\title{plot the reslut}

\description{\code{bdplot()} is used to plot the result and draw the age spectrum. This function can used for all function in this package.}
\usage{
	bdplot(res,...)
}
\arguments{
	\item{res}{the result of function in this package.}
	\item{...}{more detailed settings: 
	  \itemize{
	  \item{\code{ylim}; the range of y axis}
	  \item{\code{method}; valid for \code{badzupa()} results. list having some arguments:
	    \itemize{
	    \item{\code{method = list(type = "pdfci", ci = 0.95)}; PDF estimation and its confident interval is 95\%.}
	    \item{\code{method = list(type = "cdfci", ci = 0.95)}; CDF estimation and its confident interval is 95\%.}
	    \item{\code{method = list(type = "peaks", eps = 0.03, minPts = 10)}   peaks estimation and its computation parameter. \code{eps} and \code{minPts} are parameter of DBSCAN algorism. If eps is larger (or minPts is smaller), peaks certainty is larger but age errors are also larger. This parameter is arbitary determined by user.}
	    }
	  }
	 \item{\code{type}; \code{"pdfci"} or \code{"peaks"}; valid for \code{bdlarge()} results. \code{"pdfci"} means this function plot PDF and it confident interval curves. \code{"peaks"} means this function plot estimated spectrum and the result of peaks estimation.}
  	}
	}

}
\details{
	This function is only efficient to compute confident interval of PDF from llfreq().
}

\examples{
data(franciscan100)
bd_result <- badzupa(franciscan100, method = "detrital")
bdplot(bd_result)
}
