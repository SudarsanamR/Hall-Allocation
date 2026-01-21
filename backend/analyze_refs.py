
import pdfplumber
import pandas as pd
import os

def analyze_files():
    base_path = r"c:\Users\sudar\Downloads\Projects\University Exam Seat Allotment\antigravity 3.0\Reference"
    
    # Analyze PDF
    pdf_path = os.path.join(base_path, "19.11.25.pdf")
    print(f"--- Analyzing PDF: {pdf_path} ---")
    try:
        with pdfplumber.open(pdf_path) as pdf:
            page = pdf.pages[0]
            text = page.extract_text()
            print("First Page Text Preview:\n")
            print(text[:1000])  # Print first 1000 chars
            
            print("\nTable Extraction Preview:")
            tables = page.extract_tables()
            if tables:
                for i, row in enumerate(tables[0][:5]):
                    print(row)
            else:
                print("No tables found using default extraction.")
    except Exception as e:
        print(f"Error reading PDF: {e}")

    # Analyze Excel
    excel_path = os.path.join(base_path, "19.11.25 FN.xlsx")
    print(f"\n--- Analyzing Excel: {excel_path} ---")
    try:
        df = pd.read_excel(excel_path)
        print("Columns:", df.columns.tolist())
        print("\nFirst 5 rows:")
        print(df.head())
    except Exception as e:
        print(f"Error reading Excel: {e}")

if __name__ == "__main__":
    analyze_files()
