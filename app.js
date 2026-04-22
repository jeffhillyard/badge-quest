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

function updateSkillProgress(skill, progress) {
  const total = skill.levels.reduce((s, l) => s + l.requirements.length, 0);
  const done = skill.levels.reduce(
    (s, l) =>
      s + l.requirements.filter((_, i) => progress[reqKey(skill.id, l.level, i)]).length,
    0
  );
  const fill = document.getElementById(`pb-${skill.id}`);
  if (fill) fill.style.width = `${total > 0 ? Math.round((done / total) * 100) : 0}%`;
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

    // Header — always visible, description readable without expanding
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
        <div class="skill-progress-bar">
          <div class="skill-progress-fill" id="pb-${skill.id}" style="width:0%"></div>
        </div>
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

      // Level header — collapsed by default
      const levelHeader = document.createElement("div");
      levelHeader.className = "level-header";
      levelHeader.setAttribute("role", "button");
      levelHeader.setAttribute("aria-expanded", "false");
      levelHeader.innerHTML = `
        <span class="level-label">Level ${level.level}</span>
        <span class="level-chevron" id="lchev-${skill.id}-${level.level}">▸</span>
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
          updateSkillProgress(skill, progress);
        });

        levelBody.appendChild(row);
      });

      // Toggle level expand/collapse
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

    // Toggle skill expand/collapse
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

    updateSkillProgress(skill, progress);
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
