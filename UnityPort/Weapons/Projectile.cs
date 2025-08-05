using UnityEngine;

public class Projectile : MonoBehaviour
{
    public float speed = 6f;
    public int damage = 10;
    public bool isEnemyProjectile = false;
    private Vector3 direction;

    public void Initialize(Vector3 dir, float spd, int dmg, bool enemy)
    {
        direction = dir.normalized;
        speed = spd;
        damage = dmg;
        isEnemyProjectile = enemy;
    }

    public void Tick(float dt)
    {
        transform.position += direction * speed * dt;
    }
}

