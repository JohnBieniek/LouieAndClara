#pragma strict
public var maxX = 480;
public var minX = -480;
public var maxY = 480;
public var minY = -480;
var xDir: int;
var yDir: int;
var virus : Rigidbody;
var dummyvirus: Rigidbody;
var virusClone: Transform;
var dummyClone:Transform;
var whiteCell : Rigidbody;
var whiteCellClone : Transform;
var cell : Rigidbody;
var cellClone : Transform;
public var minCells: int;
public var numVirusStart : float;
var vPercent : float;
var cPercent : float;
var scoreVal: float;
var multiplier :float=200;
public var numCellsStart : float;
var winScreen : Texture;
var loseScreen : Texture;
var pauseScreen : Texture;
var splashScreen: Texture;
var intro1 : Texture;
var newFont : Font;
enum gameState {splash, game, pause, win, lose, intro1};//, intro2, intro3};
var state : gameState;
var startTime : float;
var startPop :float;
var lastTime: float=0.0;
var newTime: float;
var maxVirus:float=0;
var death  : AudioSource;//death sound
var win  : AudioSource;//death sound
var corruption  : AudioSource;//death sound
var endSound: boolean = false;
public var timeStep: float =8.0;

function Start () {
	for(var psudoRand=0; psudoRand<Time.time*500;psudoRand++){
		Random.seed = psudoRand;
	}
	
	numVirusStart=20;
	numCellsStart=100;
	spawnCells();
	for(var virusGenerator = 0; virusGenerator<numVirusStart;virusGenerator++){//spawn viruses at random locations
		var virusClone : Rigidbody = Instantiate(virus, Vector3(Random.Range(minX+100,maxX-100),Random.Range(minY+100,maxY-100),0), virusClone.rotation);
	}
}

function corruptCell(){
	if(lastTime==0){
	 		lastTime=Time.time;
			newTime=Time.time+timeStep;
		}

	 	if(Time.time>=newTime){
	 		var cellArray : GameObject[];
   			cellArray = GameObject.FindGameObjectsWithTag("Respawn"); 
    		var farthest : GameObject; 
    		var distance = 0; 
    		var position = transform.position; 
    
    		// Iterate through them and find the closest one
    		for (var cell : GameObject in cellArray)  {
        		var diff = (cell.transform.position - position);
        		var curDistance = diff.sqrMagnitude; 
        		if (curDistance > distance) { 
            		farthest = cell; 
            		distance = curDistance; 
        		} 
    		}
    		corruption.PlayOneShot(corruption.clip);
    		farthest.GetComponent(cellMovement).corrupt();
	 		lastTime=Time.time;
			newTime=Time.time+timeStep+Random.Range(0,3);
	 	}
}
function spawnCells(){
	//Spawn cells in a grid, then give them all random velocities
	for(var i = 0; i < Mathf.Sqrt(numCellsStart); i++){
		for(var j = 0; j < Mathf.Sqrt(numCellsStart); j++){
			var spawnX = (i / Mathf.Sqrt(numCellsStart) * 1000) - 500;
			var spawnY = (j / Mathf.Sqrt(numCellsStart) * 1000) - 500;
			var cellClone : Rigidbody = Instantiate(cell, Vector3(spawnX, spawnY, 0), cellClone.rotation);
	
			cellClone.rigidbody.velocity = Vector3(Random.Range(-1.0, 1.0) * 1000, Random.Range(-1, 1) * 1000, 0);	
		}	
	}
}

function Update () {
	 //Gets stuff for win/lose conditions
	 var gos : GameObject[];
	 gos = GameObject.FindGameObjectsWithTag("Respawn"); //How many Cells remain
     cPercent= (gos.Length-minCells)/(numCellsStart-minCells);
     gos = GameObject.FindGameObjectsWithTag("Finish"); //finds how many viruses are left
	 vPercent = gos.Length/numVirusStart;
	 gos = GameObject.FindGameObjectsWithTag("Respawn");
     scoreVal=((gos.length)*100);//score calc
	 //Conditions for changing game states
	 if (Input.GetKeyDown("p")){	 	//Pausing and unpausing
	 	if(state == gameState.game){
	 		state = gameState.pause;
	 	}
	 	else if(state == gameState.pause){
	 		state = gameState.game;
	 	}
	 }
	 
	 if(vPercent <= 0){ //Win
	 	state = gameState.win;
	 }
	 if(cPercent <= 0){//Lose
	 	state = gameState.lose;
	 }
	 
	 //Handling game states
	 if(state == gameState.game){
	 	Time.timeScale = 1.0;
	 	endSound=false;
	 	corruptCell();	 	
	 }
	 else if(state == gameState.pause){
	 	Time.timeScale = 0.0;
	 }
	 else if(state == gameState.splash){
	 	Time.timeScale = 0.0;
	 	if(Input.GetMouseButtonDown(1)||Input.GetKeyDown ("space")||Input.GetMouseButtonDown(2)){
	 		state=gameState.intro1;
	 	}
	 }
	 else if(state == gameState.intro1){
	 	Time.timeScale = 0.0;
	 	if(Input.GetMouseButtonDown(1)||Input.GetKeyDown ("space")||Input.GetMouseButtonDown(2)){
	 		state=gameState.game;
	 		startTime=Time.time;
	 	} 
	 }
	 else if(state == gameState.win){
		if(!endSound){
			win.PlayOneShot(win.clip);
			endSound=true;//end has been played
		}
	 }
	 else if(state == gameState.lose){
		if(!endSound){
			death.PlayOneShot(death.clip);
			endSound=true;//end has been played
		}
	 }
	 
}

function OnGUI() {
	var mapX=590;
	var mapY=405;
	var gos : GameObject[];
	var style : GUIStyle;
	gos = GameObject.FindGameObjectsWithTag("Respawn"); //How many Cells remain
    cPercent= (gos.Length-minCells)/(numCellsStart-minCells);
    
    gos = GameObject.FindGameObjectsWithTag("Finish"); //finds how many viruses are left	
    if(maxVirus!=0&&gos.Length>maxVirus){
    	maxVirus=gos.Length;
    }
    if(vPercent>=1){
    	vPercent=1;
    	if(maxVirus==0){
    		maxVirus=gos.Length;
    	}
    }
	vPercent = gos.length/maxVirus;
	
    GUI.skin.font = newFont;
    
    //--------------------------WIN AND LOSE SCREENS-----------------------
    if(state == gameState.win || state == gameState.lose){
		if(state == gameState.win){
    		GUI.DrawTexture(Rect(0,0,Screen.width, Screen.height),winScreen,ScaleMode.ScaleToFit,true,1.777f);
		}
		if(state == gameState.lose){
    		GUI.DrawTexture(Rect(0,0,Screen.width, Screen.height),loseScreen,ScaleMode.ScaleToFit,true,1.777f);
		}
		gos = GameObject.FindGameObjectsWithTag("Respawn");
		var longScore2:long;
		longScore2=scoreVal;
		GUI.Label(Rect(Screen.width/2-330,Screen.height/2+45,300,200),longScore2+" "); //Score
		GUI.Label(Rect(Screen.width/2-25,Screen.height/2+45,300,200),(numCellsStart-gos.length)+" ");//cells killed
		GUI.Label(Rect(Screen.width/2+225,Screen.height/2+45,300,200),(startTime)+" ");//time passed
		
	    if (Input.GetMouseButtonDown(1)||Input.GetMouseButtonDown(2)||Input.GetKeyDown ("space")) {
	    	startTime=Time.time;
	    	gos = GameObject.FindGameObjectsWithTag("Respawn");    
	    	// Iterate through them and find the closest one
	   		for (var go : GameObject in gos)  {
				Destroy(go);
			}
			gos = GameObject.FindGameObjectsWithTag("Finish");    
	    	// Iterate through them and find the closest one
	   		for (var go : GameObject in gos)  {
				Destroy(go);
			}
			GameObject.FindGameObjectWithTag("Player").GetComponent(playerMovement).restart();
			state = gameState.game;
			this.Start();//gameObject.Start();
		}    
	}
    
    //-------------------PAUSE SCREEN---------------------
    if(state == gameState.pause){
    	GUI.DrawTexture(Rect(0,0,Screen.width, Screen.height),pauseScreen,ScaleMode.ScaleToFit,true,1.777f);
    }
    //-------------------SPLASH SCREEN-------------------------
    if(state==gameState.splash){
       GUI.DrawTexture(Rect(0,0,Screen.width, Screen.height),splashScreen,ScaleMode.ScaleToFit,true,1.777f);

    }
    if(state==gameState.intro1){
       GUI.DrawTexture(Rect(0,0,Screen.width, Screen.height),intro1,ScaleMode.ScaleToFit,true,1.777f);

    }
    if(state==gameState.game){
    	gos = GameObject.FindGameObjectsWithTag("Respawn");   
		var longScore:long;
		longScore=scoreVal;
		GUI.Label(Rect(Screen.width/2-310,15,300,200),"Score: ");
		GUI.Label(Rect(Screen.width/2-310,30,300,200),longScore+ " "); //Score

	
		GUI.backgroundColor = Color(255-(30*cPercent),1-(1*cPercent),1-(1*cPercent));//update color from red to brownred
		GUI.HorizontalScrollbar(Rect (Screen.width/2-200,20,200,20), 0, cPercent*100,0, 100);//scale health
		GUI.Label(Rect(((Screen.width/4))+50,2,200,200),"CELLS REMAINING: " + gos.length);//cells
		GUI.backgroundColor = Color(0, 255-(30*vPercent),2-(2*vPercent),50);//change color based on number of viruses, fade green to teal
		GUI.HorizontalScrollbar(Rect (Screen.width/2,20,200,20), 2000, vPercent*100,0, 100);//scale health//change virus bar based on percent remaining
		gos = GameObject.FindGameObjectsWithTag("Finish"); //finds how many viruses are left
		GUI.Label(Rect(((Screen.width/4)*2)+30,2,200,200),"VIRUSES REMAINING: " + gos.length);//virus
		if(GameObject.FindGameObjectWithTag("Player").GetComponent(playerMovement).slow){
			GUI.Label(Rect(((Screen.width/2))-30,(Screen.height/4)*3,200,200),"SLOWED");//virus
		}
	}
}