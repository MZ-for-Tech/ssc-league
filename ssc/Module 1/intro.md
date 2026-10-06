Lesson 3 of 3

Programming: talking to a machine that obeys exactly#
You have the steps and you have the drawing. Now you hand them to a machine whose only question, three billion times a second, is *"what is next?"*

The machine you are talking to#
Four parts, and you only need the idea of each:

CPU — the obsessive worker#
The lecture's description is perfect: the CPU is "obsessed with what is next?". A 3.0 GHz CPU asks that question three billion times per second. Your program is the list of answers you prepared in advance.

Main memory (RAM) — the desk#
Stores what the CPU needs in a hurry, almost as fast as the CPU itself. But it vanishes when the power goes off. Your variables live here.

Secondary memory — the cupboard#
Hard disks, flash drives. Much slower, but it keeps information without power. Your files live here.

Input / output — the doors#
Screen, keyboard, mouse, microphone, speaker, and the network. Every way you and the machine reach each other.

The desk and the cupboard

Think of studying. The desk is your RAM — whatever you spread out in front of you, fast to reach, but cleared every evening. The cupboard is your hard disk — slower to fetch from, but things stay there for years. When you press Ctrl+S, you are moving work from the desk to the cupboard. When a program "loses your work," it never made that move.

What programming actually is#
The lecture defines a programming task in two phases, and this is the map for the entire course:

Problem-solving phase — define the problem and produce an ordered sequence of steps. That was Lessons 1 and 2.
Implementation phase — write those steps in some programming language. That is everything from here on.
And the line from the slides worth keeping: your program is the "story," and the problem you are trying to solve is the "story dilemma." Learning vocabulary is not enough. You have to organise the story so a reader can follow it.

Which is why once you learn Python properly, picking up JavaScript or C++ is mostly learning new vocabulary. The problem-solving skill is the same in every language.

Syntax and semantics#
Every language — spoken or programming — has two layers:

Syntax — the rules for writing correctly. The grammar.
Semantics — the meaning. What the code actually does.
The lecture's example shows two statements with different syntax and the same semantics:

Language	Statement	Meaning
Python	print("Hello, World")	Show Hello, World on the screen
C	printf("Hello, World");	Show Hello, World on the screen
Same meaning, different spelling — and notice C insists on the semicolon while Python does not. Write Python's line in C and it fails. This is why "I know programming" always means "I know programming in something."

Your first program, the one everybody starts with:

Hello, World — your first program
Reset
▶ Run
print("Hello, World")

# Now make it yours:
name = "Ahmed"
print("Hello,", name, "- welcome to Python!")
Why Python, and what "interpreted" means#
The computer only understands machine language — pure 1s and 0s. Everything we write has to be translated. There are two ways to translate, and it changes how it feels to learn:

Compiler	Interpreter
How	Translates the entire code before running it	Translates and runs line by line
Produces	An executable file (.exe, .dll)	Nothing — it runs the source directly
Speed	Faster, once compiled	Usually slower
Errors appear	Before execution	During execution
Examples	C, C++, C#	Python, Ruby, PHP
The translator in the room

A compiler is like handing a whole book to a translator and waiting a week for the finished translation. An interpreter is like having a translator standing beside you at a meeting, translating each sentence as you say it. Slower overall — but you find out immediately when you've said something wrong. That immediate feedback is exactly why Python is a good first language, and why the Run buttons on this page work at all.

Java sits in the middle — it compiles to an intermediate byte code that then runs on a virtual machine. That is called a hybrid language.

The four kinds of mistake#
This is the most practical section in Module 1. As the lecture warns: the smallest deviation will cause Python to give up looking at your program. Knowing which kind of mistake you've made is half of fixing it.

Error	When it appears	Does the program run?
Syntax	Before anything runs	No — not a single line
Runtime	Part-way through	Starts, then crashes
Logic	Never announced	Yes — with a wrong answer
Semantic	Never announced	Yes — with a wrong answer
Syntax errors — you broke the grammar#
Python checks the rules before it runs anything. Break one and nothing executes. Run this broken program and read what Python tells you:

A syntax error, on purpose — nothing will run at all
Reset
▶ Run
x = 10

if x > 5
    print("x is greater than 5")

# Python stops before running ANYTHING - even the first line.
# Fix: put a colon after the condition, like this:  if x > 5:
# Then press Run again.
The lecture's list of the syntax errors beginners actually hit:

Mistake	Wrong	Right
Missing colon	if x > 5	if x > 5:
Indentation error	body not pushed in	body indented 4 spaces
Reserved keyword as a variable	def = "Ahmed"	st_name = "Ahmed"
Unmatched quotation	print('Hello!)	print('Hello!')
Unbalanced brackets	print("Sum: " + (5 + 3)	print("Sum: " + str(5 + 3))
Missing comma in a list	[1, 2, 3 4, 5]	[1, 2, 3, 4, 5]
= instead of ==	if x = 10:	if x == 10:
That last one deserves a sentence of its own. = means "put this value into this box." == means "are these two the same?" They are completely different jobs that happen to look alike.

Runtime errors — the program starts, then hits a wall#
The grammar was fine, so Python began executing. Then it met something impossible. Notice the first line does print before the crash:

A runtime error — it runs, then it crashes
Reset
▶ Run
print("This line works fine.")

result = 10 / 0        # ZeroDivisionError

print("This line never happens.")

# Try replacing line 3 with each of these, one at a time:
#   total = "5" + 2            -> TypeError
#   num = int("abc")           -> ValueError
#   arr = [1, 2, 3]; print(arr[5])  -> IndexError
Runtime error	Example	What happened
ZeroDivisionError	10 / 0	You divided by zero.
TypeError	"5" + 2	You mixed incompatible types — text and a number.
ValueError	int("abc")	Right type, impossible value.
IndexError	[1,2,3][5]	You asked for an item that isn't there.
FileNotFoundError	open("missing.txt")	The file doesn't exist.
ModuleNotFoundError	import notreal	That library isn't installed.
Read the last line of the error message first. It names the error type and usually tells you the line number. Beginners panic at the red text; experienced people read one line of it and go straight to the problem.

Logic and semantic errors — the dangerous ones#
These produce no error message at all. The program runs happily and hands you a confident, wrong answer.

A semantic error — no warning, wrong answer — the most expensive kind of bug
Reset
▶ Run
length = 10
width  = 4

# The formula for area is multiplication, not addition:
area = length + width

print("Area of the rectangle:", area)
print("...but the true area is:", length * width)

# Python is perfectly happy. It has no idea what an area is.
# Only YOU know the formula is wrong.
The other classic from the lecture is order of operations:

Wrong	Right	Why
total = tax + price * discount	total = (tax + price) * discount	Multiplication happens before addition. Without brackets, you discounted only the price and left the tax at full value.
area = length + width	area = length * width	Wrong formula entirely — but perfectly legal Python.
So what?

A syntax error costs you two minutes. A logic error can sit inside a working report for a year. This is why tracing from Lesson 1 matters so much, and why you always test with a case where you already know the answer. If you can't verify the output by hand on a small example, you have no idea whether the program is right — you only know it didn't crash.

Putting the whole module together#
One last exercise, straight from the lecture, that uses everything: input, process, output, a formula, and a loop.

The problem

Money is deposited in a bank. Given the principal P, the annual rate R, the time T in years, and n, the number of times the bank compounds per year, calculate the final amount A = P × (1 + R/(100n)) ^ (nT) and the compound interest CI = A − P. Then print the total at the end of every year from 1 to T.

Before you look at any code: what is the input, what is the process, what is the output? And which construct do you need for "every year from 1 to T"?

Compound interest, year by year — the full module in one program
Reset
▶ Run
InputsP (EGP), R (rate %), T (years), n (times compounded per year)
10000
12
5
4
P = float(input("Principal P (EGP): "))
R = float(input("Rate R (% per year): "))
T = int(input("Time T (years): "))
n = int(input("Compounds per year n: "))

# Loop through every year from 1 to T
year = 1
while year <= T:
    A = P * (1 + R / (100 * n)) ** (n * year)
    print("End of year", year, "-> A =", round(A, 2), "EGP")
    year = year + 1

CI = A - P
print()
print("Final amount      =", round(A, 2), "EGP")
print("Compound interest =", round(CI, 2), "EGP")

# ** means "to the power of".  round(x, 2) keeps 2 decimal places.
intro
