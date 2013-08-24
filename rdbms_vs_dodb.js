 (preso = window.preso || {}).rdbms_vs_dodb = (function rdbms_vs_dodb(diagramSpec) {
  function gen(type,attributes) {
    var el = document.createElementNS("http://www.w3.org/2000/svg",type), chain;
    if (attributes) for (var key in attributes) el.setAttribute(key,attributes[key]);
    return chain = {
      el: function() { return el },
      add: function() { 
        for (var i=0,l=arguments.length; e=arguments[i],i<l; i++) el.appendChild(e.el?e.el():e); 
        return chain;
      },
      addAll: function(a) { return chain.add.apply(chain,a) },
      text: function(t) { el.appendChild(document.createTextNode(t)); return chain; }
    }
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

  function diagonal(p1,p2) {
    if ( p2.x <= p1.x ) return "M0,0Z";
    var m1 = p1.x+.25*(p2.x - p1.x), m2 = p1.x+.75*(p2.x - p1.x);
    return 'M'+p1.x+' '+p1.y+'C'+[m2,p1.y,m1,p2.y,p2.x,p2.y].join(' ')
  }

  function line(cls,from,to) {
    return gen('line', {class:cls, x1:from.x, y1:from.y, x2:to.x, y2:to.y })
  }

  function path(cls,from,to) {
    return gen('path', {class:cls, d:diagonal(from, to) })
  }

  var gridLength = 60;
  var textHeight = 24;
  var margin = 10;
  var boxLength = 2.2*gridLength;
  var stackOffsetY = .2*gridLength;
  var stackOffsetX = .1*gridLength;

  var specs = {
    normalized: {
      tables: [
        {name:'Company', props:['name','established','...'],               x:0, y:0 },
        {name:'Employee', props:['company_id','person_id'],                x:4, y:0 },
        {name:'Person', props:['name','email','...'],                      x:8, y:0},
        {name:'Comp_Prod', props:['company_id','product_id'],              x:4, y:4},
        {name:'Product', props:['name','sku','price','...'],               x:8, y:4},
        {name:'Purchase', props:['product_id','customer_id','seller_id','price','date'], x:12, y:4}
      ],
      paths: [[0,1], [1,2], [0,3], [3,4], [4,5], [2,5,-1], [2,5,1]]
    },

    denormalized: {
      tables: [
        {name:'Company', props:['name','established','...'],              x:0, y:2 },
        {name:'Employee', props:['company_id','name','email','...'],      x:4, y:0 },
        {name:'Purchase', props:['company_id','customer_id', 'emp_name', 'sku', 'price', '...'],              
                                                                          x:8, y:2},
        {name:'Customer', props:['name','email','...'],                   x:12, y:0}
      ],
      paths: [[0,1],[0,2],[2,3]]
    },

    'application': {
      tables: [
        {name:'Company', props:['name','established','...'],              x:0, y:0 },
        {name:'Employee', props:['company_id','name','email','...'],      x:4, y:.1, stack:5 },
        {name:'Customer', props:['name','email','...'],                   x:0, y:5},
        {name:'Purchase', props:['company_id','customer_id', 'emp_name', 'sku', 'price', '...'],
                                                                          x:4, y:5.1, stack:5},
      ],
      paths: [[0,1],[2,3]]      
    },
    'application2': {
      tables: [
        {name:'Company', props:['name','established','...'],              x:0, y:0 },
        {name:'Employee', props:['company_id','name','email','...'],      x:4, y:.1, stack:5 },
        {name:'Customer', props:['name','email','...'],                   x:0, y:5.5},
        {name:'Purchase', props:['company_id','customer_id', 'emp_name', 'sku', 'price', '...'],
                                                                          x:4, y:5.5, stack:5},
      ],
      paths: [[0,1],[2,3]]      
    }    
  }

  function map(a,f) { for(var i=0,x,o=[];x=a[i];i++) o[i]=f(x,i); return o; }

  function tableHeight(spec) { return textHeight*(1+spec.props.length) + 2*margin; }

  function table(spec) {
    for (var j=0,tables = []; j<(spec.stack||1); j++) {
      var x = spec.x*gridLength + j*stackOffsetX, y = spec.y*gridLength + j*stackOffsetY;
      tables.push( gen('g', {class:'table', transform: 'translate('+x+','+y+')'}).add(
        gen('rect',{x:0,y:0, width:boxLength, height:tableHeight(spec) }),
        gen('text',{class:"name", x:margin, y:textHeight, width:boxLength}).text(spec.name),
        gen('line',{class:"sep", x1:0, y1:textHeight+margin, x2:boxLength, y2:textHeight+margin})
      ).addAll(map(spec.props, function(p,i) {
        return gen('text',{class:"prop", x:margin, y:margin+(2+i)*textHeight, width:boxLength}).text(p)
      })))
    }
    return tables.length == 1 ? tables[0].el() : gen('g',{class:'stack'}).addAll(tables).el();
  }

  function transform(el, x, y, scale) { 
    el.setAttribute('transform','translate('+x+','+y+') scale('+scale+','+scale+')');
    return el;
  }

  function connect(tables, p) {
    var table1 = tables[p[0]];
    var table2 = tables[p[1]];
    var yoffset = (p[2]||0) * textHeight;
    if (table1.y==table2.y) {
      var height = table1.y*gridLength + Math.min(tableHeight(table1),tableHeight(table2))/2 + yoffset;
      return line('connector', {x:table1.x*gridLength + boxLength, y:height}, {x:table2.x*gridLength, y:height})
    } else {
      return path('connector', 
        {x:table1.x*gridLength + boxLength, y:table1.y*gridLength + tableHeight(table1)/2 + yoffset}, 
        {x:table2.x*gridLength, y:table2.y*gridLength + tableHeight(table2)/2 + yoffset})
    }
  }

  function diagram( spec ) {
    return gen('g', {class:'diagram'})
      .addAll( map(spec.tables, function(t) {return table(t)} ) )
      .addAll( map(spec.paths, function(p) { return connect(spec.tables, p) }) )
  }

  function collection( name, x, y ) {
    return gen('g',{class:'collection', transform:'translate('+x+','+y+')'}).add(
      gen('rect',{class:'collection', width:14*gridLength, height:4.5*gridLength}),
      gen('text',{class:"name", x:2*margin, y:textHeight, width:boxLength}).text(name),
      gen('line',{class:"sep", x1:0, y1:textHeight+margin, x2:14*gridLength, y2:textHeight+margin}),
      gen('line',{class:"sep", x1:boxLength, y1:textHeight+margin, x2:boxLength, y2:4.5*gridLength}),
      gen('text',{class:"prop", x:2*margin, y:4.5*gridLength/2, width:boxLength}).text('key')
    )
  }

  function keyValueStore() {
    return gen('g', {class:'diagram'}).add(
      collection('Company', 0, 0),
      collection('Customer', 0, 5*gridLength))
  }

  function normalized( svg ) {
    var d = diagram(specs['normalized']).el();
    var scale = .8 * svg.offsetWidth / (14*gridLength);
    var x = .1 * svg.offsetWidth;
    var y = .1 * svg.offsetHeight;
    svg.appendChild( transform(d, x, y, scale ) );
  }

  function denormalized( svg ) {
    var d = diagram(specs['denormalized']).el();
    var scale = .8 * svg.offsetWidth / (14*gridLength);
    var x = .1 * svg.offsetWidth;
    var y = .1 * svg.offsetHeight;
    svg.appendChild( transform(d, x, y, scale ) );
  }

  function databaseApplication( svg, dbdiagram, noOrm ) {
    var boxx = .025*svg.offsetWidth, boxy = .05*svg.offsetHeight, 
        boxwidth = .5*svg.offsetWidth, boxheight = .7*svg.offsetHeight;

    svg.appendChild( gen('rect',{class:'container', x:boxx, y:boxy, width:boxwidth, height:boxheight, rx:5, ry:5}).el() )  
    svg.appendChild( gen('text',{class:"header", 'text-anchor':'middle', x:boxx+boxwidth/2, y:boxy + 40})
      .text('database').el() );

    boxx = .7*svg.offsetWidth;
    boxwidth = .275*svg.offsetWidth;

    svg.appendChild( gen('rect',{class:'container', x:boxx, y:boxy, width:boxwidth, height:boxheight, rx:5, ry:5}).el() )  
    svg.appendChild( gen('text',{class:"header", 'text-anchor':'middle', x:boxx+boxwidth/2, y:boxy + 40})
      .text('application').el() );

    var cx = .612*svg.offsetWidth, cy = boxy + boxheight/2;
    svg.appendChild( gen('text',{class:"orm", 'text-anchor':'middle', x:cx, y:cy+10}).text('ORM').el() );
    if (noOrm) {
      var r = 70, diag=r/Math.sqrt(2);
      svg.appendChild( gen('circle',{class:"no-orm", cx:cx, cy:cy, r:r}).el() );
      svg.appendChild( gen('line',{class:"no-orm", x1:cx+diag, y1:cy-diag, x2:cx-diag, y2:cy+diag}).el() );
    } 

    var scale = .45 * svg.offsetWidth / (14*gridLength);
    var x = .05 * svg.offsetWidth;
    var y = .2 * svg.offsetHeight;
    svg.appendChild( transform(dbdiagram, x, y, scale ) );
    var x = .725 * svg.offsetWidth;
    var d = diagram(specs['application']).el();
    svg.appendChild( transform(d, x, y, scale ) );
  }


  function normalizedApplication( svg ) { databaseApplication( svg, diagram(specs['normalized']).el() ); }
  function denormalizedApplication( svg ) { databaseApplication( svg, diagram(specs['denormalized']).el() ); }
  function keyValueApplication( svg ) { databaseApplication( svg, keyValueStore().el(), true ); }

  function mongoApplication( svg ) { 
    databaseApplication( svg, keyValueStore().el(), true );
    var scale = .4 * svg.offsetWidth / (14*gridLength);
    var x = .2 * svg.offsetWidth;
    var y = .245 * svg.offsetHeight;
    var d = diagram(specs['application2']).el();
    svg.appendChild( transform(d, x, y, scale ) );
  }


  function complexityGraph(withQueries) {
    var top=gridLength, left=gridLength, right=12*gridLength, bottom=6*gridLength;
    var twidth = .1*gridLength, tlength = .2*gridLength;
    var graph =  gen('g',{class:'graph'}).add(
      gen('line',{class:"axis", x1:left, y1:top, x2:left, y2:bottom}),
      gen('polygon',{class:"arrow", points:[left,top-tlength,left-twidth,top,left+twidth,top].join(',')}),
      gen('line',{class:"axis", x1:left, y1:bottom, x2:right, y2:bottom}),
      gen('polygon',{class:"arrow", points:[right+tlength,bottom,right,bottom-twidth,right,bottom+twidth].join(',')}),
      gen('text',{class:"axis-label", 'text-anchor':'middle', x:7*gridLength, y:bottom+25})
        .text('collection complexity'),
      gen('text',{class:"axis-label", 'text-anchor':'middle', x:left-10, y:top+(bottom-top)/2, 
        transform:'rotate(-90 '+(left-10)+', '+(top+(bottom-top)/2)+')'})
        .text('document complexity')

    )

    if (withQueries) {
      function queryPath() {
        for (var i=0,parts=[]; i<arguments.length;i+=2)
          parts.push((left+arguments[i]*(right-left))+','+(top+arguments[i+1]*(bottom-top)))
        return parts;
      }

      graph.add(gen('polyline',{class:'query', points:queryPath(1,0,.5,.75,0,.75)}))
      graph.add(gen('polyline',{class:'query', points:queryPath(1,0,.8,-.1,.2,.2,.2,1)}))
      graph.add(gen('polyline',{class:'query', points:queryPath(1,0,1.1,.9,.6,.9)}))
      graph.add(gen('polyline',{class:'query', points:queryPath(1,0,.6,.3,.2,.85,0,1)}))
    }

    graph.add(gen('circle',{class:'point', cx:right, cy:top, r:6}))
    return graph;
  }

  function complexity( svg ) {
    var d = complexityGraph().el();

    var scale = .8 * svg.offsetWidth / (14*gridLength);
    var x = .1 * svg.offsetWidth;
    var y = .1 * svg.offsetHeight;
    svg.appendChild( transform(d, x, y, scale ) );
  }

  function complexityWithQueries( svg ) {
    var d = complexityGraph(true).el();

    var scale = .8 * svg.offsetWidth / (14*gridLength);
    var x = .1 * svg.offsetWidth;
    var y = .1 * svg.offsetHeight;
    svg.appendChild( transform(d, x, y, scale ) );
  }

  function render(visId) {
    var vis = document.getElementById(visId);
    var diagrams = {
      normalized:normalized, 
      denormalized:denormalized,
      'normalized-vs-application': normalizedApplication,
      'denormalized-vs-application': denormalizedApplication,
      'keyvalue-vs-application': keyValueApplication,
      'mongo-vs-application': mongoApplication,
      'complexity': complexity,
      'complexity-with-queries': complexityWithQueries
    };
    if (diagrams[visId]) diagrams[visId](vis);
  }

  return {render:render};
})()
