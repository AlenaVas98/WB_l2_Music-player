let now_playing = document.querySelector(".now-playing");
let track_name = document.querySelector(".track-name");
let track_artist = document.querySelector(".track-artist");

let playpause_btn = document.querySelector(".playpause-track");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");

let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let current_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");
let randomIcon = document.querySelector(".fa-random");
let current_track = document.createElement("audio");

let track_index = 0;
let isPlaying = false;
let isRandom = false;
let updateTimer;
let visualisation = true;

let audio = current_track;

let container = document.querySelector(".canvas_box");

// данные для создания звуковых волн
let C = document.getElementById("canvas"),
  $ = C.getContext("2d"),
  W = (C.width = container.clientWidth),
  H = (C.height = container.clientHeight),
  centerX = W / 2,
  centerY = H / 2,
  radius,
  piece,
  bars = 200,
  x,
  y,
  xEnd,
  yEnd,
  barWidth = 2,
  barHeight,
  lineColor;

const music_list = [
  {
    name: "No Time To Die",
    artist: "Billie Eilish",
    music: "src/music/Billie_Eilish_-_No_Time_To_Die_68398336.mp3",
  },
  {
    name: "Falling Down",
    artist: "Wid Cards",
    music: "src/music/Gavin_DeGraw_-_Fire_29572564 copy.mp3",
  },
  {
    name: "I Bet My Life",
    artist: "Imagine_Dragons",
    music: "src/music/Imagine_Dragons_-_I_Bet_My_Life_47829288.mp3",
  },
  {
    name: "Children Of The Sky A Starfield",
    artist: "Imagine Dragons",
    music:
      "src/music/imagine-dragons-children-of-the-sky-a-starfield-song-mp3.mp3",
  },
  {
    name: "House Of Memories",
    artist: "Panic At The Disco",
    music: "src/music/Panic_At_The_Disco_-_House_Of_Memories_47951357.mp3",
  },
];

// загрузка песни и её данные
loadTrack(track_index);
function loadTrack(track_index) {
  clearInterval(updateTimer);
  reset();
  current_track.src = music_list[track_index].music;
  current_track.load();

  track_name.textContent = music_list[track_index].name;
  track_artist.textContent = music_list[track_index].artist;
  now_playing.textContent =
    "Playing music " + (track_index + 1) + " of " + music_list.length;

  updateTimer = setInterval(setUpdate, 1000);
}

function reset() {
  current_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}
function randomTrack() {
  isRandom ? pauseRandom() : playRandom();
}
function playRandom() {
  isRandom = true;
  randomIcon.classList.add("randomActive");
}
function pauseRandom() {
  isRandom = false;
  randomIcon.classList.remove("randomActive");
}
// логика повторая песни
function repeatTrack() {
  let current_index = track_index;
  loadTrack(current_index);
  visualisation = true;
  audio.pause();
  if (visualisation) {
    playVisualisation();
    visualisation = false;
  }
  playTrack();
}

function playpauseTrack() {
  isPlaying ? pauseTrack() : playTrack();
}
// логика запуска песни
function playTrack() {
  isPlaying = true;
  playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';

  if (visualisation) {
    playVisualisation();
    visualisation = false;
  }
  audio.play();
}
// логика остановки песни
function pauseTrack() {
  audio.pause();
  isPlaying = false;
  playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
}

// логика начала следующей песни
function nextTrack() {
  if (track_index < music_list.length - 1 && isRandom === false) {
    track_index += 1;
  } else if (track_index < music_list.length - 1 && isRandom === true) {
    let random_index = Number.parseInt(Math.random() * music_list.length);
    track_index = random_index;
  } else {
    track_index = 0;
  }

  loadTrack(track_index);
  visualisation = true;
  audio.pause();
  if (visualisation) {
    playVisualisation(current_track);
    visualisation = false;
  }
  playTrack();
}
// логика начала предыдущей песни
function prevTrack() {
  if (track_index > 0) {
    track_index -= 1;
  } else {
    track_index = music_list.length - 1;
  }
  loadTrack(track_index);

  visualisation = true;
  audio.pause();
  if (visualisation) {
    playVisualisation();
    visualisation = false;
  }
  playTrack();
}

// логика ползунка таймера
function seekTo() {
  let seekto = audio.duration * (seek_slider.value / 100);
  audio.currentTime = seekto;
}
function setVolume() {
  audio.volume = volume_slider.value / 100;
}
function setUpdate() {
  let seekPosition = 0;
  if (!isNaN(audio.duration)) {
    seekPosition = audio.currentTime * (100 / audio.duration);
    seek_slider.value = seekPosition;
    let currentMinutes = Math.floor(audio.currentTime / 60);
    let currentSeconds = Math.floor(audio.currentTime - currentMinutes * 60);
    let durationMinutes = Math.floor(audio.duration / 60);
    let durationSeconds = Math.floor(audio.duration - durationMinutes * 60);

    if (currentSeconds < 10) {
      currentSeconds = "0" + currentSeconds;
    }
    if (durationSeconds < 10) {
      durationSeconds = "0" + durationSeconds;
    }
    if (currentMinutes < 10) {
      currentMinutes = "0" + currentMinutes;
    }
    if (durationMinutes < 10) {
      durationMinutes = "0" + durationMinutes;
    }

    current_time.textContent = currentMinutes + ":" + currentSeconds;
    total_duration.textContent = durationMinutes + ":" + durationSeconds;
  }
  if (audio.ended) {
    nextTrack();
  }
}
// отрисовка звуковых волн
function playVisualisation() {
  audio = new Audio(current_track.src);
  context = new AudioContext();
  analyser = context.createAnalyser();

  source = context.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(context.destination);

  frequencyArray = new Uint8Array(analyser.frequencyBinCount);
  audio.play();
  startAnimation();
  function startAnimation() {
    radius = 105;

    $.clearRect(0, 0, W, H);

    $.beginPath();
    $.arc(centerX, centerY, radius, 0, Math.PI * (2 * piece));
    $.lineWidth = 20;
    $.stroke();
    analyser.getByteFrequencyData(frequencyArray);
    for (let i = 0; i < bars; i++) {
      radius = 90;
      rads = (Math.PI * 2) / bars; //линии
      barHeight = frequencyArray[i] * 0.6;

      x = centerX + Math.cos(rads * i) * radius;
      y = centerY + Math.sin(rads * i) * radius;
      xEnd = centerX + Math.cos(rads * i) * (radius + barHeight);
      yEnd = centerY + Math.sin(rads * i) * (radius + barHeight);

      drawBar(x, y, xEnd, yEnd, barWidth, frequencyArray[i]);
    }
    requestAnimationFrame(startAnimation);
  }

  function drawBar(x1, y1, x2, y2, width, frequency) {
    lineColor = "rgb(" + frequency + ", " + frequency + ", " + 205 + ")";

    $.strokeStyle = lineColor;
    $.lineWidth = width;
    $.beginPath();
    $.moveTo(x1, y1);
    $.lineTo(x2, y2);
    $.stroke();
  }
}
