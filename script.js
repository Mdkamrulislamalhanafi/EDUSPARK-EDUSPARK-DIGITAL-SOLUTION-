
/* EduSpark Digital Solution
   Firebase Login + Admin Check + Students
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


/* FIREBASE CONFIG */

const firebaseConfig = {
  apiKey: "AIzaSyCIdw6nxSBxWVWy_033m332aDWaEPOo9fg",
  authDomain: "eduspark-7b651.firebaseapp.com",
  projectId: "eduspark-7b651",
  storageBucket: "eduspark-7b651.firebasestorage.app",
  messagingSenderId: "441514127228",
  appId: "1:441514127228:web:17bc8743e7cef475547ef9",
  measurementId: "G-Y8WW1XJEN1"
};


/* INITIALIZE FIREBASE */

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


/* HTML ELEMENTS */

const loginScreen = document.getElementById("loginScreen");
const appShell = document.getElementById("appShell");
const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
const logoutButton = document.getElementById("logoutButton");
const main = document.getElementById("mainContent");
const menuLinks = document.querySelectorAll(".sidebar a");

let institutionId = "";
let dashboardHTML = main.innerHTML;


/* LOGIN SCREEN */

function showLogin(message = "") {
  loginScreen.hidden = false;
  appShell.hidden = true;
  loginMessage.textContent = message;
}

function showApp() {
  loginScreen.hidden = true;
  appShell.hidden = false;
}

function friendlyAuthError(error) {
  const code = error?.code || "";

  if (
    code.includes("invalid-credential") ||
    code.includes("wrong-password") ||
    code.includes("user-not-found")
  ) {
    return "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।";
  }

  if (code.includes("too-many-requests")) {
    return "অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }

  if (code.includes("network-request-failed")) {
    return "ইন্টারনেট সংযোগ পরীক্ষা করুন।";
  }

  return "Login করা যায়নি। Firebase সেটিংস পরীক্ষা করুন।";
}


/* LOGIN */

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginMessage.textContent = "";
  loginButton.disabled = true;
  loginButton.textContent = "লগইন হচ্ছে...";

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    loginMessage.textContent = friendlyAuthError(error);
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Login";
  }
});


/* LOGOUT */

logoutButton.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
  }
});


/* ADMIN VERIFICATION */

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    institutionId = "";
    showLogin();
    return;
  }

  try {
    const adminRef = doc(db, "admins", user.uid);
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists()) {
      await signOut(auth);
      showLogin("এই অ্যাকাউন্টের Admin অনুমতি নেই।");
      return;
    }

    const adminData = adminSnap.data();

    if (
      adminData.status !== "active" ||
      !adminData.institutionId
    ) {
      await signOut(auth);
      showLogin("Admin অ্যাকাউন্ট সক্রিয় নয়।");
      return;
    }

    institutionId = adminData.institutionId;

    showApp();

    dashboardHTML = main.innerHTML;

    await updateStudentCount();

  } catch (error) {
    console.error("Admin verification failed:", error);

    await signOut(auth);

    showLogin("Admin যাচাই করা যায়নি। Firestore Rules পরীক্ষা করুন।");
  }
});


/* PAGE INFORMATION */

const pages = {
  Students: {
    title: "Students | শিক্ষার্থী",
    description: "শিক্ষার্থীদের তথ্য ও ব্যবস্থাপনা"
  },
  Teachers: {
    title: "Teachers | শিক্ষক",
    description: "শিক্ষকদের তথ্য ব্যবস্থাপনা"
  },
  Staff: {
    title: "Staff | কর্মকর্তা",
    description: "প্রতিষ্ঠানের কর্মকর্তা ও কর্মচারী"
  },
  Admission: {
    title: "Admission | ভর্তি",
    description: "নতুন শিক্ষার্থী ভর্তি ব্যবস্থাপনা"
  },
  Attendance: {
    title: "Attendance | উপস্থিতি",
    description: "শিক্ষার্থী ও শিক্ষকদের উপস্থিতি"
  },
  Classes: {
    title: "Classes | ক্লাস",
    description: "শ্রেণি ও বিভাগ ব্যবস্থাপনা"
  },
  Results: {
    title: "Results | ফলাফল",
    description: "পরীক্ষার ফলাফল ব্যবস্থাপনা"
  },
  Fees: {
    title: "Fees | বেতন",
    description: "শিক্ষার্থীদের বেতন ও ফি ব্যবস্থাপনা"
  },
  Notices: {
    title: "Notices | নোটিশ",
    description: "প্রতিষ্ঠানের নোটিশ বোর্ড"
  },
  Settings: {
    title: "Settings | সেটিংস",
    description: "সিস্টেমের সাধারণ সেটিংস"
  }
};


/* MENU */

function setActiveMenu(name) {
  menuLinks.forEach(link => {
    link.classList.toggle("active", link.dataset.page === name);
  });
}

function openPage(name) {
  if (name === "Dashboard") {
    main.innerHTML = dashboardHTML;
    setActiveMenu(name);
    updateStudentCount();
    return;
  }

  const page = pages[name];

  if (!page) return;

  if (name === "Students") {
    renderStudentsPage();
    setActiveMenu(name);
    return;
  }

  const messages = {
    Teachers: "শিক্ষকদের তথ্য ব্যবস্থাপনা পরবর্তী ধাপে যুক্ত করা হবে।",
    Staff: "কর্মকর্তা ও কর্মচারীদের তথ্য ব্যবস্থাপনা পরবর্তী ধাপে যুক্ত করা হবে।",
    Admission: "ভর্তি ব্যবস্থাপনা পরবর্তী ধাপে যুক্ত করা হবে।",
    Attendance: "উপস্থিতি ব্যবস্থাপনা পরবর্তী ধাপে যুক্ত করা হবে।",
    Classes: "শ্রেণি ব্যবস্থাপনা পরবর্তী ধাপে যুক্ত করা হবে।",
    Results: "ফলাফল ব্যবস্থাপনা পরবর্তী ধাপে যুক্ত করা হবে।",
    Fees: "বেতন ব্যবস্থাপনা পরবর্তী ধাপে যুক্ত করা হবে।",
    Notices: "নোটিশ ব্যবস্থাপনা পরবর্তী ধাপে যুক্ত করা হবে।",
    Settings: "সিস্টেম সেটিংস পরবর্তী ধাপে যুক্ত করা হবে।"
  };

  main.innerHTML = `
    <h2 class="page-title">${page.title}</h2>
    <p class="page-description">${page.description}</p>

    <div class="card">
      <h3>${page.title}</h3>
      <p>${messages[name]}</p>
    </div>

    <footer class="app-footer">
      © 2026 EduSpark Digital Solution
    </footer>
  `;

  setActiveMenu(name);
}


/* STUDENT COLLECTION */

function getStudentsCollection() {
  return collection(db, "institutions", institutionId, "students");
}


/* DASHBOARD STUDENT COUNT */

async function updateStudentCount() {
  if (!institutionId) return;

  try {
    const snapshot = await getDocs(getStudentsCollection());

    const countElement = document.getElementById("studentCount");

    if (countElement) {
      countElement.textContent = snapshot.size;
    }

  } catch (error) {
    console.error("Student count error:", error);
  }
}


/* STUDENTS PAGE */

async function renderStudentsPage() {

  main.innerHTML = `
    <h2 class="page-title">Students | শিক্ষার্থী</h2>

    <p class="page-description">
      শিক্ষার্থীদের তথ্য যোগ করুন এবং তালিকা দেখুন।
    </p>

    <section class="card student-form-card">

      <h3>নতুন শিক্ষার্থী যোগ করুন</h3>

      <form id="studentForm">

        <div class="student-form-grid">

          <div class="form-group">
            <label for="studentName">শিক্ষার্থীর নাম *</label>
            <input
              id="studentName"
              required
              maxlength="100"
              placeholder="শিক্ষার্থীর নাম"
            >
          </div>

          <div class="form-group">
            <label for="studentClass">শ্রেণি / বিভাগ</label>
            <input
              id="studentClass"
              maxlength="60"
              placeholder="যেমন: ৫ম শ্রেণি"
            >
          </div>

          <div class="form-group">
            <label for="studentMobile">মোবাইল নম্বর</label>
            <input
              id="studentMobile"
              type="tel"
              maxlength="25"
              placeholder="মোবাইল নম্বর"
            >
          </div>

          <div class="form-group">
            <label for="fatherName">পিতার নাম</label>
            <input
              id="fatherName"
              maxlength="100"
              placeholder="পিতার নাম"
            >
          </div>

        </div>

        <button class="btn" id="saveStudentButton" type="submit">
          শিক্ষার্থী সংরক্ষণ করুন
        </button>

        <p id="studentMessage" class="student-message" role="status"></p>

      </form>

    </section>

    <section class="card student-list-card">

      <div class="student-list-heading">
        <h3>শিক্ষার্থীদের তালিকা</h3>

        <button class="btn btn-yellow" id="refreshStudents" type="button">
          Refresh
        </button>
      </div>

      <div class="table-wrap">

        <table>
          <thead>
            <tr>
              <th>নাম</th>
              <th>শ্রেণি</th>
              <th>মোবাইল</th>
              <th>পিতার নাম</th>
            </tr>
          </thead>

          <tbody id="studentsTableBody">
            <tr>
              <td colspan="4">তথ্য লোড হচ্ছে...</td>
            </tr>
          </tbody>
        </table>

      </div>

    </section>

    <footer class="app-footer">
      © 2026 EduSpark Digital Solution
    </footer>
  `;


  const form = document.getElementById("studentForm");
  const message = document.getElementById("studentMessage");
  const saveButton = document.getElementById("saveStudentButton");

  form.addEventListener("submit", async (event) => {

    event.preventDefault();

    message.textContent = "";
    saveButton.disabled = true;
    saveButton.textContent = "সংরক্ষণ হচ্ছে...";

    const studentData = {
      studentName: document.getElementById("studentName").value.trim(),
      studentClass: document.getElementById("studentClass").value.trim(),
      mobile: document.getElementById("studentMobile").value.trim(),
      fatherName: document.getElementById("fatherName").value.trim(),
      status: "active",
      createdAt: serverTimestamp()
    };

    try {

      await addDoc(getStudentsCollection(), studentData);

      message.textContent = "শিক্ষার্থীর তথ্য সফলভাবে সংরক্ষিত হয়েছে।";

      form.reset();

      await loadStudents();
      await updateStudentCount();

    } catch (error) {

      console.error("Student save failed:", error);

      message.textContent =
        "সংরক্ষণ হয়নি। Firestore Rules ও ইন্টারনেট সংযোগ পরীক্ষা করুন।";

    } finally {

      saveButton.disabled = false;
      saveButton.textContent = "শিক্ষার্থী সংরক্ষণ করুন";

    }

  });


  document
    .getElementById("refreshStudents")
    .addEventListener("click", loadStudents);

  await loadStudents();
}


/* LOAD STUDENTS */

async function loadStudents() {

  const tbody = document.getElementById("studentsTableBody");

  if (!tbody) return;

  tbody.innerHTML =
    '<tr><td colspan="4">তথ্য লোড হচ্ছে...</td></tr>';

  try {

    const studentsRef = getStudentsCollection();

    const studentsQuery = query(
      studentsRef,
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(studentsQuery);

    if (snapshot.empty) {

      tbody.innerHTML =
        '<tr><td colspan="4">এখনো কোনো শিক্ষার্থী যোগ করা হয়নি।</td></tr>';

      return;
    }

    tbody.innerHTML = "";

    snapshot.forEach((studentDoc) => {

      const student = studentDoc.data();

      const row = document.createElement("tr");

      const values = [
        student.studentName || "",
        student.studentClass || "",
        student.mobile || "",
        student.fatherName || ""
      ];

      values.forEach(value => {

        const cell = document.createElement("td");

        cell.textContent = value;

        row.appendChild(cell);

      });

      tbody.appendChild(row);

    });

  } catch (error) {

    console.error("Student load failed:", error);

    tbody.innerHTML =
      '<tr><td colspan="4">তথ্য লোড হয়নি। Firestore Rules পরীক্ষা করুন।</td></tr>';

  }

}


/* MENU CLICK EVENTS */

menuLinks.forEach((link) => {

  const pageName = link.dataset.page;

  link.addEventListener("click", (event) => {

    event.preventDefault();

    if (auth.currentUser && pageName) {
      openPage(pageName);
    }

  });

});


console.log("EduSpark app script loaded.");
