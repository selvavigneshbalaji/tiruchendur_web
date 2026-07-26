# Apps Script setup for hotel data

Your app expects a payload with two top-level sections:
- `hotels`: the hotel list rows
- `availability`: an object keyed by hotel ids such as `hotel1`, `hotel2`, `hotel3`

## Recommended Apps Script

1. Open Google Apps Script and create a new project.
2. Paste the following script:

```javascript
function doGet() {
  const hotelsSheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getSheetByName('Hotels');
  const hotelsValues = hotelsSheet.getDataRange().getValues();

  if (!hotelsValues.length) {
    return ContentService.createTextOutput(JSON.stringify({ hotels: [], availability: {} })).setMimeType(ContentService.MimeType.JSON);
  }

  const hotelHeaders = hotelsValues[0];
  const hotelRows = hotelsValues.slice(1).filter((row) => row.some((cell) => cell !== ''));

  const hotels = hotelRows.map((row) => {
    const item = {};
    hotelHeaders.forEach((header, index) => {
      item[header] = row[index];
    });
    return item;
  });

  const availability = {};

  // Example: each hotel has its own sheet or data block named hotel1, hotel2, hotel3
  // Each entry should contain rows like { dates, availability, price }
  ['hotel1', 'hotel2', 'hotel3'].forEach((key) => {
    const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getSheetByName(key);
    if (!sheet) return;

    const values = sheet.getDataRange().getValues();
    if (!values.length) return;

    const headers = values[0];
    const rows = values.slice(1).filter((row) => row.some((cell) => cell !== ''));

    availability[key] = rows.map((row) => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index];
      });
      return item;
    });
  });

  return ContentService.createTextOutput(JSON.stringify({ hotels, availability })).setMimeType(ContentService.MimeType.JSON);
}
```

3. Deploy as a web app:
   - Execute as: Me
   - Who has access: Anyone
4. Copy the web app URL.
5. Put it in .env.local as:

```env
APPS_SCRIPT_URL=https://script.google.com/macros/s/your-deployment-id/exec
```

6. Restart the app.

## Sheet structure

### Hotels sheet
Use these columns:
- id
- name
- area
- price
- oldPrice
- rating
- reviews
- tags
- distance
- category
- superhost
- maxGuests
- includedGuests (guests covered by the base nightly price)
- extraGuestPrice (nightly amount charged for every guest above includedGuests)
- description
- ownerName
- ownerContact
- image
- images (optional: extra image paths/URLs separated by commas, for example `/images/properties/2/room-1.jpg,/images/properties/2/room-2.jpg`)
- rule1
- rule2

### Availability sheets
Create sheets named `hotel1`, `hotel2`, `hotel3` (or match the hotel ids you use).
Each sheet should contain rows like:

```text
dates,availability,price
2026-07-22,yes,3000
2026-07-23,yes,3500
2026-07-24,yes,3000
```

The app will read those rows and attach them to the matching hotel.
