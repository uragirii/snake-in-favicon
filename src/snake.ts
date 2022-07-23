import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  SQUARE_HEIGHT,
  SQUARE_WIDTH,
} from "./constants";

export type Direction = "up" | "down" | "left" | "right";

export type Coordinate = { x: number; y: number };

export class Snake {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private snakePositions: Coordinate[] = [];
  private foodCoordinate: Coordinate | null = null;
  private moveDirection: Direction = "right";
  private lastDirection: Direction | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Context is not defined");
    }

    this.ctx = ctx;
  }

  move(direction: Direction) {
    console.log(`Moving snake : ${direction}`);

    this.moveDirection = "left";

    console.warn("Snake.move is not implemented");
  }

  private getVerticesFromCenter(
    center: Coordinate
  ): readonly [Coordinate, Coordinate, Coordinate, Coordinate] {
    const topLeft = {
      x: center.x - SQUARE_WIDTH / 2,
      y: center.y - SQUARE_HEIGHT / 2,
    };
    const topRight = {
      x: center.x + SQUARE_WIDTH / 2,
      y: center.y - SQUARE_HEIGHT / 2,
    };
    const bottomRight = {
      x: center.x + SQUARE_WIDTH / 2,
      y: center.y + SQUARE_HEIGHT / 2,
    };
    const bottomLeft = {
      x: center.x - SQUARE_WIDTH / 2,
      y: center.y + SQUARE_HEIGHT / 2,
    };

    return [topLeft, topRight, bottomRight, bottomLeft] as const;
  }

  private pointsOverlapping(point1: Coordinate, point2: Coordinate): boolean {
    const rect1 = this.getVerticesFromCenter(point1);

    // Overlap condition is any one point of Rect1 is inside or on Rect2 boundary
    const yRangeStart = point2.y - SQUARE_HEIGHT / 2;
    const yRangeEnd = point2.y + SQUARE_HEIGHT / 2;

    const xRangeStart = point2.x - SQUARE_WIDTH / 2;
    const xRangeEnd = point2.x + SQUARE_WIDTH / 2;

    for (const point of rect1) {
      const { x, y } = point;

      if (
        x >= xRangeStart &&
        x <= xRangeEnd &&
        y >= yRangeStart &&
        y <= yRangeEnd
      ) {
        return true;
      }
    }

    return false;
  }

  private getRandomCoordinate(): Coordinate {
    const x = Math.floor(Math.random() * CANVAS_WIDTH);
    const y = Math.floor(Math.random() * CANVAS_HEIGHT);

    return { x, y };
  }

  private isPointInsideSnake(point: Coordinate): boolean {
    if (this.snakePositions.length === 0) {
      return false;
    }

    for (const snakePoint of this.snakePositions) {
      if (this.pointsOverlapping(snakePoint, point)) {
        return true;
      }
    }
    return false;
  }

  private isPointInsideFood(point: Coordinate): boolean {
    if (!this.foodCoordinate) {
      return false;
    }

    return this.pointsOverlapping(point, this.foodCoordinate);
  }

  private isPointSafe(point: Coordinate) {
    if (this.isPointInsideSnake(point) || this.isPointInsideFood(point)) {
      return false;
    }

    // Also check if rect made from point is within bounds of canvas boundary

    const rect = this.getVerticesFromCenter(point);

    for (const { x, y } of rect) {
      if (x < 0 || x > CANVAS_WIDTH) {
        return false;
      }
      if (y < 0 || y > CANVAS_HEIGHT) {
        return false;
      }
    }

    return true;
  }

  /**
   * Finds a valid safe point where there is not other thing
   */
  private getSafePoint() {
    while (true) {
      const point = this.getRandomCoordinate();
      if (this.isPointSafe(point)) {
        return point;
      }
    }
  }

  private drawPoint(point: Coordinate, color = "black") {
    this.ctx.fillStyle = color;
    const x = point.x - SQUARE_WIDTH / 2;
    const y = point.y - SQUARE_HEIGHT / 2;
    this.ctx.fillRect(x, y, SQUARE_WIDTH, SQUARE_HEIGHT);
  }

  private drawSnake() {
    // Clear whole canvas
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Paint the canvas white first
    this.ctx.fillStyle = "#FFF";
    this.ctx.fillRect(0, 0, 100, 100);

    for (const point of this.snakePositions) {
      this.drawPoint(point);
    }

    this.foodCoordinate && this.drawPoint(this.foodCoordinate, "green");
  }

  start() {
    const snakeHead = this.getSafePoint();
    this.snakePositions.push(snakeHead);
    this.foodCoordinate = this.getSafePoint();

    this.drawSnake();

    // setInterval(() => {
    //   this.move(this.moveDirection);
    // }, 1000);
  }
}
