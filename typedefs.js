/**
* @typedef {HostInfo|object} HostAndDomain
* @property {boolean} globalDomain
* @property {string} app
* @property {string} domainString
*/

/**
* @typedef {string|object} Domain
* @property {string} app Non-empty string
* @property {boolean} g Global domain
* @property {boolean} globalDomain Alias of `g`
* @property {boolean} NSGlobalDomain Alias of `g`
*/

/**
* @typedef {string|object} DomainWithHost
* @property {object} domain
* @property {boolean} domain.currentHost
* @property {Domain} domain.domain
* @property {Host} domain.host
*/

/**
* @typedef {object|string} Host
* @property {boolean} [currentHost]
* @property {?string} [host]
*/

/**
* @typedef {object} HostInfo
* @property {boolean} currentHost
* @property {boolean} anyHost
* @property {string} hostString
*/

/**
* @typedef {Array|object|string|number[]|Uint8Array} DefaultsResult
*/

/**
* @typedef {"find"|"commaSeparated"|"readType"|"jsType"} ReturnType
*/

/**
* @typedef {number} Integer
*/

/**
* @typedef {object} FindResult
* @property {string} message
* @property {Integer} keys
* @property {string} domain
* @property {DefaultsResult} result
*/

/**
* @typedef {object} FindResultsErrorObject
* @property {TypeError|RangeError} error Parser error
*/

/**
* @typedef {FindResult[]|FindResultsErrorObject} FindResults
*/

/**
* @typedef {Array} ReducedValue
* @property {PropertyListType} 0 type: The valid type string
* @property {string[]} 1 escapedValueArgs: The escaped value arguments (as a 1-item array, or possibly more for dicts/arrays)
* @property {boolean} 2 defaultString: Whether the default format was used (no explicit type)
*/

/**
* @typedef {"hex"|"int"|"bool"|"real"} PropertyListTypeAlias
*/

/**
* @typedef {"string"|"data"|"integer"|"float"|"boolean"|"date"|"array"|"array-add"|"dict"|"dict-add"|PropertyListTypeAlias} PropertyListType
*/

/**
* @typedef {boolean|number|Date|DefaultsResult} DefaultsInput
*/

/**
* @typedef {string|Array} PropertyListValue If a string is provided, the type will be assumed to be a string
* @property {PropertyListType} 0 The type
* @property {DefaultsInput} 1 The value
*/

/**
* @typedef {Array} PropertyListArray
* @property {string} 0 The key
* @property {PropertyListValue} 1 The value
*/

/**
* @typedef {object} PropertyListObject
* @property {DefaultsInput} value
*/

/**
* @typedef {string|PropertyListObject|PlistKeyValue|PropertyListArray} PropertyListOrKeyValue If a string, must be non-empty.
*/

/**
* @typedef {object} PlistStringObject
* @property {string} plist The property list as an old-style ASCII property list
*/

/**
* @typedef {object} PlistKeyValue
* @property {string} key
* @property {PropertyListValue} value
*/

/**
* @typedef {PlistStringObject|PlistKeyValue|PropertyListArray} PList
* @mixes DomainWithHost
* @mixes Domain
*/

/**
* @typedef {object} WordObject
* @mixes Host
* @property {string} word
*/

/**
* @typedef {object} KeyObject
* @mixes DomainWithHost
* @mixes Domain
* @property {string} key
*/

/**
* @typedef {object} KeysObject
* @mixes DomainWithHost
* @mixes Domain
* @property {string} oldKey
* @property {string} newKey
* @property {string} [old_key] Alias of oldKey
* @property {string} [new_key] Alias of newKey
*/


/**
* @typedef {object} KeyDeleteAllObject
* @mixes KeyObject
* @property {boolean} [deleteAll]
*/

/**
* @typedef {object} MockStreamInput
* @property {string} input
*/

/**
* @typedef {object} ImportPlistPathObject
* @mixes DomainWithHost
* @mixes Domain
* @property {string|stream.Readable|MockStreamInput} [plist]
*/

/**
* @typedef {object} ExportPlistPathObject
* @mixes DomainWithHost
* @mixes Domain
* @property {string} [plist]
*/

/**
* @typedef ParsedIORegResult
* @property {boolean} isNode
* @property {string|null} ioServiceName
* @property {string} ioServiceLocation
* @property {string} ioServiceClass
* @property {Integer} id
* @property {boolean} registered
* @property {boolean} matched
* @property {boolean} active
* @property {Integer} busyTime
* @property {Integer} accumulatedBusyTime
* @property {Integer|null} retainCount
* @property {string} info
*/
