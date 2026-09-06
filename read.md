# Agentic Build Specification: Professional Document Generator

## 1. Project Context
**Lead Developer:** Fletcheru
**Architecture:** Pure client-side application. No backend. No database.
**Objective:** Build a professional document generator with a split-pane layout (form inputs on the left, live rendering preview on the right).

## 2. Technical Stack & Dependencies
* **Structure:** HTML5
* **Styling:** CSS3 (CSS Grid and Flexbox for exact layout alignment).
* **Logic:** Vanilla JavaScript (ES6+). No frameworks.
* **Export Engine:** `html2pdf.js` (Import via CDN).
* **Icons:** Inline SVGs or minimal CDN library.

## 3. Core Modules

### Module 1: Student Documents
**Reference:** `image_03d59f.jpg`
* **Form Inputs:** First Name, Last Name, School Name, Date (Current Enrollment), Student ID, School Logo (File Upload), Document Type Toggle (Class Schedule vs. Tuition Receipt), Schedule Textarea.
* **Logic:** 
  * The schedule textarea must parse line breaks. Each line maps to a dynamic table row (`<tr>`) containing 'Day' and 'Time'.
  * The toggle switches the live preview layout between a formatted schedule table and a formatted receipt layout.

### Module 4: Teacher Documents
**Reference:** `image_03d585.jpg`
* **Form Inputs:** Issue Date, School Name, School Address, School Email, School Phone, Employee Full Name, Pronoun (Dropdown), Position/Title, Employment Type (Dropdown), Start Date, Responsibilities (Textarea), Upload Logo, Upload Principal Signature.
* **Logic:**
  * File uploads must use the `FileReader` API to instantly render Base64 images into the live preview DOM. No server uploads.

## 4. Professional Constraints & Error Handling
* **State Persistence:** Bind all form inputs to `localStorage`. If the browser reloads, populate the fields instantly.
* **PDF Export:** When clicking "Print / Save as PDF", invoke `html2pdf.js`. Target only the live preview container. Apply an `.opt()` configuration ensuring a standard letter/A4 format, high resolution (scale: 2), and correct margin offsets.
* **Input Validation:** Ensure required fields are populated before allowing PDF export. Highlight missing fields in red.
* **Print Media Queries:** Write `@media print` rules to hide the input panels and navigation, forcing only the generated document to render if the user uses the native browser print function.

## 5. Execution Instructions for the AI Agent
1. **Scaffold:** Create `index.html`, `style.css`, and `app.js`.
2. **Layout:** Build the responsive two-column grid.
3. **Data Binding:** Write a state management function that listens to 'input' events on all form fields and immediately updates their corresponding `innerText` or `src` attributes in the right panel.
4. **Export Logic:** Implement the `html2pdf` function attached to the primary action button.
5. **Final Polish:** Ensure padding, typography, and borders strictly match the provided reference images. Write complete, ready-to-run code. No placeholders.