
// ==========================================
// Googleフォーム設定
// ==========================================

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfUG9axyWGu8VPHTq721mz_Dp3BuSJLv6QdBVrn4SIOlrFo1g/formResponse";

// Googleフォームのentry IDを設定
const ENTRY_IDS = {
  category: "entry.2126139826",
  book: "entry.1926963196",
  bookMessage: "entry.109613024",
  pages: "entry.1283088952",
  bugMessage: "entry.745806829",
  otherDetail: "entry.626174794"
};


// ==========================================
// 選択肢設定
// ==========================================

// 質問2：本の選択肢
const books = [
  "遺灰と黙示録",
  "無光の街のオフィーリア ―あの日見た蒼炎、空と声の色―"
];

// 質問4：該当ページ
const pages = [
  "Home",
  "Profile",
  "Library",
  "Contact"
];


// ==========================================
// DOM取得
// ==========================================

const form = document.getElementById("contactForm");

const bookSection = document.getElementById("bookSection");
const bugSection = document.getElementById("bugSection");
const otherSection = document.getElementById("otherDetail");

const otherText = document.getElementById("otherText");
const bookMessage = document.getElementById("bookMessage");
const bugMessage = document.getElementById("bugMessage");
const otherDetail = document.getElementById("otherDetailMessage");

const pageOptions = document.getElementById("pageOptions");

const status = document.getElementById("status");
const submitButton = document.getElementById("submitButton");
const bookSelect = document.getElementById("bookSelect");


// ==========================================
// 選択肢を自動生成
// ==========================================

// プルダウン生成
books.forEach((book, index) => {
  const option = document.createElement("option");
  option.value = book;
  option.textContent = book;
  bookSelect.appendChild(option);
});


// チェックボックス生成
pages.forEach((page, index) => {

  const label = document.createElement("label");
  const input = document.createElement("input");

  input.type = "checkbox";
  input.name = "pages";
  input.value = page;

  label.append(input, document.createTextNode(page));
  pageOptions.appendChild(label);

});


// ==========================================
// 質問1：分岐処理
// ==========================================

form.querySelectorAll('input[name="category"]')
  .forEach(input => {

    input.addEventListener("change", () => {

      const value = input.value;
      status.textContent = "";
      status.classList.remove("error");
      // すべて非表示
      bookSection.hidden = true;
      bugSection.hidden = true;
      otherSection.hidden = true;

      // 必須設定をリセット
      submitButton.hidden = true;
      submitButton.disabled = true;
      bookMessage.required = false;
      bugMessage.required = false;
      otherDetail.required = false;
      otherText.required = false;
      otherText.disabled = true;
      otherDetail.disabled = true;
      bookSelect.required = false;

      // 本の感想・誤字報告
      if (value === "作品についての感想・誤字報告") {

        bookSection.hidden = false;
        bookSelect.required = true;
        bookMessage.required = true;
        submitButton.hidden = false;

      }

      // サイトの不具合
      else if (value === "サイトの不具合・バグ報告") {

        bugSection.hidden = false;
        bugMessage.required = true;
        submitButton.hidden = false;

      }

      // その他
      else if (value === "その他") {

        otherSection.hidden = false;
        otherText.disabled = false;
        otherDetail.disabled = false;
        otherText.required = true;
        otherDetail.required = true;
        submitButton.hidden = false;

      }

      updateSubmitButton();
    });

  });


// ==========================================
// 送信ボタンの表示・活性制御
// ==========================================

function updateSubmitButton() {
  const category =
    form.querySelector('input[name="category"]:checked');

  if (!category) {
    submitButton.hidden = true;
    submitButton.disabled = true;
    return;
  }

  let isComplete = false;

  if (category.value === "作品についての感想・誤字報告") {
    isComplete =
      bookSelect.value !== "" &&
      bookMessage.value.trim() !== "";
  } else if (category.value === "サイトの不具合・バグ報告") {
    const selectedPages =
      pageOptions.querySelectorAll('input[name="pages"]:checked');
    isComplete =
      selectedPages.length > 0 &&
      bugMessage.value.trim() !== "";
  } else if (category.value === "その他") {
    isComplete =
      otherText.value.trim() !== "" &&
      otherDetail.value.trim() !== "";
  }

  submitButton.hidden = false;
  submitButton.disabled = !isComplete;
}

bookSelect.addEventListener("change", updateSubmitButton);
bookMessage.addEventListener("input", () => {
  status.textContent = "";
  status.classList.remove("error");
  updateSubmitButton();
});
bugMessage.addEventListener("input", () => {
  status.textContent = "";
  status.classList.remove("error");
  updateSubmitButton();
});
otherText.addEventListener("input", () => {
  status.textContent = "";
  status.classList.remove("error");
  updateSubmitButton();
});
otherDetail.addEventListener("input", () => {
  status.textContent = "";
  status.classList.remove("error");
  updateSubmitButton();
});
pageOptions.addEventListener("change", () => {
  status.textContent = "";
  status.classList.remove("error");
  updateSubmitButton();
});


// ==========================================
// Googleフォーム送信
// ==========================================

form.addEventListener("submit", event => {

  event.preventDefault();

  if (
    GOOGLE_FORM_URL.includes("FORM_ID") ||
    Object.values(ENTRY_IDS).some(id => id.includes("111111111") ||
      id.includes("222222222") ||
      id.includes("333333333") ||
      id.includes("444444444") ||
      id.includes("555555555") ||
      id.includes("666666666"))
  ) {
    status.textContent =
      "GoogleフォームのURLとentry IDが未設定です。form.jsの設定を入力してください。";
    status.classList.add("error");
    return;
  }

  status.classList.remove("error");

  const selectedCategory =
    form.querySelector('input[name="category"]:checked').value;

  const postForm = document.createElement("form");

  postForm.action = GOOGLE_FORM_URL;
  postForm.method = "POST";
  postForm.target = "googleFormFrame";

  // Googleフォームへ送る値
  const values = [];

  // 質問1
  values.push({
    name: ENTRY_IDS.category,
    value: selectedCategory === "その他"
      ? "__other_option__"
      : selectedCategory
  });

  // 質問2・3
  if (selectedCategory === "作品についての感想・誤字報告") {

    values.push({
      name: ENTRY_IDS.book,
      value: bookSelect.value
    });

    values.push({
      name: ENTRY_IDS.bookMessage,
      value: bookMessage.value
    });

  }

  // 質問4・5
  else if (selectedCategory === "サイトの不具合・バグ報告") {

    const selectedPages =
      form.querySelectorAll('input[name="pages"]:checked');

    selectedPages.forEach(page => {
      values.push({
        name: ENTRY_IDS.pages,
        value: page.value
      });
    });

    values.push({
      name: ENTRY_IDS.bugMessage,
      value: bugMessage.value
    });

  }

  // 質問6：その他
  else if (selectedCategory === "その他") {

    values.push({
      name: ENTRY_IDS.category + ".other_option_response",
      value: otherText.value
    });

    values.push({
      name: ENTRY_IDS.otherDetail,
      value: otherDetail.value
    });

  }


  // POST用のinputを生成
  values.forEach(item => {

    const input = document.createElement("input");

    input.type = "hidden";
    input.name = item.name;
    input.value = item.value;

    postForm.appendChild(input);

    const sentinel = document.createElement("input");
    sentinel.type = "hidden";
    sentinel.name = item.name + "_sentinel";
    sentinel.value = "";
    postForm.appendChild(sentinel);
  });

  [
    ["fvv", "1"],
    ["pageHistory", "0"],
    ["fbzx", "-1846768452905012280"]
  ].forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    postForm.appendChild(input);
  });

  document.body.appendChild(postForm);

  status.textContent = "送信しています...";

  const iframe = document.getElementById("googleFormFrame");
  const onSubmitted = () => {
    postForm.remove();
    status.textContent =
      "ありがとうございます！";
  };
  iframe.addEventListener("load", onSubmitted, { once: true });

  postForm.submit();

});
