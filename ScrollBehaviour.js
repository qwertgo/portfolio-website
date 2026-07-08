projectContent.addEventListener('wheel', (e) => {
    const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
    const slider = hoveredEl ? hoveredEl.closest('.image-slide') : null;
    if (!slider) return;

    const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
    if (maxScrollLeft <= 0) return;

    const atStart = slider.scrollLeft <= 0;
    const atEnd = slider.scrollLeft >= maxScrollLeft;
    const scrollingUp = e.deltaY < 0;
    const scrollingDown = e.deltaY > 0;

    if ((atStart && scrollingUp) || (atEnd && scrollingDown)) {
        return;
    }

    e.preventDefault();
    slider.scrollLeft += e.deltaY * 2;
}, { passive: false });