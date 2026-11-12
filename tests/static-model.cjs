'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8'),scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.equal(scripts.length,4);const hash=crypto.createHash('sha256').update(scripts[0]).digest('hex');assert.equal(hash,'760327930616b203ae20fadeba91a9054332a8c3ab17cdbf41595ecf3f8672f2','Original embedded model must remain byte-for-byte intact');JSON.parse(scripts[0]);
for(let i=1;i<scripts.length;i++)new vm.Script(scripts[i]);
assert(html.includes('aria-pressed="true" title="إظهار أو إخفاء أسماء الغرف"'));
console.log('PASS original model SHA256 and all three JavaScript syntax checks');
