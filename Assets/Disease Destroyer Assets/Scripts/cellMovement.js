var splat : AudioClip;//death sound
var oneShotAudio=false;//singleton for death sound
private var maxX = 480;//bounding box
private var minX = -480;
private var maxY = 480;
private var minY = -480;
private var health=3;
private var emitter: ParticleEmitter;
public var tex1: Texture2D;
public var tex2: Texture2D;
public var tex3: Texture2D;
public var tex4: Texture2D;
private var startTime;
var virus : Rigidbody;
// Use this for initialization
var virusClone: Transform;
function Start () {
	emitter = GetComponentInChildren(ParticleEmitter);   
    if (emitter) {
        emitter.emit = false;
    }
    this.startTime=Time.time;
}
 
// Update is called once per frame
function Update () {
	if(this.startTime==null){
		this.startTime=Time.time;
	}
	//if(rigidbody.velocity.magnitude>=50){
	//	rigidbody.velocity=rigidbody.velocity*.95;
	//}
	if(rigidbody.transform.position.x>maxX){//if the virus leaves the bounding box bring it back in and send it toward the center
    	rigidbody.transform.position.x=maxX;
    	rigidbody.velocity.x=-Mathf.Abs(rigidbody.velocity.x);
    }
    if(rigidbody.transform.position.x<minX){
    	rigidbody.transform.position.x=minX;
    	rigidbody.velocity.x=Mathf.Abs(rigidbody.velocity.x);
    }
    if(rigidbody.transform.position.y>maxY){
    	rigidbody.transform.position.y=maxY;
    	rigidbody.velocity.y=-Mathf.Abs(rigidbody.velocity.y);
    }
    if(rigidbody.transform.position.y<minY){
    	rigidbody.transform.position.y=minY;
    	rigidbody.velocity.y=Mathf.Abs(rigidbody.velocity.y);
    }
}

function OnCollisionEnter(collision : Collision) {
	//var tex = Resources.Load("cell3");
	
	if(collision.gameObject.name.Contains("Border")){//bounce off borders
		if(rigidbody.position.x>0&&Mathf.Abs(rigidbody.position.x)>450){
			rigidbody.velocity.x=-Mathf.Abs(rigidbody.velocity.x);
		}
		if(rigidbody.position.x<0&&Mathf.Abs(rigidbody.position.x)>450){
			rigidbody.velocity.x=Mathf.Abs(rigidbody.velocity.x);
		}
		if(rigidbody.position.y>0&&Mathf.Abs(rigidbody.position.y)>450){
			rigidbody.velocity.y=-Mathf.Abs(rigidbody.velocity.y);
		}
		if(rigidbody.position.y<0&&Mathf.Abs(rigidbody.position.y)>450){
			rigidbody.velocity.y=Mathf.Abs(rigidbody.velocity.y);
		}
    }
    if(this.startTime==null){
		this.startTime=Time.time;
	}/*
	if(collision.gameObject.name.Contains("Character")){
		renderer.material.mainTexture = tex3;
	}*/
	if(collision.gameObject.name.Contains("Virus")&&(Time.time>(this.startTime+2))){//destroy 2 seconds after a viruses touch
		kill(false);
    }
 
}
function corrupt(){
	renderer.material.mainTexture= tex4;
	if(emitter!=null){
		emitter.emit=true;
		emitter.transform.parent=null; // detach particle system
		Destroy(emitter.gameObject, 3);
	}
	if (splat) AudioSource.PlayClipAtPoint(splat, transform.position);
	spawnVirus();
	Destroy (gameObject);
	Destroy (this);
	Destroy (rigidbody);
}
function kill(spawn: boolean){
	health=health-1;
		if(health==2){renderer.material.mainTexture = tex2;}
		if(health==1){renderer.material.mainTexture= tex3;}
		if(health==0){
			
			if(emitter!=null){
				emitter.emit=true;
				emitter.transform.parent=null; // detach particle system
				Destroy(emitter.gameObject, 3);
			}
			//if(!oneShotAudio){//play death sound and destroy
			if (splat) AudioSource.PlayClipAtPoint(splat, transform.position);
				//oneShotAudio=true;
			//}
			if(spawn)spawnVirus();
			//virusClone=Instantiate(virus, Vector3(rigidbody.x,rigidbody.y,rigidbody.z));
    		Destroy (gameObject);
			Destroy (this);
			Destroy (rigidbody);
			
		}
		this.startTime=Time.time;
}
function spawnVirus(){
	var newx=rigidbody.position.x;
	var newy=rigidbody.position.y;
	var virusClone : Rigidbody = Instantiate(virus, Vector3(newx,newy,0), virusClone.rotation);
	virusClone.transform.parent=null;
}