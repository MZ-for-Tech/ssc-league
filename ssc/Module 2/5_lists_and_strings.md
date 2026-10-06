Lesson 5 of 6 · Lecture 2_4, Part 1

Lists and strings#
So far every variable has held one value. A list holds many — and once you can put a hundred numbers in one box, everything you learned about loops suddenly pays off.

The four collection types#
Python has four built-in ways to store a group of values:

Type	Written as	Ordered?	Changeable?
List	[1, 2, 3, 4]	yes	yes (mutable)
Tuple	(1, 2, 3, 4)	yes	no (immutable)
Set	{1, 4, 14, 33}	no	yes, but unique values only
Dictionary	{"Name": "Anita", "Age": 77}	by key	yes
This lesson is lists (and strings, which behave similarly). The next covers tuples and dictionaries.

Creating and indexing a list#
A list is an ordered, modifiable sequence of items — which can be of the same type or different types, including other lists.

The first index is 0, and the last is n − 1.

Making lists — empty, simple, nested, and mixed
Reset
▶ Run
x = []                            # an empty list
print(x, type(x))

x = [1, 2, 3, 4]                  # a 1-dimensional list
print(x)

y = [[1, 2, 3, 4], [5, 6, 7, 8]]  # a list of lists (2-dimensional)
print(y)

z = [1, 1.0, 'one', False]        # a mixed list - Python allows it
print(z)
Accessing items by index — positive and negative
Reset
▶ Run
x = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]

print(x[0])     # first item
print(x[5])     # sixth item
print(x[9])     # last item
print(x[-1])    # also the last item
print(x[-6])    # sixth from the end

# print(x[10])  # <- uncomment: IndexError, list index out of range
Negative indices count from the end — -1 is the last item, -2 the second-to-last:

item	10	20	30	40	50	60	70
+ index	0	1	2	3	4	5	6
− index	−7	−6	−5	−4	−3	−2	−1
Slicing#
list[start:stop:step] — start is included, stop is excluded, step defaults to 1.

Slicing a list — nums = [10, 20, 30, 40, 50, 60, 70]
Reset
▶ Run
nums = [10, 20, 30, 40, 50, 60, 70]

print("nums[1:4]   ->", nums[1:4])     # index 1 up to (not including) 4
print("nums[:3]    ->", nums[:3])      # from the start
print("nums[2:]    ->", nums[2:])      # to the end
print("nums[::2]   ->", nums[::2])     # every 2nd item
print("nums[-3:]   ->", nums[-3:])     # last 3 items
print("nums[::-1]  ->", nums[::-1])    # the whole list, reversed
Slicing a list of lists — two indices, one after the other
Reset
▶ Run
y = [[10, 20, 30, 40], [50, 60, 70, 80]]

print(y[0])        # the first inner list
print(y[1])        # the second inner list
print(y[0][0])     # first item OF the first inner list
print(y[0][1:4])   # a slice of the first inner list
print(y[1][1:4])
The copy trap#
This is the single most important slide in the lecture, and it catches people for years.

Why x = y is dangerous — two names, one list
Reset
▶ Run
y = [0, 10, 20, 30]
x = y                 # this does NOT make a copy

x.append(100)

print("x =", x)
print("y =", y)       # y changed too!
x = y does not create a new list. It makes x and y two names for the same object in memory. Change one, and the other changes, because there is only one list.

The fix — .copy() makes a real second list
Reset
▶ Run
y = [0, 10, 20, 30]
x = y.copy()          # now x is an independent copy

x.append(100)

print("x =", x)
print("y =", y)       # y is untouched
So what?

This is a whole category of bug that produces no error message. You "back up" your data, modify the copy, and discover later that your original was quietly destroyed too. Any time you assign one list to another name and then modify it, ask yourself: did I want a copy, or a second name for the same thing?

List methods#
A method is a function attached to an object, called with dot notation: object.method().

Method	Does
append(x)	add x to the end
insert(i, x)	insert x at index i
extend(seq)	add several items
remove(x)	remove the first item equal to x
pop(i)	remove item at index i and return it
clear()	remove everything
sort()	sort in place, ascending
sort(reverse=True)	sort in place, descending
reverse()	reverse in place
index(x)	position of x
count(x)	how many times x appears
copy()	an independent copy
append vs extend vs + — three ways to add, two different results
Reset
▶ Run
y = [0, 10, 20, 30]
w = ['first', 'second', 'third']

x = y.copy()
x.append(w)
print("append :", len(x), x)     # the whole list goes in as ONE item

x = y.copy()
x.extend(w)
print("extend :", len(x), x)     # the items go in individually

x = y.copy()
x = x + w
print("plus   :", len(x), x)     # same result as extend
append puts the list inside the list

append adds exactly one item. If that item happens to be a list, you get a nested list, and len() goes up by 1 rather than by 3. extend (or +) is what you want when you mean "add all of these."

Removing items — del, pop, remove, clear
Reset
▶ Run
x = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]

del x[1:3]
print("after del x[1:3] :", x)

print("x.pop(1) returned:", x.pop(1), "-> x is now", x)

del x[0]
print("after del x[0]   :", x)

x.remove(80)                 # removes by VALUE, not index
print("after remove(80) :", x)

x.clear()
print("after clear()    :", x)
count, reverse, sort, and "in" — rearranging and inspecting
Reset
▶ Run
y = [1, 8, 7, 2, 3, 4, 4, 5, 6, 9, 9]

print("count of 1:", y.count(1), " count of 4:", y.count(4))

y.reverse()
print("reversed :", y)

y.sort()
print("sorted   :", y)

y.sort(reverse=True)
print("descending:", y)

print("Is 20 in the list?", 20 in y)
print("Is  8 in the list?", 8 in y)
Methods versus built-in functions#
Both act on lists, but the syntax differs — and so does the effect.

sorted() vs .sort() — the difference that matters
Reset
▶ Run
x = [35, 20, 30, 15]

print("max, min, sum:", max(x), min(x), sum(x))

print("sorted(x) returns:", sorted(x))
print("x is still       :", x)          # unchanged!

x.sort()
print("after x.sort(), x:", x)          # changed in place
sorted(x) is a built-in function: it gives you a new sorted list and leaves the original alone. x.sort() is a method: it rearranges the original and returns nothing.

Getting these backwards produces either a lost result or a destroyed original.

Looping over a list#
Median income — a real function, from the lecture
Reset
▶ Run
def median_income(incomes):
    sorted_incomes = sorted(incomes)
    n = len(sorted_incomes)
    mid = n // 2
    if n % 2 == 0:
        return (sorted_incomes[mid] + sorted_incomes[mid - 1]) / 2
    return sorted_incomes[mid]

incomes = [2500, 3200, 4000, 2800, 5000]
print("Median income:", round(median_income(incomes), 2))

# Add a sixth value and run again - the even-length branch takes over
GDP growth rates — looping with an index, because we need the previous item
Reset
▶ Run
def gdp_growth_rate(gdp_values):
    growth_rates = []
    N = len(gdp_values)
    for i in range(1, N):          # start at 1: item 0 has no previous year
        rate = (gdp_values[i] - gdp_values[i - 1]) / gdp_values[i - 1] * 100
        growth_rates.append(str(round(rate, 2)) + "%")
    return growth_rates

gdp_values = [2.1, 2.3, 2.6, 2.9]      # trillion dollars
print("Growth Rates:", gdp_growth_rate(gdp_values))
Why the loop starts at 1

A growth rate needs a previous year to compare against, and the first year hasn't got one. Four years of data give you three growth rates. Any time you compute change-over-time you lose one observation — and forgetting that is how a table ends up misaligned by a row.

List comprehension#
A compact way to build a list from a sequence — and faster than the equivalent for loop.


newlist = [expression for item in sequence if condition]
List comprehension — the long way and the short way
Reset
▶ Run
fruits = ["apple", "banana", "cherry", "kiwi", "mango"]

# copy every item
print([x for x in fruits])

# with a filter
print([x for x in fruits if x != "apple"])

print()
# Even numbers 0 to 20 - the long way
even_numbers = []
for i in range(21):
    if i % 2 == 0:
        even_numbers.append(i)
print("long way :", even_numbers)

# Even numbers 0 to 20 - the comprehension
even_numbers = [i for i in range(21) if i % 2 == 0]
print("short way:", even_numbers)

# Filter positive even numbers out of a mixed list
numbers = [-8, -7, -3, -1, 0, 1, 3, 4, 5, 7, 6, 8, 10]
print("positive evens:", [i for i in numbers if i % 2 == 0 and i > 0])
Strings#
Python treats anything in quotes as a string. Strings are sequences too, so indexing and slicing work exactly as they do for lists.

Method	Does
upper() / lower()	change case
capitalize()	first character to upper case
count()	how many times a value appears
find()	position of a value, or −1 if absent
split()	split into a list at a separator
join()	join an iterable into one string
replace()	swap one value for another
strip()	remove surrounding spaces
isdigit()	are all characters digits?
String methods on a news headline — the lecture's example
Reset
▶ Run
txt_news = "BBC: babies have died from cold in Gaza over two weeks"

print(txt_news.upper())
print(txt_news.lower())
print("No. of characters =", len(txt_news))

words = txt_news.split()
print("Words:", words)
print("No. of words =", len(words))

sent = txt_news.split("Gaza")
print("Split on 'Gaza':", sent)
Searching inside a string — find() and count()
Reset
▶ Run
txt_news = "BBC: babies have died from cold in Gaza over two weeks"
words = txt_news.split()

target = "Palestine"
print(f"find('{target}') ->", txt_news.find(target), " (-1 means not found)")

target = "Gaza"
pos = txt_news.find(target)
print(f"find('{target}')      ->", pos)

x = txt_news.count(target)
print(f"Count of '{target}' in the text = {x}")

d = round(x / len(words) * 100, 2)
print(f"Density of '{target}' in the text = {d}%")
Six ways to find the longest word — same answer, six routes
Reset
▶ Run
txt_news = "BBC: babies have died from cold in Gaza over two weeks"
words = txt_news.split()

# 1. Your own function
def longest_word(words):
    longest = ""
    for w in words:
        if len(w) > len(longest):
            longest = w
    return longest
print("1. own function :", longest_word(words))

# 2. max() with a key
print("2. max(key=len) :", max(words, key=len))

# 3-4. sorted()
print("3. sorted last  :", sorted(words, key=len)[-1])
print("4. sorted first :", sorted(words, key=len, reverse=True)[0])

# 5-6. the .sort() method
words.sort(key=len)
print("5. .sort() last :", words[-1])
words.sort(key=len, reverse=True)
print("6. .sort() first:", words[0])
key=len in one sentence

max(words) would give you the word that's last alphabetically. max(words, key=len) says "compare them by their length instead." The key argument shows up all over Python — it's how you sort a list of people by age, or a list of countries by GDP.

Lists of strings#
Building full names — a loop, then the comprehension
Reset
▶ Run
students = [["Ahmed", "Ali"], ["Dina", "Khaled"], ["Lina", "Ameer"]]

# with a loop
full_name = []
for s in students:
    full_name.append(s[0] + " " + s[1])
print(full_name)

# with a comprehension - one line, same result
full_name = [s[0] + " " + s[1] for s in students]
print(full_name)
Extract email providers — split, filter, de-duplicate
Reset
▶ Run
def email_provider(emails):
    domains = []
    for email in emails:
        at_index = email.find("@")
        if at_index == -1:          # no @ sign - skip this one
            continue
        domain = email.split('@')[1]
        if domain not in domains:   # avoid duplicates
            domains.append(domain)
    return sorted(domains)

emails = ["alice@gmail.com", "bob@yahoo.com", "charlie@gmail.com",
          "david@outlook.com", "eve@yahoo.com", "frank@company.com"]
print(email_provider(emails))
The exercises#
Sheet 4, Ex 11 — the improved analyze_list#
The lecture asks you to take the counting function from Lesson 3 and improve it: handle inconsistent capitalisation, and replace the counting loop with the count() method.

analyze_list, improved — lowercase everything, then use .count()
Reset
▶ Run
def analyze_list(data_list, word1, word2):
    # Handle inconsistent capitalisation
    data_list = [item.lower() for item in data_list]
    word1 = word1.lower()
    word2 = word2.lower()

    total = len(data_list)
    count1 = data_list.count(word1)     # the loop is gone
    count2 = data_list.count(word2)

    print(f"{word1}: {count1} ({round(count1 / total * 100, 2)}%)")
    print(f"{word2}: {count2} ({round(count2 / total * 100, 2)}%)")

    if count1 > count2:
        print(f"The majority is {word1}.\n")
    elif count2 > count1:
        print(f"The majority is {word2}.\n")
    else:
        print("The counts are equal.\n")

# Note the messy capitalisation - it no longer matters
genders = ["Male", "female", "FEMALE", "male", "Female", "female"]
analyze_list(genders, "Male", "Female")

votes = ["Mamdani", "cuomo", "MAMDANI", "Mamdani", "Cuomo"]
analyze_list(votes, "Mamdani", "Cuomo")
Real survey data is messy

"Male", "male", and "MALE" are three different strings to a computer and one category to a human. Every dataset you ever receive will have this problem, along with stray spaces (.strip()) and inconsistent spellings. Cleaning is not a distraction from the analysis — it is most of the analysis.

Sheet 4, Ex 5 — the Gini coefficient#
A real measure of income inequality, from 0 (perfect equality) to 1 (one person has everything).

Sheet 4, Ex 5: the Gini coefficient — sorting, looping, and interpreting
Reset
▶ Run
def gini_coefficient(data):
    sorted_data = sorted(data)
    n = len(sorted_data)
    total = sum(sorted_data)

    numerator = 0
    rank = 1
    for income in sorted_data:
        numerator += income * (2 * rank - (n + 1))
        rank += 1

    G = round(numerator / (n * total), 2)

    if 0 <= G <= 0.3:
        interpretation = "Low"
    elif 0.3 < G <= 0.5:
        interpretation = "Moderate"
    elif 0.5 < G <= 1:
        interpretation = "High"
    else:
        interpretation = "Invalid Gini Index"

    return G, interpretation

incomes = [500, 2000, 1500, 3000, 1000]
gini, interp = gini_coefficient(incomes)
print(f"Gini coefficient: {gini} - {interp} inequality")

# Try [1000, 1000, 1000, 1000] - perfect equality
# Try [10, 10, 10, 100000]     - extreme inequality
Reading a Gini number

0 to 0.3 is low inequality (the Scandinavian countries). 0.3 to 0.5 is moderate (the USA, the UK). Above 0.5 is high. Note the function returns two values at once — Python lets you do that, and gini, interp = ... unpacks them into two variables.
