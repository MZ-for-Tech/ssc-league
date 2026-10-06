Lesson 2 of 5 · Lecture 3_1

Pandas basics: building and reading a DataFrame#
A DataFrame is a table you can program. This lesson covers making one, finding out what's in it, and reaching any row, column, or cell you want.

First Run is slow on this page

Every cell here loads pandas, which the browser downloads once (about 10 MB). The first Run takes 20–40 seconds; after that it's instant for the rest of the page.

Attributes and methods#
Two words you'll see constantly, and the distinction is simple:

An attribute is a characteristic of the object. No parentheses: df.shape.
A method is an action the object performs. Always parentheses: df.describe().
If you forget the parentheses on a method, Python prints something cryptic about a "bound method" instead of your result. That message means "you asked for the action itself, not the result of doing it."

The attributes worth knowing#
Attribute	Returns
columns	the column labels
index	the row labels
shape	(number of rows, number of columns)
size	total number of cells
dtypes	the data type of each column
values	the underlying data
loc	access rows/columns by label
iloc	access rows/columns by integer position
Three ways to create the same DataFrame#
Three routes to one table — lists of lists, a dictionary, or a list of dictionaries
pandas
Reset
▶ Run
import pandas as pd

# ---- 1. From a list of lists (row by row) ----
f = ['Names', 'Country', 'City']
d = [['Mohammed', 'Egypt',  'Banha'],
     ['Ann',      'UK',     'London'],
     ['John',     'Sweden', 'Stockholm']]
df1 = pd.DataFrame(columns=f, data=d)

# ---- 2. From a dictionary (column by column) ----
data = {'Names':   ['Mohammed', 'Ann', 'John'],
        'Country': ['Egypt', 'UK', 'Sweden'],
        'City':    ['Banha', 'London', 'Stockholm']}
df2 = pd.DataFrame(data)

# ---- 3. From a list of dictionaries (row by row) ----
data = [{'Names': 'Mohammed', 'Country': 'Egypt',  'City': 'Banha'},
        {'Names': 'Ann',      'Country': 'UK',     'City': 'London'},
        {'Names': 'John',     'Country': 'Sweden', 'City': 'Stockholm'}]
df3 = pd.DataFrame(data)

print(df1)
print("\nAll three identical?", df1.equals(df2) and df2.equals(df3))
You already built option 3 by hand

The list-of-dictionaries at the end of Module 2 — the survey responses — is exactly this structure. pd.DataFrame(data) is the one line that turns your hand-built Python data into something you can sort, filter, group, and plot.

Notice the printed output: column names across the top, the index (0, 1, 2) down the side, and the values in the middle.

Inspecting a DataFrame#
What's in this table? — the attributes, one at a time
pandas
Reset
▶ Run
import pandas as pd

f = ['Names', 'Country', 'City']
d = [['Mohammed', 'Egypt', 'Banha'],
     ['Ann', 'UK', 'London'],
     ['John', 'Sweden', 'Stockholm']]
df = pd.DataFrame(columns=f, data=d)

print("shape  :", df.shape)      # (rows, columns)
print("size   :", df.size)       # rows * columns
print("columns:", list(df.columns))
print("index  :", list(df.index))
print()
print("dtypes:")
print(df.dtypes)
df.info() — the single most useful command on a new dataset
pandas
Reset
▶ Run
import pandas as pd

f = ['Names', 'Country', 'City']
d = [['Mohammed', 'Egypt', 'Banha'],
     ['Ann', 'UK', 'London'],
     ['John', 'Sweden', 'Stockholm']]
df = pd.DataFrame(columns=f, data=d)

df.info()
Run .info() on every dataset, before anything else

In one command it tells you how many rows there are, what every column is called, how many non-null values each column has, and what type each one is. That third item is the important one: if a column says 714 non-null and the table has 891 rows, you have 177 missing values and any average you compute is quietly based on a subset.

Data types#
dtype	Means
int64	whole numbers
float64	numbers with decimals
object	usually strings (technically any Python object)
bool	True/False
A column of numbers showing up as object is a warning sign — it usually means a stray piece of text somewhere in the column, and arithmetic on it will fail.

Accessing the data#
The first look: head, tail, sample#
head, tail, sample — never print the whole table first
pandas
Reset
▶ Run
import pandas as pd

df = pd.DataFrame({
    "Country": ["Egypt", "UK", "Sweden", "France", "Italy", "Germany", "Spain"],
    "Capital": ["Cairo", "London", "Stockholm", "Paris", "Rome", "Berlin", "Madrid"],
    "Population": [104, 67, 10, 68, 59, 83, 47]
})

print("--- head() : first 5 rows by default ---")
print(df.head())

print("\n--- head(2) ---")
print(df.head(2))

print("\n--- tail(3) : last 3 rows ---")
print(df.tail(3))

print("\n--- sample(3) : 3 random rows ---")
print(df.sample(3))
Columns#
Selecting columns — one column, or several
pandas
Reset
▶ Run
import pandas as pd

f = ['Names', 'Country', 'City']
d = [['Mohammed', 'Egypt', 'Banha'],
     ['Ann', 'UK', 'London'],
     ['John', 'Sweden', 'Stockholm']]
df = pd.DataFrame(columns=f, data=d)

print("--- one column (bracket notation) ---")
print(df['Names'])

print("\n--- the same thing with dot notation ---")
print(df.Names)

print("\n--- two columns: note the DOUBLE brackets ---")
print(df[['Names', 'City']])
Single versus double brackets

df['Names'] gives you one column as a Series (a single labelled column of data). df[['Names', 'City']] gives you a DataFrame — a table with two columns.

The double bracket is really a list inside the brackets: you're passing a list of column names. And prefer bracket notation over df.Names — dot notation breaks silently on any column whose name has a space in it.

Rows and cells: loc and iloc#
iloc = integer location. Access by position: df.iloc[0] is the first row.
loc = location by label. Access by name: df.loc[:, 'City'].
loc and iloc — by position and by name
pandas
Reset
▶ Run
import pandas as pd

f = ['Names', 'Country', 'City']
d = [['Mohammed', 'Egypt', 'Banha'],
     ['Ann', 'UK', 'London'],
     ['John', 'Sweden', 'Stockholm']]
df = pd.DataFrame(columns=f, data=d)

print("--- df.iloc[0:2] : rows 0 and 1 ---")
print(df.iloc[0:2])

print("\n--- df.iloc[[0, 2]] : rows 0 and 2 specifically ---")
print(df.iloc[[0, 2]])

print("\n--- df.iloc[:, [0, 2]] : all rows, columns 0 and 2 ---")
print(df.iloc[:, [0, 2]])

print("\n--- df.loc[:, ['Names','City']] : the same, by NAME ---")
print(df.loc[:, ['Names', 'City']])

print("\n--- a single cell ---")
print("df['City'][2]  ->", df['City'][2])
print("df.iloc[1, 2]  ->", df.iloc[1, 2])
More slicing patterns, straight from the lecture:

Expression	Selects
df.iloc[5:10, 2:]	rows 5–9, from column 2 to the last
df.iloc[5:10]	rows 5–9, all columns
df.iloc[1, 2]	the single value at row 1, column 2
df.iloc[[0, 2], [2, 4]]	rows 0 and 2, at columns 2 and 4
Updating a DataFrame#
Changing the index and column names#
Renaming rows and columns — the index doesn't have to be 0, 1, 2
pandas
Reset
▶ Run
import pandas as pd

f = ['Names', 'Country', 'City']
d = [['Mohammed', 'Egypt', 'Banha'],
     ['Ann', 'UK', 'London'],
     ['John', 'Sweden', 'Stockholm']]
df = pd.DataFrame(columns=f, data=d)
print(df)

df.index = ["a", "b", "c"]          # give the rows labels
print("\n--- after changing the index ---")
print(df)
print("\nNow we can look up by label:", df["Country"]["a"])

df.columns = ["Customer_Name", "Country", "City"]
print("\n--- after renaming the first column ---")
print(df)
Adding columns#
Two ways to add a column — at the end, or at a position
pandas
Reset
▶ Run
import pandas as pd

df = pd.DataFrame({'Names': ['Mohammed', 'Ann', 'John'],
                   'Country': ['Egypt', 'UK', 'Sweden']})

# Method 1: assign to a new name - lands at the end
df["Gender"] = 1
print(df)

# Method 2: insert() puts it at a chosen position
df.insert(1, "Marital_Status", 2)
print("\n--- after insert at position 1 ---")
print(df)

# A new column can also be CALCULATED from existing ones
df2 = pd.DataFrame({'Weight': [55, 78, 100], 'Height': [1.73, 1.60, 1.65]})
df2['BMI'] = round(df2['Weight'] / df2['Height'] ** 2, 2)
print("\n--- a calculated column ---")
print(df2)
Look at that BMI line again

df2['Weight'] / df2['Height'] ** 2 divides every weight by every corresponding height squared, in one line, with no loop. That is the whole point of pandas. The equivalent Module 2 code was a for loop with an index variable and an append. Here it's one expression, and it stays one expression whether the table has 3 rows or 3 million.

Adding rows#
Two ways to add a row — concat, or loc
pandas
Reset
▶ Run
import pandas as pd

f = ['Names', 'Country', 'City']
d = [['Mohammed', 'Egypt', 'Banha'],
     ['Ann', 'UK', 'London'],
     ['John', 'Sweden', 'Stockholm']]
df = pd.DataFrame(columns=f, data=d)

# Method 1: build a small DataFrame and concatenate
new_row = ["Kate", "France", "Paris"]
df2 = pd.DataFrame(data=[new_row], columns=f)
df = pd.concat([df, df2], ignore_index=True)
print("--- after concat ---")
print(df)

# Method 2: assign to the next position with loc
df.loc[len(df)] = ["Omar", "Egypt", "Alexandria"]
print("\n--- after loc ---")
print(df)
Deleting columns and rows#
del, pop, and drop — and the inplace trap
pandas
Reset
▶ Run
import pandas as pd

df = pd.DataFrame({'Name': ['Mohammed', 'Ann', 'John'],
                   'Country': ['Egypt', 'UK', 'Sweden'],
                   'Gender': [1, 1, 1],
                   'Marital_Status': [2, 2, 2]})
print(df)

del df["Marital_Status"]            # method 1
print("\n--- after del ---")
print(df)

x = df.pop("Gender")                # method 2: removes AND returns it
print("\n--- after pop (which returned the column) ---")
print(df)

# Method 3: drop - but watch carefully
x = df.drop(columns="Country")
print("\n--- drop returns a NEW DataFrame ---")
print(x)
print("\n--- but the original is unchanged! ---")
print(df)
drop does not change your DataFrame

df.drop(...) hands you back a modified copy and leaves df exactly as it was. This is the number one pandas confusion. There are two fixes:


df = df.drop(columns="Country")          # reassign
df.drop(columns="Country", inplace=True) # or use inplace
And never write df = df.drop(columns="Country", inplace=True) — with inplace=True the method returns None, so you'd wipe out your entire DataFrame and replace it with nothing. It's the same sorted() versus .sort() distinction from Module 2, wearing a different hat.
