var argv =  require('optimist')
			.usage('Usage: $0 -c [column num] -d [delimeter] -f [filename]')
			.argv;

// Command Line Arguments
var colNum = argv.c || 0,
	delimeter = argv.d || ' ',
	file = argv.f,
 	ft = require('file-tail').startTailing(file),
 	fs = require('fs'),
 	savedKnownFile = './knownItems.json',
 	knownColumns = {};

fs.readFile(savedKnownFile, function(err, data){
	if(data == undefined) {
		knownColumns = {};
	} else {
		console.log('Loading from previous file... ');
		knownColumns = JSON.parse(data);
		console.log(knownColumns);
	}
});

// Monitor 'tail' of file
ft.on('line', function(line){

	column = line.split(delimeter)[colNum];

	if(column in knownColumns) {
		knownColumns[column]++;
	} else {
		console.log(column, 'not known.. adding to object.');
		knownColumns[column] = 1;
	}

	console.log(knownColumns);
});

process.on( 'SIGINT', function() {
	console.log('\nSaving to ', savedKnownFile);
	fs.writeFileSync(savedKnownFile, JSON.stringify(knownColumns));
	process.exit( );
})