let videoObserver;

function initLazyVideos(container) {
    if (videoObserver) {
        videoObserver.disconnect();
    }

    videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const video = entry.target;

            if (entry.isIntersecting) {
                // if sources haven't been loaded yet, swap data-src -> src and load
                const sources = video.querySelectorAll("source[data-src]");
                if (sources.length > 0) {
                    sources.forEach((source) => {
                        source.src = source.dataset.src;
                        source.removeAttribute("data-src");
                    });
                    video.load();
                }

                video.play().catch(() => {
                    // autoplay can be rejected before user interaction; ignore
                });
            } else {
                video.pause();
            }
        });
    }, {
        root: null,
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
        video.pause();
        video.removeAttribute("src"); // in case it was ever set directly
        video.querySelectorAll("source").forEach((source) => {
            source.removeAttribute("src");
        });
        video.load(); // forces the browser to actually drop the decode buffer
    });
}