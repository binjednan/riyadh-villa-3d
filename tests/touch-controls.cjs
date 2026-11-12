'use strict';
// Deterministic input-math tests, not a substitute for iPhone/Safari hardware QA.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8'),scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const sandbox={console,document:{}};vm.createContext(sandbox);vm.runInContext(scripts[1],sandbox);vm.runInContext(scripts[2],sandbox);const T=sandbox.THREE;
function harness(ortho=false){const events={};const dom={clientWidth:390,clientHeight:700,style:{},addEventListener(k,f){events[k]=f},removeEventListener(){},getRootNode(){return this},ownerDocument:{addEventListener(){},removeEventListener(){}},focus(){}};
 const camera=ortho?new T.OrthographicCamera(-15,15,27,-27,.1,500):new T.PerspectiveCamera(52,390/700,.1,500);camera.position.set(0,10,35);const ctl=new T.OrbitControls(camera,dom);ctl.enableDamping=false;ctl.touches.TWO=T.TOUCH.DOLLY_PAN;ctl.screenSpacePanning=true;ctl.enableRotate=!ortho;ctl.touches.ONE=ortho?T.TOUCH.PAN:T.TOUCH.ROTATE;ctl.update();
 return {camera,ctl,send(k,pts){events[k]({type:k,touches:pts.map(([x,y])=>({pageX:x,pageY:y})),preventDefault(){}})}};
}
let count=0;
for(const ortho of [false,true]){
 let h=harness(ortho),target=h.ctl.target.clone(),dist=h.camera.position.distanceTo(target),dir=h.camera.position.clone().sub(target).normalize();
 h.send('touchstart',[[140,350],[240,350]]);h.send('touchmove',[[170,370],[270,370]]);
 assert(h.ctl.target.distanceTo(target)>.1,'two fingers must pan');assert(Math.abs(h.camera.position.distanceTo(h.ctl.target)-dist)<1e-8,'parallel drag must not zoom');assert(h.camera.position.clone().sub(h.ctl.target).normalize().distanceTo(dir)<1e-8,'parallel drag must not rotate');count+=3;
 h=harness(ortho);dist=h.camera.position.distanceTo(h.ctl.target);let zoom=h.camera.zoom;
 h.send('touchstart',[[145,350],[245,350]]);h.send('touchmove',[[115,350],[275,350]]);assert(ortho?h.camera.zoom>zoom:h.camera.position.distanceTo(h.ctl.target)<dist,'spread must zoom in');
 h.send('touchmove',[[165,350],[225,350]]);assert(ortho?h.camera.zoom<zoom:h.camera.position.distanceTo(h.ctl.target)>dist,'pinch must zoom out');count+=2;
 const before=h.camera.position.clone();h.send('touchend',[[165,350]]);h.send('touchmove',[[185,370]]);assert(h.camera.position.distanceTo(before)>0.01,'two-to-one must resume without re-touch');count++;
 h.send('touchcancel',[]);const stopped=h.camera.position.clone();h.send('touchmove',[[200,400]]);assert(h.camera.position.distanceTo(stopped)<1e-8,'cancel must end gesture');count++;
 h.send('touchstart',[[195,350],[195,350]]);h.send('touchmove',[[194,350],[196,350]]);assert(h.camera.position.toArray().every(Number.isFinite)&&Number.isFinite(h.camera.zoom),'zero-separation pinch must stay finite');count++;
}
console.log(`PASS ${count} perspective/orthographic touch assertions (simulated events, no browser or device claim)`);
