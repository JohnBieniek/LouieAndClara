using UnityEngine;

[RequireComponent(typeof(Rigidbody),typeof(Renderer))]
public class cellMovement : MonoBehaviour
{
    public AudioClip splat; public bool oneShotAudio; public Texture2D tex1,tex2,tex3,tex4; public Rigidbody virus; public Transform virusClone; public ParticleSystem emitter;
    int health=3; float startTime; Rigidbody body; Renderer visual;
    void Awake(){body=GetComponent<Rigidbody>();visual=GetComponent<Renderer>();emitter=GetComponentInChildren<ParticleSystem>();}
    void Start(){startTime=Time.time;if(emitter)emitter.Stop();}
    void FixedUpdate(){if(Time.timeScale>0)Bounce();}
    void OnCollisionEnter(Collision c){if(c.gameObject.name.Contains("Virus")&&Time.time>startTime+2)kill(false);}
    void OnCollisionStay(Collision c){if(!c.gameObject.CompareTag("Respawn")||!c.rigidbody)return;var delta=body.position-c.rigidbody.position;delta.z=0;var distance=delta.magnitude;if(distance>=40f)return;var direction=distance>.001f?delta/distance:Vector3.right;var correction=direction*((40f-distance)*.5f);body.position+=correction;c.rigidbody.position-=correction;}
    void Bounce(){var p=body.position;var v=body.linearVelocity;if(p.x>480){p.x=480;v.x=-Mathf.Abs(v.x);}if(p.x<-480){p.x=-480;v.x=Mathf.Abs(v.x);}if(p.y>480){p.y=480;v.y=-Mathf.Abs(v.y);}if(p.y<-480){p.y=-480;v.y=Mathf.Abs(v.y);}body.position=p;body.linearVelocity=v;}
    public void corrupt(){if(visual&&tex4)visual.material.mainTexture=tex4;Emit(3);HUDHandler.Explode(transform.position,new Color(.85f,.2f,.05f),1.1f);HUDHandler.PlaySfx(splat);SpawnVirus();Destroy(gameObject);}
    public void kill(bool spawn){health--;if(visual){if(health==2&&tex2)visual.material.mainTexture=tex2;if(health==1&&tex3)visual.material.mainTexture=tex3;}if(health<=0){Emit(3);HUDHandler.Explode(transform.position,new Color(1f,.25f,.05f),1.1f);HUDHandler.PlaySfx(splat);if(spawn)SpawnVirus();Destroy(gameObject);}startTime=Time.time;}
    void SpawnVirus(){if(virus)Instantiate(virus,new Vector3(body.position.x,body.position.y,0),virus.rotation);}
    void Emit(float life){if(!emitter)return;emitter.transform.SetParent(null);emitter.Play();Destroy(emitter.gameObject,life);}
}
