<?php
// connection to postgresql database
$conn_string = "host=localhost dbname=DB_NAME user=DB_USERNAME password=PASSWORD";
$con = pg_connect($conn_string) or die ("Could Not Connect to High Scores Database");
?>