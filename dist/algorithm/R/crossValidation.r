# for r-script variables
#----------------------------------------------------------------------
attach(input[[1]])

# for test variables
#----------------------------------------------------------------------
# data <- data.frame(age = rnorm(100), sd = rnorm(100) * 0.1)
# cvN <- 10
# dir = "."

# execute part
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
age <- data$age
sd <- data$sd

minAge <- min(age) - (max(age) - min(age)) * 0.1
maxAge <- max(age) + (max(age) - min(age)) * 0.1

algorithms = list(
# default = function(x) density(x),
    sj = function(x) density(x, bw = "SJ", from = minAge, to=maxAge),
    adeba = function(x) badzupaR::density.adeba(x, from = minAge, to=maxAge),
    botev = function(x) IsoplotR::kde(x, from = minAge, to=maxAge, plot=F)
)[algorithmList]

watherFn <- function(i, N) {
  write(paste('{"method":"crossValidation", "index":', i, ', "all":', N, '}'), file = paste(dir, "/crossValidation.txt", sep = ""));
}

cv <- badzupaR::Cv$new(algorithms, age, watcher = watherFn)
res <- cv$exeCVinAllAlgorithm()
# cat(toString(res), file = paste(dir, "/crossValidation.txt", sep = ""));

res
