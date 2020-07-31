bdplot <- function(res, ...){UseMethod("bdplot", res)}

bdplot.large <- function(res, ylim = c(NA,NA), type = "pdfci", ...){
  if(type == "pdfci"){
    col= "#0092CD"
    x <- res$x 
    p_mean <- res$p_mean 
    p_CIup <- res$p_CIup
    p_CIlow <- res$p_CIlow
    if(is.na(ylim[1])) ylim[1] <- 0
    if(is.na(ylim[2])) ylim[2] <- max(p_CIup)
    
    plot(x, p_mean ,type = "l", ylim = ylim,...)
    lines(x, p_CIup ,type = "l", col = col)
    lines(x, p_CIlow ,type = "l", col = col)
    
  }else if(type == "peaks") {
    col= "#0092CD"
    x <- res$x 
    p_mean <- res$p_mean 
    cluster_sd <- res$cluster_sd

    
    if(is.na(ylim[1])) ylim[1] <- 0
    if(is.na(ylim[2])) ylim[2] <- max(cluster_sd$ysdp)
    
    plot(x, p_mean ,type = "l", ylim = ylim,...)
    segments(x0 = cluster_sd$x,
             y0 = cluster_sd$ysdm,
             x1 = cluster_sd$x,
             y1 = cluster_sd$ysdp, col = col)
    segments(x0 = cluster_sd$xsdm,
             y0 = cluster_sd$y,
             x1 = cluster_sd$xsdp,
             y1 = cluster_sd$y)
    K <- length(cluster_sd$probability)
    for(i in 1:K){
      pro <- paste(sprintf("%3.0f", cluster_sd$probability[i] * 100), "%")
      text(cluster_sd$x[i], cluster_sd$y[i], pro)
    }
  }
  
}

bdplot.bdpdf <- function(res, ylim = c(NA,NA), ...){
	col= "#0092CD"
	x <- res$x 
	p_mean<- res$p_mean 
	p_CI <- res$p_CI
	if(is.na(ylim[1])) ylim[1] <- 0
	if(is.na(ylim[2])) ylim[2] <- max(p_CI[1,])

	plot(x, p_mean ,type = "l", ylim = ylim, ...)
	lines(x, p_CI[1,] ,type = "l", col = col)
	lines(x, p_CI[2,] ,type = "l", col = col)
}

bdplot.bdpeaks <- function(res, ylim = c(NA,NA), ...){
	col= "#0092CD"
	x <- res$x 
	p_mean<- res$p_mean 
	peak <- res$peak
	px_min <- res$cluster_min_xsd
	px_max <- res$cluster_max_xsd
	py_min <- res$cluster_min_ysd
	py_max <- res$cluster_max_ysd
	probability <- res$probability
	if(is.na(ylim[1])) ylim[1] <- 0
	if(is.na(ylim[2])) ylim[2] <- max(py_max)

	plot(x, p_mean ,type = "l", ylim = ylim, ...)
	segments(x0 = px_min,
		 y0 = peak$y,
		 x1 = px_max,
		 y1 = peak$y, col = col)
	segments(x0 = peak$x,
		 y0 = py_max,
		 x1 = peak$x,
		 y1 = py_min, col = col)
	K <- length(peak$x)
	for(i in 1:K){
		pro <- paste(sprintf("%3.0f", probability[i] * 100), "%")
		text(peak$x[i], peak$y[i],pro)
	}

}

bdplot.bdcdf <- function(res, ylim = c(NA,NA), ...){
	col= "#0092CD"
	x <- res$x
	cp_mean <- res$cp_mean
	cp_CI <- res$cp_CI
	age <- res$age
	if(is.na(ylim[1])) ylim[1] <- min(cp_CI[1,])
	if(is.na(ylim[2])) ylim[2] <- max(cp_CI[2,])

	a <- as_function(x, cp_mean, age)
	plot(x, cp_mean - a, type = "l", ylim = ylim, ...)
	for(i in 1:2){
		lines(x,cp_CI[i,], type = "l", col = col)
	}
}
#method
#pdf : list(type = "pdfci", ci = .95)
#pdf : list(type = "cdfci", age = NA)
#pekas: list(type = "peaks", detection = "peak", eps = 0.03, minPts = 10)


bdplot.badzupa <- function(res, method = list(type = "pdfci", ci = .95), ylim = c(NA,NA), ...){
  
  if(method$type == "pdfci") {
    if(is.null(method$ci)) method$ci <- .95
    
    res_pdf <- bdpdf(res, ci = method$ci)
    bdplot.bdpdf(res_pdf, ylim = ylim, ...)
    
  } else if(method$type == "cdfci") {
    if(is.null(method$age)) method$age <- NA
    
    res_pdf <- bdcdf(res, age = method$age)
    bdplot.bdcdf(res_pdf, ylim = ylim, ...)
    
  } else if(method$type == "peaks") {
    if(is.null(method$detection)) method$detection <- "peak"
    if(is.null(method$eps)) method$eps <- 0.03
    if(is.null(method$minPts)) method$minPts <- 10
    
    res_peaks <- bdpeaks(res, detection = method$detection, eps = method$eps, minPts = method$minPts)
    bdplot.bdpeaks(res_peaks, ylim = ylim, ...)
    
  }
}

