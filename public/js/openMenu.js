$(document).ready(function () {
    $("body").removeClass("preload");
    $('#burger').click(function () {
        $(".backdrop").addClass("closed");
        $(".activeButton").toggleClass("active");
        if ($(".menuBase").hasClass("opened")) {
            $(".menuBase").removeClass("opened");
            $(".menuBase").addClass("closed");
        } else {
            $(".menuBase").removeClass("closed");
            $(".menuBase").addClass("opened");
        }
    });
    $('.navItem').click(function () {
        $(".menuBase").removeClass("opened");
        $(".menuBase").addClass("closed");
        $(".activeButton").toggleClass("active");
    });
    $('#aboutLink').click(function () {
        $("#mapContainer").addClass("hide");
        $("#aboutContainer").removeClass("hide");
    });
    $('#backToMap').click(function () {
        $("#mapContainer").removeClass("hide");
        $("#aboutContainer").addClass("hide");
    });
    $('#closeModal').click(function () {
        $(".backdrop").removeClass("opened");
        $(".backdrop").addClass("closed");
    });
    $('#howTo').click(function () {
        $(".backdrop").removeClass("closed");
        $(".backdrop").addClass("opened");

    });
});