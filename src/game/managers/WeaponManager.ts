import * as PIXI from 'pixi.js';
import { Player, Vector2 } from '../entities/Player';
import { Enemy } from '../entities/Enemy';

export interface Projectile {
  sprite: PIXI.Graphics;
  position: Vector2;
  velocity: Vector2;
  damage: number;
  lifetime: number;
  maxLifetime: number;
}

export class WeaponManager {
  private player: Player;
  private projectiles: Projectile[] = [];
  private orbitalWeapons: PIXI.Graphics[] = [];
  private orbitalAngle: number = 0;
  private orbitalRadius: number = 40;
  private orbitalSpeed: number = 3; // radians per second
  private projectileTimer: number = 0;
  private projectileInterval: number = 0.5; // 0.5초마다 발사

  constructor(player: Player) {
    this.player = player;
  }

  update(deltaTime: number, enemies: Enemy[], stage: PIXI.Container): void {
    this.updateOrbitalWeapons(deltaTime);
    this.updateProjectiles(deltaTime, stage);
    this.fireProjectiles(deltaTime, enemies, stage);
  }

  private updateOrbitalWeapons(deltaTime: number): void {
    this.orbitalAngle += this.orbitalSpeed * deltaTime;
    
    const playerPos = this.player.getPosition();
    this.orbitalWeapons.forEach((weapon, index) => {
      const angle = this.orbitalAngle + (index * (Math.PI * 2 / this.orbitalWeapons.length));
      weapon.x = playerPos.x + Math.cos(angle) * this.orbitalRadius;
      weapon.y = playerPos.y + Math.sin(angle) * this.orbitalRadius;
    });
  }

  private updateProjectiles(deltaTime: number, stage: PIXI.Container): void {
    this.projectiles = this.projectiles.filter(projectile => {
      // 위치 업데이트
      projectile.position.x += projectile.velocity.x * deltaTime;
      projectile.position.y += projectile.velocity.y * deltaTime;
      projectile.sprite.x = projectile.position.x;
      projectile.sprite.y = projectile.position.y;

      // 수명 업데이트
      projectile.lifetime += deltaTime;
      
      // 화면 밖이거나 수명이 다한 투사체 제거
      if (projectile.lifetime >= projectile.maxLifetime ||
          projectile.position.x < -50 || projectile.position.x > 425 ||
          projectile.position.y < -50 || projectile.position.y > 505) {
        stage.removeChild(projectile.sprite as unknown as PIXI.DisplayObject);
        return false;
      }
      
      return true;
    });
  }

  private fireProjectiles(deltaTime: number, enemies: Enemy[], stage: PIXI.Container): void {
    this.projectileTimer += deltaTime;
    
    if (this.projectileTimer >= this.projectileInterval && enemies.length > 0) {
      const playerPos = this.player.getPosition();
      
      // 가장 가까운 적 찾기
      let closestEnemy: Enemy | undefined = undefined;
      let closestDistance = Infinity;
      
      for (const enemy of enemies) {
        const enemyPos = enemy.getPosition();
        const distance = Math.sqrt(
          Math.pow(enemyPos.x - playerPos.x, 2) + 
          Math.pow(enemyPos.y - playerPos.y, 2)
        );
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestEnemy = enemy;
        }
      }
      
      // 투사체 발사
      if (closestEnemy) {
        const enemyPos = closestEnemy.getPosition();
        const dx = enemyPos.x - playerPos.x;
        const dy = enemyPos.y - playerPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const speed = 200; // pixels per second
          const velocity: Vector2 = {
            x: (dx / distance) * speed,
            y: (dy / distance) * speed
          };
          
          this.createProjectile(playerPos, velocity, stage);
        }
      }
      
      this.projectileTimer = 0;
    }
  }

  private createProjectile(position: Vector2, velocity: Vector2, stage: PIXI.Container): void {
    const sprite = new PIXI.Graphics();
    sprite.beginFill(0xFFFF00, 1);
    sprite.drawCircle(0, 0, 3);
    sprite.endFill();
    sprite.x = position.x;
    sprite.y = position.y;
    
    const projectile: Projectile = {
      sprite,
      position: { ...position },
      velocity,
      damage: 15,
      lifetime: 0,
      maxLifetime: 3 // 3초 수명
    };
    
    this.projectiles.push(projectile);
    stage.addChild(sprite as unknown as PIXI.DisplayObject);
  }

  addOrbitalWeapon(stage: PIXI.Container): void {
    const weapon = new PIXI.Graphics();
    weapon.beginFill(0x00FFFF, 0.8);
    weapon.drawCircle(0, 0, 8);
    weapon.endFill();
    weapon.lineStyle(1, 0xFFFFFF, 1);
    weapon.drawCircle(0, 0, 8);
    
    this.orbitalWeapons.push(weapon);
    stage.addChild(weapon as unknown as PIXI.DisplayObject);
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
    return this.orbitalWeapons;
  }

  clear(stage: PIXI.Container): void {
    // 투사체 제거
    this.projectiles.forEach(projectile => {
      stage.removeChild(projectile.sprite as unknown as PIXI.DisplayObject);
    });
    this.projectiles = [];
    
    // 궤도 무기 제거
    this.orbitalWeapons.forEach(weapon => {
      stage.removeChild(weapon as unknown as PIXI.DisplayObject);
    });
    this.orbitalWeapons = [];
  }
}