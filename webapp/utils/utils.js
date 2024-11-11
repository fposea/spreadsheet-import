sap.ui.define([], function() {
    "use strict";
    
    return {
        validateExcelFile: function(oEvent) {
            var file = oEvent.getParameter("files")[0];
            if (file) {
                var fileName = file.name;
                var fileType = fileName.split('.').pop().toLowerCase();
                
                if (fileType !== "xlsx" && fileType !== "xls") {
                    throw new Error("Please upload an Excel file");
                }
                return true;
            }
            return false;
        },

        convertExcelToJson: function(file) {
            return new Promise((resolve, reject) => {
                try {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const data = e.target.result;
                        const workbook = XLSX.read(data, {
                            type: 'binary'
                        });
                        
                        // Get first sheet
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        
                        // Convert to JSON
                        const jsonData = XLSX.utils.sheet_to_json(worksheet);
                        resolve(jsonData);
                    };
                    reader.onerror = function(ex) {
                        reject(ex);
                    };
                    reader.readAsBinaryString(file);
                } catch (ex) {
                    reject(ex);
                }
            });
        },

        validateJsonTemplate: function(jsonData, expectedFields) {
            if (!Array.isArray(jsonData)) {
                return {
                    validTemplate: false,
                    noData: false
                };
            }

            if (jsonData.length === 0) {
                return {
                    validTemplate: false,
                    noData: true
                };
            }

            // Check if first row has all required fields
            const firstRow = jsonData[0];
            const hasAllFields = expectedFields.every(field => field in firstRow);

            return {
                validTemplate: hasAllFields,
                noData: false
            };
        }
    };
}); 