import "./style.css";

const body = document.querySelector("body");
const musicEle = body.querySelector("#gameMusic");
const jumpMusicEle = body.querySelector("#jumpSound");
const canvas = body.querySelector("canvas");
canvas.width = 1024;
canvas.height = 576;
const c = canvas.getContext("2d");
const GRAVITY = 0.5 * 1.5;
let SCORE = Number(localStorage.getItem("SCORE")) || 0;
let GAMEOVER = false;
let SPAWN_WIDTH = 400;

function givemeImageObj(src) {
  const img = new Image();
  img.src = src;
  return img;
}

let imagesLoaded = 0;
const PlayerImg1 = givemeImageObj("./Player/player_stand.png");
const PlayerImg2 = givemeImageObj("./Player/player_walk_1.png");
const PlayerImg3 = givemeImageObj("./Player/player_walk_2.png");
const SnailImg1 = givemeImageObj("./snail/snail1.png");
const SnailImg2 = givemeImageObj("./snail/snail2.png");
const FlyImg1 = givemeImageObj("./Fly/Fly1.png");
const FlyImg2 = givemeImageObj("./Fly/Fly2.png");
const PlatfromIng = givemeImageObj("./ground.png");
const SkyImg = givemeImageObj("./Sky.png");
SkyImg.onload = checkImagesLoaded;
PlayerImg1.onload = checkImagesLoaded;
PlayerImg2.onload = checkImagesLoaded;
PlayerImg3.onload = checkImagesLoaded;
SnailImg1.onload = checkImagesLoaded;
SnailImg2.onload = checkImagesLoaded;
FlyImg1.onload = checkImagesLoaded;
FlyImg2.onload = checkImagesLoaded;
PlatfromIng.onload = checkImagesLoaded;

class Player {
  constructor(imgArr) {
    this.position = {
      x: 100,
      y: 150,
    };
    this.velocity = {
      x: 0,
      y: 0, // Set initial vertical velocity to 0
    };
    this.isGrounded = false;
    this.images = imgArr;
    this.height = this.images[0].height;
    this.width = this.images[0].width;
    this.count = 0;
    this.AnimationSpeed = 10;
    this.FrameCount = 0;
  }

  draw() {
    // c.fillStyle = "red";
    // c.fillRect(this.position.x, this.position.y, this.width, this.height);
    c.drawImage(this.images[this.count], this.position.x, this.position.y);
  }

  update() {
    this.FrameCount++;
    if (this.FrameCount % this.AnimationSpeed === 0) {
      this.count = (this.count + 1) % 3;
      this.FrameCount = 0;
    }
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (!this.isGrounded) {
      this.velocity.y += GRAVITY; // Apply gravity
    }

    // Check for ground collision
    if (this.position.y + this.height < canvas.height) {
      this.isGrounded = false;
    } else {
      this.velocity.y = 0;
      this.isGrounded = true;
      this.position.y = canvas.height - this.height; // Reset position
    }
  }
}

class Sky {
  constructor(x, y, image) {
    this.position = {
      x,
      y,
    };
    this.image = image;
    this.width = image.width;
    this.height = image.height;
    this.velocity = {
      x: -0.75,
      y: 0,
    };
  }
  draw() {
    c.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height + 125
    );
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
  }
}
const platformVelocity = {
  x: -5,
  y: 0,
};

class Platform {
  constructor(x, y, image) {
    this.position = {
      x,
      y,
    };
    this.velocity = platformVelocity;
    this.image = image;
    this.width = this.image.width;
    this.height = this.image.height;
  }
  draw() {
    c.drawImage(this.image, this.position.x, this.position.y);
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
  }
}

class Fly {
  constructor(x, y, imagesArr) {
    this.position = {
      x,
      y,
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.image = imagesArr;
    this.width = this.image[0].width;
    this.height = this.image[0].height;
    this.count = 0;
    this.animationSpeed = 10;
    this.frameCounter = 0;
  }
  draw() {
    c.drawImage(this.image[this.count], this.position.x, this.position.y);
  }
  update(velocity) {
    this.frameCounter++;
    if (this.frameCounter % this.animationSpeed === 0) {
      this.count = (this.count + 1) % 2;
      this.frameCounter = 0;
    }

    this.draw();
    this.position.x += velocity.x;
  }
}

class Snail {
  constructor(x, y, imagesArr) {
    this.position = {
      x,
      y,
    };
    this.velocity = {
      x: -1,
      y: 0,
    };
    this.image = imagesArr;
    this.height = this.image[0].height;
    this.width = this.image[0].width;
    this.count = 0;
    this.animationSpeed = 10;
    this.frameCounter = 0;
  }
  draw() {
    c.drawImage(this.image[this.count], this.position.x, this.position.y);
  }

  update(velocity) {
    this.frameCounter++;
    if (this.frameCounter % this.animationSpeed === 0) {
      this.count = (this.count + 1) % 2;
      this.frameCounter = 0;
    }
    this.draw();
    this.position.x += velocity.x;
  }
}

const player = new Player([PlayerImg1, PlayerImg2, PlayerImg3]);
let platforms = [
  new Platform(0, canvas.height - PlatfromIng.height, PlatfromIng),
];
let skys = [new Sky(0, 0, SkyImg)];
let Obstacles = [];

function generateObstacles() {
  const randNo = Math.floor(Math.random() * 10) + 1;
  const lastObstacle = Obstacles[Obstacles.length - 1];

  if (randNo <= 7) {
    // Generate Snail
    const snailY = canvas.height - PlatfromIng.height - SnailImg1.height;
    Obstacles.push(
      new Snail(
        lastObstacle
          ? lastObstacle.position.x + lastObstacle.width + SPAWN_WIDTH
          : canvas.width + 80,
        snailY,
        [SnailImg1, SnailImg2]
      )
    );
  } else {
    // Generate Fly
    const toss = Math.floor(Math.random() * 10) + 1;
    const flyY =
      toss < 7 ? 250 : canvas.height - PlatfromIng.height - FlyImg1.height;

    Obstacles.push(
      new Fly(
        lastObstacle
          ? lastObstacle.position.x + lastObstacle.width + SPAWN_WIDTH
          : canvas.width + 80,
        flyY,
        [FlyImg1, FlyImg2]
      )
    );
  }
}

for (let i = 0; i < 10; i++) generateObstacles();

function addNewPlatform() {
  const lastPlatfrom = platforms[platforms.length - 1];
  const newX = lastPlatfrom.position.x + lastPlatfrom.width;
  platforms.push(
    new Platform(newX, canvas.height - PlatfromIng.height, PlatfromIng)
  );
}
function addNewSky() {
  const lastSky = skys[skys.length - 1];
  const newX = lastSky.position.x + lastSky.width;
  skys.push(new Sky(newX, 0, SkyImg));
}
for (let i = 0; i < 4; i++) addNewPlatform();
for (let i = 0; i < 4; i++) addNewSky();
function drawScore() {
  c.fillStyle = "black";
  c.font = "20px Arial";
  c.fillText(`Score: ${SCORE}`, 20, 30);
}
function drawInstruction() {
  c.fillStyle = "black";
  c.font = "20px Arial";
  c.fillText(`Press Space Bar to jump`, canvas.width / 2 - 100, 30);
}

function animate() {
  requestAnimationFrame(animate);

  if (GAMEOVER) {
    GameOver();
  } else {
    musicEle.play();
    c.fillStyle = "white";
    c.fillRect(0, 0, canvas.width, canvas.height);
    // c.clearRect(0, 0, canvas.width, canvas.height);

    // snails.forEach((snail) => snail.update());
    skys.forEach((sky) => sky.update());

    platforms.forEach((platform) => platform.update());
    Obstacles.forEach((obstacle) => {
      obstacle.update(platformVelocity);
    });
    player.update();
    drawScore();
    drawInstruction();

    platforms.forEach((platform) => {
      if (
        player.position.y + player.height <= platform.position.y &&
        player.position.y + player.height + player.velocity.y >=
          platform.position.y &&
        player.position.x + player.width > platform.position.x &&
        player.position.x < platform.position.x + platform.width
      ) {
        player.velocity.y = 0;
        player.isGrounded = true;
        player.position.y = platform.position.y - player.height;
      }
    });

    Obstacles.forEach((obstacle) => {
      if (
        player.position.x + player.width > obstacle.position.x &&
        player.position.x < obstacle.position.x + obstacle.width &&
        player.position.y + player.height > obstacle.position.y &&
        player.position.y < obstacle.position.y + obstacle.height
      ) {
        setTimeout(() => {
          GAMEOVER = true;
        }, 150);
      }
    });

    let count = 0;
    platforms = platforms.filter((platform) => {
      if (platform.position.x + platform.width > 0) {
        return true;
      } else {
        count++;
        return false;
      }
    });
    for (let i = 0; i < count; i++) addNewPlatform();
    count = 0;
    skys = skys.filter((sky) => {
      if (sky.position.x + sky.width > 0) {
        return true;
      } else {
        count++;
        return false;
      }
    });
    for (let i = 0; i < count; i++) addNewSky();
    count = 0;
    Obstacles = Obstacles.filter((obstacle) => {
      if (obstacle.position.x + obstacle.width > 0) {
        return true;
      } else {
        count++;
        SCORE++;
        if (SCORE % 20 == 0) {
          platformVelocity.x -= 2;
          SPAWN_WIDTH = Math.min(SPAWN_WIDTH + 150, 750);
        }
        return false;
      }
    });
    for (let i = 0; i < count; i++) generateObstacles();
  }
}

function GameOver() {
  musicEle.pause();
  musicEle.currentTime = 0;
  let HighestScore = Number(localStorage.getItem("HighestScore")) || 0;
  c.fillStyle = "white";
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = "black";
  c.font = "25px Arial";
  c.fillText(
    `Highest Score : ${HighestScore}`,
    canvas.width / 2 - 100,
    canvas.height / 2 - 100
  );
  c.fillText(
    `Your Score : ${SCORE}`,
    canvas.width / 2 - 100,
    canvas.height / 2
  );
  c.fillText(
    "Press Enter to Restart The Game",
    canvas.width / 2 - 100,
    canvas.height / 2 + 100
  );

  if (SCORE > HighestScore) {
    localStorage.setItem("HighestScore", SCORE);
  }

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      window.location.reload();
      removeEventListener("keypress", handleKeyPress);
    }
  };

  addEventListener("keypress", handleKeyPress);
}

function checkImagesLoaded() {
  imagesLoaded++;
  if (imagesLoaded === 9) {
    animate();
  }
}
addEventListener("keydown", (event) => {
  if (event.code === "Space" && player.isGrounded) {
    player.velocity.y = -20; // Set vertical velocity for jump
    player.isGrounded = false; // Set grounded status to false
    jumpMusicEle.play();
  }
});
