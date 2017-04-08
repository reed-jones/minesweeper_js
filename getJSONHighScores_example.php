<?php	
//Connect to DB
	require("../connect.php");

	$result = pg_query($con, "SELECT json_build_object('Name', name, 'Time', time) FROM (SELECT name, time FROM _Table_ WHERE difficulty = 0 ORDER BY time, id LIMIT 10) _Table_" );

	if (!$result) {
		echo "An error occurred.\n";
		exit;
	}

	header('Content-type:application/json;charset=utf-8');

	$json = '{"highscores":';
	$json .= '{"easy": [';
	while ($row = pg_fetch_array($result))
	{
		
		$json .= $row[0] . ","; 
	}
	$json = trim($json, ",");
	$json .= " ],";


	$result = pg_query($con, "SELECT json_build_object('Name', name, 'Time', time) FROM (SELECT name, time FROM _Table_ WHERE difficulty = 1 ORDER BY time, id LIMIT 10) _Table_" );

	$json .= '"medium": [';
	while ($row = pg_fetch_array($result))
	{
		
		$json .= $row[0] . ","; 
	}
	$json = trim($json, ",");
	$json .= " ],";


	$result = pg_query($con, "SELECT json_build_object('Name', name, 'Time', time) FROM (SELECT name, time FROM _Table_ WHERE difficulty = 2 ORDER BY time, id LIMIT 10) _Table_" );

	$json .= '"hard": [';
	while ($row = pg_fetch_array($result))
	{
		
		$json .= $row[0] . ","; 
	}
	$json = trim($json, ",");
	$json .= " ]";

	$json .= "}}";

	echo $json;
				
?>