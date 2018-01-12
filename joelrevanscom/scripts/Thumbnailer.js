(function () {
    var kitty = document.getElementById("kitty");
    var demo = document.getElementById("ThumbnailerDemo");

    var nailit = document.getElementById("NailIt");
    var reset = document.getElementById("Reset");

    nailit.addEventListener("click", NailIt);
    function NailIt(){
        var width = document.getElementById("DemoWidth").value;
        var height = document.getElementById("DemoHeight").value;
        var type = document.querySelector("input[name='type']:checked").value;

        kitty.src = "/images/Thumbnailer/testkitten.jpg?type=" + type + "&width=" + width + "&height=" + height;
    }

    reset.addEventListener("click", Reset);
    function Reset() {
        kitty.src = "/images/Thumbnailer/testkitten.jpg?type=skew&width=600&height=450";
    }
})();