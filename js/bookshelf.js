function setupBookSlider() {
  document.querySelectorAll(".slider").forEach((slider) => {
    const track = slider.querySelector("#slideTrack");
    const slides = track ? track.querySelectorAll(".slide") : [];
    const prevButton = slider.querySelector("#prev");
    const nextButton = slider.querySelector("#next");
    const pageNumber = slider.querySelector("#pageNumber");

    if (!track || slides.length === 0 || !prevButton || !nextButton || !pageNumber) return;

    let currentIndex = 0;
    let isAnimating = false;

    const updateButtons = () => {
      prevButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex === slides.length - 1;
      pageNumber.textContent = `${currentIndex + 1} / ${slides.length}`;
    };

    const moveSlide = (direction) => {
      if (isAnimating) return;

      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= slides.length) return;

      isAnimating = true;
      currentIndex = nextIndex;

      const slideWidth = slides[0].getBoundingClientRect().width;
      track.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
      updateButtons();
    };

    track.addEventListener("transitionend", () => {
      isAnimating = false;
    });
    prevButton.addEventListener("click", () => moveSlide(-1));
    nextButton.addEventListener("click", () => moveSlide(1));
    window.addEventListener("resize", () => {
      const slideWidth = slides[0].getBoundingClientRect().width;
      track.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
    });

    updateButtons();
  });
}

function setupPageGifPlacement() {
  document.querySelectorAll("#page-gif").forEach((pageGif) => {
    if (pageGif.dataset.placementReady === "true") return;
    pageGif.dataset.placementReady = "true";

    const placePageGif = () => {
      const bounds = pageGif.getBoundingClientRect();
      const maxLeft = Math.max(0, window.innerWidth - bounds.width);
      const maxTop = Math.max(0, window.innerHeight - bounds.height);
      pageGif.style.left = `${window.scrollX + Math.random() * maxLeft}px`;
      pageGif.style.top = `${window.scrollY + Math.random() * maxTop}px`;
      pageGif.style.visibility = "visible";
    };

    if (pageGif.complete) {
      placePageGif();
    } else {
      pageGif.addEventListener("load", placePageGif, { once: true });
    }
  });
}

function setupBookUnlock() {
  document.querySelectorAll("[data-book-unlock]").forEach((unlock) => {
    const form = unlock.querySelector("[data-unlock-form]");
    const answerInput = unlock.querySelector("[data-unlock-answer]");
    const hint = unlock.querySelector("[data-unlock-hint]");
    const result = document.querySelector(unlock.dataset.resultTarget);

    if (!form || !answerInput || !result) return;

    let acceptedAnswers = [];
    if (unlock.dataset.answers) {
      try {
        acceptedAnswers = JSON.parse(unlock.dataset.answers);
      } catch (error) {
        console.error("data-answers のJSONが正しくありません。", error);
      }
    } else if (unlock.dataset.answer) {
      acceptedAnswers = [unlock.dataset.answer];
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const answer = answerInput.value.trim();
      if (!acceptedAnswers.includes(answer)) {
        if (hint) {
          hint.textContent = unlock.dataset.hint || "";
          hint.classList.add("show");
        }
        return;
      }

      unlock.classList.add("hide");
      const successDelay = Number.parseInt(unlock.dataset.successDelay || "400", 10);

      window.setTimeout(() => {
        unlock.hidden = true;
        result.hidden = false;
        requestAnimationFrame(() => result.classList.add("show"));
      }, successDelay);
    });
  });
}

function setupBookTextModal() {
  document.querySelectorAll("[data-text-modal]").forEach((modal) => {
    const title = modal.querySelector("[data-modal-title]");
    const content = modal.querySelector("[data-modal-content]");
    const frame = modal.querySelector("[data-modal-frame]");
    const closeButton = modal.querySelector("[data-modal-close]");
    let pageScrollY = 0;

    if (!title || !content || !frame) return;

    document.querySelectorAll("[data-modal-text]").forEach((button) => {
      button.addEventListener("click", () => {
        const textPath = button.dataset.modalText;
        if (!textPath) {
          console.error("モーダルのテキストファイルが指定されていません。");
          return;
        }

        const titleText = button.dataset.modalTitle
          || button.querySelector("img")?.alt
          || "";
        const strikethrough = button.dataset.strikethrough;
        const strikethroughIndex = strikethrough ? titleText.indexOf(strikethrough) : -1;

        if (strikethroughIndex === -1) {
          title.textContent = titleText;
        } else {
          const deletedText = document.createElement("del");
          deletedText.textContent = strikethrough;
          title.replaceChildren(
            document.createTextNode(titleText.slice(0, strikethroughIndex)),
            deletedText,
            document.createTextNode(titleText.slice(strikethroughIndex + strikethrough.length))
          );
        }

        content.textContent = "読み込み中…";
        frame.src = textPath;
        pageScrollY = window.scrollY;
        document.body.style.top = `-${pageScrollY}px`;
        document.body.classList.add("modal-open");
        modal.showModal();
      });
    });

    window.addEventListener("message", (event) => {
      if (event.source !== frame.contentWindow) return;

      const message = event.data;
      if (!message || message.type !== "modal-text" || typeof message.text !== "string") return;
      content.textContent = message.text;
    });

    closeButton?.addEventListener("click", () => modal.close());

    modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.close();
    });

    modal.addEventListener("close", () => {
      document.body.classList.remove("modal-open");
      document.body.style.top = "";
      window.scrollTo(0, pageScrollY);
    });

    modal.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        modal.close();
      }
    });
  });
}

setupBookSlider();
setupPageGifPlacement();
setupBookUnlock();
setupBookTextModal();
