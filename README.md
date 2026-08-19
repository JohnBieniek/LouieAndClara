# Louie And Clara

This project has been migrated from Unity 4/UnityScript to Unity 6/C# while preserving the original scene, prefabs, assets, physics settings, and serialized gameplay tuning.

## Build for itch.io

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\build-webgl.ps1
```

Upload `build/DiseaseDestroyer-WebGL-itch.zip` to itch.io. Set the project kind to **HTML**, enable **This file will be played in the browser**, and use a 960 × 600 viewport.

Controls: keyboard movement uses the original Unity input mappings, mouse aims/fires, Space performs the push attack, and P pauses.
