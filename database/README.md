# AAMS Local Database & Extracted Styles

This directory contains the database schemas, styling scripts, and excel import style analysis code.

## File Contents
- `analyze_green_cells.js`: Analyzes style cell mappings.
- `analyze_green_cell_values.js`: Extracts actual green cell values from workbook sheet XML.
- `inspect_b61.js`: Cell level style lookup tool.
- `inspect_conditional_formatting.js`: Inspects sheets for conditional formatting definitions.
- `list_styles_used.js`: Details all styles defined in the sheets.
- `extracted_excel/`: Contains the raw XML extract of the Excel document for inspection.

## Conceptual SQL Schema
The data loaded into the local state is modeled inside `frontend/src/lib/state.js`, `frontend/src/lib/units.js`, and `frontend/src/lib/rentState.js`. The relational database schema would look like this:

### 1. `units` Table
Stores residential flats.
- `id` (INT, PK)
- `building_code` (VARCHAR) - e.g. "NT1", "NT2"
- `floor` (INT)
- `room_no` (VARCHAR) - Unique Room identifier (e.g. "NTA1-101")
- `is_guesthouse` (BOOLEAN) - True if the room represents a guest house
- `occupancy` (VARCHAR) - "Occupied" or "Vacant"
- `resident_name` (VARCHAR) - Name of the occupant
- `deptt` (VARCHAR) - Department name
- `occupant_count` (INT) - Number of people in room
- `furniture` (TEXT) - Comma-separated furniture list

### 2. `bookings` Table
Tracks guest stay bookings in guesthouse rooms.
- `id` (VARCHAR, PK)
- `room_no` (VARCHAR)
- `guest_name` (VARCHAR)
- `booking_date` (VARCHAR)
- `expected_check_in_date` (VARCHAR)
- `expected_check_out_date` (VARCHAR)
- `booking_status` (VARCHAR) - "Occupied", "Reserved", "Checked Out"

### 3. `rent_records` Table
Tracks monthly rent collections for residential occupants.
- `id` (VARCHAR, PK)
- `building_code` (VARCHAR)
- `room_no` (VARCHAR)
- `resident_name` (VARCHAR)
- `month` (INT)
- `year` (INT)
- `rent_amount` (DECIMAL)
- `carry_forward_amount` (DECIMAL)
- `amount_paid` (DECIMAL)
- `balance` (DECIMAL)
- `status` (VARCHAR) - "Paid", "Partial", "Unpaid"
- `notes` (TEXT)
- `paid_date` (VARCHAR)
