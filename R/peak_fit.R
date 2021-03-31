#' peak fitting
#'
#' @param xy xy
#' @param result_bdquantile result_bdquantile
  peak_fit <- function(xy,
                       result_bdquantile = NULL,
                       alpha = 0.95) {
    x <- xy$x
    y <- xy$y

    if(!is.null(result_bdquantile)) {
      peaks <- find_peaks(xy, result_bdquantile)
    } else {
      peaks <- find_peaks(xy)
    }


    ny <- length(y)

    DD <- numeric(ny)
    DD[2:(ny-1)] <- y[1:(ny-2)] + y[3:ny] - 2 * y[2:(ny-1)]
    DD[1] <- DD[2]
    DD[ny] <- DD[ny-1]

    DD_is_zero <- c()
    for(i in 1:(ny - 1)) {
      if(DD[i] > 0 & 0 > DD[i + 1] | DD[i] < 0 & 0 < DD[i + 1]) {
        DD_is_zero <- c(DD_is_zero, (x[i] * abs(DD[i+1]) + x[i+1] * abs(DD[i])) /
                          (abs(DD[i]) + abs(DD[i+1])))
      }
    }

    gaussian_fit <- function(range_x, a, bottom) {

      fit_x <- c(tail(x[x <= range_x[1]], n = 1),
                 x[range_x[1] < x & x < range_x[2]],
                 head(x[x >= range_x[2]], n = 1))
      fit_y <- c(tail(y[x <= range_x[1]], n = 1),
                 y[range_x[1] < x & x < range_x[2]],
                 head(y[x >= range_x[2]], n = 1))
      fit_x <- fit_x[fit_y >= bottom]
      fit_y <- fit_y[fit_y >= bottom]
      #plot(fit_x, fit_y, type = "l")
      #segments(peaks$x, peaks$birth, peaks$x, peaks$death)
      #plot(x, y, type = "l", ylim = c(peaks$death[3], max(fit_y)), xlim = c(200,300))
      #abline(v = DD_is_zero)
      mu0 <- fit_x[fit_y == max(fit_y)][1]
      sig0 <- sqrt(sum(fit_y * (fit_x - mu0)^2) / sum(fit_y))
      a0 <- a

      if(length(fit_x) <= 2) {
        ans <- c(mu0, sig0, a0)
        names(ans) <- c("mu", "sig", "a0")
        return(ans)
      }
      res_nls <- summary(nls(fit_y ~ a0 * exp(-(fit_x - mu)^2 / (2 * sig^2)) +
                               bottom, start = list(sig = sig0, mu = mu0),
                             algorithm = "port")
      )

      sig <- res_nls$coefficients[,"Estimate"]["sig"]
      mu <- res_nls$coefficients[,"Estimate"]["mu"]

      ans <- c(mu, sig, a0)
      names(ans) <- c("mu", "sig", "a0")
      return(ans)
    }


    range_of_peaks <- matrix(ncol = 2, nrow = nrow(peaks), 0)
    colnames(range_of_peaks) <- c("lower","upper")

    DD_is_zero <- c(min(x), DD_is_zero, max(x))
    for(i in 1:length(peaks$x)) {
      for(j in 1:(length(DD_is_zero) - 1)) {
        if(DD_is_zero[j] <= peaks$x[i] & peaks$x[i] <= DD_is_zero[j + 1]) {
          range_of_peaks[i,] <- c(DD_is_zero[j], DD_is_zero[j + 1])
          break
        }
      }
    }


    #stop()
    #abline(v = DD_is_zero)

    # plot(x,y, type = "l", ylim = c(0,max(y)))

    fit_mu <- c()
    fit_sig <- c()
    fit_a <- c()



    for(i in 1:nrow(peaks)) {
      fit <- gaussian_fit(range_x = range_of_peaks[i,],
                          a = peaks$persistence[i],
                          bottom = peaks$death[i])
      m_fit <- 100
      fit_mu <- c(fit_mu, fit["mu"])
      fit_sig <- c(fit_sig, fit["sig"])
      fit_a <- c(fit_a, fit["a0"])
    }

    return(data.frame(mu = fit_mu, sig = fit_sig, a = fit_a))
  }
