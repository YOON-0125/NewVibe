import { Character } from '../entities/Character';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { COMBAT_CONFIG } from '../../shared/constants';

/**
 * 전투 시스템
 * 데미지 계산, 전투 로직, 능력 사용 등을 관리
 */
export class CombatSystem {
  private combatLog: string[] = [];

  constructor() {
    console.log('CombatSystem initialized');
  }

  /**
   * 공격 실행
   */
  public performAttack(attacker: Character, target: Character): boolean {
    if (!attacker.getIsAlive() || !target.getIsAlive()) {
      return false;
    }

    const damage = this.calculateDamage(attacker, target);
    const isCritical = this.rollCritical();
    
    let finalDamage = damage;
    if (isCritical) {
      finalDamage *= COMBAT_CONFIG.CRITICAL_MULTIPLIER;
    }

    // 데미지 적용
    target.takeDamage(finalDamage);

    // 로그 추가
    const logMessage = isCritical 
      ? `${attacker.getName()} critically hits ${target.getName()} for ${finalDamage} damage!`
      : `${attacker.getName()} hits ${target.getName()} for ${finalDamage} damage`;
    
    this.addToLog(logMessage);

    // 타겟이 죽었는지 확인
    if (!target.getIsAlive()) {
      this.handleDeath(attacker, target);
    }

    return true;
  }

  /**
   * 데미지 계산
   */
  private calculateDamage(attacker: Character, target: Character): number {
    const attackerStats = attacker.getStats();
    const targetStats = target.getStats();

    // 기본 데미지
    const baseDamage = attackerStats.attack;
    
    // 방어력 적용
    const damageAfterDefense = COMBAT_CONFIG.DEFENSE_REDUCTION_FORMULA(
      baseDamage, 
      targetStats.defense
    );

    // 랜덤 요소 적용
    const variance = COMBAT_CONFIG.DAMAGE_VARIANCE;
    const randomFactor = 1 + (Math.random() * variance * 2 - variance);
    
    return Math.floor(damageAfterDefense * randomFactor);
  }

  /**
   * 치명타 판정
   */
  private rollCritical(): boolean {
    return Math.random() < COMBAT_CONFIG.CRITICAL_CHANCE;
  }

  /**
   * 사망 처리
   */
  private handleDeath(killer: Character, victim: Character): void {
    this.addToLog(`${victim.getName()} has been defeated!`);

    // 플레이어가 적을 죽였을 때
    if (killer instanceof Player && (victim instanceof Enemy || victim instanceof Boss)) {
      this.handleEnemyDeath(killer, victim);
    }
  }

  /**
   * 적 사망 처리
   */
  private handleEnemyDeath(player: Player, enemy: Enemy | Boss): void {
    // 경험치 획득
    let expReward = COMBAT_CONFIG.BASE_EXP_REWARD;
    
    if (enemy instanceof Boss) {
      expReward *= COMBAT_CONFIG.BOSS_EXP_MULTIPLIER;
      this.handleBossDeath(player, enemy);
    }

    player.gainExperience(expReward);
    this.addToLog(`${player.getName()} gained ${expReward} experience!`);
  }

  /**
   * 보스 사망 처리
   */
  private handleBossDeath(player: Player, boss: Boss): void {
    const droppableAbilities = boss.getDroppableAbilities();
    
    this.addToLog(`${boss.getName()} drops abilities:`);
    droppableAbilities.forEach((ability, index) => {
      this.addToLog(`${index + 1}. ${ability.name}`);
    });

    // 첫 번째 능력을 자동으로 습득 (나중에 선택 UI로 변경 예정)
    if (droppableAbilities.length > 0) {
      const selectedAbility = droppableAbilities[0];
      player.addAbility(selectedAbility);
      this.addToLog(`${player.getName()} learned ${selectedAbility.name}!`);
    }
  }

  /**
   * 범위 공격 실행
   */
  public performAreaAttack(
    attacker: Character, 
    centerPosition: { x: number; y: number }, 
    radius: number, 
    targets: Character[]
  ): Character[] {
    const hitTargets: Character[] = [];

    targets.forEach(target => {
      if (!target.getIsAlive() || target === attacker) {
        return;
      }

      const targetPos = target.getPosition();
      const distance = Math.sqrt(
        Math.pow(targetPos.x - centerPosition.x, 2) + 
        Math.pow(targetPos.y - centerPosition.y, 2)
      );

      if (distance <= radius) {
        if (this.performAttack(attacker, target)) {
          hitTargets.push(target);
        }
      }
    });

    return hitTargets;
  }

  /**
   * 치료 실행
   */
  public performHeal(healer: Character, target: Character, amount: number): boolean {
    if (!target.getIsAlive()) {
      return false;
    }

    const healerStats = healer.getStats();
    const actualHealAmount = Math.floor(amount * (1 + (healerStats.mana || 0) / 100));

    target.heal(actualHealAmount);
    
    this.addToLog(`${healer.getName()} heals ${target.getName()} for ${actualHealAmount} HP`);
    
    return true;
  }

  /**
   * 상태 효과 적용
   */
  public applyStatusEffect(
    caster: Character,
    target: Character,
    effectType: string,
    value: number,
    duration: number
  ): boolean {
    if (!target.getIsAlive()) {
      return false;
    }

    // 상태 효과 시스템은 추후 StatusEffectSystem과 연동
    this.addToLog(`${target.getName()} is affected by ${effectType}`);
    
    return true;
  }

  /**
   * 거리 기반 공격 가능 여부 확인
   */
  public canAttack(attacker: Character, target: Character, maxRange: number = 1): boolean {
    if (!attacker.getIsAlive() || !target.getIsAlive()) {
      return false;
    }

    const attackerPos = attacker.getPosition();
    const targetPos = target.getPosition();
    
    const distance = Math.sqrt(
      Math.pow(targetPos.x - attackerPos.x, 2) + 
      Math.pow(targetPos.y - attackerPos.y, 2)
    );

    return distance <= maxRange;
  }

  /**
   * 시야 확인
   */
  public hasLineOfSight(from: Character, to: Character): boolean {
    // 추후 MapSystem과 연동하여 벽 등의 장애물 확인
    // 현재는 항상 true 반환
    return true;
  }

  /**
   * 전투 로그에 추가
   */
  private addToLog(message: string): void {
    this.combatLog.push(`[${new Date().toLocaleTimeString()}] ${message}`);
    
    // 로그 크기 제한 (최대 100개)
    if (this.combatLog.length > 100) {
      this.combatLog.shift();
    }

    console.log(message);
  }

  /**
   * 전투 로그 가져오기
   */
  public getCombatLog(): string[] {
    return [...this.combatLog];
  }

  /**
   * 최근 로그 가져오기
   */
  public getRecentLog(count: number = 5): string[] {
    return this.combatLog.slice(-count);
  }

  /**
   * 전투 로그 초기화
   */
  public clearLog(): void {
    this.combatLog = [];
  }

  /**
   * 전투 통계 계산
   */
  public calculateCombatStats(character: Character): {
    attackPower: number;
    defense: number;
    criticalChance: number;
    criticalDamage: number;
  } {
    const stats = character.getStats();
    
    return {
      attackPower: stats.attack,
      defense: stats.defense,
      criticalChance: COMBAT_CONFIG.CRITICAL_CHANCE,
      criticalDamage: COMBAT_CONFIG.CRITICAL_MULTIPLIER,
    };
  }
}
