const taskInput = document.getElementById("task-title");
const dateInput = document.getElementById("task-date");
const timeInput = document.getElementById("task-time");
const addTaskBtn = document.getElementById("add-task");
const taskList = document.getElementById("task-list");
const reminderSound = document.getElementById("reminder-sound");
const completedCount = document.getElementById("completed-count");
const pendingCount = document.getElementById("pending-count");

// Load saved tasks on startup
window.onload = () => {
  loadTasks();
  checkReminders(); // Start the reminder check loop
};

addTaskBtn.addEventListener("click", () => {
  const title = taskInput.value.trim();
  const date = dateInput.value;
  const time = timeInput.value;

  if (!title || !date || !time) {
    alert("Please fill out title, date, and time.");
    return;
  }

  const task = {
    id: Date.now(),
    title,
    date,
    time,
    completed: false
  };

  addTaskToList(task);
  saveTask(task);
  taskInput.value = "";
  dateInput.value = "";
  timeInput.value = "";
});

function addTaskToList(task) {
  const li = document.createElement("li");
  li.dataset.id = task.id;
  li.className = task.completed ? "completed" : "";

  const info = document.createElement("span");
  info.innerHTML = `<strong>${task.title}</strong><br>${task.date} @ ${task.time}`;
  info.style.cursor = "pointer";

  // Toggle completed on click
  info.addEventListener("click", () => {
    task.completed = !task.completed;
    li.classList.toggle("completed");
    updateTask(task);
    updateStats();
  });

  const delBtn = document.createElement("button");
  delBtn.textContent = "❌";
  delBtn.onclick = () => {
    li.remove();
    deleteTask(task.id);
    updateStats();
  };

  li.appendChild(info);
  li.appendChild(delBtn);
  taskList.appendChild(li);
  updateStats();
}

// Local Storage Helpers
function saveTask(task) {
  const tasks = getTasks();
  tasks.push(task);
  localStorage.setItem("smartTasks", JSON.stringify(tasks));
}

function getTasks() {
  return JSON.parse(localStorage.getItem("smartTasks")) || [];
}

function deleteTask(id) {
  const tasks = getTasks().filter(task => task.id !== id);
  localStorage.setItem("smartTasks", JSON.stringify(tasks));
}

function updateTask(updatedTask) {
  const tasks = getTasks().map(task =>
    task.id === updatedTask.id ? updatedTask : task
  );
  localStorage.setItem("smartTasks", JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = getTasks();
  tasks.forEach(task => addTaskToList(task));
  updateStats();
}

function updateStats() {
  const tasks = getTasks();
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.length - completed;
  completedCount.textContent = completed;
  pendingCount.textContent = pending;
}

// ⏰ Check every minute for reminders
function checkReminders() {
  setInterval(() => {
    const now = new Date();
    const tasks = getTasks();

    tasks.forEach(task => {
      const taskDateTime = new Date(`${task.date}T${task.time}`);
      const diff = taskDateTime - now;

      if (
        diff > 0 &&
        diff <= 60000 && // 1 minute window
        !task.notified &&
        !task.completed
      ) {
        // Show Notification
        if (Notification.permission === "granted") {
          new Notification("⏰ Task Reminder", {
            body: `${task.title} is due now.`,
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification("⏰ Task Reminder", {
                body: `${task.title} is due now.`,
              });
            }
          });
        }

        // Play reminder sound
        reminderSound.play();

        // Flag as notified to avoid duplicate alerts
        task.notified = true;
        updateTask(task);
      }
    });
  }, 30000); // Check every 30 seconds
}
