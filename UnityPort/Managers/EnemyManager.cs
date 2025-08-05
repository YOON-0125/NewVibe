using UnityEngine;
using System.Collections.Generic;

public class EnemyManager : MonoBehaviour
{
    public Enemy enemyPrefab;
    public WeaponManager weaponManager;
    private List<Enemy> enemies = new List<Enemy>();
    private float spawnTimer = 0f;
    public float spawnInterval = 2f;
    public float gameTime = 0f;

    void Update()
    {
        float dt = Time.deltaTime;
        gameTime += dt;
        spawnTimer += dt;
        if (spawnTimer >= spawnInterval)
        {
            spawnTimer = 0f;
            SpawnEnemy();
        }

        Vector3 playerPos = GameManager.Instance.player.Position;
        EnemyUpdateContext context = new EnemyUpdateContext
        {
            playerPosition = playerPos,
            allEnemies = enemies,
            deltaTime = dt,
            weaponManager = weaponManager
        };

        foreach (var enemy in enemies)
        {
            if (enemy != null)
            {
                enemy.Tick(context);
            }
        }
    }

    void SpawnEnemy()
    {
        Vector3 spawnPos = GetSpawnPosition();
        EnemyType type = GetEnemyTypeForTime();
        IEnemyBehavior behavior = CreateBehavior(type);
        Enemy newEnemy = Instantiate(enemyPrefab, spawnPos, Quaternion.identity);
        newEnemy.Initialize(type, behavior);
        enemies.Add(newEnemy);
    }

    Vector3 GetSpawnPosition()
    {
        float radius = 8f;
        Vector2 random = Random.insideUnitCircle.normalized * radius;
        return new Vector3(random.x, random.y, 0f);
    }

    EnemyType GetEnemyTypeForTime()
    {
        if (gameTime > 300f) return EnemyType.Sniper;
        if (gameTime > 120f) return EnemyType.Giant;
        if (gameTime > 30f) return EnemyType.Chaser;
        return EnemyType.Basic;
    }

    IEnemyBehavior CreateBehavior(EnemyType type)
    {
        switch (type)
        {
            case EnemyType.Chaser:
                return new BasicChaserBehavior();
            case EnemyType.Giant:
                return new GiantBehavior();
            case EnemyType.Sniper:
                return new SniperBehavior();
            default:
                return new BasicChaserBehavior();
        }
    }

    public List<Enemy> GetEnemies() => enemies;
}

