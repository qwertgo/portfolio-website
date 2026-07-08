projectContent.addEventListener('wheel', (e) => {
    const slider = e.target.closest('.project-images');
    if (!slider) return;

    const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
    if (maxScrollLeft <= 0) return; // nothing to scroll at all

    const atStart = slider.scrollLeft <= 0;
    const atEnd = slider.scrollLeft >= maxScrollLeft;

    const scrollingUp = e.deltaY < 0;   // would move slider left
    const scrollingDown = e.deltaY > 0; // would move slider right

    if ((atStart && scrollingUp) || (atEnd && scrollingDown)) {
        return; // let the event pass through to normal page scroll
    }

    e.preventDefault();
    slider.scrollLeft += e.deltaY;
}, { passive: false });