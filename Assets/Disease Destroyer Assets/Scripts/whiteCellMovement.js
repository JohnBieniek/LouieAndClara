var splat : AudioSource;//death sound
var oneShotAudio=false;//singleton for death sound
private var maxX = 480;//bounding box
private var minX = -480;
private var maxY = 480;
private var minY = -480;
var speed  = 85;//movement multiplier
private var health=3;
private var emitter: ParticleEmitter;
public var tex1: Texture2D;
public var tex2: Texture2D;
public var tex3: Texture2D;

private var tChange: float = 0; // force new direction in the first Update
private var startTime;
// Use this for initialization

function Start () {
	emitter = GetComponentInChildren(ParticleEmitter);   
    if (emitter) {
        emitter.emit = false;
    }
    this.startTime=Time.time;
}


function FixedUpdate () {
	if((Time.time>(this.startTime+1))){//only move if the game isn't over
    	if(Time.time>tChange){
    		attack();
    		print("attacking");
    		tChange=Time.time+5;//wait the 2 seconds for the cell to decay before choosing a new descision
    	}
    }
    else{
    	rigidbody.position=Vector3.zero;
		rigidbody.velocity=Vector3.zero;
    }
    if(rigidbody.transform.position.x>maxX){//if the virus leaves the bounding box bring it back in and send it toward the center
    	rigidbody.transform.position.x=maxX;
    	rigidbody.velocity.x=-Mathf.Abs(rigidbody.velocity.x*.5);
    }
    if(rigidbody.transform.position.x<minX){
    	rigidbody.transform.position.x=minX;
    	rigidbody.velocity.x=Mathf.Abs(rigidbody.velocity.x*.5);
    }
    if(rigidbody.transform.position.y>maxY){
    	rigidbody.transform.position.y=maxY;
    	rigidbody.velocity.y=-Mathf.Abs(rigidbody.velocity.y*.5);
    }
    if(rigidbody.transform.position.y<minY){
    	rigidbody.transform.position.y=minY;
    	rigidbody.velocity.y=Mathf.Abs(rigidbody.velocity.y*.5);
    }

		rigidbody.velocity=rigidbody.velocity*1.01;
	
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
	if(collision.gameObject.name=="Character"){
    	GameObject.FindGameObjectWithTag("Player").GetComponent(playerMovement).startSlow();
    }
   

    if(collision.gameObject.name.Contains("bullet")){
    	health=health-1;
		if(health==2){renderer.material.mainTexture = tex2;}
		if(health==1){renderer.material.mainTexture= tex3;}
		if(health==0){
    		if(!oneShotAudio){
				splat.Play();
				oneShotAudio=true;
			}
    		Destroy (gameObject);
			Destroy (this);
			Destroy (rigidbody);
		}
    }
}
function attack(){
	var player=GameObject.FindGameObjectWithTag("Player");
	var position = transform.position; //find which direction the player is
	if(player!=null){//head randomly in the players general direction
    	if(player.transform.position.y<position.y){
    		yDir=Random.Range(-2.0,-1.0);
    	}
    	else if(player.transform.position.y>position.y){
    		yDir=Random.Range(1.0,2.0);
    	}
    	if(player.transform.position.x<position.x){
    		xDir=Random.Range(-2.0,-1.0);
    		
    	}
   		else if(player.transform.position.x>position.x){
    		xDir=Random.Range(1.0,2.0);
   	 	}
   	 	rigidbody.velocity=rigidbody.velocity+Vector3(xDir*speed,yDir*speed,0);
    }
}
function kill(){
	health=health-1;
		if(health==2){renderer.material.mainTexture = tex2;}
		if(health==1){renderer.material.mainTexture= tex3;}
		if(health==0){
			if(emitter!=null){
				emitter.emit=true;
				emitter.transform.parent=null; // detach particle system
				Destroy(emitter.gameObject, 3);
			}
			if(!oneShotAudio){//play death sound and destroy
				splat.Play();
				oneShotAudio=true;
			}
    		Destroy (gameObject);
			Destroy (this);
			Destroy (rigidbody);
		}
}