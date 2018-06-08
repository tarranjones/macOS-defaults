import test from 'ava';
import {MacOSDefaults, jsToPropertyListXML} from '../';

import {execSync} from 'child_process';
import {createReadStream, existsSync, unlinkSync, readFileSync, copyFileSync} from 'fs';
import {homedir} from 'os';
import {join} from 'path';

function escapeDoubleQuotes (val) {
  return '"' + val.replace(/`/g, '\\"') + '"';
}

const expectedXML1 = readFileSync(join(__dirname, 'sample1.plist'), {encoding: 'utf-8'});
const expectedXML2 = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>a</key>
	<string>1</string>
</dict>
</plist>
`;
const expectedXML3 = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>c</key>
	<string>1</string>
</dict>
</plist>
`;
const expectedXML4 = readFileSync(join(__dirname, 'sample4.plist'), {encoding: 'utf-8'});

const expectedXML5 = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict/>
</plist>
`;
const expectedXML6 = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>key1</key>
	<real>32</real>
</dict>
</plist>
`;

const expectedXML7 = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>key1</key>
	<data>
	ASOrze8=
	</data>
</dict>
</plist>
`;

const expectedXML8 = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key></key>
	<string>1</string>
</dict>
</plist>
`;

const expectedXML9 = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>a</key>
	<string></string>
</dict>
</plist>
`;


const getParsedIORegInfo = require('../getParsedIORegInfo.js');

// Get hostname
const ioInfoString = execSync('ioreg -rd1 -c IOPlatformExpertDevice', {encoding: 'utf-8'});
const ioRegInfo = getParsedIORegInfo(ioInfoString);
const host = ioRegInfo[0].info.IOPlatformUUID;

/*
We increment to get different plist test files for async tests or otherwise
we'd need to run tests as `test.serial`
*/
let i = 0;
function getSamplePlistFile ({byHost} = {}) {
  const domain = 'com.example.test.macosdefaults' + (++i);
  const plistPath = join(
    homedir(),
    byHost
      ? `Library/Preferences/ByHost/${domain}.${host}.plist`
      : `Library/Preferences/${domain}.plist`
  );
  if (existsSync(plistPath)) {
    unlinkSync(plistPath);
  }
  return [
    domain,
    plistPath
  ];
}

function copySamplePlistFile ({
  sourceFile = join(__dirname, '/sample1.plist'),
  byHost
} = {}) {
  const domain = 'com.example.test.macosdefaults' + (++i);
  const plistPath = join(
    homedir(),
    byHost
      ? `Library/Preferences/ByHost/${domain}.${host}.plist`
      : `Library/Preferences/${domain}.plist`
  );
  copyFileSync(sourceFile, plistPath);
  return [
    domain,
    plistPath
  ];
}
let j = 0;
function getPlistPath () {
  return join(__dirname, `/sample-test${++j}.plist`);
}

test(`defaults write domain 'plist'`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write(domain, '{a = 1; b = 2;}');
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults write domain 'plist' (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write({domain, plist: '{a = 1; b = 2;}'});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults write domain (as path to file) 'plist'`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile(); // eslint-disable-line no-unused-vars
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write(plistPath.replace(/\.plist$/, ''), '{a = 1; b = 2;}');
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults write domain (as path to file) 'plist' (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile(); // eslint-disable-line no-unused-vars
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write({domain: plistPath.replace(/\.plist$/, ''), plist: '{a = 1; b = 2;}'});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults read -globalDomain`, async t => {
  const mod = new MacOSDefaults();
  let readInfo = await mod.read({g: true});
  t.true(readInfo && 'AppleLanguages' in readInfo);
  readInfo = await mod.read({globalDomain: true});
  t.true(readInfo && 'AppleLanguages' in readInfo);
  readInfo = await mod.read({NSGlobalDomain: true});
  t.true(readInfo && 'AppleLanguages' in readInfo);
});
test(`defaults read -globalDomain key`, async t => {
  const mod = new MacOSDefaults();
  const readInfo = await mod.read({g: true}, 'AppleLanguages');
  t.true(Array.isArray(readInfo));
});
test(`defaults read -globalDomain key (single object)`, async t => {
  const mod = new MacOSDefaults();
  const readInfo = await mod.read({g: true, key: 'AppleLanguages'});
  t.true(Array.isArray(readInfo));
});

test(`defaults read -app application`, async t => {
  const mod = new MacOSDefaults();
  const readInfo = await mod.read({app: 'TextEdit'});
  t.true(readInfo && 'NSWindow Frame NSNavPanelAutosaveName' in readInfo);
});
test(`defaults read -app application key`, async t => {
  const mod = new MacOSDefaults();
  const readInfo = await mod.read({app: 'TextEdit'}, 'NSWindow Frame NSNavPanelAutosaveName');
  t.true(typeof readInfo === 'string');
});
test(`defaults read -app application key (single object)`, async t => {
  const mod = new MacOSDefaults();
  const readInfo = await mod.read({app: 'TextEdit', key: 'NSWindow Frame NSNavPanelAutosaveName'});
  t.true(typeof readInfo === 'string');
});

test(`defaults write domain plist object`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write(domain, {value: {a: '1', b: '2'}});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults write domain plist object; single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write({domain, value: {a: '1', b: '2'}});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults write-sync domain 'plist'`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.write(domain, '{a = 1; b = 2;}');
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults write-sync domain 'plist' (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.write({domain, plist: '{a = 1; b = 2;}'});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults write-sync domain plist object`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.write(domain, {value: {a: '1', b: '2'}});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults write-sync domain plist object; single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.write({domain, value: {a: '1', b: '2'}});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -host hostname write domain 'plist'`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write(domain, '{a = 1; b = 2;}', host);
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -host hostname write domain 'plist' (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write({domain, plist: '{a = 1; b = 2;}', host});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -host hostname write-sync domain 'plist'`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.write(domain, '{a = 1; b = 2;}', host);
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -host hostname write-sync domain 'plist' (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.write({domain, plist: '{a = 1; b = 2;}', host});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -currentHost write domain 'plist'`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write(domain, '{a = 1; b = 2;}', {currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -currentHost write domain 'plist' (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write({domain, plist: '{a = 1; b = 2;}', currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -currentHost write-sync domain 'plist'`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.write(domain, '{a = 1; b = 2;}', {currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -currentHost write-sync domain 'plist' (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.write({domain, plist: '{a = 1; b = 2;}', currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults write domain key 'value'`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write(domain, ['a', '1']);
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});
test(`defaults write domain key 'value' (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write({domain, key: 'a', value: '1'});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});

test(`defaults write domain empty string key 'value'`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write(domain, ['', '1']);
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML8, resultXML);
  unlinkSync(plistPath);
});
test(`defaults write domain empty string key 'value' (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write({domain, key: '', value: '1'});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML8, resultXML);
  unlinkSync(plistPath);
});

test(`defaults write domain key empty string 'value'`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write(domain, ['a', '']);
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML9, resultXML);
  unlinkSync(plistPath);
});
test(`defaults write domain key empty string 'value' (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write({domain, key: 'a', value: ''});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML9, resultXML);
  unlinkSync(plistPath);
});

test(`defaults write domain key 'value' valid types`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();

  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write(domain, ['key1', ['string', 'a string']]);
  await mod.write(domain, ['key2', ['string', `&a'"<>`]]);
  await mod.write(domain, ['key3', ['data', new Uint8Array([3, 4, 0xf])]]);
  await mod.write(domain, ['key4', ['data', [1, 2, 3, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]]]);
  await mod.write(domain, ['key5', ['int', 30]]);
  await mod.write(domain, ['key6', ['float', 32]]);
  await mod.write(domain, ['key7', ['float', 32.3]]);
  await mod.write(domain, ['key8', ['bool', true]]);
  await mod.write(domain, ['key9', ['bool', false]]);
  await mod.write(domain, ['key10', ['date', '1919-01-01T01:01:00Z']]);
  await mod.write(domain, ['key11', ['date', '1919-01-01T01:01:00Z']]);
  await mod.write(domain, ['key12', ['date', '1919-01-01T01:01:00Z']]);
  await mod.write(domain, ['key13', ['date', new Date('2019-01-01T01:01:00Z')]]);
  await mod.write(domain, ['key14', ['array', ['a', 3, true, {}]]]);
  await mod.write(domain, ['key14', ['array-add', [[]]]]);
  await mod.write(domain, ['key15', ['dict', {a: '1', b: 2}]]);
  await mod.write(domain, ['key15', ['dict-add', {z: 78}]]);
  await mod.write(domain, ['key16', ['dict', {}]]);
  await mod.write(domain, ['key16', ['dict-add', {}]]);
  await mod.write(domain, ['key17', ['array', []]]);
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML4, resultXML);
  unlinkSync(plistPath);
});

test(`defaults write domain plist object valid object content`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write(domain, {value: {
    key1: 'a string',
    key2: `&a'"<>`,
    key3: new Uint8Array([3, 4, 0xf]),
    key4: new Uint8Array([1, 2, 3, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]),
    key5: 30,
    // key6 and key7 added below to match sample file
    key8: true,
    key9: false,
    key10: new Date('1919-01-01T01:01:00Z'),
    key11: new Date('1919-01-01T01:01:00Z'),
    key12: new Date('1919-01-01T01:01:00Z'),
    key13: new Date('2019-01-01T01:01:00Z'),
    key14: ['a', 3, true, {}, []],
    key15: {a: '1', b: 2, z: 78},
    key16: {},
    key17: []
  }});
  t.true(existsSync(plistPath), 'Path should now exist');
  // await mod.write(domain, 'key4', ['hex', '123abcdef']);
  await mod.write(domain, 'key6', ['real', 32]);
  await mod.write(domain, 'key7', ['real', 32.3]); // Float rounding done differently depending on how added!

  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML4, resultXML);
  unlinkSync(plistPath);
});

test(`defaults write domain plist object valid (empty) object`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write(domain, {value: {}});
  t.false(existsSync(plistPath), 'Path should still not exist');
  execSync(`defaults write ${escapeDoubleQuotes(plistPath)} '{forceCreation=true;}'`);
  t.true(existsSync(plistPath), 'Path should now exist');
  await mod.write(domain, {value: {}}); // Now it will erase
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML5, resultXML);
  unlinkSync(plistPath);
});

test(`defaults write domain plist object invalid objects (not allowed at root)`, t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile(); // eslint-disable-line no-unused-vars

  let {message} = t.throws(() => {
    return mod.write(domain, {value: 'a string'});
  }, TypeError);
  t.true(message.includes('A plist value must be a plain object.'));
  ({message} = t.throws(() => {
    return mod.write(domain, {value: new Uint8Array([3, 4, 0xf])});
  }, TypeError));
  t.true(message.includes('A plist value must be a plain object.'));
  ({message} = t.throws(() => {
    return mod.write(domain, {value: 30});
  }, TypeError));
  t.true(message.includes('A plist value must be a plain object.'));
  ({message} = t.throws(() => {
    return mod.write(domain, {value: 32.3});
  }, TypeError));
  t.true(message.includes('A plist value must be a plain object.'));
  ({message} = t.throws(() => {
    return mod.write(domain, {value: true});
  }, TypeError));
  t.true(message.includes('A plist value must be a plain object.'));
  ({message} = t.throws(() => {
    return mod.write(domain, {value: false});
  }, TypeError));
  t.true(message.includes('A plist value must be a plain object.'));
  ({message} = t.throws(() => {
    return mod.write(domain, {value: new Date('1919-01-01T01:01:00Z')});
  }, TypeError));
  t.true(message.includes('A plist value must be a plain object.'));
  ({message} = t.throws(() => {
    return mod.write(domain, {value: ['a', 3, true, {}, []]});
  }, TypeError));
  t.true(message.includes('A plist value must be a plain object.'));
});

// If reenabling (but doesn't seem it will work through `defaults`)
// test.todo('useUTCDates');
// const mod = new MacOSDefaults({useUTCDates: true});

test(`defaults write domain plist object; forceReal`, async t => {
  const mod = new MacOSDefaults({forceReal: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write(domain, {value: {
    key1: 32
  }}); // Now it will erase
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML6, resultXML);
  unlinkSync(plistPath);
});
test(`defaults write domain plist object; forceHex`, async t => {
  const mod = new MacOSDefaults({forceHex: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write(domain, {value: {
    key1: '123abcdef'
  }}); // Now it will erase
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML7, resultXML);
  unlinkSync(plistPath);
});

test(`defaults write-sync domain key 'value'`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.write(domain, ['a', '1']);
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});
test(`defaults write-sync domain key 'value' (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.write({domain, key: 'a', value: '1'});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -host hostname write domain key 'value'`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write(domain, ['a', '1']);
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -host hostname write domain key 'value' (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write({domain, key: 'a', value: '1'});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -host hostname write-sync domain key 'value'`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.write(domain, ['a', '1']);
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -host hostname write-sync domain key 'value' (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.write({domain, key: 'a', value: '1'});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -currentHost write domain key 'value'`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write(domain, ['a', '1'], {currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -currentHost write domain key 'value' (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.write({domain, key: 'a', value: '1', currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -currentHost write-sync domain key 'value'`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.write(domain, ['a', '1'], {currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -currentHost write-sync domain key 'value' (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.write({domain, key: 'a', value: '1', currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});

test(`Erring: defaults write; bad key type`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile(); // eslint-disable-line no-unused-vars
  const {message} = await t.throws(() => mod.write(domain, 500), TypeError);
  t.true(message.includes('must be provided with a non-empty plist string or object, or a key-value array'));
});
test(`Erring: defaults write; bad key type (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile(); // eslint-disable-line no-unused-vars
  const {message} = await t.throws(() => mod.write({domain, key: 500}), TypeError);
  t.true(message.includes('The key supplied to write must be a string.'));
});

test(`Erring: defaults write; non-object/non-string/non-array plist`, t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile(); // eslint-disable-line no-unused-vars
  let {message} = t.throws(() => {
    return mod.write(domain, 500);
  }, TypeError);
  t.true(message.includes('must be provided with a non-empty plist string or'));
  ({message} = t.throws(() => {
    return mod.write({domain, plist: 500});
  }, TypeError));
  t.true(message.includes('must be provided with a non-empty plist string or'));
});
test(`Erring: defaults write; plist arrays must be length two`, t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile(); // eslint-disable-line no-unused-vars
  let {message} = t.throws(() => {
    return mod.write(domain, ['key']);
  }, TypeError);
  t.true(message.includes('Plist arrays passed to `write` must be length 2'));
  ({message} = t.throws(() => {
    return mod.write({domain, plist: ['key']});
  }, TypeError));
  ({message} = t.throws(() => {
    return mod.write(domain, []);
  }, TypeError));
  t.true(message.includes('Plist arrays passed to `write` must be length 2'));
  ({message} = t.throws(() => {
    return mod.write({domain, plist: []});
  }, TypeError));
  t.true(message.includes('Plist arrays passed to `write` must be length 2'));
});

test(`Erring: defaults write; plist arrays must have value with valid type-value format`, t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile(); // eslint-disable-line no-unused-vars
  let {message} = t.throws(() => {
    return mod.write(domain, ['key', 555]);
  }, TypeError);
  t.true(message.includes('A value must only be a string or a two-item array with a valid type key.'));
  ({message} = t.throws(() => {
    return mod.write(domain, ['key', ['string']]);
  }, TypeError));
  t.true(message.includes('A value must only be a string or a two-item array with a valid type key.'));
  ({message} = t.throws(() => {
    return mod.write(domain, ['key', ['badType', 'value']]);
  }, TypeError));
  t.true(message.includes('A value must only be a string or a two-item array with a valid type key.'));
});

test(`Erring: defaults write; plist arrays must have type-value pairs which match the type`, t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile(); // eslint-disable-line no-unused-vars
  let {message} = t.throws(() => {
    return mod.write(domain, ['key', ['string', 555]]);
  }, TypeError);
  t.true(message.includes('A string is expected for the `string` value.'));
  ({message} = t.throws(() => {
    return mod.write(domain, ['key', ['data', null]]);
  }, TypeError));
  t.true(message.includes('Hex digits (as a string) are expected for the `data`/`hex` value.'));
  ({message} = t.throws(() => {
    return mod.write(domain, ['key', ['data', '123abcdefg']]);
  }, TypeError));
  t.true(message.includes('Hex digits (as a string) are expected for the `data`/`hex` value.'));
  ({message} = t.throws(() => {
    return mod.write(domain, ['key', ['int', 'badValue']]);
  }, TypeError));
  t.true(message.includes('An integer is expected for the `int`/`integer` value.'));
  ({message} = t.throws(() => {
    return mod.write(domain, ['key', ['int', 30.4]]);
  }, TypeError));
  t.true(message.includes('An integer is expected for the `int`/`integer` value.'));
  ({message} = t.throws(() => {
    return mod.write(domain, ['key', ['float', 'badValue']]);
  }, TypeError));
  t.true(message.includes('A number (float) is expected for the `float` value.'));
  ({message} = t.throws(() => {
    return mod.write(domain, ['key', ['bool', 'badValue']]);
  }, TypeError));
  t.true(message.includes('A boolean is expected for the `bool`/`boolean` value.'));
  ({message} = t.throws(() => {
    return mod.write(domain, ['key', ['date', '2525-bad']]);
  }, TypeError));
  t.true(message.includes('A valid date-string must be supplied.'));
  ({message} = t.throws(() => {
    return mod.write(domain, ['key', ['date', {}]]);
  }, TypeError));
  t.true(message.includes('A date object or valid date string is expected for the `string` value.'));
  ({message} = t.throws(() => {
    return mod.write(domain, ['key', ['date', new Date('bad')]]);
  }, TypeError));
  t.true(message.includes('A date object or valid date string is expected for the `string` value.'));
  ({message} = t.throws(() => {
    return mod.write(domain, ['key', ['array', 'badValue']]);
  }, TypeError));
  t.true(message.includes('An array is expected for the `array` value.'));
  ({message} = t.throws(() => {
    return mod.write(domain, ['key', ['array-add', 'badValue']]);
  }, TypeError));
  t.true(message.includes('An array is expected for the `array-add` value.'));
  ({message} = t.throws(() => {
    return mod.write(domain, ['key', ['dict', 'badValue']]);
  }, TypeError));
  t.true(message.includes('An object is expected for the `dict` value.'));
  ({message} = t.throws(() => {
    return mod.write(domain, ['key', ['dict-add', 'badValue']]);
  }, TypeError));
  t.true(message.includes('An object is expected for the `dict-add` value.'));
});

test(`Erring: defaults write domain 'plist'; non-object/non-string/non-nullish host`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  const {message} = await t.throws(
    () => mod.write(domain, 'a', true)
  );
  t.true(message.includes('If host is not an object, host must either be `undefined`/`null` or a non-empty string'));
});
test(`Erring: defaults write domain 'plist'; non-object/non-string/non-nullish plist`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  const {message} = await t.throws(
    () => mod.write(domain, true)
  );
  t.true(message.includes('`write` must be provided with a non-empty plist string or object, or a key-value array'));
});

test(`Erring: defaults write domain plist object; bad input`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  const {message} = await t.throws(
    () => mod.write(domain, {noValue: 1})
  );
  t.true(message.includes('A plist object must be wrapped inside of a `value` with no other properties'));
});
test(`Erring: defaults write domain plist object; bad input`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  const {message} = await t.throws(
    () => mod.write(domain, {value: 1, extraProperty: 1})
  );
  t.true(message.includes('A plist object must be wrapped inside of a `value` with no other properties'));
});

test(`Erring: jsToPropertyListXML; bad object values`, async t => {
  let {message} = await t.throws(
    () => jsToPropertyListXML(NaN)
  );
  t.true(message.includes('`NaN` is not allowed.'));
  ({message} = await t.throws(
    () => jsToPropertyListXML(new Date('bad'))
  ));
  t.true(message.includes('Invalid date.'));
  ({message} = await t.throws(
    () => jsToPropertyListXML(Symbol('bad'))
  ));
  t.true(message.includes('Unrecognized type, symbol, cannot be converted to XML property list item.'));
});


// We do various checks for bad input in `test/parser.js`, so these are
//  just for ensuring the API surfaces the errors
test(`Erring: defaults write domain 'plist'; bad string input`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  const {message} = await t.throws(
    mod.write(domain, '{a = 1;')
  );
  t.true(message.includes('Could not parse'));
});
test(`Erring: defaults write domain 'plist'; bad string input (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  const {message} = await t.throws(
    mod.write({domain, plist: '{a = 2;'})
  );
  t.true(message.includes('Could not parse'));
});
test(`Erring: defaults write-sync domain 'plist'; bad string input`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  const {message} = t.throws(() => {
    mod.write(domain, '{a = 3;');
  });
  t.true(message.includes('Could not parse'));
});
test(`Erring: defaults write-sync domain 'plist'; bad string input (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  const {message} = t.throws(() => {
    mod.write({domain, plist: '{a = 4;'});
  });
  t.true(message.includes('Could not parse'));
});

test(`defaults rename domain old_key new_key`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  execSync(`defaults write ${escapeDoubleQuotes(plistPath)} 'a' '1'`);
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML); // Assert we created it properly
  await mod.rename(domain, 'a', 'c');
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML2 = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML3, resultXML2);
  unlinkSync(plistPath);
});
test(`defaults rename domain old_key new_key (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  execSync(`defaults write ${escapeDoubleQuotes(plistPath)} 'a' '1'`);
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML); // Assert we created it properly
  await mod.rename({domain, oldKey: 'a', newKey: 'c'});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML2 = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML3, resultXML2);
  unlinkSync(plistPath);
});

test(`defaults rename-sync domain old_key new_key`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  execSync(`defaults write ${escapeDoubleQuotes(plistPath)} 'a' '1'`);
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML); // Assert we created it properly
  mod.rename(domain, 'a', 'c');
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML2 = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML3, resultXML2);
  unlinkSync(plistPath);
});
test(`defaults rename-sync domain old_key new_key (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  execSync(`defaults write ${escapeDoubleQuotes(plistPath)} 'a' '1'`);
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML); // Assert we created it properly
  mod.rename({domain, oldKey: 'a', newKey: 'c'});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML2 = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML3, resultXML2);
  unlinkSync(plistPath);
});

test(`defaults -currentHost rename domain old_key new_key`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  execSync(`defaults -currentHost write ${escapeDoubleQuotes(domain)} 'a' '1'`);
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML); // Assert we created it properly
  await mod.rename(domain, 'a', 'c', {currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML2 = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML3, resultXML2);
  unlinkSync(plistPath);
});
test(`defaults -currentHost rename domain old_key new_key (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  execSync(`defaults -currentHost write ${escapeDoubleQuotes(domain)} 'a' '1'`);
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML); // Assert we created it properly
  await mod.rename({domain, oldKey: 'a', newKey: 'c', currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML2 = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML3, resultXML2);
  unlinkSync(plistPath);
});

test(`defaults -currentHost rename-sync domain old_key new_key`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  execSync(`defaults -currentHost write ${escapeDoubleQuotes(domain)} 'a' '1'`);
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML); // Assert we created it properly
  mod.rename(domain, 'a', 'c', {currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML2 = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML3, resultXML2);
  unlinkSync(plistPath);
});
test(`defaults -currentHost rename-sync domain old_key new_key (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  execSync(`defaults -currentHost write ${escapeDoubleQuotes(domain)} 'a' '1'`);
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML); // Assert we created it properly
  mod.rename({domain, oldKey: 'a', newKey: 'c', currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML2 = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML3, resultXML2);
  unlinkSync(plistPath);
});

test(`defaults -host hostname rename domain old_key new_key`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  execSync(`defaults write ${escapeDoubleQuotes(plistPath)} 'a' '1'`);
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML); // Assert we created it properly
  await mod.rename(domain, 'a', 'c', host);
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML2 = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML3, resultXML2);
  unlinkSync(plistPath);
});
test(`defaults -host hostname rename domain old_key new_key (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  execSync(`defaults write ${escapeDoubleQuotes(plistPath)} 'a' '1'`);
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML); // Assert we created it properly
  await mod.rename({domain, oldKey: 'a', newKey: 'c', host});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML2 = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML3, resultXML2);
  unlinkSync(plistPath);
});

test(`defaults -host hostname rename-sync domain old_key new_key`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  execSync(`defaults write ${escapeDoubleQuotes(plistPath)} 'a' '1'`);
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML); // Assert we created it properly
  mod.rename(domain, 'a', 'c', host);
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML2 = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML3, resultXML2);
  unlinkSync(plistPath);
});
test(`defaults -host hostname rename-sync domain old_key new_key (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  execSync(`defaults write ${escapeDoubleQuotes(plistPath)} 'a' '1'`);
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML); // Assert we created it properly
  mod.rename({domain, oldKey: 'a', newKey: 'c', host});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML2 = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML3, resultXML2);
  unlinkSync(plistPath);
});

test(`Erring: defaults rename; bad key type`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile(); // eslint-disable-line no-unused-vars
  let {message} = await t.throws(() => mod.rename(domain, 'abc', 500), TypeError);
  t.true(message.includes('The key supplied to rename must be a string.'));
  ({message} = await t.throws(() => mod.rename(domain, 500, 'abc'), TypeError));
  t.true(message.includes('The key supplied to rename must be a string.'));
});
test(`Erring: defaults rename; bad key type (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile(); // eslint-disable-line no-unused-vars
  let {message} = await t.throws(() => mod.rename({domain, oldKey: 500, newKey: 'abc'}), TypeError);
  t.true(message.includes('The key supplied to rename must be a string.'));
  ({message} = await t.throws(() => mod.rename({domain, oldKey: 'abc', newKey: 500}), TypeError));
  t.true(message.includes('The key supplied to rename must be a string.'));
});

// We only test this in one form because stdin will be all consumed; we
//   instead test the `stream` argument in subsequent tests
test(`defaults import domain -`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  const p = mod.import(domain, '-');
  process.stdin.setEncoding('utf8');
  process.stdin.emit('data', '{a=1;}');
  process.stdin.end();
  await p;
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});
test(`defaults import domain stream`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  const stream = createReadStream(join(__dirname, '/sample1.plist'));
  await mod.import(domain, stream);
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults import domain stream (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  const stream = createReadStream(join(__dirname, '/sample1.plist'));
  await mod.import({domain, plist: stream});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults import domain string`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.import(domain, {input: '{a=1;b=2;}'});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults import domain string (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.import({domain, plist: {input: '{a=1;b=2;}'}});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

/*
Though the synchronous import is called, note that our wrapper
uses an asynchronous API
*/
test(`defaults import-sync domain stream`, async t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  const stream = createReadStream(join(__dirname, '/sample1.plist'));
  await mod.import(domain, stream);
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults import-sync domain stream (single object)`, async t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  const stream = createReadStream(join(__dirname, '/sample1.plist'));
  await mod.import({domain, plist: stream});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults import-sync domain string`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.import(domain, {input: '{a=1;b=2;}'});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults import-sync domain string (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.import({domain, plist: {input: '{a=1;b=2;}'}});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -currentHost import-sync domain stream`, async t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  const stream = createReadStream(join(__dirname, '/sample1.plist'));
  await mod.import(domain, stream, {currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -currentHost import-sync domain stream (single object)`, async t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  const stream = createReadStream(join(__dirname, '/sample1.plist'));
  await mod.import({domain, plist: stream, currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -currentHost import-sync domain string`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.import(domain, {input: '{a=1;b=2;}'}, {currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -currentHost import-sync domain string (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.import({domain, plist: {input: '{a=1;b=2;}'}, currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -host hostname import-sync domain stream`, async t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  const stream = createReadStream(join(__dirname, '/sample1.plist'));
  await mod.import(domain, stream, host);
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -host hostname import-sync domain stream (single object)`, async t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  const stream = createReadStream(join(__dirname, '/sample1.plist'));
  await mod.import({domain, plist: stream, host});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -host hostname import-sync domain string`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.import(domain, {input: '{a=1;b=2;}'}, host);
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -host hostname import-sync domain string (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.import({domain, plist: {input: '{a=1;b=2;}'}, host});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -currentHost import domain stream`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  const stream = createReadStream(join(__dirname, '/sample1.plist'));
  await mod.import(domain, stream, {currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -currentHost import domain stream (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  const stream = createReadStream(join(__dirname, '/sample1.plist'));
  await mod.import({domain, plist: stream, currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -host hostname import domain stream`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  const stream = createReadStream(join(__dirname, '/sample1.plist'));
  await mod.import(domain, stream, host);
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -host hostname import domain stream (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  const stream = createReadStream(join(__dirname, '/sample1.plist'));
  await mod.import({domain, plist: stream, host});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults import domain plist`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.import(domain, join(__dirname, 'sample1.plist'));
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults import domain plist (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.import({domain, plist: join(__dirname, 'sample1.plist')});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults import-sync domain plist`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.import(domain, join(__dirname, 'sample1.plist'));
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults import-sync domain plist (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.import({domain, plist: join(__dirname, 'sample1.plist')});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -currentHost import-sync domain plist`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.import(domain, join(__dirname, 'sample1.plist'), {currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -currentHost import-sync domain plist (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.import({domain, plist: join(__dirname, 'sample1.plist'), currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -host hostname import-sync domain plist`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.import(domain, join(__dirname, 'sample1.plist'), host);
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -host hostname import-sync domain plist (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  mod.import({domain, plist: join(__dirname, 'sample1.plist'), host});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -currentHost import domain plist`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.import(domain, join(__dirname, 'sample1.plist'), {currentHost: true});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -currentHost import domain plist (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile({byHost: true});
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.import({currentHost: true, domain, plist: join(__dirname, 'sample1.plist')});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -host hostname import domain plist`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.import(domain, join(__dirname, 'sample1.plist'), host);
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -host hostname import domain plist (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile();
  t.false(existsSync(plistPath), 'Path should not exist');
  await mod.import({domain, plist: join(__dirname, 'sample1.plist'), host});
  t.true(existsSync(plistPath), 'Path should now exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults export domain -`, async t => {
  const mod = new MacOSDefaults();
  const resultXML = await mod.export(join(__dirname, 'sample1.plist'), '-');
  t.is(expectedXML1, resultXML);
});
test(`defaults export domain - (single object)`, async t => {
  const mod = new MacOSDefaults();
  const resultXML = await mod.export({domain: join(__dirname, 'sample1.plist'), plist: '-'});
  t.is(expectedXML1, resultXML);
});

test(`defaults export-sync domain -`, t => {
  const mod = new MacOSDefaults({sync: true});
  const resultXML = mod.export(join(__dirname, 'sample1.plist'), '-');
  t.is(expectedXML1, resultXML);
});
test(`defaults export-sync domain - (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const resultXML = mod.export({domain: join(__dirname, 'sample1.plist'), plist: '-'});
  t.is(expectedXML1, resultXML);
});

test(`defaults -currentHost export domain -`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile({byHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = await mod.export(domain, '-', {currentHost: true});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -currentHost export domain - (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile({byHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = await mod.export({domain, plist: '-', currentHost: true});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -currentHost export-sync domain -`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile({byHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = mod.export(domain, '-', {currentHost: true});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -currentHost export-sync domain - (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile({byHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = mod.export({domain, plist: '-', currentHost: true});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -host hostname export domain -`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = await mod.export(domain, '-', host);
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -host hostname export domain - (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = await mod.export({domain, plist: '-', host});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -host hostname export-sync domain -`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = mod.export(domain, '-', host);
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -host hostname export-sync domain - (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = mod.export({domain, plist: '-', host});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
});

test(`defaults export domain plist`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  const newPlistPath = getPlistPath();
  await mod.export(domain, newPlistPath);
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(newPlistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
  unlinkSync(newPlistPath);
});
test(`defaults export domain plist (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  const newPlistPath = getPlistPath();
  await mod.export({domain, plist: newPlistPath});
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(newPlistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
  unlinkSync(newPlistPath);
});

test(`defaults export-sync domain plist`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  const newPlistPath = getPlistPath();
  mod.export(domain, newPlistPath);
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(newPlistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
  unlinkSync(newPlistPath);
});
test(`defaults export-sync domain plist (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  const newPlistPath = getPlistPath();
  mod.export({domain, plist: newPlistPath});
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(newPlistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
  unlinkSync(newPlistPath);
});

test(`defaults -currentHost export domain plist`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile({byHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  const newPlistPath = getPlistPath();
  await mod.export(domain, newPlistPath, {currentHost: true});
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(newPlistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
  unlinkSync(newPlistPath);
});
test(`defaults -currentHost export domain plist (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile({byHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  const newPlistPath = getPlistPath();
  await mod.export({domain, plist: newPlistPath, currentHost: true});
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(newPlistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
  unlinkSync(newPlistPath);
});

test(`defaults -currentHost export-sync domain plist`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile({byHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  const newPlistPath = getPlistPath();
  mod.export(domain, newPlistPath, {currentHost: true});
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(newPlistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
  unlinkSync(newPlistPath);
});
test(`defaults -currentHost export-sync domain plist (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile({byHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  const newPlistPath = getPlistPath();
  mod.export({domain, plist: newPlistPath, currentHost: true});
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(newPlistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
  unlinkSync(newPlistPath);
});

test(`defaults -host hostname export domain plist`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  const newPlistPath = getPlistPath();
  await mod.export(domain, newPlistPath, host);
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(newPlistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
  unlinkSync(newPlistPath);
});
test(`defaults -host hostname export domain plist (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  const newPlistPath = getPlistPath();
  await mod.export({domain, plist: newPlistPath, host});
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(newPlistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
  unlinkSync(newPlistPath);
});

test(`defaults -host hostname export-sync domain plist`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  const newPlistPath = getPlistPath();
  mod.export(domain, newPlistPath, host);
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(newPlistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
  unlinkSync(newPlistPath);
});
test(`defaults -host hostname export-sync domain plist (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  const newPlistPath = getPlistPath();
  mod.export({domain, plist: newPlistPath, host});
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(newPlistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML1, resultXML);
  unlinkSync(plistPath);
  unlinkSync(newPlistPath);
});


test(`defaults delete domain`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  await mod.delete(domain);
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML5, resultXML);
  unlinkSync(plistPath);
});
test(`defaults delete domain (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  await mod.delete({domain});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML5, resultXML);
  unlinkSync(plistPath);
});

test(`defaults delete-sync domain`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  mod.delete(domain);
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML5, resultXML);
  unlinkSync(plistPath);
});
test(`defaults delete-sync domain (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  mod.delete({domain});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML5, resultXML);
  unlinkSync(plistPath);
});


test(`defaults -currentHost delete domain`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile({byHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  await mod.delete(domain, null, {currentHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML5, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -currentHost delete domain (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile({byHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  await mod.delete({domain, currentHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML5, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -currentHost delete-sync domain`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile({byHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  mod.delete(domain, null, {currentHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML5, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -currentHost delete-sync domain (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile({byHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  mod.delete({domain, currentHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML5, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -host hostname delete domain`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  await mod.delete(domain, null, host);
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML5, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -host hostname delete domain (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  await mod.delete({domain, host});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML5, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -host hostname delete-sync domain`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  mod.delete(domain, null, host);
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML5, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -host hostname delete-sync domain (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  mod.delete({domain, host});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML5, resultXML);
  unlinkSync(plistPath);
});


test(`defaults delete domain key`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  await mod.delete(domain, 'b');
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});
test(`defaults delete domain key (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  await mod.delete({domain, key: 'b'});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});

test(`defaults delete-sync domain key`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  mod.delete(domain, 'b');
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});
test(`defaults delete-sync domain key (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  mod.delete({domain, key: 'b'});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -currentHost delete domain key`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile({byHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  await mod.delete(domain, 'b', {currentHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -currentHost delete domain key (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile({byHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  await mod.delete({domain, key: 'b', currentHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -currentHost delete-sync domain key`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile({byHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  mod.delete(domain, 'b', {currentHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -currentHost delete-sync domain key (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile({byHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  mod.delete({domain, key: 'b', currentHost: true});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});


test(`defaults -host hostname delete domain key`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  await mod.delete(domain, 'b', host);
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -host hostname delete domain key (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  await mod.delete({domain, key: 'b', host});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});

test(`defaults -host hostname delete-sync domain key`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  mod.delete(domain, 'b', host);
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});
test(`defaults -host hostname delete-sync domain key (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  mod.delete({domain, key: 'b', host});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML2, resultXML);
  unlinkSync(plistPath);
});

test.todo(`(DANGEROUS!!!) test deleteAll safely (single object)`);
/*
// DANGEROUS TO ENABLE (ASSUMING IT WORKS AND `defaults delete` IS SUPPORTED AS PER `man defaults` `delete` signature)
test(`defaults delete (deleteAll; available on single object only)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = copySamplePlistFile();
  t.true(existsSync(plistPath), 'Path should exist');
  await mod.delete({domain, deleteAll: true});
  t.true(existsSync(plistPath), 'Path should exist');
  const resultXML = execSync(`plutil -convert xml1 ${escapeDoubleQuotes(plistPath)} -o -`, {encoding: 'utf-8'});
  t.is(expectedXML5, resultXML);
  unlinkSync(plistPath);
});
*/

test(`Erring: defaults delete; bad key type`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile(); // eslint-disable-line no-unused-vars
  const {message} = await t.throws(() => mod.delete(domain, 500), TypeError);
  t.true(message.includes('The key supplied to delete must be a string'));
});
test(`Erring: defaults delete; bad key type (single object)`, async t => {
  const mod = new MacOSDefaults();
  const [domain, plistPath] = getSamplePlistFile(); // eslint-disable-line no-unused-vars
  const {message} = await t.throws(() => mod.delete({domain, key: 500}), TypeError);
  t.true(message.includes('The key supplied to delete must be a string'));
});

test(`defaults read domain`, async t => {
  const mod = new MacOSDefaults();
  const readInfo = await mod.read('com.apple.finder');
  t.true(readInfo && 'TrashViewSettings' in readInfo);
});

test(`defaults read domain (single object)`, async t => {
  const mod = new MacOSDefaults();
  const readInfo = await mod.read({domain: 'com.apple.finder'});
  t.true(readInfo && 'TrashViewSettings' in readInfo);
});

test(`defaults read domain key`, async t => {
  const mod = new MacOSDefaults();
  const readInfo = await mod.read('com.apple.finder', 'TrashViewSettings');
  t.true(readInfo && 'CustomViewStyleVersion' in readInfo && 'WindowState' in readInfo);
});
test(`defaults read domain key (single object)`, async t => {
  const mod = new MacOSDefaults();
  const readInfo = await mod.read({domain: 'com.apple.finder', key: 'TrashViewSettings'});
  t.true(readInfo && 'CustomViewStyleVersion' in readInfo && 'WindowState' in readInfo);
});

test(`defaults -currentHost read domain`, async t => {
  const mod = new MacOSDefaults();
  const readInfo = await mod.read('com.apple.screensaver', null, {currentHost: true});
  t.true(readInfo && 'moduleDict' in readInfo);
});
test(`defaults -currentHost read domain (single object)`, async t => {
  const mod = new MacOSDefaults();
  const readInfo = await mod.read({domain: 'com.apple.screensaver', currentHost: true});
  t.true(readInfo && 'moduleDict' in readInfo);
});

test(`defaults -currentHost read domain key`, async t => {
  const mod = new MacOSDefaults();
  const readInfo = await mod.read('com.apple.screensaver', 'moduleDict', {currentHost: true});
  t.true(readInfo && 'displayName' in readInfo && 'moduleName' in readInfo);
});
test(`defaults -currentHost read domain key (single object)`, async t => {
  const mod = new MacOSDefaults();
  const readInfo = await mod.read({domain: 'com.apple.screensaver', key: 'moduleDict', currentHost: true});
  t.true(readInfo && 'displayName' in readInfo && 'moduleName' in readInfo);
});

test(`defaults -host hostname read domain`, async t => {
  const mod = new MacOSDefaults();
  const readInfo = await mod.read('com.apple.finder', null, host);
  t.true(readInfo && 'TrashViewSettings' in readInfo);
});
test(`defaults -host hostname read domain (single object)`, async t => {
  const mod = new MacOSDefaults();
  const readInfo = await mod.read({host, domain: 'com.apple.finder'});
  t.true(readInfo && 'TrashViewSettings' in readInfo);
});
test(`defaults -host hostname read domain key`, async t => {
  const mod = new MacOSDefaults();
  const readInfo = await mod.read('com.apple.finder', 'TrashViewSettings', host);
  t.true(readInfo && 'CustomViewStyleVersion' in readInfo && 'WindowState' in readInfo);
});
test(`defaults -host hostname read domain key (single object)`, async t => {
  const mod = new MacOSDefaults();
  const readInfo = await mod.read({host, domain: 'com.apple.finder', key: 'TrashViewSettings'});
  t.true(readInfo && 'CustomViewStyleVersion' in readInfo && 'WindowState' in readInfo);
});

test(`defaults -host hostname read-sync domain`, t => {
  const mod = new MacOSDefaults({sync: true});
  const readInfo = mod.read('com.apple.finder', null, host);
  t.true(readInfo && 'TrashViewSettings' in readInfo);
});
test(`defaults -host hostname read-sync domain (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const readInfo = mod.read({domain: 'com.apple.finder', host});
  t.true(readInfo && 'TrashViewSettings' in readInfo);
});

test(`defaults -host hostname read-sync domain key`, t => {
  const mod = new MacOSDefaults({sync: true});
  const readInfo = mod.read('com.apple.finder', 'TrashViewSettings', host);
  t.true(readInfo && 'CustomViewStyleVersion' in readInfo && 'WindowState' in readInfo);
});
test(`defaults -host hostname read-sync domain key (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const readInfo = mod.read({host, domain: 'com.apple.finder', key: 'TrashViewSettings'});
  t.true(readInfo && 'CustomViewStyleVersion' in readInfo && 'WindowState' in readInfo);
});

test(`defaults read-sync domain`, t => {
  const mod = new MacOSDefaults({sync: true});
  const readInfo = mod.read('com.apple.finder');
  t.true(readInfo && 'TrashViewSettings' in readInfo);
});
test(`defaults read-sync domain (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const readInfo = mod.read({domain: 'com.apple.finder'});
  t.true(readInfo && 'TrashViewSettings' in readInfo);
});

test(`defaults read-sync domain key`, t => {
  const mod = new MacOSDefaults({sync: true});
  const readInfo = mod.read('com.apple.finder', 'TrashViewSettings');
  t.true(readInfo && 'CustomViewStyleVersion' in readInfo && 'WindowState' in readInfo);
});
test(`defaults read-sync domain key (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const readInfo = mod.read({domain: 'com.apple.finder', key: 'TrashViewSettings'});
  t.true(readInfo && 'CustomViewStyleVersion' in readInfo && 'WindowState' in readInfo);
});

test(`defaults -currentHost read-sync domain`, t => {
  const mod = new MacOSDefaults({sync: true});
  const readInfo = mod.read('com.apple.screensaver', null, {currentHost: true});
  t.true(readInfo && 'moduleDict' in readInfo);
});
test(`defaults -currentHost read-sync domain (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const readInfo = mod.read({domain: 'com.apple.screensaver', currentHost: true});
  t.true(readInfo && 'moduleDict' in readInfo);
});

test(`defaults -currentHost read-sync domain key`, t => {
  const mod = new MacOSDefaults({sync: true});
  const readInfo = mod.read('com.apple.screensaver', 'moduleDict', {currentHost: true});
  t.true(readInfo && 'displayName' in readInfo && 'moduleName' in readInfo);
});
test(`defaults -currentHost read-sync domain key (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const readInfo = mod.read({domain: 'com.apple.screensaver', key: 'moduleDict', currentHost: true});
  t.true(readInfo && 'displayName' in readInfo && 'moduleName' in readInfo);
});

test(`Erring: defaults read; bad key type`, async t => {
  const mod = new MacOSDefaults();
  const {message} = await t.throws(() => mod.read('com.apple.finder', 500), TypeError);
  t.true(message.includes('The key supplied to read must be a string'));
});
test(`Erring: defaults read; bad key type (single object)`, async t => {
  const mod = new MacOSDefaults();
  const {message} = await t.throws(() => mod.read({domain: 'com.apple.finder', key: 500}), TypeError);
  t.true(message.includes('The key supplied to read must be a string'));
});

test(`defaults read-type domain key`, async t => {
  const mod = new MacOSDefaults();
  const typeInfo = await mod.readType('com.apple.finder', 'GoToFieldHistory');
  t.is(typeInfo, 'array');
});

test(`defaults read-type domain key (single object)`, async t => {
  const mod = new MacOSDefaults();
  const typeInfo = await mod.readType({domain: 'com.apple.finder', key: 'GoToFieldHistory'});
  t.is(typeInfo, 'array');
});

test(`defaults -currentHost read-type domain key`, async t => {
  const mod = new MacOSDefaults();
  const typeInfo = await mod.readType('com.apple.screensaver', 'moduleDict', {currentHost: true});
  t.is(typeInfo, 'dictionary');
});

test(`defaults -currentHost read-type domain key (single object)`, async t => {
  const mod = new MacOSDefaults();
  const typeInfo = await mod.readType({domain: 'com.apple.screensaver', key: 'moduleDict', currentHost: true});
  t.is(typeInfo, 'dictionary');
});

test(`defaults -host hostname read-type domain key`, async t => {
  const mod = new MacOSDefaults();
  const typeInfo = await mod.readType('com.apple.finder', 'GoToFieldHistory', host);
  t.is(typeInfo, 'array');
});

test(`defaults -host hostname read-type domain key (single object)`, async t => {
  const mod = new MacOSDefaults();
  const typeInfo = await mod.readType({host, domain: 'com.apple.finder', key: 'GoToFieldHistory'});
  t.is(typeInfo, 'array');
});

test(`defaults read-type-sync domain key`, t => {
  const mod = new MacOSDefaults({sync: true});
  const typeInfo = mod.readType('com.apple.finder', 'GoToFieldHistory');
  t.is(typeInfo, 'array');
});

test(`defaults read-type-sync domain key (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const typeInfo = mod.readType({domain: 'com.apple.finder', key: 'GoToFieldHistory'});
  t.is(typeInfo, 'array');
});

test(`defaults -currentHost read-type-sync domain key`, t => {
  const mod = new MacOSDefaults({sync: true});
  const typeInfo = mod.readType('com.apple.screensaver', 'moduleDict', {currentHost: true});
  t.is(typeInfo, 'dictionary');
});

test(`defaults -currentHost read-type-sync domain key (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const typeInfo = mod.readType({domain: 'com.apple.screensaver', key: 'moduleDict', currentHost: true});
  t.is(typeInfo, 'dictionary');
});

test(`defaults -host hostname read-type-sync domain key`, t => {
  const mod = new MacOSDefaults({sync: true});
  const typeInfo = mod.readType('com.apple.finder', 'GoToFieldHistory', host);
  t.is(typeInfo, 'array');
});

test(`defaults -host hostname read-type-sync domain key (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const typeInfo = mod.readType({host, domain: 'com.apple.finder', key: 'GoToFieldHistory'});
  t.is(typeInfo, 'array');
});

test(`Erring: defaults read-type; bad key type`, async t => {
  const mod = new MacOSDefaults();
  const {message} = await t.throws(() => mod.readType('com.apple.finder', 500), TypeError);
  t.true(message.includes('The key supplied to read-type must be a string.'));
});
test(`Erring: defaults read-type; bad key type (single object)`, async t => {
  const mod = new MacOSDefaults();
  const {message} = await t.throws(() => mod.readType({domain: 'com.apple.finder', key: 500}), TypeError);
  t.true(message.includes('The key supplied to read-type must be a string.'));
});

test(`Erring: defaults read-type domain; missing domain`, async t => {
  const mod = new MacOSDefaults();
  const {message} = await t.throws(() => mod.readType(null, 'abc'), TypeError);
  t.true(message.includes('A domain is not optional for read-type'));
});
test(`Erring: defaults read-type domain; missing domain (single object)`, async t => {
  const mod = new MacOSDefaults();
  const {message} = await t.throws(() => mod.readType({key: 'abc'}), TypeError);
  t.true(message.includes('If domain is an object, it must have an `app` or `g`/`globalDomain`/`NSGlobalDomain` property'));
});

test(`Erring: defaults read-type domain; missing key`, async t => {
  const mod = new MacOSDefaults();
  const {message} = await t.throws(() => mod.readType('com.apple.finder'), TypeError);
  t.true(message.includes('The key supplied to read-type must be a string.'));
});
test(`Erring: defaults read-type domain; missing key (single object)`, async t => {
  const mod = new MacOSDefaults();
  const {message} = await t.throws(() => mod.readType({domain: 'com.apple.finder'}), TypeError);
  t.true(message.includes('The key supplied to read-type must be a string.'));
});

test(`defaults domains`, async t => {
  const mod = new MacOSDefaults();
  const domainsArr = await mod.domains();
  // console.log('domainsArr', domainsArr);
  t.true(Array.isArray(domainsArr) && domainsArr.length > 0);
});

test(`defaults -currentHost domains`, async t => {
  const mod = new MacOSDefaults();
  const domainsArr = await mod.domains({currentHost: true});
  // console.log('domainsArr', domainsArr);
  t.true(Array.isArray(domainsArr) && domainsArr.length > 0);
});

test(`defaults -host hostname domains`, async t => {
  const mod = new MacOSDefaults();
  const domainsArr = await mod.domains(host);
  // console.log('domainsArr', domainsArr);
  t.true(Array.isArray(domainsArr) && domainsArr.length > 0);
});

test(`defaults domains-sync`, t => {
  const mod = new MacOSDefaults({sync: true});
  const domainsArr = mod.domains();
  // console.log('domainsArr', domainsArr);
  t.true(Array.isArray(domainsArr) && domainsArr.length > 0);
});

test(`defaults -currentHost domains-sync`, t => {
  const mod = new MacOSDefaults({sync: true});
  const domainsArr = mod.domains({currentHost: true});
  // console.log('domainsArr', domainsArr);
  t.true(Array.isArray(domainsArr) && domainsArr.length > 0);
});

test(`defaults -host hostname domains-sync`, t => {
  const mod = new MacOSDefaults({sync: true});
  const domainsArr = mod.domains(host);
  // console.log('domainsArr', domainsArr);
  t.true(Array.isArray(domainsArr) && domainsArr.length > 0);
});

test(`defaults find word`, async t => {
  const mod = new MacOSDefaults();
  const findResult = await mod.find('Text');
  t.true(Array.isArray(findResult) && findResult.length > 0);
});
test(`defaults find word (single object)`, async t => {
  const mod = new MacOSDefaults();
  const findResult = await mod.find({word: 'Text'});
  t.true(Array.isArray(findResult) && findResult.length > 0);
});

test(`defaults -currentHost find word`, async t => {
  const mod = new MacOSDefaults();
  const findResult = await mod.find('moduleDict', {currentHost: true});
  t.true(Array.isArray(findResult) && findResult.length > 0);
});
test(`defaults -currentHost find word (single object)`, async t => {
  const mod = new MacOSDefaults();
  const findResult = await mod.find({word: 'moduleDict', currentHost: true});
  t.true(Array.isArray(findResult) && findResult.length > 0);
});

test(`defaults -host hostname find word`, async t => {
  const mod = new MacOSDefaults();
  const findResult = await mod.find('Text', host);
  t.true(Array.isArray(findResult) && findResult.length > 0);
});
test(`defaults -host hostname find word (single object)`, async t => {
  const mod = new MacOSDefaults();
  const findResult = await mod.find({host, word: 'Text'});
  t.true(Array.isArray(findResult) && findResult.length > 0);
});

test(`defaults find-sync word`, t => {
  const mod = new MacOSDefaults({sync: true});
  const findResult = mod.find('Text');
  t.true(Array.isArray(findResult) && findResult.length > 0);
});
test(`defaults find-sync word (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const findResult = mod.find({word: 'Text'});
  t.true(Array.isArray(findResult) && findResult.length > 0);
});

test(`defaults -currentHost find-sync word`, t => {
  const mod = new MacOSDefaults({sync: true});
  const findResult = mod.find('moduleDict', {currentHost: true});
  t.true(Array.isArray(findResult) && findResult.length > 0);
});
test(`defaults -currentHost find-sync word (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const findResult = mod.find({word: 'moduleDict', currentHost: true});
  t.true(Array.isArray(findResult) && findResult.length > 0);
});

test(`defaults -host hostname find-sync word`, t => {
  const mod = new MacOSDefaults({sync: true});
  const findResult = mod.find('Text', host);
  t.true(Array.isArray(findResult) && findResult.length > 0);
});
test(`defaults -host hostname find-sync word (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const findResult = mod.find({host, word: 'Text'});
  t.true(Array.isArray(findResult) && findResult.length > 0);
});

test(`Erring: defaults find; missing word`, async t => {
  const mod = new MacOSDefaults();
  const {message} = await t.throws(() => mod.find(), TypeError);
  t.true(message.includes('Find must be supplied a string word argument'));
});
test(`Erring: defaults find; missing word (single object)`, async t => {
  const mod = new MacOSDefaults();
  const {message} = await t.throws(() => mod.find({}), TypeError);
  t.true(message.includes('Find must be supplied a string word argument'));
});

test(`defaults help`, async t => {
  const mod = new MacOSDefaults();
  const helpText = await mod.help();
  t.true(helpText.includes(`'defaults' [-currentHost | -host <hostname>] followed by one of the following:`));
});

test(`defaults -currentHost help`, async t => {
  const mod = new MacOSDefaults();
  const helpText = await mod.help({currentHost: true});
  t.true(helpText.includes(`'defaults' [-currentHost | -host <hostname>] followed by one of the following:`));
});

test(`defaults help-sync`, t => {
  const mod = new MacOSDefaults({sync: true});
  const helpText = mod.help();
  t.true(helpText.includes(`'defaults' [-currentHost | -host <hostname>] followed by one of the following:`));
});

test(`defaults -currentHost help-sync`, t => {
  const mod = new MacOSDefaults({sync: true});
  const helpText = mod.help({currentHost: true});
  t.true(helpText.includes(`'defaults' [-currentHost | -host <hostname>] followed by one of the following:`));
});

test(`defaults -host hostname help`, async t => {
  const mod = new MacOSDefaults();
  const helpText = await mod.help(host);
  t.true(helpText.includes(`'defaults' [-currentHost | -host <hostname>] followed by one of the following:`));
});

test(`defaults -host hostname help (single object)`, async t => {
  const mod = new MacOSDefaults();
  const helpText = await mod.help({host});
  t.true(helpText.includes(`'defaults' [-currentHost | -host <hostname>] followed by one of the following:`));
});

test(`defaults -host hostname help-sync`, t => {
  const mod = new MacOSDefaults({sync: true});
  const helpText = mod.help(host);
  t.true(helpText.includes(`'defaults' [-currentHost | -host <hostname>] followed by one of the following:`));
});

test(`defaults -host hostname help-sync (single object)`, t => {
  const mod = new MacOSDefaults({sync: true});
  const helpText = mod.help({host});
  t.true(helpText.includes(`'defaults' [-currentHost | -host <hostname>] followed by one of the following:`));
});

test(`Erring: defaults import; missing plist/-`, async t => {
  const mod = new MacOSDefaults();
  const {message} = await t.throws(() => mod.import('com.example.something'), TypeError);
  t.true(message.includes('`import` must be provided with a path to a plist or -'));
});
test(`Erring: defaults import; bad plist/-`, async t => {
  const mod = new MacOSDefaults();
  const {message} = await t.throws(() => mod.import('com.example.something', 250), TypeError);
  t.true(message.includes('`import` must be provided with a path to a plist or -'));
});
test(`Erring: defaults export; missing plist/-`, async t => {
  const mod = new MacOSDefaults();
  const {message} = await t.throws(() => mod.export('com.example.something'), TypeError);
  t.true(message.includes('`export` must be provided with a path to a plist or -'));
});
test(`Erring: defaults export; bad plist/-`, async t => {
  const mod = new MacOSDefaults();
  const {message} = await t.throws(() => mod.export('com.example.something', 250), TypeError);
  t.true(message.includes('`export` must be provided with a path to a plist or -'));
});

test(`Erring: defaults; bad app`, async t => {
  const mod = new MacOSDefaults();
  const {message} = await t.throws(() => mod.read({app: ''}), TypeError);
  t.true(message.includes('app, if present on a domain object, must be a non-empty string'));
});
test(`Erring: defaults; bad host (missing property)`, async t => {
  const mod = new MacOSDefaults();
  const {message} = await t.throws(() => mod.help({}), TypeError);
  t.true(message.includes('If host is an object, it must have have a `currentHost` or `host` property'));
});
test(`Erring: defaults; bad host (non-null/string/object)`, async t => {
  const mod = new MacOSDefaults();
  const {message} = await t.throws(() => mod.help({host: 55}), TypeError);
  t.true(message.includes('If host is not an object, host must either be `undefined`/`null` or a non-empty string'));
});
test(`Erring: defaults; bad domain (missing property)`, async t => {
  const mod = new MacOSDefaults();
  const {message} = await t.throws(() => mod.read({domain: {}}), TypeError);
  t.true(message.includes('If domain is an object, it must have an `app` or `g`/`globalDomain`/`NSGlobalDomain` property'));
});
test(`Erring: defaults; bad domain (non-string)`, async t => {
  const mod = new MacOSDefaults();
  const {message} = await t.throws(() => mod.read({domain: 55}), TypeError);
  t.true(message.includes('If a global or app domain is not specified, a non-empty string must be supplied to read'));
});
