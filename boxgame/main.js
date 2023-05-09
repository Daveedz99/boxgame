let info;
let bonuses = 0;

class Boxgame extends Phaser.Scene {
  constructor() {
    super();
  }

  preload() {
    // IMAGES
    this.load.image("bg", "assets/background.png");
    this.load.image("present", "assets/present.png");
    this.load.spritesheet("presents", "assets/presents.png", {
      frameWidth: 80,
      frameHeight: 80,
    });
    this.load.spritesheet("explosion", "assets/sprites/boom.png", {
      frameWidth: 50,
      frameHeight: 50,
    });
    // AUDIO
    this.load.audio("ping", "assets/audio/p-ping.mp3");
  }

  create() {
    this.add.image(400, 300, "bg");
    const ping = this.sound.add("ping");

    //  Create a bunch of images
    let margin = 160;
    let x = 0;

    for (let i = 0; i < 4; i++) {
      x += margin;
      let y = Phaser.Math.Between(200, 425);

      let box = this.add.sprite(x, y, "present");

      //  Make them all input enabled
      box.setInteractive({ cursor: "pointer" });

      //  The images will dispatch a 'clicked' event when they are clicked on
      box.on("clicked", this.clickHandler, this);
      box.on("pointerover", this.hoverHandlerOver, this);
      box.on("pointerout", this.hoverHandlerOut, this);
      bonuses++;
    }

    // Creo animazione explode
    this.anims.create({
      key: "explode",
      frames: this.anims.generateFrameNumbers("explosion", {
        start: 0,
        end: 4,
      }),
      frameRate: 30,
      repeat: 0,
    });

    //  If a Game Object is clicked on, this event is fired.
    //  We can use it to emit the 'clicked' event on the game object itself.
    this.input.on(
      "gameobjectup",
      function (pointer, gameObject) {
        gameObject.emit("clicked", gameObject, ping);
      },
      this
    );

    //  Display the game stats
    info = this.add
      .text(10, 10, "", { font: "32px Arial", fill: "#fff" })
      .setVisible(true);
  }

  update() {
    info.setText("Bonus restanti: " + bonuses);
  }

  clickHandler(box, ping) {
    // PLAY SUONO E GESTIONE LAST BONUS
    box.play("explode");
    ping.play();
    if (bonuses === 1) this.gameOver();
    bonuses--;
    box.off("clicked", this.clickHandler);
    box.input.enabled = false;
    box.setVisible(false);
  }

  hoverHandlerOver(box) {
    // TODO SETFRAME ( SWITCH FRAME X ANIMAZIONE )
  }

  hoverHandlerOut(box) {}

  gameOver() {
    // Disegno velo trasparente
    this.veil = this.add.graphics({ x: 0, y: 0 });
    this.veil.fillStyle("0x00000", 0.75);
    this.veil.fillRect(0, 0, config.width, config.height);

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
  parent: "present-game",
  width: 800,
  height: 600,
  scene: [Boxgame],
};

const game = new Phaser.Game(config);
