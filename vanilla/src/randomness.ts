/**
 * Author Danial Chitnis 2019
 */

import * as noUiSlider from "nouislider";
import WebGLplot, { WebglLine, ColorRGBA } from "webgl-plot";

//import Statsjs = require("stats.js");

import * as Stats from "stats.js";

const canvas = document.getElementById("my_canvas") as HTMLCanvasElement;

const devicePixelRatio = window.devicePixelRatio || 1;
canvas.width = canvas.clientWidth * devicePixelRatio;
canvas.height = canvas.clientHeight * devicePixelRatio;

const numX = Math.round(canvas.width);

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

let numLines = 1;
let scaleY = 1;
//let lines: WebglLine[];

const wglp = new WebGLplot(canvas);

let fpsDivder = 1;
let fpsCounter = 0;

// new data per frame
let newDataSize = 1;

const lineNumList = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];

let sliderLines: noUiSlider.Instance;
let sliderYScale: noUiSlider.Instance;
let sliderNewData: noUiSlider.Instance;
let sliderFps: noUiSlider.Instance;

let displayLines: HTMLSpanElement;
let displayYScale: HTMLSpanElement;
let displayNewDataSize: HTMLSpanElement;
let displayFps: HTMLSpanElement;

createUI();

let resizeId: number;
window.addEventListener("resize", () => {
  window.clearTimeout(resizeId);
  resizeId = window.setTimeout(doneResizing, 500);
});

/*let bt = <HTMLButtonElement>document.getElementById("bt");
bt.addEventListener("click",btclick);*/

init();

function newFrame(): void {
  if (fpsCounter === 0) {
    stats.begin();

    plot(newDataSize);

    wglp.gScaleY = scaleY;
    wglp.update();

    stats.end();
  }

  fpsCounter++;

  if (fpsCounter >= fpsDivder) {
    fpsCounter = 0;
  }

  window.requestAnimationFrame(newFrame);
}

window.requestAnimationFrame(newFrame);

function plot(shiftSize: number): void {
  wglp.lines.forEach((line) => {
    const yArray = randomWalk((line as WebglLine).getY(numX - 1), shiftSize);
    (line as WebglLine).shiftAdd(yArray);
  });
}

function randomWalk(initial: number, walkSize: number): Float32Array {
  const y = new Float32Array(walkSize);
  y[0] = initial + 0.01 * (Math.round(Math.random()) - 0.5);
  for (let i = 1; i < walkSize; i++) {
    y[i] = y[i - 1] + 0.01 * (Math.round(Math.random()) - 0.5);
  }
  return y;
}

function init(): void {
  wglp.lines = [];

  for (let i = 0; i < numLines; i++) {
    const color = new ColorRGBA(Math.random(), Math.random(), Math.random(), 0.5);
    const line = new WebglLine(color, numX);
    line.lineSpaceX(-1, 2 / numX);
    wglp.addLine(line);
  }
}

function doneResizing(): void {
  //wglp.viewport(0, 0, canv.width, canv.height);
}

function createUI(): void {
  const ui = document.getElementById("ui") as HTMLDivElement;

  // ******slider lines */
  sliderLines = (document.createElement("div") as unknown) as noUiSlider.Instance;
  sliderLines.style.width = "100%";
  noUiSlider.create(sliderLines, {
    start: [0],
    step: 1,
    connect: [true, false],
    // tooltips: [false, wNumb({decimals: 1}), true],
    range: {
      min: 0,
      max: 11,
    },
  });

  displayLines = document.createElement("span");
  ui.appendChild(sliderLines);
  ui.appendChild(displayLines);
  ui.appendChild(document.createElement("p"));

  sliderLines.noUiSlider.on("update", (values, handle) => {
    numLines = lineNumList[parseFloat(values[handle])];
    displayLines.innerHTML = `Line number: ${numLines}`;
  });

  sliderLines.noUiSlider.on("set", () => {
    init();
  });

  /*****slider yscale */
  sliderYScale = (document.createElement("div") as unknown) as noUiSlider.Instance;
  sliderYScale.style.width = "100%";
  noUiSlider.create(sliderYScale, {
    start: [1],
    connect: [true, false],
    // tooltips: [false, wNumb({decimals: 1}), true],
    range: {
      min: 0.01,
      max: 10,
    },
  });

  displayYScale = document.createElement("span");
  ui.appendChild(sliderYScale);
  ui.appendChild(displayYScale);
  ui.appendChild(document.createElement("p"));

  sliderYScale.noUiSlider.on("update", (values, handle) => {
    scaleY = parseFloat(values[handle]);
    displayYScale.innerHTML = `Y scale = ${scaleY}`;
  });

  /****** slider new data */
  sliderNewData = (document.createElement("div") as unknown) as noUiSlider.Instance;
  sliderNewData.style.width = "100%";

  noUiSlider.create(sliderNewData, {
    start: [1],
    step: 1,
    connect: [true, false],
    // tooltips: [false, wNumb({decimals: 1}), true],
    range: {
      min: 1,
      max: 100,
    },
  });

  displayNewDataSize = document.createElement("span");
  ui.appendChild(sliderNewData);
  ui.appendChild(displayNewDataSize);
  ui.appendChild(document.createElement("p"));

  sliderNewData.noUiSlider.on("update", (values, handle) => {
    newDataSize = parseFloat(values[handle]);
    displayNewDataSize.innerHTML = `New data per frame = ${newDataSize}`;
  });

  /**** slider fps */
  sliderFps = (document.createElement("div") as unknown) as noUiSlider.Instance;
  sliderFps.style.width = "100%";

  noUiSlider.create(sliderFps, {
    start: [1],
    step: 1,
    connect: [true, false],
    // tooltips: [false, wNumb({decimals: 1}), true],
    range: {
      min: 1,
      max: 10,
    },
  });

  displayFps = document.createElement("span");
  ui.appendChild(sliderFps);
  ui.appendChild(displayFps);
  ui.appendChild(document.createElement("p"));

  sliderFps.noUiSlider.on("update", (values, handle) => {
    fpsDivder = parseFloat(values[handle]);
    displayFps.innerHTML = `FPS  = ${60 / fpsDivder}`;
  });
}

/*function btclick() {
  console.log("button press!");
  let ui = <HTMLDivElement>document.getElementById("ui");
  while (ui.firstChild) {
    ui.removeChild(ui.firstChild);
  }
}*/
