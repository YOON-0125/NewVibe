import * as PIXI from 'pixi.js';
import { Player, Vector2 } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { GameState } from '../../contexts/GameStateContext';

export interface Projectile {
  sprite: PIXI.Graphics;
  position: Vector2;
  velocity: Vector2;
  damage: number;
  lifetime: number;
  maxLifetime: number;
  isEnemyProjectile?: boolean; // (Gemini) 적 투사체 여부
}

// (Gemini) 궤도 무기 인스턴스를 위한 인터페이스
export interface OrbitalWeaponInstance {
  sprite: PIXI.Graphics;
  damage: number; // (Gemini) 궤도 무기 데미지 속성 추가
}

export class WeaponManager {
  private player: Player;
  private projectiles: Projectile[] = [];
  private orbitalWeapons: OrbitalWeaponInstance[] = []; // (Gemini) 타입 변경
  private orbitalAngle: number = 0;
  private orbitalRadius: number = 40;
  private orbitalSpeed: number = 3;
  private projectileTimer: number = 0;
  private projectileInterval: number = 0.5;

  private shield: PIXI.Graphics | null = null;
  private shieldRadius: number = 50;
  private shieldDamage: number = 5;
  private shieldDamageCooldown: number = 0;
  private shieldDamageInterval: number = 0.5;

  constructor(player: Player) {
    this.player = player;
  }

  updateWeaponStats(gameState: GameState): void {
    // (Gemini) 직선탄 데미지 및 속도 업데이트
    this.projectiles.forEach((p) => (p.damage = gameState.weapons.projectile.damage)); // 기존 투사체 데미지 업데이트
    this.projectileInterval = 1 / (1 + gameState.weapons.projectile.level * 0.2); // 발사 간격
    // (Gemini) projectile.speed는 createProjectile에서 사용되므로 직접 업데이트 필요 없음

    // (Gemini) 궤도탄 데미지 및 개수 업데이트
    this.orbitalWeapons.forEach((ow) => (ow.damage = gameState.weapons.orbital.damage)); // 기존 궤도탄 데미지 업데이트
    if (
      gameState.weapons.orbital.level > 0 &&
      this.orbitalWeapons.length < gameState.weapons.orbital.count
    ) {
      // (Gemini) 필요한 경우 궤도탄 추가
      // 이 로직은 GameEngine에서 addOrbitalWeapon을 호출하므로 여기서는 개수만 동기화
      while (this.orbitalWeapons.length < gameState.weapons.orbital.count) {
        this.addOrbitalWeapon(
          this.player.sprite.parent as PIXI.Container,
          gameState.weapons.orbital.damage,
        ); // (Gemini) 데미지 인자 추가
      }
    } else if (gameState.weapons.orbital.level === 0 && this.orbitalWeapons.length > 0) {
      // (Gemini) 궤도탄 레벨이 0이면 모두 제거
      this.orbitalWeapons.forEach((ow) =>
        ow.sprite.parent?.removeChild(ow.sprite as unknown as PIXI.DisplayObject),
      ); // (Gemini) sprite에 접근 및 타입 단언
      this.orbitalWeapons = [];
    }

    // (Gemini) 방어막 데미지, 반경, 쿨다운 업데이트
    if (gameState.weapons.shield.level > 0) {
      this.shieldDamage = gameState.weapons.shield.damage;
      this.shieldRadius = gameState.weapons.shield.radius;
      this.shieldDamageInterval = gameState.weapons.shield.cooldown;
      // (Gemini) 방어막이 활성화되어 있다면 시각적으로 업데이트
      if (this.shield) {
        this.upgradeShield(this.player.sprite.parent as PIXI.Container);
      }
    } else {
      // (Gemini) 방어막 레벨이 0이면 제거
      if (this.shield && this.shield.parent) {
        this.shield.parent.removeChild(this.shield as unknown as PIXI.DisplayObject);
        this.shield = null;
      }
    }
  }

  update(deltaTime: number, stage: PIXI.Container): void {
    this.updateOrbitalWeapons(deltaTime);
    this.updateProjectiles(deltaTime, stage);
    this.updateShield(deltaTime);
  }

  private updateShield(deltaTime: number): void {
    if (!this.shield) return;

    const playerPos = this.player.getPosition();
    this.shield.x = playerPos.x;
    this.shield.y = playerPos.y;

    this.shieldDamageCooldown -= deltaTime;
  }

  getShieldDamageTargets(enemies: Enemy[]): Enemy[] {
    if (!this.shield || this.shieldDamageCooldown > 0) {
      return [];
    }

    this.shieldDamageCooldown = this.shieldDamageInterval;

    const playerPos = this.player.getPosition();
    return enemies.filter((enemy) => {
      if (enemy.isAlive()) {
        const enemyPos = enemy.getPosition();
        const distance = Math.sqrt(
          Math.pow(enemyPos.x - playerPos.x, 2) + Math.pow(enemyPos.y - playerPos.y, 2),
        );
        return distance <= this.shieldRadius;
      }
      return false;
    });
  }

  fireProjectiles(deltaTime: number, enemies: Enemy[], stage: PIXI.Container): void {
    this.projectileTimer += deltaTime;

    if (this.projectileTimer >= this.projectileInterval && enemies.length > 0) {
      const playerPos = this.player.getPosition();
      let closestEnemy: Enemy | undefined = undefined;
      let closestDistance = Infinity;

      for (const enemy of enemies) {
        const enemyPos = enemy.getPosition();
        const distance = Math.sqrt(
          Math.pow(enemyPos.x - playerPos.x, 2) + Math.pow(enemyPos.y - playerPos.y, 2),
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestEnemy = enemy;
        }
      }

      if (closestEnemy) {
        const enemyPos = closestEnemy.getPosition();
        const dx = enemyPos.x - playerPos.x;
        const dy = enemyPos.y - playerPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          const speed = 200;
          const velocity: Vector2 = { x: (dx / distance) * speed, y: (dy / distance) * speed };
          this.createProjectile(playerPos, velocity, stage, false); // (Gemini) isEnemyProjectile: false
        }
      }

      this.projectileTimer = 0;
    }
  }

  // (Gemini) 적 투사체 발사 메서드 추가
  fireEnemyProjectile(
    position: Vector2,
    targetPosition: Vector2,
    damage: number,
    speed: number,
    stage: PIXI.Container,
  ): void {
    const dx = targetPosition.x - position.x;
    const dy = targetPosition.y - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const velocity: Vector2 = { x: (dx / distance) * speed, y: (dy / distance) * speed };
      this.createProjectile(position, velocity, stage, true, damage); // (Gemini) isEnemyProjectile: true
    }
  }

  private updateOrbitalWeapons(deltaTime: number): void {
    this.orbitalAngle += this.orbitalSpeed * deltaTime;

    const playerPos = this.player.getPosition();
    this.orbitalWeapons.forEach((weaponInstance, index) => {
      const angle = this.orbitalAngle + index * ((Math.PI * 2) / this.orbitalWeapons.length);
      weaponInstance.sprite.x = playerPos.x + Math.cos(angle) * this.orbitalRadius;
      weaponInstance.sprite.y = playerPos.y + Math.sin(angle) * this.orbitalRadius;
    });
  }

  private updateProjectiles(deltaTime: number, stage: PIXI.Container): void {
    this.projectiles = this.projectiles.filter((projectile) => {
      projectile.position.x += projectile.velocity.x * deltaTime;
      projectile.position.y += projectile.velocity.y * deltaTime;
      projectile.sprite.x = projectile.position.x;
      projectile.sprite.y = projectile.position.y;
      projectile.lifetime += deltaTime;

      if (
        projectile.lifetime >= projectile.maxLifetime ||
        projectile.position.x < -50 ||
        projectile.position.x > 425 ||
        projectile.position.y < -50 ||
        projectile.position.y > 505
      ) {
        stage.removeChild(projectile.sprite as unknown as PIXI.DisplayObject);
        return false;
      }

      return true;
    });
  }

  private createProjectile(
    position: Vector2,
    velocity: Vector2,
    stage: PIXI.Container,
    isEnemyProjectile: boolean,
    damage?: number,
  ): void {
    const sprite = new PIXI.Graphics();
    sprite.beginFill(isEnemyProjectile ? 0xff0000 : 0xffff00, 1); // (Gemini) 적 투사체는 빨간색
    sprite.drawCircle(0, 0, isEnemyProjectile ? 5 : 3); // (Gemini) 적 투사체는 조금 더 크게
    sprite.endFill();
    sprite.x = position.x;
    sprite.y = position.y;

    const projectile: Projectile = {
      sprite,
      position: { ...position },
      velocity,
      damage: damage || 15, // (Gemini) 데미지 인자 사용
      lifetime: 0,
      maxLifetime: 3,
      isEnemyProjectile: isEnemyProjectile, // (Gemini) 적 투사체 여부 저장
    };

    this.projectiles.push(projectile);
    stage.addChild(sprite as unknown as PIXI.DisplayObject);
  }

  addOrbitalWeapon(stage: PIXI.Container, damage: number): void {
    // (Gemini) damage 인자 추가
    const weapon = new PIXI.Graphics();
    weapon.beginFill(0x00ffff, 0.8);
    weapon.drawCircle(0, 0, 8);
    weapon.endFill();
    weapon.lineStyle(1, 0xffffff, 1);
    weapon.drawCircle(0, 0, 8);

    const orbitalWeaponInstance: OrbitalWeaponInstance = {
      sprite: weapon,
      damage: damage, // (Gemini) 데미지 저장
    };

    this.orbitalWeapons.push(orbitalWeaponInstance);
    stage.addChild(weapon as unknown as PIXI.DisplayObject);
  }

  upgradeShield(stage: PIXI.Container): void {
    if (!this.shield) {
      this.shield = new PIXI.Graphics();
      stage.addChild(this.shield as unknown as PIXI.DisplayObject);
    }

    this.shield.clear();
    this.shield.beginFill(0x0000ff, 0.2);
    this.shield.drawCircle(0, 0, this.shieldRadius);
    this.shield.endFill();
    this.shield.lineStyle(2, 0x00ffff, 0.5);
    this.shield.drawCircle(0, 0, this.shieldRadius);
  }

  removeProjectile(projectile: Projectile): void {
    const index = this.projectiles.indexOf(projectile);
    if (index > -1) {
      this.projectiles.splice(index, 1);
    }
  }

  getProjectiles(): Projectile[] {
    return this.projectiles;
  }

  getOrbitalWeapons(): PIXI.Graphics[] {
    // (Gemini) 반환 타입 변경
    return this.orbitalWeapons.map((ow) => ow.sprite);
  }

  clear(stage: PIXI.Container): void {
    this.projectiles.forEach((projectile) => {
      stage.removeChild(projectile.sprite as unknown as PIXI.DisplayObject);
    });
    this.projectiles = [];

    this.orbitalWeapons.forEach((weaponInstance) => {
      stage.removeChild(weaponInstance.sprite as unknown as PIXI.DisplayObject);
    });
    this.orbitalWeapons = [];

    if (this.shield) {
      stage.removeChild(this.shield as unknown as PIXI.DisplayObject);
      this.shield = null;
    }
  }

  clearAllProjectiles(stage: PIXI.Container): void {
    this.projectiles.forEach((projectile) => {
      try {
        if (projectile.sprite && projectile.sprite.parent === stage) {
          stage.removeChild(projectile.sprite as unknown as PIXI.DisplayObject);
        }
      } catch (error) {
        console.warn('Failed to remove projectile sprite:', error);
      }
    });
    this.projectiles = [];
    console.log('All projectiles cleared from stage');
  }
}
