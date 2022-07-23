import { Snake } from "./snake";
import "./style.css";

const RAW_CANVAS = document.createElement("canvas");
const playButton = document.getElementById("playBtn");

RAW_CANVAS.height = 100;
RAW_CANVAS.width = 100;

const ctx = RAW_CANVAS.getContext("2d");

if (!ctx) {
  throw new Error("Context not defined");
}

// Paint the canvas white first
ctx.fillStyle = "#FFF";
ctx.fillRect(0, 0, 100, 100);

const setFavicon = (imgSrc: string) => {
  let link: HTMLLinkElement | null =
    document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.getElementsByTagName("head")[0].appendChild(link);
  }
  link.href = imgSrc;
};

const getImgSrc = (canvas = RAW_CANVAS) => {
  const image = canvas.toDataURL("image/png");
  return image;
};

const updateFavicon = () => setFavicon(getImgSrc());

if (playButton) {
  playButton.onclick = () => {
    const h2 = document.getElementById("points");
    if (!h2) {
      return;
    }
    h2.innerText = `Score : 0`;
    const snake = new Snake(RAW_CANVAS);
    snake.start();
    snake.onDraw = () => updateFavicon();
    snake.onPoint = (point) => {
      h2.innerText = `Score : ${point}`;
    };
    snake.onEnd = (point) => {
      h2.innerText = `Score : ${point} Game Ended`;
      playButton.innerText = "Play Again";
      playButton.style.display = "block";
    };
    playButton.style.display = "none";
  };
}

// const snake = new Snake(RAW_CANVAS);
// snake.start();
// snake.onDraw = () => updateFavicon();
// snake.onPoint = (point) => {
//   const h2 = document.getElementById("points");
//   if (!h2) {
//     return;
//   }
//   h2.innerText = point.toString();
// };
