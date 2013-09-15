var __slice=[].slice;(function(a,b){if(typeof define=="function"&&define.amd)return define("synapse/jquery",["synapse/core","jquery","exports"],function(c,d,e){return b(a,e,c,d)});if(typeof exports=="undefined")return a.jQueryHook=b(a,{},a.SynapseCore,a.jQuery)})(this,function(a,b,c,d){var e,f,g,h;return h=function(){return{registry:{},register:function(a){return this.registry[a.name]=a},unregister:function(a){return delete this.registry[a]},get:function(){var a,b,c,d,e,f;e=arguments[0],d=arguments[1],a=3>arguments.length?[]:__slice.call(arguments,2),f=d.split("."),d=f[0],c=f[1],c!=null&&(a=[c].concat(a));if(b=this.registry[d])return b.get.apply(e,a)},set:function(){var a,b,c,d,e,f;e=arguments[0],d=arguments[1],a=3>arguments.length?[]:__slice.call(arguments,2),f=d.split("."),d=f[0],c=f[1],c!=null&&(a=[c].concat(a));if(b=this.registry[d])return b.set.apply(e,a)}}}(),function(){var a,b,d,e,f,g;return d=function(b){return this.prop!=null?this.prop(b):a.call(this,b)},g=function(a,b){return this.prop!=null?typeof a=="object"?this.prop(a):this.prop(a,b):e.call(this,a,b)},a=function(a){return this.attr(a)},e=function(a,b){return c.isObject(a)?this.attr(a):this.attr(a,b)},b=function(a){return this.css(a)},f=function(a,b){return c.isObject(a)?this.css(a):this.css(a,b)},h.register({name:"text",get:function(){return this.text()},set:function(a){return this.text((a!=null?a:"").toString())}}),h.register({name:"html",get:function(){return this.html()},set:function(a){return this.html((a!=null?a:"").toString())}}),h.register({name:"value",get:function(){return this.val()},set:function(a){return this.val(a!=null?a:"")}}),h.register({name:"enabled",get:function(){return!d.call(this,"disabled")},set:function(a){return c.isArray(a)&&a.length===0&&(a=!1),g.call(this,"disabled",!Boolean(a))}}),h.register({name:"disabled",get:function(){return d.call(this,"disabled")},set:function(a){return c.isArray(a)&&a.length===0&&(a=!1),g.call(this,"disabled",Boolean(a))}}),h.register({name:"checked",get:function(){return d.call(this,"checked")},set:function(a){return c.isArray(a)&&a.length===0&&(a=!1),g.call(this,"checked",Boolean(a))}}),h.register({name:"visible",get:function(){return b.call(this,"display")===!1},set:function(a){return c.isArray(a)&&a.length===0&&(a=!1),Boolean(a)?this.show():this.hide()}}),h.register({name:"hidden",get:function(){return b.call(this,"display")==="none"},set:function(a){return c.isArray(a)&&a.length===0&&(a=!1),Boolean(a)?this.hide():this.show()}}),h.register({name:"prop",get:function(a){return d.call(this,a)},set:function(a,b){return g.call(this,a,b)}}),h.register({name:"attr",get:function(b){return a.call(this,b)},set:function(a,b){return e.call(this,a,b)}}),h.register({name:"css",get:function(a){return b.call(this,a)},set:function(a,b){return f.call(this,a,b)}}),h.register({name:"data",get:function(a){return this.data(a)},set:function(a,b){return this.data(a,b)}}),h.register({name:"class",get:function(a){return this.hasClass(a)},set:function(a,b){return this.toggleClass(a,Boolean(b))}})}(),e=[["a,button,[type=button],[type=reset]","click"],["select,[type=checkbox],[type=radio],textarea","change"],["[type=submit]","submit"],["input","keyup"]],g=[["[type=checkbox],[type=radio]","checked"],["input,textarea,select","value"]],f=["name","role","data-bind"],{typeName:"jQuery",domEvents:e,elementBindAttributes:f,elementInterfaces:g,interfaces:h,checkObjectType:function(a){return a instanceof d||a.nodeType===1||c.isString(a)},coerceObject:function(a){return d(a)},getHandler:function(a,b){var c;return c=h.get(a,b),c&&a.is("[type=number]")?c.indexOf(".")>-1?parseFloat(c):parseInt(c):c},setHandler:function(a,b,c){return h.set(a,b,c)},onEventHandler:function(a,b,c){return a.bind(b,c)},offEventHandler:function(a,b,c){return a.unbind(b,c)},triggerEventHandler:function(a,b){return a.trigger(b)},detectEvent:function(a){var b,c,d,f,g;for(f=0,g=e.length;f<g;f++){c=e[f],d=c[0],b=c[1];if(a.is(d))return b}},detectInterface:function(a){var b,c,d,e,f;for(e=0,f=g.length;e<f;e++){c=g[e],d=c[0],b=c[1];if(a.is(d))return b}return"text"},detectOtherInterface:function(a){var b,c,d,e;for(d=0,e=f.length;d<e;d++){b=f[d];if(c=a.attr(b))return c}}}})