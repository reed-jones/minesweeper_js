<?php	
//Connect to DB
require("../connect.php");

$name = $_POST['n'];
$time = intval($_POST['t']);
$difficulty = intval($_POST['d']);

if ($name === NULL || $time === NULL || $difficulty === NULL){
	exit();
	//exit("null values found");
}
if (is_nan($time) || !is_numeric($time) || $time < 0){
	exit();
	//exit("invalid difficulty");
}
if (is_nan($difficulty) || $difficulty > 2 || $difficulty < 0){
	exit();
	//exit("invalid difficulty");
}

// set default name if no name was supplied
if($name == "") {
	$name = "Unknown";
}

// if name is too long for the database, only grab the first 25 letters (since database limit is a varchar(25))
$name = substr($name, 0, 25);

// Prepare a query for execution
$result = pg_prepare($con, "my_query", 'INSERT INTO _Table_(name, time, difficulty) VALUES($1,$2,$3)');
// Execute the prepared query.
$result = pg_execute($con, "my_query", array($name, $time, $difficulty));

 ?>