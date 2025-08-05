using System.Collections.Generic;
using UnityEngine;

[System.Serializable]
public class PlayerStats
{
    public int level = 1;
    public int health = 100;
    public float speed = 150f;
    public int maxHealth = 100;
}

[System.Serializable]
public class ProjectileStats
{
    public int level = 0;
    public int damage = 15;
    public float speed = 8f;
}

[System.Serializable]
public class OrbitalStats
{
    public int level = 0;
    public int count = 0;
    public int damage = 10;
}

[System.Serializable]
public class ShieldStats
{
    public int level = 0;
    public int damage = 0;
}

[System.Serializable]
public class WeaponStats
{
    public ProjectileStats projectile = new ProjectileStats();
    public OrbitalStats orbital = new OrbitalStats();
    public ShieldStats shield = new ShieldStats();
}

[System.Serializable]
public class DifficultyStats
{
    public int level = 0;
    public float enemyHealthMultiplier = 1f;
    public float enemySpeedMultiplier = 1f;
    public float enemyDamageMultiplier = 1f;
}

[System.Serializable]
public class GameStats
{
    public int enemiesKilled = 0;
    public int experienceGained = 0;
    public int damageDealt = 0;
}

[System.Serializable]
public class GameState
{
    public PlayerStats player = new PlayerStats();
    public WeaponStats weapons = new WeaponStats();
    public DifficultyStats difficulty = new DifficultyStats();
    public GameStats stats = new GameStats();
    public List<string> ownedArtifacts = new List<string>();
    public float time = 0f;
    public bool isPlaying = false;
}

