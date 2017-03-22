<?php	
//Connect to DB
require("../connect.php");
?>

<!--Build HTML table to hold highscores. This implimentation uses bootstrap -->
<div class="row">
	<div class="" id="diffEasy">
		<h4>Easy</h4>
		<hr>
		<div class="row">
			<div class="col-xs-6">
				<h4>Name</h4>
			</div>
			<div class="col-xs-6">
				<h4>Time</h4>
			</div>
			
		<!-- recieve top 10 ranked Easy players -->
		<?php $result = pg_query($con, "SELECT name, time FROM _Table_ WHERE difficulty = 0 ORDER BY time, id LIMIT 10");
		if (!$result) {
			echo "An error occurred.\n";
			exit;
		} 

		while ($row = pg_fetch_array($result)) { ?>
		<div class="row">
			<div class="col-xs-6">
				<?php echo $row['name']; ?>
			</div>
			<div class="col-xs-6">
				<?php echo $row['time']; ?>
			</div>
		</div>
		<?php } ?>

		</div>
	</div>
	<div class="" id="diffMedium">
		<h4>Medium</h4>
		<hr>
		<div class="row">
		<div class="col-xs-6">
			<h4>Name</h4>
		</div>
		<div class="col-xs-6">
			<h4>Time</h4>
		</div>
		
		<!--Recieve top 10 ranked Medium players-->
<?php $result = pg_query($con, "SELECT name, time FROM _Table_ WHERE difficulty = 1 ORDER BY time, id LIMIT 10"); 
		while ($row = pg_fetch_array($result)) { ?>

		<div class="row">
			<div class="col-xs-6">
				<?php echo $row['name']; ?>
			</div>
			<div class="col-xs-6">
				<?php echo $row['time']; ?>
			</div>
		</div>
		<?php } ?>
		</div>
	</div>
	<div class="" id="diffHard">
		<h4>Hard</h4>
		<hr>
		<div class="row">
		<div class="col-xs-6">
			<h4>Name</h4>
		</div>
		<div class="col-xs-6">
			<h4>Time</h4>
		</div>

		<!--Recieved top 10 ranked Difficult players-->
<?php $result = pg_query($con, "SELECT name, time FROM _Table_ WHERE difficulty = 2 ORDER BY time, id LIMIT 10"); 
		while ($row = pg_fetch_array($result)) { ?>
		<div class="row">
			<div class="col-xs-6">
				<?php echo $row['name']; ?>
			</div>
			<div class="col-xs-6">
				<?php echo $row['time']; ?>
			</div>
		</div>
		<?php } ?>
		</div>
	</div>
</div>




