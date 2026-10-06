Lesson 6 of 6 · Lecture 2_4, Part 2

Tuples and dictionaries#
A tuple is a list that refuses to change. A dictionary looks things up by name instead of by position. Between them and the list, you can represent almost any dataset you'll meet.

Tuples#
A tuple is virtually identical to a list, with one important difference: tuples are immutable. Once created, you cannot add, remove, or replace an element.

Written with parentheses () instead of square brackets [].
Can hold any mix of data types, including lists, dictionaries, and other tuples.
Accessing and slicing work exactly as with lists.
Creating and slicing tuples — everything works like a list...
Reset
▶ Run
x = (0, 10, 20, 30, 40, 50, 60, 70, 80, 90)
y = ('first', 'second', 'third')
z = (1871, 'Ahmed', 'Amer', ['Math', 'Arabic'], (20, 30))   # mixed types

print(type(z))

x = x + y            # + creates a NEW tuple
print(x, len(x))

print("x[5:10]  ->", x[5:10])
print("y[-3:-1] ->", y[-3:-1])
print("x[:-3]   ->", x[:-3])
...until you try to change one — this cell is meant to fail
Reset
▶ Run
x = (0, 10, 20, 30)
print("The tuple is:", x)

x[0] = 7        # TypeError: 'tuple' object does not support item assignment

print("This line never runs.")
One sneaky exception

A tuple is immutable, but if it contains a mutable object — a list, say — that inner object can still be changed:


x = ([1, 2], [3, 4])
x[0][1] = 7      # allowed!  x is now ([1, 7], [3, 4])
The tuple's promise is "I will always hold these same objects," not "these objects will never change."

Why would you want a container that can't change?#
Tuple methods — there are only two
Reset
▶ Run
# Inflation rates (%) over 10 years - fixed historical data
rates = (2.1, 1.8, 2.5, 3.0, 2.8, 1.9, 2.5, 3.2, 2.8, 2.5)

print("Rates over 10 years:", rates)
print("2.5% occurred:", rates.count(2.5), "times")
print("First 3.0% at year index:", rates.index(3.0))

# set() removes duplicates; tuple() turns the result back into a tuple
print("Unique rates:", tuple(set(rates)))
So what?

Immutability is a safety feature. Historical inflation figures, the days of the week, a set of fixed economic indicators — none of these should ever change while your program runs. Storing them in a tuple means an accidental rates[3] = 99 crashes loudly instead of silently corrupting your analysis. Tuples are also slightly faster, because Python knows their size can never change.

Looping over tuples#
One loop, three containers — tuple, list, and string all behave the same
Reset
▶ Run
print("Loop over a tuple")
for number in (0, 1, 2, 3):
    print(" ", number)

print("Loop over a list")
for i in [0, 10, 20, 30]:
    print(" ", i)

print("Loop over a string")
for letter in "Python":
    print(" ", letter)
A list of tuples — unpacking three values at once
Reset
▶ Run
team = [('Ahmed', 20, 'center'),
        ('Anas', 22, 'point guard'),
        ('Wael', 22, 'shooting guard'),
        ('Ameer', 21, 'power forward'),
        ('Ali', 19, 'small forward')]

total = 0
for name, age, position in team:        # unpack each tuple into 3 names
    print(f"{name:8} {position}")
    total += age

print("\nTeam average age:", total / len(team))
print("team[1]      ->", team[1])
print("team[1][2]   ->", team[1][2])
print("team[2:4]    ->", team[2:4])
A list of tuples is one of the most natural shapes for a table of records — each tuple is a row. In Module 3 you'll see pandas take this idea much further.

Dictionaries#
A dictionary stores data as key: value pairs. You look things up by name, not by position.

Written with curly brackets {}, or built with dict().
Values can be any type, and can repeat.
Keys must be unique and immutable (strings, numbers, tuples).
Dictionaries are changeable — you can add, modify, and remove items.
Your first dictionary — keys, values, and items
Reset
▶ Run
country_capitals = {
    "Germany": "Berlin",
    "Canada": "Ottawa",
    "England": "London"
}

print(country_capitals)
print()
print("The capital of Canada is", country_capitals["Canada"])
In that dictionary: Germany, Canada, England are the keys; Berlin, Ottawa, London are the values; and each key: value pair is an item.

Why it's called a dictionary

In a paper dictionary you don't look up the 4,213th word — you look up "economics." That's exactly the difference between a list (give me item number 4213) and a dictionary (give me the value stored under this name). And just as a real dictionary can't define the same word twice, keys must be unique.

Four ways to create one#
Four routes to the same dictionary — pick whichever reads best
Reset
▶ Run
# 1. dict() with keyword arguments
p1 = dict(first_name="Rob", surname="Jone", gender="Male", favourite_food="Pizza")

# 2. dict() with a list of tuples
p2 = dict([("first_name", "Rob"), ("surname", "Jone"),
           ("gender", "Male"), ("favourite_food", "Pizza")])

# 3. Curly brackets - the most common
p3 = {"first_name": "Rob", "surname": "Jone",
      "gender": "Male", "favourite_food": "Pizza"}

# 4. Start empty, then fill it in
p4 = {}
p4["first_name"] = "Rob"
p4["surname"] = "Jone"
p4["gender"] = "Male"
p4["favourite_food"] = "Pizza"

print(p1 == p2 == p3 == p4)      # all four are identical
print(p3)
One key, one value

{'numbers': 1, 2, 3} is an error — a key can only point at a single value. If you want several, wrap them in one container: {'numbers': [1, 2, 3]}. That's perfectly valid, and very common.

Dictionary methods#
Method	Does
keys()	all the keys
values()	all the values
items()	all the key–value pairs
pop(key)	remove the item with that key
popitem()	remove the last inserted item
update()	merge in more key–value pairs
copy()	an independent copy
clear()	remove everything
keys, values, items — the three views of a dictionary
Reset
▶ Run
pd = {"first_name": "Rob", "surname": "Jone",
      "gender": "Male", "favourite_food": "Pizza"}

print("keys()  :", list(pd.keys()))
print("values():", list(pd.values()))
print()
print("items():")
for key, value in pd.items():
    print(f"   {key:16} -> {value}")
Adding, changing, checking, removing — dictionaries are mutable
Reset
▶ Run
pd = {"first_name": "Rob", "surname": "Jone", "favourite_food": "Pizza"}
print("start      :", pd)

pd['hobby'] = 'tennis'              # add a new item
print("after add  :", pd)

pd['first_name'] = 'James'          # update an existing one
print("after edit :", pd)

print("Is 'hobby' a key?", 'hobby' in pd)

pd.pop('favourite_food')            # remove by key
del pd['hobby']                     # another way to remove
print("after removes:", pd)

pd2 = pd.copy()                     # remember the copy trap from Lesson 5!
pd.clear()
print("pd :", pd)
print("pd2:", pd2)
Nested dictionaries#
Values can themselves be lists or dictionaries — which is how real, structured data looks.

Reaching into nested data — chain the brackets
Reset
▶ Run
person = {
    'first_name': 'Mona',
    'last_name': 'Saber',
    'age': 25,
    'country': 'Egypt',
    'is_married': True,
    'skills': ['JavaScript', 'React', 'Node', 'MongoDB', 'Python'],
    'address': {'street': 'Kareem Banona', 'zipcode': '02210'}
}

print("Looping over a dictionary gives you the KEYS:")
for i, key in enumerate(person, start=1):
    print("  ", i, key)

print()
print("skills        ->", person['skills'])
print("skills[2]     ->", person['skills'][2])
print("address street->", person['address']['street'])
Worked examples#
Character frequency#
Count every character in a string — building a dictionary in a loop
Reset
▶ Run
txt = "Hello, I love feps"

txt_dic = {}
for char in set(txt.lower()):        # set() gives the unique characters
    txt_dic[char] = txt.lower().count(char)

# Sort by count, highest first, just to make it readable
for char, count in sorted(txt_dic.items(), key=lambda pair: -pair[1]):
    label = "'" + char + "'" if char != " " else "(space)"
    print(f"{label:9} {count}")
Marketing campaign analysis#
Which advertising platform performs best? — dictionaries + list comprehension
Reset
▶ Run
def suggest_improvement(ctr_data, min_ctr=4.0):
    low_ctr = [p for p, c in ctr_data.items() if c < min_ctr]
    if low_ctr:
        print(f"Platforms needing improvement (CTR < {min_ctr}%): {low_ctr}")
    else:
        print("All platforms are performing well!")

# Click-through rate per platform, in %
ad_ctr = {
    "Google Ads": 5.4,
    "Facebook Ads": 3.8,
    "Instagram Ads": 4.2,
    "LinkedIn Ads": 1.9
}

top = max(ad_ctr.values())
best = [k for k, v in ad_ctr.items() if v == top]
print("Best advertising platform:", best)
print()

suggest_improvement(ad_ctr)
suggest_improvement(ad_ctr, 2)
A list of dictionaries — the shape of real data#
Survey responses — this is one step away from a pandas DataFrame
Reset
▶ Run
def avg_hours(entries):
    return sum(e["hours"] for e in entries) / len(entries)

def heavy_users(entries, limit=2):
    return [e["name"] for e in entries if e["hours"] > limit]

data = [
    {"name": "Alice",   "age": 22, "platform": "Instagram", "hours": 3},
    {"name": "Bob",     "age": 25, "platform": "Facebook",  "hours": 1},
    {"name": "Charlie", "age": 19, "platform": "TikTok",    "hours": 4},
    {"name": "David",   "age": 30, "platform": "Twitter",   "hours": 2},
]

for row in data:
    print(row)

avg = avg_hours(data)
print("\nAverage hours:", round(avg, 2))
print("Heavy users (more than 2 hours):", heavy_users(data))
print(f"Heavy users (more than {round(avg,2)} hours):", heavy_users(data, avg))
Look at that shape carefully

A list of dictionaries, where every dictionary has the same keys, is a table: each dictionary is a row, each key is a column. You have just built a dataset by hand. In Module 3, pd.DataFrame(data) turns that exact structure into something you can sort, filter, group, and plot in one line each.

Sheet 4, Ex 4 — price elasticity of demand#
Sheet 4, Ex 4: price elasticity — a dictionary of dictionaries
Reset
▶ Run
products = {
    "Laptop":     {"p0": 1000, "p1": 1500, "q0": 50,  "q1": 20},
    "Smartphone": {"p0": 800,  "p1": 1000, "q0": 200, "q1": 400},
    "Headphones": {"p0": 100,  "p1": 80,   "q0": 500, "q1": 700},
    "Camera":     {"p0": 1200, "p1": 1100, "q0": 30,  "q1": 35},
    "Monitor":    {"p0": 300,  "p1": 330,  "q0": 100, "q1": 130},
}

print("Price Elasticity of Demand:\n")
for product, data in products.items():
    P0, P1 = data["p0"], data["p1"]
    Q0, Q1 = data["q0"], data["q1"]

    price_change = (P1 - P0) / P0
    qty_change = (Q1 - Q0) / Q0

    if price_change != 0:
        elasticity = round(qty_change / price_change, 2)
    else:
        elasticity = float('inf')

    if elasticity > 1:
        category = "Elastic"
    elif elasticity < 1:
        category = "Inelastic"
    else:
        category = "Unitary"

    print(f"{product:12} Elasticity = {elasticity:6} -> {category}")
Reading the result

Elasticity above 1 means demand is elastic — a small price rise loses you a lot of customers, so raising prices may cut total revenue. Below 1 is inelastic — people buy it anyway (fuel, medicine, bread), so a price rise increases revenue. This one number drives an enormous amount of real pricing policy.

The three containers, side by side#
Tuple	List	Dictionary
Definition	immutable ordered collection	mutable ordered collection	key–value pairs
Example	gdp = (2.5, 3.1, 2.8)	countries = ['USA', 'UK']	pop = {'USA': 331, 'UK': 68}
Mutable?	no	yes	yes (keys unique)
Indexing	by position	by position	by key
Duplicates	allowed	allowed	keys must be unique
Speed	fastest (fixed size)	slower (dynamic)	optimised for key lookup
Use when	the data must not change	the data needs editing	you need to look things up by name
Methods	count(), index()	append(), remove(), pop(), sort()	keys(), values(), items(), get()
