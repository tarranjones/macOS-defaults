// https://developer.apple.com/legacy/library/documentation/Darwin/Reference/ManPages/man1/defaults.1.html

// defaults [-currentHost | -host hostname] write domain { 'plist' | key 'value' }
//  defaults [-currentHost | -host hostname] read [domain [key]]
//  defaults [-currentHost | -host hostname] read-type domain key
//  defaults [-currentHost | -host hostname] rename domain old_key new_key
//  defaults [-currentHost | -host hostname] delete [domain [key]]
//  defaults [-currentHost | -host hostname] { domains | find word | help }

'use strict';
const path = require('path')
const abbrev = require('abbrev')
const fs = require('fs');
const exec = require('child_process').exec;
const execSync= require('child_process').execSync;

const macOSdefault = function (command) {

  var args = Array.prototype.slice.call(arguments, 0)
  if (args.length === 1 && Array.isArray(args[0])) {
    args = args[0]
  }
  this[ args.shift() ].apply(this, args);
}
macOSdefault.commands = {}

var defaultsAsync = function(){
  var args = Array.prototype.slice.call(arguments, 0)
  var cb = defaultCb
  if (typeof args[args.length - 1] === 'function') {
    cb = args.pop()
  }
  exec('defaults '+ args.join(' '), function(error, stdout, stderr) {

    if (error) {
      console.error(error);
      return;
    }
    if(stdout){
      cb.call(null, stdout);
    }
    if(stderr){
      console.log(stderr);
    }
  });
}

var defaultsSync = function(){
  var args = Array.prototype.slice.call(arguments, 0)
  var cb = defaultCb
  if (typeof args[args.length - 1] === 'function') {
    cb = args.pop()
  }
  var stdout = execSync('defaults '+ args.join(' '));
  cb(stdout);
}

function defaultsObj(obj){

  // todo
  var optionsArr = [];

  if(obj.hasOwnProperty('host')){
    optinosArr.push('-'+prop, obj[prop]);
  } else if(obj.hasOwnProperty('currentHost')){
    optinosArr.push('-'+prop);
  }

  ['command', 'domain', 'plist', 'key', 'value', 'old_key', 'new_key'].forEach(function(prop){

    if(obj.hasOwnProperty(prop)){
      optinosArr.push(obj[prop]);
    }
  });
  return optinosArr;
}


var shorthands = {
  'hlp': 'help',
  'rt': 'read-type',
}
var affordances = {
  'get': 'read',
  'get-type': 'read-type',
  'set': 'write',
  'search': 'find',
  'unlink': 'delete',
  'remove': 'delete',
  'rm': 'delete',
}
var extend = Object.assign || require('util')._extend
var aliases = extend(extend({}, shorthands), affordances)
// these are filenames in .
var cmdList = [
  'read',
  'read-type',
  'write',
  'rename',
  'delete',
  'domains',
  'find',
  'help',
  'read-sync',
  'read-type-sync',
  'write-sync',
  'rename-sync',
  'delete-sync',
  'domains-sync',
  'find-sync',
  'help-sync',
  'import',
  'import-sync',
  'export',
  'export-sync'
]

var commandCache = {}

var aliasNames = Object.keys(aliases)

var fullList = cmdList.concat(aliasNames)

var abbrevs = abbrev(fullList);

var abbrevsArray = fullList;//Object.keys(abbrevs)

abbrevsArray.forEach(function addCommand (c) {

  Object.defineProperty(macOSdefault.commands, c, { get: function () {

    var method = deref(c)

    if (commandCache[method]) return commandCache[method]

    var cmd = method;
    var call = defaultsAsync;

    if(method.endsWith('-sync')){
      cmd = method.substring(0,method.length-5);
      call = defaultsSync;
    }

    try {

      var module = require(path.join(__dirname, 'lib', cmd + '.js'))
      Object.keys(module).forEach(function (k) {

        commandCache[k] = function () {
          var args = Array.prototype.slice.call(arguments, 0)
          if (typeof args[args.length - 1] !== 'function') {
            args.push(defaultCb)
          }
          if (args.length === 1) args.unshift([])

          module[k].apply(macOSdefault, args)
        }
      })

    } catch(e){}

    if (commandCache[method]) return commandCache[method]

    commandCache[ method ] = function () {
      var args = Array.prototype.slice.call(arguments, 0)
      if (typeof args[args.length - 1] !== 'function') {
        args.push(defaultCb)
      }
      if (args.length === 1){
        args.unshift([cmd])
      } else {
        args.unshift(cmd)
      }
      call.apply(macOSdefault, args);
    }

    return commandCache[ method ]
  }, enumerable: false, configurable: true })


  // make css-case commands callable via camelCase as well
  if (c.match(/\-([a-z])/)) {
    addCommand(c.replace(/\-([a-z])/g, function (a, b) {
      return b.toUpperCase()
    }))
  }
})

Object.getOwnPropertyNames(macOSdefault.commands).forEach(function (cmd) {

  Object.defineProperty(macOSdefault, cmd, { get: function () {
    return function () {
      var args = Array.prototype.slice.call(arguments, 0)
      var cb = defaultCb

      if (args.length === 1 && Array.isArray(args[0])) {
        args = args[0]
      }

      if (typeof args[args.length - 1] === 'function') {
        cb = args.pop()
      }
      macOSdefault.commands[cmd](args, cb)
    }
  }, enumerable: false, configurable: true })
})
module.exports = macOSdefault;

function deref(c) {
  if (!c) return ''
  if (c.match(/[A-Z]/)) {
    c = c.replace(/([A-Z])/g, function (m) {
      return '-' + m.toLowerCase()
    })
  }
  var a = abbrevs[c]
  if (aliases[a]) a = aliases[a]
  return a
}

function defaultCb(stdout) {
  console.log(`stdout: ${stdout}`);
};
