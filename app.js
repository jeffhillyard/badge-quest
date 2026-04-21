// BadgeQuest — app.js
// Loads OAS data and renders interactive badge tracker with progress saving

const STORAGE_KEY = "badgequest-progress";

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

function renderStats(progress, totalReqs) {
  const done = Object.values(progress).filter(Boolean).length;
  const pct = totalReqs > 0 ? Math.round((done / totalReqs) * 100) : 0;
  const statsEl = document.getElementById("bq-stats");
  if (!statsEl) return;
  statsEl.innerHTML = `
    <div class="stat-box">
      <div class="stat-num">${done}</div>
      <div class="stat-lbl">Requirements done</div>
    </div>
    <div class="stat-box">
      <div class="stat-num">${totalReqs}</div>
      <div class="stat-lbl">Total requirements</div>
    </div>
    <div class="stat-box">
      <div class="stat-num">${pct}%</div>
      <div class="stat-lbl">Overall progress</div>
    </div>
  `;
}

function updateSkillProgress(skill, progress) {
  const total = skill.levels.reduce((s, l) => s + l.requirements.length, 0);
  const done = skill.levels.reduce(
    (s, l) =>
      s + l.requirements.filter((_, i) => progress[reqKey(skill.id, l.level, i)]).length,
    0
  );
  const fill = document.getElementById(`pb-${skill.id}`);
  const label = document.getElementById(`pl-${skill.id}`);
  if (fill) fill.style.width = `${total > 0 ? Math.round((done / total) * 100) : 0}%`;
  if (label) label.textContent = `${done} / ${total}`;
}

function renderApp(data) {
  const main = document.querySelector("main");
  main.innerHTML = "";
  const progress = loadProgress();

  let totalReqs = 0;
  data.skills.forEach((skill) => {
    skill.levels.forEach((level) => {
      totalReqs += level.requirements.length;
    });
  });

  const statsRow = document.createElement("div");
  statsRow.id = "bq-stats";
  statsRow.className = "stats-row";
  main.appendChild(statsRow);

  const sectionLabel = document.createElement("div");
  sectionLabel.className = "section-pill";
  sectionLabel.textContent = data.category;
  main.appendChild(sectionLabel);

  data.skills.forEach((skill) => {
    const totalSkillReqs = skill.levels.reduce((s, l) => s + l.requirements.length, 0);

    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "card-header";
    header.setAttribute("role", "button");
    header.setAttribute("aria-expanded", "true");
    header.innerHTML = `
      <div class="card-title-group">
        <span class="card-title">${skill.name}</span>
        <span class="req-count">${totalSkillReqs} requirements</span>
      </div>
      <div class="card-meta">
        <div class="skill-progress-wrap">
          <div class="skill-progress-bar">
            <div class="skill-progress-fill" id="pb-${skill.id}" style="width:0%"></div>
          </div>
          <span class="skill-progress-label" id="pl-${skill.id}">0 / ${totalSkillReqs}</span>
        </div>
        <span class="chevron" id="chev-${skill.id}">▾</span>
      </div>
    `;

    const body = document.createElement("div");
    body.className = "card-body";
    body.id = `body-${skill.id}`;

    skill.levels.forEach((level) => {
      const levelBlock = document.createElement("div");
      levelBlock.className = "level-block";

      const levelLabel = document.createElement("div");
      levelLabel.className = "level-label";
      levelLabel.textContent = `Level ${level.level}`;
      levelBlock.appendChild(levelLabel);

      level.requirements.forEach((req, i) => {
        const key = reqKey(skill.id, level.level, i);
        const isChecked = !!progress[key];

        const row = document.createElement("div");
        row.className = "req-row";

        const checkbox = document.createElement("div");
        checkbox.className = `checkbox${isChecked ? " checked" : ""}`;
        checkbox.id = `cb-${key}`;
        checkbox.innerHTML = `<svg class="checkmark" viewBox="0 0 10 7" aria-hidden="true">
          <path d="M1 3.5L3.5 6L9 1" fill="none" stroke="white" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

        const text = document.createElement("span");
        text.className = `req-text${isChecked ? " done" : ""}`;
        text.id = `rt-${key}`;
        text.textContent = req;

        row.appendChild(checkbox);
        row.appendChild(text);

        row.addEventListener("click", () => {
          progress[key] = !progress[key];
          saveProgress(progress);
          checkbox.classList.toggle("checked", progress[key]);
          text.classList.toggle("done", progress[key]);
          updateSkillProgress(skill, progress);
          renderStats(progress, totalReqs);
        });

        levelBlock.appendChild(row);
      });

      body.appendChild(levelBlock);
    });

    header.addEventListener("click", () => {
      const isOpen = body.style.display !== "none";
      body.style.display = isOpen ? "none" : "block";
      const chevron = document.getElementById(`chev-${skill.id}`);
      if (chevron) chevron.style.transform = isOpen ? "rotate(-90deg)" : "";
      header.setAttribute("aria-expanded", String(!isOpen));
    });

    card.appendChild(header);
    card.appendChild(body);
    main.appendChild(card);

    updateSkillProgress(skill, progress);
  });

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

  renderStats(progress, totalReqs);
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
