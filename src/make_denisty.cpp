#include <Rcpp.h>
using namespace Rcpp;

// [[Rcpp::export]]
NumericVector make_density(NumericVector x, NumericVector D, NumericVector h, int n, int m) {

  NumericVector p(m);
  for(int i = 0; i < m; i++) {
    for(int j = 0; j < n; j++) {
      double a = abs((x[i] - D[j]) / h[j]);
      if(a >= 1) {
        continue;
      }
      p[i] +=  35.0 / 32.0 * pow(1 - pow(a, 2), 3) / h[j];
    }
  }

  p = p / n;

  return p;
}
