document.addEventListener("DOMContentLoaded", () => {
  const hamburgerBtn = document.querySelector(".hamburger-btn");
  const navList = document.querySelector(".nav-list");
  const activePill = document.querySelector(".nav-active-pill");
  const navLinks = document.querySelectorAll(".nav-list .nav-item > a");

  // =========================================================
  // 1. 🍔 漢堡選單點擊切換邏輯 (手機/平板版)
  // =========================================================
  if (hamburgerBtn && navList) {
    hamburgerBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // 防止點擊事件冒泡
      navList.classList.toggle("active");
    });

    // 點擊空白處自動收合手機選單
    document.addEventListener("click", (e) => {
      if (!hamburgerBtn.contains(e.target) && !navList.contains(e.target)) {
        navList.classList.remove("active");
      }
    });
  }

  // =========================================================
  // 2. 💊 滑動膠囊邏輯 (僅在電腦版/螢幕 > 768px 時運作)
  // =========================================================
  if (!navList || !activePill) return;

  // 移動膠囊並只把目標文字改為深色
  function movePillTo(targetLink) {
    // 螢幕小於等於 768px (手機版) 時，直接隱藏膠囊不計算
    if (window.innerWidth <= 768 || !targetLink) {
      activePill.style.opacity = "0";
      return;
    }

    // 清除所有人深色狀態，只賦予當前被膠囊蓋住的項目深色
    navLinks.forEach((link) => link.classList.remove("is-pill-active"));
    targetLink.classList.add("is-pill-active");

    const targetRect = targetLink.getBoundingClientRect();
    const listRect = navList.getBoundingClientRect();

    const left = targetRect.left - listRect.left;
    const top = targetRect.top - listRect.top;
    const width = targetRect.width;
    const height = targetRect.height;

    activePill.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    activePill.style.width = `${width}px`;
    activePill.style.height = `${height}px`;
    activePill.style.opacity = "1";
  }

  // 頁面載入時預設停在帶有 .active 的選項上
  const currentActiveLink = document.querySelector(
    ".nav-list .nav-item.active > a",
  );
  if (currentActiveLink) {
    setTimeout(() => movePillTo(currentActiveLink), 50);
  }

  // 滑鼠移入任意選項：膠囊滑過去
  navLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      movePillTo(link);
    });
  });

  // 滑鼠離開整個導覽列：膠囊滑回原本頁面選項
  navList.addEventListener("mouseleave", () => {
    if (window.innerWidth > 768 && currentActiveLink) {
      movePillTo(currentActiveLink);
    } else {
      activePill.style.opacity = "0";
      navLinks.forEach((link) => link.classList.remove("is-pill-active"));
    }
  });

  // 視窗縮放動態校正
  window.addEventListener("resize", () => {
    if (window.innerWidth <= 768) {
      activePill.style.opacity = "0";
      navLinks.forEach((link) => link.classList.remove("is-pill-active"));
    } else {
      const currentLink =
        document.querySelector(".nav-list .nav-item > a.is-pill-active") ||
        currentActiveLink;
      if (currentLink) movePillTo(currentLink);
    }
  });
});
