const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const html=fs.readFileSync('index.html','utf8'),scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const {window}=parseHTML(html),document=window.document;let frames=[];
const ctx={createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)}},putImageData(){},createLinearGradient(){return {addColorStop(){}}},createRadialGradient(){return {addColorStop(){}}},fillRect(){},stroke(){},beginPath(){},moveTo(){},lineTo(){}};
window.HTMLCanvasElement.prototype.getContext=function(){return ctx};
Object.defineProperty(window.HTMLSelectElement.prototype,'value',{get(){return this._value||''},set(v){this._value=v},configurable:true});
const data=new Map();Object.assign(window,{console,performance,requestAnimationFrame(fn){frames.push(fn)},setTimeout(){return 1},clearTimeout(){},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},matchMedia(){return {matches:false,addEventListener(){}}},innerWidth:1440,devicePixelRatio:1});
Object.defineProperty(document,'hidden',{value:false});
for(const e of [document.querySelector('#stage'),document.querySelector('#cv')]){Object.defineProperty(e,'clientWidth',{value:1080});Object.defineProperty(e,'clientHeight',{value:1000});e.getBoundingClientRect=()=>({left:0,top:0,width:1080,height:1000});}
vm.createContext(window);for(let i=1;i<=2;i++)vm.runInContext(scripts[i],window);
const T=window.THREE;T.WebGLRenderer=class{constructor(){this.shadowMap={enabled:false};this.capabilities={getMaxAnisotropy:()=>8};this.clippingPlanes=[];this.info={render:{}}}setPixelRatio(){}setSize(){}render(){}};T.PMREMGenerator=class{fromEquirectangular(){return {texture:new T.Texture()}}dispose(){}};
vm.runInContext(scripts[3],window);assert(window.__villa);console.log('PASS application initialization with mocked WebGL (no visual assertion)');
const V=window.__villa,$=s=>document.querySelector(s);assert.equal(V.S.labelSize,9);assert.equal(V.controls.touches.TWO,T.TOUCH.DOLLY_PAN);assert.equal(V.M.R.length,JSON.parse(scripts[0]).R.length);
$('#bLabels').onclick();assert.equal(V.S.labels,false);$('#bLabels').onclick();assert.equal(V.S.labels,true);
$('#labelSize').value='8';$('#labelSize').oninput();assert.equal(V.S.labelSize,8);
$('#floorseg button[data-f="GF"]').onclick();$('#bPlan').onclick();assert(V.cam().isOrthographicCamera);assert(V.controls.enablePan&&V.controls.enableZoom);
$('#lightMood').value='golden';$('#lightMood').onchange();assert.equal(V.S.lighting,'golden');
$('#trySand').onclick();assert.equal(V.S.style,'E');assert(!V.cam().isOrthographicCamera);
const before=JSON.stringify(V.M);$('[data-mod="drygarden"]').onclick();assert.equal(V.S.mods.drygarden,true);assert(V.meshes.filter(m=>m.userData.mk==='drygarden').every(m=>m.visible));$('[data-mod="drygarden"]').onclick();assert(V.meshes.filter(m=>m.userData.mk==='drygarden').every(m=>!m.visible));
$('#originalMass').onclick();assert.equal(V.S.style,'base');assert(V.meshes.filter(m=>m.userData.c==='mod').every(m=>!m.visible));assert.equal(JSON.stringify(V.M),before);
$('#cleanShot').onclick();assert.equal(V.S.labels,false);assert.equal(V.S.edges,false);assert($('#panel').classList.contains('hidden-panel'));$('#bPanel').onclick();assert(!$('#panel').classList.contains('hidden-panel'));
V.setFloor('FF');V.planView(true);assert(V.cam().isOrthographicCamera);assert(V.meshes.filter(m=>m.userData.contact&&m.userData.l==='GF').every(m=>!m.visible));
console.log('PASS labels, camera modes, lighting preset, design variant, proposal on/off, baseline reset, clean-shot flow, floor-isolated contacts; model unchanged');

function pointer(type,id,x=100,y=100){const e=new window.Event(type,{bubbles:true});Object.assign(e,{pointerId:id,pointerType:'touch',clientX:x,clientY:y,button:0});$('#cv').dispatchEvent(e)}
V.S.sel={id:'test-sentinel'};pointer('pointerdown',1);pointer('pointerdown',2,200);pointer('pointerup',1);pointer('pointerup',2,200);assert.equal(V.S.sel.id,'test-sentinel','two-finger gesture must not select an object');
pointer('pointerdown',3);pointer('pointermove',3,140);pointer('pointermove',3,100);pointer('pointerup',3);assert.equal(V.S.sel.id,'test-sentinel','a drag returning to its starting point is not a tap');V.S.sel=null;
$('#realisticFinish').checked=false;$('#realisticFinish').onchange();assert(V.meshes.filter(m=>m.userData.contact||m.userData.c==='detail').every(m=>!m.visible));
console.log('PASS multi-touch tap suppression, return-to-origin drag suppression and optional visual details');
