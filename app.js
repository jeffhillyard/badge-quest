// BadgeQuest — app.js

const STORAGE_KEY = "badgequest-progress";

const SKILL_DESCRIPTIONS = {
  "oas-aquatic": "Build water safety knowledge and swimming skills, from your first splash to advanced scuba diving and underwater navigation in open water.",
  "oas-camping": "Develop the skills to plan, prepare for, and lead camping experiences in all seasons and environments, from your first overnight to multi-day wilderness expeditions.",
  "oas-emergency": "Learn to keep yourself and others safe — from basic first aid and home safety to wilderness emergency response and mass casualty management.",
  "oas-paddling": "Explore Canada's waterways by canoe or kayak, building paddling technique, trip planning, and rescue skills from calm lakes to backcountry rivers.",
  "oas-sailing": "Learn to sail confidently from your first time on the water through racing, navigation, and earning instructor-level certification on the open water.",
  "oas-scoutcraft": "Master the traditional outdoor skills of Scouting — knots, fire, shelter, navigation, and wilderness living — from basic camp craft to advanced survival techniques.",
  "oas-trail": "Build confidence navigating the outdoors on foot, from day hikes to multi-night backcountry expeditions using maps, compasses, and GPS.",
  "oas-vertical": "Discover the vertical world through climbing and rappelling, progressing from your first wall to leading multi-pitch climbs on natural rock and ice.",
  "oas-winter": "Embrace the Canadian winter — learn to dress, travel, camp, and thrive in cold and snowy conditions, from your first winter hike to leading multi-day expeditions."
};

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function reqKey(skillId, level, index) {
  return `${skillId}-l${level}-${index}`;
}

// Update the progress bar for a single stage
function updateStageProgress(skill, level, progress) {
  const total = level.requirements.length;
  const done = level.requirements.filter(
    (_, i) => progress[reqKey(skill.id, level.level, i)]
  ).length;

  const fill = document.getElementById(`spb-fill-${skill.id}-${level.level}`);
  if (fill) fill.style.width = `${total > 0 ? Math.round((done / total) * 100) : 0}%`;

  const completeEl = document.getElementById(`lcomplete-${skill.id}-${level.level}`);
  if (completeEl) {
    completeEl.style.display = done === total ? "inline" : "none";
  }
}

function renderApp(data) {
  const main = document.querySelector("main");
  main.innerHTML = "";
  const progress = loadProgress();

  // Section pill
  const sectionLabel = document.createElement("div");
  sectionLabel.className = "section-pill";
  sectionLabel.textContent = data.category;
  main.appendChild(sectionLabel);

  data.skills.forEach((skill) => {

    const card = document.createElement("div");
    card.className = "card";

    // Header — always visible, no progress bar here anymore
    const header = document.createElement("div");
    header.className = "card-header";
    header.setAttribute("role", "button");
    header.setAttribute("aria-expanded", "false");

    const desc = SKILL_DESCRIPTIONS[skill.id] || "";

    header.innerHTML = `
      <div class="card-title-group">
        <div class="card-title-row">
          <span class="card-title">${skill.name}</span>
          <span class="chevron" id="chev-${skill.id}">▸</span>
        </div>
        <span class="card-desc">${desc}</span>
      </div>
    `;

    // Body — collapsed by default
    const body = document.createElement("div");
    body.className = "card-body";
    body.id = `body-${skill.id}`;
    body.style.display = "none";

    skill.levels.forEach((level) => {
      const levelBlock = document.createElement("div");
      levelBlock.className = "level-block";

      const isComplete = level.requirements.every(
        (_, i) => progress[reqKey(skill.id, level.level, i)]
      );
      const total = level.requirements.length;
      const done = level.requirements.filter(
        (_, i) => progress[reqKey(skill.id, level.level, i)]
      ).length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;

      const levelHeader = document.createElement("div");
      levelHeader.className = "level-header";
      levelHeader.setAttribute("role", "button");
      levelHeader.setAttribute("aria-expanded", "false");

      levelHeader.innerHTML = `
        <div class="level-header-left">
          <span class="level-label">Stage ${level.level}</span>
          <span class="level-complete" id="lcomplete-${skill.id}-${level.level}"
            style="display:${isComplete ? "inline" : "none"}">
            — Complete. Ready to be awarded.
          </span>
        </div>
        <div class="level-header-right">
          <div class="stage-progress-bar">
            <div class="stage-progress-fill" id="spb-fill-${skill.id}-${level.level}"
              style="width:${pct}%"></div>
          </div>
          <span class="level-chevron" id="lchev-${skill.id}-${level.level}">▸</span>
        </div>
      `;

      const levelBody = document.createElement("div");
      levelBody.className = "level-body";
      levelBody.id = `lbody-${skill.id}-${level.level}`;
      levelBody.style.display = "none";

      level.requirements.forEach((req, i) => {
        const key = reqKey(skill.id, level.level, i);
        const isChecked = !!progress[key];
        const reqNum = `${level.level}.${i + 1}`;

        const row = document.createElement("div");
        row.className = "req-row";

        const checkbox = document.createElement("div");
        checkbox.className = `checkbox${isChecked ? " checked" : ""}`;
        checkbox.id = `cb-${key}`;
        checkbox.innerHTML = `<svg class="checkmark" viewBox="0 0 10 7" aria-hidden="true">
          <path d="M1 3.5L3.5 6L9 1" fill="none" stroke="white" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

        const numLabel = document.createElement("span");
        numLabel.className = "req-num";
        numLabel.textContent = reqNum;

        const text = document.createElement("span");
        text.className = `req-text${isChecked ? " done" : ""}`;
        text.id = `rt-${key}`;
        text.textContent = req;

        row.appendChild(checkbox);
        row.appendChild(numLabel);
        row.appendChild(text);

        row.addEventListener("click", () => {
          progress[key] = !progress[key];
          saveProgress(progress);
          checkbox.classList.toggle("checked", progress[key]);
          text.classList.toggle("done", progress[key]);
          updateStageProgress(skill, level, progress);
        });

        levelBody.appendChild(row);
      });

      levelHeader.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = levelBody.style.display !== "none";
        levelBody.style.display = isOpen ? "none" : "block";
        const lchev = document.getElementById(`lchev-${skill.id}-${level.level}`);
        if (lchev) lchev.textContent = isOpen ? "▸" : "▾";
        levelHeader.setAttribute("aria-expanded", String(!isOpen));
      });

      levelBlock.appendChild(levelHeader);
      levelBlock.appendChild(levelBody);
      body.appendChild(levelBlock);
    });

    header.addEventListener("click", () => {
      const isOpen = body.style.display !== "none";
      body.style.display = isOpen ? "none" : "block";
      const chevron = document.getElementById(`chev-${skill.id}`);
      if (chevron) chevron.textContent = isOpen ? "▸" : "▾";
      header.setAttribute("aria-expanded", String(!isOpen));
    });

    card.appendChild(header);
    card.appendChild(body);
    main.appendChild(card);
  });

  // Reset button
  const resetWrap = document.createElement("div");
  resetWrap.className = "reset-wrap";
  const resetBtn = document.createElement("button");
  resetBtn.className = "reset-btn";
  resetBtn.textContent = "Reset all progress";
  resetBtn.addEventListener("click", () => {
    if (confirm("Reset all progress? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      renderApp(data);
    }
  });
  resetWrap.appendChild(resetBtn);
  main.appendChild(resetWrap);
}

fetch("data/oas.json")
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return response.json();
  })
  .then((data) => renderApp(data))
  .catch((error) => {
    console.error("Error loading OAS data:", error);
    const main = document.querySelector("main");
    main.innerHTML = `<p class="error-msg">Could not load badge data. Please check that data/oas.json exists.</p>`;
  });
