import "pixi.js";

declare module "pixi.js" {
  interface Graphics extends PIXI.DisplayObject {}
}
