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
        return callback(null, spreadsheet);
    });
};

module.exports = SheetsHelper;