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
	$response['error'] = 1;
	$response['errorcode'] = 0;
	$response['error_msg'] = "Failed to establish connection";
	echo json_encode($response);
	exit(0);
	}
if(ssh2_auth_password($ssh_conn, $user, $pass) == false)
{
	$response['error'] = 1;
	$response['errorcode'] = 1;
	$response['error_msg'] = "Authentication failed";
	echo json_encode($response);
	exit(0);
}
//store the values in a session
$_SESSION['connected'] = 1;
$_SESSION['connection'] = $ssh_conn;

//execute command
$ostream = ssh2_exec($ssh_conn ,$command. '\n');
if($ostream == false)
{
	$response['error'] = 1;
	$response['errorcode'] = 2;
	$response['error_msg'] = "Execution of command failed";
	echo json_encode($response);
	exit(0);
	}
//TODO
if(stream_set_blocking($ostream, true)==false)
{
	$response['error'] = 1;
	$response['errorcode'] = 3;
	$response['error_msg'] = "Stream Error";
	echo json_encode($response);
	exit(0);
	}

//echo contents
$output = stream_get_contents($ostream);
if($output == false)
{
	$response['error'] = 1;
	$response['errorcode'] = 4;
	$response['error_msg'] = "Stream Error";
	echo json_encode($response);
	exit(0);
	}
else
{
	$response['error'] = 0;
	$response['command'] = $command;
	$response['output'] = $output;
	echo json_encode($response);
	}
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
