document.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    document.body.classList.add("keyboard-navigation");
  }
});

document.addEventListener("pointerdown", () => {
  document.body.classList.remove("keyboard-navigation");
});

const heroQuotes = [
  {
    text: "きっと、今日の広い朝は、あれのためにある。",
    source: "遺灰と黙示録"
  },
  {
    text: "深いため息と、火の爆ぜる小さな音は同時だった。\n何もない視界に光が灯る。",
    source: "無光の街のオフィーリア —あの日見た蒼炎、空と声の色—"
  },
  {
    text: "冬の夜は、やっぱりあの人だった。",
    source: "from twilight to dawn『これがいつか恋になるとして』"
  },
  {
    text: "光を織り交ぜた金糸の髪は、彼の歩みに合わせ、\nふわり、ゆらりと揺れる。",
    source: "青い空は貴方"
  }
];
const heroQuote = heroQuotes[Math.floor(Math.random() * heroQuotes.length)];
const heroQuoteElement = document.querySelector(".hero-quote");
const heroQuoteText = document.getElementById("heroQuote");
const heroQuoteSource = document.getElementById("heroQuoteSource");

if (
  heroQuoteElement &&
  heroQuoteText &&
  heroQuoteSource &&
  heroQuote &&
  typeof heroQuote.text === "string" &&
  heroQuote.text.trim() &&
  typeof heroQuote.source === "string" &&
  heroQuote.source.trim()
) {
  heroQuoteText.textContent = heroQuote.text;
  heroQuoteSource.textContent = heroQuote.source;
  heroQuoteElement.hidden = false;
}

const secretTrigger = document.querySelector(".hero-secret-trigger");
const secretModal = document.getElementById("secretModal");
const secretModalText = document.getElementById("secretModalText");
const secretModalContent = document.getElementById("secretModalContent");
let pageScrollY = 0;

secretTrigger.addEventListener("click", () => {
  secretModalContent.textContent = "読み込み中…";
  secretModalText.src = "text/hidden-message.html";
  pageScrollY = window.scrollY;
  document.body.style.top = `-${pageScrollY}px`;
  document.body.classList.add("modal-open");
  secretModal.showModal();
});

window.addEventListener("message", (event) => {
  if (event.source !== secretModalText.contentWindow) return;

  const message = event.data;
  if (!message || message.type !== "modal-groups") return;
  if (typeof message.intro !== "string" ||
    !Array.isArray(message.groups) ||
    !message.groups.every((group) =>
    group &&
    typeof group.label === "string" &&
    group.label.trim() &&
    Array.isArray(group.entries) &&
    group.entries.length > 0 &&
    group.entries.every((entry) =>
      entry &&
      typeof entry.label === "string" &&
      typeof entry.value === "string"
    )
  )) {
    console.error("隠しメッセージのリストデータが不正です。");
    secretModalContent.textContent = "メッセージを読み込めませんでした。";
    return;
  }

  const content = document.createDocumentFragment();
  if (message.intro) {
    const intro = document.createElement("p");
    intro.className = "secret-info-intro";
    intro.textContent = message.intro;
    content.appendChild(intro);
  }

  message.groups.forEach(({ label, entries }) => {
    const section = document.createElement("section");
    section.className = "secret-info-group";
    const heading = document.createElement("h4");
    const list = document.createElement("dl");
    list.className = "secret-info-list";
    heading.textContent = label;

    entries.forEach(({ label: term, value }) => {
      const termElement = document.createElement("dt");
      const descriptionElement = document.createElement("dd");
      termElement.textContent = term;
      descriptionElement.textContent = value;
      list.append(termElement, descriptionElement);
    });

    section.append(heading, list);
    content.appendChild(section);
  });

  secretModalContent.replaceChildren(content);
});

document.getElementById("closeSecretModal").addEventListener("click", () => {
  secretModal.close();
});

secretModal.addEventListener("click", (event) => {
  if (event.target === secretModal) {
    secretModal.close();
  }
});

secretModal.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  document.body.style.top = "";
  window.scrollTo(0, pageScrollY);
});
