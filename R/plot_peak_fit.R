#' plot_peak_fit
#'
#' @param result_peak_fit result_peak_fit
#' @param alpha alpha
#' @export
plot_peak_fit <- function(result_peak_fit, alpha = 0.95) {
  fit <- result_peak_fit
  range_peaks <- matrix(nrow = length(fit$mu), ncol = 3, 0)
  colnames(range_peaks) <- c("mu", "sig", "rank")
  #rank is used when the range is overlapped


  cnorm <- optimize(function(x) (pnorm(x) - (1 - (1-alpha) / 2))^2,
                    interval = c(-4,4))$minimum


  for(i in seq(fit$mu)) {
    fitx <- seq(fit$mu[i] - cnorm * fit$sig[i],
                fit$mu[i] + cnorm * fit$sig[i], length = 100)

    fity <- fit$a[i] * exp(-(fitx - fit$mu[i])^2 / (2 * fit$sig[i]^2))
    range_peaks[i,1:2] <- range(fitx)
  }

  is.overlapped <- function(rangeA, rangeB) {
    if(!(rangeA[2] < rangeB[1] | rangeB[2] < rangeA[1])) {
      return(TRUE)
    } else {
      return(FALSE)
    }
  }

  if(nrow(range_peaks) >= 2) {
    isbreak <- F
    for(k in 1:10) {
      if(isbreak) {
        break
      }
      isbreak <- T
      for(j in 1:(nrow(range_peaks) - 1)) {
        for(i in (j + 1):(nrow(range_peaks))) {
          if(is.overlapped(range_peaks[i,], range_peaks[j,])) {
            if(range_peaks[i,3] ==  range_peaks[j,3]){
              range_peaks[i,3] <- range_peaks[i,3] + 1
              isbreak <- F
            }
          }
        }
      }
    }
  }

  plot(NA,NA,
       axes = F,
       ylab = "",
       xlab = "x",
       ylim = c(range(range_peaks[,"rank"])[1] - 1,
                range(range_peaks[,"rank"])[2] + 1),
       xlim = c(fit[1,"mu"] - cnorm * fit[1,"sig"],
                fit[nrow(fit),"mu"] + cnorm * fit[nrow(fit),"sig"]))
  axis(1)


  segments(x0 = fit[,"mu"] - cnorm * fit[,"sig"],
           x1 = fit[,"mu"] + cnorm * fit[,"sig"],
           y0 = range_peaks[,"rank"])

  segments(x0 = fit[,"mu"] - cnorm * fit[,"sig"],
           y0 = range_peaks[,"rank"] - .5,
           y1 = range_peaks[,"rank"] + .5)

  segments(x0 = fit[,"mu"] + cnorm * fit[,"sig"],
           y0 = range_peaks[,"rank"] - .5,
           y1 = range_peaks[,"rank"] + .5)

  points(fit[,"mu"], range_peaks[,"rank"], pch = 19, cex = .5)
}

