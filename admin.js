const STORAGE_KEY = "ahmad_ipa_apps";

const appForm = document.getElementById("appForm");
const appId = document.getElementById("appId");
const nameInput = document.getElementById("name");
const categoryInput = document.getElementById("category");
const versionInput = document.getElementById("version");
const sizeInput = document.getElementById("size");
const downloadsInput = document.getElementById("downloads");
const imageInput = document.getElementById("image");
const shortDescriptionInput = document.getElementById("shortDescription");
const descriptionInput = document.getElementById("description");
const downloadUrlInput = document.getElementById("downloadUrl");
const appsTableBody = document.getElementById("appsTableBody");
const searchAdmin = document.getElementById("searchAdmin");
const formTitle = document.getElementById("formTitle");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const resetBtn = document.getElementById("resetBtn");

function seedAppsIfNeeded() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  }
}

function getApps() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveApps(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function resetForm() {
  appForm.reset();
  appId.value = "";
  downloadsInput.value = 0;
  formTitle.textContent = "إضافة تطبيق جديد";
}

function renderTable() {
  const keyword = searchAdmin.value.trim().toLowerCase();
  const list = getApps().filter(app =>
    app.name.toLowerCase().includes(keyword) ||
    app.category.toLowerCase().includes(keyword)
  );

  appsTableBody.innerHTML = "";

  if (!list.length) {
    appsTableBody.innerHTML = `
      <tr>
        <td colspan="7">لا توجد نتائج.</td>
      </tr>
    `;
    return;
  }

  list.forEach(app => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${app.image}" alt="${app.name}"></td>
      <td>${app.name}</td>
      <td>${app.category}</td>
      <td>${app.version}</td>
      <td>${app.size}</td>
      <td>${app.downloads}</td>
      <td>
        <div class="row-actions">
          <button class="edit-btn" data-id="${app.id}">تعديل</button>
          <button class="delete-btn" data-id="${app.id}">حذف</button>
        </div>
      </td>
    `;
    appsTableBody.appendChild(tr);
  });

  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => startEdit(Number(btn.dataset.id)));
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteApp(Number(btn.dataset.id)));
  });
}

function startEdit(id) {
  const app = getApps().find(item => item.id === id);
  if (!app) return;

  appId.value = app.id;
  nameInput.value = app.name;
  categoryInput.value = app.category;
  versionInput.value = app.version;
  sizeInput.value = app.size;
  downloadsInput.value = app.downloads;
  imageInput.value = app.image;
  shortDescriptionInput.value = app.shortDescription;
  descriptionInput.value = app.description;
  downloadUrlInput.value = app.downloadUrl;

  formTitle.textContent = "تعديل التطبيق";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteApp(id) {
  const confirmed = confirm("هل تريد حذف هذا التطبيق؟");
  if (!confirmed) return;

  const filtered = getApps().filter(app => app.id !== id);
  saveApps(filtered);
  renderTable();
  resetForm();
}

appForm.addEventListener("submit", e => {
  e.preventDefault();

  const currentApps = getApps();
  const editingId = Number(appId.value);

  const payload = {
    id: editingId || Date.now(),
    name: nameInput.value.trim(),
    category: categoryInput.value.trim(),
    version: versionInput.value.trim(),
    size: sizeInput.value.trim(),
    downloads: Number(downloadsInput.value),
    image: imageInput.value.trim(),
    shortDescription: shortDescriptionInput.value.trim(),
    description: descriptionInput.value.trim(),
    downloadUrl: downloadUrlInput.value.trim()
  };

  if (editingId) {
    const updated = currentApps.map(app => app.id === editingId ? payload : app);
    saveApps(updated);
  } else {
    currentApps.unshift(payload);
    saveApps(currentApps);
  }

  resetForm();
  renderTable();
});

cancelEditBtn.addEventListener("click", resetForm);

searchAdmin.addEventListener("input", renderTable);

resetBtn.addEventListener("click", () => {
  const confirmed = confirm("سيتم استرجاع البيانات الافتراضية وحذف كل التعديلات المحلية. هل أنت متأكد؟");
  if (!confirmed) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  resetForm();
  renderTable();
});

seedAppsIfNeeded();
renderTable();
