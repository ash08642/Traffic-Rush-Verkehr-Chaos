const scene = new THREE.Scene();

var lanesCollection = [];
var botCollection = [];
var botDirection = [];
var botSpeed = [];
var botHasFollower = [];
var botHit = [];
var laneId = [];
var extraCarCollection = [];
var extraCarStatus = [];
var statusIndex = 0;
var lives = 0;
var points = 0;
var highScore = 0;
var lanesIndex;
var botIndex;
var deletedTrackPos;

var followingBot = [];
var followingBotDirection = [];
var followingBotSpeed = [];
var followerHasFollower = [];
var followerHit = [];

var accelerate = false;
var decelerate = false;
var carSpeed = 2;

var ready = true;
var gameRunnig = false;
var paused = true;
var game_Over = false;
var clock = new THREE.Clock();
var delta = 0;
var timeDelta = 0;
var consectiveTruckLanes = 0;

const ambientLight = new THREE.AmbientLight(0xffffff,0.6);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(100,300,400);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.left = -600;
dirLight.shadow.camera.right = 750;
dirLight.shadow.camera.top = 500;
dirLight.shadow.camera.bottom = -600;
dirLight.shadow.camera.near = 100;
dirLight.shadow.camera.far = 800;

scene.add(ambientLight);
scene.add(dirLight);

const width = window.innerWidth;
const height = window.innerHeight;

const aspectRatio = 1000 / 600;
const cameraWidth = 900;
const cameraHeight = 540;

const camera = new THREE.OrthographicCamera(
	cameraWidth / -2, // left
	cameraWidth / 2, // right
	cameraHeight / 2, // top
	cameraHeight / -2, // bottom
	-150, // near plane
	1000 // far plane
);
camera.position.set(275, -150, 200);
camera.up.set(0,0,1);
camera.lookAt(175,50,0);
camera.aspect = 1000/600;

const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
renderer.setSize(cameraWidth * 0.9, cameraHeight * 0.9);
renderer.shadowMap.enabled = true;

document.getElementById("artifactCanvas").appendChild(renderer.domElement);

window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

window.addEventListener("keydown",function(event){
	if(event.key == "ArrowUp"){
		accelerate = true;
		decelerate = false;
	}
	else if(event.key == "ArrowDown"){
		accelerate = false;
		decelerate = true;
	}
	else if(event.key == "R" && ready == true){
		start_Game.style.display = "none";
		pause_Game.style.display = "none";
		end_Game.style.display = "none";

		if(gameRunnig == true || game_Over == true){initialize();}
		startGame();
	}
	else if(event.key == "r" && ready == true){
		start_Game.style.display = "none";
		pause_Game.style.display = "none";
		end_Game.style.display = "none";

		if(gameRunnig == true || game_Over == true){initialize();}
		startGame();
	}
	else if(event.key == "p" && gameRunnig == true){
			if(ready == false){
				ready = true;
				paused = true;
				pause_Game.style.display = "block";
				renderer.setAnimationLoop(null);
			}
			else{
				ready = false;
				paused = false;
				pause_Game.style.display = "none";
				renderer.setAnimationLoop(animate);
			}
	}
	else{
		accelerate = false;
		decelerate = false;
	}
});

initialize();

var start_Game = document.getElementById("StartGame");
var pause_Game = document.getElementById("PauseGame");
var end_Game = document.getElementById("EndGame");

document.getElementById("spielStarten").onclick = function(){
	startGame();
	start_Game.style.display = "none";
	paused = false;
};
document.getElementById("continue").onclick = function(){
	ready = false;
	paused = false;
	pause_Game.style.display = "none";
	renderer.setAnimationLoop(animate);
};
document.querySelector('button.NeuSpielStarten').onclick = function(){
	initialize();
	ready = true;
	paused = true;
	pause_Game.style.display = "none";
	start_Game.style.display = "block";
	gameRunnig = false;
};
document.querySelector('button.NeuSpielStarten2').onclick = function(){
	initialize();
	ready = true;
	paused = true;
	pause_Game.style.display = "none";
	start_Game.style.display = "block";
	end_Game.style.display = "none";
	gameRunnig = false;
};


function initialize(){
	reset();
	var playerCar = Car();
	playerCar.position.x = -200;
	scene.add(playerCar);

	createStartingLanes();
	
	renderer.render(scene,camera);
};
function startGame(){
	gameRunnig = true;
	game_Over = false;
	if(ready){
		ready = false;
		renderer.setAnimationLoop(animate);
	}
}
function animate(){
	timeDelta = clock.getDelta();
	delta = timeDelta / 0.0166666667;
	if(delta > 1.5){
		delta = 1;
	}

	if(accelerate == true){ // continue here
		carSpeed = 3;
	}else if(decelerate == true){
		carSpeed = 1;
	}else{
		carSpeed = 2;
	}

	moveCamera();
	moveVehicles();
	addRandomBots();
	removeExtraLanes();
	removeExtraTrucks();
	hitDetection();

	renderer.render(scene,camera);
}
function reset(){

	delta = 0;

	for(var i = 0; i < botCollection.length; i++){
		scene.remove(botCollection[i]);
	}
	botCollection = [];
	for(var i = 0; i < followingBot.length; i++){
		scene.remove(followingBot[i]);
	}
	followingBot = [];
	for(var i = 0; i < lanesCollection.length; i++){
		scene.remove(lanesCollection[i]);
	}
	for(var i = 0; i < extraCarCollection.length; i++){
		scene.remove(extraCarCollection[i]);
	}

	lanesCollection = [];
	botCollection = [];
	botDirection = [];
	botSpeed = [];
	followingBot = [];
	followingBotDirection = [];
	followingBotSpeed = [];
	botHasFollower = [];
	followerHasFollower = [];
	botHit = [];
	followerHit = [];
	laneId = [];
	lives = 0;
	extraCarCollection = [];
	extraCarStatus = [];
	statusIndex = 0;
	lives = 0;
	points = 0;
	updateLives();
	updateScore();

}
function moveCamera(){
	if(accelerate == true){
		if(camera.position.x < 300){
			camera.position.x += 1;
			camera.lookAt.x += 1;
		}
	}
	else if(decelerate == true){
		if(camera.position.x > 250){
			camera.position.x -= 1;
			camera.lookAt.x -= 1;
		}
	}
}
function createStartingLanes(){
	for(var i = -500; i < 0; i += 50) {
		lanesCollection.push(createSafeLane());
		lanesCollection[lanesCollection.length - 1].rotation.z = Math.PI / 2;
		lanesCollection[lanesCollection.length - 1].position.z = -6;
		lanesCollection[lanesCollection.length - 1].position.x = i;
		laneId.push("safeLane");
		scene.add(lanesCollection[lanesCollection.length - 1]);
	}
	for(var i = 0; i < 700; i += 50){
		addRandomLane(i);
	}
}
function moveVehicles(){
	for(var i = 0; i < lanesCollection.length; i++){
		lanesCollection[i].position.x -= delta * carSpeed;
	}
	for(var i = 0; i < botCollection.length; i++){
		botCollection[i].position.x -= delta * carSpeed;
		botCollection[i].position.y += Math.floor(delta * botSpeed[i]) * botDirection[i] + botDirection[i];
		//console.log(botSpeed[i]);
	}
	for(var i = 0; i < followingBot.length; i++){
		followingBot[i].position.x -= delta * carSpeed;
		followingBot[i].position.y += Math.floor(delta * followingBotSpeed[i]) * followingBotDirection[i] + followingBotDirection[i];
		//console.log(followingBotSpeed[i]);
	}
	for(var i = 0; i < extraCarCollection.length; i++){
		extraCarCollection[i].position.x -= delta * carSpeed;
	}
}
function removeExtraLanes(){
	if(lanesCollection[0].position.x <= -350){
		deletedTrackPos = lanesCollection[0].position.x;
		scene.remove(lanesCollection[0]);
		if(laneId[4] == "houseLane"){
			lives += 1;
			updateLives();
			extraCarStatus[statusIndex] = true;
			statusIndex++;
		}
		laneId.shift();
		lanesCollection.shift();
		points += 5;
		updateScore();
		addRandomLane(deletedTrackPos + 1200);
	}
}
function hitDetection(){
	for(var i = 0; i < botCollection.length; i++){
		if((botHit[i] == false) && (botCollection[i].position.x >= -210 || botCollection[i].position.x >= -222 || botCollection[i].position.x >= -198)
		&& (botCollection[i].position.x <= -150 || botCollection[i].position.x <= -162 || botCollection[i].position.x <= -138) 
		&& (botCollection[i].position.y >= -12 || botCollection[i].position.y >= -52 || botCollection[i].position.y >= 28) 
		&& (botCollection[i].position.y <= 12 || botCollection[i].position.y <= -28 || botCollection[i].position.y <= 52)){
			botHit[i] = true;
			botDirection[i] = 0;
			lives -= 1;
			updateLives();
			if(lives < 0){
				ready = true;
				gameRunnig = false;
				game_Over = true;
				renderer.setAnimationLoop(null);
				gameOver();
			}
		}
	}
	for(var i = 0; i < followingBot.length; i++){
		if((followerHit[i] == false) && (followingBot[i].position.x >= -210 || followingBot[i].position.x >= -222 || followingBot[i].position.x >= -198)
		&& (followingBot[i].position.x <= -150 || followingBot[i].position.x <= -162 || followingBot[i].position.x <= -138) 
		&& (followingBot[i].position.y >= -12 || followingBot[i].position.y >= -52 || followingBot[i].position.y >= 28) 
		&& (followingBot[i].position.y <= 12 || followingBot[i].position.y <= -28 || followingBot[i].position.y <= 52)){
			followerHit[i] = true;
			followingBotDirection[i] = 0;
			lives -= 1;
			updateLives();
			if(lives < 0){
				ready = true;
				gameRunnig = false;
				game_Over = true;
				renderer.setAnimationLoop(null);
				gameOver();
			}
		}
	}
}
function addRandomLane(initialX){
	let trackRandomOption = Math.floor(Math.random() * 13);
		switch(trackRandomOption){
			case 0:
			case 1:
				lanesCollection.push(createHouseLane());
				lanesCollection[lanesCollection.length - 1].rotation.z = Math.PI / 2;
				lanesCollection[lanesCollection.length - 1].position.z = -6;
				lanesCollection[lanesCollection.length - 1].position.x = initialX;
				laneId.push("houseLane");
				extraCarCollection.push(Car());
				extraCarCollection[extraCarCollection.length - 1].position.y = -75;
				extraCarCollection[extraCarCollection.length - 1].position.x = initialX;
				extraCarCollection[extraCarCollection.length - 1].rotation.z = Math.PI * 1.5;
				extraCarStatus.push(false);
				scene.add(lanesCollection[lanesCollection.length - 1]);
				scene.add(extraCarCollection[extraCarCollection.length - 1]);
				break;
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
				lanesCollection.push(createSafeLane());
				lanesCollection[lanesCollection.length - 1].rotation.z = Math.PI / 2;
				lanesCollection[lanesCollection.length - 1].position.z = -6;
				lanesCollection[lanesCollection.length - 1].position.x = initialX;
				laneId.push("safeLane");
				scene.add(lanesCollection[lanesCollection.length - 1]);
				break;
			case 7:
			case 8:
			case 9:	
				lanesCollection.push(createTruckTrack());
				lanesCollection[lanesCollection.length - 1].rotation.z = Math.PI / 2;
				lanesCollection[lanesCollection.length - 1].position.z = -6;
				lanesCollection[lanesCollection.length - 1].position.x = initialX;
				scene.add(lanesCollection[lanesCollection.length - 1]);
				botCollection.push(Truck());
				botCollection[botCollection.length - 1].position.y = 500;
				botCollection[botCollection.length - 1].position.x = initialX;
				botCollection[botCollection.length - 1].rotation.z = Math.PI * 1.5;
				botDirection.push(-1);
				botSpeed.push(Math.floor(1 + Math.random() * 2) * Math.floor(1 + Math.random() * 2));
				botHasFollower.push(false);
				botHit.push(false);
				laneId.push("truckLane");
				scene.add(botCollection[botCollection.length - 1]);
				break;
			default:
				lanesCollection.push(createTruckTrack());
				lanesCollection[lanesCollection.length - 1].rotation.z = Math.PI / 2;
				lanesCollection[lanesCollection.length - 1].position.z = -6;
				lanesCollection[lanesCollection.length - 1].position.x = initialX;
				scene.add(lanesCollection[lanesCollection.length - 1]);
				botCollection.push(Truck());
				botCollection[botCollection.length - 1].position.y = -500;
				botCollection[botCollection.length - 1].position.x = initialX;
				botCollection[botCollection.length - 1].rotation.z = Math.PI / 2;
				botDirection.push(1);
				botSpeed.push(Math.floor(1 + Math.random() * 2) * Math.floor(1 + Math.random() * 2));
				botHasFollower.push(false);
				botHit.push(false);
				laneId.push("truckLane");
				scene.add(botCollection[botCollection.length - 1]);
		}
}
function addRandomBots(){
	for(var c = 0; c < botCollection.length; c++){
		if((botHasFollower[c] == false && botCollection[c].position.y <= 1 && botDirection[c] == -1) || (botHasFollower[c] == false && botCollection[c].position.y >= -1 && botDirection[c] == 1)){
			followingBot.push(Truck());
			followingBot[followingBot.length - 1].position.x = botCollection[c].position.x;
			followingBot[followingBot.length - 1].position.y = -500 * botDirection[c];
			followingBot[followingBot.length - 1].rotation.z = Math.PI * 0.5 * botDirection[c];
			followingBotDirection.push(botDirection[c]);
			followingBotSpeed.push(Math.floor(1 + Math.random() * 2) * Math.floor(1 + Math.random() * 2));
			followerHasFollower.push(false);
			botHasFollower[c] = true;
			followerHit.push(false);
			scene.add(followingBot[followingBot.length - 1]);
		}
	}
	for(var c = 0; c < followingBot.length; c++){
		if((followerHasFollower[c] == false && followingBot[c].position.y <= 1 && followingBotDirection[c] == -1) || (followerHasFollower[c] == false && followingBot[c].position.y >= -1 && followingBotDirection[c] == 1)){
			followingBot.push(Truck());
			followingBot[followingBot.length - 1].position.x = followingBot[c].position.x;
			followingBot[followingBot.length - 1].position.y = -500 * followingBotDirection[c];
			followingBot[followingBot.length - 1].rotation.z = Math.PI * 0.5 * followingBotDirection[c];
			followingBotDirection.push(followingBotDirection[c]);
			followingBotSpeed.push(Math.floor(1 + Math.random() * 2) * Math.floor(1 + Math.random() * 2));
			followerHasFollower.push(false);
			followerHasFollower[c] = true;
			followerHit.push(false);
			scene.add(followingBot[followingBot.length - 1]);
		}
	}
}
function removeExtraTrucks(){
	for(var c = 0; c < botCollection.length; c++){
		if(botCollection[c].position.y > 500 || botCollection[c].position.y < -500 || botCollection[c].position.x < -349){
			
			scene.remove(botCollection[c]);
			botCollection.splice(c,1);
			botDirection.splice(c,1);
			botSpeed.splice(c,1);
			botHasFollower.splice(c,1);
			botHit.splice(c,1);
		}
		if(botHit[c] == true){
			decreaseOpacity(botCollection[c],timeDelta);
			botCollection[c].rotation.z += 2 * timeDelta;
		}
	}
	for(var c = 0; c < followingBot.length; c++){
		if(followingBot[c].position.y > 500 || followingBot[c].position.y < -500 || followingBot[c].position.x < -349){
			
			scene.remove(followingBot[c]);
			followingBot.splice(c,1);
			followingBotDirection.splice(c,1);
			followingBotSpeed.splice(c,1);
			followerHasFollower.splice(c,1);
			followerHit.splice(c,1);
		}
		if(followerHit[c] == true){
			decreaseOpacity(followingBot[c],timeDelta);
			followingBot[c].rotation.z += 2 * timeDelta;
		}
	}
	for(var c = 0; c < extraCarStatus.length; c++){
		if(extraCarStatus[c] == true){
			decreaseOpacity(extraCarCollection[c],timeDelta);
		}
	}
	if(extraCarCollection.length != 0){
		if(extraCarCollection[0].position.x < -349){
			scene.remove(extraCarCollection[0]);
			extraCarCollection.shift();
			extraCarStatus.shift();
			statusIndex--;
		}
	}
}
function decreaseOpacity(myGroup,timeDelta){
	for (var j = 0; j < myGroup.children.length; j++) {
		if(myGroup.children[j].material){
			myGroup.children[j].position.z += 1.5;
			myGroup.children[j].material.opacity -= 0.5 * timeDelta;
			for(var k = 0; k < myGroup.children[j].material.length; k++){
				myGroup.children[j].material[k].opacity -= 0.5 * timeDelta;
			}
		}else{
			decreaseOpacity(myGroup.children[j],timeDelta)
		}
	}
}
function Car(){
	const car = new THREE.Group();

	const backWheel = wheel();
	const frontWheel = wheel();
	frontWheel.position.x = 35;
	car.add(backWheel);
	car.add(frontWheel);

	const carColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
	const mainColor = randomColor(carColors);
	const CarFrontTexture = getCarFrontTexture();
	CarFrontTexture.center = new THREE.Vector2(0.5,0.5);
	CarFrontTexture.rotation = Math.PI / 2;

	const mainGeo = new THREE.BoxGeometry(60,24,12);
	const mainMat = [new THREE.MeshLambertMaterial({transparent: true,map: CarFrontTexture}),
		new THREE.MeshLambertMaterial({color: mainColor,transparent: true}),
		new THREE.MeshLambertMaterial({color: mainColor,transparent: true}),
		new THREE.MeshLambertMaterial({color: mainColor,transparent: true}),
		new THREE.MeshLambertMaterial({color: mainColor,transparent: true}),
		new THREE.MeshLambertMaterial({color: mainColor,transparent: true})];
	const mainBody = new THREE.Mesh(mainGeo,mainMat);
	mainBody.position.x = 20;
	mainBody.position.z = 4;
	mainBody.receiveShadow = true;
	mainBody.castShadow = true;
	car.add(mainBody);

	const CarSideTexture = getCarSideTexture();
	const topGeo = new THREE.BoxGeometry(30,24,10);
	const topMat = [new THREE.MeshLambertMaterial({color: 0xffffff}),
		new THREE.MeshLambertMaterial({color: 0xffffff,transparent: true}),
		new THREE.MeshLambertMaterial({transparent: true,map: CarSideTexture}),
		new THREE.MeshLambertMaterial({transparent: true,map: CarSideTexture}),
		new THREE.MeshLambertMaterial({color: 0xffffff,transparent: true}),
		new THREE.MeshLambertMaterial({color: 0xffffff,transparent: true})];
	const topBody = new THREE.Mesh(topGeo,topMat);
	topBody.position.x = 18;
	topBody.position.z = 16;
	topBody.receiveShadow = true;
	topBody.castShadow = true;
	car.add(topBody);

	const lSide = createTriangle(43,12,10,33,12,10,33,12,21);
	const rSide = createTriangle(43,-12,10,33,-12,10,33,-12,21);
	const front1 = createTriangle(43,12,10,33,-12,21,33,12,21);
	const front2 = createTriangle(43,-12,10,43,12,10,33,-12,21);
	car.add(lSide);
	car.add(rSide);
	car.add(front1);
	car.add(front2);

	return car;
}
function Truck(){
	var truck = new THREE.Group();

	const backWheel = wheel();
	const frontWheel = wheel();
	frontWheel.position.x = 30;
	backWheel.position.x = -15;
	truck.add(backWheel);
	truck.add(frontWheel);

	const truckFrontTexture = getTruckFrontTexture();
	truckFrontTexture.center = new THREE.Vector2(0.5,0.5);
	truckFrontTexture.rotation = Math.PI / 2;

	const truckSideTexture = getTruckSideTexture();
	truckSideTexture.center = new THREE.Vector2(0.5,0.5);
	
	const truckSide2Texture = getTruckSide2Texture();
	truckSide2Texture.center = new THREE.Vector2(0.5,0.5);

	const frontGeo = new THREE.BoxGeometry(30,24,36);
	const frontMat = [new THREE.MeshLambertMaterial({transparent: true, map: truckFrontTexture}),
		new THREE.MeshLambertMaterial({color: 0xaaaaaa, transparent: true}),
		new THREE.MeshLambertMaterial({transparent: true, map: truckSide2Texture}),
		new THREE.MeshLambertMaterial({transparent: true, map: truckSideTexture}),
		new THREE.MeshLambertMaterial({color: 0xaaaaaa, transparent: true}),
		new THREE.MeshLambertMaterial({color: 0xaaaaaa, transparent: true})];
	const front = new THREE.Mesh(frontGeo,frontMat);
	front.position.x = 25;
	front.position.z = 16;
	front.receiveShadow = true;
	front.castShadow = true;
	truck.add(front);

	const backGeo = new THREE.BoxGeometry(50,24,40);
	var backMat = new THREE.MeshLambertMaterial({color: 0xeeeeee, transparent: true});
	var back = new THREE.Mesh(backGeo,backMat);
	back.position.x = -15;
	back.position.z = 18;
	back.receiveShadow = true;
	back.castShadow = true;
	truck.add(back);

	return truck;

}
function wheel(){
	const wheelGeo = new THREE.CylinderGeometry(6,6,30,7);
	const wheelMat = new THREE.MeshBasicMaterial({color: 0x333333, transparent: true});
	const wheel = new THREE.Mesh(wheelGeo,wheelMat);
	return wheel;
}
function randomColor(array){
	return array[Math.floor(Math.random() * array.length)];
}
function createTriangle(a,b,c,d,e,f,g,h,i){
	const geometry = new THREE.BufferGeometry();
	const vertices = new Float32Array( [a,b,c,d,e,f,g,h,i] );
	geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	const material = new THREE.MeshBasicMaterial( { color: 0x222222,side: THREE.DoubleSide } );
	const mesh = new THREE.Mesh( geometry, material );
	return mesh;
}
function getCarFrontTexture(){
	const canvas = document.createElement("canvas");
	canvas.width = 24;
	canvas.height = 12;
	const context = canvas.getContext("2d");
	context.fillStyle = "#555555";
	context.fillRect(0,0,24,12);
	context.fillStyle = "#ffffff";
	context.fillRect(0,4,6,6);
	context.fillRect(18,4,6,6)
	return new THREE.CanvasTexture(canvas);
}
function getCarSideTexture(){
	const canvas = document.createElement("canvas");
	canvas.width = 30;
	canvas.height = 10;
	const context = canvas.getContext("2d");
	context.fillStyle = "#ffffff";
	context.fillRect(0,0,30,10);
	context.fillStyle = "#222222";
	context.fillRect(3,2,10,8);
	context.fillRect(16,2,10,8);
	return new THREE.CanvasTexture(canvas);
}
function getTruckFrontTexture(){
	const canvas = document.createElement("canvas");
	canvas.width = 24;
	canvas.height = 36;
	const context = canvas.getContext("2d");
	context.fillStyle = "#aaaaaa";
	context.fillRect(0,0,24,36);
	context.fillStyle = "#111111";
	context.fillRect(2,4,20,15);
	context.fillStyle = "#ffffff";
	context.fillRect(0,28,6,6);
	context.fillRect(18,28,6,6);
	return new THREE.CanvasTexture(canvas);
}
function getTruckSideTexture(){
	const canvas = document.createElement("canvas");
	canvas.width = 24;
	canvas.height = 36;
	const context = canvas.getContext("2d");
	context.fillStyle = "#aaaaaa";
	context.fillRect(0,0,24,36);
	context.fillStyle = "#111111";
	context.fillRect(14,4,10,15);
	return new THREE.CanvasTexture(canvas);
}
function getTruckSide2Texture(){
	const canvas = document.createElement("canvas");
	canvas.width = 24;
	canvas.height = 36;
	const context = canvas.getContext("2d");
	context.fillStyle = "#aaaaaa";
	context.fillRect(0,0,24,36);
	context.fillStyle = "#111111";
	context.fillRect(12,18,10,15);
	return new THREE.CanvasTexture(canvas);
}
function createTruckTrack(){
	const trackTexture = getTruckTrackTexture();
	const trackGeo = new THREE.BoxGeometry(1500,50,2);
	const trackMat = [new THREE.MeshLambertMaterial({color: 0xffffff}),
		new THREE.MeshLambertMaterial({color: 0x287dac}),
		new THREE.MeshLambertMaterial({color: 0x287dac}),
		new THREE.MeshLambertMaterial({color: 0x287dac}),
		new THREE.MeshLambertMaterial({map: trackTexture}),
		new THREE.MeshLambertMaterial({color: 0x287dac})];
	const truckTrack = new THREE.Mesh(trackGeo,trackMat); 
	truckTrack.receiveShadow = true;
	return truckTrack;
}
function getTruckTrackTexture(){
	const canvas = document.createElement("canvas");
	canvas.width = 1500;
	canvas.height = 50;
	const context = canvas.getContext("2d");
	context.fillStyle = "#287dac";
	context.fillRect(0,0,1500,50);
	context.fillStyle = "#ffffff";
	context.fillRect(733,0,2,50);
	context.fillRect(765,0,2,50);
	context.fillStyle = "#0a2d62";
	context.fillRect(735,0,30,50);
	context.strokeStyle = "#ffffff";
	context.setLineDash([10,14]);
	context.moveTo(750,0);
	context.lineTo(750,50);
	context.stroke();
	context.fillStyle = "#ffffff";
	context.fillRect(0,8,1500,2);
	context.fillRect(0,40,1500,2);
	context.fillStyle = "#0a2d62";
	context.fillRect(0,10,1500,30);
	context.lineWidth = 2;
	context.strokeStyle = "#ffffff";
	context.setLineDash([10,14]);
	context.moveTo(0,24);
	context.lineTo(1499,24);
	context.stroke();
	return new THREE.CanvasTexture(canvas);
}
function createSafeLane(){
	const safeLane = new THREE.Group();
	const laneTexture = getLaneTexture();
	const laneGeo = new THREE.BoxGeometry(1500,50,2);
	const laneMat = [new THREE.MeshLambertMaterial({color: 0xffffff}),
		new THREE.MeshLambertMaterial({color: 0x287dac}),
		new THREE.MeshLambertMaterial({color: 0x287dac}),
		new THREE.MeshLambertMaterial({color: 0x287dac}),
		new THREE.MeshLambertMaterial({map: laneTexture}),
		new THREE.MeshLambertMaterial({color: 0x287dac})];
	const safeLaneGround = new THREE.Mesh(laneGeo,laneMat);
	safeLaneGround.receiveShadow = true;
	safeLane.add(safeLaneGround);
	let trees = [];
	let reverse = 1;
	for(var i = 1; i < 7; i++){
		trees.push(createTree());
		trees[trees.length - 1].position.x = (reverse * (1 + Math.floor(Math.random() * 2)))* (i * 40);
		safeLane.add(trees[trees.length - 1]);
		reverse *= -1;
	}
	return safeLane;
}
function getLaneTexture(){
	const canvas = document.createElement("canvas");
	canvas.width = 1500;
	canvas.height = 50;
	const context = canvas.getContext("2d");
	context.fillStyle = "#348c31";
	context.fillRect(0,0,1500,50);
	context.fillStyle = "#ffffff";
	context.fillRect(733,0,2,50);
	context.fillRect(765,0,2,50);
	context.fillStyle = "#0a2d62";
	context.fillRect(735,0,30,50);
	context.strokeStyle = "#ffffff";
	context.setLineDash([10,14]);
	context.moveTo(750,0);
	context.lineTo(750,50);
	context.stroke();
	return new THREE.CanvasTexture(canvas);
}
function createTree(){
	const tree = new THREE.Group();
	const trunkGeo = new THREE.CylinderGeometry(6,6,30,7);
	const trunkMat = new THREE.MeshLambertMaterial({color: 0xa06040});
	const trunk = new THREE.Mesh(trunkGeo,trunkMat);
	trunk.rotation.x += Math.PI / 2;
	trunk.position.z += 20;
	trunk.castShadow = true;
	tree.add(trunk);
	const leavesGeo = new THREE.ConeGeometry(20, 45, 15);
	const leavesMat = new THREE.MeshLambertMaterial( {color: 0x228b22} );
	const leaves = new THREE.Mesh( leavesGeo,leavesMat);
	leaves.position.z = 60;
	leaves.rotation.x += Math.PI / 2;
	leaves.rotation.y += Math.PI / 4;
	leaves.castShadow = true;
	tree.add(leaves);
	
	return tree;
}
function createHouseLane(){
	const houseLane = new THREE.Group();
	
	const laneTexture = getHouseLaneTexture();
	const laneGeo = new THREE.BoxGeometry(1500,50,2);
	const laneMat = [new THREE.MeshLambertMaterial({color: 0xffffff}),
		new THREE.MeshLambertMaterial({color: 0x287dac}),
		new THREE.MeshLambertMaterial({color: 0x287dac}),
		new THREE.MeshLambertMaterial({color: 0x287dac}),
		new THREE.MeshLambertMaterial({map: laneTexture}),
		new THREE.MeshLambertMaterial({color: 0x287dac})];
	const lane = new THREE.Mesh(laneGeo,laneMat); 
	lane.receiveShadow = true;
	const houseGeo = new THREE.BoxGeometry(30,30,40);
	const houseMat = [new THREE.MeshLambertMaterial({color: 0xc51502}),
		new THREE.MeshLambertMaterial({color: 0xc51502}),
		new THREE.MeshLambertMaterial({color: 0xc51502}),
		new THREE.MeshLambertMaterial({color: 0xc51502}),
		new THREE.MeshLambertMaterial({color: 0xc51502}),
		new THREE.MeshLambertMaterial({color: 0xc51502})];
	const house = new THREE.Mesh(houseGeo,houseMat);
	house.position.z = 21;
	house.position.x = 50;
	house.castShadow = true;

	const roofGeo = new THREE.ConeGeometry(25, 30, 4);
	const roofMat = new THREE.MeshLambertMaterial( {color: 0x76190f} );
	const roof = new THREE.Mesh( roofGeo, roofMat );
	roof.position.z = 55;
	roof.position.x = 50
	roof.rotation.x += Math.PI / 2;
	roof.rotation.y += Math.PI / 4;
	roof.castShadow = true;
	houseLane.add(roof);
	houseLane.add(lane);
	houseLane.add(house);

	return houseLane;
}
function getHouseLaneTexture(){
	const canvas = document.createElement("canvas");
	canvas.width = 1500;
	canvas.height = 50;
	const context = canvas.getContext("2d");
	context.fillStyle = "#10820B";
	context.fillRect(0,0,1500,50);
	context.fillStyle = "#ffffff";
	context.fillRect(733,0,2,50);
	context.fillRect(765,0,2,50);
	context.fillStyle = "#0a2d62";
	context.fillRect(735,0,30,50);
	context.strokeStyle = "#ffffff";
	context.setLineDash([10,14]);
	context.moveTo(750,0);
	context.lineTo(750,50);
	context.stroke()
	return new THREE.CanvasTexture(canvas);
}
function updateScore(){
	let score = document.getElementById("score");
	if(points < 1000){
		score.innerHTML = ("Distance : " + points + "meters");
	}else{
		let kiloMeter = points/1000;
		score.innerHTML = ("Distance : " + kiloMeter.toFixed(2) + "KiloMeters");
	}
}
function updateLives(){
	let leben = document.getElementById("lives");
	leben.innerHTML = ("Lives : " + lives);
}
function getScreenRatio(){
	return window.innerWidth/1920 * window.innerWidth/1080 * 1.5;
}
function gameOver(){
	let final_score = document.getElementById("Points");
	if(points < 1000){
		final_score.innerHTML = ("Final Score/Endstand : " + points + "meters");
		if(highScore < points){
			highScore = points;
			document.getElementById("highScore").innerHTML = "High Score : " + points + "meters";
		}
	}else{
		let kiloMeter = points/1000;
		final_score.innerHTML = ("Final Score/Endstand : " + kiloMeter.toFixed(2) + "KiloMeters");
		if(highScore < points){
			highScore = points;
			document.getElementById("highScore").innerHTML = "High Score : " + kiloMeter.toFixed(2) + "KiloMeters";
		}
	}
	end_Game.style.display = "block";
}
