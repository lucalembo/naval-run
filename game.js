let gameWidth = window.innerWidth;
let gameHeight = window.innerHeight;

let config = {
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    backgroundColor: '#1d3557',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);

let lanes = [
    gameWidth * 0.25,
    gameWidth * 0.5,
    gameWidth * 0.75
];

let currentLane = 1;
let barca;
let ostacoli = [];
let cursors, keyA, keyD;
let score = 0;
let counterText;
let speed = 150;
let lastKeyPressed = null;

function preload() {
    this.load.image('barca', 'assets/barca.png');
    this.load.image('boa', 'assets/boa.png');
}

function create() {
    barca = this.physics.add.sprite(lanes[currentLane], gameHeight - 100, 'barca');
    barca.setScale(gameWidth < 500 ? 0.18 : 0.25);
    barca.setCollideWorldBounds(true);
    barca.body.setImmovable(true);

    counterText = this.add.text(10, 10, 'Ostacoli: 0', {
        fontSize: '20px',
        fill: '#ffffff'
    });

    cursors = this.input.keyboard.createCursorKeys();
    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.input.on('pointerdown', pointer => {
        if (pointer.x < gameWidth / 2) {
            if (currentLane > 0) currentLane--;
        } else {
            if (currentLane < 2) currentLane++;
        }
    });

    this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
            let lane = Phaser.Math.Between(0, 2);
            let ostacolo = this.physics.add.sprite(lanes[lane], -30, 'boa');
            ostacolo.setScale(gameWidth < 500 ? 0.07 : 0.1);
            ostacolo.body.setVelocityY(speed);
            ostacoli.push(ostacolo);
        }
    });

    this.time.addEvent({
        delay: 350,
        loop: true,
        callback: () => {
            speed += 10;
        }
    });
}

function update() {
    if ((cursors.left.isDown || keyA.isDown) && lastKeyPressed !== 'left') {
        if (currentLane > 0) currentLane--;
        lastKeyPressed = 'left';
    } else if ((cursors.right.isDown || keyD.isDown) && lastKeyPressed !== 'right') {
        if (currentLane < 2) currentLane++;
        lastKeyPressed = 'right';
    }

    if (
        (lastKeyPressed === 'left' && !cursors.left.isDown && !keyA.isDown) ||
        (lastKeyPressed === 'right' && !cursors.right.isDown && !keyD.isDown)
    ) {
        lastKeyPressed = null;
    }

    barca.x = lanes[currentLane];

    ostacoli = ostacoli.filter(o => {
        let dx = Math.abs(barca.x - o.x);
        let dy = o.y - barca.y;

        if (dx < 30 && dy > -80 && dy < 40) {
            game.scene.scenes[0].scene.restart();
            score = 0;
            speed = 150;
            return false;
        }

        if (o.y > gameHeight) {
            o.destroy();
            score++;
            counterText.setText("Ostacoli: " + score);

            if (score === 30) {
                document.getElementById("popup").style.display = "block";
                game.scene.scenes[0].scene.pause();
            }
            return false;
        }

        return true;
    });
}
