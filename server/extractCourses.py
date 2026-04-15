#!/usr/bin/env python3
"""
Extract course data from all branch PDFs and produce courses_data.json.
Handles various PDF formats across different departments.
"""

import pdfplumber
import json
import re
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

PDF_TO_DEPT = {
    "computer1.pdf": "CS",
    "civil.pdf": "CE",
    "chemical.pdf": "CHE",
    "electrical.pdf": "EE",
    "electronics .pdf": "ECE",
    "mechanical.pdf": "ME",
    "petroleum .pdf": "PTK",
}

CATEGORY_MAP = {
    "PC": "CORE", "DC": "CORE", "BS": "CORE", "ESA": "CORE",
    "PSI": "CORE", "AU": "CORE", "DE": "DE", "PE": "DE",
    "OE": "OE", "HM": "HM",
}

# Map text semester words to numbers
SEMESTER_WORDS = {
    "first": 1, "second": 2, "third": 3, "fourth": 4,
    "fifth": 5, "sixth": 6, "seventh": 7, "eighth": 8,
}


def detect_semester(text):
    """Detect semester number from text."""
    text_lower = text.lower()
    # Try "Semester X" pattern first
    m = re.search(r'semester\s*(\d+)', text_lower)
    if m:
        return int(m.group(1))
    # Try "THIRD SEMESTER" pattern
    for word, num in SEMESTER_WORDS.items():
        if word in text_lower and 'semester' in text_lower:
            return num
    # Try "Xth SEMESTER"
    m = re.search(r'(\d+)\s*(?:st|nd|rd|th)\s*sem', text_lower)
    if m:
        return int(m.group(1))
    return None


def parse_course_row(row, semester, dept):
    """Parse a single table row into a course dict."""
    if row is None or len(row) < 4:
        return None

    cells = [str(c).strip().replace('\n', ' ') if c else '' for c in row]
    
    # Skip header rows
    first_lower = cells[0].lower().strip()
    if first_lower in ('s.no.', 's.no', 'none', '', 'total'):
        return None
    if first_lower in ('l', 't', 'p'):
        return None
    if 'course' in first_lower and 'categ' in ' '.join(c.lower() for c in cells):
        return None

    # Find category
    category = None
    cat_idx = -1
    for i, cell in enumerate(cells[:5]):
        clean = cell.strip().upper()
        if clean in CATEGORY_MAP:
            category = clean
            cat_idx = i
            break

    if not category:
        return None

    # Find code - look for alphanumeric pattern
    code = None
    code_idx = -1
    for i, cell in enumerate(cells):
        clean = cell.strip()
        if re.match(r'^[A-Z]{2,5}\d{3,5}[A-Z]?$', clean):
            code = clean
            code_idx = i
            break
    
    # Skip if no valid code or placeholder codes
    if not code:
        return None
    if '----' in code or 'xx' in code.lower() or '*' in code:
        return None

    # Find title - typically the cell after code
    title = None
    if code_idx + 1 < len(cells):
        title = cells[code_idx + 1].strip()
    
    # If title looks like a number (L column), try different approach
    if title and (title.isdigit() or len(title) <= 1):
        # Title might be before code
        if code_idx > 0:
            for i in range(code_idx - 1, -1, -1):
                if cells[i].strip() and cells[i].strip().upper() not in CATEGORY_MAP and not cells[i].strip().isdigit():
                    title = cells[i].strip()
                    break
    
    if not title or title.isdigit() or len(title) < 3:
        return None

    # Find credits
    credits = None
    # Credits is usually after L, T, P columns
    # For most formats it's around index 7
    for pos in [7, 6, 5, 8]:
        if pos < len(cells):
            cell = cells[pos].strip()
            if cell and re.match(r'^\d+\.?\d*$', cell):
                val = float(cell)
                if 0 < val <= 8:
                    credits = val
                    break
    
    if credits is None:
        # Try to find a standalone number in the row that looks like credits
        # Skip first 3 columns and marks columns
        for i in range(4, min(9, len(cells))):
            cell = cells[i].strip()
            if cell and re.match(r'^\d+\.?\d*$', cell):
                val = float(cell)
                if 0.5 <= val <= 8:
                    credits = val
                    break

    if credits is None:
        credits = 3

    # Clean title
    title = re.sub(r'\s+', ' ', title).strip()
    # Remove trailing " -" or similar
    title = re.sub(r'\s*-\s*$', '', title)

    course_type = CATEGORY_MAP.get(category, "CORE")

    return {
        "code": code,
        "title": title,
        "type": course_type,
        "credits": int(credits) if credits == int(credits) else credits,
        "semester": semester,
        "dept": dept,
    }


def extract_from_pdf(filepath, dept):
    """Extract all courses from a single PDF file."""
    courses = []
    seen_codes = set()
    
    pdf = pdfplumber.open(filepath)
    
    for page_idx, page in enumerate(pdf.pages):
        text = page.extract_text() or ''
        tables = page.extract_tables()
        
        if not tables:
            continue

        # For each table, detect the semester from text BEFORE the table
        # We need to figure out which semester each table belongs to
        
        # Find ALL semester mentions in the page text with their positions
        page_text = text
        semester_positions = []
        
        for m in re.finditer(r'[Ss]emester\s*(\d+)', page_text):
            semester_positions.append((m.start(), int(m.group(1))))
        
        # Also check for word-based semesters
        for word, num in SEMESTER_WORDS.items():
            pattern = rf'{word}\s+semester'
            for m in re.finditer(pattern, page_text, re.IGNORECASE):
                semester_positions.append((m.start(), num))

        semester_positions.sort(key=lambda x: x[0])

        # If we have exactly 2 semesters on a page (common pattern), 
        # assign first half of tables to first semester, second half to second
        if len(semester_positions) >= 2 and len(tables) >= 2:
            mid = len(tables) // 2
            for t_idx, table in enumerate(tables):
                if t_idx < mid:
                    current_sem = semester_positions[0][1]
                else:
                    current_sem = semester_positions[1][1] if len(semester_positions) > 1 else semester_positions[0][1]
                
                for row in table:
                    course = parse_course_row(row, current_sem, dept)
                    if course and course['code'] not in seen_codes:
                        seen_codes.add(course['code'])
                        courses.append(course)
        elif len(semester_positions) >= 1:
            current_sem = semester_positions[0][1]
            for table in tables:
                for row in table:
                    course = parse_course_row(row, current_sem, dept)
                    if course and course['code'] not in seen_codes:
                        seen_codes.add(course['code'])
                        courses.append(course)
        # else: skip tables with no semester info

    pdf.close()
    return courses


def extract_de_list(filepath, dept):
    """Extract departmental elective lists from text (not always in tables)."""
    courses = []
    seen_codes = set()
    
    pdf = pdfplumber.open(filepath)
    for page in pdf.pages:
        text = page.extract_text() or ''
        
        if 'departmental elective' in text.lower() or 'elective courses' in text.lower():
            # Try tables first
            tables = page.extract_tables()
            if tables:
                for table in tables:
                    for row in table:
                        if row is None or len(row) < 3:
                            continue
                        cells = [str(c).strip() if c else '' for c in row]
                        # Look for DE course patterns in table rows
                        for i, cell in enumerate(cells):
                            clean = cell.strip()
                            if re.match(r'^[A-Z]{2,5}\d{3,5}$', clean):
                                # Found a code, get title
                                title = ''
                                if i + 1 < len(cells) and cells[i+1].strip():
                                    title = cells[i+1].strip()
                                elif i > 0 and cells[i-1].strip() and not cells[i-1].strip().isdigit():
                                    title = cells[i-1].strip()
                                
                                if title and clean not in seen_codes and len(title) > 3:
                                    seen_codes.add(clean)
                                    courses.append({
                                        "code": clean,
                                        "title": re.sub(r'\s+', ' ', title),
                                        "type": "DE",
                                        "credits": 4,
                                        "semester": 7,
                                        "dept": dept,
                                    })
            
            # Also try text-based extraction
            lines = text.split('\n')
            for line in lines:
                m = re.match(r'\s*\d+\s+(?:DE\s+)?([A-Z]{2,5}\d{3,5})\s+(.+?)(?:\s+\d+\s+\d+\s+|\s*$)', line)
                if m:
                    code = m.group(1).strip()
                    title = m.group(2).strip()
                    title = re.sub(r'\s+\d+\s*$', '', title)
                    if code not in seen_codes and len(title) > 3:
                        seen_codes.add(code)
                        courses.append({
                            "code": code,
                            "title": title,
                            "type": "DE",
                            "credits": 4,
                            "semester": 7,
                            "dept": dept,
                        })
    
    pdf.close()
    return courses


def handle_petroleum_special(filepath, dept):
    """Special handler for petroleum PDF which uses text-based semester headers."""
    courses = []
    seen_codes = set()
    
    pdf = pdfplumber.open(filepath)
    current_semester = None
    
    for page in pdf.pages:
        text = page.extract_text() or ''
        lines = text.split('\n')
        
        for line in lines:
            # Check for semester changes
            sem = detect_semester(line)
            if sem:
                current_semester = sem
                continue
            
            if current_semester is None:
                continue
            
            # Try to parse course lines
            # Pattern: Category Code Title L T P Credits ...
            m = re.match(
                r'\s*(DC|PC|BS|ESA|HM|DE|OE|PE|AU|PSI)\s+([A-Z]{2,5}\d{3,5})\s+(.+?)(?:\s+(\d+)\s+(\d+)\s+[-\d]+\s+(\d+\.?\d*)|\s+[-\d]+\s+(\d+)\s+(\d+\.?\d*))',
                line
            )
            if m:
                category = m.group(1)
                code = m.group(2)
                title = m.group(3).strip()
                # Clean title of trailing numbers
                title = re.sub(r'\s+\d+\s+\d+\s*$', '', title)
                title = re.sub(r'\s+[-]\s*$', '', title)
                
                credits_str = m.group(6) or m.group(8) or m.group(4)
                try:
                    credits = float(credits_str) if credits_str else 4
                except:
                    credits = 4
                if credits > 8:
                    credits = 4
                
                if code not in seen_codes:
                    seen_codes.add(code)
                    courses.append({
                        "code": code,
                        "title": title,
                        "type": CATEGORY_MAP.get(category, "CORE"),
                        "credits": int(credits) if credits == int(credits) else credits,
                        "semester": current_semester,
                        "dept": dept,
                    })
    
    pdf.close()
    return courses


def main():
    all_courses = []
    
    for pdf_name, dept in PDF_TO_DEPT.items():
        filepath = os.path.join(DATA_DIR, pdf_name)
        if not os.path.exists(filepath):
            print(f"⚠️  Missing: {filepath}")
            continue
        
        print(f"\n📄 Processing {pdf_name} → {dept}")
        
        if dept == "PTK":
            # Petroleum uses special text-based format
            courses = handle_petroleum_special(filepath, dept)
        else:
            courses = extract_from_pdf(filepath, dept)
        
        # Also extract DE lists
        de_courses = extract_de_list(filepath, dept)
        existing_codes = {c['code'] for c in courses}
        for dc in de_courses:
            if dc['code'] not in existing_codes:
                courses.append(dc)
        
        print(f"   Found {len(courses)} courses")
        
        # Group by semester for display
        by_sem = {}
        for c in courses:
            by_sem.setdefault(c['semester'], []).append(c)
        
        for sem in sorted(by_sem.keys()):
            print(f"   Sem {sem}: {len(by_sem[sem])} courses")
            for c in by_sem[sem]:
                print(f"      [{c['type']}] {c['code']} - {c['title']} ({c['credits']} cr)")
        
        all_courses.extend(courses)
    
    # Write JSON
    output_path = os.path.join(os.path.dirname(__file__), "courses_data.json")
    with open(output_path, 'w') as f:
        json.dump(all_courses, f, indent=2)
    
    print(f"\n✅ Total: {len(all_courses)} courses")
    print(f"📝 Saved to {output_path}")
    
    # Summary
    dept_summary = {}
    for c in all_courses:
        dept_summary.setdefault(c['dept'], set()).add(c['semester'])
    for d in sorted(dept_summary.keys()):
        sems = sorted(dept_summary[d])
        count = sum(1 for c in all_courses if c['dept'] == d)
        print(f"  {d}: {count} courses across semesters {sems}")


if __name__ == "__main__":
    main()
