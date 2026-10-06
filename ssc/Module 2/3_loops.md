Lesson 3 of 6 · Lecture 2_2

Loops: for and while#
A loop repeats a block of instructions so you don't have to write it out a hundred times. You met the idea as a flowchart in Module 1 — here it becomes two Python keywords.

Which loop, and when#
The rule is about what you know before you start:

for — a known number of repeats#
You know in advance how many times, or you have a collection to walk through.

"Grade all 40 students." "Print every country in this list."

while — an unknown number of repeats#
You repeat until some condition stops being true, and you can't say up front how long that takes.

"Keep asking until they type a valid number."

The while loop#
The four parts from Module 1 are still the four parts. Miss the fourth and the loop never ends.

The four parts of a while loop — initialise · test · body · update
Reset
▶ Run
I = 1                          # 1. initialise the control variable

while I <= 5:                  # 2. test the condition
    print("Hello Feps")        # 3. the body - what gets repeated
    I = I + 1                  # 4. update the control variable

print("Finished. I ended at", I)

# Delete line 6 and press Run. This page will stop you after a
# few hundred thousand steps and tell you the loop never ends.
So what?

The update line is the single most-forgotten line in programming. In a browser an infinite loop freezes the tab; in a real script it burns CPU until you kill it; in a program that writes to a file or a database it can fill a disk. When a program "hangs," the first thing to check is whether some counter stopped moving.

The for loop and range()#
A for loop walks through a sequence, taking one item at a time. The most common sequence is produced by range().

How range() works — three ways to call it
Reset
▶ Run
# range(stop) - starts at 0, stops BEFORE stop
for i in range(5):
    print("range(5) gives", i)

print()

# range(start, stop)
for i in range(2, 6):
    print("range(2, 6) gives", i)

print()

# range(start, stop, step)
for i in range(0, 21, 5):
    print("range(0, 21, 5) gives", i)
range() stops before the last number

range(5) gives you 0, 1, 2, 3, 4 — five numbers, but never 5 itself. To count 1 to 100 inclusive you need range(1, 101). This "off-by-one" is probably the most common single bug in all of programming; it has its own name for a reason.

The same job, both ways:

Sum 1 to 100, with each kind of loop — same answer, different tool
Reset
▶ Run
# --- with while ---
total = 0
n = 1
while n <= 100:
    total = total + n
    n = n + 1
print("while loop:", total)

# --- with for ---
total = 0
for n in range(1, 101):
    total = total + n
print("for loop:  ", total)

# --- and the way you'd really write it ---
print("built-in:  ", sum(range(1, 101)))
Looping over a collection#
A for loop doesn't need range() at all — it can walk straight through a list or a string. This is the form you'll use most once Lesson 5 introduces lists.

Looping over things that aren't numbers — lists and strings
Reset
▶ Run
countries = ["Egypt", "Sudan", "Jordan", "Morocco"]

for country in countries:
    print("Country:", country)

print()

for letter in "Python":
    print(letter)
break and continue#
Two words that change the flow from inside the loop:

break — leave the loop immediately.
continue — skip the rest of this pass and go to the next one.
break and continue — use sparingly, but know them
Reset
▶ Run
# break: stop as soon as we find what we're after
for n in [4, 8, 15, 23, 42]:
    if n % 2 != 0:
        print("First odd number found:", n)
        break
    print(n, "is even, keep looking")

print()

# continue: skip the ones we don't want
for n in range(1, 11):
    if n % 3 != 0:
        continue          # not a multiple of 3 - skip to the next n
    print(n, "is a multiple of 3")
Nested loops#
A loop inside a loop. The inner one runs completely for every single pass of the outer one.

A multiplication table — a loop inside a loop
Reset
▶ Run
for row in range(1, 6):
    line = ""
    for col in range(1, 6):
        line = line + str(row * col).rjust(4)
    print(line)
Nested loops multiply, they don't add

Two loops of 1,000 each, nested, is one million passes — not two thousand. That's still instant here. But three nested loops over 10,000 records each is a trillion passes, which is not a slow program, it is a program that never finishes. This is the "time complexity" idea from Module 1 arriving in practice.

The two modelling exercises#
Both of these come from the lecture sheets, and both are the same shape: a quantity that changes by a constant rate each period rather than a fixed amount.

new value = old value + (old value × rate)   →   Pt = P0(1 + r)t

This is exponential growth (or decay, if the rate is negative), because time sits in the exponent. Population, inflation, and compound interest are all the same formula.

Population growth#
Sheet 2, Q18: population growth — while loop, 10 years
Reset
▶ Run
Inputsstarting population, growth rate (e.g. 0.02), number of years
1000
0.02
10
population = float(input("Initial population: "))
rate = float(input("Growth rate per year (e.g. 0.02 for 2%): "))
years = int(input("Number of years: "))

year = 1
while year <= years:
    population += population * rate
    print("Year", year, ":", round(population, 2))
    year += 1

print(f"\nAfter {years} years the population is {round(population, 2)}")
Inflation#
Exactly the same loop, pointed at a price instead of a population — which is the point of the exercise.

Sheet 2, Q19: price inflation — the identical loop, different subject
Reset
▶ Run
Inputsstarting price (EGP), inflation rate, number of years
250
0.08
5
price = float(input("Current price in EGP: "))
rate = float(input("Annual inflation rate (e.g. 0.08 for 8%): "))
years = int(input("Number of years: "))

year = 1
while year <= years:
    price += price * rate
    print(f"Year {year}: {round(price, 2)} EGP")
    year += 1

print(f"\nWhat costs {round(price, 2)} EGP in {years} years costs less today.")
print("That is what inflation does to savings held as cash.")
Same loop, four different questions

Population growth, inflation, compound interest, and currency depreciation are one piece of code with different numbers in it. In Lesson 4 you'll wrap exactly this loop in a function called growth_model and call it four times — which is the whole argument for functions in one example.

Counting things in a list#
The other loop exercise from the sheets — count how many times each of two values appears, and report the percentages. This is the shape of nearly every survey analysis you will ever write.

Sheet 2, Q20/Q21: counting responses — a loop with two counters
Reset
▶ Run
genders = ["Male", "Female", "Female", "Male", "Female", "Female"]

count_male = 0
count_female = 0

for item in genders:
    if item == "Male":
        count_male += 1
    elif item == "Female":
        count_female += 1

total = len(genders)
print("Male  :", count_male, "(", round(count_male / total * 100, 2), "% )")
print("Female:", count_female, "(", round(count_female / total * 100, 2), "% )")

if count_male > count_female:
    print("The majority is Male.")
elif count_female > count_male:
    print("The majority is Female.")
else:
    print("The counts are equal.")

# Now swap in a list of votes and the same code still works:
# votes = ["Mamdani", "Cuomo", "Mamdani", "Mamdani", "Cuomo"]
So what?

Notice you just wrote nearly the same block twice — once for gender, once for votes. That duplication is the smell that tells you a function is needed. That is exactly where the next lesson starts.
