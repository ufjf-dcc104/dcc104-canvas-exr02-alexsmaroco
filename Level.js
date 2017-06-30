function Level (){
  this.sprites = [];
  this.shots = [];
  this.inimigos = 1;
  this.enemyshots = []
  this.cooldownSpawn = 4
  this.placar = 0
  this.fireInimigoCD = 1;
}

Level.prototype.init = function () {
  for (var i = 0; i < this.inimigos; i++) {
    var inimigo = new Sprite();
    inimigo.x = 120+50*i;
    inimigo.y = -40;
    inimigo.width = 32;
    inimigo.height = 32;
    inimigo.angle = 90
	inimigo.vx = 75-10*Math.random()
	inimigo.vy = 15
    inimigo.imgkey = "enemy";
	inimigo.cooldown = 3
    this.sprites.push(inimigo);
  }
};

Level.prototype.mover = function (nave,dt,w,h) {

    for (var i = this.sprites.length-1; i >=0 ; i--) {
      this.sprites[i].mover(dt);
	  this.sprites[i].cooldown-=dt;
  		if(this.sprites[i].x+this.sprites[i].width/2 > w) {
  			this.sprites[i].vx = -this.sprites[i].vx;
  			this.sprites[i].x = w-this.sprites[i].width/2;
  			//descer
  		} else if(this.sprites[i].x-this.sprites[i].width/2 < 0) {
        this.sprites[i].vx = -this.sprites[i].vx;
        this.sprites[i].x = this.sprites[i].width/2;
      }
      if(this.sprites[i].y > h) {
  		nave.hp-=15
        this.sprites.splice(i, 1);
  		}
    }
    for (var i = this.shots.length-1;i>=0; i--) {
      this.shots[i].mover(dt);
      if(
        this.shots[i].x >  3000 ||
        this.shots[i].x < -3000 ||
        this.shots[i].y >  3000 ||
        this.shots[i].y < -3000
      ){
        this.shots.splice(i, 1);
      }
    }

	for (var i = this.enemyshots.length-1;i>=0; i--) {
      this.enemyshots[i].mover(dt);
      if(
        this.enemyshots[i].x >  3000 ||
        this.enemyshots[i].x < -3000 ||
        this.enemyshots[i].y >  3000 ||
        this.enemyshots[i].y < -3000
      ){
        this.enemyshots.splice(i, 1);
      }
    }
};

Level.prototype.moverAng = function (dt) {
    for (var i = 0; i < this.sprites.length; i++) {
      this.sprites[i].moverAng(dt);
    }
    for (var i = this.shots.length-1; i >= 0; i--) {
      this.shots[i].moverAng(dt);
      if(
        this.shots[i].x >  3000 ||
        this.shots[i].x < -3000 ||
        this.shots[i].y >  3000 ||
        this.shots[i].y < -3000
      ){
        this.shots.splice(i, 1);
      }
    }
};


Level.prototype.desenhar = function (ctx) {
    for (var i = 0; i < this.sprites.length; i++) {
      this.sprites[i].desenhar(ctx);
    }
    for (var i = 0; i < this.shots.length; i++) {
      this.shots[i].desenhar(ctx);
    }
};
Level.prototype.desenharImg = function (ctx) {
    for (var i = 0; i < this.sprites.length; i++) {
      this.sprites[i].desenharImg(ctx, this.imageLib.images[this.sprites[i].imgkey]);
    }
    for (var i = 0; i < this.shots.length; i++) {
      this.shots[i].desenharImg(ctx, this.imageLib.images[this.shots[i].imgkey]);
    }
	for (var i = 0; i < this.enemyshots.length; i++) {
      this.enemyshots[i].desenharImg(ctx, this.imageLib.images[this.enemyshots[i].imgkey]);
    }
};

Level.prototype.colidiuCom = function (alvo, resolveColisao) {
    for (var i = 0; i < this.sprites.length; i++) {
      if(this.sprites[i].colidiuCom(alvo)){
        resolveColisao(this.sprites[i], alvo);
      }
    }
};

Level.prototype.colidiuComTirosInimigos = function (alvo) {
    for(var i = this.enemyshots.length-1; i>=0; i--){
		if(alvo.colidiuCom(this.enemyshots[i])) {
			alvo.hp-=10*this.dif;
			this.enemyshots.splice(i, 1);
		}
  }
};




Level.prototype.fireInimigo = function(dt) {
	this.fireInimigoCD-=dt;
	if(this.fireInimigoCD > 0) return
	var inimigo = Math.floor(Math.random() * this.sprites.length)
	if(this.sprites[inimigo].cooldown > 0) {
		return
	}
	var tiro = new Sprite();
	tiro.x = this.sprites[inimigo].x;
	tiro.y = this.sprites[inimigo].y;
	tiro.angle = this.sprites[inimigo].angle;
	tiro.ay = 50;
	tiro.width = 8;
	tiro.height = 16;
	tiro.imgkey = "shot";
	this.enemyshots.push(tiro);
	this.sprites[inimigo].cooldown = 3/this.dif;
	this.fireInimigoCD = 1;
}

Level.prototype.fire = function (alvo, al, key, vol){
  if(alvo.cooldown>0) return;
  var tiro = new Sprite();
  tiro.x = alvo.x;
  tiro.y = alvo.y;
  tiro.angle = alvo.angle;
  tiro.ay = -50
  tiro.width = 8;
  tiro.height = 16;
  tiro.imgkey = "shot";
  this.shots.push(tiro);
  alvo.cooldown = 1;
  if(al && key) {
    al.play(key, vol)
  }
}

Level.prototype.colidiuComTiros = function(al, key){
  for(var i = this.shots.length-1; i>=0; i--){

    this.colidiuCom(this.shots[i],
      (
        function(that)
        {
          return function(alvo){
            al.play(key, 0.4)
            alvo.color = "green";
            that.shots.splice(i,1);
            x = that.sprites.indexOf(alvo);
            that.sprites.splice(x, 1);
            that.placar += 1
          }
        }
      )(this));
  }
}


Level.prototype.spawnInimigos = function(dt) {
  if(this.cooldownSpawn > 0 || this.sprites.length > 4) {
    this.cooldownSpawn -= dt
    return
  }
  //for (var i = 0; i < 3; i++) {
    var inimigo = new Sprite();
    inimigo.x = 32+300*Math.random();
    inimigo.y = -40;
    inimigo.width = 32;
    inimigo.height = 32;
    inimigo.angle = 90
    inimigo.vx = (75-25*Math.random())+10*this.dif;
    inimigo.vy = 25-15*Math.random();
    inimigo.imgkey = "enemy";
    inimigo.cooldown = 3/this.dif;
    this.sprites.push(inimigo);
	if(this.sprites.length < 4) { // nao reseta o spawn se estiver com poucos inimigos, so evita que nasçam 2 juntos
		this.cooldownSpawn += 2
	}
    else this.cooldownSpawn = 4/this.dif;
  //}
  //this.inimigos++
}

Level.prototype.desenharInfo = function(ctx, nave) {
	ctx.fillStyle = "green"
	ctx.fillText("HP: ", 180,10)
	if(nave.hp < 40) {
		ctx.fillStyle = "red"
	}
    ctx.fillRect(220,1,nave.hp+2,10)
	ctx.fillStyle = "white"
	ctx.fillText("Placar: " + this.placar, 340,10)
}

