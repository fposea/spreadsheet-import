sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "basic/sapui5/app/utils/utils",
    "sap/m/MessageBox"
], function (Controller, MessageToast, Fragment, Utils, MessageBox) {
    "use strict";

    return Controller.extend("basic.sapui5.app.controller.App", {
        
        onInit: function () {
            // Initialize the JSON model with empty items array
            var oModel = new sap.ui.model.json.JSONModel({
                items: [],
                dialogTitle: "Default Upload Dialog" // Add initial title
            });
            this.getView().setModel(oModel);
        },
        
        onClickMeButtonPress: function () {
            var oView = this.getView();
            var oModel = this.getView().getModel();
             
            // Update the dialog title dynamically
            oModel.setProperty("/dialogTitle", "Upload Dialog - " + new Date().toLocaleString());
            
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
                var oFileUploader = oDialog.getContent()[0].getItems()[0];
                if (oFileUploader) {
                    oFileUploader.clear();
                    oFileUploader.setValue("");
                }
                
                // Reset table visibility and data
                var oTable = this.byId("idItemsDataTable");
                if (oTable) {
                    oTable.setVisible(false);
                }
                
                oDialog.open();
            }.bind(this)); // Add bind(this) to maintain controller context
        },

        onCancelButtonPress: function () {
            this._pDialog.then(function(oDialog) {
                oDialog.close();
            });
        },

        onFileUploaderChange: async function (event) {
            // Validate the file using our utility function
            // Utils.validateExcelFile(oEvent);

            var file = event.getParameter("files")[0];
            var oFileUploader = this.byId("idFileUploader");
            var oTable = this.byId("idItemsDataTable");
            oTable.setVisible(false);
            // console.log(file);

            if(file) {
                var ext = file.name.split('.').pop();
                if (ext !== "xlsx" && ext !== "xls") {
                    sap.m.MessageBox.error("Please upload a valid Excel file (xlsx or xls).");
                    oFileUploader.clear();
                    // oT÷able.setVisible(false);
                    return;
                } 
                var jsonData = await Utils.convertExcelToJson(file);

                if(Utils.validateJsonTemplate(jsonData)) {
                    this._excelfileJSONData = jsonData;
                    // Update model with new data and show table
                    var oModel = this.getView().getModel();
                    oModel.setData({ items: jsonData });
                    oTable.setVisible(true);
                    console.log(jsonData);
                } else {
                    sap.m.MessageBox.error("Please upload a valid template for the bulk upload.");
                    oFileUploader.clear();
                    // oTable.setVisible(false);
                    return;
                }     
            }

        },

        onUploadButtonPress: function() {
            // Get the file uploader from the dialog content
            var oDialog = this.byId("idUploadDialog"); // Make sure this ID matches your Dialog fragment
            if (!oDialog) {
                MessageBox.error("Dialog not found");
                return;
            }

            var oFileUploader = this.byId("idFileUploader");
            if (!oFileUploader) {
                MessageBox.error("File uploader not found");
                return;
            }

            var domRef = oFileUploader.getFocusDomRef();
            if (!domRef || !domRef.files || !domRef.files[0]) {
                MessageBox.error("Please choose a file first");
                return;
            }

            var file = domRef.files[0];
            
            // Here you can implement the actual file upload logic
            MessageToast.show("File ready for upload: " + file.name);
            
            // Close the dialog after successful upload
            this.onCloseDialog();
        },

    });
}); 