// =========================================================
// 社團介紹 - CSV 動態同步、隨機洗牌與實時搜尋 (js/clubs.js)
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  // 正式 Google 試算表 CSV 發布網址
  const GOOGLE_SHEET_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRQFa_J_NDVadyosi-5x0moMO9X5FHlcY4BR4dzYfPx8kAaKoYk7kw8XfgzQRBjI3uPefJs-2N_0Pgb/pub?output=csv";

  let clubDataList = [];
  let currentCategory = "all";
  let currentSearchQuery = "";

  const clubGrid = document.getElementById("club-grid");
  const searchInput = document.getElementById("club-search-input");
  const categoryPills = document.querySelectorAll(".category-pill");
  const shuffleBtn = document.getElementById("shuffle-btn");

  // Modal 視窗元素
  const modal = document.getElementById("club-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalImg = document.getElementById("modal-img");
  const modalTitle = document.getElementById("modal-title");
  const modalCat = document.getElementById("modal-cat");
  const modalFee = document.getElementById("modal-fee");
  const modalSlogan = document.getElementById("modal-slogan");
  const modalContent = document.getElementById("modal-content");
  const modalIgLink = document.getElementById("modal-ig-link");

  // 1. 初始化入口
  init();

  async function init() {
    if (GOOGLE_SHEET_CSV_URL && GOOGLE_SHEET_CSV_URL.startsWith("http")) {
      try {
        const response = await fetch(GOOGLE_SHEET_CSV_URL);
        const csvText = await response.text();
        clubDataList = parseRobustCSV(csvText);
      } catch (err) {
        console.error("CSV 載入失敗:", err);
      }
    }

    // 隨機洗牌排序
    shuffleArray(clubDataList);
    renderClubs();
  }

  // 2. 隨機洗牌演算法 (Fisher-Yates)
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // 💡 動態生成「雄中高質感漸層預設封面圖」SVG
  function createDefaultCoverSVG(clubName) {
    const safeName = clubName || "高雄中學社團";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#0284c7" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <circle cx="400" cy="225" r="160" fill="#ffffff" opacity="0.04" />
      <circle cx="400" cy="225" r="100" fill="#ffffff" opacity="0.03" />
      <text x="50%" y="42%" dominant-baseline="middle" text-anchor="middle" fill="#38bdf8" font-size="24" font-weight="bold" font-family="sans-serif" letter-spacing="4">KSHS CLUB</text>
      <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-size="44" font-weight="800" font-family="sans-serif" letter-spacing="2">${safeName}</text>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  // 3. 支援雙引號與多行換行的 CSV 解析器
  function parseRobustCSV(csvText) {
    const rows = [];
    let currentRow = [];
    let currentCell = "";
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if ((char === "\r" || char === "\n") && !inQuotes) {
        if (char === "\r" && nextChar === "\n") i++;
        currentRow.push(currentCell.trim());
        if (currentRow.length > 1 || currentRow[0] !== "") {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
    if (currentCell !== "" || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
    }

    const clubList = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length >= 3) {
        const clubName = row[2] ? row[2].trim() : "未命名社團";

        // 社費格式化
        let rawFee = row[5] ? row[5].trim() : "免社費";
        if (rawFee === "0" || rawFee === "0元") rawFee = "免社費";
        else if (rawFee && !rawFee.includes("元") && !rawFee.includes("免")) {
          rawFee = `${rawFee} 元`;
        }

        // 整理 IG 網址與 Slogan
        let rawIg = row[7] ? row[7].trim() : "";
        let rawSlogan = row[8] ? row[8].trim() : "";

        if (!rawIg && rawSlogan.toLowerCase().includes("instagram.com")) {
          rawIg = rawSlogan;
          rawSlogan = "";
        } else if (rawSlogan.toLowerCase().includes("http")) {
          rawSlogan = "";
        }

        clubList.push({
          name: clubName,
          category: row[3] ? row[3].trim() : "星期三社團",
          desc: row[4] ? row[4].trim() : "尚無簡介內容。",
          fee: rawFee,
          image: formatGoogleDriveImgUrl(row[6], clubName),
          ig: cleanIgUrl(rawIg),
          slogan: rawSlogan,
        });
      }
    }
    return clubList;
  }

  // 自動修復 IG 網址格式
  function cleanIgUrl(url) {
    if (!url) return "";
    let clean = url.trim();
    if (clean === "#" || clean.length < 5) return "";
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = "https://" + clean;
    }
    return clean;
  }

  // 自動轉換 Google Drive 上傳圖片（若無圖片則帶入動態預設封面）
  function formatGoogleDriveImgUrl(url, clubName) {
    if (!url) return createDefaultCoverSVG(clubName);
    if (
      url.includes("drive.google.com") ||
      url.includes("googleusercontent.com")
    ) {
      const match =
        url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
      }
    }
    return url;
  }

  // 4. 渲染社團卡片
  function renderClubs() {
    clubGrid.innerHTML = "";

    const filtered = clubDataList.filter((club) => {
      const matchCat =
        currentCategory === "all" || club.category === currentCategory;
      const q = currentSearchQuery.toLowerCase();
      const matchSearch =
        !q ||
        club.name.toLowerCase().includes(q) ||
        club.slogan.toLowerCase().includes(q) ||
        club.desc.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      clubGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 60px 0; font-size: 15px;">找不到符合選取條件的社團。</div>`;
      return;
    }

    filtered.forEach((club) => {
      const card = document.createElement("div");
      card.className = "club-card";
      const defaultImg = createDefaultCoverSVG(club.name);

      card.innerHTML = `
        <div class="club-cover-wrapper">
          <img class="club-cover-img" src="${club.image}" alt="${club.name}" onerror="this.src='${defaultImg}'" />
        </div>
        <div class="club-card-body">
          <div class="club-card-header">
            <span class="club-badge">${club.category}</span>
          </div>
          <h3 class="club-name">${club.name}</h3>
          ${club.slogan ? `<p class="club-slogan">「${club.slogan}」</p>` : ""}
          <p class="club-desc">${club.desc}</p>
          <div class="club-card-footer">
            <span class="club-fee"><i class="fa-solid fa-coins"></i> 社費：${club.fee}</span>
            <button type="button" class="btn-detail-trigger">完整介紹</button>
          </div>
        </div>
      `;

      card
        .querySelector(".btn-detail-trigger")
        .addEventListener("click", () => {
          openModal(club);
        });

      clubGrid.appendChild(card);
    });
  }

  // 5. 開啟 Modal 彈出視窗
  function openModal(club) {
    const defaultImg = createDefaultCoverSVG(club.name);
    modalImg.src = club.image;
    modalImg.onerror = () => {
      modalImg.src = defaultImg;
    };

    modalTitle.innerText = club.name;
    modalCat.innerText = club.category;
    modalFee.innerText = `社費：${club.fee}`;
    modalSlogan.innerText = club.slogan ? `「${club.slogan}」` : "";
    modalContent.innerText = club.desc;

    if (club.ig) {
      modalIgLink.href = club.ig;
      modalIgLink.style.display = "inline-flex";
    } else {
      modalIgLink.style.display = "none";
    }

    modal.classList.add("active");
  }

  // 關閉 Modal
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", () =>
      modal.classList.remove("active"),
    );
  }
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("active");
    });
  }

  // 6. 搜尋框監聽
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value.trim();
      renderClubs();
    });
  }

  // 7. 分類標籤監聽
  categoryPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      categoryPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      currentCategory = pill.getAttribute("data-cat");
      renderClubs();
    });
  });

  // 8. 手動隨機換一換按鈕
  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", () => {
      shuffleArray(clubDataList);
      renderClubs();
    });
  }
});
