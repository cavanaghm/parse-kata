#!/usr/bin/perl

use threads;

$num_args = $#ARGV + 1;
if ($num_args != 2) {
    print "\nUsage: name.pl first_name last_name\n";
    exit;
}

$input_path=$ARGV[0];
$output_path=$ARGV[1];


open INPUT_FILE, "<", $input_path
or die "$!\n";
print "Reading from $input_path\n";

open FILE_OUT, ">>", $output_path
or die "$!\n";
print "Writing into $output_path\n";

while ($line = <INPUT_FILE>){
	$line = substr $line, (index ($line, "\"title\": \"") + 10);
	$titleEnd = index $line, "\"";
	$line = substr $line, 0, $titleEnd;
	print FILE_OUT "$line\n";
}

#while ($line = <INPUT_FILE>){
#	#$line =~ /(?<="title": ")([a-z]|[A-Z]|\s)*/;
#	$nextTitle = index ($line, "\"title\": \"");
#	$titleStart = $nextTitle + 10;
#	$titleEnd = index ((substr $line, $titleStart), "\"");
#	$title = substr $line, $titleStart, $titleEnd;
#	print FILE_OUT "$title\n";
#	#$line =~ /(?<=tle": ").+?(?=")/;
#	#print FILE_OUT "$&\n";
#}

while ($line = <INPUT_FILE>){}

close INPUT_FILE;
close OUTPUT_FILE;
