# for r-script variables
#----------------------------------------------------------------------
attach(input[[1]])

# for test variables
#----------------------------------------------------------------------
# data <- data.frame(age = rnorm(100), sd = rnorm(100))
# algorithm <- 'sj'
# dir = "."
# Nbootstrap <- 400
# confidentLevel <- 95

noiseSize <- 1
# execute part
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

age <- data$age
minAge <- min(age) - (max(age) - min(age)) * 0.1
maxAge <- max(age) + (max(age) - min(age)) * 0.1

algorithms <- list(
    default = function(x) density(x),
    sj = function(x) density(x, bw = "SJ", from = minAge, to = maxAge),
    adeba = function(x) badzupaR::adeba_density(x, from = minAge, to = maxAge),
    botev = function(x) IsoplotR::kde(x, from = minAge, to = maxAge, plot=F)
)

watherFn <- function(i, N) {
  write(paste('{"method":"bootstrap", "index":', i, ', "all":', N, '}'), file = paste(dir, "/bootstrap.txt", sep = ""));
}

densityFn <- algorithms[[algorithm]]
boot <- badzupaR::Bootstrap$new(Nbootstrap, age, densityFn, noiseSize, watherFn)
bootRes <- boot$doAllProcess(show = FALSE, progress = FALSE)
ci <- boot$getCI(lowerP = (1 - confidentLevel * 0.01) / 2, upperP = (1 + confidentLevel * 0.01) / 2)

peaks <- boot$peaksInBootstrapResult
peaksSummary <- data.frame(
        id = c(),
        peakX = c(),
        peakY = c(),
        prominence = c()
    )

for (i in 1:length(peaks)) {
  peaksSummary <- rbind(peaksSummary, data.frame(
        id = i,
        x = paste(peaks[[i]]$peaksX),
        y = paste(peaks[[i]]$peaksY),
        prominence = paste(peaks[[i]]$prominence)
    ))
}

# cat('bootstrap done!', file = paste(dir, "/crossValidation.txt", sep = ""));

res <- list(
    ci = data.frame(x = paste(ci$x), lowerCi = paste(ci$lowerCI), upperCi = paste(ci$upperCI)),
    bootstrapPeaks = peaksSummary,
    peaksCertainty = data.frame(
        mean = paste(bootRes$mu),
        sd = paste(bootRes$s),
        certainty = paste(bootRes$pi),
        prominence = paste(bootRes$prominence),
        y = paste(bootRes$y)
        )
    )

res
