//COLORS
var Colors = {
    red:0xf25346,
    white:0xd8d0d1,
    brown:0x59332e,
    pink:0xF5986E,
    brownDark:0x23190f,
    blue:0x68c3c0,
};

// THREEJS RELATED VARIABLES
// GAME VARIABLES
var game;
var deltaTime = 0;
var newTime = new Date().getTime();
var oldTime = new Date().getTime();
var ennemiesPool = [];
var particlesPool = [];
var particlesInUse = [];
var bestTime = 0;
var camPos = 1;

function resetGame(){
  game = {speed:0,
          baseSpeed:.00035,
          targetBaseSpeed:.00035,
          incrementSpeedByTime:.0000025,
          distanceForSpeedUpdate:100,
          speedLastUpdate:0,

          distance:0,
          ratioSpeedDistance:50,
          energy:100,
		  time:0,

          level:1,

          astroDefaultHeight:100,
          astroAmpHeight:80,
          astroMoveSensivity:0.005,
          astroRotXSensivity:0.0008,
          astroRotZSensivity:0.0004,
          astroFallSpeed:.001,
          astroMinSpeed:1.2,
          astroMaxSpeed:1.6,
          astroSpeed:0,
          astroCollisionDisplacementX:0,
          astroCollisionSpeedX:0,

          astroCollisionDisplacementY:0,
          astroCollisionSpeedY:0,

          planetRadius:600,

          ennemyDistanceTolerance:10,
          ennemyValue:10,
          ennemiesSpeed:.6,
          ennemyLastSpawn:0,
          distanceForEnnemiesSpawn:50,

          status : "playing",
         };
	
	remain_energy.innerHTML = game.energy;
	updateTime();
	timerID = setInterval(updateTime, 1000);
}

var scene,
    camera, fieldOfView, aspectRatio, nearplane, farplane,
    renderer, container;

//SCREEN & MOUSE VARIABLES

var HEIGHT, WIDTH,
    mousePos = { x: 0, y: 0 };

//INIT THREE JS, SCREEN AND MOUSE EVENTS

function createScene() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearplane = 1;
  farplane = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearplane,
    farplane
    );
  scene.fog = new THREE.Fog(0xf7d9aa, 100,950);
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = 100;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;
  container = document.getElementById('world');
  container.appendChild(renderer.domElement);


  const backgroundloader = new THREE.TextureLoader();
  backgroundloader.load('./img/bg2.jpg' , function(texture)
            {
             scene.background = texture;  
            });

  window.addEventListener('resize', handleWindowResize, false);
}

// HANDLE SCREEN EVENTS

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

function handleMouseUp(event){
  if (game.status == "waitingReplay"){
    resetGame();
  }
}



function handleTouchEnd(event){
  if (game.status == "waitingReplay"){
    resetGame();
  }
}


// LIGHTS

var hemisphereLight, shadowLight, spotLight;

function createLights() {

  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9);
  shadowLight = new THREE.DirectionalLight(0xffffff, .9);
  shadowLight.position.set(150, 350, 350);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom =  -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;
  
  spotLight = new THREE.SpotLight(0xeeeeee, .8, 0, 0.45);
  spotLight.position.set( 0, 100, 200 );

  scene.add(spotLight);
  
  spotLight.target.position.x = 0;
  spotLight.target.position.y = 100;
  scene.add(spotLight.target);
  
  scene.add(hemisphereLight);
  scene.add(shadowLight);
}


var Astro = function(){
   this.mesh = new THREE.Object3D();
  this.mesh.name = "Astro";
   
  

  var bodyGeom = new THREE.CylinderGeometry(8,8,15);
  const bodyloader = new THREE.TextureLoader();
  texBody = bodyloader.load('img/body.jpg' , function(texture)
            {
             bodyGeom.background = texture;  
            });
  var bodyMat = new THREE.MeshPhongMaterial({color:Colors.white, map:texBody});
  var body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.set(0,-12,0);
  body.castShadow = true;
  body.receiveShadow = true;
  this.mesh.add(body);

  

  var armGeom = new THREE.CylinderGeometry(4,4,15);
  const armloader = new THREE.TextureLoader();
  textArm = armloader.load('img/arm.jpg' , function(texture)
            {
             armGeom.background = texture;  
            });
  var armMat = new THREE.MeshPhongMaterial({color:Colors.white, map:textArm});
  var arm = new THREE.Mesh(armGeom, armMat);
  arm.position.set(-12,-12,0);
  arm.castShadow = true;
  arm.receiveShadow = true;
  this.mesh.add(arm);

  var arm2Geom = new THREE.CylinderGeometry(4,4,15);
  var arm2Mat = new THREE.MeshPhongMaterial({color:Colors.white, map:textArm});
  var arm2 = new THREE.Mesh(arm2Geom, arm2Mat);
  arm2.position.set(12,-12,0);
  arm2.castShadow = true;
  arm2.receiveShadow = true;
  this.mesh.add(arm2);


  var legGeom = new THREE.CylinderGeometry(4,4,15);
    const legloader = new THREE.TextureLoader();
  texLeg = legloader.load('img/leg.jpg' , function(texture)
            {
             legGeom.background = texture;  
            });
  var legMat = new THREE.MeshPhongMaterial({color:Colors.white, map:texLeg});
  var leg = new THREE.Mesh(legGeom, legMat);
  leg.position.set(-6,-28,0);
  leg.castShadow = true;
  leg.receiveShadow = true;
  this.mesh.add(leg);

  
  var leg2Geom = new THREE.CylinderGeometry(4,4,15);
  var leg2Mat = new THREE.MeshPhongMaterial({color:Colors.white, map:texLeg});
  var leg2 = new THREE.Mesh(leg2Geom, leg2Mat);
  leg2.position.set(6,-28,0);
  leg2.castShadow = true;
  leg2.receiveShadow = true;
  this.mesh.add(leg2);

  
  var faceGeom = new THREE.SphereGeometry(10,10,10);

  const headloader = new THREE.TextureLoader();
  texHead = headloader.load('img/head.jpg' , function(texture)
            {
             faceGeom.background = texture;  
            });

  var faceMat = new THREE.MeshLambertMaterial({color:Colors.white, map:texHead});
  var face = new THREE.Mesh(faceGeom, faceMat);
  face.castShadow = true;
  face.receiveShadow = true;
  this.mesh.add(face);


  var bagGeom = new THREE.BoxGeometry(20,30,10);
  const bagloader = new THREE.TextureLoader();
  texBag = bagloader.load('img/bag.jpg' , function(texture)
            {
             bagGeom.background = texture;  
            });

  var bagMat = new THREE.MeshLambertMaterial({color:Colors.white, map:texBag});
  var bag = new THREE.Mesh(bagGeom, bagMat);
  bag.position.set(0,-10,-20);
  bag.castShadow = true;
  bag.receiveShadow = true;
  this.mesh.add(bag);

 
};

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove( event ) {

    mouse.x = ( event.clientX / window.innerWidth ) * 250 - 1;

    mouse.y = - ( event.clientY / window.innerHeight ) * 250 + 1;

}

function animate(time) {
	time *= 0.01;
	model.position.x =  time;
	model.position.y =  150;
	model.position.z =  15;
	if(time > 300)
		time = 0;
	
    requestAnimationFrame( animate );

    raycaster.setFromCamera( mouse, camera );


    const intersects = raycaster.intersectObject( scene, true );

    renderer.render( scene, camera );

}

window.addEventListener( 'mousemove', onMouseMove, false );



planet = function(){
  var geom = new THREE.SphereGeometry(600,100,100);
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
  const palnetloader = new THREE.TextureLoader();
  textu = palnetloader.load('img/planet.jpg' , function(texture)
            {
             geom.background = texture;  
            });

  var mat = new THREE.MeshPhongMaterial({
	map:textu,
    transparent:true,
    opacity:.6,
    shading:THREE.FlatShading,
  });
  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.receiveShadow = true;
}


Ennemy = function(){
  var geom = new THREE.TetrahedronGeometry(8,5);
  const meteoloader = new THREE.TextureLoader();
  
  textu = meteoloader.load('img/meteo.jpg' , function(texture)
            {
             geom.background = texture;  
            });
 
  var mat = new THREE.MeshPhongMaterial({
	map:textu,
    shininess:0,
    specular:0xffffff,
    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
  this.mesh.castShadow = true;
  this.angle = 0;
  this.dist = 0;
}

EnnemiesHolder = function (){
  this.mesh = new THREE.Object3D();
  this.ennemiesInUse = [];
}

EnnemiesHolder.prototype.spawnEnnemies = function(){
  var nEnnemies = game.level;

  for (var i=0; i<nEnnemies; i++){
    var ennemy;
    if (ennemiesPool.length) {
      ennemy = ennemiesPool.pop();
    }else{
      ennemy = new Ennemy();
    }

    ennemy.angle = - (i*0.1);
    ennemy.distance = game.planetRadius + game.astroDefaultHeight + (-1 + Math.random() * 2) * (game.astroAmpHeight-20);
    ennemy.mesh.position.y = -game.planetRadius + Math.sin(ennemy.angle)*ennemy.distance;
    ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;
	ennemy.mesh.scale.set( 0.7 + Math.random(), 0.7 + Math.random(), 0.7 + Math.random());
    
	this.mesh.add(ennemy.mesh);
    this.ennemiesInUse.push(ennemy);
  }
}

EnnemiesHolder.prototype.rotateEnnemies = function(){
  for (var i=0; i<this.ennemiesInUse.length; i++){
    var ennemy = this.ennemiesInUse[i];

    ennemy.angle += game.speed*deltaTime*game.ennemiesSpeed;

    if (ennemy.angle > Math.PI*2) ennemy.angle -= Math.PI*2;
    ennemy.mesh.position.y = -game.planetRadius + Math.sin(ennemy.angle)*ennemy.distance;
    ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;
    ennemy.mesh.rotation.z += Math.random()*.1;
    ennemy.mesh.rotation.y += Math.random()*.1;

    var diffPos = Astro.mesh.position.clone().sub(ennemy.mesh.position.clone());
    var d = diffPos.length();
    if (d<game.ennemyDistanceTolerance){
      ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
      this.mesh.remove(ennemy.mesh);
      game.astroCollisionSpeedX = 100 * diffPos.x / d;
      game.astroCollisionSpeedY = 100 * diffPos.y / d;

      removeEnergy();
	 
	  if(game.energy < 30) {
		  hemisphereLight.intensity = 0;
		  shadowLight.intensity = 0;
	  }
	  
	  else if(game.energy < 50) {
		  hemisphereLight.intensity = 0.3;
		  shadowLight.intensity = 0.3;
	  }
	  
	  else if(game.energy < 60) {
		  hemisphereLight.intensity = 0.4;
		  shadowLight.intensity = 0.4;
	  }
	  
	  else if(game.energy < 70) {
		  hemisphereLight.intensity = 0.6;
		  shadowLight.intensity = 0.6;
	  }
	  
	  else if(game.energy < 80) {
		  hemisphereLight.intensity = 0.7;
		  shadowLight.intensity = 0.7;
	  }
	  
	  else if(game.energy < 90) {
		  hemisphereLight.intensity = 0.8;
		  shadowLight.intensity = 0.8;
	  }
	  
      i--;
    }else if (ennemy.angle > Math.PI){
      ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
      this.mesh.remove(ennemy.mesh);
      i--;
    }
  }
}

// 3D Models
var planet;
var Astro;

function createastro(){
  Astro = new Astro();
  Astro.mesh.scale.set(.5,.5,.5);
  Astro.mesh.position.y = 100;
  Astro.mesh.rotation.y = 1;
  scene.add(Astro.mesh);
}

function createplanet(){
  planet = new planet();
  planet.mesh.position.y = -600;
  scene.add(planet.mesh);
}


function createEnnemies(){
  for (var i=0; i<10; i++){
    var ennemy = new Ennemy();
    ennemiesPool.push(ennemy);
  }
  ennemiesHolder = new EnnemiesHolder();
  scene.add(ennemiesHolder.mesh)
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////GAME LOOP/////////////////////////////////////////////////////////////////////////

function loop(){
  newTime = new Date().getTime();
  deltaTime = newTime-oldTime;
  oldTime = newTime;

if (game.status=="playing"){
	
	// Reset Light
	if(game.energy == 100) {
		hemisphereLight.intensity = 0.9;
		shadowLight.intensity = 0.9;
	}
	
    if (Math.floor(game.distance)%game.distanceForSpeedUpdate == 0 && Math.floor(game.distance) > game.speedLastUpdate){
      game.speedLastUpdate = Math.floor(game.distance);
      var min = Math.ceil(10);
      var max = Math.floor(5);
      var rand= Math.floor(Math.random() * (max - min)) + min;
      if(rand==6) game.level++;
      game.targetBaseSpeed += game.incrementSpeedByTime*deltaTime;
    }


    if (Math.floor(game.distance)%game.distanceForEnnemiesSpawn == 0 && Math.floor(game.distance) > game.ennemyLastSpawn){
      game.ennemyLastSpawn = Math.floor(game.distance);
      ennemiesHolder.spawnEnnemies();
    }

   updateastro();
   updateDistance();
   updateEnergy();
   game.baseSpeed += (game.targetBaseSpeed - game.baseSpeed) * deltaTime * 0.02;
   game.speed = game.baseSpeed * game.astroSpeed; 
   
  }else if(game.status=="gameover"){
    game.speed *= .99;
    Astro.mesh.rotation.z -= (-Math.PI/2 - Astro.mesh.rotation.z)*.0002*deltaTime;
    Astro.mesh.rotation.x += 0.0003*deltaTime;
    game.astroFallSpeed *= 1.05;
    Astro.mesh.position.y -= game.astroFallSpeed*deltaTime;

    if (Astro.mesh.position.y <-200){
		if(bestTime < game.time) {
			updateBest();
		}
		stopTime();
		game.status = "waitingReplay";

    }
  }else if (game.status=="waitingReplay"){

  }
  planet.mesh.rotation.z += .005;
  ennemiesHolder.rotateEnnemies();
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

function updateDistance(){
  game.distance += game.speed*deltaTime*game.ratioSpeedDistance;
}

function updateBest() {
	bestTime = game.time;
	
	const hours = Math.floor(bestTime/3600);
	const checkMinutes = Math.floor(bestTime/60);
	const seconds = bestTime%60;
	const minutes = checkMinutes % 60;
	
	var str = "";
	str += hours;
	str += ":";
	str += minutes;
	str += ":";
	str += seconds-1;
	
	best_timer.innerHTML = str;
}

function updateTime(){
  const hours = Math.floor(game.time/3600);
  const checkMinutes = Math.floor(game.time/60);
  const seconds = game.time%60;
  const minutes = checkMinutes % 60;
  
  var str = "";
  str += hours;
  str += ":";
  str += minutes;
  str += ":";
  str += seconds;
  
  timer.innerHTML = str;
  game.time++;

}

function stopTime() {
	if(timerID != null){
		clearInterval(timerID);
	}
}

function updateEnergy(){
  game.energy = Math.max(0, game.energy);

  if (game.energy <1){
    game.status = "gameover";
  }
}

// drop the Energy if hit the ennemy
function removeEnergy(){
  game.energy -= game.ennemyValue;
  remain_energy.innerHTML = game.energy;
  game.energy = Math.max(0, game.energy);
}

function updateastro(){
  game.astroSpeed = normalize(mousePos.x,-.5,.5,game.astroMinSpeed, game.astroMaxSpeed);
  var targetY = normalize(mousePos.y,-.75,.75,game.astroDefaultHeight-game.astroAmpHeight, game.astroDefaultHeight+game.astroAmpHeight);
  var targetX = normalize(mousePos.x,-.75,.75,-100, 100);

  game.astroCollisionDisplacementX += game.astroCollisionSpeedX;
  targetX += game.astroCollisionDisplacementX;

  game.astroCollisionDisplacementY += game.astroCollisionSpeedY;
  targetY += game.astroCollisionDisplacementY;

  Astro.mesh.position.y += (targetY-Astro.mesh.position.y)*deltaTime*game.astroMoveSensivity;
  Astro.mesh.position.x += (targetX-Astro.mesh.position.x)*deltaTime*game.astroMoveSensivity;

  Astro.mesh.rotation.z = (targetY-Astro.mesh.position.y)*deltaTime*game.astroRotXSensivity;
  Astro.mesh.rotation.x = (Astro.mesh.position.y-targetY)*deltaTime*game.astroRotZSensivity;

  game.astroCollisionSpeedX += (0-game.astroCollisionSpeedX)*deltaTime * 0.03;
  game.astroCollisionDisplacementX += (0-game.astroCollisionDisplacementX)*deltaTime *0.01;
  game.astroCollisionSpeedY += (0-game.astroCollisionSpeedY)*deltaTime * 0.03;
  game.astroCollisionDisplacementY += (0-game.astroCollisionDisplacementY)*deltaTime *0.01;
 
  spotLight.target.position.x = Astro.mesh.position.x + 10;
  spotLight.target.position.y = Astro.mesh.position.y;
}

function normalize(v,vmin,vmax,tmin, tmax){
  var nv = Math.max(Math.min(v,vmax), vmin);
  var dv = vmax-vmin;
  var pc = (nv-vmin)/dv;
  var dt = tmax-tmin;
  var tv = tmin + (pc*dt);
  return tv;
}

var timer, timerID, best_timer, remain_energy;

function changeCamera(event) {
	if (event.keyCode == 32) {
		if (camPos == 1)
		{
			camPos = 0;
			fieldOfView = 50;
			nearplane = 0.01;
			farplane = 5000;
			camera.position.x = -100;
			camera.position.z = 0;
			camera.position.y = 250;
			planet.mesh.rotation.z -= .005;
			camera.lookAt(new THREE.Vector3(50, 100, 0));
			console.log("Change");
		}
		else
		{
			camPos = 1;
			fieldOfView = 60;
			nearplane = 1;
			farplane = 10000;
			camera.position.x = 0;
			camera.position.z = 200;
			camera.position.y = 100;
			planet.mesh.rotation.z += .005;
			camera.lookAt(new THREE.Vector3(0, 100, 0));
			console.log("Ori");
		}
	}
}

function init(event){
	
	timer = document.getElementById("time_score");
	remain_energy = document.getElementById("energy");
	best_timer = document.getElementById("best_score");
	
  document.addEventListener('mousemove', handleMouseMove, false);
  document.addEventListener('mouseup', handleMouseUp, false);
  document.addEventListener("keydown", changeCamera, false);
  
  resetGame();
  createScene();
  createLights();
  createastro();
  createplanet();
  createEnnemies();
  loop();
}

var mousePos = { x: 0, y: 0 };

function handleMouseMove(event) {
  var tx = -1 + (event.clientX / WIDTH)*2;
  var ty = 1 - (event.clientY / HEIGHT)*2;
  mousePos = {x:tx, y:ty};
}

window.addEventListener('load', init, false);

window.addEventListener("mousedown", function(e) {
    var isRightButton;
    e = e || window.event;
    if ("which" in e) // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightButton = e.which == 3;
    else if ("button" in e) // IE, Opera 
        isRightButton = e.button == 2;
});