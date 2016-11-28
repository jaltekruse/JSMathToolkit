/*
 * Supporting script for 2D interactive, closest point on cubic Bezier demo.  Copyright (c) 2014, Jim Armstrong (The Algorithmist).  All Rights Reserved. 
 */
require(['jquery', 
         'bootstrap', 
         'easeljs', 
         '../../core/GraphMarker', 
         '../../graphing/GraphAxis', 
         '../../utils/BezierUtils',
         '../../core/Point',
         '../../planarCurves/CubicBezier'], 
         function($,                    // jQuery
                  bootstrapRef,         // Bootstrap
                  easelJS,              // EaselJS
                  GraphMarkerModule,    // GraphMarker
                  GraphAxisModule,      // GraphAxis
                  BezierUtilsModule,    // BezierUtils
                  PointModule,          // Point
                  CubicBezierModule     // CubicBeizer
                  )
{
  var stage;
  var xAxis;
  var yAxis;
  var grid;
  var xAxisShape;
  var xAxisArrowsShape;
  var xAxisTicMarks;
  var xAxisTicLabels;
  var xAxisTicDisplayObjects;
  var xAxisTicTextObjects;
  var yAxisShape;
  var yAxisArrowsShape;
  var yAxisTicMarks;
  var yAxisTicLabels;
  var yAxisTicDisplayObjects;
  var yAxisTicTextObjects;
  var defaultTop;
  var defaultLeft;
  var defaultRight;
  var defaultBottom;
  var majorInc;
  var minorInc;
  var axisLength;
  var axisHeight;
  var curveRenderShape;
  var closestPointShape;
  var curve;
  var pxPerUnitX;
  var pxPerUnitY;
  var pointMarker;
  var p0Marker;
  var p1Marker;
  var p2Marker
  var p3Marker;
  var pointX = -8;
  var pointY = 4;
  
  var bezierUtilsRef = new BezierUtilsModule();
  var bezierUtils    = new bezierUtilsRef.BezierUtils();
  
  var pointRef = new PointModule();
  var point    = new pointRef.Point(pointX,pointY);
  
  $( document ).ready( onPageLoaded );
  
  $('#reset').click(function()
  {
    // reset bezier curve and marker coordinates
    p0Marker.set_x(xAxis, axisLength, -5);
    p0Marker.set_y(yAxis, axisHeight, -3);
    
    curve.set_x0(-5);
    curve.set_y0(-3);
    
    p1Marker.set_x(xAxis, axisLength, -1);
    p1Marker.set_y(yAxis, axisHeight, 4);
    
    curve.set_cx(1);
    curve.set_cy(4);
    
    p2Marker.set_x(xAxis, axisLength, 3);
    p2Marker.set_y(yAxis, axisHeight, -2);
    
    curve.set_cx1(3);
    curve.set_cy1(-2);
    
    p3Marker.set_x(xAxis, axisLength, 5);
    p3Marker.set_y(yAxis, axisHeight, 1);
    
    curve.set_x1(5);
    curve.set_y1(1);
    
    drawCurve();
    
    stage.update();
    
    $('#instruct').text("Drag the circular Markers to change cubic control points (geometric constraints).");
  });
  
  function onPageLoaded()
  {
    // initial grid values
    defaultTop    = 5;
    defaultLeft   = -10;
    defaultRight  = 10;
    defaultBottom = -5;
    decimals      = 1;
    majorInc      = 1;
    minorInc      = 0.5;
    
	  // EaselJS setup
    var canvas = document.getElementById("stageCanvas");
    stage      = new createjs.Stage(canvas);
    
    // Graph axes (length/height used to manage tic label display)
    var axisRef = new GraphAxisModule();
    xAxis      = new axisRef.GraphAxis();
    yAxis      = new axisRef.GraphAxis();
    axisLength = canvas.width;
    axisHeight = canvas.height;
    pxPerUnitX = axisLength/(defaultRight - defaultLeft);
    pxPerUnitY = axisHeight/(defaultTop - defaultBottom);
    
    // initialize the axes - default is to display both arrows
    xAxis.setOrientation( xAxis.HORIZONTAL );
    yAxis.setOrientation( yAxis.VERTICAL );
    
    xAxis.setBounds(defaultLeft, defaultTop, defaultRight, defaultBottom, canvas.width, canvas.height);
    yAxis.setBounds(defaultLeft, defaultTop, defaultRight, defaultBottom, canvas.width, canvas.height);
    
    xAxis.set_majorInc(majorInc);
    yAxis.set_majorInc(majorInc);
    xAxis.set_minorInc(minorInc);
    yAxis.set_minorInc(minorInc);
    
    xAxisTicDisplayObjects = [];
    xAxisTicTextObjects    = [];
    yAxisTicDisplayObjects = [];
    yAxisTicTextObjects    = [];
    
    // shapes to draw the axis/tic lines and tic labels
    grid                 = new createjs.Shape();
    xAxisShape           = new createjs.Shape();
    xAxisArrowsShape     = new createjs.Shape();
    xAxisTicMarks        = new createjs.Shape();
    xAxisTicLabels       = new createjs.Shape();
    yAxisShape           = new createjs.Shape();
    yAxisArrowsShape     = new createjs.Shape();
    yAxisTicMarks        = new createjs.Shape();
    yAxisTicLabels       = new createjs.Shape();
    curveRenderShape     = new createjs.Shape();
    closestPointShape           = new createjs.Shape();
    
    // Cubic Bezier
    var bezierRef = new CubicBezierModule();
    curve = new bezierRef.CubicBezier();
    
    // add everything to the display list
    stage.addChild(grid);
    stage.addChild(xAxisShape);
    stage.addChild(xAxisArrowsShape);
    stage.addChild(xAxisTicMarks); 
    stage.addChild(xAxisTicLabels);  
    stage.addChild(yAxisShape); 
    stage.addChild(yAxisArrowsShape); 
    stage.addChild(yAxisTicMarks); 
    stage.addChild(yAxisTicLabels);
    stage.addChild(curveRenderShape);
    stage.addChild(closestPointShape);
    
    drawAxes();
    
    var markerRef = new GraphMarkerModule();
    pointMarker   = new markerRef.GraphMarker();
    pointMarker.create(stage, null, 6, xAxis, axisLength, yAxis, axisHeight);  
    pointMarker.set_x(xAxis, axisLength, pointX);
    pointMarker.set_y(yAxis, axisHeight, pointY);
    
    p0Marker = new markerRef.GraphMarker();
    p0Marker.create(stage, onP0Moved, 6, xAxis, axisLength, yAxis, axisHeight);  
    p0Marker.set_x(xAxis, axisLength, -5);
    p0Marker.set_y(yAxis, axisHeight, -3);
    
    // set the line coordinates as well, or as an exercise, read them from the Marker
    curve.set_x0(-5);
    curve.set_y0(-3);
    
    p1Marker = new markerRef.GraphMarker();
    p1Marker.create(stage, onP1Moved, 6, xAxis, axisLength, yAxis, axisHeight);  
    p1Marker.set_x(xAxis, axisLength, -1);
    p1Marker.set_y(yAxis, axisHeight, 4);
    
    curve.set_cx(-1);
    curve.set_cy(4);
    
    p2Marker = new markerRef.GraphMarker();
    p2Marker.create(stage, onP2Moved, 6, xAxis, axisLength, yAxis, axisHeight);  
    p2Marker.set_x(xAxis, axisLength, 3);
    p2Marker.set_y(yAxis, axisHeight, -2);
    
    curve.set_cx1(3);
    curve.set_cy1(-2);
    
    p3Marker = new markerRef.GraphMarker();
    p3Marker.create(stage, onP3Moved, 6, xAxis, axisLength, yAxis, axisHeight);  
    p3Marker.set_x(xAxis, axisLength, 5);
    p3Marker.set_y(yAxis, axisHeight, 1);
    
    // again, set the line coords. directly or read from the Marker
    curve.set_x1(5);
    curve.set_y1(1);
    
    drawCurve();
    
    stage.update();
  };
  
  // (x0,y0) moved
  function onP0Moved(newX, newY)
  {
    curve.set_x0(newX);
    curve.set_y0(newY);
    
    drawCurve();
  };
  
  // (cx,cy) moved
  function onP1Moved(newX, newY)
  {
    curve.set_cx(newX);
    curve.set_cy(newY);
    
    $('#instruct').text( "arc length: " + curve.lengthAt(1.0).toFixed(2) );
    
    drawCurve();
  };
  
  // (cx1,cy1) moved
  function onP2Moved(newX, newY)
  {
    curve.set_cx1(newX);
    curve.set_cy1(newY);
    
    $('#instruct').text( "arc length: " + curve.lengthAt(1.0).toFixed(2) );
    
    drawCurve();
  };
  
  // (x1,y1) moved
  function onP3Moved(newX, newY)
  {
    curve.set_x1(newX);
    curve.set_y1(newY);
    
    $('#instruct').text( "arc length: " + curve.lengthAt(1.0).toFixed(2) );
    
    drawCurve();
  };
  
  function drawCurve()
  {
    // draw the cubic with a simple point-to-point plot and overlay the bounding-box
    var g = curveRenderShape.graphics;
    g.clear();
    
    var x0 = (curve.get_x0() - defaultLeft)*pxPerUnitX;
    var y0 = (defaultTop  - curve.get_y0())*pxPerUnitY;
    
    // draw the Bezier curve, point-to-point
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(255,255,255,2) );
    g.moveTo(x0, y0);
    
    for( t=0.02; t<=1.0; t+=0.02 )
      g.lineTo( (curve.getX(t)-defaultLeft)*pxPerUnitX, (defaultTop - curve.getY(t))*pxPerUnitY );
    
    g.lineTo( (curve.getX(1.0)-defaultLeft)*pxPerUnitX, (defaultTop - curve.getY(1.0))*pxPerUnitY );

    g.endStroke();
    
    // bounding box - these are relative to the coordinate system which is naturally y-up
    var t = bezierUtils.closestPointToBezier(curve, point);
    
    // (cx,cy) is the closest point on the cubic bezier to the point marker (px,py) - convert coordinate space to pixel offsets in the Canvas
    var pX = (pointX - defaultLeft)*pxPerUnitX;
    var pY = (defaultTop - pointY)*pxPerUnitY;
    var cX = (curve.getX(t) - defaultLeft)*pxPerUnitX;
    var cY = (defaultTop - curve.getY(t))*pxPerUnitY;
    
    var g = closestPointShape.graphics;
    g.clear();
    
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(0,0,255,2) );
    
    g.moveTo(pX,pY);
    g.lineTo(pX,pY);
    g.lineTo(cX,cY);
    
    g.endStroke();
    
    stage.update();
  };
  
  function drawAxes()
  {
    var g = grid.graphics;
    g.clear();
    g.setStrokeStyle(1);
    g.beginStroke( createjs.Graphics.getRGB(201,201,201,0.5) );
    xAxis.drawGrid(g);
    yAxis.drawGrid(g);
    g.endStroke();
    
    // x- and y-axis thickness is 3
    g = xAxisShape.graphics;
    g.clear();
    g.setStrokeStyle(3);
    g.beginStroke( createjs.Graphics.getRGB(131,156,165,1) );
    xAxis.drawAxis(g, 10, 8);
    
    g = yAxisShape.graphics;
    g.clear();
    g.setStrokeStyle(3);
    g.beginStroke( createjs.Graphics.getRGB(131,156,165,1) );
    yAxis.drawAxis(g, 10, 8);
    
    g = xAxisArrowsShape.graphics;
    g.clear();
    g.beginFill( createjs.Graphics.getRGB(131,156,165,1) );
    xAxis.drawArrows(g, 10, 8);
    g.endFill();
    
    g = yAxisArrowsShape.graphics;
    g.clear();
    g.beginFill( createjs.Graphics.getRGB(131,156,165,1) );
    yAxis.drawArrows(g, 10, 8);
    g.endFill;
    
    // x-axis major and minor tic marks
    g = xAxisTicMarks.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(131,156,165,1) );
    xAxis.drawMajorTicMarks(g, 20);
    g.endStroke();
    
    g.setStrokeStyle(1);
    g.beginStroke( createjs.Graphics.getRGB(131,156,165,1) );
    xAxis.drawMinorTicMarks(g,10);
    g.endStroke();
    
    // y-axis major and minor tic marks
    g = yAxisTicMarks.graphics;
    g.clear();
    g.setStrokeStyle(2);
    g.beginStroke( createjs.Graphics.getRGB(131,156,165,1) );
    yAxis.drawMajorTicMarks(g, 20);
    g.endStroke();
    
    g.setStrokeStyle(1);
    g.beginStroke( createjs.Graphics.getRGB(131,156,165,1) );
    yAxis.drawMinorTicMarks(g,10);
    g.endStroke();
    
    // tic labels require managing a display list, so these are rendered externally, similar to the Numberline example
    // get the pixel locations of the major tic marks
    var majorTics    = xAxis.getTicCoordinates("major");
    var numMajorTics = majorTics.length;
    var numLabels    = xAxisTicDisplayObjects.length;
    var lbl;
    var dispObj;
    var i;
    var ticX;
    
    if( numLabels < numMajorTics )
    {
      // create labels JIT and then re-use the pool every number line redraw
      for( i=numLabels; i<numMajorTics; ++i)
      {
        lbl     = new createjs.Text(" ", 'Bold 15px Arial', "#ebebeb" );
        dispObj = stage.addChild(lbl);
        
        xAxisTicTextObjects.push( lbl );
        xAxisTicDisplayObjects.push( dispObj );
      }
    }
    
    // use however many tic labels are necessary and hide the remaining ones
    var labelText = xAxis.getTicMarkLabels("major", 0, false);

    for( i=0; i<numLabels; ++i )
    {
      // make all tic labels invisible by default
      xAxisTicDisplayObjects[i].visible = false;
    }
    
    if( xAxis.isVisible() )
    {
      // position the labels - it's a matter of style, but for this demo, the endpoint labels are not displayed if they are near the Canvas edge
      var axisY    = xAxis.get_axisOffset();
      var baseline = axisY + 10;
    
      for( i=0; i<numMajorTics; ++i )
      {
        lbl             = xAxisTicTextObjects[i];
        dispObj         = xAxisTicDisplayObjects[i];
        if( labelText[i] != "0" )
        {
          lbl.text        = labelText[i]; 
          ticX            = majorTics[i];
          dispObj.x       = Math.round( ticX - 0.5*lbl.getMeasuredWidth() );
          dispObj.y       = baseline;
          dispObj.visible = ticX > 10 && ticX < axisLength-10;
        }
      }
    }
    
    majorTics    = yAxis.getTicCoordinates("major");
    numMajorTics = majorTics.length;
    numLabels    = yAxisTicDisplayObjects.length;
    var ticY;
    
    if( numLabels < numMajorTics )
    {
      // create labels JIT and then re-use the pool every number line redraw
      for( i=numLabels; i<numMajorTics; ++i)
      {
        lbl     = new createjs.Text(" ", 'Bold 15px Arial', "#ebebeb" );
        dispObj = stage.addChild(lbl);
        
        yAxisTicTextObjects.push( lbl );
        yAxisTicDisplayObjects.push( dispObj );
      }
    }
    
    // use however many tic labels are necessary and hide the remaining ones
    var labelText = yAxis.getTicMarkLabels("major", 0, false);

    for( i=0; i<numLabels; ++i )
    {
      // make all tic labels invisible by default
      yAxisTicDisplayObjects[i].visible = false;
    }
    
    if( yAxis.isVisible() )
    {
      var axisX    = yAxis.get_axisOffset();
      var baseline = axisX + 8;
    
      for( i=0; i<numMajorTics; ++i )
      {
        lbl             = yAxisTicTextObjects[i];
        dispObj         = yAxisTicDisplayObjects[i];
        if( labelText[i] != "0" )
        {
          lbl.text        = labelText[i]; 
          ticY            = axisHeight - majorTics[i];
          dispObj.x       = baseline;
          dispObj.y       =  Math.round( ticY - 0.5*lbl.getMeasuredHeight() ) - 1;
          dispObj.visible = ticY > 10 && ticY < axisHeight-10;
        }
      }
    }
    
    stage.update();
  };
});