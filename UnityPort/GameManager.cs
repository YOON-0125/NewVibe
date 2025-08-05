using UnityEngine;
using System.Collections.Generic;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    public PlayerController player;
    public EnemyManager enemyManager;
    public WeaponManager weaponManager;
    public InputManager inputManager;

    public GameState state = new GameState();

    void Awake()
    {
        Instance = this;
    }

    void Start()
    {
        ArtifactSystem.ApplyArtifacts(state);
        state.isPlaying = true;
        inputManager.OnDoubleTap += TogglePause;
    }

    void Update()
    {
        if (!state.isPlaying) return;

        float dt = Time.deltaTime;
        state.time += dt;

        weaponManager.UpdateWeapons(dt);
        enemyManager.gameTime = state.time;

        CheckCollisions();

        if (state.time >= 900f)
        {
            Victory();
        }
    }

    void TogglePause()
    {
        state.isPlaying = !state.isPlaying;
    }

    void CheckCollisions()
    {
        List<Enemy> enemies = enemyManager.GetEnemies();
        foreach (var proj in new List<Projectile>(weaponManager.projectiles))
        {
            foreach (var enemy in enemies)
            {
                if (enemy == null) continue;
                float dist = Vector3.Distance(proj.transform.position, enemy.transform.position);
                if (dist < enemy.radius)
                {
                    enemy.TakeDamage(proj.damage);
                    weaponManager.RemoveProjectile(proj);
                    state.stats.damageDealt += proj.damage;
                    if (enemy.health <= 0)
                    {
                        state.stats.enemiesKilled++;
                    }
                    break;
                }
            }
        }
    }

    public void Victory()
    {
        state.isPlaying = false;
        // TODO: show victory UI and artifact selection
    }

    public void GameOver()
    {
        state.isPlaying = false;
        // TODO: show game over UI
    }
}

