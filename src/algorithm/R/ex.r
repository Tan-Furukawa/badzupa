# ex-async.R
needs(dplyr)
attach(input[[1]])
Sys.sleep(5)

return("early returns are ignored")
cat("so are undirected calls to cat")
print("or print")
cat("aaaunless directed to a file", file = "out.Rout")

# # output of final expression is returned to parent
# df %>%
#   mutate(group = cut(rating, nGroups, ordered = T)) %>%
#   group_by(group) %>%
#   summarize_all(funs_(fxn)) %>%
#   select(group, rating, advance) %>%
#   mutate(group = as.character(group))