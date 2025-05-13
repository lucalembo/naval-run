let config = {
    type: Phaser.AUTO,
    width: 400,
    height: 750,
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

let lanes = [100, 200, 300];
let currentLane = 1;
let barca;
let ostacoli = [];
let cursors, keyA, keyD;
let score = 0;
let counterText;
let speed = 150;
let lastKeyPressed = null;
let collisioneAvvenuta = false;
let lastBarrierTime = 0;

function preload() {
    this.load.image('barca', 'assets/barca.png');
    this.load.image('boa', 'assets/boa.png');
}

function create() {
    // ✅ Reset completo a ogni avvio
    score = 0;
    speed = 200;
    ostacoli = [];
    collisioneAvvenuta = false;

    barca = this.physics.add.sprite(lanes[currentLane], 580, 'barca');
    barca.setScale(0.2);
    barca.setCollideWorldBounds(true);
    barca.body.setImmovable(true);

    counterText = this.add.text(10, 10, 'Barriere: 0', {
        fontSize: '20px',
        fill: '#ffffff'
    });

    cursors = this.input.keyboard.createCursorKeys();
    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.input.on('pointerdown', pointer => {
        if (!giocoAttivo) return;
        if (pointer.x < config.width / 2) {
            if (currentLane > 0) currentLane--;
        } else {
            if (currentLane < 2) currentLane++;
        }
    });

    // 🛟 Barriere con varco centrale
    this.time.addEvent({
        delay: 650,
        loop: true,
        callback: () => {
            if (!giocoAttivo || this.time.now - lastBarrierTime < 1200) return;

            let corsiaLibera = Phaser.Math.Between(0, 2);

            for (let i = 0; i < 3; i++) {
                if (i !== corsiaLibera) {
                    let boa = this.physics.add.sprite(lanes[i], -30, 'boa');
                    boa.setScale(0.09);
                    boa.body.setVelocityY(speed);
                    ostacoli.push(boa);
                }
            }

            lastBarrierTime = this.time.now;
        }
    });

    // Velocità che aumenta gradualmente
    this.time.addEvent({
        delay: 3500,
        loop: true,
        callback: () => {
            if (giocoAttivo) speed += 5;
        }
    });
}

function update() {
    if (!giocoAttivo) return;

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

        // ✅ Collisione gestita correttamente
        if (!collisioneAvvenuta && dx < 30 && dy > -40 && dy < 40) {
            collisioneAvvenuta = true;
            giocoAttivo = false;

            // Rimuovi tutte le boe in scena
            ostacoli.forEach(b => b.destroy());
            ostacoli = [];

            this.time.delayedCall(50, () => {
                document.getElementById("retry-popup").style.display = "block";
            });

            return false;
        }

        // Se supera il fondo → barriera superata
        if (o.y > config.height) {
            o.destroy();

            if (!o.counted) {
                score++;
                counterText.setText("Barriere: " + score);
                o.counted = true;
            }

            if (score >= 30 && giocoAttivo) {
                document.getElementById("popup").style.display = "block";
                giocoAttivo = false;
            }

            return false;
        }

        return true;
    });
}
