make_kernel <- function(hyp, x){
	if(hyp[1] > 50 | hyp[2] > 50){
		if(hyp[1] < hyp[2]){
			hyp[1] <- hyp[1] / hyp[2] * 50
			hyp[2] <- 50
		} else {
			hyp[2] <- hyp[2] / hyp[1] * 50
			hyp[1] <- 50
		}
	}
  
	m <- length(x)
	sig <- hyp[1]
	rho <- hyp[2]
	if (length(hyp) == 2){
		RHO <- matrix(0, m, m) + rho
	} else{
		ita <- hyp[3]
		ITA <- matrix(0, m, m)
		for(i in 1:m){
			for(j in 1:m){
				ITA[i,j] <- (i + j) / (2 * m)
			}
		}
		RHO <- matrix(0, m, m) + rho + ita * ITA
	}
	K <- matrix(nrow = m,ncol = m,0)
	for(i in 1:m){
		for(j in 1:m){
			K[i,j] <- sig^2 * exp(- 1/2 * (x[i] - x[j])^2 / (RHO[i,j])^2)
		}
	}
	return(K)
}


compute_f_estimate <- function(K, f0, y){
# 	plot(x,f, type = "l")
	Loop <- 5
	n <- sum(y)
	m <- length(f0)
	f <- matrix(f0)
#  			x <- seq(0, 100, length = m)
#  	  		H <- cbind(x,x^2)
#  	  		B <- 10^(2) * diag(2)
#  	  		C <- K + H %*% B %*% t(H) 
  	C <- K
	
	u <- matrix(numeric(m))
	for(i in 0:Loop){
		for(j in 1:m){
			u[j,1] <- 1 / sum(exp(f - f[j]))
		}
		#W
		W <-n*(diag(u[,1]) - u[,1] %*% t(u[,1]))
		#R
		R <- sqrt(n)*(diag(sqrt(u[,1])) - (u[,1] %*% t(u[,1])) %*% diag(u[,1]^(-1/2)))
		#I
		I <- diag(m)
		#Wf
		Wf <- W %*% f
		#S <- nabla log p(y|p)
		#v
		S <- (y - n *  u)
		v <- Wf + S
		A <- I + t(R) %*% C %*% R
		b <- t(R) %*% C %*% v
		z <- solve(A,b)
		invCf <- (v - R %*% z)
		f <- C %*% invCf
	}

	ans <- list(f = f[,1],
		    invCf = invCf,
		    A = A,
		    C = C,
		    W = W)
	return(ans)
}


make_distribution <- function(K, f0, y, steps){
	m <- length(f0)

	ignore_error_rmvnor <- function(num,f,L){
		f_result <- NULL
		f_result <- try(mvtnorm::rmvnorm(num,f,L), silent = T)
		if (class(f_result[1])[1] == "try-error") {
			f_result <- matrix(ncol=m, nrow=2, 0)
		}
		return(f_result)
	}

	anslist <- compute_f_estimate(K, f0, y)
	C <- anslist$C
	W <- anslist$W
	fnew <- anslist$f

	Q <- diag(m) + W %*% C
	L <- C %*% solve(Q, tol = 0)

	set.seed(12345); f <- ignore_error_rmvnor(steps, fnew, L)
	set.seed(12345); f <- mvtnorm::rmvnorm(steps, fnew, L)
	set.seed(NULL)
# 	f <- ignore_error_rmvnor(1, fnew, L)
# 	plot(x,f,type ="l")
	return(f)
}

as_function <- function(vecx, vecy, x){
	ans <- 10^(-10)
	l <- length(vecy)
	for(i in 1:(l-1)){
		if(vecx[i] <= x & x <= vecx[i + 1]){
			ans <- (vecy[i + 1] - vecy[i]) / (vecx[i + 1] - vecx[i]) * (x - vecx[i]) + vecy[i]
			break
		}
	}
	return(ans)
}

softmax <- function(f){
	m <- length(f)
	p <- numeric(m)
	for(j in 1:m){
		p[j] <- 1 / sum(exp(f - f[j]))
	}
	return(p)
}

as_cdf <- function(vec){
	m <- length(vec)
	ans <- numeric(m)
	for(i in 1:m){
		ans[i] <- sum(vec[1:i])
	}
	return(ans)
}


