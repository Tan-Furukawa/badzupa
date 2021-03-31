#' find peaks
#'
#' @param xy xy
#' @param result_bdquantile result_bdquantile
#' @export
find_peaks <- function(xy, result_bdquantile = NULL) {
  x <- xy$x
  y <- xy$y
  if(!is.null(result_bdquantile)) {
    lower_quantile <- result_bdquantile$quantile[1,]
  }


  n <- length(y)
  equal <- (y[1:(n - 1)] == y[2:n])

  #peaks is when y[i + 1] < y[i] > y[i + 1]
  #valley is when y[i + 1] > y[i] < y[i + 1]
  is.peaks <- y[1:(n - 2)] < y[2:(n - 1)] & y[2:(n - 1)] > y[3:n]
  is.peaks <- if (y[1] > y[2]) c(T, is.peaks) else c(F, is.peaks)
  is.peaks <- if (y[n] > y[n - 1])c(is.peaks, T) else c(is.peaks, F)

  is.valley <- y[1:(n - 2)] > y[2:(n - 1)] & y[2:(n - 1)] < y[3:n]
  is.valley <- if (y[1] < y[2]) c(T, is.valley) else c(F, is.valley)
  is.valley <-if (y[n] < y[n - 1]) c(is.valley, T) else c(is.valley, F)

  # this if is used when the same values of y is adjascent
  if (sum(equal) >= 1) {
    equal_id <- cumsum(!equal) + 1
    equal_id[!equal] <- 0

    unique_equal_id <- unique(equal_id)[unique(equal_id) != 0]
    for (i in 1:length(unique_equal_id)) {
      r <- range(which(equal_id == unique_equal_id[i]))
      if (r[1] != 1 & (r[2] != length(equal_id))) {
        if (y[r[1] - 1] < y[r[1]] & y[r[1]] > y[r[2] + 2]) {
          is.peaks[ceiling(mean(r))] <- T
        } else if (y[r[1] - 1] > y[r[1]] & y[r[1]] < y[r[2] + 2]) {
          is.valley[ceiling(mean(r))] <- T
        }
      } else if (r[1] == 1 & (r[2] != length(equal_id))) {
        if (y[r[1]] > y[r[2] + 2]) {
          is.peaks[ceiling(mean(r))] <- T
        } else  {
          is.valley[ceiling(mean(r))] <- T
        }
      } else if (r[1] != 1 & (r[2] == length(equal_id))) {
        if (y[r[1] - 1] < y[r[1]]) {
          is.peaks[ceiling(mean(r))] <- T
        } else {
          is.valley[ceiling(mean(r))] <- T
        }
      }
    }
  }


  is.peaks <- which(is.peaks)
  is.valley <- which(is.valley)
  #  points(x[is.peaks], y[is.peaks])
  #  points(x[is.valley], y[is.valley], pch = 19)

  if (length(is.peaks) == 1) {
    #    plot(x,y,type = "l")
    death <- min(y[is.valley])
    birth <- y[is.peaks]
    return(data.frame(
      x = x[is.peaks],
      birth = birth,
      death = death,
      persistence = birth - death
    ))
  } else if (length(is.peaks) < 1) {
    #    plot(x,y,type = "l")
    death <- NA
    birth <- NA
    return(data.frame(
      x = x[is.peaks],
      birth = birth,
      death = death,
      persistence = birth - death
    ))
  } else {
    if ((range(is.peaks)[1] > range(is.valley)[1]))
      is.valley <- is.valley[2:length(is.valley)]
    if ((range(is.peaks)[2] < range(is.valley)[2]))
      is.valley <- is.valley[1:(length(is.valley) - 1)]


    #plot(is.peaks, y = numeric(length(is.peaks)))
   # points(is.valley, y = numeric(length(is.valley)), pch = 20)


    peaks <- y[is.peaks]
    valley <- y[is.valley]


    peaks_id <- 1:length(is.peaks)
    valley_id <- 1:length(is.valley)

    birth <- peaks
    death <- numeric(length(peaks))

    vs <- matrix(c(1:(length(is.peaks) - 1),
                   2:(length(is.peaks))), ncol = 2, nrow = length(valley))

    vs <- vs[rev(order(valley)), , drop = F]
    valley_id <- valley_id[rev(order(valley))]


    for (i in 1:length(valley)) {
      if (peaks[vs[i, 1]] >= peaks[vs[i, 2]]) {
        death[vs[i, 2]] <- valley[valley_id[i]]
        vs[vs == vs[i, 2]] <- vs[i, 1]
      } else {
        death[vs[i, 1]] <- valley[valley_id[i]]
        vs[vs == vs[i, 1]] <- vs[i, 2]
      }
    }



    if(!is.null(result_bdquantile)) {
      ans <- data.frame(
        x = x[is.peaks][death < lower_quantile[is.peaks]],
        birth = birth[death < lower_quantile[is.peaks]],
        death = death[death < lower_quantile[is.peaks]],
        persistence =( birth - death)[death < lower_quantile[is.peaks]]
      )
    } else {
      ans <- data.frame(
        x = x[is.peaks],
        birth = birth,
        death = death,
        persistence = birth - death
      )
    }

    # plot(x[is.peaks], (birth - death), pch = 19, cex = 0.3)


    #  plot(x,y,type = "l", ylim = c(0, max(y)))
    #  segments(x[is.peaks], death, x[is.peaks], birth, col = "blue", lwd = 2.0)


    return(ans)
  }
  # plot(birth, death, xlim = range(y), ylim = range(y))
  #  abline(a = 0, b = 1)

}

#find_peaks(data.frame(x = seq(y),y))
