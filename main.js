// Simple level
let simpleLevelPlan = `
......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`;

// "." = empty space
// "#" = walls
// "@" = game character
// "+" = lava
// "o" = coins
// "=" = moving lava

// Class stores a level object.
// It's arg is the string that defines the level
class Level {
    constructor(plan) {
        // rows is an array of arrays of characters
        let rows = plan.trim().split("\n").map(l => [...l]); // put each item in l in an []
        this.height = rows.length;
        this.width = rows[0].length;
        // actors: moving elements stored here:
        this.startActors = []; // an array of objects

        // background: array of array of strings: "empty" "wall" "lava"
        this.rows = rows.map((row, y) => { // y tells us the y coord
            // map over the content in each row
            return row.map((ch, x) => { // x tells us the x coord
                // map background elements to strings, actor chars to classes
                let type = levelChars[ch];
                // if string, it's a background element, so return the type
                if (typeof type === "string") return type;
                // otherwise it's an actor, put it in the startActors array
                this.startActors.push(
                    // Dynamically create each actor 
                    type.create(new Vec(x, y), ch) 
                );
            });
        });
    }
}

// Actors will change places as game goes on. 
// Tracks the state of the running game
class State {
    constructor(level, actors, status) {
        this.level = level;
        this.actors = actors;
        this.status = status; // "playing", "lost", or "won"
    }

    static start(level) {
        return new State(level, level.startActors, "playing");
    }

    get player() {
        // returns the player
        return this.actors.find(a => a.type === "player");
    }
}


// Vec class used for our 2 dimensional values (position and size of actors)
// pos = x, y and size = actor's size
class Vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    plus(other) {
        return new Vec(this.x + other.x, this.y + other.y);
    }

    // Scales a vector by a given number
    times(factor) {
        return new Vec(this.x * factor, this.y * factor);
    }
}

// Different types of actors get their own classes, since their behavior..
// ..is different.

// Player class: has a property "speed" that stores its current speed.
// Uses speed to simulate momentum and gravity
class Player {
    constructor(pos, speed) {
        this.pos = pos;
        this.speed = speed;
    }

    get type() { return "player"; }

    // pos is a Vec instance
    static create(pos) {  // initial pos set to be .5 square above, to set it on bottom of square
        return new Player(pos.plus(new Vec(0, -0.5)), new Vec(0, 0)); // speed: 0
    }
}
// Size property is always the same
Player.prototype.size = new Vec(0.8, 1.5);

// Lava actor has create metod that looks at the character the Level
// constructor passes and creates the appropriate lava actor
class Lava {
    constructor(pos, speed, reset) {
        this.pos = pos;
        this.speed = speed;
        this.reset = reset;
    }

    get type() { return "Lava"; }

    static create(pos, ch) {
        // for static lava
        if (ch === "=") {
            return new Lava(pos, new Vec(2, 0));
            // bouncing lava
        } else if (ch === "|") {
            return new Lava(pos, new Vec(0, 2));
            // dripping lava ( has reset property )
        } else if (ch === "v") {
            return new Lava(pos, new Vec(0, 3), pos);
        }
    }
}
Lava.prototype.size = new Vec(1, 1);

// Coin Actors: Stationary, but have a "wobble". Stores a base psotion and a 
// wobble property to track the phase of the bouncing motion
class Coin {
    constructor(pos, basePos, wobble) {
        this.pos = pos;
        this.basePos = basePos;
        this.wobble = wobble;
    }

    get type() { return "coin"; }

    // pos arg will be a new Vec(x, y)
    static create(pos) {
        let basePos = pos.plus(new Vec(0.2, 0.1));
        // width of a wobble phase is 2 * PI. Multiply that by Math.random to give it..
        // ..a random starting position
        return new Coin(basePos, basePos, Math.random() * Math.PI * 2);
    }
}
Coin.prototype.size = new Vec(0.6, 0.6);

// Maps plan characters to either background grid types or actor classes
const levelChars = {
    ".": "empty",
    "#": "wall",
    "+": "lava",
    "@": Player,
    "o": Coin,
    "=": Lava,
    "|": Lava,
    "v": Lava
};



// Drawing subsystem will be encapsulated. Put it behind an interface.

//Helper function provides a way to create an element and give it some attributes/child nodes
function elt(name, attrs, ...children) {
    // Create an element of "name"
    let dom = document.createElement(name);
    for (let attr of Object.keys(attrs)) {
        // Set some attributes
        dom.setAttribute(attr, attrs[attr]); // makes attribute class: "game"
    }
    // Append the children into the created element
    for (let child of children) {
        dom.appendChild(child);
    }
    return dom;
}

// Encapsulation of drawing code: done by defining a display object:
// This displays a given level and state
class DOMDisplay {
    constructor(parent, level) {
        this.dom = elt("div", {class: "game"}, drawGrid(level));
        // actorLayer used to track element that holds the actors
        this.actorLayer = null;
        parent.appendChild(this.dom);
    }
    clear() { this.dom.remove(); }
}

// Number of pixels per square unit is 20
const scale = 20;

// Background drawn as a table element
// Each row of grid turned into <tr>
// Strings in grid used as classNames for <td>s
function drawGrid(level) {
    // a table
    return elt("table", 
    // with these attributes
    {
        class: "background",
        style: `width: ${level.width * scale}px`
    }, 
    // and these children
     ...level.rows.map(row =>
        elt("tr", {style: `height: ${scale}px`},
            ...row.map(type => elt("td", {class: type})))
    ));
}

// Drawing each actor: Create dom element for it
// Set elements positiona and size  based on actor's properties
function drawActors(actors) {
    return elt("div", {}, ...actors.map(actor => {
        let rect = elt("div", {class: `actor ${actor.type}`});
        rect.style.width = `${actor.size.x * scale}px`;
        rect.style.height = `${actor.size.y * scale}px`;
        rect.style.left = `${actor.pos.x * scale}px`;
        rect.style.top = `${actor.pos.y * scale}px`;
        return rect;
    }));
}

// syncState method: make display show a given state
DOMDisplay.prototype.syncState = function(state) {
  if (this.actorLayer) this.actorLayer.remove();
  this.actorLayer = drawActors(state.actors);
  this.dom.appendChild(this.actorLayer);
  this.dom.className = `game ${state.status}`;
  this.scrollPlayerIntoView(state);
};

// Find players position, update the wrapping element's scroll position
// Use scrollLeft and scrollTop properties when player is too close to edge
DOMDisplay.prototype.scrollPlayerIntoView = function(state) {
    let width = this.dom.clientWidth;
    let height = this.dom.clientHeight;
    let margin = width / 3;  // 1/3 of the width

    // The viewport
    let left = this.dom.scrollLeft, right = left + width;
    let top = this.dom.scrollTop, bottom = top + height;

    let player = state.player;
    // find actor's center: it's position + half its size * 20px
    let center = player.pos.plus(player.size.times(0.5))
        .times(scale);

    // verify the player's position isn't outside allowed range
    if (center.x < left + margin) {
        this.dom.scrollLeft = center.x = margin;
    } else if (center.x > right - margin) {
        this.dom.scrollLeft = center.x + margin - width;
    }

    if (center.y < top + margin) {
        this.dom.scrollTop = center.y - margin;
    } else if (center.y > bottom - margin) {
        this.dom.scrollTop = center.y + margin - height;
    }
};

let simpleLevel = new Level(simpleLevelPlan);
let display = new DOMDisplay(document.body, simpleLevel);
display.syncState(State.start(simpleLevel));