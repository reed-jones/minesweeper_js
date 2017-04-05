	// all new folders get this default behavior
	//document.getElementsByName("newFolder").forEach(function(folder) {folder.onclick = newFolder});
//window.onload = function() {
	document.getElementById("titleBar").onmousedown = startDrag;
	document.getElementById("instructions").onmousedown = startDrag;
	document.getElementsByName("newFolder").forEach(function(folder) {folder.onmousedown = startDrag});
//};

var clickX = 0;
var clickY = 0;
var drag = false;


function startDrag(e) {
	console.log('click');
	clickX = e.screenX;
	clickY = e.screenY;
	drag = true;
};

document.onmousemove = function(e) {
	if (!drag)
		return;

	if (e.target === document.getElementById("titleBar")) {
		var newX = e.screenX;
		var newY = e.screenY;
		var curX = parseInt(document.getElementById("wholeGame").style.left);
		var curY = parseInt(document.getElementById("wholeGame").style.top);


		var mathX = clickX - newX;
		curX = curX - mathX;
		document.getElementById("wholeGame").style.left = curX + "px";

		var mathY = clickY - newY;
		curY = curY - mathY;
		document.getElementById("wholeGame").style.top = curY + "px";

		clickX = e.screenX;
		clickY = e.screenY;
	}
	else {
		var newX = e.screenX;
		var newY = e.screenY;
		var curX = parseInt(e.target.style.left);
		var curY = parseInt(e.target.style.top);

		var mathX = clickX - newX;
		curX = curX - mathX;
		e.target.style.left = curX + "px";

		var mathY = clickY - newY;
		curY = curY - mathY;
		e.target.style.top = curY + "px";

		clickX = e.screenX;
		clickY = e.screenY;
	}
};




document.onmouseup = function(e) {
	drag = false;
};