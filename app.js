var argv =  require('optimist')
			.usage('Usage: $0 -c [column num] -d [delimeter] -f [filename]')
			.argv;

// Command Line Arguments
var colNum = argv.c || null;
var delimeter = argv.d || ' ';
var file = argv.f || null;
var fs = require('fs');
var savedKnownFile = './knownItems.json';
var	knownColumns = {};

function readFile() {
	var ft = require('file-tail').startTailing(file);
	console.log('Reading from file: ', file);

	// Monitor 'tail' of file
	ft.on('line', function(line){

		if(colNum !== null) {
			column = line.split(delimeter)[colNum];
		} else {
			column = line;
		}

		if(column in knownColumns) {
			knownColumns[column]++;
		} else {
			console.log(column, 'not known.. adding to object.');
			knownColumns[column] = 1;
		}

		console.log(knownColumns);
	});
}

function readstdin() {
	console.log('Reading from STDIN..');

	var readline = require('readline');
	var rl = readline.createInterface({
	  input: process.stdin,
	  output: process.stdout
	});

	rl.on('line', function(line){
		if(colNum !== null) {
			column = line.split(delimeter)[colNum];
		} else {
			column = line;
		}

		if(column in knownColumns) {
			knownColumns[column]++;
		} else {
			console.log(column, 'not known.. adding to object.');
			knownColumns[column] = 1;
		}

		console.log(knownColumns);
	});

	console.log('\n\n', knownColumns, '\n\n');
}

if(argv.f) {
	readFile();
} else {
	readstdin();
}

process.on( 'SIGINT', function() {
	console.log('\nSaving to ', savedKnownFile);
	fs.writeFileSync(savedKnownFile, JSON.stringify(knownColumns));
	process.exit( );
})