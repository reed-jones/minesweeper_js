// Must open chrome using these flags to see local JSON:
//  --allow-file-access-from-files --disable-web-security

// Load JSON file dependant on which icon has been selected.
// Fill Modal with info from JSON.
window.onload = function() {
	document.getElementById("instructions").onclick = instructions;

	// all new folders get this default behavior
	document.getElementsByName("newFolder").forEach(function(folder) {folder.onclick = newFolder});
};

function instructions()
{

};

function newFolder(){
	
};