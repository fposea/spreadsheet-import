sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "basic/sapui5/app/utils/utils",
    "sap/m/MessageBox"
], function (Controller, MessageToast, Fragment, Utils, MessageBox) {
    "use strict";

    return Controller.extend("basic.sapui5.app.controller.App", {
        
        _bulkUploadTemplates: {
            PACKAGE_UPLOAD: [
                "TECHNICAL_NAME",
                "NAME",
                "DESCRIPTION",
                "STEREOTYPE",
                "OWNER",
                "ACTIVE",
                "PARENT_PACKAGE_KEYS"
            ],
            PACKAGE_MO_UPLOAD: [
                "KEY_PACKAGE",
                "KEY_MEASUREMENT_OBJECTS",
                "CHANGED_BY",
                "CHANGED_AT"
            ]
        },

        onInit: function () {
            // Initialize the JSON model with empty items array
            var oModel = new sap.ui.model.json.JSONModel({
                items: [],
                dialogTitle: "",
                uploadEnabled: false
            });
            this.getView().setModel(oModel);
        },
        
        onBulkUploadButtonPress: function (oEvent) {
            var oView = this.getView();
            var oModel = this.getView().getModel();
             
            // Get the button's text from the event source
            var buttonText = oEvent.getSource().getText();
            oModel.setProperty("/dialogTitle", buttonText);
            
            // Create dialog lazily
            if (!this._pDialog) {
                this._pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "basic.sapui5.app.view.fragments.Dialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            
            this._pDialog.then(function(oDialog) {
                // Reset file uploader before opening dialog
                var oFileUploader = this.byId("idFileUploader");
                if (oFileUploader) {
                    oFileUploader.clear();
                }
                
                // Reset and reconfigure table
                var oTable = this.byId("idItemsDataTable");
                if (oTable) {
                    oTable.setVisible(false);
                    this._configureTableColumns(oTable, buttonText);
                }
                
                oDialog.open();
            }.bind(this));
        },

        _configureTableColumns: function(oTable, dialogTitle) {
            // Clear existing columns
            oTable.removeAllColumns();
            
            // Get the appropriate template based on dialog title
            const template = dialogTitle === "Package Upload" 
                ? this._bulkUploadTemplates.PACKAGE_UPLOAD 
                : this._bulkUploadTemplates.PACKAGE_MO_UPLOAD;
            
            // Add columns based on template
            template.forEach(function(fieldName) {
                oTable.addColumn(new sap.m.Column({
                    header: new sap.m.Text({
                        text: fieldName.replace(/_/g, ' ')
                    })
                }));
            });

            // Update the ColumnListItem template
            var oTemplate = new sap.m.ColumnListItem();
            template.forEach(function(fieldName) {
                oTemplate.addCell(new sap.m.Text({
                    text: "{" + fieldName + "}"
                }));
            });

            oTable.bindItems({
                path: "/items",
                template: oTemplate
            });
        },

        onCancelButtonPress: function () {
            this._pDialog.then(function(oDialog) {
                oDialog.close();
            });
        },

        onFileUploaderChange: async function (event) {
            var file = event.getParameter("files")[0];
            var oFileUploader = this.byId("idFileUploader");
            var oTable = this.byId("idItemsDataTable");
            var oModel = this.getView().getModel();
            var dialogTitle = oModel.getProperty("/dialogTitle");
            
            oTable.setVisible(false);
            
            if(file) {
                var ext = file.name.split('.').pop();
                if (ext !== "xlsx" && ext !== "xls") {
                    MessageBox.error("Please upload a valid Excel file (xlsx or xls).");
                    oFileUploader.clear();
                    return;
                } 

                var jsonData = await Utils.convertExcelToJson(file);

                // Select template based on dialog title
                const requiredFields = dialogTitle === "Package Upload" 
                    ? this._bulkUploadTemplates.PACKAGE_UPLOAD 
                    : this._bulkUploadTemplates.PACKAGE_MO_UPLOAD;

                const validationResult = Utils.validateJsonTemplate(jsonData, requiredFields);
                if(validationResult.validTemplate) {
                    this._excelfileJSONData = jsonData;
                    oModel.setData({ 
                        items: jsonData,
                        dialogTitle: dialogTitle,
                        uploadEnabled: true
                    });
                    
                    // Ensure table is configured before showing
                    this._configureTableColumns(oTable, dialogTitle);
                    oTable.setVisible(true);
                } else {
                    if (validationResult.noData) {
                        MessageBox.error("The uploaded file contains no data.");
                    } else {
                        MessageBox.error("Please upload a valid template for the bulk upload.");
                    }
                    oFileUploader.clear();
                    return;
                }
            }
        },

        onUploadButtonPress: function() {
            var oDialog = this.byId("idUploadDialog");
            if (!oDialog) {
                MessageBox.error("Dialog not found");
                return;
            }

            var oFileUploader = this.byId("idFileUploader");
            if (!oFileUploader) {
                MessageBox.error("File uploader not found");
                return;
            }

            if (!this._excelfileJSONData) {
                MessageBox.error("Please choose and validate a file first");
                return;
            }

            // Here you can implement the actual file upload logic
            MessageToast.show("Processing upload...");
            
            // Close the dialog after successful upload
            oDialog.close();
        },

        onFileUploaderUploadComplete: function(oEvent) {
            MessageToast.show("Upload completed");
        }

    });
}); 