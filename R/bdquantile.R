#' plot density curve
#'
#' @param result_bddensity result_bddensity
#' @param q beta
#' @param n_BT beta
#' @param xlim beta
#' @param m xilm
#' @export
bdquantile <- function(
  result_bddesntiy,
  q = 0.05,
  n_BT = 1000,
  xlim = c(NA, NA),
  m = 400
)
  {
  d <- result_bddesntiy$d
  h <- result_bddesntiy$bw

  message("0%", appendLF = F)

d <- d[order(d)]
n <- length(d)
mind <- min(d)
maxd <- max(d)



if (is.na(xlim[1]))
  xlim[1] = mind - (maxd - mind) * 0.02
if (is.na(xlim[2]))
  xlim[2] = max(d) + (maxd - mind) * 0.02

x <- seq(xlim[1], xlim[2], length = m)


# bootstrap result
BT_dens_list =
  matrix(NA, nrow=n_BT, ncol= m)


for(j in 1:n_BT){
  if(((j * 10)%% (round(n_BT / 10) * 10 )) == 0) {
    #print((j * 10)%% (round(n_BT / 10) * 10 ))
    message(paste(round(j / n_BT * 100), "%", sep = ""), appendLF = F)
  }

  if(j != n_BT) {
    if(((j * 10)%% (round(n_BT / 10))) == 0) {
      message("-", appendLF = F)
    }
  }



  sample <- sample(n, n, replace=T)
  d_BT <- d[sample]
  h_BT <- h[sample]

  BT_dens_list[j,] <- make_density(x = x,
                                   D = d_BT,
                                   h = h_BT,
                                   n = as.integer(n),
                                   m = as.integer(m))
  #message(j, appendLF = F)
}

# quqntile
t_pt = matrix(0, ncol = m, nrow = 2)

for(i in 1:m){
  t_pt[,i] = quantile(BT_dens_list[,i],
                      c(q / 2, 1 - q / 2))
}

message("")
return(list(BTsamples = BT_dens_list, x = x, quantile = t_pt))
}

## t_pt: the 1-\alpha quantile of deviation at each point
