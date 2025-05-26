let currentStage = "stage1";
let totalKcal = 0;
let todayDate = new Date().toISOString().slice(0, 10);
const taskList = document.getElementById("task-list");
const kcalCounter = document.getElementById("kcal-counter");

function renderStageButtons() {
  const container = document.getElementById("stage-controls");
  container.innerHTML = "";
  ["stage1", "stage2", "stage3"].forEach(stage => {
    const btn = document.createElement("button");
    btn.innerText = stage.toUpperCase();
    btn.onclick = () => {
      currentStage = stage;
      renderTasks();
    };
    container.appendChild(btn);
  });
}

function getTodayDayIndex() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = Math.floor((now - start) / 86400000);
  return diff;
}

function renderTasks() {
  taskList.innerHTML = "";
  totalKcal = 0;
  const stageData = trainingSchedule[currentStage];
  const index = Math.min(stageData.length - 1, getTodayDayIndex() % stageData.length);
  const todayData = stageData[index];

  todayData.tasks.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "card";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.onchange = () => {
      if (input.checked) totalKcal += item.kcal;
      else totalKcal -= item.kcal;
      kcalCounter.innerText = "已消耗热量：" + totalKcal + " kcal";
    };
    const label = document.createElement("label");
    label.appendChild(input);
    label.appendChild(document.createTextNode(item.name + `（≈${item.kcal} kcal）`));
    div.appendChild(label);
    taskList.appendChild(div);
  });
}

function saveToday() {
  const stored = JSON.parse(localStorage.getItem("trainingLog") || "{}");
  stored[todayDate] = {
    kcal: totalKcal,
    stage: currentStage
  };
  localStorage.setItem("trainingLog", JSON.stringify(stored));
  alert("✅ 今日训练已保存！");
  renderCalendar();
  renderWeeklyProgress();
}

function renderWeeklyProgress() {
  const canvas = document.getElementById("progress-ring");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 200, 200);

  const stored = JSON.parse(localStorage.getItem("trainingLog") || "{}");
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  let done = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    if (stored[key]) done++;
  }

  const percent = done / 7;
  const radius = 80;
  const center = 100;

  // background circle
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 14;
  ctx.stroke();

  // progress arc
  ctx.beginPath();
  ctx.arc(center, center, radius, -Math.PI / 2, (2 * Math.PI * percent) - Math.PI / 2);
  ctx.strokeStyle = "#d4ff00";
  ctx.lineWidth = 14;
  ctx.stroke();

  document.getElementById("weekly-count").innerText = `${done} / 7 天`;
}

function renderCalendar() {
  const stored = JSON.parse(localStorage.getItem("trainingLog") || "{}");
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  for (let i = 0; i < 90; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    const d = new Date(new Date().getFullYear(), 0, 1 + i);
    const dateStr = d.toISOString().slice(0, 10);

    if (stored[dateStr]) cell.classList.add("done");
    else if (d < new Date()) cell.classList.add("missed");

    if (dateStr === todayDate) cell.classList.add("today");

    const label = document.createElement("span");
    label.innerText = d.getDate();
    cell.appendChild(label);
    grid.appendChild(cell);
  }
}

function generateSummary() {
  const lines = Array.from(document.querySelectorAll("#task-list input")).map((input, i) => {
    const text = input.parentElement.textContent;
    const checked = input.checked ? "✓" : "✗";
    return `${checked} ${text}`;
  });
  const summary = `【训练打卡总结 - ${todayDate}】
完成情况：${lines.filter(x => x.startsWith("✓")).length} / ${lines.length}
总热量：${totalKcal} kcal
------------------------
${lines.join("\n")}
`;
  navigator.clipboard.writeText(summary);
  alert("📋 总结已复制，可粘贴到备忘录！");
}

window.onload = () => {
  renderStageButtons();
  renderTasks();
  renderCalendar();
  renderWeeklyProgress();
};
