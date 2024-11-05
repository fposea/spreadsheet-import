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
            // Controller initialization code
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

        onFileChange: function(oEvent) {
            // Validate the file using our utility function
            Utils.validateExcelFile(oEvent);
        },

        onUploadPress: function() {
            var oFileUploader = this.byId("fileUploader");
            var domRef = oFileUploader.getFocusDomRef();
            var file = domRef.files[0];
            
            if (!file) {
                MessageBox.error("Please choose a file first");
                return;
            }

            // Here you can implement the actual file upload logic
            MessageToast.show("File ready for upload: " + file.name);
            
            // Close the dialog after successful upload
            this.onCloseDialog();
        }
    });
}); 