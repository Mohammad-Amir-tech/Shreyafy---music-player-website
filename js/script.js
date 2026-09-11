console.log('Lets write JavaScript');

let currentSong = new Audio();
let songs = [];
let currfolder;
let manifest = null;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

/**
 * Loads songs/manifest.json ONCE.
 * This file is generated locally by running `node generate-manifest.js`
 * (see that file for why this replaces live folder-listing, which
 * does not work on Vercel / static hosts).
 */
async function loadManifest() {
    if (manifest) return manifest;
    try {
        const res = await fetch('/songs/manifest.json');
        if (!res.ok) throw new Error(`manifest.json request failed: ${res.status}`);
        manifest = await res.json();
    } catch (err) {
        console.error(
            '❌ Could not load /songs/manifest.json.\n' +
            'Did you run "node generate-manifest.js" locally and deploy the resulting file?',
            err
        );
        manifest = { folders: [] };
    }
    return manifest;
}

async function getSongs(folderId) {
    currfolder = folderId;
    const m = await loadManifest();
    const album = m.folders.find(f => f.id === folderId);
    songs = album ? album.songs : [];

    const songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";

    if (songs.length === 0) {
        songUL.innerHTML = `<li style="cursor:default;justify-content:center;">No songs found in this folder</li>`;
        return songs;
    }

    for (const song of songs) {
        songUL.innerHTML += `<li> <img class="invert" src="img/music.svg" alt="">
                        <div class="info">
                            <div>${song.replaceAll("%20", " ")}</div>
                            <div>Shreya Singh</div>
                        </div>
                        <div class="playnow">
                            <span>Play</span>
                            <img class="invert" src="img/play.svg" alt="">
                        </div> </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            const titleEl = e.querySelector(".info");
            if (!titleEl) return;
            playMusic(titleEl.firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    if (!track) return;
    currentSong.src = `/songs/${currfolder}/` + track;

    currentSong.onended = () => {
        const currentIndex = songs.indexOf(track);
        if (currentIndex + 1 < songs.length) {
            playMusic(songs[currentIndex + 1]);
        }
    };

    if (!pause) {
        currentSong.play().catch(err => console.warn("Playback was blocked by the browser:", err));
        play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    const m = await loadManifest();
    const cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    if (!m.folders || m.folders.length === 0) {
        cardContainer.innerHTML = `<p style="padding:20px;opacity:.7;">
            No albums found. Run <code>node generate-manifest.js</code> and redeploy.
        </p>`;
        return;
    }

    m.folders.forEach(album => {
        cardContainer.innerHTML += `<div data-folder="${album.id}" class="card">
                <div class="play">
                    <svg width="24" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round"/>
                    </svg>
                </div>
                <img src="/songs/${album.id}/${encodeURIComponent(album.cover)}" alt="${album.title}">
                <h2>${album.title}</h2>
                <p>${album.description || ""}</p>
            </div>`;
    });

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            const folderId = item.currentTarget.dataset.folder;
            await getSongs(folderId);
            if (songs.length) playMusic(songs[0]);
        });
    });
}

async function main() {
    await loadManifest();

    const defaultFolder = (manifest.folders[0] && manifest.folders[0].id) || "hindi";
    await getSongs(defaultFolder);
    if (songs.length) playMusic(songs[0], true);

    await displayAlbums();

    // Play / Pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // Progress bar + time
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar click (mouse)
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Seekbar tap (mobile/touch) - offsetX doesn't exist reliably on touch events
    document.querySelector(".seekbar").addEventListener("touchstart", e => {
        const rect = e.target.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        let percent = (touchX / rect.width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Hamburger open
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Close sidebar
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Previous
    previous.addEventListener("click", () => {
        currentSong.pause();
        const currentFile = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentFile);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        } else {
            playMusic(songs[songs.length - 1]);
        }
    });

    // Next
    next.addEventListener("click", () => {
        currentSong.pause();
        const currentFile = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentFile);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]);
        }
    });

    // Volume slider
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        const volImg = document.querySelector(".volume>img");
        if (currentSong.volume > 0) {
            volImg.src = volImg.src.replace("mute.svg", "volume.svg");
        } else {
            volImg.src = volImg.src.replace("volume.svg", "mute.svg");
        }
    });

    // Mute toggle
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });
}

main();
