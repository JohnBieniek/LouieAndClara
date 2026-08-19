using UnityEngine;

public class cameraScript : MonoBehaviour
{
    public float shakeTime, decrease = 1f, shakeStrength = .02f, currShakeTime;
    Quaternion originalRotation;
    void Start() => originalRotation = transform.rotation;
    void LateUpdate()
    {
        var target = GameObject.Find("Character");
        if (target) transform.position = new Vector3(target.transform.position.x, target.transform.position.y, transform.position.z);
        if (currShakeTime < shakeTime) { currShakeTime += decrease * Time.deltaTime; transform.rotation = originalRotation * Quaternion.Euler(0, 0, Mathf.Sin(currShakeTime) * shakeStrength * Mathf.Rad2Deg); }
        else transform.rotation = originalRotation;
    }
}
