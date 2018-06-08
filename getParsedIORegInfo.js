/** @module getParsedIORegInfo */
/*
Good info: https://www.cnet.com/news/about-the-os-x-byhost-preferences-directory/
*/
const PlistParser = require('./PlistParser.js');

/**
* Returns results from calls to such as `ioreg -rd1 -c IOPlatformExpertDevice`
* Based on `ioreg.c`
* @todo Put this into own library with `PlistParser` dependency?
* @param {string} str The string containing the ioreg data
* @returns {ParsedIORegResult[]}
*/
function getParsedIORegInfo (str) {
  str = str.trim();

  // e.g., +-o MacBookAir7,2  <class IOPlatformExpertDevice, id 0x100000112, registered, matched, active, busy 0 (158524 ms), retain 42>
  // Todo: Support bold, etc.?
  const classInfo = /(?:^|\n)(?:(\+-o )|(?:[ |] )*)(\S+)(?:@(\S+))?\s+<class (\w+)(?:, id 0x(\w+))?(?:, (!?)registered, (!?)matched, (in)?active, busy (\d+))?(?: \((\d+) ms\))?(?:, retain (\d+))?>([\s\S]+?)(?=\n\w|\s*$)/g;
  let match,
    isNode, ioServiceName, ioServiceLocation, ioServiceClass,
    id, notRegistered, notMatched, inactive, busyTime,
    accumulatedBusyTime, retainCount, plist;
  const matches = [];
  while ((match = classInfo.exec(str)) !== null) {
    [
      , isNode, ioServiceName, ioServiceLocation, ioServiceClass,
      id, notRegistered, notMatched, inactive, busyTime,
      accumulatedBusyTime, retainCount, plist
    ] = match;

    const parser = new PlistParser({plist, allowAngledBracketStrings: true, allowMissingSeparators: true});
    const info = parser.start();
    matches.push({
      isNode: Boolean(isNode),
      ioServiceName,
      ioServiceLocation: ioServiceLocation !== undefined ? ioServiceLocation : null,
      ioServiceClass,
      id: parseInt(id, 16),
      registered: !notRegistered,
      matched: !notMatched,
      active: !inactive,
      busyTime: parseInt(busyTime, 10),
      accumulatedBusyTime: parseInt(accumulatedBusyTime, 10),
      retainCount: retainCount ? parseInt(retainCount, 10) : null,
      info
    });
  }
  return matches;
}
if (typeof module !== 'undefined') {
  module.exports = getParsedIORegInfo;
} else {
  window.getParsedIORegInfo = getParsedIORegInfo; // eslint-disable-line no-undef
}
