let videoObserver;

function loadAndPlayVideo(video) {
    if (!video.dataset.loaded) {
        const mobileSrc = video.dataset.srcMobile;
        const desktopSrc = video.dataset.srcDesktop;

        if (mobileSrc) {
            const sourceMobile = document.createElement("source");
            sourceMobile.src = mobileSrc;
            sourceMobile.media = "(max-width: 639px)";
            sourceMobile.type = "video/mp4";
            video.appendChild(sourceMobile);
        }

        if (desktopSrc) {
            const sourceDesktop = document.createElement("source");
            sourceDesktop.src = desktopSrc;
            sourceDesktop.type = "video/mp4";
            video.appendChild(sourceDesktop);
        }

        video.load();
        video.dataset.loaded = "true";
    }

    video.play().catch(() => {});
}

function initLazyVideos(container) {
    if (videoObserver) {
        videoObserver.disconnect();
    }

    videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const video = entry.target;

            if (entry.isIntersecting) {
                loadAndPlayVideo(video);
            } else {
                video.pause();
            }
        });
    }, {
        root: null,
        rootMargin: "100px 0px 100px 0px",
        threshold: 0
    });

    container.querySelectorAll("video.info-video").forEach((video) => {
        videoObserver.observe(video);
    });
}

function cleanupVideos(container) {
    if (videoObserver) {
        videoObserver.disconnect();
    }

    container.querySelectorAll("video.info-video").forEach((video) => {
        if (!video.dataset.loaded) {
            return; // never loaded, nothing to clean up
        }

        video.pause();
        video.querySelectorAll("source").forEach((source) => source.remove());
        video.removeAttribute("src");
        video.load();
        delete video.dataset.loaded;
    });
}