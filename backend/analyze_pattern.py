
import pandas as pd
import os

file_path = "../Reference/19.11.25 FN.xlsx"

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit()

# Read the excel
# Usually these have multiple sheets or specific layouts.
# Let's read the first sheet and print the first 20 rows/cols to see the layout.

try:
    df = pd.read_excel(file_path, header=None)
    # Fill NaN with empty string for cleaner print
    df = df.fillna("")
    print("Rows 19 to 35 (Cols 0-9):")
    subset = df.iloc[19:35, 0:10]
    print(subset.to_string())
    
except Exception as e:
    print(f"Error reading excel: {e}")
