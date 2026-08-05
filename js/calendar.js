// =========================================================
// 行事曆核心邏輯 (js/calendar.js) - 含管理員權限控管
// =========================================================

// 🔒 權限檢查：檢查是否為登入狀態的管理員
const isAdmin = sessionStorage.getItem("kshs_is_admin") === "true";

// 1. 從瀏覽器硬碟讀取舊資料，如果沒有就預設為空物件 {}
const eventsData =
  JSON.parse(localStorage.getItem("kshs_calendar_events")) || {};

// 2. 全域狀態變數
let currentDate = new Date();
let selectedDateStr = "";

// 3. DOM 元素宣告
const yearMonthTitle = document.getElementById("calendar-year-month");
const daysContainer = document.getElementById("calendar-days");
const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");
const btnToday = document.getElementById("btn-today");
const btnPickDate = document.getElementById("btn-pick-date");
const btnAddEvent = document.getElementById("btn-add-event");
const hiddenDateInput = document.getElementById("hidden-date-input");
const selectedDateDisplay = document.getElementById("selected-date-display");
const eventList = document.getElementById("event-list");

// 🔒 若非管理員，隱藏「新增行程」按鈕
if (btnAddEvent && !isAdmin) {
  btnAddEvent.style.display = "none";
}

// 初次渲染月曆
renderCalendar(currentDate);

// 💡 將最新的 eventsData 寫入瀏覽器 LocalStorage 記憶庫
function saveEventsToStorage() {
  localStorage.setItem("kshs_calendar_events", JSON.stringify(eventsData));
}

// 💡 輔助函式：同步更新全站 Footer 最後修改時間
function updateSiteLastUpdatedTime() {
  const today = new Date();
  const dateStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;
  localStorage.setItem("kshs_last_updated_date", dateStr);
}

// ---------------------------------------------------------
// 核心函式：繪製月曆網格
// ---------------------------------------------------------
function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  yearMonthTitle.textContent = `${monthNames[month]} ${year}`;
  daysContainer.innerHTML = "";

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // 補前置空白
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("day-cell", "empty-cell");
    daysContainer.appendChild(emptyCell);
  }

  // 渲染日期
  const today = new Date();
  for (let day = 1; day <= totalDays; day++) {
    const dayCell = document.createElement("div");
    dayCell.classList.add("day-cell");
    dayCell.textContent = day;

    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      dayCell.classList.add("today");
    }

    if (formattedDate === selectedDateStr) {
      dayCell.classList.add("selected");
    }

    // 點擊日期單元格
    dayCell.addEventListener("click", () => {
      document
        .querySelectorAll(".day-cell")
        .forEach((c) => c.classList.remove("selected"));
      dayCell.classList.add("selected");
      selectedDateStr = formattedDate;
      displayEvents(formattedDate);
    });

    daysContainer.appendChild(dayCell);
  }
}

// ---------------------------------------------------------
// 核心函式：顯示行程與產生「刪除按鈕」（含權限控管）
// ---------------------------------------------------------
function displayEvents(dateStr) {
  const [y, m, d] = dateStr.split("-");
  selectedDateDisplay.textContent = `${y} 年 ${parseInt(m)} 月 ${parseInt(d)} 日 的行事曆`;
  eventList.innerHTML = "";

  const dayEvents = eventsData[dateStr];

  if (dayEvents && dayEvents.length > 0) {
    dayEvents.forEach((evtItem, index) => {
      const li = document.createElement("li");

      // 判斷是舊有的「字串」還是新發文系統的「物件」
      const displayText = typeof evtItem === "object" ? evtItem.text : evtItem;

      // 行程內文
      const span = document.createElement("span");
      span.textContent = displayText;
      li.appendChild(span);

      // 🔒 關鍵判斷：只有管理員 (isAdmin) 才會產生並顯示「刪除按鈕」
      if (isAdmin) {
        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.classList.add("btn-delete-event");
        deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        deleteBtn.title = "刪除此行程";

        // 點擊刪除邏輯
        deleteBtn.addEventListener("click", () => {
          if (confirm(`確定要刪除「${displayText}」嗎？`)) {
            // 從陣列中移除該筆資料
            eventsData[dateStr].splice(index, 1);

            // 如果當天行程清空了，移除該日期的 Key
            if (eventsData[dateStr].length === 0) {
              delete eventsData[dateStr];
            }

            // 存檔、同步全站最後更新時間並重新渲染
            saveEventsToStorage();
            updateSiteLastUpdatedTime();
            displayEvents(dateStr);
          }
        });

        li.appendChild(deleteBtn);
      }

      eventList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "今日無預定行程。";
    li.classList.add("no-event");
    eventList.appendChild(li);
  }
}

// ---------------------------------------------------------
// 事件監聽區
// ---------------------------------------------------------

// 上一個月 / 下一個月
if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  });
}

// 查看今天
if (btnToday) {
  btnToday.addEventListener("click", () => {
    currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");

    selectedDateStr = `${year}-${month}-${day}`;
    renderCalendar(currentDate);
    displayEvents(selectedDateStr);
  });
}

// 切換指定日期
if (btnPickDate) {
  btnPickDate.addEventListener("click", () => {
    hiddenDateInput.showPicker
      ? hiddenDateInput.showPicker()
      : hiddenDateInput.click();
  });
}

if (hiddenDateInput) {
  hiddenDateInput.addEventListener("change", (e) => {
    if (!e.target.value) return;
    const picked = new Date(e.target.value);
    currentDate = picked;
    selectedDateStr = e.target.value;

    renderCalendar(currentDate);
    displayEvents(selectedDateStr);
  });
}

// 🔒 手動新增行程監聽（含權限保護）
if (btnAddEvent) {
  btnAddEvent.addEventListener("click", () => {
    if (!isAdmin) {
      alert("🔒 權限不足：請先登入管理員帳號！");
      return;
    }

    if (!selectedDateStr) {
      alert("請先在月曆上選擇一個日期！");
      return;
    }

    const newEventText = prompt(`請輸入 ${selectedDateStr} 的新行程：`);

    if (newEventText && newEventText.trim() !== "") {
      if (!eventsData[selectedDateStr]) {
        eventsData[selectedDateStr] = [];
      }
      eventsData[selectedDateStr].push(newEventText.trim());

      saveEventsToStorage();
      updateSiteLastUpdatedTime();
      displayEvents(selectedDateStr);
    }
  });
}
