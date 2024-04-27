// ==UserScript==
// @name         youtubeModification2
// @version      0.1
// @description  get real duration and set quality to best
// @author       Zuka(Chzu)
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/optionsx/youtubeModification/raw/main/relativeToSpeed.user.js
// @downloadURL  https://github.com/optionsx/youtubeModification/raw/main/relativeToSpeed.user.js
// @grant        none
// ==/UserScript==

document.addEventListener("yt-navigate-finish", (_e) => {
    if ((new URL(location.href).pathname) !== "/watch") return;
    const html5 = document.querySelector("video");
    const player = document.querySelector("#movie_player, .html5-video-player");
    const quality = player.getAvailableQualityLevels();

    // html5.onplay = () => {
    //     setQuality()
    // };

    !function setQuality() {
        player.getPlaybackQuality() !== quality[2] && // quality != best?
            player.setPlaybackQuality(
                quality[2],
                player.setPlaybackQualityRange(quality[2]),
            );
    }()
    /* relative_duration_speed.js*/
    // let ytDuration = document.getElementsByClassName("ytp-time-duration")[0];
    // function relative_duration_ToSpeed(duration) {
    //     const sponsorBlock = document.getElementById("sponsorBlockDurationAfterSkips")
    //     if (sponsorBlock?.textContent) sponsorBlock.style.display = "none"; // hidden
    //     const playSpeed = html5.playbackRate;
    //     const hasSponsor = sponsorBlock?.textContent ? getFormattedTimeToSeconds(parseSplit(sponsorBlock.textContent))
    //         : player.getDuration();
    //     const realDuration = getFormattedTime(hasSponsor / playSpeed);
    //     duration.textContent = realDuration;
    // }
    const isOnMobile = location.host === "m.youtube.com" ? ".ytm" : ".ytp";
    function extractNremoveSB() {
        const SB = document.getElementById("sponsorBlockDurationAfterSkips");
        if (SB?.textContent) {
            SB.style.display = "none";
            return getFormattedTimeToSeconds(parseSplit(SB.textContent));
        } else {
            return player.getDuration();
        }
    }

    const extractedSB = extractNremoveSB();
    !function hideOriginalTime() {
        const origin = document.querySelector(
            `${isOnMobile}-time-display.notranslate > span:nth-child(2)`,
        );
        origin.style.display = "none";
    }();

    const currentTime = document.querySelector(`span${isOnMobile}-time-current`);
    const displayTime = document.querySelector(
        `${isOnMobile}-time-display.notranslate`,
    );

    ~function spawnElement() {
        const newTimeSpan = document.createElement("span");
        newTimeSpan.classList.add("superSecretID");
        displayTime.append(newTimeSpan);
    }();

    const superSecretElement = document.getElementsByClassName("superSecretID")[0];

    function handleTimeChange(mutationsList, _observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
                const changedCurrent = getFormattedTime(html5.currentTime / html5.playbackRate)
                const adjustedTotalDuration = ` / ${getFormattedTime(extractedSB / html5.playbackRate)} - (${html5.playbackRate}x)`;
                superSecretElement.textContent = changedCurrent + adjustedTotalDuration;
            }
        }
    }

    const observer = new MutationObserver(handleTimeChange);
    const observerConfig = { childList: true };
    observer.observe(currentTime, observerConfig);
});

// utils.js
function getFormattedTime(seconds, precise) {
    seconds = Math.max(seconds, 0);
    const hours = Math.floor(seconds / 60 / 60);
    const minutes = Math.floor(seconds / 60) % 60;
    let minutesDisplay = String(minutes);
    let secondsNum = seconds % 60;
    if (!precise) secondsNum = Math.floor(secondsNum);
    let secondsDisplay = String(precise ? secondsNum.toFixed(3) : secondsNum);
    if (secondsNum < 10) secondsDisplay = "0" + secondsDisplay;
    if (hours && minutes < 10) minutesDisplay = "0" + minutesDisplay;
    if (isNaN(hours) || isNaN(minutes)) return null;
    return (hours ? hours + ":" : "") + minutesDisplay + ":" + secondsDisplay;
}

function getFormattedTimeToSeconds(formatted) {
    const fragments = /^(?:(?:(\d+):)?(\d+):)?(\d*(?:[.,]\d+)?)$/.exec(formatted);
    if (fragments === null) return null;
    const hours = fragments[1] ? parseInt(fragments[1]) : 0;
    const minutes = fragments[2] ? parseInt(fragments[2] || "0") : 0;
    const seconds = fragments[3] ? parseFloat(fragments[3].replace(",", ".")) : 0;
    return hours * 3600 + minutes * 60 + seconds;
}

function parseSplit(s) {
    return s.split("(")[1]?.split(")")[0];
}
/* 
function wfke(selector, callback) {
    var el = document.querySelector(selector);
    if (el) return callback();
    setTimeout(wfke, 100, selector, callback);
}
 */