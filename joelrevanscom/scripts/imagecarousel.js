
(function () {
    var images = document.querySelectorAll(".ImageCarousel .ScriptOnly");
    for (var i = 0; i < images.length; ++i) {
        images[i].classList.remove("ScriptOnly");
    }

    var imagecontainers = document.querySelectorAll(".ImageCarousel > div");
    for (var i = 0; i < imagecontainers.length; ++i) {
        imagecontainers[i].addEventListener("click", resizeimage);
    }

    function resizeimage(evt) {
        var img = evt.currentTarget.querySelector("img");
        var src = img.getAttribute("src");
        var regex = /-w900.jpeg*/i;
        src = src.replace(regex, "-w100.jpeg");    //I'm not going to bother downsizing back to 100.
        img.src = src;
    }
})();