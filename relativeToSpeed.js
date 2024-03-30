// ==UserScript==
// @name         playbackSpeed_relativeDuration
// @version      0.1
// @description  HighestOnly
// @author       Zuka(Chzu)
// @run-at       document-start
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

window.addEventListener("yt-navigate-finish", (_e) => {
    if ((new URL(location.href).pathname) !== "/watch") return;
    const html5 = document.querySelector("video");
    const player = document.querySelector("#movie_player, .html5-video-player");
    const quality = player.getAvailableQualityLevels();
    console.log(quality)
    let killSwitch = false;
    window.onkeydown = e => {
        if (e.key === "S") killSwitch = true;
    };
    html5.ondurationchange = (_e) => {
        setTimeout((_) => killSwitch && setQuality(), 1000);
    };
    function setQuality() {
        player.getPlaybackQuality() !== quality[0] && // quality != best?
            player.setPlaybackQuality(quality[0],
                player.setPlaybackQualityRange(quality[0]));
    }

    /* relative_duration_speed.js*/
    let ytDuration = document.getElementsByClassName("ytp-time-duration")[0];
    function relative_duration_ToSpeed(duration) {
        const sponsorBlock = document.getElementById("sponsorBlockDurationAfterSkips")
        if (sponsorBlock.textContent) sponsorBlock.style.display = "none"; // hidden
        const playSpeed = html5.playbackRate;
        const hasSponsor = sponsorBlock.textContent ? getFormattedTimeToSeconds(parseSplit(sponsorBlock.textContent))
            : player.getDuration();
        const realDuration = getFormattedTime(hasSponsor / playSpeed);
        duration.textContent = realDuration;
    }
    html5.onratechange = (_) => {
        relative_duration_ToSpeed(ytDuration);
    };
    // autostart
    setTimeout((_) => relative_duration_ToSpeed(ytDuration), setQuality(), 1000);
});

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
