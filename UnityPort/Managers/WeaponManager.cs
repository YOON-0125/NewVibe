using UnityEngine;
using System.Collections.Generic;

public class WeaponManager : MonoBehaviour
{
    public Projectile projectilePrefab;
    public List<Projectile> projectiles = new List<Projectile>();
    public Transform orbitalParent;
    public GameObject shieldPrefab;
    private List<GameObject> orbitalWeapons = new List<GameObject>();
    private GameObject shield;

    public void UpdateWeapons(float deltaTime)
    {
        foreach (var proj in projectiles)
        {
            proj.Tick(deltaTime);
        }
    }

    public void FirePlayerProjectile(Vector3 origin, Vector3 direction, float speed, int damage)
    {
        Projectile p = Instantiate(projectilePrefab, origin, Quaternion.identity);
        p.Initialize(direction, speed, damage, false);
        projectiles.Add(p);
    }

    public void FireEnemyProjectile(Vector3 origin, Vector3 direction)
    {
        Projectile p = Instantiate(projectilePrefab, origin, Quaternion.identity);
        p.Initialize(direction, 4f, 10, true);
        projectiles.Add(p);
    }

    public void AddOrbitalWeapon(GameObject weaponPrefab, int count)
    {
        for (int i = orbitalWeapons.Count; i < count; i++)
        {
            GameObject w = Instantiate(weaponPrefab, orbitalParent);
            orbitalWeapons.Add(w);
        }
    }

    public void UpgradeShield()
    {
        if (shield == null)
        {
            shield = Instantiate(shieldPrefab, orbitalParent);
        }
    }

    public void RemoveProjectile(Projectile p)
    {
        projectiles.Remove(p);
        Destroy(p.gameObject);
    }
}

