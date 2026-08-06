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

    // 點擊選單內部連結時自動關閉
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
    const link = item.querySelector(":scope > a");

    if (link) {
      link.addEventListener("click", (e) => {
        if (window.innerWidth <= 1024) {
          e.preventDefault(); // 阻止 <a href="#"> 跳轉頁面頂端

          dropdownItems.forEach((otherItem) => {
            if (otherItem !== item) {
              otherItem.classList.remove("is-open");
            }
          });

          item.classList.toggle("is-open");
        }
      });
    }
  });

  // 💊 電腦版滑動膠囊邏輯 (改用 if 包裹，避免 early return 攔截後續腳本)
  if (navList && activePill) {
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
        toggleDrawer(false);
        updatePillPosition();
      }
    });
  }

  // =========================================================
  // 💡 全站真實訪客計數器 (使用 CountAPI)
  // =========================================================
  function updateVisitorCount() {
    const visitorSpan = document.getElementById("visitor-count");
    if (!visitorSpan) return;

    const namespace = "lin1124-rainy-kssa";
    const key = "site_visits";

    fetch(`https://api.countapi.xyz/hit/${namespace}/${key}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.value !== undefined) {
          visitorSpan.innerText = data.value.toLocaleString();
        }
      })
      .catch((error) => {
        console.error("訪客計數器載入失敗:", error);
        visitorSpan.innerText = "累積中...";
      });
  }

  updateVisitorCount();
});
