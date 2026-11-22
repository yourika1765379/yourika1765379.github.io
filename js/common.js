async function include(id, file) {
    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`${file} を読み込めませんでした: ${response.status}`);
        document.getElementById(id).innerHTML = await response.text();
    } catch (error) {
        console.error(error);
    }
}

function setupModalScrollbars() {
    const scrollAreas = document.querySelectorAll(".text-modal, .modal-text-content");
    const updateScrollbars = [];

    scrollAreas.forEach((scrollArea) => {
        const modal = scrollArea.closest(".text-modal") || scrollArea;
        const indicator = document.createElement("div");
        const thumb = document.createElement("div");
        let hideTimer;
        let dragState;

        indicator.className = "modal-scrollbar-indicator";
        indicator.setAttribute("aria-hidden", "true");
        thumb.className = "modal-scrollbar-thumb";
        indicator.appendChild(thumb);
        modal.appendChild(indicator);

        const updateScrollbar = () => {
            const bounds = scrollArea.getBoundingClientRect();
            const scrollRange = scrollArea.scrollHeight - scrollArea.clientHeight;
            const trackHeight = bounds.height - 8;

            if (scrollRange <= 0 || trackHeight <= 0 || bounds.width <= 0 || bounds.height <= 0) {
                indicator.classList.remove("is-visible");
                return null;
            }

            const thumbHeight = Math.min(
                trackHeight,
                Math.max(24, trackHeight * scrollArea.clientHeight / scrollArea.scrollHeight)
            );
            const thumbTravel = trackHeight - thumbHeight;
            const scrollProgress = Math.min(1, Math.max(0, scrollArea.scrollTop / scrollRange));

            indicator.style.top = `${bounds.top + 4}px`;
            indicator.style.left = `${bounds.right - 8}px`;
            indicator.style.height = `${trackHeight}px`;
            thumb.style.height = `${thumbHeight}px`;
            thumb.style.transform = `translateY(${thumbTravel * scrollProgress}px)`;

            return { bounds, scrollRange, thumbHeight, thumbTravel };
        };

        const showScrollbar = () => {
            if (!updateScrollbar()) return;

            indicator.classList.add("is-visible");
            window.clearTimeout(hideTimer);
            hideTimer = window.setTimeout(() => {
                indicator.classList.remove("is-visible");
            }, 1000);
        };

        scrollArea.addEventListener("scroll", showScrollbar, { passive: true });

        indicator.addEventListener("pointerdown", (event) => {
            if (event.target === thumb) return;

            const geometry = updateScrollbar();
            if (!geometry || geometry.thumbTravel <= 0) return;

            const position = event.clientY - geometry.bounds.top - 4;
            const progress = (position - geometry.thumbHeight / 2) / geometry.thumbTravel;
            scrollArea.scrollTop = Math.min(1, Math.max(0, progress)) * geometry.scrollRange;
            showScrollbar();
        });

        thumb.addEventListener("pointerdown", (event) => {
            const geometry = updateScrollbar();
            if (!geometry || geometry.thumbTravel <= 0) return;

            event.preventDefault();
            event.stopPropagation();
            dragState = {
                pointerId: event.pointerId,
                startY: event.clientY,
                startScrollTop: scrollArea.scrollTop,
                geometry
            };
            thumb.setPointerCapture(event.pointerId);
            showScrollbar();
        });

        thumb.addEventListener("pointermove", (event) => {
            if (!dragState || event.pointerId !== dragState.pointerId) return;

            const scrollDelta =
                (event.clientY - dragState.startY) *
                dragState.geometry.scrollRange /
                dragState.geometry.thumbTravel;
            scrollArea.scrollTop = dragState.startScrollTop + scrollDelta;
            showScrollbar();
        });

        const stopDragging = (event) => {
            if (dragState && event.pointerId === dragState.pointerId) {
                dragState = null;
            }
        };
        thumb.addEventListener("pointerup", stopDragging);
        thumb.addEventListener("pointercancel", stopDragging);

        modal.addEventListener("close", () => {
            indicator.classList.remove("is-visible");
            window.clearTimeout(hideTimer);
        });
        updateScrollbars.push(updateScrollbar);
    });

    window.addEventListener("resize", () => updateScrollbars.forEach((update) => update()));
}

async function init() {
    setupModalScrollbars();

    const siteTitle = document.querySelector("header h1");
    if (siteTitle && Math.random() < 0.0001) {
        siteTitle.textContent = "root書架/書架";
    }

    const header = document.querySelector("header");
    if (header && !header.querySelector(".header-month")) {
        const monthText = document.createElement("p");
        monthText.className = "header-month";
        const fixedMonthText = [
            "年越し蕎麦、毎日食べたかったです。",
            "チョコの甘みはあんまり得意じゃないけれど、チョコって可愛いから好きです。",
            "そろそろ夏用のブレンディスティックをストックしないといけないなぁ、と思うなど。",
            "4月は管理人の誕生日です。めでたいことです。",
            "夏の蕎麦はそんなに好みじゃない。かなしい。さよならお蕎麦、また来てお蕎麦。",
            "祝日がないです。有休を使うときが来た、ってことですね。私は休みます。",
            "スタバの新作が激ウマの季節です。アイラブ、桃。",
            "夏だーっ！海に行きたい、プールに行きたい、泳ぎたい。時間がない。",
            "もうすぐ新蕎麦の季節です。リマインダー、今年のお蕎麦屋さんの新規開拓。",
            "新蕎麦の季節です。お蕎麦、食べましたか？私はいっぱい食べます。",
            "近所のドラストにブレンディスティックがたくさん並ぶ、良い季節です。",
            "年末は蕎麦屋でバイトしていたころのことを夢に見ます。クリスマスなんてなかった。"
        ];
        monthText.textContent = fixedMonthText[new Date().getMonth()];
        header.prepend(monthText);

        if (siteTitle) {
            const titleRow = document.createElement("div");
            titleRow.className = "header-title-row";
            header.insertBefore(titleRow, monthText);
            titleRow.appendChild(siteTitle);
            titleRow.appendChild(monthText);
        }
    }

    document.addEventListener("click", function (e) {
        const menu = document.querySelector(".library-menu");

        if (menu && !menu.contains(e.target)) {
            menu.removeAttribute("open");
        }
    });
}

init();