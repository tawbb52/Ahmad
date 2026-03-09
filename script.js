const appsGrid = document.getElementById("appsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const categoryTags = document.getElementById("categoryTags");
const modal = document.getElementById("appModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

const appsCount = document.getElementById("appsCount");
const downloadsCount = document.getElementById("downloadsCount");
const categoriesCount = document.getElementById("categoriesCount");

let activeCategory = "all";

function getCategories() {
  return [...new Set(apps.map(app => app.category))];
}

function updateStats() {
  appsCount.textContent = apps.length;
  downloadsCount.textContent = apps.reduce((sum, app) => sum + app.downloads, 0);
  categoriesCount.textContent = getCategories().length;
}

function renderCategoryOptions() {
  const categories = getCategories();

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const allTag = document.createElement("button");
  allTag.className = "category-tag active";
  allTag.textContent = "الكل";
  allTag.addEventListener("click", () => {
    activeCategory = "all";
    categoryFilter.value = "all";
    setActiveTag("الكل");
    renderApps();
  });
  categoryTags.appendChild(allTag);

  categories.forEach(category => {
    const btn = document.createElement("button");
    btn.className = "category-tag";
    btn.textContent = category;
    btn.addEventListener("click", () => {
      activeCategory = category;
      categoryFilter.value = category;
      setActiveTag(category);
      renderApps();
    });
    categoryTags.appendChild(btn);
  });
}

function setActiveTag(text) {
  document.querySelectorAll(".category-tag").forEach(tag => {
    tag.classList.toggle("active", tag.textContent === text);
  });
}

function filteredApps() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  return apps.filter(app => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm) ||
      app.shortDescription.toLowerCase().includes(searchTerm);

    const matchesCategory =
      activeCategory === "all" ? true : app.category === activeCategory;

    return matchesSearch && matchesCategory;
  });
}

function renderApps() {
  const list = filteredApps();
  appsGrid.innerHTML = "";

  if (!list.length) {
    appsGrid.innerHTML = `<p>لا توجد تطبيقات مطابقة.</p>`;
    return;
  }

  list.forEach(app => {
    const card = document.createElement("div");
    card.className = "app-card";
    card.innerHTML = `
      <div class="app-image">
        <img src="${app.image}" alt="${app.name}" loading="lazy">
      </div>
      <div class="app-body">
        <h3 class="app-title">${app.name}</h3>
        <p class="app-desc">${app.shortDescription}</p>
        <div class="app-meta">
          <div>الإصدار: ${app.version}</div>
          <div>الحجم: ${app.size}</div>
          <div>التحميلات: ${app.downloads}</div>
          <div>التصنيف: ${app.category}</div>
        </div>
        <button class="app-btn" data-id="${app.id}">عرض التفاصيل</button>
      </div>
    `;
    appsGrid.appendChild(card);
  });

  document.querySelectorAll(".app-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const appId = Number(btn.dataset.id);
      openModal(appId);
    });
  });
}

function openModal(appId) {
  const app = apps.find(item => item.id === appId);
  if (!app) return;

  modalBody.innerHTML = `
    <div class="modal-header">
      <img src="${app.image}" alt="${app.name}">
      <div>
        <h2>${app.name}</h2>
        <p>التصنيف: ${app.category}</p>
        <p>الإصدار: ${app.version}</p>
        <p>الحجم: ${app.size}</p>
      </div>
    </div>
    <p>${app.description}</p>
    <p><strong>عدد التحميلات:</strong> ${app.downloads}</p>
    <a class="download-link" href="${app.downloadUrl}" target="_blank">رابط التحميل</a>
  `;

  modal.classList.remove("hidden");
}

searchInput.addEventListener("input", renderApps);

categoryFilter.addEventListener("change", (e) => {
  activeCategory = e.target.value;
  setActiveTag(activeCategory === "all" ? "الكل" : activeCategory);
  renderApps();
});

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

updateStats();
renderCategoryOptions();
renderApps();
