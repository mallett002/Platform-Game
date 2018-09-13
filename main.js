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
                // if string, return it
                if (typeof type === "string") return type;
                // if actor 
                this.startActors.push(
                    // Position of actor stored as Vec object
                    type.create(new Vec(x, y), ch) // static create method "create"
                );
            });
        });
    }
}

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

// Actors will change places as game goes on. 
// Tracks the state of the running game
class State {
    constructor(level, actors, status) {
        this.level = level;
        this.actors = actors;
        this.status = status; // "playing", "lsot", or "won"
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