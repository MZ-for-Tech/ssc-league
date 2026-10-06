# Paired-source notes

- Used `6_tuples_and_dictionaries.md` and `9. Module 2_4_Collection Data Types_Prat2.pdf` together.
- The PDF character-frequency sample applies `.upper()` to the set source but counts against the unchanged mixed-case text, producing incorrect zeros. The paired Markdown fixes this by normalizing both sides. Questions explicitly diagnose and correct the defect.
- The PDF list-of-dictionaries exercise loops over `range(L)` without defining `L`; the Markdown uses direct iteration over entries. No question assumes the PDF snippet runs.
- The elasticity code compares signed values directly with 1. This labels negative Laptop elasticity (-1.2) as inelastic, despite magnitude above 1. Essay E08 makes this discrepancy explicit and asks for a magnitude-based correction.
- `tuple(set(rates))` does not guarantee a particular order; questions do not require one.
- Tuple keys must contain hashable values. The item about tuple keys uses only integers.
- PDF typos and inconsistent nested-person sample values are not used as keyed facts.
