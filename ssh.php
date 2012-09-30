<?php
session_start();
if(!isset($_SESSION['connected']))
{
$domain = $_POST['domain'];
$user = $_POST['user'];
$pass = $_POST['password'];
$command = $_POST['command'];
/*$domain = "web324.webfaction.com";
$user = "ssngeek";
$pass = "f7e08c8b";
$command = "ls -l";*/
$ssh_conn = ssh2_connect($domain, 22);
if(!ssh_conn)
{
	die("Failed to establish connection");
	}
if(ssh2_auth_password($ssh_conn, $user, $pass) == false)
{
	die("Invalid details");
}
//store the values in a session
$_SESSION['connected'] = 1;
$_SESSION['connection'] = $ssh_conn;

//execute command
$ostream = ssh2_exec($ssh_conn ,$command. '\n');
//TODO
stream_set_blocking($ostream, true);

//echo contents
echo stream_get_contents($ostream);
}
else
{
		
}
function changedir($newpath)
{
	$command = "cd";
	$com_comm = $command . " '" . $newpath . "'"
	}
?>
