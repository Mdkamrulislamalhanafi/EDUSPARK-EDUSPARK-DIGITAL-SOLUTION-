

/* =====================================
   EDUSPARK DIGITAL SOLUTION
   Page Navigation System
===================================== */

document.addEventListener("DOMContentLoaded", function () {

  const main = document.querySelector(".main-content");
  const menuLinks = document.querySelectorAll(".sidebar a");

  if (!main) return;

  // Save Dashboard
  const dashboardHTML = main.innerHTML;

  const pages = {
    "Students": {
      title: "Students | শিক্ষার্থী",
      description: "শিক্ষার্থীদের তথ্য ও ব্যবস্থাপনা",
      content: `
        <div class="card">
          <h3>Student Management</h3>
          <p>এখানে শিক্ষার্থীদের তালিকা, নতুন ভর্তি ও তথ্য সম্পাদনা করা যাবে।</p>
          <button class="btn">+ Add Student</button>
          <p style="margin-top:20px;">এখনো কোনো শিক্ষার্থীর তথ্য যোগ করা হয়নি।</p>
        </div>`
    },

    "Teachers": {
      title: "Teachers | শিক্ষক",
      description: "শিক্ষকদের তথ্য ব্যবস্থাপনা",
      content: `
        <div class="card">
          <h3>Teacher Management</h3>
          <p>শিক্ষকদের নাম, মোবাইল ও দায়িত্বের তথ্য এখানে থাকবে।</p>
          <button class="btn">+ Add Teacher</button>
        </div>`
    },

    "Staff": {
      title: "Staff | কর্মকর্তা",
      description: "প্রতিষ্ঠানের কর্মকর্তা ও কর্মচারী",
      content: `
        <div class="card">
          <h3>Staff Management</h3>
          <p>কর্মকর্তা ও কর্মচারীদের তথ্য এখানে ব্যবস্থাপনা করুন।</p>
          <button class="btn">+ Add Staff</button>
        </div>`
    },

    "Admission": {
      title: "Admission | ভর্তি",
      description: "নতুন শিক্ষার্থী ভর্তি ব্যবস্থাপনা",
      content: `
        <div class="card">
          <h3>Student Admission</h3>
          <p>নতুন শিক্ষার্থীর ভর্তি ফরম ও আবেদন ব্যবস্থাপনা।</p>
          <button class="btn">+ New Admission</button>
        </div>`
    },

    "Attendance": {
      title: "Attendance | উপস্থিতি",
      description: "শিক্ষার্থী ও শিক্ষকদের উপস্থিতি",
      content: `
        <div class="card">
          <h3>Attendance Management</h3>
          <p>প্রতিদিনের উপস্থিতি রেকর্ড ও রিপোর্ট এখানে থাকবে।</p>
          <button class="btn">Take Attendance</button>
        </div>`
    },

    "Classes": {
      title: "Classes | ক্লাস",
      description: "শ্রেণি ও বিভাগ ব্যবস্থাপনা",
      content: `
        <div class="card">
          <h3>Class Management</h3>
          <p>শ্রেণি, বিভাগ ও ক্লাসের তথ্য ব্যবস্থাপনা।</p>
          <button class="btn">+ Add Class</button>
        </div>`
    },

    "Results": {
      title: "Results | ফলাফল",
      description: "পরীক্ষার ফলাফল ব্যবস্থাপনা",
      content: `
        <div class="card">
          <h3>Exam Results</h3>
          <p>পরীক্ষার নম্বর, গ্রেড ও ফলাফল প্রকাশের ব্যবস্থা।</p>
          <button class="btn">+ Add Result</button>
        </div>`
    },

    "Fees": {
      title: "Fees | বেতন",
      description: "শিক্ষার্থীদের বেতন ও ফি ব্যবস্থাপনা",
      content: `
        <div class="card">
          <h3>Fees Management</h3>
          <p>মাসিক বেতন, ভর্তি ফি ও পেমেন্টের তথ্য।</p>
          <button class="btn">+ Add Payment</button>
        </div>`
    },

    "Notices": {
      title: "Notices | নোটিশ",
      description: "প্রতিষ্ঠানের নোটিশ বোর্ড",
      content: `
        <div class="card">
          <h3>Notice Board</h3>
          <p>প্রতিষ্ঠানের নতুন নোটিশ এখানে প্রকাশ করা যাবে।</p>
          <button class="btn">+ Create Notice</button>
        </div>`
    },

    "Settings": {
      title: "Settings | সেটিংস",
      description: "সিস্টেমের সাধারণ সেটিংস",
      content: `
        <div class="card">
          <h3>System Settings</h3>
          <p>প্রতিষ্ঠানের নাম, ভাষা ও অন্যান্য সেটিংস।</p>
        </div>`
    }
  };

  // Page Navigation
  function openPage(name) {

    if (name === "Dashboard") {
      main.innerHTML = dashboardHTML;
    } else if (pages[name]) {
      const page = pages[name];

      main.innerHTML = `
        <h2 class="page-title">${page.title}</h2>
        <p style="margin-bottom:20px;color:#718078;">
          ${page.description}
        </p>
        ${page.content}
        <footer style="text-align:center;margin-top:30px;">
          © 2026 EduSpark Digital Solution
        </footer>
      `;
    }

    menuLinks.forEach(function (link) {
      link.classList.remove("active");

      if (link.dataset.page === name) {
        link.classList.add("active");
      }
    });
  }

  // Connect Sidebar Menus
  menuLinks.forEach(function (link) {

    const text = link.textContent.trim();

    let pageName = Object.keys(pages).find(function (key) {
      return text.includes(key);
    });

    if (text.includes("Dashboard")) {
      pageName = "Dashboard";
    }

    link.dataset.page = pageName || "";

    link.addEventListener("click", function (event) {
      event.preventDefault();

      if (pageName) {
        openPage(pageName);
      }
    });

  });

  console.log("EduSpark Navigation Ready!");

});
