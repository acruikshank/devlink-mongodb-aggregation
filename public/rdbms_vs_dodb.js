(preso = window.preso || {}).rdbms_vs_dodb = (function() {
  var el;

  function gen(type,attributes) {
    var el = document.createElementNS("http://www.w3.org/2000/svg",type);
    if (attributes) for (var key in attributes) el.setAttribute(key,attributes[key]);
    return el;
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

  function splinef( x1, y1, x2, y2 ) {
    var ax=3*x1-3*x2+1, bx=-6*x1+3*x2, cx=3*x1, a=3*y1-3*y2+1, b=-6*y1+3*y2, c=3*y1;
    return function(x) {
      var t=0,t2=0,dt=-x;
      while (Math.abs(dt) > .0001) { t-=dt;t2=t*t;dt=(x-t*cx-t2*bx-t2*t*ax) / (-3*t2*ax-2*t*bx-cx); }
      return a*t2*t + b*t2 + c*t; 
    };
  }

  var xEasing = yEasing = splinef(.2,.2,.8,.8);
  var scrolling, animationKey;
  var requestAnimationFrame = window.requestAnimationFrame 
    || window.webkitRequestAnimationFrame || mozRequestAnimationFrame || msRequestAnimationFrame;


  function diagonal(p1,p2) {
    if ( p2.x <= p1.x ) return "M0,0Z";
    var m1 = p1.x+.25*(p2.x - p1.x), m2 = p1.x+.75*(p2.x - p1.x);
    return 'M'+p1.x+' '+p1.y+'C'+[m2,p1.y,m1,p2.y,p2.x,p2.y].join(' ')
  }

  function startScrolling() {
    var length = target.length;
    yEasing = splinef(.2,.2,.8,.8);
    scrolling = true;
    (function scroll() {
      if (( ! scrolling ) || ( bestChild[1] >= length ))
        return step(function() { scrolling = false });
      step(scroll);
    })()      
  }

  function step(done) {
    var length = target.length;
    if ( bestChild[1] >= length ) {
      removeClass( el('starter'),'ready')
      return;
    }
    generation = nextGeneration( generation[bestChild[0]] );
    generationIndex++;

    var group = renderGeneration(generation, target, bestChild[0], generationIndex);
    if (document.getElementById('search-choices'))
      document.getElementById('search-choices').innerHTML = commaFormat(generationIndex*GEN_SIZE);

    animateGeneration(group, generation, bestChild[0], generationIndex, function() {
      if ( generationIndex >= 5 ) {
        var groups = el('solutions').getElementsByTagName('g');
        var group = groups[generationIndex-5];
        while (group.childNodes[0]) group.removeChild(group.childNodes[0]);
      }
      if (done) done();
    })
    bestChild = best(generation, target);      
  }

  function animateGeneration(group, generation, bestChildIndex, generationIndex, done) {
    var start = new Date().getTime();
    animationKey = new Object();
    var localKey = animationKey;
    requestAnimationFrame(function animate() { 
      var time = new Date().getTime();
      var fraction = (time-start) / STEP_MS;
      if ((localKey !== animationKey) || (fraction >= 1)) {
        moveGeneration(group, generation, bestChildIndex, 1, generationIndex)
        animationKey = null;
        if ( done ) done();
        return;
      }
      moveGeneration(group, generation, bestChildIndex, fraction, generationIndex)
      requestAnimationFrame(animate);
    });
  }

  function positionX(index) { return 80 + index*110; };

  function moveGeneration(group, generation, bestChildIndex, fraction, generationIndex) {
    var bestChildX = positionX( bestChildIndex )
    var bestChildY = 15 + 2*Y_DISPLACEMENT;
    var y = Y_DISPLACEMENT * yEasing(fraction)
    var paths = group.getElementsByTagName('path');
    var text = group.getElementsByClassName('solution');

    var label = group.getElementsByClassName('label')[0];
    label.setAttribute('opacity',fraction)
    label.setAttribute('y',bestChildY + y)

    for ( var i=0,l=generation.length; i < l; i++ ) {
      var x = positionX(bestChildIndex + 1 * (i-bestChildIndex));
      paths[i].setAttribute('d',diagonal(bestChildX,bestChildY+3, x, bestChildY + y-15))
      text[i].setAttribute('x', x);
      text[i].setAttribute('y', bestChildY + y);
      text[i].setAttribute('fill-opacity',fraction)
    }
    var groups = el('solutions').getElementsByTagName('g');
    for (var i=0; g = groups[i]; i++)
      g.setAttribute('transform','translate(0,'+((i+2-generationIndex)*Y_DISPLACEMENT - y)+')')
  }

  function renderGeneration(generation, target, bestChildIndex, generationIndex) {
    var y = 15 + 3 * Y_DISPLACEMENT;
    var container = gen('g',{x:0,y:0})
    for (var i=0,solution; solution = generation[i]; i++) {
      if ( bestChildIndex >= 0 ) {
        var path = gen('path',{})
        container.appendChild(path);
      }
      var genLabel = gen('text',{class:'label', x: 5, y:y, opacity:~bestChildIndex?0:1});
      genLabel.appendChild( document.createTextNode(String(generationIndex)) );
      container.appendChild(genLabel); 

      var position = bestChildIndex < 0 ? i : bestChildIndex;
      var text = gen('text',{class:'solution', x: positionX( position ), y:y});
      for (var j=0, grouping=groupLetters(solution,target), correct=false; group=grouping[j]; j++, correct=!correct) {
        var tspan = gen('tspan',{class:correct?'correct':'incorrect'});
        tspan.appendChild( document.createTextNode(group.join('')) )
        text.appendChild(tspan);
      }
      container.appendChild(text);
    }
    el('solutions').insertBefore(container, el('solutions-top'));
    return container;
  }

  function commaFormat(n) {
    var formated = '';
    while (n >= 1000) {
      formated = ',' + String(1000+n%1000).substring(1) + formated;
      n = Math.floor(n/1000);
    }
    return n + formated;
  }

  function leftMiddle(el) { return { x:el.offsetLeft + el.offsetWidth, y:el.offsetTop + el.offsetHeight/2 } }
  function rightMiddle(el) { return { x:el.offsetLeft, y:el.offsetTop + el.offsetHeight/2 } }

  function path(svg,cls,from,to) {
    svg.appendChild(
      gen('path', {class:cls, d:diagonal(leftMiddle(el(from)), rightMiddle(el(to))) }) );    
  }

  function init() {
    var vis = document.getElementById('rdbms_vs_dodb');
    el = function el(clss) { return vis.getElementsByClassName(clss)[0]; }
    var svg = vis.getElementsByTagName('svg')[0];

    path(svg, 'cy-to-cc', 'company', 'comp_cust' );
    path(svg, 'cc-to-ct', 'comp_cust', 'customer' );
    path(svg, 'cy-to-cp', 'company', 'comp_prod' );
    path(svg, 'cp-to-p', 'comp_prod', 'product' );
    path(svg, 'p-to-pc', 'product', 'prod_cust' );
    path(svg, 'pc-to-ct', 'prod_cust', 'customer' );
  }

  function hide() {
  }

  function show() {
  }

  return {init:init, show:show, hide:hide};
})();
