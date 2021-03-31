#' plot_fit_peaks
#'
#' @param result_peak_fit result_bddensity
#' @param result_bddensity result_bddensity
#' @param alpha alpha
#' @export
plot_fit_peaks <- function(result_bddensity,
                           result_peak_fit, alpha = 0.95) {
  fit <- result_peak_fit
  x <- result_bddensity$x
 range_peaks <- cbind(fit[,1:2,drop = F], numeric(nrow(fit)))
 colnames(range_peaks) <- c("low", "up", "rank")
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
       xlim = range(x))
  axis(1)


  segments(x0 = range_peaks[,"up"],
           x1 = range_peaks[,"low"],
           y0 = range_peaks[,"rank"])

  segments(x0 = range_peaks[,"up"],
           y0 = range_peaks[,"rank"] - .5,
           y1 = range_peaks[,"rank"] + .5)

  segments(x0 = range_peaks[,"low"],
           y0 = range_peaks[,"rank"] - .5,
           y1 = range_peaks[,"rank"] + .5)

  points(fit[,"mean"], range_peaks[,"rank"], pch = 19, cex = .5)
}

