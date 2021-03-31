#' find peaks
#'
#' @param y y
#' @param lambda lambda
#' @param p p
find_baseline <- function(y,
                          lambda = 10^3,
                          p = 0.001) {
  ny <- length(y)
  #plot(x,D, type = "l")

  D <- matrix(ncol = ny, nrow = ny, 0)
  diag(D) <- 1
  diag(D[1:(ncol(D) - 1), 2:nrow(D)]) <- -2
  diag(D[1:(ncol(D) - 2), 3:nrow(D)]) <- 1
  tDD <- t(D) %*% D
  make_smooth_density <- function(lambda) {
    z <- y

    for (i in 1:5) {
      w <- rep(p, ny)
      w[y - z < 0] <- 1 - p
      #z <- solve(diag(w) +
      #             lambda1 * D1tD1 + lambda * DtD) %*%
      #  (diag(w) + lambda1 * D1tD1) %*% y
      z <- solve(diag(w) + lambda * tDD) %*%
        (diag(w)) %*% y
    }
    return(z)
  }

  z <- make_smooth_density(lambda)

  return(z)
#   num_peaks <- numeric(length(lambda_list))
#   message("0%", appendLF = F)
#   for (j in seq(lambda_list)) {
#     if (((j * 10) %% (round(length(lambda_list) / 10) * 10)) == 0) {
#       #print((j * 10)%% (round(n_BT / 10) * 10 ))
#       message(paste(round(j / length(lambda_list) * 100), "%", sep = ""),
#               appendLF = F)
#     }
#     if (j != length(lambda_list)) {
#       if (((j * 10) %% (round(length(lambda_list) / 10))) == 0) {
#         message("-", appendLF = F)
#       }
#     }
#
#     z <- make_smooth_density(lambda_list[j])
#     #lines(x,z, col = rainbow(ny)[j])
#     num_peaks[j] <-
#       sum(z[1:(ny - 2)] < z[2:(ny - 1)] & z[2:(ny - 1)] > z[3:ny])
#   }
#
#   #abline(h = sum(y[1:(ny-2)] < y[2:(ny-1)] & y[2:(ny-1)] > y[3:ny]))
#
#   plot(log10(lambda_list),num_peaks,type = "l")
#
#   for (i in (length(num_peaks) - 1):1) {
#     if (num_peaks[i + 1] > num_peaks[i]) {
#       num_peaks[i] <- num_peaks[i + 1]
#     }
#   }
#
#   depth <- 1
#
#   #in cese depth is larger than 1
#   cum_num_peak <- table(num_peaks)
#   cum_num_peak <- cum_num_peak[rev(order(cum_num_peak))]
#
#   #peaks which have many are adopted if the number of num_summary
#   # is same
#   level <- 1:depth
#   level_lamda <- numeric(depth)
#
#   number_of_peaks_in_y <-
#     nrow(badzupa::find_peaks(data.frame(x = seq(y),y)))
#
#   cum_num_peak <-
#     cum_num_peak[names(cum_num_peak) != as.character(number_of_peaks_in_y)]
#
#   for (i in 1:depth) {
#     level_lamda[i] <-
#       which(num_peaks == as.numeric(names(cum_num_peak[level]))[i])[1]
#   }
#
#   level_lamda <- level_lamda[rev(order(level_lamda))]
#
#   z <- make_smooth_density(lambda_list[level_lamda[1]])
}
