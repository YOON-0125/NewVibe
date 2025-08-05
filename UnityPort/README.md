# Unity Port Scripts

This directory contains C# scripts that map the gameplay features of the original web-based Vampire Survivor style game into Unity components.

## Contents
- `GameManager.cs`: coordinates the overall game loop, collision handling and victory/game over conditions.
- `Input/InputManager.cs`: translates touch and mouse input into player movement and double tap pause.
- `Player/PlayerController.cs`: handles movement, health and invulnerability.
- `Enemies/Enemy.cs`: base enemy class with behaviour interface and update context.
- `Enemies/EnemyBehaviors.cs`: concrete behaviours for `BasicChaser`, `Giant` and `Sniper` enemies.
- `Managers/EnemyManager.cs`: spawns enemies over time and updates them each frame.
- `Managers/WeaponManager.cs`: fires and updates projectiles, manages orbital weapons and shields.
- `Weapons/Projectile.cs`: simple projectile movement and data.
- `Systems/GameState.cs`: serialisable game state structure for player, weapons and statistics.
- `Systems/ArtifactSystem.cs`: applies artefact effects to the `GameState`.

These scripts are intended as a starting point for creating a full Unity implementation of the project described in `CLAUDE.md`.
