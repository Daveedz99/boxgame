let info;
let bonuses = 0;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const GAME_BONUSES = 4;
const GAME_ANIMATION_TIME = 4000;

class Boxgame extends Phaser.Scene {
  constructor() {
    super();
    this.bonuses = [];
    this.oldIndexBonusAnimated = 1;
  }

  preload() {
    // IMAGES
    this.load.image("background", "assets/background.png");
    // SPRITESHEETS
    this.load.spritesheet("present", "assets/sprites/present-animation.png", {
      frameWidth: 150,
      frameHeight: 150,
      endFrame: 40,
    });
    this.load.spritesheet("present-hover", "assets/sprites/present-hover.png", {
      frameWidth: 150,
      frameHeight: 150,
      endFrame: 40,
    });
    this.load.spritesheet("explosion", "assets/sprites/boom.png", {
      frameWidth: 150,
      frameHeight: 150,
      endFrame: 20,
    });
    // AUDIO
    this.load.audio("ping", "assets/audio/p-ping.mp3");
  }

  create() {
    // Background
    this.add.image(400, 300, "background");
    // Ping sound
    const ping = this.sound.add("ping");

    // Present animation
    this.anims.create({
      key: "present-animation",
      frames: "present",
      frameRate: 30,
      repeat: -1,
    });
    this.anims.create({
      key: "present-hover",
      frames: "present-hover",
      frameRate: 35,
    });

    // Boom animation
    this.anims.create({
      key: "explosion-animation",
      frames: "explosion",
      frameRate: 30,
    });

    //  Create a bunch of images
    let margin = 160;
    let x = 0;
    //  TODO IL CICLO GIRA SU GAME BONUSES, DOVREBBE GIRARE SUI BOX
    for (let i = 0; i < GAME_BONUSES; i++) {
      x += margin;
      let y = Phaser.Math.Between(190, 415);
      let bonus = this.physics.add
        .sprite(x, y, "present")
        .setVelocityY(35)
        .setDragY(70)
        .setDepth(1);
      // physics options test
      // box.setCollideWorldBounds(true);
      // box.setCircle(42, 34, 44);
      // box.setBounce(1);
      // box.setVelocity(150, 60);

      //  Make them all input enabled
      bonus.setInteractive({ cursor: "pointer" });
      //  The images will dispatch a 'clicked' event when they are clicked on
      bonus.on("clicked", () => {
        this.clickHandler(bonus, ping);
      });
      // Pointer over event
      bonus.on("pointerover", () => {
        if (
          bonus.anims.isPlaying &&
          bonus.anims.currentAnim.key === "present-hover"
        ) {
          return;
        }
        bonus.play("present-hover");
        // Effetto hover box
      });
      // Pointer out event
      bonus.on("pointerout", () => {});

      this.bonuses.push(bonus);
      bonuses++;
    }
    // init random animation
    this.doAnimateRandomElement();

    // physics options test
    // this.physics.add.collider(this.bonuses);

    //  If a Game Object is clicked on, this event is fired.
    //  We can use it to emit the 'clicked' event on the game object itself.
    this.input.on(
      "gameobjectup",
      function (pointer, gameObject) {
        gameObject.emit("clicked", gameObject);
      },
      this
    );

    // Display bonus rimanenti
    info = this.add
      .text(10, 10, "", { font: "32px Arial", fill: "#fff" })
      .setVisible(true);
  }

  update() {
    info.setText("Bonus restanti: " + bonuses);
  }

  clickHandler(box, ping) {
    // PLAY SUONO E GESTIONE LAST BONUS
    bonuses--;
    ping.play();
    const boom = this.add.sprite(box.x, box.y).play("explosion-animation");
    boom.on("animationcomplete", () => {
      boom.destroy();
    });
    box.off("clicked", this.clickHandler);
    box.input.enabled = false;
    box.setVisible(false);
    this.gameOver();
  }

  doAnimateRandomElement() {
    setInterval(() => {
      this.bonuses.forEach((bonus) => {
        if (
          bonus.anims.isPlaying &&
          bonus.anims.currentAnim.key === "present-animation"
        ) {
          bonus.anims.stop("present-animation");
        }
      });
      // Random pick inside bonus array
      let indexBoxToAnimate;
      do {
        indexBoxToAnimate = Phaser.Math.Between(0, GAME_BONUSES - 1);
      } while (indexBoxToAnimate === this.oldIndexBonusAnimated);
      this.oldIndexBonusAnimated = indexBoxToAnimate;
      this.bonuses[indexBoxToAnimate].play("present-animation");
    }, GAME_ANIMATION_TIME);
  }

  gameOver() {
    this.scene.pause();
    // Disabilito tutti gli eventi
    this.bonuses.forEach((bonus) => {
      bonus.stop();
      bonus.disableInteractive();
    });
    // Disegno velo trasparente
    this.veil = this.add.graphics({ x: 0, y: 0 });
    this.veil.fillStyle("0x00000", 0.92);
    this.veil.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.veil.setDepth(2);
    // WIN TEXT
    const marginX = 300;
    const marginY = 100;
    const winText = this.add.text(
      GAME_WIDTH / 2 - marginX,
      GAME_HEIGHT / 2 - marginY,
      `CONGRATULAZIONI HAI VINTO: NULLA 
      
             Torna a trovarci domani`,
      {
        font: "32px Arial",
        fill: "#fff",
      }
    );
    winText.setDepth(2);

    info.setVisible(false);
    this.input.off("gameobjectup");
  }
}

const config = {
  type: Phaser.AUTO,
  scene: [Boxgame],
  scale: {
    // Responsive scaling
    mode: Phaser.Scale.FIT,
    parent: "present-game",
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  physics: {
    default: "arcade",
    arcade: {
      // debug: true,
      gravity: { y: 50 },
    },
  },
};

const game = new Phaser.Game(config);
