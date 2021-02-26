#include <Rcpp.h>
using namespace Rcpp;

// [[Rcpp::export]]
NumericVector make_pilot (NumericVector D, NumericVector h, int n) {

  NumericVector pilot(n);

  for(int i = 0; i < n; i++) {

    for(int j = i + 1; j < n; j++) {
      double a = abs((D[i] - D[j]) / h[j]);
      if(a > 1) break;
      pilot[i] +=  35.0 / 32.0 * pow(1 - pow(a, 2), 3) / h[j];
    }

    for(int j = i - 1; j >= 0; j--) {
      double a = abs((D[i] - D[j]) / h[j]);
      if(a > 1) break;
      pilot[i] += 35.0 / 32.0 * pow(1 - pow(a, 2), 3) / h[j];
    }

  }

  pilot = pilot * 1 / (n - 1);

  return pilot;
}


