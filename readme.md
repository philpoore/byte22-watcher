#File Watcher

Small application that monitors the tail of a file specified, or through stdin and allows you to monitor and count occurrences of a column on each line. For example, counting the number of referrers in a website access log.

###Usage

```Shell
./watcher -c [colNum] -d [delimeter] -f [filename]
```

+ colNum is the number of delimeters to skip past (counts from 0)
	For example using -c 2 on a line like "Col1 Col2 Col3 Col4" would return just "Col3" for each line.
+ delimeter is what each column is seperated by, default is a single space character - ' '.
+ filename is the path of the file, if -f is not specified, File Watcher will use stdin.

###Examples

The following command would extract the third column from each line of a file called 'access.log':
```Shell
	./watcher -c 2 -f access.log
```
The following command would extract the tenth column from stdin:
```Shell
	cat access.log | ./watcher -c 9
```

This command uses tail to follow the end of the file and pipe in to File Watcher to find the 16th column
```Shell
	tail -F access.log | node . -c 15
```