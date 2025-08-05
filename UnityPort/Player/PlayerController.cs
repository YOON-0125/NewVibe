using UnityEngine;

public class PlayerController : MonoBehaviour
{
    public float speed = 150f;            // movement speed in units per second
    public int maxHealth = 100;
    public float invulnerabilityDuration = 1f;

    private Vector3 targetPosition;
    private int currentHealth;
    private float invulnTimer = 0f;

    void Start()
    {
        targetPosition = transform.position;
        currentHealth = maxHealth;
    }

    void Update()
    {
        if (invulnTimer > 0f)
        {
            invulnTimer -= Time.deltaTime;
        }

        Vector3 delta = targetPosition - transform.position;
        float distance = delta.magnitude;
        if (distance > 0.1f)
        {
            float move = speed * Time.deltaTime;
            transform.position += delta.normalized * Mathf.Min(move, distance);
        }
    }

    public void MoveTo(Vector3 worldPosition)
    {
        targetPosition = worldPosition;
    }

    public bool TakeDamage(int damage)
    {
        if (invulnTimer > 0f) return false;
        currentHealth -= damage;
        invulnTimer = invulnerabilityDuration;
        // TODO: visual feedback for damage
        return currentHealth <= 0;
    }

    public void ResetPlayer(Vector3 startPosition)
    {
        transform.position = startPosition;
        targetPosition = startPosition;
        currentHealth = maxHealth;
        invulnTimer = 0f;
    }

    public Vector3 Position => transform.position;
    public int Health => currentHealth;
    public bool IsInvulnerable => invulnTimer > 0f;
}

