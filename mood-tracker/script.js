const STORAGE_KEY = "moodEntries"; // LocalStorage key name (where our entries are stored)

let entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; // Load saved entries OR start empty

const moodPicker = document.getElementById("moodPicker"); // Div that contains mood buttons
const moodButtons = document.querySelectorAll(".mood-picker button"); // All mood buttons (for clearing selection)
const activitiesInput = document.getElementById("activities");
const saveBtn = document.getElementById("save-btn");
const filterBar= document.getElementById("filter");
const entriesList = document.getElementById("entries-list");
const statsDiv = document.getElementById("stats");
const charCount = document.getElementById("char-count");

let selectedMood = ""; // Current selected mood (example: "happy")
let activeFilter = ""; // Current active filter ("" means All)

// mood emojis mapping
const moodEmoji = {
    happy: "😊",
    good: "🙂",
    neutral: "😐",
    sad: "😔",
    stressed: "😓"
};

// DISABLE SAVE AT START
saveBtn.disabled = true;

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); // Convert array to JSON string first
}

function setActiveFilterButton() { // Highlight which filter button is active
    const buttons = filterBar.querySelectorAll("button"); // Get all filter buttons
    buttons.forEach((btn) => { // Loop through buttons
        const mood = btn.dataset.filter; // Read data-filter from button
        btn.classList.toggle("active", mood == activeFilter); // Add/remove "active" class
    });
}

// MOOD SELECT
moodPicker.addEventListener("click", (event) => {
    const btn = event.target.closest("button"); // Find clicked button
    if (!btn) return; // If click not on button, stop

    moodButtons.forEach((b) => b.classList.remove("selected")); // Clear previous selectio
    btn.classList.add("selected"); // Highlight clicked mood
    selectedMood = btn.dataset.mood; // Store mood string from data-mood

    // enable save when mood selected
    saveBtn.disabled = false;
});

// CHARACTER COUNTER
activitiesInput.addEventListener("input", () => {
    const length = activitiesInput.value.length;
    charCount.textContent = length;

    // warning color
    if (length > 250) {
        charCount.style.color = "red";
    } else {
        charCount.style.color = "";
    }
});


// SAVE ENTRY
saveBtn.addEventListener("click", () => { // When Save button is clicked
    const rawText = activitiesInput.value; // Get textarea text

    const activities = rawText // Start cleaning + splitting text
        .trim()  /* removes empty spaces from beginning/end */
        .split(/\r?\n/)     /* Arranges rows into an array */
        .map((line) => line.trim())
        .filter(Boolean)    /* Removes empty rows */
        .slice(0, 3); /* Allows max 3 activities */
    
    if (!selectedMood) { // Validation: mood required
        alert("Please select a mood first.")
        return;
    }

    if (activities.length === 0) { // Validation: at least one activity required
        alert("Please write at least one activity."); // Show message
        return;
    }

    const entry = { // Create one entry object to store
        id: Date.now(), // Unique ID (timestamp)
        date: new Date().toLocaleDateString(), // Human-friendly date
        mood: selectedMood,
        activities: activities,
    };

    entries.push(entry); // Add entry to array
    saveToStorage(); // Save updated array

    activitiesInput.value = ""; // Clear textarea
    charCount.textContent = "0"; // reset counter

    moodButtons.forEach((b) => b.classList.remove("selected")); // Clear selection highlight
    selectedMood = ""; // Reset selectedMood

    saveBtn.disabled = true;

    renderEntries(activeFilter); // Re-render list using current filter
    updateStats(); // Recompute stats
});


// FILTER 
filterBar.addEventListener("click", (event) => { // One listener for filter buttons
    const btn = event.target.closest("button"); // Find clicked button
    if (!btn) return; // If not a button, stop

    activeFilter = btn.dataset.filter; // Read filter mood ("" means All
    setActiveFilterButton(); // Highlight active filter
    renderEntries(activeFilter); // Re-render with filter
});


// DELETE
entriesList.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action='delete']");
    if (!btn) return // If click not delete, stop

    const id = Number(btn.dataset.id); // Convert id string to number
    const ok = confirm("Delete this entry?"); // Confirm deletion
    if (!ok) return; // If cancelled, stop

    entries = entries.filter((e) => e.id != id);
    saveToStorage(); // Save updated list

    renderEntries(activeFilter); // re-render list
    updateStats(); // Update stats
}); // End delete handler


// RENDER ENTRIES
function renderEntries(filterMood) { // Render entries to the page (optionally filtered)
    entriesList.innerHTML = ""; // Clear old content

    const filtered = filterMood 
        ? entries.filter((e) => e.mood === filterMood)
        : entries; // Apply filter if needed
    
    const sorted = [...filtered].sort((a, b) => b.id - a.id); // Sort newest first

    if (sorted.length === 0) { // If nothing to show
        if (entries.length === 0) {
            entriesList.innerHTML = "<p>No entries yet. Start tracking your mood!</p>"; // Show empty message
        } else {
            entriesList.innerHTML= "<p>No entries match this filter.</p>";
        }
        return;
    } // End empty state

    sorted.forEach((entry) => { // Create HTML for each entry
        const div = document.createElement("div"); // Make a new div
        div.className = "entry" // Apply CSS class
    
        const activityHtml = entry.activities
            .map((a) => `• ${a}`)
            .join("<br>"); // Convert activities to HTML lines

        div.innerHTML = `
            <div>
                <strong>
                    ${entry.date}: ${moodEmoji[entry.mood]} ${entry.mood.toUpperCase()}
                </strong><br>
                ${activityHtml}
            </div>
            <button type="button" data-action="delete" data-id="${entry.id}">Delete</button>
        `; // Build entry row HTML

        entriesList.appendChild(div) // Add entry row to the page
    }); // End loop
} // End renderEntries


// STATISTICS
function updateStats() { // Compute + render basic statistics
    if (entries.length === 0) { // If no entries exist
        statsDiv.innerHTML = "<p>No entries yet. Add your first mood!</p>";
        return; // Stop
    } // End empty check

    const moodCount = {}; // Object to count moods

    entries.forEach((e) => { // Count each entry's mood
        moodCount[e.mood] = (moodCount[e.mood] || 0) +1; // Increment mood counter
    }); // End loop

    let mostCommon = ""; // Will store the mood with hightest count
    let highest = 0; // WIll store the highest number

    for (const mood in moodCount) { // Loop through counted moods
        if (moodCount[mood] > highest) { // If this mood is more frequent
            highest = moodCount[mood]; // Update highest
            mostCommon = mood; // Update mostCommon mood
        }
    }

    statsDiv.innerHTML = `
        <p>Total entries: ${entries.length}</p>
        <p>You have felt <strong>${mostCommon}</strong> ${highest} times.</p>
    `; // Render stats HTML
} // End updateStats

setActiveFilterButton(); // Hightlight "All" at start
renderEntries(activeFilter); // Render saved entries on load
updateStats(); // Render stats on load