document.addEventListener("DOMContentLoaded", () => {
  const hamburgerBtn = document.querySelector(".hamburger-btn");
  const navList = document.querySelector(".nav-list");
  const activePill = document.querySelector(".nav-active-pill");
  const navLinks = document.querySelectorAll(".nav-list .nav-item > a");

  // 🍔 漢堡按鈕開關
  if (hamburgerBtn && navList) {
    hamburgerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navList.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!hamburgerBtn.contains(e.target) && !navList.contains(e.target)) {
        navList.classList.remove("active");
      }
    });
  }

  // 💊 電腦版滑動膠囊
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
    // 以 .nav-wrapper 作為相協定位基準點
    const wrapperRect = navList.parentElement.getBoundingClientRect();

    const left = targetRect.left - wrapperRect.left;
    const top = targetRect.top - wrapperRect.top;
    const width = targetRect.width;
    const height = targetRect.height;

    activePill.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    activePill.style.width = `${width}px`;
    activePill.style.height = `${height}px`;
    activePill.style.opacity = "1";
  }

  // 初始化：定位至當前頁面
  const currentActiveLink = document.querySelector(
    ".nav-list .nav-item.active > a",
  );
  if (currentActiveLink) {
    requestAnimationFrame(() => {
      setTimeout(() => movePillTo(currentActiveLink), 100);
    });
  }

  // Hover 事件監聽
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
      const currentLink =
        document.querySelector(".nav-list .nav-item > a.is-pill-active") ||
        currentActiveLink;
      if (currentLink) movePillTo(currentLink);
    }
  });
});
