<?php	
//Connect to DB
	require("../connect.php");

	$result = pg_query($con, "SELECT json_build_object('Name', name, 'Time', time) FROM (SELECT name, time FROM highscores WHERE difficulty = 0 ORDER BY time, id LIMIT 10) highscores" );

	if (!$result) {
		echo "An error occurred.\n";
		exit;
	}

	$json = '{"highscores": '."\n";
	$json .= '{"easy": ['."\n";
	while ($row = pg_fetch_array($result))
	{
		
		$json .= "    " . $row[0] . ",\n"; 
	}
	$json = trim($json, ",\n");
	$json .= "\n  ],\n";


	$result = pg_query($con, "SELECT json_build_object('Name', name, 'Time', time) FROM (SELECT name, time FROM highscores WHERE difficulty = 1 ORDER BY time, id LIMIT 10) highscores" );

	$json .= '"medium": ['."\n";
	while ($row = pg_fetch_array($result))
	{
		
		$json .= "    " . $row[0] . ",\n"; 
	}
	$json = trim($json, ",\n");
	$json .= "\n  ],\n";


	$result = pg_query($con, "SELECT json_build_object('Name', name, 'Time', time) FROM (SELECT name, time FROM highscores WHERE difficulty = 2 ORDER BY time, id LIMIT 10) highscores" );

	$json .= '"hard": ['."\n";
	while ($row = pg_fetch_array($result))
	{
		
		$json .= "    " . $row[0] . ",\n"; 
	}
	$json = trim($json, ",\n");
	$json .= "\n  ]\n";

	$json .= "}}";

	echo $json;
				
?>

