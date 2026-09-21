with open('parse_and_migrate.py') as f:
    code = f.read()

import glob
from parse_and_migrate import process_file

files = sorted(glob.glob('data/*.html'))
all_expenses = []
for f in files:
    all_expenses.extend(process_file(f))

# Write a CSV for COPY or a single multi-row INSERT statement
with open('bulk_insert.sql', 'w', encoding='utf-8') as out:
    out.write("BEGIN;\nTRUNCATE TABLE expenses;\n")
    out.write("INSERT INTO expenses (date, category, sub_category, amount, description) VALUES\n")
    lines = []
    for e in all_expenses:
        sub = f"'{e['sub_category']}'" if e['sub_category'] else "NULL"
        clean_desc = e['description'].replace("'", "''") if e['description'] else ""
        desc = f"'{clean_desc}'" if clean_desc else "NULL"
        lines.append(f"('{e['date']}', '{e['category']}', {sub}, {e['amount']}, {desc})")
    out.write(",\n".join(lines))
    out.write(";\nCOMMIT;\n")
print("Generated bulk_insert.sql with single transaction and multi-row INSERT.")
