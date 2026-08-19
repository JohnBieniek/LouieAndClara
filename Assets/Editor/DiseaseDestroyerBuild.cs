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
        PlayerSettings.defaultScreenHeight = 600;
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
        Debug.Log($"Disease Destroyer WebGL build completed: {output}");
    }
}
