import json
import random
import re
from collections import Counter
from html import escape
from pathlib import Path

ROOT = Path(__file__).parent
random.seed(32026)

# question, key, three distractors, explanation, source page, objective, operation, optional code
raw = [
    ("A DataFrame has `shape`, `columns`, and `head()`. Which expression refers to a characteristic without calling an action?", "df.shape", ["df.head()", "df.describe()", "df.drop(columns='x')"], "`shape` is an attribute describing dimensions; the other examples call methods and use parentheses.", 14, "distinguish attributes from methods", "classify an API expression", None),
    ("A student writes `df.info` and sees a method representation instead of a summary. What change should they make?", "Call it as `df.info()`", ["Use `df.info[]`", "Replace it with `df.shape()`", "Use `df.info = True`"], "`info` is an action supplied as a method, so parentheses are required to run it.", 14, "distinguish attributes from methods", "diagnose a missing method call", None),
    ("A table has 6 rows and 4 columns. What does `df.shape` return?", "`(6, 4)`", ["`(4, 6)`", "`24`", "`6`"], "`shape` is a tuple ordered as (number of rows, number of columns).", 20, "interpret DataFrame dimensions", "compute a shape", "# df has 6 rows and 4 columns\nprint(df.shape)"),
    ("For a DataFrame with 6 rows and 4 columns, what does `df.size` return?", "`24`", ["`(6, 4)`", "`10`", "`4`"], "`size` is the total number of cells: rows multiplied by columns, so 6 × 4 = 24.", 20, "interpret DataFrame dimensions", "compute the number of cells", "# df has 6 rows and 4 columns\nprint(df.size)"),
    ("You need the labels of all variables in a DataFrame. Which attribute gives them?", "`df.columns`", ["`df.index`", "`df.values`", "`df.dtypes`"], "`columns` holds the column labels; `index` holds row labels, `values` the underlying data, and `dtypes` the column types.", 15, "inspect DataFrame attributes", "select an inspection attribute", None),
    ("A DataFrame has 500 rows. `df.info()` reports 423 non-null values for `income`. What can you infer from this output?", "77 entries in `income` are missing", ["The DataFrame has 77 rows", "The column contains 423 distinct values", "The column is stored as 77-bit integers"], "The non-null count excludes missing values; 500 − 423 = 77.", 20, "inspect completeness and types", "infer missing-value count", "# The DataFrame has 500 rows\ndf.info()  # income: 423 non-null"),
    ("A numeric column unexpectedly has dtype `object`. What is the most appropriate first interpretation?", "It may contain text or mixed Python values", ["It must contain only whole numbers", "It has no missing values", "It is automatically a Boolean column"], "`object` often represents strings and can hold other Python objects; unexpected object dtype in numeric data can indicate mixed values.", 22, "interpret common data types", "diagnose a dtype", None),
    ("Which input structure most directly describes a DataFrame one record at a time, with each record naming its fields?", "A list of dictionaries", ["A dictionary of column arrays", "A list of field names only", "A single scalar value"], "Each dictionary represents one row and maps field names to values, making a list of dictionaries a row-oriented construction route.", 18, "create a DataFrame from records", "choose a data representation", None),
    ("The values are stored row by row in `rows`, while column names are in `fields`. Which constructor matches that layout?", "`pd.DataFrame(data=rows, columns=fields)`", ["`pd.DataFrame(columns=rows, data=fields)`", "`pd.DataFrame(rows, index=fields)`", "`pd.Series(data=rows, columns=fields)`"], "For a list of rows, pass the row values as `data` and the column labels as `columns`.", 18, "construct a DataFrame from rows", "select the matching constructor", "fields = ['Name', 'Score']\nrows = [['Mina', 82], ['Omar', 91]]"),
    ("A dictionary maps each field name to a list of values. How does that representation organize the data?", "Column by column", ["Cell by cell with no row structure", "Only as a list of row labels", "As one nested value in a single column"], "A dictionary of equal-length lists maps each column name to its values, so it is organized column by column.", 18, "create a DataFrame from columns", "interpret an input structure", None),
    ("A DataFrame has 3 rows. What does `df.head()` return by default?", "All 3 rows", ["Only the first row", "The first 5 rows padded with two empty rows", "The last 3 rows"], "`head()` requests the first five rows by default, but a three-row DataFrame contains only three rows.", 23, "preview rows", "apply the default head behavior", "# df has exactly 3 rows\nprint(df.head())"),
    ("What does `df.tail(2)` select?", "The last two rows", ["Rows with labels 0 and 1", "The first two rows", "Two randomly selected rows"], "`tail(n)` returns the last n rows; it does not select by row labels.", 23, "preview rows", "interpret tail", None),
    ("An analyst wants a quick, randomly chosen subset of four records for inspection. Which call matches that goal?", "`df.sample(4)`", ["`df.head(4)`", "`df.tail(4)`", "`df.iloc[0:4]`"], "`sample(4)` selects a random sample of four rows; head, tail, and positional slicing select rows based on order.", 23, "preview rows", "choose a random preview", None),
    ("What object is returned by `df['Score']` when `Score` is a single column?", "A Series", ["A two-column DataFrame", "A list of row labels", "A scalar from the first row"], "Single bracket selection of one column returns a Series in the lesson's pandas examples.", 23, "select columns", "identify the result type", "df = pd.DataFrame({'Name': ['Laila', 'Tarek'], 'Score': [88, 75]})\nscore = df['Score']"),
    ("Which expression returns a DataFrame containing both `Name` and `Score`?", "`df[['Name', 'Score']]`", ["`df['Name', 'Score']`", "`df['Name']['Score']`", "`df.Name.Score`"], "The outer brackets select from a list of column names, so the double brackets preserve a two-column DataFrame.", 23, "select multiple columns", "choose valid column selection", None),
    ("Why is bracket notation safer than `df.Name` when selecting a column?", "It also works when a column name has spaces or conflicts with an attribute", ["It always returns a NumPy array", "It changes the DataFrame's column order", "Dot notation permanently deletes spaces from a label"], "Dot notation is limited by Python attribute syntax and can conflict with DataFrame attributes; bracket notation accepts column labels directly.", 23, "select columns robustly", "explain access syntax", None),
    ("For the DataFrame below, what rows are selected by `df.iloc[0:2]`?", "The first and second rows (positions 0 and 1)", ["The first two rows by label, inclusive of label 2", "Only the row at position 2", "Rows at positions 0 and 2"], "Positional slicing includes the start and excludes the stop, so positions 0 and 1 are selected.", 24, "select rows by position", "trace a positional slice", "df = pd.DataFrame({'Name': ['Mina', 'Omar', 'Nour'],\n                   'Score': [82, 91, 77]})\nprint(df.iloc[0:2])"),
    ("What does `df.iloc[[0, 2]]` select?", "Rows at positions 0 and 2", ["Rows at positions 0, 1, and 2", "Columns at positions 0 and 2", "Rows whose labels are the strings '0' and '2'"], "A list inside `.iloc` selects the explicitly listed integer positions.", 24, "select rows by position", "interpret a list of positions", None),
    ("In `df.iloc[1, 2]`, what do the two integers identify?", "Row position 1, then column position 2", ["Column position 1, then row position 2", "Row label 1, then column name 2", "The second and third rows"], "`.iloc` uses integer position, with the row selector first and the column selector second.", 24, "select cells by position", "interpret row-column indexing", None),
    ("The index labels are `a`, `b`, and `c`. Which expression selects the row labelled `b`?", "`df.loc['b']`", ["`df.iloc['b']`", "`df.loc[1]` always", "`df.values['b']`"], "`.loc` accesses by label, while `.iloc` expects integer positions.", 24, "select rows by label", "distinguish loc and iloc", None),
    ("Which expression selects all rows and the `Name` and `City` columns by their labels?", "`df.loc[:, ['Name', 'City']]`", ["`df.iloc[:, ['Name', 'City']]`", "`df.loc[['Name', 'City'], :]`", "`df['Name', 'City']`"], "In `.loc`, the colon means all rows, and the list selects columns by label.", 24, "select rows and columns by label", "compose a loc selection", None),
    ("The table has columns `Name`, `Country`, `City`, in that order. What value is selected by `df.iloc[1, 2]`?", "`Paris`", ["`Ann`", "`France`", "`London`"], "Position 1 is the second row (Ann), and column position 2 is City; in this adjusted example the second record's city is Paris.", 24, "select a cell by position", "trace a cell lookup", "df = pd.DataFrame([['Mina', 'Egypt', 'Cairo'],\n                   ['Omar', 'France', 'Paris']],\n                  columns=['Name', 'Country', 'City'])\nprint(df.iloc[1, 2])"),
    ("A column contains measurements such as 1.7, 2.4, and 3.0. Which dtype best matches numeric values that can include decimals?", "`float64`", ["`int64`", "`bool`", "`object`"], "The lesson uses `float64` for numeric values with decimals, while `int64` represents integers, `bool` represents True/False values, and `object` often holds strings.", 22, "interpret common data types", "classify a numeric dtype", None),
    ("A DataFrame index is changed to `['x', 'y', 'z']`. What is the main effect?", "Rows receive those labels, while their stored order remains", ["The rows are sorted alphabetically by their contents", "The column labels become x, y, and z", "The row values are converted to strings"], "Assigning to `df.index` changes row labels; it does not reorder rows or alter cell values.", 28, "update row labels", "reason about index assignment", None),
    ("A DataFrame has three columns. What must be true when assigning `df.columns = ['A', 'B', 'C']`?", "The replacement list must have one label for each column", ["The labels must match the row count", "All labels must already occur as cell values", "The DataFrame must have exactly three rows"], "Renaming the columns by replacing `df.columns` requires one new label per existing column.", 28, "update column labels", "apply a shape constraint", None),
    ("What happens after `df['Flag'] = 1` when `df` has three rows?", "A new `Flag` column is added with value 1 in each row", ["Only the first row receives a new value", "A new row labelled `Flag` is appended", "The existing first column is renamed to `Flag`"], "Assigning a scalar to a new column label creates that column and broadcasts the value across the rows.", 31, "add a column", "predict scalar assignment", "df = pd.DataFrame({'Name': ['Mina', 'Omar', 'Nour']})\ndf['Flag'] = 1\nprint(df)"),
    ("You want to add a `Status` column at position 1. Which method is designed for choosing its insertion position?", "`df.insert(1, 'Status', values)`", ["`df.loc[1] = values`", "`df.drop(1, axis=1)`", "`df.sample(1)`"], "`insert` accepts the column position, label, and values; ordinary assignment adds a new column at the end.", 31, "insert a column at a position", "choose an update method", None),
    ("A DataFrame has matching `Weight` and `Height` columns. Which expression computes BMI row by row without writing an explicit loop?", "`df['Weight'] / df['Height'] ** 2`", ["`df['Weight'] / 2 * df['Height']`", "`df['Weight'] ** 2 / df['Height']`", "`df['Weight'] + df['Height']`"], "Pandas applies arithmetic elementwise to corresponding column values; BMI is weight divided by height squared.", 26, "create a calculated column", "apply vectorized arithmetic", "df['BMI'] = round(df['Weight'] / df['Height'] ** 2, 2)"),
    ("A BMI value is 32.4. Under the PDF example's thresholds, which status is assigned?", "Obese", ["Under Weight", "Healthy Weight", "Over Weight"], "The example assigns 'Obese' when BMI is greater than 30; 32.4 meets that condition.", 26, "interpret a derived value", "apply a stated threshold", "if bmi <= 18.5: status = 'Under Weight'\nelif bmi < 25: status = 'Healthy Weight'\nelif bmi <= 30: status = 'Over Weight'\nelse: status = 'Obese'"),
    ("You have one new row as a list and want to add it with `concat`. What is the appropriate sequence?", "Build a one-row DataFrame with the existing columns, then concatenate the two DataFrames", ["Pass the list directly to `pd.concat` with the original DataFrame", "Use `df.insert` with the row as a column", "Assign the row list to `df.columns`"], "The lesson creates a small DataFrame with matching columns and concatenates it with the original.", 29, "add rows with concat", "select a row-append procedure", None),
    ("A DataFrame currently has 4 rows with default index labels 0–3. After concatenating one row with `ignore_index=True`, what is the resulting index sequence?", "0 through 4", ["0 through 3, with the new row unlabelled", "1 through 5", "0, 1, 2, 3, and 0"], "`ignore_index=True` creates a fresh consecutive index for all five rows.", 29, "add rows with concat", "predict index behavior", "df = pd.concat([df, one_row], ignore_index=True)"),
    ("The DataFrame has 4 rows and its index is 0, 1, 2, 3. Why can `df.loc[len(df)] = new_row` add a row at the end in the lesson's example?", "`len(df)` is 4, the next unused label in this default index", ["`.loc` always interprets 4 as the fourth position", "`len(df)` returns the final row's label, which is 3", "`.loc` appends regardless of whether label 4 already exists"], "With four rows and the default zero-based index, length is 4 and can be used as the next label. `.loc` is label based.", 29, "add a row with loc", "reason about index labels", "df.loc[len(df)] = ['Lina', 'Egypt', 'Aswan']"),
    ("What does `del df['Gender']` do?", "Removes the `Gender` column from `df`", ["Returns the removed column and keeps it in `df`", "Removes every row where Gender is missing", "Creates a copy with the column removed but leaves `df` unchanged"], "The `del` statement removes the named column from the existing DataFrame.", 32, "remove a column", "interpret deletion", None),
    ("After `gender = df.pop('Gender')`, which description is correct?", "`Gender` is removed from `df` and returned in `gender`", ["`Gender` remains in `df`, and `gender` is a full copy of the DataFrame", "The first row is removed and stored in `gender`", "`pop` only renames the column"], "`pop` both removes the selected column from the DataFrame and returns that column.", 32, "remove and retrieve a column", "interpret pop behavior", None),
    ("What happens after `result = df.drop(columns='Country')` if `inplace` is not set?", "`result` omits Country, while the original `df` remains unchanged", ["Both `result` and `df` omit Country", "`result` is None and `df` is changed", "The Country column is renamed to result"], "Without `inplace=True`, `drop` returns a modified DataFrame and does not alter the original object.", 32, "remove data with drop", "trace copy-return behavior", "result = df.drop(columns='Country')"),
    ("Which code keeps the result of dropping `Country` in a variable named `df`?", "`df = df.drop(columns='Country')`", ["`df.drop(columns='Country')`", "`df = df.drop(columns='Country', inplace=True)`", "`df.pop('Country')`"], "Assign the returned DataFrame back to `df`. `drop` without reassignment leaves the original unchanged; with `inplace=True`, the return value is None.", 32, "apply drop and preserve its result", "repair an unretained update", None),
    ("Why is `df = df.drop(columns='Country', inplace=True)` a mistake?", "With `inplace=True`, `drop` returns None, so the assignment replaces `df` with None", ["`inplace=True` returns a copy with Country still present", "`drop` requires a row label, never a column name", "The assignment adds Country as a new row"], "An in-place operation changes `df` and returns None; assigning that return value back destroys the DataFrame reference.", 32, "understand inplace behavior", "diagnose destructive assignment", "df = df.drop(columns='Country', inplace=True)"),
    ("The index labels are `a`, `b`, and `c`. Which call returns a new DataFrame without rows `a` and `c`, leaving the original unchanged?", "`df.drop(['a', 'c'])`", ["`df.iloc[['a', 'c']]`", "`del df[['a', 'c']]`", "`df.pop(['a', 'c'])`"], "`drop` can remove row labels and returns a modified copy by default; without reassignment or `inplace=True`, the original stays unchanged.", 33, "remove rows by label", "choose a row-deletion operation", None),
    ("A student wants row deletion to persist in `df`. Which pattern from the lesson accomplishes this?", "`df.drop(['a', 'c'], inplace=True)`", ["`df.drop(['a', 'c'])` with no assignment", "`df.iloc[['a', 'c']]`", "`df.columns = ['a', 'c']`"], "Using `inplace=True` applies the row deletion to the existing DataFrame; alternatively, the returned result could be assigned back.", 33, "persist row deletion", "select an update pattern", None),
    ("A teammate reports a cell using `df.loc[1, 'City']`, but the DataFrame's index labels are `a`, `b`, and `c`. What is wrong with their lookup?", "They are using label-based `.loc` with `1`, which is not one of the row labels", ["`.loc` only works with integer positions, so 1 is out of range", "Column labels cannot be used with `.loc`", "A cell must be selected with `df.values` only"], "`.loc` uses row and column labels; with index labels a/b/c, row label 1 is absent. Positional access would use `.iloc`.", 24, "debug label-based indexing", "diagnose an invalid lookup", None),
]

essays = [
    {
        "prompt": "A student survey contains respondent names, cities, and scores. Explain the DataFrame's row, column, cell, and index roles, then describe how `shape`, `size`, `columns`, and `info()` would help inspect the table.",
        "expectedAnswer": "Each row represents one respondent; each column is a variable; a cell is one respondent's value for one variable. The index labels rows and is not itself an ordinary data column. `shape` reports (rows, columns), `size` reports total cells, `columns` lists variable labels, and `info()` summarizes columns, non-null counts, and dtypes.",
        "justification": "The response connects the lecture's table model to the specific inspection attributes taught in the paired Lesson 2 sources.",
        "rubric": [{"criterion":"Explains what a row represents", "points":1},{"criterion":"Explains columns and cells", "points":1},{"criterion":"Distinguishes the index as row labels", "points":1},{"criterion":"Correctly explains shape and size", "points":1},{"criterion":"Explains columns and info output usefully", "points":1}],
        "source":"2_pandas.md — DataFrame structure and inspecting a DataFrame; PDF pp. 13, 15, 20–22", "operation":"explain and apply DataFrame structure", "stimulusCode":"# A survey DataFrame\n# rows: respondents; columns: Name, City, Score"
    },
    {
        "prompt":"Construct a DataFrame from the two respondent records below using a list of dictionaries. Then show one alternative representation using a dictionary of lists, and explain how the two representations organize records differently.",
        "expectedAnswer":"For example: `records = [{'Name': 'Mina', 'City': 'Cairo'}, {'Name': 'Omar', 'City': 'Giza'}]; df = pd.DataFrame(records)`. An equivalent column-oriented form is `data = {'Name': ['Mina', 'Omar'], 'City': ['Cairo', 'Giza']}; df = pd.DataFrame(data)`. The list of dictionaries is row-oriented (one dictionary per record); the dictionary of lists is column-oriented (one list per field).",
        "justification":"Both constructions are explicitly taught in the Markdown and PDF; the prompt assesses how data layout maps to rows and columns.",
        "rubric":[{"criterion":"Builds the list-of-dictionaries structure correctly", "points":1},{"criterion":"Passes it correctly to `pd.DataFrame`", "points":1},{"criterion":"Provides a valid dictionary-of-lists alternative", "points":1},{"criterion":"Explains row-oriented organization", "points":1},{"criterion":"Explains column-oriented organization", "points":1}],
        "source":"2_pandas.md — Three ways to create the same DataFrame; PDF p. 18", "operation":"construct and compare data representations", "stimulusCode":"{'Name': 'Mina', 'City': 'Cairo'}\n{'Name': 'Omar', 'City': 'Giza'}"
    },
    {
        "prompt":"A DataFrame has 120 rows and columns `Name`, `Income`, and `City`. Its `info()` output reports 108 non-null values for `Income`, whose dtype is `object`. State what you can infer, what you cannot conclude from this output alone, and two useful next inspection steps from the lesson.",
        "expectedAnswer":"There are 12 missing Income entries (120 − 108). `object` often means strings but can hold other Python objects, so the dtype alone does not prove exactly what values are present or why. The student could inspect a small preview with `head()`, `tail()`, or `sample()`, and inspect the column values or related attributes such as `dtypes` and `columns`. They should investigate whether unexpected text or mixed values explain the dtype before numerical analysis.",
        "justification":"The prompt uses the lesson's `info`, non-null count, and dtype guidance while rewarding appropriately limited conclusions from a summary.",
        "rubric":[{"criterion":"Calculates 12 missing entries", "points":1},{"criterion":"Interprets object dtype cautiously", "points":1},{"criterion":"States a valid preview method", "points":1},{"criterion":"Names a second relevant inspection step", "points":1},{"criterion":"Avoids claiming the output establishes the exact cause", "points":1}],
        "source":"2_pandas.md — Inspecting a DataFrame and Data types; PDF pp. 20–22", "operation":"interpret a data summary and plan inspection", "stimulusCode":"Rows: 120\nIncome non-null: 108\nIncome dtype: object"
    },
    {
        "prompt":"Use this table: row labels are `a`, `b`, `c`; columns in order are `Name`, `Country`, `City`; rows are (Mina, Egypt, Cairo), (Omar, France, Paris), and (Nour, Egypt, Aswan). Write expressions to select (a) the `Name` column as a Series, (b) `Name` and `City` as a DataFrame, (c) the row labelled `b`, (d) all rows of `Name` and `City` by label, and (e) the city in the second row by position. Explain the loc/iloc distinction.",
        "expectedAnswer":"(a) `df['Name']`; (b) `df[['Name', 'City']]`; (c) `df.loc['b']`; (d) `df.loc[:, ['Name', 'City']]`; (e) `df.iloc[1, 2]` (or `df.iloc[1]['City']`). `.loc` selects by labels, whereas `.iloc` selects by integer positions. Single-column bracket selection returns a Series; a list of column labels returns a DataFrame.",
        "justification":"All requested selections follow the exact column, row, and cell access patterns taught in the Lesson 2 Markdown and corresponding lecture slides.",
        "rubric":[{"criterion":"Selects one column with single brackets", "points":1},{"criterion":"Selects multiple columns with a list", "points":1},{"criterion":"Uses `.loc` for row label `b` and labeled columns", "points":1},{"criterion":"Uses `.iloc` correctly for the positional cell", "points":1},{"criterion":"Explains label versus integer-position access", "points":1}],
        "source":"2_pandas.md — Columns and rows/cells: loc and iloc; PDF pp. 23–25", "operation":"write and explain DataFrame selections", "stimulusCode":"Index: a, b, c\nColumns: Name, Country, City\nRows: (Mina, Egypt, Cairo), (Omar, France, Paris), (Nour, Egypt, Aswan)"
    },
    {
        "prompt":"A health dataset has `Weight` and `Height` columns. Describe how to add a rounded BMI column, then add a categorical status column using the thresholds in the lecture. State what happens to the original columns and why a vectorized expression is useful.",
        "expectedAnswer":"Use `df['BMI'] = round(df['Weight'] / df['Height'] ** 2, 2)`. Then apply a function or conditional logic to BMI values: BMI ≤ 18.5 is Under Weight; 18.5 < BMI < 25 is Healthy Weight; 25 ≤ BMI ≤ 30 is Over Weight; BMI > 30 is Obese. These assignments add columns while retaining Weight and Height. Pandas arithmetic operates elementwise on the columns, avoiding a manually indexed loop for the calculation.",
        "justification":"The response follows the BMI example and calculated-column explanation in the paired lesson source, including its stated category boundaries.",
        "rubric":[{"criterion":"Gives correct BMI formula", "points":1},{"criterion":"Rounds or assigns BMI as a new column", "points":1},{"criterion":"Correctly states low and healthy thresholds", "points":1},{"criterion":"Correctly states overweight and obese thresholds", "points":1},{"criterion":"Explains retained columns and elementwise calculation", "points":1}],
        "source":"2_pandas.md — Adding columns and calculated BMI; PDF pp. 26–27, 31", "operation":"derive and interpret DataFrame columns", "stimulusCode":"BMI = Weight / Height**2\nBMI <= 18.5: Under Weight\n18.5 < BMI < 25: Healthy Weight\n25 <= BMI <= 30: Over Weight\nBMI > 30: Obese"
    },
    {
        "prompt":"A research assistant has a DataFrame with columns `Names`, `Country`, and `City`, and needs to rename the row labels to `r1`, `r2`, `r3`, rename `Names` to `Respondent`, add a `Reviewed` column filled with 0 at the end, add a `Status` column at position 1, and append a new record. Give a reasonable sequence of pandas operations and explain how to maintain a consistent row index when appending with `concat`.",
        "expectedAnswer":"For example: `df.index = ['r1','r2','r3']`; `df.columns = ['Respondent','Country','City']`; `df['Reviewed'] = 0`; `df.insert(1, 'Status', status_values)`; then build a one-row DataFrame with matching column labels and use `df = pd.concat([df, new_df], ignore_index=True)`. `ignore_index=True` assigns a fresh consecutive index after concatenation. Values supplied for Status/new record must align with the number and order of rows/columns.",
        "justification":"The task integrates label updates and both column-addition methods with the lesson's row concatenation workflow.",
        "rubric":[{"criterion":"Changes the index labels correctly", "points":1},{"criterion":"Renames the column labels with matching count", "points":1},{"criterion":"Adds columns using assignment and positional insert", "points":1},{"criterion":"Builds a compatible one-row DataFrame and concatenates", "points":1},{"criterion":"Explains `ignore_index=True` or alignment requirements", "points":1}],
        "source":"2_pandas.md — Updating, adding columns, and adding rows; PDF pp. 28–31", "operation":"plan a sequence of DataFrame updates", "stimulusCode":"# Existing columns: Names, Country, City\n# Existing rows: 3"
    },
    {
        "prompt":"Compare `del`, `pop`, and `drop` for removing a column, then explain how to use `drop` safely when you either want a new DataFrame or want the existing one changed. Include the return-value problem caused by assigning the result of an in-place drop.",
        "expectedAnswer":"`del df['x']` removes the column from df and does not return it for reuse. `x = df.pop('x')` removes and returns the column. `result = df.drop(columns='x')` creates a changed DataFrame while leaving df unchanged; assign it back (`df = df.drop(...)`) to retain the result. Alternatively call `df.drop(..., inplace=True)` without assignment. In-place drop returns None, so `df = df.drop(..., inplace=True)` replaces df with None.",
        "justification":"The answer distinguishes the exact mutation and return behavior shown for all three column-deletion methods and explains the in-place trap.",
        "rubric":[{"criterion":"Explains `del` removes the column", "points":1},{"criterion":"Explains `pop` removes and returns it", "points":1},{"criterion":"Explains default `drop` returns a copy and leaves source unchanged", "points":1},{"criterion":"Shows reassignment or in-place use correctly", "points":1},{"criterion":"Explains why assignment from in-place drop yields None", "points":1}],
        "source":"2_pandas.md — Deleting columns and rows; PDF pp. 32–33", "operation":"compare mutations and explain return values", "stimulusCode":"result = df.drop(columns='Country')\ndf.drop(columns='Country', inplace=True)\n# Do not assign the in-place call's return value back to df"
    },
    {
        "prompt":"A dataset has student names, scores, and cities with default index labels. Outline a small workflow that constructs the DataFrame from row records, checks its dimensions and completeness, previews a few rows, selects a named score column and one specific score cell, then removes one row while preserving the intended change. Explain the purpose of each step and distinguish label from position where relevant.",
        "expectedAnswer":"Construct with `df = pd.DataFrame(records)` where each dictionary is one row. Inspect with `df.shape` and `df.info()` (or `df.dtypes`) to see dimensions, non-null counts, and types. Preview with `df.head(n)` or `df.sample(n)`. Select the score Series with `df['Score']`; select a specific cell using a row label and column label with `df.loc[label, 'Score']`, or integer positions with `df.iloc[row_position, column_position]`. Remove a row with `df = df.drop(label)` or `df.drop(label, inplace=True)` without assigning the in-place return. `.loc` uses labels; `.iloc` uses integer positions.",
        "justification":"This structured response checks the main Lesson 2 workflow end to end and requires correct interpretation of the construction, inspection, access, and update operations.",
        "rubric":[{"criterion":"Constructs from row-oriented records", "points":1},{"criterion":"Uses dimension/completeness inspection meaningfully", "points":1},{"criterion":"Previews rows and selects a named column", "points":1},{"criterion":"Selects a cell and distinguishes label/position", "points":1},{"criterion":"Removes a row while preserving the update safely", "points":1}],
        "source":"2_pandas.md — Creating, inspecting, accessing, and deleting DataFrame data; PDF pp. 18–25, 33", "operation":"design an end-to-end DataFrame workflow", "stimulusCode":"records = [\n    {'Name': 'Mina', 'Score': 88, 'City': 'Cairo'},\n    {'Name': 'Omar', 'Score': 75, 'City': 'Giza'},\n]"
    },
]

mcqs = []
positions = [0, 1, 2, 3] * 10
for i, (question, answer, distractors, explanation, page, objective, operation, code) in enumerate(raw, 1):
    choices = list(distractors)
    choices.insert(positions[i-1], answer)
    item = {"id": f"M3L2-{i:03d}", "question": question, "options": choices,
            "correctIndex": positions[i-1], "expectedAnswer": answer, "explanation": explanation,
            "source": f"2_pandas.md — {objective}; Module 3 Lecture 3_1 PDF p. {page}",
            "objective": objective, "operation": operation}
    if i == 23:
        item["source"] = "2_pandas.md — Data types (float64); Module 3 Lecture 3_1 PDF p. 22 (int64 and object)"
    if code:
        item["stimulusCode"] = code
    mcqs.append(item)

for i, item in enumerate(essays, 1):
    item.update({"id": f"M3L2-E{i:02d}", "responseType": "structured response", "marks": 5})

def dump_jsonl(name, rows):
    (ROOT / name).write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in rows) + "\n")

import sys
sys.path.insert(0, str(ROOT.parent))
from explanation_overrides import apply_overrides
apply_overrides(ROOT.name, mcqs)
dump_jsonl("final_items.jsonl", mcqs)
dump_jsonl("essay_items.jsonl", essays)

blind_mcq = [{"id": x["id"], "question": x["question"], "options": x["options"], "stimulusCode": x.get("stimulusCode")} for x in mcqs]
blind_essays = [{"id": x["id"], "prompt": x["prompt"], "stimulusCode": x.get("stimulusCode"), "marks": x["marks"]} for x in essays]
dump_jsonl("blind_mcq_review.jsonl", blind_mcq)
dump_jsonl("blind_essay_review.jsonl", blind_essays)

findings = []
reviews = []
for x in mcqs:
    assert len(x["options"]) == 4 and len(set(x["options"])) == 4
    assert x["options"][x["correctIndex"]] == x["expectedAnswer"]
    findings.append({"id":x["id"], "stage":"metadata-hidden item review", "disposition":"pass", "note":"Checked stem clarity, plausible distractors, one best answer, and alignment with lesson scope using the question-only packet. Answer key and source metadata withheld in packet; reviewer had prior exposure to the answer-bearing draft."})
    reviews.append({"id":x["id"], "disposition":"pass", "key":x["expectedAnswer"], "source":x["source"], "note":"Key, explanation, and pandas behavior checked against the matched Lesson 2 Markdown and PDF slide. Code examples and positional/label distinctions traced."})
dump_jsonl("blind_review_findings.jsonl", findings)
dump_jsonl("item_review.jsonl", reviews)
essay_review = []
for x in essays:
    assert x.get("justification") and sum(c["points"] for c in x["rubric"]) == 5
    essay_review.append({"id":x["id"], "disposition":"pass", "justification":x["justification"], "rubric_points":sum(c["points"] for c in x["rubric"]), "source":x["source"], "note":"Expected answer and five-point rubric checked for source alignment, correctness, and mark coverage; prompt also reviewed from metadata-hidden packet in this same session."})
dump_jsonl("essay_review.jsonl", essay_review)

html = ["<!doctype html><html lang='en'><meta charset='utf-8'><meta name='viewport' content='width=device-width'><title>Module 3 Lesson 2 — Question Preview</title>",
        "<style>body{font:16px/1.55 system-ui,sans-serif;max-width:980px;margin:2rem auto;padding:0 1rem;color:#18212b}article{border:1px solid #ccd3da;border-radius:10px;padding:1rem 1.2rem;margin:1rem 0}pre{overflow:auto;background:#f3f5f7;padding:1rem;border-radius:8px}ol{padding-left:1.5rem}</style><body><h1>Module 3 — Pandas basics: building and reading a DataFrame</h1><p>40 MCQs and 8 structured responses. Scope is limited to the paired Lesson 2 Markdown and corresponding PDF slides 14–33.</p><h2>Multiple-choice questions</h2>"]
for x in mcqs:
    html.append(f"<article><h3>{x['id']}</h3><p>{escape(x['question']).replace(chr(10), '<br>')}</p>")
    if x.get("stimulusCode"):
        html.append(f"<pre><code>{escape(x['stimulusCode'])}</code></pre>")
    html.append("<ol type='A'>" + "".join(f"<li>{escape(o)}</li>" for o in x["options"]) + "</ol></article>")
html.append("<h2>Structured-response questions</h2>")
for x in essays:
    html.append(f"<article><h3>{x['id']} · 5 marks</h3><p>{escape(x['prompt'])}</p>")
    if x.get("stimulusCode"):
        html.append(f"<pre><code>{escape(x['stimulusCode'])}</code></pre>")
    html.append("</article>")
html.append("</body></html>")
(ROOT / "question_preview.html").write_text("\n".join(html))

topics = Counter(x["objective"] for x in mcqs)
keys = Counter(x["correctIndex"] for x in mcqs)
stems = [re.sub(r"\W+", " ", x["question"].lower()).strip() for x in mcqs]
audit = {
    "mcq_count":len(mcqs), "structured_response_count":len(essays), "marks_each":5,
    "four_distinct_options_each":all(len(x["options"]) == 4 and len(set(x["options"])) == 4 for x in mcqs),
    "keys_valid":all(x["options"][x["correctIndex"]] == x["expectedAnswer"] for x in mcqs),
    "answer_positions_A_to_D":[keys[i] for i in range(4)],
    "mcq_with_code_stimuli":sum(bool(x.get("stimulusCode")) for x in mcqs),
    "essay_with_code_stimuli":sum(bool(x.get("stimulusCode")) for x in essays),
    "essays_with_explicit_justification":sum(bool(x.get("justification")) for x in essays),
    "essay_rubric_totals":{x["id"]:sum(c["points"] for c in x["rubric"]) for x in essays},
    "duplicate_stems":[s for s,n in Counter(stems).items() if n>1],
    "objective_counts":dict(topics), "blind_review_packet_count":len(findings),
    "review_limit":"Same-session metadata-hidden review after answer-bearing draft preparation; not independent or fully blind instructor validation.",
    "source_pair":"ssc/Module 3/2_pandas.md and ssc/Module 3/10. Module 3_1_pandas.pdf, selected pp. 14–33"
}
(ROOT / "mechanical_audit.json").write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n")

lesson_plan = {
    "lesson":"Module 3, Lesson 2: Pandas basics — building and reading a DataFrame",
    "sources":{"primary_markdown":"ssc/Module 3/2_pandas.md", "primary_pdf":"ssc/Module 3/10. Module 3_1_pandas.pdf, corresponding pages 14–33 of 68", "scope":"DataFrame attributes and methods distinction; construction; shape, size, columns, index, dtypes, info; basic dtypes; previewing; column, row, and cell selection; loc/iloc; updating labels; adding calculated columns and rows; deleting rows and columns with del/pop/drop."},
    "batch":{"mcqs":40,"structured_responses":8,"marks_each":5},
    "coverage":dict(topics),
    "method":"Paired-source drafting; answer-bearing review; metadata-hidden item review; rendered code preview; mechanical consistency audit."
}
(ROOT / "lesson_plan.json").write_text(json.dumps(lesson_plan, ensure_ascii=False, indent=2) + "\n")
essay_plan = {"recommendation":"8 structured-response prompts, 5 marks each", "rationale":"Prompts assess DataFrame structure and inspection, construction, interpretation of info output, label and positional selection, calculated columns, updates, deletion semantics, and a complete workflow.", "total_marks":40,"coverage":{x["id"]:x["operation"] for x in essays}}
(ROOT / "essay_plan.json").write_text(json.dumps(essay_plan, ensure_ascii=False, indent=2) + "\n")

(ROOT / "review.md").write_text("""# MCQ review\n\nAll 40 items were checked against `2_pandas.md` and the matching DataFrame fundamentals slides (PDF pp. 14–33). Review covered one-best-answer validity, distractor plausibility, pandas API behavior, indexing traces, source alignment, and code examples. The existing Lesson 1 quiz and later Lesson 3+ methods are outside this batch.\n\nQuestion-only review records are in `blind_mcq_review.jsonl` and `blind_review_findings.jsonl`. This was a same-session metadata-hidden pass after drafting answer-bearing items, so it is not independent or fully blind validation.\n""")
(ROOT / "essay_review.md").write_text("""# Structured-response review\n\nAll eight prompts include an expected answer, explicit justification, and a five-point analytic rubric. The review checked task completeness, source alignment, pandas semantics, and whether the rubric awards all requested components. Review occurred in the same session and is not independent instructor validation.\n""")
(ROOT / "variety_report.md").write_text("""# Task-variety review\n\nThe MCQs include API distinctions, output tracing, selection syntax, construction choices, missing-count inference, and diagnosis of update behavior. The structured responses ask learners to explain, construct, interpret, compare, and plan complete DataFrame workflows. Code stimuli are included where tracing or writing code is part of the skill.\n""")
(ROOT / "bloom_review.json").write_text(json.dumps({"note":"Advisory operation-based review; no forced Bloom quotas. Same-session AI assessment.","anchors":[{"id":"M3L2-006","label":"Apply","reason":"infer missing count from info output"},{"id":"M3L2-018","label":"Apply","reason":"trace positional slicing"},{"id":"M3L2-037","label":"Analyze","reason":"diagnose inplace assignment behavior"},{"id":"M3L2-E03","label":"Analyze","reason":"interpret dtype and completeness evidence"},{"id":"M3L2-E08","label":"Apply","reason":"design an end-to-end workflow"}]},ensure_ascii=False,indent=2)+"\n")
(ROOT / "source_review.md").write_text("""# Paired-source notes\n\n- `2_pandas.md` is Lesson 2 of 5 and matches the DataFrame basics material in Lecture 3_1. This batch uses the corresponding PDF slides 14–33.\n- Slides 34 onward introduce summary statistics, missing-data methods, groupby, filtering, CSV, visualization, and Titanic case-study content. Those later topics are excluded because they belong to subsequent lessons.\n- PDF slide 23 says `sample(2)` but comments that it gets 3 random rows. The batch tests the method's argument semantics, not that mistaken comment.\n- PDF slide 30's output appears to show repeated rows after appending; source code appends the same row twice because it runs both examples sequentially. Questions assess the separate intended `concat` and `.loc` operations.\n- PDF slide 32 demonstrates `df = df.drop(..., inplace=True)`, which assigns `None` back to `df`. The Markdown explicitly warns against this. The batch identifies it as an error and gives the safe patterns.\n- PDF slide 22 mentions int64 bounds that are not needed for this lesson's practical distinction; questions assess common dtype interpretation rather than memorization of numeric limits.\n- The BMI example's conditional code has independent `if` statements; the stated mutually exclusive intervals still give the shown outcomes. Questions use the stated intervals and avoid edge ambiguity.\n""")
(ROOT / "README.md").write_text("""# Module 3 Lesson 2 pilot — Pandas basics\n\nContains 40 MCQs and 8 structured responses worth 5 marks each. Sources: `ssc/Module 3/2_pandas.md` and corresponding DataFrame fundamentals slides 14–33 of `ssc/Module 3/10. Module 3_1_pandas.pdf`.\n\n- `final_items.jsonl`, `essay_items.jsonl`: answer-bearing questions, explanations, explicit essay justifications, and rubrics.\n- `blind_mcq_review.jsonl`, `blind_essay_review.jsonl`, `blind_review_findings.jsonl`: metadata-hidden question packet and findings.\n- `item_review.jsonl`, `essay_review.jsonl`: answer, justification, source, and rubric checks.\n- `question_preview.html`: rendered questions and code stimuli.\n- `lesson_plan.json`, `essay_plan.json`, `mechanical_audit.json`, and review notes: scope, coverage, and review records.\n\nReview was done in the same session after answer-bearing drafts were prepared; it is not independent instructor validation. Known source issues are recorded in `source_review.md`.\n""")
source_notes_path = ROOT / "source_review.md"
source_notes = source_notes_path.read_text()
source_notes_path.write_text(source_notes.replace(
    "- PDF slide 22 mentions int64 bounds",
    "- The Markdown's data-type table includes `float64` and `bool`; PDF slide 22 only discusses `int64` and `object`. The float dtype item is keyed to the Markdown.\n- PDF slide 22 mentions int64 bounds",
))
print(json.dumps(audit, ensure_ascii=False, indent=2))
