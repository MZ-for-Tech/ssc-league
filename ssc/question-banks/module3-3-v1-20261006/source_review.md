# Paired-source notes

- `3_summarising_and_filtering.md` is Lesson 3 of 5. It matches the summary, missingness, grouping, filtering, CSV, and category-count material in Lecture 3_1 PDF slides 34–46 and 48–53.
- PDF slide 47 introduces method chaining, which is not a focus in the Lesson 3 Markdown; it is excluded. Slides 54–55 contain prewritten questions, which this batch does not reproduce.
- PDF slide 34 labels `count()` as number of rows; pandas `count()` counts non-null values per column. The questions use the method's actual behavior and Lesson 3's explanation of non-null counts.
- PDF slide 39 assigns `data_1 = data` before an in-place `dropna`, so the alias refers to the same object and changes `data` too. Questions avoid treating that assignment as an independent copy.
- The lecture's correlation value of 0.78 comes from four countries. The batch tests association and the explicit cautions about small samples and causation.
- CSV examples use generic local filenames and distinguish `read_csv`, `to_csv`, and `to_excel`; browser-only `open_url` setup is not assessed.
