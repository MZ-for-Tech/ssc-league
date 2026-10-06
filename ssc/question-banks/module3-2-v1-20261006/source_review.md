# Paired-source notes

- `2_pandas.md` is Lesson 2 of 5 and matches the DataFrame basics material in Lecture 3_1. This batch uses the corresponding PDF slides 14–33.
- Slides 34 onward introduce summary statistics, missing-data methods, groupby, filtering, CSV, visualization, and Titanic case-study content. Those later topics are excluded because they belong to subsequent lessons.
- PDF slide 23 says `sample(2)` but comments that it gets 3 random rows. The batch tests the method's argument semantics, not that mistaken comment.
- PDF slide 30's output appears to show repeated rows after appending; source code appends the same row twice because it runs both examples sequentially. Questions assess the separate intended `concat` and `.loc` operations.
- PDF slide 32 demonstrates `df = df.drop(..., inplace=True)`, which assigns `None` back to `df`. The Markdown explicitly warns against this. The batch identifies it as an error and gives the safe patterns.
- The Markdown's data-type table includes `float64` and `bool`; PDF slide 22 only discusses `int64` and `object`. The float dtype item is keyed to the Markdown.
- PDF slide 22 mentions int64 bounds that are not needed for this lesson's practical distinction; questions assess common dtype interpretation rather than memorization of numeric limits.
- The BMI example's conditional code has independent `if` statements; the stated mutually exclusive intervals still give the shown outcomes. Questions use the stated intervals and avoid edge ambiguity.
