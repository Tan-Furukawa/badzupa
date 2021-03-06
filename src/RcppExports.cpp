// Generated by using Rcpp::compileAttributes() -> do not edit by hand
// Generator token: 10BE3573-1514-4C36-9D1C-5A225CD40393

#include <Rcpp.h>

using namespace Rcpp;

// CppLoglikelihood
double CppLoglikelihood(NumericVector D, NumericVector h, int n);
RcppExport SEXP _badzupa_CppLoglikelihood(SEXP DSEXP, SEXP hSEXP, SEXP nSEXP) {
BEGIN_RCPP
    Rcpp::RObject rcpp_result_gen;
    Rcpp::RNGScope rcpp_rngScope_gen;
    Rcpp::traits::input_parameter< NumericVector >::type D(DSEXP);
    Rcpp::traits::input_parameter< NumericVector >::type h(hSEXP);
    Rcpp::traits::input_parameter< int >::type n(nSEXP);
    rcpp_result_gen = Rcpp::wrap(CppLoglikelihood(D, h, n));
    return rcpp_result_gen;
END_RCPP
}
// make_density
NumericVector make_density(NumericVector x, NumericVector D, NumericVector h, int n, int m);
RcppExport SEXP _badzupa_make_density(SEXP xSEXP, SEXP DSEXP, SEXP hSEXP, SEXP nSEXP, SEXP mSEXP) {
BEGIN_RCPP
    Rcpp::RObject rcpp_result_gen;
    Rcpp::RNGScope rcpp_rngScope_gen;
    Rcpp::traits::input_parameter< NumericVector >::type x(xSEXP);
    Rcpp::traits::input_parameter< NumericVector >::type D(DSEXP);
    Rcpp::traits::input_parameter< NumericVector >::type h(hSEXP);
    Rcpp::traits::input_parameter< int >::type n(nSEXP);
    Rcpp::traits::input_parameter< int >::type m(mSEXP);
    rcpp_result_gen = Rcpp::wrap(make_density(x, D, h, n, m));
    return rcpp_result_gen;
END_RCPP
}
// make_pilot
NumericVector make_pilot(NumericVector D, NumericVector h, int n);
RcppExport SEXP _badzupa_make_pilot(SEXP DSEXP, SEXP hSEXP, SEXP nSEXP) {
BEGIN_RCPP
    Rcpp::RObject rcpp_result_gen;
    Rcpp::RNGScope rcpp_rngScope_gen;
    Rcpp::traits::input_parameter< NumericVector >::type D(DSEXP);
    Rcpp::traits::input_parameter< NumericVector >::type h(hSEXP);
    Rcpp::traits::input_parameter< int >::type n(nSEXP);
    rcpp_result_gen = Rcpp::wrap(make_pilot(D, h, n));
    return rcpp_result_gen;
END_RCPP
}

static const R_CallMethodDef CallEntries[] = {
    {"_badzupa_CppLoglikelihood", (DL_FUNC) &_badzupa_CppLoglikelihood, 3},
    {"_badzupa_make_density", (DL_FUNC) &_badzupa_make_density, 5},
    {"_badzupa_make_pilot", (DL_FUNC) &_badzupa_make_pilot, 3},
    {NULL, NULL, 0}
};

RcppExport void R_init_badzupa(DllInfo *dll) {
    R_registerRoutines(dll, NULL, CallEntries, NULL, NULL);
    R_useDynamicSymbols(dll, FALSE);
}
