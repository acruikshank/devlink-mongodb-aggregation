dma_talk = window.dma_talk || {};

dma_talk.aggregationDemonstration = function(slide) {
  var editor, stepByStep, stats, stages;

  var dateMatch = /(\d+)-(\d+)-(\d+)T\d+:\d+:\d+\.\d+Z/;

  function gen(type, cls) {var e=document.createElement(type); e.setAttribute('class',cls); return e; }
  function text(txt) { return document.createTextNode(txt); }
  function label(txt) {var l=gen('label','type'); l.appendChild(text(txt)); return l; } 
  function value(txt) {var s=gen('span','value'); s.appendChild(text(txt)); return s; }
  function disclosure() { var s=gen('span','disclosure'); s.innerHTML='&#x25B2;'; return s;}
  function fieldRenderer(name,val) {
    var f = gen('div','field'), m;
    f.appendChild(label(name+':'));
    if (val == null) f.appendChild(value(''))
    else if (typeof(val) == 'string' && (m=val.match(dateMatch))) f.appendChild(value([m[2],m[3],m[1]].join('/')))
    else if (typeof(val) == 'string') f.appendChild(value(val))
    else if (typeof(val) == 'number') f.appendChild(value(val.toFixed(2)))    
    else if (typeof(val) == 'object' && val.length !== undefined) {
      f.appendChild(disclosure());
      f.appendChild(arrayRenderer(val,'toggle '+name))
    } else if (typeof(val) == 'object') {
      f.appendChild(disclosure());
      f.appendChild(objectRenderer(val,'toggle '+name))
    } else f.appendChild(value(val.toString()))
    return f;
  }
  function objectRenderer(obj,cls) {
    var o = gen('div','object '+cls);
    for (var k in obj) if (obj.hasOwnProperty(k)) o.appendChild(fieldRenderer(k,obj[k]));
    return o;
  }
  function arrayRenderer(ar,cls) {
    var a = gen('div','array '+cls);
    for (var i=0,l=ar.length; i<l; i++) a.appendChild(objectRenderer(ar[i],'item-i'));
    return a;
  }
  function removeClass(el, clss) {
    var re = new RegExp("^"+clss+"$|^"+clss+"\\s+|\\s+"+clss+"$|\\s+"+clss+"(\\s+)");
    el.setAttribute( "class", (el.getAttribute('class')||'').replace(re,"$1") )
  }
  function addClass(el, clss) {
    removeClass(el,clss)
    el.setAttribute( 'class', (el.getAttribute('class') || '') + ' ' + clss )
  }
  function hasClass(el, clss) {
    return !!(el.getAttribute('class')||'').match(new RegExp("(\\s+|^)"+clss+"(\\s+|$)"));
  }
  function ancestorWithClass(el, clss) {
    if (el.nodeName == 'BODY') return;
    return hasClass(el,clss) ? el : ancestorWithClass(el.parentNode, clss); 
  }

  function request( options ) {
    var xhr =  window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if ( xhr.readyState < 4 ) return;
      if ((!xhr.status && (location.protocol == "file:")) || (xhr.status >= 200 && xhr.status < 300) 
          || xhr.status == 304 || xhr.status == 1223) {
        if (options.handler) options.handler(xhr.responseText, xhr);
      } else if (options.errorHandler) options.errorHandler(xhr.status)
    };
    xhr.open(options.method || 'GET', options.url, true );
    if (options.headers) for (var k in options.headers) xhr.setRequestHeader(k, options.headers[k]);
    if (("POST" === options.method) && (( ! options.headers ) || ( ! options.headers['Content-type'] )))
      xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    xhr.send( options.body || null );
  }

  function fixDates(obj) {
    if (obj.toISOString) return obj.toISOString();
    if (typeof(obj) == 'object') {
      if (Array.isArray(obj)) return obj.map(fixDates);
      var o = {};
      for (var k in obj) if (obj.hasOwnProperty(k)) o[k] = fixDates(obj[k]);
      return o;
    }
    return obj;
  }

  function executeQuery(js) {
    var db = { customers: {aggregate:function(s) {stages = s}} };
    (new Function('db',js))(db);
    requestResults(stages);
    renderStepByStep(stages)
  }

  function requestResults(stages) {
    request({
      method:       'POST', 
      url:          '/aggregate', 
      body:         JSON.stringify(fixDates(stages)),
      handler:      onResults, 
      errorHandler: onError,
      headers:      {'Content-type':'application/json'} })    
  }

  function onError() { console.log("ERROR") }

  function onResults(rStr) { 
    var results = slide.getElementsByClassName('results')[0];
    var objects = JSON.parse(rStr);

    if ( stats ) {
      stats.getElementsByTagName('span')[0].innerHTML = objects.length;
    } else {
      stats = gen('div','stats');
      stats.innerHTML = '<label>count:</label><span>' + objects.length + '</span>';
      slide.appendChild(stats);
    }

    results.innerHTML = '';
    objects.forEach(function(r) {results.appendChild(objectRenderer(r,'result'))});
  }

  function alterStages(e) {
    var stage = ancestorWithClass(e.target,'step');
    var index = (stage.getAttribute('data-index')|0);
    requestResults(stages.slice(0, index + 1));
    var steps = stepByStep.getElementsByClassName('step');
    for (var i=0; i<steps.length; i++) (i<=index ? addClass : removeClass)(steps[i],'active');
  }

  function renderStepByStep(stages) {
    if ( ! stepByStep ) {
      stepByStep = gen('div', 'stages')
      slide.appendChild(stepByStep);
      stepByStep.addEventListener('click', alterStages)
      var editorToggle = gen('div', 'editor-toggle');
      var editorToggleThumb = gen('div', 'editor-toggle-thumb');
      editorToggle.appendChild(editorToggleThumb);
      slide.appendChild(editorToggle);      
      editorToggle.addEventListener('click',toggleEditor);
    }

    stepByStep.innerHTML = '';
    for (var i=0,stage; stage = stages[i]; i++) {
      var step = gen('div','step active');
      step.setAttribute('data-index',String(i));
      var active = gen('span','step-active');
      step.appendChild(active);
      var spec = gen('span','step-spec');
      spec.appendChild(text(JSON.stringify(stage)));
      step.appendChild(spec);
      stepByStep.appendChild(step);
    }
  }

  function toggleEditor() {
    if (!stepByStep) return;
    (hasClass(slide,'step-by-step') ? removeClass : addClass)(slide,'step-by-step');
  }

  function toggleDisclosure(e) {
    if (e.target.getAttribute('class') != 'disclosure') return;
    var field = e.target.offsetParent;
    var toggle = field.getElementsByClassName('toggle')[0];
    if ( hasClass( field, 'opened' ) ) {
      removeClass(field,'opened');
      toggle.style.width = '0px';
      toggle.style.height = '0px';
    } else {
      addClass(field,'opened');
      toggle.style.width = toggle.scrollWidth + 'px';
      toggle.style.height = toggle.scrollHeight + 'px';
    }
  }

  function handleKeyUp(e) {
    if ( e.ctrlKey && e.altKey && e.keyCode == 13 )
      executeQuery( editor.getValue() );
    if ( e.ctrlKey && e.altKey && e.keyCode == 32 )
      toggleEditor();
  }

  function init( forward, back ) {
    var editorElement = slide.getElementsByClassName('editor')[0];
    var editorId = editorElement.id;
    editor = ace.edit(editorId);
    editor.setTheme("ace/theme/merbivore_soft");
    editor.getSession().setMode("ace/mode/javascript");
    editor.getSession().setTabSize(2);
    editor.getSession().setUseSoftTabs(true);
    editor.setShowPrintMargin(false)
    editor.commands.addCommand({
        name: 'toggleEditor',
        bindKey: {win: 'Ctrl-Alt-Space',  mac: 'Ctrl-Alt-Space'},
        exec: toggleEditor
    });
    editor.commands.addCommand({
        name: 'next',
        bindKey: {win: 'Ctrl-Right',  mac: 'Ctrl-Right'},
        exec: function() {console.log('next?',listeners);trigger('next')}
    });
    editor.commands.addCommand({
        name: 'prev',
        bindKey: {win: 'Ctrl-Left',  mac: 'Ctrl-Left'},
        exec: function() {console.log('prev?',listeners);trigger('prev')}
    });

    editorElement.onkeyup = function(e) { e.stopPropagation(); return false; }

    slide.addEventListener('keypress', handleKeyUp)

    var results = slide.getElementsByClassName('results')[0];
    results.addEventListener('click', toggleDisclosure);
  }

  function show() { editor.focus() }
  function hide() { 
    if (editor) editor.blur()
    var results = slide.getElementsByClassName('results')[0]; if (results) results.innerHTML=''; 
  }
  var listeners = {};
  function addEventListener(type, f) { if (f) (listeners[type]=listeners[type]||[]).push(f); }
  function trigger(type) { for (var i=0,f; f=(listeners[type]||[])[i];i++) f() }

  return { init: init, show: show, hide: hide, addEventListener:addEventListener   }
}