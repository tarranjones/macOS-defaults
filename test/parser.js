/* eslint-disable no-console, no-unused-vars, quotes */

import test from 'ava';
import Parser from '../PlistParser.js';

test("root array", t => {
  const plist = '(3, abc)';
  const parser = new Parser({plist});
  const result = parser.start();
  t.deepEqual(result, ["3", "abc"]);
});

test("root dict", t => {
  const plist = '{ a = 3; b = 4;}';
  const parser = new Parser({plist});
  const result = parser.start();
  t.deepEqual(result, {a: "3", b: "4"});
});

test("root string (unquoted)", t => {
  const plist = 'abc';
  const parser = new Parser({plist});
  const result = parser.start();
  t.is(result, 'abc');
});

test("Erring: Bad root string (unquoted Unicode)", t => {
  const plist = '\u1234';
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, TypeError);
  t.true(
    message.includes('Unexpected character') &&
    message.includes('after root processed on first run')
  );
});

test("root string (quoted)", t => {
  const plist = '"abc"';
  const parser = new Parser({plist});
  const result = parser.start();
  t.is(result, 'abc');
});

test("root string (quoted with Unicode)", t => {
  const plist = '"ab\u1234c"';
  const parser = new Parser({plist});
  const result = parser.start();
  t.is(result, 'ab\u1234c');
});

test("root angled bracket string", t => {
  const plist = '<"abc">';
  const parser = new Parser({plist, allowAngledBracketStrings: true});
  const result = parser.start();
  t.is(result, 'abc');
});

test("root unquoted string", t => {
  const plist = 'abc def';
  const parser = new Parser({plist, allowUnquotedStringsAtRoot: true});
  const result = parser.start();
  t.is(result, 'abc def');
});

test("Erring: unquoted string not at root", t => {
  let plist = `(abc def)`;
  let parser = new Parser({plist, allowUnquotedStringsAtRoot: true});
  let {message} = t.throws(() => {
    const result = parser.start();
  }, TypeError);
  t.true(message.includes('Missing comma between array items'));
  plist = `{a=abc def=ggg;}`;
  parser = new Parser({plist, allowUnquotedStringsAtRoot: true});
  ({message} = t.throws(() => {
    const result = parser.start();
  }, TypeError));
  t.true(message.includes('Missing semi-colon between dict items'));
});

test("root string (quoted with escaped quote)", t => {
  const plist = '"ab\\\\"c"';
  const parser = new Parser({plist});
  const result = parser.start();
  t.is(result, 'ab"c');
});

test("root angled bracket string (with escaped quote)", t => {
  const plist = '<"ab\\\\"c">';
  const parser = new Parser({plist, allowAngledBracketStrings: true});
  const result = parser.start();
  t.is(result, 'ab"c');
});

test("root data (hex)", t => {
  const plist = '<a3 1f>';
  const parser = new Parser({plist});
  const result = parser.start();
  t.deepEqual(result, new Uint8Array([0xa, 3, 1, 0xf]));
});

test("root data (hex upper case)", t => {
  const plist = '<A3 1F>';
  const parser = new Parser({plist});
  const result = parser.start();
  t.deepEqual(result, new Uint8Array([0xa, 3, 1, 0xf]));
});

test("root dict (nested dict)", t => {
  const plist = '{ a = { inner = "abc"; }; b = 4;}';
  const parser = new Parser({plist});
  const result = parser.start();
  t.deepEqual(result, {a: {inner: "abc"}, b: "4"});
});

test("root array (nested array)", t => {
  const plist = '( a, (inner), b, c)';
  const parser = new Parser({plist});
  const result = parser.start();
  t.deepEqual(result, ["a", ["inner"], "b", "c"]);
});

test("root array (nested dict)", t => {
  const plist = '( a, {inner = "ggg";}, b, c)';
  const parser = new Parser({plist});
  const result = parser.start();
  t.deepEqual(result, ["a", {inner: "ggg"}, "b", "c"]);
});

test("root dict (nested array)", t => {
  const plist = '{ a = ( "inner" ); b = 4;}';
  const parser = new Parser({plist});
  const result = parser.start();
  t.deepEqual(result, {a: ["inner"], b: "4"});
});

test("root dict (nested with all types)", t => {
  const plist =
    '{ a = ( "inner" ); ' +
    'b = "4"; ' +
    'c = <0a3f>; ' +
    'd = { efg = hij; kl = 55; mm = (abc, def); }; ' +
    'n = (); oo = {}; }';
  const parser = new Parser({plist});
  const result = parser.start();
  t.deepEqual(result, {
    a: ["inner"],
    b: "4",
    c: new Uint8Array([0, 0xA, 3, 0xF]),
    d: {efg: "hij", kl: "55", mm: ["abc", "def"]},
    n: [],
    oo: {}
  });
});

test("Erring: Bad data (hex)", t => {
  const plist = `<g>`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, TypeError);
  t.true(message.includes('Invalid data (hex) end character'));
});

test("Erring: Angled bracket string, bad character after quote", t => {
  const plist = `<"string"x`;
  const parser = new Parser({plist, allowAngledBracketStrings: true});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, TypeError);
  t.true(message.includes('Angled bracket string closing bracket expected but found'));
});

test("Erring: Escaped quote outside of quoted string", t => {
  const plist = `abc\\\\"`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, TypeError);
  t.true(
    message.includes('Unexpected character') &&
    message.includes('after root processed on first run')
  );
});

test("Erring: Unfinished quoted string", t => {
  const plist = `"abc`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, RangeError);
  t.true(message.includes('Unexpected end of quoted string at offset'));
});

test("Erring: Unfinished quoted string (after backslash)", t => {
  const plist = `"ab\\`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, RangeError);
  t.true(message.includes('Unexpected end of quoted string (after backslash)'));
});

test("Erring: Unfinished angled bracket string", t => {
  const plist = `<"abc`;
  const parser = new Parser({plist, allowAngledBracketStrings: true});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, RangeError);
  t.true(message.includes('Unexpected end of quoted string at offset'));
});

test("Erring: Unfinished angled bracket string", t => {
  const plist = `<"ab\\`;
  const parser = new Parser({plist, allowAngledBracketStrings: true});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, RangeError);
  t.true(message.includes('Unexpected end of quoted string (after backslash)'));
});

test("Erring: Non-value supplied", t => {
  const plist = `   `;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, RangeError);
  t.true(message.includes('No non-whitespace input found'));
});

test("Erring: Unexpected dict closing", t => {
  const plist = `(a, b})`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, TypeError);
  t.true(message.includes('Unexpected close for dict at'));
});

test("Erring: Unexpected array closing", t => {
  const plist = `{a = );}`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, TypeError);
  t.true(message.includes('Unexpected close for array at'));
});

test("Erring: Missing comma within array", t => {
  const plist = `(a b)`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, TypeError);
  t.true(message.includes('Missing comma between array items'));
});
test("Erring: Missing semi-colon within dict", t => {
  const plist = `{a=1 b=2;}`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, TypeError);
  t.true(message.includes('Missing semi-colon between dict items'));
});

test("Erring: Missing equals within dict", t => {
  const plist = `{a 1; b=2;)`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, TypeError);
  t.true(message.includes('Expecting "=" character after dict key'));
});
test("Erring: Missing value within dict", t => {
  const plist = `{a= ; b=2;)`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, TypeError);
  t.true(message.includes('Unexpected semi-colon during non-dict mode'));
});

test("Erring: Unexpected array comma within dict", t => {
  const plist = `{a = b,}`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, TypeError);
  t.true(message.includes('Unexpected comma during non-array mode'));
});

test("Erring: Unexpected dict semi-colon within array", t => {
  const plist = `(a, b;)`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, TypeError);
  t.true(message.includes('Unexpected semi-colon during non-dict mode'));
});

test("Erring: Unexpected dict equals after dict key", t => {
  const plist = `{a b;}`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, TypeError);
  t.true(message.includes('Expecting "=" character after dict key'));
});

test("Erring: Unexpected character", t => {
  const plist = `"abc" g`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, TypeError);
  t.true(
    message.includes('Unexpected character') &&
    message.includes('after root processed on first run')
  );
});

test("Erring: Incomplete data (hex)", t => {
  const plist = `<abc1`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, RangeError);
  t.true(
    message.includes('Premature end to data (hex)')
  );
});

test("Erring: Incomplete angled bracket string", t => {
  const plist = `<"abc"`;
  const parser = new Parser({plist, allowAngledBracketStrings: true});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, RangeError);
  t.true(
    message.includes('Premature end to angled bracket string')
  );
});

test("Erring: Incomplete array (ends before ending parenthesis)", t => {
  const plist = `(abc`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, RangeError);
  t.true(
    message.includes('Premature end to array')
  );
});

test("Erring: Incomplete dict (ends before key)", t => {
  const plist = `{`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, RangeError);
  t.true(
    message.includes('Premature end to dict (before key)')
  );
});

test("Erring: Incomplete dict (ends after key)", t => {
  const plist = `{abc`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, RangeError);
  t.true(
    message.includes('Premature end to dict (before equals)')
  );
});

test("Erring: Incomplete dict (ends after equals)", t => {
  const plist = `{abc=`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, RangeError);
  t.true(
    message.includes('Premature end to dict (after equals)')
  );
});

test("Erring: Incomplete dict (ends before semi-colon)", t => {
  const plist = `{abc=def`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, RangeError);
  t.true(
    message.includes('Premature end to dict (before semi-colon)')
  );
});

test("Erring: Incomplete dict (ends after semi-colon)", t => {
  const plist = `{abc=def;`;
  const parser = new Parser({plist});
  const {message} = t.throws(() => {
    const result = parser.start();
  }, RangeError);
  t.true(
    message.includes('Premature end to dict (after semi-colon)')
  );
});
