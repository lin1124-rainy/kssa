document.addEventListener("DOMContentLoaded", () => {
  const navList = document.querySelector(".nav-list");
  const activePill = document.querySelector(".nav-active-pill");
  const navLinks = document.querySelectorAll(".nav-list .nav-item > a");

  if (!navList || !activePill) return;

  // 移動膠囊並只把目標文字改為深色
  function movePillTo(targetLink) {
    if (!targetLink) return;

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

  // 1. 頁面載入時：預設停在帶有 .active 的選項上（例如行事曆）
  const currentActiveLink = document.querySelector(
    ".nav-list .nav-item.active > a",
  );
  if (currentActiveLink) {
    setTimeout(() => movePillTo(currentActiveLink), 50);
  }

  // 2. 滑鼠移入任意選項：膠囊滑過去，該選項變深色，行事曆自動變回淡灰字
  navLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      movePillTo(link);
    });
  });

  // 3. 滑鼠離開整個導覽列：膠囊滑回原本的頁面選項（行事曆），行事曆恢復深色
  navList.addEventListener("mouseleave", () => {
    if (currentActiveLink) {
      movePillTo(currentActiveLink);
    } else {
      activePill.style.opacity = "0";
      navLinks.forEach((link) => link.classList.remove("is-pill-active"));
    }
  });

  // 4. 視窗縮放校正
  window.addEventListener("resize", () => {
    const currentLink = document.querySelector(
      ".nav-list .nav-item > a.is-pill-active",
    );
    if (currentLink) movePillTo(currentLink);
  });
});
