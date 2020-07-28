find_peaks <- function(
		       vec,
		       limmit = 0.01,
		       detection = "peak"
		       ){

	m <- length(vec)
	nx <- seq(0,10,length = m)

	merge_diff <- function(vec, num){
		lv <- length(num)
		i <- 1
		merged <- c()
		new_num <- c()
		Sum <- 0
		while(i < lv){
			Sum <- 0
			if(vec[i] < 0){
				while(vec[i] < 0){
					Sum <- Sum + vec[i]
					if(i >= lv){
						break
					}
					i <- i + 1
				}
				merged <- c(merged, Sum)
				new_num <- c(new_num, num[i - 1])

			}else{
				while(vec[i] >= 0){
					Sum <- Sum + vec[i]
					if(i >= lv){
						break
					}
					i <- i + 1
				}
				merged <- c(merged, Sum)
				new_num <- c(new_num, num[i - 1])
			}
		}
		ans <- data.frame(vec = merged, num = new_num)
		return(ans)

	}

	merge_noise <- function(df, lim){
		i <- 2
		Sum <- 0
		repeat{
			if(abs(df$vec[i]) < lim){
				Sum <- df$vec[i - 1] + df$vec[i] + df$vec[i + 1]
				df$vec[i + 1] <- Sum
				df <- df[-c(i, (i - 1)), ]
				i <- 2
			}else{
				i <- i + 1
			}
			if(i > length(df$vec) - 1){
				break
			}
		}
		return(df)
	}


	lim = limmit * max(vec)
	diff_vec <- diff(vec)
	diff_merge <- merge_diff(diff_vec, 1:length(diff_vec))

	diff_merge <- rbind(c(0, 0), diff_merge, c(0,m))
	diff_merge_no_noise <- merge_noise(diff_merge, lim)
	num_diff <- diff_merge_no_noise$num

	if(detection == "peak"){
		num <- diff_merge_no_noise[diff_merge_no_noise$vec > 0, ]$num
	} else {
		num <- diff_merge_no_noise[diff_merge_no_noise$vec < 0, ]$num
	}
	num <- num[num < (m - 2)]

	
	#Calculate vertices by approximating a quadratic function
	del <- nx[2] - nx[1]
	lt <- length(num)  
	ans <- data.frame(x = numeric(lt), y = numeric(lt))

	for(i in 1:lt){
		j <- num[i] + 1
		if(length(j)){
			a <- nx[j]
			A <- rbind(c((a - del)^2, a - del, 1), c(a^2, a, 1), c((a + del)^2, a + del, 1))
			#quadratic function is
			B <- solve(A) %*% c(vec[j - 1], vec[j], vec[j + 1])


			ans[i, ] <- c(-B[2] / (2 * B[1]), B[3] - B[2]^2 / (4 * B[1]))
		}
	}
	return(ans)
}

