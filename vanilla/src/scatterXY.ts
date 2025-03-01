import { WebglPlot, ColorRGBA, WebglLine, WebglSquare } from "https://cdn.skypack.dev/webgl-plot";
import { SimpleSlider } from "https://cdn.skypack.dev/@danchitnis/simple-slider";

const canvas = document.getElementById("my_canvas") as HTMLCanvasElement;
const devicePixelRatio = window.devicePixelRatio || 1;
canvas.width = canvas.clientWidth * devicePixelRatio;
canvas.height = canvas.clientHeight * devicePixelRatio;

const wglp = new WebglPlot(canvas);

const numX = canvas.width;
const color = new ColorRGBA(Math.random(), Math.random(), Math.random(), 1);
const lineMain = new WebglLine(color, numX);
lineMain.lineSpaceX(-1, 2 / numX);

const dataSizeList = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000];
let dataSizeIndex = 0;
let zoom = 1;

// correct for aspect ratio
wglp.gScaleX = canvas.height / canvas.width;

function newFrame(): void {
  update();
  wglp.update();
  requestAnimationFrame(newFrame);
}
requestAnimationFrame(newFrame);

const addGridLine = (coords: Float32Array) => {
  const color = new ColorRGBA(0.5, 0.5, 0.5, 1);
  const line = new WebglLine(color, 2);
  line.xy = coords;
  wglp.addLine(line);
};

const createDataPoint = (x: number, y: number) => {
  const size = 0.01;
  const color = new ColorRGBA(Math.random(), Math.random(), Math.random(), 0.5);
  const sq = new WebglSquare(color);
  sq.setSquare(x - size, y - size, x + size, y + size);
  wglp.addSurface(sq);
};

function update(): void {
  //empty
}

const updatePoints = () => {
  wglp.removeAllLines();
  addGridLine(new Float32Array([-5, 0, 5, 0]));
  addGridLine(new Float32Array([0, -2, 0, 2]));

  for (let i = 0; i < dataSizeList[Math.round(dataSizeIndex)]; i++) {
    createDataPoint(Math.random() * 5 - 2.5, Math.random() * 2 - 1);
  }
};

const sliderSize = new SimpleSlider("sliderSize", 0, dataSizeList.length - 1, dataSizeList.length);
sliderSize.setValue(dataSizeIndex);
sliderSize.callBackUpdate = () => {
  dataSizeIndex = sliderSize.value;
  updateTextDisplay();
  updatePoints();
};

const sliderZoom = new SimpleSlider("sliderZoom", 1, 10, 0);
sliderZoom.setValue(zoom);
sliderZoom.callBackUpdate = () => {
  zoom = sliderZoom.value;
  updateTextDisplay();
  wglp.gScaleX = (canvas.height / canvas.width) * zoom;
  wglp.gScaleY = zoom;
};

function updateTextDisplay() {
  document.getElementById("size").innerHTML = `Line number: ${
    dataSizeList[Math.round(dataSizeIndex)]
  }`;
  document.getElementById("zoom").innerHTML = `Zoom = ${zoom}`;
}

updateTextDisplay();
updatePoints();
