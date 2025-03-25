let bankCSV = "";
let stripeCSV = "";
//
function getNextLetter(str) {
  let carry = 1;
  // Convert the string into an array of characters for easier manipulation.
  const letters = str.split('');

  // Process the array from right to left.
  for (let i = letters.length - 1; i >= 0; i--) {
    if (carry === 0) break;
    const charCode = letters[i].charCodeAt(0);
    if (charCode === 90) { // 'Z'
      letters[i] = 'A';
      carry = 1;
    } else {
      letters[i] = String.fromCharCode(charCode + 1);
      carry = 0;
    }
  }

  // If we still have a carry after processing all digits,
  // it means we had a string of all Z's. Prepend an 'A'.
  if (carry === 1) {
    letters.unshift('A');
  }

  return letters.join('');
}

// Function to check if both CSVs and the month are provided
function updateDownloadButtonState() {
  const month = document.getElementById('monthInput').value.trim();
  const downloadBankBtn = document.getElementById('downloadBankBtn');
  const downloadStripeBtn = document.getElementById('downloadStripeBtn');
  const downloadCombinedFinalizedBtn = document.getElementById('downloadCombinedFinalizedBtn');
  
  if (bankCSV && month !== "") {
    downloadBankBtn.disabled = false;
  } else {
    downloadBankBtn.disabled = true;
  }

  if (stripeCSV && month !== "") {
    downloadStripeBtn.disabled = false;
  } else {
    downloadStripeBtn.disabled = true;
  }

    if (stripeCSV && bankCSV && month !== "") {
    downloadCombinedFinalizedBtn.disabled = false;
  } else {
    downloadCombinedFinalizedBtn.disabled = true;
  }
}

// Trigger bank statement file input
document.getElementById('uploadBankBtn').addEventListener('click', () => {
  document.getElementById('bankFileInput').click();
});

// Trigger stripe data file input
document.getElementById('uploadStripeBtn').addEventListener('click', () => {
  document.getElementById('stripeFileInput').click();
});

// Process bank statement CSV file
document.getElementById('bankFileInput').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    document.getElementById('bankFileName').textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      bankCSV = e.target.result;
      updateDownloadButtonState();
    };
    reader.readAsText(file);
  }
});

// Process stripe CSV file
document.getElementById('stripeFileInput').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    document.getElementById('stripeFileName').textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      stripeCSV = e.target.result;
      updateDownloadButtonState();
    };
    reader.readAsText(file);
  }
});

// Listen for month input changes
document.getElementById('monthInput').addEventListener('input', updateDownloadButtonState);

// Download the combined CSV file
document.getElementById('downloadBankBtn').addEventListener('click', () => {
  const month = document.getElementById('monthInput').value.trim();
  console.log('stripeCSV', stripeCSV)
  const modifiedCSV = modifyBankStatement(bankCSV);
  
  // Create a blob from the CSV string
  const blob = new Blob([modifiedCSV], { type: 'text/csv;charset=utf-8;' });
  
  // Create a temporary download link and trigger it
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", month + "-bank.csv");
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

document.getElementById('downloadStripeBtn').addEventListener('click', () => {
  const month = document.getElementById('monthInput').value.trim();
  const modifiedCSV = modifyStripeStatement(stripeCSV);
  
  // Create a blob from the CSV string
  const blob = new Blob([modifiedCSV], { type: 'text/csv;charset=utf-8;' });
  
  // Create a temporary download link and trigger it
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", month + "-stripe.csv");
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

document.getElementById('downloadCombinedFinalizedBtn').addEventListener('click', () => {
  const month = document.getElementById('monthInput').value.trim();
  const modifiedStripeCSV = modifyStripeStatement(stripeCSV);
  const modifiedBankCSV = modifyBankStatement(bankCSV);
  const combinedAndFinalizedCSV = combineAndFinalize(modifiedStripeCSV, modifiedBankCSV);
  
  // Create a blob from the CSV string
  const blob = new Blob([combinedAndFinalizedCSV], { type: 'text/csv;charset=utf-8;' });
  
  // Create a temporary download link and trigger it
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", month + "-final.csv");
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

function combineAndFinalize(stripeCSV, bankCSV) {
  const combinedCSV = stripeCSV + '\n' + bankCSV;

  const modifyingFunctions = [
    addBankStatementIDToStripeLineItems,
    updateColumnDFromColumnF,
    setColumnRFromColumnE,
    setColumnSFromColumnE,
  ];

  let result = combinedCSV;

  modifyingFunctions.forEach(func => {
    result = func(result);
  })

  return result;
}

function modifyBankStatement(csvString) {
  const modifyingFunctions = [
    removeEmptyRows,
    removeFirstColumn,
    removeLastColumn,
    addEmptyColumnsAtStart,
    addYearColumn,
    addMonthYearColumn,
    addEmptyColumnsBetweenEAndF,
    swapColumnsLAndM,
    copyColumnMToK,
    fillColumnKFromL,
    addEmptyColumnsAtEnd,
    addBankStatementIDs,
    // addFormattedDateColumn,
    // addMonthYearAtEnd,
  ];

  let result = csvString;

  modifyingFunctions.forEach(func => {
    result = func(result);
  })

  return result;
}

function modifyStripeStatement(csvString) {
  const modifyingFunctions = [
    removeEmptyRows,
    removeRowsWhereFIsFalse,
    insertDifferenceColumn,
    convertDatesToDDMMMYYYY,
    addEmptyColumnsAtStart,
    copyColumnCToH,
    copyColumnDToE,
    replaceColumnCWithYear,
    replaceColumnDWithMonthYear,
    copyColumnOToKAndL,
    copyColumnMToJ,
    copyColumnAPToO,
    copyColumnAEToQ,
    deleteColumnsAfterQ,
    addTwoEmptyColumnsAtEnd,
    transformColumnO,
    transformColumnQ,
    addColumnHeaders,
    deleteSecondRow,
    clearColumnsButKeepHeaders,
  ];

  let result = csvString;

  modifyingFunctions.forEach(func => {
    result = func(result);
  })

  return result;
}

//csv modification functions
function setColumnSFromColumnE(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    const monthMap = {
        Jan: "January", Feb: "February", Mar: "March", Apr: "April",
        May: "May", Jun: "June", Jul: "July", Aug: "August",
        Sep: "September", Oct: "October", Nov: "November", Dec: "December"
    };

    for (let i = 1; i < rows.length; i++) { // Skip header
        const eVal = rows[i][4]; // Column E (index 4), format: DD-MMM-YYYY
        const [day, monthAbbr, year] = eVal.split("-");
        const fullMonth = monthMap[monthAbbr];
        if (fullMonth && year) {
            rows[i][18] = `${fullMonth} ${year}`; // Set Column S (index 18)
        }
    }

    return rows.map(row => row.join(",")).join("\n");
}

function setColumnRFromColumnE(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    const monthMap = {
        Jan: "01", Feb: "02", Mar: "03", Apr: "04",
        May: "05", Jun: "06", Jul: "07", Aug: "08",
        Sep: "09", Oct: "10", Nov: "11", Dec: "12"
    };

    for (let i = 1; i < rows.length; i++) { // Skip header row
        const eVal = rows[i][4]; // Column E (index 4), expected format: DD-MMM-YYYY
        const [day, monthAbbr, year] = eVal.split("-");
        const month = monthMap[monthAbbr];
        if (day && month && year) {
            const formatted = `${year}-${month}-${day.padStart(2, "0")}`;
            rows[i][17] = formatted; // Set Column R (index 17)
        }
    }

    return rows.map(row => row.join(",")).join("\n");
}

function updateColumnDFromColumnF(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    const monthMap = {
        Jan: "January", Feb: "February", Mar: "March", Apr: "April",
        May: "May", Jun: "June", Jul: "July", Aug: "August",
        Sep: "September", Oct: "October", Nov: "November", Dec: "December"
    };

    for (let i = 1; i < rows.length; i++) { // Skip header row
        const fVal = rows[i][5]; // Column F (index 5)
        if (fVal && fVal.trim() !== "") {
            const parts = fVal.split("-"); // Expect format: DD-MMM-YYYY-A
            if (parts.length >= 3) {
                const monthAbbr = parts[1];
                const year = parts[2];
                const fullMonth = monthMap[monthAbbr];
                if (fullMonth) {
                    rows[i][3] = `${fullMonth} ${year}`; // Set Column D (index 3)
                }
            }
        }
    }

    return rows.map(row => row.join(",")).join("\n");
}

function addBankStatementIDs(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    for (let i = rows.length-1; i >= 0; i--) {
        let date = rows[i][4]; // Column O (15th column, index 14)
        let bankStatementID;

        const previousIDLettersMatch = (rows[i + 1] && rows[i + 1][5] && rows[i + 1][5].match(/\d\d\d\d-([A-z]+)$/)) || '';
        if (rows[i + 1] && rows[i + 1][4] && (rows[i + 1][4] === rows[i][4]) && previousIDLettersMatch[1]) {
          const nextLetter = getNextLetter(previousIDLettersMatch[1]);
          rows[i][5] = date + '-' + nextLetter;
        } else {
          rows[i][5] = date + '-' + 'A';
        }
    }

    return rows.map(row => row.join(",")).join("\n");
}

function strip(number) {
    return Number(parseFloat(number).toPrecision(12));
}

function findBankStripeDepositStripeLineItems (bankStringDepositTotal, stripeLineItems, sLIRowIndex) {
  let bankStripeDepositStripeLineItemIDs = [];

  let tempSLIRowIndex = sLIRowIndex
  let stripeOffsetErrorIndex = null;
  let offSetAmount = null;

  while (bankStripeDepositStripeLineItemIDs.length === 0 && tempSLIRowIndex <= stripeLineItems.length) {
    let sLISum = 0;

    let lIndex = tempSLIRowIndex;
    while (sLISum < bankStringDepositTotal && strip(sLISum) !== strip(bankStringDepositTotal)) {
      sLISum += Number(stripeLineItems[lIndex][10]);
      sLISum = strip(sLISum);

      if (sLISum === (bankStringDepositTotal + 0.8) || sLISum === (bankStringDepositTotal + 0.4)) {
        if (stripeOffsetErrorIndex !== null) {
          offSetAmount = strip(bankStringDepositTotal - sLISum)
          sLISum = bankStringDepositTotal;
          stripeOffsetErrorIndex = null;          
        } else {
          stripeOffsetErrorIndex = lIndex;
        }
      }

      bankStripeDepositStripeLineItemIDs.push(stripeLineItems[lIndex][7]);

      if ((lIndex + 1 === stripeLineItems.length) && stripeOffsetErrorIndex !== null) {
        lIndex = sLIRowIndex;
        sLISum = 0;
        bankStripeDepositStripeLineItemIDs = [];
      } else {
        lIndex++;
      }
    }

    if (strip(sLISum) === strip(bankStringDepositTotal)) {
      sLISum = bankStringDepositTotal;
    }


    if (sLISum !== bankStringDepositTotal) {
      bankStripeDepositStripeLineItemIDs = [];
      tempSLIRowIndex += 1;
    } else {
      tempSLIRowIndex = lIndex;
      break;
    }
  }

  return { bankStripeDepositStripeLineItemIDs, newSLIRowIndex: tempSLIRowIndex, offSetAmount };
}

function addBankStatementIDToStripeLineItems(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    const stripeLineItems = rows.filter(row => row[7] && row[7].match(/^ch/));

    const bankStripeDepositRows = rows.filter(row => row[5] && row[5].match(/\d\d\d\d/) && row[9] && row[9].match('Direct Deposit STRIPE'));

    let sLIRowIndex = 0;
    let offSetAmounts = [];

    bankStripeDepositRows.forEach(bsdr => {
      let bsd = Number(bsdr[10]);
      let { bankStripeDepositStripeLineItemIDs, newSLIRowIndex, offSetAmount } = findBankStripeDepositStripeLineItems(bsd, stripeLineItems, sLIRowIndex);

      if (offSetAmount) {
        offSetAmounts.push({ amount: offSetAmount, id: bsdr[5] })
      }

      rows.forEach((row, i) => {
        if (bankStripeDepositStripeLineItemIDs.includes(row[7])) {
          rows[i][5] = bsdr[5]
        }
      })

      sLIRowIndex = newSLIRowIndex;
    });

    const newOffSetRows = offSetAmounts.map(osa => {
      const baseRow = bankStripeDepositRows.find(r => r[5] === osa.id);
      const newRow = [...baseRow];
      newRow[6] = '';
      newRow[7] = '';
      newRow[8] = '';
      newRow[9] = 'Stripe Expense';
      newRow[10] = osa.amount;
      newRow[11] = '';
      newRow[12] = osa.amount;
      newRow[14] = 'Operations';
      newRow[15] = 'Financial Services';
      newRow[16] = 'SJC';
      return newRow;
    })

    const result = [...rows, ...newOffSetRows];
    return result.map(row => row.join(",")).join("\n");
}

function clearColumnsButKeepHeaders(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    // Columns to clear (F = index 5, G = index 6, I = index 8, M = index 12, N = index 13)
    const columnsToClear = [5, 6, 8, 12, 13];

    for (let i = 1; i < rows.length; i++) { // Start from row index 1 (skip headers)
        for (let colIndex of columnsToClear) {
            if (colIndex < rows[i].length) {
                rows[i][colIndex] = ""; // Clear cell content
            }
        }
    }

    return rows.map(row => row.join(",")).join("\n");
}

function deleteSecondRow(csvString) {
    const rows = csvString.split("\n");

    if (rows.length > 1) {
        rows.splice(1, 1); // Remove the second row (index 1)
    }

    return rows.join("\n");
}

function removeEmptyRows(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    // Filter out rows where every cell is an empty string
    const filteredRows = rows.filter(row => row.some(cell => cell.trim() !== ""));

    return filteredRows.map(row => row.join(",")).join("\n");
}

function addColumnHeaders(csvString) {
    const headers = [
        "Income Categories", "Expense Categories", "Year", "Month", "Date",
        "Bank Statement ID", "BSO", "Stripe or Tent City Ledger Id",
        "Tent City Income and Expenses Timestamp", "Description",
        "Income/expense breakdown", "Income", "Expense",
        "Income/Expense Category", "Category", "Sub-category",
        "Org", "datesort", "Month Recorded"
    ];

    const rows = csvString.split("\n");

    // Insert the headers as the first row
    rows.unshift(headers.join(","));

    return rows.join("\n");
}

function transformColumnQ(csvString) {
    const orgNameMap = {
      "Social Justice Co-op NL Donation Page: Resources for a Revolution of Care": "SJC",
      "Support St. John's Tent City": "Tent City",
      "2SLGBTQ+ Mutual Aid Fund Newfoundland & Labrador": "Mutual Aid",
      "2SLGBTQ+ Mutual Aid Fund NL": "Mutual Aid",
      "Revolution of Care: Waves of Love for the Atlantic Ocean": "Waves Of Love",
      "Support the Indigenous Activist Collective!": "IAC",
      "Waves of Love for the Atlantic Ocean": "Waves of Love",
    }

    const rows = csvString.split("\n").map(row => row.split(","));

    for (let i = 0; i < rows.length; i++) {
        let colQValue = rows[i][16]; // Column O (15th column, index 14)

        rows[i][16] = orgNameMap[rows[i][16]] || rows[i][16];
    }

    return rows.map(row => row.join(",")).join("\n");
}

function transformColumnO(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    for (let i = 0; i < rows.length; i++) {
        let colOValue = rows[i][14]; // Column O (15th column, index 14)

        // Apply transformation rules
        switch (colOValue) {
            case "3 M":
                rows[i][14] = "Quarterly";
                break;
            case "1 M":
                rows[i][14] = "Monthly";
                break;
            case "1 W":
                rows[i][14] = "Weekly";
                break;
            case "1 D":
            case "":
            default:
                rows[i][14] = "One-time";
                break;
        }
    }

    return rows.map(row => row.join(",")).join("\n");
}

function addTwoEmptyColumnsAtEnd(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    for (let i = 0; i < rows.length; i++) {
        rows[i].push("", ""); // Add two empty columns at the end
    }

    return rows.map(row => row.join(",")).join("\n");
}

function deleteColumnsAfterQ(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    for (let i = 0; i < rows.length; i++) {
        rows[i] = rows[i].slice(0, 17); // Keep only the first 17 columns (up to Q)
    }

    return rows.map(row => row.join(",")).join("\n");
}

function copyColumnAEToQ(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    for (let i = 0; i < rows.length; i++) {
        rows[i][16] = rows[i][30]; // Copy Column AE (index 30) to Column Q (index 16)
    }

    return rows.map(row => row.join(",")).join("\n");
}

function copyColumnAPToO(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    for (let i = 0; i < rows.length; i++) {
        rows[i][14] = rows[i][41]; // Copy Column AP (index 41) to Column O (index 14)
    }

    return rows.map(row => row.join(",")).join("\n");
}

function copyColumnMToJ(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    for (let i = 0; i < rows.length; i++) {
        rows[i][9] = rows[i][12]; // Copy Column M (index 12) to Column J (index 9)
    }

    return rows.map(row => row.join(",")).join("\n");
}

function copyColumnOToKAndL(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    for (let i = 0; i < rows.length; i++) {
        let colOValue = rows[i][14]; // Column O (15th column, index 14)
        rows[i][10] = colOValue; // Copy to Column K (11th column, index 10)
        rows[i][11] = colOValue; // Copy to Column L (12th column, index 11)
    }

    return rows.map(row => row.join(",")).join("\n");
}

function replaceColumnDWithMonthYear(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];

    for (let i = 0; i < rows.length; i++) {
        let dateStr = rows[i][4]; // Column E (5th column, index 4), format: DD-MMM-YYYY
        let [day, monthAbbr, year] = dateStr.split("-"); // Extract parts
        let monthIndex = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(monthAbbr);
        let formattedMonthYear = `${monthNames[monthIndex]} ${year}`; // Convert to full month name

        rows[i][3] = formattedMonthYear; // Replace column D (4th column, index 3)
    }

    return rows.map(row => row.join(",")).join("\n");
}

function replaceColumnCWithYear(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    for (let i = 0; i < rows.length; i++) {
        let dateStr = rows[i][4]; // Column E (5th column, index 4)
        let year = dateStr.split("-")[2]; // Extract the year part
        rows[i][2] = year; // Replace column C (3rd column, index 2) with the year
    }

    return rows.map(row => row.join(",")).join("\n");
}

function copyColumnDToE(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    for (let i = 0; i < rows.length; i++) {
        rows[i][4] = rows[i][3]; // Copy column D (index 3) into column E (index 4)
    }

    return rows.map(row => row.join(",")).join("\n");
}

function removeRowsWhereFIsFalse(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    // Filter out rows where column F (index 5) is "FALSE"
    const filteredRows = rows.filter(row => row[5].toUpperCase() !== "FALSE");

    return filteredRows.map(row => row.join(",")).join("\n");
}

function copyColumnCToH(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    for (let i = 0; i < rows.length; i++) {
        rows[i][7] = rows[i][2]; // Copy column C (index 2) into column H (index 7)
    }

    return rows.map(row => row.join(",")).join("\n");
}

function insertDifferenceColumn(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));
    
    // Insert the new column in each row
    for (let i = 0; i < rows.length; i++) {
        let colG = parseFloat(rows[i][6]) || 0; // Column G (7th column, index 6)
        let colL = parseFloat(rows[i][11]) || 0; // Column L (12th column, index 11)
        let difference = colG - colL;
        
        rows[i].splice(12, 0, difference.toString()); // Insert difference at index 12 (after L)
    }

    return rows.map(row => row.join(",")).join("\n");
}

function convertDatesToDDMMMYYYY(csvString) {
    const rows = csvString.split("\n").map(row => row.split(","));

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 0; i < rows.length; i++) {
        let dateTime = rows[i][1]; // Column B (2nd column, index 1)
        let datePart = dateTime.split(" ")[0]; // Extract date portion
        let [year, month, day] = datePart.split("-"); // Split into parts
        let formattedDate = `${day}-${monthNames[parseInt(month, 10) - 1]}-${year}`; // Convert month number to abbreviation
        rows[i][1] = formattedDate;
    }

    return rows.map(row => row.join(",")).join("\n");
}

function removeFirstColumn(csvString) {
    return csvString
        .split("\n")
        .map(line => line.split(",").slice(1).join(",")) // Remove the first column
        .join("\n");
}

function removeLastColumn(csvString) {
    return csvString
        .split("\n")
        .map(line => line.split(",").slice(0, -1).join(",")) // Remove the last column
        .join("\n");
}

function addEmptyColumnsAtStart(csvString) {
    return csvString
        .split("\n")
        .map(line => `,,${line}`) // Add two empty columns at the start
        .join("\n");
}

function addYearColumn(csvString) {
    return csvString
        .split("\n")
        .map(line => {
            let columns = line.split(",");
            if (columns.length > 2) {
                let dateColumn = columns[2].trim(); // Get current column C
                let yearMatch = dateColumn.match(/\b(\d{4})\b/); // Extract the year (4 digits)
                let year = yearMatch ? yearMatch[1] : ""; // Use found year or empty string
                columns.splice(2, 0, year); // Insert the year at position C (index 2)
            }
            return columns.join(",");
        })
        .join("\n");
}

function addMonthYearColumn(csvString) {
    return csvString
        .split("\n")
        .map(line => {
            let columns = line.split(",");
            if (columns.length > 3) {
                let dateColumn = columns[3].trim(); // Get current column D (index 3)
                let dateParts = dateColumn.match(/(\d{1,2})-([A-Za-z]+)-(\d{4})/); // Match format "DD-MMM-YYYY"
                
                let formattedMonthYear = "";
                if (dateParts) {
                    let [, , month, year] = dateParts;
                    const monthNames = {
                        "Jan": "January", "Feb": "February", "Mar": "March", "Apr": "April",
                        "May": "May", "Jun": "June", "Jul": "July", "Aug": "August",
                        "Sep": "September", "Oct": "October", "Nov": "November", "Dec": "December"
                    };
                    formattedMonthYear = `${monthNames[month]} ${year}`; // Convert to "MMMM YYYY"
                }

                columns.splice(3, 0, formattedMonthYear); // Insert formatted date at position D (index 3)
            }
            return columns.join(",");
        })
        .join("\n");
}

function addEmptyColumnsBetweenEAndF(csvString) {
    return csvString
        .split("\n")
        .map(line => {
            let columns = line.split(",");
            if (columns.length > 5) {
                columns.splice(5, 0, "", "", "", ""); // Insert 4 empty columns at index 5 (after column E)
            }
            return columns.join(",");
        })
        .join("\n");
}

function swapColumnsLAndM(csvString) {
    return csvString
        .split("\n")
        .map(line => {
            let columns = line.split(",");
            if (columns.length > 12) {
                // Swap columns L (index 11) and M (index 12)
                [columns[11], columns[12]] = [columns[12], columns[11]];
            }
            return columns.join(",");
        })
        .join("\n");
}

function copyColumnMToK(csvString) {
    return csvString
        .split("\n")
        .map(line => {
            let columns = line.split(",");
            if (columns.length > 12) {
                columns[10] = columns[12]; // Copy column M (index 12) to column K (index 10)
            }
            return columns.join(",");
        })
        .join("\n");
}

function fillColumnKFromL(csvString) {
    return csvString
        .split("\n")
        .map(line => {
            let columns = line.split(",");
            if (columns.length > 11) {
                let columnJ = columns[9].trim(); // Column J (index 9)
                let columnK = columns[10].trim(); // Column K (index 10)
                let columnL = columns[11].trim(); // Column L (index 11)

                if (!columnJ.includes("Stripe") && columnK === "") {
                    columns[10] = columnL; // Copy column L into column K
                }
            }
            return columns.join(",");
        })
        .join("\n");
}

function addEmptyColumnsAtEnd(csvString) {
    return csvString
        .split("\n")
        .map(line => line + ",,,," ) // Append four empty columns
        .join("\n");
}

function addFormattedDateColumn(csvString) {
    return csvString
        .split("\n")
        .map(line => {
            let columns = line.split(",");
            if (columns.length > 4) {
                let dateColumn = columns[4].trim(); // Get column E (index 4)
                let dateParts = dateColumn.match(/(\d{1,2})-([A-Za-z]+)-(\d{4})/); // Match "DD-MMM-YYYY"

                let formattedDate = "";
                if (dateParts) {
                    let [ , day, month, year] = dateParts;
                    const monthNumbers = {
                        "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04",
                        "May": "05", "Jun": "06", "Jul": "07", "Aug": "08",
                        "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"
                    };
                    let monthNumber = monthNumbers[month]; // Convert month to "MM"
                    formattedDate = `${year}-${monthNumber}-${day.padStart(2, "0")}`; // Format as "YYYY-MM-DD"
                }

                columns.push(formattedDate); // Add the formatted date column at the end
            }
            return columns.join(",");
        })
        .join("\n");
}

function addMonthYearAtEnd(csvString) {
    return csvString
        .split("\n")
        .map(line => {
            let columns = line.split(",");
            if (columns.length > 4) {
                let dateColumn = columns[4].trim(); // Get column E (index 4)
                let dateParts = dateColumn.match(/(\d{1,2})-([A-Za-z]+)-(\d{4})/); // Match "DD-MMM-YYYY"

                let formattedMonthYear = "";
                if (dateParts) {
                    let [, , month, year] = dateParts;
                    const monthNames = {
                        "Jan": "January", "Feb": "February", "Mar": "March", "Apr": "April",
                        "May": "May", "Jun": "June", "Jul": "July", "Aug": "August",
                        "Sep": "September", "Oct": "October", "Nov": "November", "Dec": "December"
                    };
                    formattedMonthYear = `${monthNames[month]} ${year}`; // Convert to "MMMM YYYY"
                }

                columns.push(formattedMonthYear); // Add formatted date at the end
            }
            return columns.join(",");
        })
        .join("\n");
}
