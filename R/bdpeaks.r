 bdpeaks <- function(
			     res,
			     detection = "peak",
			     eps = 0.03,
			     minPts = 10
  			     ){

	steps = 1000L
	x <- res$x
	hyp <- res$hyp
	y <- res$y
	m <- length(y)
	f0 <- res$f
	p_mean <- softmax(f0)

	nx <- seq(0, 10, length = m)
	if(detection == "peak") peak <- find_peaks(p_mean)
	if(detection == "valley") peak <- find_peaks(p_mean, detection = "valley")

	if(sum(is.na(peak))){
	       ans <- list(
			   probability = NA,
			   peak = peak,
			   cluster_min_xsd = NA,
			   cluster_max_xsd = NA,
			   cluster_min_ysd = NA,
			   cluster_max_ysd = NA
	       )
		return(ans)
	}

	K <- make_kernel(hyp, nx)
	f <- make_distribution(K, f0, y, steps)

	p <- matrix(0, nrow = steps, ncol = m) # 
	for(i in 1:steps){
		p[i,] <- softmax(f[i,])
	}
	
# 	stop()
#  	 plot(nx, p_mean, type = "l")
# 	for(i in 1:40){
# 		lines(nx, p[i,], type = "l")
# 
# 	}
# 	lines(nx, p[1,], type = "l")
# 	 lines(nx, p[2,], type = "l")
	p <- na.omit(p)
	steps <- length(p[,1])


	peaks <- data.frame(x = c(), y = c()) 
	id <- c()

	for(i in 1:steps){
		if(detection == "peak") fp <- find_peaks(p[i,])
		if(detection == "valley") fp <- find_peaks(p[i,], detection = "valley")

		fp_x <- fp$x
		fp_y <- fp$y

		if(length(fp_x) == 0){
			peaks <- rbind(peaks, data.frame(x = NA, y = NA))
			id <- c(id, i)
		}else{
			peaks <- rbind(peaks, data.frame(x = fp_x, y = fp_y))
			id <- c(id, numeric(length(fp_x)) + i)
		}
	}

#   	 plot(nx, p_mean, type = "l", ylim = c(0,0.03))
# 	for(i in 2:2){
# 		points(peaks[id == i,])
# 	}
# 	lines(nx, p[2,])
# 	
# 	plot(nx, p[2,], type = "l")
# 	points(find_peaks(p[2,]))
# 
# 	points(peaks[id == i,])


	# points(peaks)
	xmax <- max(nx)
	xfilter <- c(0, xmax[length(xmax)])
	yfilter <- c(0, 1)

	# plot(x, p_mean, type = "l")
	#preparation
	#-------------------------------------------------------------------------------
	##data preparation
	k <- length(peak$x)
	peaks <- peaks[xfilter[1] < peaks[,1] &
		       peaks[,1] < xfilter[2] &
		       yfilter[1] < peaks[,2] &
		       peaks[,2] < yfilter[2], ]

	       M <- length(peaks$x)

	       if(k > 1){
		       threshold <- numeric(k - 1)
		       for(i in 1:length(threshold)){
			       threshold[i] <- (peak$x[i] + peak$x[i + 1]) / 2

		       }
	       } else {
		       threshold <- numeric(0)
	       }
	       threshold <- c(0, threshold, 10)


	       which_peak <- numeric(M)
	       for(i in 1:k){
		       which_peak[threshold[i] < peaks$x & peaks$x < threshold[i + 1]] <- i
	       }

	       cluster <- numeric(M)


	       where_is_center_of_gravity <- function(dat, cluster){
		       uni_vec <- unique(cluster)
		       ul <- length(uni_vec)

		       center_of_gravity <- data.frame(cluster = numeric(length(ul)),
						       size = numeric(length(ul)),
						       mean = numeric(length(ul)))
		       #cluster, num, x, y
		       for(i in 1:ul){
			       d <- dat[cluster == uni_vec[i]]
			       center_of_gravity[i, ] <- c(uni_vec[i], 
							   length(d), 
							   mean(d))
		       }
		       return(center_of_gravity)
	       }



	       for(i in 1:k){
		       a <- peaks[which_peak == i,]$x
		       cluster <- dbscan::dbscan(matrix(a), eps = eps, minPts = minPts)$cluster
		       g <- where_is_center_of_gravity(a, cluster)


		       gl <- length(g[,1])
		       if(gl != 1){
			       b <- g$mean - peak$x[i]
			       num <- g$cluster[which(abs(b) == min(abs(b)))[1]]

			       if(g[g$cluster == num,]$size < 300){
				       num <- g[(max(g[g$cluster != 0,]$size) == g$size), ][1,]$cluster
				       cluster[cluster != num] <- 0

			       }else{
				       cluster[cluster != num] <- 0
			       }
		       }


		       which_peak[which_peak == i][cluster == 0] <- 0
	       }

	       cat("\n")

	       col <- c(rgb(10/256,10/256,10/256),
			rgb(255/256,143/256,108/256),
			rgb(135/256,180/256,44/256),
			rgb(255/256,93/256,146/256),
			rgb(13/256,133/256,144/256),
			rgb(254/256,150/256,50/256),
			rgb(68/256,169/256,240/256),
			rgb(173/256,174/256,186/256),
			rgb(34/256,130/256,104/256),
			rgb(45/256,124/256,211/256),
			rgb(20/256,200/256,100/256))
	       col <- c(col, col, col, col, col)



	       cluster_size <- numeric(k)
	       for(i in 1:k){
		       cluster_size[i] <- length(unique(id[which_peak == i]))
	       }


	       cluster_min_xsd <- numeric(k)
	       cluster_max_xsd <- numeric(k)

	       delx <- (x[m] - x[1]) / (max(nx) - min(nx))
	       dely <- m / (x[m] - x[1]) 
	       
	       
	       for(i in 1:k){
		       cluster_min_xsd[i] <-quantile(peaks[,1][which_peak == i], probs = 0.025) * delx + x[1]
		       cluster_max_xsd[i] <-quantile(peaks[,1][which_peak == i], probs = 0.975) * delx + x[1]
	       }
	       

	       cluster_min_ysd <- numeric(k)
	       cluster_max_ysd <- numeric(k)

	       for(i in 1:k){
		       cluster_min_ysd[i] <- quantile(peaks[,2][which_peak == i], probs = 0.025) * dely
		       cluster_max_ysd[i] <- quantile(peaks[,2][which_peak == i], probs = 0.975) * dely
	       }


# 	       stop()
#  	       plot(nx, p_mean * dely, type = "l")


	       peaks$x <- peaks$x * delx + x[1]
	       peaks$y <- peaks$y * dely

	       peak$x <- peak$x * delx + x[1]
	       peak$y <- peak$y * dely

#   	       plot(x,p_mean * dely, type = "l")
#   	       points(peak$x, peak$y * dely)



  	       plot(peaks$x, peaks$y, col = col[which_peak + 1], pch = 19)
   	       points(peak)
# 	       stop()

 	       segments(x0 = cluster_min_xsd,
 			y0 = peak$y,
 			x1 = cluster_max_xsd,
 			y1 = peak$y)
 	       segments(x0 = peak$x,
 			y0 = cluster_min_ysd,
 			x1 = peak$x,
 			y1 = cluster_max_ysd)

	       probability <- cluster_size / 1000
	       probability[probability > 1] <- 1

	       ans <- list(
			   p_mean = p_mean * dely,
			   probability = probability,
			   peak = peak,
			   cluster_min_xsd = cluster_min_xsd,
			   cluster_max_xsd = cluster_max_xsd,
			   cluster_min_ysd = cluster_min_ysd,
			   cluster_max_ysd = cluster_max_ysd,
			   x = x
	       )



	       class(ans) <- "bdpeaks"
	       return(ans)


}

#  d <- LLfreq::Osayama
#  d <- rnorm(200, 50, 50)
#  res <- badzupa(d, initial = c(1,0.1,1))
#  a <- bdpeaks(res, eps = 0.01)$probability
