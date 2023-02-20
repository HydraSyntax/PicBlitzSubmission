
// Variables

let inGame = false;
let timeLeft = 60;
let solved = false;
let imageLoaded = false;
let score = 0;
let keywords = [];
let currentRow = 0;
let currentColumn = 0;

// Make input squares
function squares(container, row, column, letter = "") {
    const box = document.createElement("div");
    box.className = "box";
    if (row === 0) {
        box.className = "box hl";
    }
    box.id = `box${row}${column}`;
    box.textContent = letter;

    container.appendChild(box);
    return box;
}

// Main Game
function startGame() {
    if (!inGame) {
        // Start Game
        document.getElementById("main").innerHTML = "Timer...";
        inGame = true;

        // Start timer and load image
        setTimer();
        getImage();
    } else {
      if (imageLoaded) {
        getImage();
      }
    }
}

function setTimer() {
    // Update timer, end game if timeLeft is 0
	document.getElementById("main").onmouseover = function () {
		document.getElementById("main").innerHTML = "Skip Image";
		document.getElementById("main").style = `
	background-color: red;
  box-shadow: 5px 5px rgba(255, 0, 0, 0.45);	
 `;
	}

	document.getElementById("main").onmouseleave = function () {
		document.getElementById("main").style = `
	    background-color: green;
	    box-shadow: 5px 5px #0080009f;
	 `;
	}

    const timer = window.setInterval(function () {
        document.getElementById("main").innerHTML = `Timer: ${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            gameOver();
            return;
        } else {
            if (imageLoaded) {
                timeLeft -= 1;
            }
        }
    }, 1000);
}

function getImage() {
    imageLoaded = false;
    document.getElementById("img").innerHTML = `<img src="static/img/loading.gif" alt="loading..." width="256px">`
    // Get the image
    fetch("/get-image")
        .then(response=>response.blob())
        .then(blob => {
            var img = document.createElement("img");
            img.src = URL.createObjectURL(blob);
            img.onload = function () {
                imageLoaded = true;
                getKeyWords();
            }
            // Load image
            document.getElementById("img").innerHTML = `<img alt="image" src='${img.src}'>`;
            document.body.style = "background-image: url("+img.src+");";
        })

}

function getKeyWords() {
    solved = true;
    // Get the image
    fetch("/get-keywords")
        .then(response => response.json())
        .then(data => {
            keywords = [];
            document.getElementById("input").innerHTML = "";
            keywords = data;
            // Load input squares
            for (let i = 0; i < data.length; i++) {
                const grid = document.createElement("div");
                grid.className = `grid`;
                grid.id = `grid${i}`;

                for (let j = 0; j < data[i].length; j++) {
                    squares(grid, i, j);
                }
                document.getElementById("input").appendChild(grid);
            }
            solved = false;
            // User input service
            keyDetect();

        })

}

function gameOver() {
    // Restart initial variables
    timeLeft = 60;
    inGame = false
    solved = true;
    imageLoaded = false;
    keywords = [];


	var winner = localStorage.getItem("score") < score ? "winner" : "";

	var message = localStorage.getItem("score") < score ? "🏆 You achieved your highest score!" : "Better luck next time, try to beat your high score of "+localStorage.getItem("score")+" images";



		if(localStorage.getItem("score") === null){
			localStorage.setItem("score", score);
		} else{
			if(localStorage.getItem("score") < score){
				localStorage.setItem("score", score);
			}
		}


    document.body.innerHTML = `<div class='end'><p class="headline">Score:</p> <p class="score">`+score+`</p> <br> <br><button onclick="restart()" class='cta'>Play Again</button><footer>`+ message +`</footer></div> `;
    score = 0;

	if(winner === "winner"){
		const start = () => {
            setTimeout(function() {
                confetti.start()
            }, 1000);
        };

        const stop = () => {
            setTimeout(function() {
                confetti.stop()
            }, 5000);
        };
        start();
        stop();
	}
}

function keyDetect() {
    document.body.onkeydown = (e) => {
        // Check if new turn loading
        if (!solved) {
            const key = e.key;
            let letter;
            if (key.length === 1 && key.match(/[a-z]/i)) {
                letter = true;
            }

            let boxes = document.getElementById(`grid${currentRow}`).children;

            function check() {
                let current = "";
                for (let i = 0; i < boxes.length; i++) {
                    current += boxes[i].innerHTML;
                }
                current = current.toLowerCase();
                console.log(keywords[currentRow])
                // Check if current user input's row is the word
                if (current === keywords[currentRow]) {
                    console.log(currentRow, keywords.length);
                    // If they are completely done
                    if (currentRow === keywords.length - 1) {
                        // Load new image and reset everything else
                        getImage();
                        document.getElementById("input").innerHTML = "";
                        currentRow = 0;
                        currentColumn = 0;
                        score++;
                        return;
                    }
                    // Unhighlight the current row
                    for (let i = 0; i < boxes.length; i++) {
                        boxes[i].className = "box chosen";
                    }
                    // Update rows and column
                    currentRow++;
                    currentColumn = 0;
                    boxes = document.getElementById(`grid${currentRow}`).children;

                    // Highlight the new row
                    for (let i = 0; i < boxes.length; i++) {
                        boxes[i].className = "box hl";
                    }
                }
            }
            let box = document.getElementById(`grid${currentRow}`).children[currentColumn]
            if (key === "Backspace") {
                // Delete input on backspace
                if (currentColumn >= 1) {
                    currentColumn--;
                    box = document.getElementById(`grid${currentRow}`).children[currentColumn]
                    box.innerHTML = "";
                }
            } else { // If normal character (e.g A, B, C not backspace)
                // Checks if the current column is less than the word length and if the letter is a valid character
                if (currentColumn < keywords[currentRow].length && letter) {
                    // Add the new letter
                    box.innerHTML = key;
                    currentColumn++;
                    // Check if the user word is the answer
                    check();
                }
            }
        }
    }

}

function restart() {
    location.reload();
}







// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Credits:https://github.com/CoderZ90/confetti/blob/main/confetti.js

var confetti = {
	maxCount: 175,
	speed: 3,
	frameInterval: 30,
	alpha: 1.0,
	gradient: true,
	start: null,
	stop: null,
	toggle: null,
	pause: null,
	resume: null,
	togglePause: null,
	remove: null,
	isPaused: null,
	isRunning: null
};

(function() {
	confetti.start = startConfetti;
	confetti.stop = stopConfetti;
	confetti.toggle = toggleConfetti;
	confetti.pause = pauseConfetti;
	confetti.resume = resumeConfetti;
	confetti.togglePause = toggleConfettiPause;
	confetti.isPaused = isConfettiPaused;
	confetti.remove = removeConfetti;
	confetti.isRunning = isConfettiRunning;
	var supportsAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
	var colors = ["rgba(30,144,255,", "rgba(107,142,35,", "rgba(255,215,0,", "rgba(255,192,203,", "rgba(106,90,205,", "rgba(173,216,230,", "rgba(238,130,238,", "rgba(152,251,152,", "rgba(70,130,180,", "rgba(244,164,96,", "rgba(210,105,30,", "rgba(220,20,60,"];
	var streamingConfetti = false;
	var animationTimer = null;
	var pause = false;
	var lastFrameTime = Date.now();
	var particles = [];
	var waveAngle = 0;
	var context = null;

	function resetParticle(particle, width, height) {
		particle.color = colors[(Math.random() * colors.length) | 0] + (confetti.alpha + ")");
		particle.color2 = colors[(Math.random() * colors.length) | 0] + (confetti.alpha + ")");
		particle.x = Math.random() * width;
		particle.y = Math.random() * height - height;
		particle.diameter = Math.random() * 10 + 5;
		particle.tilt = Math.random() * 10 - 10;
		particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
		particle.tiltAngle = Math.random() * Math.PI;
		return particle;
	}

	function toggleConfettiPause() {
		if (pause)
			resumeConfetti();
		else
			pauseConfetti();
	}

	function isConfettiPaused() {
		return pause;
	}

	function pauseConfetti() {
		pause = true;
	}

	function resumeConfetti() {
		pause = false;
		runAnimation();
	}

	function runAnimation() {
		if (pause)
			return;
		else if (particles.length === 0) {
			context.clearRect(0, 0, window.innerWidth, window.innerHeight);
			animationTimer = null;
		} else {
			var now = Date.now();
			var delta = now - lastFrameTime;
			if (!supportsAnimationFrame || delta > confetti.frameInterval) {
				context.clearRect(0, 0, window.innerWidth, window.innerHeight);
				updateParticles();
				drawParticles(context);
				lastFrameTime = now - (delta % confetti.frameInterval);
			}
			animationTimer = requestAnimationFrame(runAnimation);
		}
	}

	function startConfetti(timeout, min, max) {
		var width = window.innerWidth;
		var height = window.innerHeight;
		window.requestAnimationFrame = (function() {
			return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function (callback) {
					return window.setTimeout(callback, confetti.frameInterval);
				};
		})();
		var canvas = document.getElementById("confetti-canvas");
		if (canvas === null) {
			canvas = document.createElement("canvas");
			canvas.setAttribute("id", "confetti-canvas");
			canvas.setAttribute("style", "display:block;z-index:999999;pointer-events:none;position:fixed;top:0");
			document.body.prepend(canvas);
			canvas.width = width;
			canvas.height = height;
			window.addEventListener("resize", function() {
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
			}, true);
			context = canvas.getContext("2d");
		} else if (context === null)
			context = canvas.getContext("2d");
		var count = confetti.maxCount;
		if (min) {
			if (max) {
				if (min === max)
					count = particles.length + max;
				else {
					if (min > max) {
						var temp = min;
						min = max;
						max = temp;
					}
					count = particles.length + ((Math.random() * (max - min) + min) | 0);
				}
			} else
				count = particles.length + min;
		} else if (max)
			count = particles.length + max;
		while (particles.length < count)
			particles.push(resetParticle({}, width, height));
		streamingConfetti = true;
		pause = false;
		runAnimation();
		if (timeout) {
			window.setTimeout(stopConfetti, timeout);
		}
	}

	function stopConfetti() {
		streamingConfetti = false;
	}

	function removeConfetti() {
		stop();
		pause = false;
		particles = [];
	}

	function toggleConfetti() {
		if (streamingConfetti)
			stopConfetti();
		else
			startConfetti();
	}

	function isConfettiRunning() {
		return streamingConfetti;
	}

	function drawParticles(context) {
		var particle;
		var x, y, x2, y2;
		for (var i = 0; i < particles.length; i++) {
			particle = particles[i];
			context.beginPath();
			context.lineWidth = particle.diameter;
			x2 = particle.x + particle.tilt;
			x = x2 + particle.diameter / 2;
			y2 = particle.y + particle.tilt + particle.diameter / 2;
			if (confetti.gradient) {
				var gradient = context.createLinearGradient(x, particle.y, x2, y2);
				gradient.addColorStop("0", particle.color);
				gradient.addColorStop("1.0", particle.color2);
				context.strokeStyle = gradient;
			}
			context.moveTo(x, particle.y);
			context.lineTo(x2, y2);
			context.stroke();
		}
	}

	function updateParticles() {
		var width = window.innerWidth;
		var height = window.innerHeight;
		var particle;
		waveAngle += 0.01;
		for (var i = 0; i < particles.length; i++) {
			particle = particles[i];
			if (!streamingConfetti && particle.y < -15)
				particle.y = height + 100;
			else {
				particle.tiltAngle += particle.tiltAngleIncrement;
				particle.x += Math.sin(waveAngle) - 0.5;
				particle.y += (Math.cos(waveAngle) + particle.diameter + confetti.speed) * 0.5;
				particle.tilt = Math.sin(particle.tiltAngle) * 15;
			}
			if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
				if (streamingConfetti && particles.length <= confetti.maxCount)
					resetParticle(particle, width, height);
				else {
					particles.splice(i, 1);
					i--;
				}
			}
		}
	}
})();