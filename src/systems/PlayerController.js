// import Phaser from 'phaser';

// // PlayerController owns player movement so GameScene can stay focused on setup.
// export default class PlayerController {
//   constructor(player, inputManager) {
//     this.player = player;
//     this.inputManager = inputManager;
//     this.maxSpeed = 220;
//     this.jumpVelocity = -350;
//     this.acceleration = 0.16;
//     this.deceleration = 0.14;
//     this.facingDirection = 1;
//     this.enabled = true;
//   }

//   update(delta = 16.67) {
//     if (!this.player?.body) {
//       return;
//     }

//     if (!this.enabled) {
//       this.player.body.setVelocity(0, 0);
//       return;
//     }

//     this.applyHorizontalMovement(delta);
//     this.applyJump();
//     this.updateFacingDirection();
//     this.updateAnimation();
//   }

//   setEnabled(enabled) {
//     this.enabled = enabled;

//     if (!enabled && this.player?.body) {
//       this.player.body.setVelocity(0, 0);
//     }
//   }

//   applyHorizontalMovement(delta) {
//     // Arcade Physics movement is controlled by velocity. Positive x moves
//     // right, negative x moves left, and zero means the player is standing.
//     const currentVelocity = this.player.body.velocity.x;
//     const scaledAcceleration = this.scaleByDelta(this.acceleration, delta);
//     const scaledDeceleration = this.scaleByDelta(this.deceleration, delta);
//     let targetVelocity = 0;

//     if (this.inputManager.isDown('left')) {
//       targetVelocity = -this.maxSpeed;
//       this.facingDirection = -1;
//     }

//     if (this.inputManager.isDown('right')) {
//       targetVelocity = this.maxSpeed;
//       this.facingDirection = 1;
//     }

//     const lerpAmount = targetVelocity === 0 ? scaledDeceleration : scaledAcceleration;
//     let nextVelocity = Phaser.Math.Linear(currentVelocity, targetVelocity, lerpAmount);

//     // Snap tiny leftover values to zero so the idle animation can resume
//     // cleanly when the player releases the movement key.
//     if (targetVelocity === 0 && Math.abs(nextVelocity) < 1) {
//       nextVelocity = 0;
//     }

//     this.player.body.setVelocityX(nextVelocity);
//   }

//   applyJump() {
//     // Only jump from the ground. body.blocked.down is true when Arcade Physics
//     // is pressing the player's body against the ground or a platform.
//     if (this.inputManager.justPressed('jump') && this.isGrounded()) {
//       this.player.body.setVelocityY(this.jumpVelocity);
//     }
//   }

//   isGrounded() {
//     return this.player.body.blocked.down;
//   }

//   scaleByDelta(value, delta) {
//     return 1 - Math.pow(1 - value, delta / 16.67);
//   }

//   updateFacingDirection() {
//     // Flip the same sprite instead of loading separate left-facing art.
//     this.player.setFlipX(this.facingDirection < 0);
//   }

//   updateAnimation() {
//     if (!this.player.anims) {
//       return;
//     }

//     // Airborne takes priority so jumping still looks right while moving left
//     // or right in the air. The key check avoids restarting this short,
//     // non-looping jump animation every frame.
//     if (!this.isGrounded()) {
//       if (this.player.anims.currentAnim?.key !== 'player_jump') {
//         this.player.anims.play('player_jump', true);
//       }

//       return;
//     }

//     // On the ground, horizontal velocity decides between idle and walk.
//     if (this.player.body.velocity.x === 0) {
//       this.playAnimation('player_idle');
//       return;
//     }

//     this.playAnimation('player_walk');
//   }

//   playAnimation(animationKey) {
//     // Do not restart the same animation on every update tick. This keeps
//     // movement smooth and prevents flicker when switching between states.
//     if (this.player.anims.currentAnim?.key === animationKey) {
//       return;
//     }

//     this.player.anims.play(animationKey, true);
//   }
// }


import Phaser from 'phaser';

// PlayerController owns player movement so GameScene can stay focused on setup.
export default class PlayerController {
  constructor(player, inputManager) {
    this.player = player;
    this.inputManager = inputManager;
    this.maxSpeed = 220;
    this.jumpVelocity = -350;
    this.acceleration = 0.16;
    this.deceleration = 0.14;
    this.facingDirection = 1;
    this.enabled = true;
    this.lastFootstepTime = 0;
  }

  update(delta = 16.67) {
    if (!this.player?.body) {
      return;
    }

    if (!this.enabled) {
      this.player.body.setVelocity(0, 0);
      return;
    }

    this.applyHorizontalMovement(delta);
    this.applyJump();
    this.updateFacingDirection();
    this.updateAnimation();
  }

  setEnabled(enabled) {
    this.enabled = enabled;

    if (!enabled && this.player?.body) {
      this.player.body.setVelocity(0, 0);
    }
  }

  applyHorizontalMovement(delta) {
    // Arcade Physics movement is controlled by velocity. Positive x moves
    // right, negative x moves left, and zero means the player is standing.
    const currentVelocity = this.player.body.velocity.x;
    const scaledAcceleration = this.scaleByDelta(this.acceleration, delta);
    const scaledDeceleration = this.scaleByDelta(this.deceleration, delta);
    let targetVelocity = 0;

    if (this.inputManager.isDown('left')) {
      targetVelocity = -this.maxSpeed;
      this.facingDirection = -1;
    }

    if (this.inputManager.isDown('right')) {
      targetVelocity = this.maxSpeed;
      this.facingDirection = 1;
    }

    const lerpAmount = targetVelocity === 0 ? scaledDeceleration : scaledAcceleration;
    let nextVelocity = Phaser.Math.Linear(currentVelocity, targetVelocity, lerpAmount);

    // Snap tiny leftover values to zero so the idle animation can resume
    // cleanly when the player releases the movement key.
    if (targetVelocity === 0 && Math.abs(nextVelocity) < 1) {
      nextVelocity = 0;
    }

    this.player.body.setVelocityX(nextVelocity);
    const isMoving = Math.abs(nextVelocity) > 10;

if (isMoving && this.isGrounded()) {

  const now = this.player.scene.time.now;

  if (now - this.lastFootstepTime > 350) {

    this.player.scene.sound.play('sfx_walk', {
      volume: 0.35
    });

    this.lastFootstepTime = now;
  }
}
  }

  applyJump() {
    // Only jump from the ground. body.blocked.down is true when Arcade Physics
    // is pressing the player's body against the ground or a platform.
    if (this.inputManager.justPressed('jump') && this.isGrounded()) {
      this.player.body.setVelocityY(this.jumpVelocity);
    }
  }

  isGrounded() {
    return this.player.body.blocked.down;
  }

  scaleByDelta(value, delta) {
    return 1 - Math.pow(1 - value, delta / 16.67);
  }

  updateFacingDirection() {
    // Flip the same sprite instead of loading separate left-facing art.
    this.player.setFlipX(this.facingDirection < 0);
  }

  updateAnimation() {
    if (!this.player.anims) {
      return;
    }

    // Airborne takes priority so jumping still looks right while moving left
    // or right in the air. The key check avoids restarting this short,
    // non-looping jump animation every frame.
    // if (!this.isGrounded()) {
    //   if (this.player.anims.currentAnim?.key !== 'player_jump') {
    //     this.player.anims.play('player_jump', true);
    //   }

    //   return;
    // }
      if (!this.isGrounded()) {
      if (this.player.anims.currentAnim?.key !== 'player_jump') {
        this.player.anims.play('player_jump', true);
      }
      // Scale up jump sprite to match walk sprite size (artwork is smaller)
      this.player.scaleY = 1.6;
      this.player.scaleX = 1.6;
      return;
    }

    this.player.scaleY = 1;
    this.player.scaleX = 1;


    // On the ground, horizontal velocity decides between idle and walk.
    if (this.player.body.velocity.x === 0) {
      this.playAnimation('player_idle');
      return;
    }

    this.playAnimation('player_walk');
  }

  playAnimation(animationKey) {
    // Do not restart the same animation on every update tick. This keeps
    // movement smooth and prevents flicker when switching between states.
    if (this.player.anims.currentAnim?.key === animationKey) {
      return;
    }

    this.player.anims.play(animationKey, true);
  }
}
