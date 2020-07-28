bdcdf <- function(res, age = NA, ci = .95){
	x <- res$x

	if(is.na(age)) age <- min(x)
	f0 <- res$f_hat
	y <- res$y
	hyp <- res$hyp
	m <- length(y)

	nx <- seq(0, 10, length = m)
	K <- make_kernel(hyp,nx)
	f_mean <- compute_f_estimate(K, f0, y)$f
	p_mean <- softmax(f_mean)
	cp_mean <- as_cdf(p_mean)

	steps = 1000
	f <- make_distribution(K, f0, y, steps)
	p <- matrix(nrow = steps ,ncol = m, 0)

	for(i in 1:steps){
		p[i,] <- softmax(f[i,])
	}

	lv <- length(p[,1])
	lh <- length(p[1,])

	p[,x < age] <- -p[,x < age]
	cpy <- matrix(0, lv, lh)
	for(i in 1:lv){
		cp <- numeric(lh)
		for(j in 1:sum(x < age)){
			l <- sum(x < age)
			cp[x < age][l - j + 1] <- sum(p[i,x < age][l:(l - j + 1)])
		}
		for(j in 1:sum(x > age)){
			cp[x > age][j] <- sum(p[i,x > age][1:j])
		}

		cpy[i,] <- cp
	}

	cqua <- matrix(ncol = lh, nrow = 2, 0)

	for(i in 1:lh){
		cqua[1,i] <- as.numeric(quantile(cpy[,i], (1 - ci) / 2))
	}
	for(i in 1:lh){
		cqua[2,i] <- as.numeric(quantile(cpy[,i], (1 + ci) / 2))
	}

	ans <- list(x = x,
		    age = age,
		    cp_mean = cp_mean,
		    cp_CI = cqua)
	class(ans) <- "bdcdf"
	return(ans)
}

