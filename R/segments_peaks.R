#' segments_peaks
#'
#' @param result_find_peaks result_find_peaks
#' @param color color
#' @param lwd lwd
#' @export
segments_peaks <- function(result_find_peaks,
                           color = "royalblue",
                           lwd = 2) {
  peaks <- result_find_peaks
  segments(peaks$x,
           peaks$death,peaks$x,
           peaks$birth,
           col = color,
           lwd = lwd)
}
