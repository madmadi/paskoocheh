$(document).ready(function () {
    $('#burger').click(function () {
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
});