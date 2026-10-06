Lesson 1 of 6 · Lecture 2_1

Variables, operators, and expressions#
A variable is a labelled box in the computer's memory. An operator is a symbol that does something to what's in the boxes. That's the whole of this lesson — but the details are where beginners lose hours.

Variables: named boxes#
Information in code is stored in variables. A variable is a named container that holds a value in a reserved location in the computer's memory.

If you write X = 8, then X is the variable name, 8 is the value, and X points to the place in memory where 8 lives.

Your first variables — four different data types
Reset
▶ Run
x = 10
y = 1.387668
z = True
name = 'Rob'

print(name, x, y, z)

# type() tells you what kind of value is in each box
print(type(x), type(y), type(z), type(name))
The four built-in types you'll use constantly:

Type	Means	Example
int	whole number	10
float	number with a decimal point	1.387668
bool	True or False	True
str	text ("string")	'Rob'
Unlike many other languages, Python does not make you declare the type. It works it out from the value you assign.

Python is case sensitive

X and x are two completely different variables. This catches everybody at least once. If Python says NameError: name 'total' is not defined and you can see Total right there on screen — that's why.

Naming rules, and naming manners#
The rules (break these and Python refuses to run):

Names can contain letters, numbers, and underscores _ only.
They must begin with a letter or underscore — never a number.
No spaces.
No reserved keywords.
Valid: myVar, MyVar, _myVar, MyVar123 Invalid: m*var, my-var, my var, 1myVar

The manners (break these and Python runs fine, but your future self suffers):

Use descriptive names. student_name or StudentName beat sn every time. It feels excessive while you're typing it and makes perfect sense when you come back in three months.

Reserved keywords#
There are 35 words Python has claimed for itself. You cannot use them as variable names.

The 35 reserved keywords — run this instead of memorising them
Reset
▶ Run
import keyword
print(keyword.kwlist)
print()
print("That's", len(keyword.kwlist), "words you can't use as variable names.")
Note they're all lowercase except True, False, and None.

Updating a variable#
The most common pattern in all of programming: the new value depends on the old one.

Increment and decrement — x = x + 1 and its shortcuts
Reset
▶ Run
x = 6            # initialise x  -  you must do this first
print(x)

x = x + 1        # update x: take the current value, add 1, store it back
print(x)

x += 3           # shortcut: same as x = x + 3
print(x)

x -= 2           # shortcut: same as x = x - 2
print(x)
Adding 1 is called an increment; subtracting 1 is a decrement.

So what?

You must initialise a variable before you can update it. x = x + 1 when x doesn't exist yet gives you a NameError, because Python evaluates the right-hand side first — and it can't add 1 to something that isn't there. Every loop you write in the next lesson depends on getting this order right.

Arithmetic operators#
The values an operator works on are called operands. A statement combining values, variables, and operators is an expression.

All seven arithmetic operators — from the lecture, a = 15 and b = 4
Reset
▶ Run
a = 15
b = 4

print("Addition:       ", a + b)
print("Subtraction:    ", a - b)
print("Multiplication: ", a * b)
print("Division:       ", a / b)     # always gives a float
print("Floor Division: ", a // b)    # whole part only
print("Modulus:        ", a % b)     # the remainder
print("Exponentiation: ", a ** b)    # a to the power of b

# An expression can combine several of them
mean = (a + b) / 2
var  = (a - mean) ** 2 + (b - mean) ** 2
print()
print("Mean:    ", mean)
print("Variance:", var)
Where % and // actually earn their keep

You have 17 students and want groups of 5. 17 // 5 = 3 complete groups, and 17 % 5 = 2 students left over. Same two operators handle "how many full boxes and how many loose items", "how many hours and how many minutes", and the digit-reversing trick from Module 1.

Operator precedence#
Python does not read left to right. It follows a priority order, highest first:

Level	Operator	Description	Example	Result
1 (highest)	()	Parentheses — override everything	(2 + 3) * 4	20
2	**	Exponentiation (right to left)	2 ** 3 ** 2	512
3	+x, -x	Unary plus and minus	-2	−2
4	* / // %	Multiply, divide, floor divide, modulus	10 / 2 * 3	15
5 (lowest)	+ -	Addition and subtraction	10 - 5 + 2	7
Work through these by hand before you run the cell. The lecture's ten examples:

Precedence — predict, then run — cover the output and work them out first
Reset
▶ Run
print("1)  5 + 3 * 2            =", 5 + 3 * 2)
print("2)  10 - 4 / 2 + 3       =", 10 - 4 / 2 + 3)
print("3)  8 + 2 ** 3 * 2       =", 8 + 2 ** 3 * 2)
print("4)  (6 + 2) * 3 ** 2     =", (6 + 2) * 3 ** 2)
print("5)  18 / 3 + 4 * 2       =", 18 / 3 + 4 * 2)
print("6)  20 // 3 + 5 % 3      =", 20 // 3 + 5 % 3)
print("7)  15 - 2 * 3 ** 2 / 6  =", 15 - 2 * 3 ** 2 / 6)
print("8)  4 + 8 / 2 - 5 * 3    =", 4 + 8 / 2 - 5 * 3)
print("9)  30 % 7 + 2 ** 2 * 3  =", 30 % 7 + 2 ** 2 * 3)
print("10) (5 + 3) * 2 ** 3 - 6 / 3 =", (5 + 3) * 2 ** 3 - 6 / 3)
Answers, with the working
The one that costs money

total = tax + price * discount does not discount the tax. Multiplication runs first, so only the price gets discounted. You wanted total = (tax + price) * discount. This is the semantic error from Module 1 — no crash, no warning, just a wrong number in a report.

Comparison operators#
A Boolean expression is one that evaluates to either True or False. Comparison operators compare two values and hand back a Boolean.

Comparing two values — every one of these returns True or False
Reset
▶ Run
a = 15
b = 4

print("a > b   :", a > b)      # greater than
print("a < b   :", a < b)      # less than
print("a == b  :", a == b)     # EQUAL - two equals signs!
print("a != b  :", a != b)     # not equal
print("a >= b  :", a >= b)     # greater than or equal
print("a <= b  :", a <= b)     # less than or equal
= versus ==

= means "put this value in this box." == means "are these two the same?" They look almost identical and do completely unrelated jobs. Writing if x = 10: is a syntax error; Python will refuse to run. That's the lucky case — in some languages it silently assigns and you never find out.

Logical operators#
Programs make decisions by combining several True/False statements into one, using and, or, and not.

Operator	Returns True when	Example
and	both statements are true	x > 5 and x < 10
or	at least one is true	x > 5 or x < 4
not	reverses the result	not(x > 5)
The full truth table:

A	B	A and B	A or B	not A
False	False	False	False	True
False	True	False	True	True
True	False	False	True	False
True	True	True	True	False
Two examples from the lecture

and — a company's stock rises if there is positive sentiment and the company made a profit last year. Both must be true.

or — a heart monitor sounds the alarm if the pulse is too slow or the blood pressure is too weak. One is enough.

Getting these two mixed up is how you build an alarm that never fires, or one that never stops.

Logical operators and their precedence — not, then and, then or
Reset
▶ Run
a = True
b = False

print(a and b)        # False
print(a or b)         # True
print(not a)          # False
print(a and not b)    # True

print()
A = True; B = False; C = True

print("A and B or C        =", A and B or C)
print("A and B or not C    =", A and B or not C)
print("A and B or C and A  =", A and B or C and A)
print("not A and (B or C)  =", not A and (B or C))
Precedence among the three: not first, then and, then or.

And across all three families, Python evaluates in this order:

Arithmetic  →  Comparison  →  Logical

All three families in one expression — predict each before running
Reset
▶ Run
print("1)", not (8 / 4 == 2) and 3 ** 2 > 8)
print("2)", 12 % 5 + 2 * 3 >= 8 and 7 - 2 < 5)
print("3)", not (4 * 2 > 6) or 10 % 3 == 1)
print("4)", 10 - 3 ** 2 < 5 or 8 % 4 == 2)
print("5)", not (5 + 2 > 8) and 9 // 3 == 3)

# Example 1 step by step:
#   8/4 == 2     -> 2.0 == 2  -> True
#   3**2 > 8     -> 9 > 8     -> True
#   not True and True  ->  False and True  ->  False
So what?

Use parentheses even when you don't strictly need them. (a and b) or c costs you two characters and removes all doubt — for you, for your colleague, and for the person marking your code. Relying on precedence you half-remember is how a condition ends up meaning something you never intended.

Putting it together#
The simple interest problem from Module 1, now with real input and f-string output:

Simple interest, the Python version — input, process, output
Reset
▶ Run
Inputsprincipal, rate (%), number of years
1000
10
5
P = int(input("Enter the principal deposit: "))
R = float(input("Rate of interest (0-100) per year: "))
N = int(input("No. of years: "))

SI = round(P * N * (R / 100), 2)
A = P + SI

print(f"\nSimple interest = {SI}")
print(f"Amount of money after {N} years = {A}")
f-strings

f"... {N} ..." is an f-string (formatted string). Put an f before the quotes and anything inside { } gets replaced by its value. It's far easier to read than gluing pieces together with +, and you'll see it everywhere from here on.
