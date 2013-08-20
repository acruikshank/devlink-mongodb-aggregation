dma_talk = window.dma_talk || {};

dma_talk.aggregationDemonstration = function(slide) {
  var editor;

  function gen(type, cls) {var e=document.createElement(type); e.setAttribute('class',cls); return e; }
  function text(txt) { return document.createTextNode(txt); }
  function label(txt) {var l=gen('label','type'); l.appendChild(text(txt)); return l; } 
  function value(txt) {var s=gen('span','value'); s.appendChild(text(txt)); return s; }
  function fieldRenderer(name,val) {
    var f = gen('div','field');
    f.appendChild(label(name+':'));
    if (val == null) f.appendChild(value(''))
    else if (typeof(val) == 'string') f.appendChild(value(val))
    else if (typeof(val) == 'number') f.appendChild(value(val.toFixed(2))) 
    else if (typeof(val) == 'object' && val.length !== undefined) f.appendChild(arrayRenderer(val,name))
    else if (typeof(val) == 'object') f.appendChild(objectRenderer(val,name))
    else f.appendChild(value(val.toString()))
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

  function executeQuery(js) {
    console.log("EXECUTE QUERY", js)
    var stages, db = { customers: {aggregate:function(s) {stages = s}} };
    (new Function('db',js))(db);
    request({
      method:       'POST', 
      url:          '/aggregate', 
      body:         JSON.stringify(stages), 
      handler:      onResults, 
      errorHandler: onError,
      headers:      {'Content-type':'application/json'} })
  }

  function onError() { console.log("ERROR") }

  function onResults(rStr) { 
    var results = slide.getElementsByClassName('results')[0];
    results.innerHTML = '';
    JSON.parse(rStr).forEach(function(r) {results.appendChild(objectRenderer(r,'result'))});
  }

  function handleKeyUp(e) {
    if ( e.ctrlKey && e.altKey && e.keyCode == 13 )
      executeQuery( editor.getValue() );
  }

  function init() {
    var editorId = slide.getElementsByClassName('editor')[0].id;
    editor = ace.edit(editorId);
//    editor.setTheme("ace/theme/idle_fingers");
//    editor.setTheme("ace/theme/merbivore_soft");
    editor.setTheme("ace/theme/tomorrow_night");
    editor.getSession().setMode("ace/mode/javascript");
    editor.setShowPrintMargin(false)

    slide.addEventListener('keypress', handleKeyUp);
  }

  function show() {

  }

  function hide() {

  }

  return { init: init, show: show, hide: hide }
}