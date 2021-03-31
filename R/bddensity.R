#' estimate density curve
#'
#' @param d data
#' @param list_beta beta
#' @param beta0 beta
#' @param m beta
#' @param log.range beta
#' @param xlim xilm
#' @export
bddensity <- function(d,
                     list_beta = c(0, 0.5, 1, 1.5, 2),
                     beta0 = 1,
                     m = 400,
                     log.range = c(-4, 1),
                     xlim = c(NA, NA),
                     data.is.integer = F) {
  message("0%", appendLF = F)
  # step 0 config
  #-------------------------------------------------------------------------------
  select_bandwidth <- "lin"
  #-------------------------------------------------------------------------------
  mind <- min(d)
  maxd <- max(d)

  n <- length(d)

  if(data.is.integer) {
    for(i in 1:n) {
      d[i] <- rnorm(1, d[i], 1.0)
    }
  }
  if (is.na(xlim[1]))
    xlim[1] = mind - (maxd - mind) * 0.02
  if (is.na(xlim[2]))
    xlim[2] = max(d) + (maxd - mind) * 0.02

  normalize_axis <- function(dat)
    return((dat - mind) / (maxd - mind))
  unnormalize_axis <-function(ndat)
      return(ndat * (maxd - mind) + mind)


  D <- normalize_axis(d)
  order_D <- order(D)
  D <- D[order_D]

  x <- seq(normalize_axis(xlim[1]),
           normalize_axis(xlim[2]), length = m)

  pilot0 <- rep(1, length(D))
  # define kernel
  # in this study using triangular

  kernell <- function(x) {
    # x is one dimentional vector
    # usually data D
    n <- length(x)
    r <- numeric(n)
    y <- abs(x) < 1
    r[y] <- 35 / 32 * (1 - x[y] ^ 2) ^ 3
    return(r)
  }

  # bandwidth
  #two pattern (not using exp version now)
  if (select_bandwidth == "lin") {
    bandwidth <- function(alpha, beta, pilot) {
      return(alpha / pilot ^ (beta))
    }
  } else if (select_bandwidth == "exp") {
    bandwidth <- function(alpha, beta, pilot) {
      return(alpha * exp(pilot * (beta)))
    }
  }

  #The function for finding grid alpha
  #refer to paper

  find_alpha <- function(beta, D, pilot) {
    n <- length(D)

    #rough is the number of rough grid
    rough = 10
    #fine is the number of fine grid
    fine = 7

    #rough grid of alpha
    alpha <- 10 ^ seq(log.range[1], log.range[2], length.out = rough)



    for (j in 1:2) {
      discre_size <- if (j == 1)
        rough
      else
        fine

      #p(D|alpha)
      likelihood_by_alpha <- numeric(discre_size)

      for (i in discre_size:1) {
        #message

        message("-", appendLF = F)

        h <- bandwidth(alpha[i], beta, pilot)
        likelihood_by_alpha[i] <-
          CppLoglikelihood(D, h, as.integer(n))

        if (i > 2)
          if (is.infinite(likelihood_by_alpha[i]) &
              is.finite(likelihood_by_alpha[i - 1]))
            break
      }

      likelihood_by_alpha[likelihood_by_alpha == 0] <- -Inf
      r <-
        range(which(likelihood_by_alpha >= max(likelihood_by_alpha) - 3))
      if (any(c(1, discre_size) %in% r))
        warning("Rough alpha range not large enough.")
      log.range <-
        log10(alpha)[c(max(1, r[1] - 1), min(discre_size, r[2] + 1))]

      alpha <-
        seq(10 ^ log.range[1], 10 ^ log.range[2], length.out = fine)
    }
    return(alpha)
  }


  #The function for finding grid of alpha and beta
  #refer to paper
  ll <- length(list_beta)
  find_integer_grid <- function(D, list_beta, pilot, step = 1) {
    grid <-
      data.frame(
        beta = c(),
        grid_alpha = c(),
        grid_likelihood = c()
      )

    for (i in 1:length(list_beta)) {


      beta <- list_beta[i]

      A_beta <- find_alpha(beta, D, pilot)

      if(step == 1) {
        message(paste(round((i)/ (ll + 1) * 100), "%", sep = ""), appendLF = F)
      } else {
        message(paste(round((i + 1)/ (ll + 1) * 100), "%", sep = ""), appendLF = F)
      }



      delta_A_beta <- abs(A_beta[2] - A_beta[1])

      grid_likelihood_by_beta <- numeric(length(A_beta))

      for (j in 1:length(A_beta)) {
        h <- bandwidth(A_beta[j], beta, pilot)
        grid_likelihood_by_beta[j] <-
          CppLoglikelihood(D, h, as.integer(n)) #* delta_A_beta
      }
      grid <- rbind(
        grid,
        data.frame(
          beta = beta + numeric(length(A_beta)),
          grid_alpha = A_beta,
          grid_likelihood = grid_likelihood_by_beta
        )
      )
    }

    #grid$grid_likelihood must be reduce the order when normalize
    #becasue sometimes larger than 300
    norm <- grid$grid_likelihood
    fin.norm <- norm[is.finite(norm)]
    norm_result <-
      1 / rowSums(10 ^ (rep(1, length(fin.norm)) %*% t(fin.norm) -
                          fin.norm %*% t(rep(
                            1, length(fin.norm)
                          ))))

    grid$grid_likelihood[is.infinite(norm)] <- 0
    grid$grid_likelihood[is.finite(norm)] <- norm_result

    return(grid)
  }



  # The main computaion as follow

  # step 1 find pilot
  #-------------------------------------------------------------------------------

  cc <- 1
  grid <- find_integer_grid(D, list_beta = beta0, pilot = pilot0, step = 1)


  pilot1 <- numeric(length(D))
  #plot(D, pilot1 / sum(pilot1), type = "l")
  #stop()

  only_use_MxLilke <- T

  if (only_use_MxLilke) {
    ml <- grid[grid$grid_likelihood == max(grid$grid_likelihood),][1,]
    alpha <- ml["grid_alpha"][1, 1]
    beta <- beta0
    h <- bandwidth(alpha, beta, pilot0)

    pilot1 <- make_pilot(D, h, as.integer(n))

  } else {
    for (i in 1:length(grid$grid_alpha)) {
      alpha <- grid$grid_alpha[i]
      beta <- beta0
      h <- bandwidth(alpha, beta, pilot0)
      pilot1 <-
        pilot1 + make_pilot(D, h, as.integer(n)) * grid$grid_likelihood
    }
  }


  #plot(D, pilot1, ylim = c(0, max(pilot1)), type = "l")
  #lines(density(D, bw  = "SJ"))


  #stop()

  # step 2 again find grid and plot density funciton
  #-------------------------------------------------------------------------------
  #beta0 <- 1

  #t <- Sys.time()
  cc <- length(list_beta) - 1
  grid <-
    find_integer_grid(D, list_beta = list_beta, pilot = pilot1, step = 2)

  #plot(x, p_estimate, ylim = c(0, max(p_estimate)), type = "l")

  p_estimate <- numeric(length(x))
  #plot(D, 0.411 / pilot1, type = "l")

 # if (only_use_MxLilke) {
    ml <- grid[grid$grid_likelihood == max(grid$grid_likelihood),][1,]
    h <- bandwidth(ml["grid_alpha"][1, 1], ml["beta"][1, 1], pilot1)
    for (j in 1:length(D)) {
      p_estimate <-  p_estimate +
        1 / n * 1 / h[j] * kernell((x - D[j]) / h[j])
    }
#  } else {
#    for (k in 1:length(unique(grid$beta))) {
#      beta <- list_beta[k]
#      for (i in 1:length(grid[grid$beta == beta,]$grid_alpha)) {
#        alpha <- grid[grid$beta == beta,]$grid_alpha[i]
#        h <- bandwidth(alpha, beta, pilot1)
#        weighted_p <- numeric(length(x))
#        for (j in 1:length(D)) {
#          if (grid[grid$beta == beta,]$grid_likelihood[i] == 0)
#            next
#          weighted_p <- weighted_p +
#            1 / n * 1 / h[j] * kernell((x - D[j]) / h[j]) *
#            grid[grid$beta == beta,]$grid_likelihood[i]
#        }
#        p_estimate <- p_estimate +  weighted_p
        #lines(x, weighted_p, col  = i)
#      }
#    }
#  }

  x <- unnormalize_axis(x)
  y <- p_estimate / (maxd - mind)

  h <- h * (maxd - mind)

  message("")
  return(list(x = x, y = y, bw = h, d = d))
}

#plot(density(d, bw = 0.05))
