/* eslint-disable no-console */
/** @module MacOSDefaults */

// https://developer.apple.com/legacy/library/documentation/Darwin/Reference/ManPages/man1/defaults.1.html

// defaults [-currentHost | -host hostname] write domain { 'plist' | key 'value' }
//  defaults [-currentHost | -host hostname] read [domain [key]]
//  defaults [-currentHost | -host hostname] read-type domain key
//  defaults [-currentHost | -host hostname] rename domain old_key new_key
//  defaults [-currentHost | -host hostname] delete [domain [key]]
//  defaults [-currentHost | -host hostname] { domains | find word | help }

// Todo: Support Node `Buffer`s as well as `Uint8Array`?

'use strict';
const {spawn, spawnSync} = require('child_process');

const PlistParser = require('./PlistParser.js');

const getStream = require('get-stream');

const allowedTypes = [
  'string', 'data', 'integer', 'float', 'boolean',
  'date', 'array', 'array-add', 'dict', 'dict-add'
];
const typeAliases = {
  'hex': 'data',
  'int': 'integer',
  'bool': 'boolean',
  'real': 'float'
};
const typeAliasNames = Object.keys(typeAliases);
const fullTypeList = allowedTypes.concat(typeAliasNames);

/**
* Surrounds a value with double quotes and escapes any within it
* @private
* @param {string} val Value to escape
* @returns {string} The escaped and quoted string
*/
function quoteAndEscapeDoubleQuotes (val) {
  return '"' + val.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}
/**
* Escapes any XML apostrophes
* @private
* @param {string} val Value to escape
* @returns {string} The escaped string
*/
function escapeXMLApostrophe (val) {
  return val.replace(/'/g, '&apos;');
}

/**
* Escapes content for safe use within XML (ampersand, less-than, and greater-than);
* Does not escape quotes as is not intended for attributes.
* @private
* @param {string} s The content to escape to be used as XML content
* @returns {string} The escaped string
*/
function escapeXMLContent (s) {
  return s.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;');
}

/**
* @private
* @param {object} cfg
* @param {string[]} cfg.args
* @param {HostAndDomain} cfg.hostAndDomain
* @param {string} cfg.methodName
* @returns {boolean} Whether a domain was found or not
*/
function addHostMethodAndDomain ({args, hostAndDomain, methodName}) {
  const {currentHost, anyHost, hostString, app, globalDomain, domainString} = hostAndDomain;
  if (currentHost) {
    args.push('-currentHost');
  } else if (!anyHost) {
    args.push('-host', quoteAndEscapeDoubleQuotes(hostString));
  }
  args.push(methodName);
  let hasDomain = true;
  if (app) {
    args.push('-app', quoteAndEscapeDoubleQuotes(app));
  } else if (globalDomain) {
    args.push('-g'); // Could also add '-globalDomain' or 'NSGlobalDomain' instead
  } else if (domainString) {
    args.push(quoteAndEscapeDoubleQuotes(domainString));
  } else {
    hasDomain = false;
  }
  return hasDomain;
}

/*
const pad = function (num) {
  const norm = Math.floor(Math.abs(num));
  return String(norm).padStart(2, '0');
};
// We use instead of date.toISOString() because we want to allow locale-aware dates as permitted
const toISOString = (date) => {
  const tzo = -date.getTimezoneOffset();
  const sgn = tzo < 0 ? '-' : '+';
  return date.getFullYear() +
    '-' + pad(date.getMonth() + 1) +
    '-' + pad(date.getDate()) +
    'T' + pad(date.getHours()) +
    ':' + pad(date.getMinutes()) +
    ':' + pad(date.getSeconds()) +
    sgn + pad(tzo / 60) +
    ':' + pad(tzo % 60);
};
*/
/**
* @param {DefaultsInput} value
* @param {object} [cfg]
* @property {boolean} [cfg.forceHex=false]
* @property {boolean} [cfg.forceReal=false]
* @todo Could have `forceHex` have numeric arrays treated as hex
* @throws {TypeError}
* @returns {string}
*/
exports.jsToPropertyListXML = function (value, cfg = {}) {
  // Have Typed Array treat as data (hex) (which is
  //   e.g., <0fbd>; note: also allows optional whitespace inside)
  if (cfg.forceHex && typeof value === 'string') {
    value = new Uint8Array([...value].map((ch) => {
      return parseInt(ch, 16);
    }));
  }
  const type = typeof value;
  switch (type) {
  case 'boolean': {
    return value ? '<true/>' : '<false/>';
  }
  case 'number': {
    if (Number.isNaN(value)) {
      throw new TypeError('`NaN` is not allowed.');
    }
    if (!cfg.forceReal && Number.isInteger(value)) {
      return '<integer>' + value + '</integer>';
    }
    return '<real>' + value + '</real>';
  }
  case 'string': {
    return '<string>' + escapeXMLContent(String(value)) + '</string>';
  }
  }
  if (Array.isArray(value)) {
    return value.reduce((s, v) => {
      return s + jsToPropertyListXML(v, cfg);
    }, '<array>') + '</array>';
  }
  if (value && typeof value === 'object') {
    switch (Object.prototype.toString.call(value)) {
    case '[object Date]': {
      if (Number.isNaN(value.getTime())) {
        throw new TypeError('Invalid date.');
      }
      /*
      if (cfg.useUTCDates) {
        return '<date>' + value.toISOString() + '</date>';
      }
      */
      return '<date>' + value.toISOString().replace(/\.\d{3}Z$/, 'Z') + '</date>';
      // Having problem with timezone offsets when adding via
      //  `defaults write key '<date></date>'` and `-date` drops
      //  the timezone
      // return '<date>' + toISOString(value) + '</date>';
    }
    case '[object Uint8Array]': {
      const s = value.reduce((s, hex) => {
        return s + hex.toString(16);
      }, value.length % 2 ? '0' : '');
      return '<data>' + Buffer.from(s, 'hex').toString('base64') + '</data>';
    }
    }
    return Object.entries(value).reduce((s, [key, value]) => {
      // Empty string keys are allowable
      return s + '<key>' + escapeXMLContent(key) + '</key>' + jsToPropertyListXML(value, cfg);
    }, '<dict>') + '</dict>';
  }
  throw new TypeError('Unrecognized type, ' + type + ', cannot be converted to XML property list item.');
};

const jsToPropertyListXML = exports.jsToPropertyListXML;

/**
* Not in use internally.
* Adapts {@link https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/PropertyLists/OldStylePlists/OldStylePLists.html#//apple_ref/doc/uid/20001012-BBCBDBJE}
* @todo Add tests
* @todo Could add `forceHex` option to have numeric arrays (or hex strings?) treated as hex
* @param {number|DefaultsResult} value A number gets treated as a string
* @throws {TypeError}
* @returns {string}
* @example
console.log(
  jsToAsciiPropertyList({
    AnimalSmells: {pig: 'piggish', lamb: 'lambish', worm: 'wormy'},
    AnimalSounds: {
      pig: 'oink',
      lamb: 'baa',
      worm: 'baa',
      Lisa: 'Why is the worm talking like a lamb?'
    },
    AnimalColors: {pig: 'pink', lamb: 'black', worm: 'pink'}
  })
);
*/
exports.jsToAsciiPropertyList = function jsToAsciiPropertyList (value) {
  if (['string', 'number'].includes(typeof value)) {
    // If empty, we need to stringify so insist on 1+ chars here
    if ((/^\w+$/).test(String(value))) {
      return String(value);
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return value.reduce((s, v, i) => {
      return s +
        (i > 0 ? ', ' : '') +
        jsToAsciiPropertyList(v);
    }, '(') + ')';
  }
  if (value && typeof value === 'object') {
    if (Object.prototype.toString.call(value) === '[object Uint8Array]') {
      // Note: also allows optional whitespace inside
      return value.reduce((s, hex) => {
        return s + hex.toString(16);
      }, '<') + '>';
    }
    return Object.entries(value).reduce((s, [key, value]) => {
      // Empty string keys are allowable if quoted
      return s + jsToAsciiPropertyList(key) + ' = ' + jsToAsciiPropertyList(value) + '; ';
    }, '{ ') + '}';
  }
  throw new TypeError('Unrecognized type cannot be converted to ASCII property list item');
};

/**
* Note: `useUTCDates` doesn't seem to work through `defaults` even though
*  it seems some property list files store timezone-aware dates
* @private
* @param {object} cfg
* @param {PropertyListValue} cfg.value
* @throws {TypeError}
* @returns {ReducedValue} Array consisting of the valid type string, the matching value (possibly converted or added into an array), and a boolean defaultString on whether the default format was used (no explicit type)
*/
function reduceValue ({value: valArray}) { // , useUTCDates
  let defaultString = false;
  if (typeof valArray === 'string') { // Note: Empty string ok as allowable if double-quoted (as we do below)
    defaultString = true;
    valArray = ['string', valArray];
  } else if (!Array.isArray(valArray) || valArray.length !== 2 ||
    !fullTypeList.includes(valArray[0])
  ) {
    throw new TypeError('A value must only be a string or a two-item array with a valid type key.');
  }
  let [type, value] = valArray;
  switch (type) {
  case 'string': {
    if (typeof value !== 'string') {
      throw new TypeError('A string is expected for the `string` value.');
    }
    // Though some system errors suggest using single quotes, backslashes
    //   don't seem to work to escape them
    value = quoteAndEscapeDoubleQuotes(value);
    break;
  }
  case 'data': case 'hex': { // Hex digits
    if (Object.prototype.toString.call(value) === '[object Uint8Array]' ||
      Array.isArray(value)
    ) {
      value = value.reduce((s, hex) => {
        // Could give `NaN` if a bad number exists, so we check string result below
        return s + hex.toString(16);
      }, '');
    }
    if (typeof value !== 'string' || !(/^[\da-f]+$/i).test(value)) {
      throw new TypeError('Hex digits (as a string) are expected for the `data`/`hex` value.');
    }
    type = 'data';
    break;
  }
  case 'integer': case 'int': {
    if (!Number.isInteger(value)) {
      throw new TypeError('An integer is expected for the `int`/`integer` value.');
    }
    value = String(value);
    break;
  }
  case 'float': case 'real': { // in XML as `<real>`
    if (typeof value !== 'number') {
      throw new TypeError('A number (float) is expected for the `float` value.');
    }
    type = 'float';
    value = String(value);
    break;
  }
  case 'boolean': case 'bool': { // (true|false|yes|no) //  in XML as `<true>` or `<false>`
    if (typeof value !== 'boolean') { // && !['yes', 'no'].includes(value)) {
      throw new TypeError('A boolean is expected for the `bool`/`boolean` value.');
    }
    value = String(value);
    break;
  }
  case 'date': {
    if (typeof value === 'string') {
      // Todo: Liberalize further
      if ((/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/).test(value)) { // JSON string date
        value = new Date(value);
      } else {
        throw new TypeError('A valid date-string must be supplied.');
      }
    }
    if (Object.prototype.toString.call(value) !== '[object Date]' ||
      isNaN(value.getTime())
    ) {
      throw new TypeError('A date object or valid date string is expected for the `string` value.');
    }
    /*
    value = useUTCDates
      ? value.toISOString()
      : toISOString(value);
    */
    value = value.toISOString();
    break;
  }
  case 'array': case 'array-add': {
    if (!Array.isArray(value)) {
      throw new TypeError('An array is expected for the `' + type + '` value.');
    }
    const values = Object.values(value);
    /*
    // Todo: `defaults` allows (if on a dict), but does nothing; we could throw optionally
    if (type === 'array-add' && !values.length) {
      throw new TypeError('A `' + type + '` must have an array with at least one key.');
    }
    */
    value = [];
    values.forEach((v) => {
      v = jsToPropertyListXML(v); // , {useUTCDates});
      value.push(" '" + escapeXMLApostrophe(v) + "'");
    }, '');
    // value = "'<array>" + escapeXMLApostrophe(value.reduce((s, v) => {
    /*
      // We'd need something like this if not building XML strings
      const [type, val] = reduceValue({value: v, useUTCDates});
      if (['array', 'array-add', 'dict', 'dict-add'].includes(type)) {
        throw new TypeError('Cannot nest composite types (arrays and dictionaries)');
      }
      return s + ' ' + val;
      */
    /*
      v = jsToPropertyListXML(v, {useUTCDates});
      return s + ' ' + v;
    }, '')) + "</array>'";
    */
    return [type, value, defaultString];
  }
  case 'dict': case 'dict-add': {
    if (!value || typeof value !== 'object') {
      throw new TypeError('An object is expected for the `' + type + '` value.');
    }
    const entries = Object.entries(value);
    /*
    // Todo: `defaults` allows (if on a dict), but does nothing; we could throw optionally
    if (type === 'dict-add' && !entries.length) {
      throw new TypeError('A `' + type + '` must have an object with at least one key.');
    }
    */

    // Tried encapsulating within single type element (`<dict>`) but doesn't work as with
    //   other types; two arguments are needed
    /*
    value = "'<dict>" + escapeXMLApostrophe(Object.entries(value).reduce((s, [key, v]) => {
      v = jsToPropertyListXML(v, {useUTCDates});
      return s + '<key>' + key + '</key> ' + v;
    }, '')) + "</dict>'";
    */
    value = [];
    entries.forEach(([key, v]) => {
      /*
      // We'd need something like this if not building XML strings
      const [type, val] = reduceValue({value: v, useUTCDates});
      if (['array', 'array-add', 'dict', 'dict-add'].includes(type)) {
        throw new TypeError('Cannot nest composite types (arrays and dictionaries)');
      }
      return s + key + ' ' + val;
      */
      v = jsToPropertyListXML(v); // , {useUTCDates});
      // Empty string keys are allowable if quoted
      value.push(quoteAndEscapeDoubleQuotes(key), " '" + escapeXMLApostrophe(v) + "'");
    }, '');
    return [type, value, defaultString];
  }
  default: {
    throw new TypeError('Unexpected object property encountered on value object: ' + type);
  }
  }
  return [type, [value], defaultString];
}

/**
* @private
* @param {object} cfg
* @param {string} cfg.key
* @param {string} cfg.methodName
* @throws {TypeError}
*/
function checkKey ({key, methodName}) {
  if (typeof key !== 'string') {
    throw new TypeError('The key supplied to ' + methodName + ' must be a string.');
  }
}

/**
* @private
* @param {object} cfg
* @param {?Host} [cfg.host]
* @param {string} cfg.methodName Used in error messages
* @throws {TypeError}
* @returns {HostInfo}
*/
function checkHost ({host, methodName}) {
  let currentHost = false, anyHost = false;
  if (host && typeof host === 'object') {
    if ('currentHost' in host && !('host' in host)) {
      currentHost = host.currentHost;
      host = undefined;
    } else if ('host' in host) {
      ({host} = host);
    } else {
      throw new TypeError('If host is an object, it must have have a `currentHost` or `host` property; ' + methodName + ' method');
    }
  }
  if (!currentHost) {
    if (host == null) {
      anyHost = true;
    } else if (typeof host !== 'string' || !host) {
      throw new TypeError(
        'If host is not an object, host must either be `undefined`/`null` or a non-empty string; ' + methodName + ' method'
      );
    }
  }
  return {currentHost, anyHost, hostString: host};
}

/**
* @private
* @param {object} cfg
* @param {?(DomainWithHost|Domain)} [cfg.domain]
* @param {?Host} [cfg.host]
* @param {string} cfg.methodName Used in error messages
* @param {boolean} [cfg.optionalDomain=false] Whether to throw if the domain is missing
* @throws {TypeError}
* @returns {HostAndDomain}
*/
function checkHostAndDomain ({domain, host, methodName, optionalDomain}) {
  if (domain && typeof domain === 'object' && 'domain' in domain) {
    const {currentHost} = domain;
    ({domain, host = {currentHost}} = domain);
  }
  let globalDomain;
  let app;
  if (domain && typeof domain === 'object') {
    if ('app' in domain) {
      ({app} = domain);
      if (!app || typeof app !== 'string') {
        throw new TypeError('app, if present on a domain object, must be a non-empty string; ' + methodName + ' method');
      }
    } else if (['g', 'globalDomain', 'NSGlobalDomain'].some((p) => {
      return p in domain;
    })) {
      globalDomain = ['g', 'globalDomain', 'NSGlobalDomain'].some((p) => {
        return domain[p];
      });
    } else {
      throw new TypeError('If domain is an object, it must have an `app` or `g`/`globalDomain`/`NSGlobalDomain` property; ' + methodName + ' method');
    }
  }
  if (!globalDomain && !app) {
    if (domain === '' || (domain && typeof domain !== 'string')) {
      throw new TypeError(
        'If a global or app domain is not specified, a non-empty string must be supplied to ' + methodName
      );
    }
    if (!domain && !optionalDomain) {
      throw new TypeError('A domain is not optional for ' + methodName);
    }
  }
  const {currentHost, anyHost, hostString} = checkHost({host, methodName});
  return {
    globalDomain, app, domainString: domain,
    currentHost, anyHost, hostString
  };
}

/**
* @param {string} findString The raw string returned from `defaults find`
* @param {object} [cfg] Configuration object
* @property {boolean} [cfg.json=false] Whether to force the parsed results as JSON (or allow Uint8Arrays for hex)
* @returns {FindResults} Returns an array of results or a single object with an `error` property set to the parser error
*/
exports.parseFindResults = function parseFindResults (findString, {json = false} = {}) {
  findString = findString.trim();
  const results = [];
  const foundKeysDomain = /(?:^|\n)Found (\d+) keys in domain '([^']+)':([\s\S]+?)(?=\n\w|\s*$)/g;
  let match, keys, domain, message, result;
  try {
    while ((match = foundKeysDomain.exec(findString)) !== null) {
      [message, keys, domain, result] = match;
      // console.log(result, keys, domain, '\n----------\n');
      keys = parseInt(keys, 10); // This could be avoided in favor of having user do `Object.keys` length on `result`
      const parser = new PlistParser({plist: result, hexAsArrays: json});
      result = parser.start();
      results.push({message, keys, domain, result});
    }
    return results;
  } catch (error) {
    // console.log('result', err);
    // console.log('global.err', domain, global.err);
    return {
      error
    };
  }
};
const parseFindResults = exports.parseFindResults;

/**
* @private
* @param {object} cfg
* @param {?ReturnType} [cfg.returnType]
* @param {boolean} [cfg.hexAsArrays=false] Whether to force hex to be returned as JSON arrays rather than Uint8Arrays
* @param {string} cfg.stdout A string (obtained from stdout)
* @returns {DefaultsResult} Array or object for `returnType` "find"; for `returnType` "jsType" may be any of the listed types; otherwise a string
*/
function convertReturnType ({returnType, hexAsArrays, stdout}) {
  switch (returnType) {
  case 'find': {
    stdout = parseFindResults(stdout, {json: hexAsArrays});
    break;
  }
  case 'commaSeparated': {
    stdout = stdout.trim().split(', ');
    break;
  }
  case 'readType': {
    stdout = stdout.replace(/^Type is (.*)\n$/, '$1');
    break;
  }
  case 'jsType': {
    const parser = new PlistParser({plist: stdout, hexAsArrays, allowUnquotedStringsAtRoot: true});
    stdout = parser.start();
    break;
  }
  }
  return stdout;
}

class MacOSDefaults {
  /**
  * @param {object} [cfg]
  * @param {boolean} [cfg.debug=false] Whether to merely return the query rather than execute it
  * @param {boolean} [cfg.jsonResults=false] Whether output from `find` should be in JSON (converting Uint8Array hex representations into arrays)
  * @param {boolean} [cfg.sync=false] Whether to use the synchronous API
  * @param {boolean} [cfg.forceReal=false] Whether to treat integers as well as non-integer numbers as &ltreal>`
  * @param {boolean} [cfg.forceHex=false] Whether to treat all strings as hexadecimal &lt;data blocks
  */
  constructor ({debug, jsonResults, log, sync, forceReal, forceHex} = {}) { // , useUTCDates
    // Todo: Allow default domain/host
    Object.assign(this, {debug, jsonResults, log, sync, forceReal, forceHex}); // , useUTCDates
  }
  /**
  * To support multiple vs. single object signatures without ambiguity, the values mentioned below must be expressed somewhat differently depending on their position.
  * @param {DomainWithHost|Domain|PList} domain If a string, is a regular domain path. To supply a plist to the single-object signature when it is in string or array form, encapsulate the value within an object such as follows: `{plist: "{a=1;}"}`. Besides this adaptation for the string and array formats, the properties of the other `plistOrKeyValue` object formats may be used on this object instead.
  * @param {PropertyListOrKeyValue} [plistOrKeyValue] For setting the whole file (must be a dict (object)), use either of these formats: `"{a=1;}"` or `{value: {a: '1'}}`. For key-value setting (including where the [type]{@link PropertyListType} is "string", "array-add", "dict", etc.), use the format `{key: 'a', type: 'string', value: '1'}`, `{key: 'a', value: ['string', '1']}` or `['a', ['string', '1']]` (or for strings only, just `{key: 'a', value: '1'}` or `['a', '1']`)
  * @param {?Host} [host]
  * @param {?Host} [host2] Used as the host if `plistOrKeyValue` is a string and the `host` is an array
  * @throws {TypeError}
  * @returns {Promise|string} The returned or resolved string will probably be empty
  */
  write (domain, plistOrKeyValue, host, host2) {
    let key, value, escapedValueArgs, type, defaultString;
    const args = [], methodName = 'write';

    if (domain && typeof domain === 'object') {
      plistOrKeyValue = 'plist' in domain
        ? domain.plist
        : Array.isArray(domain)
          ? domain
          : 'key' in domain
            ? {value: domain.value, type: domain.type, key: domain.key}
            : {value: domain.value};
    }
    if (typeof plistOrKeyValue === 'string' && Array.isArray(host)) {
      plistOrKeyValue = [plistOrKeyValue, host];
      host = host2;
    }
    if (plistOrKeyValue && typeof plistOrKeyValue === 'object' && 'key' in plistOrKeyValue) {
      const {key, type, value} = plistOrKeyValue;
      plistOrKeyValue = [key, type ? [type, value] : value];
    }
    if (Array.isArray(plistOrKeyValue)) {
      if (plistOrKeyValue.length !== 2) {
        throw new TypeError('Plist arrays passed to `write` must be length 2');
      }
      [key, value] = plistOrKeyValue;
      checkKey({key, methodName});
      ([type, escapedValueArgs, defaultString] = reduceValue({value, useUTCDates: this.useUTCDates}));
      plistOrKeyValue = undefined;
    } else if (plistOrKeyValue && typeof plistOrKeyValue === 'object') {
      if (!('value' in plistOrKeyValue) || Object.keys(plistOrKeyValue).length !== 1) {
        throw new TypeError('A plist object must be wrapped inside of a `value` with no other properties.');
      }
      const {value} = plistOrKeyValue;
      if (!value || typeof value !== 'object' || Array.isArray(value) ||
        ['Date', 'Uint8Array'].includes(Object.prototype.toString.call(value).slice(8, -1))
      ) {
        throw new TypeError('A plist value must be a plain object.');
      }
      // Todo: Allow the `write` call to override the config
      plistOrKeyValue = jsToPropertyListXML(value, {
        forceReal: this.forceReal,
        forceHex: this.forceHex,
        useUTCDates: this.useUTCDates
      });
    } else if (typeof plistOrKeyValue !== 'string' || !plistOrKeyValue) {
      throw new TypeError('`write` must be provided with a non-empty plist string or object, or a key-value array');
    }
    // Use plistOrKeyValue if defined or otherwise key, value

    const hostAndDomain = checkHostAndDomain({
      domain, host, optionalDomain: false, methodName
    });
    addHostMethodAndDomain({args, hostAndDomain, methodName});
    if (plistOrKeyValue) {
      const quotedPlistOrKeyValue = typeof plistOrKeyValue === 'string'
        ? "'" + escapeXMLApostrophe(plistOrKeyValue) + "'"
        : quoteAndEscapeDoubleQuotes(plistOrKeyValue);
      args.push(quotedPlistOrKeyValue);
      return this.defaults(undefined, ...args);
    }
    args.push(quoteAndEscapeDoubleQuotes(key));
    if (!defaultString) {
      args.push('-' + type);
    }
    args.push(...escapedValueArgs);
    return this.defaults(undefined, ...args);
  }

  /**
  * @param {?(DomainWithHost|Domain|KeyObject)} [domain]
  * @param {string} [key]
  * @param {?Host} [host]
  * @returns {Promise|DefaultsResult} If not `sync` will return a `Promise`; otherwise may be any of the other types
  */
  read (domain, key, host) {
    if (domain && typeof domain === 'object') {
      if ('key' in domain) {
        ({key} = domain);
      }
    }
    const args = [], methodName = 'read';
    const hostAndDomain = checkHostAndDomain({
      domain, host, optionalDomain: true, methodName
    });
    const hasDomain = addHostMethodAndDomain({args, hostAndDomain, methodName});
    if (hasDomain && key) {
      checkKey({key, methodName});
      args.push(quoteAndEscapeDoubleQuotes(key));
    }
    return this.defaults({returnType: 'jsType'}, ...args);
  }

  /**
  * @borrows MacOSDefaults#readType as MacOSDefaults#read-type
  */
  'read-type' (...args) {
    return this.readType(...args);
  }

  /**
  * @param {DomainWithHost|Domain|KeyObject} domain
  * @param {string} [key]
  * @param {?Host} [host]
  * @returns {Promise|"string"|"data"|"integer"|"float"|"boolean"|"date"|"array"|"dictionary"}
  */
  readType (domain, key, host) {
    if (domain && typeof domain === 'object') {
      if ('key' in domain) {
        ({key} = domain);
      }
    }
    const args = [], methodName = 'read-type';
    checkKey({key, methodName});
    const hostAndDomain = checkHostAndDomain({
      domain, host, optionalDomain: false, methodName
    });
    addHostMethodAndDomain({args, hostAndDomain, methodName});
    args.push(quoteAndEscapeDoubleQuotes(key));
    return this.defaults({returnType: 'readType'}, ...args);
  }

  /**
  * @param {DomainWithHost|Domain|KeysObject} domain
  * @param {string} [oldKey]
  * @param {string} [newKey]
  * @param {?Host} [host]
  * @returns {Promise|string} The returned or resolved string will probably be empty
  */
  rename (domain, oldKey, newKey, host) {
    if (domain && typeof domain === 'object') {
      if ('oldKey' in domain) {
        ({oldKey} = domain);
      } else if ('old_key' in domain) {
        ({old_key: oldKey} = domain);
      }
      if ('newKey' in domain) {
        ({newKey} = domain);
      } else if ('new_key' in domain) {
        ({new_key: newKey} = domain);
      }
    }
    const args = [], methodName = 'rename';
    checkKey({key: oldKey, methodName});
    checkKey({key: newKey, methodName});
    const hostAndDomain = checkHostAndDomain({
      domain, host, optionalDomain: false, methodName
    });
    addHostMethodAndDomain({args, hostAndDomain, methodName});
    args.push(quoteAndEscapeDoubleQuotes(oldKey), quoteAndEscapeDoubleQuotes(newKey));
    return this.defaults(undefined, ...args);
  }

  /**
  * @param {?(DomainWithHost|Domain|KeyDeleteAllObject)} [domain]
  * @property {boolean} [domain.deleteAll=false] This required in our API to get the potential foot-gun behavior of deleting everything. This property is only available through the object API.
  * @param {string} [key]
  * @param {?Host} [host]
  * @returns {Promise|string} The returned or resolved string will probably be empty
  */
  delete (domain, key, host) {
    let deleteAll = false;
    if (domain && typeof domain === 'object') {
      deleteAll = Boolean(domain.deleteAll);
      if (!deleteAll && 'key' in domain) {
        ({key} = domain);
      }
    }
    const args = [], methodName = 'delete';
    const hostAndDomain = checkHostAndDomain({
      domain, host, optionalDomain: deleteAll, methodName
    });
    const hasDomain = addHostMethodAndDomain({args, hostAndDomain, methodName});
    if (hasDomain && key) {
      checkKey({key, methodName});
      args.push(quoteAndEscapeDoubleQuotes(key));
    }
    return this.defaults(undefined, ...args);
  }

  /**
  * @param {?Host} [host]
  * @returns {Promise|string[]} The matching domains as an array of strings
  */
  domains (host) {
    const args = [], methodName = 'domains';
    const hostOnly = checkHost({host, methodName});
    addHostMethodAndDomain({args, hostAndDomain: hostOnly, methodName});
    return this.defaults({returnType: 'commaSeparated'}, ...args);
  }
  /**
  * @param {string|WordObject} word The word to find
  * @param {?Host} [host]
  * @throws {TypeError}
  * @returns {Promise|FindResults} Returns or resolves to the parsed find results
  */
  find (word, host) {
    let currentHost;
    if (word && typeof word === 'object') {
      ({word, currentHost, host = {currentHost}} = word);
    }
    if (typeof word !== 'string') {
      throw new TypeError('Find must be supplied a string word argument.');
    }
    const args = [], methodName = 'find';
    const hostOnly = checkHost({host, methodName});
    addHostMethodAndDomain({args, hostAndDomain: hostOnly, methodName});
    args.push(quoteAndEscapeDoubleQuotes(word));
    return this.defaults({returnType: 'find'}, ...args);
  }

  /**
  * @param {?Host} [host]
  * @returns {Promise|string} Returns or resolves as the help results
  */
  help (host) {
    const args = [], methodName = 'help';
    const hostOnly = checkHost({host, methodName});
    addHostMethodAndDomain({args, hostAndDomain: hostOnly, methodName});
    return this.defaults(undefined, ...args);
  }

  /**
  * @param {DomainWithHost|Domain|ImportPlistPathObject} domain
  * @param {string|stream.Readable|MockStreamInput} [pathToPlist] If an object, it must have a `input` property and will be supplied as stdin; likewise if supplied a `Stream`; if a string, it must point to the path to a plist file.
  * @param {?Host} [host] (Not shown in `defaults help`)
  * @throws {TypeError}
  * @returns {Promise|string} The returned or resolved string will probably be empty
  */
  import (domain, pathToPlist, host) {
    if (domain && typeof domain === 'object') {
      if ('plist' in domain) {
        ({plist: pathToPlist} = domain);
      }
    }
    const isStream = pathToPlist && typeof pathToPlist === 'object' &&
      (typeof pathToPlist.pipe === 'function' ||
      typeof pathToPlist.input === 'string'); // Our custom "stream"

    if (!isStream && (typeof pathToPlist !== 'string' || !pathToPlist)) {
      throw new TypeError('`import` must be provided with a path to a plist or -');
    }
    const args = [], methodName = 'import';
    const hostAndDomain = checkHostAndDomain({
      domain, host, optionalDomain: false, methodName
    });
    addHostMethodAndDomain({args, hostAndDomain, methodName});
    if (isStream) {
      args.push('-');
    } else {
      args.push(quoteAndEscapeDoubleQuotes(pathToPlist));
    }
    return this.spawn({
      stream: isStream && pathToPlist,
      addStdin: !this.sync && pathToPlist === '-'
    }, ...args);
  }

  /**
  * @param {DomainWithHost|Domain|ExportPlistPathObject} domain
  * @param {string} [pathToPlist]
  * @param {?Host} [host] Is this allowed here?
  * @throws {TypeError}
  * @returns {Promise|string} The XML string
  */
  export (domain, pathToPlist, host) {
    if (domain && typeof domain === 'object') {
      if ('plist' in domain) {
        ({plist: pathToPlist} = domain);
      }
    }
    if (typeof pathToPlist !== 'string' || !pathToPlist) {
      throw new TypeError('`export` must be provided with a path to a plist or -');
    }
    const args = [], methodName = 'export';
    const hostAndDomain = checkHostAndDomain({
      domain, host, optionalDomain: false, methodName
    });
    addHostMethodAndDomain({args, hostAndDomain, methodName});
    args.push(quoteAndEscapeDoubleQuotes(pathToPlist));
    return this.spawn(undefined, ...args);
  }

  /**
  * @param {object|undefined} [opts]
  * @param {...*} args
  * @throws {Error}
  * @returns {string|Promise} Return value depends on whether `sync` set on the object
  */
  spawn (opts, ...args) {
    if (this.sync) {
      return this.spawnSync(opts, ...args);
    }
    return this.spawnAsync(opts, ...args);
  }
  /**
  * @param {object|undefined} [cfg]
  * @param {stream.Readable} [cfg.stream]
  * @param {...*} args
  * @returns {string} Provides stdout from the spawned process; rejects with an `Error` object set to the stderr or `error` property of `spawnSync`
  */
  spawnSync ({stream} = {}, ...args) {
    if (this.debug){
      const command  = 'defaults '+ args.join(' ');
      console.log(command);
      return command;
    }
    const opts = {shell: true, encoding: 'utf-8'};
    const spawnProcess = () => {
      if (this.log) {
        console.log('args', args);
      }
      const proc = spawnSync('defaults', args, opts);
      if (proc.error) {
        const err = new Error(proc.error);
        err.code = proc.status;
        throw err;
      }
      if (proc.status && proc.stderr) {
        const err = new Error(proc.stderr);
        err.code = proc.status;
        throw err;
      }
      return proc.stdout;
    };
    if (stream) {
      if ('pipe' in stream) { // A real stream
        return getStream(stream).then((input) => {
          opts.input = input;
          return spawnProcess();
        });
      }
      opts.input = stream.input;
      // opts.stdio = [stream, 'pipe', 'pipe']; // Doesn't work as we can't close it subsequently (being synchronous)
    }
    return spawnProcess();
  }
  /**
  * @param {object|undefined} [cfg]
  * @param {stream.Readable} [cfg.stream]
  * @param {boolean} [cfg.addStdin=false]
  * @param {...*} args
  * @throws {Error}
  * @returns {Promise} Resolves with stdout and rejects with an `Error` object set to the stderr or with the event of a `spawn` `error` event
  */
  spawnAsync ({stream, addStdin} = {}, ...args) {
    if (this.debug) {
      const command = 'defaults '+ args.join(' ');
      console.log(command);
      return Promise.resolve(command);
    }
    return new Promise((resolve, reject) => {
      if (this.log) {
        console.log('args', args);
      }
      const def = spawn('defaults', args, {shell: true}); // , stdio: ['pipe', 'pipe', 'pipe']});
      // console.log('args', args);

      let stdout = '';
      def.stdout.on('data', (data) => {
        stdout += data;
      });

      let stderr = '';
      def.stderr.on('data', (data) => {
        stderr += data;
      });

      // Errors in starting, killing, or sending a message to `spawn`
      def.on('error', (err) => {
        reject(err);
      });
      // Todo: Or do we want `exit` which waits for stdio to finish regardless if shared with other processes?
      def.on('close', (code) => {
        // Todo: Could there be a `stderr` here?
        if (stderr) {
          reject(new Error(stderr));
          return;
        }
        if (code) {
          const err = new Error(`child process exited with code ${code}`);
          err.stderr = stderr;
          err.code = code;
          reject(err);
          return;
        }
        resolve(stdout);
        // resolve({stdout, stderr});
      });
      if (addStdin) {
        stream = process.stdin;
      }
      if (stream) {
        if ('input' in stream) { // Not a real stream
          def.stdin.setEncoding('utf-8');
          def.stdin.write(stream.input);
          def.stdin.end();
          return;
        }
        // Wait to see if a public API is made available out
        //   of https://github.com/nodejs/node/issues/445
        // console.log('st', stream);
        if (stream._readableState && stream._readableState.encoding) {
          def.stdin.setEncoding(stream._readableState.encoding);
        }
        stream.on('data', (data) => {
          def.stdin.write(data);
        });
        stream.on('close', () => {
          def.stdin.end(); // or `def.stdin.destroy()`?
        });
      }
    });
  }

  /**
  * @param {...*} args
  * @throws {Error}
  * @returns {Promise|string} Returns or resolves with stdout and if a Promise, rejects with an `Error` object set to the stderr or with the event of a `spawn` `error` event; may also reject with an error thrown by {@link module:MacOSDefaults~convertReturnType}
  */
  defaults (...args) {
    if (this.sync) {
      return this.defaultsSync(...args);
    }
    return this.defaultsAsync(...args);
  }

  /**
  * @param {object|undefined} [cfg]
  * @param {boolean} [cfg.hexAsArrays=false]
  * @param {?ReturnType} [cfg.returnType]
  * @param {...*} args
  * @returns {Promise} Resolves with stdout and rejects with an `Error` object set to the stderr or with the event of a `spawn` `error` event; may also reject with an error thrown by {@link module:MacOSDefaults~convertReturnType}
  */
  defaultsAsync ({hexAsArrays = this.jsonResults, returnType = null} = {}, ...args) {
    if (this.debug) {
      const command = 'defaults '+ args.join(' ');
      console.log(command);
      return Promise.resolve(command);
    }
    return new Promise((resolve, reject) => {
      if (this.log) {
        console.log('args', args);
      }
      const def = spawn('defaults', args, {shell: true});
      let stdout = '';
      def.stdout.on('data', (data) => {
        stdout += data;
      });

      let stderr = '';
      def.stderr.on('data', (data) => {
        stderr += data;
      });

      // Errors in starting, killing, or sending a message to `spawn`
      def.on('error', (err) => {
        reject(err);
      });
      // Todo: Or do we want `exit` which waits for stdio to finish regardless if shared with other processes?
      def.on('close', (code) => {
        // Todo: Could there be a `stderr` here?
        if (stderr) {
          console.log('args', args);
          reject(new Error(stderr));
          return;
        }
        if (code) {
          const err = new Error(`child process exited with code ${code}`);
          err.stderr = stderr;
          err.code = code;
          reject(err);
          return;
        }
        if (stdout) {
          try {
            stdout = convertReturnType({hexAsArrays, stdout, returnType});
          } catch (err) {
            reject(err);
            return;
          }
          resolve(stdout);
          return;
        }
        resolve();
        // resolve({stdout, stderr});
      });
    });
  }

  /**
  * @param {object|undefined} [cfg]
  * @param {boolean} [cfg.hexAsArrays=false]
  * @param {?ReturnType} [cfg.returnType]
  * @param {...*} args
  * @throws {Error}
  * @returns {string} Provides stdout from the spawned process
  */
  defaultsSync ({hexAsArrays = this.jsonResults, returnType = null} = {}, ...args) {
    if (this.debug){
      const command  = 'defaults '+ args.join(' ');
      console.log(command);
      return command;
    }
    if (this.log) {
      console.log('args', args);
    }
    const proc = spawnSync('defaults', args, {shell: true, encoding: 'utf-8'});
    if (proc.error) {
      const err = new Error(proc.error);
      err.code = proc.status;
      throw err;
    }
    if (proc.status && proc.stderr) {
      const err = new Error(proc.stderr);
      err.code = proc.status;
      throw err;
    }
    let stdout = proc.stdout;
    stdout = convertReturnType({hexAsArrays, stdout, returnType}); // May throw
    return stdout;
  }
}

exports.MacOSDefaults = MacOSDefaults;
