// =========================================================
// 四角隱藏點擊觸發登入 Modal 與驗證邏輯 (js/login.js)
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  // 記錄四個角落點擊狀態
  const clickedCorners = new Set();
  const totalCorners = 4;

  const loginModal = document.getElementById("admin-login-modal");
  const loginCloseBtn = document.getElementById("login-modal-close");
  const loginForm = document.getElementById("admin-login-form");
  const loginErrorMsg = document.getElementById("login-error-msg");

  const cornerTL = document.getElementById("corner-tl");
  const cornerTR = document.getElementById("corner-tr");
  const cornerBL = document.getElementById("corner-bl");
  const cornerBR = document.getElementById("corner-br");

  // 1. 綁定四個角落點擊事件
  const corners = [
    { elem: cornerTL, id: "tl" },
    { elem: cornerTR, id: "tr" },
    { elem: cornerBL, id: "bl" },
    { elem: cornerBR, id: "br" },
  ];

  corners.forEach((item) => {
    if (item.elem) {
      item.elem.addEventListener("click", () => {
        clickedCorners.add(item.id);

        // 如果四個角落都點過一遍，開起登入 Modal
        if (clickedCorners.size === totalCorners) {
          openLoginModal();
          clickedCorners.clear(); // 清空紀錄備用
        }
      });
    }
  });

  // 2. 開啟與關閉 Modal 視窗
  function openLoginModal() {
    if (loginModal) {
      loginModal.classList.add("active");
      if (loginErrorMsg) loginErrorMsg.style.display = "none";
      const accountInput = document.getElementById("login-account");
      if (accountInput) accountInput.focus();
    }
  }

  function closeLoginModal() {
    if (loginModal) {
      loginModal.classList.remove("active");
      if (loginForm) loginForm.reset();
    }
  }

  if (loginCloseBtn) {
    loginCloseBtn.addEventListener("click", closeLoginModal);
  }

  if (loginModal) {
    loginModal.addEventListener("click", (e) => {
      if (e.target === loginModal) closeLoginModal();
    });
  }

  // 3. 登入驗證處理
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const account = document.getElementById("login-account").value.trim();
      const password = document.getElementById("login-password").value.trim();

      // 💡 預設幹部登入憑證 (可自行修改)
      const DEFAULT_ACCOUNT = "0000000";
      const DEFAULT_PASSWORD = "0000000";

      if (account === DEFAULT_ACCOUNT && password === DEFAULT_PASSWORD) {
        // 登入成功：寫入 Session 狀態並跳轉至發布管理頁面
        sessionStorage.setItem("kshs_is_admin", "true");
        alert("登入成功！即將跳轉至管理後台。");
        window.location.href = "publish.html";
      } else {
        // 登入失敗：顯示錯誤提示
        if (loginErrorMsg) {
          loginErrorMsg.style.display = "block";
        }
      }
    });
  }

  // ---------------------------------------------------------
  // 🔒 4. 登出按鈕顯示與點擊監聽 (移至 DOMContentLoaded 內部)
  // ---------------------------------------------------------
  const logoutBtn = document.getElementById("admin-logout-btn");
  const isAdmin = sessionStorage.getItem("kshs_is_admin") === "true";

  if (logoutBtn) {
    if (isAdmin) {
      // 若是管理員身分，顯示登出按鈕
      logoutBtn.style.display = "inline-flex";

      // 點擊登出
      logoutBtn.addEventListener("click", () => {
        if (confirm("確定要登出學聯會管理員身分嗎？")) {
          sessionStorage.removeItem("kshs_is_admin"); // 拔除權限鑰匙
          alert("已成功登出管理員身分！");
          window.location.reload(); // 重新整理頁面，恢復一般學生視角
        }
      });
    } else {
      // 一般學生狀態，隱藏按鈕
      logoutBtn.style.display = "none";
    }
  }
});
