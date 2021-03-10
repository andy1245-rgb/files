   */const D=[7,8,9,10,11,12,13,14,16,17,19,21,23,25,28,31,34,37,41,45,50,55,60,66,73,80,88,97,107,118,130,143,157,173,190,209,230,253,279,307,337,371,408,449,494,544,598,658,724,796,876,963,1060,1166,1282,1411,1552,1707,1878,2066,2272,2499,2749,3024,3327,3660,4026,4428,4871,5358,5894,6484,7132,7845,8630,9493,10442,11487,12635,13899,15289,16818,18500,20350,22385,24623,27086,29794,32767],L=[-1,-1,-1,-1,2,4,6,8,-1,-1,-1,-1,2,4,6,8];function k(t,e){const s=new DataView(t);if(1380533830!==s.getUint32(0)||1463899717!==s.getUint32(8))return Promise.reject(new Error("Unrecognized audio format"));const i={},r=s.byteLength-8;let n=12;for(;n<r;)i[String.fromCharCode(s.getUint8(n),s.getUint8(n+1),s.getUint8(n+2),s.getUint8(n+3))]=n,n+=8+s.getUint32(n+4,!0);const o=s.getUint16(20,!0),a=s.getUint32(24,!0);if(17===o){const t=(s.getUint16(38,!0)-1)/2+4,r=s.getUint32(i.fact+8,!0),n=e.createBuffer(1,r,a),o=n.getChannelData(0);let h,c,l,u,d=0,f=-1;const g=i.data+8;let _=g,m=0;for(;;)if((_-g)%t==0&&f<0){if(_>=s.byteLength)break;h=s.getInt16(_,!0),_+=2,d=s.getUint8(_),_+=1,_++,d>88&&(d=88),o[m++]=h/32767}else{if(f<0){if(_>=s.byteLength)break;f=s.getUint8(_),_+=1,l=15&f}else l=f>>4&15,f=-1;c=D[d],u=0,4&l&&(u+=c),2&l&&(u+=c>>1),1&l&&(u+=c>>2),u+=c>>3,d+=L[l],d>88&&(d=88),d<0&&(d=0),h+=8&l?-u:u,h>32767&&(h=32767),h<-32768&&(h=-32768),o[m++]=h/32768}return Promise.resolve(n)}return Promise.reject(new Error("Unrecognized WAV format "+o))}function B(t){const e=new DataView(t).getUint16(20,!0);return function(t){const e=new DataView(t);return 1380533830===e.getUint32(0)&&1463899717===e.getUint32(8)}(t)&&17===e}class F{constructor(t,e){this.name=t,this.url=e,this.audioBuffer=null,this.source=null,this.playbackRate=1,this.downloadMyAudioBuffer()}get duration(){return this.audioBuffer.duration}*start(){let t=!1,e=!0;if(this._markDone&&this._markDone(),this.audioBuffer)this.playMyAudioBuffer(),t=!0;else{const s=this._doneDownloading;this._doneDownloading=i=>{i?e=!1:(this.playMyAudioBuffer(),t=!0,delete this._doneDownloading),s&&s(!0)}}for(;!t&&e;)yield;return e}*playUntilDone(){let t=!0;const e=yield*this.start();if(this.audioBuffer&&(this.source.addEventListener("ended",()=>{t=!1,delete this._markDone}),e))for(this._markDone=()=>{t=!1,delete this._markDone};t;)yield}stop(){this._markDone&&this._markDone(),this.source&&(this.source.disconnect(),this.source=null)}downloadMyAudioBuffer(){return fetch(this.url).then(t=>t.arrayBuffer()).then(t=>B(t)?k(t,F.audioContext).catch(t=>(console.warn(`Failed to load sound "${this.name}" - will not play:\n`+t),null)):new Promise((e,s)=>{F.audioContext.decodeAudioData(t,e,s)})).then(t=>(this.audioBuffer=t,this._doneDownloading&&this._doneDownloading(),t))}playMyAudioBuffer(){this.audioBuffer&&(this.source&&this.source.disconnect(),this.source=F.audioContext.createBufferSource(),this.source.buffer=this.audioBuffer,this.source.playbackRate.value=this.playbackRate,this.target&&this.source.connect(this.target),this.source.start(F.audioContext.currentTime))}connect(t){t!==this.target&&(this.target=t,this.source&&(this.source.disconnect(),this.source.connect(this.target)))}setPlaybackRate(t){this.playbackRate=t,this.source&&(this.source.playbackRate.value=t)}isConnectedTo(t){return this.target===t}static get audioContext(){return this._setupAudioContext(),this._audioContext}static _setupAudioContext(){if(!this._audioContext){const t=window.AudioContext||window.webkitAudioContext;this._audioContext=new t}}static decodeADPCMAudio(t){return k(t,this.audioContext)}}class N{constructor(t){const{getNonPatchSoundList:e}=t;this.config=t,this.inputNode=F.audioContext.createGain(),this.effectNodes={},this.resetToInitial(),this.getNonPatchSoundList=e}resetToInitial(){const t=N.getInitialEffectValues();if(this.effectValues)for(const[t,e]of Object.entries(N.getInitialEffectValues()))!1!==N.getEffectDescriptor(t).reset&&this.setEffectValue(t,e);else this.effectValues=t}updateAudioEffect(t){const e=N.getEffectDescriptor(t);if(!e)return;const s=this.effectValues[t];if(e.isPatch){let i=e;do{i=N.getNextEffectDescriptor(i.name)}while(i&&!this.effectNodes[i.name]);let r=e;do{r=N.getPreviousEffectDescriptor(r.name)}while(r&&!this.effectNodes[r.name]);i&&(i=this.effectNodes[i.name]),r&&(i=this.effectNodes[r.name]),r||(r={output:this.inputNode}),!i&&this.target&&(i={input:this.target});let n=this.effectNodes[e.name];if(n||s===e.initial||(n=e.makeNodes(),this.effectNodes[e.name]=n,r.output.disconnect(),r.output.connect(n.input),i&&n.output.connect(i.input)),s===e.initial){if(n){for(const t of new Set(Object.values(n)))t.disconnect();i&&r.output.connect(i.input),delete this.effectNodes[t]}}else e.set(s,n)}else for(const t of this.getNonPatchSoundList())e.set(s,t)}connect(t){this.target=t;let e=N.getLastEffectDescriptor();do{e=N.getPreviousEffectDescriptor(e.name)}while(e&&!this.effectNodes[e.name]);e=e?this.effectNodes[e.name]:{output:this.inputNode},e.output.disconnect(),e.output.connect(t)}setEffectValue(t,e){e=Number(e),t in this.effectValues&&!isNaN(e)&&e!==this.effectValues[t]&&(this.effectValues[t]=e,this.clampEffectValue(t),this.updateAudioEffect(t))}changeEffectValue(t,e){e=Number(e),t in this.effectValues&&!isNaN(e)&&0!==e&&(this.effectValues[t]+=e,this.clampEffectValue(t),this.updateAudioEffect(t))}clampEffectValue(t){const e=N.getEffectDescriptor(t);let s=this.effectValues[t];"minimum"in e&&s<e.minimum?s=e.minimum:"maximum"in e&&s>e.maximum&&(s=e.maximum),this.effectValues[t]=s}getEffectValue(t){return this.effectValues[t]||0}clone(t){const e=new N(Object.assign({},this.config,t));for(const[t,s]of Object.entries(this.effectValues)){N.getEffectDescriptor(t).resetOnClone||e.setEffectValue(t,s)}return e.connect(this.target),e}applyToSound(t){t.connect(this.inputNode);for(const[e,s]of Object.entries(this.effectValues)){const i=N.getEffectDescriptor(e);i.isPatch||i.set(s,t)}}isTargetOf(t){return t.isConnectedTo(this.inputNode)}static getInitialEffectValues(){const t={};for(const{name:e,initial:s}of this.effectDescriptors)t[e]=s;return t}static getEffectDescriptor(t){return this.effectDescriptors.find(e=>e.name===t)}static getFirstEffectDescriptor(){return this.effectDescriptors[0]}static getLastEffectDescriptor(){return this.effectDescriptors[this.effectDescriptors.length-1]}static getNextEffectDescriptor(t){return this.effectDescriptors.slice(1).find((e,s)=>this.effectDescriptors[s].name===t)}static getPreviousEffectDescriptor(t){return this.effectDescriptors.slice(0,-1).find((e,s)=>this.effectDescriptors[s+1].name===t)}}N.decayDuration=.025,N.decayWait=.05,N.effectDescriptors=[{name:"pan",initial:0,minimum:-100,maximum:100,isPatch:!0,makeNodes(){const t=F.audioContext,e=t.createGain(),s=t.createGain(),i=t.createGain(),r=t.createChannelMerger(2),n=r;return e.connect(s),e.connect(i),s.connect(r,0,0),i.connect(r,0,1),{input:e,output:n,leftGain:s,rightGain:i,channelMerger:r}},set(t,{input:e,output:s,leftGain:i,rightGain:r}){const n=(t+100)/200,o=Math.cos(n*Math.PI/2),a=Math.sin(n*Math.PI/2),{currentTime:h}=F.audioContext,{decayWait:c,decayDuration:l}=N;i.gain.setTargetAtTime(o,h+c,l),r.gain.setTargetAtTime(a,h+c,l)}},{name:"pitch",initial:0,isPatch:!1,set(t,e){const s=t/10,i=Math.pow(2,s/12);e.setPlaybackRate(i)}},{name:"volume",initial:100,minimum:0,maximum:100,resetOnStart:!1,resetOnClone:!0,isPatch:!0,makeNodes(){const t=F.audioContext.createGain();return{input:t,output:t,node:t}},set(t,{node:e}){e.gain.linearRampToValueAtTime(t/100,F.audioContext.currentTime+N.decayDuration)}}];class P{constructor(t){this.effectChain=t;for(const{name:e}of N.effectDescriptors)Object.defineProperty(this,e,{get:()=>t.getEffectValue(e),set:s=>t.setEffectValue(e,s)})}clear(){this.effectChain.resetToInitial()}}class O{constructor(){this._bitmask=0,this._effectValues={};for(let t=0;t<u.length;t++){const e=u[t];this._effectValues[e]=0,Object.defineProperty(this,e,{get:()=>this._effectValues[e],set:s=>{this._effectValues[e]=s,this._bitmask=0===s?this._bitmask&~(1<<t):this._bitmask|1<<t}})}}_clone(){const t=new O;for(const e of Object.keys(this._effectValues))t[e]=this[e];return t}clear(){for(const t of Object.keys(this._effectValues))this._effectValues[t]=0;this._bitmask=0}}class I{constructor(t,e={}){this._project=null;const{costumeNumber:s,layerOrder:i=0}=t;this._costumeNumber=s,this._layerOrder=i,this.triggers=[],this.watchers={},this.costumes=[],this.sounds=[],this.effectChain=new N({getNonPatchSoundList:this.getSoundsPlayedByMe.bind(this)}),this.effectChain.connect(F.audioContext.destination),this.effects=new O,this.audioEffects=new P(this.effectChain),this._vars=e}getSoundsPlayedByMe(){return this.sounds.filter(t=>this.effectChain.isTargetOf(t))}get stage(){return this._project.stage}get sprites(){return this._project.sprites}get vars(){return this._vars}get costumeNumber(){return this._costumeNumber}set costumeNumber(t){this._costumeNumber=(t-1)%this.costumes.length+1}set costume(t){if("number"==typeof t&&(this.costumeNumber=t),"string"==typeof t){const e=this.costumes.findIndex(e=>e.name===t);if(e>-1)this.costumeNumber=e+1;else switch(t){case"next costume":case"next backdrop":this.costumeNumber=this.costumeNumber+1;break;case"previous costume":case"previous backdrop":this.costumeNumber=this.costumeNumber-1;break;case"random costume":case"random backdrop":{const t=1,e=this.costumes.length,s=this.costumeNumber,i=e-t;let r=t+Math.floor(Math.random()*i);r>=s&&r++,this.costumeNumber=r;break}default:isNaN(t)||0===t.trim().length||(this.costumeNumber=Number(t))}}}get costume(){return this.costumes[this.costumeNumber-1]}moveAhead(t=1/0){"number"==typeof t?this._project.changeSpriteLayer(this,t):this._project.changeSpriteLayer(this,1,t)}moveBehind(t=1/0){"number"==typeof t?this._project.changeSpriteLayer(this,-t):this._project.changeSpriteLayer(this,-1,t)}degToRad(t){return t*Math.PI/180}radToDeg(t){return 180*t/Math.PI}degToScratch(t){return 90-t}scratchToDeg(t){return 90-t}radToScratch(t){return this.degToScratch(this.radToDeg(t))}scratchToRad(t){return this.degToRad(this.scratchToDeg(t))}normalizeDeg(t){return((t+180)%360+360)%360-180}warp(t){const e=t.bind(this);return(...t)=>{const s=e(...t);for(;!s.next().done;);}}random(t,e){const s=Math.min(t,e),i=Math.max(t,e);return s%1==0&&i%1==0?Math.floor(Math.random()*(i-s+1))+s:Math.random()*(i-s)+s}*wait(t){let e=new Date;for(e.setMilliseconds(e.getMilliseconds()+1e3*t);new Date<e;)yield}get mouse(){return this._project.input.mouse}keyPressed(t){return this._project.input.keyPressed(t)}get timer(){return(new Date-this._project.timerStart)/1e3}restartTimer(){this._project.restartTimer()}*startSound(t){const e=this.getSound(t);e&&(this.effectChain.applyToSound(e),yield*e.start())}*playSoundUntilDone(t){const e=this.getSound(t);e&&(e.connect(this.effectChain.inputNode),this.effectChain.applyToSound(e),yield*e.playUntilDone())}getSound(t){return"number"==typeof t?this.sounds[(t-1)%this.sounds.length]:this.sounds.find(e=>e.name===t)}stopAllSounds(){this._project.stopAllSounds()}stopAllOfMySounds(){for(const t of this.sounds)t.stop()}broadcast(t){return this._project.fireTrigger(o.BROADCAST,{name:t})}*broadcastAndWait(t){let e=!0;for(this.broadcast(t).then(()=>{e=!1});e;)yield}clearPen(){this._project.renderer.clearPen()}*askAndWait(t){this._speechBubble&&this.say(null);let e=!1;for(this._project.askAndWait(t).then(()=>{e=!0});!e;)yield}get answer(){return this._project.answer}}class U extends I{constructor(t,...e){super(t,...e);const{x:s,y:i,direction:r,rotationStyle:n,costumeNumber:o,size:a,visible:h,penDown:c,penSize:l,penColor:u}=t;this._x=s,this._y=i,this._direction=r,this.rotationStyle=n||U.RotationStyle.ALL_AROUND,this._costumeNumber=o,this.size=a,this.visible=h,this.parent=null,this.clones=[],this._penDown=c||!1,this.penSize=l||1,this._penColor=u||M.rgb(0,0,0),this._speechBubble={text:"",style:"say",timeout:null}}createClone(){const t=Object.assign(Object.create(Object.getPrototypeOf(this)),this);t._project=this._project,t.triggers=this.triggers.map(t=>new o(t.trigger,t.options,t._script)),t.costumes=this.costumes,t.sounds=this.sounds,t._vars=Object.assign({},this._vars),t._speechBubble={text:"",style:"say",timeout:null},t.effects=this.effects._clone();let e=this;for(;e.parent;)e=e.parent;t.effectChain=e.effectChain.clone({getNonPatchSoundList:t.getSoundsPlayedByMe.bind(t)}),t.audioEffects=new P(t.effectChain),t.clones=[],t.parent=this,this.clones.push(t);const s=t.triggers.filter(t=>t.matches(o.CLONE_START));this._project._startTriggers(s.map(e=>({trigger:e,target:t})))}deleteThisClone(){null!==this.parent&&(this.parent.clones=this.parent.clones.filter(t=>t!==this),this._project.runningTriggers=this._project.runningTriggers.filter(({target:t})=>t!==this))}andClones(){return[this,...this.clones.flatMap(t=>t.andClones())]}get direction(){return this._direction}set direction(t){this._direction=this.normalizeDeg(t)}goto(t,e){t===this.x&&e===this.y||(this.penDown&&this._project.renderer.penLine({x:this._x,y:this._y},{x:t,y:e},this._penColor,this.penSize),this._x=t,this._y=e)}get x(){return this._x}set x(t){this.goto(t,this._y)}get y(){return this._y}set y(t){this.goto(this._x,t)}move(t){const e=this.scratchToRad(this.direction);this.goto(this._x+t*Math.cos(e),this._y+t*Math.sin(e))}*glide(t,e,s){const i=(t,e,s)=>t+(e-t)*s,r=new Date,n=this._x,o=this._y;let a;do{a=(new Date-r)/(1e3*t),this.goto(i(n,e,a),i(o,s,a)),yield}while(a<1)}get penDown(){return this._penDown}set penDown(t){t&&this._project.renderer.penLine({x:this.x,y:this.y},{x:this.x,y:this.y},this._penColor,this.penSize),this._penDown=t}get penColor(){return this._penColor}set penColor(t){t instanceof M?this._penColor=t:console.error(t+" is not a valid penColor. Try using the Color class!")}stamp(){this._project.renderer.stamp(this)}touching(t,e=!1){if("string"==typeof t)switch(t){case"mouse":return this._project.renderer.checkPointCollision(this,{x:this.mouse.x,y:this.mouse.y},e);default:return console.error(`Cannot find target "${t}" in "touching". Did you mean to pass a sprite class instead?`),!1}else if(t instanceof M)return this._project.renderer.checkColorCollision(this,t);return this._project.renderer.checkSpriteCollision(this,t,e)}colorTouching(t,e){return"string"==typeof e?(console.error(`Cannot find target "${e}" in "touchingColor". Did you mean to pass a sprite class instead?`),!1):"string"==typeof t?(console.error(`Cannot find color "${t}" in "touchingColor". Did you mean to pass a Color instance instead?`),!1):e instanceof M?this._project.renderer.checkColorCollision(this,e,t):this._project.renderer.checkSpriteCollision(this,e,!1,t)}say(t){clearTimeout(this._speechBubble.timeout),this._speechBubble={text:String(t),style:"say",timeout:null}}think(t){clearTimeout(this._speechBubble.timeout),this._speechBubble={text:String(t),style:"think",timeout:null}}*sayAndWait(t,e){clearTimeout(this._speechBubble.timeout);let s=!1;const i=setTimeout(()=>{this._speechBubble.text="",this.timeout=null,s=!0},1e3*e);for(this._speechBubble={text:t,style:"say",timeout:i};!s;)yield}*thinkAndWait(t,e){clearTimeout(this._speechBubble.timeout);let s=!1;const i=setTimeout(()=>{this._speechBubble.text="",this.timeout=null,s=!0},1e3*e);for(this._speechBubble={text:t,style:"think",timeout:i};!s;)yield}}U.RotationStyle=Object.freeze({ALL_AROUND:Symbol("ALL_AROUND"),LEFT_RIGHT:Symbol("LEFT_RIGHT"),DONT_ROTATE:Symbol("DONT_ROTATE")});class j extends I{constructor(t,...e){super(t,...e),Object.defineProperties(this,{width:{value:t.width||1280,enumerable:!0},height:{value:t.height||1080,enumerable:!0}}),this.name="Stage",this.__counter=0}}class z{constructor(t,e){const s=t.stage.width,i=t.stage.height;this.project=t,this.stage=this.createStage(s,i),this.gl=this.stage.getContext("webgl",{antialias:!1}),e?this.setRenderTarget(e):this.renderTarget=null,this._shaderManager=new g(this),this._skinCache=new v(this),this._currentShader=null,this._currentFramebuffer=null,this._screenSpaceScale=1;const r=this.gl;r.enable(r.BLEND),r.blendFunc(r.ONE,r.ONE_MINUS_SRC_ALPHA),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!0);const n=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,n),r.bufferData(r.ARRAY_BUFFER,new Float32Array([0,0,0,1,1,0,1,1,0,1,1,0]),r.STATIC_DRAW),r.activeTexture(r.TEXTURE0),this._penSkin=new _(this,s,i),this._collisionBuffer=this._createFramebufferInfo(s,i,r.NEAREST,!0)}_createFramebufferInfo(t,e,s,i=!1){const r=this.gl,n=r.createTexture();r.bindTexture(r.TEXTURE_2D,n),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,s),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,s),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,t,e,0,r.RGBA,r.UNSIGNED_BYTE,null);const o={texture:n,width:t,height:e,framebuffer:r.createFramebuffer()};if(this._setFramebuffer(o),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,n,0),i){const s=r.createRenderbuffer();r.bindRenderbuffer(r.RENDERBUFFER,s),r.renderbufferStorage(r.RENDERBUFFER,r.DEPTH_STENCIL,t,e),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.RENDERBUFFER,s)}return o}_setShader(t){if(t!==this._currentShader){const e=this.gl;e.useProgram(t.program);const s=t.attrib("a_position");return e.enableVertexAttribArray(s),e.vertexAttribPointer(s,2,e.FLOAT,!1,0,0),this._currentShader=t,this._updateStageSize(),!0}return!1}_setFramebuffer(t){t!==this._currentFramebuffer&&(this._currentFramebuffer=t,null===t?(this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this._updateStageSize()):(this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,t.framebuffer),this.gl.viewport(0,0,t.width,t.height)))}setRenderTarget(t){"string"==typeof t&&(t=document.querySelector(t)),this.renderTarget=t,this.renderTarget.classList.add("leopard__project"),this.renderTarget.style.width=this.project.stage.width+"px",this.renderTarget.style.height=this.project.stage.height+"px",this.renderTarget.append(this.stage)}_renderLayers(t,e={}){e=Object.assign({},{drawMode:g.DrawModes.DEFAULT,renderSpeechBubbles:!0},e);const s=t instanceof Set,i="function"==typeof e.filter,r=r=>!(s&&!t.has(r)||i&&!e.filter(r));if(r(this.project.stage)&&this.renderSprite(this.project.stage,e),r(this._penSkin)){const t=a.create();a.scale(t,t,this._penSkin.width,-this._penSkin.height),a.translate(t,t,-.5,-.5),this._setSkinUniforms(this._penSkin,e.drawMode,t,1,null),this.gl.drawArrays(this.gl.TRIANGLES,0,6)}for(const t of this.project.spritesAndClones)r(t)&&!1!==t.visible&&this.renderSprite(t,e)}_updateStageSize(){this._currentShader&&this.gl.uniform2f(this._currentShader.uniform("u_stageSize"),this.project.stage.width,this.project.stage.height),null===this._currentFramebuffer&&this.gl.viewport(0,0,this.gl.drawingBufferWidth,this.gl.drawingBufferHeight)}_resize(){const t=this.stage.getBoundingClientRect(),e=window.devicePixelRatio,s=Math.round(t.width*e),i=Math.round(t.height*e);this.stage.width===s&&this.stage.height===i||(this.stage.width=s,this.stage.height=i,this._screenSpaceScale=Math.max(s/this.project.stage.width,i/this.project.stage.height),this._updateStageSize())}update(){this._resize(),this._setFramebuffer(null);const t=this.gl;t.clearColor(1,1,1,1),t.clear(t.COLOR_BUFFER_BIT),this._skinCache.beginTrace(),this._renderLayers(),this._skinCache.endTrace()}createStage(t,e){const s=document.createElement("canvas");return s.width=t,s.height=e,s.style.width=s.style.height="100%",s.style.imageRendering="pixelated",s.style.imageRendering="crisp-edges",s.style.imageRendering="-webkit-optimize-contrast",s}_setSkinUniforms(t,e,s,i,r,n){const o=this.gl,a=t.getTexture(i*this._screenSpaceScale);if(!a)return;let h=0;r&&(h=r._bitmask),"number"==typeof n&&(h&=n);const c=this._shaderManager.getShader(e,h);if(this._setShader(c),o.uniformMatrix3fv(c.uniform("u_transform"),!1,s),0!==h){for(const t of Object.keys(r._effectValues)){const e=r._effectValues[t];0!==e&&o.uniform1f(c.uniform("u_"+t),e)}0!==r._effectValues.pixelate&&o.uniform2f(c.uniform("u_skinSize"),t.width,t.height)}o.bindTexture(o.TEXTURE_2D,a),o.uniform1i(c.uniform("u_texture"),0)}_calculateSpriteMatrix(t){const e=a.create();if(!(t instanceof j)){switch(a.translate(e,e,t.x,t.y),t.rotationStyle){case U.RotationStyle.ALL_AROUND:a.rotate(e,e,t.scratchToRad(t.direction));break;case U.RotationStyle.LEFT_RIGHT:t.direction<0&&a.scale(e,e,-1,1)}const s=t.size/100;a.scale(e,e,s,s)}const s=1/t.costume.resolution;return a.translate(e,e,-t.costume.center.x*s,(t.costume.center.y-t.costume.height)*s),a.scale(e,e,t.costume.width*s,t.costume.height*s),e}_calculateSpeechBubbleMatrix(t,e){const s=this.getBoundingBox(t);let i;e.width+s.right>this.project.stage.width/2?(i=s.left-e.width,e.flipped=!0):(i=s.right,e.flipped=!1),i=Math.round(i-e.offsetX);const r=Math.round(s.top-e.offsetY),n=a.create();return a.translate(n,n,i,r),a.scale(n,n,e.width,e.height),n}renderSprite(t,e){const s=Object.prototype.hasOwnProperty.call(t,"size")?t.size/100:1;if(this._setSkinUniforms(this._skinCache.getSkin(t.costume),e.drawMode,this._calculateSpriteMatrix(t),s,t.effects,e.effectMask),Array.isArray(e.colorMask)&&this.gl.uniform4fv(this._currentShader.uniform("u_colorMask"),e.colorMask),this.gl.drawArrays(this.gl.TRIANGLES,0,6),e.renderSpeechBubbles&&t._speechBubble&&""!==t._speechBubble.text){const s=this._skinCache.getSkin(t._speechBubble);this._setSkinUniforms(s,e.drawMode,this._calculateSpeechBubbleMatrix(t,s),1,null),this.gl.drawArrays(this.gl.TRIANGLES,0,6)}}getBoundingBox(t){return m.fromMatrix(this._calculateSpriteMatrix(t))}_stencilSprite(t,e){const s=this.gl;s.clearColor(0,0,0,0),s.clear(s.COLOR_BUFFER_BIT|s.STENCIL_BUFFER_BIT),s.enable(s.STENCIL_TEST),s.stencilFunc(s.ALWAYS,1,1),s.stencilOp(s.KEEP,s.KEEP,s.REPLACE),s.colorMask(!1,!1,!1,!1);const i={drawMode:g.DrawModes.SILHOUETTE,renderSpeechBubbles:!1,effectMask:~d.ghost};e&&(i.colorMask=e.toRGBANormalized(),i.drawMode=g.DrawModes.COLOR_MASK),this._renderLayers(new Set([t]),i),s.stencilFunc(s.EQUAL,1,1),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.colorMask(!0,!0,!0,!0)}checkSpriteCollision(t,e,s,i){if(!t.visible)return!1;e instanceof Set||(e=e instanceof Array?new Set(e):new Set([e]));const r=this.getBoundingBox(t).snapToInt(),n=m.fromBounds(1/0,-1/0,1/0,-1/0);for(const t of e)m.union(n,this.getBoundingBox(t).snapToInt(),n);if(!r.intersects(n))return!1;if(s)return!0;const o=this._collisionBuffer.width/2,a=this._collisionBuffer.height/2,h=m.intersection(r,n).clamp(-o,o,-a,a);if(0===h.width||0===h.height)return;this._setFramebuffer(this._collisionBuffer),this._stencilSprite(t,i),this._renderLayers(e,{drawMode:g.DrawModes.SILHOUETTE,effectMask:~d.ghost});const c=this.gl;c.disable(c.STENCIL_TEST);const l=new Uint8Array(h.width*h.height*4);c.readPixels(h.left+o,h.bottom+a,h.width,h.height,c.RGBA,c.UNSIGNED_BYTE,l);for(let t=0;t<l.length;t+=4)if(0!==l[t+3])return!0;return!1}checkColorCollision(t,e,s){const i=this.getBoundingBox(t).snapToInt(),r=this._collisionBuffer.width/2,n=this._collisionBuffer.height/2;if(i.clamp(-r,r,-n,n),0===i.width||0===i.height)return!1;this._setFramebuffer(this._collisionBuffer);const o=this.gl;o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT|o.STENCIL_BUFFER_BIT),this._setFramebuffer(this._collisionBuffer),this._stencilSprite(t,s),this._renderLayers(null,{filter:e=>e!==t}),o.disable(o.STENCIL_TEST);const a=new Uint8Array(i.width*i.height*4);o.readPixels(i.left+r,i.bottom+n,i.width,i.height,o.RGBA,o.UNSIGNED_BYTE,a);const h=e.toRGBA();for(let t=0;t<a.length;t+=4)if(0!==a[t+3]&&0==(248&(a[t]^h[0]))&&0==(248&(a[t+1]^h[1]))&&0==(240&(a[t+2]^h[2])))return!0;return!1}checkPointCollision(t,e,s){if(!t.visible)return!1;if(!this.getBoundingBox(t).containsPoint(e.x,e.y))return!1;if(s)return!0;this._setFramebuffer(this._collisionBuffer);const i=this.gl;i.clearColor(0,0,0,0),i.clear(i.COLOR_BUFFER_BIT),this._renderLayers(new Set([t]),{effectMask:~d.ghost});const r=new Uint8Array(4),n=this._collisionBuffer.width/2,o=this._collisionBuffer.height/2;return i.readPixels(e.x+n,e.y+o,1,1,i.RGBA,i.UNSIGNED_BYTE,r),0!==r[3]}penLine(t,e,s,i){this._penSkin.penLine(t,e,s,i)}clearPen(){this._penSkin.clear()}stamp(t){this._setFramebuffer(this._penSkin._framebufferInfo),this._renderLayers(new Set([t]),{renderSpeechBubbles:!1})}displayAskBox(t){const e=document.createElement("form");e.classList.add("leopard__askBox");const s=document.createElement("span");s.classList.add("leopard__askText"),s.innerText=t,e.append(s);const i=document.createElement("input");i.type="text",i.classList.add("leopard__askInput"),e.append(i);const r=document.createElement("button");return r.classList.add("leopard__askButton"),r.innerText="Answer",e.append(r),this.renderTarget.append(e),i.focus(),new Promise(t=>{e.addEventListener("submit",s=>{s.preventDefault(),e.remove(),t(i.value)})})}}class G{constructor(t,e,s){this._stage=t,this._canvas=e,this._canvas.tabIndex<0&&(this._canvas.tabIndex=0),this.mouse={x:0,y:0,down:!1},this._canvas.addEventListener("mousemove",this._mouseMove.bind(this)),this._canvas.addEventListener("mousedown",this._mouseDown.bind(this)),this._canvas.addEventListener("mouseup",this._mouseUp.bind(this)),this._canvas.addEventListener("keyup",this._keyup.bind(this)),this._canvas.addEventListener("keydown",this._keydown.bind(this)),this.keys=[],this._onKeyDown=s}_mouseMove(t){const e=this._canvas.getBoundingClientRect(),s=this._stage.width/e.width,i=this._stage.height/e.height,r=(t.clientX-e.left)*s,n=(t.clientY-e.top)*i;this.mouse={...this.mouse,x:r-this._stage.width/2,y:-n+this._stage.height/2}}_mouseDown(){this.mouse={...this.mouse,down:!0}}_mouseUp(){this.mouse={...this.mouse,down:!1}}_keyup(t){const e=this._getKeyName(t);this.keys=this.keys.filter(t=>t!==e)}_keydown(t){t.preventDefault();const e=this._getKeyName(t);-1===this.keys.indexOf(e)&&this.keys.push(e),this._onKeyDown(e)}_getKeyName(t){return"ArrowUp"===t.key?"up arrow":"ArrowDown"===t.key?"down arrow":"ArrowLeft"===t.key?"left arrow":"ArrowRight"===t.key?"right arrow":" "===t.key?"space":"Digit"===t.code.substring(0,5)?t.code[5]:t.key.toLowerCase()}keyPressed(t){return"any"===t?this.keys.length>0:this.keys.indexOf(t)>-1}focus(){this._canvas.focus()}}t.Color=M,t.Costume=w,t.Project=class{constructor(t,e={},{frameRate:s=30}={}){this.stage=t,this.sprites=e,Object.freeze(e);for(const t of this.spritesAndClones)t._project=this;this.stage._project=this,this.renderer=new z(this),this.input=new G(this.stage,this.renderer.stage,t=>{this.fireTrigger(o.KEY_PRESSED,{key:t})}),this.runningTriggers=[],this.restartTimer(),this.answer=null,setInterval(()=>{this.step()},1e3/s),this._renderLoop()}attach(t){this.renderer.setRenderTarget(t),this.renderer.stage.addEventListener("click",()=>{const t=t=>t instanceof j||this.renderer.checkPointCollision(t,{x:this.input.mouse.x,y:this.input.mouse.y},!1);let e=[];for(let s=0;s<this.spritesAndStage.length;s++){const i=this.spritesAndStage[s],r=i.triggers.filter(t=>t.matches(o.CLICKED,{}));r.length>0&&t(i)&&(e=[...e,...r.map(t=>({trigger:t,target:i}))])}this._startTriggers(e)})}greenFlag(){this.fireTrigger(o.GREEN_FLAG),this.input.focus()}step(){const t=this.runningTriggers;for(let e=0;e<t.length;e++)t[e].trigger.step();this.runningTriggers=this.runningTriggers.filter(({trigger:t})=>!t.done)}render(){this.renderer.update(this.stage,this.spritesAndClones);for(const t of[...Object.values(this.sprites),this.stage])for(const e of Object.values(t.watchers))e.updateDOM(this.renderer.renderTarget)}_renderLoop(){requestAnimationFrame(this._renderLoop.bind(this)),this.render()}fireTrigger(t,e){if(t===o.GREEN_FLAG){this.restartTimer(),this.stopAllSounds(),this.runningTriggers=[];for(const t in this.sprites){this.sprites[t].clones=[]}for(const t of this.spritesAndStage)t.effects.clear(),t.audioEffects.clear()}let s=[];for(let i=0;i<this.spritesAndStage.length;i++){const r=this.spritesAndStage[i],n=r.triggers.filter(s=>s.matches(t,e));s=[...s,...n.map(t=>({trigger:t,target:r}))]}return this._startTriggers(s)}_startTriggers(t){for(const e of t)this.runningTriggers.find(t=>e.trigger===t.trigger&&e.target===t.target)||this.runningTriggers.push(e);return Promise.all(t.map(({trigger:t,target:e})=>t.start(e)))}get spritesAndClones(){return Object.values(this.sprites).flatMap(t=>t.andClones()).sort((t,e)=>t._layerOrder-e._layerOrder)}get spritesAndStage(){return[...this.spritesAndClones,this.stage]}changeSpriteLayer(t,e,s=t){let i=this.spritesAndClones;const r=i.indexOf(t);let n=i.indexOf(s)+e;n<0&&(n=0),n>i.length-1&&(n=i.length-1),i.splice(r,1),i.splice(n,0,t),i.forEach((t,e)=>{t._layerOrder=e+1})}stopAllSounds(){for(const t of this.spritesAndStage)t.stopAllOfMySounds()}restartTimer(){this.timerStart=new Date}async askAndWait(t){this.answer=await this.renderer.displayAskBox(t)}},t.Sound=F,t.Sprite=U,t.Stage=j,t.Trigger=o,t.Watcher=class{constructor({value:t=(()=>""),setValue:e=(()=>{}),label:s,style:i="normal",visible:r=!0,color:n=M.rgb(255,140,26),step:o=1,x:a=-240,y:h=180,width:c,height:l}){this.initializeDOM(),this.value=t,this.setValue=e,this._previousValue=Symbol("NO_PREVIOUS_VALUE"),this.label=s,this.style=i,this.visible=r,this.color=n,this.step=o,this.x=a,this.y=h,this.width=c,this.height=l}initializeDOM(){const t=document.createElement("div");t.classList.add("leopard__watcher");const e=document.createElement("div");e.classList.add("leopard__watcherLabel"),t.append(e);const s=document.createElement("div");s.classList.add("leopard__watcherValue"),t.append(s);const i=document.createElement("input");i.type="range",i.classList.add("leopard__watcherSlider"),i.addEventListener("input",t=>{this.setValue(Number(t.target.value))}),t.append(i),this._dom={node:t,label:e,value:s,slider:i}}updateDOM(t){if(t&&!t.contains(this._dom.node)&&t.append(this._dom.node),!this.visible)return;const e=this.value(),s=Array.isArray(e);if(this._dom.node.classList.toggle("leopard__watcher--list",s),s){if(!Array.isArray(this._previousValue)||JSON.stringify(e.map(String))!==JSON.stringify(this._previousValue.map(String))){this._dom.value.innerHTML="";for(const[t,s]of e.entries()){const e=document.createElement("div");e.classList.add("leopard__watcherListItem");const i=document.createElement("div");i.classList.add("leopard__watcherListItemIndex"),i.innerText=t;const r=document.createElement("div");r.classList.add("leopard__watcherListItemContent"),r.innerText=s.toString(),e.append(i),e.append(r),this._dom.value.append(e)}}}else e!==this._previousValue&&(this._dom.value.innerText=e.toString());this._previousValue=s?[...e]:e,"slider"===this._style&&(this._dom.slider.value=e);const i=.299*this.color.r+.587*this.color.g+.114*this.color.b>162?"#000":"#fff";this._dom.value.style.setProperty("--watcher-color",this.color.toString()),this._dom.value.style.setProperty("--watcher-text-color",i)}get visible(){return this._visible}set visible(t){this._visible=t,this._dom.node.style.visibility=t?"visible":"hidden"}get x(){return this._x}set x(t){this._x=t,this._dom.node.style.left=t-240+"px"}get y(){return this._y}set y(t){this._y=t,this._dom.node.style.top=180-t+"px"}get width(){return this._width}set width(t){this._width=t,this._dom.node.style.width=t?t+"px":void 0}get height(){return this._height}set height(t){this._height=t,this._dom.node.style.height=t?t+"px":void 0}get style(){return this._style}set style(t){this._style=t,this._dom.node.classList.toggle("leopard__watcher--normal","normal"===t),this._dom.node.classList.toggle("leopard__watcher--large","large"===t),this._dom.node.classList.toggle("leopard__watcher--slider","slider"===t)}get min(){return this._min}set min(t){this._min=t,this._dom.slider.min=t}get max(){return this._max}set max(t){this._max=t,this._dom.slider.max=t}get step(){return this._step}set step(t){this._step=t,this._dom.slider.step=t}get label(){return this._label}set label(t){this._label=t,this._dom.label.innerText=t}},Object.defineProperty(t,"__esModule",{value:!0})}));
