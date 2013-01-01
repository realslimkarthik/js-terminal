var content, position;
var cmd = {"comm":"", "mode":"", "params":""};
var user;
var writeData = [];
var pre = 1, appendMode = 0;
var prompt = $('#prompt_blink');
var before = $('#before');
var after = $('#after');
var t, pause, wait=0;
var credentials = [];
var current = "/";

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
	$('div#line1').before(old_line);
	pre = 0;
}

function next_line()
{
	var line = $("#clipboard").val();
	if(appendMode == 0) {
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
	} else {
		old_line = "<div class='line'><span class='prompt'>" + line + "</span></div>";
	}
	$("#before").html("");
	$("#after").html("");
	$("#prompt_blink").html("");
	$('div#line1').before(old_line);
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
	$('div#line1').before("<div class='line'><span>Enter your Username:</span></div><br>");
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

	function toArray(list) {
		return Array.prototype.slice.call(list || [], 0);
	}

	function ls(fs, callBack) {
	    if (!fs) {
	      return;
	    }
	    var entries = [];
	    var reader = fs.root.createReader();

	    var readEntries = function() {
	      reader.readEntries(function(results) {
	        if (!results.length) {
	          entries = entries.sort();
	          callBack(entries);
	        } else {
	          entries = entries.concat(toArray(results));
	          readEntries();
	        }
	      }, errorHandler);
		};

	    readEntries();
	}

	function ls_callBack(entries) {
		var ent = "";
		if(entries.length != 0) {
			entries.forEach(function(entry){
				if(entry.isDirectory)
					ent += "<span><b style='color:#95D4F0;'>" + entry.name + "</b></span><br/>";
				else
					ent += "<span>" + entry.name + "</span><br/>";
			});
			var res = "<div class='res'>" + ent + "</div>"
		} else
			var res = "";
		$("div#line1").before(res);
	}

	function cd(fs, dirName) {
		alert("cd called");
	}

	function cat(fs, fileName, mode) {
			if(fileName)
			{
				if(mode == ">>")
				{
					appendMode = 1;
					$("#username").html("");
				}
				else {
					var readData;
					fs.root.getFile(fileName, {}, function(fileEntry) {
						fileEntry.file(function(file) {
							var reader = new FileReader();

							reader.onloadend = function(e) {
								readData = this.result;
								readData = readData.replace(/\n/g, "<br>");
								readData = "<span style='color:#22FF08;'>" + readData + "</span>"
								$("div#line1").before(readData);
							};

							reader.readAsText(file);
						}, catRmErrorHandler);
					}, catRmErrorHandler);
				}
			} else {
				var old_line = "<div class='line'><span class='prompt'>File name not specified!</span></div>";
				$('div#line1').before(old_line);
			}
	}

	function catWrite(fs, fileName, data) {
		fs.root.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
			fileEntry.createWriter(function(fileWriter) {
				fileWriter.onwriteend = function(e) {
					console.log("Write Completed!");
				};
				fileWriter.onerror = function(e) {
					console.log("Write failed: " + e.toString());
				};
				fileWriter.seek(fileWriter.length);
				var blob = new Blob(data, {type: 'text/plain'});
				fileWriter.write(blob);
			
			}, errorHandler);
		}, errorHandler);
		appendMode = 0;
	}

	function rm(fs, fileName) {
		fs.root.getFile(fileName, {create: false}, function(fileEntry) {
			fileEntry.remove(function() {
				console.log(fileName + " removed.");
			}, catRmErrorHandler);
		}, catRmErrorHandler);
	}

	function mkdir(fs, dirName) {
		var path = dirName.split('/');
		fs.root.getDirectory(dirName, {create: true, exclusive: true}, function(dirEntry) {
			if(path.length == 1)
				console.log(dirEntry.name + " created");

		}, catRmErrorHandler);
	}

	function rmdir(fs, dirName) {
		var path = dirName.split('/');
		fs.root.getDirectory(dirName, {create: false}, function(dirEntry) {
			if(path.length == 1)
			{
				dirEntry.remove(function() {
					console.log(dirEntry.name + " has been removed");
				}, catRmErrorHandler);
			}
		}, catRmErrorHandler);
	}

	function command(fs, cmd) {
		switch(cmd["comm"]) {
			case "ls":
				ls(fs, ls_callBack);
			break;
			case "cd":
				cd(fs, cmd["params"]);
			break;
			case "cat":
				cat(fs, cmd["params"], cmd["mode"]);
			break;
			case "rm":
				rm(fs, cmd["params"]);
			break;
			case "mkdir":
				mkdir(fs, cmd["params"]);
			break;
			case "rmdir":
				rmdir(fs, cmd["params"]);
			break;
			case "":
			break;
			default:
				var old_line = "<div class='line'><span class='prompt'>" + cmd["comm"] + ": command not found" + "</span></div>";
				$("div#line1").before(old_line);
		}
		$(document).scrollTop(1e4);
	}

	function onInitFs(fs) {
		
		$("#clipboard").keydown(function() {
			if(event.which == 13 && pre == 0) {
				next_line();
				if(appendMode == 0) {
						command(fs, cmd);
				} else {
					var lineData = $.trim($(this).val());
					if(lineData == "!" ) {
						catWrite(fs, cmd["params"], writeData);
						$("#username").html(user);
					}
					else
						writeData.push(lineData + "\n");
				}
				$(this).val("");
			}
		});

  		console.log('Opened file system: ' + fs.name);
	}


///////////////////////////////***** Error Handlers *****///////////////////////////////


	function catRmErrorHandler(e) {
		var msg = '';
		var old_line;
		  switch (e.code) {
		    case FileError.QUOTA_EXCEEDED_ERR:
		      msg = 'QUOTA_EXCEEDED_ERR';
		      break;
		    case FileError.NOT_FOUND_ERR:
		      msg = 'NOT_FOUND_ERR';
		      old_line = "<span class='prompt'>" + cmd["comm"] + ": " + cmd["params"] + ": No such file or directory found in current directory</span><br>";
		      $("div#line1").before(old_line);
		      break;
		    case FileError.SECURITY_ERR:
		      msg = 'SECURITY_ERR';
		      break;
		    case FileError.INVALID_MODIFICATION_ERR:
		      msg = 'INVALID_MODIFICATION_ERR';
		      if(cmd["params"].indexOf(".") + 1)
		      	old_line = "<span class='prompt'>" + cmd["comm"] + ": cannot create directory " + cmd["params"] + ": File Exists</span><br>";
		      else
		      	old_line = "<span class='prompt'>" + cmd["comm"] + ": cannot create directory " + cmd["params"] + ": Directory Exists</span><br>";
		      $("div#line1").before(old_line);
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


///////////////////////////////////////////////////////////////////////////////////////////


	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	window.requestFileSystem(window.TEMPORARY, 5*1024*1024 /*5MB*/, onInitFs, errorHandler);
});
