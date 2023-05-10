let info;
let bonuses = 0;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const GAME_BONUSES = 4;

class Boxgame extends Phaser.Scene {
  constructor() {
    super();
    this.bonuses = [];
  }

  preload() {
    // IMAGES
    this.load.image("background", "assets/background.png");
    // SPRITESHEETS
    this.load.spritesheet("present", "assets/sprites/present-animation.png", {
      frameWidth: 150,
      frameHeight: 150,
      endFrame: 12,
    });
    this.load.spritesheet("present-hover", "assets/sprites/present-hover.png", {
      frameWidth: 150,
      frameHeight: 150,
      endFrame: 44,
    });
    this.load.spritesheet("explosion", "assets/sprites/boom.png", {
      frameWidth: 100,
      frameHeight: 90,
      endFrame: 4,
    });
    // PARTICLES
    this.load.image("red", "https://labs.phaser.io/assets/particles/red.png");
    // AUDIO
    this.load.audio("ping", "assets/audio/p-ping.mp3");
  }

  create() {
    // Background
    this.add.image(400, 300, "background");

    // Present animation
    this.anims.create({
      key: "present-animation",
      frames: "present",
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "present-hover",
      frames: "present-hover",
      frameRate: 20,
      repeat: -1,
    });

    // Boom animation
    this.anims.create({
      key: "explosion-animation",
      frames: "explosion",
      frameRate: 10,
    });

    // Ping sound
    const ping = this.sound.add("ping");

    //  Create a bunch of images
    let margin = 160;
    let x = 0;
    for (let i = 0; i < GAME_BONUSES; i++) {
      x += margin;
      let y = Phaser.Math.Between(200, 425);
      let box = this.physics.add
        .sprite(x, y)
        .play("present-animation")
        .setVelocityY(50)
        .setDragY(200);

      // physics options test
      // box.setCollideWorldBounds(true);
      // box.setCircle(42, 34, 44);
      // box.setBounce(1);
      // box.setVelocity(100, 60);

      box.setDepth(1);

      //  Make them all input enabled
      box.setInteractive({ cursor: "pointer" });
      let particles;
      //  The images will dispatch a 'clicked' event when they are clicked on
      box.on("clicked", () => {
        this.clickHandler(box, ping, particles);
      });
      // Pointer over event
      box.on("pointerover", () => {
        // Effetto hover box
        box.play("present-hover");
        // Effetto particelle inizia nascosto in posizione dell'elemento
        particles = this.add.particles(box.x, box.y + 25, "red", {
          angle: { min: 0, max: 180 },
          speed: 75,
          scale: { start: 0.1, end: 0.1 },
          blendMode: "ADD",
        });
      });
      // Pointer out event
      box.on("pointerout", () => {
        box.play("present-animation");
        particles.explode();
      });

      this.bonuses.push(box);
      bonuses++;
    }

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
    info.setText("Bonus restanti: " + bonuses); // TODO QUI ???
  }

  clickHandler(box, ping, particles) {
    // PLAY SUONO E GESTIONE LAST BONUS

    if (this.dragActive === true) {
      return;
    }
    const boom = this.add.sprite(box.x, box.y).play("explosion-animation");
    boom.on("animationcomplete", () => {
      boom.visible = false;
    });
    ping.play();
    if (bonuses === 1) this.gameOver();
    bonuses--;
    box.off("clicked", this.clickHandler);
    box.input.enabled = false;
    box.setVisible(false);
    particles.explode(50);
  }

  // hoverHandlerOver(box) { davide
  //   // TODO SETFRAME ( SWITCH FRAME X ANIMAZIONE )
  // }

  // hoverHandlerOut(box) {}

  gameOver() {
    // Disegno velo trasparente
    this.veil = this.add.graphics({ x: 0, y: 0 });
    this.veil.fillStyle("0x00000", 0.75);
    this.veil.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add.text(
      50,
      250,
      "Bonus terminati.. torna a trovarci prossimamente!",
      {
        font: "32px Arial",
        fill: "#fff",
      }
    );
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
