import { WebglPlot, ColorRGBA, WebglLine } from "https://cdn.skypack.dev/webgl-plot";
import { updateAxisX, updateAxisY } from "./axis.js";
// !! manual imported in proto/custom.html
import Pbf from "../../node_modules/pbf/dist/pbf.js";
import { Market } from "./pbfmarket.js";
// above two lines should be commented out.
// due to some javascript error.

const numLines = 2;

// the element with the webgl graph plot.
const canvas = document.getElementById("canvas_plot") as HTMLCanvasElement;

let numX: number;
let wglp: WebglPlot;
let Rect: WebglLine;

let scaleX = 1;
let offsetX = 0;
let scaleY = 1;
let offsetY = 0;

let pinchZoom = false;
let drag = false;
let zoom = false;

let dragInitialX = 0;
let dragOffsetOldX = 0;
let dragInitialY = 0;
let dragOffsetOldY = 0;

type lineSetting = {
	highlight?: boolean;
}

let lines = new Map<string, lineSetting>();

let initialX = 0;
let initialY = 0;

type pair = {
	symbol?: string;
	prices?: Array<any>;
}

type mkt = {
	pairs?: Array<pair>;
}

//fetch('./rmse4.9.5_TORNBUSD-5m-2022-3-4-to-2022-5-3.csv.pbf')
fetch('./rmse4.9.5_..pbf')
  .then(res => res.arrayBuffer())
  .then(buff => {

    let pbf = new Pbf(buff);
    let market = Market.read(pbf, null)
    console.log(market)

    lineSettings(market);
    init(market);
});

function lineSettings(market: mkt): void {
  var numLines = market.pairs.length;
  let lineCount = 0
  for (let i = 0; i < numLines; i++) {
	let ls = {highlight: false};
	lines[market.pairs[i].symbol] = ls;
	if (i % 25 === 0) {
		lines[market.pairs[i].symbol].highlight = true
	}
  }
}

let resizeId: number;
window.addEventListener("resize", () => {
  window.clearTimeout(resizeId);
  resizeId = window.setTimeout(doneResizing, 500);
});

function newFrame(): void {
  updateTextDisplay();

  wglp.update();
  updateAxisX(wglp.gScaleX, wglp.gOffsetX, 8);
  updateAxisY(wglp.gScaleY, wglp.gOffsetY, 8);

  requestAnimationFrame(newFrame);
}


const addGridLine = (coords: Float32Array) => {
  const color = new ColorRGBA(0.5, 0.5, 0.5, 1);
  const line = new WebglLine(color, 2);
  line.xy = coords;
  wglp.addLine(line);
};


// requestAnimationFrame(newFrame);
/* setup all the lines by looping over all market data
 * in pbf file.
 */
function init(market: mkt): void {
  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;

  numX = 10000;

  wglp = new WebglPlot(canvas);
  wglp.removeAllLines();

  if (market === undefined) {
      return;
  }

  var numLines = market.pairs.length;
  var numX = market.pairs[0].prices.length;

  let lineCount = 0

  console.log(lines);

  for (let i = 0; i < numLines; i++) {
      let color = new ColorRGBA(0.2, 0.2, 0.2, 0.4);
      let color2 = new ColorRGBA(0.8, 0.8, 0.2, 0.8);


      // check if symbol is highlighted.
      let s = market.pairs[i].symbol;
      if (lines[s].highlight) {
	      color = color2;
      }

      const line = new WebglLine(color, numX);
      line.lineSpaceX(-1, 2 / numX);
      wglp.addDataLine(line);

      for (let j = 0; j < line.numPoints; j++) {
          let p = market.pairs[lineCount].prices[j]
          let y = p;

          if (y > 9000) {
              y = 9000;
          }
          if (y < -9000) {
              y = -9000;
          }

	  (line as WebglLine).setY(j, y);

          if (i % 10000 === 0) {
		console.log(j, p);
          }
      }
      //console.log('linecount', lineCount);
      lineCount++
  };
  console.log(lines);
  addGridLine(new Float32Array([-numX, 1000, numX, 1000]));

  /*
  let c = 0;
  lines.forEach((l, s) => {
	c++;
	l.color = new ColorRGBA(0.9, 0.2, 0.2, 0.4);
	wglp.addDataLine(l);
  });
  */

  // add zoom rectangle
  // Rect = new WebglLine(new ColorRGBA(0.9, 0.9, 0.9, 1), 4);
  // Rect.loop = true;
  // Rect.xy = new Float32Array([-0.5, -1, -0.5, 1, 0.5, 1, 0.5, -1]);
  // Rect.visible = false;
  // wglp.addLine(Rect);

  // test rec
  // const testRect = new WebglLine(new ColorRGBA(0.1, 0.9, 0.9, 1), 4);
  // testRect.loop = true;
  // testRect.xy = new Float32Array([-0.7, -0.8, -0.7, 0.8, -0.6, 0.8, -0.6, -0.8]);
  // wglp.addLine(testRect);

  setScale()

  canvas.addEventListener("wheel", zoomEvent);
  canvas.addEventListener("touchstart", touchStart);
  canvas.addEventListener("touchmove", touchMove);
  canvas.addEventListener("touchend", touchEnd);
  canvas.addEventListener("mousedown", mouseDown);
  canvas.addEventListener("mousemove", mouseMove);
  canvas.addEventListener("mouseup", mouseUp);
  canvas.addEventListener("dblclick", dblClick);
  canvas.addEventListener("contextmenu", contextMenu);

  //canvas.style.cursor = "zoom-in";

  //window.addEventListener("keydown", keyEvent);
  newFrame()
}

function setScale() {
    wglp.gScaleX = 1;
    wglp.gOffsetX = 0;
    wglp.gScaleY = 0.0004;
    wglp.gOffsetY = -1.2;
}

function dblClick(e: MouseEvent) {
  e.preventDefault();
  setScale()
}

function contextMenu(e: Event) {
  e.preventDefault();
}

let cursorDownX = 0;

function mouseDown(e: MouseEvent) {
  e.preventDefault();
  console.log(e.clientX);
  if (e.button == 0) {
    zoom = true;
    canvas.style.cursor = "pointer";
    cursorDownX = (2 * (e.clientX * devicePixelRatio - canvas.width / 2)) / canvas.width;
    //cursorDownX = (cursorDownX - wglp.gOffsetX) / wglp.gScaleX;

    Rect.visible = true;
  }
  if (e.button == 2) {
    drag = true;
    canvas.style.cursor = "grabbing";
    dragInitialX = e.clientX * devicePixelRatio;
    dragOffsetOldX = wglp.gOffsetX;
    dragInitialY = e.clientY * devicePixelRatio;
    dragOffsetOldY = wglp.gOffsetY;
  }
}

function mouseMove(e: MouseEvent) {
  e.preventDefault();
  if (zoom) {
    const cursorOffsetX = (2 * (e.clientX * devicePixelRatio - canvas.width / 2)) / canvas.width;
    Rect.xy = new Float32Array([
      (cursorDownX - wglp.gOffsetX) / wglp.gScaleX,
      -1,
      (cursorDownX - wglp.gOffsetX) / wglp.gScaleX,
      1,
      (cursorOffsetX - wglp.gOffsetX) / wglp.gScaleX,
      1,
      (cursorOffsetX - wglp.gOffsetX) / wglp.gScaleX,
      -1,
    ]);
    Rect.visible = true;
  }
  if (drag) {
    const moveX = e.clientX * devicePixelRatio - dragInitialX;
    const offsetX = (wglp.gScaleY * moveX) / 1000;
    wglp.gOffsetX = offsetX + dragOffsetOldX;

    const moveY = e.clientY * devicePixelRatio - dragInitialY;
    const offsetY = -(wglp.gScaleY * moveY) / 500;
    wglp.gOffsetY = offsetY + dragOffsetOldY;
  }
}

function zoomEvent(e: WheelEvent) {
  e.preventDefault();

  const cursorOffsetX = (-2 * (e.clientX * devicePixelRatio - canvas.width / 2)) / canvas.width;

  if (e.shiftKey) {
    offsetX += e.deltaY * 0.1;
    wglp.gOffsetX = 0.1 * offsetX;
  } else {
    scaleX += e.deltaY * -0.01;
    scaleX = Math.min(100, scaleX);
    scaleX = Math.max(1, scaleX);
    const gScaleXOld = wglp.gScaleX;

    wglp.gScaleX = 1 * Math.pow(scaleX, 1.5);

    if (scaleX > 1 && scaleX < 100) {
      wglp.gOffsetX = ((wglp.gOffsetX + cursorOffsetX) * wglp.gScaleX) / gScaleXOld;
    }
    if (scaleX <= 1) {
      wglp.gOffsetX = 0;
    }
  }
}


function mouseUp(e: MouseEvent) {
  e.preventDefault();
  if (zoom) {
    const cursorUpX = (2 * (e.clientX * devicePixelRatio - canvas.width / 2)) / canvas.width;

    const zoomFactor = Math.abs(cursorUpX - cursorDownX) / (2 * wglp.gScaleX);
    const offsetFactor = (cursorDownX + cursorUpX - 2 * wglp.gOffsetX) / (2 * wglp.gScaleX);

    if (zoomFactor > 0) {
      wglp.gScaleX = 1 / zoomFactor;
      wglp.gOffsetX = -offsetFactor / zoomFactor;
    }
  }

  zoom = false;
  drag = false;
  canvas.style.cursor = "zoom-in";
  Rect.visible = false;
}

/*
 * Pinch and Zoom
 **/

function touchStart(e: TouchEvent) {
  //
  e.preventDefault();
  log("touched");
  if (e.touches.length == 2) {
    pinchZoom = true;
    drag = false;
    initialX = e.touches[0].pageX - e.touches[1].pageX;
    log("pinch started");
  }
  if (e.touches.length == 1) {
    drag = true;
    pinchZoom = false;
    initialX = e.touches[0].pageX;
  }
}

function touchMove(e: TouchEvent) {
  e.preventDefault();
  if (pinchZoom) {
    const newX = e.touches[0].pageX - e.touches[1].pageX;

    const deltaX = (initialX - newX) / 10;

    scaleX = scaleX + deltaX;
    scaleX = Math.min(100, scaleX);
    scaleX = Math.max(1, scaleX);
    wglp.gScaleX = 1 * Math.pow(scaleX, 1.5);

    //log(diffX.toFixed(2));
    initialX = newX;
  }
  if (drag) {
    const newX = e.touches[0].pageX;
    const deltaX = initialX - newX;
    offsetX = offsetX - deltaX;
    offsetX = Math.min(1000, offsetX);
    offsetX = Math.max(-1000, offsetX);
    wglp.gOffsetX = offsetX / 100;
    initialX = newX;
  }
}

function touchEnd(e: TouchEvent) {
  //
  e.preventDefault();
  pinchZoom = false;
  drag = false;
}

function doneResizing(): void {
  //wglp.viewport(0, 0, canv.width, canv.height);
}

function log(str: string) {
  //display.innerHTML = str;
  console.log(str);
}

function updateTextDisplay() {
  document.getElementById("info").innerHTML = `ZoomX: ${wglp.gScaleX.toFixed(
    2
  )}, OffsetX ${wglp.gOffsetX.toFixed(2)}, ZoomY: ${wglp.gScaleY.toFixed(
    2
  )}, OffsetY ${wglp.gOffsetY.toFixed(2)} `;
}
