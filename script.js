let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesAndSeconds(seconds) {
  if (isNaN(seconds)) return "00:00";

  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Format the result with leading zeros
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  // Combine minutes and seconds with a colon
  const result = `${formattedMinutes}:${formattedSeconds}`;

  return result;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  // console.log(response);

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  //   console.log(as);

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3"))
      songs.push(element.href.split(`/${folder}/`)[1]);
  }

  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  //   console.log(songUl);
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li>
       <img class="invert" src="img/music.svg" alt="">
       <div class="info">
           <div>${song.replaceAll("%20", " ")}</div>
           <div>Harry</div>
       </div>
       <div class="playnow">
           <span>Play Now</span>
           <img class="invert" src="img/play.svg" alt="">
       </div>

   </li>`;
  }

  console.log(document.querySelector(".songList").getElementsByTagName("li"));
}

const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track)
  currentSong.src = `/${currFolder}/` + track;
  console.log(currentSong);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
  currentSong.load();

  currentSong.addEventListener("loadeddata", () => {
    if (!pause) {
      currentSong.play();
      play.src = "img/pause.svg";
    }

    currentSong.addEventListener("timeupdate", () => {
      document.querySelector(
        ".songtime"
      ).innerHTML = `${secondsToMinutesAndSeconds(
        Math.floor(currentSong.currentTime)
      )} / ${secondsToMinutesAndSeconds(Math.floor(currentSong.duration))}`;
      document.querySelector(".circle").style.left =
        (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".songinfo").innerHTML = track;
    // document.querySelector(".songtime").innerHTML = "00:00/00:00";
  });
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  //   console.log(response);

  let div = document.createElement("div");
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");
  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    let e = array[index];
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];

      //Get the metadata of the folder
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response);
      document.querySelector(".cardContainer").innerHTML =
        document.querySelector(".cardContainer").innerHTML +
        `<div class="card" data-folder="${folder}">
      <div class="play">
          <div
              style="width: 28px; height: 28px; background-color: #1fdf64; border-radius: 50%; position: relative; overflow: hidden;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" xmlns:xlink="http://www.w3.org/1999/xlink" role="img"
                  style="position: absolute; top: 50%; left: 51%; transform: translate(-50%, -50%);">
                  <path d="M5 20V4L19 12L5 20Z" stroke="#000000" fill="#000" stroke-width="1.5"
                      stroke-linejoin="round" />
              </svg>
          </div>
      </div>
      <img src="/songs/${folder}/cover.jpg" alt="" srcset="">
      <h2>${response.title}</h2>
      <p>${response.description} </p>
  </div>`;
    }
  }
}

async function main() {
  await getSongs("songs/ncs");
  // console.log(songs);
  playMusic(decodeURI(songs[0]), true);

  //Display all the albums on the page

  await displayAlbums();
  //Attach an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log("clicked");
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
}

async function secondMain(folder) {
  await getSongs(`songs/${folder}`);
  // console.log(songs);
  playMusic(decodeURI(songs[0]));

  //Display all the albums on the page
  // await displayAlbums();

  //Attach an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      // console.log("clicked");
      // console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
}
//Load the playlist whenever card is clicked
// Array.from(document.getElementsByClassName("card")).forEach((e) => {
//   e.addEventListener("click", async (item) => {
//     console.log(e.dataset.folder)
//     await secondMain(e.dataset.folder);
//   });
// });

document.body.addEventListener("click", async (event) => {
  const card = event.target.closest(".card");
  if (card) {
    const folder = card.dataset.folder;
    await secondMain(folder);
  }
});

//Attach an event listener to play, next and previous
play.addEventListener("click", () => {
  if (currentSong.paused) {
    currentSong.play();
    play.src = "img/pause.svg";
  } else {
    currentSong.pause();
    play.src = "img/play.svg";
  }

  //Listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(
      ".songtime"
    ).innerHTML = `${secondsToMinutesAndSeconds(
      Math.floor(currentSong.currentTime)
    )} / ${secondsToMinutesAndSeconds(Math.floor(currentSong.duration))}`;

    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });
});

//Add an event listner to seekbar

document.querySelector(".seekbar").addEventListener("click", (e) => {
  //  console.log(e.offsetX, e.target.getBoundingClientRect().width)
  let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
  document.querySelector(".circle").style.left = percent + "%";
  currentSong.currentTime = (currentSong.duration * percent) / 100;
});

//Add an event listner for hamburger
document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".left").style.left = 0;
});

//Add an event listner for close button
document.querySelector(".close").addEventListener("click", () => {
  document.querySelector(".left").style.left = -120 + "%";
});

//Add an event listener to previous and next
previous.addEventListener("click", () => {
  let index = songs.indexOf(
    currentSong.src.split("/")[currentSong.src.split("/").length - 1]
  );

  let prevIndex = index - 1;
  if (prevIndex >= 0) playMusic(decodeURI(songs[prevIndex]));
});

next.addEventListener("click", () => {
  let index = songs.indexOf(
    currentSong.src.split("/")[currentSong.src.split("/").length - 1]
  );

  let nextIndex = (index + 1) % songs.length;
  playMusic(decodeURI(songs[nextIndex]));
});

//Add an event to volume
document
  .querySelector(".range")
  .getElementsByTagName("input")[0]
  .addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
    if (currentSong.volume > 0) {
      document.querySelector(".volume img").src = document
        .querySelector(".volume img")
        .src.replace("mute.svg", "volume.svg");
    }
  });

document.querySelector(".volume img").addEventListener("click", (e) => {
  console.log(e.target);
  if (e.target.src.includes("volume.svg")) {
    e.target.src = e.target.src.replace("volume.svg", "mute.svg");
    currentSong.volume = 0;
    document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
  } else {
    e.target.src = e.target.src.replace("mute.svg", "volume.svg");
    currentSong.volume = 0.5;
    document
      .querySelector(".range")
      .getElementsByTagName("input")[0].value = 10;
  }
});

main();
