var content, position;
var cmd = {"comm":"", "mode":"", "params":""};
var user;
var pre = 1;
var prompt = $('#prompt_blink');
var before = $('#before');
var after = $('#after');
var t,pause,wait=0;
var credentials = [];

function blink()
{
	if(wait==0)
	{
		$('#prompt_blink').toggleClass('vis').toggleClass('invi');
		t = setTimeout("blink()",700);
	}
}

function build_command(content,position)
{
	$('#before').html(content.substr(0,position));
	$('#after').html(content.substr(position+1,content.length-1));
	$('#prompt_blink').html(content.charAt(position));
}

function welcome() {
	user = $('#clipboard').val() + "-$ ";
	$('#username').html(user);
	$('#after').css('color', '#22FF08');
	var old_line = "<div class='line'><span class='prompt'>Welcome " + $('#clipboard').val(); + "</span></div>";
	$('#clipboard').val('');
	$('div.line1').before(old_line);
	pre = 0;
}

function next_line()
{
	var line = $("#clipboard").val();
	var old_line = "<div class='line'><span class='prompt'>" + user + " </span><span>" + line + "</span></div>";
	var ind = line.indexOf(" ");
	cmd["comm"] = "";
	cmd["mode"] = "";
	cmd["params"] = "";
	if(ind + 1) {
		cmd["comm"] = line.substring(0, ind);
		cmd["comm"] = $.trim(cmd["comm"]);
		line = line.substring(ind + 1);
		ind = line.indexOf(" ");
		if(ind + 1) {
			cmd["mode"] = line.substring(0, ind);
			line = line.substring(ind + 1);
			cmd["mode"] = $.trim(cmd["mode"]);
		}
		cmd["params"] = $.trim(line);
	} else {
		cmd["comm"] = $.trim(line);
	}
	//alert(cmd["comm"]);
	$('#clipboard').val('');
	$("#before").html("");
	$("#after").html("");
	$("#prompt_blink").html("");
	$('div.line1').before(old_line);
}

function get_data()
{
	$('#clipboard').keyup(function() {
		if(event.which==37 && pre==1)
			$(this).prop('selectionStart') = $(this).val().length;
		else if(event.which==13 && pre==1)
		{
			welcome();
		}
	});
}

$(document).ready(function() {
	$('div.line1').before("<div class='line'><span>Enter your Username:</span></div><br>");
	$('#clipboard').focus();
	$('#username').html('Username:');
	get_data();
	$('#terminal').click(function() {
		$('#clipboard').focus();
		blink();
	});

	$('#clipboard').keydown(function() {
	content = $(this).val();
	clearTimeout(t);
	clearTimeout(pause);
	wait = 1;
	$('#prompt_blink').addClass('vis').removeClass('invi');
		var position = $('#clipboard').prop("selectionStart");
		if(position<=content.length-1)
			build_command(content,position);
		else
		{
			$('#before').html(content);
			$('#prompt_blink').html('');
			$('#after').html('');
		}	
	});

	$('#clipboard').keyup(function() {
	content = $(this).val();
	if(wait==1)
	{
		wait = 0;
		pause = setTimeout("blink()",700);

	}
		var position = $('#clipboard').prop("selectionStart");
		if(position<=content.length-1)
			build_command(content,position);
		else
		{
			$('#before').html(content);
			$('#prompt_blink').html('');
			$('#after').html('');
		}
	if($('#prompt_blink').html()=='')
		$('#prompt_blink').css('width','8px');
	else
		$('#prompt_blink').css('width','auto');
	});

	function ls(fs) {
		alert("ls called");
		var dirReader = fs.root.createReader();
		var entries = [];
		var readEntries = function() {
			dirReader.readEntries(function(results) {
				if (!results.length) {
        			listResults(entries.sort());
      			} else {
        			entries = entries.concat(toArray(results));
        			readEntries();
      			}
    		}, errorHandler);
		};

		readEntries();
	}

	function cd(dirName) {
		alert("cd called");
	}

	function cat(fileName, mode) {
		alert("cat called");
	}

	function rm(fileName) {
		alert("rm called");
	}

	function mkdir(dirName) {
		alert("mkdir called");
	}

	function rmdir(dirName) {
		alert("rmdir called");
	}

	function command(fs, cmd) {
		switch(cmd["comm"]) {
			case "ls":
				ls(fs);
			break;
			case "cd":
				cd(cmd["params"]);
			break;
			case "cat":
				cat(cmd["params"], cmd["mode"]);
			break;
			case "rm":
				rm(cmd["params"]);
			break;
			case "mkdir":
				mkdir(cmd["params"]);
			break;
			case "rmdir":
				rmdir(cmd["params"]);
			break;
			default:
				alert("Invalid Command name");
		}
	}

	function onInitFs(fs) {
		
		$("#clipboard").keydown(function() {
			if(event.which == 13 && pre == 0) {
				next_line();
				command(fs, cmd);
			}
		});

		/*fs.root.getFile("log.txt", {create: true, exclusive: false}, function(fileEntry) {

			fileEntry.createWriter(function(fileWriter) {
				fileWriter.onwriteend = function(e) {
					console.log("Write Completed!");
				};
				fileWriter.onerror = function(e) {
					console.log("Write failed: " + e.toString());
				};

				var blob = new Blob(['Lorem Ipsum'], {type: 'text/plain'});

				fileWriter.write(blob);
			}, errorHandler);

			fileEntry.file(function(file) {
				var reader = new FileReader();

				reader.onloadend = function(e) {
					var txtArea = document.createElement("textarea");
					txtArea.value = this.result;
					alert(this.result);
					document.body.appendChild(txtArea);
					console.log("read completed!");
				};

				reader.readAsText(file);
			}, errorHandler);
		}, errorHandler);
	//*/

  		console.log('Opened file system: ' + fs.name);
	}
	function errorHandler(e) {
  		var msg = '';
		  switch (e.code) {
		    case FileError.QUOTA_EXCEEDED_ERR:
		      msg = 'QUOTA_EXCEEDED_ERR';
		      break;
		    case FileError.NOT_FOUND_ERR:
		      msg = 'NOT_FOUND_ERR';
		      break;
		    case FileError.SECURITY_ERR:
		      msg = 'SECURITY_ERR';
		      break;
		    case FileError.INVALID_MODIFICATION_ERR:
		      msg = 'INVALID_MODIFICATION_ERR';
		      break;
		    case FileError.INVALID_STATE_ERR:
		      msg = 'INVALID_STATE_ERR';
		      break;
		    default:
		      msg = 'Unknown Error';
		      break;
  };
  console.log('Error: ' + msg);
}
	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	window.requestFileSystem(window.TEMPORARY, 5*1024*1024 /*5MB*/, onInitFs, errorHandler);
});
