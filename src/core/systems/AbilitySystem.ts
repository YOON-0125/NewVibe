import { Ability, AbilityEffect } from '../data/abilities';
import { Character } from '../entities/Character';
import { Player } from '../entities/Player';
import { AbilityType } from '../../shared/enums';
import { ABILITY_CONFIG } from '../../shared/constants';

/**
 * 능력 사용 기록
 */
interface AbilityUsage {
  abilityId: string;
  lastUsedTime: number;
  remainingCooldown: number;
}

/**
 * 활성 능력 효과
 */
interface ActiveEffect {
  abilityId: string;
  effectType: string;
  value: number;
  startTime: number;
  duration: number;
  target: Character;
}

/**
 * 능력 시스템
 * 능력 사용, 쿨다운 관리, 효과 적용 등을 담당
 */
export class AbilitySystem {
  private abilityUsages: Map<string, AbilityUsage> = new Map();
  private activeEffects: ActiveEffect[] = [];
  private toggledAbilities: Set<string> = new Set();

  constructor() {
    console.log('AbilitySystem initialized');
  }

  /**
   * 시스템 업데이트
   */
  public update(deltaTime: number): void {
    this.updateCooldowns(deltaTime);
    this.updateActiveEffects(deltaTime);
  }

  /**
   * 능력 사용
   */
  public useAbility(
    caster: Character, 
    ability: Ability, 
    target?: Character,
    targetPosition?: { x: number; y: number }
  ): boolean {
    // 사용 가능 여부 확인
    if (!this.canUseAbility(caster, ability)) {
      return false;
    }

    // 쿨다운 시작
    this.startCooldown(caster.getId(), ability);

    // 마나 소모
    if (ability.manaCost && caster instanceof Player) {
      // 마나 시스템은 추후 구현
    }

    // 능력 타입별 처리
    switch (ability.type) {
      case AbilityType.Active:
        return this.executeActiveAbility(caster, ability, target, targetPosition);
      
      case AbilityType.Toggle:
        return this.toggleAbility(caster, ability);
      
      case AbilityType.Passive:
        return this.applyPassiveAbility(caster, ability);
      
      default:
        console.warn(`Unknown ability type: ${ability.type}`);
        return false;
    }
  }

  /**
   * 액티브 능력 실행
   */
  private executeActiveAbility(
    caster: Character,
    ability: Ability,
    target?: Character,
    targetPosition?: { x: number; y: number }
  ): boolean {
    console.log(`${caster.getName()} uses ${ability.name}`);

    // 데미지 능력
    if (ability.damage && target) {
      const damage = this.calculateAbilityDamage(caster, ability);
      target.takeDamage(damage);
      console.log(`${ability.name} deals ${damage} damage to ${target.getName()}`);
    }

    // 치유 능력
    if (ability.healing && target) {
      const healing = this.calculateAbilityHealing(caster, ability);
      target.heal(healing);
      console.log(`${ability.name} heals ${target.getName()} for ${healing} HP`);
    }

    // 범위 공격
    if (ability.area && targetPosition) {
      // 추후 CombatSystem과 연동하여 범위 공격 처리
      console.log(`${ability.name} affects area around (${targetPosition.x}, ${targetPosition.y})`);
    }

    // 효과 적용
    if (ability.effects && target) {
      this.applyAbilityEffects(caster, target, ability);
    }

    return true;
  }

  /**
   * 토글 능력 실행
   */
  private toggleAbility(caster: Character, ability: Ability): boolean {
    const abilityKey = `${caster.getId()}_${ability.id}`;

    if (this.toggledAbilities.has(abilityKey)) {
      // 토글 끄기
      this.toggledAbilities.delete(abilityKey);
      this.removeActiveEffectsByAbility(caster, ability.id);
      console.log(`${caster.getName()} deactivates ${ability.name}`);
    } else {
      // 토글 켜기
      this.toggledAbilities.add(abilityKey);
      if (ability.effects) {
        this.applyAbilityEffects(caster, caster, ability);
      }
      console.log(`${caster.getName()} activates ${ability.name}`);
    }

    return true;
  }

  /**
   * 패시브 능력 적용
   */
  private applyPassiveAbility(caster: Character, ability: Ability): boolean {
    if (ability.effects) {
      this.applyAbilityEffects(caster, caster, ability);
      console.log(`${caster.getName()} gains passive ability: ${ability.name}`);
    }

    return true;
  }

  /**
   * 능력 사용 가능 여부 확인
   */
  public canUseAbility(caster: Character, ability: Ability): boolean {
    // 캐스터가 살아있는지 확인
    if (!caster.getIsAlive()) {
      return false;
    }

    // 쿨다운 확인
    if (this.isOnCooldown(caster.getId(), ability.id)) {
      return false;
    }

    // 마나 확인 (추후 구현)
    // if (ability.manaCost && !this.hasEnoughMana(caster, ability.manaCost)) {
    //   return false;
    // }

    return true;
  }

  /**
   * 쿨다운 시작
   */
  private startCooldown(casterId: string, ability: Ability): void {
    const cooldown = ability.cooldown || ABILITY_CONFIG.DEFAULT_COOLDOWN;
    const usageKey = `${casterId}_${ability.id}`;

    this.abilityUsages.set(usageKey, {
      abilityId: ability.id,
      lastUsedTime: Date.now(),
      remainingCooldown: cooldown,
    });
  }

  /**
   * 쿨다운 확인
   */
  public isOnCooldown(casterId: string, abilityId: string): boolean {
    const usageKey = `${casterId}_${abilityId}`;
    const usage = this.abilityUsages.get(usageKey);
    
    return usage ? usage.remainingCooldown > 0 : false;
  }

  /**
   * 남은 쿨다운 시간 가져오기
   */
  public getRemainingCooldown(casterId: string, abilityId: string): number {
    const usageKey = `${casterId}_${abilityId}`;
    const usage = this.abilityUsages.get(usageKey);
    
    return usage ? Math.max(0, usage.remainingCooldown) : 0;
  }

  /**
   * 쿨다운 업데이트
   */
  private updateCooldowns(deltaTime: number): void {
    for (const [key, usage] of this.abilityUsages) {
      if (usage.remainingCooldown > 0) {
        usage.remainingCooldown = Math.max(0, usage.remainingCooldown - deltaTime);
      }
    }
  }

  /**
   * 능력 데미지 계산
   */
  private calculateAbilityDamage(caster: Character, ability: Ability): number {
    const baseDamage = caster.getStats().attack;
    const multiplier = ability.damage || 1.0;
    
    return Math.floor(baseDamage * multiplier);
  }

  /**
   * 능력 치유량 계산
   */
  private calculateAbilityHealing(caster: Character, ability: Ability): number {
    const baseHealing = ability.healing || 0;
    // 추후 지혜, 마나 등의 스탯 연동
    
    return baseHealing;
  }

  /**
   * 능력 효과 적용
   */
  private applyAbilityEffects(
    caster: Character,
    target: Character,
    ability: Ability
  ): void {
    if (!ability.effects) return;

    ability.effects.forEach(effect => {
      // 확률 체크
      if (effect.chance && Math.random() > effect.chance) {
        return;
      }

      const activeEffect: ActiveEffect = {
        abilityId: ability.id,
        effectType: effect.type,
        value: effect.value,
        startTime: Date.now(),
        duration: effect.duration || 0,
        target: target,
      };

      this.activeEffects.push(activeEffect);
      console.log(`${target.getName()} is affected by ${effect.type} (${effect.value})`);
    });
  }

  /**
   * 활성 효과 업데이트
   */
  private updateActiveEffects(deltaTime: number): void {
    const currentTime = Date.now();

    // 지속시간이 끝난 효과 제거
    this.activeEffects = this.activeEffects.filter(effect => {
      if (effect.duration > 0 && currentTime - effect.startTime >= effect.duration) {
        console.log(`${effect.target.getName()}'s ${effect.effectType} effect has ended`);
        return false;
      }
      return true;
    });

    // 지속 효과 적용 (매초마다)
    this.activeEffects.forEach(effect => {
      const elapsedTime = currentTime - effect.startTime;
      const lastTick = Math.floor((elapsedTime - deltaTime) / 1000);
      const currentTick = Math.floor(elapsedTime / 1000);

      if (currentTick > lastTick) {
        this.applyPeriodicEffect(effect);
      }
    });
  }

  /**
   * 주기적 효과 적용
   */
  private applyPeriodicEffect(effect: ActiveEffect): void {
    if (!effect.target.getIsAlive()) return;

    switch (effect.effectType) {
      case 'burn':
      case 'poison':
        effect.target.takeDamage(effect.value);
        break;
      
      case 'regeneration':
        effect.target.heal(effect.value);
        break;
      
      // 다른 효과들은 필요에 따라 추가
    }
  }

  /**
   * 특정 능력의 활성 효과 제거
   */
  private removeActiveEffectsByAbility(target: Character, abilityId: string): void {
    this.activeEffects = this.activeEffects.filter(effect => 
      !(effect.target === target && effect.abilityId === abilityId)
    );
  }

  /**
   * 캐릭터의 모든 활성 효과 제거
   */
  public removeAllEffects(target: Character): void {
    this.activeEffects = this.activeEffects.filter(effect => effect.target !== target);
  }

  /**
   * 특정 캐릭터의 활성 효과 목록
   */
  public getActiveEffects(target: Character): ActiveEffect[] {
    return this.activeEffects.filter(effect => effect.target === target);
  }

  /**
   * 토글된 능력 확인
   */
  public isAbilityToggled(casterId: string, abilityId: string): boolean {
    const abilityKey = `${casterId}_${abilityId}`;
    return this.toggledAbilities.has(abilityKey);
  }

  /**
   * 시스템 정리
   */
  public dispose(): void {
    this.abilityUsages.clear();
    this.activeEffects = [];
    this.toggledAbilities.clear();
    console.log('AbilitySystem disposed');
  }
}
