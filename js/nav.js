document.addEventListener("DOMContentLoaded", () => {
  const hamburgerBtn = document.querySelector(".hamburger-btn");
  const navList = document.querySelector(".nav-list");
  const activePill = document.querySelector(".nav-active-pill");
  const navLinks = document.querySelectorAll(".nav-list .nav-item > a");

  // 💡 自動動態建立背景遮罩 (Backdrop)
  let overlay = document.querySelector(".nav-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "nav-overlay";
    document.body.appendChild(overlay);
  }

  // 🍔 開關抽屜選單邏輯
  function toggleDrawer(open) {
    const shouldOpen =
      open !== undefined ? open : !navList.classList.contains("active");

    navList.classList.toggle("active", shouldOpen);
    overlay.classList.toggle("active", shouldOpen);

    // 開啟時鎖定背景頁面滾動，關閉時恢復
    document.body.style.overflow = shouldOpen ? "hidden" : "";
  }

  if (hamburgerBtn && navList) {
    // 點擊漢堡按鈕切換
    hamburgerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleDrawer();
    });

    // 點擊右側半透明遮罩自動關閉選單
    overlay.addEventListener("click", () => {
      toggleDrawer(false);
    });

    // 點擊選單內部連結時自動關閉（適合單頁跳轉或體驗）
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (
          window.innerWidth <= 1024 &&
          !link.parentElement.classList.contains("has-dropdown")
        ) {
          toggleDrawer(false);
        }
      });
    });
  }

  // 💡 手機/側滑選單：點擊才展開 / 收合子選單 (Accordion)
  const dropdownItems = document.querySelectorAll(
    ".nav-list .nav-item.has-dropdown",
  );

  dropdownItems.forEach((item) => {
    // 💡 關鍵修正：改用 :scope > a 或 firstElementChild 正確抓取第一層 <a> 標籤
    const link = item.querySelector(":scope > a");

    if (link) {
      link.addEventListener("click", (e) => {
        // 僅在手機/平板寬度下觸發點擊展開
        if (window.innerWidth <= 1024) {
          e.preventDefault(); // 阻止 <a href="#"> 跳轉頁面頂端

          // 開啟當前選項時，自動關閉其他已開啟的項目
          dropdownItems.forEach((otherItem) => {
            if (otherItem !== item) {
              otherItem.classList.remove("is-open");
            }
          });

          // 切換當前項目的展開/收合狀態
          item.classList.toggle("is-open");
        }
      });
    }
  });

  // 💊 電腦版滑動膠囊邏輯 (維持原樣)
  if (!navList || !activePill) return;

  function movePillTo(targetLink) {
    if (window.innerWidth <= 1024 || !targetLink) {
      activePill.style.opacity = "0";
      navLinks.forEach((link) => link.classList.remove("is-pill-active"));
      return;
    }

    navLinks.forEach((link) => link.classList.remove("is-pill-active"));
    targetLink.classList.add("is-pill-active");

    const targetRect = targetLink.getBoundingClientRect();
    const container = navList.closest(".nav-wrapper") || navList;
    const containerRect = container.getBoundingClientRect();

    const left = targetRect.left - containerRect.left;
    const top = targetRect.top - containerRect.top;
    const width = targetRect.width;
    const height = targetRect.height;

    activePill.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    activePill.style.width = `${width}px`;
    activePill.style.height = `${height}px`;
    activePill.style.opacity = "1";
  }

  const currentActiveLink = document.querySelector(
    ".nav-list .nav-item.active > a",
  );

  function updatePillPosition() {
    const activeLink =
      document.querySelector(".nav-list .nav-item > a.is-pill-active") ||
      currentActiveLink;
    if (activeLink) movePillTo(activeLink);
  }

  if (currentActiveLink) {
    requestAnimationFrame(() => movePillTo(currentActiveLink));

    window.addEventListener("load", () => {
      setTimeout(() => movePillTo(currentActiveLink), 50);
    });

    if (document.fonts) {
      document.fonts.ready.then(() => movePillTo(currentActiveLink));
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => movePillTo(link));
  });

  navList.addEventListener("mouseleave", () => {
    if (window.innerWidth > 1024 && currentActiveLink) {
      movePillTo(currentActiveLink);
    } else {
      activePill.style.opacity = "0";
      navLinks.forEach((link) => link.classList.remove("is-pill-active"));
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth <= 1024) {
      activePill.style.opacity = "0";
      navLinks.forEach((link) => link.classList.remove("is-pill-active"));
    } else {
      toggleDrawer(false); // 放大回電腦版時自動關閉手機版抽屜
      updatePillPosition();
    }
  });
});
