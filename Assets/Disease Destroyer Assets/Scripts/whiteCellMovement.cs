using UnityEngine;

[RequireComponent(typeof(Rigidbody),typeof(Renderer))]
public class whiteCellMovement : MonoBehaviour
{
    public AudioSource splat; public bool oneShotAudio; public float speed=85; public Texture2D tex1,tex2,tex3; public ParticleSystem emitter;
    int health=3;float tChange,startTime;Rigidbody body;Renderer visual;
    void Awake(){body=GetComponent<Rigidbody>();visual=GetComponent<Renderer>();emitter=GetComponentInChildren<ParticleSystem>();}
    void Start(){startTime=Time.time;if(emitter)emitter.Stop();}
    void FixedUpdate(){if(Time.time>startTime+1&&Time.time>tChange){Attack();tChange=Time.time+5;}else if(Time.time<=startTime+1){body.position=Vector3.zero;body.linearVelocity=Vector3.zero;}body.linearVelocity*=1.01f;Bounce();}
    void Attack(){var p=GameObject.FindGameObjectWithTag("Player");if(!p)return;body.linearVelocity+=new Vector3(p.transform.position.x<transform.position.x?Random.Range(-2f,-1f)*speed:Random.Range(1f,2f)*speed,p.transform.position.y<transform.position.y?Random.Range(-2f,-1f)*speed:Random.Range(1f,2f)*speed,0);}
    void OnCollisionEnter(Collision c){if(c.gameObject.name=="Character")c.gameObject.GetComponent<playerMovement>()?.startSlow();if(c.gameObject.name.Contains("bullet"))kill();}
    public void kill(){health--;if(visual){if(health==2&&tex2)visual.material.mainTexture=tex2;if(health==1&&tex3)visual.material.mainTexture=tex3;}if(health<=0){if(emitter){emitter.transform.SetParent(null);emitter.Play();Destroy(emitter.gameObject,3);}if(splat&&!oneShotAudio){splat.Play();oneShotAudio=true;}Destroy(gameObject);}}
    void Bounce(){var p=body.position;var v=body.linearVelocity;if(p.x>480){p.x=480;v.x=-Mathf.Abs(v.x*.5f);}if(p.x<-480){p.x=-480;v.x=Mathf.Abs(v.x*.5f);}if(p.y>480){p.y=480;v.y=-Mathf.Abs(v.y*.5f);}if(p.y<-480){p.y=-480;v.y=Mathf.Abs(v.y*.5f);}body.position=p;body.linearVelocity=v;}
}
