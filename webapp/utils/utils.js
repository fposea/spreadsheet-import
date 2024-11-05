sap.ui.define([], function() {
    "use strict";
    
    return {
        validateExcelFile: function(oEvent) {
            const file = oEvent.getParameter("files")[0];
            const fileType = file.type;
            const fileName = file.name;
            
            // Valid Excel MIME types
            const validTypes = [
                'application/vnd.ms-excel',                                    // .xls
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
                'application/vnd.ms-excel.sheet.macroEnabled.12'              // .xlsm
            ];
            
            // Check file extension as fallback
            const validExtensions = ['.xls', '.xlsx', '.xlsm'];
            const fileExtension = fileName.toLowerCase().slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
            
            // Check both MIME type and extension
            if (!validTypes.includes(fileType) && !validExtensions.includes(`.${fileExtension}`)) {
                // Reset the file uploader
                oEvent.getSource().clear();
                
                // Show error message
                sap.m.MessageBox.error("Please upload only Excel files (.xls, .xlsx, .xlsm)");
                return false;
            }
            
            return true;
        },

        convertExcelToJson: function (file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    resolve(jsonData);
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            });
        },

        validateJsonTemplate: function (jsonData) {
            const expectedRows = {
                ACTIVE: "string",
                DESCRIPTION: "string", 
                NAME: "string",
                OWNER: "string",
                PARENT_PACKAGE_KEYS: "string",
                STEREOTYPE: "string",
                TECHNICAL_NAME: "string",
            };

            const checkType = (value, type) => typeof value === type;

            return jsonData.every((item) =>
                Object.keys(expectedRows).every(
                    (key) =>
                        key in item && checkType(item[key], expectedRows[key])
                )
            );
        }
        
    };
}); 