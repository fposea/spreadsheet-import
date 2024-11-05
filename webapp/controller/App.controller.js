sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "basic/sapui5/app/utils/utils",
    "sap/m/MessageBox"
], function (Controller, MessageToast, Fragment, Utils, MessageBox) {
    "use strict";

    var vData = [
        {
          "TECHNICAL_NAME": "MIHAI_TEST_UPLOAD_21",
          "NAME": "TEST PACKAGE 1",
          "DESCRIPTION": "# of sessions to work with SAC in excel through MS add-in",
          "STEREOTYPE": "SCOPEITEMCATEGORY_L1|PORTOFOLIO_CATEGORY",
          "OWNER": "I355223",
          "ACTIVE": "yes",
          "PARENT_PACKAGE_KEYS": "SAP_BAC_L4_BO_COD_PSP_SLAYOUT_GSETTINGS"
        },
        {
          "TECHNICAL_NAME": "MIHAI_TEST_UPLOAD_22",
          "NAME": "TEST PACKAGE 2",
          "DESCRIPTION": "# of sessions to work with SAC in excel through MS add-in",
          "STEREOTYPE": "SCOPEITEMCATEGORY_L1",
          "OWNER": "I355223",
          "ACTIVE": "yes",
          "PARENT_PACKAGE_KEYS": "SAP_BAC_L4_BO_COD_PSP_SLAYOUT_GSETTINGS"
        },
        {
          "TECHNICAL_NAME": "MIHAI_TEST_UPLOAD_23",
          "NAME": "TEST PACKAGE 3",
          "DESCRIPTION": "# of sessions to work with SAC in excel through MS add-in",
          "STEREOTYPE": "PORTOFOLIO_CATEGORY",
          "OWNER": "I355223",
          "ACTIVE": "yes",
          "PARENT_PACKAGE_KEYS": "SAP_BAC_L4_BO_COD_PSP_SLAYOUT_GSETTINGS"
        }
    ];

    return Controller.extend("basic.sapui5.app.controller.App", {
        onInit: function () {
            // Initialize the JSON model with vData
            var oModel = new sap.ui.model.json.JSONModel({
                items: vData
            });
            this.getView().setModel(oModel);
        },

        onButtonPress: function () {
            var oView = this.getView();
            
            // Create dialog lazily
            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "basic.sapui5.app.view.fragments.Dialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            
            this.pDialog.then(function(oDialog) {
                // Reset file uploader before opening dialog
                var oFileUploader = oDialog.getContent()[0].getItems()[0];
                if (oFileUploader) {
                    oFileUploader.clear();
                    oFileUploader.setValue("");
                }
                oDialog.open();
            });
        },

        onCloseDialog: function () {
            this.pDialog.then(function(oDialog) {
                oDialog.close();
            });
        },

        onFileChange: async function (event) {
            // Validate the file using our utility function
            // Utils.validateExcelFile(oEvent);

            var file = event.getParameter("files")[0];
            var oFileUploader = this.byId("fileUploader");
            var oTable = this.byId("dataTable");
            console.log(file);

            if(file) {
                var ext = file.name.split('.').pop();
                if (ext !== "xlsx" && ext !== "xls") {
                    sap.m.MessageBox.error("Please upload a valid Excel file (xlsx or xls).");
                    oFileUploader.clear();
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
                    return;
                }     
            }

        },

        onUploadPress: function() {
            // Get the file uploader from the dialog content
            var oDialog = this.byId("uploadDialog"); // Make sure this ID matches your Dialog fragment
            if (!oDialog) {
                MessageBox.error("Dialog not found");
                return;
            }

            var oFileUploader = this.byId("fileUploader");
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
        }
    });
}); 