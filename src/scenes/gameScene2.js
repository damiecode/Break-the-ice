/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
import Phaser from 'phaser';
import makeAnimations from '../animations/animations';


let player;
let coins;
let platforms;
let cursors;
let bombs;
let door;
let key;
let score = 0;
let scoreText;
let gameOverText;


export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene2' });
  }

  init() {
    this.hasKey = false;
  }

  preload() {
    this.load.image('ground', 'assets/images/ground.png');
    this.load.image('background', 'assets/images/background.png');
    this.load.image('clouds', 'assets/images/clouds.png');
    this.load.image('platform', 'assets/images/platform.png');
    this.load.image('ice-platform', 'assets/images/ice-platform.png');
    this.load.spritesheet('coin', './assets/images/coin_animated.png', {
      frameWidth: 22,
      frameHeight: 22,
    });
    this.load.spritesheet('dude', 'assets/images/dude.png', {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.on('complete', () => {
      makeAnimations(this);
    });
    this.load.spritesheet('door', './assets/images/door.png', {
      frameWidth: 42,
      frameHeight: 66,
    });
    this.load.image('key', './assets/images/key.png');
    this.load.image('bomb', 'assets/images/bomb.png');
    this.load.audio('coinSound', ['assets/audio/coin.wav']);
    this.load.audio('keySound', ['assets/audio/key.wav']);
    this.load.audio('doorSound', ['assets/audio/door.wav']);
    this.load.audio('jumpSound', ['assets/audio/jump.wav']);
    this.load.audio('gameOver', ['assets/audio/game-over-2.wav']);
  }

  create() {
    this.add.sprite(0, 0, 'background').setOrigin(0, 0).setScale(2);
    this.sky = this.add.tileSprite(0, 0, 640, 480, 'clouds');
    this.sky.fixedToCamera = true;
    cursors = this.input.keyboard.createCursorKeys();
    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(0, 64, 'ice-platform');
    platforms.create(200, 180, 'platform');
    platforms.create(400, 296, 'ice-platform');
    platforms.create(600, 412, 'platform');
    platforms.create(700, 296, 'ice-platform');
    platforms.create(400, 80, 'platform');

    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.physics.add.collider(player, platforms, this.setFriction, null, this);
    bombs = this.physics.add.group();

    scoreText = this.add.text(100, 16, `score: ${score}`, { fontSize: '32px', fill: '#000' });
    gameOverText = this.add.text(400, 300, 'Game Over', { fontSize: '64px', fill: '#000' });
    gameOverText.setOrigin(0.5);
    gameOverText.setVisible(false);
    this.createHud();

    door = this.physics.add.staticGroup();
    door.create(20, 450, 'door');

    key = this.physics.add.staticGroup();
    key.create(20, 20, 'key');

    coins = this.physics.add.group({
      key: 'coin',
      repeat: 20,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    bombs = this.physics.add.group({
      key: 'bomb',
      repeat: 2,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    coins.children.iterate((child) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    bombs.children.iterate((child) => {
      child.setBounce(1);
      child.setCollideWorldBounds(true);
      child.setVelocity(Phaser.Math.Between(-200, 200), 20);
    });

    this.coinSound = this.sound.add('coinSound');
    this.keySound = this.sound.add('keySound');
    this.jumpSound = this.sound.add('jumpSound');
    this.doorSound = this.sound.add('doorSound');
    this.gameOverSound = this.sound.add('gameOver');

    this.physics.add.collider(coins, platforms);
    this.physics.add.collider(player, door);
    this.physics.add.overlap(player, coins, this.collectCoin, null, this);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, this.hitBomb, null, this);
    this.physics.add.overlap(player, key, this.collectKey, null, this);
    this.physics.add.overlap(player, door, this.openDoor,
      (player, door) => this.hasKey && player.body.touching.down, this);
  }

  // eslint-disable-next-line class-methods-use-this
  setFriction(player, platforms) {
    if (platforms.key === 'ice-platform') {
      player.body.x -= platforms.body.x - platforms.body.prev.x;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  update() {
    if (cursors.left.isDown) {
      player.setVelocityX(-160);

      player.anims.play('left', true);
    } else if (cursors.right.isDown) {
      player.setVelocityX(160);

      player.anims.play('right', true);
    } else {
      player.setVelocityX(0);

      player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
      player.setVelocityY(-330);
      this.jumpSound.play();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  collectCoin(_player, coins) {
    this.coinSound.play();
    coins.disableBody(true, true);
    score += 10;
    scoreText.setText(`Score: ${score}`);
  }

  collectKey(_player, key) {
    key.disableBody(true, true);
    this.hasKey = true;
  }

  openDoor(player, door) {
    this.doorSound.play();
    this.scene.start('TitleScene');
  }

  createHud() {
    const coinIcon = this.make.image(0, 0, 'icon:coin');
    this.hud = this.physics.add.group();
    this.hud.add(coinIcon);
    this.hud.setOrigin(10, 10);
  }


  hitBomb(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    this.gameOverSound.play();
    gameOverText.setVisible(true);
    this.restart();
  }

  restart() {
    this.scene.start('TitleScene');
  }
}
