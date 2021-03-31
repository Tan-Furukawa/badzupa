#' fit_peaks
#'
#' @param result_bddenstiy result_bddenstiy
#' @param result_bdquantile result_bdquantile
fit_peaks <- function(result_bddenstiy, result_bdquantile) {

#result_bddenstiy <- dens
#result_bdquantile <- bdq

d <- result_bddenstiy$d
h <-result_bddenstiy$bw
x <- result_bddenstiy$x
y <- result_bddenstiy$y

peaks <- find_peaks(result_bddenstiy,result_bdquantile)
top <- find_peaks(data.frame(x = x, y = y))
bottom <- find_peaks(data.frame(x = x, y = -y))

#plot(x,y,type  ="l")
#abline(v = top$x)
#abline(v = bottom$x)

range_bottom <- matrix(ncol = 3, nrow = 0, 0)
colnames(range_bottom) <- c("bottom1","bottom2","top")
# in case bottom > 2
if(length(bottom$x) >= 2) {
  for(i in 1:(length(bottom$x) - 1)) {
    range_bottom <- rbind(range_bottom, c(bottom$x[i], bottom$x[i+1], 0))
  }
}




between <- function(range, point) {
  if(range[1] < point & point < range[2]) {
    return(TRUE)
  } else {
    return(FALSE)
  }
}

for(i in 1:(length(top$x))) {
  for(j in 1:nrow(range_bottom)){
    if(between(range_bottom[j,], top$x[i])){
      range_bottom[j,3] <- top$x[i]
      break
    }
  }
}

range_bottom <- range_bottom[range_bottom[,"top"] != 0,, drop = F]

d <- d[order(d)]

cluster <- numeric(length(d))

for (j in 1:length(d)) {
  for(i in 1:nrow(range_bottom)) {
    if(between(range_bottom[i,], d[j])){
      cluster[j] <- i
      break
    }
  }
}

kernell <- function(x) {
  # x is one dimentional vector
  # usually data D
  n <- length(x)
  r <- numeric(n)
  y <- abs(x) < 1
  r[y] <- 35 / 32 * (1 - x[y] ^ 2) ^ 3
  return(r)
}

kde <- function(d, x, h, n= length(d)) {
  p_estimate <- numeric(length(x))
  for (j in 1:length(d)) {
    p_estimate <-  p_estimate +
      1 / n * 1 / h[j] * kernell((x - d[j]) / h[j])
  }
  return(p_estimate)
}

y_elements <- matrix(ncol = nrow(range_bottom), nrow = length(x), 0)

for(i in 1:nrow(range_bottom)) {
  y_elements[,i] <-
    kde(d[cluster == i], x, h[cluster == i], n = length(d))
}



#plot(x,y_elements[,32],type = "l")
#for(i in 1:nrow(range_bottom)) {
#  lines(x, y_elements[,i],type = "l", col = "red")
#}


alpha = 0.95

ans <- matrix(ncol = 3, nrow = nrow(range_bottom))

for(i in 1:nrow(range_bottom)){
  cum_y <- cumsum(y_elements[,i]/ sum(y_elements[,i]))
  is.lowerpercentile <-
    (min(abs(cum_y - (1 - alpha)/2)) == abs(cum_y - (1 - alpha)/2))
  is.upperpercentile <-
    (min(abs(cum_y - (1 - (1 - alpha)/2))) == abs(cum_y - (1 - (1 - alpha)/2)))
  ans[i,] <- c(x[is.lowerpercentile][sum(is.lowerpercentile)],
               x[is.upperpercentile][1], 0)
}

ans[,3] <- range_bottom[,3]

is.peaks <- numeric(nrow(range_bottom))
for(i in 1:nrow(range_bottom)) {
  is.peaks[i] <- sum(peaks$x == range_bottom[i,3])
}


colnames(ans) <- c("low", "up", "mean")
return(ans[as.logical(is.peaks),,drop = F])

}
#  } e


# y0 <- badzupa::find_baseline(y, p = 0.0001)[,1]
# #y0 <- pmin(y0, y)
# plot(x,y,type = "l")
# lines(x,y0)
#
# multinorm <- function(x, a, mu, sig) {
#   ans <- numeric(length(x))
#   for(i in 1:length(mu)) {
#     ans <- ans + a[i] * exp(-(x - mu[i])^2 / (2 * sig[i]^2))
#   }
#   # lines(x,ans)
#   # cat(".")
#   return(ans)
# }
#
# peaks <- find_peaks(result_bddenstiy)
# confidence_peaks <- find_peaks(result_bddenstiy, result_bdquantile)$mu
#
# mu <- peaks$x
# sig <- peak_fit(dens)$sig
# a <- numeric(length(mu))
# for(i in 1:length(a)){
#   a[i] <- peaks$birth[i] - y0[mu[i] == x]
# }
#
#
# ans <-
#   nls(y  ~ multinorm(x, a, mu, sig) + y0 + noise,
#       start = list(sig = sig, a = a, mu = mu, noise = 0.0001), algorithm = "port")
#
# ans <- summary(ans)
# ans_names <- names(ans$coefficients[, "Estimate"])
# sig <- ans$coefficients[grep("sig", ans_names), "Estimate"]
# a <- ans$coefficients[grep("a", ans_names), "Estimate"]
# mu <- ans$coefficients[grep("mu", ans_names), "Estimate"]
#
#
#
#
# plot(x, multinorm(x, a, mu, sig) + y0, type = "l")
# lines(x,y, col = "red")
# lines(x, y0, col = "green")
#
# for(i in 1:length(mu)) {
#   lines(x, multinorm(x, a[i], mu[i], sig[i]))
# }
#
#}






#for(i in 1:length(mu)) {
#  lines(x, multinorm(x, a[i], mu[i], sig[i]), col  = "green")
#}


