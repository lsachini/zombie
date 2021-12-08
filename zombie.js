var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 480;

var SCENARY_HEIGHT = 800;
var SCENARY_WIDTH = 1280;

var PLAYGROUND_WIDTH = 640;
var PLAYGROUND_HEIGHT = 400;

var PLAYER_HEIGHT = 51;
var PLAYER_WIDTH = 33;

var ZOMBIE_HEIGHT = 56;
var ZOMBIE_WIDTH = 51;

var PLAYER_OFFSET = 5;
var ZOMBIE_OFFSET = 3;
var REFRESH_KEYBOARD = 40;

var thinlib;
var mainCallback;
var player;
var zombie;

var shootTime = true;
var shootLoad = true;

var DebugFPScnt=0;
var DebugFPS=0;

var directions = { UP:         0,
                   RIGHT:      1, 
                   DOWN:       2, 
                   LEFT:       3, 
                   UP_RIGHT:   4, 
                   UP_LEFT:    5, 
                   DOWN_RIGHT: 6, 
                   DOWN_LEFT:  7 };

function fpsloop()
{
 DebugFPS=DebugFPScnt;
 document.getElementById('fps').innerHTML = DebugFPS.toString();
 DebugFPScnt=0;
 window.setTimeout("fpsloop()",1000);
}

function load() {
    var oPanel = document.getElementById('panel');	
	
    thinlib = new ThinLib(oPanel, SCREEN_WIDTH, SCREEN_HEIGHT);	

    var stage1bgPrm = { id: 'stage1bg',
                        height: 400,
                        width: thinlib.getWidth(),
                        image: 'stage1bg.png' };

    stage1bg = thinlib.addSprite(stage1bgPrm);

    var playerPrm = { image: 'player_up.png',
                      name: 'player',
                      width: PLAYER_WIDTH,
                      height: PLAYER_HEIGHT,
                      frames: 1,
                      left: 50,
                      top: 50 };
	
    player = thinlib.newAnimation(playerPrm);	
    player.direction = directions.UP;
    player.stop = true;
 	
    thinlib.addElement(player, stage1bg);

    var zombiePrm = { image: 'zombie.png',
                      name: 'zombie',
                      width: ZOMBIE_WIDTH,
                      height: ZOMBIE_HEIGHT,
                      frames: 1,
                      left: 550,
                      top: 300 };
	
    zombie = thinlib.newAnimation(zombiePrm);	
    zombie.direction = directions.UP;

    thinlib.addElement(zombie, stage1bg);

    var wallsLength = stage1.walls.length;
    for( var i = 0; i < wallsLength; i++ )
    {
        var wallPrm = { name: 'wall',
                        width: stage1.walls[ i ].offsetWidth,
                        height: stage1.walls[ i ].offsetHeight,
                        top: stage1.walls[ i ].offsetTop,
                        left: stage1.walls[ i ].offsetLeft, 
                        frames: 1 };   

        var wall  = thinlib.newAnimation(wallPrm);	
     	
        thinlib.addElement(wall, stage1bg);
    }
	
    thinlib.captureKeys();	

    mainCallback = thinlib.setCallback(function () { main(); }, REFRESH_KEYBOARD);	
    setTimeout(function() { fpsloop() }, 1000);
}

function main()
{
    var left = 37;       
    var right = 39;      
    var up = 38;
    var down = 40;

    var shoot = 32;

    var oPanel = document.getElementById('panel');

    if (thinlib.isPressed(up) && thinlib.isPressed(right)) {
        var offset = calculateOffset(PLAYER_OFFSET);
        movePlayer(offset, -offset, directions.UP_RIGHT);   
    }
    else if (thinlib.isPressed(up) && thinlib.isPressed(left)) {
        var offset = calculateOffset(PLAYER_OFFSET);
        movePlayer(-offset, -offset, directions.UP_LEFT);   
    } 
    else if (thinlib.isPressed(down) && thinlib.isPressed(right)) {
        var offset = calculateOffset(PLAYER_OFFSET);
        positions = movePlayer(offset, offset, directions.DOWN_RIGHT); 
    }
    else if (thinlib.isPressed(down) && thinlib.isPressed(left)) {
        var offset = calculateOffset(PLAYER_OFFSET);
        movePlayer(-offset, offset, directions.DOWN_LEFT);   
    }
    else if (thinlib.isPressed(left)) { 
        movePlayer(-PLAYER_OFFSET, 0, directions.LEFT);   
    }
    else if (thinlib.isPressed(right)) { 
        movePlayer(PLAYER_OFFSET, 0, directions.RIGHT);   
    }
    else if (thinlib.isPressed(down)) { 
        movePlayer(0, PLAYER_OFFSET, directions.DOWN);   
    }
    else if (thinlib.isPressed(up)) { 
        movePlayer(0, -PLAYER_OFFSET, directions.UP);   
    }
    else {
        var playerPrm = { image: 'player_up.png', 
                          width: PLAYER_WIDTH,
                          height: PLAYER_HEIGHT,
                          frames: 1,
                          left: player.getDOM().offsetLeft,
                          top: player.getDOM().offsetTop };

        player.setAnimation(playerPrm); 

        player.stop = true;
    }

    if (thinlib.isPressed(shoot))
    {    moveZombie();
        if(shootTime && shootLoad) {
            shootTime = false;
            shootLoad = false;
            var playerDOM = player.getDOM();

            var bulletPrm = { name: 'bullet',
                              image: 'bullet.png',
                              width: 15,
                              height: 6,
                              frames: 1,
                              top: playerDOM.offsetTop,
                              left: playerDOM.offsetLeft };    

            var bullet  = thinlib.newAnimation(bulletPrm);	

            switch(player.direction) {
                case directions.UP:
                    bullet.rotate(-90);
                    break;
                case directions.UP_RIGHT:
                    bullet.rotate(-45);
                    break;
                case directions.UP_LEFT:
                    bullet.rotate(-135);
                    break;
                case directions.DOWN:
                    bullet.rotate(90);
                    break;
                case directions.DOWN_RIGHT:
                    bullet.rotate(45);
                    break;
                case directions.DOWN_LEFT:
                    bullet.rotate(135);
                    break;
                case directions.LEFT:
                    bullet.rotate(180);
                    break;
                case directions.RIGHT:
                    bullet.rotate(0);
                    break;
            }
         	
            var bulletDOM = bullet.getDOM();    
            var direction = player.direction;

            bulletDOM.direction = direction;

            thinlib.addElement(bullet, stage1bg);

            setTimeout(function() { shootTime = true; }, 300);
        }
    }
    else {
        shootLoad = true;
    }

    moveZombie();

    var bulletList = document.getElementsByName('bullet');
    var bullets = bulletList.length;
    for(var i = 0; i < bullets; i++) {
        var bullet = bulletList[i];
        moveBullet(bullet);
    }

    DebugFPScnt++;
}   

function moveZombie() {
    var zombieDOM = zombie.getDOM();
    var playerDOM = player.getDOM();

    var side1 = zombieDOM.offsetLeft - playerDOM.offsetLeft;
    var side2 = zombieDOM.offsetTop - playerDOM.offsetTop;
    
    var signal1 = side1 < 0 ? 1 : -1;
    var signal2 = side2 < 0 ? 1 : -1;

    var tang = Math.abs(side1) / Math.abs(side2);

    var radians = Math.atan(tang);

    if(signal2 > 0 && signal1 > 0) {
        zombie.rotate(180-(radians * 180 / Math.PI));
    }
    else if(signal1 > 0) {
        zombie.rotate((radians * 180 / Math.PI));
    }
    else if(signal2 > 0) {
        zombie.rotate(180+(radians * 180 / Math.PI));
    }
    else {
        zombie.rotate(-(radians * 180 / Math.PI));
    }

    side1 = Math.round(Math.sin(radians) * ZOMBIE_OFFSET);
    side2 = Math.round(Math.cos(radians) * ZOMBIE_OFFSET);

    var zombieList = new Array();
    var zombieFake = { offsetLeft: zombieDOM.offsetLeft + signal1 * side1,
                       offsetTop: zombieDOM.offsetTop,
                       offsetWidth: zombieDOM.offsetWidth,
                       offsetHeight: zombieDOM.offsetHeight };
    zombieList[0] = zombieFake;

    if( thinlib.collision( zombieList, stage1.walls ) ) {
        side1 = 0;
    }

    zombieFake.offsetLeft = zombieDOM.offsetLeft;
    zombieFake.offsetTop = zombieDOM.offsetTop + signal2 * side2;
    if( thinlib.collision( zombieList, stage1.walls ) ) {
        side2 = 0;
    }

    if(side1 == 0 && side2 == 0) {
        zombieFake.offsetLeft = zombieDOM.offsetLeft;
        zombieFake.offsetTop = zombieDOM.offsetTop + signal2 * -1 * ZOMBIE_OFFSET;
        if( thinlib.collision( zombieList, stage1.walls ) ) {
            zombieFake.offsetLeft = zombieDOM.offsetLeft + signal1 * -1 * ZOMBIE_OFFSET;
            zombieFake.offsetTop = zombieDOM.offsetTop;
            if( thinlib.collision( zombieList, stage1.walls ) ) {
                return;
            }    
            zombieDOM.style.left = (zombieDOM.offsetLeft + signal1 * -1 * ZOMBIE_OFFSET) + 'px'; 
        }
        else {
            zombieDOM.style.top = (zombieDOM.offsetTop + signal2 * -1 * ZOMBIE_OFFSET) + 'px';
        }
    }
    else {
        zombieDOM.style.left = (zombieDOM.offsetLeft + signal1 * side1) + 'px';
        zombieDOM.style.top = (zombieDOM.offsetTop + signal2 * side2) + 'px';
    }
}

function moveBullet(bullet) {
    var left = bullet.offsetLeft;
    var top = bullet.offsetTop;

    var offset = 15;

    switch(bullet.direction) {
        case directions.LEFT:
            left -= offset;
            break;
        case directions.RIGHT:
            left += offset;
            break;
        case directions.UP:
            top -= offset;
            break;
        case directions.DOWN:
            top += offset;
            break;
        case directions.UP_RIGHT:
            offset = calculateOffset(offset);
            left += offset;
            top -= offset;
            break;
        case directions.DOWN_RIGHT:
            offset = calculateOffset(offset);
            left += offset;
            top += offset;
            break;
        case directions.UP_LEFT:
            offset = calculateOffset(offset);
            left -= offset;
            top -= offset;
            break;
        case directions.DOWN_LEFT:
            offset = calculateOffset(offset);
            left -= offset;
            top += offset;
            break;
    }

    var bulletFake = { offsetLeft: left, 
                       offsetTop: top,
                       offsetWidth: bullet.offsetWidth,
                       offsetHeight: bullet.offsetHeight };

    var bulletList = new Array();
    bulletList[0] = bulletFake;

    var zombieList = new Array();
    zombieList[0] = zombie.getDOM();

    if( thinlib.collision( bulletList, stage1.walls ) ||
        thinlib.collision( bulletList, zombieList )) {
        bullet.parentNode.removeChild(bullet);
        bullet = null;

        return false;
    }

    bullet.style.left = left + 'px';
    bullet.style.top = top + 'px';

    if(top < 0 || top > stage1bg.offsetHeight || left < 0 || left > stage1bg.offsetWidth) {
        bullet.parentNode.removeChild(bullet);
        bullet = null;

        return false;
    }
}   

function calculateOffset(hypotenuse) {
    var radians = 45 * ( Math.PI / 180 );

    return Math.round(Math.sin(radians) * hypotenuse);
}

function movePlayer(offsetLeft, offsetTop, direction) {
    var p = { offsetLeft: player.getDOM().offsetLeft,
              offsetTop: player.getDOM().offsetTop,
              offsetWidth: player.getDOM().offsetWidth,
              offsetHeight: player.getDOM().offsetHeight };

    var playerList = new Array();
    playerList[ 0 ] = p;

    var nextLeft = player.getDOM().offsetLeft + offsetLeft;   

    if (nextLeft < 0) {
        nextLeft = 0;
    }
    else if (nextLeft > (stage1bg.offsetWidth - PLAYER_WIDTH)) {
        nextLeft = (stage1bg.offsetWidth - PLAYER_WIDTH);
    }

    p.offsetLeft = nextLeft;

    var nextTop = player.getDOM().offsetTop + offsetTop; 

    if (nextTop < 0) {
        nextTop = 0;
    }
    else if (nextTop > (stage1bg.offsetHeight - PLAYER_HEIGHT)) {
        nextTop = (stage1bg.offsetHeight - PLAYER_HEIGHT);
    }

    p.offsetTop = nextTop;

    var scenaryLeft = parseInt(stage1bg.style.backgroundPosition.split(' ')[0].replace('px', ''), 10);
    var scenaryTop = parseInt(stage1bg.style.backgroundPosition.split(' ')[1].replace('px', ''), 10);

    var auxScenaryLeft = scenaryLeft;
    var auxScenaryTop = scenaryTop;

    if( thinlib.collision( playerList, stage1.walls ) ) {
        return;
    }

    var movePlayerTop = true;
    var movePlayerLeft = true;
    var moveScenaryTop = false;
    var moveScenaryLeft = false;

    if(((direction == directions.UP || direction == directions.UP_LEFT || direction == directions.UP_RIGHT) && 
        (scenaryTop < 0) && 
        (nextTop <= (PLAYGROUND_HEIGHT / 2))) ||
       ((direction == directions.DOWN || direction == directions.DOWN_LEFT || direction == directions.DOWN_RIGHT) && 
        (scenaryTop > (PLAYGROUND_HEIGHT - SCENARY_HEIGHT)) && 
        (nextTop >= (PLAYGROUND_HEIGHT / 2)))) {

       scenaryTop -= offsetTop;

       if(scenaryTop <= (PLAYGROUND_HEIGHT - SCENARY_HEIGHT)) {
           scenaryTop = PLAYGROUND_HEIGHT - SCENARY_HEIGHT;
           moveScenaryTop = true;
       }
       else if(scenaryTop >= 0) {
           scenaryTop = 0;
           moveScenaryTop = true;
       }
       else if(scenaryTop < 0 && scenaryTop > (PLAYGROUND_HEIGHT - SCENARY_HEIGHT)) {
           moveScenaryTop = true;
           movePlayerTop = false;
        }
    }

    if(((direction == directions.LEFT || direction == directions.DOWN_LEFT || direction == directions.UP_LEFT) && 
        (scenaryLeft < 0) && 
        (nextLeft <= (PLAYGROUND_WIDTH / 2))) ||
       ((direction == directions.RIGHT || direction == directions.DOWN_RIGHT || direction == directions.UP_RIGHT) && 
        (scenaryLeft > (PLAYGROUND_WIDTH - SCENARY_WIDTH)) && 
        (nextLeft >= (PLAYGROUND_WIDTH / 2)))) {

        scenaryLeft -= offsetLeft;

        if(scenaryLeft <= (PLAYGROUND_WIDTH - SCENARY_WIDTH)) {
            scenaryLeft = PLAYGROUND_WIDTH - SCENARY_WIDTH;
            moveScenaryLeft = true;
        }
        else if(scenaryLeft >= 0) {
            scenaryLeft = 0;
            moveScenaryLeft = true;
        }
        else if(scenaryLeft < 0 && scenaryLeft > (PLAYGROUND_WIDTH - SCENARY_WIDTH)) {
            moveScenaryLeft = true;

            movePlayerLeft = false;
        }
    }

    var playerPrm = { image: 'player_move_up.png', 
                      width: PLAYER_WIDTH,
                      height: PLAYER_HEIGHT,
                      frames: 3,
                      refresh: 100,
                      vertical: false };

    if(movePlayerLeft) {
        player.getDOM().style.left = nextLeft + 'px';
    }
    if(movePlayerTop) {
        player.getDOM().style.top = nextTop + 'px';
    }

    if(player.direction != direction || player.stop) {
        playerPrm.left = player.getDOM().offsetLeft;
        playerPrm.top = player.getDOM().offsetTop;

        player.setAnimation(playerPrm);

        var rotation = 0;

        switch(direction) {
            case directions.UP:
                rotation = 0;
                break;
            case directions.UP_RIGHT:
                rotation = 45;
                break;
            case directions.UP_LEFT:
                rotation = -45;
                break;
            case directions.DOWN:
                rotation = 180;
                break;
            case directions.DOWN_RIGHT:
                rotation = 135;
                break;
            case directions.DOWN_LEFT:
                rotation = -135;
                break;
            case directions.RIGHT:
                rotation = 90;
                break;
            case directions.LEFT:
                rotation = -90;
                break;
        }
        player.rotate(rotation);
    }

    player.direction = direction;
    player.stop = false;

    if(moveScenaryTop || moveScenaryLeft) {
        stage1bg.style.backgroundPosition = scenaryLeft + 'px ' + scenaryTop + 'px';

        var len = stage1.walls.length;
        for(var i = 0; i < len; i++) {
            if(moveScenaryLeft)
                stage1.walls[i].offsetLeft = stage1.walls[i].offsetLeft + (scenaryLeft - auxScenaryLeft);

            if(moveScenaryTop)
                stage1.walls[i].offsetTop = stage1.walls[i].offsetTop + (scenaryTop - auxScenaryTop);
        }

        var bullets = document.getElementsByName('bullet');
        len = bullets.length;

        for(var i = 0; i < len; i++) {
            if(moveScenaryLeft)
                bullets[i].style.left = (bullets[i].offsetLeft + (scenaryLeft - auxScenaryLeft)) + 'px';

            if(moveScenaryTop)
                bullets[i].style.top = (bullets[i].offsetTop + (scenaryTop - auxScenaryTop)) + 'px';            
        }
    
        var zombieDOM = zombie.getDOM();

        if(moveScenaryLeft)
            zombieDOM.style.left = (zombieDOM.offsetLeft + (scenaryLeft - auxScenaryLeft)) + 'px';

        if(moveScenaryTop)
            zombieDOM.style.top = (zombieDOM.offsetTop + (scenaryTop - auxScenaryTop)) + 'px';
    }
}

window.addEventListener('load', load, false);
