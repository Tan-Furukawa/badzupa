#include <Rcpp.h>
using namespace Rcpp;

// [[Rcpp::export]]
double CppLoglikelihood(NumericVector D, NumericVector h, int n) {

  NumericVector logsum(n);
  double logsum_local;

  for(int i = 0; i < n; i++) {
    logsum_local = 0;

    for(int j = i + 1; j < n; j++) {
      double a = abs((D[i] - D[j]) / h[j]);

      if(a > 1) break;

      logsum_local +=  35.0 / 32.0 * pow(1 - pow(a, 2), 3) / h[j];
    }

    for(int j = i - 1; j >= 0; j--) {
      double a = abs((D[i] - D[j]) / h[j]);
      if(a > 1) break;

      logsum_local += 35.0 / 32.0 * pow(1 - pow(a, 2), 3) / h[j];
    }

    logsum[i] = log10(logsum_local * 1 / (n - 1));
  }

  return sum(logsum);
}


