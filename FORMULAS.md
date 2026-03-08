# 📐 Formula Reference Guide

Complete list of all supported formulas in Trademarkia Spreadsheet.

---

## Basic Arithmetic

### Addition `+`
```excel
=A1+B1
=A1+10
```

### Subtraction `-`
```excel
=A1-B1
=A1-10
```

### Multiplication `*`
```excel
=A1*B1
=A1*10
```

### Division `/`
```excel
=A1/B1
=A1/10
```

### Comparison Operators
```excel
=A1>B1   // Greater than
=A1<B1   // Less than
=A1=B1   // Equal to
```

---

## Aggregate Functions

### SUM
Returns the sum of all values in a range.
```excel
=SUM(A1:A10)
=SUM(A1, B1, C1)
=SUM(A1:A5, 10, B2)
```

### AVERAGE
Returns the arithmetic mean of values.
```excel
=AVERAGE(A1:A10)
=AVERAGE(A1, B1, C1)
```

### COUNT
Counts the number of numeric values in a range.
```excel
=COUNT(A1:A10)
=COUNT(A1, B1, "text")  // Returns 2
```

### MAX
Returns the largest value.
```excel
=MAX(A1:A10)
=MAX(A1, B1, C1)
```

### MIN
Returns the smallest value.
```excel
=MIN(A1:A10)
=MIN(A1, B1, C1)
```

---

## Logical Functions

### IF
Conditional logic based on a test.
```excel
=IF(A1>10, "Yes", "No")
=IF(A1=B1, "Match", "No match")
=IF(SUM(A1:A10)>100, "Over budget", "Within budget")
```

**Syntax**: `=IF(condition, value_if_true, value_if_false)`

### TRUE
Returns boolean true.
```excel
=TRUE()
```

### FALSE
Returns boolean false.
```excel
=FALSE()
```

---

## Text Functions

### CONCATENATE
Joins multiple text strings into one.
```excel
=CONCATENATE(A1, " ", B1)
=CONCATENATE("Hello", " ", "World")
```

### LEN
Returns the length of a text string.
```excel
=LEN(A1)
=LEN("Hello")  // Returns 5
```

### TRIM
Removes leading and trailing whitespace.
```excel
=TRIM(A1)
=TRIM("  Hello  ")  // Returns "Hello"
```

### UPPER
Converts text to uppercase.
```excel
=UPPER(A1)
=UPPER("hello")  // Returns "HELLO"
```

### LOWER
Converts text to lowercase.
```excel
=LOWER(A1)
=LOWER("HELLO")  // Returns "hello"
```

### PROPER
Capitalizes the first letter of each word.
```excel
=PROPER(A1)
=PROPER("john doe")  // Returns "John Doe"
```

### LEFT
Extracts characters from the left side of text.
```excel
=LEFT(A1, 3)
=LEFT("Hello", 2)  // Returns "He"
```

### RIGHT
Extracts characters from the right side of text.
```excel
=RIGHT(A1, 3)
=RIGHT("Hello", 2)  // Returns "lo"
```

### MID
Extracts characters from the middle of text.
```excel
=MID(A1, start_position, num_chars)
=MID("Hello World", 7, 5)  // Returns "World"
```

---

## Math Functions

### ROUND
Rounds a number to specified decimal places.
```excel
=ROUND(A1, 2)
=ROUND(3.14159, 2)  // Returns 3.14
=ROUND(123.456, 0)  // Returns 123
```

### ABS
Returns the absolute value (positive).
```excel
=ABS(A1)
=ABS(-10)  // Returns 10
=ABS(10)   // Returns 10
```

### SQRT
Returns the square root.
```excel
=SQRT(A1)
=SQRT(16)  // Returns 4
=SQRT(2)   // Returns 1.414...
```

### POWER
Raises a number to a power.
```excel
=POWER(base, exponent)
=POWER(2, 3)  // Returns 8
=POWER(A1, 2)
```

### PI
Returns the value of π (pi).
```excel
=PI()  // Returns 3.141592653589793
```

---

## Date & Time Functions

### TODAY
Returns the current date.
```excel
=TODAY()  // Returns "12/25/2024" (format may vary)
```

### NOW
Returns the current date and time.
```excel
=NOW()  // Returns "12/25/2024 14:30:00" (format may vary)
```

---

## Cell References

### Single Cell
```excel
=A1
=B5
=Z100
```

### Range of Cells
```excel
=A1:A10    // Column A, rows 1-10
=A1:Z1     // Row 1, columns A-Z
=A1:Z100   // Rectangle from A1 to Z100
```

### In Formulas
```excel
=SUM(A1:A10)
=AVERAGE(B1:B20)
=MAX(C1:C100)
```

---

## Examples by Use Case

### Budget Tracking
```excel
=SUM(B2:B100)              // Total expenses
=B2-C2                     // Remaining budget
=IF(B2>1000, "Over", "OK") // Budget check
```

### Grade Calculator
```excel
=AVERAGE(B2:F2)            // Average grade
=MAX(B2:F2)                // Highest score
=MIN(B2:F2)                // Lowest score
=IF(G2>=60, "Pass", "Fail") // Pass/fail
```

### Sales Report
```excel
=B2*C2                     // Revenue (price × quantity)
=SUM(D2:D100)              // Total revenue
=D2-E2                     // Profit (revenue - cost)
=(D2-E2)/D2                // Profit margin
```

### Text Processing
```excel
=CONCATENATE(A2, " ", B2)  // Full name
=UPPER(A2)                 // Uppercase
=LEN(A2)                   // Character count
=LEFT(A2, 3)               // First 3 chars
```

### Data Analysis
```excel
=COUNT(A1:A100)            // Count numbers
=AVERAGE(A1:A100)          // Average
=STDEV(A1:A100)            // Standard deviation (not implemented yet)
```

---

## Error Types

### #CIRC! - Circular Reference
Formula refers to itself directly or indirectly.
```excel
=A1+A1  // If entered in A1
```

### #REF! - Invalid Reference
Refers to a non-existent cell.
```excel
=ZZ999+1  // Invalid cell reference
```

### #DIV/0! - Division by Zero
```excel
=A1/0
=A1/B1  // If B1 is 0
```

### #NAME? - Unknown Function
```excel
=UNKNOWN_FUNC(A1)
=SUMM(A1:A10)  // Typo: should be SUM
```

### #VALUE! - Wrong Type
```excel
=LEN(123)      // Expects text
=LEFT(123, 2)  // Expects text
```

---

## Tips & Best Practices

### 1. Use Ranges for Clarity
```excel
// Good
=SUM(A1:A10)

// Avoid
=A1+A2+A3+A4+A5+A6+A7+A8+A9+A10
```

### 2. Combine Functions
```excel
=IF(SUM(A1:A10)>100, "High", "Low")
=CONCATENATE(UPPER(A1), " ", B1)
```

### 3. Reference Other Sheets (Future)
```excel
=Sheet1!A1
=SUM(Sheet1!A1:Sheet1!A10)
```

### 4. Nest Functions
```excel
=ROUND(AVERAGE(A1:A10), 2)
=IF(LEN(A1)>10, LEFT(A1, 10), A1)
```

### 5. Use Absolute References (Future Feature)
```excel
=$A$1  // Always refers to A1
=A$1   // Row fixed, column relative
=$A1   // Column fixed, row relative
```

---

## Keyboard Shortcuts for Formulas

| Action | Shortcut |
|--------|----------|
| Enter formula | Type `=` then formula |
| Edit formula | Double-click cell or press F2 |
| Cancel editing | Escape |
| Confirm formula | Enter |
| View formula bar | Click cell, see formula bar |

---

## Limitations

Current implementation:
- ✅ Up to 2,600 cells (100×26)
- ✅ Nested formulas supported
- ✅ Cell references in formulas
- ✅ Range references (A1:A10)
- ❌ Cross-sheet references (future)
- ❌ Array formulas (future)
- ❌ Named ranges (future)
- ❌ External data connections (future)

---

## Performance Notes

- Formulas are evaluated with dependency graph
- Circular references detected and marked with #CIRC!
- Changes trigger re-evaluation of dependent cells only
- Debounced at 400ms for batch updates

---

**Happy Calculating! 🧮**
