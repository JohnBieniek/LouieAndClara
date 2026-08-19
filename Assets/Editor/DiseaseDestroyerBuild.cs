using System.IO;
using System;
using System.Linq;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;

public static class DiseaseDestroyerBuild
{
    const string ScenePath = "Assets/DiseaseDestroyer.unity";

    public static void PrepareProject()
    {
        EditorSettings.serializationMode = SerializationMode.ForceText;
        var prefabs = AssetDatabase.FindAssets("t:Prefab").Select(AssetDatabase.GUIDToAssetPath).ToList();
        AssetDatabase.ForceReserializeAssets(prefabs, ForceReserializeAssetsOptions.ReserializeAssets);
        foreach (var path in prefabs.Where(path => path.StartsWith("Assets/Disease Destroyer Assets/Prefabs/")))
        {
            var root = PrefabUtility.LoadPrefabContents(path);
            PrefabUtility.SaveAsPrefabAsset(root, path);
            PrefabUtility.UnloadPrefabContents(root);
        }
        var scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
        var hud = UnityEngine.Object.FindFirstObjectByType<HUDHandler>();
        const string explosionMaterialPath = "Assets/Disease Destroyer Assets/Materials/ExplosionParticle.mat";
        var explosionMaterial = AssetDatabase.LoadAssetAtPath<Material>(explosionMaterialPath);
        if (!explosionMaterial)
        {
            var explosionShader = AssetDatabase.LoadAssetAtPath<Shader>("Assets/Disease Destroyer Assets/Materials/ExplosionParticle.shader");
            if (explosionShader) { explosionMaterial = new Material(explosionShader); AssetDatabase.CreateAsset(explosionMaterial, explosionMaterialPath); }
        }
        if (hud && explosionMaterial) hud.explosionMaterial = explosionMaterial;
        var cleanIntro = AssetDatabase.LoadAssetAtPath<Texture>("Assets/Disease Destroyer Assets/Materials/introcard1-clean.png");
        if (hud && cleanIntro) hud.intro1 = cleanIntro;
        var cleanSplash = AssetDatabase.LoadAssetAtPath<Texture>("Assets/Disease Destroyer Assets/Materials/splashScreen-clean.png");
        if (hud && cleanSplash) hud.splashScreen = cleanSplash;
        var controls = AssetDatabase.LoadAssetAtPath<Texture>("Assets/Disease Destroyer Assets/Materials/controls-clean.png");
        if (hud && controls) hud.controlsScreen = controls;
        var cleanWin = AssetDatabase.LoadAssetAtPath<Texture>("Assets/Disease Destroyer Assets/Materials/winScreen-clean.png");
        if (hud && cleanWin) hud.winScreen = cleanWin;
        var cleanLose = AssetDatabase.LoadAssetAtPath<Texture>("Assets/Disease Destroyer Assets/Materials/loseScreen-clean.png");
        if (hud && cleanLose) hud.loseScreen = cleanLose;
        var background = GameObject.Find("Background");
        if (background) background.layer = 8;
        var miniMap = GameObject.Find("MiniMap")?.GetComponent<Camera>();
        if (miniMap)
        {
            miniMap.rect = new Rect(.8f, .7f, .16f, .28f);
            miniMap.cullingMask &= ~(1 << 8);
            miniMap.clearFlags = CameraClearFlags.SolidColor;
            miniMap.backgroundColor = new Color(.06f, .06f, .07f, 1f);
        }
        var obsoleteMapBorder = GameObject.Find("MapBorder");
        if (obsoleteMapBorder) obsoleteMapBorder.SetActive(false);
        var missing = 0;
        foreach (var root in scene.GetRootGameObjects())
            foreach (var transform in root.GetComponentsInChildren<Transform>(true))
            {
                var count = GameObjectUtility.GetMonoBehavioursWithMissingScriptCount(transform.gameObject);
                if (count > 0) Debug.LogWarning($"Missing scripts on scene object: {GetPath(transform)} ({count})");
                missing += count;
            }

        Debug.Log($"Disease Destroyer scene loaded. Missing script components: {missing}");
        EditorSceneManager.SaveScene(scene);
        EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
        PlayerSettings.productName = "Disease Destroyer";
        PlayerSettings.companyName = "Bean";
        PlayerSettings.defaultScreenWidth = 960;
        PlayerSettings.defaultScreenHeight = 540;
        PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Disabled;
        PlayerSettings.WebGL.decompressionFallback = true;
        AssetDatabase.SaveAssets();
    }

    static string GetPath(Transform transform)
    {
        var path = transform.name;
        while (transform.parent) { transform = transform.parent; path = transform.name + "/" + path; }
        return path;
    }

    public static void BuildWebGL()
    {
        PrepareProject();
        var output = Path.GetFullPath("build/WebGL");
        Directory.CreateDirectory(output);
        var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
        {
            scenes = new[] { ScenePath },
            locationPathName = output,
            target = BuildTarget.WebGL,
            options = BuildOptions.None
        });
        if (report.summary.result != BuildResult.Succeeded)
            throw new InvalidOperationException($"WebGL build failed: {report.summary.result}, {report.summary.totalErrors} errors");
        MakeResponsive(output);
        Debug.Log($"Disease Destroyer WebGL build completed: {output}");
    }

    static void MakeResponsive(string output)
    {
        var indexPath = Path.Combine(output, "index.html");
        var index = File.ReadAllText(indexPath)
            .Replace("width=960 height=600", "width=960 height=540")
            .Replace("canvas.style.width = \"960px\";", "canvas.style.width = \"100%\";")
            .Replace("canvas.style.height = \"600px\";", "canvas.style.height = \"100%\";");
        File.WriteAllText(indexPath, index);

        var cssPath = Path.Combine(output, "TemplateData", "style.css");
        var css = File.ReadAllText(cssPath);
        css += "\nhtml, body { width: 100%; height: 100%; overflow: hidden; background: #000; }\n" +
               "#unity-container.unity-desktop { inset: 0; width: 100%; height: 100%; transform: none; }\n" +
               "#unity-canvas { display: block; width: 100% !important; height: 100% !important; }\n" +
               "#unity-footer { display: none; }\n";
        File.WriteAllText(cssPath, css);
    }
}
