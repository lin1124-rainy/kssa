// =========================================================
// 意見反映表單 - 直連 Google Form (js/feedback.js)
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const feedbackForm = document.getElementById("feedback-form");
  const submitBtn = document.getElementById("fb-submit-btn");
  const statusMsg = document.getElementById("fb-status-msg");

  // Google 表單背景提交網址
  const GOOGLE_FORM_ACTION_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSdO09AnnEypbfGKgyNXOQU9icgrCzXYC1617E14PQspXGZ9UA/formResponse";

  if (feedbackForm) {
    feedbackForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // 1. 取得網頁表單欄位內容
      const category = document.getElementById("fb-category").value;
      const title = document.getElementById("fb-title").value.trim();
      const content = document.getElementById("fb-content").value.trim();
      const name =
        document.getElementById("fb-name").value.trim() || "匿名同學";
      const email =
        document.getElementById("fb-email").value.trim() || "未提供 Email";

      // 2. 切換按鈕為載入狀態
      submitBtn.disabled = true;
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> 傳送中...`;

      if (statusMsg) {
        statusMsg.style.color = "#0284c7";
        statusMsg.innerText = "正在將您的意見傳送至學聯會...";
      }

      // 3. 對應你 Google 表單的正確 entry 代碼
      const formData = new FormData();
      formData.append("entry.366998613", category); // 類別
      formData.append("entry.456038364", title); // 主旨 / 標題
      formData.append("entry.1350030000", content); // 詳細內容描述
      formData.append("entry.527423137", name); // 姓名 / 班級
      formData.append("entry.1049533723", email); // 聯絡信箱

      try {
        // 背景偷偷發送 POST 請求給 Google Form（完全不跳頁）
        await fetch(GOOGLE_FORM_ACTION_URL, {
          method: "POST",
          body: formData,
          mode: "no-cors", // 跨網域發送必備
        });

        alert("🎉 意見反映已成功送出！感謝你的建言，學聯會幹部會儘速處理。");
        feedbackForm.reset();

        if (statusMsg) {
          statusMsg.style.color = "#16a34a";
          statusMsg.innerText = "✓ 意見已成功送出！";
          setTimeout(() => (statusMsg.innerText = ""), 5000);
        }
      } catch (error) {
        console.error("Submission error:", error);
        alert("⚠️ 傳送失敗，請檢查網路連線或稍後再試。");
        if (statusMsg) {
          statusMsg.style.color = "#ef4444";
          statusMsg.innerText = "傳送失敗，請重新嘗試。";
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }
});
