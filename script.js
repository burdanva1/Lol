const taskMinutes = [15, 20, 40, 50, 60, 90, 120, 150, 200, 220, 240];

const display = document.querySelector('#stopwatchDisplay');
const startPauseBtn = document.querySelector('#startPauseBtn');
const resetBtn = document.querySelector('#resetBtn');
const autoComplete = document.querySelector('#autoComplete');
const statusCells = [...document.querySelectorAll('.status-cell')];

let elapsedMs = 0;
let startedAt = 0;
let frameId = 0;
let isRunning = false;

function formatElapsed(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

function getCurrentElapsed() {
  if (!isRunning) {
    return elapsedMs;
  }

  return elapsedMs + Date.now() - startedAt;
}

function setTaskDone(index, done) {
  const cell = statusCells[index];
  const checkbox = cell?.querySelector('input');

  if (!cell || !checkbox) {
    return;
  }

  checkbox.checked = done;
  cell.classList.toggle('done', done);
}

function syncAutoCompletedTasks(currentElapsedMs) {
  if (!autoComplete.checked) {
    return;
  }

  const elapsedMinutes = currentElapsedMs / 60000;

  taskMinutes.forEach((minutes, index) => {
    if (elapsedMinutes >= minutes) {
      setTaskDone(index, true);
    }
  });
}

function render() {
  const currentElapsed = getCurrentElapsed();
  display.value = formatElapsed(currentElapsed);
  syncAutoCompletedTasks(currentElapsed);

  if (isRunning) {
    frameId = requestAnimationFrame(render);
  }
}

function startStopwatch() {
  isRunning = true;
  startedAt = Date.now();
  startPauseBtn.textContent = 'Пауза';
  startPauseBtn.classList.remove('primary');
  render();
}

function pauseStopwatch() {
  elapsedMs = getCurrentElapsed();
  isRunning = false;
  cancelAnimationFrame(frameId);
  startPauseBtn.textContent = 'Старт';
  startPauseBtn.classList.add('primary');
  render();
}

function resetStopwatch() {
  elapsedMs = 0;
  startedAt = Date.now();

  if (isRunning) {
    cancelAnimationFrame(frameId);
  }

  render();
}

function buildCheckboxes() {
  statusCells.forEach((cell, index) => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'status-checkbox';
    checkbox.setAttribute('aria-label', `Отметить строку ${index + 2} выполненной`);

    checkbox.addEventListener('change', () => {
      cell.classList.toggle('done', checkbox.checked);
    });

    cell.append(checkbox);
  });
}

startPauseBtn.addEventListener('click', () => {
  if (isRunning) {
    pauseStopwatch();
  } else {
    startStopwatch();
  }
});

resetBtn.addEventListener('click', resetStopwatch);
autoComplete.addEventListener('change', () => syncAutoCompletedTasks(getCurrentElapsed()));

buildCheckboxes();
render();
