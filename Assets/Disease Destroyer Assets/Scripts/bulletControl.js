var pushRadius : float;
var deathRadius : float;
var boom  : AudioClip;//death sound
var oneShotAudio: boolean = false;
//var deathEmitter: ParticleEmitter;

public var emitter: ParticleEmitter;
public var pushEmitter: ParticleEmitter;
var power : float;
// Use this for initialization
function Start () {
emitter = GetComponentInChildren(ParticleEmitter);  
  
    if (emitter) {
        emitter.emit = false;
    }
    pushEmitter = GetComponentInChildren(ParticleEmitter);  
    if (pushEmitter) {
        pushEmitter.emit = false;
    }
	//var deathEmitter = GetComponentInChildren(ParticleEmitter); 
	//if (deathEmitter) {
    //    deathEmitter.emit = false;
    //}
  //  pushEmitter = GetComponentInChildren(ParticleEmitter); 
  //  if (pushEmitter) {
  //      pushEmitter.emit = false;
  //  }
}

// Update is called once per frame
function Update () {

}

function OnCollisionStay(hit : Collision) {

}
function OnCollisionEnter(collision : Collision) {
	kill();
			

}
function kill(){
	//Causes camera to shake
	
	AudioSource.PlayClipAtPoint(boom, transform.position);

	GameObject.Find("Main Camera").GetComponent("cameraScript").shakeTime = (5.0 / Vector3.Distance(gameObject.rigidbody.position, GameObject.Find("Character").rigidbody.position));
	GameObject.Find("Main Camera").GetComponent("cameraScript").currShakeTime = 0.0;
	var explosionPos : Vector3 = gameObject.rigidbody.position;
    		var colliders = GameObject.FindGameObjectsWithTag("Finish");
    		for (var hit : GameObject in colliders) {
            	var diff = (explosionPos - hit.rigidbody.position);      	
            	var curDistance = Mathf.Sqrt(( Mathf.Abs(diff.x)*Mathf.Abs(diff.x))+(Mathf.Abs(diff.y)*Mathf.Abs(diff.y))); 
        		if (curDistance<=deathRadius+10){
        		//print(diff.y);
        		//print("virus:"+curDistance + " radius " + pushRadius);
        			hit.GetComponent(virusMovement).kill();
    			}
    		}
    		colliders = GameObject.FindGameObjectsWithTag("Respawn");
    		for (var hit : GameObject in colliders) 
    		{
    		
            	diff = (explosionPos - hit.rigidbody.position);    	
            	curDistance = Mathf.Sqrt(( Mathf.Abs(diff.x)*Mathf.Abs(diff.x))+(Mathf.Abs(diff.y)*Mathf.Abs(diff.y))); 
            	//print("cell:"+curDistance + " radius " + deathRadius);
            	
        		if (curDistance<=pushRadius+20){
        			//print("cell:"+curDistance + " radius " + pushRadius);
        			if (curDistance<=deathRadius+20){

        				if(hit.GetComponent(cellMovement)!=null){
        					hit.GetComponent(cellMovement).kill(true);
        				}
        				else{
        					hit.GetComponent(whiteCellMovement).kill();
        				}
    				}
           			hit.rigidbody.velocity=hit.rigidbody.velocity+(diff.normalized)*-600;//.x=100;//AddExplosionForce(power, explosionPos, radius, 2.0);
    			}
    		}
    		diff = (explosionPos - GameObject.FindGameObjectWithTag("Player").rigidbody.position);    	
            curDistance = Mathf.Sqrt(( Mathf.Abs(diff.x)*Mathf.Abs(diff.x))+(Mathf.Abs(diff.y)*Mathf.Abs(diff.y))); 
    		if(curDistance<=pushRadius+10){
    			var power=65+(55*((pushRadius+10)/diff.magnitude));
    			GameObject.FindGameObjectWithTag("Player").GetComponent(playerMovement).addVel(diff.normalized*-(power));//.rigidbody.position = diff*-2000;
    		}
    //Destroys object in question if not the player or a wall
    emitter = GetComponentInChildren(ParticleEmitter);  
 	emitter.emit=true;
	emitter.transform.parent=null; // detach particle system
	Destroy(emitter.gameObject, 2);
	pushEmitter = GetComponentInChildren(ParticleEmitter);  
    if(pushEmitter!=null){
    	pushEmitter.emit=true;
    	pushEmitter.transform.parent=null; // detach particle system
    	Destroy(pushEmitter.gameObject, 2);
    }
		

    
    //Destroys object
    Destroy (gameObject);
}