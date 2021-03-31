#' plot_density
#'
#' @param bdq bdq
#' @param result_bddensity result_bddensity,
#' @param result_bdquantile result_bdquantile
#' @param xlim xlim
#' @param xlab xlab
#' @param ylab ylab
#' @param color color
#' @param rug rug
#' @export
plot_density <- function(result_bddensity,
                         result_bdquantile = NULL,
                         xlim = c(NA, NA),
                         xlab = "x",
                         ylab = "frequency",
                         color = rgb(250/255, 128/255, 114/255, alpha = .3),
                         rug = T) {
  dens <- result_bddensity
  if(!is.null(result_bdquantile)) {
    bdq <- result_bdquantile
  }

  d <- dens$d

  maxd <- max(d)
  mind <- min(d)

  if (is.na(xlim[1]))
    xlim[1] = mind - (maxd - mind) * 0.02
  if (is.na(xlim[2]))
    xlim[2] = max(d) + (maxd - mind) * 0.02

  if(!is.null(result_bdquantile)) {
    plot(NA,NA,
         axes = F,
         xlim = xlim,
         ylim = c(0, max(bdq$quantile)),
         xlab = xlab,
         ylab = ylab)
    polygon(c(bdq$x, rev(bdq$x)),
            c(bdq$quantile[1,], rev(bdq$quantile[2,])),
            col = color, border = NA)
  } else {
    plot(NA,NA,
         axes = F,
         xlim = xlim,
         ylim = c(0, max(dens$y)),
         xlab = xlab,
         ylab = ylab)
  }

  box()
  axis(1)


  axis(2,
       at = c(0,
              floor(
                max(dens$y) * 10^(-floor(log10(max(dens$y))))
                ) *
                10^(floor(log10(max(dens$y))))
              )
       )


  lines(dens, lwd = 1.4)

  if(rug) rug(d)
  abline(h = 0)

}
