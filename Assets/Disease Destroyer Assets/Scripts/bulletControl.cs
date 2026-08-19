using UnityEngine;

[RequireComponent(typeof(Rigidbody))]
public class bulletControl : MonoBehaviour
{
    public float pushRadius,deathRadius,power; public AudioClip boom; public bool oneShotAudio; public ParticleSystem emitter,pushEmitter;
    Rigidbody body;
    void Awake(){body=GetComponent<Rigidbody>();var systems=GetComponentsInChildren<ParticleSystem>();if(systems.Length>0)emitter=systems[0];if(systems.Length>1)pushEmitter=systems[1];}
    void Start(){if(emitter)emitter.Stop();if(pushEmitter)pushEmitter.Stop();}
    void OnCollisionEnter(Collision collision)=>kill();
    public void kill(){if(!this||!gameObject)return;HUDHandler.PlaySfx(boom);HUDHandler.Explode(body.position,new Color(1f,.35f,.03f),1.6f);var camera=GameObject.Find("Main Camera");var player=GameObject.Find("Character");if(camera&&player){var shake=camera.GetComponent<cameraScript>();if(shake){shake.shakeTime=5f/Mathf.Max(.01f,Vector3.Distance(body.position,player.transform.position));shake.currShakeTime=0;}}
        var origin=body.position;foreach(var hit in GameObject.FindGameObjectsWithTag("Finish"))if(Vector2.Distance(origin,hit.transform.position)<=deathRadius+10)hit.GetComponent<virusMovement>()?.kill();
        foreach(var hit in GameObject.FindGameObjectsWithTag("Respawn")){var d=Vector2.Distance(origin,hit.transform.position);if(d<=pushRadius+20){if(d<=deathRadius+20){var cell=hit.GetComponent<cellMovement>();if(cell)cell.kill(true);else hit.GetComponent<whiteCellMovement>()?.kill();}var rb=hit.GetComponent<Rigidbody>();if(rb)rb.linearVelocity+=(rb.position-origin).normalized*600;}}
        var tagged=GameObject.FindGameObjectWithTag("Player");if(tagged){var diff=origin-tagged.transform.position;var d=diff.magnitude;if(d<=pushRadius+10)tagged.GetComponent<playerMovement>()?.addVel(-diff.normalized*(65+55*((pushRadius+10)/Mathf.Max(d,.01f))));}
        Emit(emitter);Emit(pushEmitter);Destroy(gameObject);}
    void Emit(ParticleSystem p){if(!p)return;p.transform.SetParent(null);p.Play();Destroy(p.gameObject,2);}
}
