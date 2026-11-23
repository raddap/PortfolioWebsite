// Magnifying-glass zoom for project images.
// Hovering an image shows a lens over it and an enlarged view in a panel beside it.
(function () {
    // Only on devices with a real mouse; phones and tablets keep plain images.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var MAX_ZOOM = 3;      // how many times larger the panel shows the image
    var PANEL_SIZE = 420;  // panel width/height in pixels (shrinks on small screens)
    var GAP = 16;          // space between the image and the panel

    var lens = document.createElement("div");
    lens.className = "zoom-lens";
    var panel = document.createElement("div");
    panel.className = "zoom-panel";
    document.body.appendChild(lens);
    document.body.appendChild(panel);

    var current = null;

    function hide() {
        current = null;
        lens.style.display = "none";
        panel.style.display = "none";
    }

    function show(img) {
        current = img;
        panel.style.backgroundImage = 'url("' + (img.currentSrc || img.src) + '")';
        lens.style.display = "block";
        panel.style.display = "block";
    }

    function move(event) {
        var img = current;
        if (!img) return;

        var rect = img.getBoundingClientRect();
        var size = Math.min(PANEL_SIZE, window.innerHeight - 2 * GAP, window.innerWidth - 2 * GAP);
        // Never zoom past the photo's real resolution, so it stays sharp.
        var zoom = Math.max(1.5, Math.min(MAX_ZOOM, img.naturalWidth / rect.width));

        // Lens: the area of the image that the panel shows, centered on the mouse.
        var lensW = Math.min(size / zoom, rect.width);
        var lensH = Math.min(size / zoom, rect.height);
        var x = Math.max(0, Math.min(event.clientX - rect.left - lensW / 2, rect.width - lensW));
        var y = Math.max(0, Math.min(event.clientY - rect.top - lensH / 2, rect.height - lensH));

        lens.style.width = lensW + "px";
        lens.style.height = lensH + "px";
        lens.style.left = rect.left + x + "px";
        lens.style.top = rect.top + y + "px";

        // Panel: beside the image if there's room, otherwise over the half
        // of the image away from the mouse.
        var left;
        if (rect.right + GAP + size <= window.innerWidth - GAP) {
            left = rect.right + GAP;
        } else if (rect.left - GAP - size >= GAP) {
            left = rect.left - GAP - size;
        } else if (event.clientX < rect.left + rect.width / 2) {
            left = Math.min(rect.right, window.innerWidth) - size - GAP;
        } else {
            left = Math.max(rect.left, 0) + GAP;
        }
        var top = Math.max(GAP, Math.min(rect.top, window.innerHeight - size - GAP));

        panel.style.width = lensW * zoom + "px";
        panel.style.height = lensH * zoom + "px";
        panel.style.left = left + "px";
        panel.style.top = top + "px";
        panel.style.backgroundSize = rect.width * zoom + "px " + rect.height * zoom + "px";
        panel.style.backgroundPosition = -x * zoom + "px " + -y * zoom + "px";
    }

    document.querySelectorAll(".project-gallery img").forEach(function (img) {
        img.addEventListener("mouseenter", function (event) {
            show(img);
            move(event);
        });
        img.addEventListener("mousemove", move);
        img.addEventListener("mouseleave", hide);
    });

    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("resize", hide);
})();
