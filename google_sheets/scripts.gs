/**
 * Author: Tomáš Kurtin (xkurti03@stud.fit.vut.cz)
 * Date: 5. May 2026
 * Description: Google Apps Script, that saves data from POST into spreadsheet
 */

function doPost(e) {
  try {
    const data = e.parameter;

    const test_name = data.test_name || "default";

    /*
      Replace the spreadsheet ID with your own Google Sheet ID.

      docs.google.com/spredsheets/d/xxxx/edit?...
      where xxx is the Google sheet ID
    */
    const spreadsheet = SpreadsheetApp.openById(
      "17vIHSeYVnqFUAFjhVH-FnuhcBRv37pkTICtCwJYnCEk",
    );

    let sheet = spreadsheet.getSheetByName(test_name);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(test_name);

      sheet.appendRow([
        "timestamp",
        "session_id",
        "response_time_ms",
        "pair_id",
        "image_name",
        "left_image",
        "left_method",
        "right_image",
        "right_method",
        "color_count",
        "scale",
        "is_on_mobile",
        "is_pixel_artist",
        "choice",
        "winner_loser",
      ]);
    }

    sheet.appendRow([
      data.timestamp,
      data.session_id,
      data.response_time_ms,
      data.pair_id,
      data.image_name,
      data.left_image,
      data.left_method,
      data.right_image,
      data.right_method,
      data.color_count,
      data.scale,
      data.is_on_mobile,
      data.is_pixel_artist,
      data.choice,
      data.winner_loser,
    ]);

    SpreadsheetApp.flush();

    return ContentService.createTextOutput("OK");
  } catch (error) {
    Logger.log(error);

    return ContentService.createTextOutput(error.toString());
  }
}
