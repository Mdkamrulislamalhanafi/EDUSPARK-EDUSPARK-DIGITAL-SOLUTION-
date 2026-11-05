
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* =================================
   1. FIREBASE CONFIGURATION
================================= */

const firebaseConfig = {
  apiKey: "AIzaSyCIdw6nxSBxWVWy_033m332aDWaEPOo9fg",
  authDomain: "eduspark-7b651.firebaseapp.com",
  projectId: "eduspark-7b651",
  storageBucket: "eduspark-7b651.firebasestorage.app",
  messagingSenderId: "441514127228",
  appId: "1:441514127228:web:17bc8743e7cef475547ef9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* =================================
   2. GLOBAL SETTINGS
================================= */

let currentUser = null;
let institutionId = "";
let currentPage = "Dashboard";
let currentRecords = [];

const modules = {
  Students: {
    title: "শিক্ষার্থী ব্যবস্থাপনা",
    collection: "students",
    fields: [
      ["name", "শিক্ষার্থীর নাম", "text", true],
      ["fatherName", "পিতার নাম", "text", true],
      ["motherName", "মাতার নাম", "text", false],
      ["mobile", "মোবাইল নম্বর", "tel", false],
      ["className", "শ্রেণি", "text", true],
      ["roll", "রোল নম্বর", "text", false],
      ["address", "ঠিকানা", "textarea", false]
    ]
  },

  Teachers: {
    title: "শিক্ষক ব্যবস্থাপনা",
    collection: "teachers",
    fields: [
      ["name", "শিক্ষকের নাম", "text", true],
      ["mobile", "মোবাইল নম্বর", "tel", true],
      ["email", "ইমেইল", "email", false],
      ["subject", "বিষয়", "text", false],
      ["joiningDate", "যোগদানের তারিখ", "date", false],
      ["address", "ঠিকানা", "textarea", false]
    ]
  },

  Staff: {
    title: "কর্মচারী ব্যবস্থাপনা",
    collection: "staff",
    fields: [
      ["name", "কর্মচারীর নাম", "text", true],
      ["mobile", "মোবাইল নম্বর", "tel", true],
      ["designation", "পদবি", "text", true],
      ["salary", "বেতন", "number", false],
      ["joiningDate", "যোগদানের তারিখ", "date", false]
    ]
  },

  Admission: {
    title: "ভর্তি ব্যবস্থাপনা",
    collection: "admissions",
    fields: [
      ["name", "শিক্ষার্থীর নাম", "text", true],
      ["fatherName", "পিতার নাম", "text", true],
      ["motherName", "মাতার নাম", "text", false],
      ["mobile", "মোবাইল নম্বর", "tel", true],
      ["department", "বিভাগ", "text", true],
      ["className", "ভর্তির শ্রেণি", "text", true],
      ["dateOfBirth", "জন্ম তারিখ", "date", false],
      ["address", "ঠিকানা", "textarea", false]
    ]
  },

  Attendance: {
    title: "উপস্থিতি ব্যবস্থাপনা",
    collection: "attendance",
    fields: [
      ["studentName", "শিক্ষার্থীর নাম", "text", true],
      ["className", "শ্রেণি", "text", true],
      ["date", "তারিখ", "date", true],
      ["status", "উপস্থিতির অবস্থা (Present/Absent)", "text", true]
    ]
  },

  Classes: {
    title: "শ্রেণি ব্যবস্থাপনা",
    collection: "classes",
    fields: [
      ["className", "শ্রেণির নাম", "text", true],
      ["department", "বিভাগ", "text", true],
      ["teacher", "শ্রেণি শিক্ষক", "text", false]
    ]
  },

  Results: {
    title: "পরীক্ষার ফলাফল",
    collection: "results",
    fields: [
      ["studentName", "শিক্ষার্থীর নাম", "text", true],
      ["className", "শ্রেণি", "text", true],
      ["examName", "পরীক্ষার নাম", "text", true],
      ["subject", "বিষয়", "text", true],
      ["marks", "প্রাপ্ত নম্বর", "number", true],
      ["grade", "গ্রেড", "text", false]
    ]
  },

  Fees: {
    title: "বেতন ও ফি ব্যবস্থাপনা",
    collection: "fees",
    fields: [
      ["studentName", "শিক্ষার্থীর নাম", "text", true],
      ["className", "শ্রেণি", "text", true],
      ["amount", "টাকার পরিমাণ", "number", true],
      ["month", "মাস", "text", true],
      ["date", "জমার তারিখ", "date", true],
      ["note", "বিবরণ", "textarea", false]
    ]
  },

  Notices: {
    title: "নোটিশ ব্যবস্থাপনা",
    collection: "notices",
    fields: [
      ["title", "নোটিশের শিরোনাম", "text", true],
      ["date", "তারিখ", "date", true],
      ["description", "নোটিশের বিবরণ", "textarea", true]
    ]
  }
};

/* =================================
   3. HELPER FUNCTIONS
================================= */

const $ = id => document.getElementById(id);

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function showMessage(message, isError = false) {
  const toast = $("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.style.background = isError ? "#b42332" : "#086335";
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

function dataPath(collectionName) {
  return collection(
    db,
    "institutions",
    institutionId,
    collectionName
  );
}

function recordDate(data) {
  return data.createdAt?.toDate
    ? data.createdAt.toDate().toLocaleDateString("bn-BD")
    : "";
}

/* =================================
   4. LOGIN
================================= */

$("loginForm").addEventListener("submit", async event => {
  event.preventDefault();

  const email = $("loginEmail").value.trim();
  const password = $("loginPassword").value;
  const button = $("loginButton");
  const message = $("loginMessage");

  button.disabled = true;
  button.textContent = "লগইন হচ্ছে...";
  message.textContent = "";

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);

    const errors = {
      "auth/invalid-credential": "ইমেইল অথবা পাসওয়ার্ড ভুল।",
      "auth/user-not-found": "এই ইমেইলে কোনো অ্যাকাউন্ট নেই।",
      "auth/wrong-password": "পাসওয়ার্ড সঠিক নয়।",
      "auth/invalid-email": "সঠিক ইমেইল লিখুন।",
      "auth/too-many-requests": "অনেকবার চেষ্টা হয়েছে। পরে আবার চেষ্টা করুন।"
    };

    message.textContent = errors[error.code] || error.message;
  } finally {
    button.disabled = false;
    button.textContent = "Login";
  }
});

/* =================================
   5. PASSWORD RESET
================================= */

$("resetPassword").addEventListener("click", async () => {
  const email = $("loginEmail").value.trim();

  if (!email) {
    $("loginMessage").textContent =
      "প্রথমে আপনার Admin Email লিখুন।";
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    $("loginMessage").style.color = "green";
    $("loginMessage").textContent =
      "পাসওয়ার্ড রিসেট ইমেইল পাঠানো হয়েছে।";
  } catch (error) {
    $("loginMessage").style.color = "red";
    $("loginMessage").textContent = error.message;
  }
});

/* =================================
   6. AUTHENTICATION CHECK
================================= */

onAuthStateChanged(auth, async user => {
  currentUser = user;

  if (!user) {
    $("loginScreen").hidden = false;
    $("appShell").hidden = true;
    institutionId = "";
    return;
  }

  try {
    const adminRef = doc(db, "admins", user.uid);
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists()) {
      throw new Error("এই অ্যাকাউন্টের Admin অনুমতি নেই।");
    }

    const adminData = adminSnap.data();

    if (
      adminData.status !== "active" ||
      !adminData.institutionId
    ) {
      throw new Error("Admin অ্যাকাউন্ট সক্রিয় নয়।");
    }

    institutionId = adminData.institutionId;

    $("adminLabel").textContent =
      adminData.adminName || user.email;

    $("loginScreen").hidden = true;
    $("appShell").hidden = false;

    await renderPage("Dashboard");

  } catch (error) {
    console.error(error);
    alert(error.message);
    await signOut(auth);
  }
});

/* =================================
   7. LOGOUT
================================= */

$("logoutButton").addEventListener("click", async () => {
  if (confirm("আপনি কি লগআউট করতে চান?")) {
    await signOut(auth);
  }
});

/* =================================
   8. MOBILE MENU
================================= */

$("mobileMenu").addEventListener("click", () => {
  $("sidebar").classList.toggle("open");
});

/* =================================
   9. NAVIGATION
================================= */

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item")
      .forEach(item => item.classList.remove("active"));

    button.classList.add("active");
    $("sidebar").classList.remove("open");

    renderPage(button.dataset.page);
  });
});

/* =================================
   10. PAGE RENDER
================================= */

async function renderPage(page) {
  if (!institutionId) return;

  currentPage = page;

  if (page === "Dashboard") {
    await renderDashboard();
    return;
  }

  if (page === "Settings") {
    renderSettings();
    return;
  }

  if (modules[page]) {
    await renderModule(page);
  }
}

/* =================================
   11. DASHBOARD
================================= */

async function renderDashboard() {
  const main = $("mainContent");

  main.innerHTML = `
    <div class="page-heading">
      <h2>স্বাগতম, Admin!</h2>
      <p>EduSpark Management Dashboard</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>শিক্ষার্থী</h3>
        <strong id="studentCount">...</strong>
      </div>

      <div class="stat-card">
        <h3>শিক্ষক</h3>
        <strong id="teacherCount">...</strong>
      </div>

      <div class="stat-card">
        <h3>কর্মচারী</h3>
        <strong id="staffCount">...</strong>
      </div>

      <div class="stat-card">
        <h3>ভর্তি আবেদন</h3>
        <strong id="admissionCount">...</strong>
      </div>
    </div>

    <div class="card">
      <h3>প্রতিষ্ঠান ব্যবস্থাপনা</h3>
      <p>আপনার প্রতিষ্ঠানের সকল কার্যক্রম এখান থেকে পরিচালনা করুন।</p>
    </div>
  `;

  const collections = [
    ["students", "studentCount"],
    ["teachers", "teacherCount"],
    ["staff", "staffCount"],
    ["admissions", "admissionCount"]
  ];

  for (const [name, elementId] of collections) {
    try {
      const snapshot = await getDocs(dataPath(name));
      const element = $(elementId);
      if (element) element.textContent = snapshot.size;
    } catch (error) {
      console.error("Dashboard error:", error);
      const element = $(elementId);
      if (element) element.textContent = "—";
    }
  }
}

/* =================================
   12. MODULE PAGE
================================= */

async function renderModule(page) {
  const config = modules[page];
  const main = $("mainContent");

  main.innerHTML = `
    <div class="page-heading">
      <h2>${escapeHTML(config.title)}</h2>
      <p>তথ্য যোগ করুন, দেখুন এবং ব্যবস্থাপনা করুন।</p>
    </div>

    <div class="card">
      <h3>নতুন তথ্য যোগ করুন</h3>

      <form id="recordForm">
        <div class="form-grid">
          ${config.fields.map(field => `
            <div class="form-group">
              <label for="field_${field[0]}">
                ${escapeHTML(field[1])}
              </label>

              ${
                field[2] === "textarea"
                  ? `<textarea id="field_${field[0]}"
                       ${field[3] ? "required" : ""}></textarea>`
                  : `<input
                       id="field_${field[0]}"
                       type="${field[2]}"
                       ${field[3] ? "required" : ""}>`
              }
            </div>
          `).join("")}
        </div>

        <button class="btn primary" type="submit">
          তথ্য সংরক্ষণ করুন
        </button>
      </form>
    </div>

    <div class="card" style="margin-top:22px">
      <div class="toolbar">
        <h3>তথ্য তালিকা</h3>
        <input id="recordSearch"
          class="search-input"
          placeholder="তথ্য খুঁজুন..."
          style="max-width:230px">
      </div>

      <div id="recordsArea" class="table-wrap">
        তথ্য লোড হচ্ছে...
      </div>
    </div>
  `;

  $("recordForm").addEventListener("submit", async event => {
    event.preventDefault();

    const record = {};

    config.fields.forEach(field => {
      record[field[0]] =
        $(`field_${field[0]}`).value.trim();
    });

    try {
      const button = event.submitter;
      button.disabled = true;
      button.textContent = "সংরক্ষণ হচ্ছে...";

      await addDoc(dataPath(config.collection), {
        ...record,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid
      });

      showMessage("আলহামদুলিল্লাহ! তথ্য সংরক্ষণ হয়েছে।");

      $("recordForm").reset();
      await loadRecords(page);

    } catch (error) {
      console.error(error);
      showMessage("তথ্য সংরক্ষণ হয়নি: " + error.message, true);
    } finally {
      const button = $("recordForm").querySelector("button");
      button.disabled = false;
      button.textContent = "তথ্য সংরক্ষণ করুন";
    }
  });

  $("recordSearch").addEventListener("input", event => {
    displayRecords(page, event.target.value);
  });

  await loadRecords(page);
}

/* =================================
   13. LOAD RECORDS
================================= */

async function loadRecords(page) {
  const config = modules[page];
  const area = $("recordsArea");

  if (!area) return;

  area.textContent = "তথ্য লোড হচ্ছে...";

  try {
    const snapshot = await getDocs(dataPath(config.collection));

    currentRecords = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data()
    }));

    displayRecords(page, $("recordSearch")?.value || "");

  } catch (error) {
    console.error(error);
    area.textContent = "তথ্য লোড করা যায়নি: " + error.message;
  }
}

/* =================================
   14. DISPLAY RECORDS
================================= */

function displayRecords(page, search = "") {
  const config = modules[page];
  const area = $("recordsArea");

  if (!area) return;

  const filtered = currentRecords.filter(record =>
    config.fields.some(field =>
      String(record[field[0]] || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  );

  if (!filtered.length) {
    area.innerHTML = `
      <div class="empty-state">কোনো তথ্য পাওয়া যায়নি।</div>
    `;
    return;
  }

  area.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ক্রমিক</th>
          ${config.fields.map(field =>
            `<th>${escapeHTML(field[1])}</th>`
          ).join("")}
          <th>তারিখ</th>
          <th>অ্যাকশন</th>
        </tr>
      </thead>

      <tbody>
        ${filtered.map((record, index) => `
          <tr>
            <td>${index + 1}</td>

            ${config.fields.map(field =>
              `<td>${escapeHTML(record[field[0]])}</td>`
            ).join("")}

            <td>${escapeHTML(recordDate(record))}</td>

            <td>
              <button class="btn danger"
                data-delete="${escapeHTML(record.id)}">
                Delete
              </button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  area.querySelectorAll("[data-delete]").forEach(button => {
    button.addEventListener("click", async () => {
      const id = button.dataset.delete;

      if (!confirm("আপনি কি এই তথ্যটি মুছে ফেলতে চান?")) {
        return;
      }

      try {
        await deleteDoc(
          doc(db, "institutions", institutionId,
            config.collection, id)
        );

        showMessage("তথ্য মুছে ফেলা হয়েছে।");
        await loadRecords(page);

      } catch (error) {
        console.error(error);
        showMessage("তথ্য মুছতে সমস্যা হয়েছে।", true);
      }
    });
  });
}

/* =================================
   15. SETTINGS
================================= */

function renderSettings() {
  $("mainContent").innerHTML = `
    <div class="page-heading">
      <h2>সেটিংস</h2>
      <p>আপনার অ্যাকাউন্ট ও প্রতিষ্ঠানের তথ্য।</p>
    </div>

    <div class="card">
      <h3>Admin Account</h3>

      <div class="form-group">
        <label>Admin Email</label>
        <input value="${escapeHTML(currentUser?.email)}" disabled>
      </div>

      <div class="form-group">
        <label>Institution ID</label>
        <input value="${escapeHTML(institutionId)}" disabled>
      </div>

      <button id="settingsReset" class="btn primary">
        পাসওয়ার্ড পরিবর্তনের ইমেইল পাঠান
      </button>
    </div>

    <div class="card" style="margin-top:20px">
      <h3>EduSpark Digital Solution</h3>
      <p>School & Madrasa Management System</p>
    </div>
  `;

  $("settingsReset").addEventListener("click", async () => {
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      showMessage("পাসওয়ার্ড রিসেট ইমেইল পাঠানো হয়েছে।");
    } catch (error) {
      showMessage(error.message, true);
    }
  });
}

console.log("EduSpark System Ready");
