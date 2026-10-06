# Paired-source notes

- The Markdown `5_titanic.md` aligns with the capstone case study in Module 3 Lecture 3_1 PDF, pp. 60–68.
- The PDF loads the Seaborn Titanic sample; the Markdown loads the course-hosted CSV copy. This package uses the Seaborn sample CSV in `source_data/titanic.csv`, consistent with the reported 891 rows and 15 columns.
- The stated cleaning sequence is reproduced exactly: select sex, age, pclass, survived, fare; remove missing ages (891 → 714); remove duplicate rows among those five selected fields (714 → 670).
- Survival rates and group counts in the items and figures were calculated from that 670-row table. Missing-age chart values are calculated from the full 891-row data before row removal.
- The lesson itself warns that identical values on five fields do not establish that two real passengers are the same person. Items preserve that caution and avoid treating the 44 removals as verified identity duplicates.
- Plots use pandas plotting with Matplotlib, for all charts, matching the course’s pandas plotting methods. All generated figures are SVG.
