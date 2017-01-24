import test from 'ava';
import m from './';




  var nopt = require('nopt')

  var conf = nopt(types, shorthands)

// var knownOpts = {
//   "-string": String,
//   "-data": String,
//   "-integer": Number, //shorthand already handled
//   "-float" : Number,
//   "-boolean" Boolean, //shorthand already handled
//   "-date" : Date,
//   "-array": [String, Array],
//   "-array-add": [String, Array],
//   "-dict": [String, Array],
//   "-dict-add": [String, Array]
//   "-app": String,
//   "-host": String
//   "-app" :String
// }
// var shortHands = { "-globalDomain" : ""}



// defaults write-sync domain 'plist'
test.todo("defaults write-sync domain 'plist'")
test("defaults write-sync domain 'plist'", t => {
  // m(write-sync domain 'plist')
  // m(write-sync domain 'plist')
  // m(write-sync domain 'plist')
  // m(write-sync domain 'plist')

});

// defaults write domain 'plist'
test.todo("defaults write domain 'plist'")
test("defaults write domain 'plist'", t => {
  // m(write domain 'plist')
  // m(write domain 'plist')
  // m(write domain 'plist')
  // m(write domain 'plist')
});

// defaults -currentHost write-sync domain 'plist'
test.todo("defaults -currentHost write-sync domain 'plist'")
test("defaults -currentHost write-sync domain 'plist'", t => {
  // m(-currentHost write-sync domain 'plist')
  // m(-currentHost write-sync domain 'plist')
  // m(-currentHost write-sync domain 'plist')
  // m(-currentHost write-sync domain 'plist')
});

// defaults -currentHost write domain 'plist'
test.todo("defaults -currentHost write domain 'plist'")
test("defaults -currentHost write domain 'plist'", t => {
  // m(-currentHost write domain 'plist')
  // m(-currentHost write domain 'plist')
  // m(-currentHost write domain 'plist')
  // m(-currentHost write domain 'plist')
});

// defaults -host hostname write-sync domain 'plist'
test.todo("defaults -host hostname write-sync domain 'plist'")
test("defaults -host hostname write-sync domain 'plist'", t => {
  // m(-host hostname write-sync domain 'plist')
  // m(-host hostname write-sync domain 'plist')
  // m(-host hostname write-sync domain 'plist')
  // m(-host hostname write-sync domain 'plist')
});

// defaults -host hostname write domain 'plist'
test.todo("defaults -host hostname write domain 'plist'")
test("defaults -host hostname write domain 'plist'", t => {
  // m(-host hostname write domain 'plist')
  // m(-host hostname write domain 'plist')
  // m(-host hostname write domain 'plist')
  // m(-host hostname write domain 'plist')
})

// defaults write-sync domain key 'value'
test.todo("defaults write-sync domain key 'value'")
test("defaults write-sync domain key 'value'", t => {
  // m(write-sync domain key 'value')
  // m(write-sync domain key 'value')
  // m(write-sync domain key 'value')
  // m(write-sync domain key 'value')
});

// defaults write domain key 'value'
test.todo("defaults write domain key 'value'")
test("defaults write domain key 'value'", t => {
  // m(write domain key 'value')
  // m(write domain key 'value')
  // m(write domain key 'value')
  // m(write domain key 'value')
});

// defaults -currentHost write-sync domain key 'value'
test.todo("defaults -currentHost write-sync domain key 'value'")
test("defaults -currentHost write-sync domain key 'value'", t => {
  // m(-currentHost write-sync domain key 'value')
  // m(-currentHost write-sync domain key 'value')
  // m(-currentHost write-sync domain key 'value')
  // m(-currentHost write-sync domain key 'value')
});

// defaults -currentHost write domain key 'value'
test.todo("defaults -currentHost write domain key 'value'")
test("defaults -currentHost write domain key 'value'", t => {
  // m(-currentHost write domain key 'value')
  // m(-currentHost write domain key 'value')
  // m(-currentHost write domain key 'value')
  // m(-currentHost write domain key 'value')
});

// defaults -host hostname write-sync domain key 'value'
test.todo("defaults -host hostname write-sync domain key 'value'")
test("defaults -host hostname write-sync domain key 'value'", t => {
  // m(-host hostname write-sync domain key 'value')
  // m(-host hostname write-sync domain key 'value')
  // m(-host hostname write-sync domain key 'value')
  // m(-host hostname write-sync domain key 'value')
});

// defaults -host hostname write domain key 'value'
test.todo("defaults -host hostname write domain key 'value'")
test("defaults -host hostname write domain key 'value'", t => {
  // m(-host hostname write domain key 'value')
  // m(-host hostname write domain key 'value')
  // m(-host hostname write domain key 'value')
  // m(-host hostname write domain key 'value')
})

// defaults read-sync domain
test.todo("defaults read-sync domain")
test("defaults read-sync domain", t => {
  // m(read-sync domain)
  // m(read-sync domain)
  // m(read-sync domain)
  // m(read-sync domain)
  var test_function = function(){
  console.log("test_function_args", arguments)
}
// var read_args = ["a","b", test_function];
// m.readSync.apply(m, read_args)
// m['read-sync'].apply(m, read_args)

});

// defaults read domain
test.todo("defaults read domain")
test("defaults read domain", t => {

var read_args = ["NSGlobalDomain"];

m.readSync.apply(m, read_args)


  // m(read domain)
  // m(read domain)
  // m(read domain)
  // m(read domain)
});

// defaults -currentHost read-sync domain
test.todo("defaults -currentHost read-sync domain")
test("defaults -currentHost read-sync domain", t => {
  // m(-currentHost read-sync domain)
  // m(-currentHost read-sync domain)
  // m(-currentHost read-sync domain)
  // m(-currentHost read-sync domain)
});

// defaults -currentHost read domain
test.todo("defaults -currentHost read domain")
test("defaults -currentHost read domain", t => {
  // m(-currentHost read domain)
  // m(-currentHost read domain)
  // m(-currentHost read domain)
  // m(-currentHost read domain)
});

// defaults -host hostname read-sync domain
test.todo("defaults -host hostname read-sync domain")
test("defaults -host hostname read-sync domain", t => {
  // m(-host hostname read-sync domain)
  // m(-host hostname read-sync domain)
  // m(-host hostname read-sync domain)
  // m(-host hostname read-sync domain)
});

// defaults -host hostname read domain
test.todo("defaults -host hostname read domain")
test("defaults -host hostname read domain", t => {
  // m(-host hostname read domain)
  // m(-host hostname read domain)
  // m(-host hostname read domain)
  // m(-host hostname read domain)
})

// defaults read-sync domain key
test.todo("defaults read-sync domain key")
test("defaults read-sync domain key", t => {
  // m(read-sync domain key)
  // m(read-sync domain key)
  // m(read-sync domain key)
  // m(read-sync domain key)
});

// defaults read domain key
test.todo("defaults read domain key")
test("defaults read domain key", t => {
  // m(read domain key)
  // m(read domain key)
  // m(read domain key)
  // m(read domain key)
});

// defaults -currentHost read-sync domain key
test.todo("defaults -currentHost read-sync domain key")
test("defaults -currentHost read-sync domain key", t => {
  // m(-currentHost read-sync domain key)
  // m(-currentHost read-sync domain key)
  // m(-currentHost read-sync domain key)
  // m(-currentHost read-sync domain key)
});

// defaults -currentHost read domain key
test.todo("defaults -currentHost read domain key")
test("defaults -currentHost read domain key", t => {
  // m(-currentHost read domain key)
  // m(-currentHost read domain key)
  // m(-currentHost read domain key)
  // m(-currentHost read domain key)
});

// defaults -host hostname read-sync domain key
test.todo("defaults -host hostname read-sync domain key")
test("defaults -host hostname read-sync domain key", t => {
  // m(-host hostname read-sync domain key)
  // m(-host hostname read-sync domain key)
  // m(-host hostname read-sync domain key)
  // m(-host hostname read-sync domain key)
});

// defaults -host hostname read domain key
test.todo("defaults -host hostname read domain key")
test("defaults -host hostname read domain key", t => {
  // m(-host hostname read domain key)
  // m(-host hostname read domain key)
  // m(-host hostname read domain key)
  // m(-host hostname read domain key)
})

// defaults read-type-sync domain key
test.todo("defaults read-type-sync domain key")
test("defaults read-type-sync domain key", t => {
  // m(read-type-sync domain key)
  // m(read-type-sync domain key)
  // m(read-type-sync domain key)
  // m(read-type-sync domain key)
});

// defaults read-type domain key
test.todo("defaults read-type domain key")
test("defaults read-type domain key", t => {
  // m(read-type domain key)
  // m(read-type domain key)
  // m(read-type domain key)
  // m(read-type domain key)
});

// defaults -currentHost read-type-sync domain key
test.todo("defaults -currentHost read-type-sync domain key")
test("defaults -currentHost read-type-sync domain key", t => {
  // m(-currentHost read-type-sync domain key)
  // m(-currentHost read-type-sync domain key)
  // m(-currentHost read-type-sync domain key)
  // m(-currentHost read-type-sync domain key)
});

// defaults -currentHost read-type domain key
test.todo("defaults -currentHost read-type domain key")
test("defaults -currentHost read-type domain key", t => {
  // m(-currentHost read-type domain key)
  // m(-currentHost read-type domain key)
  // m(-currentHost read-type domain key)
  // m(-currentHost read-type domain key)
});

// defaults -host hostname read-type-sync domain key
test.todo("defaults -host hostname read-type-sync domain key")
test("defaults -host hostname read-type-sync domain key", t => {
  // m(-host hostname read-type-sync domain key)
  // m(-host hostname read-type-sync domain key)
  // m(-host hostname read-type-sync domain key)
  // m(-host hostname read-type-sync domain key)
});

// defaults -host hostname read-type domain key
test.todo("defaults -host hostname read-type domain key")
test("defaults -host hostname read-type domain key", t => {
  // m(-host hostname read-type domain key)
  // m(-host hostname read-type domain key)
  // m(-host hostname read-type domain key)
  // m(-host hostname read-type domain key)
})

// defaults rename-sync domain old_key new_key
test.todo("defaults rename-sync domain old_key new_key")
test("defaults rename-sync domain old_key new_key", t => {
  // m(rename-sync domain old_key new_key)
  // m(rename-sync domain old_key new_key)
  // m(rename-sync domain old_key new_key)
  // m(rename-sync domain old_key new_key)
});

// defaults rename domain old_key new_key
test.todo("defaults rename domain old_key new_key")
test("defaults rename domain old_key new_key", t => {
  // m(rename domain old_key new_key)
  // m(rename domain old_key new_key)
  // m(rename domain old_key new_key)
  // m(rename domain old_key new_key)
});

// defaults -currentHost rename-sync domain old_key new_key
test.todo("defaults -currentHost rename-sync domain old_key new_key")
test("defaults -currentHost rename-sync domain old_key new_key", t => {
  // m(-currentHost rename-sync domain old_key new_key)
  // m(-currentHost rename-sync domain old_key new_key)
  // m(-currentHost rename-sync domain old_key new_key)
  // m(-currentHost rename-sync domain old_key new_key)
});

// defaults -currentHost rename domain old_key new_key
test.todo("defaults -currentHost rename domain old_key new_key")
test("defaults -currentHost rename domain old_key new_key", t => {
  // m(-currentHost rename domain old_key new_key)
  // m(-currentHost rename domain old_key new_key)
  // m(-currentHost rename domain old_key new_key)
  // m(-currentHost rename domain old_key new_key)
});

// defaults -host hostname rename-sync domain old_key new_key
test.todo("defaults -host hostname rename-sync domain old_key new_key")
test("defaults -host hostname rename-sync domain old_key new_key", t => {
  // m(-host hostname rename-sync domain old_key new_key)
  // m(-host hostname rename-sync domain old_key new_key)
  // m(-host hostname rename-sync domain old_key new_key)
  // m(-host hostname rename-sync domain old_key new_key)
});

// defaults -host hostname rename domain old_key new_key
test.todo("defaults -host hostname rename domain old_key new_key")
test("defaults -host hostname rename domain old_key new_key", t => {
  // m(-host hostname rename domain old_key new_key)
  // m(-host hostname rename domain old_key new_key)
  // m(-host hostname rename domain old_key new_key)
  // m(-host hostname rename domain old_key new_key)
})

// defaults delete-sync domain
test.todo("defaults delete-sync domain")
test("defaults delete-sync domain", t => {
  // m(delete-sync domain)
  // m(delete-sync domain)
  // m(delete-sync domain)
  // m(delete-sync domain)
});

// defaults delete domain
test.todo("defaults delete domain")
test("defaults delete domain", t => {
  // m(delete domain)
  // m(delete domain)
  // m(delete domain)
  // m(delete domain)
});

// defaults -currentHost delete-sync domain
test.todo("defaults -currentHost delete-sync domain")
test("defaults -currentHost delete-sync domain", t => {
  // m(-currentHost delete-sync domain)
  // m(-currentHost delete-sync domain)
  // m(-currentHost delete-sync domain)
  // m(-currentHost delete-sync domain)
});

// defaults -currentHost delete domain
test.todo("defaults -currentHost delete domain")
test("defaults -currentHost delete domain", t => {
  // m(-currentHost delete domain)
  // m(-currentHost delete domain)
  // m(-currentHost delete domain)
  // m(-currentHost delete domain)
});

// defaults -host hostname delete-sync domain
test.todo("defaults -host hostname delete-sync domain")
test("defaults -host hostname delete-sync domain", t => {
  // m(-host hostname delete-sync domain)
  // m(-host hostname delete-sync domain)
  // m(-host hostname delete-sync domain)
  // m(-host hostname delete-sync domain)
});

// defaults -host hostname delete domain
test.todo("defaults -host hostname delete domain")
test("defaults -host hostname delete domain", t => {
  // m(-host hostname delete domain)
  // m(-host hostname delete domain)
  // m(-host hostname delete domain)
  // m(-host hostname delete domain)
})

// defaults delete-sync domain key
test.todo("defaults delete-sync domain key")
test("defaults delete-sync domain key", t => {
  // m(delete-sync domain key)
  // m(delete-sync domain key)
  // m(delete-sync domain key)
  // m(delete-sync domain key)
});

// defaults delete domain key
test.todo("defaults delete domain key")
test("defaults delete domain key", t => {
  // m(delete domain key)
  // m(delete domain key)
  // m(delete domain key)
  // m(delete domain key)
});

// defaults -currentHost delete-sync domain key
test.todo("defaults -currentHost delete-sync domain key")
test("defaults -currentHost delete-sync domain key", t => {
  // m(-currentHost delete-sync domain key)
  // m(-currentHost delete-sync domain key)
  // m(-currentHost delete-sync domain key)
  // m(-currentHost delete-sync domain key)
});

// defaults -currentHost delete domain key
test.todo("defaults -currentHost delete domain key")
test("defaults -currentHost delete domain key", t => {
  // m(-currentHost delete domain key)
  // m(-currentHost delete domain key)
  // m(-currentHost delete domain key)
  // m(-currentHost delete domain key)
});

// defaults -host hostname delete-sync domain key
test.todo("defaults -host hostname delete-sync domain key")
test("defaults -host hostname delete-sync domain key", t => {
  // m(-host hostname delete-sync domain key)
  // m(-host hostname delete-sync domain key)
  // m(-host hostname delete-sync domain key)
  // m(-host hostname delete-sync domain key)
});

// defaults -host hostname delete domain key
test.todo("defaults -host hostname delete domain key")
test("defaults -host hostname delete domain key", t => {
  // m(-host hostname delete domain key)
  // m(-host hostname delete domain key)
  // m(-host hostname delete domain key)
  // m(-host hostname delete domain key)
})

















// defaults import domain
test.todo("defaults import domain")
test("defaults import domain", t => {
  // m(delete domain)
  // m(delete domain)
  // m(delete domain)
  // m(delete domain)
});

// defaults -currentHost import-sync domain
test.todo("defaults -currentHost import-sync domain")
test("defaults -currentHost import-sync domain", t => {
  // m(-currentHost import-sync domain)
  // m(-currentHost import-sync domain)
  // m(-currentHost import-sync domain)
  // m(-currentHost import-sync domain)
});

// defaults -currentHost import domain
test.todo("defaults -currentHost import domain")
test("defaults -currentHost import domain", t => {
  // m(-currentHost import domain)
  // m(-currentHost import domain)
  // m(-currentHost import domain)
  // m(-currentHost import domain)
});

// defaults -host hostname import-sync domain
test.todo("defaults -host hostname import-sync domain")
test("defaults -host hostname import-sync domain", t => {
  // m(-host hostname import-sync domain)
  // m(-host hostname import-sync domain)
  // m(-host hostname import-sync domain)
  // m(-host hostname import-sync domain)
});

// defaults -host hostname import domain
test.todo("defaults -host hostname import domain")
test("defaults -host hostname import domain", t => {
  // m(-host hostname import domain)
  // m(-host hostname import domain)
  // m(-host hostname import domain)
  // m(-host hostname import domain)
})

// defaults import-sync domain plist
test.todo("defaults import-sync domain plist")
test("defaults import-sync domain plist", t => {
  // m(delete-sync domain plist)
  // m(delete-sync domain plist)
  // m(delete-sync domain plist)
  // m(delete-sync domain plist)
});

// defaults import domain plist
test.todo("defaults import domain plist")
test("defaults import domain plist", t => {
  // m(delete domain plist)
  // m(delete domain plist)
  // m(delete domain plist)
  // m(delete domain plist)
});

// defaults -currentHost import-sync domain plist
test.todo("defaults -currentHost import-sync domain plist")
test("defaults -currentHost import-sync domain plist", t => {
  // m(-currentHost import-sync domain plist)
  // m(-currentHost import-sync domain plist)
  // m(-currentHost import-sync domain plist)
  // m(-currentHost import-sync domain plist)
});

// defaults -currentHost import domain plist
test.todo("defaults -currentHost import domain plist")
test("defaults -currentHost import domain plist", t => {
  // m(-currentHost import domain plist)
  // m(-currentHost import domain plist)
  // m(-currentHost import domain plist)
  // m(-currentHost import domain plist)
});

// defaults -host hostname import-sync domain plist
test.todo("defaults -host hostname import-sync domain plist")
test("defaults -host hostname import-sync domain plist", t => {
  // m(-host hostname import-sync domain plist)
  // m(-host hostname import-sync domain plist)
  // m(-host hostname import-sync domain plist)
  // m(-host hostname import-sync domain plist)
});

// defaults -host hostname import domain plist
test.todo("defaults -host hostname import domain plist")
test("defaults -host hostname import domain plist", t => {
  // m(-host hostname import domain plist)
  // m(-host hostname import domain plist)
  // m(-host hostname import domain plist)
  // m(-host hostname import domain plist)
})
















// defaults import domain
test.todo("defaults export domain")
test("defaults export domain", t => {
  // m(delete domain)
  // m(delete domain)
  // m(delete domain)
  // m(delete domain)
});

// defaults -currentHost export-sync domain
test.todo("defaults -currentHost export-sync domain")
test("defaults -currentHost export-sync domain", t => {
  // m(-currentHost export-sync domain)
  // m(-currentHost export-sync domain)
  // m(-currentHost export-sync domain)
  // m(-currentHost export-sync domain)
});

// defaults -currentHost export domain
test.todo("defaults -currentHost export domain")
test("defaults -currentHost export domain", t => {
  // m(-currentHost export domain)
  // m(-currentHost export domain)
  // m(-currentHost export domain)
  // m(-currentHost export domain)
});

// defaults -host hostname export-sync domain
test.todo("defaults -host hostname export-sync domain")
test("defaults -host hostname export-sync domain", t => {
  // m(-host hostname export-sync domain)
  // m(-host hostname export-sync domain)
  // m(-host hostname export-sync domain)
  // m(-host hostname export-sync domain)
});

// defaults -host hostname export domain
test.todo("defaults -host hostname export domain")
test("defaults -host hostname export domain", t => {
  // m(-host hostname export domain)
  // m(-host hostname export domain)
  // m(-host hostname export domain)
  // m(-host hostname export domain)
})

// defaults export-sync domain plist
test.todo("defaults export-sync domain plist")
test("defaults export-sync domain plist", t => {
  // m(delete-sync domain plist)
  // m(delete-sync domain plist)
  // m(delete-sync domain plist)
  // m(delete-sync domain plist)
});

// defaults export domain plist
test.todo("defaults export domain plist")
test("defaults export domain plist", t => {
  // m(delete domain plist)
  // m(delete domain plist)
  // m(delete domain plist)
  // m(delete domain plist)
});

// defaults -currentHost export-sync domain plist
test.todo("defaults -currentHost export-sync domain plist")
test("defaults -currentHost export-sync domain plist", t => {
  // m(-currentHost export-sync domain plist)
  // m(-currentHost export-sync domain plist)
  // m(-currentHost export-sync domain plist)
  // m(-currentHost export-sync domain plist)
});

// defaults -currentHost export domain plist
test.todo("defaults -currentHost export domain plist")
test("defaults -currentHost export domain plist", t => {
  // m(-currentHost export domain plist)
  // m(-currentHost export domain plist)
  // m(-currentHost export domain plist)
  // m(-currentHost export domain plist)
});

// defaults -host hostname export-sync domain plist
test.todo("defaults -host hostname export-sync domain plist")
test("defaults -host hostname export-sync domain plist", t => {
  // m(-host hostname export-sync domain plist)
  // m(-host hostname export-sync domain plist)
  // m(-host hostname export-sync domain plist)
  // m(-host hostname export-sync domain plist)
});

// defaults -host hostname export domain plist
test.todo("defaults -host hostname export domain plist")
test("defaults -host hostname export domain plist", t => {
  // m(-host hostname export domain plist)
  // m(-host hostname export domain plist)
  // m(-host hostname export domain plist)
  // m(-host hostname export domain plist)
})

















// defaults domains-sync
test.todo("defaults domains-sync")
test("defaults domains-sync", t => {
  // m(domains-sync)
  // m(domains-sync)
  // m(domains-sync)
  // m(domains-sync)
});

// defaults domains
test.todo("defaults domains")
test("defaults domains", t => {
  // m(domains)
  // m(domains)
  // m(domains)
  // m(domains)
});

// defaults -currentHost domains-sync
test.todo("defaults -currentHost domains-sync")
test("defaults -currentHost domains-sync", t => {
  // m(-currentHost domains-sync)
  // m(-currentHost domains-sync)
  // m(-currentHost domains-sync)
  // m(-currentHost domains-sync)
});

// defaults -currentHost domains
test.todo("defaults -currentHost domains")
test("defaults -currentHost domains", t => {
  // m(-currentHost domains)
  // m(-currentHost domains)
  // m(-currentHost domains)
  // m(-currentHost domains)
});

// defaults -host hostname domains-sync
test.todo("defaults -host hostname domains-sync")
test("defaults -host hostname domains-sync", t => {
  // m(-host hostname domains-sync)
  // m(-host hostname domains-sync)
  // m(-host hostname domains-sync)
  // m(-host hostname domains-sync)
});

// defaults -host hostname domains
test.todo("defaults -host hostname domains")
test("defaults -host hostname domains", t => {
  // m(-host hostname domains)
  // m(-host hostname domains)
  // m(-host hostname domains)
  // m(-host hostname domains)
})

// defaults find-sync word
test.todo("defaults find-sync word")
test("defaults find-sync word", t => {
  // m(find-sync word)
  // m(find-sync word)
  // m(find-sync word)
  // m(find-sync word)
});

// defaults find word
test.todo("defaults find word")
test("defaults find word", t => {
  // m(find word)
  // m(find word)
  // m(find word)
  // m(find word)
});

// defaults -currentHost find-sync word
test.todo("defaults -currentHost find-sync word")
test("defaults -currentHost find-sync word", t => {
  // m(-currentHost find-sync word)
  // m(-currentHost find-sync word)
  // m(-currentHost find-sync word)
  // m(-currentHost find-sync word)
});

// defaults -currentHost find word
test.todo("defaults -currentHost find word")
test("defaults -currentHost find word", t => {
  // m(-currentHost find word)
  // m(-currentHost find word)
  // m(-currentHost find word)
  // m(-currentHost find word)
});

// defaults -host hostname find-sync word
test.todo("defaults -host hostname find-sync word")
test("defaults -host hostname find-sync word", t => {
  // m(-host hostname find-sync word)
  // m(-host hostname find-sync word)
  // m(-host hostname find-sync word)
  // m(-host hostname find-sync word)
});

// defaults -host hostname find word
test.todo("defaults -host hostname find word")
test("defaults -host hostname find word", t => {
  // m(-host hostname find word)
  // m(-host hostname find word)
  // m(-host hostname find word)
  // m(-host hostname find word)
})

// defaults help-sync
test.todo("defaults help-sync")
test("defaults help-sync", t => {
  // m(help-sync)
  // m(help-sync)
  // m(help-sync)
  // m(help-sync)
});

// defaults help
test.todo("defaults help")
test("defaults help", t => {
  // m(help)
  // m(help)
  // m(help)
  // m(help)
});

// defaults -currentHost help-sync
test.todo("defaults -currentHost help-sync")
test("defaults -currentHost help-sync", t => {
  // m(-currentHost help-sync)
  // m(-currentHost help-sync)
  // m(-currentHost help-sync)
  // m(-currentHost help-sync)
});

// defaults -currentHost help
test.todo("defaults -currentHost help")
test("defaults -currentHost help", t => {
  // m(-currentHost help)
  // m(-currentHost help)
  // m(-currentHost help)
  // m(-currentHost help)
});

// defaults -host hostname help-sync
test.todo("defaults -host hostname help-sync")
test("defaults -host hostname help-sync", t => {
  // m(-host hostname help-sync)
  // m(-host hostname help-sync)
  // m(-host hostname help-sync)
  // m(-host hostname help-sync)
});

// defaults -host hostname help
test.todo("defaults -host hostname help")
test("defaults -host hostname help", t => {
  // m(-host hostname help)
  // m(-host hostname help)
  // m(-host hostname help)
  // m(-host hostname help)
})



