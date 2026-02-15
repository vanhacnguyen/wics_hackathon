#!/usr/bin/perl

# -------------------------------------
# use declarations
# -------------------------------------

use strict "vars";
use strict "refs";
use strict "subs";

# -------------------------------------
# constants
# -------------------------------------

my $MAX_LENGTH = 20;
my $MAX_PARAMS = 20;

my $CLASS_PATH = "/var/www/data";
my $DATA_FILE = "/var/www/data/SantaClara.csv";

# -------------------------------------
# globals
# -------------------------------------

my %g_params;

# -------------------------------------
# main
# -------------------------------------

# read CGI paramaters
&getParams();

# get the count of valid paramaters
my $count = 0;

# validate CGI params
foreach my $param (keys %g_params) {
    my $value = $g_params{$param};
    # check if key/value strings are too big
    if (length($param) > $MAX_LENGTH) {
        &error("param is too large");
    }
    if (length($value) > $MAX_LENGTH) {
        &error("key is too large");
    }
    # guard against injection attacks
    if ($param =~ /[^\p{L}0-9\s\+]/) {
        &error("illegal param");
    }
    if ($value =~ /[^\p{L}0-9\s\+]/) {
        &error("illegal value");
    }
    $count++;
}

# check if number of params is too big
if ($count > $MAX_PARAMS) {
    &error("too many parameters");
}

# check the number of params
if ($count > 0) {
    # http header for json data
    print "Content-Type: application/json\r\n";
    print "Access-Control-Allow-Origin: *\r\n\r\n";

    # create the command
    my $cmd = "/usr/bin/java -cp $CLASS_PATH Backend -f $DATA_FILE ";

    # add key/value arguments
    foreach my $param (keys %g_params) {
        my $value = $g_params{$param};
        # skip key/value where the value is empty
        if (length($value) > 0) {
            $cmd = $cmd . " -key $param -value $value";
        }
    }

    # execute the command and display the output
    my $result = `$cmd 2>&1`;
    print $result;

# otherwise print html test page
} else {
    print "Content-type: text/html\r\n\r\n";

    print "<html><body>\n";
    print "<p>This is the test front end, html search form\n";
    print "<form method=\"get\" action=\"/cgi-bin/hack.cgi\">\n";
    print "<label for=\"city\">City:</label><br>\n";
    print "<input type=\"text\" name=\"city\"><br>\n";
    print "<label for=\"lang\">Language:</label><br>\n";
    print "<input type=\"text\" name=\"lang\"><br>\n";
    print "<input type=\"submit\" value=\"Submit\"><br>\n";
    print "</form>\n";
    print "</body></html>\n";
}

exit(0);

# -------------------------------------
# print html error page and exit
# -------------------------------------

sub error {
    my ($mesg) = @_;
    print "Content-type: text/html\r\n\r\n";
    print "<html><head><meta charset='UTF-8'></head>\n";
    print "<body>\n";
    print "<h1>Error: $mesg\n";
    print "</body>\n";
    print "</html>\n";
    exit(0);
}

# -------------------------------------
# read CGI params for both get and post
# -------------------------------------

sub getParams {
    my $data = $ENV{'QUERY_STRING'};
    &updateParams($data);
    read(STDIN, $data, $ENV{'CONTENT_LENGTH'});
    &updateParams($data);
}

sub updateParams {
    my ($data) = @_;
    my @pairs = split(/&/, $data);
    foreach my $pair (@pairs) {
        my ($name, $value) = split(/=/, $pair);
        $name =~ s/%([A-Fa-f\d]{2})/chr hex $1/eg;
        $value =~ s/%([A-Fa-f\d]{2})/chr hex $1/eg;
        $g_params{$name} = $value;
    }
}
