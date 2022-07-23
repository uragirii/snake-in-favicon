import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  SQUARE_HEIGHT,
  SQUARE_WIDTH,
} from "./constants";

export type Direction = "up" | "down" | "left" | "right";

export type Coordinate = { x: number; y: number };

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

export class Snake {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private snakePositions: Coordinate[] = [];
  private foodCoordinate: Coordinate | null = null;
  private moveDirection: Direction = "down";
  private lastDirection: Direction | null = null;
  private ended: boolean = false;
  private points = 0;

  onDraw: (() => void) | null = null;
  onPoint: ((point: number) => void) | null = null;
  onEnd: ((point: number) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Context is not defined");
    }

    this.ctx = ctx;
  }

  move(direction: Direction): void {
    if (this.ended) {
      return;
    }
    let newPoint: Coordinate | null = null;
    const { x, y } = this.snakePositions[0];

    switch (direction) {
      case "right": {
        if (this.lastDirection === "left") {
          return this.move(this.lastDirection);
        }

        const newX =
          x >= CANVAS_WIDTH - SQUARE_WIDTH / 2 ? 0 : x + SQUARE_WIDTH;

        newPoint = { x: newX, y };

        this.lastDirection = "right";

        break;
      }
      case "left": {
        if (this.lastDirection === "right") {
          return this.move(this.lastDirection);
        }

        newPoint = {
          x:
            x <= SQUARE_WIDTH / 2
              ? CANVAS_WIDTH - SQUARE_WIDTH / 2
              : x - SQUARE_WIDTH,
          y,
        };

        this.lastDirection = "left";

        break;
      }
      case "down": {
        if (this.lastDirection === "up") {
          return this.move(this.lastDirection);
        }

        newPoint = {
          x,
          y:
            y >= CANVAS_HEIGHT - SQUARE_HEIGHT / 2
              ? SQUARE_HEIGHT / 2
              : y + SQUARE_HEIGHT,
        };
        this.lastDirection = "down";

        break;
      }
      case "up": {
        if (this.lastDirection === "down") {
          return this.move(this.lastDirection);
        }

        newPoint = {
          x,
          y:
            y <= SQUARE_HEIGHT / 2
              ? CANVAS_HEIGHT - SQUARE_HEIGHT / 2
              : y - SQUARE_HEIGHT,
        };

        this.lastDirection = "up";

        break;
      }
    }

    if (!newPoint) {
      return;
    }

    if (this.isPointInsideSnake(newPoint)) {
      this.ended = true;
      this.onEnd?.(this.points);

      return;
    }

    this.snakePositions.unshift(newPoint);
    const lastPoint = this.snakePositions.pop();

    // const snakeHead = this.snakePositions[0];

    if (
      this.foodCoordinate &&
      lastPoint &&
      (this.pointsOverlapping(newPoint, this.foodCoordinate) ||
        this.arePointsSame(newPoint, this.foodCoordinate))
    ) {
      this.foodCoordinate = this.getSafePoint();
      this.snakePositions.push(lastPoint);
      this.points++;
      this.onPoint?.(this.points);
    }

    this.drawSnake();
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

  private arePointsSame(point1: Coordinate, point2: Coordinate): boolean {
    return point1.x === point2.x && point1.y === point2.y;
  }

  private pointsOverlapping(point1: Coordinate, point2: Coordinate): boolean {
    if (this.arePointsSame(point1, point2)) {
      return true;
    }

    const rect1 = this.getVerticesFromCenter(point1);

    // Overlap condition is any one point of Rect1 is inside or on Rect2 boundary
    const yRangeStart = point2.y - SQUARE_HEIGHT / 2;
    const yRangeEnd = point2.y + SQUARE_HEIGHT / 2;

    const xRangeStart = point2.x - SQUARE_WIDTH / 2;
    const xRangeEnd = point2.x + SQUARE_WIDTH / 2;

    for (const point of rect1) {
      const { x, y } = point;
      if (point1.x === point2.x && y > yRangeStart && y < yRangeEnd) {
        return true;
      }

      if (point1.y === point2.y && x > xRangeStart && x < xRangeEnd) {
        return true;
      }

      if (
        x > xRangeStart &&
        x < xRangeEnd &&
        y > yRangeStart &&
        y < yRangeEnd
      ) {
        return true;
      }
    }

    return this.arePointsSame(point1, point2);
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
    this.onDraw?.();
  }

  start() {
    this.snakePositions = [];
    this.points = 0;
    this.ended = false;

    const snakeHead = this.getSafePoint();
    this.snakePositions.push(snakeHead);
    this.foodCoordinate = this.getSafePoint();

    this.drawSnake();

    addEventListener("keydown", (e) => {
      const key = e.key;

      if (Object.keys(KEY_TO_DIRECTION).includes(key)) {
        this.moveDirection = KEY_TO_DIRECTION[key];
      }
    });

    setInterval(() => {
      if (!this.ended) this.move(this.moveDirection);
    }, 500);
  }
}
