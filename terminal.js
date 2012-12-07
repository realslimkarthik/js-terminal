var cmd, content, position;
var user;
var pre = 1;
var prompt = $('#prompt_blink');
var before = $('#before');
var after = $('#after');
var t,pause,wait=0;
//var o/p = "<div class='output'><span class='response'>" + response + "</span></div>";
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
	var old_line = "<div class='line'><span class='prompt'>" + user + " </span><span>" + $('#clipboard').val(); + "</span></div>";
	$('#clipboard').val('');
	$('div.line1').before(old_line);
}

function get_data(param)
{
	$('#username').html(param);
	$('#clipboard').keyup(function() {
		if(event.which==37)
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
	get_data('Username:');
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
		if(event.which==13 && pre==0)
			next_line();
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
});
