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
var cmdList = ["ls", "cd", "cat", "rm", "mkdir", "rmdir", "pwd", "repo", "exit"];
var ctrl = false;
var possibilities = [];

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
	content = content.replace(" ", "&nbsp;");
	$('#before').html(content.substr(0,position));
	$('#after').html(content.substr(position+1,content.length-1));
	$('#prompt_blink').html(content.charAt(position));
}

function welcome() {
	user = $('#clipboard').val() + "-$ ";
	$('#username').html(user);
	$('#after').css('color', '#22FF08');
	var old_line = "<div class='line'><span class='prompt'>Welcome " + $('#clipboard').val(); + "</span><br>";
	old_line += "<span class='prompt'>Use the 'help' command to get a list of implemented commands</span></div><br><br>";
	$('#clipboard').val('');
	$('div#line1').before(old_line);
	pre = 0;
}

function next_line(line)
{
	var modLine = line.replace(/ /g, "&nbsp");
	if(appendMode == 0) {
		var old_line = "<div class='line'><span class='prompt'>" + user + " </span><span>" + modLine + "</span></div>";
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
	}
	else if(appendMode == 2) {
		old_line = "<div class='line'><span class='prompt'>" + user + "</span><span></span>" + $("#clipboard").val() + "</div>";
		old_line += "<div class='line'><span class='prompt'>" + modLine + "</span></div><br>";
	} else {
		old_line = "<div class='line'><span class='prompt'>" + modLine + "</span></div>";
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

function autoComplete(command) {
	possibilities = [];
	if(!(command.indexOf(" ") + 1)) {
		if(command.charAt(0) == "l")
			$("#clipboard").val("ls ");
		else if(command.match(/^e[xi]{0}/))
			$("#clipboard").val("exit ");
		else if(command.match(/^m[kdi]{0}/))
			$("#clipboard").val("mkdir ");
		else if(command.match(/^rmd[i]{0}/))
			$("#clipboard").val("rmdir ");
		else if(command.match(/^c[a]{1}/))
			$("#clipboard").val("cat ");
		else if(command.match(/^r[m]{0}/))
		{
			possibilities.push("rm");
			possibilities.push("rmdir");
		}
		else if(command.match(/^c/) && command.length == 1)
		{
			possibilities.push("cd");
			possibilities.push("cat");
		}
	}
}

$(document).ready(function() {
	$('div#line1').before("<div class='line'><span>Enter your Username:</span></div><br>");
	$('#username').html('Username:');
	get_data();
	$('#terminal').click(function() {
		$('#clipboard').focus();
		blink();
	});

	$('#clipboard').keydown(function(e) {
	content = $(this).val();
	if(event.which == 9 || event.keyCode == 9)
	{
		e.preventDefault();
	}
	clearTimeout(t);
	clearTimeout(pause);
	wait = 1;
	$('#prompt_blink').addClass('vis').removeClass('invi');
		var position = $('#clipboard').prop("selectionStart");
		if(position<=content.length-1)
			build_command(content,position);
		else
		{
			$('#before').html(content.replace(/ /g, "&nbsp;"));
			$('#prompt_blink').html('');
			$('#after').html('');
		}
	});

	$('#clipboard').keyup(function(e) {
      if((event.which == 9 || event.keyCode == 9)  && pre == 0)
		{
			e.preventDefault();
			autoComplete($(this).val());
			if(possibilities.length != 0) {
				var outPut = "";
				possibilities.forEach(function(entry) {
					outPut += entry + "                                             ";
				});
				outPut = $.trim(outPut);
				appendMode = 2;
				next_line(outPut);
				appendMode = 0;
			}
		}
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
			$('#before').html(content.replace(/ /g, "&nbsp;"));
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
	    fs.root.getDirectory(current, {}, function(dirEntry) {
		    var reader = dirEntry.createReader();

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
		}, errorHandler);
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
		if(dirName == "..") {
			var pos = current.lastIndexOf("/");
			current = current.substr(0, pos) + "/";
		}
		else if(dirName == "/")
			current = "/";
		else {
			fs.root.getDirectory(dirName + "/", {}, function(dirEntry) {
				current = dirEntry.fullPath;
			}, catRmErrorHandler);
		}
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
					if(fileName.charAt(0) != "/")
						fileName = current + fileName;
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
		if(fileName.charAt(0) != "/")
			fileName = current + fileName;
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
		if(fileName.charAt(0) != "/")
			fileName = current + fileName;
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

	function pwd() {
		var old_line = "<div class='line'><span class='prompt'>" + current + "</span></div>";
		$("div#line1").before(old_line);
	}
	function help() {
		var old_line = "<div class='line'><span class='prompt'>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" + cmdList[0] + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" + cmdList[1] + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" + cmdList[2] + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" + cmdList[3] + "</span></div><br>";
		old_line +=  "<div class='line'><spam class='prompt'>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" + cmdList[4] + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" + cmdList[5] + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" + cmdList[6] + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" +cmdList[7] + "</span></div><br>";
		$("div#line1").before(old_line);
	}

	function repo() {
		var old_line = "<div class='line'><span class='prompt'>Github repo is at <a href='https://github.com/realslimkarthik/js-terminal'>https://github.com/realslimkarthik/js-terminal</a></span></div><br>";
		$("div#line1").before(old_line);
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
			case "pwd":
				pwd();
			break;
			case "help":
				help();
			break;
			case "repo":
				repo();
			break;
			case "exit":
				window.close();
			break;
			case "":
			break;
			default:
				var old_line = "<div class='line'><span class='prompt'>" + cmd["comm"] + ": command not found" + "</span></div>";
				$("div#line1").before(old_line);
		}
		$(document).scrollTop(1e4);
	}


$("#clipboard").keydown(function(e){
	if(e.keyCode == 17)
		ctrl = true;
}).keyup(function(e) {
	if(e.keyCode == 17)
		ctrl = false;
});

	function onInitFs(fs) {
		
		$("#clipboard").keydown(function(e) {
			if(e.keyCode == 67 && ctrl == true && appendMode == 1) {
				writeData.push($.trim($(this).val()));
				catWrite(fs, cmd["params"], writeData);
				$("#username").html(user);
				return false;
				$(this).val("");
			}
			if(e.keyCode == 13 && pre == 0) {
				next_line($(this).val());
				if(appendMode == 0) {
						command(fs, cmd);
				} else {
					var lineData = $.trim($(this).val());		
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
			      if(cmd["comm"] == "mkdir")
			      {
			      	if(cmd["params"].indexOf(".") + 1)
			      		old_line = "<span class='prompt'>" + cmd["comm"] + ": cannot create directory " + cmd["params"] + ": File Exists</span><br>";
			      	else
			      	   	old_line = "<span class='prompt'>" + cmd["comm"] + ": cannot create directory " + cmd["params"] + ": Directory Exists</span><br>";
			      }
			      else if(cmd["comm"] == "rmdir")
			      {
			      	old_line = "<span class='prompt'>" + cmd["comm"] + ": failed to remove directory '" + cmd["params"] + "/': Directory not empty</span><br>";
			      }
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
