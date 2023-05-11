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
    // PARTICLES
    this.load.image("red", "https://labs.phaser.io/assets/particles/red.png");
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
      frameRate: 30,
      repeat: -1,
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
      let box = this.physics.add
        .sprite(x, y, 'present')
        .setVelocityY(35)
        .setDragY(70)
        .setDepth(1);
      // physics options test
      // box.setCollideWorldBounds(true);
      // box.setCircle(42, 34, 44);
      // box.setBounce(1);
      // box.setVelocity(150, 60);


      //  Make them all input enabled
      box.setInteractive({ cursor: "pointer" });
      // let particles;
      //  The images will dispatch a 'clicked' event when they are clicked on
      box.on("clicked", () => {
        this.clickHandler(box, ping);
      });
      // Pointer over event
      box.on("pointerover", () => {
        // Effetto hover box
        box.play("present-hover")
            // .once('animationcomplete', () => {
            //   alert('tiamo')
            // })

        // Effetto particelle inizia nascosto in posizione dell'elemento
        // particles = this.add.particles(box.x, box.y + 25, "red", {
        //   angle: { min: 70, max: 90 },
        //   speed: 75,
        //   scale: { start: 0.1, end: 0.1 },
        //   blendMode: "ADD",
        // });
      });
      // Pointer out event
      box.on("pointerout", () => {
        // particles.explode();
      });

      this.bonuses.push(box);
      bonuses++;
    }
    // init random animation

    this.doAnimateRandomElement()


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
    const boom = this.add.sprite(box.x, box.y).play("explosion-animation");
    boom.on("animationcomplete", () => {
      boom.destroy();
    });
    ping.play();
    if (bonuses === 1) this.gameOver();
    bonuses--;
    box.off("clicked", this.clickHandler);
    box.input.enabled = false;
    box.setVisible(false);
    // particles.explode(50);
  }

  doAnimateRandomElement() {
    setInterval(() => {
      // Stop animations
      // this.bonuses.forEach(bonus => { todo
      //   if (bonus.anims.key === 'present-animation'){
      //     bonus.pause("present-animation")
      //   }
      // })
      let boxToAnimate;
      // Random pick inside bonus array
      do {
        boxToAnimate = Phaser.Math.Between(0, GAME_BONUSES - 1)
      } while (boxToAnimate === this.oldIndexBonusAnimated)
      this.oldIndexBonusAnimated = boxToAnimate;
      this.bonuses[boxToAnimate].play("present-animation")
    }, GAME_ANIMATION_TIME)
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
        `Bonus terminati :D
        
        torna a trovarci prossimamente!
            `,
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
