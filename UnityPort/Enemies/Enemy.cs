using UnityEngine;
using System.Collections.Generic;

public enum EnemyType { Basic, Chaser, Giant, Sniper }

public class Enemy : MonoBehaviour
{
    public EnemyType type;
    public float speed = 50f;
    public int health = 30;
    public float radius = 0.5f;
    public IEnemyBehavior behavior;

    public void Initialize(EnemyType enemyType, IEnemyBehavior enemyBehavior)
    {
        type = enemyType;
        behavior = enemyBehavior;
    }

    public void Tick(EnemyUpdateContext context)
    {
        behavior?.Update(this, context);
    }

    public void TakeDamage(int amount)
    {
        health -= amount;
        if (health <= 0)
        {
            Destroy(gameObject);
        }
    }
}

public struct EnemyUpdateContext
{
    public Vector3 playerPosition;
    public List<Enemy> allEnemies;
    public float deltaTime;
    public WeaponManager weaponManager;
}

public interface IEnemyBehavior
{
    void Update(Enemy enemy, EnemyUpdateContext context);
}

