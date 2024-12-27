function function_carrega_popup_imgs(game) {
    //let actualfile = new Date().valueOf();
    document.getElementById("popup").style.display = "block";
    document.getElementById("popupcontent").innerHTML='<object style="width:100%; height: 90%;" type="text/html" data="slideshow.html?selgame=' + game + '"></object>';
}

function function_close_popup() {
    document.getElementById("popup").style.display = "none";
}

