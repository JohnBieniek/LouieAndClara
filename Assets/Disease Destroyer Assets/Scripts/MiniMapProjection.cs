using UnityEngine;

[RequireComponent(typeof(Camera))]
public class MiniMapProjection : MonoBehaviour
{
    public float horizontalExtent = 520f;
    public float verticalExtent = 520f;
    Camera mapCamera;

    void Awake() { mapCamera = GetComponent<Camera>(); Apply(); }
    void OnEnable() { if (!mapCamera) mapCamera = GetComponent<Camera>(); Apply(); }
    void OnPreCull() { Apply(); }

    void Apply()
    {
        if (!mapCamera) return;
        mapCamera.projectionMatrix = Matrix4x4.Ortho(-horizontalExtent, horizontalExtent,
            -verticalExtent, verticalExtent, mapCamera.nearClipPlane, mapCamera.farClipPlane);
    }
}
