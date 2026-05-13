const tasks = [15, 20, 40, 50, 60, 90, 120, 150, 200, 220, 240];

const display = document.querySelector("#stopwatchDisplay");
const startPauseBtn = document.querySelector("#startPauseBtn");
const resetBtn = document.querySelector("#resetBtn");
const autoComplete = document.querySelector("#autoComplete");
const taskList = document.querySelector("#taskList");
const completedCounter = document.querySelector("#completedCounter");

let elapsedMs = 0;
let startedAt = 0;
let frameId = 0;
let isRunning = false;
let taskRows = [];

function formatElapsed(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0",
  );
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function getCurrentElapsed() {
  if (!isRunning) {
    return elapsedMs;
  }

  return elapsedMs + Date.now() - startedAt;
}

function updateCounter() {
  const completed = taskRows.filter(({ checkbox }) => checkbox.checked).length;
  completedCounter.textContent = `${completed}/${tasks.length}`;
}

function setTaskDone(index, done) {
  const task = taskRows[index];

  if (!task) {
    return;
  }

  task.checkbox.checked = done;
  task.row.classList.toggle("done", done);
  updateCounter();
}

function syncAutoCompletedTasks(currentElapsedMs) {
  if (!autoComplete.checked) {
    return;
  }

  const elapsedMinutes = currentElapsedMs / 60000;

  tasks.forEach((minutes, index) => {
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
  startPauseBtn.textContent = "Пауза";
  startPauseBtn.classList.remove("primary");
  startPauseBtn.classList.add("secondary");
  render();
}

function pauseStopwatch() {
  elapsedMs = getCurrentElapsed();
  isRunning = false;
  cancelAnimationFrame(frameId);
  startPauseBtn.textContent = "Старт";
  startPauseBtn.classList.add("primary");
  startPauseBtn.classList.remove("secondary");
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

function createTaskRow(minutes, index) {
  const row = document.createElement("article");
  row.className = "task-row";

  const status = document.createElement("label");
  status.className = "task-status";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "status-checkbox";
  checkbox.setAttribute(
    "aria-label",
    `Отметить задачу на ${minutes} минут выполненной`,
  );

  const label = document.createElement("span");
  label.className = "status-label";
  label.textContent = `Этап ${index + 1}`;

  const time = document.createElement("span");
  time.className = "time-pill";
  time.textContent = minutes;
  time.setAttribute("aria-label", `${minutes} минут`);

  checkbox.addEventListener("change", () => {
    row.classList.toggle("done", checkbox.checked);
    updateCounter();
  });

  status.append(checkbox, label);
  row.append(status, time);
  taskList.append(row);

  return { row, checkbox };
}

function buildTaskList() {
  taskRows = tasks.map(createTaskRow);
  updateCounter();
}

startPauseBtn.addEventListener("click", () => {
  if (isRunning) {
    pauseStopwatch();
  } else {
    startStopwatch();
  }
});

resetBtn.addEventListener("click", resetStopwatch);
autoComplete.addEventListener("change", () =>
  syncAutoCompletedTasks(getCurrentElapsed()),
);

buildTaskList();
render();
