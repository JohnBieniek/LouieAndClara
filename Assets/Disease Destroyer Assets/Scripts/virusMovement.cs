using UnityEngine;

[RequireComponent(typeof(Rigidbody))]
public class virusMovement : MonoBehaviour
{
    public float speed=55,maxSpeed=65,curDistance; public AudioClip splat; public bool attached; public Rigidbody food; public Vector3 foodOffset; public ParticleSystem emitter;
    float tChange,xDir,yDir,startTime; Rigidbody body; Collider virusCollider;
    void Awake(){body=GetComponent<Rigidbody>();virusCollider=GetComponent<Collider>();emitter=GetComponentInChildren<ParticleSystem>();}
    void Start(){startTime=Time.time;if(emitter)emitter.Stop();}
    void Update(){if(Time.timeScale<=0)return;if(food&&attached){body.linearVelocity=food.linearVelocity;body.position=food.position+foodOffset;}if(Time.time>=tChange){attached=false;Decide();body.linearVelocity+=new Vector3(xDir*speed,yDir*speed,0);}if(body.linearVelocity.magnitude>maxSpeed)body.linearVelocity*=.8f;Bounce();var p=transform.position;p.z=0;transform.position=p;}
    void Decide(){var player=GameObject.FindGameObjectWithTag("Player");if(player&&(player.transform.position-transform.position).sqrMagnitude<500)Aim(player.transform.position,1,2);else{var cells=GameObject.FindGameObjectsWithTag("Respawn");if(cells.Length==0){if(player)Aim(player.transform.position,1,2);return;}if(Random.Range(0,8)<1){xDir=Random.Range(-2f,2f);yDir=Random.Range(-2f,2f);tChange=Time.time+Random.Range(3f,5f);}else{GameObject nearest=null;float best=float.MaxValue;foreach(var c in cells){var d=(c.transform.position-transform.position).sqrMagnitude;if(d<best){best=d;nearest=c;}}Aim(nearest.transform.position,2,4);}}}
    void Aim(Vector3 p,float min,float max){xDir=p.x<transform.position.x?Random.Range(-2f,0):Random.Range(0,2f);yDir=p.y<transform.position.y?Random.Range(-2f,0):Random.Range(0,2f);tChange=Time.time+Random.Range(min,max);}
    void Bounce(){var p=body.position;var v=body.linearVelocity;if(p.x>491){p.x=491;v.x=-Mathf.Abs(v.x);}if(p.x<-491){p.x=-491;v.x=Mathf.Abs(v.x);}if(p.y>491){p.y=491;v.y=-Mathf.Abs(v.y);}if(p.y<-491){p.y=-491;v.y=Mathf.Abs(v.y);}body.position=p;body.linearVelocity=v;}
    void FixedUpdate()
    {
        if(!virusCollider)return;
        var bounds=virusCollider.bounds;
        foreach(var other in Physics.OverlapBox(bounds.center,bounds.extents,Quaternion.identity,~0,QueryTriggerInteraction.Ignore))
        {
            if(other.attachedRigidbody==body)continue;
            var isPlayer=other.GetComponentInParent<playerMovement>();
            var isCell=other.GetComponentInParent<cellMovement>()||other.GetComponentInParent<whiteCellMovement>();
            if(!isPlayer&&!isCell)continue;
            if(Physics.ComputePenetration(virusCollider,virusCollider.transform.position,virusCollider.transform.rotation,other,other.transform.position,other.transform.rotation,out var direction,out var distance))
                body.position+=direction*(distance+.1f);
        }
        var position=body.position;position.z=0;body.position=position;
        if(attached&&food)foodOffset=body.position-food.position;
    }
    void OnCollisionEnter(Collision c){if(c.gameObject.name.Contains("bullet"))kill();if(c.gameObject.name=="Character")c.gameObject.GetComponent<playerMovement>()?.startSlow();if(c.gameObject.CompareTag("Respawn")&&Time.time>startTime+2){attached=true;food=c.rigidbody;foodOffset=body.position-food.position;body.linearVelocity=food.linearVelocity;tChange=Time.time+2;}}
    public void kill(){HUDHandler.PlaySfx(splat);HUDHandler.Explode(transform.position,new Color(.25f,1f,.05f),.8f);if(emitter){emitter.transform.SetParent(null);emitter.Play();Destroy(emitter.gameObject,2);}Destroy(gameObject);}
}
