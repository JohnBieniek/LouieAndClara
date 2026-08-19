using UnityEngine;

public class pushLightScript : MonoBehaviour
{
    public float duration = .5f;
    float pushTime;
    Light source;
    void Awake() { source = GetComponent<Light>(); if (source) source.type = LightType.Spot; }
    void Update() { if (!source) return; if (pushTime > 0) { source.range = 300f * ((.5f - pushTime) * 2f); pushTime -= Time.deltaTime; } else source.range = 0; }
    public void push() => pushTime = duration;
}
