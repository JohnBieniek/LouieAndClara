var speed  = 55;//movement multiplier
var maxSpeed=65;//can't get shunted too fast
var splat : AudioClip;//death sound
public var attached=false;
public var food;//the cell nearest
public var foodOffset: Vector3;//how far should the virus be when attaching to the cell
public var curDistance;
private var maxX = 491;//bounding box
private var minX = -491;
private var maxY = 491;
private var minY = -491;
private var wallX=false;
private var wallY=false;
private var tChange: float = 0; // force new direction in the first Update
var xDir: float;//plan on moving left or right
var yDir: float;//plan on moving up or down
public var emitter: ParticleEmitter;
private var startTime;

function attack(){
	var player=GameObject.FindGameObjectWithTag("Player");
	var position = transform.position; //find which direction the player is
	if(player!=null){//head randomly in the players general direction
    	if(player.transform.position.y<position.y){
    		yDir=Random.Range(-2.0,0.0);
    	}
    	else if(player.transform.position.y>position.y){
    		yDir=Random.Range(0.0,2.0);
    	}
    	if(player.transform.position.x<position.x){
    		xDir=Random.Range(-2.0,0.0);
    		
    	}
   		else if(player.transform.position.x>position.x){
    		xDir=Random.Range(0.0,2.0);
   	 	}
    }
    tChange = Time.time + Random.Range(1,2);//time until next decision
}

function consume(){
	var gos : GameObject[];
    gos = GameObject.FindGameObjectsWithTag("Respawn"); 
    var closest : GameObject; 
    var distance = Mathf.Infinity; 
    var position = transform.position; 
    
    // Iterate through them and find the closest one
    for (var go : GameObject in gos)  {
        var diff = (go.transform.position - position);
        var curDistance = diff.sqrMagnitude; 
        if (curDistance < distance) { 
            closest = go; 
            distance = curDistance; 
        } 
    }
    
    if(closest!=null){
    	if(closest.transform.position.y<position.y){
    		yDir=Random.Range(-2.0,0.0);
    	}
    	else if(closest.transform.position.y>position.y){
    		yDir=Random.Range(0.0,2.0);
    	}
    	if(closest.transform.position.x<position.x){
    		xDir=Random.Range(-2.0,0.0);
    	}
   		else if(closest.transform.position.x>position.x){
    		xDir=Random.Range(0.0,2.0);
   	 	}
    }
    tChange = Time.time + Random.Range(2,4);
}

function decide(){
	var player=GameObject.FindGameObjectWithTag("Player");
	var distance = Mathf.Infinity; 
    var position = transform.position; 
    var diff = (player.transform.position - position);
	var curDistance = diff.sqrMagnitude; 
	
	//if the player is nearby attack(or run) from it
	if(curDistance<500 || GameObject.FindGameObjectsWithTag("Respawn").Length<1 ){
		//print(curDistance);
		attack();//flee();
	}
	else{
		if(Random.Range(0,8)<1){//chance to move in a random direction
			random();
		}
		else{//generally head toward the nearest cell
			consume();
		}
	}	
}

function flee(){
	var player=GameObject.FindGameObjectWithTag("Player");
	var position = transform.position;//find direction of the player
	if(player!=null){//head away from the player
    	if(player.transform.position.y<position.y){
    		yDir=Random.Range(0.0,2.0);
    	}
    	else if(player.transform.position.y>position.y){
    		yDir=Random.Range(-2.0,0.0);
    	}
    	if(player.transform.position.x<position.x){
    		xDir=Random.Range(-2.0,0.0);
    	}
   		else if(player.transform.position.x>position.x){
    		xDir=Random.Range(0.0,2.0);
   	 	}
    }
    tChange = Time.time + Random.Range(1,2);//time until next decision
}

function kill(){
	if (splat) AudioSource.PlayClipAtPoint(splat, transform.position);
	emitter.emit=true;
	emitter.transform.parent=null; // detach particle system
	Destroy(emitter.gameObject, 2);
    Destroy (gameObject);
	Destroy (this);
	Destroy (rigidbody);
}
function OnCollisionEnter( collision : Collision )
{
	if(this.startTime==null){
		this.startTime=Time.time;
	}
	//bounce off of border
	if(collision.gameObject.name.Contains("Border")){
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
	if(collision.gameObject.name.Contains("bullet")){
		kill();
    }
    //what happens when you touch the player
    if(collision.gameObject.name=="Character"){
    	GameObject.FindGameObjectWithTag("Player").GetComponent(playerMovement).startSlow();
    }
    //if you hit a cell after the game has started
    if(collision.gameObject.tag=="Respawn"&&(Time.time>(this.startTime+2))){
    	attached=true;//sticking to the cell
    	var food=collision.gameObject;//the cell we've attached to
    	foodOffset= food.rigidbody.position-this.rigidbody.position;//distance from virus to cell so we know how far away to keep the virus when attached
    	rigidbody.velocity=food.rigidbody.velocity;//set it to move along at the same speed the cell is
    	tChange=Time.time+2;//wait the 2 seconds for the cell to decay before choosing a new descision
    }
}

function onDestroy(){
	
}
//move in a random direction for 3-5 seconds
function random(){
	randomDir(3,5);
}
//move in a random direction for a chosen time
function randomDir(minDuration: float, maxDuration: float){
	tChange = Time.time + Random.Range(minDuration,maxDuration);
	xDir = Random.Range(-2,2.0); // with float parameters, a random float
    yDir = Random.Range(-2.0,2.0); //  between -2.0 and 2.0 is returned
}

// Use this for initialization
function Start () {
	var food: GameObject;
	var foodOffset: Vector3;
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
	// change to random direction at random intervals
	if(food!=null&&attached){
		rigidbody.velocity=food.velocity;
		rigidbody.position= food.position+foodOffset;
	}
    if (Time.time >= tChange){
       attached=false;//unhooks the virus if it was attached to a cell because it is now dead       
       decide();//choose between attack,flee,consume,random
       rigidbody.velocity=rigidbody.velocity+Vector3(xDir*speed,yDir*speed,yDir*speed);
    }
    if(rigidbody.velocity.magnitude>maxSpeed){
    	rigidbody.velocity=rigidbody.velocity*.8;//slow the virus if it gets shoved too fast
    }
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
    
    if(rigidbody.velocity!=Vector3.zero&&rigidbody.velocity.x!=0)rigidbody.transform.forward=Vector3(0,rigidbody.velocity.y,0);//look in the direction of movement
    transform.position.z=0;   
}