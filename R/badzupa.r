
badzupa <- function(
		   d,
		   xlim = c(NA,NA),
		   initial = c(1,2,0.1),
		   m = 200,
		   method = "normal",
		   delta = 1/25,
		   round = TRUE
		   ){
	#variables
	#--------------------------------------------------------------------------

	if(length(d) < 1) stop("length of d must be more than 2")
	n <- length(d)
	del <- (max(d) - min(d)) / (1 - 2 * delta) * delta
	if(method == "normal" | method == "divide") initial <- initial[1:2]


	if(is.na(xlim[1])){
		xlim[1] <- min(d) - del
	}
	if(is.na(xlim[2])){
		xlim[2] <- max(d) + del
	}

	if(round){
		for(i in 1:length(d)){
		set.seed(i);d[i] <- rnorm(1, d[i], 1/2)
		}
	}
	set.seed(NULL)
	#x axis
	x <- seq(xlim[1], xlim[2], length = m)
	# normalized x axis
	nx <- seq(0, 10, length = m)
	#nd is a normalized value of d
	nd <-  (d - xlim[1]) / (xlim[2] - xlim[1])

	#y
	#compute y vector(refer to Riimakii and vertari (2014))
	y <- numeric(m)
	for(j in 1:m){
		for(i in 1:n){
			if((j-1) * (1/m) < nd[i] & nd[i] <= j * (1/m)){
				y[j] = y[j] + 1
			}
		}
	}
	n <- sum(y)

	#Laplace-approximation Logistic Gaussian Process
	#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	#initial f
	dens <- density(d)
	density_dx <- dens$x
	density_dy <- dens$y

	dx <- numeric(m)
	for(i in 1:m){
		dx[i] <- as_function(density_dx, density_dy ,nx[i])
	}
	f0 <- log(dx)


	#function compute likelihood
	#---------------------------------------------------------------------------
	cat("computing")
	compute_likelihood <- function(v, f = f0, print. = T) {
	  if(print. == T) cat(".")
		K <- make_kernel(v,nx) 
		result <-  compute_f_estimate(K, f0 = f0, y = y) 
		f <- matrix(result$f)
		invCf <- result$invCf
		A <- result$A

		loglik1 <- -1/2 * (t(f) %*% invCf)[1,1]
		minf <- min(f)
		logsumexp <- log(sum(exp(f - minf))) + minf

		loglik2 <- (t(y) %*% f)[1,1] - n * logsumexp
		loglik3 <- -1/2 * log(det(A))

		if(method == "detrital") {
		  if(v[3] < 0) v[3] <- 10^(-10)
		  loglik4 <- -1/(2 * 2^2) * (log(v[3]))^2
		  loglik3 <- loglik3 + loglik4
		  }
		loglik <- loglik1 + loglik2 + loglik3

		return(-loglik)

	} 


	hyp <- optim(initial, compute_likelihood)$par

	cat("\nhyp(sigma,rho) =")
	cat(abs(hyp))
	cat("\n")

	K <- make_kernel(hyp, nx)
	f_hat <- compute_f_estimate(K, f0 = f0, y = y)$f
	likelihood <- -compute_likelihood(hyp, print. = F)

	ans <- list(hyp = hyp, x = x, f_hat = f_hat, y = y, likelihood = likelihood)
	class(ans) <- "badzupa"
	return(ans)
}

#t <- make_distribution(K, f_hat, y, 10)
#t <- mvtnorm::rmvnorm(10, f_hat, K)
#plot(x,t[1,], type = "l")
#for(i in 1:10){
#  lines(x,t[i,], type = "l")
#}


#sample
#mu <- 50
#sd <- 50
#m <- 200
#d <- rnorm(50, mu, sd)
#ans <- badzupa(d, method = "normal")
#f <- ans$f_hat
#x <- ans$x
#xd <- seq(mu - 3 * sd, mu + 3 * sd, length = m)
#plot(xd,dnorm(xd, mu, sd) * (max(x) - min(x)) / m, type = "l", col = "red")
#rug(d)
#lines(x,  exp(f) / sum(exp(f)), type = "l")


