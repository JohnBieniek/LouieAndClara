# Disease Destroyer

The original Unity 4 project is preserved in `Assets/` and `ProjectSettings/`. Because its UnityScript/Web Player runtime is no longer supported by browsers, `web/` is a browser-native edition of the original game for itch.io.

## Build the itch.io upload

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\build-itch.ps1
```

Upload `build/DiseaseDestroyer-itch.zip` to a new itch.io project. Set **Kind of project** to **HTML**, check **This file will be played in the browser**, and choose a viewport of **960 × 600** (fullscreen is also supported).

Controls: WASD or arrow keys move, mouse aims, left click fires/detonates, Space or right click pushes, and P pauses.
