using System.Collections.Generic;

public enum ArtifactOp { Add, Multiply }

[System.Serializable]
public class ArtifactEffect
{
    public string statPath;
    public float value;
    public ArtifactOp op;
}

[System.Serializable]
public class Artifact
{
    public string id;
    public string name;
    public List<ArtifactEffect> effects = new List<ArtifactEffect>();

    public void Apply(GameState state)
    {
        foreach (var effect in effects)
        {
            ApplyEffect(state, effect);
        }
    }

    private void ApplyEffect(GameState state, ArtifactEffect effect)
    {
        switch (effect.statPath)
        {
            case "player.speed":
                if (effect.op == ArtifactOp.Add) state.player.speed += effect.value;
                else state.player.speed *= effect.value;
                break;
            case "player.maxHealth":
                if (effect.op == ArtifactOp.Add) state.player.maxHealth += (int)effect.value;
                else state.player.maxHealth = (int)(state.player.maxHealth * effect.value);
                break;
            case "weapons.projectile.damage":
                if (effect.op == ArtifactOp.Add) state.weapons.projectile.damage += (int)effect.value;
                else state.weapons.projectile.damage = (int)(state.weapons.projectile.damage * effect.value);
                break;
        }
    }
}

public static class ArtifactSystem
{
    public static Dictionary<string, Artifact> artifacts = new Dictionary<string, Artifact>
    {
        {
            "speed_boots",
            new Artifact
            {
                id = "speed_boots",
                name = "Speed Boots",
                effects = new List<ArtifactEffect>
                {
                    new ArtifactEffect { statPath = "player.speed", value = 20f, op = ArtifactOp.Add }
                }
            }
        },
        {
            "sharp_projectiles",
            new Artifact
            {
                id = "sharp_projectiles",
                name = "Sharp Projectiles",
                effects = new List<ArtifactEffect>
                {
                    new ArtifactEffect { statPath = "weapons.projectile.damage", value = 1.25f, op = ArtifactOp.Multiply }
                }
            }
        }
    };

    public static void ApplyArtifacts(GameState state)
    {
        foreach (var id in state.ownedArtifacts)
        {
            if (artifacts.TryGetValue(id, out var artifact))
            {
                artifact.Apply(state);
            }
        }
    }
}

