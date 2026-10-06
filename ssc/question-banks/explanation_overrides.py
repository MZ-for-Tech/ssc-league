"""Item-specific explanations that state the reasoning, not where it was taught."""

OVERRIDES = {
    "module1-1-v1-20261006": {
        "ALGO-001": "Alphabetizing the names is algorithmic because a fixed sequence of comparisons and rearrangements produces the ordered list every time.",
        "ALGO-002": "Choosing whether to expand a company depends on judgment about uncertain outcomes and experience; there is no fixed sequence of steps guaranteed to produce the decision.",
        "ALGO-003": "An algorithm is a precise, ordered set of steps that accepts input, processes it, and produces an output.",
        "ALGO-004": "The ATM must read the card before it can verify a PIN against that card, so reversing those steps removes a prerequisite and can prevent the transaction from proceeding.",
        "ALGO-005": "A computer executes the instructions it receives rather than inferring the programmer's intent, so an unintended result calls for checking the procedure itself.",
        "ALGO-007": "Analysis clarifies the problem and requirements; developing the algorithm then turns that understanding into ordered solution steps, which can be represented as a flowchart.",
        "ALGO-016": "A calculation that is never displayed, stored, or returned gives the user no result, so it fails the requirement that an algorithm produce output.",
        "ALGO-017": "The choice depends on the priorities of the task: reliability and accuracy affect correctness, clarity and modifiability affect maintenance, and runtime affects speed. The faster procedure is not automatically better if it is hard to understand or unreliable.",
        "ALGO-021": "`input()` returns a string. Converting it with `float()` makes numeric operations possible; without conversion, adding inputs such as `12` and `8` can concatenate them into `128` instead of calculating `20`.",
        "ALGO-022": "For two sides b and c with included angle A, the area is `½bc sin(A)`; the sine factor accounts for the angle, so the formula reduces to base-times-height divided by two.",
        "ALGO-023": "The algorithm must choose one of two paths according to whether it is raining, so it needs selection: a condition directs execution to the umbrella or no-umbrella action.",
        "ALGO-028": "A `for` loop fits because the number of repetitions is known in advance: the body can run once for each of the 40 students.",
        "ALGO-029": "A `while` loop fits because the number of items is unknown beforehand; the cashier can keep repeating the add-price step while the customer has more items.",
        "ALGO-034": "When N is 0, the test `2 <= N` is false immediately, so the multiplication loop performs no iterations and PROD stays 1, the defined value of 0!.",
        "ALGO-039": "The loop performs one addition for each integer up to n, so its work grows with n. The formula uses a fixed number of arithmetic operations, making its work roughly constant as n increases.",
        "ALGO-040": "The expression substitutes 20 directly instead of using the supplied n. It therefore returns the sum for 20 even when the requested input is 35, so it does not generalize to other valid inputs.",
    },
    "module1-2-v1-20261006": {
        "FLOW-004": "An arrowhead shows which way the process moves along a connector; without it, a reader may not know which step follows which.",
        "FLOW-005": "Top-to-bottom is the usual convention because placing each next step below the current one makes the path easy to follow; arrows show any change in direction.",
        "FLOW-031": "Pseudocode communicates the logic in readable, English-like steps without requiring the exact punctuation and syntax of a programming language.",
        "FLOW-032": "A Python statement is a program because it uses Python's exact syntax and semantics; pseudocode would describe the same decision without requiring that language-specific form.",
        "FLOW-040": "A flowchart lays out the rule and its branches visually, so a manager can follow the decision path without reading or writing Python syntax.",
    },
    "module1-3-v1-20261006": {
        "INTRO-001": "The CPU fetches and processes program instructions, then determines which instruction executes next; that is why it controls the program's step-by-step execution.",
        "INTRO-010": "The reasoning used to break a problem into steps transfers between languages. Syntax and vocabulary change, but the underlying problem-solving approach can be reused.",
        "INTRO-018": "C and Pascal are procedural because programs in those languages are commonly organized as ordered procedures and instructions.",
        "INTRO-019": "Object-oriented programs organize behavior and data into objects built from classes; this grouping supports modular code and reuse.",
        "INTRO-020": "Prolog is logic-based because programs state facts and logical rules, then answer queries by determining what conclusions follow.",
        "INTRO-023": "These labels describe different properties: Python is high-level relative to machine code, supports object-oriented programming, is general-purpose, and is commonly executed by an interpreter.",
        "INTRO-024": "A compiler translates the source program before it runs, so the whole translation step happens before execution rather than one statement at a time during execution.",
        "INTRO-025": "Compilation produces translated code that can be run later without translating the source line by line each time; on Windows this is often packaged as an executable or library file.",
        "INTRO-027": "An interpreter can run code incrementally and show results or errors quickly, which makes it easier to test small changes and locate bugs; this convenience can come with slower execution.",
        "INTRO-029": "Java source is compiled into bytecode, then a Java virtual machine executes that bytecode. The compile-and-run stages make it a hybrid approach.",
        "INTRO-031": "`def` is reserved syntax for defining a function, so Python cannot also parse it as an ordinary variable name.",
        "INTRO-033": "The `+` operator can join compatible strings or add compatible numbers, but it cannot combine a string and integer directly; Python raises `TypeError` until the values are converted to a common type.",
        "INTRO-035": "Starting with positive x, adding 1 makes x larger on every pass. It therefore remains greater than zero forever, so the loop condition never becomes false.",
        "INTRO-036": "A value cannot be greater than 10 and less than 5 at the same time. Since the two requirements have no overlap, the conjunction is always false.",
        "INTRO-038": "The code is syntactically valid and runs, but addition does not compute a rectangle's area. The formula must multiply length by width, so the defect is in the program's meaning.",
    },
    "module2-1-v1-20261006": {
        "M2L1-004": "A literal with a decimal point is represented as a floating-point value, so Python assigns `rate` the `float` type.",
        "M2L1-007": "An IDE combines tools for writing and inspecting code, such as completion, syntax highlighting, debugging, and variable inspection; these features support the development workflow rather than define a programming language.",
        "M2L1-010": "`/` performs true division in Python, so 15 divided by 4 is 3.75 and the result is a float even though both operands are integers.",
        "M2L1-023": "Python evaluates arithmetic first, comparisons next, and logical operators after those comparisons; the comparison results become Boolean inputs to the logical expression.",
        "M2L1-029": "The colon ends the `if` header, and indentation marks the statements controlled by it. Omitting either breaks the conditional's syntax or block structure.",
        "M2L1-037": "A nested conditional is an `if` placed inside another branch. Each extra level adds another path a reader must track, so deep nesting can be harder to follow.",
        "M2L1-040": "`or` is correct because the alarm should activate when either the pulse condition or the blood-pressure condition is true; requiring both would miss one of the stated risks.",
    },
    "module2-2-v1-20261006": {
        "M2L2-001": "Unless control flow redirects execution, Python runs statements in their written order, from the first statement toward the last.",
        "M2L2-003": "Selection chooses which branch runs, while repetition runs a block again. These are the two control-flow constructs that change straight-line execution.",
    },
    "module2-3-v1-20261006": {
        "M2L3-001": "A `for` loop is suited to a known count or iterable because it advances through each planned repetition or item without needing a separate stopping condition.",
        "M2L3-003": "A `while` loop needs a starting state, a test that decides whether to continue, a body, and an update that can eventually make the test false; leaving out the update can make it run forever.",
        "M2L3-013": "`range(1, 101)` generates 1 through 100 because the stop value 101 is excluded; `sum()` then adds those values.",
        "M2L3-039": "The loop's update rule can stay the same while its starting value, rate, and number of periods change. Reusing that pattern models different quantities without rewriting the logic.",
    },
    "module2-4-v1-20261006": {
        "M2L4-025": "Descriptive names reveal a function's purpose, and small focused functions are easier to test and reuse. Comments should clarify non-obvious reasoning rather than replace clear code.",
        "M2L4-026": "A module is a `.py` file, so saving related definitions in one file lets another program import and reuse them.",
        "M2L4-031": "A package groups related modules in a directory, giving a larger codebase a way to organize and import related files together.",
        "M2L4-013": "When arguments are omitted, Python substitutes the function's defaults; here those defaults are `Arwa` and `Mohammed`, which it combines into the returned name.",
    },
    "module2-6-v1-20261006": {
        "M2L6-012": "Dictionary keys must be hashable and stable. A list can be changed after creation, so Python cannot safely use it as a key; strings, integers, and tuples of immutable values can be used.",
        "M2L6-014": "Each two-element pair supplies one key and its value. Passing an iterable of such pairs gives `dict()` enough information to build multiple entries.",
        "M2L6-017": "Iterating over a dictionary directly yields its keys. To receive both parts of each entry, the loop must use `person.items()` and unpack each pair.",
        "M2L6-035": "Lowercasing once makes the character set and the string being counted use the same case. Then `set(text)` supplies each normalized character and `text.count(char)` counts all case variants together.",
    },
    "module3-1-v1-20261006": {
        "M3L1-006": "Training a model to discover patterns and predict future demand is advanced analytics because it extracts predictive structure from data rather than merely cleaning or displaying it.",
        "M3L1-010": "The repeated combination of high bills and low usage preceding cancellations is a relationship among variables that can help predict churn; it is a pattern, not a guarantee for every customer.",
        "M3L1-011": "A trained model captures relationships from its training examples and applies them to new cases with similar features; that transfer to unseen cases is generalization.",
        "M3L1-012": "A learned pattern is inferred from examples, whereas a sorting rule is written explicitly before the program runs. One is data-derived; the other is prescribed.",
        "M3L1-014": "The system uses specialist-written rules, so it can be an AI expert system without learning patterns from data; machine learning is only one part of AI.",
        "M3L1-018": "The question asks whether two variables are associated and how uncertain that conclusion is, which calls for statistical inference and explanation rather than only prediction.",
        "M3L1-019": "Predicting who may cancel and using the prediction to offer support emphasizes forecasting and action on a practical problem, a data-science goal.",
        "M3L1-020": "The team chooses a regression model first and evaluates how well observed data fit it, so the analysis begins from a specified model and is model-driven.",
        "M3L1-021": "The team starts with data and searches for useful relationships without specifying one model first, so the approach is data-driven pattern discovery.",
        "M3L1-022": "Statistics and data science share data, computation, and methods; they often emphasize different goals, but those tendencies do not create mutually exclusive boundaries.",
        "M3L1-025": "Matplotlib provides the basic plotting machinery and fine control over chart elements; higher-level plotting libraries build on or wrap it.",
        "M3L1-028": "Pandas provides labeled tabular structures and operations for selecting, transforming, and summarizing rows and columns, which makes it useful for tabular analysis.",
        "M3L1-029": "The name pandas is derived from “panel data,” a term for observations collected across entities and time periods.",
        "M3L1-030": "The date, creator, and original financial-analysis use identify pandas's origin: Wes McKinney began it at AQR in 2008 to work with financial data.",
        "M3L1-031": "`pd` is a community convention that makes examples concise; Python imports the module under whatever alias the programmer chooses.",
        "M3L1-032": "Pandas has readers and writers for common tabular sources and formats, including CSV, text, Excel, and SQL-backed data.",
        "M3L1-033": "A DataFrame has two axes: rows hold records and columns hold variables, so a cell is the value at one row–column intersection.",
        "M3L1-037": "A DataFrame resembles a spreadsheet because both display data in labeled rows and columns; pandas adds operations that can be scripted and repeated.",
        "M3L1-039": "Different algorithms make different assumptions and capture different patterns, so the useful choice depends on the task and data rather than a single universally best method.",
        "M3L1-040": "A plain dictionary can hold named columns, but a DataFrame adds aligned row labels and table operations such as filtering, aggregation, merging, and missing-value handling.",
    },
    "module3-2-v1-20261006": {
        "M3L2-014": "Selecting one column with a single pair of brackets returns a one-dimensional Series; selecting a list of column labels with double brackets preserves a DataFrame.",
        "M3L2-023": "`float64` stores numeric values with fractional parts; `int64` is for integers, `bool` for true/false values, and `object` commonly holds strings or mixed Python objects.",
        "M3L2-030": "`concat` combines DataFrames, not a raw row list with a DataFrame. Wrapping the new values in a one-row DataFrame with matching columns gives `concat` two compatible tabular objects.",
    },
    "module3-3-v1-20261006": {
        "M3L3-006": "For mixed data, the default `describe()` summarizes numeric columns. Categorical columns require `include='all'` or a separate categorical summary.",
        "M3L3-011": "With only four observations, a single unusual point can strongly change the correlation, and chance patterns are plausible; the value is weak evidence until checked with more data and context.",
        "M3L3-018": "`groupby()` first partitions rows by key, applies a calculation within each partition, then combines those results into a summary.",
        "M3L3-027": "Grouping by both Department and Year creates one group per pair; `.size()` counts every row in each group, including rows with missing values in other columns.",
        "M3L3-033": "Python gives bitwise `&` higher precedence than comparisons, so without parentheses it may combine operands before forming each comparison. Parentheses make the two Boolean Series first, then combine them element by element.",
        "M3L3-037": "`to_excel()` is a DataFrame method that writes the table to an Excel workbook; `read_excel()` does the opposite and loads a workbook.",
        "M3L3-035": "`read_csv()` parses comma-separated rows and columns into a DataFrame; `to_csv()` is used to write a DataFrame back out.",
    },
    "module3-4-v1-20261006": {
        "M3L4-001": "Matplotlib is the base plotting library and exposes detailed control over axes and marks; that flexibility often requires more explicit code.",
        "M3L4-003": "Plotly and Bokeh create interactive browser charts, so they support actions such as zooming, panning, and hovering over marks.",
        "M3L4-008": "Changing the bin count changes how observations are grouped, not the observations themselves. Coarse bins can hide structure, while very fine bins can make random fluctuation look like a pattern.",
        "M3L4-009": "A pie chart encodes category shares as slices of one total, so it fits one categorical variable when the message is how the whole is divided.",
        "M3L4-011": "The slices differ by only a few percentage points, and people compare angles poorly. Aligned bar lengths make these small differences easier to see.",
        "M3L4-032": "`plot.hist()` bins the numeric values and displays the count in each interval; `bins=20` requests twenty intervals.",
        "M3L4-035": "A pie can show mutually exclusive categories that make up one total, but with many slices or similar shares, comparing their angles becomes difficult.",
        "M3L4-036": "The `Student` column supplies the category labels on the horizontal axis, while the numeric subject columns become grouped bar heights for comparison.",
        "M3L4-038": "Pandas plotting is convenient for quickly checking a DataFrame during analysis, but its simpler interface offers less control than dedicated plotting libraries.",
        "M3L4-040": "Chart form should match the analytical question: histograms show distributions, pies show composition, bars compare categories, and scatter or line charts show relationships and trends.",
    },
    "module3-5-v1-20261006": {
        "M3L5-001": "Seaborn's `load_dataset()` function supplies the built-in Titanic sample, so it is the library used to load that example data.",
        "M3L5-003": "`head()` shows example rows, while `info()` summarizes column types and non-null counts; together they reveal both what records look like and the table's structure.",
        "M3L5-004": "These five fields are the variables used in the later cleaning and comparisons: sex and class group passengers, age and fare describe them, and survived is the outcome.",
        "M3L5-007": "Removing 44 repeated five-field records from 714 age-complete rows leaves 670. Matching on those fields is only a duplicate signature, not proof that two real passengers were the same person.",
        "M3L5-013": "Age is a quantitative measurement, so summaries such as mean, quartiles, and standard deviation are meaningful; sex, class, and survived are categorical labels or outcomes.",
        "M3L5-019": "The row-normalized table divides surviving women by all retained women, giving a within-women survival share of about 75% rather than a share of all survivors.",
        "M3L5-025": "Each scatter point pairs one passenger's age with that passenger's fare, allowing the plot to show whether the two numeric measurements vary together; the visible trend is weak.",
        "M3L5-030": "`sym=''` suppresses the box plot's outlier markers to keep the boxes legible; it changes only what is drawn, not which passengers are in the DataFrame.",
        "M3L5-034": "A percentage alone hides its denominator. A rate based on few passengers can change substantially when one case changes, so group counts show how much evidence supports each rate.",
        "M3L5-039": "The sequence moves from loading and inspecting the table to selecting and cleaning fields, then summarizing, comparing categories, visualizing, and examining combined groups; later analyses depend on the earlier preparation.",
    },
}


def apply_overrides(bank_name, items):
    """Replace explanation text in a generated MCQ collection in place."""
    updates = OVERRIDES.get(bank_name, {})
    for item in items:
        if item.get("id") in updates:
            item["explanation"] = updates[item["id"]]
    missing = set(updates) - {item.get("id") for item in items}
    if missing:
        raise ValueError(f"{bank_name}: explanation override IDs not generated: {sorted(missing)}")
    from option_feedback_overrides import apply_option_feedback
    apply_option_feedback(bank_name, items)


def apply_file(bank_folder):
    """Apply overrides to an existing answer-bearing MCQ JSONL file."""
    from pathlib import Path
    import json

    folder = Path(bank_folder)
    path = folder / "final_items.jsonl"
    items = [json.loads(line) for line in path.read_text().splitlines() if line.strip()]
    apply_overrides(folder.name, items)
    path.write_text("\n".join(json.dumps(item, ensure_ascii=False) for item in items) + "\n")
