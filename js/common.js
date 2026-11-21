async function include(id, file) {
    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`${file} を読み込めませんでした: ${response.status}`);
        document.getElementById(id).innerHTML = await response.text();
    } catch (error) {
        console.error(error);
    }
}

async function init() {
    const siteTitle = document.querySelector("header h1");
    if (siteTitle && Math.random() < 0.0001) {
        siteTitle.textContent = "root書架/書架";
    }

    document.addEventListener("click", function (e) {
        const menu = document.querySelector(".library-menu");

        if (menu && !menu.contains(e.target)) {
            menu.removeAttribute("open");
        }
    });
}

init();