var argv =  require('optimist')
			.usage('Usage: $0 -c [column num] -d [delimeter] -f [filename]')
			.argv;

var fs = require('fs');
var colors = require('colors');
var keypress = require('keypress')
var tty = require('tty');
var Table = require('cli-table');
var readline = require('readline');
var ft = require('file-tail');

// Command Line Arguments
var colNum = argv.c || null;
var delimeter = argv.d || ' ';
var file = argv.f || null;
var savedKnownFile = './savedData.json';
var savedTableFile = 'tabularData.txt';

// Prevents 0 becoming null if you want to select the first column. Count from one instead of zero now.
colNum = colNum - 1;

var	knownColumns = {};


// Help Text
if(argv.help || argv.h) {
	var help = "\n======================================================================\n" +
			"File Watcher is an application that monitors a 'tabular'\n" +
			"text file and counts how many times a string is\n" +
			"mentioned within a column in total in the table.\n\n" +
			"Usage (watch file):\n" +
			"\t./watcher -c [column num] -d [delimeter] -f [filename]\n" +
			"Usage (watch stdin):\n" +
			"\ttail -F access.log | ./watcher -c [column num] -d [delimeter]\n\n" +
			"Ctrl-T: Shows a tabular summary of collected data.\n" +
			"Ctrl-S: Saves the data in a JSON object to a file.\n" +
			"======================================================================\n";

	console.log(help);
	process.exit();
}

keypress(process.stdin);


function createTable(clrs) {

	if(clrs == true) {
		var table = new Table({
		    head: ['Column Name', 'Count'],
		    colWidths: [50, 15]
	    });
	} else {
		var table = new Table({
		    head: ['Column Name', 'Count'],
		    colWidths: [50, 15],
	        style: {
	            head: [],
	            border: []
	        }
	    });	
	}


	// Convert data to table-friendly format.
	var kca = JSON.stringify(knownColumns).split(',').map(function(str){
		str = str.replace('{','');
		str = str.replace('}','');
		str = str.replace('/\"/g','');
		str = str.split(':');
		str[1] = parseInt(str[1]);
		return str;
	}).sort(function(a, b) {

		    var valueA, valueB;

		    valueA = a[1]; 
		    valueB = b[1];
		    if (valueA < valueB) {
		        return -1;
		    }
		    else if (valueA > valueB) {
		        return 1;
		    }
		    return 0;

	}).reverse().map(function(arrItem){
		table.push(arrItem);
		return arrItem;
	});

	return table.toString();
}

// Keypresses
process.stdin.on('keypress', function (ch, key) {

	if (key && key.ctrl && key.name == 'c') {
		process.exit();
	}

	if (key && key.ctrl && key.name == 't') {

		console.log('==========================================================\nShowing Summary of Collected Data:\n');

		console.log(createTable(true));
	}

	if (key && key.ctrl && key.name == 's') {
		console.log('\nSaving JSON to ', savedKnownFile);
		fs.writeFileSync(savedKnownFile, JSON.stringify(knownColumns));
	}

	if (key && key.ctrl && key.name == 'd') {
		console.log('\nSaving Table to ', savedTableFile);
		fs.writeFileSync(savedTableFile, createTable(false), {'encoding': 'utf8'});
	}

});

if (typeof process.stdin.setRawMode == 'function') {
  process.stdin.setRawMode(true);
}
process.stdin.resume();

function handleLine(line) {

	if(colNum !== null) {
		column = line.split(delimeter)[colNum];
	} else {
		column = line;
	}

	if(column in knownColumns) {
		knownColumns[column]++;
		console.log(colors.gray(column + ' (' + knownColumns[column] + ')'));
	} else {
		console.log('New!! '.red, column);
		knownColumns[column] = 1;
	}		

}

function readFile() {
	ft = ft.startTailing(file);
	console.log('Reading from file: ', file);

	// Monitor 'tail' of file
	ft.on('line', handleLine);

}

function readstdin() {
	console.log('Reading from STDIN: ');

	var rl = readline.createInterface({
	  input: process.stdin,
	  output: process.stdout,
	  terminal: false
	});

	rl.on('line', handleLine);
}

if(argv.f) {
	readFile();
} else {
	readstdin();
}