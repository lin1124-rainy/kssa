// =========================================================
// 發布與管理後台邏輯 (js/publish.js) - 支援 活動/議事/評議/相關連結 四模組
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  // 🔒 1. 權限驗證：檢查是否持有管理員鑰匙
  if (sessionStorage.getItem("kshs_is_admin") !== "true") {
    alert("權限不足：請先登入管理員帳號！");
    window.location.href = "index.html"; // 踢回首頁
    return; // 終止後續所有程式碼執行
  }
  const tabActBtn = document.getElementById("tab-act-btn");
  const tabCouncilBtn = document.getElementById("tab-council-btn");
  const tabCourtBtn = document.getElementById("tab-court-btn");
  const tabLinkBtn = document.getElementById("tab-link-btn");

  const actForm = document.getElementById("publish-form");
  const councilForm = document.getElementById("council-doc-form");
  const courtForm = document.getElementById("court-doc-form");
  const linkForm = document.getElementById("link-form");

  const modeText = document.getElementById("mode-text");
  const managementTitle = document.getElementById("management-title");
  const managementList = document.getElementById("management-list");
  const backLink = document.querySelector(".back-link");

  let currentTab = "activity";

  // 讀取 URL 參數 (例如 publish.html?tab=court)
  const urlParams = new URLSearchParams(window.location.search);
  const targetTab = urlParams.get("tab");

  // 模式切換函式
  function switchToTab(tab) {
    currentTab = tab;

    // 預設關閉所有表單
    if (actForm) actForm.style.display = "none";
    if (councilForm) councilForm.style.display = "none";
    if (courtForm) courtForm.style.display = "none";
    if (linkForm) linkForm.style.display = "none";

    if (tabActBtn) tabActBtn.className = "tab-btn inactive-tab";
    if (tabCouncilBtn) tabCouncilBtn.className = "tab-btn inactive-tab";
    if (tabCourtBtn) tabCourtBtn.className = "tab-btn inactive-tab";
    if (tabLinkBtn) tabLinkBtn.className = "tab-btn inactive-tab";

    if (tab === "council") {
      if (councilForm) councilForm.style.display = "block";
      if (tabCouncilBtn) tabCouncilBtn.className = "tab-btn active-tab";

      if (backLink) {
        backLink.href = "council-docs.html";
        backLink.innerHTML = `<i class="fa-solid fa-arrow-left"></i> 返回議事公開資訊列表`;
      }

      modeText.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> 當前模式：發布【議事公開資訊】`;
      managementTitle.textContent = "已發布【議事公開資訊】管理";
    } else if (tab === "court") {
      if (courtForm) courtForm.style.display = "block";
      if (tabCourtBtn) tabCourtBtn.className = "tab-btn active-tab";

      if (backLink) {
        backLink.href = "court-docs.html";
        backLink.innerHTML = `<i class="fa-solid fa-arrow-left"></i> 返回評議會議事公開專區`;
      }

      modeText.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> 當前模式：發布【評議公開資訊】`;
      managementTitle.textContent = "已發布【評議公開資訊】管理";
    } else if (tab === "link") {
      if (linkForm) linkForm.style.display = "block";
      if (tabLinkBtn) tabLinkBtn.className = "tab-btn active-tab";

      if (backLink) {
        backLink.href = "links.html";
        backLink.innerHTML = `<i class="fa-solid fa-arrow-left"></i> 返回相關連結列表`;
      }

      modeText.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> 當前模式：發布【相關連結】`;
      managementTitle.textContent = "已發布【相關連結】管理";
    } else {
      if (actForm) actForm.style.display = "block";
      if (tabActBtn) tabActBtn.className = "tab-btn active-tab";

      if (backLink) {
        backLink.href = "activities.html";
        backLink.innerHTML = `<i class="fa-solid fa-arrow-left"></i> 返回活動資訊列表`;
      }

      modeText.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> 當前模式：發布【活動資訊】`;
      managementTitle.textContent = "已發布【活動資訊】管理";
    }

    renderManagementTable();
  }

  // 按鈕點擊切換
  if (tabActBtn)
    tabActBtn.addEventListener("click", () => switchToTab("activity"));
  if (tabCouncilBtn)
    tabCouncilBtn.addEventListener("click", () => switchToTab("council"));
  if (tabCourtBtn)
    tabCourtBtn.addEventListener("click", () => switchToTab("court"));
  if (tabLinkBtn)
    tabLinkBtn.addEventListener("click", () => switchToTab("link"));

  // 網址參數初始化
  if (targetTab === "council") {
    switchToTab("council");
  } else if (targetTab === "court") {
    switchToTab("court");
  } else if (targetTab === "link") {
    switchToTab("link");
  } else {
    switchToTab("activity");
  }

  // 1. 活動發布邏輯
  if (actForm) {
    actForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const dept = document.getElementById("pub-department").value;
      const title = document.getElementById("pub-title").value.trim();
      const startDate = document.getElementById("pub-start-date").value;
      const endDate = document.getElementById("pub-end-date").value;
      const tag = document.getElementById("pub-tag").value;
      const content = document.getElementById("pub-content").value.trim();
      const bannerInput = document.getElementById("pub-banner-file");

      if (!bannerInput.files[0]) {
        alert("請選擇封面海報圖片！");
        return;
      }

      const bannerBase64 = await readFileAsBase64(bannerInput.files[0]);
      const todayStr = new Date().toISOString().split("T")[0];

      const newActivity = {
        id: "act_" + Date.now(),
        department: dept,
        title: title,
        banner: bannerBase64,
        startDate: startDate,
        endDate: endDate,
        tag: tag,
        content: content,
        publishDate: todayStr,
      };

      const activities =
        JSON.parse(localStorage.getItem("kshs_activities")) || [];
      activities.unshift(newActivity);
      localStorage.setItem("kshs_activities", JSON.stringify(activities));

      if (startDate) {
        const eventsData =
          JSON.parse(localStorage.getItem("kshs_calendar_events")) || {};
        if (!eventsData[startDate]) eventsData[startDate] = [];

        const eventText = `【${tag}】${title} (${dept})`;
        eventsData[startDate].push({ id: newActivity.id, text: eventText });
        localStorage.setItem(
          "kshs_calendar_events",
          JSON.stringify(eventsData),
        );
      }

      alert("活動發布成功並已同步至行事曆！");
      updateSiteLastUpdatedTime(); // 💡 更新全站日期
      actForm.reset();
      renderManagementTable();
    });
  }

  // 2. 議事公開資訊發布邏輯 (學生議會)
  if (councilForm) {
    councilForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("doc-title").value.trim();
      const author = document.getElementById("doc-author").value.trim();
      const content = document.getElementById("doc-content").value.trim();
      const fileInput = document.getElementById("doc-files");

      const todayStr = new Date().toISOString().split("T")[0];

      const fileList = [];
      if (fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
          const file = fileInput.files[i];
          const base64 = await readFileAsBase64(file);

          let fileType = "other";
          const fileNameLower = file.name.toLowerCase();
          if (fileNameLower.endsWith(".pdf")) fileType = "pdf";
          else if (
            fileNameLower.endsWith(".doc") ||
            fileNameLower.endsWith(".docx")
          )
            fileType = "word";
          else if (
            fileNameLower.endsWith(".xls") ||
            fileNameLower.endsWith(".xlsx")
          )
            fileType = "excel";

          fileList.push({
            name: file.name,
            type: fileType,
            data: base64,
          });
        }
      }

      const newDoc = {
        id: "doc_" + Date.now(),
        title: title,
        date: todayStr,
        author: author,
        content: content,
        files: fileList,
      };

      const docs = JSON.parse(localStorage.getItem("kshs_council_docs")) || [];
      docs.unshift(newDoc);
      localStorage.setItem("kshs_council_docs", JSON.stringify(docs));

      alert("議事公開資訊發布成功！");
      updateSiteLastUpdatedTime(); // 💡 更新全站日期
      councilForm.reset();
      renderManagementTable();
    });
  }

  // 3. 評議公開資訊發布邏輯 (評議委員會)
  if (courtForm) {
    courtForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("court-doc-title").value.trim();
      const author = document.getElementById("court-doc-author").value.trim();
      const content = document.getElementById("court-doc-content").value.trim();
      const fileInput = document.getElementById("court-doc-files");

      const todayStr = new Date().toISOString().split("T")[0];

      const fileList = [];
      if (fileInput && fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
          const file = fileInput.files[i];
          const base64 = await readFileAsBase64(file);

          let fileType = "other";
          const fileNameLower = file.name.toLowerCase();
          if (fileNameLower.endsWith(".pdf")) fileType = "pdf";
          else if (
            fileNameLower.endsWith(".doc") ||
            fileNameLower.endsWith(".docx")
          )
            fileType = "word";
          else if (
            fileNameLower.endsWith(".xls") ||
            fileNameLower.endsWith(".xlsx")
          )
            fileType = "excel";

          fileList.push({
            name: file.name,
            type: fileType,
            data: base64,
          });
        }
      }

      const newCourtDoc = {
        id: "court_" + Date.now(),
        title: title,
        date: todayStr,
        author: author,
        content: content,
        files: fileList,
      };

      const courtDocs =
        JSON.parse(localStorage.getItem("kshs_court_docs")) || [];
      courtDocs.unshift(newCourtDoc);
      localStorage.setItem("kshs_court_docs", JSON.stringify(courtDocs));

      alert("評議公開資訊發布成功！");
      updateSiteLastUpdatedTime(); // 💡 更新全站日期
      courtForm.reset();
      const authorInput = document.getElementById("court-doc-author");
      if (authorInput) authorInput.value = "評議委員會";
      renderManagementTable();
    });
  }

  // 4. 相關連結發布邏輯
  if (linkForm) {
    linkForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = document.getElementById("link-text").value.trim();
      const url = document.getElementById("link-url").value.trim();
      const dept = document.getElementById("link-department").value.trim();
      const todayStr = new Date().toISOString().split("T")[0];

      const newLink = {
        id: "link_" + Date.now(),
        text: text,
        url: url,
        department: dept,
        date: todayStr,
      };

      const links =
        JSON.parse(localStorage.getItem("kshs_related_links")) || [];
      links.unshift(newLink);
      localStorage.setItem("kshs_related_links", JSON.stringify(links));

      alert("相關連結發布成功！");
      updateSiteLastUpdatedTime(); // 💡 更新全站日期
      linkForm.reset();
      renderManagementTable();
    });
  }

  // 5. 渲染管理表格
  function renderManagementTable() {
    if (!managementList) return;
    managementList.innerHTML = "";

    if (currentTab === "activity") {
      const activities =
        JSON.parse(localStorage.getItem("kshs_activities")) || [];
      if (activities.length === 0) {
        managementList.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: #94a3b8;">目前尚無已發布活動</td></tr>`;
        return;
      }

      managementList.innerHTML = activities
        .map(
          (act) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 8px;">${act.publishDate || "-"}</td>
          <td style="padding: 12px 8px;">${act.department}</td>
          <td style="padding: 12px 8px; font-weight: 600;">${act.title}</td>
          <td style="padding: 12px 8px; text-align: center;">
            <button onclick="deleteItem('activity', '${act.id}')" style="color: #ef4444; border: none; background: none; cursor: pointer;">
              <i class="fa-solid fa-trash-can"></i> 刪除
            </button>
          </td>
        </tr>
      `,
        )
        .join("");
    } else if (currentTab === "council") {
      const docs = JSON.parse(localStorage.getItem("kshs_council_docs")) || [];
      if (docs.length === 0) {
        managementList.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: #94a3b8;">目前尚無已發布議事公開資訊</td></tr>`;
        return;
      }

      managementList.innerHTML = docs
        .map(
          (doc) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 8px;">${doc.date}</td>
          <td style="padding: 12px 8px;">${doc.author}</td>
          <td style="padding: 12px 8px; font-weight: 600;">${doc.title}</td>
          <td style="padding: 12px 8px; text-align: center;">
            <button onclick="deleteItem('council', '${doc.id}')" style="color: #ef4444; border: none; background: none; cursor: pointer;">
              <i class="fa-solid fa-trash-can"></i> 刪除
            </button>
          </td>
        </tr>
      `,
        )
        .join("");
    } else if (currentTab === "court") {
      const courtDocs =
        JSON.parse(localStorage.getItem("kshs_court_docs")) || [];
      if (courtDocs.length === 0) {
        managementList.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: #94a3b8;">目前尚無已發布評議公開資訊</td></tr>`;
        return;
      }

      managementList.innerHTML = courtDocs
        .map(
          (doc) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 8px;">${doc.date}</td>
          <td style="padding: 12px 8px;">${doc.author}</td>
          <td style="padding: 12px 8px; font-weight: 600;">${doc.title}</td>
          <td style="padding: 12px 8px; text-align: center;">
            <button onclick="deleteItem('court', '${doc.id}')" style="color: #ef4444; border: none; background: none; cursor: pointer;">
              <i class="fa-solid fa-trash-can"></i> 刪除
            </button>
          </td>
        </tr>
      `,
        )
        .join("");
    } else if (currentTab === "link") {
      const links =
        JSON.parse(localStorage.getItem("kshs_related_links")) || [];
      if (links.length === 0) {
        managementList.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: #94a3b8;">目前尚無已發布相關連結</td></tr>`;
        return;
      }

      managementList.innerHTML = links
        .map(
          (item) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 8px;">${item.date}</td>
          <td style="padding: 12px 8px;">${item.department}</td>
          <td style="padding: 12px 8px; font-weight: 600;">
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" style="color:#0284c7; text-decoration:none;">
              ${item.text} <i class="fa-solid fa-up-right-from-square" style="font-size:11px;"></i>
            </a>
          </td>
          <td style="padding: 12px 8px; text-align: center;">
            <button onclick="deleteItem('link', '${item.id}')" style="color: #ef4444; border: none; background: none; cursor: pointer;">
              <i class="fa-solid fa-trash-can"></i> 刪除
            </button>
          </td>
        </tr>
      `,
        )
        .join("");
    }
  }
});

// 全域刪除處理
function deleteItem(type, id) {
  if (!confirm("確定要刪除這筆資料嗎？")) return;

  if (type === "activity") {
    let activities = JSON.parse(localStorage.getItem("kshs_activities")) || [];
    activities = activities.filter((act) => act.id !== id);
    localStorage.setItem("kshs_activities", JSON.stringify(activities));

    const calendarEvents =
      JSON.parse(localStorage.getItem("kshs_calendar_events")) || {};
    for (const date in calendarEvents) {
      calendarEvents[date] = calendarEvents[date].filter((item) =>
        typeof item === "object" ? item.id !== id : true,
      );
      if (calendarEvents[date].length === 0) delete calendarEvents[date];
    }
    localStorage.setItem(
      "kshs_calendar_events",
      JSON.stringify(calendarEvents),
    );

    updateSiteLastUpdatedTime(); // 💡 刪除成功後更新日期
    window.location.href = "publish.html?tab=activity";
  } else if (type === "council") {
    let docs = JSON.parse(localStorage.getItem("kshs_council_docs")) || [];
    docs = docs.filter((doc) => doc.id !== id);
    localStorage.setItem("kshs_council_docs", JSON.stringify(docs));

    updateSiteLastUpdatedTime(); // 💡 刪除成功後更新日期
    window.location.href = "publish.html?tab=council";
  } else if (type === "court") {
    let courtDocs = JSON.parse(localStorage.getItem("kshs_court_docs")) || [];
    courtDocs = courtDocs.filter((doc) => doc.id !== id);
    localStorage.setItem("kshs_court_docs", JSON.stringify(courtDocs));

    updateSiteLastUpdatedTime(); // 💡 刪除成功後更新日期
    window.location.href = "publish.html?tab=court";
  } else if (type === "link") {
    let links = JSON.parse(localStorage.getItem("kshs_related_links")) || [];
    links = links.filter((item) => item.id !== id);
    localStorage.setItem("kshs_related_links", JSON.stringify(links));

    updateSiteLastUpdatedTime(); // 💡 刪除成功後更新日期
    window.location.href = "publish.html?tab=link";
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// 每次發布或刪除資料時呼叫此函式，更新日期至 localStorage
function updateSiteLastUpdatedTime() {
  const today = new Date();
  const dateStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;
  localStorage.setItem("kshs_last_updated_date", dateStr);
}
