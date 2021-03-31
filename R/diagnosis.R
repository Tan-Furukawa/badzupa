#' diagnosis
#'
#' @param result_bddensity result_bddensity
#' @param result_bdquantile result_bdquantile
#' @param alpha alpha
#' @param persistence persistence
#' @export
diagnosis <- function(result_bddensity,
                      result_bdquantile,
                      alpha = 0.95,
                      persistence = 5) {
  oldpar <- par(no.readonly = TRUE)

  dens <- result_bddensity
  bdq <- result_bdquantile

  peaks <- badzupa::find_peaks(dens, bdq)
  #fit <- badzupa::peak_fit(dens, bdq)
  fit <- badzupa::fit_peaks(dens, bdq)

  par(cex=0.8, mai=c(0.2,0.1,0.2,0.1))
  par(fig=c(0.1,0.9,0.3,0.9))
  badzupa::plot_density(dens, bdq, rug = T)
  title("Result of peaks detection")
  segments_peaks(peaks)

  par(fig=c(0.1,0.9,0.1,0.25), new=TRUE)
  badzupa::plot_fit_peaks(fit, alpha = alpha)
  mtext("x", side = 1, line  = 2)
  title("Result of fitting")
  box()


  par(oldpar)

}
