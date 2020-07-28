 bdlarge <- function(
		    d,
		    detection = "peak",
		    ci = 0.95,
		    eps = 0.03,
		    minPts = 10,
		    xlim = c(NA,NA),
		    overlap = 0.3,
		    lim = 100
   		  ){

	# 	K <- 1
	# 	lim <- 500
		    
# 	threshold <- seq(min(d), max(d), length = K + 1)
	dens <- density(d, bw = "SJ")
	densx <- dens$x
	densy <- dens$y
# 	plot(densx,densy, type = "l")
# 	abline(v = threshold, col = "red")
	
	if(detection == "valley") b_peaks <- find_peaks(densy, detection = "peak")
	if(detection == "peak") b_peaks <- find_peaks(densy, detection = "valley")
       	b_peaks$y <- -b_peaks$y
	
# 	 	t_peaks <- find_peaks(densy)
# 	 	t_peaks$x <- t_peaks$x / 10 * (max(densx) - min(densx)) + min(densx)
 	b_peaks$x <- b_peaks$x / 10 * (max(densx) - min(densx)) + min(densx)
# 	b_peaks$x <- b_peaks$x / 10 * (max(densx) - min(densx)) + min(densx)
	threshold <- b_peaks$x
	threshold <- c(min(d), threshold, max(d))

	K <- length(threshold) - 1
# 	 	points(t_peaks)
#	 	points(b_peaks)



	m <- 200
	M <- 10^3

	# 	delta <- (max(d) - min(d)) / 100
	# 	threshold <- c()
	# 	for(i in 1:K){
	# 		threshold[i] <- delta * i + i * (i - 1) / (K * (K - 1)) * (max(d) - min(d) - delta * K) + min(d)
	# 	}
	# 	threshold <- c(min(d), threshold)
	# 
	div_d <- list()
	# 
	for (i in 1:K){
		a <- d[threshold[i] <= d & d <= threshold[i + 1]]
		div_d <- c(div_d, list(a))
	}
	
	



	#  	 stop()
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
#  	   stop()


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


	plot(x = NA, y = NA, xlim = c(min(d), max(d)), ylim = c(0,K))
	#plot(densx, densy, type = "l")
	for(i in 1:K){
		points(div_d[[i]], numeric(length(div_d[[i]])) + i)
	}
	abline(v = threshold)
	#     stop()
	conf <- list()
	peak <- list()
	dd <- list()

	dx <- matrix(0, ncol = m, nrow = K) 
	p_mean <-matrix(0, ncol = m, nrow = K) 
	p_CIup <-matrix(0, ncol = m, nrow = K) 
	p_CIlow <-matrix(0, ncol = m, nrow = K) 
	# peaks <- data.frame(x = c(), y = c(), probability = c())


	initial = c(0.2,2,1)
	cluster_sd <- data.frame(id = c(), x = c(), y = c(), xsdm = c(), xsdp = c(), ysdm = c(), ysdp = c(), probability = c())

	for(i in 1:K){
	  cat(i,"/",K,"\n")

		if(i == 1 & !is.na(xlim[1])){
			dd <- badzupa(div_d[[i]], xlim = c(xlim[1], NA),  m = 200,  delta = 0, initial = initial)
		} else if(i == K & !is.na(xlim[2])) {
			dd <- badzupa(div_d[[i]], xlim = c(NA, xlim[2]),  m = 200,  delta = 0, initial = initial)
		} else {
			dd <- badzupa(div_d[[i]], m = 200,  delta = 0, initial = initial)
		}


		dx[i,] <- dd$x
		conf <-bdpdf(dd, ci)

		pe <- bdpeaks(dd, detection = detection, minPts = minPts, eps = eps)
		cluster_sd <- rbind(cluster_sd, data.frame(id = numeric(length(pe$cluster_min_xsd)) + i,
                              							   x = pe$peak$x,
                              							   y = pe$peak$y,
                              							   xsdm = pe$cluster_min_xsd,
                              							   xsdp = pe$cluster_max_xsd,
                              							   ysdm = pe$cluster_min_ysd,
                              							   ysdp = pe$cluster_max_ysd,
                              							   probability = pe$probability))

		# 	peak <- bdpeaks(dd)
		# 	peaks <- rbind(peaks)
		p_mean[i,] <- conf$p_mean
		p_CIup[i,] <- conf$p_CI[1,]
		p_CIlow[i,] <- conf$p_CI[2,]

#		plot(dx[i,],  conf$p_mean, type = "l")
#		lines(dx[i,], conf$p_CI[1,], type = "l")
#		lines(dx[i,], conf$p_CI[2,], type = "l")
#		rug(div_d[[i]])
	}


#	rug(franciscan)
#	abl#ine(v = threshold)



	a <- numeric(K)
	for(i in 1:K){
		a[i] <- length(d[min(dx[i,]) < d & d < max(dx[i,])] )
	}


	for(i in 1:K){
		p_mean[i,] <- p_mean[i,] * a[i]/sum(a)
		p_CIup[i,] <- p_CIup[i,] * a[i]/sum(a)
		p_CIlow[i,] <- p_CIlow[i,] * a[i]/sum(a)
	}


#	plot(x = NA, y = NA, ylim =c(0,0.006), xlim = c(0,2500))
#	for (i in 1:3){
#	  lines(dx[i,], p_mean[i,])
#	}
	
	# 	plot(x = NA, y = NA, xlim = c(min(d), max(d)), ylim = c(0,10))
	# 	for(i in 1:l) {
	# 		lines(dx[i,], numeric(length(dx[i,])) + i)
	# 
	# 	}

	#       	stop()


	cutter <- function(vecx, vecy = NA, out = 0.05, srt = T, last = T){
		m <- length(vecx)
		if(srt) minx <- min(vecx) + (max(vecx) - min(vecx)) * out else minx <- min(vecx)
		if(last) maxx <- max(vecx) - (max(vecx) - min(vecx)) * out else maxx <- max(vecx)

# 		x <- seq(minx + 10^(-4), maxx - 10^(-4), length = m)
		x <- seq(minx, maxx, length = m)
		if(is.na(vecy[1])) return(x)

		y <- numeric(m)
		for(i in 1:m){
			y[i] <- as_function(vecx, vecy, x[i])
		}
		return(data.frame(x = x, y = y))
	}

	l <- length(dx[,1])



	dx[1,] <- cutter(dx[1,], srt = F)
	p_mean[1,] <- cutter(dx[1,], p_mean[1,], srt = F)$y
	p_CIup[1,] <- cutter(dx[1,], p_CIup[1,], srt = F)$y
	p_CIlow[1,] <- cutter(dx[1,], p_CIlow[1,], srt = F)$y
	if(l >= 3){
		for(i in 2:(l - 1)){
			dx[i,] <- cutter(dx[i,])
			p_mean[i,] <- cutter(dx[i,], p_mean[i,])$y
			p_CIup[i,] <- cutter(dx[i,], p_CIup[i,])$y
			p_CIlow[i,] <- cutter(dx[i,], p_CIlow[i,])$y
		}
	}


	dx[l,] <- cutter(dx[l,], last = F)
	p_mean[l,] <- cutter(dx[l,], p_mean[l,], last = F)$y
	p_CIup[l,] <- cutter(dx[l,], p_CIup[l,], last = F)$y
	p_CIlow[l,] <- cutter(dx[l,], p_CIlow[l,], last = F)$y

	if(is.na(xlim[1])) mind <- min(d) else mind <- xlim[1]
	if(is.na(xlim[2])) maxd <- max(d) else maxd <- xlim[2]

	x <- seq(mind, maxd, length = M)
	# 	rug(d)
#  	 	stop()
	

	 	erf <- function(x) 2 * pnorm(x * sqrt(2)) - 1
	 	div_by_erf <- function(num, j) (erf(4 * (j / num) - 2) + 1) / 2
		
# 	  	yy <- numeric(50)
# 	  	for(j in 1:50){
# 	  		yy[j] <- div_by_erf(50,j)
	  
	#  	}
	#  	plot(1:50,yy)



	#  	xx <- seq(-3,3,length = 100)
	# 	plot(xx,erf(xx), type = "l")
#       	 	stop()

	merge_div <- function(dx, mat){
		p <- numeric(M)
		l <- length(dx[,1]) 
		 		
# 		plot(x = NA, y = NA, xlim = c(0,300), ylim = c(0,0.01))
		# 		for(i in 1:l){
		# 			lines(dx[i,], numeric(length(dx[i,])) + 0.001 * i)
		# 		}
		
		for(i in 1:l){
			if(i != l){
				x_overlap <- x[min(dx[i + 1,]) <= x & x <= max(dx[i,])]
				num <- (1:M)[min(dx[i + 1,]) <= x & x <= max(dx[i,])]
			}
			# 			lines(x_overlap, numeric(length(x_overlap)) + 2 * i * 0.1)

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
# 		lines(x,p,type = "l")
		# 		local_x <- x[max(dx[l]) <= x]
		# 		local_num <- (1:M)[max(dx[l]) <= x]
		# 
		# 		for(j in 1:length(local_num)){
		# 			p[local_num][j] <- as_function(dx[l,],mat[l,], local_x[j])
		# 		}

		return(data.frame(x = x, p = p))
	}

	# 	ttt <- merge_div(dx, p_mean)

 	  	plot(merge_div(dx, p_mean), type = "l")
	#  	for (i in 1:l){
	#  		lines(dx[i,], p_mean[i,], col = "red")
	#  	}
# 	     	stop()


	normalize <- function(x, vec) {
		mm <- length(vec)
		ans <- mm / ((max(x) - min(x)) * sum(vec))
		return(ans)
	}

	p_mean <- merge_div(dx, p_mean)$p
# 	plot(x,p_mean)

	np <- normalize(x, p_mean)
	p_mean <- np * p_mean

	p_CIup <- merge_div(dx, p_CIup)$p * np
	p_CIlow <- merge_div(dx, p_CIlow)$p * np

	#------------------------------------------------------------
	#peaks_estimation
	#------------------------------------------------------------

	peaks <- find_peaks(p_mean, detection = detection)
	peaks$x <- (max(x) - min(x)) / 10 * peaks$x + min(x)

	closest <- numeric(length(cluster_sd$x))
	cluster_sd <- na.omit(cluster_sd)

	for(i in 1:length(cluster_sd$x)){
		absp <- abs(peaks$x[i] - cluster_sd$x)
		closest[which((absp == min(absp)))[1]] <- i
	}


#  	  	stop()
	cluster_sd <- cluster_sd[closest != 0,][order(closest[closest != 0]),]

	cluster_sd$ysdm <- peaks$y / (cluster_sd$y) * cluster_sd$ysdm
	cluster_sd$ysdp <- peaks$y / (cluster_sd$y) * cluster_sd$ysdp
	cluster_sd$x <- peaks$x
	cluster_sd$y <- peaks$y



	plot(x, p_mean, type = "l", ylim = c(0, max(p_CIup)))
	lines(x, p_CIup, type = "l")
	lines(x, p_CIlow, type = "l")

	points(cluster_sd$x,cluster_sd$y)
	#abline(v = threshold)

	segments(x0 = cluster_sd$x,
		 y0 = cluster_sd$ysdm,
		 x1 = cluster_sd$x,
		 y1 = cluster_sd$ysdp)

	segments(x0 = cluster_sd$xsdm,
		 y0 = cluster_sd$y,
		 x1 = cluster_sd$xsdp,
		 y1 = cluster_sd$y)

	rug(d)

	ans <- list(p_mean = p_mean,
		    x = x,
		    p_CIup = p_CIup,
		    p_CIlow = p_CIlow,
		    cluster_sd = cluster_sd)
	class(ans) <- "large"

	return(ans)
}
#bdplot(ans)


