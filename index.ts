interface Cell {
  rowNum: number;
  colNum: number;
  parentGrid: any;
  parentSize: number;
  visited: boolean;
  walls: {
    topWall: boolean;
    rightWall: boolean;
    bottomWall: boolean;
    leftWall: boolean;
  };
}

const maze = document.querySelector('.maze') as HTMLCanvasElement;
const mazeCtx = maze.getContext('2d') as CanvasRenderingContext2D;
let current: Cell;

class Maze {
  size: number;
  rows: number;
  columns: number;
  grid: Cell[][];
  stack: Cell[];

  constructor(size: number, rows: number, columns: number) {
    this.size = size;
    this.rows = rows;
    this.columns = columns;
    this.grid = [];
    this.stack = [];
  }

  setup() {
    for (let r = 0; r < this.rows; r++) {
      let row: Cell[] = [];
      for (let c = 0; c < this.columns; c++) {
        let cell: Cell = new Cell(r, c, this.grid, this.size);
        row.push(cell);
      }
      this.grid.push(row);
    }
    current = this.grid[0][0];
  }

  draw() {
    maze.width = this.size;
    maze.height = this.size;
    maze.style.background = 'black';

    current.visited = true;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns; c++) {
        let grid = this.grid;
        grid[r][c].show(this.size, this.rows, this.columns);
      }
    }

    let nextCell = current.checkNeighbours();

    if (nextCell) {
      nextCell.visited = true;
      this.stack.push(current);
      current.highlight(this.rows, this.columns);
      current.removeWalls(current, nextCell);
      current = nextCell;
    } else if (this.stack.length > 0) {
      let cell = this.stack.pop();
      current = cell!;
      current.highlight(this.rows, this.columns);
    }

    if (this.stack.length === 0) {
      return;
    }

    window.requestAnimationFrame(() => {
      this.draw();
    });
  }
}

class Cell {
  rowNum: number;
  colNum: number;
  parentGrid: any;
  parentSize: number;
  visited: boolean;
  walls: {
    topWall: boolean;
    rightWall: boolean;
    bottomWall: boolean;
    leftWall: boolean;
  };
  constructor(
    rowNum: number,
    colNum: number,
    parentGrid: Cell[][],
    parentSize: number
  ) {
    this.rowNum = rowNum;
    this.colNum = colNum;
    this.parentGrid = parentGrid;
    this.parentSize = parentSize;
    this.visited = false;
    this.walls = {
      topWall: true,
      rightWall: true,
      bottomWall: true,
      leftWall: true,
    };
  }

  drawTopWall(
    x: number,
    y: number,
    size: number,
    columns: number,
    rows: number
  ) {
    mazeCtx.beginPath();
    mazeCtx.moveTo(x, y);
    mazeCtx.lineTo(x + size / columns, y);
    mazeCtx.stroke();
  }
  drawBottomWall(
    x: number,
    y: number,
    size: number,
    columns: number,
    rows: number
  ) {
    mazeCtx.beginPath();
    mazeCtx.moveTo(x, y + size / rows);
    mazeCtx.lineTo(x + size / columns, y + size / rows);
    mazeCtx.stroke();
  }
  drawRightWall(
    x: number,
    y: number,
    size: number,
    columns: number,
    rows: number
  ) {
    mazeCtx.beginPath();
    mazeCtx.moveTo(x + size / columns, y);
    mazeCtx.lineTo(x + size / columns, y + size / rows);
    mazeCtx.stroke();
  }
  drawLeftWall(
    x: number,
    y: number,
    size: number,
    columns: number,
    rows: number
  ) {
    mazeCtx.beginPath();
    mazeCtx.moveTo(x, y);
    mazeCtx.lineTo(x, y + size / rows);
    mazeCtx.stroke();
  }

  highlight(rows: number, columns: number) {
    let x = (this.colNum * this.parentSize) / columns + 1;
    let y = (this.rowNum * this.parentSize) / rows + 1;

    mazeCtx.fillStyle = 'purple';
    mazeCtx.fillRect(
      x,
      y,
      this.parentSize / columns - 3,
      this.parentSize / columns - 3
    );
  }

  removeWalls(cell1: Cell, cell2: Cell) {
    let x = cell1.colNum - cell2.colNum;

    if (x === 1) {
      cell1.walls.leftWall = false;
      cell2.walls.rightWall = false;
    } else if (x === -1) {
      cell1.walls.rightWall = false;
      cell2.walls.leftWall = false;
    }

    let y = cell1.rowNum - cell2.rowNum;

    if (y === 1) {
      cell1.walls.topWall = false;
      cell2.walls.bottomWall = false;
    } else if (y === -1) {
      cell1.walls.bottomWall = false;
      cell2.walls.topWall = false;
    }
  }

  show(size: number, rows: number, columns: number) {
    let x = (this.colNum * size) / columns;
    let y = (this.rowNum * size) / rows;

    mazeCtx.strokeStyle = 'white';
    mazeCtx.fillStyle = 'black';
    mazeCtx.lineWidth = 2;

    this.walls.topWall && this.drawTopWall(x, y, size, columns, rows);
    this.walls.bottomWall && this.drawBottomWall(x, y, size, columns, rows);
    this.walls.rightWall && this.drawRightWall(x, y, size, columns, rows);
    this.walls.leftWall && this.drawLeftWall(x, y, size, columns, rows);

    this.visited &&
      mazeCtx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
  }

  checkNeighbours() {
    let grid: Cell[][] = this.parentGrid;
    let row = this.rowNum;
    let col = this.colNum;
    let neighbours: Cell[] = [];

    let topNeighbour = row !== 0 ? grid[row - 1][col] : undefined;
    let bottomNeighbour =
      row !== grid.length - 1 ? grid[row + 1][col] : undefined;
    let leftNeighbour = col !== 0 ? grid[row][col - 1] : undefined;
    let rightNeighbour =
      col !== grid.length - 1 ? grid[row][col + 1] : undefined;

    if (topNeighbour && !topNeighbour.visited) neighbours.push(topNeighbour);
    if (bottomNeighbour && !bottomNeighbour.visited)
      neighbours.push(bottomNeighbour);
    if (leftNeighbour && !leftNeighbour.visited) neighbours.push(leftNeighbour);
    if (rightNeighbour && !rightNeighbour.visited)
      neighbours.push(rightNeighbour);

    if (neighbours.length !== 0) {
      let randomNum = Math.floor(Math.random() * neighbours.length);
      return neighbours[randomNum];
    } else {
      return undefined;
    }
  }
}

/* let newMaze = new Maze(500, 30, 30);
newMaze.setup();
newMaze.draw(); */
