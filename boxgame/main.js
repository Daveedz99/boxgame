let info;
let bonuses = 0;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const GAME_BONUSES = 4;

class Boxgame extends Phaser.Scene {
  constructor() {
    super();
  }

  preload() {
    // IMAGES
    this.load.image("background", "assets/background.png");
    this.load.image("present", "assets/present.png");
    // this.load.spritesheet("presents", "assets/presents.png", {
    //   frameWidth: 80,
    //   frameHeight: 80,
    // });
    this.load.spritesheet("explosion", "assets/sprites/boom.png", {
      frameWidth: 50,
      frameHeight: 50,
    });
    this.load.image("red", "https://labs.phaser.io/assets/particles/red.png");
    // AUDIO
    this.load.audio("ping", "assets/audio/p-ping.mp3");
  }

  create() {
    this.add.image(400, 300, "background");
    // Ping sound
    const ping = this.sound.add("ping");

    //  Create a bunch of images
    let margin = 160;
    let x = 0;
    for (let i = 0; i < GAME_BONUSES; i++) {
      x += margin;
      let y = Phaser.Math.Between(200, 425);

      let box = this.add.sprite(x, y, "present");
      box.setDepth(1);
      // this.graphics = this.add.graphics({ lineStyle: { width: 4, color: 0xaa00aa } });
      // this.line = new Phaser.Geom.Line(300, 300, 400, 300);

      let particles;

      //  Make them all input enabled
      box.setInteractive({ cursor: "pointer" });

      //  The images will dispatch a 'clicked' event when they are clicked on
      box.on("clicked", () => {
        this.clickHandler(box, ping, particles);
      });
      // Pointer over event
      box.on("pointerover", () => {
        // Effetto particelle inizia nascosto in posizione dell'elemento
        particles = this.add.particles(box.x, box.y, "red", {
          angle: { min: 0, max: 180 },
          speed: 70,
          scale: { start: 0.4, end: 0.3 },
          blendMode: "ADD",
        });
      });
      // Pointer out event
      box.on("pointerout", () => {
        particles.explode();
      });

      bonuses++;
    }

    // Creo animazione explode
    this.anims.create({
      key: "explode",
      frames: this.anims.generateFrameNumbers("explosion", {
        start: 0,
        end: 4,
      }),
      frameRate: 4,
      repeat: 0,
    });

    //  If a Game Object is clicked on, this event is fired.
    //  We can use it to emit the 'clicked' event on the game object itself.
    this.input.on(
      "gameobjectup",
      function (pointer, gameObject) {
        gameObject.emit("clicked", gameObject);
      },
      this
    );

    //  Display bonus rimanenti
    info = this.add
      .text(10, 10, "", { font: "32px Arial", fill: "#fff" })
      .setVisible(true);
  }

  update() {
    info.setText("Bonus restanti: " + bonuses);
  }

  clickHandler(box, ping, particles) {
    // PLAY SUONO E GESTIONE LAST BONUS
    // box.play("explode"); todo
    ping.play();
    if (bonuses === 1) this.gameOver();
    bonuses--;
    box.off("clicked", this.clickHandler);
    box.input.enabled = false;
    box.setVisible(false);
    particles.explode(50);
  }

  // hoverHandlerOver(box) {
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
    mode: Phaser.Scale.FIT,
    parent: "present-game",
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
};

const game = new Phaser.Game(config);
