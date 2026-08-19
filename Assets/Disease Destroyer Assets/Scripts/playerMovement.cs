using System.Collections;
using UnityEngine;

[RequireComponent(typeof(Rigidbody))]
public class playerMovement : MonoBehaviour
{
    public float speedSlowFactor=1, accelSlowFactor, slowDuration=3, slowTime;
    public bool slow;
    public float speed, bulletSpeed, burstLength, burstAngle, burstVel, burstDuration;
    public Rigidbody bullet, curBullet;
    public Transform clone;
    public AudioClip shoot, push;
    float burstTime, startTime;
    Rigidbody body; Collider playerCollider;
    void Awake() { body=GetComponent<Rigidbody>();playerCollider=GetComponentInChildren<Collider>(); }
    void Start() => startTime = Time.time;
    public void restart() { body.position=Vector3.zero; body.linearVelocity=Vector3.zero; startTime=Time.time; }
    void Update()
    {
        if (Time.timeScale != 0 && Input.GetButtonDown("Fire1"))
        {
            if (!curBullet) { HUDHandler.PlaySfx(shoot); var spawn=GameObject.Find("BulletSpawn").transform; curBullet=Instantiate(bullet,spawn.position,Quaternion.identity); curBullet.linearVelocity=(spawn.position-transform.position).normalized*bulletSpeed; }
            else curBullet.GetComponent<bulletControl>().kill();
        }
        if (Time.timeScale != 0 && (Input.GetButtonDown("Fire2") || Input.GetKeyDown(KeyCode.Space)) && burstTime <= 0) { HUDHandler.PlaySfx(push); burstTime=burstDuration; var light=GameObject.Find("PushLight"); if(light) light.GetComponent<pushLightScript>()?.push(); StartCoroutine(BurstAttack()); }
        else burstTime -= Time.deltaTime;
    }
    void FixedUpdate()
    {
        if (Time.time > startTime+1) { FacePointer(); if(body.linearVelocity.magnitude<350){body.linearVelocity += new Vector3(Input.GetAxis("Horizontal")*(speed-accelSlowFactor),Input.GetAxis("Vertical")*(speed-accelSlowFactor),0);} }
        else {body.position=Vector3.zero;body.linearVelocity=Vector3.zero;}
        var p=body.position; if(p.x>490){p.x=490;body.linearVelocity=new Vector3(-Mathf.Abs(body.linearVelocity.x*.5f),body.linearVelocity.y,0);} if(p.x<-490){p.x=-490;body.linearVelocity=new Vector3(Mathf.Abs(body.linearVelocity.x*.5f),body.linearVelocity.y,0);} if(p.y>490){p.y=490;body.linearVelocity=new Vector3(body.linearVelocity.x,-Mathf.Abs(body.linearVelocity.y*.5f),0);} if(p.y<-490){p.y=-490;body.linearVelocity=new Vector3(body.linearVelocity.x,Mathf.Abs(body.linearVelocity.y*.5f),0);} body.position=p;
        body.linearVelocity*=body.linearVelocity.magnitude>=450?.95f*speedSlowFactor:.99f*speedSlowFactor; SeparateFromCells(); EndSlow();
    }
    void SeparateFromCells()
    {
        if(!playerCollider)return;
        var bounds=playerCollider.bounds;
        foreach(var other in Physics.OverlapBox(bounds.center,bounds.extents,Quaternion.identity,~0,QueryTriggerInteraction.Ignore))
        {
            if(other.attachedRigidbody==body)continue;
            if(!other.GetComponentInParent<cellMovement>()&&!other.GetComponentInParent<whiteCellMovement>())continue;
            if(Physics.ComputePenetration(playerCollider,playerCollider.transform.position,playerCollider.transform.rotation,other,other.transform.position,other.transform.rotation,out var direction,out var distance))
            {
                var correction=direction*(distance+.1f);
                if(Time.time<=startTime+1&&other.attachedRigidbody)other.attachedRigidbody.position-=correction;
                else body.position+=correction;
            }
        }
        var position=body.position;position.z=0;body.position=position;
    }
    public void addVel(Vector3 v)=>body.linearVelocity=new Vector3(v.x,v.y,0);
    public void startSlow(){if(!slow){slow=true;slowTime=Time.time;speedSlowFactor=1;accelSlowFactor=3;}}
    void EndSlow(){if(slow&&Time.time>slowTime+slowDuration){slow=false;slowTime=0;speedSlowFactor=1;accelSlowFactor=0;}}
    IEnumerator BurstAttack(){yield return new WaitForSeconds(burstDuration/2);foreach(var hit in Physics.OverlapSphere(transform.position,burstLength)){if(hit.attachedRigidbody&&Vector3.Angle(hit.attachedRigidbody.position-transform.position,transform.forward)<=burstAngle)hit.attachedRigidbody.linearVelocity+=(hit.attachedRigidbody.position-transform.position).normalized*burstVel;}}
    void FacePointer(){var cam=Camera.main;if(!cam)return;var ray=cam.ScreenPointToRay(Input.mousePosition);var plane=new Plane(Vector3.forward,transform.position);if(plane.Raycast(ray,out var d))transform.rotation=Quaternion.LookRotation(ray.GetPoint(d)-transform.position);}
}
