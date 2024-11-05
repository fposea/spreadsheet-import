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
        }
    };
}); 