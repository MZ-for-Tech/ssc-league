Lesson 4 of 5 · Lecture 3_1

Visualisation with pandas#
A table of 891 numbers tells you nothing at a glance. The same numbers as a picture tell you the answer in a second. Pandas can draw the common charts directly, with one method call.

The Python plotting libraries#
Library	What it's for
Matplotlib	the foundation. Total control over every pixel — axes, gridlines, colours. Can draw almost anything, but verbose.
Seaborn	built on top of Matplotlib, designed for statistics. Heatmaps and violin plots that look good by default.
Plotly / Bokeh	interactive charts for the web — zoom, pan, hover for details. For dashboards.
This lesson uses pandas.plot(), which is a thin, convenient layer over Matplotlib. It's limited, and that's the point: it's for quick exploratory analysis, when you want to see the data, not publish it.

These cells load two libraries

Every cell on this page needs pandas and matplotlib — roughly 20 MB on first Run. Give the first one 30–60 seconds. Every cell after that runs instantly.

Choosing the right chart#
This table is the most useful thing on the page. The mistake beginners make isn't drawing a chart badly — it's drawing the wrong kind.

Chart	Variable types	What it shows
Histogram	one numerical	Distribution — how values spread out
Pie chart	one categorical	Composition — how parts make up a whole
Bar chart	categorical + numerical	Comparison — values across categories
Stacked bar	categorical + numerical	Comparison and composition at once
Box plot	categorical + numerical	Comparison of distributions across categories
Line chart	numerical vs numerical, or time series	Relationship or trend over time
Scatter plot	numerical vs numerical	Relationship between two variables
The question decides the chart

Ask yourself what you're trying to show: distribution, composition, comparison, or relationship. Each word points at a different row in that table. A pie chart of numerical data, or a line chart across unordered categories, isn't a style mistake — it's a claim about your data that isn't true.

Bar chart — comparison#
A simple bar chart — comparing values across categories
pandas · matplotlib
Reset
▶ Run
import pandas as pd

data = {'Student': ['A', 'B', 'C', 'D'],
        'Math': [10, 20, 30, 40],
        'Economics': [5, 15, 25, 35]}
df = pd.DataFrame(data)

df.plot.bar(x='Student', title='Scores by student')

print(df)
print("\nThe chart appears below the text output.")
Histogram — distribution#
A histogram — where do the values cluster?
pandas · matplotlib
Reset
▶ Run
import pandas as pd
from pyodide.http import open_url

df = pd.read_csv(open_url(DATA_URL + "titanic.csv"))

df['age'].plot.hist(bins=20, title='Distribution of passenger age')

print("Age statistics:")
print(df['age'].describe().round(2))
What bins does

A histogram sorts values into buckets and counts each bucket. bins=20 means twenty buckets. Too few and you flatten out real structure; too many and you see noise. Try bins=5 and bins=100 on the cell above — the data hasn't changed at all, but the story it appears to tell has. Always try a couple of values before you believe a shape.

Scatter plot — relationship#
A scatter plot — two numerical variables against each other
pandas · matplotlib
Reset
▶ Run
import pandas as pd
from pyodide.http import open_url

df = pd.read_csv(open_url(DATA_URL + "titanic.csv"))

df.plot.scatter(x='age', y='fare', title='Passenger age vs fare paid', alpha=0.5)

print("Correlation between age and fare:",
      round(df['age'].corr(df['fare']), 3))
print("\nWeak. The scatter shows why: fare is driven by class, not age.")
Bar chart of counts#
Counting categories, then plotting — value_counts() feeds straight into plot.bar()
pandas · matplotlib
Reset
▶ Run
import pandas as pd
from pyodide.http import open_url

df = pd.read_csv(open_url(DATA_URL + "titanic.csv"))

sex_count = df['sex'].value_counts()
print(sex_count)
sex_count.plot.bar(title='Passenger count by sex', ylabel='Count', rot=0)

class_count = df['pclass'].value_counts().sort_index()
print()
print(class_count)
class_count.plot.bar(title='Passenger count by class', ylabel='Count', rot=0)
.sort_index() on that second one

value_counts() sorts by frequency, largest first — so the classes would come out in the order 3, 1, 2. For a category with a natural order (class 1, 2, 3; Jan, Feb, Mar; low/medium/high), always .sort_index() before plotting, or your chart tells the reader a sequence that doesn't exist.

Box plot — comparing distributions#
A box plot shows the median, the quartiles, and the range in one shape — so you can compare whole distributions side by side instead of just their averages.

A box plot — fare paid, by survival
pandas · matplotlib
Reset
▶ Run
import pandas as pd
from pyodide.http import open_url

df = pd.read_csv(open_url(DATA_URL + "titanic.csv"))

df.boxplot(column='fare', by='survived', sym='')
# sym='' hides the outlier dots, which otherwise squash the boxes flat

print(df.groupby('survived')['fare'].describe().round(2))
Why the box plot beats the mean here

The table above shows survivors paid a higher average fare. But the box plot shows something the average hides: the two distributions overlap heavily. Plenty of people who paid a lot still died, and plenty who paid little survived.

"Group A has a higher mean than group B" is one of the easiest ways to mislead with data — and with real people's lives in the rows, it matters. The box plot makes the spread visible, so you can see how much of the story the average is leaving out.

Line chart — trends#
A line chart — for time series and ordered data
pandas · matplotlib
Reset
▶ Run
import pandas as pd

# Egypt's population, in millions, at ten-year intervals
df = pd.DataFrame({
    'Year': [1960, 1970, 1980, 1990, 2000, 2010, 2020],
    'Population': [26.6, 34.8, 43.3, 55.2, 66.1, 82.0, 102.3]
})

df.plot.line(x='Year', y='Population', marker='o',
             title='Population of Egypt, 1960-2020', ylabel='Millions')

print(df)
print("\nGrowth over the period:",
      round((102.3 / 26.6 - 1) * 100, 1), "%")
Line charts imply continuity

Joining points with a line says "the values in between follow this path." That's true for population over time. It is not true for a line chart across countries or product categories — there's nothing between Egypt and France for the line to represent. Unordered categories get a bar chart.

Pie chart — composition#
A pie chart — use sparingly
pandas · matplotlib
Reset
▶ Run
import pandas as pd
from pyodide.http import open_url

df = pd.read_csv(open_url(DATA_URL + "titanic.csv"))

counts = df['pclass'].value_counts().sort_index()
counts.plot.pie(autopct='%1.1f%%', title='Passengers by class', ylabel='')

print(counts)
Why professionals avoid pie charts

People judge angles badly. Three slices at 30%, 33%, and 37% look essentially identical in a pie, and completely distinct as bars. A pie works only with very few slices, and when the message is genuinely "these are parts of one whole." For everything else, a bar chart is more honest and easier to read.

See what else is available#
Explore the plot methods — dir() from Module 2, put to work
pandas · matplotlib
Reset
▶ Run
import pandas as pd

df = pd.DataFrame({'a': [1, 2, 3], 'b': [4, 5, 6]})

kinds = [m for m in dir(df.plot) if not m.startswith('_')]
print("Available plot types:")
for k in kinds:
    print("  df.plot." + k + "()")
