// BASE SIMULATION

// HTML Elements
const canvas = document.querySelector("canvas");
const ctx = canvas ? canvas.getContext("2d") : null;
const speedSlider = document.getElementById("speed-slider");
const densitySlider = document.getElementById("density-slider");

// Validate that canvas, context, and sliders are present
if (!canvas || !ctx || !speedSlider || !densitySlider) {
  throw new Error(
    "Required elements (canvas, ctx, or sliders) are not available in the DOM.",
  );
}

// Board
canvas.width = 1280;
canvas.height = 720;
const RESOLUTION = 4;
const COLUMNS = Math.floor(canvas.width / RESOLUTION);
const ROWS = Math.floor(canvas.height / RESOLUTION);

// Create 2-dimensional array and fill it randomly with 0s and 1s
function createGrid(columns, rows, density) {
  return Array.from(
    { length: columns },
    () => Array.from({ length: rows }, () => (Math.random() < density ? 1 : 0)),
  );
}

// Init the grid
let grid = createGrid(COLUMNS, ROWS, Number(densitySlider.value) / 100);

// Draw the grid on canvas
function renderGrid(grid) {
  if (!ctx) return;
  grid.forEach((column, col) => {
    column.forEach((cell, row) => {
      ctx.beginPath();
      ctx.rect(col * RESOLUTION, row * RESOLUTION, RESOLUTION, RESOLUTION);
      switch (cell) {
        case 0:
          ctx.fillStyle = "#ffffff";
          break;
        case 1:
          ctx.fillStyle = "#000000";
          break;
        case 2:
          ctx.fillStyle = "#DFDFDF";
          break;
        case 3:
          ctx.fillStyle = "#F5F5F5";
          break;
        default:
          ctx.fillStyle = "#FFFFFF";
          break;
      }
      ctx.fill();
    });
  });
}

// Check simulation state and apply rules
function checkSimulationState(grid) {
  const nextGrid = grid.map((arr) => [...arr]); // Copy grid

  for (let col = 0; col < grid.length; col++) {
    for (let row = 0; row < grid[col].length; row++) {
      const cell = grid[col][row];
      const neighborCount = countNeighbors(grid, col, row);

      // Apply rules of the simulation
      if (cell === 1 && neighborCount < 2) {
        nextGrid[col][row] = 2; // Underpopulation
      } else if (cell === 1 && (neighborCount === 2 || neighborCount === 3)) {
        nextGrid[col][row] = 1; // Lives on
      } else if (cell === 1 && neighborCount > 3) {
        nextGrid[col][row] = 2; // Overpopulation
      } else if (cell === 0 && neighborCount === 3) {
        nextGrid[col][row] = 1; // Reproduction
      } else if (cell === 2) {
        nextGrid[col][row] = 3;
      } else if (cell === 3) {
        nextGrid[col][row] = 0;
      }
    }
  }

  return nextGrid;
}

// Count neighbors of a given cell
function countNeighbors(grid, col, row) {
  let neighbors = 0;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue; // Skip the cell itself

      const x = col + i;
      const y = row + j;

      if (x >= 0 && y >= 0 && x < COLUMNS && y < ROWS) {
        neighbors += grid[x][y];
      }
    }
  }

  return neighbors;
}

// Advance to the next generation
function nextGeneration() {
  grid = checkSimulationState(grid);
  renderGrid(grid);
}

// Control the game loop
let run;

function startGameLoop() {
  const speed = Number(speedSlider.value);
  clearInterval(run);
  run = setInterval(nextGeneration, 1000 / speed);
}

function pauseGameLoop() {
  clearInterval(run);
}

function resetGameLoop() {
  const density = Number(densitySlider.value) / 100; // Convert percentage to decimal
  grid = createGrid(COLUMNS, ROWS, density);
  renderGrid(grid);
  clearInterval(run);
}

// Handle slider input to adjust the simulation speed
speedSlider.oninput = startGameLoop;
densitySlider.oninput = resetGameLoop;

// Initial rendering
renderGrid(grid);
