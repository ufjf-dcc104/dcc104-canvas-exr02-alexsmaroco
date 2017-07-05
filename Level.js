function Level (){
  this.sprites = [];
  this.shots = [];
  this.inimigos = 1;
  this.enemyshots = []
  this.cooldownSpawn = 4
  this.placar = 0
  this.fireInimigoCD = 1;
  this.bossCountdown = 10;
  this.boss = null;
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
	if(this.boss != null) {
		if(this.boss.y <= (h/5)) {
			this.boss.vy = 10;
		} else {
			this.boss.vy = 0;
		}
		this.boss.mover(dt);
		
		if(this.boss.x+this.boss.width/2 > w) {
			this.boss.vx = -this.boss.vx;
			this.boss.x = w-this.boss.width/2;
		} else if(this.boss.x < this.boss.width/2) {
			this.boss.vx = -this.boss.vx;
			this.boss.x = this.boss.width/2;
		}
	}
	
    for (var i = this.sprites.length-1; i >=0 ; i--) {
      this.sprites[i].mover(dt);
	  this.sprites[i].cooldown-=dt;
  		if(this.sprites[i].x+this.sprites[i].width/2 > w) {
  			this.sprites[i].vx = -this.sprites[i].vx;
  			this.sprites[i].x = w-this.sprites[i].width/2;
  			//descer
  		} else if(this.sprites[i].x < this.sprites[i].width/2) {
        this.sprites[i].vx = -this.sprites[i].vx;
        this.sprites[i].x = this.sprites[i].width/2;
      }
      if(this.sprites[i].y > h-100-this.sprites[i].height/2) {
		this.sprites[i].vy= -this.sprites[i].vy;
		this.sprites[i].y = h - 100 - this.sprites[i].height/2;
		this.sprites[i].virar = true;
	  } else if(this.sprites[i].y < this.sprites[i].height/2 && this.sprites[i].virar) {
		this.sprites[i].vy= -this.sprites[i].vy;
		this.sprites[i].y = this.sprites[i].height/2;
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
      this.enemyshots[i].moverAng(dt);
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
	if(this.boss != null) {
		this.boss.desenharImg(ctx, this.imageLib.images[this.boss.imgkey]);
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

Level.prototype.spawnBoss = function(dt,w,h) {
	this.bossCountdown-=this.dif*dt;
	if(this.bossCountdown < 0) {
		if(this.boss != null) {
			return ; // nao matou o boss antes do prox spawn, gameover
		}
		this.boss = new Sprite();
		this.boss.width = 128;
		this.boss.height = 128;
		this.boss.x = w/2;
		this.boss.y = -this.boss.height/2;
		this.boss.angle = 90
		this.boss.vx = (75-25*Math.random())+10*this.dif;
		this.boss.vy = 5;
		this.boss.imgkey = "boss";
		this.boss.cooldown = 2/this.dif;
		this.boss.hp = 200*dif/2;
		this.bossCountdown= 60;
	}
};


Level.prototype.fireInimigo = function(dt) {
	this.fireInimigoCD-=dt;
	if(this.fireInimigoCD > 0) return
	var inimigo = Math.floor(Math.random() * this.sprites.length)
	if(this.sprites[inimigo].cooldown > 0) {
		return
	}
	if(this.boss != null) {
		var tiro1 = new Sprite();
		tiro1.x = this.boss.x-this.boss.vx/4;
		tiro1.y = this.boss.y+60;
		tiro1.angle = this.boss.angle-Math.random()*20;
		tiro1.am = 80;
		tiro1.width = 8;
		tiro1.height = 16;
		tiro1.imgkey = "shot";
		this.enemyshots.push(tiro1);
		var tiro2 = new Sprite();
		tiro2.x = this.boss.x+this.boss.vx/4;
		tiro2.y = this.boss.y+60;
		tiro2.angle = this.boss.angle+Math.random()*20;
		tiro2.am = 80;
		tiro2.width = 8;
		tiro2.height = 16;
		tiro2.imgkey = "shot";
		this.enemyshots.push(tiro2);
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
	if(this.boss != null) {
		this.sprites[inimigo].cooldown = 2/this.dif;
	} else {
		this.sprites[inimigo].cooldown = 3/this.dif;
	}
	this.fireInimigoCD = 2/this.dif;
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
	  
	if(this.boss != null && this.boss.colidiuCom(this.shots[i])) {
		this.boss.hp-=10;
		this.shots.splice(i,1);
		if(this.boss.hp <=0) {
			this.al.play("explosao",0.5);
			this.boss = null;
			this.placar+=10;
		}
	}
  }
}


Level.prototype.spawnInimigos = function(dt) {
	var max = 4*this.dif;
	if(this.boss != null) {
		max+=2*this.dif;;
	}
  if(this.cooldownSpawn > 0 || this.sprites.length > max) {
    this.cooldownSpawn -= dt
    return
  }
    var inimigo = new Sprite();
    inimigo.x = 32+300*Math.random();
    inimigo.y = -40;
    inimigo.width = 32;
    inimigo.height = 32;
    inimigo.angle = 90;
    inimigo.vx = (75-25*Math.random())+10*this.dif;
    inimigo.vy = 25-15*Math.random();
    inimigo.imgkey = "enemy";
    inimigo.cooldown = 3/this.dif;
	inimigo.virar = false; // so para manter inimigo na tela
    this.sprites.push(inimigo);
	if(this.sprites.length < max) { // nao reseta o spawn se estiver com poucos inimigos, so evita que nasçam 2 juntos
		this.cooldownSpawn += 2/this.dif;
	}
    else this.cooldownSpawn = 5/this.dif;
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

