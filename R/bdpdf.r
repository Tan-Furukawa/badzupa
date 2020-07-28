bdpdf <- function(res, ci = 0.95){

	steps <- 1000
	hyp <- res$hyp
	x <- res$x
	m <- length(x)
	f0 <- res$f_hat
	y <- res$y
	nx <- seq(0, 10, length = m)
	K <- make_kernel(hyp, nx)
	f <- make_distribution(K, f0, y, steps)

	p_mean <- numeric(m)
	for(j in 1:m){
		p_mean[j] <- 1 / sum(exp(f0 - f0[j]))
	}


	p <- matrix(nrow = steps, ncol = m, 0)
	for(i in 1:steps){
		fa <- f[i,]
		for(j in 1:m){
			p[i, j] <- 1 / sum(exp(fa - fa[j]))
		}
	}

	Q <- ci
	Q_ <- 1 - Q

	#p_CI is Q ci
	p_CI <- matrix(ncol = m, nrow = 2, 0)
	for(i in 1:m){
		p_CI[1,i] <- as.numeric(quantile(p[,i],Q))
	}
	for(i in 1:m){
		p_CI[2,i] <- as.numeric(quantile(p[,i],Q_))
	}
	l <- length(p[,1])

	
	#>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	# cummulative function
	#>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	cp_mean <- numeric(m)
	for(i in 1:m){
		cp_mean[i] <- sum(p_mean[1:i])
	}
	cp <- matrix(ncol = m, nrow = l)
	for(i in 1:l){
		for(j in 1:m){
			cp[i,j] <- sum(p[i,1:j])
		}
	}

	cp_CI <- matrix(ncol = m, nrow = 2, 0)
	for(i in 1:m){
		cp_CI[1,i] <- as.numeric(quantile(cp[,i],Q))
	}
	for(i in 1:m){
		cp_CI[2,i] <- as.numeric(quantile(cp[,i],Q_))
	}

	div <- m / (x[m] - x[1]) 
	p_mean <- p_mean * div
	p_CI <- p_CI * div

	ans <- list(x = x,
		    p_mean = p_mean,
		    p_CI = p_CI,
		    cp_mean = cp_mean)
	
     	class(ans) <- "bdpdf"
 	return(ans)
}

# rug(d)
#  set.seed(5)
# d <- rnorm(40, 50, 10)
#d <- LLfreq::Osayama
#
#res <- badzupa(d, z = 10, initial = c(1,1,1), delta = 1/25)
#
#print(res$likelihood)
#ans <- confident_interval(res, z = 10)
#
#x <- res$x
#y <- dnorm(res$x, 50, 10)
#
# plot(res$x, ans$p_mean, type = "l", ylim = c(0,max(ans$p_CI[1,])))
# lines(res$x, y, type = "l", col = "red")
# lines(res$x, ans$p_CI[1,])
# lines(res$x, ans$p_CI[2,])
# lines(density(d))
# #rug(d)
