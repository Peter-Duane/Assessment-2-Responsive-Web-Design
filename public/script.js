const menuImg = document.getElementById("menu_img");
const menuImg2 = document.getElementById("menu_img2")
const menu = document.getElementById("menu");

menuImg.addEventListener("click", () => { //if the user clicks the menu button, it activates the animation and opens the menu
  menu.classList.toggle("open"); //opens menu
  menuImg.classList.add("menu-active"); //triggers menu img animation
  menuImg2.classList.add("menu-active"); //triggers another animation inside menu
});

menuImg2.addEventListener("click", () => {
  menu.classList.remove("open"); //closes menu
  menuImg.classList.remove("menu-active");
  menuImg2.classList.remove("menu-active");
});

document.getElementById("menu_tasks").onclick = () => {
  menu.classList.remove("open"); //whenever user clicks a button, it closes the menu
  menuImg.classList.remove("menu-active");
  menuImg2.classList.remove("menu-active");
};

document.getElementById("menu_finished").onclick = () => {
  menu.classList.remove("open");
  menuImg.classList.remove("menu-active");
  menuImg2.classList.remove("menu-active");
};

document.getElementById("menu_login").onclick = () => {
  menu.classList.remove("open");
  menuImg.classList.remove("menu-active");
  menuImg2.classList.remove("menu-active");
};

const noTask = document.getElementById("no_task"); 
const schedule = document.getElementById("schedule");
const addTask = document.getElementById("add_task");
const addMoreTask = document.getElementById("add_more_task");

const popup = document.createElement("div"); 
popup.style.position = "fixed";
popup.style.inset = "0";
popup.style.background = "rgba(0,0,0,0.4)";
popup.style.display = "none";
popup.style.justifyContent = "center";
popup.style.alignItems = "center";
popup.style.zIndex = "10";// for the popup for new tasks

popup.innerHTML = `
  <div class="popup-box">
    <h3 class="popup-title" style="justify-self:center;">Add Task</h3>

    <input type="text" id="popup_task_text" placeholder="What are we doing :)" />

    <div class="popup-datetime">
      <input type="date" id="popup_task_date" />
      <input type="time" id="popup_task_time" />
    </div>

    <div class="popup-actions">
      <button id="popup_save">Save</button>
      <button id="popup_cancel">Cancel</button>
    </div>
  </div>
`; //this is the working html for the function that pops up whenever we add a task to the planner

document.body.appendChild(popup); //

// popup DOM elements
const popupTaskText = document.getElementById("popup_task_text");
const popupTaskDate = document.getElementById("popup_task_date");
const popupTaskTime = document.getElementById("popup_task_time");
const popupSave = document.getElementById("popup_save");
const popupCancel = document.getElementById("popup_cancel");

function createTask(text = "", date = "", time = "", id = null) { // a fuction to create a task
  const task = document.createElement("div"); //creates a container
  task.className = "task"; //container name

  // delete/checkmark button
  const deleteBtn = document.createElement("img");
  deleteBtn.src = "img/remove.png";
  deleteBtn.className = "task-delete";

  deleteBtn.onclick = async () => { //when the button is clicked, it checks if the id exists in the server, remove its UI
    if (id) await fetch(`/tasks/${id}`, {method:"DELETE"}); //await helps by letting a request finish first before running the next lines
    task.remove(); // task gets removed
    updateEmptyState(); // check if there's no task in the UI
  };

  //text input for the user
  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.value = text;
  textInput.className = "task-text";

  //date and time 
  const meta = document.createElement("div"); //creates a container for the date and time input
  meta.className = "task-meta";

  const dateInput = document.createElement("input"); //date input
  dateInput.type = "date";
  dateInput.value = date; 

  const timeInput = document.createElement("input"); //time input
  timeInput.type = "time";
  timeInput.value = time;

  meta.append(dateInput, timeInput); //append what the user selected
  task.append(deleteBtn, textInput, meta); //append the responses to the task container
  schedule.appendChild(task); //append the task container to the schedule container

  textInput.readOnly = true; //disables the user from interacting to any of these
  dateInput.disabled = true;
  timeInput.disabled = true;
}

function updateEmptyState() { //checks the app state if there's a task in the UI
  const hasTasks = schedule.children.length > 0; //if theres a single task, recognize it

  if (hasTasks) { //if the variable is true, then;
    noTask.style.display = "none"; //dont show the "notask screen"
    schedule.style.display = "block"; //schedule display changes from none to block
    addMoreTask.style.display = "block"; //finally shows up as the first "let's plan disappears"
  } 
  
  else { //however is theres no task at all
    noTask.style.display = "flex"; //display the no task screen
    schedule.style.display = "none"; //dont show schedule container
    addMoreTask.style.display = "none"; 
  }
}


async function saveTaskToServer(text, date = "", time = "") {// Save new task to server
  try {
    const res = await fetch("/tasks", { //send request to server
      method: "POST", //tells the server that a new task will be made
      headers: { "Content-Type": "application/json" }, //body of request is JSON
      body: JSON.stringify({ text, date, time }) // converts the inputs into JSON string so that the server can read it
    });
    const data = await res.json(); //reads the response from the server and converts it into a Javascript object
    return data.id; // MongoDB _id
  } catch (err) { // get notified if an error occurs
    console.error("Failed to save task:", err);
  }
}

function openPopup() { //renews the popup and removes previous inputs
  popup.style.display = "flex";
  popupTaskText.value = ""; //blank input areas
  popupTaskDate.value = "";
  popupTaskTime.value = "";
  popupTaskText.focus(); //automatically gets ready to be written on
}
popupCancel.addEventListener("click", () => popup.style.display = "none"); //if the user clicks cancel, it just removes the pop up

// Event listeners
addTask.addEventListener("click", () => { //adds the first task
  noTask.style.display = "none"; 
  schedule.style.display = "block";
  addMoreTask.style.display = "block";
  openPopup(); //pop up activates
  updateEmptyState(); //check if there's a task in UI
});

addMoreTask.addEventListener("click", openPopup); //the button that shows up (+) also adds activates the pop up

popupSave.addEventListener("click", async () => { //checks if the pop up isnt empty
  const text = popupTaskText.value.trim(); // trim removes the extra spaces
  const date = popupTaskDate.value;
  const time = popupTaskTime.value;

  if (!text) return alert("Please enter a task"); // if it is empty, notify the user
  const id = await saveTaskToServer(text, date, time);   // save new task to server

  createTask(text, date, time, id); //creates the task in the UI
  updateEmptyState();
  popup.style.display = "none"; //pop up disappears
});

// load tasks on refresh
async function loadTasks() { 
  try {
    const res = await fetch("/tasks");// sends a GET request from the server for all tasks
    const tasks = await res.json(); // converts server response into javascript array  

    tasks.forEach(t => createTask(t.text, t.date, t.time, t._id)); // loops through each of them and displays them in the UI
    updateEmptyState();
  } catch (err) { //inform any error
    console.error("Failed to load tasks:", err);
  }
}

window.addEventListener("DOMContentLoaded", loadTasks); //loads tasks
