/* eslint-disable no-console */
// https://developer.apple.com/legacy/library/documentation/Darwin/Reference/ManPages/man1/defaults.1.html

// defaults [-currentHost | -host hostname] write domain { 'plist' | key 'value' }
//  defaults [-currentHost | -host hostname] read [domain [key]]
//  defaults [-currentHost | -host hostname] read-type domain key
//  defaults [-currentHost | -host hostname] rename domain old_key new_key
//  defaults [-currentHost | -host hostname] delete [domain [key]]
//  defaults [-currentHost | -host hostname] { domains | find word | help }

'use strict';
const path = require('path');
const abbrev = require('abbrev');
const {exec} = require('child_process');
const {execSync}= require('child_process');
const flatten = require('flatten');

const macOSdefault = function (...args) {
  if (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }
  this[args.shift()].apply(this, args);
};
macOSdefault.commands = {};
macOSdefault.debug = false;

const defaultsAsync = function (...args) {
  if (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }

  const cb = typeof args[args.length - 1] === 'function'
    ? args.pop()
    : defaultCb;

  const command = 'defaults '+ flatten(args).join(' ');

  if (macOSdefault.debug) {
    console.log(command);
  } else {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        return;
      }
      if (stdout) {
        cb.call(null, stdout);
      }
      if (stderr) {
        console.log(stderr);
      }
    });
  }
};

const defaultsSync = function (...args) {
  if (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }

  const cb = typeof args[args.length - 1] === 'function'
    ? args.pop()
    : defaultCb;

  const command  = 'defaults '+ flatten(args).join(' ');
  if (macOSdefault.debug){
    console.log(command);
  } else {
    const stdout = execSync(command);
    cb(stdout);
  }
};

function defaultsObj (obj) { // eslint-disable-line no-unused-vars
  // todo
  const optionsArr = [];

  if (obj.hasOwnProperty('host')) {
    const prop = 'host';
    optionsArr.push('-' + prop, obj[prop]);
  } else if (obj.hasOwnProperty('currentHost')) {
    const prop = 'currentHost';
    optionsArr.push('-' + prop);
  }

  ['command', 'domain', 'plist', 'key', 'value', 'old_key', 'new_key'].forEach((prop) => {
    if (obj.hasOwnProperty(prop)) {
      optionsArr.push(obj[prop]);
    }
  });
  return optionsArr;
}

const shorthands = {
  'hlp': 'help',
  'rt': 'read-type',
};
const affordances = {
  'get': 'read',
  'get-type': 'read-type',
  'set': 'write',
  'search': 'find',
  'unlink': 'delete',
  'remove': 'delete',
  'rm': 'delete',
};
const aliases = Object.assign({}, shorthands, affordances);
// these are filenames in .
const cmdList = [
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
];

const commandCache = {};
const aliasNames = Object.keys(aliases);
const fullList = cmdList.concat(aliasNames);
const abbrevs = abbrev(fullList);
const abbrevsArray = Object.keys(abbrevs);

abbrevsArray.forEach(function addCommand (c) {
  Object.defineProperty(macOSdefault.commands, c, {get () {
    const method = deref(c);

    if (commandCache[method]) {
      return commandCache[method];
    }

    let cmd = method;
    let call = defaultsAsync;
    if (method.endsWith('-sync')) {
      cmd = method.substring(0, method.length - 5);
      call = defaultsSync;
    }

    try {
      const module = require(path.join(__dirname, 'lib', cmd + '.js'));
      Object.entries(module).forEach(function ([k, method]) {
        commandCache[k] = function (...args) {
          if (typeof args[args.length - 1] !== 'function') {
            args.push(defaultCb);
          }
          if (args.length === 1) {
            args.unshift([]);
          }
          method.apply(macOSdefault, args);
        };
      });
    } catch (e) {} // eslint-disable-line no-empty

    if (commandCache[method]) {
      return commandCache[method];
    }

    commandCache[method] = function (...args) {
      if (typeof args[args.length - 1] !== 'function') {
        args.push(defaultCb);
      }
      if (args.length === 1){
        args.unshift([cmd]);
      } else {
        args.unshift(cmd);
      }
      call.apply(macOSdefault, args);
    };

    return commandCache[method];
  }, enumerable: false, configurable: true});

  // make css-case commands callable via camelCase as well
  if (c.match(/-([a-z])/)) {
    addCommand(c.replace(/-([a-z])/g, (a, b) => {
      return b.toUpperCase();
    }));
  }
});

Object.getOwnPropertyNames(macOSdefault.commands).forEach(function (cmd) {
  Object.defineProperty(macOSdefault, cmd, {get () {
    return function (...args) {
      if (args.length === 1 && Array.isArray(args[0])) {
        args = args[0];
      }
      const cb = typeof args[args.length - 1] === 'function'
        ? args.pop()
        : defaultCb;
      macOSdefault.commands[cmd](args, cb);
    };
  }, enumerable: false, configurable: true});
});
module.exports = macOSdefault;

function deref (c) {
  if (!c) {return '';}
  if (c.match(/[A-Z]/)) {
    c = c.replace(/([A-Z])/g, (m) => {
      return '-' + m.toLowerCase();
    });
  }
  let a = abbrevs[c];
  if (aliases[a]) {
    a = aliases[a];
  }
  return a;
}

function defaultCb (stdout) {
  console.log(`stdout: ${stdout}`);
}
