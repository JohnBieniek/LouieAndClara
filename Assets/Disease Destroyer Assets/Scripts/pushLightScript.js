#pragma strict
var duration : float;
private var pushTime : float;

light.type = LightType.Spot;

function Start () {

}

function Update () {
	if(pushTime > 0){
		var frac = (0.5 - pushTime) * 2;
		//light.spotAngle = 108.0 * frac;
		light.range = 300.0 * frac;
		pushTime = pushTime - Time.deltaTime;
	}
	else{
		//light.spotAngle  = 0.0;
		light.range = 0.0;
	}
}

function push(){
	pushTime = duration;
}

