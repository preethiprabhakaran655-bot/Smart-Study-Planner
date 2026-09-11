
/* =========================================
   SMARTSTUDY JAVASCRIPT
========================================= */


/* =========================================
   DATA
========================================= */

let tasks =
    JSON.parse(
        localStorage.getItem("smartStudyTasks")
    ) || [];


let studyHistory =
    JSON.parse(
        localStorage.getItem("studyHistory")
    ) || [];


/* =========================================
   DOM ELEMENTS
========================================= */

const taskForm =
    document.getElementById("taskForm");

const taskList =
    document.getElementById("taskList");

const searchInput =
    document.getElementById("searchInput");

const filter =
    document.getElementById("filter");

const totalTasks =
    document.getElementById("totalTasks");

const completedTasks =
    document.getElementById("completedTasks");

const studyMinutes =
    document.getElementById("studyMinutes");

const progressBar =
    document.getElementById("progressBar");

const progressPercent =
    document.getElementById("progressPercent");

const completionRate =
    document.getElementById("completionRate");

const goalNumber =
    document.getElementById("goalNumber");

const goalPercent =
    document.getElementById("goalPercent");

const goalCircle =
    document.querySelector(".goal-circle");

const focusTask =
    document.getElementById("focusTask");

const suggestion =
    document.getElementById("suggestion");

const achievement =
    document.getElementById("achievement");

const streakElement =
    document.getElementById("streak");


/* =========================================
   BOOTSTRAP MODALS
========================================= */

const taskModal =
    new bootstrap.Modal(
        document.getElementById("taskModal")
    );

const motivationModal =
    new bootstrap.Modal(
        document.getElementById("motivationModal")
    );


/* =========================================
   OPEN TASK MODAL
========================================= */

document
    .querySelector(".hero-buttons .main-btn")
    .addEventListener("click", function() {

        taskModal.show();

    });


/* =========================================
   ADD TASK
========================================= */

taskForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const subject =
            document.getElementById(
                "subjectInput"
            ).value.trim();


        const topic =
            document.getElementById(
                "topicInput"
            ).value.trim();


        const duration =
            Number(
                document.getElementById(
                    "durationInput"
                ).value
            );


        const dueDate =
            document.getElementById(
                "dateInput"
            ).value;


        const task = {

            id:
                Date.now(),

            subject:
                subject,

            topic:
                topic,

            duration:
                duration,

            dueDate:
                dueDate,

            completed:
                false,

            createdAt:
                new Date().toISOString()

        };


        tasks.push(task);


        saveData();

        renderTasks();

        taskForm.reset();


        document.getElementById(
            "durationInput"
        ).value = 25;


        taskModal.hide();


        showToast(
            "Study task added successfully! 🎉"
        );

    }
);


/* =========================================
   SAVE DATA
========================================= */

function saveData() {

    localStorage.setItem(
        "smartStudyTasks",
        JSON.stringify(tasks)
    );

    localStorage.setItem(
        "studyHistory",
        JSON.stringify(studyHistory)
    );
}


/* =========================================
   RENDER TASKS
========================================= */

function renderTasks() {

    taskList.innerHTML = "";


    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const filterValue =
        filter.value;


    let filtered =
        tasks.filter(function(task) {

            const matchesSearch =
                task.subject
                    .toLowerCase()
                    .includes(search)
                ||
                task.topic
                    .toLowerCase()
                    .includes(search);


            const matchesFilter =
                filterValue === "all"
                ||
                (
                    filterValue === "pending"
                    &&
                    !task.completed
                )
                ||
                (
                    filterValue === "completed"
                    &&
                    task.completed
                );


            return (
                matchesSearch &&
                matchesFilter
            );

        });


    if (filtered.length === 0) {

        taskList.innerHTML = `

            <div class="text-center py-5">

                <div style="font-size:45px">
                    📚
                </div>

                <h6 class="mt-3">
                    No tasks found
                </h6>

                <p class="muted-text small">
                    Add a study task to get started.
                </p>

            </div>

        `;

        updateDashboard();

        return;
    }


    filtered.forEach(function(task) {

        const index =
            tasks.findIndex(
                item => item.id === task.id
            );


        const card =
            document.createElement("div");


        card.className =
            "task-item " +
            (
                task.completed
                    ? "completed"
                    : ""
            );


        card.innerHTML = `

            <div class="task-info">

                <span class="subject-badge">
                    ${escapeHTML(task.subject)}
                </span>

                <div class="topic">
                    ${escapeHTML(task.topic)}
                </div>

                <div class="task-meta">

                    <i class="fa-regular fa-clock"></i>

                    ${task.duration} minutes

                    &nbsp; • &nbsp;

                    <i class="fa-regular fa-calendar"></i>

                    Due:
                    ${formatDate(task.dueDate)}

                </div>

            </div>


            <div class="task-actions">

                <button
                    class="btn btn-sm btn-outline-primary"
                    onclick="focusOnTask(${index})"
                    title="Focus"
                >

                    <i class="fa-solid fa-bullseye"></i>

                </button>


                <button
                    class="btn btn-sm
                    ${
                        task.completed
                            ? "btn-outline-warning"
                            : "btn-outline-success"
                    }"
                    onclick="toggleComplete(${index})"
                    title="Complete"
                >

                    <i class="fa-solid
                    ${
                        task.completed
                            ? "fa-rotate-left"
                            : "fa-check"
                    }"></i>

                </button>


                <button
                    class="btn btn-sm btn-outline-danger"
                    onclick="deleteTask(${index})"
                    title="Delete"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>
        `;


        taskList.appendChild(card);

    });


    updateDashboard();
}


/* =========================================
   TOGGLE COMPLETE
========================================= */

function toggleComplete(index) {

    tasks[index].completed =
        !tasks[index].completed;


    if (tasks[index].completed) {

        recordStudyDay();

        showToast(
            "Task completed! Excellent work! 🎉"
        );

    } else {

        showToast(
            "Task marked as pending."
        );

    }


    saveData();

    renderTasks();
}


/* =========================================
   DELETE TASK
========================================= */

function deleteTask(index) {

    const task =
        tasks[index];


    const confirmed =
        confirm(
            `Delete "${task.topic}"?`
        );


    if (!confirmed) {
        return;
    }


    tasks.splice(index, 1);


    saveData();

    renderTasks();


    showToast(
        "Task deleted."
    );
}


/* =========================================
   FOCUS TASK
========================================= */

function focusOnTask(index) {

    const task =
        tasks[index];


    focusTask.textContent =
        `🎯 Focusing: ${task.subject} - ${task.topic}`;


    resetTimer();


    minutes =
        Number(task.duration);


    seconds = 0;


    updateTimerDisplay();


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    showToast(
        "Focus task selected 🎯"
    );
}


/* =========================================
   DASHBOARD
========================================= */

function updateDashboard() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const minutesTotal =
        tasks.reduce(
            function(total, task) {

                return total +
                    Number(task.duration);

            },
            0
        );


    let percentage = 0;


    if (total > 0) {

        percentage =
            Math.round(
                (completed / total) * 100
            );

    }


    totalTasks.textContent =
        total;


    completedTasks.textContent =
        completed;


    studyMinutes.textContent =
        minutesTotal;


    progressPercent.textContent =
        percentage + "%";


    completionRate.textContent =
        percentage + "% Done";


    progressBar.style.width =
        percentage + "%";


    goalNumber.textContent =
        percentage + "%";


    goalPercent.textContent =
        percentage + "%";


    updateGoalCircle(
        percentage
    );


    updateSuggestion();

    updateAchievement();

    updateStreak();
}


/* =========================================
   GOAL CIRCLE
========================================= */

function updateGoalCircle(percent) {

    const degree =
        percent * 3.6;


    goalCircle.style.background =
        `
        conic-gradient(
            #8b5cf6 0deg,
            #a855f7 ${degree}deg,
            rgba(255,255,255,0.08)
            ${degree}deg
        )
        `;
}


/* =========================================
   SMART SUGGESTION
========================================= */

function updateSuggestion() {

    if (tasks.length === 0) {

        suggestion.textContent =
            "Add your first study task to get a personalized suggestion.";

        return;
    }


    const pending =
        tasks.filter(
            task => !task.completed
        );


    if (pending.length === 0) {

        suggestion.textContent =
            "Amazing! All your study tasks are completed. 🎉";

        return;
    }


    const urgent =
        [...pending]
            .sort(
                (a,b) =>
                    new Date(a.dueDate)
                    -
                    new Date(b.dueDate)
            )[0];


    const today =
        new Date();


    const due =
        new Date(urgent.dueDate);


    const difference =
        Math.ceil(
            (
                due - today
            )
            /
            (
                1000 *
                60 *
                60 *
                24
            )
        );


    if (difference <= 1) {

        suggestion.textContent =
            `${urgent.subject} - ${urgent.topic} is due very soon. Try focusing on it for ${urgent.duration} minutes today.`;

    } else {

        suggestion.textContent =
            `Your next priority is ${urgent.subject} - ${urgent.topic}. Schedule ${urgent.duration} minutes for it.`;

    }
}


/* =========================================
   ACHIEVEMENT
========================================= */

function updateAchievement() {

    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    let title;
    let description;
    let emoji;


    if (completed === 0) {

        title =
            "Getting Started";

        description =
            "Complete your first task.";

        emoji =
            "🌱";

    } else if (completed < 3) {

        title =
            "First Steps";

        description =
            "Complete 3 tasks to level up.";

        emoji =
            "⭐";

    } else if (completed < 5) {

        title =
            "Focused Learner";

        description =
            "You're building a great study habit.";

        emoji =
            "🔥";

    } else if (completed < 10) {

        title =
            "Study Champion";

        description =
            "Keep your momentum going!";

        emoji =
            "🏆";

    } else {

        title =
            "Study Master";

        description =
            "You've completed 10+ tasks!";

        emoji =
            "👑";
    }


    achievement.innerHTML = `

        <div class="achievement-icon">
            ${emoji}
        </div>

        <div>

            <strong>
                ${title}
            </strong>

            <p>
                ${description}
            </p>

        </div>
    `;
}


/* =========================================
   STREAK
========================================= */

function recordStudyDay() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    if (
        !studyHistory.includes(today)
    ) {

        studyHistory.push(today);

        saveData();
    }
}


function updateStreak() {

    if (studyHistory.length === 0) {

        streakElement.textContent =
            "1";

        return;
    }


    const sorted =
        [...studyHistory]
            .sort()
            .reverse();


    let streak = 1;


    for (
        let i = 0;
        i < sorted.length - 1;
        i++
    ) {

        const current =
            new Date(sorted[i]);


        const previous =
            new Date(sorted[i + 1]);


        const difference =
            (
                current -
                previous
            )
            /
            (
                1000 *
                60 *
                60 *
                24
            );


        if (difference === 1) {

            streak++;

        } else {

            break;
        }
    }


    streakElement.textContent =
        streak;
}


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener(
    "input",
    renderTasks
);


filter.addEventListener(
    "change",
    renderTasks
);


/* =========================================
   POMODORO TIMER
========================================= */

let minutes = 25;

let seconds = 0;

let timerInterval = null;

let timerRunning = false;


const timerDisplay =
    document.getElementById(
        "timer"
    );


const startBtn =
    document.getElementById(
        "startBtn"
    );


const resetBtn =
    document.getElementById(
        "resetBtn"
    );


startBtn.addEventListener(
    "click",
    function() {

        if (timerRunning) {

            pauseTimer();

        } else {

            startTimer();

        }

    }
);


function startTimer() {

    timerRunning = true;


    startBtn.innerHTML =
        `
        <i class="fa-solid fa-pause"></i>
        Pause
        `;


    timerInterval =
        setInterval(
            function() {

                if (
                    seconds === 0
                ) {

                    if (
                        minutes === 0
                    ) {

                        finishTimer();

                        return;
                    }


                    minutes--;

                    seconds = 59;

                } else {

                    seconds--;
                }


                updateTimerDisplay();

            },
            1000
        );
}


function pauseTimer() {

    clearInterval(
        timerInterval
    );


    timerRunning = false;


    startBtn.innerHTML =
        `
        <i class="fa-solid fa-play"></i>
        Start
        `;
}


function finishTimer() {

    clearInterval(
        timerInterval
    );


    timerRunning = false;


    startBtn.innerHTML =
        `
        <i class="fa-solid fa-play"></i>
        Start
        `;


    alert(
        "🎉 Focus session completed! Great work!"
    );


    recordStudyDay();
}


function resetTimer() {

    clearInterval(
        timerInterval
    );


    timerRunning = false;


    minutes = 25;

    seconds = 0;


    updateTimerDisplay();


    startBtn.innerHTML =
        `
        <i class="fa-solid fa-play"></i>
        Start
        `;
}


function updateTimerDisplay() {

    const m =
        String(minutes)
            .padStart(2, "0");


    const s =
        String(seconds)
            .padStart(2, "0");


    timerDisplay.textContent =
        `${m}:${s}`;
}


/* =========================================
   THEME
========================================= */

const themeBtn =
    document.getElementById(
        "themeBtn"
    );


themeBtn.addEventListener(
    "click",
    function() {

        document.body
            .classList
            .toggle("light");


        const icon =
            themeBtn.querySelector(
                "i"
            );


        if (
            document.body
                .classList
                .contains("light")
        ) {

            icon.className =
                "fa-solid fa-sun";

            localStorage.setItem(
                "studyTheme",
                "light"
            );

        } else {

            icon.className =
                "fa-solid fa-moon";

            localStorage.setItem(
                "studyTheme",
                "dark"
            );
        }

    }
);


/* =========================================
   LOAD THEME
========================================= */

if (
    localStorage.getItem(
        "studyTheme"
    ) === "light"
) {

    document.body
        .classList
        .add("light");


    themeBtn
        .querySelector("i")
        .className =
        "fa-solid fa-sun";
}


/* =========================================
   MOTIVATIONAL QUOTES
========================================= */

const quotes = [

    "Success is the sum of small efforts repeated every day.",

    "Don't study harder. Study smarter.",

    "Your future self will thank you for studying today.",

    "Progress may be slow, but quitting won't make it faster.",

    "One focused hour is better than three distracted hours.",

    "Believe in yourself and keep moving forward.",

    "Consistency beats motivation.",

    "Every expert was once a beginner.",

    "Your goals are worth the effort.",

    "Small progress is still progress."

];


function showMotivation() {

    const random =
        Math.floor(
            Math.random()
            *
            quotes.length
        );


    document.getElementById(
        "motivationText"
    ).textContent =
        `"${quotes[random]}"`;


    motivationModal.show();
}


document.getElementById(
    "quoteBtn"
).addEventListener(
    "click",
    showMotivation
);
/* =========================================
   NOTIFICATION
========================================= */

const notificationBtn =
    document.getElementById(
        "notificationBtn"
    );


if (notificationBtn) {

    notificationBtn.addEventListener(
        "click",
        function() {

            showToast(
                "🔔 You're all set! Keep studying and stay focused."
            );

        }
    );

}


/* =========================================
   TOAST MESSAGE
========================================= */

function showToast(message) {

    let toastContainer =
        document.getElementById(
            "toastContainer"
        );


    if (!toastContainer) {

        toastContainer =
            document.createElement("div");


        toastContainer.id =
            "toastContainer";


        toastContainer.style.position =
            "fixed";


        toastContainer.style.top =
            "20px";


        toastContainer.style.right =
            "20px";


        toastContainer.style.zIndex =
            "9999";


        document.body.appendChild(
            toastContainer
        );
    }


    const toast =
        document.createElement("div");


    toast.className =
        "alert alert-success shadow";


    toast.style.minWidth =
        "280px";


    toast.style.marginBottom =
        "10px";


    toast.textContent =
        message;


    toastContainer.appendChild(
        toast
    );


    setTimeout(
        function() {

            toast.remove();

        },
        3000
    );
}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(dateString) {

    if (!dateString) {

        return "No date";
    }


    const date =
        new Date(dateString);


    if (isNaN(date.getTime())) {

        return dateString;
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================
   INITIAL LOAD
========================================= */

renderTasks();

updateTimerDisplay();

updateDashboard();