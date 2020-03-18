import Phaser from 'phaser';
import Button from '../objects/button';

export default class InstructionsScene extends Phaser.Scene {
  constructor() {
    super('InstructionsScene');
  }

  create() {
    const { width } = this.cameras.main;
    const { height } = this.cameras.main;
    const instructionsText = this.make.text({
      x: width / 2,
      y: height / 2 + 50,
      text: '',
      style: {
        font: '18px monospace',
        fill: '#ffffff',
      },
    });
    instructionsText.setOrigin(0.5, 0.5);
    instructionsText.setText('To play the game, the player has to get a key to open the door to the next level of a game while avoiding obstacles like the bombs and the spiders.Use the arrows of your keyboard to control the player to jumping and moving left and right');
    this.menuButton = new Button(this, 400, 500, 'blueButton1', 'blueButton2', 'Menu', 'TitleScene');
  }
}