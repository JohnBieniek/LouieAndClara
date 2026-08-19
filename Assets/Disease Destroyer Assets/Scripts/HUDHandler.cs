using UnityEngine;

public class HUDHandler : MonoBehaviour
{
    public float maxX=480,minX=-480,maxY=480,minY=-480,numVirusStart=20,numCellsStart=100,timeStep=8,multiplier=200;
    public int xDir,yDir,minCells;
    public Rigidbody virus,dummyvirus,whiteCell,cell;
    public Transform virusClone,dummyClone,whiteCellClone,cellClone;
    public Texture winScreen,loseScreen,pauseScreen,splashScreen,intro1;
    public Font newFont;
    public AudioSource death,win,corruption;
    enum GameState { Splash,Game,Pause,Win,Lose,Intro }
    GameState state=GameState.Splash;
    float startTime,newTime,maxVirus; bool endSound;
    void Start(){numVirusStart=20;numCellsStart=100;SpawnCells();for(var i=0;i<numVirusStart;i++)Instantiate(virus,new Vector3(Random.Range(minX+100,maxX-100),Random.Range(minY+100,maxY-100),0),virus.rotation);maxVirus=numVirusStart;newTime=Time.time+timeStep;}
    void SpawnCells(){var side=Mathf.RoundToInt(Mathf.Sqrt(numCellsStart));for(var i=0;i<side;i++)for(var j=0;j<side;j++){var rb=Instantiate(cell,new Vector3(i/(float)side*1000-500,j/(float)side*1000-500,0),cell.rotation);rb.constraints|=RigidbodyConstraints.FreezeRotation;rb.linearVelocity=new Vector3(Random.Range(-1f,1f)*1000,Random.Range(-1f,1f)*1000,0);}}
    void Update(){var cells=GameObject.FindGameObjectsWithTag("Respawn");var viruses=GameObject.FindGameObjectsWithTag("Finish");if(Input.GetKeyDown(KeyCode.P)){if(state==GameState.Game)state=GameState.Pause;else if(state==GameState.Pause)state=GameState.Game;}if(viruses.Length==0)state=GameState.Win;if(cells.Length<=minCells)state=GameState.Lose;
        if(state==GameState.Game){Time.timeScale=1;endSound=false;CorruptCell();}else if(state==GameState.Pause)Time.timeScale=0;else if(state==GameState.Splash){Time.timeScale=0;if(Advance())state=GameState.Intro;}else if(state==GameState.Intro){Time.timeScale=0;if(Advance()){state=GameState.Game;startTime=Time.time;}}else if(state==GameState.Win&&!endSound){if(win)win.PlayOneShot(win.clip);endSound=true;}else if(state==GameState.Lose&&!endSound){endSound=true;}}
    bool Advance()=>Input.GetMouseButtonDown(0)||Input.GetMouseButtonDown(1)||Input.GetKeyDown(KeyCode.Space);
    void CorruptCell(){if(Time.time<newTime)return;var cells=GameObject.FindGameObjectsWithTag("Respawn");if(cells.Length>0){GameObject farthest=null;float best=-1;foreach(var c in cells){var d=(c.transform.position-transform.position).sqrMagnitude;if(d>best){best=d;farthest=c;}}if(corruption)corruption.PlayOneShot(corruption.clip);farthest.GetComponent<cellMovement>()?.corrupt();}newTime=Time.time+timeStep+Random.Range(0,3f);}
    void OnGUI(){const float w=960,h=540;var cells=GameObject.FindGameObjectsWithTag("Respawn");var viruses=GameObject.FindGameObjectsWithTag("Finish");if(state==GameState.Splash){DrawFull(splashScreen,Screen.width,Screen.height);return;}if(state==GameState.Intro){DrawFull(intro1,Screen.width,Screen.height);return;}if(state==GameState.Pause){DrawFull(pauseScreen,Screen.width,Screen.height);return;}var scale=Mathf.Min(Screen.width/w,Screen.height/h);var offset=new Vector3((Screen.width-w*scale)*.5f,(Screen.height-h*scale)*.5f,0);if(state==GameState.Win||state==GameState.Lose)DrawFull(state==GameState.Win?winScreen:loseScreen,Screen.width,Screen.height);GUI.matrix=Matrix4x4.TRS(offset,Quaternion.identity,new Vector3(scale,scale,1));if(newFont)GUI.skin.font=newFont;if(state==GameState.Win||state==GameState.Lose){GUI.Label(new Rect(w/2-330,h/2+45,300,200),(cells.Length*100).ToString());GUI.Label(new Rect(w/2-25,h/2+45,300,200),(numCellsStart-cells.Length).ToString());GUI.Label(new Rect(w/2+225,h/2+45,300,200),(Time.time-startTime).ToString("0.0"));if(Advance())Restart();return;}GUI.Label(new Rect(w/2-310,2,180,40),"SCORE: "+(cells.Length*100));GUI.Label(new Rect(w/4+50,2,240,40),"CELLS REMAINING: "+cells.Length);GUI.Label(new Rect(w/2+30,2,240,40),"VIRUSES REMAINING: "+viruses.Length);var p=GameObject.FindGameObjectWithTag("Player");if(p&&p.GetComponent<playerMovement>().slow)GUI.Label(new Rect(w/2-30,h*.75f,200,40),"SLOWED");}
    void DrawFull(Texture t,float width,float height){if(t)GUI.DrawTexture(new Rect(0,0,width,height),t,ScaleMode.StretchToFill,true);}
    void Restart(){foreach(var o in GameObject.FindGameObjectsWithTag("Respawn"))Destroy(o);foreach(var o in GameObject.FindGameObjectsWithTag("Finish"))Destroy(o);GameObject.FindGameObjectWithTag("Player")?.GetComponent<playerMovement>()?.restart();state=GameState.Game;startTime=Time.time;SpawnCells();for(var i=0;i<numVirusStart;i++)Instantiate(virus,new Vector3(Random.Range(minX+100,maxX-100),Random.Range(minY+100,maxY-100),0),virus.rotation);newTime=Time.time+timeStep;}
}
