# macOS-defaults

##Usage

```
const macOSDefaults = require('macOS-defaults');

macOS-defaults.write('domain_name', 'key', 'value', function(stdout){
  console.log(stdout)
})
macOS-defaults.writeSync('domain_name', 'key', 'value', function(stdout){
  console.log(stdout)
})

macOS-defaults('write','domain_name', 'key', 'value', function(stdout){
  console.log(stdout)
})
macOS-defaults('writeSync', 'domain_name', 'key', 'value', function(stdout){
  console.log(stdout)
})
```

## todo

- handle options with nopt
- handle multiple input types (obj, array, json?) and convert to command sting



## resources

https://www.freebsd.org/cgi/man.cgi?query=defaults&apropos=0&sektion=0&manpath=FreeBSD+11.0-RELEASE+and+Ports&arch=default&format=html
http://man.cx/defaults(1)
https://developer.apple.com/legacy/library/documentation/Darwin/Reference/ManPages/man1/defaults.1.html
```
$ man defaults

DEFAULTS(1)               BSD General Commands Manual              DEFAULTS(1)

NAME
     defaults -- access the Mac OS X user defaults system

SYNOPSIS
     defaults [-currentHost | -host hostname] read [domain [key]]

     defaults [-currentHost | -host hostname] read-type domain key

     defaults [-currentHost | -host hostname] write domain { 'plist' | key 'value' }

     defaults [-currentHost | -host hostname] rename domain old_key new_key

     defaults [-currentHost | -host hostname] delete [domain [key]]

     defaults [-currentHost | -host hostname] { domains | find word | help }

DESCRIPTION
     Defaults allows users to read, write, and delete Mac OS X user defaults from a command-line shell. Mac OS X applications and other programs
     use the defaults system to record user preferences and other information that must be maintained when the applications aren't running (such
     as default font for new documents, or the position of an Info panel). Much of this information is accessible through an application's Prefer-
     ences panel, but some of it isn't, such as the position of the Info panel. You can access this information with defaults

     Note: Since applications do access the defaults system while they're running, you shouldn't modify the defaults of a running application. If
     you change a default in a domain that belongs to a running application, the application won't see the change and might even overwrite the
     default.

     User defaults belong to domains, which typically correspond to individual applications. Each domain has a dictionary of keys and values rep-
     resenting its defaults; for example, "Default Font" = "Helvetica". Keys are always strings, but values can be complex data structures com-
     prising arrays, dictionaries, strings, and binary data. These data structures are stored as XML Property Lists.

     Though all applications, system services, and other programs have their own domains, they also share a domain named NSGlobalDomain.  If a
     default isn't specified in the application's domain, but is specified in NSGlobalDomain, then the application uses the value in that domain.

     The commands are as follows:

     read         Prints all of the user's defaults, for every domain, to standard output.

     read domain  Prints all of the user's defaults for domain to standard output.

     read domain key
                  Prints the value for the default of domain identified by key.

     read-type domain key
                  Prints the plist type for the given domain identified by key.

     write domain key 'value'
                  Writes value as the value for key in domain.  value must be a property list, and must be enclosed in single quotes.  For exam-
                  ple:

                        defaults write com.companyname.appname "Default Color" '(255, 0, 0)'

                  sets the value for Default Color to an array containing the strings 255, 0, 0 (the red, green, and blue components). Note that
                  the key is enclosed in quotation marks because it contains a space.

     write domain 'plist'
                  Overwrites the defaults information in domain with that given as plist.  plist must be a property list representation of a dic-
                  tionary, and must be enclosed in single quotes.  For example:

                        defaults write com.companyname.appname '{ "Default Color" = (255, 0, 0);
                                                        "Default Font" = Helvetica; }';

                  erases any previous defaults for com.companyname.appname and writes the values for the two names into the defaults system.

     delete domain
                  Removes all default information for domain.

     delete domain key
                  Removes the default named key from domain.

     domains      Prints the names of all domains in the user's defaults system.

     find word    Searches for word in the domain names, keys, and values of the user's defaults, and prints out a list of matches.

     help         Prints a list of possible command formats.

OPTIONS
     Specifying domains:

     domain    If no flag is specified, domain is a domain name of the form com.companyname.appname.  Example:

                     defaults read com.apple.TextEdit

     -app application
               The name of an application may be provided instead of a domain using the -app flag. Example:

                     defaults read -app TextEdit

     filepath  Domains may also be specified as a path to an arbitrary plist file, with or without the '.plist' extension. For example:

                     defaults read ~/Library/Containers/com.apple.TextEdit/Data/Library/Preferences/com.apple.TextEdit.plist

               normally gives the same result as the two previous examples.  In the following example:

                     defaults write ~/Desktop/TestFile foo bar

               will write the key 'foo' with the value 'bar' into the plist file 'TestFile.plist' that is on the user's desktop. If the file does
               not exist, it will be created. If it does exist, the key-value pair will be added, overwriting the value of 'foo' if it already
               existed.

               WARNING: The defaults command will be changed in an upcoming major release to only operate on preferences domains. General plist
               manipulation utilities will be folded into a different command-line program.

     -g | -globalDomain | NSGlobalDomain
               Specify the global domain. '-g' and '-globalDomain' may be used as synonyms for NSGlobalDomain.

     Specifying value types for preference keys:

                 If no type flag is provided, defaults will assume the value is a string. For best results, use one of the type flags, listed
                 below.

     -string     Allows the user to specify a string as the value for the given preference key.

     -data       Allows the user to specify a bunch of raw data bytes as the value for the given preference key.  The data must be provided in
                 hexidecimal.

     -int[eger]  Allows the user to specify an integer as the value for the given preference key.

     -float      Allows the user to specify a floating point number as the value for the given preference key.

     -bool[ean]  Allows the user to specify a boolean as the value for the given preference key.  Value must be TRUE, FALSE, YES, or NO.

     -date       Allows the user to specify a date as the value for the given preference key.

     -array      Allows the user to specify an array as the value for the given preference key:

                       defaults write somedomain preferenceKey -array element1 element2 element3

                 The specified array overwrites the value of the key if the key was present at the time of the write. If the key was not present,
                 it is created with the new value.

     -array-add  Allows the user to add new elements to the end of an array for a key which has an array as its value. Usage is the same as -array
                 above. If the key was not present, it is created with the specified array as its value.

     -dict       Allows the user to add a dictionary to the defaults database for a domain.  Keys and values are specified in order:

                       defaults write somedomain preferenceKey -dict key1 value1 key2 value2

                 The specified dictionary overwrites the value of the key if the key was present at the time of the write. If the key was not
                 present, it is created with the new value.

     -dict-add   Allows the user to add new key/value pairs to a dictionary for a key which has a dictionary as its value. Usage is the same as
                 -dict above. If the key was not present, it is created with the specified dictionary as its value.

     Specifying a host for preferences:

     Operations on the defaults database normally apply to any host the user may log in on, but may be restricted to apply only to a specific
     host.

               If no host is provided, preferences operations will apply to any host the user may log in on.

     -currentHost
               Restricts preferences operations to the host the user is currently logged in on.

     -host hostname
               Restricts preferences operations to hostname.

BUGS
     Defaults can be structured in very complex ways, making it difficult for the user to enter them with this command.

HISTORY
     First appeared in NeXTStep.

Mac OS X                          Nov 3, 2003                         Mac OS X

```


```
$ defaults help

Command line interface to a user's defaults.
Syntax:

'defaults' [-currentHost | -host <hostname>] followed by one of the following:

  read                                 shows all defaults
  read <domain>                        shows defaults for given domain
  read <domain> <key>                  shows defaults for given domain, key

  read-type <domain> <key>             shows the type for the given domain, key

  write <domain> <domain_rep>          writes domain (overwrites existing)
  write <domain> <key> <value>         writes key for domain

  rename <domain> <old_key> <new_key>  renames old_key to new_key

  delete <domain>                      deletes domain
  delete <domain> <key>                deletes key in domain

  import <domain> <path to plist>      writes the plist at path to domain
  import <domain> -                    writes a plist from stdin to domain
  export <domain> <path to plist>      saves domain as a binary plist to path
  export <domain> -                    writes domain as an xml plist to stdout
  domains                              lists all domains
  find <word>                          lists all entries containing word
  help                                 print this help

<domain> is ( <domain_name> | -app <application_name> | -globalDomain )
         or a path to a file omitting the '.plist' extension

<value> is one of:
  <value_rep>
  -string <string_value>
  -data <hex_digits>
  -int[eger] <integer_value>
  -float  <floating-point_value>
  -bool[ean] (true | false | yes | no)
  -date <date_rep>
  -array <value1> <value2> ...
  -array-add <value1> <value2> ...
  -dict <key1> <value1> <key2> <value2> ...
  -dict-add <key1> <value1> ...


```
