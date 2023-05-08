let info;
let alive = 0;

class Example extends Phaser.Scene {
  constructor() {
    super();
  }

  preload() {
    this.load.image("bg", "assets/background.png");
    this.load.image("present", "assets/present.png");
    this.load.spritesheet("explosion", "assets/sprites/boom.png", {
      frameWidth: 50,
      frameHeight: 50,
    });
  }

  create() {
    this.add.image(400, 300, "bg");

    //  Create a bunch of images
    let margin = 160;
    let x = 0;

    for (let i = 0; i < 4; i++) {
      x += margin;
      let y = Phaser.Math.Between(200, 425);

      let box = this.add.sprite(x, y, "present");

      //  Make them all input enabled
      box.setInteractive();

      //  The images will dispatch a 'clicked' event when they are clicked on
      box.on("clicked", this.clickHandler, this);
      alive++;
    }

    // Creo animazione explode
    this.anims.create({
      key: "explode",
      frames: this.anims.generateFrameNumbers("explosion", {
        start: 0,
        end: 4,
      }),
      frameRate: 10,
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

    //  Display the game stats
    info = this.add.text(10, 10, "", { font: "32px Arial", fill: "#fff" });
  }

  update() {
    info.setText("Bonus restanti: " + alive);
  }

  clickHandler(box) {
    // box.anims.play("explode");
    alive--;
    box.off("clicked", this.clickHandler);
    box.input.enabled = false;
    box.setVisible(false);
  }

  gameOver() {
    this.input.off("gameobjectup");
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "present-game",
  width: 800,
  height: 600,
  scene: [Example],
};

const game = new Phaser.Game(config);
