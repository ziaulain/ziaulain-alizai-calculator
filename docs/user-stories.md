# User Stories with Acceptance Criteria

---

### User Story US-1: Hourly Project Fee & Net Calculation
- **Serves Job:** J-1
- **Role:** Solo Freelancer
- **Status:** Implemented

**Description:**
As a Solo Freelancer, I want to enter my estimated project hours, hourly rate, estimated overhead expenses, and expected tax withholding percentage, so that I can immediately see the total client quote, taxable income, and net earnings.

#### Acceptance Criteria (Given / When / Then):
1. **Standard Calculation:**
   - **Given** valid inputs: 40 hours, $75.00/hour, $300.00 overhead expenses, and 20% tax rate.
   - **When** the calculation runs.
   - **Then** the Gross Quote displays as `$3,000.00`, Net Pre-Tax Income displays as `$2,700.00`, Tax Withholding displays as `$540.00`, and Final Take-Home Pay displays as `$2,160.00`.
2. **Zero Billable Hours Guard:**
   - **Given** Billable Hours is set to `0` or left blank.
   - **When** the user attempts to view the fee calculation.
   - **Then** the input field is highlighted with an error message: *"Estimated hours must be greater than 0"*, and gross total is displayed as `$0.00`.
3. **Negative Input Prevention:**
   - **Given** any numeric field (hours, rate, expenses, tax).
   - **When** a negative value (e.g., `-10`) is entered.
   - **Then** the app rejects the input, highlights the field in red, and displays: *"Values cannot be negative"*.
4. **Overhead Exceeding Gross Revenue (Deficit State):**
   - **Given** calculated gross revenue is `$1,000.00` and overhead expenses are entered as `$1,200.00`.
   - **When** calculated.
   - **Then** a high-visibility warning banner displays: *"Expenses exceed project revenue by $200.00"*, taxable income is treated as `$0.00`, and take-home pay indicates a net deficit.

---

### User Story US-2: Agency Markup and Subcontractor Margin Calculation
- **Serves Job:** J-3
- **Role:** Small Agency Account Lead
- **Status:** Implemented

**Description:**
As a Small Agency Account Lead, I want to input pass-through subcontractor costs and specify an agency target profit margin percentage, so that I can calculate the final price to quote the client without manual spreadsheet formulas.

#### Acceptance Criteria (Given / When / Then):
1. **Margin Calculation:**
   - **Given** a subcontractor cost of `$4,000.00` and a target agency gross margin of `20%`.
   - **When** calculated.
   - **Then** the recommended client quote is calculated as `$5,000.00` (Markup formula: `Cost / (1 - Margin)`), displaying Agency Profit as `$1,000.00`.
2. **Boundary Margin Check:**
   - **Given** a target margin of `100%` or higher.
   - **When** entered.
   - **Then** the system displays: *"Agency margin must be less than 100%"* and disables calculation until corrected.
3. **Discount Exceeding Margin:**
   - **Given** an agency client discount rate of `25%` on an account with a `20%` target margin.
   - **When** applied.
   - **Then** a warning alert displays: *"Warning: Applied discount causes the project to operate below cost"*.
4. **Billing Mode Toggle (Fixed vs. Hourly):**
   - **Given** the Agency Lead selects "Hourly" mode.
   - **When** entering 40 hours and a $50.00/hour subcontractor rate with a target margin of 20%.
   - **Then** the baseline contractor cost is computed as `$2,000.00`, and the recommended client quote displays as `$2,500.00`.
   - **Given** the Agency Lead switches back to "Fixed" mode.
   - **When** entering a flat contractor cost of `$2,000.00`.
   - **Then** the final quote remains `$2,500.00`.
---

### User Story US-3: Multi-Currency & Precision Formatting
- **Serves Job:** J-1, J-3
- **Role:** Solo Freelancer, Small Agency Account Lead
- **Status:** Implemented

**Description:**
As a User, I want all currency outputs to adhere to standard two-decimal financial rounding (Banker's rounding / `Intl.NumberFormat`), so that I don't see fractional cent artifacts like `$123.456789`.

#### Acceptance Criteria (Given / When / Then):
1. **Decimal Precision:**
   - **Given** an hourly rate calculation resulting in `$1,333.33333...`.
   - **When** rendered.
   - **Then** the UI strictly displays formatted as `$1,333.33`.
2. **Large Number Boundary:**
   - **Given** values up to `$999,999,999.99`.
   - **When** entered and calculated.
   - **Then** digits are grouped with standard locale comma separators without visual truncation or scientific notation overflow.

---

### User Story US-4: PDF / CSV Proposal Export (Future Phase)
- **Serves Job:** J-3
- **Role:** Small Agency Account Lead
- **Status:** Not implemented

**Description:**
As a Small Agency Account Lead, I want to download a branded PDF summary breakdown of the calculated rate card and fees, so that I can attach it directly to client contracts and scope proposals.