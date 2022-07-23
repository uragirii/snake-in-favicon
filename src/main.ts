import { Snake } from "./snake";
import "./style.css";

const RAW_CANVAS = document.getElementsByTagName("canvas")[0];

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
  console.log(image);
  return image;
};

const updateFavicon = () => setFavicon(getImgSrc());

const snake = new Snake(RAW_CANVAS);
snake.start();

updateFavicon();
