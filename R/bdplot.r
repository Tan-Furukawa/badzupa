#' plot density curve
#'
#' @param d data
#' @param xlim beta
#' @param m beta
#' @param CI beta
#' @param method beta
#' @param xlab xilm
#' @param ylab xilm
#' @param beta0 xilm
#' @param list_beta xilm
#' @param color xilm
#' @param rug xilm
#' @export
bdplot <- function (d,
                    xlim = c(NA,NA),
                    m = 500,
                    CI = T,
                    method = "auto",
                    xlab = "x",
                    ylab = "frequency",
                    beta0 = 1,
                    list_beta = c(0, 0.5, 1, 1.5, 2),
                    color = rgb(250/255, 128/255, 114/255, alpha = .3),
                    rug = T) {
  maxd <- max(d)
  mind <- min(d)

  if (is.na(xlim[1]))
    xlim[1] = mind - (maxd - mind) * 0.02
  if (is.na(xlim[2]))
    xlim[2] = max(d) + (maxd - mind) * 0.02
  message("Progress of Step1 (estimate bandwidth):")
  res <- bddensity(d, m = m, xlim = xlim, list_beta = list_beta, beta0 = beta0)
  message("Progress of Step2 (bootstrap sampling):")
  qu <- bdquantile(d, h = res$bw, xlim = xlim, m = m)

  plot(NA,NA,xlim = xlim, ylim = c(0, max(qu$quantile)), xlab = xlab, ylab = ylab)
  polygon(c(qu$x, rev(qu$x)),
            c(qu$quantile[1,], rev(qu$quantile[2,])),
            col = color, border = NA)
  lines(res, lwd = 1.4)

  if(rug) rug(d)
  abline(h = 0)
}
