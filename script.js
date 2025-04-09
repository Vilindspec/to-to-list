// Features Recap:
// 25-minute focus timer + 5-minute break mode

// Progress bar visualization

// Sound notifications when time is up

// Local storage to save user settings

// 📜 Pseudo Code:
// Initialize Variables:

// Set default time for work mode (25 min) and break mode (5 min).

// Create variables for current time, interval ID, and mode (work/break).

// Create the UI Elements:

// Display timer countdown.

// Add Start, Pause, Reset buttons.

// Show progress bar to visualize time left.

// Add a toggle button for work/break mode.

// Handle Start Button Click:

// Check if the timer is running.

// If not, start countdown using setInterval().

// Update UI every second to show remaining time.

// Handle Pause Button Click:

// Stop the countdown using clearInterval().

// Handle Reset Button Click:

// Reset timer to default values (25 min or 5 min).

// Clear interval and update UI.

// Switch Between Work and Break Mode:

// When timer reaches 0, check the current mode.

// If in work mode, switch to break mode (5 min).

// If in break mode, switch back to work mode (25 min).

// Play a sound notification when mode switches.

// Save Timer State in Local Storage:

// Store remaining time and current mode.

// When user refreshes, retrieve and resume from last state.


// Pomodoro Variables
let timer;
let timeLeft = 25 * 60;
let isRunning = false;
let mode = "work"; // work or break

// DOM Elements
const timerDisplay = document.getElementById("timer");
const progressBar = document.getElementById("progress");
const modeDisplay = document.getElementById("mode");
const alarmSound = document.getElementById("alarm");
const usernameInput = document.getElementById("username");
const audioPlayer = document.getElementById("audio-player");
const musicSelect = document.getElementById("music-select");

// Music Track List
const musicTracks = [
  { name: "A Bird", url: "./music/a-bird.mp3" },
  { name: "Bird Flight", url: "./music/bird-flight.mp3" },
  { name: "Cinematic Ascent", url: "./music/cenematic-ascent.mp3" },
  { name: "Investigation", url: "./music/nature-investigation.mp3" },
  { name: "Faraway", url: "./music/faraway-bird.mp3" },
  { name: "Meet The Rain", url: "./music/meet-the-rain.mp3" },
  { name: "Smooth", url: "./music/smooth.mp3" },
  { name: "Voice Of Nature", url: "./music/voice of nature.mp3" },
  { name: "Water Fountain", url: "./music/Water-fountain.mp3" }
];

// Populate Music Dropdown
musicTracks.forEach(track => {
  let option = document.createElement("option");
  option.value = track.url;
  option.textContent = track.name;
  musicSelect.appendChild(option);
});

// Handle Music Selection
musicSelect.addEventListener("change", function () {
  if (this.value) {
    audioPlayer.src = this.value;
  }
});

// Music Controls
document.getElementById("play-music").addEventListener("click", () => {
  if (audioPlayer.src) audioPlayer.play();
});

document.getElementById("pause-music").addEventListener("click", () => {
  audioPlayer.pause();
});

document.getElementById("stop-music").addEventListener("click", () => {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
});

// Update Timer Display
function updateDisplay() {
  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  const total = mode === "work" ? 25 * 60 : 5 * 60;
  progressBar.style.width = `${(timeLeft / total) * 100}%`;
}

// Speech Function
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = speechSynthesis.getVoices().find(v => v.name.includes("Female")) || null;
  speechSynthesis.speak(utterance);
}

// Start Timer
function startTimer() {
  if (!isRunning) {
    isRunning = true;
    const user = usernameInput.value || "User";
    speak(`${user}, your Pomodoro time starts now.`);

    timer = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        clearInterval(timer);
        isRunning = false;
        alarmSound.play();
        switchMode();
      }
    }, 1000);
  }
}

// Pause Timer
function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
}

// Reset Timer
function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  timeLeft = mode === "work" ? 25 * 60 : 5 * 60;
  updateDisplay();
}

// Switch Work/Break Mode
function switchMode() {
  mode = mode === "work" ? "break" : "work";
  timeLeft = mode === "work" ? 25 * 60 : 5 * 60;
  modeDisplay.textContent = mode === "work" ? "Work Mode" : "Break Mode";
  updateDisplay();
  const user = usernameInput.value || "User";
  speak(`${user}, time for ${mode === "work" ? "work" : "a break"}!`);
}

// Save to Local Storage
function saveState() {
  const state = {
    timeLeft,
    mode,
    isRunning
  };
  localStorage.setItem("pomodoroState", JSON.stringify(state));
}

// Load from Local Storage
function loadState() {
  const saved = localStorage.getItem("pomodoroState");
  if (saved) {
    const state = JSON.parse(saved);
    timeLeft = state.timeLeft;
    mode = state.mode;
    isRunning = false; // Don't auto-resume
    modeDisplay.textContent = mode === "work" ? "Work Mode" : "Break Mode";
    updateDisplay();
  }
}

// Event Listeners
document.getElementById("start").addEventListener("click", startTimer);
document.getElementById("pause").addEventListener("click", pauseTimer);
document.getElementById("reset").addEventListener("click", resetTimer);

// Update UI on load
window.onload = () => {
  loadState();
  updateDisplay();
};

// Save state when leaving the page
window.onbeforeunload = saveState;



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
