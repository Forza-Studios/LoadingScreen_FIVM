// ---------- Background HLS stream ----------
(function initBgStream() {
    var video = document.getElementById('bg-video');
    var streamUrl = 'https://rumble.com/hls-vod/Zyl1AEIyzTI/playlist.m3u8';
    if (!video) return;

    function tryPlay() {
        video.muted = true;
        var p = video.play();
        if (p !== undefined) {
            p.catch(function (e) { console.log('bg autoplay blocked:', e); });
        }
    }

    if (window.Hls && Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, tryPlay);
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', tryPlay);
    } else {
        video.src = streamUrl;
        tryPlay();
    }
})();

// ---------- Audio toggle (icon only, right side) ----------
(function initSoundToggle() {
    var video = document.getElementById('bg-video');
    var btn = document.getElementById('sound-toggle');
    if (!btn || !video) return;

    var ICON_MUTED = '<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/></svg>';
    var ICON_ON = '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';

    function render() {
        btn.innerHTML = video.muted ? ICON_MUTED : ICON_ON;
    }

    btn.addEventListener('click', function () {
        if (video.muted) {
            video.muted = false;
            video.volume = 1.0;
            var p = video.play();
            if (p !== undefined) p.catch(function () {});
        } else {
            video.muted = true;
        }
        render();
    });

    render();
})();

// ---------- Beautiful bottom progress bar (FiveM load events) ----------
(function initProgress() {
    var fill = document.getElementById('progress-fill');
    var pct = document.getElementById('progress-pct');
    var label = document.getElementById('progress-label');
    if (!fill || !pct) return;

    var target = 0;
    var displayed = 0;
    var initTotal = 0, dataTotal = 0;
    var initSeen = false, loadSeen = false;

    function setTarget(p) {
        p = Math.max(0, Math.min(100, p));
        if (p > target) target = p;
    }

    // Sarcastic rotating loading lines (instead of static text)
    var phrases = [
        'Hold on tight...',
        'We are looking for some resources...',
        'Bribing the server hamsters...',
        'Waking up the NPCs...',
        'Pretending to load fast...',
        'Downloading more RAM...',
        'Feeding txAdmin...',
        'Polishing the getaway car...',
        'Convincing FiveM this is fine...',
        'Arresting lag spikes...',
        'Teaching cops to RP...',
        'Almost there... probably...'
    ];
    var phraseIdx = 0;

    function showNextPhrase() {
        if (!label) return;
        label.style.opacity = '0';
        setTimeout(function () {
            label.textContent = phrases[phraseIdx];
            phraseIdx = (phraseIdx + 1) % phrases.length;
            label.style.opacity = '1';
        }, 300);
    }

    if (label) {
        label.textContent = phrases[0];
        phraseIdx = 1;
        setInterval(showNextPhrase, 3000);
    }

    window.addEventListener('message', function (e) {
        var d = e.data;
        if (!d || !d.eventName) return;

        if (d.eventName === 'startInitFunctionOrder') {
            initTotal = d.count || 0;
            initSeen = initTotal > 0;
        } else if (d.eventName === 'initFunctionInvoking') {
            // First ~70% of the bar
            if (d.idx && initTotal) setTarget((d.idx / initTotal) * 70);
        } else if (d.eventName === 'startDataFileEntries') {
            dataTotal = d.count || 0;
        } else if (d.eventName === 'loadProgress') {
            loadSeen = true;
            var f = d.loadFraction || 0;
            if (initSeen || dataTotal > 0) {
                setTarget(70 + f * 30); // 70% -> 100%
            } else {
                setTarget(f * 100);
            }
        }
    });

    function tick() {
        var diff = target - displayed;
        if (Math.abs(diff) < 0.05) {
            displayed = target;
        } else {
            displayed += diff * 0.08;
        }
        fill.style.width = displayed.toFixed(2) + '%';
        pct.textContent = Math.floor(displayed) + '%';
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
})();
