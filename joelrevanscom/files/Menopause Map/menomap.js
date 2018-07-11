//THIS IS A BIG FAT HACK.  FIXES ISSUE WITH CHROME RENDERING HIT-TARGETS INCORRECTLY.
//CHROME HANDLES TRANSLATE INCORRECTLY.
document.body.addEventListener('touchstart', function(){}, {passive:true});

(function MapManager(){

    var dampingFactor = 20;
    var springRate = 200;
    var parallaxFactor = .5;
    var pageContent = document.getElementById("PageContent");
    var AppHeader = document.getElementById("AppHeader");
    var MapBackground = document.getElementById("MapBackground");
    var MapContainer = document.getElementById("MapContainer");
    var tilesContainer = document.getElementById("Tiles");
    var BackgroundSidebarToggle = document.getElementById("BackgroundSidebarToggle");
    var Sidebar = document.getElementById("Sidebar");
    var SymptomList = document.getElementById("SymptomList");
    var SidebarArticles = document.querySelectorAll("#Sidebar article");
    var tileManagers = new Array();
    var grayColor = "#C8BCC6";

    for(var i = 0; i < questions.length; ++i){
        var tilesrc =
        `<li data-tileid="${questions[i].id}" data-yes="${questions[i].yes}" data-no="${questions[i].no}">
            <div class="question">
                ${questions[i].question}
            </div>
            <div class="noyes">
                <div class="no">&nbsp;NO</div>
                <div class="yes">YES</div>
            </div>
            <div class="cardBottom">
              Menopause Map
            </div>
        </li>`;

        tilesContainer.insertAdjacentHTML('beforeend', tilesrc);
    }

    var tiles = document.querySelectorAll("#Tiles > li");
    for(var i = 0; i < tiles.length; ++i){
        var yesId = tiles[i].getAttribute("data-yes");
        var noId = tiles[i].getAttribute("data-no");

        var yesTile = document.querySelector(`#Tiles [data-tileid='${yesId}']`);
        var noTile = document.querySelector(`#Tiles [data-tileid='${noId}']`);

        tileManagers[i] = new TileManager(tiles[i], 1, springRate, 20, yesTile, noTile);
    }

    var firstTile = document.querySelector("[data-tileid='0']");
    firstTile.style.display = "inline-block";
    var firstManager = GetTileManager(firstTile);
    firstManager.init();
    firstManager.UpdateMargins();
    firstManager.hideWhileInactive = false;

    function TileManager(target, mass, spring, damping, yesTile, noTile){
        var frameId = null;

        var velocity = {x:0, y:0};
        this.anchor = {x:0,y:0};
        this.position = {x:0,y:0};
        this.target = target;
        if(target.hasAttribute("data-color")){
          this.color = target.getAttribute("data-color");
        }

        var touchStartedTime = null;
        var lastTouch = null;
        var firstTouch = null;

        var noyesContainer = this.target.querySelector(".noyes");
        var yesButton = this.target.querySelector(".yes");
        var noButton = this.target.querySelector(".no");
        var downarrow = this.target.querySelector(".downarrow");
        var centercolumn = this.target.querySelector(".centercolumn");
        var columns = this.target.querySelector(".columns");
        var undercard = this.target.querySelector(".undercard");
        var articleLabels = this.target.querySelectorAll("label[for]");

        this.hideWhileInactive = true;

        this.init = () => {
            requestAnimationFrame(RenderPosition);
            frameId = requestAnimationFrame(Physics);

            this.target.addEventListener("touchstart", TouchStart);
            window.addEventListener("resize", this.UpdateMargins);

            if(yesButton != null)
            {
              yesButton.addEventListener("click", AnswerYes);
            }

            if(noButton != null){
              noButton.addEventListener("click", AnswerNo);
            }

            if(this.target.classList.contains("finalcard")){
              downarrow.addEventListener("click", ToggleCollapse);
            }
        }

        var TouchStart = (evt) =>{
            firstTouch = lastTouch = GetAverageTouchPoint(evt.changedTouches);
            touchStartedTime = new Date().getTime();

            this.target.removeEventListener("touchstart", TouchStart);
            this.target.addEventListener("touchmove", TouchMove);
            this.target.addEventListener("touchend", TouchEnd);
            cancelAnimationFrame(frameId);
            frameId = null;
        };

        var TouchMove = (evt) =>{
            var thisTouch = GetAverageTouchPoint(evt.changedTouches);

            var dy = thisTouch.y - lastTouch.y;
            var dx = thisTouch.x - lastTouch.x;

            if(this.target.classList.contains("finalcard")){
              if(evt.target.closest(".centercolumn") == centercolumn){
                if(centercolumn.scrollTop == 0 && dy > 0 && dy > 5 * Math.abs(dx)){
                  this.position.y += dy;
                }else if(Math.abs(dx) > 5 * Math.abs(dy)){
                  this.position.x += dx;
                  MapPosition.x += dx * parallaxFactor;
                }
              }else{
                this.position.y += dy;
                this.position.x += dx;
                MapPosition.x += dx * parallaxFactor;
              }
              this.position.y = Math.max(this.position.y, 0);
            }else{
              this.position.y += dy;
              this.position.x += dx;
              MapPosition.x += dx * parallaxFactor;
            }

            //MapPosition.y += dy * parallaxFactor;

            requestAnimationFrame(RenderPosition);

            lastTouch = thisTouch;
        };

        var TouchEnd = (evt) =>{
            lastTouch = GetAverageTouchPoint(evt.changedTouches);
            var touchDistance = Math.sqrt(Math.pow(lastTouch.y - firstTouch.y, 2) + Math.pow(lastTouch.x - firstTouch.x, 2));
            var touchTime = new Date().getTime() - touchStartedTime;
            var touchAngle = Math.atan2(firstTouch.y - lastTouch.y, lastTouch.x - firstTouch.x);  //invert the y
            touchAngle += (Math.PI * 2);
            touchAngle %= (Math.PI * 2);

            if(touchAngle >= Math.PI * 7 / 8 && touchAngle <= Math.PI * 9 / 8 && touchDistance > 100 && touchTime < 350 && (this.position.x - this.anchor.x) < -100 && noTile != null){
                Answer(false);
            }else if((touchAngle <= Math.PI / 8 || touchAngle >= Math.PI * 15 / 8) && touchDistance > 100 && touchTime < 350 && (this.position.x - this.anchor.x) > 100 && yesTile != null){
                Answer(true);
            }else{
                this.target.addEventListener("touchstart", TouchStart);
                frameId = requestAnimationFrame(Physics);
            }

            if(this.target.classList.contains("finalcard")){
              if(this.target.classList.contains("collapsed")){
                if(this.position.y < window.innerHeight * .5 && touchDistance > 100 && touchAngle >= Math.PI * 3 / 8 && touchAngle <= Math.PI * 5 / 8){
                  ToggleCollapse();
                }
              }else{
                if(this.position.y > window.innerHeight * .5 && touchDistance > 100 && touchAngle >= Math.PI * 11 / 8 && touchAngle <= Math.PI * 13 / 8){
                  ToggleCollapse();
                }
              }
            }

            this.target.removeEventListener("touchend", TouchEnd);
            this.target.removeEventListener("touchmove", TouchMove);
        };

        this.UpdateMargins = (evt) =>{
          if(this.target.classList.contains("finalcard") && window.innerWidth >= 1250){
            this.anchor = {x:Math.max(pageContent.clientWidth/20, (pageContent.clientWidth - target.offsetWidth - 200) / 2), y:0};
          }else{
            this.anchor = {x:Math.max(pageContent.clientWidth/20, (pageContent.clientWidth - target.offsetWidth) / 2), y:0};
          }

          if(this.target.classList.contains("collapsed")){
            if(window.innerWidth > 1250){
              this.target.classList.remove("collapsed");
            }
            if(window.innerWidth > 768){
              this.anchor.y = window.innerHeight - 70 - 90;
            }else{
              this.anchor.y = window.innerHeight - 50 - 90;
            }
          }else{
            this.anchor.y = 0;
          }

          this.position.x = this.anchor.x;
          this.position.y = this.anchor.y;
          requestAnimationFrame(RenderPosition);
        }

        var ToggleCollapse = (evt) => {
          if(this.target.classList.contains("collapsed")){
            this.target.classList.remove("collapsed");
            this.anchor.y = 0;
          }else{
            this.target.classList.add("collapsed");
            /*if(window.innerWidth > 768){
              this.anchor.y = window.innerHeight * .85 - 70;
            }else{
              this.anchor.y = window.innerHeight * .85 - 55;
            }*/
            if(window.innerWidth > 768){
              this.anchor.y = window.innerHeight - 70 - 90;
            }else{
              this.anchor.y = window.innerHeight - 50 - 90;
            }
          }
          if(frameId == null){
            frameId = requestAnimationFrame(Physics);
          }
        }

        var Answer = (val) => {
            window.removeEventListener("resize", this.UpdateMargins);
            this.target.removeEventListener("touchstart", TouchStart);
            if(yesButton != null){
              yesButton.removeEventListener("click", AnswerYes);
            }
            if(noButton != null){
              noButton.removeEventListener("click", AnswerNo);
            }
            this.anchor.x = (val==false?-window.innerWidth:window.innerWidth) * 1.5;
            this.hideWhileInactive = true;
            frameId = requestAnimationFrame(Physics);
            var tile = val==false?noTile:yesTile;
            tile.style.display = "inline-block";
            var tm = GetTileManager(tile);
            tm.UpdateMargins();

            if(this.target.classList.contains("finalcard")){
              tm.position.x = (val==false?window.innerWidth:-this.target.clientWidth);
            }else{
              tm.position.y = window.innerHeight;
            }

            if(tm.target.classList.contains("finalcard")){
              MapBackground.style.opacity = .2;
              Sidebar.style.display = "flex";
              AppHeader.style.top = -500;
              if(tm.color != null){
                MapContainer.style.backgroundColor = tm.color;
                BackgroundSidebarToggle.style.backgroundColor = tm.color;
                for(var i = 0; i < SidebarArticles.length; ++i){
                  SidebarArticles[i].querySelector(".ShopSection").style.color = tm.color;
                  SidebarArticles[i].querySelector(".ShopSection .ShopButton").style.backgroundColor = tm.color;
                }
              }
            };

            tm.hideWhileInactive = false;
            tm.init();
        };

        function AnswerNo(){
          Answer(false);
        }
        function AnswerYes(){
          Answer(true);
        }

        var Physics = (evt) => {
            var acceleration = {
                x:-spring * (this.position.x - this.anchor.x) * dt / mass,
                y:-spring * (this.position.y - this.anchor.y) * dt / mass
            };

            this.position.x = this.position.x + velocity.x * dt;
            this.position.y = this.position.y + velocity.y * dt;

            velocity.x += acceleration.x;
            velocity.y += acceleration.y;

            velocity.x -= (velocity.x > 0 ? Math.min(velocity.x * damping * dt, velocity.x):Math.max(velocity.x * damping * dt, velocity.x));
            velocity.y -= (velocity.y > 0 ? Math.min(velocity.y * damping * dt, velocity.y):Math.max(velocity.y * damping * dt, velocity.y));

            if(this.target.classList.contains("finalcard")){
              MapPosition.x += velocity.x * dt * parallaxFactor;
              this.position.y = Math.max(this.position.y, 0);
              //MapPosition.y += velocity.y * dt * parallaxFactor;
            }

            if(Math.abs(velocity.x) < 1 && Math.abs(velocity.y) < 1 && Math.abs(this.position.x - this.anchor.x) < 1 && Math.abs(this.position.y - this.anchor.y < 1)){
                velocity.x = 0;
                velocity.y = 0;
                this.position.x = this.anchor.x;
                this.position.y = this.anchor.y;
                if(this.hideWhileInactive == true){
                  this.target.style.display = "none";
                }
                frameId = null;
            }else{
                frameId = requestAnimationFrame(Physics);
            }
            RenderPosition();
        };

        var RenderPosition = () =>{
            var transformString = `translate(${this.position.x}px,${this.position.y}px)`;

            if(undercard != null){
              undercard.style.transform = `translateY(-${this.position.y}px)`;
            }

            if(this.target.classList.contains("finalcard") == false){
              transformString = transformString + ` rotate(${(this.position.x - this.anchor.x) / 20}deg)`;
              target.style.filter = ` saturate(${Math.max(1 - Math.abs(this.position.x - this.anchor.x) * 2 / window.innerWidth, .2)})`;

              noyesContainer.style.transform = `translateX(${-Math.max(Math.min(this.position.x - this.anchor.x, 50),-50)}px)`;
              if(this.position.x - this.anchor.x > 0){
                var opa = 1 - Math.min(this.position.x - this.anchor.x, 50) / 50;
                noButton.style.opacity = opa;
                noButton.style.borderRight = `2px solid rgba(0,0,0,${opa})`;
              }else{
                var opa = 1 - Math.max(this.position.x - this.anchor.x, -50) / -50;
                yesButton.style.opacity = 1 - Math.max(this.position.x - this.anchor.x, -50) / -50;
                noButton.style.borderRight = `2px solid rgba(0,0,0,${opa})`;
              }

              if(Math.abs(this.position.x - this.anchor.x) > 25){
                target.classList.add("removeArrows");
              }else{
                target.classList.remove("removeArrows");
              }
            }

            target.style.transform = transformString;
        }

        function GetAverageTouchPoint(touchlist){
          var x = 0;
          var y = 0;
          for(var i = 0; i < touchlist.length; ++i){
              x += touchlist[i].clientX;
              y += touchlist[i].clientY;
          }
          x /= touchlist.length;
          y /= touchlist.length;
          return {x:x, y:y};
        }
    }

    function GetTileManager(tile){
        for(var i = 0; i < tiles.length; ++i){
            if(tiles[i] == tile){
                return tileManagers[i];
            }
        }
    }

    var lastFrameTime = new Date().getTime();
    var dt = 0;
    requestAnimationFrame(UpdateFrameTime);
    function UpdateFrameTime(){ //Updates the global frame-timer.
      var currentFrameTime = new Date().getTime();
      dt = (currentFrameTime - lastFrameTime) / 1000;
      //dt = Math.min(dt, 50); //prevents bugs when framerate sucks.  Will dilate time if this happens.
      lastFrameTime = currentFrameTime;
      requestAnimationFrame(UpdateFrameTime);
    }

    var MapPosition = {x:0,y:0};
    requestAnimationFrame(RenderMap);
    function RenderMap(){
      MapBackground.style.transform = `translate(${MapPosition.x}px,${MapPosition.y}px)`;
      requestAnimationFrame(RenderMap);
    }

/*
    var scrollDestination = {x:0,y:0};
    requestAnimationFrame(ScrollMap);
    function ScrollMap(){
        var speed = 10;

        var dx = (scrollDestination.x - perspectiveContainer.scrollLeft) * dt * speed;
        var dy = (scrollDestination.y - perspectiveContainer.scrollTop) * dt * speed;

        if(dt * speed > 1){  //Prevents oscillation at low framerates.
          dx = (scrollDestination.x - perspectiveContainer.scrollLeft);
          dy = (scrollDestination.y - perspectiveContainer.scrollTop);
        }

        if(Math.abs(dx) < 1){ //speed cannot drop below 1 until destination
          if(Math.abs(scrollDestination.x - perspectiveContainer.scrollLeft) < 1){
            dx = 0;
          }else if(dx > 0){
            dx = 1;
          }else if(dx < 0){
            dx = -1;
          }
        }

        if(Math.abs(dy) < 1){
          if(Math.abs(scrollDestination.y - perspectiveContainer.scrollTop) < 1){
            dy = 0;
          }else if(dy > 0){
            dy = 1;
          }else if(dy < 0){
            dy = -1;
          }
        }

        if(Math.abs(scrollDestination.x - perspectiveContainer.scrollLeft) < 1 && Math.abs(scrollDestination.y - perspectiveContainer.scrollTop) < 1){
          perspectiveContainer.scrollLeft = scrollDestination.x;
          perspectiveContainer.scrollTop = scrollDestination.y;
        }else{
          perspectiveContainer.scrollLeft += dx;
          perspectiveContainer.scrollTop += dy;
        }
        requestAnimationFrame(ScrollMap);
    }
    */
})();
