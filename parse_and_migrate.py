import os
import re
import glob
from datetime import datetime, timedelta
from html.parser import HTMLParser

class TableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows = []
        self.current_row = []
        self.current_cell = []
        self.in_cell = False

    def handle_starttag(self, tag, attrs):
        if tag in ('td', 'th'):
            self.in_cell = True
            self.current_cell = []
        elif tag == 'tr':
            self.current_row = []

    def handle_endtag(self, tag):
        if tag in ('td', 'th'):
            self.in_cell = False
            cell_text = "".join(self.current_cell).strip()
            self.current_row.append(cell_text)
        elif tag == 'tr':
            if self.current_row:
                self.rows.append(self.current_row)

    def handle_data(self, data):
        if self.in_cell:
            self.current_cell.append(data)

def parse_amount(text):
    if not text:
        return 0.0
    cleaned = text.replace('LKR', '').replace(',', '').strip()
    try:
        return float(cleaned)
    except ValueError:
        return 0.0

def process_file(filepath):
    # Parse date strictly from filename: e.g. "2026 3 16 - 2026 3 20.html"
    basename = os.path.basename(filepath)
    match = re.search(r'(\d{4})\s+(\d{1,2})\s+(\d{1,2})', basename)
    if not match:
        print(f"Could not find start date in filename for {filepath}")
        return []

    start_date = datetime.strptime(f"{match.group(1)}/{match.group(2)}/{match.group(3)}", "%Y/%m/%d").date()

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    parser = TableParser()
    parser.feed(content)
    rows = parser.rows

    day_map = {
        'monday': 0,
        'tuesday': 1,
        'wednesday': 2,
        'thursday': 3,
        'friday': 4,
        'saturday': 5,
        'sunday': 6
    }

    expenses = []
    current_day_offset = None

    for row in rows:
        col_day = row[1].strip().lower() if len(row) > 1 else ""
        
        # Stop at Total row
        if 'total' in col_day or any('total' in c.lower() for c in row[:5]):
            break

        if col_day in day_map:
            current_day_offset = day_map[col_day]

        if current_day_offset is None:
            continue

        item_date = start_date + timedelta(days=current_day_offset)

        # Col 1: Day
        # Col 2: 'Food'
        # Col 3: Sub-category ('Morning' / 'Lunch' / 'Dinner')
        # Col 4: Food Amount ('LKR 100.00')
        # Col 5: 'Transport'
        # Col 6: Sub-category ('Morning' / 'Evening')
        # Col 7: Transport Amount ('LKR 70.00')
        # Col 8: 'Water'
        # Col 9: Water Amount ('LKR 260.00')

        # Food
        if len(row) > 4:
            sub = row[3].strip() if len(row) > 3 else ""
            val = parse_amount(row[4])
            if val > 0:
                desc = f"{sub} Food" if sub else "Food"
                expenses.append({
                    'date': str(item_date),
                    'category': 'Food',
                    'sub_category': sub if sub else None,
                    'amount': val,
                    'description': desc
                })

        # Transport
        if len(row) > 7:
            sub = row[6].strip() if len(row) > 6 else ""
            val = parse_amount(row[7])
            if val > 0:
                desc = f"{sub} Transport" if sub else "Transport"
                expenses.append({
                    'date': str(item_date),
                    'category': 'Transport',
                    'sub_category': sub if sub else None,
                    'amount': val,
                    'description': desc
                })

        # Water
        if len(row) > 9:
            val = parse_amount(row[9])
            if val > 0:
                expenses.append({
                    'date': str(item_date),
                    'category': 'Water',
                    'sub_category': None,
                    'amount': val,
                    'description': 'Water'
                })

    return expenses

def main():
    files = sorted(glob.glob('data/*.html'))
    print(f"Found {len(files)} files to parse.")
    all_expenses = []
    for f in files:
        exs = process_file(f)
        all_expenses.extend(exs)
        print(f"Parsed {f}: {len(exs)} expenses")

    print(f"\n==========================================")
    print(f"Total expenses extracted: {len(all_expenses)}")
    total_amount = sum(e['amount'] for e in all_expenses)
    print(f"Total sum: LKR {total_amount:,.2f}")
    print(f"==========================================\n")

    # Generate SQL file
    with open('seed.sql', 'w', encoding='utf-8') as out:
        out.write("BEGIN;\n")
        out.write("TRUNCATE TABLE expenses;\n")
        for e in all_expenses:
            sub = f"'{e['sub_category']}'" if e['sub_category'] else "NULL"
            clean_desc = e['description'].replace("'", "''") if e['description'] else ""
            desc = f"'{clean_desc}'" if clean_desc else "NULL"
            out.write(f"INSERT INTO expenses (date, category, sub_category, amount, description) VALUES ('{e['date']}', '{e['category']}', {sub}, {e['amount']}, {desc});\n")
        out.write("COMMIT;\n")
    print("Wrote seed.sql successfully.")

if __name__ == '__main__':
    main()
