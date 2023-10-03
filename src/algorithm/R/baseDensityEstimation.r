# for r-script variables
#----------------------------------------------------------------------
attach(input[[1]])

# for test variables
#----------------------------------------------------------------------
# data <- rnorm(100)
# algorithm <- "sj"
# dir = "."

# execute part
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

age <- data$age
minAge <- min(age) - (max(age) - min(age)) * 0.1
maxAge <- max(age) + (max(age) - min(age)) * 0.1

algorithms <- list(
    default = function(x) density(x),
    sj = function(x) density(x, bw = "SJ", from=minAge, to=maxAge),
    adeba = function(x) badzupaR::density.adeba(x, from=minAge, to=maxAge),
    botev = function(x) IsoplotR::kde(x, from=minAge, to=maxAge, plot=F)
)

densityFn <- algorithms[[algorithm]]
densityRes <- densityFn(age)

# cat('base density estimation done!', file = paste(dir, "/crossValidation.txt", sep = ""));

res <- data.frame(x = paste(densityRes$x), y = paste(densityRes$y));

# cat(res$y, file = paste(dir, "/aaaa.txt", sep = ""));

res