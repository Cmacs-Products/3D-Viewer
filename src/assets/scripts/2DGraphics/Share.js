function showShareDialog(module, objectExternalId) {
    var actionWindow = $("<div>", {
        id: "sharePopupDialog"
    });

    var title = module === "DOCUMENT" ? GetResourceString('ShareDocument') : GetResourceString('SHARE');

    actionWindow.kendoWindow({
        width: "1020px",
        height: "620px",
        title: title,
        visible: false,
        modal: true,
        content: "",
        actions: [
            "Close"
        ],
        close: onCloseShareDialog
    });

    var url = "/Share/Partial_Share/?module=" + module + "&objectExternalId=" + objectExternalId;

    if (module === "DOCUMENT") {
        var myWindow = $("#sharePopupDialog").data("kendoWindow");
        if (myWindow !== undefined && myWindow !== null) {
            myWindow.bind('refresh', function (e) {
                myWindow.center();
            });
            myWindow.refresh({
                url: url
            });
            myWindow.title(title);
            myWindow.center().open();
        }
    }
    $(".k-widget.k-window").attr("class", " ").addClass("k-widget k-window scheduletaskkmodel");
    $("#sharePopupDialog").addClass("DoubleClickWindowOption");
};

function showCreateShareDialog(module, objectExternalId, callback) {

    var createWindow = $("<div>", {
        id: "createSharePopupDialog"
    });

    var title = module === "DOCUMENT" ? GetResourceString('ShareDocument') : GetResourceString('SHARE');

    createWindow.kendoWindow({
        width: "1020px",
        height:"620px",
        title: title,
        visible: false,
        modal: true,
        content: "",
        actions: [
            "Close"
        ],
        close: callback
    });

    var url = "/Share/Create_Share/?module=" + module + "&objectExternalId=" + objectExternalId;

    if (module === "DOCUMENT") {
        var createWindowDialog = $("#createSharePopupDialog").data("kendoWindow");
        if (createWindowDialog !== undefined && createWindowDialog !== null) {
            createWindowDialog.bind('refresh', function (e) {
                createWindowDialog.center();
            });
            createWindowDialog.refresh({
                url: url
            });
            createWindowDialog.title(title);
            createWindowDialog.center().open();
        }

    }
    $(".k-widget.k-window").attr("class", " ").addClass("k-widget k-window scheduletaskkmodel");
    $("#createSharePopupDialog").addClass('DoubleClickWindowOption');
};

function onCloseShareDialog() {

};
