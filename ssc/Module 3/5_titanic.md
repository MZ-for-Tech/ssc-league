Lesson 5 of 5 · Lecture 3_1

Case study: who survived the Titanic?#
891 real passengers. One question. Everything you have learned across three modules, applied end to end — load, clean, describe, cross-tabulate, visualise, and interpret.

The dataset#
The Titanic dataset comes from the real sinking in April 1912. Each row is a passenger; the columns record their sex, age, class, the fare they paid, and — the column everything else points at — whether they survived.

The full dataset has 891 rows and 15 columns. We'll focus on five variables: sex, age, pclass, fare, survived.

First Run takes a while

Every cell loads pandas and matplotlib — around 20 MB the first time. Run the cells in order, top to bottom; each one rebuilds what it needs, so they also work on their own.

Step 1 — Load and inspect#
Step 1: load the data — and look before you leap
pandas
Reset
▶ Run
import pandas as pd
from pyodide.http import open_url

# In Jupyter or Colab this line is simply:  df = pd.read_csv("titanic.csv")
df = pd.read_csv(open_url(DATA_URL + "titanic.csv"))

print("Shape:", df.shape)
print()
df.info()
print()
print(df.head())
Step 2 — Select and clean#
Real data is never ready to use. Three things need doing: pick the columns that matter, deal with missing values, and remove duplicate records.

Step 2: clean the data — 891 -> 714 -> 670
pandas
Reset
▶ Run
import pandas as pd
from pyodide.http import open_url

df = pd.read_csv(open_url(DATA_URL + "titanic.csv"))

# Keep only the five variables we need
df_cleaned = df[['sex', 'age', 'pclass', 'survived', 'fare']]
print("After selecting columns:", df_cleaned.shape)

# How much is missing?
print("\nMissing values per column:")
print(df_cleaned.isnull().sum())

# Drop rows with no recorded age
df_cleaned = df_cleaned.dropna(subset=['age'])
print("\nAfter dropping missing ages:", df_cleaned.shape)

# Drop duplicate records
print("Duplicate rows:", df_cleaned.duplicated().sum())
df_cleaned = df_cleaned.drop_duplicates()
print("After dropping duplicates:", df_cleaned.shape)

print(f"\nWe started with {len(df)} passengers and kept {len(df_cleaned)}.")
print(f"That is {round(len(df_cleaned)/len(df)*100, 1)}% of the original data.")
We just threw away a quarter of the passengers

177 people had no recorded age, and we removed all of them. Ask the obvious question: were they a random quarter? Almost certainly not — age was recorded less often for third-class passengers, which are exactly the group with the lowest survival rate.

So every number from here on describes "passengers whose age was recorded", not "passengers". That distinction is the difference between an analysis and a mistake, and it belongs in your write-up, not in a footnote.

(The 44 "duplicates" deserve a second look too. Two different 24-year-old third-class men who both paid £7.75 and both died would be identical across our five columns — but they were two people, not one.)

Step 3 — Describe#
Step 3: descriptive statistics — numerical and categorical
pandas
Reset
▶ Run
import pandas as pd
from pyodide.http import open_url

df = pd.read_csv(open_url(DATA_URL + "titanic.csv"))
df_cleaned = df[['sex', 'age', 'pclass', 'survived', 'fare']]
df_cleaned = df_cleaned.dropna(subset=['age']).drop_duplicates()

print("--- Age (numerical) ---")
print(df_cleaned['age'].describe().round(2))

print("\n--- Sex (categorical) ---")
print(df_cleaned['sex'].value_counts())

print("\n--- Class (categorical) ---")
print(df_cleaned['pclass'].value_counts().sort_index())

print("\n--- Overall survival ---")
print(df_cleaned['survived'].value_counts())
rate = df_cleaned['survived'].mean()
print(f"\nOverall survival rate: {round(rate * 100, 1)}%")
Step 4 — Cross-tabulation#
A crosstab counts how two categorical variables combine. With normalize='index' you get row percentages — which is what turns counts into a rate.

Step 4: survival by sex and by class — the central result
pandas
Reset
▶ Run
import pandas as pd
from pyodide.http import open_url

df = pd.read_csv(open_url(DATA_URL + "titanic.csv"))
df_cleaned = df[['sex', 'age', 'pclass', 'survived', 'fare']]
df_cleaned = df_cleaned.dropna(subset=['age']).drop_duplicates()

print("--- Survival by sex (row percentages) ---")
survival_by_sex = pd.crosstab(df_cleaned['sex'], df_cleaned['survived'],
                              normalize='index').round(2)
print(survival_by_sex)

print("\n--- Survival by class (row percentages) ---")
survival_by_pclass = pd.crosstab(df_cleaned['pclass'], df_cleaned['survived'],
                                 normalize='index').round(2)
print(survival_by_pclass)

print("\nColumn 0 = died, column 1 = survived.")
Read those two tables out loud

75% of women survived. 22% of men survived. A woman aboard was more than three times as likely to live.

66% of first class survived. 50% of second. 25% of third. A first-class passenger was more than two and a half times as likely to live as a third-class one.

"Women and children first" was not just a phrase — it shows up in the data, sharply. And so does the deck you slept on.

Step 5 — Visualise#
Step 5: the charts — four views of the same 670 people
pandas · matplotlib
Reset
▶ Run
import pandas as pd
from pyodide.http import open_url

df = pd.read_csv(open_url(DATA_URL + "titanic.csv"))
df_cleaned = df[['sex', 'age', 'pclass', 'survived', 'fare']]
df_cleaned = df_cleaned.dropna(subset=['age']).drop_duplicates()

# 1. Distribution of age
df_cleaned['age'].plot.hist(bins=20, title='Distribution of passenger age')

# 2. Age vs fare
df_cleaned.plot.scatter(x='age', y='fare', alpha=0.5,
                        title='Passenger age vs fare paid')

# 3. Counts by class
class_count = df_cleaned['pclass'].value_counts().sort_index()
class_count.plot.bar(title='Passenger count by class', ylabel='Count', rot=0)

# 4. Fare distribution, by whether they survived
df_cleaned.boxplot(column='fare', by='survived', sym='')

print("Four charts below.")
print("Look at chart 3: third class was the largest group by far -")
print("and from Step 4 we know it had the lowest survival rate.")
Stacked bars — the survival rates — the two crosstabs, drawn
pandas · matplotlib
Reset
▶ Run
import pandas as pd
from pyodide.http import open_url

df = pd.read_csv(open_url(DATA_URL + "titanic.csv"))
df_cleaned = df[['sex', 'age', 'pclass', 'survived', 'fare']]
df_cleaned = df_cleaned.dropna(subset=['age']).drop_duplicates()

survival_by_sex = pd.crosstab(df_cleaned['sex'], df_cleaned['survived'],
                              normalize='index').round(2)
survival_by_pclass = pd.crosstab(df_cleaned['pclass'], df_cleaned['survived'],
                                 normalize='index').round(2)

survival_by_sex.plot.bar(stacked=True, rot=0,
                         title='Survival rate by sex', ylabel='Proportion')

survival_by_pclass.plot.bar(stacked=True, rot=0,
                            title='Survival rate by passenger class',
                            ylabel='Proportion')

print("Each bar totals 1.0, so you are comparing proportions, not counts.")
print("That is what makes groups of very different sizes comparable.")
Step 6 — Go further#
The two factors clearly interact. Does class still matter once you account for sex — or is it the same story twice?

Step 6: both factors at once — groupby with two columns
pandas
Reset
▶ Run
import pandas as pd
from pyodide.http import open_url

df = pd.read_csv(open_url(DATA_URL + "titanic.csv"))
df_cleaned = df[['sex', 'age', 'pclass', 'survived', 'fare']]
df_cleaned = df_cleaned.dropna(subset=['age']).drop_duplicates()

print("--- Survival rate by sex AND class ---")
combined = df_cleaned.groupby(['sex', 'pclass'])['survived'].mean().unstack().round(2)
print(combined)

print("\n--- how many people in each cell ---")
print(df_cleaned.groupby(['sex', 'pclass']).size().unstack())

print("\n--- average age and fare by survival ---")
print(df_cleaned.groupby('survived')[['age', 'fare']].mean().round(2))
Now read the combined table

Both factors matter, and they compound. A first-class woman had a survival rate near the top of the table; a third-class man near the bottom. Neither variable alone tells you as much as the two together.

Notice also the counts table underneath. Some cells hold very few people — a rate computed from a handful of passengers is unreliable, however precise the decimal makes it look. Always print the group sizes next to the group rates.

What you just did#
Across six steps you:

Loaded a real CSV file into a DataFrame.
Inspected it with shape, info(), and head().
Cleaned it — selected columns, handled missing values, removed duplicates — and thought about what that cost.
Described it with describe() and value_counts().
Cross-tabulated two categorical variables into rates.
Visualised it five ways, choosing each chart to fit the question.
Grouped by two variables at once to see how factors interact.
That is a complete exploratory data analysis. It's the first thing a professional does with any new dataset, and you can now do it.

What's next#
"What factors best explain why some passengers lived and others died?"

We can describe what happened. Saying which factors best explain it — holding the others constant, with a measure of confidence — needs regression and machine learning. That's the next course.

But the hard part is behind you. You can think in algorithms, write Python, and handle real data. The rest is technique.

Test your ability#
Pick one of these datasets and run the same analysis you just did:

Dataset	What it covers
World Happiness	happiness scores against GDP, social support, life expectancy
COVID-19 impact survey	effects on mental health, employment, and daily life
World Population	age distribution, fertility rates, migration
For your chosen dataset:

Download and read it.
Get the information you need to understand its structure.
Produce descriptive statistics for the whole dataset.
Separate the categorical and numerical variables.
Describe each group separately.
Compute a correlation matrix for the numerical variables.
Plot the distribution of the important variables.
Plot the relationships between them.
Then write up what you found — and what your cleaning decisions cost you.
