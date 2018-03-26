var { google } = require('googleapis');
var { OAuth2Client } = require('google-auth-library');
var util = require('util');

var SheetsHelper = function(accessToken) {
    var auth = new OAuth2Client();
    auth.credentials = {
        access_token: accessToken
    };
    this.service = google.sheets({
        version: 'v4',
        auth: auth
    })
};

SheetsHelper.prototype.createSpreadsheet = function(title, callback) {
    var self = this;
    var request = {
        resource: {
            properties: {
                title: title
            },
            sheets: [
                {
                    properties: {
                        title: 'Data',
                        gridProperties: {
                            columnCount: 6,
                            frozenRowCount: 1
                        }
                    }
                },
                // TODO: Add more sheets.
            ]
        }
    };
    self.service.spreadsheets.create(request, function(error, response) {
        if (error) {
            return callback(error);
        }
        var spreadsheet = response.data;
        // TODO: Add header rows.
        var dataSheetId = spreadsheet.sheets[0].properties.sheetId;
        var requests = [
            buildHeaderRowRequest(dataSheetId)
        ];
        // TODO: Add pivot table and chart.
        var request = {
            spreadsheetId: spreadsheet.spreadsheetId,
            resource: {
                requests: requests
            }
        };
        self.service.spreadsheets.batchUpdate(request, function(error, response) {
            if (error) {
                return callback(error);
            }
            return callback(null, spreadsheet);
        });
    });
};

var COLUMNS = [
    { field: 'id', header: 'ID' },
    { field: 'customerName', header: 'Customer Name' },
    { field: 'productCode', header: 'Product Code' },
    { field: 'unitsOrdered', header: 'Units Ordered' },
    { field: 'unitPrice', header: 'Unit Price' },
    { field: 'status', header: 'Status' }
];

function buildHeaderRowRequest(sheetId) {
    var cells = COLUMNS.map(function(column) {
        return {
            userEnteredValue: {
                stringValue: column.header
            },
            userEnteredFormat: {
                textFormat: {
                    bold: true
                }
            }
        }
    });
    return {
        updateCells: {
            start: {
                sheetId: sheetId,
                rowIndex: 0,
                columnIndex: 0
            },
            rows: [
                {
                    values: cells
                }
            ],
            fields: 'userEnteredValue,userEnteredFormat.textFormat.bold'
        }
    }
}

module.exports = SheetsHelper;