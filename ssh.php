<?php
session_start();
// error codes - 5
if(!isset($_SESSION['connected']))
{
$domain = $_POST['domain'];
$user = $_POST['user'];
$pass = $_POST['password'];

if((!isset($domain)) || (!isset($user))|| (!isset($pass)))
{
	$response['error'] = 1;
	$response['errorcode'] = 5;
	$response['error_msg'] = "Otha!! enna da nadakuthu inga? :|";
	echo json_encode($response);
	exit(0);
	}

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
$response['error'] = 0;
$response['auth'] = 1;
$response['auth_msg'] = "Authentication Sucess!!";
echo json_encode($response);
exit(0);
}
else
{
$command = $_GET['command'];
if(isset($command))
{
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

}
function changedir($newpath)
{
	$command = "cd";
	$com_comm = $command . " '" . $newpath . "'";
	}
?>
