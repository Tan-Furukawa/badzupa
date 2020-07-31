  bdlarge <- function(
 		    d,
		    detection = "peak",
		    ci = 0.95,
		    eps = 0.03,
		    minPts = 10,
		    xlim = c(NA,NA),
		    overlap = 0.2,
		    lim = 100,
		    diag = FALSE
   		  ){
  

	dens <- density(d, bw = "SJ")
	densx <- dens$x
	densy <- dens$y

	
	if(detection == "valley") b_peaks <- find_peaks(densy, detection = "peak", lim = 0.001)
	if(detection == "peak") b_peaks <- find_peaks(densy, detection = "valley", lim = 0.001)
       	b_peaks$y <- -b_peaks$y

 	b_peaks$x <- b_peaks$x / 10 * (max(densx) - min(densx)) + min(densx)

	threshold <- b_peaks$x
	threshold <- c(min(d), threshold, max(d))

	K <- length(threshold) - 1

	m <- 200
	M <- 10^3


	div_d <- list()
	# 
	for (i in 1:K){
		a <- d[threshold[i] <= d & d <= threshold[i + 1]]
		div_d <- c(div_d, list(a))
	}
	
	




	while(sum(sapply(div_d, length) < lim) >= 1){
		a <- c(Inf,sapply(div_d, length), Inf)
		i <- which(a < lim)[1]

		if(is.na(i)) break

		if(a[i - 1] < a[i + 1]){
			div_d[[i - 2]] <- c(div_d[[i - 2]], div_d[[i - 1]])
			threshold <- threshold[-(i - 1)]
		}else{
			div_d[[i + 0]] <- c(div_d[[i + 0]], div_d[[i - 1]])
			threshold <- threshold[-(i)]
		}
		div_d <- div_d[-(i - 1)]
	}
	


	K <- length(div_d)



	div_d_with_overlap <- list()
	overlap <- overlap * diff(threshold)


	for(i in 1:K) {
		div_d_with_overlap <- c(div_d_with_overlap, list(i))
		if(i == 1) {
			u <- div_d[[i + 1]]
			div_d_with_overlap[[i]] <- c(div_d[[i]], u[u < min(u) + overlap[i + 1]])
		}else if(i == K) {
			l <- div_d[[i - 1]]
			div_d_with_overlap[[i]] <- c(div_d[[i]], l[l > max(l) - overlap[i - 1]])
		}else{
			u <- div_d[[i + 1]]
			l <- div_d[[i - 1]]
			div_d_with_overlap[[i]] <- c(div_d[[i]], u[u < min(u) + overlap[i + 1]], l[l > max(l) - overlap[i - 1]])
		}

}


	div_d <- div_d_with_overlap

	if(diag) {
	  plot(x = NA, y = NA, xlim = c(min(d), max(d)), ylim = c(0,K))
	  for(i in 1:K){
	    points(div_d[[i]], numeric(length(div_d[[i]])) + i)
	  }
	  abline(v = threshold)
	}
	

	conf <- list()
	peak <- list()
	dd <- list()

	dx <- matrix(0, ncol = m, nrow = K) 
	p_mean <-matrix(0, ncol = m, nrow = K) 
	p_CIup <-matrix(0, ncol = m, nrow = K) 
	p_CIlow <-matrix(0, ncol = m, nrow = K) 

	initial = c(0.2,2,1)
	cluster_sd <- data.frame(id = c(), x = c(), y = c(), xsdm = c(), xsdp = c(), ysdm = c(), ysdp = c(), probability = c())

	for(i in 1:K){
	  cat(i,"/",K,"\n")

		if(i == 1 & !is.na(xlim[1])){
			dd <- badzupa(div_d[[i]], method = "normal", xlim = c(xlim[1], NA),  m = 200,  delta = 0, initial = initial)
		} else if(i == K & !is.na(xlim[2])) {
			dd <- badzupa(div_d[[i]], method = "normal", xlim = c(NA, xlim[2]),  m = 200,  delta = 0, initial = initial)
		} else {
			dd <- badzupa(div_d[[i]], method = "normal", m = 200,  delta = 0, initial = initial)
		}


		dx[i,] <- dd$x
		conf <-bdpdf(dd, ci)


		pe <- bdpeaks(dd, detection = detection, minPts = minPts, eps = eps, diag = diag)
		cluster_sd <- rbind(cluster_sd, data.frame(id = numeric(length(pe$cluster_min_xsd)) + i,
                              							   x = pe$peak$x,
                              							   y = pe$peak$y,
                              							   xsdm = pe$cluster_min_xsd,
                              							   xsdp = pe$cluster_max_xsd,
                              							   ysdm = pe$cluster_min_ysd,
                              							   ysdp = pe$cluster_max_ysd,
                              							   probability = pe$probability))

		p_mean[i,] <- conf$p_mean
		p_CIup[i,] <- conf$p_CI[1,]
		p_CIlow[i,] <- conf$p_CI[2,]
		

	}



	a <- numeric(K)
	for(i in 1:K){
		a[i] <- length(d[min(dx[i,]) < d & d < max(dx[i,])] )
	}

	for(i in 1:K){
		p_mean[i,] <- p_mean[i,] * a[i]/sum(a)
		p_CIup[i,] <- p_CIup[i,] * a[i]/sum(a)
		p_CIlow[i,] <- p_CIlow[i,] * a[i]/sum(a)
	}


	cutter <- function(vecx, vecy = NA, out = .5, srt = T, lst = T, xlim = c(NA,NA)){

		m <- length(vecx)

		if(is.na(xlim[1])) xlim[1] <- min(vecx)
		if(is.na(xlim[2])) xlim[2] <- max(vecx)

 		if(srt) minx <- (1 - out) * min(vecx) + out * xlim[1] else minx <- min(vecx)
 		if(lst) maxx <- (1 - out) * max(vecx) + out * xlim[2] else maxx <- max(vecx)

		x <- seq(minx, maxx, length = m)
		if(is.na(vecy[1])) return(x)

		y <- numeric(m)
		for(i in 1:m){
			y[i] <- as_function(vecx, vecy, x[i])
		}
		return(data.frame(x = x, y = y))
	}


	l <- length(dx[,1])
	lt <- length(threshold)


#	stop() 
#	plot(NA, NA, xlim = c(0, 500), ylim = c(0,0.01))
#	for(i in 1:4) lines(dx[i,], p_mean[i,], col = "blue")
#	abline(v = threshold, col = "red")
	
	dx2 <- dx
	dx[1,] <- cutter(dx2[1,], xlim = c(threshold[1], threshold[2]))
	p_mean[1,] <- cutter(dx2[1,], p_mean[1,], xlim = c(threshold[1], threshold[2]))$y
	p_CIup[1,]  <- cutter(dx2[1,], p_CIup[1,],  xlim = c(threshold[1], threshold[2]))$y
	p_CIlow[1,] <- cutter(dx2[1,], p_CIlow[1,], xlim = c(threshold[1], threshold[2]))$y

	if(l >= 3){
		for(i in 2:(l - 1)){
	dx[i,] <- cutter(dx2[i,], xlim = c(threshold[i], threshold[i + 1]))
	p_mean[i,] <- cutter(dx2[i,], p_mean[i,], xlim = c(threshold[i], threshold[i + 1]))$y
	p_CIup[i,]  <- cutter(dx2[i,], p_CIup[i,],  xlim = c(threshold[i], threshold[i + 1]))$y
	p_CIlow[i,] <- cutter(dx2[i,], p_CIlow[i,], xlim = c(threshold[i], threshold[i + 1]))$y
		}
	}

	dx[l,] <- cutter(dx2[l,], xlim = c(threshold[lt - 1], threshold[lt]))
	p_mean[l,] <- cutter(dx2[l,], p_mean[l,], xlim = c(threshold[lt - 1], threshold[lt]))$y
	p_CIup[l,]  <- cutter(dx2[l,], p_CIup[l,],  xlim = c(threshold[lt - 1], threshold[lt]))$y
	p_CIlow[l,] <- cutter(dx2[l,], p_CIlow[l,], xlim = c(threshold[lt - 1], threshold[lt]))$y

	if(is.na(xlim[1])) mind <- min(d) else mind <- xlim[1]
	if(is.na(xlim[2])) maxd <- max(d) else maxd <- xlim[2]
	

	x <- seq(mind, maxd, length = M)


	erf <- function(x) 2 * pnorm(x * sqrt(2)) - 1
	div_by_erf <- function(num, j) (erf(4 * (j / num) - 2) + 1) / 2
		


	merge_div <- function(dx, mat){
		p <- numeric(M)
		l <- length(dx[,1]) 

		
		for(i in 1:l){
			if(i != l){
				x_overlap <- x[min(dx[i + 1,]) <= x & x <= max(dx[i,])]
				num <- (1:M)[min(dx[i + 1,]) <= x & x <= max(dx[i,])]
			}


			if(i == 1){
				local_x <- x[x < min(dx[i + 1, ]) ]
				local_num <- (1:M)[x < min(dx[i + 1, ]) ]
			}else if(i == l){
				local_x <- x[max(dx[i - 1, ]) <= x]
				local_num <- (1:M)[max(dx[i - 1, ]) <= x]
			}else{
				local_x <- x[max(dx[i - 1, ]) <= x & x < min(dx[i + 1, ]) ]
				local_num <- (1:M)[max(dx[i - 1, ]) <= x & x < min(dx[i + 1, ]) ]
			}

			for(j in 1:length(local_num)){
				p[local_num][j] <- as_function(dx[i,],mat[i,], local_x[j])
			}

			if(i != l){
				for(j in 1:length(num)){
					a <- div_by_erf(length(num),j)
					p[num][j] <- as_function(dx[i,],mat[i,], x_overlap[j]) * (1 - a) +
						as_function(dx[i + 1,], mat[i + 1,], x_overlap[j]) * a
				}
			}
		}

		return(data.frame(x = x, p = p))
	}


	normalize <- function(x, vec) {
		mm <- length(vec)
		ans <- mm / ((max(x) - min(x)) * sum(vec))
		return(ans)
	}

	p_mean <- merge_div(dx, p_mean)$p


	np <- normalize(x, p_mean)
	p_mean <- np * p_mean

	p_CIup <- merge_div(dx, p_CIup)$p * np
	p_CIlow <- merge_div(dx, p_CIlow)$p * np
	#------------------------------------------------------------
	#peaks_estimation
	#------------------------------------------------------------
	peaks <- find_peaks(p_mean, detection = detection)
	peaks$x <- (max(x) - min(x)) / 10 * peaks$x + min(x)

	cluster_sd <- na.omit(cluster_sd)


	lc <- length(cluster_sd$x)
	lp <- length(peaks$x)
	diff_peaks_cluster <- matrix(ncol = lp, nrow = lc, 0)
	for(i in 1:lc) for(j in 1:lp) diff_peaks_cluster[i,j] <- abs(peaks$x[j] - cluster_sd$x[i])

	find_min <- function(vec) (abs(vec) == min(abs(vec)))
	which_is_true_peaks <- t(apply(diff_peaks_cluster, 1, find_min))
	
	true_peaks <- c()
	for(i in 1:lp) {
	tp <- which_is_true_peaks[,i]
	if(sum(tp) == 1) true_peaks <- c(true_peaks, (1:lc)[tp])
	if(sum(tp) >= 2) true_peaks <- c(true_peaks,
					 (1:lc)[(diff_peaks_cluster[,i] == min(diff_peaks_cluster[,i][tp]))][1])
	}

	cluster_sd <- cluster_sd[true_peaks, ]
	peaks <- peaks[as.logical(apply(which_is_true_peaks, 2, sum)),]
	
	cluster_sd$ysdm <- peaks$y / (cluster_sd$y) * cluster_sd$ysdm
	cluster_sd$ysdp <- peaks$y / (cluster_sd$y) * cluster_sd$ysdp

	cluster_sd$y <- peaks$y

	if(diag == T) {
	  plot(x, p_mean, type = "l", ylim = c(0, max(p_CIup)))
	  points(cluster_sd[,c("x","y")])
	  lines(x, p_CIup, type = "l")
	  lines(x, p_CIlow, type = "l")

	  segments(x0 = cluster_sd$x,
	           y0 = cluster_sd$ysdm,
	           x1 = cluster_sd$x,
	           y1 = cluster_sd$ysdp)
	  
	  segments(x0 = cluster_sd$xsdm,
	           y0 = cluster_sd$y,
	           x1 = cluster_sd$xsdp,
	           y1 = cluster_sd$y)
	  

	  
	  rug(d)
	}
	

	ans <- list(p_mean = p_mean,
		    x = x,
		    p_CIup = p_CIup,
		    p_CIlow = p_CIlow,
		    cluster_sd = cluster_sd)
	class(ans) <- "large"

	return(ans)
}


