using UnityEngine;
using System.Collections.Generic;

public class BasicChaserBehavior : IEnemyBehavior
{
    public void Update(Enemy enemy, EnemyUpdateContext context)
    {
        Vector3 dir = (context.playerPosition - enemy.transform.position).normalized;
        enemy.transform.position += dir * enemy.speed * context.deltaTime;
    }
}

public class GiantBehavior : IEnemyBehavior
{
    public int splitCount = 2;
    public void Update(Enemy enemy, EnemyUpdateContext context)
    {
        Vector3 dir = (context.playerPosition - enemy.transform.position).normalized;
        enemy.transform.position += dir * enemy.speed * context.deltaTime;
    }
}

public class SniperBehavior : IEnemyBehavior
{
    public float preferredDistance = 5f;
    public float fireInterval = 2f;
    private float fireTimer = 0f;

    public void Update(Enemy enemy, EnemyUpdateContext context)
    {
        Vector3 toPlayer = context.playerPosition - enemy.transform.position;
        float distance = toPlayer.magnitude;
        Vector3 dir = toPlayer.normalized;

        if (distance < preferredDistance * 0.8f)
        {
            enemy.transform.position -= dir * enemy.speed * context.deltaTime;
        }
        else if (distance > preferredDistance)
        {
            enemy.transform.position += dir * enemy.speed * context.deltaTime;
        }

        fireTimer += context.deltaTime;
        if (fireTimer >= fireInterval)
        {
            fireTimer = 0f;
            context.weaponManager.FireEnemyProjectile(enemy.transform.position, dir);
        }
    }
}

