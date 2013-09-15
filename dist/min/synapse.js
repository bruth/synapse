(function(a,b){return typeof exports!="undefined"?b(a,exports):typeof define=="function"&&define.amd?define("synapse/core",["exports"],function(c){return b(a,c)}):a.SynapseCore=b(a,{})})(this,function(a,b){var c;return c={},{toString:Object.prototype.toString,getType:function(a){return this.toString.call(a).match(/^\[object\s(.*)\]$/)[1]},isObject:function(a){return this.getType(a)==="Object"},isArray:function(a){return this.getType(a)==="Array"},isFunction:function(a){return this.getType(a)==="Function"},isString:function(a){return this.getType(a)==="String"},isBoolean:function(a){return this.getType(a)==="Boolean"}}});var __slice=[].slice;(function(a,b){return typeof exports!="undefined"?b(a,exports,require("synapse/core")):typeof define=="function"&&define.amd?define("synapse",["synapse/core","exports"],function(c,d){return b(a,d,c)}):a.Synapse=b(a,{},a.SynapseCore)})(this,function(a,b,c){var d,e,f,g,h,i,j,k,l,m,n,o;return k=1,d={},l="observe notify syncWith stopObserving pauseObserving resumeObserving stopNotifying pauseNotifying resumeNotifying".split(" "),b=function(){function a(b){var e,f,g,h,i,j,m,n,o,p,q;if(b instanceof a)return b;if(e=d[b[a.expando]])return e;if(this.constructor!==a){i=new a(b),h=i.raw,j=function(a){return h[a]=function(){return i[a].apply(i,arguments),h}};for(m=0,o=l.length;m<o;m++)g=l[m],j(g);return h}q=a.hooks;for(n=0,p=q.length;n<p;n++){f=q[n];if(f.checkObjectType(b))break;f=null}if(!f)throw new Error("An appropriate hook was not determined for                    "+c.getType(b)+" types");this.raw=(typeof f.coerceObject=="function"?f.coerceObject(b):void 0)||b,this.hook=f,d[this.guid=b[a.expando]=k++]=this,this._observing={},this._notifying={}}return a.prototype.version="0.5.1",a.prototype.get=function(){var a;return(a=this.hook).getHandler.apply(a,[this.raw].concat(__slice.call(arguments)))},a.prototype.set=function(){var a;return(a=this.hook).setHandler.apply(a,[this.raw].concat(__slice.call(arguments))),this},a.prototype.observe=function(){var b,c;return c=arguments[0],b=2>arguments.length?[]:__slice.call(arguments,1),c=new a(c),e.apply(null,[c,this].concat(__slice.call(b))),this},a.prototype.notify=function(){var b,c;return c=arguments[0],b=2>arguments.length?[]:__slice.call(arguments,1),c=new a(c),e.apply(null,[this,c].concat(__slice.call(b))),this},a.prototype.syncWith=function(b){return b=new a(b),this.observe(b).notify(b),this},a.prototype.stopObserving=function(a){var b,c,e,f,g,h,i,j,l,n,o,p,q,r,s;if(a){if(e=this._observing[a.guid]){p=e.channels;for(f=0,j=p.length;f<j;f++){b=p[f],q=b.events;for(g=0,l=q.length;g<l;g++)c=q[g],m(a,c,b.handler)}delete this._observing[a.guid],delete a._notifying[this.guid]}}else{for(k in this._observing){e=this._observing[k],a=d[k],r=e.channels;for(h=0,n=r.length;h<n;h++){b=r[h],s=b.events;for(i=0,o=s.length;i<o;i++)c=s[i],m(a,c,b.handler)}delete a._notifying[this.guid]}this._observing={}}return this},a.prototype.pauseObserving=function(a){var b;if(a){if(b=this._observing[a.guid])b.open=!1}else for(k in this._observing)this._observing[k].open=!1;return this},a.prototype.resumeObserving=function(a){var b;if(a){if(b=this._observing[a.guid])b.open=!0}else for(k in this._observing)this._observing[k].open=!0;return this},a.prototype.stopNotifying=function(a){var b,c,e,f,g,h,i,j,l,n,o,p,q,r,s;if(a){if(e=this._notifying[a.guid]){p=e.channels;for(f=0,j=p.length;f<j;f++){b=p[f],q=b.events;for(g=0,l=q.length;g<l;g++)c=q[g],m(this,c,b.handler)}delete this._notifying[a.guid],delete a._observing[this.guid]}}else{for(k in this._notifying){e=this._notifying[k],a=d[k],r=e.channels;for(h=0,n=r.length;h<n;h++){b=r[h],s=b.events;for(i=0,o=s.length;i<o;i++)c=s[i],m(this,c,b.handler)}delete a._observing[this.guid]}this._notifying={}}return this},a.prototype.pauseNotifying=function(a){var b;if(a){if(b=this._notifying[a.guid])b.open=!1}else for(k in this._notifying)this._notifying[k].open=!1;return this},a.prototype.resumeNotifying=function(a){var b;if(a){if(b=this._notifying[a.guid])b.open=!0}else for(k in this._notifying)this._notifying[k].open=!0;return this},a}(),b.expando="Synapse"+(b.prototype.version+Math.random()).replace(/\D/g,""),b.hooks=[],h=function(){var a,b,c,d;b=arguments[0],a=2>arguments.length?[]:__slice.call(arguments,1);if(c=(d=b.hook).detectEvent.apply(d,[b.raw].concat(__slice.call(a))))return c;throw new Error(""+b.hook.typeName+" types do not support events")},n=function(){var a,b,c,d;b=arguments[0],a=2>arguments.length?[]:__slice.call(arguments,1);if(c=typeof (d=b.hook).onEventHandler=="function"?d.onEventHandler.apply(d,[b.raw].concat(__slice.call(a))):void 0)return b;throw new Error(""+b.hook.typeName+" types do not support events")},m=function(){var a,b,c,d;b=arguments[0],a=2>arguments.length?[]:__slice.call(arguments,1);if(c=typeof (d=b.hook).offEventHandler=="function"?d.offEventHandler.apply(d,[b.raw].concat(__slice.call(a))):void 0)return b;throw new Error(""+b.hook.typeName+" types do not support events")},o=function(){var a,b,c,d;b=arguments[0],a=2>arguments.length?[]:__slice.call(arguments,1);if(c=typeof (d=b.hook).triggerEventHandler=="function"?d.triggerEventHandler.apply(d,[b.raw].concat(__slice.call(a))):void 0)return b;throw new Error(""+b.hook.typeName+" types do not support events")},i=function(a){var b;return typeof (b=a.hook).detectInterface=="function"?b.detectInterface(a.raw):void 0},j=function(a){var b;return typeof (b=a.hook).detectOtherInterface=="function"?b.detectOtherInterface(a.raw):void 0},g={event:null,subjectInterface:null,observerInterface:null,converter:null,triggerOnBind:!0},f=function(a,b,d){var e,f,k,l,m,p,q,r,s,t,u,v,w,x;for(p in g)v=g[p],d[p]==null&&(d[p]=v);if((f=d.converter)&&!c.isFunction(f)&&!(f=b.raw[f]))throw Error("Property "+d.coverter+" is undefined on "+b.raw);if(!(s=d.subjectInterface)&&!(s=i(a)||j(b)))throw new Error("An interface for "+a.hook.typeName+" objects could not be detected");if(!(q=d.observerInterface)&&!(q=i(b)||j(a)))throw new Error("An interface for "+b.hook.typeName+" objects could not be detected");(l=d.event)||(l=h(a,s)),c.isArray(l)||(l=[l]),u=d.triggerOnBind,(r=b._observing[a.guid])||(r=b._observing[a.guid]={open:!0,channels:[]}),(t=a._notifying[b.guid])||(t=a._notifying[b.guid]={open:!0,channels:[]}),m=function(){var d,e;if(((d=b._observing[a.guid])!=null?d.open:void 0)===!0&&((e=a._notifying[b.guid])!=null?e.open:void 0)===!0)return c.isFunction(s)?v=s(a):v=a.get(s),f&&(v=f(v,b,q)),c.isFunction(q)?q(b,v):b.set(q,v)},e={subjectInterface:s,observerInterface:q,events:l,handler:m},r.channels.push(e),t.channels.push(e);for(w=0,x=l.length;w<x;w++)k=l[w],n(a,k,m),u&&o(a,k)},e=function(){var a,b,d,e,g,h,i,j,k;i=arguments[0],e=arguments[1],d=3>arguments.length?[]:__slice.call(arguments,2),h=d,a=d[0],b=d[1];if(c.isFunction(a))h={converter:a};else if(c.isArray(a)||!c.isObject(a))h={subjectInterface:a,observerInterface:b};c.isArray(h)||(h=[h]);for(j=0,k=h.length;j<k;j++)g=h[j],f(i,e,g)},b})